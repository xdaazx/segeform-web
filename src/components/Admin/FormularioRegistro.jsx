import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { imprimirFichaInscripcion } from '../../utils/pdfGenerator';
import '../../App.css';

const FormularioRegistro = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const esEdicion = Boolean(id);

  const [formData, setFormData] = useState({
    cedula: '',
    apellidos_nombres: '',
    edad: '',
    tipo_sangre: '',
    correo_electronico: '',
    nivel_i: false,
    reentrenamiento: false,
    nivel_ii: false,
    nivel_iii: false,
    nivel_academico: 'Bachiller',
    lugar_trabajo: '',
    direccion_trabajo: '',
    libreta_militar: false,
    telf_convencional: '',
    celular: '',
    telf_familiar: '',
    parentesco: '',
    direccion_domicilio: '',
    provincia: 'El Oro',
    canton: 'Machala',
    ciudad: 'Machala',
    num_documento: '',
    abono_1: 0,
    abono_2: 0
  });

  /* ============================
     CARGAR DATOS PARA EDICIÓN
  ============================ */
  useEffect(() => {
    if (esEdicion) {
      fetch(`/api/guardias/${id}`)
        .then(res => res.json())
        .then(data => {
          setFormData({
            ...data,
            correo_electronico: data.correo_electronico || '',
            telf_familiar: data.telf_familiar || '',
            parentesco: data.parentesco || '',
            direccion_trabajo: data.direccion_trabajo || '',
            abono_1: Number(data.abono_1) || 0,
            abono_2: Number(data.abono_2) || 0
          });
        })
        .catch(err => console.error('Error al cargar ficha:', err));
    }
  }, [id, esEdicion]);

  /* ============================
     CÁLCULO DE COSTOS
  ============================ */
  const calcularPrecios = () => {
    let total = 120;
    if (formData.nivel_i && formData.reentrenamiento) total = 200;
    else if (formData.nivel_i) total = 180;
    else if (formData.reentrenamiento) total = 30;

    const saldo = total - (Number(formData.abono_1) + Number(formData.abono_2));
    return { total, saldo };
  };

  const { total, saldo } = calcularPrecios();

  /* ============================
     MANEJO DE INPUTS
  ============================ */
  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;

    if (name === 'libreta_militar_si') {
      setFormData(prev => ({ ...prev, libreta_militar: true }));
    } else if (name === 'libreta_militar_no') {
      setFormData(prev => ({ ...prev, libreta_militar: false }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  /* ============================
     GUARDAR / ACTUALIZAR
  ============================ */
  const handleGuardar = async (e) => {
    e.preventDefault();

    const datosFinales = { ...formData, saldo };

    const url = esEdicion
      ? `/api/guardias/${id}`
      : `/api/registro`;

    try {
      const resp = await fetch(url, {
        method: esEdicion ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosFinales)
      });

      if (!resp.ok) throw new Error('Error al guardar');

      alert(esEdicion ? 'DATOS ACTUALIZADOS' : 'REGISTRO GUARDADO');
      imprimirFichaInscripcion(datosFinales);
      navigate('/admin/pagos');

    } catch (error) {
      console.error(error);
      alert('Error al guardar los datos');
    }
  };

  return (
    <div className="form-registro-container">
      <div className="form-card">
        <h2 className="form-title">
          {esEdicion ? 'EDITAR FICHA COMPLETA' : 'NUEVA FICHA DE INSCRIPCIÓN'}
        </h2>

        <form onSubmit={handleGuardar} className="ficha-grid-layout">

          {/* SECCIÓN 1 */}
          <div className="form-section">
            <div className="form-section-header">1. NIVELES DE CAPACITACIÓN</div>
            <div className="checkbox-group-row">
              <label><input type="checkbox" name="nivel_i" checked={formData.nivel_i} onChange={handleChange} /> Nivel I</label>
              <label><input type="checkbox" name="reentrenamiento" checked={formData.reentrenamiento} onChange={handleChange} /> Reentrenamiento</label>
              <label><input type="checkbox" name="nivel_ii" checked={formData.nivel_ii} onChange={handleChange} /> Nivel II</label>
              <label><input type="checkbox" name="nivel_iii" checked={formData.nivel_iii} onChange={handleChange} /> Nivel III</label>
            </div>
          </div>

          {/* SECCIÓN 2 */}
          <div className="form-section">
            <div className="form-section-header">2. DATOS PERSONALES</div>
            <div className="form-grid-2">
              <input name="apellidos_nombres" value={formData.apellidos_nombres} onChange={handleChange} placeholder="Apellidos y Nombres" required />
              <input name="cedula" value={formData.cedula} onChange={handleChange} placeholder="Cédula" required maxLength="10" />
            </div>
          </div>

          {/* SECCIÓN 5 */}
          <div className="saldo-banner-container">
            <span className="total-label-red">COSTO TOTAL: ${total}</span>
            <span className="saldo-monto-big">SALDO PENDIENTE: ${saldo.toFixed(2)}</span>
          </div>

          <button type="submit" className="btn-guardar-principal">
            {esEdicion ? 'ACTUALIZAR DATOS' : 'GUARDAR REGISTRO Y GENERAR FICHA PDF'}
          </button>

        </form>
      </div>
    </div>
  );
};

export default FormularioRegistro;
