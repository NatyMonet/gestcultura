// ============================================================================
// COMPONENTE: DashboardAdmin (gráficas estadísticas del Panel de Administración)
// Ficha SENA: 3013183 | Estudiante: Natalia Mejía Cardona
// ----------------------------------------------------------------------------
// Muestra, con datos reales de la base de datos (convocatorias + inscripciones):
//   - Tarjetas de resumen (KPIs)
//   - Convocatorias más demandadas (barras)
//   - Postulaciones por categoría (dona)
//   - Cupos ofertados vs. postulaciones (barras comparativas)
//   - Tendencia de postulaciones por fecha (área)
// Usa la librería Recharts. Responsivo (se adapta a pantallas pequeñas) y
// respeta el Modo Empático (colores cálidos y textos más grandes).
// ============================================================================
import { useContext } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LabelList, Cell, PieChart, Pie, AreaChart, Area,
} from 'recharts';
import { ModoEmpaticContext } from '../context/ModoEmpatico';
import { CONVOCATORIAS_DATA } from '../data/mockData';

// Paleta categórica validada (accesible, incluso para daltonismo). Orden fijo.
const COLORES_CATEGORIA = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#4a3aa7'];

// Busca la categoría de una convocatoria por su nombre (desde los datos base).
function categoriaDe(nombre) {
  const encontrada = CONVOCATORIAS_DATA.find((c) => c.title === nombre);
  return encontrada ? encontrada.category : 'Otras';
}

export default function DashboardAdmin({ convocatorias = [], inscripciones = [] }) {
  const { modoEmpatico } = useContext(ModoEmpaticContext);
  const isWarm = modoEmpatico;

  const C = {
    bg: isWarm ? '#FFF7EF' : '#FFFFFF',
    texto: isWarm ? '#2B1600' : '#2E1065',
    textoSuave: isWarm ? '#5C4636' : '#6B5B8A',
    acento: isWarm ? '#C75000' : '#6A1B9A',
    borde: isWarm ? '#E7C9B3' : '#E9D5FF',
    grid: isWarm ? '#EAD8C8' : '#EDE4F7',
  };
  const fs = isWarm ? 15 : 13;

  // ---- Cálculos de datos ----
  const totalConvocatorias = convocatorias.length;
  const totalPostulaciones = inscripciones.length;
  const totalCupos = convocatorias.reduce((s, c) => s + (Number(c.cupos) || 0), 0);
  const ocupacion = totalCupos > 0 ? Math.round((totalPostulaciones / totalCupos) * 100) : 0;

  // Nombre corto para las etiquetas de los ejes (el nombre completo va en el tooltip)
  const corto = (n) => (n && n.length > 16 ? n.slice(0, 15) + '…' : n || '');

  // Más demandadas: nº de postulaciones por convocatoria, de mayor a menor
  const demanda = convocatorias
    .map((c) => ({
      nombre: c.nombre,
      nombreCorto: corto(c.nombre),
      postulaciones: inscripciones.filter((i) => i.convocatoria === c.nombre).length,
    }))
    .sort((a, b) => b.postulaciones - a.postulaciones);

  // Postulaciones por categoría (para la dona)
  const mapaCat = {};
  inscripciones.forEach((i) => {
    const cat = categoriaDe(i.convocatoria);
    mapaCat[cat] = (mapaCat[cat] || 0) + 1;
  });
  const porCategoria = Object.keys(mapaCat).map((cat) => ({ categoria: cat, value: mapaCat[cat] }));

  // Cupos vs postulaciones por convocatoria
  const cuposVs = convocatorias.map((c) => ({
    nombre: c.nombre,
    nombreCorto: corto(c.nombre),
    Cupos: Number(c.cupos) || 0,
    Postulaciones: inscripciones.filter((i) => i.convocatoria === c.nombre).length,
  }));

  // Tendencia de postulaciones por fecha (agrupadas por día)
  const mapaFechas = {};
  inscripciones.forEach((i) => {
    const dia = i.fecha ? String(i.fecha).slice(0, 10) : 'Sin fecha';
    mapaFechas[dia] = (mapaFechas[dia] || 0) + 1;
  });
  const tendencia = Object.keys(mapaFechas)
    .sort()
    .map((dia) => ({ fecha: dia, postulaciones: mapaFechas[dia] }));

  // ---- Estilos reutilizables ----
  const Card = ({ children, titulo, subtitulo, ancho }) => (
    <div style={{ flex: ancho || '1 1 420px', minWidth: 0, background: C.bg, border: `2px solid ${C.borde}`, borderRadius: '14px', padding: '18px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
      {titulo && <h3 style={{ color: C.acento, margin: '0 0 2px', fontSize: isWarm ? 20 : 18 }}>{titulo}</h3>}
      {subtitulo && <p style={{ color: C.textoSuave, margin: '0 0 14px', fontSize: 13 }}>{subtitulo}</p>}
      {children}
    </div>
  );

  const Kpi = ({ valor, etiqueta }) => (
    <div style={{ flex: '1 1 150px', background: C.bg, border: `2px solid ${C.borde}`, borderRadius: '14px', padding: '16px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
      <div style={{ fontSize: 32, fontWeight: 800, color: C.acento, lineHeight: 1 }}>{valor}</div>
      <div style={{ fontSize: fs, color: C.texto, opacity: 0.8, marginTop: 6, fontWeight: 600 }}>{etiqueta}</div>
    </div>
  );

  // Tooltip con el nombre completo (useful cuando el eje muestra el nombre corto)
  const TooltipNombre = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;
    const d = payload[0].payload;
    return (
      <div style={{ background: '#fff', border: `1px solid ${C.borde}`, borderRadius: 8, padding: '8px 12px', fontSize: 13, color: C.texto, boxShadow: '0 4px 14px rgba(0,0,0,0.12)' }}>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>{d.nombre || d.categoria || d.fecha}</div>
        {payload.map((p) => (
          <div key={p.name} style={{ color: p.color || C.texto }}>{p.name}: <strong>{p.value}</strong></div>
        ))}
      </div>
    );
  };

  if (totalPostulaciones === 0 && totalConvocatorias === 0) {
    return (
      <p style={{ color: C.texto, fontSize: fs, opacity: 0.8 }}>
        Todavía no hay datos para mostrar en el tablero. Las gráficas se llenarán cuando haya convocatorias y postulaciones. 🐾
      </p>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* KPIs */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
        <Kpi valor={totalConvocatorias} etiqueta="Convocatorias" />
        <Kpi valor={totalPostulaciones} etiqueta="Postulaciones" />
        <Kpi valor={totalCupos} etiqueta="Cupos ofertados" />
        <Kpi valor={`${ocupacion}%`} etiqueta="Ocupación" />
      </div>

      {/* Fila 1: más demandadas + por categoría */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18 }}>
        <Card titulo="Convocatorias más demandadas" subtitulo="Postulaciones recibidas por convocatoria">
          {totalPostulaciones === 0 ? (
            <p style={{ color: C.textoSuave, fontSize: fs }}>Aún no hay postulaciones. 🐾</p>
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(180, demanda.length * 46)}>
              <BarChart data={demanda} layout="vertical" margin={{ top: 4, right: 30, left: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={C.grid} />
                <XAxis type="number" allowDecimals={false} tick={{ fill: C.textoSuave, fontSize: 12 }} />
                <YAxis type="category" dataKey="nombreCorto" width={110} tick={{ fill: C.texto, fontSize: 12 }} />
                <Tooltip content={<TooltipNombre />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
                <Bar dataKey="postulaciones" name="Postulaciones" fill={C.acento} radius={[0, 4, 4, 0]} barSize={22}>
                  <LabelList dataKey="postulaciones" position="right" style={{ fill: C.acento, fontWeight: 700, fontSize: 13 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card titulo="Postulaciones por categoría" subtitulo="Distribución según el tipo de convocatoria">
          {porCategoria.length === 0 ? (
            <p style={{ color: C.textoSuave, fontSize: fs }}>Aún no hay postulaciones. 🐾</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={porCategoria} dataKey="value" nameKey="categoria" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={2} label={(e) => `${e.categoria}: ${e.value}`} labelLine={false} style={{ fontSize: 12, fill: C.texto }}>
                  {porCategoria.map((entry, i) => (
                    <Cell key={entry.categoria} fill={COLORES_CATEGORIA[i % COLORES_CATEGORIA.length]} stroke={C.bg} strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip content={<TooltipNombre />} />
                <Legend wrapperStyle={{ fontSize: 12, color: C.texto }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* Fila 2: cupos vs postulaciones + tendencia */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18 }}>
        <Card titulo="Cupos ofertados vs. postulaciones" subtitulo="Capacidad frente a la demanda por convocatoria">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={cuposVs} margin={{ top: 10, right: 16, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={C.grid} />
              <XAxis dataKey="nombreCorto" angle={-20} textAnchor="end" interval={0} height={50} tick={{ fill: C.textoSuave, fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fill: C.textoSuave, fontSize: 12 }} />
              <Tooltip content={<TooltipNombre />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
              <Legend wrapperStyle={{ fontSize: 12, color: C.texto }} />
              <Bar dataKey="Cupos" fill="#1baf7a" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Postulaciones" fill={C.acento} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card titulo="Tendencia de postulaciones" subtitulo="Postulaciones recibidas por fecha">
          {tendencia.length === 0 ? (
            <p style={{ color: C.textoSuave, fontSize: fs }}>Aún no hay postulaciones. 🐾</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={tendencia} margin={{ top: 10, right: 16, left: 0, bottom: 10 }}>
                <defs>
                  <linearGradient id="colorPost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={C.acento} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={C.acento} stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={C.grid} />
                <XAxis dataKey="fecha" tick={{ fill: C.textoSuave, fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fill: C.textoSuave, fontSize: 12 }} />
                <Tooltip content={<TooltipNombre />} />
                <Area type="monotone" dataKey="postulaciones" name="Postulaciones" stroke={C.acento} strokeWidth={2} fill="url(#colorPost)" dot={{ r: 3, fill: C.acento }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>
    </div>
  );
}
