// Memos de comisión: reserva y uso de un vehículo por una comisión de viaje.
// Reemplazar por persistencia real (Sequelize) cuando el modelo de datos esté definido.

let nextId = 5;

function calcularEstado(memo) {
  if (memo.estado === "finalizado") return memo.estado;
  const hoy = new Date().toISOString().slice(0, 10);
  if (hoy < memo.fechaSalida) return "reservado";
  if (hoy <= memo.fechaRegreso) return "en_curso";
  return "en_curso"; // vencido el regreso previsto, pero aún no se marcó el regreso real
}

const ESTADO_INFO = {
  reservado: { clase: "info", label: "Reservado" },
  en_curso: { clase: "warning", label: "En curso" },
  finalizado: { clase: "success", label: "Finalizado" },
};

const memos = [
  {
    id: 1,
    comisionId: 1,
    vehiculoPatente: "AF006GG",
    choferId: 5,
    integrantes: [
      { nombre: "Ricardo Daniel Peralta", dni: "24.556.781" },
      { nombre: "Walter Esteban Gómez", dni: "29.887.432" },
    ],
    destino: "Ruta 34, km 56 - Quimilí",
    motivo: "Inspección de obra vial",
    fechaSalida: "2026-10-08",
    fechaRegreso: "2026-10-18",
    estado: "en_curso",
    historial: [{ fecha: "2026-10-08", accion: "Memo generado", detalle: "Reserva del vehículo para la comisión." }],
  },
  {
    id: 2,
    comisionId: 2,
    vehiculoPatente: "AH008II",
    choferId: 3,
    integrantes: [
      { nombre: "Marcela Soledad Ríos", dni: "27.889.112" },
      { nombre: "Hugo Alberto Suárez", dni: "31.223.004" },
      { nombre: "Betina Noemí Acuña", dni: "33.998.221" },
    ],
    destino: "Zona rural - Clodomira",
    motivo: "Operativo de asistencia",
    fechaSalida: "2026-10-20",
    fechaRegreso: "2026-10-25",
    estado: "reservado",
    historial: [{ fecha: "2026-10-12", accion: "Memo generado", detalle: "Reserva del vehículo para la comisión." }],
  },
  {
    id: 3,
    comisionId: 3,
    vehiculoPatente: "AE005FF",
    choferId: 1,
    integrantes: [{ nombre: "Jorge Luis Medina", dni: "22.114.567" }],
    destino: "Zona rural - Fernández",
    motivo: "Fiscalización de establecimientos",
    fechaSalida: "2026-08-01",
    fechaRegreso: "2026-08-05",
    estado: "finalizado",
    historial: [
      { fecha: "2026-08-01", accion: "Memo generado", detalle: "Reserva del vehículo para la comisión." },
      { fecha: "2026-08-05", accion: "Regreso registrado", detalle: "Vehículo restituido sin novedades." },
    ],
  },
  {
    id: 4,
    comisionId: 2,
    vehiculoPatente: "AG007HH",
    choferId: 5,
    integrantes: [{ nombre: "Marcela Soledad Ríos", dni: "27.889.112" }],
    destino: "Termas de Río Hondo",
    motivo: "Operativo conjunto de asistencia",
    fechaSalida: "2026-09-01",
    fechaRegreso: "2026-09-04",
    estado: "finalizado",
    historial: [
      { fecha: "2026-09-01", accion: "Memo generado", detalle: "Reserva del vehículo para la comisión." },
      { fecha: "2026-09-04", accion: "Regreso registrado", detalle: "Vehículo restituido sin novedades." },
    ],
  },
];

function listar() {
  return memos;
}

function listarPorComision(comisionId) {
  return memos
    .filter((m) => String(m.comisionId) === String(comisionId))
    .sort((a, b) => (a.fechaSalida < b.fechaSalida ? 1 : -1));
}

function listarPorVehiculo(patente) {
  return memos
    .filter((m) => m.vehiculoPatente.toLowerCase() === String(patente).toLowerCase())
    .sort((a, b) => (a.fechaSalida < b.fechaSalida ? 1 : -1));
}

function obtenerPorId(id) {
  return memos.find((m) => String(m.id) === String(id));
}

function memoActivoDeVehiculo(patente) {
  const deVehiculo = listarPorVehiculo(patente).filter((m) => calcularEstado(m) !== "finalizado");
  if (!deVehiculo.length) return null;
  const enCurso = deVehiculo.find((m) => calcularEstado(m) === "en_curso");
  return enCurso || deVehiculo[deVehiculo.length - 1];
}

function hayConflicto(patente, fechaSalida, fechaRegreso, excluirId) {
  return listarPorVehiculo(patente).some((m) => {
    if (calcularEstado(m) === "finalizado") return false;
    if (excluirId && String(m.id) === String(excluirId)) return false;
    return fechaSalida <= m.fechaRegreso && fechaRegreso >= m.fechaSalida;
  });
}

function crear(datos) {
  const memo = {
    id: nextId++,
    comisionId: datos.comisionId,
    vehiculoPatente: datos.vehiculoPatente,
    choferId: datos.choferId || null,
    integrantes: datos.integrantes || [],
    destino: datos.destino || "",
    motivo: datos.motivo || "",
    fechaSalida: datos.fechaSalida,
    fechaRegreso: datos.fechaRegreso,
    estado: "reservado",
    historial: [{ fecha: new Date().toISOString().slice(0, 10), accion: "Memo generado", detalle: "Reserva del vehículo para la comisión." }],
  };
  memo.estado = calcularEstado(memo);
  memos.push(memo);
  return memo;
}

function finalizar(id, datos) {
  const memo = obtenerPorId(id);
  if (!memo) return null;
  memo.estado = "finalizado";
  memo.fechaRegresoReal = (datos && datos.fechaRegresoReal) || new Date().toISOString().slice(0, 10);
  memo.historial.unshift({
    fecha: memo.fechaRegresoReal,
    accion: "Regreso registrado",
    detalle: (datos && datos.detalle) || "Vehículo restituido.",
  });
  return memo;
}

module.exports = {
  ESTADO_INFO,
  listar,
  listarPorComision,
  listarPorVehiculo,
  obtenerPorId,
  memoActivoDeVehiculo,
  hayConflicto,
  crear,
  finalizar,
  calcularEstado,
};
