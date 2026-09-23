import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ModoEmpaticContext } from '../context/ModoEmpatico';
import Swal from 'sweetalert2';
import { Plus, Pencil, Trash2, ShieldAlert } from 'lucide-react';

const API = 'http://localhost:5000/api/convocatorias';

const thStyle = (fs) => ({ padding: '12px', textAlign: 'left', fontSize: fs, fontWeight: 'bold' });
const tdStyle = (C, fs) => ({ padding: '12px', textAlign: 'left', fontSize: fs, color: C.texto, borderTop: `1px solid ${C.borde}` });

export default function PanelAdmin() {
  const navigate = useNavigate();
  const { modoEmpatico } = useContext(ModoEmpaticContext);
  const isWarm = modoEmpatico;

  const [convocatorias, setConvocatorias] = useState([]);
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
      const r = await fetch(API);
      const res = await r.json();
      if (res && res.success && Array.isArray(res.data)) setConvocatorias(res.data);
    } catch (e) {
      console.error('Error cargando convocatorias:', e);
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
      let r;
      if (esEditar) {
        r = await fetch(`${API}/${conv.idConvocatoria}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...datos, estado: conv.estado ?? 1 }),
        });
      } else {
        r = await fetch(API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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
      const r = await fetch(`${API}/${conv.idConvocatoria}`, { method: 'DELETE' });
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

      {cargando ? (
        <p style={{ color: C.texto, fontSize: fs }}>Cargando convocatorias… 🐾</p>
      ) : convocatorias.length === 0 ? (
        <p style={{ color: C.texto, fontSize: fs }}>Todavía no hay convocatorias. Crea la primera con el botón de arriba.</p>
      ) : (
        <div style={{ overflowX: 'auto', border: `2px solid ${C.borde}`, borderRadius: '12px', background: C.bg, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '760px' }}>
            <thead>
              <tr style={{ background: C.acento, color: '#fff' }}>
                <th style={thStyle(fs)}>#</th>
                <th style={thStyle(fs)}>Nombre</th>
                <th style={thStyle(fs)}>Inicio</th>
                <th style={thStyle(fs)}>Cierre</th>
                <th style={thStyle(fs)}>Cupos</th>
                <th style={thStyle(fs)}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {convocatorias.map((conv, i) => (
                <tr key={conv.idConvocatoria} style={{ background: i % 2 === 0 ? 'transparent' : C.fila }}>
                  <td style={tdStyle(C, fs)}>{conv.idConvocatoria}</td>
                  <td style={{ ...tdStyle(C, fs), fontWeight: 'bold' }}>{conv.nombre}</td>
                  <td style={tdStyle(C, fs)}>{formatearFecha(conv.fechaInicio)}</td>
                  <td style={tdStyle(C, fs)}>{formatearFecha(conv.fechaCierre)}</td>
                  <td style={tdStyle(C, fs)}>{conv.cupos}</td>
                  <td style={tdStyle(C, fs)}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => abrirFormulario(conv)}
                        title="Editar"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 12px', background: '#fff', color: C.acento, border: `2px solid ${C.acento}`, borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
                      >
                        <Pencil size={15} /> Editar
                      </button>
                      <button
                        onClick={() => eliminar(conv)}
                        title="Eliminar"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 12px', background: '#fff', color: '#b91c1c', border: '2px solid #b91c1c', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
                      >
                        <Trash2 size={15} /> Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
