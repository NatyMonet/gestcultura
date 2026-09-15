import { useNavigate, useLocation } from 'react-router-dom';
import { useContext, useState } from 'react';
import { HeartHandshake } from 'lucide-react';
import Swal from 'sweetalert2';
import { ModoEmpaticContext } from '../context/ModoEmpatico';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { modoEmpatico, toggleModo } = useContext(ModoEmpaticContext);
  const [menuOpen, setMenuOpen] = useState(false);

  const usuarioGuardado = localStorage.getItem('usuario');
  const usuario = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;

  const handleLogout = () => {
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

  const rutasNavbar = ['/convocatorias', '/mis-inscripciones', '/convocatoria', '/perfil'];
  const mostrarNavbar = rutasNavbar.some((ruta) => location.pathname.startsWith(ruta));

  if (!mostrarNavbar) {
    return null;
  }

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path);

  const colorsPaleta = modoEmpatico ? {
    bg: '#FFF7EF',
    texto: '#2B1600',
    btnActivo: '#C75000',
    btnActivoBg: 'rgba(199, 80, 0, 0.15)',
    btnInactivo: '#2B1600',
    bordes: '3px solid #2B1600',
  } : null;

  const getNavStyle = () => {
    if (!modoEmpatico) return null;
    return {
      backgroundColor: colorsPaleta.bg,
      borderBottom: colorsPaleta.bordes,
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    };
  };

  const getLogoStyle = () => {
    if (!modoEmpatico) return null;
    return {
      color: colorsPaleta.texto,
      borderRadius: '8px',
      padding: '8px 12px',
      cursor: 'pointer',
      border: colorsPaleta.bordes,
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    };
  };

  const getBtnStyle = (activo) => {
    if (!modoEmpatico) return null;
    return {
      color: activo ? colorsPaleta.btnActivo : colorsPaleta.btnInactivo,
      backgroundColor: activo ? colorsPaleta.btnActivoBg : 'transparent',
      border: `3px solid ${activo ? colorsPaleta.btnActivo : colorsPaleta.btnInactivo}`,
      borderRadius: '8px',
      padding: '8px 12px',
      fontWeight: '600',
      fontSize: '1rem',
      cursor: 'pointer',
    };
  };

  const getToggleBtnStyle = () => {
    if (!modoEmpatico) return null;
    return {
      backgroundColor: colorsPaleta.btnActivoBg,
      color: colorsPaleta.btnActivo,
      border: `3px solid ${colorsPaleta.btnActivo}`,
      borderRadius: '8px',
      padding: '8px 12px',
      fontWeight: '600',
      cursor: 'pointer',
    };
  };

  const getLogoutBtnStyle = () => {
    if (!modoEmpatico) return null;
    return {
      backgroundColor: '#C75000',
      color: '#FFF7EF',
      border: '3px solid #2B1600',
      borderRadius: '8px',
      padding: '8px 12px',
      fontWeight: '600',
      cursor: 'pointer',
    };
  };

  const getIngresarBtnStyle = () => {
    if (!modoEmpatico) return null;
    return {
      backgroundColor: colorsPaleta.btnActivo,
      color: '#FFF7EF',
      border: '3px solid #2B1600',
      borderRadius: '8px',
      padding: '8px 12px',
      fontWeight: '600',
      cursor: 'pointer',
    };
  };

  const logoBadgeStyle = {
    width: modoEmpatico ? '44px' : '40px',
    height: modoEmpatico ? '44px' : '40px',
    borderRadius: '12px',
    background: modoEmpatico ? '#C75000' : 'rgba(255,255,255,0.18)',
    color: '#fff',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  };

  return (
    <nav
      style={getNavStyle()}
      className={!modoEmpatico ? 'bg-gradient-to-r from-purple-600 to-purple-700 shadow-lg sticky top-0 z-50' : ''}
    >
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${modoEmpatico ? 'py-3' : 'py-0'}`}>
        <div className={`flex justify-between items-center ${modoEmpatico ? 'h-20' : 'h-16'}`}>

          <div
            onClick={() => navigate('/convocatorias')}
            style={getLogoStyle()}
            className={!modoEmpatico ? 'flex items-center gap-3 cursor-pointer hover:opacity-80 transition rounded-lg px-3 py-2' : ''}
          >
            <span style={logoBadgeStyle}>
              <HeartHandshake className={modoEmpatico ? 'w-7 h-7' : 'w-6 h-6'} />
            </span>
            <div style={modoEmpatico ? { color: colorsPaleta.texto } : {}}>
              <div className={`font-bold ${modoEmpatico ? 'text-xl' : 'text-lg'} leading-tight`}>
                Gestión Empática
              </div>
              <div className="text-xs font-semibold" style={modoEmpatico ? { color: colorsPaleta.texto, opacity: 0.7 } : {}}>
                GestCultura SENA
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => navigate('/convocatorias')}
              style={getBtnStyle(isActive('/convocatorias'))}
              className={!modoEmpatico ? `px-4 py-2 rounded-lg font-semibold transition ${isActive('/convocatorias') ? 'bg-white text-purple-600' : 'text-white hover:bg-purple-500'}` : ''}
            >
              Convocatorias
            </button>

            {usuario && (
              <>
                <button
                  onClick={() => navigate('/mis-inscripciones')}
                  style={getBtnStyle(isActive('/mis-inscripciones'))}
                  className={!modoEmpatico ? `px-4 py-2 rounded-lg font-semibold transition ${isActive('/mis-inscripciones') ? 'bg-white text-purple-600' : 'text-white hover:bg-purple-500'}` : ''}
                >
                  Mis Solicitudes
                </button>

                <button
                  onClick={() => navigate('/perfil')}
                  style={getBtnStyle(isActive('/perfil'))}
                  className={!modoEmpatico ? `px-4 py-2 rounded-lg font-semibold transition ${isActive('/perfil') ? 'bg-white text-purple-600' : 'text-white hover:bg-purple-500'}` : ''}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                    <span
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        background: modoEmpatico ? '#C75000' : '#ffffff',
                        color: modoEmpatico ? '#ffffff' : '#6A1B9A',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        marginRight: '8px',
                        flexShrink: 0,
                      }}
                    >
                      {(usuario?.nombre || 'U').charAt(0).toUpperCase()}
                    </span>
                    Perfil
                  </span>
                </button>
              </>
            )}
          </div>

          <div className="hidden md:flex items-center gap-4">


            {usuario ? (
              <>
                <div style={modoEmpatico ? { color: colorsPaleta.texto } : { color: 'white' }} className={`${modoEmpatico ? 'text-base' : 'text-sm'}`}>
                  <p className="font-semibold">{usuario?.nombre || 'Usuario'}</p>
                  <p className={`${modoEmpatico ? 'text-sm font-semibold' : 'text-xs'}`}
                     style={modoEmpatico ? { color: colorsPaleta.texto, opacity: 0.7 } : {}}>
                    {usuario?.correo || 'usuario@example.com'}
                  </p>
                </div>

                <button
                  onClick={handleLogout}
                  style={getLogoutBtnStyle()}
                  className={!modoEmpatico ? 'bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition' : ''}
                >
                  🚪 Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate('/login')}
                style={getIngresarBtnStyle()}
                className={!modoEmpatico ? 'bg-white text-purple-700 px-4 py-2 rounded-lg font-semibold hover:opacity-80 transition' : ''}
              >
                🔓 Ingresar
              </button>
            )}
          </div>

          <div className="md:hidden flex items-center space-x-2">

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="hover:opacity-80 p-2 rounded-lg transition"
              style={modoEmpatico ? { color: colorsPaleta.texto } : { color: 'white' }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {menuOpen && (
          <div
            style={modoEmpatico ? {
              backgroundColor: colorsPaleta.btnActivoBg,
              borderRadius: '8px',
              border: colorsPaleta.bordes,
              marginTop: '12px',
              padding: '16px',
            } : {}}
            className={!modoEmpatico ? 'bg-purple-500 rounded-lg mt-2 p-4 space-y-2' : 'space-y-2'}
          >
            <button
              onClick={() => { navigate('/convocatorias'); setMenuOpen(false); }}
              style={getBtnStyle(isActive('/convocatorias'))}
              className={!modoEmpatico ? `w-full text-left px-4 py-2 rounded-lg font-semibold transition ${isActive('/convocatorias') ? 'bg-white text-purple-600' : 'text-white hover:bg-purple-600'}` : 'w-full text-left'}
            >
              Convocatorias
            </button>

            {usuario ? (
              <>
                <button
                  onClick={() => { navigate('/mis-inscripciones'); setMenuOpen(false); }}
                  style={getBtnStyle(isActive('/mis-inscripciones'))}
                  className={!modoEmpatico ? `w-full text-left px-4 py-2 rounded-lg font-semibold transition ${isActive('/mis-inscripciones') ? 'bg-white text-purple-600' : 'text-white hover:bg-purple-600'}` : 'w-full text-left'}
                >
                  Mis Solicitudes
                </button>

                <button
                  onClick={() => { navigate('/perfil'); setMenuOpen(false); }}
                  style={getBtnStyle(isActive('/perfil'))}
                  className={!modoEmpatico ? `w-full text-left px-4 py-2 rounded-lg font-semibold transition ${isActive('/perfil') ? 'bg-white text-purple-600' : 'text-white hover:bg-purple-600'}` : 'w-full text-left'}
                >
                  Perfil
                </button>

                <div className="border-t pt-2 mt-2" style={modoEmpatico ? { borderTopColor: colorsPaleta.btnInactivo } : {}}>
                  <p className="text-sm font-semibold px-4" style={modoEmpatico ? { color: colorsPaleta.texto } : { color: 'white' }}>
                    {usuario?.nombre}
                  </p>
                  <button
                    onClick={() => { handleLogout(); setMenuOpen(false); }}
                    style={getLogoutBtnStyle()}
                    className={!modoEmpatico ? 'w-full text-left px-4 py-2 mt-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition' : 'w-full text-left mt-2 rounded-lg'}
                  >
                    🚪 Logout
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={() => { navigate('/login'); setMenuOpen(false); }}
                style={getIngresarBtnStyle()}
                className={!modoEmpatico ? 'w-full text-left px-4 py-2 mt-2 bg-white text-purple-700 rounded-lg font-semibold transition' : 'w-full text-left mt-2 rounded-lg'}
              >
                🔓 Ingresar
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;