import { API_URL } from '../config/api';
// ============================================================================
// PÁGINA: Contacto — Formulario público para escribirle a la organización
// Ficha SENA: 3013183 | Estudiante: Natalia Mejía Cardona
// La persona escribe nombre, correo, asunto y mensaje. Al enviar, el mensaje
// llega al correo de Cinefilia (info@cinefilia.org.co) a través del backend.
// Respeta el Modo Empático (colores, tamaños y accesibilidad).
// ============================================================================
import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Tag, MessageSquare, Send } from 'lucide-react';
import Swal from 'sweetalert2';
import { ModoEmpaticContext } from '../context/ModoEmpatico';

export default function Contacto() {
  const [datos, setDatos] = useState({ nombre: '', correo: '', asunto: '', mensaje: '' });
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();
  const { modoEmpatico } = useContext(ModoEmpaticContext);
  const isWarm = modoEmpatico;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDatos({ ...datos, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!datos.nombre || !datos.correo || !datos.mensaje) {
      Swal.fire({ icon: 'warning', title: 'Campos incompletos', text: 'Por favor completa tu nombre, correo y mensaje.' });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(datos.correo)) {
      Swal.fire({ icon: 'warning', title: 'Correo inválido', text: 'Por favor escribe un correo electrónico válido.' });
      return;
    }
    setCargando(true);
    try {
      const response = await fetch(`${API_URL}/api/contacto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        Swal.fire({ icon: 'success', title: '¡Mensaje enviado!', text: data.message }).then(() => {
          setDatos({ nombre: '', correo: '', asunto: '', mensaje: '' });
          navigate('/convocatorias');
        });
      } else {
        Swal.fire({ icon: 'error', title: 'No se pudo enviar', text: data.message || 'Intenta de nuevo en un momento.' });
      }
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error de conexión', text: 'No se pudo conectar con el servidor.' });
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
  const labelStyle = { display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '6px', fontWeight: 'bold', color: C.label, fontSize: `${fsLabel}px` };

  return (
    <div style={{ maxWidth: '560px', margin: '50px auto', borderRadius: '18px', overflow: 'hidden', boxShadow: '0 12px 34px rgba(106,27,154,0.18)', background: '#fff' }}>
      <div style={{ background: C.header, padding: '30px 24px', textAlign: 'center', color: '#fff' }}>
        <div style={{ width: '62px', height: '62px', borderRadius: '16px', background: 'rgba(255,255,255,0.18)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
          <img src="/logo-cinefilia-white.png" alt="Logo Corporación Cinefilia" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
        </div>
        <h2 style={{ margin: 0, fontSize: isWarm ? '26px' : '23px', fontWeight: 800 }}>Contáctanos</h2>
        <p style={{ margin: '6px 0 0', fontSize: isWarm ? '15px' : '13px', opacity: 0.9 }}>
          Estamos para acompañarte. Escríbenos y te responderemos pronto.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ padding: '26px 24px' }}>
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}><User size={16} /> Nombre:</label>
          <input
            type="text"
            name="nombre"
            value={datos.nombre}
            onChange={handleChange}
            placeholder="Tu nombre completo"
            style={inputStyle}
            onFocus={onFocusInput}
            onBlur={onBlurInput}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}><Mail size={16} /> Correo:</label>
          <input
            type="email"
            name="correo"
            value={datos.correo}
            onChange={handleChange}
            placeholder="tu@email.com"
            style={inputStyle}
            onFocus={onFocusInput}
            onBlur={onBlurInput}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}><Tag size={16} /> Asunto (opcional):</label>
          <input
            type="text"
            name="asunto"
            value={datos.asunto}
            onChange={handleChange}
            placeholder="¿Sobre qué nos escribes?"
            style={inputStyle}
            onFocus={onFocusInput}
            onBlur={onBlurInput}
          />
        </div>

        <div style={{ marginBottom: '22px' }}>
          <label style={labelStyle}><MessageSquare size={16} /> Mensaje:</label>
          <textarea
            name="mensaje"
            value={datos.mensaje}
            onChange={handleChange}
            placeholder="Cuéntanos en qué te podemos ayudar…"
            rows={5}
            style={{ ...inputStyle, resize: 'vertical', minHeight: '120px', fontFamily: 'inherit' }}
            onFocus={onFocusInput}
            onBlur={onBlurInput}
          />
        </div>

        <button
          type="submit"
          disabled={cargando}
          style={{ width: '100%', padding: '13px', background: cargando ? C.buttonLoading : C.button, color: 'white', border: 'none', cursor: cargando ? 'not-allowed' : 'pointer', borderRadius: '10px', fontSize: `${fsBtn}px`, fontWeight: 'bold', boxShadow: '0 4px 14px rgba(124,58,237,0.35)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          <Send size={18} /> {cargando ? 'Enviando…' : 'Enviar mensaje'}
        </button>
      </form>

      {/* Otras vías de contacto */}
      <div style={{ textAlign: 'center', padding: '0 24px 26px', color: C.help, fontSize: isWarm ? '14px' : '13px', lineHeight: 1.6 }}>
        <p style={{ margin: '0 0 4px' }}>También puedes escribirnos por:</p>
        <p style={{ margin: 0 }}>
          <a href="https://api.whatsapp.com/send/?phone=573113446586" target="_blank" rel="noopener noreferrer" style={{ color: C.link, textDecoration: 'none', fontWeight: 'bold' }}>WhatsApp</a>
          {'  ·  '}
          <a href="mailto:info@cinefilia.org.co" style={{ color: C.link, textDecoration: 'none', fontWeight: 'bold' }}>info@cinefilia.org.co</a>
        </p>
      </div>
    </div>
  );
}
