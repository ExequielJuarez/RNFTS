// Datos de demostración para la Ficha Técnica de Vehículos.
// Reemplazar por consultas reales (Sequelize) cuando el modelo de datos esté definido.

const ESTADOS = {
  EN_USO: { clase: "info", label: "En Uso" },
  DISPONIBLE: { clase: "success", label: "Disponible" },
  PARA_BAJA: { clase: "neutral", label: "Para Baja" },
  BAJA: { clase: "danger", label: "Baja" },
};

function crearVehiculo(datos) {
  const estado = ESTADOS[datos.estado];
  return Object.assign(
    {
      foto: null,
      choferAsignado: null,
      choferId: null,
      observaciones: "",
      motivoBaja: "",
      siniestros: [],
      alertas: [],
    },
    datos,
    { estadoClase: estado.clase, estadoLabel: estado.label },
  );
}

const vehiculos = [
  crearVehiculo({
    patente: "AA001BB",
    marca: "Toyota",
    modelo: "Hilux",
    tipo: "Camioneta",
    anio: 2019,
    chasis: "CHS-001",
    motor: "MOT-001",
    localidad: "Santiago del Estero (Capital)",
    fechaAlta: "10/1/2023",
    transmision: "Manual",
    combustible: "Diesel",
    km: 88000,
    estado: "EN_USO",
    choferAsignado: "Gutiérrez, Fernando",
    choferId: 1,
    documentacion: {
      cedula: "CED-001",
      titular: "Municipalidad Capital",
      seguroCompania: "Federación Patronal",
      vencSeguro: "15/3/2027",
      vencRTO: "10/9/2026",
      rtoVencida: true,
    },
    observaciones: "Unidad de uso frecuente. Revisar amortiguadores en el próximo service.",
    alertas: [
      { tipo: "danger", titulo: "RTO / VTV", detalle: "Vencida hace 18 días" },
      { tipo: "warning", titulo: "Seguro", detalle: "Vence el 15/3/2027" },
    ],
  }),

  crearVehiculo({
    patente: "AB002CC",
    marca: "Ford",
    modelo: "Ranger",
    tipo: "Camioneta",
    anio: 2017,
    chasis: "CHS-002",
    motor: "MOT-002",
    localidad: "La Banda",
    fechaAlta: "5/3/2022",
    transmision: "Automática",
    combustible: "Diesel",
    km: 124000,
    estado: "BAJA",
    documentacion: {
      cedula: "CED-002",
      titular: "Municipalidad Capital",
      seguroCompania: "La Segunda Seguros",
      vencSeguro: "20/11/2025",
      vencRTO: "12/4/2025",
      rtoVencida: true,
    },
    siniestros: [
      { fecha: "2/10/2025", ubicacion: "Ruta 5, km 34", estadoClase: "danger", estadoLabel: "Pérdida total" },
    ],
    alertas: [{ tipo: "danger", titulo: "Vehículo dado de baja", detalle: "Fuera de servicio desde 10/11/2025" }],
  }),

  crearVehiculo({
    patente: "AC003DD",
    marca: "Volkswagen",
    modelo: "Amarok",
    tipo: "Camioneta",
    anio: 2021,
    chasis: "CHS-003",
    motor: "MOT-003",
    localidad: "Termas de Río Hondo",
    fechaAlta: "18/2/2023",
    transmision: "Automática",
    combustible: "Diesel",
    km: 45000,
    estado: "DISPONIBLE",
    documentacion: {
      cedula: "CED-003",
      titular: "Municipalidad Capital",
      seguroCompania: "Federación Patronal",
      vencSeguro: "2/5/2027",
      vencRTO: "2/5/2027",
      rtoVencida: false,
    },
  }),

  crearVehiculo({
    patente: "AD004EE",
    marca: "Chevrolet",
    modelo: "S-10",
    tipo: "Camioneta",
    anio: 2016,
    chasis: "CHS-004",
    motor: "MOT-004",
    localidad: "Quimilí",
    fechaAlta: "9/9/2021",
    transmision: "Manual",
    combustible: "Diesel",
    km: 198000,
    estado: "PARA_BAJA",
    observaciones: "Costo de reparación elevado respecto del valor del vehículo. Propuesto para baja.",
    documentacion: {
      cedula: "CED-004",
      titular: "Municipalidad Capital",
      seguroCompania: "Sancor Seguros",
      vencSeguro: "30/6/2026",
      vencRTO: "14/1/2026",
      rtoVencida: false,
    },
  }),

  crearVehiculo({
    patente: "AE005FF",
    marca: "Mercedes-Benz",
    modelo: "Tector",
    tipo: "Camión",
    anio: 2015,
    chasis: "CHS-005",
    motor: "MOT-005",
    localidad: "Santiago del Estero (Capital)",
    fechaAlta: "3/4/2020",
    transmision: "Manual",
    combustible: "Diesel",
    km: 315000,
    estado: "PARA_BAJA",
    observaciones: "Unidad con mayor kilometraje de la flota y antigüedad superior a 10 años.",
    documentacion: {
      cedula: "CED-005",
      titular: "Municipalidad Capital",
      seguroCompania: "Federación Patronal",
      vencSeguro: "22/8/2026",
      vencRTO: "5/2/2027",
      rtoVencida: false,
    },
  }),

  crearVehiculo({
    patente: "AF006GG",
    marca: "Scania",
    modelo: "R410",
    tipo: "Camión",
    anio: 2018,
    chasis: "CHS-006",
    motor: "MOT-006",
    localidad: "Frías",
    fechaAlta: "27/6/2021",
    transmision: "Automática",
    combustible: "Diesel",
    km: 415000,
    estado: "DISPONIBLE",
    documentacion: {
      cedula: "CED-006",
      titular: "Municipalidad Capital",
      seguroCompania: "La Segunda Seguros",
      vencSeguro: "11/12/2026",
      vencRTO: "19/9/2026",
      rtoVencida: false,
    },
  }),

  crearVehiculo({
    patente: "AG007HH",
    marca: "Iveco",
    modelo: "Tector 170E28",
    tipo: "Camión",
    anio: 2019,
    chasis: "CHS-007",
    motor: "MOT-007",
    localidad: "La Banda",
    fechaAlta: "14/11/2022",
    transmision: "Manual",
    combustible: "Diesel",
    km: 62000,
    estado: "DISPONIBLE",
    documentacion: {
      cedula: "CED-007",
      titular: "Municipalidad Capital",
      seguroCompania: "Sancor Seguros",
      vencSeguro: "8/7/2027",
      vencRTO: "3/3/2027",
      rtoVencida: false,
    },
  }),

  crearVehiculo({
    patente: "AH008II",
    marca: "Renault",
    modelo: "Master",
    tipo: "Furgón",
    anio: 2020,
    chasis: "CHS-008",
    motor: "MOT-008",
    localidad: "Termas de Río Hondo",
    fechaAlta: "2/2/2023",
    transmision: "Manual",
    combustible: "Diesel",
    km: 73000,
    estado: "DISPONIBLE",
    documentacion: {
      cedula: "CED-008",
      titular: "Municipalidad Capital",
      seguroCompania: "Federación Patronal",
      vencSeguro: "16/4/2027",
      vencRTO: "9/12/2026",
      rtoVencida: false,
    },
  }),
];

function listar() {
  return vehiculos;
}

function listarParaBaja() {
  return vehiculos.filter((v) => v.estado === "PARA_BAJA");
}

function obtenerPorPatente(patente) {
  return vehiculos.find((v) => v.patente.toLowerCase() === String(patente).toLowerCase());
}

function confirmarBaja(patentes) {
  patentes.forEach((patente) => {
    const vehiculo = obtenerPorPatente(patente);
    if (vehiculo) {
      vehiculo.estado = "BAJA";
      vehiculo.estadoClase = ESTADOS.BAJA.clase;
      vehiculo.estadoLabel = ESTADOS.BAJA.label;
    }
  });
}

function actualizar(patente, cambios) {
  const vehiculo = obtenerPorPatente(patente);
  if (!vehiculo) return null;
  Object.assign(vehiculo, cambios);
  if (cambios.estado && ESTADOS[cambios.estado]) {
    vehiculo.estadoClase = ESTADOS[cambios.estado].clase;
    vehiculo.estadoLabel = ESTADOS[cambios.estado].label;
  }
  return vehiculo;
}

function crear(datos) {
  const vehiculo = crearVehiculo(datos);
  vehiculos.push(vehiculo);
  return vehiculo;
}

module.exports = { listar, listarParaBaja, obtenerPorPatente, actualizar, crear, confirmarBaja };
