// ============================================================================
// COMPONENTE: RevisorOrtografia — corrector de ortografía empático
// Ficha SENA: 3013183 | Estudiante: Natalia Mejía Cardona
// ----------------------------------------------------------------------------
// Botón "Revisar ortografía" que analiza un texto en español y muestra, en un
// panel amable, las palabras con posibles errores (incluidas las que les falta
// una letra o una tilde) con sugerencias de corrección en las que se puede
// hacer clic para aplicarlas. Pensado para acompañar sin estresar al usuario,
// especialmente a las personas mayores (Modo Acompañado).
// ============================================================================
import { useState } from 'react';
import { SpellCheck2, Check, Sparkles } from 'lucide-react';
import { revisarTexto } from '../utils/corrector';

export default function RevisorOrtografia({ texto, onCorregir, isWarm, C, fs }) {
  const [revisando, setRevisando] = useState(false);
  const [revisado, setRevisado] = useState(false);
  const [hallazgos, setHallazgos] = useState([]);
  const [error, setError] = useState(false);

  const acento = C?.acento || '#6A1B9A';
  const textoColor = C?.texto || '#2E1065';
  const suave = C?.suave || '#F5EEFB';
  const borde = C?.borde || '#E9D5FF';
  const fuente = fs || '16px';

  const revisar = async () => {
    setError(false);
    setRevisando(true);
    try {
      const res = await revisarTexto(texto || '');
      setHallazgos(res);
      setRevisado(true);
    } catch (e) {
      setError(true);
    } finally {
      setRevisando(false);
    }
  };

  // Al aplicar una corrección, cambiamos la palabra y quitamos ese hallazgo.
  const aplicar = (palabra, correccion) => {
    if (onCorregir) onCorregir(palabra, correccion);
    setHallazgos((prev) => prev.filter((h) => h.palabra !== palabra));
  };

  return (
    <div style={{ marginTop: '10px' }}>
      <button
        type="button"
        onClick={revisar}
        disabled={revisando || !texto || !texto.trim()}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '10px 16px',
          background: revisando ? '#999' : '#fff',
          color: acento, border: `2px solid ${acento}`, borderRadius: '9px',
          cursor: revisando || !texto || !texto.trim() ? 'not-allowed' : 'pointer',
          fontWeight: 'bold', fontSize: '14px',
        }}
      >
        <SpellCheck2 size={16} />
        {revisando ? 'Revisando…' : 'Revisar ortografía'}
      </button>

      {error && (
        <p style={{ color: '#b00', fontSize: '13px', marginTop: '8px' }}>
          No se pudo cargar el corrector en este momento. Puedes seguir sin él.
        </p>
      )}

      {revisado && !error && hallazgos.length === 0 && (
        <div style={{
          marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px',
          background: '#E9F9F1', border: '2px solid #1baf7a', borderRadius: '10px',
          padding: '10px 14px', color: '#0f6b4a', fontSize: fuente, fontWeight: 600,
        }}>
          <Sparkles size={18} color="#1baf7a" />
          ¡Todo se ve bien! No encontré palabras con errores. 🎉
        </div>
      )}

      {hallazgos.length > 0 && (
        <div style={{
          marginTop: '10px', background: suave, border: `2px solid ${borde}`,
          borderRadius: '12px', padding: '14px 16px',
        }}>
          <p style={{ margin: '0 0 10px', color: textoColor, fontSize: fuente, fontWeight: 700 }}>
            Encontré {hallazgos.length} palabra{hallazgos.length === 1 ? '' : 's'} que quizás quieras revisar.
            {' '}Toca una sugerencia para corregirla:
          </p>
          {hallazgos.map((h) => (
            <div key={h.palabra} style={{
              padding: '8px 0', borderTop: `1px solid ${borde}`,
              display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px',
            }}>
              <span style={{ color: '#b00', fontWeight: 'bold', fontSize: fuente, textDecoration: 'underline wavy #b00' }}>
                {h.palabra}
              </span>
              <span style={{ color: textoColor, opacity: 0.7, fontSize: '14px' }}>→</span>
              {h.sugerencias.length > 0 ? (
                h.sugerencias.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => aplicar(h.palabra, s)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '5px',
                      padding: '5px 12px', background: acento, color: '#fff',
                      border: 'none', borderRadius: '9999px', cursor: 'pointer',
                      fontWeight: 'bold', fontSize: '14px',
                    }}
                  >
                    <Check size={13} /> {s}
                  </button>
                ))
              ) : (
                <span style={{ color: textoColor, opacity: 0.7, fontSize: '14px', fontStyle: 'italic' }}>
                  revísala con calma (sin sugerencia)
                </span>
              )}
            </div>
          ))}
          <p style={{ margin: '10px 0 0', color: textoColor, opacity: 0.7, fontSize: '13px' }}>
            Tranquilo/a: tú decides qué cambiar. Si una palabra está bien (un nombre propio, por ejemplo), déjala como está. 💜
          </p>
        </div>
      )}
    </div>
  );
}
