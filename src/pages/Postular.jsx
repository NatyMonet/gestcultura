import { API_URL } from '../config/api';
// ============================================================================
// PÁGINA: Postular — Formulario Inteligente Empático (Módulo 1)
// Ficha SENA: 3013183 | Estudiante: Natalia Mejía Cardona
// ----------------------------------------------------------------------------
// Formulario de postulación guiado paso a paso (un bloque a la vez), pensado
// con enfoque empático para adultos mayores: barra de progreso, textos grandes
// en Modo Empático, respaldo automático, Monet acompañando en cada paso,
// firma electrónica y constancia en PDF.
// Pasos: 1) Tus datos  2) La convocatoria  3) Datos del proyecto
//        4) Documentos  5) Tu motivación  6) Términos  7) Revisión  8) Firma
// Los documentos (PDF) se suben al Google Drive de Cinefilia a través del
// endpoint POST /api/subir-documento (puente en Google Apps Script).
// Al finalizar, guarda la postulación (inscripción + formulario + firma) con
// POST /api/postulaciones; todos los campos extra viajan en "datos" (JSON).
// ============================================================================
import { useState, useEffect, useRef, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ModoEmpaticContext } from '../context/ModoEmpatico';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import { LOGO_CINEFILIA_BLANCO, piePdfCinefilia } from '../assets/cinefilia';
import { ArrowLeft, ArrowRight, Check, Eraser, User, Compass, Film, Paperclip, FileSignature, ScrollText, PenLine, ClipboardCheck, Upload } from 'lucide-react';

const API = `${API_URL}/api`;
const TOTAL_PASOS = 8;

// Carita de Monet (el mismo avatar del asistente) para la guía empática.
const MONET_AVATAR = '/Monet_asistente.png';

// --- Campos específicos del proyecto (estilo LabGuion) ---------------------
// Más adelante estos campos podrán configurarse por convocatoria desde el panel
// de administración. Por ahora son un conjunto fijo pensado para un laboratorio
// de guion / estímulos culturales.
const CAMPOS_PROYECTO = [
  { key: 'titulo', label: 'Título del proyecto', tipo: 'text', requerido: true, placeholder: 'El nombre de tu proyecto' },
  { key: 'formato', label: 'Formato', tipo: 'select', requerido: true, opciones: ['Largometraje', 'Cortometraje', 'Serie', 'Documental', 'Otro'] },
  { key: 'genero', label: 'Género / temática', tipo: 'text', placeholder: 'Drama, comedia, histórico…' },
  { key: 'logline', label: 'Logline (tu historia en una frase)', tipo: 'text', placeholder: 'Una frase que resuma tu historia' },
  { key: 'sinopsis', label: 'Sinopsis (resumen breve)', tipo: 'textarea', requerido: true, placeholder: 'Cuéntanos de qué trata tu proyecto…' },
  { key: 'estado', label: 'Estado del proyecto', tipo: 'select', opciones: ['Idea', 'Tratamiento', 'Primer borrador', 'Borrador avanzado'] },
  { key: 'experiencia', label: 'Tu experiencia o trayectoria', tipo: 'textarea', placeholder: 'Cuéntanos brevemente tu recorrido (opcional).' },
  { key: 'comoSeEntero', label: '¿Cómo te enteraste de la convocatoria?', tipo: 'select', opciones: ['Redes sociales', 'Un amigo o familiar', 'Correo electrónico', 'Página web', 'Otro'] },
];

// --- Datos de contacto adicionales (los demás vienen del perfil) -----------
const CAMPOS_CONTACTO = [
  { key: 'telefono', label: 'Teléfono / WhatsApp', tipo: 'text', requerido: true, placeholder: 'Ej: 300 123 4567' },
  { key: 'ciudad', label: 'Ciudad de residencia', tipo: 'text', requerido: true, placeholder: 'Ej: Medellín' },
  { key: 'edad', label: 'Edad', tipo: 'text', placeholder: 'Ej: 58' },
];

// --- Documentos a subir (PDF) ----------------------------------------------
const DOCUMENTOS = [
  { key: 'identidad', label: 'Documento de identidad', requerido: true, ayuda: 'Cédula o documento, en PDF.' },
  { key: 'hojaVida', label: 'Hoja de vida o portafolio', requerido: false, ayuda: 'Tu CV o muestra de trabajos (PDF).' },
  { key: 'muestra', label: 'Muestra de escritura o guion', requerido: false, ayuda: 'Un ejemplo de tu escritura (PDF).' },
];

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

  // --- Respaldo automático (como Google Drive) ---
  // Guardamos en este navegador lo que la persona va escribiendo. Si cierra la
  // página por error o presiona una tecla equivocada, al volver encuentra todo.
  const BORRADOR_KEY = `gc_borrador_postulacion_${id}`;
  const leerBorrador = () => {
    try { return JSON.parse(localStorage.getItem(BORRADOR_KEY)) || {}; } catch (e) { return {}; }
  };
  const borradorInicial = leerBorrador();

  const [paso, setPaso] = useState(() => Math.min(Number(borradorInicial.paso) || 1, TOTAL_PASOS));
  const [convocatoria, setConvocatoria] = useState(null);
  const [datosUsuario, setDatosUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [motivacion, setMotivacion] = useState(() => borradorInicial.motivacion || '');
  const [aceptaCompromiso, setAceptaCompromiso] = useState(() => !!borradorInicial.aceptaCompromiso);
  const [enviando, setEnviando] = useState(false);
  const [corrector, setCorrector] = useState(false);  // corrector de ortografía opcional
  const [guardado, setGuardado] = useState(false);     // indicador "guardado automáticamente"

  // Campos nuevos: contacto, proyecto y documentos (todos van en "datos").
  const [contacto, setContacto] = useState(() => borradorInicial.contacto || {});
  const [proyecto, setProyecto] = useState(() => borradorInicial.proyecto || {});
  // documentos: { identidad: { url, nombre, subiendo, error }, ... }
  const [documentos, setDocumentos] = useState(() => borradorInicial.documentos || {});

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

  // Prefill del teléfono con el del perfil (si la persona aún no escribió uno).
  useEffect(() => {
    if (datosUsuario?.telefono) {
      setContacto((c) => (c.telefono ? c : { ...c, telefono: datosUsuario.telefono }));
    }
  }, [datosUsuario]);

  // --- Respaldo automático: cada cambio se guarda en el navegador ---
  useEffect(() => {
    try {
      localStorage.setItem(
        BORRADOR_KEY,
        JSON.stringify({ motivacion, paso: Math.min(paso, TOTAL_PASOS), aceptaCompromiso, contacto, proyecto, documentos })
      );
      setGuardado(true);
      const t = setTimeout(() => setGuardado(false), 1600);
      return () => clearTimeout(t);
    } catch (e) { /* si el navegador bloquea el almacenamiento, seguimos sin respaldo */ }
  }, [motivacion, paso, aceptaCompromiso, contacto, proyecto, documentos]);

  // --- Inicializar el lienzo de la firma cuando se llega al último paso ---
  useEffect(() => {
    if (paso !== TOTAL_PASOS) return;
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

  // Helpers para actualizar campos
  const setCampoContacto = (key, val) => setContacto((c) => ({ ...c, [key]: val }));
  const setCampoProyecto = (key, val) => setProyecto((p) => ({ ...p, [key]: val }));

  // --- Subida de un documento (PDF) al Drive de Cinefilia vía backend ---
  const leerBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const r = reader.result || '';
      const coma = r.indexOf(',');
      resolve(coma >= 0 ? r.slice(coma + 1) : r);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const subirDocumento = async (docKey, file) => {
    if (!file) return;
    if (file.type !== 'application/pdf') {
      Swal.fire({ icon: 'info', title: 'Solo archivos PDF', text: 'Por favor sube el documento en formato PDF.' });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      Swal.fire({ icon: 'info', title: 'Archivo muy grande', text: 'El archivo supera los 10 MB. Intenta con uno más liviano.' });
      return;
    }
    setDocumentos((d) => ({ ...d, [docKey]: { ...(d[docKey] || {}), subiendo: true, error: null } }));
    try {
      const base64 = await leerBase64(file);
      const nombrePostulante = datosUsuario?.nombre || usuarioSesion?.nombre || 'Sin nombre';
      const r = await fetch(`${API}/subir-documento`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dataBase64: base64,
          filename: `${docKey}-${file.name}`,
          mimeType: file.type,
          convocatoria: convocatoria?.nombre,
          postulante: nombrePostulante,
        }),
      });
      const res = await r.json();
      if (!r.ok || !res.ok) throw new Error(res.message || 'No se pudo subir');
      setDocumentos((d) => ({ ...d, [docKey]: { url: res.url, nombre: file.name, subiendo: false, error: null } }));
    } catch (e) {
      setDocumentos((d) => ({ ...d, [docKey]: { url: null, nombre: null, subiendo: false, error: 'No se pudo subir' } }));
      Swal.fire({ icon: 'error', title: 'No se pudo subir', text: 'Revisa tu conexión e intenta de nuevo.' });
    }
  };

  const quitarDocumento = (docKey) => setDocumentos((d) => ({ ...d, [docKey]: undefined }));

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

  // --- Validación por paso ---
  const faltaAlgunDoc = () => DOCUMENTOS.some((d) => d.requerido && !documentos[d.key]?.url);
  const hayDocSubiendo = () => DOCUMENTOS.some((d) => documentos[d.key]?.subiendo);

  const validarPaso = () => {
    if (paso === 1) {
      const faltan = CAMPOS_CONTACTO.filter((c) => c.requerido && !String(contacto[c.key] || '').trim());
      if (faltan.length) {
        Swal.fire({ icon: 'info', title: 'Faltan datos de contacto', text: `Por favor completa: ${faltan.map((f) => f.label).join(', ')}.` });
        return false;
      }
    }
    if (paso === 3) {
      const faltan = CAMPOS_PROYECTO.filter((c) => c.requerido && !String(proyecto[c.key] || '').trim());
      if (faltan.length) {
        Swal.fire({ icon: 'info', title: 'Faltan datos del proyecto', text: `Por favor completa: ${faltan.map((f) => f.label).join(', ')}.` });
        return false;
      }
    }
    if (paso === 4) {
      if (hayDocSubiendo()) {
        Swal.fire({ icon: 'info', title: 'Espera un momento', text: 'Un documento se está subiendo. Espera a que termine.' });
        return false;
      }
      if (faltaAlgunDoc()) {
        Swal.fire({ icon: 'info', title: 'Falta un documento', text: 'Sube el Documento de identidad (PDF) para continuar.' });
        return false;
      }
    }
    if (paso === 5 && motivacion.trim().length < 15) {
      Swal.fire({ icon: 'info', title: 'Cuéntanos un poco más', text: 'Escribe al menos unas palabras sobre por qué deseas participar (mínimo 15 caracteres).' });
      return false;
    }
    if (paso === 6 && !aceptaCompromiso) {
      Swal.fire({ icon: 'info', title: 'Falta tu confirmación', text: 'Por favor marca la casilla confirmando que leíste y aceptas el compromiso.' });
      return false;
    }
    return true;
  };

  const siguiente = () => { if (validarPaso()) setPaso((p) => Math.min(TOTAL_PASOS, p + 1)); };
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
      // Documentos: solo guardamos nombre + enlace (lo subido al Drive).
      const docs = {};
      DOCUMENTOS.forEach((d) => {
        if (documentos[d.key]?.url) docs[d.key] = { nombre: documentos[d.key].nombre, url: documentos[d.key].url, etiqueta: d.label };
      });

      const datos = {
        nombre: datosUsuario?.nombre,
        cedula: datosUsuario?.cedula,
        correo: datosUsuario?.correo,
        telefono: contacto.telefono || datosUsuario?.telefono,
        ciudad: contacto.ciudad,
        edad: contacto.edad,
        convocatoria: convocatoria?.nombre,
        proyecto,
        motivacion: motivacion.trim(),
        documentos: docs,
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

      // Postulación enviada: ya no necesitamos el borrador guardado.
      try { localStorage.removeItem(BORRADOR_KEY); } catch (e) { /* no pasa nada */ }

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

  // --- PDF de constancia ---
  const generarPDF = (idInscripcion, datos) => {
    const doc = new jsPDF();
    const morado = isWarm ? [199, 80, 0] : [106, 27, 154];
    const radicado = `RAD-2026-${String(idInscripcion).padStart(5, '0')}`;

    doc.setFillColor(morado[0], morado[1], morado[2]);
    doc.rect(0, 0, 210, 28, 'F');
    doc.addImage(LOGO_CINEFILIA_BLANCO, 'PNG', 184, 4, 15, 20);
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
      if (y > 250) { doc.addPage(); y = 24; }
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
    linea('Ciudad:', datos.ciudad);
    linea('Convocatoria:', datos.convocatoria);
    linea('Título del proyecto:', datos.proyecto?.titulo);
    linea('Formato:', datos.proyecto?.formato);
    linea('Sinopsis:', datos.proyecto?.sinopsis);
    linea('Fecha:', datos.fecha);
    linea('Motivación:', datos.motivacion);

    const listaDocs = Object.values(datos.documentos || {});
    if (listaDocs.length) {
      linea('Documentos:', listaDocs.map((d) => d.etiqueta || d.nombre).join(', '));
    }

    doc.setFont(undefined, 'italic');
    doc.setFontSize(9);
    doc.setTextColor(90, 90, 90);
    if (y > 240) { doc.addPage(); y = 24; }
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

    doc.setFontSize(8.5);
    doc.setTextColor(120, 120, 120);
    doc.text(`Documento generado automáticamente el ${formatearFecha(new Date())}.`, 14, 282);
    doc.text('Esta constancia certifica la postulación firmada en GestCultura.', 14, 286);
    piePdfCinefilia(doc, 292);

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

  const ICONOS = [User, Compass, Film, Paperclip, FileSignature, ScrollText, ClipboardCheck, PenLine];
  const TITULOS = ['Tus datos', 'La convocatoria', 'Datos del proyecto', 'Documentos', 'Tu motivación', 'Términos y compromiso', 'Revisión', 'Tu firma'];
  const ANIMOS = [
    'Empecemos con calma. Un pasito a la vez, tú puedes. 🐾',
    '¡Muy bien! Confirmemos tu convocatoria.',
    'Cuéntanos de tu proyecto. No hay respuestas malas.',
    'Ahora sube tus documentos en PDF. Con calma.',
    '¡Lo estás haciendo genial! Cuéntanos con tus palabras.',
    'Vas excelente. Lee el compromiso con calma. 💜',
    'Revisemos todo juntos antes de enviar.',
    '¡Último paso! Tu firma y quedas postulado/a. 🎉',
  ];
  const MENSAJES_MONET = [
    'Hola, soy Monet 🐾 Revisemos juntos que tus datos estén bien y completa tu contacto. Vamos con calma, sin afán.',
    'Esta es la convocatoria que elegiste. Léela sin prisa y, cuando te sientas listo/a, seguimos. Estoy aquí contigo.',
    'Cuéntame de tu proyecto con tus palabras. Lo que no sepas, lo dejas en blanco si no es obligatorio. ¡Tú puedes! 💪',
    'Ahora subimos tus documentos en PDF. Toca "Seleccionar archivo", búscalo en tu computador y listo. Yo te espero. 🧡',
    'Cuéntame por qué quieres participar. Si quieres, activa el corrector de ortografía. No hay respuestas malas.',
    'Lee el compromiso con tranquilidad y marca la casilla cuando estés de acuerdo. Ya casi terminamos.',
    'Revisemos todo juntitos antes de firmar. Si algo no te gusta, volvemos atrás sin ningún problema. 🧡',
    '¡Último pasito! Dibuja tu firma. Lo lograste, estoy muy orgulloso de ti. 🎉',
  ];
  const IconoPaso = ICONOS[paso - 1];
  const porcentaje = Math.round((paso / TOTAL_PASOS) * 100);

  // Estilos reutilizables para inputs
  const estiloInput = {
    width: '100%', boxSizing: 'border-box', padding: '12px 14px', borderRadius: '10px',
    border: `2px solid ${C.borde}`, fontSize: fs, color: C.texto, background: '#fff', outline: 'none',
  };
  const enfoque = (e) => (e.target.style.border = `2px solid ${C.acento}`);
  const desenfoque = (e) => (e.target.style.border = `2px solid ${C.borde}`);

  // Render genérico de un campo (text / textarea / select)
  const renderCampo = (campo, valor, onChange) => {
    const label = (
      <label style={{ display: 'block', fontSize: '14px', color: C.texto, fontWeight: 'bold', marginBottom: '6px' }}>
        {campo.label} {campo.requerido && <span style={{ color: C.acento }}>*</span>}
      </label>
    );
    if (campo.tipo === 'textarea') {
      return (
        <div key={campo.key} style={{ marginBottom: '14px' }}>
          {label}
          <textarea
            value={valor || ''}
            onChange={(e) => onChange(campo.key, e.target.value)}
            placeholder={campo.placeholder || ''}
            rows={4}
            spellCheck={corrector}
            lang="es"
            style={{ ...estiloInput, resize: 'vertical' }}
            onFocus={enfoque}
            onBlur={desenfoque}
          />
        </div>
      );
    }
    if (campo.tipo === 'select') {
      return (
        <div key={campo.key} style={{ marginBottom: '14px' }}>
          {label}
          <select
            value={valor || ''}
            onChange={(e) => onChange(campo.key, e.target.value)}
            style={{ ...estiloInput, cursor: 'pointer' }}
            onFocus={enfoque}
            onBlur={desenfoque}
          >
            <option value="">Selecciona una opción…</option>
            {campo.opciones.map((op) => (
              <option key={op} value={op}>{op}</option>
            ))}
          </select>
        </div>
      );
    }
    return (
      <div key={campo.key} style={{ marginBottom: '14px' }}>
        {label}
        <input
          type="text"
          value={valor || ''}
          onChange={(e) => onChange(campo.key, e.target.value)}
          placeholder={campo.placeholder || ''}
          style={estiloInput}
          onFocus={enfoque}
          onBlur={desenfoque}
        />
      </div>
    );
  };

  return (
    <div style={{ maxWidth: '720px', margin: '40px auto', padding: '0 20px' }}>
      {/* Encabezado + progreso */}
      <h1 style={{ color: C.acento, margin: '0 0 4px', fontSize: fsTitulo }}>Formulario de Postulación</h1>
      <p style={{ color: C.texto, opacity: 0.85, fontSize: fs, margin: '0 0 16px' }}>
        Paso {paso} de {TOTAL_PASOS} · {TITULOS[paso - 1]}
      </p>
      <div style={{ display: 'flex', gap: '5px', marginBottom: '8px' }}>
        {Array.from({ length: TOTAL_PASOS }, (_, i) => i + 1).map((n) => (
          <div key={n} style={{ flex: 1, height: '10px', borderRadius: '9999px', background: n <= paso ? C.acento : C.borde, transition: 'background .3s' }} />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
        <span style={{ color: C.acento, fontSize: '13px', fontWeight: 'bold' }}>{porcentaje}% completado</span>
        {guardado && (
          <span style={{ color: '#1baf7a', fontSize: '13px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <Check size={14} /> Guardado automáticamente
          </span>
        )}
      </div>
      <div style={{ background: C.suave, border: `1px solid ${C.borde}`, borderRadius: '10px', padding: '10px 14px', marginBottom: isWarm ? '12px' : '20px', color: C.texto, fontSize: fs, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span aria-hidden="true">💬</span>
        <span>{ANIMOS[paso - 1]}</span>
      </div>

      {/* Monet te acompaña paso a paso — solo en Modo Acompañado */}
      {isWarm && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', background: '#fff', border: `2px solid ${C.acento}`, borderRadius: '14px', padding: '14px 16px', marginBottom: '20px', boxShadow: '0 2px 12px rgba(199,80,0,0.12)' }}>
          <img src={MONET_AVATAR} alt="Monet, tu asistente" style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${C.acento}`, flexShrink: 0 }} />
          <div>
            <div style={{ color: C.acento, fontWeight: 800, fontSize: '15px', marginBottom: '2px' }}>Monet te acompaña 🐾</div>
            <p style={{ color: C.texto, fontSize: fs, margin: 0, lineHeight: 1.5 }}>{MENSAJES_MONET[paso - 1]}</p>
          </div>
        </div>
      )}

      <div style={{ background: C.bg, border: `2px solid ${C.borde}`, borderRadius: '16px', padding: '24px', boxShadow: '0 2px 14px rgba(0,0,0,0.06)', minHeight: '260px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
          <div style={{ background: C.acento, color: '#fff', borderRadius: '12px', padding: '10px', display: 'flex' }}>
            <IconoPaso size={26} />
          </div>
          <h2 style={{ color: C.texto, margin: 0, fontSize: isWarm ? '22px' : '20px' }}>{TITULOS[paso - 1]}</h2>
        </div>

        {/* PASO 1 — Tus datos (perfil + contacto) */}
        {paso === 1 && (
          <div>
            <p style={{ color: C.texto, fontSize: fs, marginTop: 0, marginBottom: '16px' }}>
              Verifica tus datos. Nombre, cédula y correo vienen de tu perfil (si algo está mal, corrígelo en tu Perfil). Completa tu contacto abajo.
            </p>
            {[
              ['Nombre completo', datosUsuario?.nombre],
              ['Cédula', datosUsuario?.cedula],
              ['Correo electrónico', datosUsuario?.correo],
            ].map(([et, val]) => (
              <div key={et} style={{ background: C.suave, borderRadius: '10px', padding: '12px 16px', marginBottom: '10px' }}>
                <div style={{ fontSize: '13px', color: C.texto, opacity: 0.7, fontWeight: 'bold' }}>{et}</div>
                <div style={{ fontSize: fs, color: C.texto }}>{val || '—'}</div>
              </div>
            ))}
            <div style={{ height: '8px' }} />
            {CAMPOS_CONTACTO.map((campo) => renderCampo(campo, contacto[campo.key], setCampoContacto))}
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

        {/* PASO 3 — Datos del proyecto */}
        {paso === 3 && (
          <div>
            <p style={{ color: C.texto, fontSize: fs, marginTop: 0, marginBottom: '16px' }}>
              Cuéntanos sobre tu proyecto. Los campos con <span style={{ color: C.acento, fontWeight: 'bold' }}>*</span> son obligatorios.
            </p>
            {CAMPOS_PROYECTO.map((campo) => renderCampo(campo, proyecto[campo.key], setCampoProyecto))}
          </div>
        )}

        {/* PASO 4 — Documentos (subida a Drive) */}
        {paso === 4 && (
          <div>
            <p style={{ color: C.texto, fontSize: fs, marginTop: 0, marginBottom: '16px' }}>
              Sube tus documentos en formato <strong>PDF</strong> (máximo 10 MB cada uno). El de identidad es obligatorio.
            </p>
            {DOCUMENTOS.map((d) => {
              const estado = documentos[d.key] || {};
              return (
                <div key={d.key} style={{ background: C.suave, border: `1px solid ${C.borde}`, borderRadius: '12px', padding: '14px 16px', marginBottom: '12px' }}>
                  <div style={{ fontSize: fs, color: C.texto, fontWeight: 'bold', marginBottom: '2px' }}>
                    {d.label} {d.requerido && <span style={{ color: C.acento }}>*</span>}
                  </div>
                  <div style={{ fontSize: '13px', color: C.texto, opacity: 0.7, marginBottom: '10px' }}>{d.ayuda}</div>

                  {estado.url ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <span style={{ color: '#1baf7a', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '14px' }}>
                        <Check size={16} /> {estado.nombre}
                      </span>
                      <a href={estado.url} target="_blank" rel="noreferrer" style={{ color: C.acento, fontSize: '13px', fontWeight: 'bold' }}>Ver</a>
                      <button onClick={() => quitarDocumento(d.key)} style={{ background: 'none', border: 'none', color: '#b00', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>Quitar</button>
                    </div>
                  ) : (
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: estado.subiendo ? '#999' : C.acento, color: '#fff', borderRadius: '9px', cursor: estado.subiendo ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '14px' }}>
                      <Upload size={16} />
                      {estado.subiendo ? 'Subiendo…' : 'Seleccionar archivo PDF'}
                      <input
                        type="file"
                        accept="application/pdf"
                        disabled={estado.subiendo}
                        onChange={(e) => { const f = e.target.files && e.target.files[0]; subirDocumento(d.key, f); e.target.value = ''; }}
                        style={{ display: 'none' }}
                      />
                    </label>
                  )}
                  {estado.error && <div style={{ color: '#b00', fontSize: '13px', marginTop: '8px' }}>⚠️ {estado.error}. Intenta de nuevo.</div>}
                </div>
              );
            })}
          </div>
        )}

        {/* PASO 5 — Motivación */}
        {paso === 5 && (
          <div>
            <p style={{ color: C.texto, fontSize: fs, marginTop: 0, marginBottom: '12px' }}>
              Cuéntanos con tus palabras: ¿por qué deseas participar en esta convocatoria?
            </p>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: C.texto, fontSize: '14px', fontWeight: 600, marginBottom: '10px' }}>
              <input
                type="checkbox"
                checked={corrector}
                onChange={(e) => setCorrector(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: C.acento, cursor: 'pointer' }}
              />
              Activar corrector de ortografía
            </label>
            <textarea
              value={motivacion}
              onChange={(e) => setMotivacion(e.target.value)}
              placeholder="Escribe aquí tu motivación…"
              rows={6}
              spellCheck={corrector}
              lang="es"
              style={{ ...estiloInput, resize: 'vertical' }}
              onFocus={enfoque}
              onBlur={desenfoque}
            />
            <p style={{ color: C.texto, opacity: 0.6, fontSize: '13px', marginTop: '6px' }}>
              {motivacion.trim().length} caracteres (mínimo 15).
              {corrector && ' · El corrector subrayará las palabras con posibles errores.'}
            </p>
          </div>
        )}

        {/* PASO 6 — Términos y compromiso */}
        {paso === 6 && (
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

        {/* PASO 7 — Revisión antes de firmar */}
        {paso === 7 && (
          <div>
            <p style={{ color: C.texto, fontSize: fs, marginTop: 0, marginBottom: '16px' }}>
              Vamos a revisar tu postulación. Si quieres corregir algo, usa el botón <strong>Anterior</strong>.
            </p>
            <div style={{ background: C.suave, borderRadius: '12px', padding: '16px 18px' }}>
              {[
                ['Nombre', datosUsuario?.nombre],
                ['Cédula', datosUsuario?.cedula],
                ['Correo', datosUsuario?.correo],
                ['Teléfono', contacto.telefono],
                ['Ciudad', contacto.ciudad],
                ['Convocatoria', convocatoria?.nombre],
                ['Título del proyecto', proyecto.titulo],
                ['Formato', proyecto.formato],
                ['Estado del proyecto', proyecto.estado],
              ].map(([et, val]) => (
                <div key={et} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '7px 0', borderBottom: `1px solid ${C.borde}` }}>
                  <span style={{ color: C.texto, opacity: 0.7, fontWeight: 'bold', fontSize: '14px' }}>{et}</span>
                  <span style={{ color: C.texto, fontSize: fs, textAlign: 'right', wordBreak: 'break-word' }}>{val || '—'}</span>
                </div>
              ))}
              <div style={{ paddingTop: '10px', borderBottom: `1px solid ${C.borde}`, paddingBottom: '10px' }}>
                <div style={{ color: C.texto, opacity: 0.7, fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>Sinopsis</div>
                <p style={{ color: C.texto, fontSize: fs, margin: 0, whiteSpace: 'pre-line', lineHeight: 1.5 }}>{(proyecto.sinopsis || '').trim() || '—'}</p>
              </div>
              <div style={{ paddingTop: '10px', borderBottom: `1px solid ${C.borde}`, paddingBottom: '10px' }}>
                <div style={{ color: C.texto, opacity: 0.7, fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>Tu motivación</div>
                <p style={{ color: C.texto, fontSize: fs, margin: 0, whiteSpace: 'pre-line', lineHeight: 1.5 }}>{motivacion.trim() || '—'}</p>
              </div>
              <div style={{ paddingTop: '10px' }}>
                <div style={{ color: C.texto, opacity: 0.7, fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>Documentos subidos</div>
                {DOCUMENTOS.filter((d) => documentos[d.key]?.url).length === 0 ? (
                  <p style={{ color: C.texto, fontSize: fs, margin: 0 }}>—</p>
                ) : (
                  DOCUMENTOS.filter((d) => documentos[d.key]?.url).map((d) => (
                    <div key={d.key} style={{ color: '#1baf7a', fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Check size={15} /> {d.label}: {documentos[d.key].nombre}
                    </div>
                  ))
                )}
              </div>
            </div>
            <p style={{ color: C.texto, opacity: 0.8, fontSize: '13px', marginTop: '12px' }}>
              ✅ Si todo está bien, continúa para firmar. Tu compromiso ya fue aceptado.
            </p>
          </div>
        )}

        {/* PASO 8 — Firma electrónica */}
        {paso === 8 && (
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

        {paso < TOTAL_PASOS ? (
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
