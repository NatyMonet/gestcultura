import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

const MisInscripciones = () => {
  const [inscripciones, setInscripciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Traer inscripciones del usuario
  useEffect(() => {
    const obtenerInscripciones = async () => {
      try {
        setLoading(true);
        
        // Obtener idUsuario desde localStorage
        const usuarioGuardado = localStorage.getItem('usuario');
        if (!usuarioGuardado) {
          setError('Usuario no autenticado');
          setLoading(false);
          return;
        }

        const usuario = JSON.parse(usuarioGuardado);
        const idUsuario = usuario.idUsuario;

        // Fetch a backend
        const response = await fetch(`http://localhost:5000/api/inscripciones/usuario/${idUsuario}`);

        if (!response.ok) {
          throw new Error('Error al obtener inscripciones');
        }

        const data = await response.json();

        if (data.success) {
          setInscripciones(data.data);
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

    obtenerInscripciones();
  }, []);

  // Formatear fecha
  const formatearFecha = (fecha) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Calcular días restantes
  const calcularDiasRestantes = (fechaCierre) => {
    const hoy = new Date();
    const cierre = new Date(fechaCierre);
    const diferencia = cierre - hoy;
    const dias = Math.ceil(diferencia / (1000 * 60 * 60 * 24));
    return dias;
  };

  // LOADING
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando tus inscripciones...</p>
        </div>
      </div>
    );
  }

  // ERROR
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="text-red-600 text-5xl mb-4 text-center">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 text-center mb-2">Error</h1>
          <p className="text-gray-600 text-center">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // SIN INSCRIPCIONES
  if (inscripciones.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-4xl mb-4">📋</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Sin inscripciones</h1>
          <p className="text-gray-600 mb-6">Aún no te has inscrito en ninguna convocatoria</p>
          <a
            href="/convocatorias"
            className="inline-block bg-indigo-600 text-white py-2 px-6 rounded-lg hover:bg-indigo-700 transition font-medium"
          >
            Ver Convocatorias
          </a>
        </div>
      </div>
    );
  }

  // MOSTRAR INSCRIPCIONES
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Mis Inscripciones</h1>
          <p className="text-gray-600 text-lg">
            Aquí puedes ver todas las convocatorias en las que te has inscrito
          </p>
        </div>

        {/* Tabla de Inscripciones */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Convocatoria</th>
                  <th className="px-6 py-4 text-left font-semibold">Fecha de Inscripción</th>
                  <th className="px-6 py-4 text-left font-semibold">Fecha de Cierre</th>
                  <th className="px-6 py-4 text-left font-semibold">Días Restantes</th>
                  <th className="px-6 py-4 text-left font-semibold">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {inscripciones.map((inscripcion, index) => {
                  const diasRestantes = calcularDiasRestantes(inscripcion.fechaCierre);
                  const estaVigente = diasRestantes > 0;

                  return (
                    <tr
                      key={inscripcion.idInscripcion}
                      className={`hover:bg-gray-50 transition ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-800">
                          {inscripcion.nombreConvocatoria}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {formatearFecha(inscripcion.fecha)}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {formatearFecha(inscripcion.fechaCierre)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            estaVigente
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {estaVigente ? `${diasRestantes} días` : 'Expirada'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                          {inscripcion.estado}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Botón para volver a convocatorias */}
        <div className="mt-8 text-center">
          <a
            href="/convocatorias"
            className="inline-block bg-indigo-600 text-white py-3 px-8 rounded-lg hover:bg-indigo-700 transition font-medium"
          >
            ← Volver a Convocatorias
          </a>
        </div>
      </div>
    </div>
  );
};

export default MisInscripciones;