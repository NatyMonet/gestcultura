import { API_URL } from '../config/api';
// ============================================================================
// PANTALLA: Recuperar contraseña (Paso 1 - pedir el enlace)
// Ficha SENA: 3013183 | Estudiante: Natalia Mejía Cardona
// La persona escribe su correo y el sistema le envía un enlace para crear
// una contraseña nueva. Respeta el Modo Empático (colores y tamaños).
// ============================================================================
import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { HeartHandshake, Mail } from 'lucide-react';
import Swal from 'sweetalert2';
import { ModoEmpaticContext } from '../context/ModoEmpatico';

export default function RecuperarPassword() {
  const [correo, setCorreo] = useState('');
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();
  const { modoEmpatico } = useContext(ModoEmpaticContext);
  const isWarm = modoEmpatico;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!correo) {
      Swal.fire({ icon: 'warning', title: 'Falta el correo', text: 'Por favor escribe tu correo electrónico' });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      Swal.fire({ icon: 'warning', title: 'Correo inválido', text: 'Por favor escribe un correo válido' });
      return;
    }
    setCargando(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/recuperar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo }),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        // Modo desarrollo: si el backend devuelve el enlace (sin correo configurado),
        // se lo mostramos para poder probar el flujo completo.
        if (data.enlaceDev) {
          Swal.fire({
            icon: 'info',
            title: 'Enlace de prueba (modo desarrollo)',
            html: `Aún no hay correo configurado, así que aquí tienes tu enlace para continuar:<br><br>
                   <a href="${data.enlaceDev}" style="color:#7C3AED;font-weight:bold;word-break:break-all">${data.enlaceDev}</a>`,
            confirmButtonText: 'Ir a crear mi contraseña',
          }).then(() => {
            const url = new URL(data.enlaceDev);
            navigate('/restablecer' + url.search);
          });
        } else {
          Swal.fire({
            icon: 'success',
            title: 'Revisa tu correo',
            text: data.message,
          }).then(() => navigate('/login'));
        }
      } else {
        Swal.fire({ icon: 'error', title: 'Error', text: data.message || 'No se pudo procesar la solicitud' });
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

  return (
    <div style={{ maxWidth: '400px', margin: '70px auto', borderRadius: '18px', overflow: 'hidden', boxShadow: '0 12px 34px rgba(106,27,154,0.18)', background: '#fff' }}>
      <div style={{ background: C.header, padding: '30px 24px', textAlign: 'center', color: '#fff' }}>
        <div style={{ width: '62px', height: '62px', borderRadius: '16px', background: 'rgba(255,255,255,0.18)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
          <HeartHandshake size={34} />
        </div>
        <h2 style={{ margin: 0, fontSize: isWarm ? '24px' : '22px', fontWeight: 800 }}>Recuperar contraseña</h2>
        <p style={{ margin: '6px 0 0', fontSize: isWarm ? '14px' : '13px', opacity: 0.9 }}>
          Te enviaremos un enlace a tu correo
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ padding: '26px 24px' }}>
        <p style={{ marginTop: 0, marginBottom: '18px', color: C.help, fontSize: `${fsInput}px`, lineHeight: 1.5 }}>
          Escribe el correo con el que te registraste y te enviaremos un enlace para crear una contraseña nueva.
        </p>

        <div style={{ marginBottom: '22px' }}>
          <label style={labelStyle}>Correo:</label>
          <div style={{ position: 'relative' }}>
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="tu@email.com"
              style={{ ...inputStyle, paddingRight: '42px' }}
              onFocus={onFocusInput}
              onBlur={onBlurInput}
            />
            <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', display: 'flex', color: C.focus }}>
              <Mail size={18} />
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={cargando}
          style={{ width: '100%', padding: '13px', background: cargando ? C.buttonLoading : C.button, color: 'white', border: 'none', cursor: cargando ? 'not-allowed' : 'pointer', borderRadius: '10px', fontSize: `${fsBtn}px`, fontWeight: 'bold', boxShadow: '0 4px 14px rgba(124,58,237,0.35)' }}
        >
          {cargando ? '⏳ Enviando...' : '✉️ Enviar enlace'}
        </button>
      </form>

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
