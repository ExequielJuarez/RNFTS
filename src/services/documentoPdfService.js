// Genera la versión PDF descargable de un documento (comodato, acta de baja, etc.),
// incluyendo las firmas táctiles si ya fueron cargadas.
// Reemplazar por un motor de plantillas más completo si hace falta un diseño más fiel al papel membretado.

const PDFDocument = require("pdfkit");

const CLAUSULAS_COMODATO = [
  { titulo: "PRIMERA", texto: "El COMODANTE cede en uso, al COMODATARIO los siguientes bienes, vehículos y maquinarias que se detallan a continuación, quien las acepta de plena conformidad con la descripción, características e inventario detallado." },
  { titulo: "SEGUNDA", texto: "El COMODANTE manifiesta tener afectado al uso oficial los bienes objeto del presente contrato y, en consecuencia, se encuentra facultado, sin impedimentos de ninguna naturaleza, para ceder los mismos en uso gratuito al COMODATARIO." },
  { titulo: "TERCERA", texto: "El COMODATARIO se compromete a utilizar los bienes descriptos recibidos, para el destino acordado entre las partes, como así también en las localidades que se asignen, quedando prohibido utilizar los mismos con otro fin, así como ceder, locar, sublocar, transferir o someter los bienes objeto de este contrato, a algún acto jurídico que no sea el específico de este contrato." },
  { titulo: "CUARTA", texto: "El presente contrato está sujeto a la posterior homologación por parte del Sr. Gobernador de la Provincia de Santiago del Estero." },
  { titulo: "QUINTA", texto: "El presente convenio tendrá una vigencia de UN (1) AÑO desde la suscripción del mismo, siendo renovable automáticamente, por idéntico plazo salvo voluntad de las partes de modificarlo con previa notificación fehaciente." },
  { titulo: "SEXTA", texto: "El COMODANTE en razón de la urgencia que pudiera tener, podrá retirar sin previo aviso al COMODATARIO los bienes objeto del presente contrato." },
  { titulo: "SÉPTIMA", texto: "Si alguna de las partes pretendiera rescindir unilateralmente el presente contrato, deberá comunicar dicha voluntad en forma fehaciente a la otra parte con una anticipación no menor a DIEZ (10) días, sin necesidad de invocación de causa y sin derecho de la otra parte a exigir indemnización alguna." },
  { titulo: "OCTAVA", texto: "El COMODANTE entrega los bienes detallados en buen estado de funcionamiento, y el COMODATARIO los recibe y acepta de plena conformidad, comprometiéndose al cuidado y conservación de los mismos, obligándose a darles un uso prudente hasta su restitución total." },
  { titulo: "NOVENA", texto: "El COMODATARIO no podrá efectuar modificaciones estructurales o estéticas sin consentimiento previo del COMODANTE, las que en todo caso serán por cuenta del COMODATARIO, quedando las mismas a la finalización del presente convenio en beneficio de la parte COMODANTE sin cargo alguno." },
  { titulo: "DÉCIMA", texto: "Le asiste al COMODANTE el derecho de inspeccionar los bienes objeto del contrato durante la vigencia de este, en forma amplia." },
  { titulo: "DÉCIMA PRIMERA", texto: "Cualquier gasto necesario para la utilización, traslado, mantenimiento, conservación y/o reparación de los bienes durante la vigencia del presente contrato será por cuenta exclusiva del COMODATARIO." },
  { titulo: "DÉCIMA SEGUNDA", texto: "Se conviene que el COMODANTE no tendrá vinculación jurídica alguna con las personas que el COMODATARIO afecte para el desarrollo de la actividad comprometida, debiendo en su caso los choferes u otros designados, contar con las condiciones de aptitud y habilitaciones correspondientes, como así también todo lo referido al SEGURO DE RIESGO DE TRABAJO y al SALARIO correspondiente a su jornada laboral." },
  { titulo: "DÉCIMA TERCERA", texto: "El COMODATARIO, al vencimiento del plazo del presente contrato, debe restituir los bienes en las mismas condiciones recibidas, salvo el deterioro normal que pudieran tener originados por el buen uso y el transcurso del tiempo." },
  { titulo: "DÉCIMA CUARTA", texto: "A todos los efectos legales las partes constituyen domicilio especial en el domicilio legal de cada una, ambos de esta provincia." },
  { titulo: "DÉCIMA QUINTA", texto: "A fin de resolver las controversias que puedan suscitarse, las partes se someten a la Jurisdicción de los Tribunales de la Provincia de Santiago del Estero, renunciando expresamente las partes a cualquier otro fuero o competencia que pudiere corresponderles." },
];

function fechaLarga(fechaISO) {
  const d = new Date(fechaISO + "T00:00:00");
  const dia = d.getDate();
  const mes = d.toLocaleDateString("es-AR", { month: "long" });
  const anio = d.getFullYear();
  return `${dia} días del mes de ${mes} del ${anio}`;
}

function encabezado(doc, tipoInfo, documento, formatoFecha) {
  doc.font("Helvetica-Bold").fontSize(9).fillColor("#667085").text(tipoInfo.label.toUpperCase(), { align: "right" });
  doc.font("Helvetica").fontSize(9).fillColor("#667085").text(`N° ${documento.numero} · Emitido el ${formatoFecha(documento.fechaEmision)}`, { align: "right" });
  doc.moveDown(1.2);
  doc.fillColor("#101828");
}

function titulo(doc, texto) {
  doc.font("Helvetica-Bold").fontSize(14).text(texto, { align: "center" });
  doc.moveDown(1);
}

function parrafo(doc, texto) {
  doc.font("Helvetica").fontSize(10).text(texto, { align: "justify", lineGap: 2 });
  doc.moveDown(0.8);
}

function listaBienes(doc, bienes) {
  bienes.forEach((b) => {
    doc.font("Helvetica").fontSize(10).text(`•  Un (1) ${(b.tipo || "").toUpperCase()} Marca ${b.marca} Modelo ${b.modelo}, dominio ${b.dominio}.`, { lineGap: 2 });
  });
  doc.moveDown(0.8);
}

function clausulas(doc) {
  CLAUSULAS_COMODATO.forEach((c) => {
    if (doc.y > 700) doc.addPage();
    doc.font("Helvetica-Bold").fontSize(10).text(`${c.titulo}: `, { continued: true });
    doc.font("Helvetica").fontSize(10).text(c.texto, { align: "justify", lineGap: 2 });
    doc.moveDown(0.6);
  });
}

function dataUrlABuffer(dataUrl) {
  const base64 = (dataUrl || "").split(",")[1];
  if (!base64) return null;
  try {
    return Buffer.from(base64, "base64");
  } catch (e) {
    return null;
  }
}

function bloqueFirmas(doc, documento, slots) {
  if (doc.y > 600) doc.addPage();
  doc.moveDown(1);
  const anchoColumna = 230;
  const xIzquierda = doc.page.margins.left;
  const xDerecha = doc.page.width - doc.page.margins.right - anchoColumna;
  const yInicio = doc.y;
  const firmas = documento.firmas || {};

  slots.forEach((s, i) => {
    const x = i === 0 ? xIzquierda : xDerecha;
    let y = yInicio;
    const firma = firmas[s.slot];
    const imgBuffer = firma ? dataUrlABuffer(firma.dataUrl) : null;
    if (imgBuffer) {
      try {
        doc.image(imgBuffer, x, y, { fit: [anchoColumna, 70] });
      } catch (e) {
        /* firma con formato inválido: se omite la imagen, queda sólo la línea */
      }
    }
    y += 75;
    doc.moveTo(x, y).lineTo(x + anchoColumna, y).strokeColor("#c3c2b7").lineWidth(1).stroke();
    doc.font("Helvetica-Bold").fontSize(9).fillColor("#101828").text(s.etiqueta, x, y + 4, { width: anchoColumna, align: "center" });
    doc.font("Helvetica").fontSize(9).fillColor("#4b5768").text(firma ? firma.nombre || s.nombre : s.nombre, x, doc.y, { width: anchoColumna, align: "center" });
    if (firma) {
      doc.font("Helvetica").fontSize(8).fillColor("#8994a3").text(`Firmado el ${new Date(firma.fecha + "T00:00:00").toLocaleDateString("es-AR")}`, x, doc.y, { width: anchoColumna, align: "center" });
    } else {
      doc.font("Helvetica-Oblique").fontSize(8).fillColor("#8994a3").text("Sin firmar", x, doc.y, { width: anchoColumna, align: "center" });
    }
  });
  doc.fillColor("#101828");
  doc.y = yInicio + 130;
}

function generarComodatoPdf(doc, documento, formatoFecha) {
  titulo(doc, "CONTRATO DE COMODATO");
  parrafo(
    doc,
    `En la Ciudad de ${documento.localidad || "Santiago del Estero"}, a los ${fechaLarga(documento.fechaEmision)}, entre ${documento.comodante.nombre}, representado en este acto por el/la ${documento.comodante.cargo}, ${documento.comodante.representante}, DNI ${documento.comodante.dni}, con domicilio legal en ${documento.comodante.domicilio}, en adelante el "COMODANTE", y por la otra parte ${documento.comodatario.nombre}, representado en este acto por ${documento.comodatario.representante}, DNI ${documento.comodatario.dni}, con domicilio legal en ${documento.comodatario.domicilio}, denominado en adelante "COMODATARIO", convienen en celebrar el presente Contrato de Comodato Gratuito, sujeto a las siguientes cláusulas:`
  );
  listaBienes(doc, documento.bienes);
  clausulas(doc);
  parrafo(
    doc,
    `De conformidad, se otorgan y firman Dos (2) ejemplares de un mismo tenor para constancia y a un solo efecto, en ${documento.localidad || "Santiago del Estero"}, a los ${fechaLarga(documento.fechaEmision)}.`
  );
  bloqueFirmas(doc, documento, [
    { slot: "parte1", etiqueta: "Firma COMODANTE", nombre: documento.comodante.representante },
    { slot: "parte2", etiqueta: "Firma COMODATARIO", nombre: documento.comodatario.representante },
  ]);
}

function generarBajaPdf(doc, documento, formatoFecha) {
  titulo(doc, "ACTA DE BAJA DE VEHÍCULOS");
  parrafo(
    doc,
    `En ${documento.taller || documento.localidad || "Santiago del Estero"}, con fecha ${formatoFecha(documento.fechaRecepcion || documento.fechaEmision)}, se deja constancia de la recepción de los siguientes vehículos propuestos para su baja del patrimonio, sin que medie reconocimiento de monto, valuación o compensación alguna por el presente acto.`
  );
  doc.font("Helvetica-Bold").fontSize(10).text("Vehículos incluidos en esta baja:");
  doc.moveDown(0.3);
  listaBienes(doc, documento.bienes);
  bloqueFirmas(doc, documento, [
    { slot: "parte1", etiqueta: "Entrega", nombre: "Administración de Flota" },
    { slot: "parte2", etiqueta: "Recibe", nombre: documento.taller || "Taller Receptor" },
  ]);
}

function generarGenericoPdf(doc, documento, tipoInfo, vehiculo, formatoFecha) {
  titulo(doc, tipoInfo.label.toUpperCase());
  parrafo(
    doc,
    `En ${documento.localidad || "Santiago del Estero"}, a los ${formatoFecha(documento.fechaEmision)}, se deja constancia de lo actuado respecto del vehículo ${vehiculo ? vehiculo.patente + " (" + vehiculo.marca + " " + vehiculo.modelo + ")" : ""}, entre ${documento.comodante.nombre} y ${documento.comodatario.nombre}, representado por ${documento.comodatario.representante} (DNI ${documento.comodatario.dni}), con domicilio en ${documento.comodatario.domicilio}.`
  );
  doc.font("Helvetica-Bold").fontSize(10).text("Bienes involucrados:");
  doc.moveDown(0.3);
  listaBienes(doc, documento.bienes);
  bloqueFirmas(doc, documento, [
    { slot: "parte1", etiqueta: "Entrega", nombre: documento.comodante.representante || documento.comodante.nombre },
    { slot: "parte2", etiqueta: "Recibe", nombre: documento.comodatario.representante },
  ]);
}

function generarDocumentoPdf(documento, tipoInfo, vehiculo, formatoFecha) {
  const doc = new PDFDocument({ size: "A4", margin: 50, bufferPages: true });
  encabezado(doc, tipoInfo, documento, formatoFecha);

  if (documento.tipo === "comodato") {
    generarComodatoPdf(doc, documento, formatoFecha);
  } else if (documento.tipo === "baja") {
    generarBajaPdf(doc, documento, formatoFecha);
  } else {
    generarGenericoPdf(doc, documento, tipoInfo, vehiculo, formatoFecha);
  }

  if (documento.observaciones) {
    if (doc.y > 680) doc.addPage();
    doc.moveDown(0.5);
    doc.font("Helvetica-Bold").fontSize(9).fillColor("#667085").text("OBSERVACIONES");
    doc.font("Helvetica").fontSize(9.5).fillColor("#101828").text(documento.observaciones, { align: "justify" });
  }

  return doc;
}

module.exports = { generarDocumentoPdf };
