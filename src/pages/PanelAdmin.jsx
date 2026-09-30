import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ModoEmpaticContext } from '../context/ModoEmpatico';
import Swal from 'sweetalert2';
import { Plus, Pencil, Trash2, ShieldAlert } from 'lucide-react';
import DashboardAdmin from '../components/DashboardAdmin';
import TablaDatos from '../components/TablaDatos';
import Badge from '../components/Badge';

const API = 'http://localhost:5000/api/convocatorias';

const thStyle = (fs) => ({ padding: '12px', textAlign: 'left', fontSize: fs, fontWeight: 'bold' });
const tdStyle = (C, fs) => ({ padding: '12px', textAlign: 'left', fontSize: fs, color: C.texto, borderTop: `1px solid ${C.borde}` });

export default function PanelAdmin() {
  const navigate = useNavigate();
  const { modoEmpatico } = useContext(ModoEmpaticContext);
  const isWarm = modoEmpatico;

  const [convocatorias, setConvocatorias] = useState([]);
  const [inscripciones, setInscripciones] = useState([]);
  const [cargando, setCargando] = useState(true);

  const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
  // Solo los administradores (idRol = 1) pueden entrar a este panel.
  const esAdmin = usuario && Number(usuario.idRol) === 1;

  const C = {
    bg: isWarm ? '#FFF7EF' : '#FFFFFF',
    texto: isWarm ? '#2B1600' : '#2E1065',
    acento: isWarm ? '#C75000' : '#6A1B9A',
    borde: isWarm ? '#2B1600' : '#E9D5FF',
    fila: isWarm ? '#FCEBDD' : '#F5EEFB',
  };
  const fs = isWarm ? '17px' : '15px';

  const cargar = async () => {
    setCargando(true);
    try {
      // Cargamos convocatorias y postulaciones al tiempo, para las gráficas
      const [rc, ri] = await Promise.all([
        fetch(API),
        fetch('http://localhost:5000/api/inscripciones'),
      ]);
      const resC = await rc.json();
      const resI = await ri.json();
      if (resC && resC.success && Array.isArray(resC.data)) setConvocatorias(resC.data);
      if (resI && resI.success && Array.isArray(resI.data)) setInscripciones(resI.data);
    } catch (e) {
      console.error('Error cargando datos del panel:', e);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (esAdmin) cargar();
    else setCargando(false);
  }, []);

  const soloFecha = (f) => (f ? String(f).slice(0, 10) : '');

  const formatearFecha = (f) => {
    if (!f) return '—';
    const d = new Date(f);
    if (isNaN(d.getTime())) return f;
    return d.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Abre el formulario para crear (conv = null) o editar (conv = la convocatoria)
  const abrirFormulario = async (conv = null) => {
    const esEditar = !!conv;
    const { value: datos } = await Swal.fire({
      title: esEditar ? 'Editar convocatoria' : 'Nueva convocatoria',
      html: `
        <input id="c-nombre" class="swal2-input" placeholder="Nombre de la convocatoria">
        <textarea id="c-desc" class="swal2-textarea" placeholder="Descripción"></textarea>
        <label style="display:block;text-align:left;margin:10px 4px 2px;font-weight:bold">Fecha de inicio</label>
        <input id="c-inicio" type="date" class="swal2-input">
        <label style="display:block;text-align:left;margin:10px 4px 2px;font-weight:bold">Fecha de cierre</label>
        <input id="c-cierre" type="date" class="swal2-input">
        <input id="c-cupos" type="number" min="1" class="swal2-input" placeholder="Cupos disponibles">
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: esEditar ? 'Guardar cambios' : 'Crear convocatoria',
      cancelButtonText: 'Cancelar',
      didOpen: () => {
        if (conv) {
          document.getElementById('c-nombre').value = conv.nombre || '';
          document.getElementById('c-desc').value = conv.descripcion || '';
          document.getElementById('c-inicio').value = soloFecha(conv.fechaInicio);
          document.getElementById('c-cierre').value = soloFecha(conv.fechaCierre);
          document.getElementById('c-cupos').value = conv.cupos ?? '';
        }
      },
      preConfirm: () => {
        const nombre = document.getElementById('c-nombre').value.trim();
        const descripcion = document.getElementById('c-desc').value.trim();
        const fechaInicio = document.getElementById('c-inicio').value;
        const fechaCierre = document.getElementById('c-cierre').value;
        const cupos = document.getElementById('c-cupos').value;
        if (!nombre || !fechaInicio || !fechaCierre || !cupos) {
          Swal.showValidationMessage('Nombre, fechas y cupos son obligatorios');
          return false;
        }
        if (fechaCierre < fechaInicio) {
          Swal.showValidationMessage('La fecha de cierre no puede ser anterior a la de inicio');
          return false;
        }
        return { nombre, descripcion, fechaInicio, fechaCierre, cupos: Number(cupos) };
      },
    });

    if (!datos) return;

    try {
      const token = localStorage.getItem('token') || '';
      const authHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
      let r;
      if (esEditar) {
        r = await fetch(`${API}/${conv.idConvocatoria}`, {
          method: 'PUT',
          headers: authHeaders,
          body: JSON.stringify({ ...datos, estado: conv.estado ?? 1 }),
        });
      } else {
        r = await fetch(API, {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({ ...datos, idUsuario: usuario.idUsuario }),
        });
      }
      const res = await r.json();
      if (r.ok && res.success) {
        Swal.fire({ icon: 'success', title: esEditar ? 'Convocatoria actualizada' : 'Convocatoria creada', timer: 1500, showConfirmButton: false });
        cargar();
      } else {
        Swal.fire({ icon: 'error', title: 'Error', text: res.message || 'No se pudo guardar' });
      }
    } catch (e) {
      Swal.fire({ icon: 'error', title: 'Error de conexión', text: 'No se pudo conectar con el servidor' });
    }
  };

  const eliminar = async (conv) => {
    const confirm = await Swal.fire({
      title: '¿Eliminar convocatoria?',
      text: conv.nombre,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
    });
    if (!confirm.isConfirmed) return;
    try {
      const token = localStorage.getItem('token') || '';
      const r = await fetch(`${API}/${conv.idConvocatoria}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const res = await r.json();
      if (r.ok && res.success) {
        Swal.fire({ icon: 'success', title: 'Convocatoria eliminada', timer: 1300, showConfirmButton: false });
        cargar();
      } else {
        Swal.fire({ icon: 'error', title: 'Error', text: res.message || 'No se pudo eliminar' });
      }
    } catch (e) {
      Swal.fire({ icon: 'error', title: 'Error de conexión', text: 'No se pudo conectar con el servidor' });
    }
  };

  // Si NO es administrador, no mostramos el panel (control de acceso por rol)
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

  // Columnas de la tabla de convocatorias (con búsqueda y orden estilo DataTables)
  const columnasConv = [
    { clave: 'idConvocatoria', titulo: '#', tipo: 'numero' },
    { clave: 'nombre', titulo: 'Nombre', estilo: { fontWeight: 'bold' } },
    { clave: 'fechaInicio', titulo: 'Inicio', render: (v) => formatearFecha(v) },
    { clave: 'fechaCierre', titulo: 'Cierre', render: (v) => formatearFecha(v) },
    { clave: 'cupos', titulo: 'Cupos', tipo: 'numero' },
    {
      clave: 'estadoConv', titulo: 'Estado', ordenable: false,
      render: (_, conv) => {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const cierre = new Date(conv.fechaCierre);
        const cerrada = !isNaN(cierre.getTime()) && cierre < hoy;
        return <Badge texto={cerrada ? 'Cerrada' : 'Abierta'} color={cerrada ? 'gris' : 'verde'} />;
      },
    },
    {
      clave: 'acciones', titulo: 'Acciones', ordenable: false,
      render: (_, conv) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => abrirFormulario(conv)} title="Editar" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 12px', background: '#fff', color: C.acento, border: `2px solid ${C.acento}`, borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>
            <Pencil size={15} /> Editar
          </button>
          <button onClick={() => eliminar(conv)} title="Eliminar" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 12px', background: '#fff', color: '#b91c1c', border: '2px solid #b91c1c', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>
            <Trash2 size={15} /> Eliminar
          </button>
        </div>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ color: C.acento, margin: 0, fontSize: isWarm ? '32px' : '28px' }}>
            Panel de Administración
          </h1>
          <p style={{ color: C.texto, opacity: 0.85, fontSize: fs, marginTop: '6px' }}>
            Crea, edita y elimina las convocatorias del portal.
          </p>
          <span style={{ display: 'inline-block', marginTop: '8px', background: C.acento, color: '#fff', padding: '4px 14px', borderRadius: '9999px', fontWeight: 'bold', fontSize: '14px' }}>
            {convocatorias.length} {convocatorias.length === 1 ? 'convocatoria' : 'convocatorias'}
          </span>
        </div>
        <button
          onClick={() => abrirFormulario(null)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: C.acento, color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: fs, boxShadow: '0 4px 14px rgba(0,0,0,0.15)' }}
        >
          <Plus size={18} /> Nueva convocatoria
        </button>
      </div>

      {/* ---- DASHBOARD: tarjetas de resumen + gráficas estadísticas (Recharts) ---- */}
      {!cargando && (
        <div style={{ marginBottom: '28px' }}>
          <DashboardAdmin convocatorias={convocatorias} inscripciones={inscripciones} />
        </div>
      )}

      {cargando ? (
        <p style={{ color: C.texto, fontSize: fs }}>Cargando convocatorias… 🐾</p>
      ) : convocatorias.length === 0 ? (
        <p style={{ color: C.texto, fontSize: fs }}>Todavía no hay convocatorias. Crea la primera con el botón de arriba.</p>
      ) : (
        <TablaDatos
          columnas={columnasConv}
          datos={convocatorias}
          minWidth="760px"
          placeholderBuscar="Buscar convocatoria por nombre…"
          filaClave={(c) => c.idConvocatoria}
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
