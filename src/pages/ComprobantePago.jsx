// ============================================================================
// PÁGINA: ComprobantePago — Comprobante de PAGO (recibo estilo pasarela)
// Ficha SENA: 3013183 | Estudiante: Natalia Mejía Cardona
// ----------------------------------------------------------------------------
// Muestra el recibo del PAGO (distinto al comprobante de radicación de la
// postulación), con el mismo formato que envían las pasarelas: ID de
// transacción, estado APROBADO, referencia, valor, medio de pago, fecha y
// correo del comprador. Permite descargarlo en PDF.
// ============================================================================
import { useEffect, useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ModoEmpaticContext } from '../context/ModoEmpatico';
import { CheckCircle2, Download, ArrowLeft, ReceiptText, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';

const API = 'http://localhost:5000/api';

export default function ComprobantePago() {
  const navigate = useNavigate();
  const location = useLocation();
  const { modoEmpatico } = useContext(ModoEmpaticContext);
  const isWarm = modoEmpatico;

  const inscripcion = location.state?.inscripcion || null;
  const idInscripcion = inscripcion?.idInscripcion;

  const [cargando, setCargando] = useState(true);
  const [pago, setPago] = useState(null);
  const [error, setError] = useState(null);

  const C = {
    bg: isWarm ? '#FFF7EF' : '#FFFFFF',
    texto: isWarm ? '#2B1600' : '#2E1065',
    acento: isWarm ? '#C75000' : '#6A1B9A',
    borde: isWarm ? '#E7C9B3' : '#E9D5FF',
    suave: isWarm ? '#FCEBDD' : '#F5EEFB',
  };
  const fs = isWarm ? '17px' : '15px';
  const VERDE = '#5BA829'; // verde "aprobado" (estilo recibo de pasarela)

  useEffect(() => {
    if (!idInscripcion) {
      setError('No hay datos de la inscripción. Entra desde "Mis Solicitudes".');
      setCargando(false);
      return;
    }
    (async () => {
      try {
        const r = await fetch(`${API}/pagos/comprobante/${idInscripcion}`);
        const res = await r.json();
        if (r.ok && res.success) setPago(res.data);
        else setError(res.message || 'No se encontró el comprobante de pago.');
      } catch (e) {
        setError('No se pudo conectar con el servidor.');
      } finally {
        setCargando(false);
      }
    })();
  }, [idInscripcion]);

  const pesos = (n) => '$' + Number(n || 0).toLocaleString('es-CO');
  const formatearFecha = (f) => {
    if (!f) return '—';
    const d = new Date(f);
    if (isNaN(d.getTime())) return String(f);
    return d.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const descargarPDF = () => {
    if (!pago) return;
    const doc = new jsPDF();

    // Franja verde de "Transacción aprobada"
    doc.setFillColor(91, 168, 41);
    doc.rect(0, 0, 210, 26, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont(undefined, 'bold');
    doc.setFontSize(16);
    doc.text('Transacción Aprobada', 14, 16);

    // Marca
    doc.setTextColor(40, 40, 40);
    doc.setFont(undefined, 'bold');
    doc.setFontSize(13);
    doc.text('GestCultura · Comprobante de Pago', 14, 40);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.setTextColor(110, 110, 110);
    doc.text(`Hola ${pago.postulante || ''}, registramos tu pago. Datos de la transacción:`, 14, 48);

    // Tabla de datos
    const filas = [
      ['ID de transacción', pago.transaccionId],
      ['Estado', pago.estado],
      ['Descripción', pago.descripcion],
      ['Referencia', pago.referencia],
      ['Valor', `${pesos(pago.valor)} ${pago.moneda}`],
      ['Moneda', pago.moneda],
      ['Fecha', formatearFecha(pago.fecha)],
      ['Medio de pago', pago.medioPago],
      ['E-mail del comprador', pago.correo],
    ];

    let y = 60;
    filas.forEach(([k, v], i) => {
      if (i % 2 === 0) {
        doc.setFillColor(244, 244, 244);
        doc.rect(14, y - 5.5, 182, 9, 'F');
      }
      doc.setFont(undefined, 'bold');
      doc.setTextColor(70, 70, 70);
      doc.setFontSize(10.5);
      doc.text(String(k), 18, y);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(30, 30, 30);
      doc.text(doc.splitTextToSize(String(v || '—'), 110), 80, y);
      y += 9;
    });

    // Pie
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text('Comprobante generado por GestCultura. Pago en modo de pruebas (simulación), sin cobro real.', 14, 280);
    doc.text(`Generado el ${formatearFecha(new Date())}.`, 14, 286);

    doc.save(`Comprobante_Pago_${pago.referencia}.pdf`);
  };

  const Caja = ({ children }) => (
    <div style={{ maxWidth: '640px', margin: '40px auto', padding: '0 20px' }}>{children}</div>
  );

  if (cargando) {
    return (
      <Caja>
        <div style={{ textAlign: 'center', marginTop: '60px' }}>
          <Loader2 size={44} color={C.acento} style={{ animation: 'spin 1s linear infinite' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <p style={{ color: C.texto, fontSize: fs, marginTop: '14px' }}>Cargando tu comprobante de pago…</p>
        </div>
      </Caja>
    );
  }

  if (error || !pago) {
    return (
      <Caja>
        <div style={{ textAlign: 'center', marginTop: '60px', background: C.bg, border: `2px solid ${C.borde}`, borderRadius: '16px', padding: '32px' }}>
          <h1 style={{ color: C.acento, fontSize: '22px', margin: '0 0 8px' }}>No hay comprobante de pago</h1>
          <p style={{ color: C.texto, fontSize: fs, opacity: 0.85 }}>{error || 'Esta inscripción aún no tiene un pago registrado.'}</p>
          <button onClick={() => navigate('/mis-inscripciones')} style={{ marginTop: '20px', padding: '12px 20px', background: C.acento, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: fs }}>
            ← Ir a Mis Solicitudes
          </button>
        </div>
      </Caja>
    );
  }

  const Fila = ({ etiqueta, valor, resaltar }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', padding: '11px 16px', borderBottom: `1px solid ${C.borde}`, alignItems: 'center' }}>
      <span style={{ color: C.texto, opacity: 0.7, fontSize: '14px', fontWeight: 600 }}>{etiqueta}</span>
      <span style={{ color: resaltar ? VERDE : C.texto, fontSize: fs, fontWeight: resaltar ? 800 : 600, textAlign: 'right', wordBreak: 'break-word' }}>{valor}</span>
    </div>
  );

  return (
    <Caja>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
        <ReceiptText size={30} color={C.acento} />
        <h1 style={{ color: C.acento, margin: 0, fontSize: isWarm ? '28px' : '24px' }}>Comprobante de Pago</h1>
      </div>

      {/* Recibo */}
      <div style={{ border: `2px solid ${C.borde}`, borderRadius: '16px', overflow: 'hidden', background: C.bg, boxShadow: '0 6px 24px rgba(0,0,0,0.06)' }}>
        {/* Encabezado verde "aprobado" */}
        <div style={{ background: VERDE, color: '#fff', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <CheckCircle2 size={28} />
          <div>
            <div style={{ fontSize: '20px', fontWeight: 800, lineHeight: 1.1 }}>Transacción Aprobada</div>
            <div style={{ fontSize: '13px', opacity: 0.95 }}>Hola {pago.postulante}, registramos tu pago.</div>
          </div>
        </div>

        {/* Monto grande */}
        <div style={{ textAlign: 'center', padding: '20px 16px 8px' }}>
          <div style={{ color: C.texto, opacity: 0.7, fontSize: '13px' }}>Valor pagado</div>
          <div style={{ color: VERDE, fontSize: '34px', fontWeight: 800 }}>{pesos(pago.valor)} <span style={{ fontSize: '16px' }}>{pago.moneda}</span></div>
        </div>

        {/* Datos de la transacción */}
        <div style={{ padding: '8px 4px 4px' }}>
          <Fila etiqueta="ID de transacción" valor={pago.transaccionId} />
          <Fila etiqueta="Estado" valor={pago.estado} resaltar />
          <Fila etiqueta="Descripción" valor={pago.descripcion} />
          <Fila etiqueta="Referencia" valor={pago.referencia} />
          <Fila etiqueta="Moneda" valor={pago.moneda} />
          <Fila etiqueta="Fecha" valor={formatearFecha(pago.fecha)} />
          <Fila etiqueta="Medio de pago" valor={pago.medioPago} />
          <Fila etiqueta="E-mail del comprador" valor={pago.correo} />
        </div>

        <div style={{ background: '#FEF3C7', color: '#92400E', fontSize: '12.5px', padding: '10px 16px', textAlign: 'center' }}>
          Pago en modo de pruebas (simulación) — no se realizó ningún cobro real.
        </div>
      </div>

      {/* Botones */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '20px' }}>
        <button
          onClick={descargarPDF}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '13px 20px', background: VERDE, color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: fs }}
        >
          <Download size={18} /> Descargar comprobante (PDF)
        </button>
        <button
          onClick={() => navigate('/mis-inscripciones')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '13px 20px', background: '#fff', color: C.acento, border: `2px solid ${C.acento}`, borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: fs }}
        >
          <ArrowLeft size={18} /> Volver a Mis Solicitudes
        </button>
      </div>
    </Caja>
  );
}
