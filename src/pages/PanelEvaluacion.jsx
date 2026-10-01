import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ModoEmpaticContext } from '../context/ModoEmpatico';
import TablaDatos from '../components/TablaDatos';
import Badge from '../components/Badge';

// Devuelve el color de la pastilla según el estado de la postulación
const colorEstado = (estado) => {
  const e = String(estado || '').toLowerCase();
  if (e.includes('aprob')) return 'verde';
  if (e.includes('pend')) return 'naranja';
  if (e.includes('rechaz')) return 'rojo';
  return 'gris';
};

export default function PanelEvaluacion() {
  const navigate = useNavigate();
  const { modoEmpatico } = useContext(ModoEmpaticContext);
  const [inscripciones, setInscripciones] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/inscripciones')
      .then((r) => r.json())
      .then((res) => {
        if (res && res.success && Array.isArray(res.data)) {
          setInscripciones(res.data);
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

  // Columnas de la tabla de postulaciones (con búsqueda y orden)
  const columnas = [
    { clave: 'idInscripcion', titulo: '#', tipo: 'numero' },
    { clave: 'postulante', titulo: 'Postulante', estilo: { fontWeight: 'bold' } },
    { clave: 'cedula', titulo: 'Cédula' },
    { clave: 'correo', titulo: 'Correo' },
    { clave: 'convocatoria', titulo: 'Convocatoria' },
    { clave: 'estado', titulo: 'Estado', render: (v) => <Badge texto={v || 'Pendiente'} color={colorEstado(v)} />, exportar: (f) => f.estado || 'Pendiente' },
    { clave: 'motivacion', titulo: 'Motivación', ordenable: false, estilo: { maxWidth: '260px' } },
    { clave: 'fecha', titulo: 'Fecha', render: (v) => formatearFecha(v), exportar: (f) => formatearFecha(f.fecha) },
  ];

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ color: C.acento, margin: 0, fontSize: isWarm ? '32px' : '28px' }}>
          Panel de Evaluación
        </h1>
        <p style={{ color: C.texto, opacity: 0.85, fontSize: fs, marginTop: '6px' }}>
          Todas las postulaciones recibidas, consultadas desde la base de datos.
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
          minWidth="820px"
          placeholderBuscar="Buscar por nombre, cédula, convocatoria…"
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
