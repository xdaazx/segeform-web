// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';

import Login from './components/Auth/Login';
import Dashboard from './components/Admin/Dashboard';
import LandingPage from './components/Public/LandingPage';

import TablaGuardias from './components/Admin/TablaGuardias';
import FormularioRegistro from './components/Admin/FormularioRegistro';
import GestionAdmins from './components/Admin/GestionAdmins';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login setAuth={setIsAuthenticated} />} />

        <Route
          path="/admin/*"
          element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
        >
          <Route index element={<TablaGuardias />} />
          <Route path="pagos" element={<TablaGuardias />} />

          {/* 👉 NUEVO REGISTRO */}
          <Route path="registro" element={<FormularioRegistro />} />

          {/* 👉 EDITAR REGISTRO */}
          <Route path="registro/:id" element={<FormularioRegistro />} />

          <Route path="admins" element={<GestionAdmins />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
