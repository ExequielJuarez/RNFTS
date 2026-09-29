// Datos de demostración para la Plantilla de Choferes.
// Reemplazar por consultas reales (Sequelize) cuando el modelo de datos esté definido.

function crearChofer(datos) {
  const chofer = Object.assign(
    {
      foto: null,
      email: null,
      vehiculoAsignado: null,
      motivoBaja: null,
    },
    datos,
  );

  const vencISO = chofer.licencia.vencimientoISO;
  const diff = Math.ceil((new Date(vencISO) - new Date()) / 86400000);
  chofer.licencia.diasParaVencer = diff;
  if (diff < 0) {
    chofer.licencia.estadoClase = "danger";
    chofer.licencia.estadoLabel = "Vencida";
  } else if (diff <= 30) {
    chofer.licencia.estadoClase = "warning";
    chofer.licencia.estadoLabel = "Por vencer";
  } else {
    chofer.licencia.estadoClase = "success";
    chofer.licencia.estadoLabel = "Vigente";
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
    licencia: { numero: "L-778234", categoria: "C", fechaEmision: "10/6/2023", fechaVencimiento: "10/6/2027", vencimientoISO: "2027-06-10" },
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
    licencia: { numero: "L-901122", categoria: "B1", fechaEmision: "5/3/2024", fechaVencimiento: "5/10/2026", vencimientoISO: "2026-10-05" },
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
    licencia: { numero: "L-556098", categoria: "D", fechaEmision: "1/12/2025", fechaVencimiento: "15/8/2026", vencimientoISO: "2026-08-15" },
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
    motivoBaja: "Licencia médica prolongada.",
    licencia: { numero: "L-334509", categoria: "B1", fechaEmision: "8/8/2022", fechaVencimiento: "8/8/2025", vencimientoISO: "2025-08-08" },
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
    licencia: { numero: "L-667788", categoria: "E", fechaEmision: "1/1/2024", fechaVencimiento: "15/12/2026", vencimientoISO: "2026-12-15" },
    vehiculoAsignado: { patente: "AF006GG", marca: "Scania", modelo: "R410", fechaAsignacion: "3/6/2025" },
  }),
];

function listar() {
  return choferes;
}

function obtenerPorId(id) {
  return choferes.find((c) => String(c.id) === String(id));
}

module.exports = { listar, obtenerPorId };
