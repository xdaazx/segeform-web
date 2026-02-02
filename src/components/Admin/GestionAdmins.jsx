// src/components/Admin/GestionAdmins.jsx
const GestionAdmins = () => {
return (
    <div className="admin-config-card">
      <h2 className="admin-title">Configuración de Administradores</h2>
      
      <div className="admin-list">
        <div className="admin-item-row">
          <div>
            <p className="admin-name-tag">DANIEL AJILA</p>
            <p className="admin-role-tag">Acceso Total - Administrador Principal</p>
          </div>
          <button className="btn-edit-admin">Editar Credenciales</button>
        </div>
      </div>

      <button className="btn-new-admin">
        + Registrar Nuevo Administrador
      </button>
    </div>
  );
};
export default GestionAdmins;