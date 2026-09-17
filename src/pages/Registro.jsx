import { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, HeartHandshake, Sparkles } from 'lucide-react';
import Swal from 'sweetalert2';
import { ModoEmpaticContext } from '../context/ModoEmpatico';

export default function Registro() {
  const navigate = useNavigate();
  const { modoEmpatico, setModoEmpatico } = useContext(ModoEmpaticContext);
  const isWarm = modoEmpatico;

  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    telefono: '',
    cedula: '',
    edad: '',
    contrasena: '',
    confirmContrasena: '',
  });

  const [verContrasena, setVerContrasena] = useState(false);
  const [verConfirm, setVerConfirm] = useState(false);

  // Activa el Modo Empático automáticamente cuando la edad es 50 o más
  useEffect(() => {
    const n = parseInt(formData.edad, 10);
    if (!isNaN(n) && n >= 50) {
      setModoEmpatico(true);
    }
  }, [formData.edad, setModoEmpatico]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nombre || !formData.correo || !formData.telefono || !formData.cedula || !formData.edad || !formData.contrasena || !formData.confirmContrasena) {
      Swal.fire({ icon: 'warning', title: 'Campos incompletos', text: 'Por favor completa todos los campos' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.correo)) {
      Swal.fire({ icon: 'warning', title: 'Email inválido', text: 'Por favor ingresa un email válido' });
      return;
    }

    const edadNum = parseInt(formData.edad, 10);
    if (isNaN(edadNum) || edadNum < 14 || edadNum > 120) {
      Swal.fire({ icon: 'warning', title: 'Edad inválida', text: 'Ingresa una edad válida (entre 14 y 120 años)' });
      return;
    }

    if (formData.contrasena !== formData.confirmContrasena) {
      Swal.fire({ icon: 'warning', title: 'Contraseñas no coinciden', text: 'Las contraseñas deben ser iguales' });
      return;
    }

    if (formData.contrasena.length < 8) {
      Swal.fire({ icon: 'warning', title: 'Contraseña débil', text: 'La contraseña debe tener mínimo 8 caracteres' });
      return;
    }

    const anioNacimiento = new Date().getFullYear() - edadNum;
    const fechaNacimiento = `${anioNacimiento}-01-01`;

    try {
      const response = await fetch('http://localhost:5000/api/auth/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: formData.nombre,
          correo: formData.correo,
          telefono: formData.telefono,
          cedula: formData.cedula,
          fechaNacimiento,
          contrasena: formData.contrasena,
          confirmContrasena: formData.confirmContrasena,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setFormData({ nombre: '', correo: '', telefono: '', cedula: '', edad: '', contrasena: '', confirmContrasena: '' });
        Swal.fire({
          icon: 'success',
          title: 'Registro exitoso',
          text: 'Tu cuenta ha sido creada correctamente',
          confirmButtonText: 'Ir a iniciar sesión',
        }).then(() => {
          navigate('/login');
        });
      } else {
        Swal.fire({ icon: 'error', title: 'Error', text: data.message || 'No se pudo crear la cuenta' });
      }
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error de conexión', text: 'No se pudo conectar al servidor' });
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
        boxBg: '#FFF7EF',
        boxBorder: '#2B1600',
        badgeBg: '#F3E4D8',
        badgeText: '#C75000',
        empBg: '#FCEBDD',
        empBorder: '#C75000',
        empText: '#2B1600',
        spark: '#C75000',
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
        boxBg: '#FBF9FE',
        boxBorder: '#E6D9F5',
        badgeBg: '#EDE4FB',
        badgeText: '#7C3AED',
        empBg: '#F3ECFC',
        empBorder: '#C9B4EE',
        empText: '#4A148C',
        spark: '#7C3AED',
        link: '#7C3AED',
        help: '#6B5B7E',
      };

  // Letra un toque más grande en Modo Empático
  const fsLabel = isWarm ? 16 : 14;
  const fsInput = isWarm ? 16 : 14;
  const fsBtn = isWarm ? 18 : 16;
  const fsHelp = isWarm ? 13 : 12;

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

  const ojoBtnStyle = {
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
  };

  const edadNumActual = parseInt(formData.edad, 10);
  const esMayor = !isNaN(edadNumActual) && edadNumActual >= 50;

  return (
    <div
      style={{
        maxWidth: '420px',
        margin: '50px auto',
        borderRadius: '18px',
        overflow: 'hidden',
        boxShadow: '0 12px 34px rgba(106,27,154,0.18)',
        background: '#fff',
      }}
    >
      <div style={{ background: C.header, padding: '28px 24px', textAlign: 'center', color: '#fff' }}>
        <div
          style={{
            width: '58px',
            height: '58px',
            borderRadius: '16px',
            background: 'rgba(255,255,255,0.18)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '10px',
          }}
        >
          <HeartHandshake size={32} />
        </div>
        <h2 style={{ margin: 0, fontSize: isWarm ? '24px' : '22px', fontWeight: 800 }}>Crear cuenta</h2>
        <p style={{ margin: '6px 0 0', fontSize: isWarm ? '14px' : '13px', opacity: 0.9 }}>
          Regístrate para postularte a las convocatorias
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
        <div style={{ marginBottom: '14px' }}>
          <label style={labelStyle}>Nombre y Apellidos completos:</label>
          <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Ej: Ana María García Pérez" style={inputStyle} onFocus={onFocusInput} onBlur={onBlurInput} />
        </div>

        <div style={{ marginBottom: '14px' }}>
          <label style={labelStyle}>Correo:</label>
          <input type="email" name="correo" value={formData.correo} onChange={handleChange} placeholder="tu@email.com" style={inputStyle} onFocus={onFocusInput} onBlur={onBlurInput} />
        </div>

        {/* EDAD - amable para adultos mayores */}
        <div style={{ marginBottom: '14px', border: `2px solid ${C.boxBorder}`, borderRadius: '12px', padding: '14px', background: C.boxBg }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', gap: '8px' }}>
            <label style={{ fontWeight: 'bold', color: C.label, fontSize: `${fsLabel}px` }}>¿Cuál es tu edad? (Años cumplidos):</label>
            <span style={{ fontSize: '10px', fontWeight: 'bold', color: C.badgeText, background: C.badgeBg, padding: '2px 8px', borderRadius: '9999px', whiteSpace: 'nowrap' }}>MODO EMPÁTICO</span>
          </div>
          <p style={{ margin: '0 0 10px', fontSize: `${fsHelp}px`, color: C.help, lineHeight: 1.4 }}>
            Preguntamos tu edad con amabilidad para adaptar automáticamente el tamaño de la letra, habilitar la lectura por voz y acompañarte paso a paso si tienes 50 años o más.
          </p>
          <input type="number" name="edad" value={formData.edad} onChange={handleChange} placeholder="Ej: 45" min="14" max="120" style={inputStyle} onFocus={onFocusInput} onBlur={onBlurInput} />
          {esMayor && (
            <div style={{ marginTop: '10px', display: 'flex', gap: '8px', background: C.empBg, border: `2px solid ${C.empBorder}`, borderRadius: '10px', padding: '10px 12px' }}>
              <Sparkles size={18} color={C.spark} style={{ flexShrink: 0, marginTop: '2px' }} />
              <p style={{ margin: 0, fontSize: `${fsHelp}px`, color: C.empText, fontWeight: 600, lineHeight: 1.4 }}>
                ¡Excelente! Al tener {edadNumActual} años, activaremos automáticamente el Modo Acompañado (letra grande, voz y guía paso a paso).
              </p>
            </div>
          )}
        </div>

        {/* CÉDULA */}
        <div style={{ marginBottom: '14px' }}>
          <label style={labelStyle}>Número de Cédula de Ciudadanía / Extranjería:</label>
          <input type="text" name="cedula" value={formData.cedula} onChange={handleChange} placeholder="Ej: 52.890.124" style={inputStyle} onFocus={onFocusInput} onBlur={onBlurInput} />
        </div>

        <div style={{ marginBottom: '14px' }}>
          <label style={labelStyle}>Teléfono / Celular:</label>
          <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} placeholder="Ej: +57 300 123 4567" style={inputStyle} onFocus={onFocusInput} onBlur={onBlurInput} />
        </div>

        <div style={{ marginBottom: '14px' }}>
          <label style={labelStyle}>Contraseña:</label>
          <div style={{ position: 'relative' }}>
            <input type={verContrasena ? 'text' : 'password'} name="contrasena" value={formData.contrasena} onChange={handleChange} placeholder="Mínimo 8 caracteres" style={{ ...inputStyle, paddingRight: '42px' }} onFocus={onFocusInput} onBlur={onBlurInput} />
            <button type="button" onClick={() => setVerContrasena(!verContrasena)} style={ojoBtnStyle} title={verContrasena ? 'Ocultar' : 'Mostrar'} aria-label={verContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
              {verContrasena ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '22px' }}>
          <label style={labelStyle}>Confirmar Contraseña:</label>
          <div style={{ position: 'relative' }}>
            <input type={verConfirm ? 'text' : 'password'} name="confirmContrasena" value={formData.confirmContrasena} onChange={handleChange} placeholder="Repite tu contraseña" style={{ ...inputStyle, paddingRight: '42px' }} onFocus={onFocusInput} onBlur={onBlurInput} />
            <button type="button" onClick={() => setVerConfirm(!verConfirm)} style={ojoBtnStyle} title={verConfirm ? 'Ocultar' : 'Mostrar'} aria-label={verConfirm ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
              {verConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          style={{
            width: '100%',
            padding: '13px',
            background: C.button,
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            borderRadius: '10px',
            fontSize: `${fsBtn}px`,
            fontWeight: 'bold',
            boxShadow: '0 4px 14px rgba(124,58,237,0.35)',
          }}
        >
          Registrarse
        </button>
      </form>

      <div style={{ textAlign: 'center', padding: '0 24px 24px' }}>
        <p style={{ margin: 0, color: C.help, fontSize: `${fsHelp + 1}px` }}>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" style={{ color: C.link, textDecoration: 'none', fontWeight: 'bold' }}>
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}