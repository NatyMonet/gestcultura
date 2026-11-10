import React from 'react';
import { Eye, HeartHandshake, Volume2, VolumeX, Sparkles } from 'lucide-react';
import Swal from 'sweetalert2';

export const AccessibilityToolbar = ({
  modoEmpatico,
  setModoEmpatico,
  textScale = 'normal',
  setTextScale,
  isReading = false,
  onToggleRead,
  onOpenMonet
}) => {
  return (
    <aside
      aria-label="Barra de herramientas de accesibilidad"
      className={`w-full border-b-2 py-2 px-4 sm:px-8 transition-colors z-40 ${
        modoEmpatico
          ? 'bg-[#FBF4EC] border-[#3A2A1C] text-[#3A2A1C]'
          : 'bg-[#F2EEFA] border-[#D6C7EB] text-[#2E1052]'
      }`}
      style={{ borderWidth: '2px' }}
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">

        {/* Lado izquierdo: WCAG AAA y Switch de Modo Acompañado */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className={`font-bold flex items-center gap-1.5 px-3 py-1 rounded-full text-xs uppercase tracking-wider ${
            modoEmpatico
              ? 'border-2 border-[#3A2A1C] bg-white text-[#3A2A1C]'
              : 'border border-purple-300 bg-white/80 text-purple-950'
          }`}>
            <Eye className="w-3.5 h-3.5" />
            <span>Accesibilidad WCAG AAA</span>
          </span>

          <span className="hidden sm:inline opacity-40">|</span>

          {/* Switch Modo Acompañado */}
          <button
            type="button"
            onClick={() => {
              const activar = !modoEmpatico;
              setModoEmpatico(activar);
              if (activar) {
                Swal.fire({
                  title: 'Modo Acompañado activado 🧡',
                  html: 'Lo diseñamos pensando en tu comodidad, especialmente para personas mayores de 50 años: <b>colores cálidos, letras más grandes y botones claros</b>.<br/><br/>Elegimos tonos cálidos porque son más amables con la vista y cansan menos al leer.<br/><br/><i>Porque creemos que la tecnología debe ser amable con todos.</i>',
                  confirmButtonText: 'Entendido',
                  confirmButtonColor: '#B45309',
                });
              }
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 font-black text-xs transition-all shadow-xs ${
              modoEmpatico
                ? 'bg-[#B45309] text-white border-[#3A2A1C]'
                : 'bg-white border-purple-300 text-purple-950 hover:bg-purple-50'
            }`}
          >
            <HeartHandshake className="w-4 h-4" />
            <span>Modo Acompañado</span>

            <span className={`inline-flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 border transition-colors ${
              modoEmpatico ? 'bg-amber-950/40 border-white/60 justify-end' : 'bg-gray-200 border-gray-300 justify-start'
            }`}>
              <span className="h-3.5 w-3.5 rounded-full bg-white shadow-xs" />
            </span>

            <span className="text-[11px] font-black uppercase">
              {modoEmpatico ? 'Activado' : 'Desactivado'}
            </span>
          </button>

          {/* Botón Preguntar edad */}
          <button
            type="button"
            onClick={async () => {
              const { value: edad } = await Swal.fire({
                title: '¿Cuántos años tienes?',
                input: 'number',
                inputLabel: 'Nos ayuda a adaptar la página para que te sientas cómodo/a',
                inputPlaceholder: 'Escribe tu edad',
                confirmButtonText: 'Continuar',
                confirmButtonColor: '#6D28D9',
                inputAttributes: { min: '1', max: '120' },
              });
              if (edad) {
                const n = parseInt(edad, 10);
                if (n >= 50) {
                  setModoEmpatico(true);
                  setTextScale('large');
                  Swal.fire({
                    title: 'Modo Acompañado activado 🧡',
                    html: 'Adaptamos la página para tu comodidad: <b>colores cálidos, letras más grandes y botones claros</b>.<br/><br/>Elegimos tonos cálidos porque son más amables con la vista y cansan menos al leer. <i>Porque creemos que la tecnología debe ser amable con todos.</i>',
                    confirmButtonText: 'Entendido',
                    confirmButtonColor: '#B45309'
                  });
                } else {
                  setModoEmpatico(false);
                  setTextScale('normal');
                  Swal.fire({
                    icon: 'info',
                    title: '¡Perfecto!',
                    text: 'Dejamos la página en su modo estándar. Puedes activar el Modo Acompañado cuando quieras.',
                    confirmButtonColor: '#6D28D9'
                  });
                }
              }
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-black border-2 transition-all ${
              modoEmpatico
                ? 'bg-white text-[#3A2A1C] border-[#3A2A1C] hover:bg-amber-50'
                : 'bg-white text-purple-950 border-purple-300 hover:bg-purple-50'
            }`}
            title="Preguntar edad"
          >
            Preguntar edad
          </button>
        </div>

        {/* Lado derecho: Selector A / A+ / A++, Voz y Monet */}
        <div className="flex items-center gap-3 flex-wrap">

          {/* Selector de tamaño de fuente */}
          <div className={`flex items-center gap-1 p-1 rounded-xl border-2 ${
            modoEmpatico ? 'bg-white border-[#3A2A1C]' : 'bg-white/80 border-purple-200'
          }`}>
            <span className="text-xs font-bold px-1.5">Tamaño:</span>

            <button
              type="button"
              onClick={() => setTextScale('normal')}
              className={`px-2 py-0.5 rounded-lg text-xs font-black transition-all ${
                textScale === 'normal'
                  ? modoEmpatico ? 'bg-[#B45309] text-white' : 'bg-[#6D28D9] text-white'
                  : 'hover:bg-black/5 opacity-70'
              }`}
              title="Texto normal"
            >
              A
            </button>

            <button
              type="button"
              onClick={() => setTextScale('large')}
              className={`px-2 py-0.5 rounded-lg text-sm font-black transition-all ${
                textScale === 'large'
                  ? modoEmpatico ? 'bg-[#B45309] text-white' : 'bg-[#6D28D9] text-white'
                  : 'hover:bg-black/5 opacity-70'
              }`}
              title="Texto grande (+18%)"
            >
              A+
            </button>

            <button
              type="button"
              onClick={() => setTextScale('xlarge')}
              className={`px-2 py-0.5 rounded-lg text-base font-black transition-all ${
                textScale === 'xlarge'
                  ? modoEmpatico ? 'bg-[#B45309] text-white' : 'bg-[#6D28D9] text-white'
                  : 'hover:bg-black/5 opacity-70'
              }`}
              title="Texto extra grande (+35%)"
            >
              A++
            </button>
          </div>

          {/* Lector de pantalla */}
          <button
            type="button"
            onClick={onToggleRead}
            className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 border-2 transition-all ${
              isReading
                ? 'bg-rose-600 text-white border-rose-700 animate-pulse'
                : modoEmpatico
                  ? 'bg-white border-[#3A2A1C] text-[#3A2A1C] hover:bg-amber-50'
                  : 'bg-white border-purple-200 text-purple-950 hover:bg-purple-50'
            }`}
          >
            {isReading ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-[#B45309]" />}
            <span>{isReading ? 'Detener lectura' : 'Leer en voz alta'}</span>
          </button>

          {/* Acceso a Monet */}
          <button
            type="button"
            onClick={() => onOpenMonet?.()}
            className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 border-2 transition-all ${
              modoEmpatico
                ? 'bg-[#B45309] text-white border-[#3A2A1C] hover:opacity-90'
                : 'bg-[#6D28D9] text-white border-[#4A148C] hover:opacity-90'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Asistente Monet</span>
            <Sparkles className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300 animate-spin" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AccessibilityToolbar;
