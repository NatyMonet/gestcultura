import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ModoEmpaticContext } from '../context/ModoEmpatico';

export default function Perfil() {
  const navigate = useNavigate();
  const { modoEmpatico } = useContext(ModoEmpaticContext);
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const data = localStorage.getItem('usuario');
    if (!data) return;
    let u;
    try { u = JSON.parse(data); } catch { return; }
    setUsuario(u);
    if (u.idUsuario) {
      fetch(`http://localhost:5000/api/usuarios/${u.idUsuario}`)
        .then((r) => r.json())
        .then((res) => {
          if (res && res.success && res.data) {
            setUsuario((prev) => ({ ...prev, ...res.data }));
          }
        })
        .catch(() => {});
    }
  }, []);

  const bg = modoEmpatico ? '#FFF7EF' : '#FFFFFF';
  const borde = modoEmpatico ? '3px solid #2B1600' : '1px solid #ddd';
  const acento = modoEmpatico ? '#C75000' : '#6A1B9A';
  const texto = modoEmpatico ? '#2B1600' : '#2E1065';
  const fs = modoEmpatico ? '16px' : '14px';

  if (!usuario) {
    return (
      <div style={{ maxWidth: '500px', margin: '60px auto', padding: '30px', textAlign: 'center', border: borde, borderRadius: '12px', background: bg }}>
        <h2 style={{ color: acento }}>Mi Perfil</h2>
        <p style={{ color: texto }}>Debes iniciar sesión para ver tu perfil.</p>
        <button
          onClick={() => navigate('/login')}
          style={{ marginTop: '12px', padding: '10px 20px', background: acento, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Ir a iniciar sesión
        </button>
      </div>
    );
  }

  const calcularEdad = (f) => {
    if (!f) return null;
    const hoy = new Date();
    const nac = new Date(f);
    if (isNaN(nac.getTime())) return null;
    let edad = hoy.getFullYear() - nac.getFullYear();
    const m = hoy.getMonth() - nac.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
    return edad;
  };

  const inicial = (usuario.nombre || 'U').charAt(0).toUpperCase();
  const edad = calcularEdad(usuario.fechaNacimiento);

  const Fila = ({ etiqueta, valor }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '12px 0', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
      <span style={{ fontWeight: 'bold', color: texto, fontSize: fs }}>{etiqueta}</span>
      <span style={{ color: texto, textAlign: 'right', fontSize: fs }}>{valor || 'No registrado'}</span>
    </div>
  );

  return (
    <div style={{ maxWidth: '520px', margin: '50px auto', padding: '30px', border: borde, borderRadius: '12px', background: bg, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: acento, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '34px', fontWeight: 'bold', margin: '0 auto 12px' }}>
          {inicial}
        </div>
        <h2 style={{ margin: 0, color: acento }}>{usuario.nombre}</h2>
        <p style={{ margin: '4px 0 0', color: texto, opacity: 0.8 }}>{usuario.correo}</p>
        <span style={{ display: 'inline-block', marginTop: '8px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#fff', background: acento, padding: '3px 12px', borderRadius: '9999px' }}>
          Postulante
        </span>
      </div>

      <h3 style={{ color: acento, borderBottom: `2px solid ${acento}`, paddingBottom: '6px', fontSize: modoEmpatico ? '20px' : '18px' }}>Datos personales</h3>
      <Fila etiqueta="Nombre completo:" valor={usuario.nombre} />
      <Fila etiqueta="Correo electrónico:" valor={usuario.correo} />
      <Fila etiqueta="Número de cédula:" valor={usuario.cedula} />
      <Fila etiqueta="Teléfono:" valor={usuario.telefono} />
      <Fila etiqueta="Edad:" valor={edad != null ? `${edad} años` : 'No registrada'} />

      {modoEmpatico && (
        <div style={{ marginTop: '16px', padding: '10px 14px', background: '#FCEBDD', border: '2px solid #C75000', borderRadius: '10px', color: '#2B1600', fontSize: fs, fontWeight: 600 }}>
          🧡 Tienes activo el Modo Acompañado: letra más grande y colores de alto contraste para tu comodidad.
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px', marginTop: '24px', flexWrap: 'wrap' }}>
        <button onClick={() => navigate('/convocatorias')} style={{ flex: 1, minWidth: '140px', padding: '12px', background: acento, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
          Ver Convocatorias
        </button>
        <button onClick={() => navigate('/mis-inscripciones')} style={{ flex: 1, minWidth: '140px', padding: '12px', background: '#fff', color: acento, border: `2px solid ${acento}`, borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
          Mis Inscripciones
        </button>
      </div>
    </div>
  );
}