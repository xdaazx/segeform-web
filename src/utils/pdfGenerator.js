import jsPDF from 'jspdf';

export const imprimirFichaInscripcion = async (data) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Referencias a la carpeta public
  const logoPath = "/logo_segeform.png";
  const escudoPath = "/escudo_ecuador.png";

  const cargarImagenLocal = (path) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = path;
    });
  };

  try {
    const [logoImg, escudoImg] = await Promise.all([
      cargarImagenLocal(logoPath),
      cargarImagenLocal(escudoPath)
    ]);

    // --- MARCA DE AGUA CENTRAL ---
    if (logoImg) {
      doc.setGState(new doc.GState({ opacity: 0.06 }));
      doc.addImage(logoImg, 'PNG', pageWidth / 2 - 50, 100, 100, 100);
      doc.setGState(new doc.GState({ opacity: 1.0 }));
    }

    // --- CABECERA ---
    if (logoImg) doc.addImage(logoImg, 'PNG', 15, 10, 25, 25);
    if (escudoImg) doc.addImage(escudoImg, 'PNG', pageWidth - 40, 10, 25, 25);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(184, 134, 11); // Dorado Institucional
    doc.text("SEGEFORM CIA. LTDA.", pageWidth / 2, 22, { align: "center" });
    
    doc.setFontSize(14);
    doc.setTextColor(100, 100, 100);
    doc.text("CENTRO DE CAPACITACIONES", pageWidth / 2, 30, { align: "center" });

    doc.setFontSize(18);
    doc.setTextColor(0);
    doc.text("FICHA DE INSCRIPCION", pageWidth / 2, 45, { align: "center" });

    let y = 60;

    // --- SECCIÓN 1: CAPACITACIÓN ---
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("NIVEL I", 20, y);
    doc.rect(38, y - 4, 8, 5); if(data.nivel_i) doc.text("X", 40, y);

    doc.text("REENTRENAMIENTO", 55, y);
    doc.rect(100, y - 4, 8, 5); if(data.reentrenamiento) doc.text("X", 102, y);

    doc.text("NIVEL II", 115, y);
    doc.rect(135, y - 4, 8, 5); if(data.nivel_ii) doc.text("X", 137, y);

    doc.text("NIVEL III", 150, y);
    doc.rect(175, y - 4, 8, 5); if(data.nivel_iii) doc.text("X", 177, y);

    y += 15;

    const drawField = (label, value, x, yPos, w) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(label, x, yPos);
      const labelWidth = doc.getTextWidth(label);
      doc.setFont("helvetica", "normal");
      doc.text(String(value || "--").toUpperCase(), x + labelWidth + 2, yPos);
      doc.line(x + labelWidth + 1, yPos + 1, x + w, yPos + 1);
    };

    drawField("APELLIDOS Y NOMBRES: ", data.apellidos_nombres, 20, y, 190);
    y += 10;
    drawField("N° DE CEDULA: ", data.cedula, 20, y, 90);
    drawField("EDAD: ", data.edad, 110, y, 140);
    
    y += 10;
    doc.setFont("helvetica", "bold");
    doc.text("NIVEL ACADEMICO: BASICO", 20, y);
    doc.rect(75, y - 4, 8, 5); if(data.nivel_academico === "Básico") doc.text("X", 77, y);
    doc.text("BACHILLER", 95, y);
    doc.rect(125, y - 4, 8, 5); if(data.nivel_academico === "Bachiller") doc.text("X", 127, y);
    doc.text("SUPERIOR", 145, y);
    doc.rect(175, y - 4, 8, 5); if(data.nivel_academico === "Superior") doc.text("X", 177, y);
    
    y += 12;
    drawField("TELF. CONVENCIONAL: ", data.telf_convencional, 20, y, 100);
    drawField("CELULAR: ", data.celular, 110, y, 190);
    y += 10;
    drawField("TELF. FAMILIAR: ", data.telf_familiar, 20, y, 100);
    drawField("PARENTESCO: ", data.parentesco, 110, y, 190);
    y += 10;
    drawField("CORREO ELECTRONICO: ", data.correo_electronico, 20, y, 190);
    y += 10;
    drawField("TIPO DE SANGRE: ", data.tipo_sangre, 20, y, 100);
    drawField("LUGAR DE TRABAJO: ", data.lugar_trabajo, 110, y, 190);
    y += 10;
    drawField("DIRECION TRABAJO: ", data.direccion_trabajo, 20, y, 140);

    doc.setFont("helvetica", "bold");
    doc.text("LIBRETA MILITAR:", 145, y);
    doc.setFontSize(9);
    doc.text("SI", 178, y);
    doc.rect(182, y - 4, 6, 5); if(data.libreta_militar) doc.text("X", 183.5, y); 
    doc.text("NO", 190, y);
    doc.rect(195, y - 4, 6, 5); if(!data.libreta_militar) doc.text("X", 196.5, y); 
    
    y += 10;
    drawField("DIRECION DOMICILIO: ", data.direccion_domicilio, 20, y, 190);
    y += 10;
    drawField("PROVINCIA: ", data.provincia, 20, y, 70);
    drawField("CANTON: ", data.canton, 80, y, 130);
    drawField("CIUDAD: ", data.ciudad, 140, y, 190);

    y += 15;
    doc.setFillColor(245, 245, 245);
    doc.rect(20, y, 170, 18, 'F');
    doc.setFont("helvetica", "bold");
    doc.text(`ABONO 1: $${Number(data.abono_1 || 0).toFixed(2)}`, 25, y + 10);
    doc.text(`ABONO 2: $${Number(data.abono_2 || 0).toFixed(2)}`, 75, y + 10);
    doc.setTextColor(220, 38, 38);
    doc.text(`SALDO: $${Number(data.saldo || 0).toFixed(2)}`, 130, y + 10);
    doc.setTextColor(0);

    y += 30;
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("COMPROMISO DE INSCRIPCION:", 20, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    const compromiso = "Una vez registrado y cancelado los valores del curso sea este parcial o total, me comprometo a asistir las 120 horas clases como determina la malla curricular y el decreto de Gobierno, renunciando al derecho de reclamo o devolucion del dinero si no cumpliere con lo establecido.";
    doc.text(doc.splitTextToSize(compromiso, 170), 20, y);

    // --- SECCIÓN CORREGIDA: FECHA DE REGISTRO ---
    y += 25;
    // Si data.fecha_registro existe (viene de la DB), usar esa. Si no, usar la fecha actual.
    const fechaOrigen = data.fecha_registro ? new Date(data.fecha_registro) : new Date();
    const fechaFormateada = fechaOrigen.toLocaleDateString('es-EC', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
    doc.text(`LUGAR, MACHALA de ${fechaFormateada}`, 110, y);

    y += 30;
    doc.line(70, y, 140, y);
    doc.setFont("helvetica", "bold");
    doc.text("Firma del Estudiante", pageWidth / 2, y + 5, { align: "center" });

    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    const footer = "DIRECCION: AV. LAS PALMERAS 2101 Y 13VA. SUR - TELF. 072961702 - 0981417535\nMACHALA - EL ORO - ECUADOR";
    doc.text(footer, pageWidth / 2, 285, { align: "center" });

    doc.save(`Ficha_SEGEFORM_${data.cedula}.pdf`);

  } catch (error) {
    console.error("Error al generar el PDF:", error);
  }
};