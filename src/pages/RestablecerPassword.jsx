// ============================================================================
// PANTALLA: Restablecer contraseña (Paso 2 - crear la nueva contraseña)
// Ficha SENA: 3013183 | Estudiante: Natalia Mejía Cardona
// Lee el token del enlace (?token=...) que llegó al correo y permite definir
// una contraseña nueva, que se guarda cifrada. Respeta el Modo Empático.
// ============================================================================
import { useState, useContext } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { HeartHandshake, Eye, EyeOff } from 'lucide-react';
import Swal from 'sweetalert2';
import { ModoEmpaticContext } from '../context/ModoEmpatico';

export default function RestablecerPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [contrasena, setContrasena] = useState('');
  const [confirmContrasena, setConfirmContrasena] = useState('');
  const [verContrasena, setVerContrasena] = useState(false);
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();
  const { modoEmpatico } = useContext(ModoEmpaticContext);
  const isWarm = modoEmpatico;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      Swal.fire({ icon: 'error', title: 'Enlace no válido', text: 'Este enlace no es válido. Solicita uno nuevo desde "¿Olvidaste tu contraseña?".' });
      return;
    }
    if (!contrasena || !confirmContrasena) {
      Swal.fire({ icon: 'warning', title: 'Campos incompletos', text: 'Por favor completa los dos campos' });
      return;
    }
    if (contrasena !== confirmContrasena) {
      Swal.fire({ icon: 'warning', title: 'No coinciden', text: 'Las dos contraseñas deben ser iguales' });
      return;
    }
    if (contrasena.length < 8) {
      Swal.fire({ icon: 'warning', title: 'Contraseña muy corta', text: 'La contraseña debe tener al menos 8 caracteres' });
      return;
    }
    setCargando(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/restablecer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, contrasena, confirmContrasena }),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        Swal.fire({ icon: 'success', title: '¡Listo!', text: data.message }).then(() => navigate('/login'));
      } else {
        Swal.fire({ icon: 'error', title: 'No se pudo cambiar', text: data.message || 'No se pudo restablecer la contraseña' });
      }
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error de conexión', text: 'No se pudo conectar al servidor' });
    } finally {
      setCargando(false);
    }
  };

  const C = isWarm
    ? {
        header: 'linear-gradient(135deg, #C75000, #2B1600)',
        label: '#2B1600', inputBg: '#FFFDF9', inputBorder: '#2B1600', focus: '#C75000',
        button: 'linear-gradient(135deg, #C75000, #A93F00)', buttonLoading: '#D98A5A',
        link: '#C75000', help: '#5C4636',
      }
    : {
        header: 'linear-gradient(135deg, #7C3AED, #4A148C)',
        label: '#4A148C', inputBg: '#FAF7FE', inputBorder: '#E6D9F5', focus: '#7C3AED',
        button: 'linear-gradient(135deg, #7C3AED, #4A148C)', buttonLoading: '#9E7BC7',
        link: '#7C3AED', help: '#555',
      };

  const fsLabel = isWarm ? 16 : 14;
  const fsInput = isWarm ? 16 : 14;
  const fsBtn = isWarm ? 18 : 16;

  const inputStyle = {
    width: '100%', padding: '11px 12px', boxSizing: 'border-box', borderRadius: '10px',
    border: `2px solid ${C.inputBorder}`, fontSize: `${fsInput}px`, outline: 'none', background: C.inputBg,
  };
  const onFocusInput = (e) => (e.target.style.border = `2px solid ${C.focus}`);
  const onBlurInput = (e) => (e.target.style.border = `2px solid ${C.inputBorder}`);
  const labelStyle = { display: 'block', marginBottom: '6px', fontWeight: 'bold', color: C.label, fontSize: `${fsLabel}px` };

  const botonOjo = (
    <button
      type="button"
      onClick={() => setVerContrasena(!verContrasena)}
      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: C.focus }}
      title={verContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}
      aria-label={verContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}
    >
      {verContrasena ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  );

  return (
    <div style={{ maxWidth: '400px', margin: '70px auto', borderRadius: '18px', overflow: 'hidden', boxShadow: '0 12px 34px rgba(106,27,154,0.18)', background: '#fff' }}>
      <div style={{ background: C.header, padding: '30px 24px', textAlign: 'center', color: '#fff' }}>
        <div style={{ width: '62px', height: '62px', borderRadius: '16px', background: 'rgba(255,255,255,0.18)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
          <HeartHandshake size={34} />
        </div>
        <h2 style={{ margin: 0, fontSize: isWarm ? '24px' : '22px', fontWeight: 800 }}>Nueva contraseña</h2>
        <p style={{ margin: '6px 0 0', fontSize: isWarm ? '14px' : '13px', opacity: 0.9 }}>
          Crea tu nueva contraseña
        </p>
      </div>

      {!token ? (
        <div style={{ padding: '30px 24px', textAlign: 'center' }}>
          <p style={{ color: C.help, fontSize: `${fsInput}px`, lineHeight: 1.5 }}>
            Este enlace no es válido o ya fue usado. Por favor solicita uno nuevo.
          </p>
          <Link to="/recuperar" style={{ color: C.link, textDecoration: 'none', fontWeight: 'bold' }}>
            Solicitar un nuevo enlace
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ padding: '26px 24px' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Nueva contraseña:</label>
            <div style={{ position: 'relative' }}>
              <input
                type={verContrasena ? 'text' : 'password'}
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                style={{ ...inputStyle, paddingRight: '42px' }}
                onFocus={onFocusInput}
                onBlur={onBlurInput}
              />
              {botonOjo}
            </div>
          </div>

          <div style={{ marginBottom: '22px' }}>
            <label style={labelStyle}>Confirmar contraseña:</label>
            <div style={{ position: 'relative' }}>
              <input
                type={verContrasena ? 'text' : 'password'}
                value={confirmContrasena}
                onChange={(e) => setConfirmContrasena(e.target.value)}
                placeholder="Repite la contraseña"
                style={{ ...inputStyle, paddingRight: '42px' }}
                onFocus={onFocusInput}
                onBlur={onBlurInput}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={cargando}
            style={{ width: '100%', padding: '13px', background: cargando ? C.buttonLoading : C.button, color: 'white', border: 'none', cursor: cargando ? 'not-allowed' : 'pointer', borderRadius: '10px', fontSize: `${fsBtn}px`, fontWeight: 'bold', boxShadow: '0 4px 14px rgba(124,58,237,0.35)' }}
          >
            {cargando ? '⏳ Guardando...' : '🔒 Guardar contraseña'}
          </button>
        </form>
      )}

      <div style={{ textAlign: 'center', padding: '0 24px 24px' }}>
        <p style={{ margin: 0, color: C.help, fontSize: isWarm ? '14px' : '13px' }}>
          <Link to="/login" style={{ color: C.link, textDecoration: 'none', fontWeight: 'bold' }}>
            Volver a iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
