// ============================================================================
// PÁGINA: PagoResultado — Resultado del pago con Wompi (Módulo 5)
// Ficha SENA: 3013183 | Estudiante: Natalia Mejía Cardona
// ----------------------------------------------------------------------------
// A esta página vuelve el cliente después de pagar en el checkout de Wompi.
// Wompi agrega a la URL el id de la transacción (?id=...&env=test). Aquí NO
// decidimos nada por nuestra cuenta: le pedimos al backend que consulte el
// estado real directamente a Wompi (servidor a servidor) y mostramos el
// resultado (Aprobado / Rechazado / Pendiente).
// ============================================================================
import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ModoEmpaticContext } from '../context/ModoEmpatico';
import { CheckCircle2, XCircle, Clock, ArrowLeft, Loader2 } from 'lucide-react';

const API = 'http://localhost:5000/api';

export default function PagoResultado() {
  const navigate = useNavigate();
  const { modoEmpatico } = useContext(ModoEmpaticContext);
  const isWarm = modoEmpatico;

  const [cargando, setCargando] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const C = {
    bg: isWarm ? '#FFF7EF' : '#FFFFFF',
    texto: isWarm ? '#2B1600' : '#2E1065',
    acento: isWarm ? '#C75000' : '#6A1B9A',
    borde: isWarm ? '#E7C9B3' : '#E9D5FF',
  };
  const fs = isWarm ? '17px' : '15px';

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) {
      setError('No recibimos el identificador de la transacción. Vuelve a intentar el pago.');
      setCargando(false);
      return;
    }
    (async () => {
      try {
        const r = await fetch(`${API}/pagos/wompi/resultado?id=${encodeURIComponent(id)}`);
        const res = await r.json();
        if (r.ok && res.success) setData(res);
        else setError(res.message || 'No pudimos confirmar el pago.');
      } catch (e) {
        setError('No pudimos conectar con el servidor para confirmar el pago.');
      } finally {
        setCargando(false);
      }
    })();
  }, []);

  const pesos = (n) => '$' + Number(n || 0).toLocaleString('es-CO') + ' COP';

  const Caja = ({ children }) => (
    <div style={{ maxWidth: '560px', margin: '60px auto', padding: '32px 28px', textAlign: 'center', background: C.bg, border: `2px solid ${C.borde}`, borderRadius: '16px', boxShadow: '0 6px 24px rgba(0,0,0,0.08)' }}>
      {children}
    </div>
  );

  const BotonSolicitudes = () => (
    <button
      onClick={() => navigate('/mis-inscripciones')}
      style={{ marginTop: '22px', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '13px 22px', background: C.acento, color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: fs }}
    >
      <ArrowLeft size={18} /> Ir a Mis Solicitudes
    </button>
  );

  if (cargando) {
    return (
      <Caja>
        <Loader2 size={46} color={C.acento} style={{ animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <h1 style={{ color: C.acento, fontSize: '22px', margin: '16px 0 6px' }}>Confirmando tu pago…</h1>
        <p style={{ color: C.texto, fontSize: fs, opacity: 0.8 }}>Estamos verificando el pago directamente con Wompi. Un momento, por favor.</p>
      </Caja>
    );
  }

  if (error) {
    return (
      <Caja>
        <XCircle size={54} color="#DC2626" />
        <h1 style={{ color: '#DC2626', fontSize: '22px', margin: '14px 0 6px' }}>No pudimos confirmar el pago</h1>
        <p style={{ color: C.texto, fontSize: fs, opacity: 0.85 }}>{error}</p>
        <BotonSolicitudes />
      </Caja>
    );
  }

  // Resultado según el estado real que reportó Wompi
  if (data.estado === 'APROBADA') {
    return (
      <Caja>
        <CheckCircle2 size={60} color="#16A34A" />
        <h1 style={{ color: '#16A34A', fontSize: '24px', margin: '14px 0 6px' }}>¡Pago aprobado! ✅</h1>
        <p style={{ color: C.texto, fontSize: fs }}>
          Tu pago de <strong>{pesos(data.monto)}</strong> con <strong>Wompi</strong> fue confirmado y tu comprobante quedó registrado.
        </p>
        <div style={{ marginTop: '14px', fontSize: '13px', color: C.texto, opacity: 0.7, fontFamily: 'monospace' }}>
          Ref: {data.referencia}<br />Transacción: {data.transaccionId}
        </div>
        <BotonSolicitudes />
      </Caja>
    );
  }

  if (data.estado === 'PENDIENTE') {
    return (
      <Caja>
        <Clock size={54} color="#D97706" />
        <h1 style={{ color: '#D97706', fontSize: '22px', margin: '14px 0 6px' }}>Pago en proceso ⏳</h1>
        <p style={{ color: C.texto, fontSize: fs, opacity: 0.85 }}>
          Tu pago quedó pendiente de confirmación (puede pasar con PSE o efectivo). Cuando Wompi lo confirme, tu comprobante se registrará.
        </p>
        <BotonSolicitudes />
      </Caja>
    );
  }

  // RECHAZADA o ERROR
  return (
    <Caja>
      <XCircle size={54} color="#DC2626" />
      <h1 style={{ color: '#DC2626', fontSize: '22px', margin: '14px 0 6px' }}>El pago no se completó</h1>
      <p style={{ color: C.texto, fontSize: fs, opacity: 0.85 }}>
        El pago fue <strong>{data.estado === 'ERROR' ? 'marcado con error' : 'rechazado'}</strong>. Puedes intentar de nuevo con otro medio de pago.
      </p>
      <BotonSolicitudes />
    </Caja>
  );
}
