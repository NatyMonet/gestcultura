import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef, useContext } from 'react';
import {
  Compass,
  FileText,
  ShieldCheck,
  LogIn,
  LogOut,
  User,
  Menu,
  X,
  HeartHandshake,
  HelpCircle,
  Sparkles,
  ChevronDown,
  ArrowRight,
  Settings,
} from 'lucide-react';
import Swal from 'sweetalert2';
import { ModoEmpaticContext } from '../context/ModoEmpatico';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { modoEmpatico } = useContext(ModoEmpaticContext);
  const isWarm = modoEmpatico;

  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  const usuarioGuardado = localStorage.getItem('usuario');
  const usuario = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
  // Solo los administradores (idRol = 1) ven el Panel de Administración
  const esAdmin = usuario && Number(usuario.idRol) === 1;

  const rutasNavbar = ['/convocatorias', '/mis-inscripciones', '/convocatoria', '/perfil', '/login', '/registro', '/panel-evaluacion', '/panel-admin'];
  const mostrarNavbar = rutasNavbar.some((ruta) => location.pathname.startsWith(ruta));

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  if (!mostrarNavbar) {
    return null;
  }

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path);

  const irA = (ruta) => {
    navigate(ruta);
    setMenuOpen(false);
  };

  const proximamente = (titulo) => {
    setMenuOpen(false);
    Swal.fire({
      icon: 'info',
      title: titulo,
      text: 'Este módulo estará disponible muy pronto. 🐾',
      confirmButtonText: 'Entendido',
    });
  };

  const handleLogout = () => {
    setMenuOpen(false);
    Swal.fire({
      title: '¿Cerrar sesión?',
      text: 'Se eliminará tu sesión actual',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('usuario');
        localStorage.removeItem('token');
        Swal.fire({
          icon: 'success',
          title: 'Sesión cerrada',
          text: 'Hasta luego, ' + (usuario?.nombre || 'Usuario'),
          confirmButtonText: 'OK',
        }).then(() => {
          navigate('/convocatorias');
        });
      }
    });
  };

  return (
    <div
      className={`w-full border-b-2 relative transition-colors ${
        isWarm
          ? 'bg-[#FFF7EF] border-[#2B1600] text-[#2B1600]'
          : 'bg-[#FAF5FF] border-[#E9D5FF] text-[#2E1065]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">

        <div
          onClick={() => navigate('/convocatorias')}
          className="flex items-center gap-3 cursor-pointer group select-none"
          role="button"
          tabIndex={0}
          aria-label="Ir al inicio de Convocatorias"
          onKeyDown={(e) => e.key === 'Enter' && navigate('/convocatorias')}
        >
          <div className={`p-2.5 rounded-xl border-2 transition-transform group-hover:scale-105 ${
            isWarm ? 'bg-[#C75000] text-white border-[#2B1600]' : 'bg-[#7C3AED] text-white border-[#6D28D9]'
          }`}>
            <HeartHandshake className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg sm:text-xl font-extrabold tracking-tight">
                Gestión Empática
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                isWarm ? 'border-[#2B1600] bg-white text-[#2B1600]' : 'border-purple-300 bg-purple-100 text-purple-800'
              }`}>
                Portal Oficial
              </span>
            </div>
            <p className="text-xs font-medium opacity-85 leading-tight">
              Becas y Estímulos Culturales para Todos
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3" ref={dropdownRef}>

          <nav className="hidden lg:flex items-center gap-2" aria-label="Navegación principal">
            <button
              onClick={() => navigate('/convocatorias')}
              className={`px-3 py-2 rounded-xl text-sm font-extrabold flex items-center gap-2 transition-all border-2 ${
                isActive('/convocatorias')
                  ? isWarm ? 'bg-[#C75000] text-white border-[#2B1600] shadow-sm' : 'bg-purple-100 text-purple-900 border-purple-600 shadow-sm'
                  : isWarm ? 'border-transparent hover:border-[#2B1600]/30 hover:bg-black/5 text-[#2B1600]' : 'border-transparent hover:bg-purple-100/50 text-purple-950 opacity-85'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Convocatorias</span>
            </button>

            <button
              onClick={() => navigate('/mis-inscripciones')}
              className={`px-3 py-2 rounded-xl text-sm font-extrabold flex items-center gap-2 transition-all border-2 ${
                isActive('/mis-inscripciones')
                  ? isWarm ? 'bg-[#C75000] text-white border-[#2B1600] shadow-sm' : 'bg-purple-100 text-purple-900 border-purple-600 shadow-sm'
                  : isWarm ? 'border-transparent hover:border-[#2B1600]/30 hover:bg-black/5 text-[#2B1600]' : 'border-transparent hover:bg-purple-100/50 text-purple-950 opacity-85'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Mis Solicitudes</span>
            </button>

            <button
              onClick={() => irA('/panel-evaluacion')}
              className={`px-3 py-2 rounded-xl text-sm font-extrabold flex items-center gap-2 transition-all border-2 ${
                isWarm ? 'border-transparent hover:border-[#2B1600]/30 hover:bg-black/5 text-[#2B1600]' : 'border-transparent hover:bg-purple-100/50 text-purple-950 opacity-85'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Panel Evaluación</span>
            </button>

            {esAdmin && (
              <button
                onClick={() => irA('/panel-admin')}
                className={`px-3 py-2 rounded-xl text-sm font-extrabold flex items-center gap-2 transition-all border-2 ${
                  isActive('/panel-admin')
                    ? isWarm ? 'bg-[#C75000] text-white border-[#2B1600] shadow-sm' : 'bg-purple-100 text-purple-900 border-purple-600 shadow-sm'
                    : isWarm ? 'border-transparent hover:border-[#2B1600]/30 hover:bg-black/5 text-[#2B1600]' : 'border-transparent hover:bg-purple-100/50 text-purple-950 opacity-85'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Panel Admin</span>
              </button>
            )}
          </nav>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`px-3.5 py-2 rounded-xl font-black text-sm sm:text-base flex items-center gap-2 border-2 transition-all shadow-sm ${
              menuOpen
                ? isWarm ? 'bg-[#2B1600] text-white border-[#2B1600]' : 'bg-purple-900 text-white border-purple-950'
                : isWarm ? 'bg-white border-[#2B1600] text-[#2B1600] hover:bg-amber-100/60' : 'bg-white border-purple-300 text-purple-950 hover:bg-purple-50'
            }`}
            aria-label="Abrir menú de opciones"
            aria-expanded={menuOpen}
            aria-haspopup="true"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            <span className="tracking-wide">Menú</span>
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`} />
          </button>

          <div className="hidden sm:flex items-center gap-2">
            {usuario ? (
              <div className="flex items-center gap-2">
                <div
                  onClick={() => navigate('/perfil')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 cursor-pointer transition-all ${
                    isWarm ? 'border-[#2B1600] bg-white text-[#2B1600] hover:bg-amber-50/50' : 'border-purple-200 bg-white hover:bg-purple-50'
                  }`}
                  title="Ver perfil"
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                    isWarm ? 'bg-[#C75000] text-white' : 'bg-[#7C3AED] text-white'
                  }`}>
                    {(usuario?.nombre || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left leading-tight">
                    <p className="text-xs font-bold leading-none">{usuario?.nombre || 'Usuario'}</p>
                    <p className="text-[10px] opacity-75">Postulante</p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className={`p-2 rounded-xl border-2 transition-colors ${
                    isWarm ? 'border-[#2B1600] hover:bg-rose-50 text-rose-700 bg-white' : 'border-purple-200 hover:bg-rose-50 text-rose-700'
                  }`}
                  title="Cerrar sesión"
                  aria-label="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className={`px-4 py-2 rounded-xl text-sm font-extrabold flex items-center gap-2 border-2 transition-all shadow-sm ${
                  isWarm ? 'bg-[#C75000] text-white border-[#2B1600] hover:bg-[#A93F00]' : 'bg-[#7C3AED] text-white border-[#6D28D9] hover:bg-[#6D28D9]'
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>Ingresar</span>
              </button>
            )}
          </div>

          {menuOpen && (
            <div
              className={`absolute right-4 sm:right-6 top-full mt-2 w-[calc(100vw-2rem)] sm:w-96 rounded-2xl shadow-2xl border-3 p-3 sm:p-4 space-y-2 z-50 ${
                isWarm ? 'bg-white border-[#2B1600] text-[#2B1600]' : 'bg-white border-purple-300 text-purple-950'
              }`}
              style={{ borderWidth: '3px' }}
              role="menu"
            >
              <div className="flex items-center justify-between px-3 py-2 border-b-2 border-current/15 mb-1">
                <span className="text-xs font-black uppercase tracking-wider opacity-75">Menú Principal</span>
                <span className={`text-[11px] font-black px-2 py-0.5 rounded-full border ${
                  isWarm ? 'bg-[#FFF7EF] border-[#2B1600] text-[#2B1600]' : 'bg-purple-100 border-purple-300 text-purple-800'
                }`}>Accesible</span>
              </div>

              <button
                role="menuitem"
                onClick={() => irA('/convocatorias')}
                className={`w-full text-left p-3.5 rounded-xl flex items-center justify-between border-2 transition-all group ${
                  isActive('/convocatorias')
                    ? isWarm ? 'bg-[#FFF7EF] border-[#2B1600] font-black' : 'bg-purple-100 border-purple-600 font-black'
                    : isWarm ? 'bg-white border-transparent hover:border-[#2B1600] hover:bg-[#FFF7EF]' : 'bg-white border-transparent hover:border-purple-300 hover:bg-purple-50'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`p-2.5 rounded-xl border-2 shrink-0 ${isWarm ? 'bg-[#C75000] text-white border-[#2B1600]' : 'bg-purple-600 text-white border-purple-800'}`}>
                    <Compass className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-lg sm:text-xl font-black leading-tight">Convocatorias</p>
                    <p className="text-xs font-medium opacity-80 mt-0.5">Consultar y postular proyectos culturales</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </button>

              <button
                role="menuitem"
                onClick={() => irA('/mis-inscripciones')}
                className={`w-full text-left p-3.5 rounded-xl flex items-center justify-between border-2 transition-all group ${
                  isActive('/mis-inscripciones')
                    ? isWarm ? 'bg-[#FFF7EF] border-[#2B1600] font-black' : 'bg-purple-100 border-purple-600 font-black'
                    : isWarm ? 'bg-white border-transparent hover:border-[#2B1600] hover:bg-[#FFF7EF]' : 'bg-white border-transparent hover:border-purple-300 hover:bg-purple-50'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`p-2.5 rounded-xl border-2 shrink-0 ${isWarm ? 'bg-[#C75000] text-white border-[#2B1600]' : 'bg-purple-600 text-white border-purple-800'}`}>
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-lg sm:text-xl font-black leading-tight">Mis Solicitudes</p>
                    <p className="text-xs font-medium opacity-80 mt-0.5">Consultar radicados y estado de trámites</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </button>

              <button
                role="menuitem"
                onClick={() => irA('/panel-evaluacion')}
                className={`w-full text-left p-3.5 rounded-xl flex items-center justify-between border-2 transition-all group ${
                  isWarm ? 'bg-white border-transparent hover:border-[#2B1600] hover:bg-[#FFF7EF]' : 'bg-white border-transparent hover:border-purple-300 hover:bg-purple-50'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="p-2.5 rounded-xl border-2 shrink-0 bg-emerald-600 text-white border-emerald-800">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-lg sm:text-xl font-black leading-tight">Panel de Evaluación</p>
                    <p className="text-xs font-medium opacity-80 mt-0.5">Revisión y validación de jurados oficiales</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </button>

              {esAdmin && (
                <button
                  role="menuitem"
                  onClick={() => irA('/panel-admin')}
                  className={`w-full text-left p-3.5 rounded-xl flex items-center justify-between border-2 transition-all group ${
                    isActive('/panel-admin')
                      ? isWarm ? 'bg-[#FFF7EF] border-[#2B1600] font-black' : 'bg-purple-100 border-purple-600 font-black'
                      : isWarm ? 'bg-white border-transparent hover:border-[#2B1600] hover:bg-[#FFF7EF]' : 'bg-white border-transparent hover:border-purple-300 hover:bg-purple-50'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="p-2.5 rounded-xl border-2 shrink-0 bg-indigo-600 text-white border-indigo-800">
                      <Settings className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-lg sm:text-xl font-black leading-tight">Panel de Administración</p>
                      <p className="text-xs font-medium opacity-80 mt-0.5">Crear, editar y eliminar convocatorias</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </button>
              )}

              <button
                role="menuitem"
                onClick={() => proximamente('Asistente Monet')}
                className={`w-full text-left p-3.5 rounded-xl flex items-center justify-between border-2 transition-all group ${
                  isWarm ? 'bg-amber-50/80 border-[#2B1600] hover:bg-amber-100' : 'bg-purple-50 border-purple-300 hover:bg-purple-100'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`p-2.5 rounded-xl border-2 shrink-0 ${isWarm ? 'bg-[#C75000] text-white border-[#2B1600]' : 'bg-purple-700 text-white border-purple-900'}`}>
                    <HelpCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-lg sm:text-xl font-black leading-tight">Ayuda</p>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${isWarm ? 'bg-white text-[#C75000] border-[#2B1600]' : 'bg-purple-200 text-purple-900 border-purple-400'}`}>Monet 🐾</span>
                    </div>
                    <p className="text-xs font-medium opacity-80 mt-0.5">Asistente empático, preguntas frecuentes y voz</p>
                  </div>
                </div>
                <Sparkles className="w-5 h-5 text-amber-600 group-hover:rotate-12 transition-transform" />
              </button>

              <div className="pt-2 border-t-2 border-current/15">
                {usuario ? (
                  <div className="flex items-center justify-between p-2 rounded-xl bg-black/5">
                    <div className="flex items-center gap-2">
                      <User className={`w-5 h-5 ${isWarm ? 'text-[#C75000]' : 'text-purple-600'}`} />
                      <div>
                        <p className="font-bold text-sm leading-tight">{usuario?.nombre || 'Usuario'}</p>
                        <p className="text-[11px] opacity-70">{usuario?.correo || ''}</p>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="text-xs font-bold text-rose-700 px-3 py-1.5 rounded-lg border border-rose-300 bg-white hover:bg-rose-50"
                    >
                      Salir
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => irA('/login')}
                    className={`w-full py-3 rounded-xl text-white font-extrabold text-center flex items-center justify-center gap-2 border-2 ${
                      isWarm ? 'bg-[#C75000] border-[#2B1600]' : 'bg-[#7C3AED] border-[#6D28D9]'
                    }`}
                  >
                    <LogIn className="w-5 h-5" />
                    <span className="text-base">Iniciar Sesión / Registro</span>
                  </button>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Navbar;