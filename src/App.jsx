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
 import MonetAssistant from './components/MonetAssistant';
import Footer from './components/Footer';

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
          <Route path="/convocatorias" element={<Convocatorias />} />
          <Route path="/mis-inscripciones" element={<MisInscripciones />} />
          <Route path="/convocatoria/:id" element={<DetalleConvocatoria />} />
          <Route path="/perfil" element={<Perfil />} />
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