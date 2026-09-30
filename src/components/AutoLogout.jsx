// ============================================================================
// COMPONENTE: AutoLogout (cierre de sesión automático por inactividad)
// Ficha SENA: 3013183 | Estudiante: Natalia Mejía Cardona
// ----------------------------------------------------------------------------
// Por seguridad, si la persona tiene la sesión iniciada y pasa un tiempo sin
// ninguna actividad (mouse, teclado, scroll o toque), el sistema cierra su
// sesión de forma automática y segura, y la lleva al inicio de sesión.
// El contador se reinicia cada vez que la persona hace algo.
// ============================================================================
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

// Tiempo máximo de inactividad permitido (15 minutos). Se puede cambiar aquí.
const TIEMPO_INACTIVIDAD_MS = 15 * 60 * 1000;

export default function AutoLogout() {
  const navigate = useNavigate();
  const temporizador = useRef(null);

  useEffect(() => {
    // ¿Hay una sesión iniciada? (token o datos de usuario guardados)
    const haySesion = () =>
      !!localStorage.getItem('token') || !!localStorage.getItem('usuario');

    // Cierra la sesión por seguridad y avisa a la persona con calidez.
    const cerrarPorInactividad = () => {
      if (!haySesion()) return;
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      Swal.fire({
        icon: 'info',
        title: 'Cerramos tu sesión por seguridad',
        text: 'Pasaste un tiempo sin actividad, así que cerramos tu sesión para proteger tu información. Puedes iniciar sesión de nuevo cuando quieras.',
        confirmButtonText: 'Entendido',
      }).then(() => navigate('/login'));
    };

    // Reinicia el contador de inactividad (solo si hay sesión iniciada).
    const reiniciar = () => {
      if (temporizador.current) clearTimeout(temporizador.current);
      if (haySesion()) {
        temporizador.current = setTimeout(cerrarPorInactividad, TIEMPO_INACTIVIDAD_MS);
      }
    };

    const eventos = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    eventos.forEach((ev) => window.addEventListener(ev, reiniciar));

    // Arrancamos el contador al montar el componente.
    reiniciar();

    // Limpieza al desmontar.
    return () => {
      eventos.forEach((ev) => window.removeEventListener(ev, reiniciar));
      if (temporizador.current) clearTimeout(temporizador.current);
    };
  }, [navigate]);

  // Este componente no dibuja nada; solo vigila la inactividad.
  return null;
}
