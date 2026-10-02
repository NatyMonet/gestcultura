// ============================================================================
// PÁGINA: Pago — Pasarelas de Pago (Módulo 5) · SIMULACIÓN PMV
// Ficha SENA: 3013183 | Estudiante: Natalia Mejía Cardona
// ----------------------------------------------------------------------------
// Simulación de pago con las pasarelas Wompi, PayU y PayPal. Para el Producto
// Mínimo Viable NO se cobra dinero real ni se conecta con el proveedor en
// producción: al "pagar", el sistema registra el comprobante en la base de
// datos (estado Validado) a través del endpoint POST /api/pagos.
// ============================================================================
import { useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ModoEmpaticContext } from '../context/ModoEmpatico';
import Swal from 'sweetalert2';
import { ShieldCheck, CreditCard, Lock, ArrowLeft, Check, FlaskConical } from 'lucide-react';

const API = 'http://localhost:5000/api';
const VALOR = 50000; // Valor simulado de inscripción (COP) para la demostración del PMV

const PASARELAS = [
  { id: 'Wompi', color: '#2E9BD6', sigla: 'W' },
  { id: 'PayU', color: '#A6C307', sigla: 'PayU' },
  { id: 'PayPal', color: '#003087', sigla: 'PP' },
];

export default function Pago() {
  const location = useLocation();
  const navigate = useNavigate();
  const { modoEmpatico } = useContext(ModoEmpaticContext);
  const isWarm = modoEmpatico;

  const inscripcion = location.state?.inscripcion || null;
  const [pasarela, setPasarela] = useState('Wompi');
  const [pagando, setPagando] = useState(false);

  const C = {
    bg: isWarm ? '#FFF7EF' : '#FFFFFF',
    texto: isWarm ? '#2B1600' : '#2E1065',
    acento: isWarm ? '#C75000' : '#6A1B9A',
    borde: isWarm ? '#E7C9B3' : '#E9D5FF',
    suave: isWarm ? '#FCEBDD' : '#F5EEFB',
  };
  const fs = isWarm ? '17px' : '15px';

  const pesos = (n) => '$' + Number(n).toLocaleString('es-CO') + ' COP';

  const pagar = async () => {
    setPagando(true);
    try {
      // ---- WOMPI: pago REAL en modo pruebas (sandbox) ----
      // El servidor calcula el monto y la firma; aquí solo redirigimos al
      // checkout seguro de Wompi con esos datos.
      if (pasarela === 'Wompi') {
        const r = await fetch(`${API}/pagos/wompi/iniciar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idInscripcion: inscripcion.idInscripcion }),
        });
        const res = await r.json();
        // Wompi aún sin llaves de prueba configuradas: mensaje amable, no error.
        if (res.configPendiente) {
          setPagando(false);
          Swal.fire({
            icon: 'info',
            title: 'Wompi en configuración',
            text: 'El pago con Wompi (sandbox) está en configuración. Por ahora puedes usar PayU o PayPal.',
            confirmButtonText: 'Entendido',
          });
          return;
        }
        if (!r.ok || !res.success) {
          setPagando(false);
          Swal.fire({ icon: 'error', title: 'No se pudo iniciar el pago', text: res.message || 'Intenta de nuevo.' });
          return;
        }
        const params = [
          `public-key=${encodeURIComponent(res.publicKey)}`,
          `currency=${encodeURIComponent(res.moneda)}`,
          `amount-in-cents=${encodeURIComponent(res.amountInCents)}`,
          `reference=${encodeURIComponent(res.referencia)}`,
          `signature:integrity=${encodeURIComponent(res.firma)}`,
          `redirect-url=${encodeURIComponent(res.redirectUrl)}`,
        ].join('&');
        // Vamos al checkout de Wompi (allí el cliente paga con la tarjeta de prueba).
        window.location.href = `https://checkout.wompi.co/p/?${params}`;
        return;
      }

      // ---- PayU / PayPal: simulación para el PMV ----
      // El monto lo decide el servidor; no se envía desde el navegador.
      const r = await fetch(`${API}/pagos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idInscripcion: inscripcion.idInscripcion, pasarela }),
      });
      const res = await r.json();
      setPagando(false);
      if (r.ok && res.success) {
        Swal.fire({
          icon: 'success',
          title: '¡Pago aprobado! ✅',
          html: `Tu pago con <b>${pasarela}</b> fue registrado.<br><small>(Simulación — no se realizó ningún cobro real.)</small>`,
          confirmButtonText: 'Ver mis solicitudes',
        }).then(() => navigate('/mis-inscripciones'));
      } else {
        Swal.fire({ icon: 'error', title: 'No se pudo procesar el pago', text: res.message || 'Intenta de nuevo.' });
      }
    } catch (e) {
      setPagando(false);
      Swal.fire({ icon: 'error', title: 'Error de conexión', text: 'No se pudo conectar con el servidor.' });
    }
  };

  if (!inscripcion) {
    return (
      <div style={{ maxWidth: '520px', margin: '80px auto', padding: '32px', textAlign: 'center', background: C.bg, border: `2px solid ${C.borde}`, borderRadius: '16px' }}>
        <h1 style={{ color: C.acento, fontSize: '22px', margin: '0 0 8px' }}>No hay datos del pago</h1>
        <p style={{ color: C.texto, fontSize: fs, opacity: 0.85 }}>Entra a "Mis Solicitudes" y usa el botón "Pagar" en una de tus postulaciones.</p>
        <button onClick={() => navigate('/mis-inscripciones')} style={{ marginTop: '20px', padding: '12px 20px', background: C.acento, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: fs }}>
          ← Ir a Mis Solicitudes
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '640px', margin: '40px auto', padding: '0 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
        <CreditCard size={30} color={C.acento} />
        <h1 style={{ color: C.acento, margin: 0, fontSize: isWarm ? '28px' : '24px' }}>Pago de Inscripción</h1>
      </div>

      {/* Aviso de modo prueba */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#FEF3C7', border: '2px solid #F59E0B', color: '#92400E', borderRadius: '12px', padding: '12px 16px', margin: '14px 0 20px', fontSize: '14px', fontWeight: 'bold' }}>
        <FlaskConical size={20} />
        MODO PRUEBAS (SANDBOX) — No se cobra dinero real. Wompi funciona en su ambiente de pruebas; PayU y PayPal son simulación.
      </div>

      {/* Resumen */}
      <div style={{ background: C.bg, border: `2px solid ${C.borde}`, borderRadius: '14px', padding: '18px 20px', marginBottom: '18px' }}>
        <div style={{ display: 'grid', gap: '6px', color: C.texto, fontSize: fs }}>
          <div><strong>Convocatoria:</strong> {inscripcion.nombreConvocatoria}</div>
          <div><strong>Inscripción N.º:</strong> {inscripcion.idInscripcion}</div>
        </div>
        <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: `1px solid ${C.borde}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: C.texto, fontSize: fs, fontWeight: 'bold' }}>Valor a pagar (simulado):</span>
          <span style={{ color: C.acento, fontSize: '24px', fontWeight: 800 }}>{pesos(VALOR)}</span>
        </div>
      </div>

      {/* Selección de pasarela */}
      <p style={{ color: C.texto, fontSize: fs, fontWeight: 'bold', margin: '0 0 10px' }}>Elige tu medio de pago:</p>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {PASARELAS.map((p) => {
          const activa = pasarela === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setPasarela(p.id)}
              style={{
                flex: '1 1 150px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                padding: '16px', borderRadius: '12px', cursor: 'pointer',
                border: activa ? `3px solid ${C.acento}` : `2px solid ${C.borde}`,
                background: activa ? C.suave : '#fff', fontWeight: 'bold', fontSize: fs, color: C.texto,
                position: 'relative',
              }}
            >
              <span style={{ background: p.color, color: '#fff', borderRadius: '8px', padding: '6px 10px', fontSize: '13px', fontWeight: 800 }}>{p.sigla}</span>
              {p.id}
              {activa && <Check size={18} color={C.acento} style={{ position: 'absolute', top: '8px', right: '8px' }} />}
            </button>
          );
        })}
      </div>

      {/* Zona de pago según la pasarela elegida */}
      {pasarela === 'Wompi' ? (
        // Wompi: pago real en sandbox. La tarjeta se escribe en el sitio de Wompi.
        <div style={{ background: C.suave, border: `2px solid ${C.borde}`, borderRadius: '14px', padding: '18px 20px', marginBottom: '20px', color: C.texto, fontSize: fs }}>
          Al continuar irás al <strong>checkout seguro de Wompi</strong> (modo pruebas). Allí podrás pagar con la tarjeta de prueba:
          <div style={{ marginTop: '10px', background: '#fff', border: `1px dashed ${C.borde}`, borderRadius: '10px', padding: '10px 14px', fontFamily: 'monospace', fontSize: '14px', color: C.texto }}>
            Tarjeta: <strong>4242 4242 4242 4242</strong><br />
            Vence: <strong>12/29</strong> &nbsp;·&nbsp; CVC: <strong>123</strong>
          </div>
          <p style={{ margin: '10px 0 0', fontSize: '13px', opacity: 0.75 }}>No se cobra dinero real. El monto lo define el servidor de forma segura.</p>
        </div>
      ) : pasarela === 'PayU' ? (
        // PayU: simulación para el PMV (datos de tarjeta ilustrativos).
        <div style={{ background: C.bg, border: `2px solid ${C.borde}`, borderRadius: '14px', padding: '18px 20px', marginBottom: '20px' }}>
          <p style={{ color: C.texto, fontSize: '13px', opacity: 0.7, margin: '0 0 12px' }}>Datos de tarjeta (de prueba, no reales — simulación):</p>
          <Campo C={C} fs={fs} etiqueta="Número de tarjeta" valor="4242 4242 4242 4242" />
          <Campo C={C} fs={fs} etiqueta="Nombre en la tarjeta" valor="USUARIO DE PRUEBA" />
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}><Campo C={C} fs={fs} etiqueta="Vencimiento" valor="12/29" /></div>
            <div style={{ flex: 1 }}><Campo C={C} fs={fs} etiqueta="CVV" valor="123" /></div>
          </div>
        </div>
      ) : (
        // PayPal: simulación para el PMV.
        <div style={{ background: C.suave, border: `2px solid ${C.borde}`, borderRadius: '14px', padding: '18px 20px', marginBottom: '20px', color: C.texto, fontSize: fs }}>
          Al confirmar, en un entorno real serías redirigido a <strong>PayPal</strong> para completar el pago. (Aquí es una simulación.)
        </div>
      )}

      {/* Botón de pago */}
      <button
        onClick={pagar}
        disabled={pagando}
        style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '16px', background: pagando ? '#999' : '#1baf7a', color: '#fff', border: 'none', borderRadius: '12px', cursor: pagando ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '18px', boxShadow: '0 4px 14px rgba(0,0,0,0.15)' }}
      >
        <Lock size={18} /> {pagando ? 'Procesando…' : pasarela === 'Wompi' ? `Continuar a Wompi · ${pesos(VALOR)}` : `Pagar ${pesos(VALOR)} con ${pasarela}`}
      </button>

      <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: C.texto, opacity: 0.65, fontSize: '13px', marginTop: '12px' }}>
        <ShieldCheck size={15} /> Pago cifrado y seguro (simulación de demostración).
      </p>

      <button
        onClick={() => navigate('/mis-inscripciones')}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '18px', padding: '12px 20px', background: '#fff', color: C.acento, border: `2px solid ${C.acento}`, borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: fs }}
      >
        <ArrowLeft size={18} /> Volver a Mis Solicitudes
      </button>
    </div>
  );
}

// Campo ilustrativo de solo lectura (datos de prueba)
function Campo({ C, fs, etiqueta, valor }) {
  return (
    <div style={{ marginBottom: '10px' }}>
      <div style={{ fontSize: '12px', color: C.texto, opacity: 0.7, fontWeight: 'bold', marginBottom: '3px' }}>{etiqueta}</div>
      <input
        type="text"
        defaultValue={valor}
        readOnly
        style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: '8px', border: `2px solid ${C.borde}`, fontSize: fs, color: C.texto, background: '#fff' }}
      />
    </div>
  );
}
