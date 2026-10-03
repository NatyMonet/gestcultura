// ============================================================================
// CONFIGURACIÓN DE LA API (dirección del backend)
// Ficha SENA: 3013183 | Estudiante: Natalia Mejía Cardona
// ----------------------------------------------------------------------------
// En tu equipo (desarrollo) apunta a localhost:5000.
// En internet (producción) toma la dirección de la variable VITE_API_URL,
// que se configura en la plataforma de despliegue (Vercel/Netlify).
// Así solo cambias la dirección en UN lugar, no en cada página.
// ============================================================================
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
