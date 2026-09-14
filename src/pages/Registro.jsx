import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
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
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor completa todos los campos',
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.correo)) {
      Swal.fire({
        icon: 'warning',
        title: 'Email inválido',
        text: 'Por favor ingresa un email válido',
      });
      return;
    }

    const edad = calcularEdad(formData.fechaNacimiento);
    if (edad < 14) {
      Swal.fire({
        icon: 'warning',
        title: 'Edad insuficiente',
        text: 'Debes tener al menos 14 años para registrarte',
      });
      return;
    }

    if (formData.contrasena !== formData.confirmContrasena) {
      Swal.fire({
        icon: 'warning',
        title: 'Contraseñas no coinciden',
        text: 'Las contraseñas deben ser iguales',
      });
      return;
    }

    if (formData.contrasena.length < 8) {
      Swal.fire({
        icon: 'warning',
        title: 'Contraseña débil',
        text: 'La contraseña debe tener mínimo 8 caracteres',
      });
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
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: data.message || 'No se pudo crear la cuenta',
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error de conexión',
        text: 'No se pudo conectar al servidor',
      });
    }
  };

  const ojoBtnStyle = {
    position: 'absolute',
    right: '8px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    display: 'flex',
    color: '#666',
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h2>Registro de Usuario</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>Nombre:</label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            placeholder="Tu nombre completo"
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Correo:</label>
          <input
            type="email"
            name="correo"
            value={formData.correo}
            onChange={handleChange}
            placeholder="tu@email.com"
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Teléfono:</label>
          <input
            type="text"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            placeholder="3001234567"
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Fecha de Nacimiento:</label>
          <input
            type="date"
            name="fechaNacimiento"
            value={formData.fechaNacimiento}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Contraseña:</label>
          <div style={{ position: 'relative' }}>
            <input
              type={verContrasena ? 'text' : 'password'}
              name="contrasena"
              value={formData.contrasena}
              onChange={handleChange}
              placeholder="Mínimo 8 caracteres"
              style={{ width: '100%', padding: '8px', paddingRight: '38px', boxSizing: 'border-box' }}
            />
            <button
              type="button"
              onClick={() => setVerContrasena(!verContrasena)}
              style={ojoBtnStyle}
              title={verContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              aria-label={verContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {verContrasena ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Confirmar Contraseña:</label>
          <div style={{ position: 'relative' }}>
            <input
              type={verConfirm ? 'text' : 'password'}
              name="confirmContrasena"
              value={formData.confirmContrasena}
              onChange={handleChange}
              placeholder="Repite tu contraseña"
              style={{ width: '100%', padding: '8px', paddingRight: '38px', boxSizing: 'border-box' }}
            />
            <button
              type="button"
              onClick={() => setVerConfirm(!verConfirm)}
              style={ojoBtnStyle}
              title={verConfirm ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              aria-label={verConfirm ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {verConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>
          Registrarse
        </button>
      </form>
    </div>
  );
}