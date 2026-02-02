import * as XLSX from 'xlsx';

export const exportarReportePagos = (listaGuardias) => {
  // 1. Mapeo de datos con cálculo de Costo Total
  const datosExcel = listaGuardias.map((g, index) => {
    const abono1 = parseFloat(g.abono_1) || 0;
    const abono2 = parseFloat(g.abono_2) || 0;
    const saldo = parseFloat(g.saldo) || 0;
    
    return {
      "ORD.": index + 1,
      "CEDULA": g.cedula,
      "APELLIDOS Y NOMBRES": g.apellidos_nombres,
      "CORREO": g.correo_electronico || 'N/A',
      "NIVEL": g.nivel_i ? "Nivel I" : (g.reentrenamiento ? "Reentrenamiento" : "Nivel II"),
      "NUMERO DOCUMENTO": g.num_documento || 'S/N',
      "COSTO TOTAL": abono1 + abono2 + saldo, // Calculado para el reporte
      "ABONO 1": abono1,
      "ABONO 2": abono2,
      "SALDO": saldo,
      "FECHA INSC": g.fecha_inscripcion ? new Date(g.fecha_inscripcion).toLocaleDateString('es-ES') : 'N/A'
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

  // 4. Configuración de anchos de columna profesionales
  const wscols = [
    { wch: 6 },  // ORD
    { wch: 15 }, // CEDULA
    { wch: 40 }, // NOMBRES
    { wch: 30 }, // CORREO
    { wch: 18 }, // NIVEL
    { wch: 20 }, // DOCUMENTO
    { wch: 15 }, // COSTO TOTAL
    { wch: 12 }, // ABONO 1
    { wch: 12 }, // ABONO 2
    { wch: 12 }, // SALDO
    { wch: 15 }  // FECHA
  ];
  ws['!cols'] = wscols;

  // 5. Generar archivo
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Control de Pagos");
  
  const fechaHoy = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `Reporte_Pagos_Segeform_${fechaHoy}.xlsx`);
};