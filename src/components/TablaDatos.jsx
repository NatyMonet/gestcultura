// ============================================================================
// COMPONENTE: TablaDatos (tabla con búsqueda, ordenamiento y exportación)
// Ficha SENA: 3013183 | Estudiante: Natalia Mejía Cardona
// ----------------------------------------------------------------------------
// Tabla reutilizable que ofrece:
//   - Un buscador que filtra las filas por cualquier columna (sin tildes).
//   - Ordenamiento al hacer clic en el encabezado de una columna (A→Z / Z→A).
//   - Exportar a CSV (se abre en Excel) y a PDF (listo para imprimir).
//   - Diseño responsivo y respeto del Modo Empático.
// Se usa pasándole las columnas y los datos:
//   <TablaDatos columnas={[...]} datos={[...]} nombreArchivo="postulaciones" />
// Cada columna: { clave, titulo, tipo?: 'numero'|'texto', ordenable?: bool,
//                 render?: (valor, fila) => contenido,
//                 exportable?: bool,            // false = no sale en CSV/PDF
//                 exportar?: (fila) => string } // texto a mostrar al exportar
// ============================================================================
import { useState, useMemo, useContext } from 'react';
import { Search, ArrowUp, ArrowDown, ChevronsUpDown, FileSpreadsheet, FileText } from 'lucide-react';
import { ModoEmpaticContext } from '../context/ModoEmpatico';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  nombreArchivo = 'datos',
  tituloExport,
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

  // --------------------------------------------------------------------------
  // EXPORTACIÓN (CSV y PDF) — exporta lo que se ve: ya filtrado y ordenado.
  // --------------------------------------------------------------------------
  // Columnas que sí van en la exportación (se omiten las de solo acciones).
  const colsExport = columnas.filter((c) => c.exportable !== false);

  // Texto "plano" de una celda para CSV/PDF (sin componentes ni colores).
  const valorCelda = (col, fila) => {
    if (typeof col.exportar === 'function') return col.exportar(fila);
    const v = fila[col.clave];
    return v === null || v === undefined ? '' : String(v);
  };

  // Dispara la descarga de un archivo en el navegador.
  const descargar = (blob, nombre) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombre;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Nombre con fecha para no sobrescribir descargas: postulaciones_2026-10-01
  const nombreConFecha = () => {
    const hoy = new Date().toISOString().slice(0, 10);
    return `${nombreArchivo}_${hoy}`;
  };

  // Exportar a CSV (con BOM para las tildes y punto y coma como separador,
  // que es lo que espera Excel en español para repartir en columnas).
  const exportarCSV = () => {
    if (ordenados.length === 0) return;
    const SEP = ';';
    const comillas = (t) => `"${String(t).replace(/"/g, '""')}"`;
    const encabezado = colsExport.map((c) => comillas(c.titulo)).join(SEP);
    const lineas = ordenados.map((fila) =>
      colsExport.map((c) => comillas(valorCelda(c, fila))).join(SEP)
    );
    const csv = [encabezado, ...lineas].join('\r\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    descargar(blob, `${nombreConFecha()}.csv`);
  };

  // Exportar a PDF (tabla lista para imprimir o mostrar al profe).
  const exportarPDF = () => {
    if (ordenados.length === 0) return;
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const titulo = tituloExport || nombreArchivo;
    doc.setFontSize(14);
    doc.setTextColor(106, 27, 154);
    doc.text(titulo, 14, 15);
    doc.setFontSize(9);
    doc.setTextColor(90, 90, 90);
    doc.text(`Generado el ${new Date().toLocaleString('es-CO')} · GestCultura`, 14, 21);
    autoTable(doc, {
      head: [colsExport.map((c) => c.titulo)],
      body: ordenados.map((fila) => colsExport.map((c) => valorCelda(c, fila))),
      startY: 26,
      styles: { fontSize: 9, cellPadding: 2.5, overflow: 'linebreak' },
      headStyles: { fillColor: [106, 27, 154], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 238, 251] },
      margin: { left: 14, right: 14 },
    });
    doc.save(`${nombreConFecha()}.pdf`);
  };

  const hayDatos = ordenados.length > 0;
  const btnExport = {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    padding: '9px 14px', borderRadius: '10px', border: 'none',
    fontSize: '14px', fontWeight: 'bold', color: '#fff',
    cursor: hayDatos ? 'pointer' : 'not-allowed', opacity: hayDatos ? 1 : 0.5,
  };

  return (
    <div>
      {/* Barra superior: buscador + botones de exportar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        {/* Buscador */}
        <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: '360px' }}>
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

        {/* Botones de exportar */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={exportarCSV}
            disabled={!hayDatos}
            title="Descargar en CSV (se abre en Excel)"
            style={{ ...btnExport, background: '#1baf7a' }}
          >
            <FileSpreadsheet size={16} /> CSV
          </button>
          <button
            type="button"
            onClick={exportarPDF}
            disabled={!hayDatos}
            title="Descargar en PDF"
            style={{ ...btnExport, background: '#e23b3b' }}
          >
            <FileText size={16} /> PDF
          </button>
        </div>
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
