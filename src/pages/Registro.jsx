import { useState } from 'react';
import Swal from 'sweetalert2';

export default function Registro() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    contraseña: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nombre || !formData.email || !formData.contraseña) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor completa todos los campos',
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Swal.fire({
        icon: 'warning',
        title: 'Email inválido',
        text: 'Por favor ingresa un email válido',
      });
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Registro exitoso',
          text: 'Tu cuenta ha sido creada correctamente',
        });
        setFormData({ nombre: '', email: '', contraseña: '' });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo crear la cuenta',
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

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <h2>Registro de Usuario</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>Nombre:</label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Contraseña:</label>
          <input
            type="password"
            name="contraseña"
            value={formData.contraseña}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}>
          Registrarse
        </button>
      </form>
    </div>
  );
}