// Comisiones de viaje (delegaciones que usan vehículos de la flota).
// Reemplazar por persistencia real (Sequelize) cuando el modelo de datos esté definido.

let nextId = 4;

const comisiones = [
  {
    id: 1,
    nombre: "Comisión de Obras Públicas - Ruta 34",
    area: "Vialidad Provincial",
    comisionado: { nombre: "Ricardo Daniel Peralta", dni: "24.556.781", cargo: "Jefe de Inspección", telefono: "0385-154223311" },
    integrantes: [
      { nombre: "Ricardo Daniel Peralta", dni: "24.556.781", cargo: "Jefe de Inspección" },
      { nombre: "Walter Esteban Gómez", dni: "29.887.432", cargo: "Técnico Vial" },
    ],
    observaciones: "",
  },
  {
    id: 2,
    nombre: "Comisión de Defensa Civil",
    area: "Defensa Civil Provincial",
    comisionado: { nombre: "Marcela Soledad Ríos", dni: "27.889.112", cargo: "Coordinadora Operativa", telefono: "0385-154009988" },
    integrantes: [
      { nombre: "Marcela Soledad Ríos", dni: "27.889.112", cargo: "Coordinadora Operativa" },
      { nombre: "Hugo Alberto Suárez", dni: "31.223.004", cargo: "Operador" },
      { nombre: "Betina Noemí Acuña", dni: "33.998.221", cargo: "Operadora" },
    ],
    observaciones: "Comisión permanente de asistencia ante contingencias.",
  },
  {
    id: 3,
    nombre: "Comisión de Fiscalización Rural",
    area: "Ministerio de Producción",
    comisionado: { nombre: "Jorge Luis Medina", dni: "22.114.567", cargo: "Inspector Regional", telefono: "0385-154887766" },
    integrantes: [{ nombre: "Jorge Luis Medina", dni: "22.114.567", cargo: "Inspector Regional" }],
    observaciones: "",
  },
];

function listar() {
  return comisiones;
}

function obtenerPorId(id) {
  return comisiones.find((c) => String(c.id) === String(id));
}

function crear(datos) {
  const comision = {
    id: nextId++,
    nombre: datos.nombre,
    area: datos.area || "",
    comisionado: datos.comisionado,
    integrantes: datos.integrantes || [],
    observaciones: datos.observaciones || "",
  };
  comisiones.push(comision);
  return comision;
}

function actualizar(id, cambios) {
  const comision = obtenerPorId(id);
  if (!comision) return null;
  Object.assign(comision, cambios);
  return comision;
}

module.exports = { listar, obtenerPorId, crear, actualizar };
