import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ModoEmpaticContext } from '../context/ModoEmpatico';
import Swal from 'sweetalert2';
import {
  Search,
  Calendar,
  Users,
  Award,
  ArrowRight,
  Sparkles,
  FileCheck2,
  BookOpen,
  Film,
  Palette,
  Heart,
  CheckCircle2,
  X,
  Clock,
  Loader,
} from 'lucide-react';

export default function Convocatorias() {
  const { modoEmpatico } = useContext(ModoEmpaticContext);
  const isWarm = modoEmpatico;
  const navigate = useNavigate();

  const [convocatorias, setConvocatorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [detailModalConv, setDetailModalConv] = useState(null);
  const [inscribiendose, setInscribiendose] = useState(false);

  const categories = ['Todas', 'Ficción', 'Impacto Social', 'Apreciación', 'Creación', 'Literatura'];

  useEffect(() => {
    const fetchConvocatorias = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/convocatorias');
        const data = await response.json();

        if (data.success) {
          const convocatoriasFormateadas = data.data.map((conv) => ({
            id: conv.idConvocatoria,
            idConvocatoria: conv.idConvocatoria,
            title: conv.nombre,
            description: conv.descripcion || 'Convocatoria de inscripción abierta',
            fullDescription: conv.descripcion || 'Detalles de la convocatoria',
            category: 'Ficción',
            imageUrl: null,
            closeDate: new Date(conv.fechaCierre).toLocaleDateString('es-CO'),
            cupos: conv.cupos || 'Varios',
            budget: 'Por definir',
            requirements: [
              'Ser mayor de 18 años',
              'Cumplir con los requisitos específicos de la convocatoria',
              'Enviar la documentación solicitada',
            ],
            stages: [
              'Inscripción',
              'Revisión de documentos',
              'Selección',
              'Comunicación de resultados',
            ],
            estado: conv.estado,
            fechaCierre: conv.fechaCierre,
          }));

          setConvocatorias(convocatoriasFormateadas);
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudieron cargar las convocatorias',
          });
        }
      } catch (error) {
        console.error('Error fetching convocatorias:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error de conexión',
          text: 'No se pudo conectar al servidor',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchConvocatorias();
  }, []);

  const filteredConvocatorias = convocatorias.filter((conv) => {
    const matchesCat = selectedCategory === 'Todas' || conv.category === selectedCategory;
    const matchesSearch =
      conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleInscribirse = async (convocatoria) => {
    const usuario = JSON.parse(localStorage.getItem('usuario'));

    if (!usuario) {
      Swal.fire({
        icon: 'warning',
        title: 'Sesión requerida',
        text: 'Debes iniciar sesión para inscribirte',
      });
      navigate('/login');
      return;
    }

    setInscribiendose(true);

    try {
      const response = await fetch('http://localhost:5000/api/inscripciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idUsuario: usuario.idUsuario,
          idConvocatoria: convocatoria.idConvocatoria,
          motivacion: '',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Inscripción exitosa',
          text: `Te has inscrito en: ${convocatoria.title}`,
        });
        navigate('/mis-inscripciones');
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error en inscripción',
          text: data.message || 'No se pudo completar la inscripción',
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error de conexión',
        text: 'No se pudo procesar tu inscripción',
      });
    } finally {
      setInscribiendose(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-12 h-12 animate-spin text-purple-600" />
          <p className="text-lg font-semibold">Cargando convocatorias...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <section
        aria-label="Presentación del portal"
        className={`p-6 sm:p-10 rounded-3xl border-3 shadow-sm relative overflow-hidden transition-all ${
          isWarm
            ? 'bg-[#FFF7EF] border-[#2B1600] text-[#2B1600]'
            : 'bg-gradient-to-br from-purple-50 via-white to-purple-100 border-purple-300 text-purple-950'
        }`}
        style={{ borderWidth: '3px' }}
      >
        <div className="max-w-3xl relative z-10 space-y-4">
          <div
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border-2 text-xs font-black uppercase tracking-wider ${
              isWarm
                ? 'bg-white border-[#2B1600] text-[#2B1600]'
                : 'bg-white border-[#6D28D9] text-[#4A148C]'
            }`}
          >
            <Sparkles className={`w-4 h-4 ${isWarm ? 'text-[#C75000]' : 'text-[#4A148C]'}`} />
            <span>Convocatorias Abiertas 2026</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Encuentra tu beca o estímulo cultural con acompañamiento empático
          </h1>

          <p className="text-sm sm:text-base opacity-90 leading-relaxed max-w-2xl font-medium">
            Diseñamos un proceso de postulación 100% claro, accesible y sin trámites engorrosos.
            Nuestro equipo te guía paso a paso para que tu proyecto reciba el apoyo que merece.
          </p>
        </div>

        <div className="hidden lg:block absolute -right-6 -bottom-10 opacity-15 pointer-events-none">
          <Film className="w-64 h-64" />
        </div>
      </section>

      <section aria-label="Búsqueda y filtros de convocatorias" className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          <div className="relative flex-1 max-w-xl">
            <Search
              className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
                isWarm ? 'text-[#2B1600]' : 'text-purple-600'
              }`}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre, disciplina, categoría..."
              className={`w-full pl-12 pr-10 py-3.5 rounded-2xl text-sm font-semibold border-3 outline-none transition-all ${
                isWarm
                  ? 'bg-white text-[#2B1600] border-[#2B1600] placeholder:text-[#2B1600]/60 focus:border-[#FACC15] focus:ring-2 focus:ring-[#FACC15] shadow-sm'
                  : 'bg-white text-purple-950 border-purple-200 placeholder:text-purple-400 focus:border-purple-600 shadow-sm'
              }`}
              style={{ borderWidth: '3px' }}
              aria-label="Buscar convocatorias"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-black/10 text-xs font-bold"
                aria-label="Limpiar búsqueda"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div
            className={`text-xs font-black px-3 py-2 rounded-xl border-2 self-start md:self-center ${
              isWarm ? 'border-[#2B1600] bg-white text-[#2B1600]' : 'border-current/20'
            }`}
          >
            {filteredConvocatorias.length} {filteredConvocatorias.length === 1 ? 'convocatoria encontrada' : 'convocatorias encontradas'}
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin" role="tablist">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold whitespace-nowrap transition-all border-3 flex items-center gap-2 ${
                  isSelected
                    ? isWarm
                      ? 'bg-[#C75000] text-white border-[#2B1600] shadow-sm scale-102'
                      : 'bg-[#7C3AED] text-white border-[#6D28D9] shadow-sm scale-102'
                    : isWarm
                    ? 'bg-white text-[#2B1600] border-[#2B1600] hover:bg-amber-50'
                    : 'bg-white text-purple-950 border-purple-200 hover:border-purple-400'
                }`}
                style={{ borderWidth: '3px' }}
                role="tab"
                aria-selected={isSelected}
              >
                {cat === 'Ficción' && <Film className="w-4 h-4" />}
                {cat === 'Impacto Social' && <Heart className="w-4 h-4" />}
                {cat === 'Apreciación' && <BookOpen className="w-4 h-4" />}
                {cat === 'Creación' && <Palette className="w-4 h-4" />}
                {cat === 'Literatura' && <FileCheck2 className="w-4 h-4" />}
                {cat === 'Todas' && <Sparkles className="w-4 h-4" />}
                <span>{cat}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section
        aria-label="Lista de convocatorias disponibles"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        {filteredConvocatorias.map((conv) => (
          <article
            key={conv.id}
            className={`rounded-2xl border-3 flex flex-col overflow-hidden transition-all hover:shadow-lg ${
              isWarm
                ? 'bg-white border-[#2B1600] text-[#2B1600]'
                : 'bg-white border-purple-200 text-purple-950'
            }`}
            style={{ borderWidth: '3px' }}
          >
            <div
              className={`h-40 relative flex items-center justify-center text-4xl font-extrabold ${
                isWarm
                  ? 'bg-[#FFF7EF] border-b-3 border-[#2B1600]'
                  : 'bg-gradient-to-br from-purple-100 to-purple-50 border-b-3 border-purple-200'
              }`}
            >
              <div className="text-center space-y-1">
                <div className={`text-5xl ${isWarm ? 'text-[#C75000]' : 'text-purple-600'}`}>🎬</div>
                <p className="text-xs font-bold opacity-75">{conv.category}</p>
              </div>
            </div>

            <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg sm:text-xl font-extrabold leading-tight">{conv.title}</h3>
                <p className="text-xs sm:text-sm opacity-85 line-clamp-3 font-medium leading-relaxed">
                  {conv.description}
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-current/10 text-xs font-bold">
                <div className="flex items-center gap-2">
                  <Calendar
                    className={`w-4 h-4 ${isWarm ? 'text-[#C75000]' : 'text-purple-600'} shrink-0`}
                  />
                  <span>
                    Cierre: <strong className="font-extrabold">{conv.closeDate}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users
                    className={`w-4 h-4 ${isWarm ? 'text-[#C75000]' : 'text-purple-600'} shrink-0`}
                  />
                  <span>
                    Cupos: <strong>{conv.cupos}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Award
                    className={`w-4 h-4 ${isWarm ? 'text-[#C75000]' : 'text-purple-600'} shrink-0`}
                  />
                  <span className="truncate">
                    Estímulo: <strong>{conv.budget}</strong>
                  </span>
                </div>
              </div>

              <div className="pt-3 space-y-2">
                <button
                  onClick={() => handleInscribirse(conv)}
                  disabled={inscribiendose}
                  className={`w-full min-h-[52px] py-3 px-4 rounded-2xl font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 border-3 transition-transform active:scale-98 shadow-md disabled:opacity-50 ${
                    isWarm
                      ? 'bg-[#C75000] text-white border-[#2B1600] hover:bg-[#A93F00]'
                      : 'bg-[#7C3AED] text-white border-[#6D28D9] hover:bg-[#6D28D9]'
                  }`}
                  style={{ borderWidth: '3px' }}
                  aria-label={`Inscribirme a la convocatoria ${conv.title}`}
                >
                  <span>Inscribirme</span>
                  <ArrowRight className="w-5 h-5" />
                </button>

                <button
                  onClick={() => setDetailModalConv(conv)}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold border-2 transition-colors flex items-center justify-center gap-1.5 ${
                    isWarm
                      ? 'border-[#2B1600] hover:bg-amber-50 text-[#2B1600] bg-white font-extrabold'
                      : 'border-purple-200 hover:bg-purple-50 text-purple-900'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Ver requisitos</span>
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>

      {filteredConvocatorias.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg font-semibold opacity-70">No se encontraron convocatorias</p>
        </div>
      )}

      {detailModalConv && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-conv-title"
        >
          <div
            className={`w-full max-w-2xl rounded-3xl border-3 shadow-2xl p-6 sm:p-8 space-y-6 animate-in zoom-in-95 my-8 max-h-[90vh] overflow-y-auto ${
              isWarm
                ? 'bg-[#FFF7EF] border-[#2B1600] text-[#2B1600]'
                : 'bg-white border-purple-300 text-purple-950'
            }`}
            style={{ borderWidth: '3px' }}
          >
            <div className="flex items-start justify-between gap-4 border-b border-current/15 pb-4">
              <div>
                <span
                  className={`text-xs font-black uppercase px-2.5 py-1 rounded-full border-2 ${
                    isWarm ? 'bg-white border-[#2B1600] text-[#2B1600]' : 'border-current'
                  }`}
                >
                  {detailModalConv.category}
                </span>
                <h2 id="modal-conv-title" className="text-xl sm:text-2xl font-extrabold mt-2">
                  {detailModalConv.title}
                </h2>
              </div>
              <button
                onClick={() => setDetailModalConv(null)}
                className="p-2 rounded-full hover:bg-black/10 transition-colors"
                aria-label="Cerrar modal de convocatoria"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-3 text-sm font-medium leading-relaxed">
              <h4 className="font-extrabold text-base">Descripción Completa</h4>
              <p className="opacity-90">{detailModalConv.fullDescription}</p>
            </div>

            <div className="space-y-3">
              <h4 className="font-extrabold text-base flex items-center gap-2">
                <FileCheck2 className={`w-5 h-5 ${isWarm ? 'text-[#C75000]' : 'text-purple-600'}`} />
                <span>Requisitos de Postulación</span>
              </h4>
              <ul className="space-y-2 text-sm font-medium">
                {detailModalConv.requirements.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-extrabold text-base flex items-center gap-2">
                <Clock className={`w-5 h-5 ${isWarm ? 'text-[#C75000]' : 'text-purple-600'}`} />
                <span>Etapas del Proceso</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-bold">
                {detailModalConv.stages.map((stage, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border-2 flex items-center gap-2 ${
                      isWarm ? 'bg-white border-[#2B1600]' : 'bg-black/5 border-current/20'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full text-white flex items-center justify-center text-xs font-black shrink-0 ${
                        isWarm ? 'bg-[#C75000]' : 'bg-purple-600'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span>{stage}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-current/15 flex flex-col sm:flex-row gap-3 justify-end">
              <button
                onClick={() => setDetailModalConv(null)}
                className={`py-3 px-6 rounded-xl border-2 font-bold text-sm ${
                  isWarm
                    ? 'border-[#2B1600] bg-white text-[#2B1600] hover:bg-black/5'
                    : 'hover:bg-black/5'
                }`}
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  setDetailModalConv(null);
                  handleInscribirse(detailModalConv);
                }}
                disabled={inscribiendose}
                className={`py-3 px-8 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 border-2 disabled:opacity-50 ${
                  isWarm
                    ? 'bg-[#C75000] text-white border-[#2B1600] hover:bg-[#A93F00]'
                    : 'bg-[#7C3AED] text-white border-[#6D28D9]'
                }`}
              >
                <span>Postularme Ahora</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}