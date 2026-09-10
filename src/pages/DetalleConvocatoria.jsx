import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const DetalleConvocatoria = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [convocatoria, setConvocatoria] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const obtenerConvocatoria = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/convocatorias/${id}`);
        if (!response.ok) throw new Error('Convocatoria no encontrada');
        const data = await response.json();
        if (data.success) {
          setConvocatoria(data.data);
          setError(null);
        } else {
          setError(data.message || 'Error desconocido');
        }
      } catch (err) {
        setError(err.message);
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };
    obtenerConvocatoria();
  }, [id]);

  const formatearFecha = (fecha) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const calcularDiasRestantes = (fechaCierre) => {
    const hoy = new Date();
    const cierre = new Date(fechaCierre);
    const diferencia = cierre - hoy;
    const dias = Math.ceil(diferencia / (1000 * 60 * 60 * 24));
    return dias;
  };

  const handleInscribirse = (convocatoria) => {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (!usuarioGuardado) {
      Swal.fire({
        icon: 'warning',
        title: 'Inicia sesión primero',
        text: 'Debes estar registrado para inscribirte',
        confirmButtonText: 'Ir a Login',
      }).then(() => navigate('/login'));
      return;
    }

    const usuario = JSON.parse(usuarioGuardado);
    Swal.fire({
      title: '¿Inscribirse en esta convocatoria?',
      text: convocatoria.nombre,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, inscribirse',
      cancelButtonText: 'Cancelar',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch('http://localhost:5000/api/inscripciones', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              idUsuario: usuario.idUsuario,
              idConvocatoria: convocatoria.idConvocatoria,
              motivacion: 'Inscripción desde GestCultura',
            }),
          });
          const data = await response.json();
          if (data.success) {
            Swal.fire({
              icon: 'success',
              title: '¡Inscripción exitosa!',
              text: 'Te has inscrito en: ' + convocatoria.nombre,
              confirmButtonText: 'OK',
            }).then(() => navigate('/mis-inscripciones'));
          } else {
            Swal.fire({ icon: 'error', title: 'Error', text: data.message || 'No se pudo completar la inscripción' });
          }
        } catch (error) {
          Swal.fire({ icon: 'error', title: 'Error de conexión', text: 'No se pudo conectar con el servidor' });
          console.error('Error:', error);
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando convocatoria...</p>
        </div>
      </div>
    );
  }

  if (error || !convocatoria) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="text-red-600 text-5xl mb-4 text-center">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 text-center mb-2">Error</h1>
          <p className="text-gray-600 text-center">{error || 'Convocatoria no encontrada'}</p>
          <button onClick={() => navigate('/convocatorias')} className="mt-6 w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition">
            Volver a Convocatorias
          </button>
        </div>
      </div>
    );
  }

  const diasRestantes = calcularDiasRestantes(convocatoria.fechaCierre);
  const estaVigente = diasRestantes > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate('/convocatorias')} className="mb-8 text-indigo-600 hover:text-indigo-700 font-medium text-lg">
          ← Volver a Convocatorias
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-4"></div>
          <div className="p-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">{convocatoria.nombre}</h1>
            <p className="text-gray-600 text-lg mb-8 leading-relaxed">{convocatoria.descripcion}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="border-l-4 border-indigo-600 pl-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">📅 Fechas</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 font-semibold">Fecha de Inicio</p>
                    <p className="text-gray-800 font-semibold">{formatearFecha(convocatoria.fechaInicio)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-semibold">Fecha de Cierre</p>
                    <p className="text-gray-800 font-semibold">{formatearFecha(convocatoria.fechaCierre)}</p>
                  </div>
                </div>
              </div>

              <div className="border-l-4 border-indigo-600 pl-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">📊 Información</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 font-semibold">Cupos Disponibles</p>
                    <p className="text-gray-800 font-semibold text-2xl">{convocatoria.cupos}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-semibold">Estado</p>
                    <span className="inline-block bg-green-100 text-green-700 px-4 py-2 rounded-full font-bold">Activa</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg mb-8 ${estaVigente ? 'bg-blue-50 border-l-4 border-blue-600' : 'bg-red-50 border-l-4 border-red-600'}`}>
              <p className={`font-bold text-lg ${estaVigente ? 'text-blue-800' : 'text-red-800'}`}>
                {estaVigente ? `⏰ ${diasRestantes} días restantes para inscribirse` : '❌ Esta convocatoria ha expirado'}
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => handleInscribirse(convocatoria)}
                disabled={!estaVigente}
                className={`flex-1 py-3 px-6 rounded-lg transition font-bold text-white ${estaVigente ? 'bg-indigo-600 hover:bg-indigo-700 cursor-pointer' : 'bg-gray-400 cursor-not-allowed'}`}
              >
                {estaVigente ? '✨ Inscribirse' : 'Inscripción Cerrada'}
              </button>
              <button onClick={() => navigate('/convocatorias')} className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-300 transition font-bold">
                ← Volver
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetalleConvocatoria;