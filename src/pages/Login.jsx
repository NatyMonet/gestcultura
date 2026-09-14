import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import Swal from 'sweetalert2';
import { ModoEmpaticContext } from '../context/ModoEmpatico';

export default function Login() {
  const [formData, setFormData] = useState({
    correo: '',
    contrasena: '',
  });
  const [cargando, setCargando] = useState(false);
  const [verContrasena, setVerContrasena] = useState(false);
  const navigate = useNavigate();
  const { setModoEmpatico } = useContext(ModoEmpaticContext);

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
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor completa todos los campos',
      });
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

        try {
          const userResponse = await fetch(
            `http://localhost:5000/api/usuarios/${usuario.idUsuario}`
          );
          const userData = await userResponse.json();

          if (userData.success && userData.data.fechaNacimiento) {
            const edad = calcularEdad(userData.data.fechaNacimiento);

            if (edad >= 50) {
              setModoEmpatico(true);
              Swal.fire({
                icon: 'info',
                title: '👁️ Modo Empático Activado',
                text: `Bienvenido, ${usuario.nombre}. Se ha activado automáticamente el Modo Empático para una mejor experiencia.`,
                timer: 2000,
              });
            } else {
              Swal.fire({
                icon: 'success',
                title: 'Sesión iniciada',
                text: `¡Bienvenido, ${usuario.nombre}!`,
                timer: 1500,
              });
            }

            localStorage.setItem(
              'usuario',
              JSON.stringify({
                ...usuario,
                fechaNacimiento: userData.data?.fechaNacimiento || null,
              })
            );
          }
        } catch (userError) {
          console.log('Error obteniendo usuario, pero continuando...');
          localStorage.setItem('usuario', JSON.stringify(usuario));
        }

        setTimeout(() => {
          navigate('/convocatorias');
        }, 2000);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: data.message || 'No se pudo iniciar sesión',
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error de conexión',
        text: 'No se pudo conectar al servidor',
      });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: '400px',
        margin: '100px auto',
        padding: '30px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      }}
    >
      <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>
        🎬 Gestión Empática
      </h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Correo:
          </label>
          <input
            type="email"
            name="correo"
            value={formData.correo}
            onChange={handleChange}
            placeholder="tu@email.com"
            style={{
              width: '100%',
              padding: '10px',
              boxSizing: 'border-box',
              borderRadius: '4px',
              border: '1px solid #ccc',
              fontSize: '14px',
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Contraseña:
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={verContrasena ? 'text' : 'password'}
              name="contrasena"
              value={formData.contrasena}
              onChange={handleChange}
              placeholder="Tu contraseña"
              style={{
                width: '100%',
                padding: '10px',
                paddingRight: '40px',
                boxSizing: 'border-box',
                borderRadius: '4px',
                border: '1px solid #ccc',
                fontSize: '14px',
              }}
            />
            <button
              type="button"
              onClick={() => setVerContrasena(!verContrasena)}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                display: 'flex',
                color: '#666',
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
            padding: '12px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            cursor: cargando ? 'not-allowed' : 'pointer',
            borderRadius: '4px',
            fontSize: '16px',
            fontWeight: 'bold',
            opacity: cargando ? 0.7 : 1,
          }}
        >
          {cargando ? '⏳ Cargando...' : '🔓 Iniciar Sesión'}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <p>
          ¿No tienes cuenta?{' '}
          <Link
            to="/registro"
            style={{
              color: '#007bff',
              textDecoration: 'none',
              fontWeight: 'bold',
            }}
          >
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
}