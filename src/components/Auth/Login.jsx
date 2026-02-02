import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, User, Lock } from 'lucide-react';
import '../../App.css';

const Login = ({ setAuth }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // ✅ CORRECCIÓN: Usamos ruta relativa para que Vercel la redirija al backend
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password: password }) 
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert(`Bienvenido, ${data.nombre}`); 
        localStorage.setItem('usuarioNombre', data.nombre);
        setAuth(true);
        navigate('/admin/pagos'); 
      } else {
        // Si sale "Credenciales incorrectas" es porque el usuario no existe en Supabase
        alert(data.message || "Credenciales incorrectas");
      }
    } catch (err) {
      alert("Error de conexión. Asegúrate de que el backend esté desplegado en Vercel.");
    }
  };

  return (
    <div className="login-wrapper-split">
      <div className="login-brand-side">
        <div className="brand-content">
          <ShieldCheck size={100} color="#b8860b" />
          <h1>SEGEFORM</h1>
          <p>SISTEMA DE GESTIÓN ADMINISTRATIVA</p>
          <div className="divider-gold"></div>
          <button onClick={() => navigate('/')} className="btn-regresar">← VOLVER</button>
        </div>
      </div>
      <div className="login-form-side">
        <form onSubmit={handleLogin} className="login-form">
          <h2 className="text-mil-green">INICIAR SESIÓN</h2>
          <div className="input-group">
            <User size={20} className="input-icon" />
            <input 
              type="email" 
              placeholder="admin@segeform.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div className="input-group">
            <Lock size={20} className="input-icon" />
            <input 
              type="password" 
              placeholder="Contraseña" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          <button type="submit" className="btn-gold-admin full-width">INGRESAR</button>
        </form>
      </div>
    </div>
  );
};

export default Login;