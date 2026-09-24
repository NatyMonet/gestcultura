import { useRef, useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ModoEmpaticContext } from '../context/ModoEmpatico';
import { Eraser, Download, ArrowLeft, FileCheck2 } from 'lucide-react';
import jsPDF from 'jspdf';

export default function Comprobante() {
  const navigate = useNavigate();
  const location = useLocation();
  const { modoEmpatico } = useContext(ModoEmpaticContext);
  const isWarm = modoEmpatico;

  const inscripcion = location.state?.inscripcion || null;
  const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');

  const canvasRef = useRef(null);
  const dibujandoRef = useRef(false);
  const [hayFirma, setHayFirma] = useState(false);

  const C = {
    bg: isWarm ? '#FFF7EF' : '#FFFFFF',
    texto: isWarm ? '#2B1600' : '#2E1065',
    acento: isWarm ? '#C75000' : '#6A1B9A',
    borde: isWarm ? '#2B1600' : '#E9D5FF',
    suave: isWarm ? '#FCEBDD' : '#F5EEFB',
  };
  const fs = isWarm ? '17px' : '15px';

  // Número de radicado (fijo por inscripción, para que sea el mismo siempre)
  const radicado = inscripcion
    ? `RAD-2026-${String(inscripcion.idInscripcion).padStart(5, '0')}`
    : 'RAD-2026-00000';

  const formatearFecha = (f) => {
    if (!f) return '—';
    const d = new Date(f);
    if (isNaN(d.getTime())) return String(f);
    return d.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Preparar el lienzo de la firma
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#1A1A1A';
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const posicion = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (cx - rect.left) * (canvas.width / rect.width),
      y: (cy - rect.top) * (canvas.height / rect.height),
    };
  };

  const iniciar = (e) => {
    e.preventDefault();
    dibujandoRef.current = true;
    const { x, y } = posicion(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const dibujar = (e) => {
    if (!dibujandoRef.current) return;
    e.preventDefault();
    const { x, y } = posicion(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();
    if (!hayFirma) setHayFirma(true);
  };

  const terminar = () => {
    dibujandoRef.current = false;
  };

  const limpiarFirma = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHayFirma(false);
  };

  const descargarPDF = () => {
    if (!hayFirma) return;

    const doc = new jsPDF();
    const morado = isWarm ? [199, 80, 0] : [106, 27, 154];

    // Franja de encabezado
    doc.setFillColor(morado[0], morado[1], morado[2]);
    doc.rect(0, 0, 210, 28, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont(undefined, 'bold');
    doc.setFontSize(18);
    doc.text('GestCultura', 14, 15);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.text('Portal Oficial de Becas y Estímulos Culturales', 14, 22);

    // Título
    doc.setTextColor(30, 30, 30);
    doc.setFont(undefined, 'bold');
    doc.setFontSize(16);
    doc.text('Comprobante de Radicación', 14, 44);

    // Radicado
    doc.setTextColor(morado[0], morado[1], morado[2]);
    doc.setFontSize(12);
    doc.text(`N.º de radicado:  ${radicado}`, 14, 54);

    // Datos
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(11);
    let y = 70;
    const linea = (etiqueta, valor) => {
      doc.setFont(undefined, 'bold');
      doc.text(etiqueta, 14, y);
      doc.setFont(undefined, 'normal');
      doc.text(String(valor || '—'), 72, y);
      y += 9;
    };
    linea('Postulante:', usuario?.nombre);
    linea('Correo:', usuario?.correo);
    linea('Convocatoria:', inscripcion.nombreConvocatoria);
    linea('Fecha de inscripción:', formatearFecha(inscripcion.fecha));

    // Motivación (con salto de línea automático)
    doc.setFont(undefined, 'bold');
    doc.text('Motivación:', 14, y);
    doc.setFont(undefined, 'normal');
    const motiv = doc.splitTextToSize(inscripcion.motivacion || '—', 122);
    doc.text(motiv, 72, y);
    y += motiv.length * 6 + 10;

    // Firma
    doc.setFont(undefined, 'bold');
    doc.text('Firma del postulante:', 14, y);
    y += 4;
    const firma = canvasRef.current.toDataURL('image/png');
    doc.addImage(firma, 'PNG', 14, y, 72, 30);
    y += 33;
    doc.setDrawColor(120, 120, 120);
    doc.line(14, y, 86, y);
    y += 6;
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.setTextColor(90, 90, 90);
    doc.text(usuario?.nombre || '', 14, y);

    // Pie
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text(
      `Documento generado automáticamente el ${formatearFecha(new Date())}.`,
      14,
      284
    );
    doc.text(
      'Este comprobante certifica la radicación de la postulación en GestCultura.',
      14,
      289
    );

    doc.save(`Comprobante_${radicado}.pdf`);
  };

  // Si se entró sin datos de inscripción
  if (!inscripcion) {
    return (
      <div style={{ maxWidth: '520px', margin: '80px auto', padding: '32px', textAlign: 'center', background: C.bg, border: `2px solid ${C.borde}`, borderRadius: '16px' }}>
        <h1 style={{ color: C.acento, fontSize: '22px', margin: '0 0 8px' }}>No hay datos del comprobante</h1>
        <p style={{ color: C.texto, fontSize: fs, opacity: 0.85 }}>
          Entra a "Mis Solicitudes" y usa el botón "Generar comprobante" en una de tus postulaciones.
        </p>
        <button
          onClick={() => navigate('/mis-inscripciones')}
          style={{ marginTop: '20px', padding: '12px 20px', background: C.acento, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: fs }}
        >
          ← Ir a Mis Solicitudes
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '760px', margin: '40px auto', padding: '0 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <FileCheck2 size={30} color={C.acento} />
        <h1 style={{ color: C.acento, margin: 0, fontSize: isWarm ? '30px' : '26px' }}>
          Comprobante de Radicación
        </h1>
      </div>
      <p style={{ color: C.texto, opacity: 0.85, fontSize: fs, marginBottom: '20px' }}>
        Firma en el recuadro y descarga tu comprobante oficial en PDF.
      </p>

      {/* Tarjeta con los datos */}
      <div style={{ background: C.bg, border: `2px solid ${C.borde}`, borderRadius: '14px', padding: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'inline-block', background: C.acento, color: '#fff', padding: '6px 16px', borderRadius: '9999px', fontWeight: 'bold', fontSize: '15px', marginBottom: '14px' }}>
          N.º de radicado: {radicado}
        </div>
        <div style={{ display: 'grid', gap: '8px', color: C.texto, fontSize: fs }}>
          <div><strong>Postulante:</strong> {usuario?.nombre || '—'}</div>
          <div><strong>Correo:</strong> {usuario?.correo || '—'}</div>
          <div><strong>Convocatoria:</strong> {inscripcion.nombreConvocatoria}</div>
          <div><strong>Fecha de inscripción:</strong> {formatearFecha(inscripcion.fecha)}</div>
          {inscripcion.motivacion && (
            <div><strong>Motivación:</strong> {inscripcion.motivacion}</div>
          )}
        </div>
      </div>

      {/* Firma */}
      <div style={{ background: C.bg, border: `2px solid ${C.borde}`, borderRadius: '14px', padding: '20px', marginBottom: '20px' }}>
        <p style={{ color: C.texto, fontWeight: 'bold', fontSize: fs, margin: '0 0 10px' }}>
          Tu firma (dibuja con el dedo o el mouse):
        </p>
        <canvas
          ref={canvasRef}
          width={640}
          height={200}
          onMouseDown={iniciar}
          onMouseMove={dibujar}
          onMouseUp={terminar}
          onMouseLeave={terminar}
          onTouchStart={iniciar}
          onTouchMove={dibujar}
          onTouchEnd={terminar}
          style={{
            width: '100%',
            height: '200px',
            background: '#ffffff',
            border: `2px dashed ${C.acento}`,
            borderRadius: '10px',
            touchAction: 'none',
            cursor: 'crosshair',
            display: 'block',
          }}
        />
        <div style={{ display: 'flex', gap: '10px', marginTop: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={limpiarFirma}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: '#fff', color: C.acento, border: `2px solid ${C.acento}`, borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
          >
            <Eraser size={16} /> Limpiar firma
          </button>
          <button
            onClick={descargarPDF}
            disabled={!hayFirma}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: hayFirma ? C.acento : '#bbb', color: '#fff', border: 'none', borderRadius: '8px', cursor: hayFirma ? 'pointer' : 'not-allowed', fontWeight: 'bold', fontSize: '15px' }}
          >
            <Download size={16} /> Descargar comprobante (PDF)
          </button>
        </div>
        {!hayFirma && (
          <p style={{ color: C.texto, opacity: 0.7, fontSize: '13px', marginTop: '10px' }}>
            ✍️ Dibuja tu firma para poder descargar el comprobante.
          </p>
        )}
      </div>

      <button
        onClick={() => navigate('/mis-inscripciones')}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: '#fff', color: C.acento, border: `2px solid ${C.acento}`, borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: fs }}
      >
        <ArrowLeft size={18} /> Volver a Mis Solicitudes
      </button>
    </div>
  );
}
