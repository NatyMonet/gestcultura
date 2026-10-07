/**
 * Nombre del archivo: PanelEvaluacion.jsx
 * Descripción: Página que muestra las postulaciones recibidas (solo administradores).
 *              Incluye el cálculo de edad y los colores por estado de la postulación.
 * Autor: Natalia Mejía Cardona
 * Fecha de creación: 2026-09-18
 * Última modificación: 2026-10-07
 * Licencia: Uso académico — Corporación Cinefilia / SENA.
 */
import { API_URL } from '../config/api';
import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ModoEmpaticContext } from '../context/ModoEmpatico';
import TablaDatos from '../components/TablaDatos';
import Badge from '../components/Badge';
import Swal from 'sweetalert2';

// Devuelve el color de la pastilla según el estado de la postulación
const colorEstado = (estado) => {
  const e = String(estado || '').toLowerCase();
  if (e.includes('aprob')) return 'verde';
  if (e.includes('pend')) return 'naranja';
  if (e.includes('rechaz')) return 'rojo';
  return 'gris';
};

// Calcula la edad (en años) a partir de la fecha de nacimiento.
const calcularEdad = (fn) => {
  if (!fn) return null;
  const nac = new Date(fn);
  if (isNaN(nac.getTime())) return null;
  const hoy = new Date();
  let edad = hoy.getFullYear() - nac.getFullYear();
  const m = hoy.getMonth() - nac.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
  return edad;
};

// Convierte el campo "datos" (texto JSON guardado en el formulario) en objeto.
const parseDatos = (datos) => {
  if (!datos) return {};
  if (typeof datos === 'object') return datos;
  try { return JSON.parse(datos); } catch (e) { return {}; }
};

// Escapa texto para insertarlo con seguridad en el HTML del detalle.
const esc = (t) => String(t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export default function PanelEvaluacion() {
  const navigate = useNavigate();
  const { modoEmpatico } = useContext(ModoEmpaticContext);
  const [inscripciones, setInscripciones] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/inscripciones`)
      .then((r) => r.json())
      .then((res) => {
        if (res && res.success && Array.isArray(res.data)) {
          setInscripciones(res.data.map((x) => {
            const d = parseDatos(x.datos);
            return {
              ...x,
              edad: calcularEdad(x.fechaNacimiento),
              _datos: d,
              proyectoTitulo: d.proyecto?.titulo || '',
              numDocs: Object.keys(d.documentos || {}).length,
            };
          }));
        }
        setCargando(false);
      })
      .catch(() => setCargando(false));
  }, []);

  const isWarm = modoEmpatico;
  const C = {
    texto: isWarm ? '#2B1600' : '#2E1065',
    acento: isWarm ? '#C75000' : '#6A1B9A',
  };
  const fs = isWarm ? '17px' : '15px';

  const formatearFecha = (f) => {
    if (!f) return '—';
    const d = new Date(f);
    if (isNaN(d.getTime())) return f;
    return d.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Abre una ventana con TODO el detalle de la postulación + enlaces a los documentos.
  const verDetalle = (fila) => {
    const d = fila._datos || {};
    const p = d.proyecto || {};
    const docs = d.documentos || {};
    const acento = C.acento;

    const fila2 = (et, val) => val
      ? `<tr><td style="padding:5px 12px 5px 0;color:${acento};font-weight:bold;vertical-align:top;white-space:nowrap">${esc(et)}</td><td style="padding:5px 0;color:#333">${esc(val)}</td></tr>`
      : '';

    const listaDocs = Object.values(docs);
    const docsHtml = listaDocs.length
      ? listaDocs.map((x) =>
          `<div style="margin:4px 0"><a href="${esc(x.url)}" target="_blank" rel="noreferrer" style="color:${acento};font-weight:bold;text-decoration:none">📎 ${esc(x.etiqueta || x.nombre || 'Documento')}</a> <span style="color:#999;font-size:12px">${esc(x.nombre || '')}</span></div>`
        ).join('')
      : '<span style="color:#999">Sin documentos adjuntos</span>';

    const seccion = (titulo) => `<div style="font-weight:bold;color:${acento};margin:12px 0 4px">${titulo}</div>`;
    const divisor = '<hr style="margin:12px 0;border:none;border-top:1px solid #eee">';

    const html = `
      <div style="text-align:left;font-size:14px;line-height:1.5">
        <table style="width:100%;border-collapse:collapse">
          ${fila2('Postulante', fila.postulante)}
          ${fila2('Cédula', fila.cedula)}
          ${fila2('Correo', fila.correo)}
          ${fila2('Teléfono', d.telefono)}
          ${fila2('Ciudad', d.ciudad)}
          ${fila2('Edad', d.edad || fila.edad)}
          ${fila2('Convocatoria', fila.convocatoria)}
          ${fila2('Estado', fila.estado || 'Pendiente')}
          ${fila2('Fecha', formatearFecha(fila.fecha))}
        </table>
        ${divisor}
        ${seccion('🎬 Proyecto')}
        <table style="width:100%;border-collapse:collapse">
          ${fila2('Título', p.titulo)}
          ${fila2('Formato', p.formato)}
          ${fila2('Género', p.genero)}
          ${fila2('Logline', p.logline)}
          ${fila2('Sinopsis', p.sinopsis)}
          ${fila2('Estado del proyecto', p.estado)}
          ${fila2('Experiencia', p.experiencia)}
          ${fila2('¿Cómo se enteró?', p.comoSeEntero)}
        </table>
        ${divisor}
        ${seccion('✍️ Motivación')}
        <div style="color:#333;white-space:pre-line">${esc(d.motivacion || fila.motivacion || '—')}</div>
        ${divisor}
        ${seccion('📎 Documentos')}
        ${docsHtml}
      </div>`;

    Swal.fire({
      title: `Postulación #${fila.idInscripcion}`,
      html,
      width: 660,
      confirmButtonText: 'Cerrar',
      confirmButtonColor: acento,
      showCloseButton: true,
    });
  };

  // Columnas de la tabla de postulaciones (con búsqueda y orden)
  const columnas = [
    { clave: 'idInscripcion', titulo: '#', tipo: 'numero' },
    { clave: 'postulante', titulo: 'Postulante', estilo: { fontWeight: 'bold' } },
    { clave: 'cedula', titulo: 'Cédula' },
    { clave: 'edad', titulo: 'Edad', tipo: 'numero', render: (v) => (v ?? '—') },
    { clave: 'convocatoria', titulo: 'Convocatoria' },
    { clave: 'proyectoTitulo', titulo: 'Proyecto', render: (v) => v || '—', estilo: { maxWidth: '200px' } },
    { clave: 'numDocs', titulo: 'Docs', tipo: 'numero', render: (v) => (v ? `📎 ${v}` : '—'), exportar: (f) => String(f.numDocs || 0) },
    { clave: 'estado', titulo: 'Estado', render: (v) => <Badge texto={v || 'Pendiente'} color={colorEstado(v)} />, exportar: (f) => f.estado || 'Pendiente' },
    { clave: 'fecha', titulo: 'Fecha', render: (v) => formatearFecha(v), exportar: (f) => formatearFecha(f.fecha) },
    {
      clave: 'detalle',
      titulo: 'Ver',
      ordenable: false,
      exportable: false,
      render: (_, fila) => (
        <button
          onClick={() => verDetalle(fila)}
          style={{ padding: '7px 14px', background: C.acento, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', whiteSpace: 'nowrap' }}
        >
          Ver postulación
        </button>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: '1100px', margin: '40px auto', padding: '0 20px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ color: C.acento, margin: 0, fontSize: isWarm ? '32px' : '28px' }}>
          Panel de Evaluación
        </h1>
        <p style={{ color: C.texto, opacity: 0.85, fontSize: fs, marginTop: '6px' }}>
          Todas las postulaciones recibidas, consultadas desde la base de datos. Usa <strong>“Ver postulación”</strong> para ver el proyecto y descargar los documentos.
        </p>
        <span style={{ display: 'inline-block', marginTop: '8px', background: C.acento, color: '#fff', padding: '4px 14px', borderRadius: '9999px', fontWeight: 'bold', fontSize: '14px' }}>
          {inscripciones.length} {inscripciones.length === 1 ? 'postulación' : 'postulaciones'}
        </span>
      </div>

      {cargando ? (
        <p style={{ color: C.texto, fontSize: fs }}>Cargando postulaciones… 🐾</p>
      ) : inscripciones.length === 0 ? (
        <p style={{ color: C.texto, fontSize: fs }}>Todavía no hay postulaciones registradas.</p>
      ) : (
        <TablaDatos
          columnas={columnas}
          datos={inscripciones}
          minWidth="980px"
          placeholderBuscar="Buscar por nombre, cédula, edad, convocatoria, proyecto…"
          filaClave={(f) => f.idInscripcion}
          nombreArchivo="postulaciones"
          tituloExport="Postulaciones - GestCultura"
        />
      )}

      <button
        onClick={() => navigate('/convocatorias')}
        style={{ marginTop: '24px', padding: '12px 20px', background: C.acento, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: fs }}
      >
        ← Volver a Convocatorias
      </button>
    </div>
  );
}
