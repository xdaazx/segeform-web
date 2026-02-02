import { useState, useEffect, useCallback } from 'react';
import { Search, FileText, Edit, Trash2, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { imprimirFichaInscripcion } from '../../utils/pdfGenerator';
import * as XLSX from 'xlsx';
import '../../App.css';

const TablaGuardias = () => {
  const [guardias, setGuardias] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtroNivel, setFiltroNivel] = useState('todos');
  const navigate = useNavigate();

  /* ============================
      CARGAR DATOS
  ============================ */
  const cargarDatos = useCallback(async () => {
    try {
      const resp = await fetch('/api/guardias');
      const data = await resp.json();
      setGuardias(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar datos', err);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  /* ============================
      FILTROS
  =========================== */
  const filtrados = guardias.filter(g => {
    const texto = busqueda.toLowerCase();
    const coincideBusqueda =
      (g.cedula || '').includes(busqueda) ||
      (g.apellidos_nombres || '').toLowerCase().includes(texto);

    if (filtroNivel === 'todos') return coincideBusqueda;
    return coincideBusqueda && g[filtroNivel] === true;
  });

  /* ============================
      EXPORTAR EXCEL PROFESIONAL
  ============================ */
  const exportarExcel = () => {
    // 1. Mapeo de datos con cálculo de Costo Total y Fecha Correcta
    const datosExcel = filtrados.map((g, index) => {
      const abono1 = parseFloat(g.abono_1) || 0;
      const abono2 = parseFloat(g.abono_2) || 0;
      const saldo = parseFloat(g.saldo) || 0;
      
      return {
        "ORD.": index + 1,
        "CEDULA": g.cedula,
        "APELLIDOS Y NOMBRES": g.apellidos_nombres,
        "CORREO": g.correo_electronico || 'N/A',
        "NIVEL": g.nivel_i ? "Nivel I" : (g.reentrenamiento ? "Reentrenamiento" : (g.nivel_ii ? "Nivel II" : "Nivel III")),
        "NUMERO DOCUMENTO": g.num_documento || 'S/N',
        "COSTO TOTAL": abono1 + abono2 + saldo,
        "ABONO 1": abono1,
        "ABONO 2": abono2,
        "SALDO": saldo,
        "FECHA INSC": g.fecha_registro ? new Date(g.fecha_registro).toLocaleDateString('es-EC') : 'N/A'
      };
    });

    // 2. Crear la hoja de cálculo
    const ws = XLSX.utils.json_to_sheet(datosExcel);

    // 3. Añadir fila de TOTALES al final
    const totalAbono1 = datosExcel.reduce((acc, curr) => acc + curr["ABONO 1"], 0);
    const totalAbono2 = datosExcel.reduce((acc, curr) => acc + curr["ABONO 2"], 0);
    const totalSaldo = datosExcel.reduce((acc, curr) => acc + curr["SALDO"], 0);

    XLSX.utils.sheet_add_json(ws, [
      {
        "APELLIDOS Y NOMBRES": "TOTALES ACUMULADOS",
        "ABONO 1": totalAbono1,
        "ABONO 2": totalAbono2,
        "SALDO": totalSaldo
      }
    ], { skipHeader: true, origin: -1 });

    // 4. Configuración de anchos de columna
    ws['!cols'] = [
      { wch: 6 }, { wch: 15 }, { wch: 40 }, { wch: 30 }, { wch: 18 }, 
      { wch: 20 }, { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 15 }
    ];

    // 5. Generar archivo
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, ws, "Control de Pagos");
    const fechaHoy = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `Reporte_Pagos_Segeform_${fechaHoy}.xlsx`);
  };

  /* ============================
      ELIMINAR
  ============================ */
  const eliminar = async (id, nombre) => {
    if (!window.confirm(`¿Seguro que deseas eliminar a ${nombre}?`)) return;
    try {
      const resp = await fetch(`/api/guardias/${id}`, { method: 'DELETE' });
      if (!resp.ok) throw new Error('Error al eliminar');
      alert('Registro eliminado correctamente');
      cargarDatos();
    } catch (err) {
      alert('No se pudo eliminar el registro');
    }
  };

  return (
    <div className="tabla-pagos-container">
      <div className="tabla-actions-header">
        <div className="search-wrapper">
          <Search size={20} className="search-icon-svg" />
          <input
            className="input-search"
            placeholder="Buscar por cédula o nombre..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <div className="export-buttons">
          <button className="btn-excel" onClick={exportarExcel} title="Descargar Excel">
            <Download size={18} /> Excel
          </button>
        </div>
      </div>

      <div className="filter-tabs">
        {['todos', 'nivel_i', 'reentrenamiento', 'nivel_ii', 'nivel_iii'].map(nivel => (
          <button
            key={nivel}
            className={`tab-button ${filtroNivel === nivel ? 'active' : ''}`}
            onClick={() => setFiltroNivel(nivel)}
          >
            {nivel.replace('_', ' ').toUpperCase()}
          </button>
        ))}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="table-responsive">
          <thead>
            <tr>
              <th>CÉDULA</th>
              <th>NOMBRE</th>
              <th className="text-center">FECHA</th>
              <th className="text-center">SALDO</th>
              <th className="text-center">ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map(g => (
              <tr key={g.id}>
                <td>{g.cedula}</td>
                <td style={{ fontWeight: '600' }}>{g.apellidos_nombres}</td>
                <td className="text-center">
                  {g.fecha_registro
                    ? new Date(g.fecha_registro).toLocaleDateString('es-EC')
                    : '—'}
                </td>
                <td className={`text-center ${Number(g.saldo) > 0 ? 'saldo-rojo' : 'saldo-cero'}`}>
                  ${Number(g.saldo).toFixed(2)}
                </td>
                <td className="actions-cell text-center">
                  <button className="btn-icon-blue-flat" onClick={() => imprimirFichaInscripcion(g)} title="Imprimir PDF">
                    <FileText size={18} />
                  </button>
                  <button className="btn-icon orange-flat" onClick={() => navigate(`/admin/registro/${g.id}`)} title="Editar">
                    <Edit size={18} />
                  </button>
                  <button className="btn-icon red-flat" onClick={() => eliminar(g.id, g.apellidos_nombres)} title="Eliminar">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TablaGuardias;