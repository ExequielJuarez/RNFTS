// Datos de demostración para Control de Acceso (usuarios y roles).
// Reemplazar por consultas reales (Sequelize) cuando el modelo de datos esté definido.

const PERMISOS = [
  { clave: "vehiculos", etiqueta: "Vehículos / Flota" },
  { clave: "choferes", etiqueta: "Choferes" },
  { clave: "mantenimientos", etiqueta: "Mantenimientos" },
  { clave: "herramientas", etiqueta: "Herramientas Locales" },
  { clave: "alertas", etiqueta: "Panel de Alertas" },
  { clave: "reportes", etiqueta: "Reportes y Análisis" },
  { clave: "siniestros", etiqueta: "Siniestros / Seguros" },
];

const PERMISOS_ADMIN = [
  { clave: "usuarios", etiqueta: "Usuarios", esSensible: true },
  { clave: "roles", etiqueta: "Roles", esSensible: true },
  { clave: "auditoria", etiqueta: "Log de Auditoría", esSensible: true },
];

const TODOS_LOS_PERMISOS = PERMISOS.concat(PERMISOS_ADMIN).map((p) => p.clave);

const roles = [
  { id: 1, nombre: "Administrador", permisos: TODOS_LOS_PERMISOS, bloqueado: true },
  {
    id: 2,
    nombre: "Supervisor",
    permisos: ["vehiculos", "choferes", "mantenimientos", "herramientas", "alertas", "reportes", "siniestros"],
    bloqueado: false,
  },
  { id: 3, nombre: "Operador", permisos: ["vehiculos", "choferes", "mantenimientos"], bloqueado: false },
];

let usuarios = [
  {
    id: 1,
    nombre: "Administrador",
    apellido: "Sistema",
    nombreUsuario: "admin",
    rolId: 1,
    activo: true,
  },
  {
    id: 2,
    nombre: "Laura",
    apellido: "Gómez",
    nombreUsuario: "lgomez",
    rolId: 2,
    activo: true,
    permisos: ["vehiculos", "choferes", "mantenimientos", "alertas", "reportes"],
  },
  {
    id: 3,
    nombre: "Pablo",
    apellido: "Ibarra",
    nombreUsuario: "pibarra",
    rolId: 3,
    activo: true,
    permisos: ["vehiculos", "mantenimientos"],
  },
  {
    id: 4,
    nombre: "Julieta",
    apellido: "Paz",
    nombreUsuario: "jpaz",
    rolId: 3,
    activo: false,
    permisos: ["vehiculos"],
  },
];

function obtenerRol(id) {
  return roles.find((r) => String(r.id) === String(id));
}

function listarUsuarios() {
  return usuarios.map((u) => Object.assign({}, u, { rol: obtenerRol(u.rolId) }));
}

function obtenerUsuario(id) {
  const u = usuarios.find((x) => String(x.id) === String(id));
  return u ? Object.assign({}, u, { rol: obtenerRol(u.rolId) }) : null;
}

function listarRoles() {
  return roles;
}

module.exports = {
  PERMISOS,
  PERMISOS_ADMIN,
  listarUsuarios,
  obtenerUsuario,
  listarRoles,
  obtenerRol,
};
