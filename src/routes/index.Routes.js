const express = require("express");
const router = express.Router();

const vehiculoMockService = require("../services/vehiculoMockService");
const choferMockService = require("../services/choferMockService");
const mantenimientoMockService = require("../services/mantenimientoMockService");
const herramientaMockService = require("../services/herramientaMockService");
const siniestroMockService = require("../services/siniestroMockService");
const alertaMockService = require("../services/alertaMockService");
const usuarioMockService = require("../services/usuarioMockService");
const auditoriaMockService = require("../services/auditoriaMockService");

const usuarioSesion = {
  nombre: "Administrador Sistema",
  rol: "ADMINISTRADOR",
  iniciales: "AS",
};

// Datos comunes disponibles en toda vista renderizada por este router
router.use((req, res, next) => {
  res.locals.usuario = usuarioSesion;
  res.locals.notificaciones = 21;
  next();
});

router.get("/", (req, res) => res.redirect("/vehiculos"));

// ===================== VEHÍCULOS =====================

router.get("/vehiculos", (req, res) => {
  const vehiculos = vehiculoMockService.listar();
  res.render("vehiculos/ficha", {
    titulo: "Inventario de Vehículos",
    vehiculos,
    vehiculo: vehiculos[0],
    mostrarDetalle: false,
  });
});

router.get("/vehiculos/alta", (req, res) => {
  res.render("vehiculos/alta", { titulo: "Cargar Vehículo" });
});

router.post("/vehiculos/alta", (req, res) => {
  // Persistencia pendiente: por ahora sólo confirma el alta y vuelve al listado.
  res.redirect("/vehiculos");
});

router.get("/vehiculos/asignar", (req, res) => {
  const vehiculosDisponibles = vehiculoMockService.listar().filter((v) => v.estado === "DISPONIBLE");
  const choferesActivos = choferMockService.listar().filter((c) => c.estado === "Activo");

  const asignaciones = [
    {
      id: 1,
      vehiculo: { patente: "AA001BB", marca: "Toyota Hilux" },
      chofer: { nombre: "Fernando", apellido: "Gutiérrez" },
      fechaDesde: "15/1/2024",
      destino: "Distrito Centro",
    },
    {
      id: 2,
      vehiculo: { patente: "AF006GG", marca: "Scania R410" },
      chofer: { nombre: "Silvina", apellido: "Correa" },
      fechaDesde: "3/6/2025",
      destino: "Recolección Oeste",
    },
  ];

  res.render("vehiculos/asignar", { titulo: "Asignación de Vehículo", vehiculosDisponibles, choferesActivos, asignaciones });
});

router.post("/vehiculos/asignar", (req, res) => {
  res.redirect("/vehiculos/asignar");
});

router.post("/vehiculos/asignaciones/:id/finalizar", (req, res) => {
  res.redirect("/vehiculos/asignar");
});

router.get("/vehiculos/kilometraje", (req, res) => {
  const vehiculos = vehiculoMockService.listar();
  const historial = [
    { patente: "AA001BB", fecha: "2026-03-01", km: 78000 },
    { patente: "AA001BB", fecha: "2026-05-15", km: 83500 },
    { patente: "AA001BB", fecha: "2026-07-01", km: 88000 },
    { patente: "AC003DD", fecha: "2026-02-10", km: 38000 },
    { patente: "AC003DD", fecha: "2026-05-12", km: 41500 },
    { patente: "AC003DD", fecha: "2026-08-01", km: 45000 },
  ];
  res.render("vehiculos/kilometraje", { titulo: "Actualizar Kilometraje", vehiculos, historial });
});

router.post("/vehiculos/kilometraje", (req, res) => {
  res.redirect("/vehiculos/kilometraje");
});

router.get("/vehiculos/:patente/editar", (req, res, next) => {
  const vehiculo = vehiculoMockService.obtenerPorPatente(req.params.patente);
  if (!vehiculo) return next();
  res.render("vehiculos/editar", { titulo: "Editar " + vehiculo.patente, vehiculo });
});

router.post("/vehiculos/:patente/editar", (req, res, next) => {
  const vehiculo = vehiculoMockService.obtenerPorPatente(req.params.patente);
  if (!vehiculo) return next();
  res.redirect("/vehiculos/" + vehiculo.patente);
});

router.get("/vehiculos/:patente", (req, res, next) => {
  const vehiculos = vehiculoMockService.listar();
  const vehiculo = vehiculoMockService.obtenerPorPatente(req.params.patente);
  if (!vehiculo) return next();

  res.render("vehiculos/ficha", {
    titulo: vehiculo.patente,
    vehiculos,
    vehiculo,
    mostrarDetalle: true,
  });
});

// ===================== CHOFERES =====================

router.get("/choferes", (req, res) => {
  const choferes = choferMockService.listar();
  res.render("choferes/ficha", { choferes, chofer: choferes[0], mostrarDetalle: false, activeItem: "choferes-listado" });
});

router.get("/choferes/nuevo", (req, res) => {
  res.render("choferes/carga", { titulo: "Cargar Chofer", activeItem: "choferes-alta" });
});

router.post("/choferes/nuevo", (req, res) => {
  res.redirect("/choferes");
});

router.get("/choferes/:id/editar", (req, res, next) => {
  const chofer = choferMockService.obtenerPorId(req.params.id);
  if (!chofer) return next();
  res.render("choferes/editar", { titulo: "Editar Chofer", chofer, activeItem: "choferes-listado" });
});

router.post("/choferes/:id/editar", (req, res, next) => {
  const chofer = choferMockService.obtenerPorId(req.params.id);
  if (!chofer) return next();
  res.redirect("/choferes/" + chofer.id);
});

router.post("/choferes/:id/activar", (req, res, next) => {
  const chofer = choferMockService.obtenerPorId(req.params.id);
  if (!chofer) return next();
  res.redirect("/choferes/" + chofer.id);
});

router.post("/choferes/:id/desactivar", (req, res, next) => {
  const chofer = choferMockService.obtenerPorId(req.params.id);
  if (!chofer) return next();
  res.redirect("/choferes/" + chofer.id);
});

router.get("/choferes/:id", (req, res, next) => {
  const choferes = choferMockService.listar();
  const chofer = choferMockService.obtenerPorId(req.params.id);
  if (!chofer) return next();

  res.render("choferes/ficha", { choferes, chofer, mostrarDetalle: true, activeItem: "choferes-listado" });
});

// ===================== MANTENIMIENTOS =====================

router.get("/mantenimientos", (req, res) => {
  const ordenes = mantenimientoMockService.listar();
  res.render("mantenimientos/ficha", { ordenes, orden: ordenes[0], mostrarDetalle: false, activeItem: "mantenimientos-listado" });
});

router.get("/mantenimientos/nuevo", (req, res) => {
  res.render("mantenimientos/carga", {
    titulo: "Registrar Mantenimiento",
    vehiculos: vehiculoMockService.listar(),
    repuestos: mantenimientoMockService.listarRepuestos(),
    patenteSeleccionada: req.query.patente || "",
    activeItem: "mantenimientos-nuevo",
  });
});

router.post("/mantenimientos/nuevo", (req, res) => {
  res.redirect("/mantenimientos");
});

router.post("/mantenimientos/:id/estado", (req, res, next) => {
  const orden = mantenimientoMockService.obtenerPorId(req.params.id);
  if (!orden) return next();
  res.redirect("/mantenimientos/" + orden.id);
});

router.get("/mantenimientos/:id", (req, res, next) => {
  const ordenes = mantenimientoMockService.listar();
  const orden = mantenimientoMockService.obtenerPorId(req.params.id);
  if (!orden) return next();
  res.render("mantenimientos/ficha", { ordenes, orden, mostrarDetalle: true, activeItem: "mantenimientos-listado" });
});

// ===================== HERRAMIENTAS =====================

router.get("/herramientas", (req, res) => {
  const herramientas = herramientaMockService.listar();
  res.render("herramientas/ficha", { herramientas, herramienta: herramientas[0], mostrarDetalle: false, activeItem: "herramientas-listado" });
});

router.get("/herramientas/nueva", (req, res) => {
  res.render("herramientas/carga", {
    titulo: "Cargar Herramienta",
    sectores: herramientaMockService.listarSectores(),
    activeItem: "herramientas-nueva",
  });
});

router.post("/herramientas/nueva", (req, res) => {
  res.redirect("/herramientas");
});

router.get("/herramientas/repuestos", (req, res) => {
  res.render("herramientas/repuestos", {
    titulo: "Catálogo de Repuestos",
    repuestos: mantenimientoMockService.listarRepuestos(),
    activeItem: "herramientas-repuestos",
  });
});

router.post("/herramientas/repuestos", (req, res) => {
  res.redirect("/herramientas/repuestos");
});

router.post("/herramientas/repuestos/:id/eliminar", (req, res) => {
  res.redirect("/herramientas/repuestos");
});

router.get("/herramientas/:id/editar", (req, res, next) => {
  const herramienta = herramientaMockService.obtenerPorId(req.params.id);
  if (!herramienta) return next();
  res.render("herramientas/editar", {
    titulo: "Editar Herramienta",
    herramienta,
    sectores: herramientaMockService.listarSectores(),
    activeItem: "herramientas-listado",
  });
});

router.post("/herramientas/:id/editar", (req, res, next) => {
  const herramienta = herramientaMockService.obtenerPorId(req.params.id);
  if (!herramienta) return next();
  res.redirect("/herramientas/" + herramienta.id);
});

router.get("/herramientas/:id/prestamo", (req, res, next) => {
  const herramienta = herramientaMockService.obtenerPorId(req.params.id);
  if (!herramienta) return next();
  res.render("herramientas/prestamo", { titulo: "Registrar Préstamo", herramienta, activeItem: "herramientas-listado" });
});

router.post("/herramientas/:id/prestamo", (req, res, next) => {
  const herramienta = herramientaMockService.obtenerPorId(req.params.id);
  if (!herramienta) return next();
  res.redirect("/herramientas/" + herramienta.id);
});

router.post("/herramientas/:id/devolucion", (req, res, next) => {
  const herramienta = herramientaMockService.obtenerPorId(req.params.id);
  if (!herramienta) return next();
  res.redirect("/herramientas/" + herramienta.id);
});

router.post("/herramientas/:id/eliminar", (req, res, next) => {
  const herramienta = herramientaMockService.obtenerPorId(req.params.id);
  if (!herramienta) return next();
  res.redirect("/herramientas");
});

router.get("/herramientas/:id", (req, res, next) => {
  const herramientas = herramientaMockService.listar();
  const herramienta = herramientaMockService.obtenerPorId(req.params.id);
  if (!herramienta) return next();
  res.render("herramientas/ficha", { herramientas, herramienta, mostrarDetalle: true, activeItem: "herramientas-listado" });
});

// ===================== SINIESTROS =====================

router.get("/siniestros", (req, res) => {
  res.render("siniestros/listado", { siniestros: siniestroMockService.listar(), activeItem: "siniestros-listado" });
});

router.get("/siniestros/nuevo", (req, res) => {
  res.render("siniestros/nuevo", {
    titulo: "Registrar Siniestro",
    vehiculos: vehiculoMockService.listar(),
    choferes: choferMockService.listar(),
    activeItem: "siniestros-nuevo",
  });
});

router.post("/siniestros/nuevo", (req, res) => {
  res.redirect("/siniestros");
});

router.post("/siniestros/:id/resolver", (req, res, next) => {
  const siniestro = siniestroMockService.obtenerPorId(req.params.id);
  if (!siniestro) return next();
  res.redirect("/siniestros/" + siniestro.id);
});

router.get("/siniestros/:id", (req, res, next) => {
  const siniestro = siniestroMockService.obtenerPorId(req.params.id);
  if (!siniestro) return next();
  res.render("siniestros/detalle", { siniestro, activeItem: "siniestros-listado" });
});

// ===================== ALERTAS =====================

router.get("/alertas", (req, res) => {
  const alertas = alertaMockService.listar();
  const vehiculos = vehiculoMockService.listar();
  const choferes = choferMockService.listar();

  const resumen = {
    licVencidas: alertas.filter((a) => a.tipo === "licencia_vencida").length,
    licProximas: alertas.filter((a) => a.tipo === "licencia_proxima").length,
    docsVencidas: alertas.filter((a) => a.tipo === "documentacion_vencida").length,
    mantProximos: alertas.filter((a) => a.tipo === "mantenimiento_proximo").length,
  };

  const estadisticas = {
    vehiculos: {
      disponible: vehiculos.filter((v) => v.estado === "DISPONIBLE").length,
      uso: vehiculos.filter((v) => v.estado === "EN_USO").length,
      baja: vehiculos.filter((v) => v.estado === "BAJA").length,
    },
    choferes: {
      activo: choferes.filter((c) => c.estado === "Activo").length,
      inactivo: choferes.filter((c) => c.estado !== "Activo").length,
    },
  };

  res.render("alertas/listado", { alertas, resumen, estadisticas });
});

router.post("/alertas/:id/leer", (req, res) => {
  const alerta = alertaMockService.marcarLeida(req.params.id);
  res.json({ ok: Boolean(alerta) });
});

router.get("/alertas/:id", (req, res, next) => {
  const alerta = alertaMockService.obtenerPorId(req.params.id);
  if (!alerta) return next();
  res.render("alertas/detalle", { alerta, ruta: alertaMockService.rutaEntidad(alerta) });
});

// ===================== CONTROL DE ACCESO =====================

router.get("/accesos", (req, res) => res.redirect("/accesos/usuarios"));

router.get("/accesos/usuarios", (req, res) => {
  res.render("accesos/usuarios", {
    usuarios: usuarioMockService.listarUsuarios(),
    roles: usuarioMockService.listarRoles(),
    activeItem: "accesos-usuarios",
  });
});

router.get("/accesos/usuarios/nuevo", (req, res) => {
  res.render("accesos/usuario-nuevo", {
    titulo: "Nuevo Usuario",
    roles: usuarioMockService.listarRoles(),
    permisos: usuarioMockService.PERMISOS,
    permisosAdmin: usuarioMockService.PERMISOS_ADMIN,
    activeItem: "accesos-usuarios",
  });
});

router.post("/accesos/usuarios/nuevo", (req, res) => {
  res.redirect("/accesos/usuarios");
});

router.get("/accesos/usuarios/:id/editar", (req, res, next) => {
  const objetivo = usuarioMockService.obtenerUsuario(req.params.id);
  if (!objetivo) return next();
  res.render("accesos/usuario-editar", {
    titulo: "Editar Usuario",
    objetivo,
    roles: usuarioMockService.listarRoles(),
    permisos: usuarioMockService.PERMISOS,
    permisosAdmin: usuarioMockService.PERMISOS_ADMIN,
    activeItem: "accesos-usuarios",
  });
});

router.post("/accesos/usuarios/:id/editar", (req, res, next) => {
  const objetivo = usuarioMockService.obtenerUsuario(req.params.id);
  if (!objetivo) return next();
  res.redirect("/accesos/usuarios");
});

router.get("/accesos/roles", (req, res) => {
  res.render("accesos/roles", {
    roles: usuarioMockService.listarRoles(),
    permisosCatalogo: usuarioMockService.PERMISOS.concat(usuarioMockService.PERMISOS_ADMIN),
    activeItem: "accesos-roles",
  });
});

router.get("/accesos/roles/:id/editar", (req, res, next) => {
  const rol = usuarioMockService.obtenerRol(req.params.id);
  if (!rol) return next();
  res.render("accesos/rol-editar", {
    titulo: "Configurar Rol",
    rol,
    permisos: usuarioMockService.PERMISOS,
    activeItem: "accesos-roles",
  });
});

router.post("/accesos/roles/:id/editar", (req, res, next) => {
  const rol = usuarioMockService.obtenerRol(req.params.id);
  if (!rol) return next();
  res.redirect("/accesos/roles");
});

// ===================== AUDITORÍA =====================

router.get("/auditoria", (req, res) => {
  const registros = auditoriaMockService.listar();
  const conteo = {};
  registros.forEach((r) => {
    conteo[r.accion] = (conteo[r.accion] || 0) + 1;
  });
  const coloresAccion = { ALTA: "#1a7f4b", MODIFICACION: "#a3630f", BAJA: "#b3261e", INICIO: "#1d5fbf" };
  const resumen = Object.keys(conteo).map((accion) => ({
    accion,
    cantidad: conteo[accion],
    color: coloresAccion[accion] || "#8994a3",
  }));

  res.render("auditoria/index", { registros, resumen });
});

// ===================== REPORTES =====================

const formatoARS = (n) => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n || 0);
const formatoFechaCorta = (iso) => {
  if (!iso) return "--/--/----";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};
const PALETA_DISTRITOS = ["#0e7c6b", "#1d5fbf", "#a3630f", "#b3261e", "#667085"];

router.get("/reportes", (req, res) => {
  const hoy = new Date().toISOString().slice(0, 10);
  const fechaDesde = req.query.fechaDesde || "2026-01-01";
  const fechaHasta = req.query.fechaHasta || hoy;

  const ordenes = mantenimientoMockService.listar();
  const vehiculos = vehiculoMockService.listar();

  const costoTotal = ordenes.reduce((acc, o) => acc + o.costoTotal, 0);

  const gastoPorPatente = {};
  ordenes.forEach((o) => {
    gastoPorPatente[o.patente] = (gastoPorPatente[o.patente] || 0) + o.costoTotal;
  });
  const topVehiculos = Object.entries(gastoPorPatente)
    .map(([patente, total]) => ({ patente, total, totalFormateado: formatoARS(total) }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);
  const maxGastoVehiculo = Math.max(1, ...topVehiculos.map((v) => v.total));

  const conteoDistrito = {};
  vehiculos.forEach((v) => {
    conteoDistrito[v.distrito] = (conteoDistrito[v.distrito] || 0) + 1;
  });
  const porDistrito = Object.entries(conteoDistrito).map(([distrito, cantidad]) => ({ distrito, cantidad }));
  const coloresDistrito = porDistrito.map((_, i) => PALETA_DISTRITOS[i % PALETA_DISTRITOS.length]);

  const conteoServicio = {};
  ordenes.forEach((o) => {
    conteoServicio[o.tipoServicio] = (conteoServicio[o.tipoServicio] || 0) + 1;
  });
  const porTipoServicio = Object.entries(conteoServicio)
    .map(([tipo, cantidad]) => ({ tipo, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad);
  const maxTipoServicio = Math.max(1, ...porTipoServicio.map((t) => t.cantidad));

  res.render("reportes/index", {
    fechaDesde,
    fechaHasta,
    periodoFormateado: `${formatoFechaCorta(fechaDesde)} al ${formatoFechaCorta(fechaHasta)}`,
    estadisticas: {
      costoTotal,
      costoTotalFormateado: formatoARS(costoTotal),
      topVehiculos,
      maxGastoVehiculo,
      porDistrito,
      coloresDistrito,
      totalVehiculos: vehiculos.length,
      porTipoServicio,
      maxTipoServicio,
    },
  });
});

module.exports = router;
