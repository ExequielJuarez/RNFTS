// Documentos generados por vehículo (comodatos, actas de entrega/recepción, etc.).
// Reemplazar por persistencia real (Sequelize) cuando el modelo de datos esté definido.

const TIPOS = {
  comodato: { id: "comodato", label: "Contrato de Comodato", prefijo: "COM", vigenciaMeses: 12 },
  acta_entrega: { id: "acta_entrega", label: "Acta de Entrega", prefijo: "AE", vigenciaMeses: null },
  acta_recepcion: { id: "acta_recepcion", label: "Acta de Recepción", prefijo: "AR", vigenciaMeses: null },
  otro: { id: "otro", label: "Otro Documento", prefijo: "DOC", vigenciaMeses: null },
};

const TIPOS_LISTA = Object.values(TIPOS);

function formatoFecha(iso) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function sumarMeses(iso, meses) {
  const fecha = new Date(iso + "T00:00:00");
  fecha.setMonth(fecha.getMonth() + meses);
  return fecha.toISOString().slice(0, 10);
}

function calcularEstado(documento) {
  if (!documento.fechaVencimiento) return { clase: "neutral", label: "Sin vencimiento" };
  const hoy = new Date().toISOString().slice(0, 10);
  const dias = (new Date(documento.fechaVencimiento) - new Date(hoy)) / 86400000;
  if (dias < 0) return { clase: "danger", label: "Vencido" };
  if (dias <= 30) return { clase: "warning", label: "Por vencer" };
  return { clase: "success", label: "Vigente" };
}

let nextId = 3;

const documentos = [
  {
    id: 1,
    vehiculoPatente: "AA001BB",
    tipo: "comodato",
    numero: "COM-014/2025",
    fechaEmision: "2025-03-01",
    fechaVencimiento: "2026-03-01",
    comodante: {
      nombre: "Gobierno de la Provincia de Santiago del Estero",
      cargo: "Ministro de Producción, Recursos Naturales, Forestación, Tierras y Medio Ambiente",
      representante: "Néstor Osvaldo Ceferino Machado Laitano",
      dni: "20.151.259",
      domicilio: 'Calle Andes N°30, esq. Belgrano "Complejo Manuel Belgrano", Torre Andes, 10° Piso, Santiago del Estero',
    },
    comodatario: {
      nombre: "Bomberos Voluntarios Zona Centro",
      representante: "Carlos Alberto Díaz",
      dni: "18.442.337",
      domicilio: "Av. Roca 540, Santiago del Estero",
    },
    localidad: "Santiago del Estero (Capital)",
    bienes: [{ cantidad: 1, tipo: "Camioneta", marca: "Toyota", modelo: "Hilux", dominio: "AA001BB" }],
    observaciones: "Uso exclusivo para tareas de prevención y asistencia comunitaria.",
    historial: [{ fecha: "2025-03-01", accion: "Documento generado", detalle: "Emisión inicial del comodato." }],
  },
  {
    id: 2,
    vehiculoPatente: "AC003DD",
    tipo: "comodato",
    numero: "COM-009/2024",
    fechaEmision: "2024-06-01",
    fechaVencimiento: "2026-10-15",
    comodante: {
      nombre: "Gobierno de la Provincia de Santiago del Estero",
      cargo: "Ministro de Producción, Recursos Naturales, Forestación, Tierras y Medio Ambiente",
      representante: "Néstor Osvaldo Ceferino Machado Laitano",
      dni: "20.151.259",
      domicilio: 'Calle Andes N°30, esq. Belgrano "Complejo Manuel Belgrano", Torre Andes, 10° Piso, Santiago del Estero',
    },
    comodatario: {
      nombre: "Defensa Civil - Delegación La Banda",
      representante: "Marcela Soledad Ríos",
      dni: "27.889.112",
      domicilio: "Av. Belgrano 210, La Banda",
    },
    localidad: "La Banda",
    bienes: [{ cantidad: 1, tipo: "Camioneta", marca: "Volkswagen", modelo: "Amarok", dominio: "AC003DD" }],
    observaciones: "Próximo a vencer: gestionar renovación o restitución del vehículo.",
    historial: [{ fecha: "2024-06-01", accion: "Documento generado", detalle: "Emisión inicial del comodato." }],
  },
];

function listar() {
  return documentos;
}

function listarPorVehiculo(patente) {
  return documentos
    .filter((d) => d.vehiculoPatente.toLowerCase() === String(patente).toLowerCase())
    .sort((a, b) => (a.fechaEmision < b.fechaEmision ? 1 : -1));
}

function obtenerPorId(id) {
  return documentos.find((d) => String(d.id) === String(id));
}

function siguienteNumero(tipoId, anio) {
  const prefijo = TIPOS[tipoId] ? TIPOS[tipoId].prefijo : "DOC";
  const delAnio = documentos.filter((d) => d.tipo === tipoId && d.numero.endsWith("/" + anio));
  const correlativo = String(delAnio.length + 1).padStart(3, "0");
  return `${prefijo}-${correlativo}/${anio}`;
}

function crear(datos) {
  const tipoInfo = TIPOS[datos.tipo] || TIPOS.otro;
  const fechaEmision = datos.fechaEmision || new Date().toISOString().slice(0, 10);
  const anio = fechaEmision.slice(0, 4);
  const documento = {
    id: nextId++,
    vehiculoPatente: datos.vehiculoPatente,
    tipo: tipoInfo.id,
    numero: siguienteNumero(tipoInfo.id, anio),
    fechaEmision,
    fechaVencimiento: tipoInfo.vigenciaMeses ? sumarMeses(fechaEmision, tipoInfo.vigenciaMeses) : null,
    comodante: datos.comodante || null,
    comodatario: datos.comodatario || null,
    localidad: datos.localidad || "",
    bienes: datos.bienes || [],
    observaciones: datos.observaciones || "",
    historial: [{ fecha: fechaEmision, accion: "Documento generado", detalle: "Emisión inicial." }],
  };
  documentos.push(documento);
  return documento;
}

function renovar(id, datos) {
  const documento = obtenerPorId(id);
  if (!documento) return null;
  const tipoInfo = TIPOS[documento.tipo] || TIPOS.otro;
  const fechaRenovacion = datos.fechaRenovacion || new Date().toISOString().slice(0, 10);
  documento.fechaEmision = fechaRenovacion;
  documento.fechaVencimiento = tipoInfo.vigenciaMeses ? sumarMeses(fechaRenovacion, tipoInfo.vigenciaMeses) : documento.fechaVencimiento;
  if (datos.observaciones) documento.observaciones = datos.observaciones;
  documento.historial.unshift({
    fecha: fechaRenovacion,
    accion: "Renovado",
    detalle: datos.detalle || "Renovación registrada desde la ficha del vehículo.",
  });
  return documento;
}

module.exports = {
  TIPOS,
  TIPOS_LISTA,
  listar,
  listarPorVehiculo,
  obtenerPorId,
  crear,
  renovar,
  calcularEstado,
  formatoFecha,
};
