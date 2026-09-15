import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, HeartHandshake } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Registro() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    telefono: '',
    fechaNacimiento: '',
    contrasena: '',
    confirmContrasena: '',
  });

  const [verContrasena, setVerContrasena] = useState(false);
  const [verConfirm, setVerConfirm] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const calcularEdad = (fecha) => {
    const hoy = new Date();
    const nacimiento = new Date(fecha);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nombre || !formData.correo || !formData.telefono || !formData.fechaNacimiento || !formData.contrasena || !formData.confirmContrasena) {
      Swal.fire({ icon: 'warning', title: 'Campos incompletos', text: 'Por favor completa todos los campos' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.correo)) {
      Swal.fire({ icon: 'warning', title: 'Email inválido', text: 'Por favor ingresa un email válido' });
      return;
    }

    const edad = calcularEdad(formData.fechaNacimiento);
    if (edad < 14) {
      Swal.fire({ icon: 'warning', title: 'Edad insuficiente', text: 'Debes tener al menos 14 años para registrarte' });
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

    try {
      const response = await fetch('http://localhost:5000/api/auth/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setFormData({ nombre: '', correo: '', telefono: '', fechaNacimiento: '', contrasena: '', confirmContrasena: '' });
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

  const inputStyle = {
    width: '100%',
    padding: '11px 12px',
    boxSizing: 'border-box',
    borderRadius: '10px',
    border: '2px solid #E6D9F5',
    fontSize: '14px',
    outline: 'none',
    background: '#FAF7FE',
  };

  const onFocusInput = (e) => (e.target.style.border = '2px solid #7C3AED');
  const onBlurInput = (e) => (e.target.style.border = '2px solid #E6D9F5');

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
    color: '#7C3AED',
  };

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
      {/* Header morado con logo */}
      <div style={{ background: 'linear-gradient(135deg, #7C3AED, #4A148C)', padding: '28px 24px', textAlign: 'center', color: '#fff' }}>
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
        <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800 }}>Crear cuenta</h2>
        <p style={{ margin: '6px 0 0', fontSize: '13px', opacity: 0.9 }}>
          Regístrate para postularte a las convocatorias
        </p>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
        <div style={{ marginBottom: '14px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', color: '#4A148C' }}>Nombre:</label>
          <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Tu nombre completo" style={inputStyle} onFocus={onFocusInput} onBlur={onBlurInput} />
        </div>

        <div style={{ marginBottom: '14px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', color: '#4A148C' }}>Correo:</label>
          <input type="email" name="correo" value={formData.correo} onChange={handleChange} placeholder="tu@email.com" style={inputStyle} onFocus={onFocusInput} onBlur={onBlurInput} />
        </div>

        <div style={{ marginBottom: '14px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', color: '#4A148C' }}>Teléfono:</label>
          <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} placeholder="3001234567" style={inputStyle} onFocus={onFocusInput} onBlur={onBlurInput} />
        </div>

        <div style={{ marginBottom: '14px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', color: '#4A148C' }}>Fecha de Nacimiento:</label>
          <input type="date" name="fechaNacimiento" value={formData.fechaNacimiento} onChange={handleChange} style={inputStyle} onFocus={onFocusInput} onBlur={onBlurInput} />
        </div>

        <div style={{ marginBottom: '14px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', color: '#4A148C' }}>Contraseña:</label>
          <div style={{ position: 'relative' }}>
            <input type={verContrasena ? 'text' : 'password'} name="contrasena" value={formData.contrasena} onChange={handleChange} placeholder="Mínimo 8 caracteres" style={{ ...inputStyle, paddingRight: '42px' }} onFocus={onFocusInput} onBlur={onBlurInput} />
            <button type="button" onClick={() => setVerContrasena(!verContrasena)} style={ojoBtnStyle} title={verContrasena ? 'Ocultar' : 'Mostrar'} aria-label={verContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
              {verContrasena ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '22px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', color: '#4A148C' }}>Confirmar Contraseña:</label>
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
            background: 'linear-gradient(135deg, #7C3AED, #4A148C)',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            borderRadius: '10px',
            fontSize: '16px',
            fontWeight: 'bold',
            boxShadow: '0 4px 14px rgba(124,58,237,0.35)',
          }}
        >
          Registrarse
        </button>
      </form>

      <div style={{ textAlign: 'center', padding: '0 24px 24px' }}>
        <p style={{ margin: 0, color: '#555' }}>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" style={{ color: '#7C3AED', textDecoration: 'none', fontWeight: 'bold' }}>
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}