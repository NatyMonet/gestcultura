import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, MapPin, Eye, Heart, Globe } from 'lucide-react';

// Icono de Instagram propio (lucide-react ya no incluye logos de marca).
const IconInstagram = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

// Icono de matraz de laboratorio (representa el programa LabGuion).
const IconMatraz = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M10 2v7.31" />
    <path d="M14 9.3V1.99" />
    <path d="M8.5 2h7" />
    <path d="M14 9.3a6.5 6.5 0 1 1-4 0" />
    <path d="M5.52 16h12.96" />
  </svg>
);

// Icono OFICIAL de WhatsApp (glyph del WhatsApp Brand Resource Center 2026).
const IconWhatsApp = (props) => (
  <svg viewBox="0 0 720 720" fill="currentColor" {...props}>
    <path d="M360,0C161.18,0,0,161.18,0,360c0,65.41,17.45,126.75,47.94,179.61L0,720l187.02-44.21c51.34,28.18,110.28,44.21,172.98,44.21,198.82,0,360-161.18,360-360S558.82,0,360,0ZM360,655.52c-60.17,0-116.13-17.98-162.82-48.87l-110.49,28.14,30.99-105.61c-33.53-47.93-53.2-106.26-53.2-169.19,0-163.21,132.31-295.52,295.52-295.52s295.52,132.31,295.52,295.52-132.31,295.52-295.52,295.52Z" />
    <path d="M444.35,407.52l87.1,41.06c4,1.88,6.56,5.94,6.2,10.34-.94,11.46-5.54,34.43-26.13,55.02-58.12,58.12-162.49-7.64-166.74-10.18-25.67-13.79-50.06-32.24-73.19-55.36-23.12-23.12-41.58-47.52-55.37-73.19-2.55-4.24-68.31-108.61-10.18-166.74,20.59-20.59,43.56-25.19,55.02-26.13,4.41-.36,8.46,2.2,10.34,6.2l41.07,87.1c1.94,4.12,1.09,9.02-2.13,12.24l-30.61,30.61c-6.62,6.62-8.56,16.93-4,25.11,11.17,20.03,26.19,39.32,43.59,57.07,17.75,17.4,37.04,32.43,57.07,43.59,8.18,4.56,18.48,2.62,25.11-4l30.61-30.61c3.22-3.22,8.12-4.08,12.24-2.13Z" />
  </svg>
);
// Icono de Facebook (lucide-react ya no incluye logos de marca).
const IconFacebook = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07c0 6.02 4.39 11.01 10.12 11.93v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.89v2.26h3.32l-.53 3.49h-2.79v8.44C19.61 23.08 24 18.09 24 12.07z" />
  </svg>
);

// Icono de X (antes Twitter).
const IconX = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.58-6.64 7.58H.46l8.6-9.83L0 1.15h7.59l5.24 6.93 6.07-6.93zm-1.29 19.5h2.04L6.49 3.24H4.3L17.61 20.65z" />
  </svg>
);

// Icono de YouTube.
const IconYouTube = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.19C0 8.08 0 12 0 12s0 3.92.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.88.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14C24 15.92 24 12 24 12s0-3.92-.5-5.81zM9.55 15.57V8.43L15.82 12l-6.27 3.57z" />
  </svg>
);

import { ModoEmpaticContext } from '../context/ModoEmpatico';

const Footer = () => {
  const navigate = useNavigate();
  const { modoEmpatico } = useContext(ModoEmpaticContext);
  const isWarm = modoEmpatico;

  return (
    <footer
      className={`w-full mt-16 transition-colors ${
        isWarm ? 'bg-[#FFF7EF] border-[#2B1600] text-[#2B1600]' : 'bg-[#F5EEFB] border-[#E9D5FF] text-[#2E1065]'
      }`}
      style={{ borderTopWidth: '3px', borderTopStyle: 'solid' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Marca */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl text-white ${isWarm ? 'bg-[#C75000]' : 'bg-purple-700'}`}>
                <img src="/logo-cinefilia-white.png" alt="Logo Corporación Cinefilia" className="w-6 h-6 object-contain" />
              </div>
              <div>
                <span className="text-lg font-black tracking-tight">Gestión Empática</span>
                <p className="text-xs opacity-80 font-medium">Portal Oficial de Becas y Estímulos Culturales</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm opacity-85 leading-relaxed font-medium max-w-md">
              Un sistema digital inclusivo diseñado para eliminar barreras cognitivas, visuales y tecnológicas.
              Garantizamos que cada gestor cultural, artista y sabedor tradicional pueda postularse con dignidad,
              claridad y acompañamiento humano.
            </p>

            <div className="flex items-center gap-2 pt-1">
              <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border-2 flex items-center gap-1.5 ${
                isWarm ? 'border-[#2B1600] bg-white text-[#2B1600]' : 'border-current'
              }`}>
                <Eye className="w-3.5 h-3.5" />
                <span>Norma WCAG 2.1 Nivel AAA</span>
              </span>
            </div>
          </div>

          {/* Navegación */}
          <div className="space-y-3 text-xs sm:text-sm font-semibold">
            <h4 className="font-black text-sm uppercase tracking-wider opacity-80">Navegación</h4>
            <ul className="space-y-2">
              <li><button onClick={() => navigate('/convocatorias')} className="hover:underline opacity-85 hover:opacity-100 font-bold">Convocatorias Abiertas 2026</button></li>
              <li><button onClick={() => navigate('/mis-inscripciones')} className="hover:underline opacity-85 hover:opacity-100 font-bold">Consultar Mis Solicitudes</button></li>
              <li><button onClick={() => navigate('/convocatorias')} className="hover:underline opacity-85 hover:opacity-100 font-bold">Panel de Evaluación</button></li>
              <li><button onClick={() => navigate('/login')} className="hover:underline opacity-85 hover:opacity-100 font-bold">Acceso Postulantes</button></li>
              <li><button onClick={() => navigate('/contacto')} className="hover:underline opacity-85 hover:opacity-100 font-bold">Contacto</button></li>
            </ul>
          </div>

          {/* Contacto Cinefilia */}
          <div className="space-y-3 text-xs sm:text-sm font-medium">
            <h4 className="font-black text-sm uppercase tracking-wider opacity-80">Contacto</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <IconWhatsApp className="w-4 h-4 shrink-0 text-[#25D366]" />
                <a href="https://api.whatsapp.com/send/?phone=573113446586" target="_blank" rel="noopener noreferrer" className="hover:underline">WhatsApp: +57 311 344 6586</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className={`w-4 h-4 shrink-0 ${isWarm ? 'text-[#C75000]' : 'text-purple-600'}`} />
                <a href="mailto:info@cinefilia.org.co" className="hover:underline">info@cinefilia.org.co</a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className={`w-4 h-4 shrink-0 ${isWarm ? 'text-[#C75000]' : 'text-purple-600'}`} />
                <span>Medellín, Colombia</span>
              </li>
            </ul>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <a href="https://api.whatsapp.com/send/?phone=573113446586" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp de Cinefilia" title="WhatsApp" className="p-2 rounded-lg text-white transition-transform hover:scale-110 bg-[#25D366]">
                <IconWhatsApp className="w-4 h-4" />
              </a>
              <a href="https://www.instagram.com/cinefilia_colombia/" target="_blank" rel="noopener noreferrer" aria-label="Instagram de Cinefilia" title="Instagram" className={`p-2 rounded-lg text-white transition-transform hover:scale-110 ${isWarm ? 'bg-[#C75000]' : 'bg-purple-700'}`}>
                <IconInstagram className="w-4 h-4" />
              </a>
              <a href="https://cinefilia.org/" target="_blank" rel="noopener noreferrer" aria-label="Sitio web de Cinefilia" title="cinefilia.org" className={`p-2 rounded-lg text-white transition-transform hover:scale-110 ${isWarm ? 'bg-[#C75000]' : 'bg-purple-700'}`}>
                <Globe className="w-4 h-4" />
              </a>
              <a href="https://labguion.com/" target="_blank" rel="noopener noreferrer" aria-label="Programa LabGuion" title="labguion.com" className={`p-2 rounded-lg text-white transition-transform hover:scale-110 ${isWarm ? 'bg-[#C75000]' : 'bg-purple-700'}`}>
                <IconMatraz className="w-4 h-4" />
              </a>
              <a href="https://www.facebook.com/cinefiliaorg/" target="_blank" rel="noopener noreferrer" aria-label="Facebook de Cinefilia" title="Facebook" className={`p-2 rounded-lg text-white transition-transform hover:scale-110 ${isWarm ? 'bg-[#C75000]' : 'bg-purple-700'}`}>
                <IconFacebook className="w-4 h-4" />
              </a>
              <a href="https://x.com/cinefiliaorg" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter) de Cinefilia" title="X" className={`p-2 rounded-lg text-white transition-transform hover:scale-110 ${isWarm ? 'bg-[#C75000]' : 'bg-purple-700'}`}>
                <IconX className="w-4 h-4" />
              </a>
              <a href="https://www.youtube.com/@2026CinefiliaMedColom" target="_blank" rel="noopener noreferrer" aria-label="Canal de YouTube de Cinefilia" title="YouTube" className={`p-2 rounded-lg text-white transition-transform hover:scale-110 ${isWarm ? 'bg-[#C75000]' : 'bg-purple-700'}`}>
                <IconYouTube className="w-4 h-4" />
              </a>
            </div>
          </div>

        </div>

        {/* Copyright */}
        <div className="pt-6 border-t-2 border-current/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs opacity-80 font-semibold text-center sm:text-left">
          <p>© 2026 Corporación Cinefilia • Medellín, Colombia. Todos los derechos reservados.</p>
          <div className="flex items-center gap-1.5">
            <span>Hecho con vocación de servicio</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>y Gestión Empática</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;