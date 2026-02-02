import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { imprimirFichaInscripcion } from '../../utils/pdfGenerator';
import '../../App.css';

const FormularioRegistro = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const esEdicion = Boolean(id);

  const [formData, setFormData] = useState({
    cedula: '', apellidos_nombres: '', edad: '', tipo_sangre: '', correo_electronico: '',
    nivel_i: false, reentrenamiento: false, nivel_ii: false, nivel_iii: false,
    nivel_academico: 'Bachiller', lugar_trabajo: '', direccion_trabajo: '', libreta_militar: false,
    telf_convencional: '', celular: '', telf_familiar: '', parentesco: '',
    direccion_domicilio: '', provincia: 'El Oro', canton: 'Machala', ciudad: 'Machala',
    num_documento: '', abono_1: 0, abono_2: 0
  });

  useEffect(() => {
    if (esEdicion) {
      fetch(`http://localhost:5000/api/guardias/${id}`)
        .then(res => res.json())
        .then(data => {
          setFormData({
            ...data,
            // Sincronización para evitar valores nulos
            correo_electronico: data.correo_electronico || '',
            telf_familiar: data.telf_familiar || '',
            parentesco: data.parentesco || '',
            direccion_trabajo: data.direccion_trabajo || '',
            abono_1: Number(data.abono_1) || 0,
            abono_2: Number(data.abono_2) || 0
          });
        })
        .catch(err => console.error("Error al cargar:", err));
    }
  }, [id, esEdicion]);

  // Lógica de precios exacta de SEGEFORM
  const calcularPrecios = () => {
    let total = 120;
    if (formData.nivel_i && formData.reentrenamiento) total = 200;
    else if (formData.nivel_i) total = 180;
    else if (formData.reentrenamiento) total = 30;
    const saldo = total - (Number(formData.abono_1) + Number(formData.abono_2));
    return { total, saldo };
  };

  const { total, saldo } = calcularPrecios();

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    if (name === 'libreta_militar_si') setFormData(prev => ({ ...prev, libreta_militar: true }));
    else if (name === 'libreta_militar_no') setFormData(prev => ({ ...prev, libreta_militar: false }));
    else {
      setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    const datosFinales = { ...formData, saldo };
    const url = esEdicion ? `http://localhost:5000/api/guardias/${id}` : `http://localhost:5000/api/registro`;
    
    try {
      const resp = await fetch(url, {
        method: esEdicion ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosFinales)
      });
      if (resp.ok) {
        alert(esEdicion ? "DATOS ACTUALIZADOS" : "REGISTRO GUARDADO");
        imprimirFichaInscripcion(datosFinales);
        navigate('/admin/pagos');
      }
    } catch (error) { console.error(error); }
  };

  return (
    <div className="form-registro-container">
      <div className="form-card">
        <h2 className="form-title">
          {esEdicion ? 'EDITAR FICHA COMPLETA' : 'NUEVA FICHA DE INSCRIPCIÓN'}
        </h2>
        
        <form onSubmit={handleGuardar} className="ficha-grid-layout">
          {/* SECCIÓN 1: NIVELES */}
          <div className="form-section">
            <div className="form-section-header">1. NIVELES DE CAPACITACIÓN</div>
            <div className="checkbox-group-row">
              <label><input type="checkbox" name="nivel_i" checked={formData.nivel_i} onChange={handleChange} /> Nivel I</label>
              <label><input type="checkbox" name="reentrenamiento" checked={formData.reentrenamiento} onChange={handleChange} /> Reentrenamiento</label>
              <label><input type="checkbox" name="nivel_ii" checked={formData.nivel_ii} onChange={handleChange} /> Nivel II</label>
              <label><input type="checkbox" name="nivel_iii" checked={formData.nivel_iii} onChange={handleChange} /> Nivel III</label>
            </div>
          </div>

          {/* SECCIÓN 2: DATOS PERSONALES */}
          <div className="form-section">
            <div className="form-section-header">2. DATOS DEL ASPIRANTE Y EDUCACIÓN</div>
            <div className="form-grid-2">
              <input type="text" name="apellidos_nombres" placeholder="Apellidos y Nombres" value={formData.apellidos_nombres} onChange={handleChange} required className="form-input" />
              <input type="text" name="cedula" placeholder="Cédula" value={formData.cedula} onChange={handleChange} required maxLength="10" className="form-input" />
            </div>
            <div className="form-grid-2 mt-10">
              <input type="email" name="correo_electronico" placeholder="Correo Electrónico" value={formData.correo_electronico} onChange={handleChange} className="form-input" />
              <select name="nivel_academico" value={formData.nivel_academico} onChange={handleChange} className="form-select">
                <option value="Básico">Básico</option>
                <option value="Bachiller">Bachiller</option>
                <option value="Superior">Superior</option>
              </select>
            </div>
            <div className="form-grid-2 mt-10">
              <input type="number" name="edad" placeholder="Edad" value={formData.edad} onChange={handleChange} className="form-input" />
              <input type="text" name="tipo_sangre" placeholder="T. Sangre" value={formData.tipo_sangre} onChange={handleChange} className="form-input" />
            </div>
          </div>

          {/* SECCIÓN 3: CONTACTO */}
          <div className="form-section">
            <div className="form-section-header">3. INFORMACIÓN DE CONTACTO</div>
            <div className="form-grid-2">
              <input type="text" name="celular" placeholder="Celular" value={formData.celular} onChange={handleChange} className="form-input" />
              <input type="text" name="telf_convencional" placeholder="Telf. Convencional" value={formData.telf_convencional} onChange={handleChange} className="form-input" />
            </div>
            <div className="form-grid-2 mt-10">
              <input type="text" name="telf_familiar" placeholder="Telf. Familiar" value={formData.telf_familiar} onChange={handleChange} className="form-input" />
              <input type="text" name="parentesco" placeholder="familia" value={formData.parentesco} onChange={handleChange} className="form-input" />
            </div>
          </div>

          {/* SECCIÓN 4: LABORAL */}
          <div className="form-section">
            <div className="form-section-header">4. LUGAR DE TRABAJO Y LIBRETA MILITAR</div>
            <div className="form-grid-2">
              <input type="text" name="lugar_trabajo" placeholder="Empresa Actual" value={formData.lugar_trabajo} onChange={handleChange} className="form-input" />
              <div className="input-group-inline">
                <span className="label-inline">L. MILITAR:</span>
                <label><input type="radio" name="libreta_militar_si" checked={formData.libreta_militar === true} onChange={handleChange} /> SI</label>
                <label><input type="radio" name="libreta_militar_no" checked={formData.libreta_militar === false} onChange={handleChange} /> NO</label>
              </div>
            </div>
            <input type="text" name="direccion_domicilio" placeholder="Dirección Domiciliaria Exacta" value={formData.direccion_domicilio} onChange={handleChange} className="form-input-full mt-10" />
            <input type="text" name="direccion_trabajo" placeholder="Dirección de Trabajo" value={formData.direccion_trabajo} onChange={handleChange} className="form-input-full mt-10" />
          </div>

          {/* SECCIÓN 5: PAGOS */}
          <div className="form-section">
            <div className="form-section-header">5. CONTROL DE PAGOS Y DOCUMENTACIÓN</div>
            <div className="form-grid-3">
              <input type="text" name="num_documento" placeholder="000" value={formData.num_documento} onChange={handleChange} className="form-input" />
              <div className="input-with-label"><label>Abono 1:</label><input type="number" name="abono_1" value={formData.abono_1} onChange={handleChange} className="form-input" /></div>
              <div className="input-with-label"><label>Abono 2:</label><input type="number" name="abono_2" value={formData.abono_2} onChange={handleChange} className="form-input" /></div>
            </div>
          </div>

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