import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { Users, UserPlus, Settings, LogOut } from 'lucide-react';
import '../../App.css'; 

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Esto nos permite saber en qué URL estamos para marcar el botón activo

  // Función para cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem('usuarioNombre');
    navigate('/');
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar - Menú Lateral SEGEFORM */}
      <aside className="sidebar-admin">
        <div className="sidebar-header">
          SEGEFORM ADMIN
        </div>
        
        <nav className="sidebar-nav">
          {/* Usamos navigate para cambiar la URL real. Si la URL incluye 'pagos', se activa el botón */}
          <button 
            onClick={() => navigate('/admin/pagos')} 
            className={`nav-item ${location.pathname.includes('pagos') ? 'active' : ''}`}
          >
            <Users size={20} /> Lista de Guardias
          </button>
          
          <button 
            onClick={() => navigate('/admin/registro')} 
            className={`nav-item ${location.pathname.includes('registro') ? 'active' : ''}`}
          >
            <UserPlus size={20} /> Nuevo Registro
          </button>
          
          <button 
            onClick={() => navigate('/admin/admins')} 
            className={`nav-item ${location.pathname.includes('admins') ? 'active' : ''}`}
          >
            <Settings size={20} /> Administradores
          </button>
        </nav>

        <button onClick={handleLogout} className="btn-logout">
          <LogOut size={20} /> Cerrar Sesión
        </button>
      </aside>

      {/* Área Dinámica de Contenido */}
      <main className="main-content">
        <div className="content-card">
          {/* Cabecera de bienvenida personalizada */}
          <div className="welcome-header">
            <div>
              <h2>Panel de Control</h2>
              <p className="subtitle">Gestión de seguridad integral</p>
            </div>
            <span className="user-badge">
              Admin: {localStorage.getItem('usuarioNombre') || 'Usuario'}
            </span>
          </div>

          {/* EL CAMBIO CLAVE: Outlet renderiza el componente según la URL de App.jsx */}
          <div className="dynamic-section">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;