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
          // Esto asegura que al editar, el formulario se llene con lo que hay en la DB
          setFormData({
            ...data,
            // Aseguramos que los números no vengan como strings
            abono_1: Number(data.abono_1) || 0,
            abono_2: Number(data.abono_2) || 0,
            edad: data.edad || ''
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
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  /* ============================
      GUARDAR / ACTUALIZAR
  ============================ */
  const handleGuardar = async (e) => {
    e.preventDefault();
    const datosFinales = { ...formData, saldo };

    try {
      const resp = await fetch(esEdicion ? `/api/guardias/${id}` : `/api/registro`, {
        method: esEdicion ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosFinales)
      });

      if (!resp.ok) throw new Error('Error al guardar');

      alert(esEdicion ? 'DATOS ACTUALIZADOS CORRECTAMENTE' : 'REGISTRO GUARDADO CON ÉXITO');
      imprimirFichaInscripcion(datosFinales);
      navigate('/admin/pagos');

    } catch (error) {
      console.error(error);
      alert('Error al procesar la solicitud');
    }
  };

  return (
    <div className="form-registro-container">
      <div className="form-card">
        <h2 className="form-title">
          {esEdicion ? 'MODIFICAR EXPEDIENTE DE GUARDIA' : 'NUEVA FICHA DE INSCRIPCIÓN'}
        </h2>

        <form onSubmit={handleGuardar} className="ficha-grid-layout">

          {/* SECCIÓN 1: CAPACITACIÓN */}
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
            <div className="form-section-header">2. INFORMACIÓN DEL POSTULANTE</div>
            <div className="form-grid-3">
              <input name="apellidos_nombres" value={formData.apellidos_nombres} onChange={handleChange} placeholder="Apellidos y Nombres" required />
              <input name="cedula" value={formData.cedula} onChange={handleChange} placeholder="Cédula de Identidad" required maxLength="10" />
              <input name="edad" type="number" value={formData.edad} onChange={handleChange} placeholder="Edad" />
              <input name="tipo_sangre" value={formData.tipo_sangre} onChange={handleChange} placeholder="Tipo de Sangre" />
              <input name="correo_electronico" type="email" value={formData.correo_electronico} onChange={handleChange} placeholder="Correo Electrónico" />
              <input name="nivel_academico" value={formData.nivel_academico} onChange={handleChange} placeholder="Instrucción Académica" />
            </div>
          </div>

          {/* SECCIÓN 3: CONTACTO Y DOMICILIO */}
          <div className="form-section">
            <div className="form-section-header">3. DOMICILIO Y CONTACTO</div>
            <div className="form-grid-3">
              <input name="provincia" value={formData.provincia} onChange={handleChange} placeholder="Provincia" />
              <input name="canton" value={formData.canton} onChange={handleChange} placeholder="Cantón" />
              <input name="ciudad" value={formData.ciudad} onChange={handleChange} placeholder="Ciudad/Parroquia" />
              <input name="direccion_domicilio" value={formData.direccion_domicilio} onChange={handleChange} placeholder="Dirección Exacta Domicilio" className="span-2" />
              <input name="celular" value={formData.celular} onChange={handleChange} placeholder="Celular" />
              <input name="telf_convencional" value={formData.telf_convencional} onChange={handleChange} placeholder="Telf. Convencional" />
              <input name="telf_familiar" value={formData.telf_familiar} onChange={handleChange} placeholder="Telf. Emergencia" />
              <input name="parentesco" value={formData.parentesco} onChange={handleChange} placeholder="Parentesco Emergencia" />
            </div>
          </div>

          {/* SECCIÓN 4: LABORAL Y MILITAR */}
          <div className="form-section">
            <div className="form-section-header">4. DATOS COMPLEMENTARIOS</div>
            <div className="form-grid-2">
              <input name="lugar_trabajo" value={formData.lugar_trabajo} onChange={handleChange} placeholder="Empresa/Lugar de Trabajo" />
              <input name="direccion_trabajo" value={formData.direccion_trabajo} onChange={handleChange} placeholder="Dirección de Trabajo" />
              <label className="checkbox-label">
                <input type="checkbox" name="libreta_militar" checked={formData.libreta_militar} onChange={handleChange} /> ¿Posee Libreta Militar?
              </label>
            </div>
          </div>

          {/* SECCIÓN 5: FINANZAS */}
          <div className="form-section">
            <div className="form-section-header">5. CONTROL FINANCIERO</div>
            <div className="form-grid-3">
              <input name="num_documento" value={formData.num_documento} onChange={handleChange} placeholder="N° de Factura/Recibo" />
              <input name="abono_1" type="number" step="0.01" value={formData.abono_1} onChange={handleChange} placeholder="Primer Abono $" />
              <input name="abono_2" type="number" step="0.01" value={formData.abono_2} onChange={handleChange} placeholder="Segundo Abono $" />
            </div>
          </div>

          {/* BANNER DE SALDOS */}
          <div className="saldo-banner-container">
            <span className="total-label-red">INVERSIÓN TOTAL: ${total}</span>
            <span className="saldo-monto-big">SALDO POR PAGAR: ${saldo.toFixed(2)}</span>
          </div>

          <button type="submit" className="btn-guardar-principal">
            {esEdicion ? 'GUARDAR CAMBIOS EN FICHA' : 'REGISTRAR Y GENERAR COMPROBANTE PDF'}
          </button>

        </form>
      </div>
    </div>
  );
};

export default FormularioRegistro;