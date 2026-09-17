import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ModoEmpaticContext } from '../context/ModoEmpatico';

const thStyle = (fs) => ({ padding: '12px', textAlign: 'left', fontSize: fs, fontWeight: 'bold' });
const tdStyle = (C, fs) => ({ padding: '12px', textAlign: 'left', fontSize: fs, color: C.texto, borderTop: `1px solid ${C.borde}` });

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
    bg: isWarm ? '#FFF7EF' : '#FFFFFF',
    texto: isWarm ? '#2B1600' : '#2E1065',
    acento: isWarm ? '#C75000' : '#6A1B9A',
    borde: isWarm ? '#2B1600' : '#E9D5FF',
    fila: isWarm ? '#FCEBDD' : '#F5EEFB',
  };
  const fs = isWarm ? '17px' : '15px';

  const formatearFecha = (f) => {
    if (!f) return '—';
    const d = new Date(f);
    if (isNaN(d.getTime())) return f;
    return d.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
  };

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
        <div style={{ overflowX: 'auto', border: `2px solid ${C.borde}`, borderRadius: '12px', background: C.bg, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '640px' }}>
            <thead>
              <tr style={{ background: C.acento, color: '#fff' }}>
                <th style={thStyle(fs)}>#</th>
                <th style={thStyle(fs)}>Postulante</th>
                <th style={thStyle(fs)}>Cédula</th>
                <th style={thStyle(fs)}>Correo</th>
                <th style={thStyle(fs)}>Convocatoria</th>
                <th style={thStyle(fs)}>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {inscripciones.map((ins, i) => (
                <tr key={ins.idInscripcion} style={{ background: i % 2 === 0 ? 'transparent' : C.fila }}>
                  <td style={tdStyle(C, fs)}>{ins.idInscripcion}</td>
                  <td style={{ ...tdStyle(C, fs), fontWeight: 'bold' }}>{ins.postulante}</td>
                  <td style={tdStyle(C, fs)}>{ins.cedula || '—'}</td>
                  <td style={tdStyle(C, fs)}>{ins.correo}</td>
                  <td style={tdStyle(C, fs)}>{ins.convocatoria}</td>
                  <td style={tdStyle(C, fs)}>{formatearFecha(ins.fecha)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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