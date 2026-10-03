import { API_URL } from '../config/api';
// ============================================================================
// PÁGINA: Panel de Usuarios (Gestión de Usuarios y Roles)
// Ficha SENA: 3013183 | Estudiante: Natalia Mejía Cardona
// ----------------------------------------------------------------------------
// Vista SOLO para administradores. Permite:
//   - Ver todos los usuarios del portal (con su rol y estado).
//   - Cambiar el rol de un usuario (Administrador <-> Participante).
//   - Activar / inactivar usuarios (borrado lógico: no se borran de la base).
//   - Exportar el listado a CSV / PDF (lo hereda de TablaDatos).
// Seguridad: un administrador no puede cambiarse el rol ni inactivarse a sí
// mismo (eso se valida también en el backend).
// ============================================================================
import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ModoEmpaticContext } from '../context/ModoEmpatico';
import Swal from 'sweetalert2';
import { ShieldAlert, UserCog, UserCheck, UserX } from 'lucide-react';
import TablaDatos from '../components/TablaDatos';
import Badge from '../components/Badge';

const API = `${API_URL}/api/usuarios`;

// Calcula la edad (en años) a partir de la fecha de nacimiento.
const calcularEdad = (fn) => {
  if (!fn) return null;
  const nac = new Date(fn);
  if (isNaN(nac.getTime())) return null;
  const hoy = new Date();
  let edad = hoy.getFullYear() - nac.getFullYear();
  const m = hoy.getMonth() - nac.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
  return edad;
};

export default function PanelUsuarios() {
  const navigate = useNavigate();
  const { modoEmpatico } = useContext(ModoEmpaticContext);
  const isWarm = modoEmpatico;

  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarInactivos, setMostrarInactivos] = useState(false);

  const usuarioActual = JSON.parse(localStorage.getItem('usuario') || 'null');
  const esAdmin = usuarioActual && Number(usuarioActual.idRol) === 1;

  const C = {
    bg: isWarm ? '#FFF7EF' : '#FFFFFF',
    texto: isWarm ? '#2B1600' : '#2E1065',
    acento: isWarm ? '#C75000' : '#6A1B9A',
    borde: isWarm ? '#2B1600' : '#E9D5FF',
  };
  const fs = isWarm ? '17px' : '15px';

  const cargar = async () => {
    setCargando(true);
    try {
      const token = localStorage.getItem('token') || '';
      const r = await fetch(API, { headers: { Authorization: `Bearer ${token}` } });
      const res = await r.json();
      // Agregamos la edad calculada a cada usuario (para buscar y ordenar por edad)
      if (res && res.success && Array.isArray(res.data)) setUsuarios(res.data.map((u) => ({ ...u, edad: calcularEdad(u.fechaNacimiento) })));
    } catch (e) {
      console.error('Error cargando usuarios:', e);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (esAdmin) cargar();
    else setCargando(false);
  }, []);

  // Cambiar el rol: si es admin lo pasa a participante y viceversa.
  const cambiarRol = async (u) => {
    const nuevoRol = Number(u.idRol) === 1 ? 2 : 1;
    const nombreRol = nuevoRol === 1 ? 'Administrador' : 'Participante';
    const confirm = await Swal.fire({
      title: '¿Cambiar el rol?',
      html: `<b>${u.nombre}</b><br><small>Pasará a ser <b>${nombreRol}</b>.</small>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, cambiar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#6A1B9A',
    });
    if (!confirm.isConfirmed) return;
    try {
      const token = localStorage.getItem('token') || '';
      const r = await fetch(`${API}/${u.idUsuario}/rol`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ idRol: nuevoRol }),
      });
      const res = await r.json();
      if (r.ok && res.success) {
        Swal.fire({ icon: 'success', title: 'Rol actualizado', timer: 1300, showConfirmButton: false });
        cargar();
      } else {
        Swal.fire({ icon: 'error', title: 'Error', text: res.message || 'No se pudo cambiar el rol' });
      }
    } catch (e) {
      Swal.fire({ icon: 'error', title: 'Error de conexión', text: 'No se pudo conectar con el servidor' });
    }
  };

  // Activar / inactivar (borrado lógico de usuarios).
  const cambiarEstado = async (u) => {
    const nuevoEstado = Number(u.estado) === 1 ? 0 : 1;
    const esReactivar = nuevoEstado === 1;
    const confirm = await Swal.fire({
      title: esReactivar ? '¿Reactivar este usuario?' : '¿Inactivar este usuario?',
      html: `<b>${u.nombre}</b><br><small>${esReactivar
        ? 'Podrá volver a iniciar sesión en el portal.'
        : 'No podrá iniciar sesión hasta que lo reactives. No se borra de la base de datos.'}</small>`,
      icon: esReactivar ? 'question' : 'warning',
      showCancelButton: true,
      confirmButtonText: esReactivar ? 'Sí, reactivar' : 'Sí, inactivar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: esReactivar ? '#1baf7a' : '#d33',
    });
    if (!confirm.isConfirmed) return;
    try {
      const token = localStorage.getItem('token') || '';
      const r = await fetch(`${API}/${u.idUsuario}/estado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      const res = await r.json();
      if (r.ok && res.success) {
        Swal.fire({ icon: 'success', title: res.message, timer: 1300, showConfirmButton: false });
        cargar();
      } else {
        Swal.fire({ icon: 'error', title: 'Error', text: res.message || 'No se pudo cambiar el estado' });
      }
    } catch (e) {
      Swal.fire({ icon: 'error', title: 'Error de conexión', text: 'No se pudo conectar con el servidor' });
    }
  };

  // Control de acceso por rol: si no es administrador, no mostramos el panel.
  if (!esAdmin) {
    return (
      <div style={{ maxWidth: '520px', margin: '80px auto', padding: '32px', textAlign: 'center', background: C.bg, border: `2px solid ${C.borde}`, borderRadius: '16px' }}>
        <ShieldAlert size={48} color={C.acento} style={{ marginBottom: '12px' }} />
        <h1 style={{ color: C.acento, fontSize: '24px', margin: '0 0 8px' }}>Acceso restringido</h1>
        <p style={{ color: C.texto, fontSize: fs, opacity: 0.85 }}>
          Esta sección es solo para administradores del portal. Si crees que deberías tener acceso, comunícate con el equipo de GestCultura.
        </p>
        <button
          onClick={() => navigate('/convocatorias')}
          style={{ marginTop: '20px', padding: '12px 20px', background: C.acento, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: fs }}
        >
          ← Volver a Convocatorias
        </button>
      </div>
    );
  }

  const activos = usuarios.filter((u) => Number(u.estado) === 1);
  const inactivos = usuarios.filter((u) => Number(u.estado) === 0);
  const usuariosTabla = mostrarInactivos ? usuarios : activos;

  const esMiCuenta = (u) => Number(u.idUsuario) === Number(usuarioActual?.idUsuario);

  const columnas = [
    { clave: 'idUsuario', titulo: '#', tipo: 'numero' },
    {
      clave: 'nombre', titulo: 'Nombre', estilo: { fontWeight: 'bold' },
      render: (v, u) => (esMiCuenta(u) ? <span>{v} <small style={{ opacity: 0.7, fontWeight: 'normal' }}>(tú)</small></span> : v),
      exportar: (u) => u.nombre,
    },
    { clave: 'correo', titulo: 'Correo' },
    { clave: 'telefono', titulo: 'Teléfono' },
    { clave: 'cedula', titulo: 'Cédula' },
    { clave: 'edad', titulo: 'Edad', tipo: 'numero', render: (v) => (v ?? '—') },
    {
      clave: 'rol', titulo: 'Rol',
      render: (v) => <Badge texto={v} color={v === 'Administrador' ? 'morado' : 'gris'} />,
      exportar: (u) => u.rol,
    },
    {
      clave: 'estado', titulo: 'Estado', ordenable: false,
      render: (v) => <Badge texto={Number(v) === 1 ? 'Activo' : 'Inactivo'} color={Number(v) === 1 ? 'verde' : 'rojo'} />,
      exportar: (u) => (Number(u.estado) === 1 ? 'Activo' : 'Inactivo'),
    },
    {
      clave: 'acciones', titulo: 'Acciones', ordenable: false, exportable: false,
      render: (_, u) => {
        if (esMiCuenta(u)) {
          return <span style={{ fontSize: '13px', opacity: 0.7 }}>Tu cuenta</span>;
        }
        const inactivo = Number(u.estado) === 0;
        return (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => cambiarRol(u)}
              title="Cambiar rol"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 12px', background: '#fff', color: C.acento, border: `2px solid ${C.acento}`, borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
            >
              <UserCog size={15} /> {Number(u.idRol) === 1 ? 'Hacer participante' : 'Hacer admin'}
            </button>
            {inactivo ? (
              <button
                onClick={() => cambiarEstado(u)}
                title="Reactivar"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 12px', background: '#1baf7a', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
              >
                <UserCheck size={15} /> Reactivar
              </button>
            ) : (
              <button
                onClick={() => cambiarEstado(u)}
                title="Inactivar"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 12px', background: '#fff', color: '#b91c1c', border: '2px solid #b91c1c', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
              >
                <UserX size={15} /> Inactivar
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div style={{ maxWidth: '1050px', margin: '40px auto', padding: '0 20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ color: C.acento, margin: 0, fontSize: isWarm ? '32px' : '28px' }}>
          Gestión de Usuarios y Roles
        </h1>
        <p style={{ color: C.texto, opacity: 0.85, fontSize: fs, marginTop: '6px' }}>
          Administra los usuarios del portal: cambia su rol o actívalos / inactívalos.
        </p>
        <span style={{ display: 'inline-block', marginTop: '8px', background: C.acento, color: '#fff', padding: '4px 14px', borderRadius: '9999px', fontWeight: 'bold', fontSize: '14px' }}>
          {activos.length} {activos.length === 1 ? 'activo' : 'activos'}
          {inactivos.length > 0 ? ` · ${inactivos.length} ${inactivos.length === 1 ? 'inactivo' : 'inactivos'}` : ''}
        </span>
      </div>

      {!cargando && usuarios.length > 0 && (
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '14px', cursor: 'pointer', color: C.texto, fontSize: fs }}>
          <input
            type="checkbox"
            checked={mostrarInactivos}
            onChange={(e) => setMostrarInactivos(e.target.checked)}
            style={{ width: '18px', height: '18px', accentColor: C.acento, cursor: 'pointer' }}
          />
          Mostrar también los usuarios inactivos
          {inactivos.length > 0 ? ` (${inactivos.length})` : ''}
        </label>
      )}

      {cargando ? (
        <p style={{ color: C.texto, fontSize: fs }}>Cargando usuarios… 🐾</p>
      ) : usuarios.length === 0 ? (
        <p style={{ color: C.texto, fontSize: fs }}>Todavía no hay usuarios registrados.</p>
      ) : (
        <TablaDatos
          columnas={columnas}
          datos={usuariosTabla}
          minWidth="900px"
          placeholderBuscar="Buscar por nombre, correo, cédula, edad, rol…"
          filaClave={(u) => u.idUsuario}
          nombreArchivo="usuarios"
          tituloExport="Usuarios - GestCultura"
        />
      )}

      <button
        onClick={() => navigate('/convocatorias')}
        style={{ marginTop: '24px', padding: '12px 20px', background: '#fff', color: C.acento, border: `2px solid ${C.acento}`, borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: fs }}
      >
        ← Volver a Convocatorias
      </button>
    </div>
  );
}
