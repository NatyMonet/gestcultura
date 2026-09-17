import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartHandshake, Phone, Mail, MapPin, Eye, Heart } from 'lucide-react';
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
                <HeartHandshake className="w-6 h-6" />
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
            </ul>
          </div>

          {/* Contacto */}
          <div className="space-y-3 text-xs sm:text-sm font-medium">
            <h4 className="font-black text-sm uppercase tracking-wider opacity-80">Línea de Apoyo y Ayuda</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Phone className={`w-4 h-4 shrink-0 ${isWarm ? 'text-[#C75000]' : 'text-purple-600'}`} />
                <span>Línea Gratuita: 01 8000 913 240</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className={`w-4 h-4 shrink-0 ${isWarm ? 'text-[#C75000]' : 'text-purple-600'}`} />
                <span>soporte.empatico@cultura.gov.co</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className={`w-4 h-4 shrink-0 ${isWarm ? 'text-[#C75000]' : 'text-purple-600'}`} />
                <span>Atención Presencial Inclusiva</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Copyright */}
        <div className="pt-6 border-t-2 border-current/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs opacity-80 font-semibold text-center sm:text-left">
          <p>© 2026 República de Colombia • Ministerio de las Culturas, las Artes y los Saberes. Todos los derechos reservados.</p>
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