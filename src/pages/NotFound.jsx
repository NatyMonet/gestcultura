// ============================================================================
// PANTALLA: NotFound (Error 404 - página no encontrada)
// Ficha SENA: 3013183 | Estudiante: Natalia Mejía Cardona
// ----------------------------------------------------------------------------
// Página de error personalizada que se muestra cuando la persona entra a una
// dirección (URL) que no existe en el sistema. Es amable, clara y ofrece un
// camino de regreso, respetando el Modo Empático (colores y tamaños).
// ============================================================================
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Home, HeartHandshake } from 'lucide-react';
import { ModoEmpaticContext } from '../context/ModoEmpatico';

export default function NotFound() {
  const navigate = useNavigate();
  const { modoEmpatico } = useContext(ModoEmpaticContext);
  const isWarm = modoEmpatico;

  const C = isWarm
    ? { fondo: '#C75000', texto: '#2B1600', suave: '#5C4636', boton: 'linear-gradient(135deg, #C75000, #A93F00)' }
    : { fondo: '#7C3AED', texto: '#2E1065', suave: '#6B5B8A', boton: 'linear-gradient(135deg, #7C3AED, #4A148C)' };

  return (
    <div style={{ maxWidth: '560px', margin: '70px auto', padding: '0 20px', textAlign: 'center' }}>
      <div
        style={{
          background: '#fff',
          border: `2px solid ${isWarm ? '#E7C9B3' : '#E9D5FF'}`,
          borderRadius: '20px',
          padding: '40px 28px',
          boxShadow: '0 12px 34px rgba(106,27,154,0.15)',
        }}
      >
        <div
          style={{
            width: '90px', height: '90px', borderRadius: '50%',
            background: isWarm ? '#FFF1E6' : '#F3E8FF',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '16px',
          }}
        >
          <Compass size={46} color={C.fondo} />
        </div>

        <h1 style={{ fontSize: isWarm ? '64px' : '58px', fontWeight: 800, color: C.fondo, margin: '0 0 4px', lineHeight: 1 }}>
          404
        </h1>
        <h2 style={{ fontSize: isWarm ? '24px' : '22px', color: C.texto, margin: '0 0 12px' }}>
          Uy, esta página no existe
        </h2>
        <p style={{ fontSize: isWarm ? '17px' : '15px', color: C.suave, lineHeight: 1.6, margin: '0 0 26px' }}>
          Puede que el enlace esté equivocado o que la página se haya movido. No te preocupes,
          te ayudamos a volver al camino. 🐾
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={() => navigate('/convocatorias')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '13px 22px', background: C.boton, color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: isWarm ? '17px' : '15px', boxShadow: '0 4px 14px rgba(124,58,237,0.3)' }}
          >
            <Home size={18} /> Volver al inicio
          </button>
          <button
            onClick={() => navigate(-1)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '13px 22px', background: '#fff', color: C.fondo, border: `2px solid ${C.fondo}`, borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: isWarm ? '17px' : '15px' }}
          >
            ← Regresar
          </button>
        </div>

        <p style={{ marginTop: '26px', fontSize: '13px', color: C.suave, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <HeartHandshake size={16} color={C.fondo} /> Gestión Empática · Portal de Becas y Estímulos Culturales
        </p>
      </div>
    </div>
  );
}
