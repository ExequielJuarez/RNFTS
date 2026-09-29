// Datos de demostración para Mantenimientos.
// Reemplazar por consultas reales (Sequelize) cuando el modelo de datos esté definido.

const ESTADOS = {
  Realizado: "success",
  Pendiente: "warning",
  "En proceso": "info",
  Cancelado: "danger",
};

function crearOrden(datos) {
  return Object.assign({ estadoClase: ESTADOS[datos.estado] || "info" }, datos);
}

const ordenes = [
  crearOrden({
    id: 1,
    patente: "AA001BB",
    vehiculo: "Toyota Hilux",
    fecha: "2026-07-01",
    tipoServicio: "Cambio de aceite y filtros",
    estado: "Realizado",
    kmServicio: 88000,
    proximoServicioKm: 98000,
    descripcion: "Cambio de aceite 15W40, filtro de aceite y filtro de aire. Revisión general de niveles.",
    observaciones: "Sin anomalías detectadas.",
    costoRepuestos: 45000,
    manoObra: 20000,
    costoTotal: 65000,
  }),
  crearOrden({
    id: 2,
    patente: "AC003DD",
    vehiculo: "Volkswagen Amarok",
    fecha: "2026-05-12",
    tipoServicio: "Rotación de neumáticos",
    estado: "Realizado",
    kmServicio: 45000,
    proximoServicioKm: 55000,
    descripcion: "Rotación de neumáticos y balanceo de las cuatro ruedas.",
    observaciones: "Desgaste normal, dentro de parámetros.",
    costoRepuestos: 0,
    manoObra: 18000,
    costoTotal: 18000,
  }),
  crearOrden({
    id: 3,
    patente: "AD004EE",
    vehiculo: "Chevrolet S-10",
    fecha: "2026-08-20",
    tipoServicio: "Cambio de correa de distribución",
    estado: "En proceso",
    kmServicio: 198000,
    proximoServicioKm: null,
    descripcion: "Reemplazo de correa de distribución, tensor y bomba de agua.",
    observaciones: "Se detectó pérdida menor de refrigerante, en evaluación.",
    costoRepuestos: 68000,
    manoObra: 27000,
    costoTotal: 95000,
  }),
  crearOrden({
    id: 4,
    patente: "AF006GG",
    vehiculo: "Scania R410",
    fecha: "2026-09-10",
    tipoServicio: "Service de 400.000 km",
    estado: "Pendiente",
    kmServicio: 415000,
    proximoServicioKm: 430000,
    descripcion: "Service mayor programado: aceite, filtros, frenos y suspensión.",
    observaciones: "Turno reservado en taller central.",
    costoRepuestos: 0,
    manoObra: 0,
    costoTotal: 0,
  }),
];

const repuestos = [
  { id: 1, nombre: "Aceite 15W40 (litro)", costoUnitario: 6500, stock: 40 },
  { id: 2, nombre: "Filtro de aceite", costoUnitario: 8500, stock: 22 },
  { id: 3, nombre: "Filtro de aire", costoUnitario: 9200, stock: 18 },
  { id: 4, nombre: "Pastillas de freno (juego)", costoUnitario: 32000, stock: 10 },
  { id: 5, nombre: "Correa de distribución", costoUnitario: 45000, stock: 6 },
  { id: 6, nombre: "Batería 12V", costoUnitario: 78000, stock: 5 },
];

function listar() {
  return ordenes;
}

function obtenerPorId(id) {
  return ordenes.find((o) => String(o.id) === String(id));
}

function listarRepuestos() {
  return repuestos;
}

module.exports = { listar, obtenerPorId, listarRepuestos };
