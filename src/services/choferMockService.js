// Datos de demostración para la Plantilla de Choferes.
// Reemplazar por consultas reales (Sequelize) cuando el modelo de datos esté definido.

// La licencia provincial de conducir vence siempre el 31 de diciembre del año
// de emisión/retiro, sin importar en qué mes del año se haya tramitado.
function finDeAnio(fechaISO) {
  const anio = new Date(fechaISO + "T00:00:00").getFullYear();
  return `${anio}-12-31`;
}

function formatoFechaCorta(iso) {
  const [y, m, d] = iso.split("-");
  return `${Number(d)}/${Number(m)}/${y}`;
}

function calcularEstadoLicencia(vencISO) {
  const diff = Math.ceil((new Date(vencISO) - new Date()) / 86400000);
  if (diff < 0) return { estadoClase: "danger", estadoLabel: "Vencida", diasParaVencer: diff };
  if (diff <= 30) return { estadoClase: "warning", estadoLabel: "Por vencer", diasParaVencer: diff };
  return { estadoClase: "success", estadoLabel: "Vigente", diasParaVencer: diff };
}

// Motivos predefinidos para la baja/inactividad de un chofer.
// "permanente: true" son bajas definitivas: no tiene sentido pedir "hasta cuándo".
const MOTIVOS_INACTIVIDAD = [
  { id: "licencia_medica", label: "Licencia médica", permanente: false },
  { id: "vacaciones", label: "Vacaciones", permanente: false },
  { id: "suspension", label: "Suspensión disciplinaria", permanente: false },
  { id: "licencia_otro", label: "Otra licencia temporal", permanente: false },
  { id: "renuncia", label: "Renuncia", permanente: true },
  { id: "cese", label: "Cese de funciones / Ya no trabaja más", permanente: true },
  { id: "otro", label: "Otro motivo", permanente: false },
];

function crearChofer(datos) {
  const chofer = Object.assign(
    {
      foto: null,
      email: null,
      vehiculoAsignado: null,
      inactividad: null,
      documentos: {
        dniFrente: null,
        dniDorso: null,
        licenciaProvincialFrente: null,
        licenciaProvincialDorso: null,
        licenciaNacionalFrente: null,
        licenciaNacionalDorso: null,
      },
    },
    datos,
  );

  chofer.licencia.historial = chofer.licencia.historial || [];
  Object.assign(chofer.licencia, calcularEstadoLicencia(chofer.licencia.vencimientoISO));

  if (chofer.licenciaNacional) {
    Object.assign(chofer.licenciaNacional, calcularEstadoLicencia(chofer.licenciaNacional.vencimientoISO));
  }

  return chofer;
}

const choferes = [
  crearChofer({
    id: 1,
    nombre: "Fernando",
    apellido: "Gutiérrez",
    dni: "28.451.902",
    telefono: "11-4455-2210",
    email: "fgutierrez@municipalidad.gob.ar",
    direccion: "Av. San Martín 1450, Centro",
    fechaNacimiento: "12/4/1985",
    fechaIngreso: "3/2/2019",
    turno: "Mañana",
    estado: "Activo",
    licencia: { numero: "L-778234", categoria: "C", fechaEmision: "10/6/2023", fechaVencimiento: "31/12/2027", vencimientoISO: "2027-12-31" },
    licenciaNacional: { numero: "N-445210", categoria: "C", fechaEmision: "15/3/2023", fechaVencimiento: "15/3/2028", vencimientoISO: "2028-03-15" },
    vehiculoAsignado: { patente: "AA001BB", marca: "Toyota", modelo: "Hilux", fechaAsignacion: "15/1/2024" },
  }),
  crearChofer({
    id: 2,
    nombre: "Marisa",
    apellido: "Fernández",
    dni: "31.220.884",
    telefono: "11-3399-4471",
    direccion: "Belgrano 220, Norte",
    fechaNacimiento: "2/9/1990",
    fechaIngreso: "20/8/2021",
    turno: "Tarde",
    estado: "Activo",
    licencia: { numero: "L-901122", categoria: "B1", fechaEmision: "5/3/2024", fechaVencimiento: "31/12/2026", vencimientoISO: "2026-12-31" },
    licenciaNacional: { numero: "N-889213", categoria: "B1", fechaEmision: "5/11/2021", fechaVencimiento: "5/11/2026", vencimientoISO: "2026-11-05" },
  }),
  crearChofer({
    id: 3,
    nombre: "Roberto",
    apellido: "Álvarez",
    dni: "24.887.310",
    telefono: "11-2244-8890",
    direccion: "Mitre 890, Sur",
    fechaNacimiento: "30/1/1978",
    fechaIngreso: "11/11/2015",
    turno: "Noche",
    estado: "Activo",
    licencia: { numero: "L-556098", categoria: "D", fechaEmision: "1/12/2025", fechaVencimiento: "31/12/2025", vencimientoISO: "2025-12-31" },
    licenciaNacional: { numero: "N-220871", categoria: "D", fechaEmision: "10/9/2020", fechaVencimiento: "10/9/2025", vencimientoISO: "2025-09-10" },
  }),
  crearChofer({
    id: 4,
    nombre: "Diego",
    apellido: "Ríos",
    dni: "33.109.774",
    telefono: "11-6677-3321",
    direccion: "Rivadavia 55, Este",
    fechaNacimiento: "18/7/1994",
    fechaIngreso: "2/5/2022",
    turno: "Mañana",
    estado: "Inactivo",
    inactividad: {
      motivo: "licencia_medica",
      motivoLabel: "Licencia médica",
      observaciones: "Licencia médica prolongada por cirugía. Reincorporación sujeta a alta médica.",
      hasta: "2026-12-01",
    },
    licencia: { numero: "L-334509", categoria: "B1", fechaEmision: "8/8/2022", fechaVencimiento: "31/12/2025", vencimientoISO: "2025-12-31" },
    licenciaNacional: { numero: "N-776530", categoria: "B1", fechaEmision: "1/6/2020", fechaVencimiento: "1/6/2025", vencimientoISO: "2025-06-01" },
  }),
  crearChofer({
    id: 5,
    nombre: "Silvina",
    apellido: "Correa",
    dni: "29.774.115",
    telefono: "11-5588-6612",
    direccion: "Sarmiento 340, Oeste",
    fechaNacimiento: "25/3/1988",
    fechaIngreso: "14/2/2020",
    turno: "Tarde/Noche",
    estado: "Activo",
    licencia: { numero: "L-667788", categoria: "E", fechaEmision: "1/1/2024", fechaVencimiento: "31/12/2026", vencimientoISO: "2026-12-31" },
    licenciaNacional: { numero: "N-110492", categoria: "E", fechaEmision: "10/1/2024", fechaVencimiento: "10/1/2029", vencimientoISO: "2029-01-10" },
    vehiculoAsignado: { patente: "AF006GG", marca: "Scania", modelo: "R410", fechaAsignacion: "3/6/2025" },
  }),
];

function listar() {
  return choferes;
}

function obtenerPorId(id) {
  return choferes.find((c) => String(c.id) === String(id));
}

let nextId = 6;

function crear(datos) {
  const fechaEmisionISO = datos.fechaEmisionISO || new Date().toISOString().slice(0, 10);
  const vencimientoISO = finDeAnio(fechaEmisionISO);
  const chofer = crearChofer({
    id: nextId++,
    nombre: datos.nombre,
    apellido: datos.apellido,
    dni: datos.dni,
    telefono: datos.telefono,
    email: datos.email || null,
    direccion: datos.direccion,
    fechaNacimiento: datos.fechaNacimiento,
    fechaIngreso: datos.fechaIngreso,
    turno: datos.turno,
    estado: datos.estado || "Activo",
    licencia: {
      numero: datos.numeroLicencia,
      categoria: datos.categoria,
      fechaEmision: formatoFechaCorta(fechaEmisionISO),
      fechaVencimiento: formatoFechaCorta(vencimientoISO),
      vencimientoISO,
    },
    licenciaNacional: datos.numeroLicenciaNacional
      ? {
          numero: datos.numeroLicenciaNacional,
          categoria: datos.categoriaNacional || datos.categoria,
          fechaEmision: datos.fechaEmisionNacional ? formatoFechaCorta(datos.fechaEmisionNacional) : "",
          fechaVencimiento: datos.vencimientoNacionalISO ? formatoFechaCorta(datos.vencimientoNacionalISO) : "",
          vencimientoISO: datos.vencimientoNacionalISO || null,
        }
      : null,
  });
  choferes.push(chofer);
  return chofer;
}

function actualizar(id, cambios) {
  const chofer = obtenerPorId(id);
  if (!chofer) return null;
  Object.assign(chofer, cambios);
  return chofer;
}

function renovarLicencia(id, fechaRetiroISO, detalle) {
  const chofer = obtenerPorId(id);
  if (!chofer) return null;
  const vencimientoISO = finDeAnio(fechaRetiroISO);
  chofer.licencia.fechaRetiro = fechaRetiroISO;
  chofer.licencia.fechaRetiroFmt = formatoFechaCorta(fechaRetiroISO);
  chofer.licencia.fechaEmision = formatoFechaCorta(fechaRetiroISO);
  chofer.licencia.vencimientoISO = vencimientoISO;
  chofer.licencia.fechaVencimiento = formatoFechaCorta(vencimientoISO);
  Object.assign(chofer.licencia, calcularEstadoLicencia(vencimientoISO));
  chofer.licencia.historial.unshift({
    fecha: fechaRetiroISO,
    detalle: detalle || `Licencia retirada el ${formatoFechaCorta(fechaRetiroISO)}. Vence el 31/12/${vencimientoISO.slice(0, 4)}.`,
  });
  return chofer;
}

function actualizarLicenciaNacional(id, datos) {
  const chofer = obtenerPorId(id);
  if (!chofer) return null;
  const vencimientoISO = datos.vencimientoISO;
  chofer.licenciaNacional = {
    numero: datos.numero,
    categoria: datos.categoria,
    fechaEmision: datos.fechaEmisionISO ? formatoFechaCorta(datos.fechaEmisionISO) : chofer.licenciaNacional ? chofer.licenciaNacional.fechaEmision : "",
    fechaVencimiento: vencimientoISO ? formatoFechaCorta(vencimientoISO) : "",
    vencimientoISO: vencimientoISO || null,
  };
  if (vencimientoISO) {
    Object.assign(chofer.licenciaNacional, calcularEstadoLicencia(vencimientoISO));
  }
  return chofer;
}

function inactivar(id, datos) {
  const chofer = obtenerPorId(id);
  if (!chofer) return null;
  const motivoInfo = MOTIVOS_INACTIVIDAD.find((m) => m.id === datos.motivo);
  chofer.estado = "Inactivo";
  chofer.inactividad = {
    motivo: datos.motivo || "otro",
    motivoLabel: motivoInfo ? motivoInfo.label : "Otro motivo",
    observaciones: datos.observaciones || "",
    hasta: motivoInfo && motivoInfo.permanente ? null : datos.hasta || null,
  };
  return chofer;
}

function activar(id) {
  const chofer = obtenerPorId(id);
  if (!chofer) return null;
  chofer.estado = "Activo";
  chofer.inactividad = null;
  return chofer;
}

function guardarDocumentos(id, archivos) {
  const chofer = obtenerPorId(id);
  if (!chofer) return null;
  Object.assign(chofer.documentos, archivos);
  return chofer;
}

module.exports = {
  MOTIVOS_INACTIVIDAD,
  listar,
  obtenerPorId,
  crear,
  actualizar,
  renovarLicencia,
  actualizarLicenciaNacional,
  inactivar,
  activar,
  guardarDocumentos,
  finDeAnio,
};
