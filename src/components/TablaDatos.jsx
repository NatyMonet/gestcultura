// ============================================================================
// COMPONENTE: TablaDatos (tabla con búsqueda y ordenamiento, estilo DataTables)
// Ficha SENA: 3013183 | Estudiante: Natalia Mejía Cardona
// ----------------------------------------------------------------------------
// Tabla reutilizable que ofrece:
//   - Un buscador que filtra las filas por cualquier columna (sin tildes).
//   - Ordenamiento al hacer clic en el encabezado de una columna (A→Z / Z→A).
//   - Diseño responsivo y respeto del Modo Empático.
// Se usa pasándole las columnas y los datos:
//   <TablaDatos columnas={[...]} datos={[...]} />
// Cada columna: { clave, titulo, tipo?: 'numero'|'texto', ordenable?: bool,
//                 render?: (valor, fila) => contenido }
// ============================================================================
import { useState, useMemo, useContext } from 'react';
import { Search, ArrowUp, ArrowDown, ChevronsUpDown } from 'lucide-react';
import { ModoEmpaticContext } from '../context/ModoEmpatico';

// Quita tildes y pasa a minúsculas, para que la búsqueda sea más amable.
const normalizar = (texto) =>
  String(texto ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

export default function TablaDatos({
  columnas = [],
  datos = [],
  minWidth = '760px',
  placeholderBuscar = 'Buscar…',
  filaClave,
}) {
  const { modoEmpatico } = useContext(ModoEmpaticContext);
  const isWarm = modoEmpatico;

  const C = {
    bg: isWarm ? '#FFF7EF' : '#FFFFFF',
    texto: isWarm ? '#2B1600' : '#2E1065',
    acento: isWarm ? '#C75000' : '#6A1B9A',
    borde: isWarm ? '#E7C9B3' : '#E9D5FF',
    fila: isWarm ? '#FCEBDD' : '#F5EEFB',
    inputBg: isWarm ? '#FFFDF9' : '#FAF7FE',
  };
  const fs = isWarm ? '17px' : '15px';

  const [query, setQuery] = useState('');
  const [ordenClave, setOrdenClave] = useState(null);
  const [ordenDir, setOrdenDir] = useState('asc'); // 'asc' | 'desc'

  // Filtrado por el texto del buscador (busca en todas las columnas)
  const filtrados = useMemo(() => {
    const q = normalizar(query).trim();
    if (!q) return datos;
    return datos.filter((fila) =>
      columnas.some((col) => normalizar(fila[col.clave]).includes(q))
    );
  }, [datos, columnas, query]);

  // Ordenamiento según la columna elegida
  const ordenados = useMemo(() => {
    if (!ordenClave) return filtrados;
    const col = columnas.find((c) => c.clave === ordenClave);
    const copia = [...filtrados];
    copia.sort((a, b) => {
      const va = a[ordenClave];
      const vb = b[ordenClave];
      let comp;
      if (col && col.tipo === 'numero') {
        comp = (Number(va) || 0) - (Number(vb) || 0);
      } else {
        comp = String(va ?? '').localeCompare(String(vb ?? ''), 'es', { sensitivity: 'base' });
      }
      return ordenDir === 'asc' ? comp : -comp;
    });
    return copia;
  }, [filtrados, ordenClave, ordenDir, columnas]);

  const clicEncabezado = (col) => {
    if (col.ordenable === false) return;
    if (ordenClave === col.clave) {
      setOrdenDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setOrdenClave(col.clave);
      setOrdenDir('asc');
    }
  };

  const iconoOrden = (col) => {
    if (col.ordenable === false) return null;
    if (ordenClave !== col.clave) return <ChevronsUpDown size={14} style={{ opacity: 0.5 }} />;
    return ordenDir === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
  };

  return (
    <div>
      {/* Buscador */}
      <div style={{ position: 'relative', maxWidth: '360px', marginBottom: '14px' }}>
        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: C.acento, display: 'flex' }}>
          <Search size={18} />
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholderBuscar}
          style={{
            width: '100%', padding: '10px 12px 10px 40px', boxSizing: 'border-box',
            borderRadius: '10px', border: `2px solid ${C.borde}`, fontSize: fs,
            outline: 'none', background: C.inputBg, color: C.texto,
          }}
          onFocus={(e) => (e.target.style.border = `2px solid ${C.acento}`)}
          onBlur={(e) => (e.target.style.border = `2px solid ${C.borde}`)}
        />
      </div>

      {/* Contador de resultados */}
      <p style={{ color: C.texto, opacity: 0.7, fontSize: '13px', margin: '0 0 10px' }}>
        {ordenados.length} {ordenados.length === 1 ? 'resultado' : 'resultados'}
        {query ? ` para "${query}"` : ''}
      </p>

      <div style={{ overflowX: 'auto', border: `2px solid ${C.borde}`, borderRadius: '12px', background: C.bg, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth }}>
          <thead>
            <tr style={{ background: C.acento, color: '#fff' }}>
              {columnas.map((col) => (
                <th
                  key={col.clave}
                  onClick={() => clicEncabezado(col)}
                  style={{
                    padding: '12px', textAlign: 'left', fontSize: fs, fontWeight: 'bold',
                    cursor: col.ordenable === false ? 'default' : 'pointer',
                    userSelect: 'none', whiteSpace: 'nowrap',
                  }}
                  title={col.ordenable === false ? '' : 'Clic para ordenar'}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    {col.titulo} {iconoOrden(col)}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ordenados.length === 0 ? (
              <tr>
                <td colSpan={columnas.length} style={{ padding: '18px', textAlign: 'center', color: C.texto, fontSize: fs, opacity: 0.8 }}>
                  No se encontraron resultados. 🐾
                </td>
              </tr>
            ) : (
              ordenados.map((fila, i) => (
                <tr key={filaClave ? filaClave(fila) : i} style={{ background: i % 2 === 0 ? 'transparent' : C.fila }}>
                  {columnas.map((col) => (
                    <td key={col.clave} style={{ padding: '12px', textAlign: 'left', fontSize: fs, color: C.texto, borderTop: `1px solid ${C.borde}`, ...(col.estilo || {}) }}>
                      {col.render ? col.render(fila[col.clave], fila) : (fila[col.clave] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
