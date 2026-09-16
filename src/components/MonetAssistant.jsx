import { useState, useRef, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
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

const MonetFace = ({ className, style }) => {
  const [error, setError] = useState(false);
  if (error) {
    return (
      <div
        className={className}
        style={{ ...style, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#C75000' }}
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

  const [activeTab, setActiveTab] = useState('guia');
  const [chatMessages, setChatMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [selectedFaq, setSelectedFaq] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [pensando, setPensando] = useState(false);
  const chatBottomRef = useRef(null);

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

  const hablar = (texto) => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const u = new SpeechSynthesisUtterance(texto);
    u.lang = 'es-ES';
    u.rate = 0.95;
    u.onend = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(u);
  };

  const cerrar = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    setIsMonetOpen(false);
  };

  const irAConvocatorias = () => {
    setIsMonetOpen(false);
    navigate('/convocatorias');
  };

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
      const r = await fetch('http://localhost:5000/api/monet', {
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
      <aside aria-label="Asistente virtual Monet" className="fixed bottom-6 right-6 z-50 flex items-end gap-3">
        {!isMonetOpen && (
          <div
            onClick={() => setIsMonetOpen(true)}
            className={`hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-2xl shadow-xl cursor-pointer transition-all hover:scale-105 animate-bounce ${
              isWarm ? 'bg-white text-[#2B1600] border-[#2B1600]' : 'bg-white text-purple-950 border-purple-500'
            }`}
            style={{ borderWidth: '3px', borderStyle: 'solid' }}
            role="button"
            tabIndex={0}
            aria-label="Abrir asistente Monet"
            onKeyDown={(e) => e.key === 'Enter' && setIsMonetOpen(true)}
          >
            <Sparkles className={`w-4 h-4 animate-spin ${isWarm ? 'text-[#C75000]' : 'text-purple-600'}`} />
            <span className="text-xs font-extrabold">¿Tienes dudas? Monet te acompaña</span>
          </div>
        )}

        <button
          onClick={() => setIsMonetOpen(!isMonetOpen)}
          className={`relative p-1 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 focus:outline-none ${
            isWarm ? 'bg-[#C75000] text-white' : 'bg-purple-600 text-white'
          }`}
          style={{ borderWidth: '3px', borderStyle: 'solid', borderColor: isWarm ? '#2B1600' : '#ffffff' }}
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
          className="fixed inset-0 sm:inset-auto sm:bottom-24 sm:right-6 z-50 w-full sm:w-[420px] max-h-[90vh] sm:max-h-[640px] flex flex-col rounded-none sm:rounded-3xl shadow-2xl overflow-hidden"
          style={{
            borderWidth: '3px',
            borderStyle: 'solid',
            borderColor: isWarm ? '#2B1600' : '#D8B4FE',
            backgroundColor: isWarm ? '#FFF7EF' : '#FAF5FF',
            color: isWarm ? '#2B1600' : '#2E1065',
          }}
        >
          <div className={`p-4 border-b-2 flex items-center justify-between gap-3 ${
            isWarm ? 'bg-[#C75000] text-white border-[#2B1600]' : 'bg-[#7C3AED] text-white border-purple-800'
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
            isWarm ? 'bg-[#FFF7EF] border-[#2B1600]' : 'bg-black/5 border-current/15'
          }`}>
            <button
              onClick={() => setActiveTab('guia')}
              className={`flex-1 py-2.5 px-3 text-center transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'guia' ? (isWarm ? 'text-[#2B1600] font-black' : 'text-purple-900 font-black') : 'opacity-70 hover:opacity-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Guía</span>
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-2.5 px-3 text-center transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'chat' ? (isWarm ? 'text-[#2B1600] font-black' : 'text-purple-900 font-black') : 'opacity-70 hover:opacity-100'
              }`}
            >
              <MessageCircleHeart className="w-3.5 h-3.5" />
              <span>Pregúntame</span>
            </button>
            <button
              onClick={() => setActiveTab('faqs')}
              className={`flex-1 py-2.5 px-3 text-center transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'faqs' ? (isWarm ? 'text-[#2B1600] font-black' : 'text-purple-900 font-black') : 'opacity-70 hover:opacity-100'
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
                  isWarm ? 'bg-white border-[#2B1600] text-[#2B1600]' : 'bg-purple-50 border-purple-200 text-purple-950'
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
                      isWarm ? 'border-[#2B1600] bg-white text-[#2B1600] hover:bg-[#FFF7EF]' : 'border-purple-600 bg-white text-purple-900 hover:bg-purple-50'
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
                        <MonetFace className="w-7 h-7 rounded-full object-cover shrink-0 mt-1 border-2 border-[#2B1600]" />
                      )}
                      <div className={`max-w-[80%] p-3 rounded-2xl text-xs font-medium border-2 ${
                        msg.sender === 'user'
                          ? isWarm ? 'bg-[#C75000] text-white border-[#2B1600]' : 'bg-purple-600 text-white border-purple-700'
                          : isWarm ? 'bg-white text-[#2B1600] border-[#2B1600] shadow-sm' : 'bg-white text-purple-950 border-purple-200 shadow-sm'
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
                            className={`p-3 rounded-xl border-2 ${isWarm ? 'bg-white border-[#2B1600]' : 'bg-white border-purple-200'}`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-extrabold text-xs leading-tight">{c.title}</p>
                              <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full shrink-0 ${
                                isWarm ? 'bg-[#C75000] text-white' : 'bg-[#7C3AED] text-white'
                              }`}>{c.category}</span>
                            </div>
                            <div className="flex items-center gap-3 mt-1.5 text-[10px] font-bold opacity-80">
                              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {c.closeDate}</span>
                              <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {c.cupos} cupos</span>
                            </div>
                            <div className="flex gap-1.5 mt-2">
                              <button
                                onClick={irAConvocatorias}
                                className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-black flex items-center justify-center gap-1 border-2 ${
                                  isWarm ? 'bg-[#C75000] text-white border-[#2B1600] hover:bg-[#A93F00]' : 'bg-[#7C3AED] text-white border-[#6D28D9] hover:bg-[#6D28D9]'
                                }`}
                              >
                                <span>Postularme</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                              <button
                                onClick={irAConvocatorias}
                                className={`py-1.5 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 border-2 ${
                                  isWarm ? 'border-[#2B1600] bg-white text-[#2B1600] hover:bg-amber-50' : 'border-purple-300 bg-white text-purple-900 hover:bg-purple-50'
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
                    <MonetFace className="w-7 h-7 rounded-full object-cover shrink-0 mt-1 border-2 border-[#2B1600]" />
                    <div className={`p-3 rounded-2xl text-xs font-medium border-2 ${
                      isWarm ? 'bg-white text-[#2B1600] border-[#2B1600]' : 'bg-white text-purple-950 border-purple-200'
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
                    isWarm ? 'border-[#2B1600] bg-white text-[#2B1600]' : 'border-purple-200 bg-white'
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
            <div className={`p-3 border-t-2 border-current/15 flex items-center gap-2 ${isWarm ? 'bg-[#FFF7EF]' : 'bg-black/5'}`}>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && enviarMensaje()}
                placeholder="Escribe tu duda a Monet..."
                className={`flex-1 px-3 py-2 rounded-xl text-xs font-bold border-2 outline-none ${
                  isWarm ? 'bg-white text-[#2B1600] border-[#2B1600] placeholder:text-[#2B1600]/60' : 'bg-white text-purple-950 border-purple-300 placeholder:text-purple-400 focus:border-purple-600'
                }`}
              />
              <button
                onClick={() => enviarMensaje()}
                className={`p-2 rounded-xl border-2 font-bold transition-transform active:scale-95 ${
                  isWarm ? 'bg-[#C75000] text-white border-[#2B1600] hover:bg-[#A93F00]' : 'bg-purple-600 text-white border-purple-700'
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