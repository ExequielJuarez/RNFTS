// Datos de demostración para el Panel de Alertas.
// Reemplazar por consultas reales (Sequelize) cuando el modelo de datos esté definido.

const LABELS = {
  licencia_vencida: "Licencia vencida",
  licencia_proxima: "Licencia próxima a vencer",
  documentacion_vencida: "Documentación vencida",
  mantenimiento_proximo: "Mantenimiento próximo",
  siniestro_activo: "Siniestro activo",
  vehiculo_fuera_servicio: "Vehículo fuera de servicio",
};

const RUTAS_ENTIDAD = {
  Chofer: "/choferes",
  Vehiculo: "/vehiculos",
  Herramienta: "/herramientas",
  Siniestro: "/siniestros",
};

function crearAlerta(datos) {
  return Object.assign({ label: LABELS[datos.tipo] || datos.tipo }, datos);
}

let alertas = [
  crearAlerta({
    id: 1,
    tipo: "licencia_vencida",
    mensaje: "La licencia de conducir de Diego Ríos está vencida desde el 8/8/2025.",
    entidadNombre: "Diego Ríos",
    entidadTipo: "Chofer",
    entidadId: 4,
    prioridad: "alta",
    leida: false,
    fecha: "2026-09-20T09:15:00",
  }),
  crearAlerta({
    id: 2,
    tipo: "licencia_proxima",
    mensaje: "La licencia de Marisa Fernández vence en pocos días.",
    entidadNombre: "Marisa Fernández",
    entidadTipo: "Chofer",
    entidadId: 2,
    prioridad: "media",
    leida: false,
    fecha: "2026-09-24T11:40:00",
  }),
  crearAlerta({
    id: 3,
    tipo: "documentacion_vencida",
    mensaje: "El RTO / VTV del vehículo AA001BB está vencido.",
    entidadNombre: "AA001BB",
    entidadTipo: "Vehiculo",
    entidadId: "AA001BB",
    prioridad: "alta",
    leida: false,
    fecha: "2026-09-11T08:00:00",
  }),
  crearAlerta({
    id: 4,
    tipo: "mantenimiento_proximo",
    mensaje: "AF006GG tiene un service de 400.000 km programado.",
    entidadNombre: "AF006GG",
    entidadTipo: "Vehiculo",
    entidadId: "AF006GG",
    prioridad: "media",
    leida: true,
    fecha: "2026-09-10T14:20:00",
  }),
  crearAlerta({
    id: 5,
    tipo: "siniestro_activo",
    mensaje: "Hay un siniestro en proceso para el vehículo AD004EE.",
    entidadNombre: "AD004EE",
    entidadTipo: "Siniestro",
    entidadId: 2,
    prioridad: "alta",
    leida: false,
    fecha: "2026-08-29T16:05:00",
  }),
  crearAlerta({
    id: 6,
    tipo: "vehiculo_fuera_servicio",
    mensaje: "El vehículo AB002CC fue dado de baja tras un siniestro con pérdida total.",
    entidadNombre: "AB002CC",
    entidadTipo: "Vehiculo",
    entidadId: "AB002CC",
    prioridad: "media",
    leida: true,
    fecha: "2025-11-10T10:00:00",
  }),
];

function listar() {
  return alertas;
}

function obtenerPorId(id) {
  return alertas.find((a) => String(a.id) === String(id));
}

function marcarLeida(id) {
  const alerta = obtenerPorId(id);
  if (alerta) alerta.leida = true;
  return alerta;
}

function rutaEntidad(alerta) {
  const base = RUTAS_ENTIDAD[alerta.entidadTipo];
  return base ? `${base}/${alerta.entidadId}` : null;
}

module.exports = { listar, obtenerPorId, marcarLeida, rutaEntidad };
