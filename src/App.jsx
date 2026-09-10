import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ModoEmpaticProvider, ModoEmpaticContext } from './context/ModoEmpatico';
import { useContext } from 'react';
import Navbar from './components/Navbar';
import Registro from './pages/Registro';
import Login from './pages/Login';
import Convocatorias from './pages/Convocatorias';
import MisInscripciones from './pages/MisInscripciones';
import DetalleConvocatoria from './pages/DetalleConvocatoria';

function AppContent() {
  const { modoEmpatico } = useContext(ModoEmpaticContext);

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      modoEmpatico
        ? 'bg-[#FFF7EF] text-[#2B1600]'  // Empático (caramelo)
        : 'bg-[#FAF5FF] text-[#2E1065]'  // Normal (morado)
    }`}>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/registro" element={<Registro />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Login />} />
          <Route path="/convocatorias" element={<Convocatorias />} />
          <Route path="/mis-inscripciones" element={<MisInscripciones />} />
          <Route path="/convocatoria/:id" element={<DetalleConvocatoria />} />
        </Routes>
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