import { useState, useEffect } from 'react';
import { UserPlus, Edit3, Trash2, X } from 'lucide-react';

const GestionAdmins = () => {
  const [admins, setAdmins] = useState([]);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [form, setForm] = useState({ id: '', nombre: '', email: '', password: '' });

  /* ============================
      CARGAR ADMINISTRADORES
  ============================ */
  const cargarAdmins = async () => {
    try {
      const resp = await fetch('/api/admins');
      const data = await resp.json();
      setAdmins(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al cargar administradores", err);
    }
  };

  useEffect(() => {
    cargarAdmins();
  }, []);

  /* ============================
      GUARDAR / ACTUALIZAR
  ============================ */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = modoEdicion ? `/api/admins/${form.id}` : '/api/admins';
    const method = modoEdicion ? 'PUT' : 'POST';

    try {
      const resp = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (resp.ok) {
        alert(modoEdicion ? 'CREDENCIALES ACTUALIZADAS' : 'NUEVO ADMINISTRADOR REGISTRADO');
        setModoEdicion(false);
        setForm({ id: '', nombre: '', email: '', password: '' });
        cargarAdmins();
      } else {
        const error = await resp.json();
        alert(error.message || "Error en la operación");
      }
    } catch (err) {
      alert("Error de conexión con el servidor");
    }
  };

  /* ============================
      ELIMINAR ADMINISTRADOR
  ============================ */
  const eliminar = async (id, nombre) => {
    // Protección para no borrar tu cuenta principal
    if (nombre.toLowerCase().includes('daniel')) {
      return alert("No se puede eliminar al administrador principal del sistema.");
    }
    
    if (!window.confirm(`¿Estás seguro de eliminar el acceso a ${nombre}?`)) return;

    try {
      const resp = await fetch(`/api/admins/${id}`, { method: 'DELETE' });
      if (resp.ok) {
        alert("Acceso eliminado");
        cargarAdmins();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="admin-config-card">
      <h2 className="admin-title">Configuración de Administradores</h2>
      
      {/* FORMULARIO: USA TUS CLASES DE App.css */}
      <form onSubmit={handleSubmit} className="form-section" style={{ background: '#f8fafc', padding: '20px', borderRadius: '15px', marginBottom: '30px' }}>
        <h3 className="text-mil-green" style={{ marginBottom: '15px', fontSize: '1rem' }}>
          {modoEdicion ? 'EDITAR CREDENCIALES' : 'REGISTRAR NUEVO ACCESO'}
        </h3>
        
        <div className="form-grid-2">
          <input 
            className="form-input"
            placeholder="Nombre Completo" 
            value={form.nombre} 
            onChange={(e) => setForm({...form, nombre: e.target.value})} 
            required 
          />
          <input 
            className="form-input"
            type="email" 
            placeholder="Correo Electrónico" 
            value={form.email} 
            onChange={(e) => setForm({...form, email: e.target.value})} 
            required 
          />
        </div>

        <div className="form-grid-2" style={{ marginTop: '15px' }}>
          <input 
            className="form-input"
            type="password" 
            placeholder={modoEdicion ? "Nueva contraseña (dejar vacío para no cambiar)" : "Contraseña de acceso"} 
            value={form.password} 
            onChange={(e) => setForm({...form, password: e.target.value})} 
            required={!modoEdicion} 
          />
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" className="btn-new-admin" style={{ margin: 0, flex: 2 }}>
              {modoEdicion ? 'ACTUALIZAR' : 'GUARDAR ACCESO'}
            </button>
            
            {modoEdicion && (
              <button 
                type="button" 
                onClick={() => { setModoEdicion(false); setForm({ id: '', nombre: '', email: '', password: '' }); }}
                className="btn-icon red-flat"
                style={{ flex: 1, borderRadius: '10px' }}
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>
      </form>

      {/* LISTADO: USA TUS CLASES admin-item-row, admin-name-tag, etc. */}
      <div className="admin-list">
        {admins.map(admin => (
          <div className="admin-item-row" key={admin.id}>
            <div>
              <p className="admin-name-tag">{admin.nombre_usuario.toUpperCase()}</p>
              <p className="admin-role-tag">{admin.correo_electronico} — {admin.rol}</p>
            </div>
            
            <div className="actions-cell">
              <button 
                className="btn-edit-admin" 
                onClick={() => {
                  setModoEdicion(true);
                  setForm({ id: admin.id, nombre: admin.nombre_usuario, email: admin.correo_electronico, password: '' });
                }}
                title="Editar"
              >
                <Edit3 size={18} />
              </button>
              
              <button 
                className="btn-icon red-flat" 
                onClick={() => eliminar(admin.id, admin.nombre_usuario)}
                style={{ padding: '8px', borderRadius: '8px' }}
                title="Eliminar"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GestionAdmins;