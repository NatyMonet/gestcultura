import { useEffect, useState, useContext } from 'react';
import { ModoEmpaticContext } from '../context/ModoEmpatico';

const MisInscripciones = () => {
  const { modoEmpatico } = useContext(ModoEmpaticContext);
  const isWarm = modoEmpatico;

  const [inscripciones, setInscripciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const obtenerInscripciones = async () => {
      try {
        setLoading(true);
        const usuarioGuardado = localStorage.getItem('usuario');
        if (!usuarioGuardado) {
          setError('Usuario no autenticado');
          setLoading(false);
          return;
        }
        const usuario = JSON.parse(usuarioGuardado);
        const idUsuario = usuario.idUsuario;
        const response = await fetch(`http://localhost:5000/api/inscripciones/usuario/${idUsuario}`);
        if (!response.ok) throw new Error('Error al obtener inscripciones');
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

  const formatearFecha = (fecha) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const calcularDiasRestantes = (fechaCierre) => {
    const hoy = new Date();
    const cierre = new Date(fechaCierre);
    const dias = Math.ceil((cierre - hoy) / (1000 * 60 * 60 * 24));
    return dias;
  };

  const pageBg = isWarm ? 'bg-[#FFF7EF]' : 'bg-gradient-to-br from-purple-50 via-white to-purple-100';
  const btnColor = isWarm ? 'bg-[#C75000] hover:bg-[#A93F00]' : 'bg-purple-600 hover:bg-purple-700';
  const headText = isWarm ? 'text-[#2B1600]' : 'text-purple-950';
  const tableHead = isWarm ? 'bg-[#C75000] text-white' : 'bg-gradient-to-r from-purple-600 to-purple-800 text-white';

  if (loading) {
    return (
      <div className={`min-h-screen ${pageBg} flex items-center justify-center`}>
        <div className="text-center">
          <div className={`inline-block animate-spin rounded-full h-12 w-12 border-b-2 ${isWarm ? 'border-[#C75000]' : 'border-purple-600'} mb-4`}></div>
          <p className={`${headText} text-lg`}>Cargando tus inscripciones...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${pageBg} flex items-center justify-center px-4`}>
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
          <div className="text-red-600 text-5xl mb-4 text-center">⚠️</div>
          <h1 className={`text-2xl font-bold ${headText} text-center mb-2`}>Error</h1>
          <p className="text-gray-600 text-center">{error}</p>
          <button onClick={() => window.location.reload()} className={`mt-6 w-full ${btnColor} text-white py-2 px-4 rounded-lg transition`}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (inscripciones.length === 0) {
    return (
      <div className={`min-h-screen ${pageBg} flex items-center justify-center px-4`}>
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-4xl mb-4">📋</div>
          <h1 className={`text-2xl font-bold ${headText} mb-2`}>Sin solicitudes</h1>
          <p className="text-gray-600 mb-6">Aún no tienes solicitudes registradas convocatoria</p>
          <a href="/convocatorias" className={`inline-block ${btnColor} text-white py-2 px-6 rounded-lg transition font-medium`}>
            Ver Convocatorias
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${pageBg} py-12 px-4`}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <h1 className={`text-4xl font-bold ${headText} mb-2`}>Mis Solicitudes</h1>
          <p className="text-gray-600 text-lg">Aquí puedes ver todas las convocatorias en las que te has inscrito</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={tableHead}>
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
                    <tr key={inscripcion.idInscripcion} className={`hover:bg-purple-50 transition ${index % 2 === 0 ? 'bg-white' : 'bg-purple-50/40'}`}>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-800">{inscripcion.nombreConvocatoria}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{formatearFecha(inscripcion.fecha)}</td>
                      <td className="px-6 py-4 text-gray-600">{formatearFecha(inscripcion.fechaCierre)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${estaVigente ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {estaVigente ? `${diasRestantes} días` : 'Expirada'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
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

        <div className="mt-8 text-center">
          <a href="/convocatorias" className={`inline-block ${btnColor} text-white py-3 px-8 rounded-lg transition font-medium`}>
            ← Volver a Convocatorias
          </a>
        </div>
      </div>
    </div>
  );
};

export default MisInscripciones;