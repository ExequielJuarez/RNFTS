// Datos de demostración para el Log de Auditoría.
// Reemplazar por consultas reales (Sequelize) cuando el modelo de datos esté definido.

const BADGE = { ALTA: "success", MODIFICACION: "warning", BAJA: "danger", INICIO: "info" };

function crearRegistro(datos) {
  return Object.assign({ badge: BADGE[datos.accion] || "info" }, datos);
}

const registros = [
  crearRegistro({ fecha: "2026-09-28T08:15:00", usuario: "admin", tabla: "vehiculos", accion: "MODIFICACION", detalle: "Actualizó el kilometraje de AA001BB a 88.000 km." }),
  crearRegistro({ fecha: "2026-09-27T17:40:00", usuario: "lgomez", tabla: "mantenimientos", accion: "ALTA", detalle: "Registró la orden de mantenimiento #3 para AD004EE." }),
  crearRegistro({ fecha: "2026-09-25T09:05:00", usuario: "admin", tabla: "choferes", accion: "MODIFICACION", detalle: "Dio de baja al chofer Diego Ríos por licencia médica." }),
  crearRegistro({ fecha: "2026-09-20T10:00:00", usuario: "admin", tabla: "siniestros", accion: "ALTA", detalle: "Registró un siniestro para el vehículo AD004EE." }),
  crearRegistro({ fecha: "2026-11-10T14:30:00", usuario: "admin", tabla: "vehiculos", accion: "BAJA", detalle: "Dio de baja al vehículo AB002CC tras pérdida total." }),
  crearRegistro({ fecha: "2026-09-28T07:58:00", usuario: "pibarra", tabla: "sesion", accion: "INICIO", detalle: "Inicio de sesión exitoso." }),
];

function listar() {
  return registros;
}

module.exports = { listar };
