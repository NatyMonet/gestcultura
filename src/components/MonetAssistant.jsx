import { API_URL } from '../config/api';
import { useState, useRef, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  X,
  Volume2,
  VolumeX,
  Send,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  ChevronRight,
  MessageCircleHeart,
  ArrowRight,
  Calendar,
  Users,
  BookOpen,
} from 'lucide-react';
import { ModoEmpaticContext } from '../context/ModoEmpatico';
import { CONVOCATORIAS_DATA } from '../data/mockData';

const MONET_AVATAR = '/Monet_asistente.png';

const GREETING = '¡Hola! Soy Monet, tu perrito de apoyo. Estoy aquí para que encuentres tu convocatoria ideal sin complicaciones.';
const TIPS = [
  'Puedes usar los botones de arriba para filtrar por tu área artística favorita.',
  'Fíjate bien en la fecha de cierre; te recomiendo no esperar al último día.',
  'Si tienes dudas sobre los requisitos, dale clic a "Inscribirme" para ver el paso a paso.',
];
const PROMPT_Q = '¿Quieres que te recomiende una convocatoria según tu experiencia?';
const FAQS = [
  {
    q: '¿Qué es un número de radicado oficial?',
    a: 'Es un código único (como CE-2026-C8524) con el que la entidad cultural certifica la fecha, hora exacta y recepción de tu solicitud. Te permite hacer seguimiento legal sin intermediarios.',
  },
  {
    q: '¿Qué hago si tengo más de 50 años o problemas de visión?',
    a: 'El portal activa automáticamente el "Modo Empático" con textos más grandes (A+), contraste óptimo y mi asistencia constante. También puedes pulsar "Leer en voz alta" en la barra superior.',
  },
  {
    q: '¿Cómo firmo si no tengo lápiz digital?',
    a: 'Puedes deslizar tu dedo en la pantalla táctil o mover el ratón dentro del recuadro blanco. Si se te dificulta, ofrecemos la opción "Firmar digitalmente con certificación de identidad".',
  },
  {
    q: '¿Qué pasa si me falta un documento al radicar?',
    a: 'El comité evaluador te enviará una notificación amistosa con el estado "Subsanación", dándote un plazo claro para subir el documento faltante sin perder tu turno de inscripción.',
  },
];

const MAPA_CATEGORIAS = {
  teatro: 'Teatro',
  music: 'Música',
  cancion: 'Música',
  ficcion: 'Ficción',
  ficción: 'Ficción',
  cine: 'Ficción',
  guion: 'Ficción',
  escrib: 'Ficción',
  social: 'Impacto Social',
  impacto: 'Impacto Social',
  comunidad: 'Impacto Social',
  aprecia: 'Apreciación',
  visual: 'Artes Visuales',
  pintura: 'Artes Visuales',
  arte: 'Artes Visuales',
  literat: 'Literatura',
  libro: 'Literatura',
  poesia: 'Literatura',
};

const buscarConvocatorias = (texto) => {
  const l = texto.toLowerCase();
  let categoria = null;
  for (const clave in MAPA_CATEGORIAS) {
    if (l.includes(clave)) {
      categoria = MAPA_CATEGORIAS[clave];
      break;
    }
  }
  let lista = CONVOCATORIAS_DATA;
  if (categoria) {
    const filtradas = CONVOCATORIAS_DATA.filter((c) => c.category === categoria);
    if (filtradas.length > 0) lista = filtradas;
  }
  return lista.slice(0, 3);
};

const respuestaClave = (lower) => {
  if (lower.includes('firma') || lower.includes('dibujar')) {
    return 'Para firmar solo desliza tu dedo o ratón en el lienzo blanco. Si tienes alguna dificultad motriz, puedes usar la firma digital certificada con tu cédula verificada.';
  } else if (lower.includes('radicado') || lower.includes('numero') || lower.includes('código')) {
    return 'El número de radicado oficial (por ejemplo CE-2026-C8524) es tu comprobante legal de que la entidad y los jurados recibieron tu propuesta a tiempo.';
  } else if (lower.includes('documento') || lower.includes('cedula') || lower.includes('requisito')) {
    return 'Solo necesitas tu documento de identidad vigente (Cédula o Pasaporte) y el archivo en PDF de tu propuesta creativa. ¡Todo lo demás es muy intuitivo!';
  } else if (lower.includes('edad') || lower.includes('50') || lower.includes('mayor')) {
    return '¡La experiencia es un tesoro! En este portal, si tienes 50 años o más, activamos automáticamente el Modo Empático con letras más legibles y acompañamiento continuo.';
  } else if (lower.includes('inscrib') || lower.includes('postul') || lower.includes('formulario') || lower.includes('convocatoria')) {
    return '¡Con gusto! Para postularte, entra a Convocatorias, elige la que te guste y dale clic en "Inscribirme / Postularse". Si no has iniciado sesión, te pediré que ingreses primero. 🐾';
  }
  return '¡Con gusto te acompaño! Puedes preguntarme cómo inscribirte, qué documentos necesitas o qué convocatoria te conviene. 🐾';
};

// ⏱️ TEMPORIZADOR DE INACTIVIDAD ("Modo Acompañado")
// Si la persona se queda detenida sin hacer nada mientras se postula,
// Monet se abre solo y le ofrece ayuda paso a paso.
// Puedes cambiar estos segundos a tu gusto (están en milisegundos: 1000 = 1 segundo):
const INACTIVIDAD_EMPATICO_MS = 20000; // 20 s cuando el Modo Empático está activo (adultos mayores)
const INACTIVIDAD_NORMAL_MS = 45000;   // 45 s en modo normal
// Páginas donde Monet vigila la inactividad (donde la persona se postula):
const RUTAS_VIGILADAS = ['/convocatorias', '/convocatoria', '/registro'];
const MENSAJE_AYUDA_PROACTIVA =
  'Veo que llevas un ratito por aquí. 🐾 ¿Quieres que te ayude a postularte paso a paso? Escríbeme tu duda o dime qué convocatoria te interesa y te guío con calma.';

const MonetFace = ({ className, style }) => {
  const [error, setError] = useState(false);
  if (error) {
    return (
      <div
        className={className}
        style={{ ...style, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#B45309' }}
      >
        <span style={{ fontSize: '1.3em' }}>🐶</span>
      </div>
    );
  }
  return (
    <img
      src={MONET_AVATAR}
      alt="Monet, tu perrito de apoyo"
      onError={() => setError(true)}
      className={className}
      style={style}
    />
  );
};

const MonetAssistant = ({ isMonetOpen, setIsMonetOpen }) => {
  const { modoEmpatico } = useContext(ModoEmpaticContext);
  const isWarm = modoEmpatico;
  const navigate = useNavigate();
  const location = useLocation();

  // Recuerda si Monet está abierto y si ya ofreció ayuda en esta página
  const monetOpenRef = useRef(isMonetOpen);
  const yaOfreciAyudaRef = useRef(false);
  useEffect(() => {
    monetOpenRef.current = isMonetOpen;
  }, [isMonetOpen]);

  const [activeTab, setActiveTab] = useState('guia');
  const [chatMessages, setChatMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [selectedFaq, setSelectedFaq] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [pensando, setPensando] = useState(false);
  const chatBottomRef = useRef(null);
  const audioRef = useRef(null); // Audio de la voz natural (ElevenLabs)

  // Mientras la persona escribe en un campo, Monet se aparta para no estorbar.
  const [escribiendo, setEscribiendo] = useState(false);
  useEffect(() => {
    const esCampo = (el) => !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') && !el.closest('[data-monet]');
    const onFocusIn = (e) => { if (esCampo(e.target)) setEscribiendo(true); };
    const onFocusOut = () => { setTimeout(() => setEscribiendo(esCampo(document.activeElement)), 60); };
    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('focusout', onFocusOut);
    return () => { document.removeEventListener('focusin', onFocusIn); document.removeEventListener('focusout', onFocusOut); };
  }, []);

  const horaAhora = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    setChatMessages([{ id: 'init', sender: 'monet', text: GREETING, time: horaAhora() }]);
  }, []);

  useEffect(() => {
    if (activeTab === 'chat') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeTab]);

  // Precarga las voces del navegador (algunas cargan de forma asíncrona).
  useEffect(() => {
    if ('speechSynthesis' in window) { try { window.speechSynthesis.getVoices(); } catch (e) {} }
  }, []);

  // Elige la voz en español más natural que tenga el navegador (evita la robótica por defecto).
  const elegirVozEspanol = () => {
    const voces = (window.speechSynthesis.getVoices && window.speechSynthesis.getVoices()) || [];
    const esp = voces.filter((v) => /es/i.test(v.lang));
    const criterios = [
      (v) => /google/i.test(v.name),
      (v) => /(sabina|helena|laura|paulina|m[oó]nica|luc[ií]a|elena)/i.test(v.name),
      (v) => /es-ES/i.test(v.lang),
      () => true,
    ];
    for (const c of criterios) { const hit = esp.find(c); if (hit) return hit; }
    return null;
  };

  // Detiene cualquier voz que esté sonando (audio natural o voz del navegador).
  const detenerVoz = () => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    } catch (e) {}
    try { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); } catch (e) {}
    setIsSpeaking(false);
  };

  // Respaldo: voz del navegador (por si el servidor de voz natural no responde).
  const hablarConNavegador = (texto) => {
    if (!('speechSynthesis' in window)) { setIsSpeaking(false); return; }
    const u = new SpeechSynthesisUtterance(texto);
    const voz = elegirVozEspanol();
    if (voz) u.voice = voz;
    u.lang = (voz && voz.lang) || 'es-ES';
    u.rate = 1;
    u.pitch = 1.05;
    u.onend = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(u);
  };

  // Lee el texto con la voz natural de Monet (ElevenLabs desde el servidor).
  // Si el servidor no está disponible, usa la voz del navegador como respaldo.
  const hablar = async (texto) => {
    // Si ya está hablando, este clic sirve para detener.
    if (isSpeaking) { detenerVoz(); return; }
    if (!texto || !texto.trim()) return;

    setIsSpeaking(true);
    try {
      const r = await fetch(`${API_URL}/api/voz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto }),
      });
      if (!r.ok) throw new Error('voz-no-disponible');
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => { setIsSpeaking(false); URL.revokeObjectURL(url); };
      audio.onerror = () => { setIsSpeaking(false); URL.revokeObjectURL(url); };
      await audio.play();
    } catch (e) {
      // Si falla la voz natural, usamos la del navegador para no dejar a la persona sin audio.
      hablarConNavegador(texto);
    }
  };

  const cerrar = () => {
    if (isSpeaking) detenerVoz();
    setIsMonetOpen(false);
  };

  const irAConvocatorias = () => {
    setIsMonetOpen(false);
    navigate('/convocatorias');
  };

  // 👉 BOTÓN DIRECTO: lleva a la persona directamente a la convocatoria elegida
  // (abre la ficha de detalle de esa convocatoria, sin ocultar las demás)
  const irAConvocatoriaEspecifica = (c) => {
    setIsMonetOpen(false);
    navigate(`/convocatorias?ver=${encodeURIComponent(c.title)}`);
  };

  // Muestra un mensaje de ayuda proactiva y abre a Monet
  const ofrecerAyudaProactiva = () => {
    setChatMessages((prev) => {
      if (prev.some((m) => m.id === 'ayuda-proactiva')) return prev; // no repetir
      return [...prev, { id: 'ayuda-proactiva', sender: 'monet', text: MENSAJE_AYUDA_PROACTIVA, time: horaAhora() }];
    });
    setActiveTab('chat');
    setIsMonetOpen(true);
  };

  // ⏱️ Temporizador de inactividad del Modo Acompañado
  useEffect(() => {
    const rutaVigilada = RUTAS_VIGILADAS.some((r) => location.pathname.startsWith(r));
    if (!rutaVigilada) return;

    // Al cambiar de página, Monet puede volver a ofrecer ayuda una vez
    yaOfreciAyudaRef.current = false;

    const espera = isWarm ? INACTIVIDAD_EMPATICO_MS : INACTIVIDAD_NORMAL_MS;
    let temporizador;

    const reiniciar = () => {
      clearTimeout(temporizador);
      if (yaOfreciAyudaRef.current) return;
      temporizador = setTimeout(() => {
        // Solo ofrece ayuda si Monet está cerrado y no lo ha hecho ya
        if (yaOfreciAyudaRef.current || monetOpenRef.current) return;
        yaOfreciAyudaRef.current = true;
        ofrecerAyudaProactiva();
      }, espera);
    };

    const eventos = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    eventos.forEach((ev) => window.addEventListener(ev, reiniciar, { passive: true }));
    reiniciar();

    return () => {
      clearTimeout(temporizador);
      eventos.forEach((ev) => window.removeEventListener(ev, reiniciar));
    };
  }, [location.pathname, isWarm]);

  const enviarMensaje = async (textoForzado) => {
    const message = (textoForzado || inputText).trim();
    if (!message) return;

    const userMsg = { id: `u-${Date.now()}`, sender: 'user', text: message, time: horaAhora() };
    setChatMessages((prev) => [...prev, userMsg]);
    if (!textoForzado) setInputText('');

    const lower = message.toLowerCase();
    const palabrasConvo = ['inscrib', 'postul', 'formulario', 'convocatoria', 'recomiend', 'beca', 'estimulo', 'estímulo', 'donde', 'dónde', 'teatro', 'music', 'cine', 'arte', 'literat', 'ficc', 'social', 'guion', 'escrib', 'pintura', 'danza', 'labguion'];
    const esConvo = palabrasConvo.some((k) => lower.includes(k));
    const convocatorias = esConvo ? buscarConvocatorias(lower) : null;

    // Respuesta de respaldo (palabras clave) por si la IA falla
    let reply = respuestaClave(lower);

    setPensando(true);
    try {
      const r = await fetch(`${API_URL}/api/monet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensaje: message }),
      });
      const d = await r.json();
      if (r.ok && d.success && d.respuesta) {
        reply = d.respuesta;
      }
    } catch (e) {
      // Si la IA no responde, se queda con la respuesta de respaldo
    }
    setPensando(false);

    const monetMsg = { id: `m-${Date.now()}`, sender: 'monet', text: reply, time: horaAhora(), convocatorias };
    setChatMessages((prev) => [...prev, monetMsg]);
  };

  return (
    <>
      <aside data-monet aria-label="Asistente virtual Monet" className={`fixed bottom-6 right-6 z-50 flex items-end gap-3 transition-all duration-300 ${escribiendo && !isMonetOpen ? 'opacity-0 translate-y-6 pointer-events-none' : 'opacity-100'}`}>
        {!isMonetOpen && (
          <div
            onClick={() => setIsMonetOpen(true)}
            className={`hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-2xl shadow-xl cursor-pointer transition-all hover:scale-105 animate-bounce ${
              isWarm ? 'bg-white text-[#3A2A1C] border-[#3A2A1C]' : 'bg-white text-purple-950 border-purple-500'
            }`}
            style={{ borderWidth: '3px', borderStyle: 'solid' }}
            role="button"
            tabIndex={0}
            aria-label="Abrir asistente Monet"
            onKeyDown={(e) => e.key === 'Enter' && setIsMonetOpen(true)}
          >
            <Sparkles className={`w-4 h-4 animate-spin ${isWarm ? 'text-[#B45309]' : 'text-purple-600'}`} />
            <span className="text-xs font-extrabold">¿Tienes dudas? Monet te acompaña</span>
          </div>
        )}

        <button
          onClick={() => setIsMonetOpen(!isMonetOpen)}
          className={`relative p-1 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 focus:outline-none ${
            isWarm ? 'bg-[#B45309] text-white' : 'bg-purple-600 text-white'
          }`}
          style={{ borderWidth: '3px', borderStyle: 'solid', borderColor: isWarm ? '#3A2A1C' : '#ffffff' }}
          aria-label={isMonetOpen ? 'Cerrar asistente Monet' : 'Abrir asistente virtual Monet'}
          aria-expanded={isMonetOpen}
        >
          <MonetFace className="w-14 h-14 rounded-full object-cover shadow-inner" />
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
            <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
          </div>
        </button>
      </aside>

      {isMonetOpen && (
        <div
          data-monet
          className="fixed inset-0 sm:inset-auto sm:bottom-24 sm:right-6 z-50 w-full sm:w-[420px] max-h-[90vh] sm:max-h-[640px] flex flex-col rounded-none sm:rounded-3xl shadow-2xl overflow-hidden"
          style={{
            borderWidth: '3px',
            borderStyle: 'solid',
            borderColor: isWarm ? '#3A2A1C' : '#D8B4FE',
            backgroundColor: isWarm ? '#FBF4EC' : '#FAF5FF',
            color: isWarm ? '#3A2A1C' : '#2E1065',
          }}
        >
          <div className={`p-4 border-b-2 flex items-center justify-between gap-3 ${
            isWarm ? 'bg-[#B45309] text-white border-[#3A2A1C]' : 'bg-[#7C3AED] text-white border-purple-800'
          }`}>
            <div className="flex items-center gap-3">
              <div className="relative">
                <MonetFace className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-md" />
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full"></span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-base leading-none">Monet</h3>
                  <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded bg-black/20 text-white">
                    Guía Empática
                  </span>
                </div>
                <p className="text-xs opacity-90 font-medium">Tu perrito compañero paso a paso</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => hablar(GREETING + '. ' + TIPS.join('. '))}
                className="p-2 rounded-full hover:bg-black/15 transition-colors text-white"
                title="Escuchar a Monet en voz alta"
                aria-label="Escuchar a Monet en voz alta"
              >
                {isSpeaking ? <VolumeX className="w-5 h-5 animate-pulse" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <button
                onClick={cerrar}
                className="p-2 rounded-full hover:bg-black/15 transition-colors text-white"
                aria-label="Cerrar ventana de Monet"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className={`flex border-b-2 px-2 text-xs font-bold ${
            isWarm ? 'bg-[#FBF4EC] border-[#3A2A1C]' : 'bg-black/5 border-current/15'
          }`}>
            <button
              onClick={() => setActiveTab('guia')}
              className={`flex-1 py-2.5 px-3 text-center transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'guia' ? (isWarm ? 'text-[#3A2A1C] font-black' : 'text-purple-900 font-black') : 'opacity-70 hover:opacity-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Guía</span>
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-2.5 px-3 text-center transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'chat' ? (isWarm ? 'text-[#3A2A1C] font-black' : 'text-purple-900 font-black') : 'opacity-70 hover:opacity-100'
              }`}
            >
              <MessageCircleHeart className="w-3.5 h-3.5" />
              <span>Pregúntame</span>
            </button>
            <button
              onClick={() => setActiveTab('faqs')}
              className={`flex-1 py-2.5 px-3 text-center transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'faqs' ? (isWarm ? 'text-[#3A2A1C] font-black' : 'text-purple-900 font-black') : 'opacity-70 hover:opacity-100'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Preguntas</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm leading-relaxed">

            {activeTab === 'guia' && (
              <div className="space-y-4">
                <div className={`p-4 rounded-2xl border-2 ${
                  isWarm ? 'bg-white border-[#3A2A1C] text-[#3A2A1C]' : 'bg-purple-50 border-purple-200 text-purple-950'
                }`}>
                  <p className="font-semibold leading-snug">"{GREETING}"</p>
                </div>

                <div>
                  <h4 className="font-extrabold text-xs uppercase tracking-wider mb-2 opacity-80">Consejos clave para ti:</h4>
                  <ul className="space-y-2.5">
                    {TIPS.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs font-medium">
                        <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${isWarm ? 'text-emerald-700' : 'text-emerald-600'}`} />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => { setActiveTab('chat'); enviarMensaje(PROMPT_Q); }}
                    className={`w-full py-2.5 px-3 rounded-xl border-2 text-xs font-bold flex items-center justify-between transition-all ${
                      isWarm ? 'border-[#3A2A1C] bg-white text-[#3A2A1C] hover:bg-[#FBF4EC]' : 'border-purple-600 bg-white text-purple-900 hover:bg-purple-50'
                    }`}
                  >
                    <span>{PROMPT_Q}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'chat' && (
              <div className="flex flex-col space-y-3">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className="space-y-2">
                    <div className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {msg.sender === 'monet' && (
                        <MonetFace className="w-7 h-7 rounded-full object-cover shrink-0 mt-1 border-2 border-[#3A2A1C]" />
                      )}
                      <div className={`max-w-[80%] p-3 rounded-2xl text-xs font-medium border-2 ${
                        msg.sender === 'user'
                          ? isWarm ? 'bg-[#B45309] text-white border-[#3A2A1C]' : 'bg-purple-600 text-white border-purple-700'
                          : isWarm ? 'bg-white text-[#3A2A1C] border-[#3A2A1C] shadow-sm' : 'bg-white text-purple-950 border-purple-200 shadow-sm'
                      }`}>
                        <p>{msg.text}</p>
                        <span className="block text-[9px] opacity-60 text-right mt-1">{msg.time}</span>
                      </div>
                    </div>

                    {msg.convocatorias && msg.convocatorias.length > 0 && (
                      <div className="space-y-2 pl-9">
                        {msg.convocatorias.map((c) => (
                          <div
                            key={c.id}
                            className={`p-3 rounded-xl border-2 ${isWarm ? 'bg-white border-[#3A2A1C]' : 'bg-white border-purple-200'}`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-extrabold text-xs leading-tight">{c.title}</p>
                              <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full shrink-0 ${
                                isWarm ? 'bg-[#B45309] text-white' : 'bg-[#7C3AED] text-white'
                              }`}>{c.category}</span>
                            </div>
                            <div className="flex items-center gap-3 mt-1.5 text-[10px] font-bold opacity-80">
                              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {c.closeDate}</span>
                              <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {c.cupos} cupos</span>
                            </div>
                            <div className="flex gap-1.5 mt-2">
                              <button
                                onClick={() => irAConvocatoriaEspecifica(c)}
                                className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-black flex items-center justify-center gap-1 border-2 ${
                                  isWarm ? 'bg-[#B45309] text-white border-[#3A2A1C] hover:bg-[#92400E]' : 'bg-[#7C3AED] text-white border-[#6D28D9] hover:bg-[#6D28D9]'
                                }`}
                              >
                                <span>Postularme</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => irAConvocatoriaEspecifica(c)}
                                className={`py-1.5 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 border-2 ${
                                  isWarm ? 'border-[#3A2A1C] bg-white text-[#3A2A1C] hover:bg-amber-50' : 'border-purple-300 bg-white text-purple-900 hover:bg-purple-50'
                                }`}
                              >
                                <BookOpen className="w-3 h-3" />
                                <span>Ver</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {pensando && (
                  <div className="flex gap-2.5 justify-start">
                    <MonetFace className="w-7 h-7 rounded-full object-cover shrink-0 mt-1 border-2 border-[#3A2A1C]" />
                    <div className={`p-3 rounded-2xl text-xs font-medium border-2 ${
                      isWarm ? 'bg-white text-[#3A2A1C] border-[#3A2A1C]' : 'bg-white text-purple-950 border-purple-200'
                    }`}>
                      <span className="opacity-70">Monet está escribiendo… 🐾</span>
                    </div>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>
            )}

            {activeTab === 'faqs' && (
              <div className="space-y-2.5">
                {FAQS.map((faq, idx) => (
                  <div key={idx} className={`border-2 rounded-xl overflow-hidden ${
                    isWarm ? 'border-[#3A2A1C] bg-white text-[#3A2A1C]' : 'border-purple-200 bg-white'
                  }`}>
                    <button
                      onClick={() => setSelectedFaq(selectedFaq === idx ? null : idx)}
                      className="w-full p-3 text-left text-xs font-bold flex items-center justify-between gap-2 hover:bg-black/5"
                    >
                      <span>{faq.q}</span>
                      <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${selectedFaq === idx ? 'rotate-90' : ''}`} />
                    </button>
                    {selectedFaq === idx && (
                      <div className="p-3 pt-0 text-xs font-medium opacity-90 border-t-2 border-current/10">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {activeTab === 'chat' && (
            <div className={`p-3 border-t-2 border-current/15 flex items-center gap-2 ${isWarm ? 'bg-[#FBF4EC]' : 'bg-black/5'}`}>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && enviarMensaje()}
                placeholder="Escribe tu duda a Monet..."
                className={`flex-1 px-3 py-2 rounded-xl text-xs font-bold border-2 outline-none ${
                  isWarm ? 'bg-white text-[#3A2A1C] border-[#3A2A1C] placeholder:text-[#3A2A1C]/60' : 'bg-white text-purple-950 border-purple-300 placeholder:text-purple-400 focus:border-purple-600'
                }`}
              />
              <button
                onClick={() => enviarMensaje()}
                className={`p-2 rounded-xl border-2 font-bold transition-transform active:scale-95 ${
                  isWarm ? 'bg-[#B45309] text-white border-[#3A2A1C] hover:bg-[#92400E]' : 'bg-purple-600 text-white border-purple-700'
                }`}
                aria-label="Enviar mensaje a Monet"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="py-2 px-4 text-center border-t-2 border-current/10 bg-black/5 text-[10px] opacity-75 font-semibold">
            Asistencia oficial inclusiva • Adaptada a normas WCAG AAA
          </div>
        </div>
      )}
    </>
  );
};

export default MonetAssistant;