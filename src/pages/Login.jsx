import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, HeartHandshake } from 'lucide-react';
import Swal from 'sweetalert2';
import { ModoEmpaticContext } from '../context/ModoEmpatico';

export default function Login() {
  const [formData, setFormData] = useState({ correo: '', contrasena: '' });
  const [cargando, setCargando] = useState(false);
  const [verContrasena, setVerContrasena] = useState(false);
  const navigate = useNavigate();
  const { modoEmpatico, setModoEmpatico } = useContext(ModoEmpaticContext);
  const isWarm = modoEmpatico;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const calcularEdad = (fechaNacimiento) => {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.correo || !formData.contrasena) {
      Swal.fire({ icon: 'warning', title: 'Campos incompletos', text: 'Por favor completa todos los campos' });
      return;
    }
    setCargando(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        const usuario = data.user;
        // Guardamos el token de seguridad (JWT) para las acciones protegidas
        if (data.token) localStorage.setItem('token', data.token);
        try {
          const userResponse = await fetch(`http://localhost:5000/api/usuarios/${usuario.idUsuario}`);
          const userData = await userResponse.json();
          if (userData.success && userData.data.fechaNacimiento) {
            const edad = calcularEdad(userData.data.fechaNacimiento);
            if (edad >= 50) {
              setModoEmpatico(true);
              Swal.fire({ icon: 'info', title: '👁️ Modo Empático Activado', text: `Bienvenido, ${usuario.nombre}. Se ha activado automáticamente el Modo Empático para una mejor experiencia.`, timer: 2000 });
            } else {
              Swal.fire({ icon: 'success', title: 'Sesión iniciada', text: `¡Bienvenido, ${usuario.nombre}!`, timer: 1500 });
            }
            localStorage.setItem('usuario', JSON.stringify({ ...usuario, fechaNacimiento: userData.data?.fechaNacimiento || null }));
          }
        } catch (userError) {
          console.log('Error obteniendo usuario, pero continuando...');
          localStorage.setItem('usuario', JSON.stringify(usuario));
        }
        setTimeout(() => { navigate('/convocatorias'); }, 2000);
      } else {
        Swal.fire({ icon: 'error', title: 'Error', text: data.message || 'No se pudo iniciar sesión' });
      }
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error de conexión', text: 'No se pudo conectar al servidor' });
    } finally {
      setCargando(false);
    }
  };

  // Paleta según el Modo Empático
  const C = isWarm
    ? {
        header: 'linear-gradient(135deg, #C75000, #2B1600)',
        label: '#2B1600',
        inputBg: '#FFFDF9',
        inputBorder: '#2B1600',
        focus: '#C75000',
        button: 'linear-gradient(135deg, #C75000, #A93F00)',
        buttonLoading: '#D98A5A',
        link: '#C75000',
        help: '#5C4636',
      }
    : {
        header: 'linear-gradient(135deg, #7C3AED, #4A148C)',
        label: '#4A148C',
        inputBg: '#FAF7FE',
        inputBorder: '#E6D9F5',
        focus: '#7C3AED',
        button: 'linear-gradient(135deg, #7C3AED, #4A148C)',
        buttonLoading: '#9E7BC7',
        link: '#7C3AED',
        help: '#555',
      };

  const fsLabel = isWarm ? 16 : 14;
  const fsInput = isWarm ? 16 : 14;
  const fsBtn = isWarm ? 18 : 16;

  const inputStyle = {
    width: '100%',
    padding: '11px 12px',
    boxSizing: 'border-box',
    borderRadius: '10px',
    border: `2px solid ${C.inputBorder}`,
    fontSize: `${fsInput}px`,
    outline: 'none',
    background: C.inputBg,
  };

  const onFocusInput = (e) => (e.target.style.border = `2px solid ${C.focus}`);
  const onBlurInput = (e) => (e.target.style.border = `2px solid ${C.inputBorder}`);

  const labelStyle = { display: 'block', marginBottom: '6px', fontWeight: 'bold', color: C.label, fontSize: `${fsLabel}px` };

  return (
    <div
      style={{
        maxWidth: '400px',
        margin: '70px auto',
        borderRadius: '18px',
        overflow: 'hidden',
        boxShadow: '0 12px 34px rgba(106,27,154,0.18)',
        background: '#fff',
      }}
    >
      <div style={{ background: C.header, padding: '30px 24px', textAlign: 'center', color: '#fff' }}>
        <div
          style={{
            width: '62px',
            height: '62px',
            borderRadius: '16px',
            background: 'rgba(255,255,255,0.18)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '12px',
          }}
        >
          <HeartHandshake size={34} />
        </div>
        <h2 style={{ margin: 0, fontSize: isWarm ? '24px' : '22px', fontWeight: 800 }}>Gestión Empática</h2>
        <p style={{ margin: '6px 0 0', fontSize: isWarm ? '14px' : '13px', opacity: 0.9 }}>
          Ingresa para continuar con tus postulaciones
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ padding: '26px 24px' }}>
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Correo:</label>
          <input
            type="email"
            name="correo"
            value={formData.correo}
            onChange={handleChange}
            placeholder="tu@email.com"
            style={inputStyle}
            onFocus={onFocusInput}
            onBlur={onBlurInput}
          />
        </div>

        <div style={{ marginBottom: '22px' }}>
          <label style={labelStyle}>Contraseña:</label>
          <div style={{ position: 'relative' }}>
            <input
              type={verContrasena ? 'text' : 'password'}
              name="contrasena"
              value={formData.contrasena}
              onChange={handleChange}
              placeholder="Tu contraseña"
              style={{ ...inputStyle, paddingRight: '42px' }}
              onFocus={onFocusInput}
              onBlur={onBlurInput}
            />
            <button
              type="button"
              onClick={() => setVerContrasena(!verContrasena)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                display: 'flex',
                color: C.focus,
              }}
              title={verContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              aria-label={verContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {verContrasena ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={cargando}
          style={{
            width: '100%',
            padding: '13px',
            background: cargando ? C.buttonLoading : C.button,
            color: 'white',
            border: 'none',
            cursor: cargando ? 'not-allowed' : 'pointer',
            borderRadius: '10px',
            fontSize: `${fsBtn}px`,
            fontWeight: 'bold',
            boxShadow: '0 4px 14px rgba(124,58,237,0.35)',
          }}
        >
          {cargando ? '⏳ Cargando...' : '🔓 Iniciar Sesión'}
        </button>
      </form>

      <div style={{ textAlign: 'center', padding: '0 24px 24px' }}>
        <p style={{ margin: 0, color: C.help, fontSize: isWarm ? '14px' : '13px' }}>
          ¿No tienes cuenta?{' '}
          <Link to="/registro" style={{ color: C.link, textDecoration: 'none', fontWeight: 'bold' }}>
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
}