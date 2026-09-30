// ============================================================================
// COMPONENTE: Badge (pastilla de estado con color)
// Ficha SENA: 3013183 | Estudiante: Natalia Mejía Cardona
// ----------------------------------------------------------------------------
// Pequeña etiqueta de color (tipo "píldora") para mostrar de un vistazo el
// estado de un registro: convocatoria abierta/cerrada, postulación
// pendiente/aprobada, etc.
// Uso: <Badge texto="Abierta" color="verde" />
// ============================================================================
const PALETA = {
  verde: { bg: '#DCFCE7', fg: '#166534' },
  naranja: { bg: '#FEF3C7', fg: '#92400E' },
  rojo: { bg: '#FEE2E2', fg: '#991B1B' },
  gris: { bg: '#E5E7EB', fg: '#374151' },
  morado: { bg: '#F3E8FF', fg: '#6B21A8' },
};

export default function Badge({ texto, color = 'gris' }) {
  const c = PALETA[color] || PALETA.gris;
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '3px 12px',
        borderRadius: '9999px',
        background: c.bg,
        color: c.fg,
        fontWeight: 700,
        fontSize: '12px',
        whiteSpace: 'nowrap',
      }}
    >
      {texto}
    </span>
  );
}
