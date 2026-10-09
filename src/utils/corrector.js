// ============================================================================
// UTILIDAD: Corrector de ortografía en español (propio del sistema)
// Ficha SENA: 3013183 | Estudiante: Natalia Mejía Cardona
// ----------------------------------------------------------------------------
// Revisa un texto en español y devuelve las palabras con posibles errores
// (incluidas las que les falta una letra o una tilde) junto con sugerencias de
// corrección. Usa el motor nspell y un diccionario de español real (Hunspell),
// que se carga una sola vez, bajo demanda, desde /dict (no depende del navegador).
// Pensado con enfoque empático: acompaña a la persona a revisar su escritura.
// ============================================================================

// Promesa única: el diccionario se descarga y prepara una sola vez por sesión.
let correctorPromesa = null;

/**
 * Carga (una sola vez) el motor de corrección con el diccionario de español.
 * @returns {Promise<object>} instancia de nspell lista para usar.
 */
export function cargarCorrector() {
  if (!correctorPromesa) {
    correctorPromesa = (async () => {
      // Descargamos el diccionario (archivos estáticos en /public/dict).
      const [resAff, resDic] = await Promise.all([
        fetch('/dict/es.aff'),
        fetch('/dict/es.dic'),
      ]);
      if (!resAff.ok || !resDic.ok) {
        throw new Error('No se pudo cargar el diccionario de español.');
      }
      const [aff, dic] = await Promise.all([resAff.text(), resDic.text()]);
      // Importación dinámica: nspell solo se carga cuando se usa el corrector.
      const { default: nspell } = await import('nspell');
      return nspell(aff, dic);
    })();
  }
  return correctorPromesa;
}

// Caracteres que forman parte de una palabra en español (incluye tildes y ñ).
const LETRAS = 'A-Za-zÁÉÍÓÚÜÑáéíóúüñ';
const RE_PALABRA = new RegExp(`[${LETRAS}]+(?:[-'][${LETRAS}]+)*`, 'g');

/**
 * Revisa un texto y devuelve la lista de palabras con posibles errores.
 * Cada hallazgo trae la palabra, su posición y hasta 4 sugerencias.
 * @param {string} texto
 * @returns {Promise<Array<{palabra:string, inicio:number, fin:number, sugerencias:string[]}>>}
 */
export async function revisarTexto(texto) {
  if (!texto || !texto.trim()) return [];
  const spell = await cargarCorrector();
  const hallazgos = [];
  const vistas = new Set(); // evita repetir la misma palabra muchas veces
  let m;
  RE_PALABRA.lastIndex = 0;
  while ((m = RE_PALABRA.exec(texto)) !== null) {
    const palabra = m[0];
    // Ignoramos palabras muy cortas, números y siglas en MAYÚSCULAS.
    if (palabra.length < 2) continue;
    if (palabra === palabra.toUpperCase() && palabra.length <= 4) continue;
    if (spell.correct(palabra)) continue;
    const clave = palabra.toLowerCase();
    if (vistas.has(clave)) continue;
    vistas.add(clave);
    hallazgos.push({
      palabra,
      inicio: m.index,
      fin: m.index + palabra.length,
      sugerencias: spell.suggest(palabra).slice(0, 4),
    });
  }
  return hallazgos;
}

/**
 * Reemplaza en el texto la primera aparición de una palabra por su corrección,
 * respetando el resto del contenido.
 * @param {string} texto
 * @param {string} palabra  palabra mal escrita
 * @param {string} correccion  palabra corregida
 * @returns {string} texto corregido
 */
export function aplicarCorreccion(texto, palabra, correccion) {
  const re = new RegExp(`(^|[^${LETRAS}])(${escaparRegex(palabra)})(?=[^${LETRAS}]|$)`);
  return texto.replace(re, (_coincidencia, antes) => `${antes}${correccion}`);
}

function escaparRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
