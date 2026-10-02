// ============================================================================
// PÁGINA: Postular — Formulario Inteligente de 5 Pasos (Módulo 1)
// Ficha SENA: 3013183 | Estudiante: Natalia Mejía Cardona
// ----------------------------------------------------------------------------
// Formulario de postulación guiado paso a paso (un bloque a la vez), pensado
// con enfoque empático para adultos mayores: barra de progreso, textos grandes
// en Modo Empático, checkpoints de comprensión, firma electrónica en un recuadro
// y generación automática del PDF de constancia.
// Pasos: 1) Datos personales  2) Convocatoria  3) Motivación
//        4) Términos y compromiso  5) Firma electrónica
// Al finalizar, guarda la postulación (inscripción + formulario + firma) en la
// base de datos mediante el endpoint POST /api/postulaciones.
// ============================================================================
import { useState, useEffect, useRef, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ModoEmpaticContext } from '../context/ModoEmpatico';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import { ArrowLeft, ArrowRight, Check, Eraser, User, Compass, FileSignature, ScrollText, PenLine } from 'lucide-react';

const API = 'http://localhost:5000/api';

const TEXTO_COMPROMISO = [
  'Declaro que la información suministrada en este formulario es verídica y corresponde a mis datos reales.',
  'Me comprometo a cumplir con los términos, fechas y condiciones establecidos por la Corporación Cinefilia para la convocatoria a la que me postulo.',
  'Autorizo el tratamiento de mis datos personales conforme a la Ley 1581 de 2012 (Habeas Data), únicamente para fines relacionados con esta convocatoria.',
  'Entiendo que mi postulación será revisada por el equipo evaluador y que la firma electrónica de este documento tiene plena validez como manifestación de mi voluntad.',
];

export default function Postular() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { modoEmpatico } = useContext(ModoEmpaticContext);
  const isWarm = modoEmpatico;

  const usuarioSesion = JSON.parse(localStorage.getItem('usuario') || 'null');

  const [paso, setPaso] = useState(1);
  const [convocatoria, setConvocatoria] = useState(null);
  const [datosUsuario, setDatosUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [motivacion, setMotivacion] = useState('');
  const [aceptaCompromiso, setAceptaCompromiso] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const canvasRef = useRef(null);
  const dibujandoRef = useRef(false);
  const [hayFirma, setHayFirma] = useState(false);

  const C = {
    bg: isWarm ? '#FFF7EF' : '#FFFFFF',
    texto: isWarm ? '#2B1600' : '#2E1065',
    acento: isWarm ? '#C75000' : '#6A1B9A',
    borde: isWarm ? '#E7C9B3' : '#E9D5FF',
    suave: isWarm ? '#FCEBDD' : '#F5EEFB',
  };
  const fs = isWarm ? '18px' : '16px';
  const fsTitulo = isWarm ? '26px' : '23px';

  // --- Carga de datos (convocatoria + datos completos del usuario) ---
  useEffect(() => {
    const cargar = async () => {
      setCargando(true);
      try {
        const rc = await fetch(`${API}/convocatorias/${id}`);
        const resC = await rc.json();
        if (resC && resC.success) setConvocatoria(resC.data);

        if (usuarioSesion?.idUsuario) {
          const ru = await fetch(`${API}/usuarios/${usuarioSesion.idUsuario}`);
          const resU = await ru.json();
          if (resU && resU.success) setDatosUsuario(resU.data);
        }
      } catch (e) {
        console.error('Error cargando datos de la postulación:', e);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [id]);

  // --- Inicializar el lienzo de la firma cuando se llega al paso 5 ---
  useEffect(() => {
    if (paso !== 5) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#1A1A1A';
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [paso]);

  const formatearFecha = (f) => {
    if (!f) return '—';
    const d = new Date(f);
    if (isNaN(d.getTime())) return String(f);
    return d.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // --- Firma (canvas) ---
  const posicion = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: (cx - rect.left) * (canvas.width / rect.width), y: (cy - rect.top) * (canvas.height / rect.height) };
  };
  const iniciar = (e) => { e.preventDefault(); dibujandoRef.current = true; const { x, y } = posicion(e); const ctx = canvasRef.current.getContext('2d'); ctx.beginPath(); ctx.moveTo(x, y); };
  const dibujar = (e) => { if (!dibujandoRef.current) return; e.preventDefault(); const { x, y } = posicion(e); const ctx = canvasRef.current.getContext('2d'); ctx.lineTo(x, y); ctx.stroke(); if (!hayFirma) setHayFirma(true); };
  const terminar = () => { dibujandoRef.current = false; };
  const limpiarFirma = () => { const canvas = canvasRef.current; const ctx = canvas.getContext('2d'); ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height); setHayFirma(false); };

  // --- Navegación entre pasos con validación ---
  const siguiente = () => {
    if (paso === 3 && motivacion.trim().length < 15) {
      Swal.fire({ icon: 'info', title: 'Cuéntanos un poco más', text: 'Escribe al menos unas palabras sobre por qué deseas participar (mínimo 15 caracteres).' });
      return;
    }
    if (paso === 4 && !aceptaCompromiso) {
      Swal.fire({ icon: 'info', title: 'Falta tu confirmación', text: 'Por favor marca la casilla confirmando que leíste y aceptas el compromiso.' });
      return;
    }
    setPaso((p) => Math.min(5, p + 1));
  };
  const anterior = () => setPaso((p) => Math.max(1, p - 1));

  // --- Finalizar: guarda la postulación y genera el PDF ---
  const finalizar = async () => {
    if (!hayFirma) {
      Swal.fire({ icon: 'info', title: 'Falta tu firma', text: 'Dibuja tu firma en el recuadro para finalizar.' });
      return;
    }
    setEnviando(true);
    try {
      const firmaValor = `Firmado por ${datosUsuario?.nombre || usuarioSesion?.nombre} el ${formatearFecha(new Date())}`;
      const datos = {
        nombre: datosUsuario?.nombre,
        cedula: datosUsuario?.cedula,
        correo: datosUsuario?.correo,
        telefono: datosUsuario?.telefono,
        convocatoria: convocatoria?.nombre,
        motivacion: motivacion.trim(),
        aceptoCompromiso: true,
        fecha: formatearFecha(new Date()),
      };

      const r = await fetch(`${API}/postulaciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idUsuario: usuarioSesion.idUsuario,
          idConvocatoria: convocatoria.idConvocatoria,
          motivacion: motivacion.trim(),
          datos,
          firmaValor,
        }),
      });
      const res = await r.json();
      if (!r.ok || !res.success) {
        setEnviando(false);
        Swal.fire({ icon: 'error', title: 'No se pudo postular', text: res.message || 'Intenta de nuevo.' });
        return;
      }

      generarPDF(res.idInscripcion, datos);

      setEnviando(false);
      Swal.fire({
        icon: 'success',
        title: '¡Postulación exitosa! 🎉',
        html: `Tu postulación a <b>${convocatoria.nombre}</b> quedó registrada y firmada.<br><small>Se descargó tu constancia en PDF.</small>`,
        confirmButtonText: 'Ver mis solicitudes',
      }).then(() => navigate('/mis-inscripciones'));
    } catch (e) {
      setEnviando(false);
      Swal.fire({ icon: 'error', title: 'Error de conexión', text: 'No se pudo conectar con el servidor.' });
    }
  };

  // --- PDF de constancia (reutiliza el enfoque del comprobante) ---
  const generarPDF = (idInscripcion, datos) => {
    const doc = new jsPDF();
    const morado = isWarm ? [199, 80, 0] : [106, 27, 154];
    const radicado = `RAD-2026-${String(idInscripcion).padStart(5, '0')}`;

    doc.setFillColor(morado[0], morado[1], morado[2]);
    doc.rect(0, 0, 210, 28, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont(undefined, 'bold');
    doc.setFontSize(18);
    doc.text('GestCultura', 14, 15);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.text('Portal Oficial de Becas y Estímulos Culturales', 14, 22);

    doc.setTextColor(30, 30, 30);
    doc.setFont(undefined, 'bold');
    doc.setFontSize(16);
    doc.text('Constancia de Postulación', 14, 44);

    doc.setTextColor(morado[0], morado[1], morado[2]);
    doc.setFontSize(12);
    doc.text(`N.º de radicado:  ${radicado}`, 14, 54);

    doc.setTextColor(50, 50, 50);
    doc.setFontSize(11);
    let y = 70;
    const linea = (etiqueta, valor) => {
      doc.setFont(undefined, 'bold');
      doc.text(etiqueta, 14, y);
      doc.setFont(undefined, 'normal');
      const t = doc.splitTextToSize(String(valor || '—'), 120);
      doc.text(t, 72, y);
      y += Math.max(9, t.length * 6 + 3);
    };
    linea('Postulante:', datos.nombre);
    linea('Cédula:', datos.cedula);
    linea('Correo:', datos.correo);
    linea('Teléfono:', datos.telefono);
    linea('Convocatoria:', datos.convocatoria);
    linea('Fecha:', datos.fecha);
    linea('Motivación:', datos.motivacion);

    doc.setFont(undefined, 'italic');
    doc.setFontSize(9);
    doc.setTextColor(90, 90, 90);
    const comp = doc.splitTextToSize('El postulante declara haber leído, comprendido y aceptado el compromiso y la autorización de tratamiento de datos personales (Ley 1581 de 2012).', 182);
    doc.text(comp, 14, y);
    y += comp.length * 5 + 8;

    doc.setFont(undefined, 'bold');
    doc.setFontSize(11);
    doc.setTextColor(50, 50, 50);
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
    doc.text(datos.nombre || '', 14, y);

    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text(`Documento generado automáticamente el ${formatearFecha(new Date())}.`, 14, 285);
    doc.text('Esta constancia certifica la postulación firmada en GestCultura.', 14, 290);

    doc.save(`Constancia_${radicado}.pdf`);
  };

  // --- Control de acceso / estados de carga ---
  if (!usuarioSesion) {
    return (
      <Aviso C={C} fs={fs} titulo="Inicia sesión para postularte" texto="Debes iniciar sesión para diligenciar el formulario de postulación." boton="Ir a iniciar sesión" accion={() => navigate('/login')} />
    );
  }
  if (cargando) {
    return <p style={{ textAlign: 'center', marginTop: 80, color: C.texto, fontSize: fs }}>Cargando formulario… 🐾</p>;
  }
  if (!convocatoria) {
    return (
      <Aviso C={C} fs={fs} titulo="Convocatoria no encontrada" texto="No pudimos cargar la convocatoria. Vuelve a Convocatorias e intenta de nuevo." boton="← Volver a Convocatorias" accion={() => navigate('/convocatorias')} />
    );
  }

  // Si la convocatoria ya cerró (fecha de cierre anterior a hoy), no se permite postular.
  const hoyCmp = new Date();
  hoyCmp.setHours(0, 0, 0, 0);
  const cierreCmp = new Date(convocatoria.fechaCierre);
  const convocatoriaCerrada = !isNaN(cierreCmp.getTime()) && cierreCmp < hoyCmp;
  if (convocatoriaCerrada) {
    return (
      <Aviso
        C={C}
        fs={fs}
        titulo="Esta convocatoria ya cerró"
        texto={`La convocatoria "${convocatoria.nombre}" cerró el ${formatearFecha(convocatoria.fechaCierre)} y ya no recibe postulaciones. Explora las convocatorias abiertas.`}
        boton="← Ver convocatorias abiertas"
        accion={() => navigate('/convocatorias')}
      />
    );
  }

  const ICONOS = [User, Compass, FileSignature, ScrollText, PenLine];
  const TITULOS = ['Tus datos', 'La convocatoria', 'Tu motivación', 'Términos y compromiso', 'Tu firma'];
  const IconoPaso = ICONOS[paso - 1];

  return (
    <div style={{ maxWidth: '720px', margin: '40px auto', padding: '0 20px' }}>
      {/* Encabezado + progreso */}
      <h1 style={{ color: C.acento, margin: '0 0 4px', fontSize: fsTitulo }}>Formulario de Postulación</h1>
      <p style={{ color: C.texto, opacity: 0.85, fontSize: fs, margin: '0 0 16px' }}>
        Paso {paso} de 5 · {TITULOS[paso - 1]}
      </p>
      <div style={{ display: 'flex', gap: '6px', marginBottom: '24px' }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <div key={n} style={{ flex: 1, height: '10px', borderRadius: '9999px', background: n <= paso ? C.acento : C.borde, transition: 'background .3s' }} />
        ))}
      </div>

      <div style={{ background: C.bg, border: `2px solid ${C.borde}`, borderRadius: '16px', padding: '24px', boxShadow: '0 2px 14px rgba(0,0,0,0.06)', minHeight: '260px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
          <div style={{ background: C.acento, color: '#fff', borderRadius: '12px', padding: '10px', display: 'flex' }}>
            <IconoPaso size={26} />
          </div>
          <h2 style={{ color: C.texto, margin: 0, fontSize: isWarm ? '22px' : '20px' }}>{TITULOS[paso - 1]}</h2>
        </div>

        {/* PASO 1 — Datos personales */}
        {paso === 1 && (
          <div>
            <p style={{ color: C.texto, fontSize: fs, marginTop: 0, marginBottom: '16px' }}>
              Verifica que tus datos estén correctos. Si algo está mal, puedes corregirlo en tu Perfil.
            </p>
            {[
              ['Nombre completo', datosUsuario?.nombre],
              ['Cédula', datosUsuario?.cedula],
              ['Correo electrónico', datosUsuario?.correo],
              ['Teléfono', datosUsuario?.telefono],
            ].map(([et, val]) => (
              <div key={et} style={{ background: C.suave, borderRadius: '10px', padding: '12px 16px', marginBottom: '10px' }}>
                <div style={{ fontSize: '13px', color: C.texto, opacity: 0.7, fontWeight: 'bold' }}>{et}</div>
                <div style={{ fontSize: fs, color: C.texto }}>{val || '—'}</div>
              </div>
            ))}
          </div>
        )}

        {/* PASO 2 — Convocatoria */}
        {paso === 2 && (
          <div>
            <p style={{ color: C.texto, fontSize: fs, marginTop: 0, marginBottom: '16px' }}>
              Confirma que deseas postularte a esta convocatoria:
            </p>
            <div style={{ background: C.suave, borderRadius: '12px', padding: '18px' }}>
              <h3 style={{ color: C.acento, margin: '0 0 8px', fontSize: isWarm ? '20px' : '18px' }}>{convocatoria.nombre}</h3>
              <p style={{ color: C.texto, fontSize: fs, margin: '0 0 14px', opacity: 0.9 }}>{convocatoria.descripcion || 'Sin descripción.'}</p>
              <div style={{ display: 'grid', gap: '6px', fontSize: fs, color: C.texto }}>
                <div><strong>Apertura:</strong> {formatearFecha(convocatoria.fechaInicio)}</div>
                <div><strong>Cierre:</strong> {formatearFecha(convocatoria.fechaCierre)}</div>
                <div><strong>Cupos:</strong> {convocatoria.cupos}</div>
              </div>
            </div>
          </div>
        )}

        {/* PASO 3 — Motivación */}
        {paso === 3 && (
          <div>
            <p style={{ color: C.texto, fontSize: fs, marginTop: 0, marginBottom: '12px' }}>
              Cuéntanos con tus palabras: ¿por qué deseas participar en esta convocatoria?
            </p>
            <textarea
              value={motivacion}
              onChange={(e) => setMotivacion(e.target.value)}
              placeholder="Escribe aquí tu motivación…"
              rows={6}
              style={{ width: '100%', boxSizing: 'border-box', padding: '14px', borderRadius: '12px', border: `2px solid ${C.borde}`, fontSize: fs, color: C.texto, background: '#fff', outline: 'none', resize: 'vertical' }}
              onFocus={(e) => (e.target.style.border = `2px solid ${C.acento}`)}
              onBlur={(e) => (e.target.style.border = `2px solid ${C.borde}`)}
            />
            <p style={{ color: C.texto, opacity: 0.6, fontSize: '13px', marginTop: '6px' }}>
              {motivacion.trim().length} caracteres (mínimo 15).
            </p>
          </div>
        )}

        {/* PASO 4 — Términos y compromiso */}
        {paso === 4 && (
          <div>
            <p style={{ color: C.texto, fontSize: fs, marginTop: 0, marginBottom: '12px' }}>
              Lee con calma el siguiente compromiso antes de continuar:
            </p>
            <div style={{ background: C.suave, borderRadius: '12px', padding: '16px 18px', marginBottom: '16px' }}>
              <ul style={{ margin: 0, paddingLeft: '20px', color: C.texto, fontSize: fs, lineHeight: 1.6 }}>
                {TEXTO_COMPROMISO.map((t, i) => (
                  <li key={i} style={{ marginBottom: '10px' }}>{t}</li>
                ))}
              </ul>
            </div>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer', color: C.texto, fontSize: fs, fontWeight: 'bold' }}>
              <input
                type="checkbox"
                checked={aceptaCompromiso}
                onChange={(e) => setAceptaCompromiso(e.target.checked)}
                style={{ width: '22px', height: '22px', accentColor: C.acento, cursor: 'pointer', marginTop: '2px' }}
              />
              He leído, comprendo y acepto el compromiso y la autorización de tratamiento de mis datos personales.
            </label>
          </div>
        )}

        {/* PASO 5 — Firma electrónica */}
        {paso === 5 && (
          <div>
            <p style={{ color: C.texto, fontSize: fs, marginTop: 0, marginBottom: '12px' }}>
              Firma en el recuadro (con el dedo o el mouse). Esta firma quedará en tu constancia en PDF.
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
              style={{ width: '100%', height: '200px', background: '#ffffff', border: `2px dashed ${C.acento}`, borderRadius: '10px', touchAction: 'none', cursor: 'crosshair', display: 'block' }}
            />
            <div style={{ marginTop: '10px' }}>
              <button
                onClick={limpiarFirma}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '9px 14px', background: '#fff', color: C.acento, border: `2px solid ${C.acento}`, borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
              >
                <Eraser size={16} /> Limpiar firma
              </button>
            </div>
            {!hayFirma && (
              <p style={{ color: C.texto, opacity: 0.7, fontSize: '13px', marginTop: '10px' }}>✍️ Dibuja tu firma para poder finalizar.</p>
            )}
          </div>
        )}
      </div>

      {/* Botones de navegación */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginTop: '20px', flexWrap: 'wrap' }}>
        <button
          onClick={paso === 1 ? () => navigate(-1) : anterior}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 22px', background: '#fff', color: C.acento, border: `2px solid ${C.acento}`, borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: fs }}
        >
          <ArrowLeft size={18} /> {paso === 1 ? 'Cancelar' : 'Anterior'}
        </button>

        {paso < 5 ? (
          <button
            onClick={siguiente}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 26px', background: C.acento, color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: fs, boxShadow: '0 4px 14px rgba(0,0,0,0.15)' }}
          >
            Siguiente <ArrowRight size={18} />
          </button>
        ) : (
          <button
            onClick={finalizar}
            disabled={enviando}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 26px', background: enviando ? '#999' : '#1baf7a', color: '#fff', border: 'none', borderRadius: '10px', cursor: enviando ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: fs, boxShadow: '0 4px 14px rgba(0,0,0,0.15)' }}
          >
            <Check size={18} /> {enviando ? 'Enviando…' : 'Finalizar y firmar'}
          </button>
        )}
      </div>
    </div>
  );
}

// Pequeño componente de aviso reutilizable (acceso/errores)
function Aviso({ C, fs, titulo, texto, boton, accion }) {
  return (
    <div style={{ maxWidth: '520px', margin: '80px auto', padding: '32px', textAlign: 'center', background: C.bg, border: `2px solid ${C.borde}`, borderRadius: '16px' }}>
      <h1 style={{ color: C.acento, fontSize: '22px', margin: '0 0 8px' }}>{titulo}</h1>
      <p style={{ color: C.texto, fontSize: fs, opacity: 0.85 }}>{texto}</p>
      <button onClick={accion} style={{ marginTop: '20px', padding: '12px 20px', background: C.acento, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: fs }}>
        {boton}
      </button>
    </div>
  );
}
