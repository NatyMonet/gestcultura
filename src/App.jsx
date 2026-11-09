/**
 * Nombre del archivo: App.jsx
 * Descripción: Componente raíz de la aplicación (React). Define el enrutamiento,
 *              los proveedores de contexto y los candados de ruta de administrador.
 * Autor: Natalia Mejía Cardona
 * Fecha de creación: 2026-09-05
 * Última modificación: 2026-10-07
 * Licencia: Uso académico — Corporación Cinefilia / SENA.
 */
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ModoEmpaticProvider, ModoEmpaticContext } from './context/ModoEmpatico';
import { useContext, useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import { AccessibilityToolbar } from './components/AccessibilityToolbar';
import Registro from './pages/Registro';
import Login from './pages/Login';
import Convocatorias from './pages/Convocatorias';
import MisInscripciones from './pages/MisInscripciones';
import DetalleConvocatoria from './pages/DetalleConvocatoria';
import Perfil from './pages/Perfil';
import PanelEvaluacion from './pages/PanelEvaluacion';
import PanelAdmin from './pages/PanelAdmin';
import Comprobante from './pages/Comprobante';
import RecuperarPassword from './pages/RecuperarPassword';
import RestablecerPassword from './pages/RestablecerPassword';
import AutoLogout from './components/AutoLogout';
import NotFound from './pages/NotFound';
import PanelUsuarios from './pages/PanelUsuarios';
import Postular from './pages/Postular';
import Pago from './pages/Pago';
import PagoResultado from './pages/PagoResultado';
import ComprobantePago from './pages/ComprobantePago';
import Contacto from './pages/Contacto';
import MonetAssistant from './components/MonetAssistant';
import Footer from './components/Footer';

// 🔒 Candado de ruta: solo deja pasar a administradores con sesión iniciada (idRol = 1).
// Si no hay sesión de administrador, redirige al inicio de sesión.
function RequireAdmin({ children }) {
  let usuario = null;
  try {
    const raw = localStorage.getItem('usuario');
    usuario = raw ? JSON.parse(raw) : null;
  } catch {
    usuario = null;
  }
  const token = localStorage.getItem('token');
  const esAdmin = !!token && !!usuario && Number(usuario.idRol) === 1;
  if (!esAdmin) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AppContent() {
const { modoEmpatico, setModoEmpatico } = useContext(ModoEmpaticContext);

const [textScale, setTextScale] = useState(() => {
return localStorage.getItem('textScale') || 'normal';
});

const [isMonetOpen, setIsMonetOpen] = useState(false);
const [isReading, setIsReading] = useState(false);

useEffect(() => {
document.documentElement.className = `text-scale-${textScale}`;
localStorage.setItem('textScale', textScale);
}, [textScale]);

const handleToggleRead = () => {
setIsReading(!isReading);
};

return (
<div className={`min-h-screen transition-colors duration-200 ${
modoEmpatico
? 'bg-[#FFF7EF] text-[#2B1600]'
: 'bg-[#FAF5FF] text-[#2E1065]'
}`}>
<Router>
<AutoLogout />
<AccessibilityToolbar
modoEmpatico={modoEmpatico}
setModoEmpatico={setModoEmpatico}
textScale={textScale}
setTextScale={setTextScale}
isReading={isReading}
onToggleRead={handleToggleRead}
onOpenMonet={() => setIsMonetOpen(true)}
/>
<Navbar />
<Routes>
<Route path="/" element={<Navigate to="/convocatorias" replace />} />
<Route path="/registro" element={<Registro />} />
<Route path="/login" element={<Login />} />
<Route path="/recuperar" element={<RecuperarPassword />} />
<Route path="/restablecer" element={<RestablecerPassword />} />
<Route path="/convocatorias" element={<Convocatorias />} />
<Route path="/mis-inscripciones" element={<MisInscripciones />} />
<Route path="/convocatoria/:id" element={<DetalleConvocatoria />} />
<Route path="/postular/:id" element={<Postular />} />
<Route path="/pago" element={<Pago />} />
<Route path="/pago-resultado" element={<PagoResultado />} />
<Route path="/comprobante-pago" element={<ComprobantePago />} />
<Route path="/perfil" element={<Perfil />} />
<Route path="/panel-evaluacion" element={<RequireAdmin><PanelEvaluacion /></RequireAdmin>} />
<Route path="/panel-admin" element={<RequireAdmin><PanelAdmin /></RequireAdmin>} />
<Route path="/panel-usuarios" element={<RequireAdmin><PanelUsuarios /></RequireAdmin>} />
<Route path="/comprobante" element={<Comprobante />} />
<Route path="/contacto" element={<Contacto />} />
<Route path="*" element={<NotFound />} />
</Routes>
<Footer />
<MonetAssistant isMonetOpen={isMonetOpen} setIsMonetOpen={setIsMonetOpen} />
</Router>
</div>
);
}

export default function App() {
return (
<ModoEmpaticProvider>
<AppContent />
</ModoEmpaticProvider>
);
}
