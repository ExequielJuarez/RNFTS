// Turnos de service programados por vehículo.
// Reemplazar por persistencia real (Sequelize) cuando el modelo de datos esté definido.

const DIAS_RESGUARDO = 14;
let nextId = 4;

const ESTADOS = {
  Programado: "warning",
  Realizado: "success",
  Cancelado: "neutral",
};

function crearTurno(datos) {
  return Object.assign({ estadoClase: ESTADOS[datos.estado] || "neutral" }, datos);
}

const turnos = [
  crearTurno({
    id: 1,
    vehiculoPatente: "AC003DD",
    fechaProgramada: "2026-10-20",
    tipoServicio: "Service de 50.000 km",
    taller: "Taller Central",
    estado: "Programado",
    observaciones: "Turno confirmado telefónicamente.",
  }),
  crearTurno({
    id: 2,
    vehiculoPatente: "AF006GG",
    fechaProgramada: "2026-11-05",
    tipoServicio: "Cambio de embrague",
    taller: "Taller Scania Oficial",
    estado: "Programado",
    observaciones: "",
  }),
  crearTurno({
    id: 3,
    vehiculoPatente: "AA001BB",
    fechaProgramada: "2026-07-01",
    tipoServicio: "Cambio de aceite y filtros",
    taller: "Taller Propio",
    estado: "Realizado",
    observaciones: "",
  }),
];

function listar() {
  return turnos;
}

function listarPorVehiculo(patente) {
  return turnos
    .filter((t) => t.vehiculoPatente.toLowerCase() === String(patente).toLowerCase())
    .sort((a, b) => (a.fechaProgramada < b.fechaProgramada ? 1 : -1));
}

function obtenerPorId(id) {
  return turnos.find((t) => String(t.id) === String(id));
}

function proximoTurno(patente) {
  const hoy = new Date().toISOString().slice(0, 10);
  return listarPorVehiculo(patente)
    .filter((t) => t.estado === "Programado" && t.fechaProgramada >= hoy)
    .sort((a, b) => (a.fechaProgramada > b.fechaProgramada ? 1 : -1))[0] || null;
}

function sumarDias(iso, dias) {
  const fecha = new Date(iso + "T00:00:00");
  fecha.setDate(fecha.getDate() + dias);
  return fecha.toISOString().slice(0, 10);
}

function hayConflictoConViaje(patente, fechaSalida, fechaRegreso) {
  return listarPorVehiculo(patente).some((t) => {
    if (t.estado !== "Programado") return false;
    const desde = sumarDias(t.fechaProgramada, -DIAS_RESGUARDO);
    const hasta = sumarDias(t.fechaProgramada, DIAS_RESGUARDO);
    return fechaSalida <= hasta && fechaRegreso >= desde;
  });
}

function crear(datos) {
  const turno = crearTurno({
    id: nextId++,
    vehiculoPatente: datos.vehiculoPatente,
    fechaProgramada: datos.fechaProgramada,
    tipoServicio: datos.tipoServicio,
    taller: datos.taller || "",
    estado: "Programado",
    observaciones: datos.observaciones || "",
  });
  turnos.push(turno);
  return turno;
}

function cambiarEstado(id, estado) {
  const turno = obtenerPorId(id);
  if (!turno) return null;
  turno.estado = estado;
  turno.estadoClase = ESTADOS[estado] || "neutral";
  return turno;
}

module.exports = {
  DIAS_RESGUARDO,
  listar,
  listarPorVehiculo,
  obtenerPorId,
  proximoTurno,
  hayConflictoConViaje,
  crear,
  cambiarEstado,
};
