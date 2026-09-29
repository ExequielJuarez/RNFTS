const express = require("express");
const router = express.Router();

const vehiculoMockService = require("../services/vehiculoMockService");
const choferMockService = require("../services/choferMockService");
const mantenimientoMockService = require("../services/mantenimientoMockService");
const herramientaMockService = require("../services/herramientaMockService");
const siniestroMockService = require("../services/siniestroMockService");
const alertaMockService = require("../services/alertaMockService");

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
  res.render("choferes/ficha", { choferes, chofer: choferes[0], mostrarDetalle: false });
});

router.get("/choferes/nuevo", (req, res) => {
  res.render("choferes/carga", { titulo: "Cargar Chofer" });
});

router.post("/choferes/nuevo", (req, res) => {
  res.redirect("/choferes");
});

router.get("/choferes/:id/editar", (req, res, next) => {
  const chofer = choferMockService.obtenerPorId(req.params.id);
  if (!chofer) return next();
  res.render("choferes/editar", { titulo: "Editar Chofer", chofer });
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

  res.render("choferes/ficha", { choferes, chofer, mostrarDetalle: true });
});

// ===================== MANTENIMIENTOS =====================

router.get("/mantenimientos", (req, res) => {
  const ordenes = mantenimientoMockService.listar();
  res.render("mantenimientos/ficha", { ordenes, orden: ordenes[0], mostrarDetalle: false });
});

router.get("/mantenimientos/nuevo", (req, res) => {
  res.render("mantenimientos/carga", {
    titulo: "Registrar Mantenimiento",
    vehiculos: vehiculoMockService.listar(),
    repuestos: mantenimientoMockService.listarRepuestos(),
    patenteSeleccionada: req.query.patente || "",
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
  res.render("mantenimientos/ficha", { ordenes, orden, mostrarDetalle: true });
});

// ===================== HERRAMIENTAS =====================

router.get("/herramientas", (req, res) => {
  const herramientas = herramientaMockService.listar();
  res.render("herramientas/ficha", { herramientas, herramienta: herramientas[0], mostrarDetalle: false });
});

router.get("/herramientas/nueva", (req, res) => {
  res.render("herramientas/carga", { titulo: "Cargar Herramienta", sectores: herramientaMockService.listarSectores() });
});

router.post("/herramientas/nueva", (req, res) => {
  res.redirect("/herramientas");
});

router.get("/herramientas/repuestos", (req, res) => {
  res.render("herramientas/repuestos", { titulo: "Catálogo de Repuestos", repuestos: mantenimientoMockService.listarRepuestos() });
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
  res.render("herramientas/editar", { titulo: "Editar Herramienta", herramienta, sectores: herramientaMockService.listarSectores() });
});

router.post("/herramientas/:id/editar", (req, res, next) => {
  const herramienta = herramientaMockService.obtenerPorId(req.params.id);
  if (!herramienta) return next();
  res.redirect("/herramientas/" + herramienta.id);
});

router.get("/herramientas/:id/prestamo", (req, res, next) => {
  const herramienta = herramientaMockService.obtenerPorId(req.params.id);
  if (!herramienta) return next();
  res.render("herramientas/prestamo", { titulo: "Registrar Préstamo", herramienta });
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
  res.render("herramientas/ficha", { herramientas, herramienta, mostrarDetalle: true });
});

// ===================== SINIESTROS =====================

router.get("/siniestros", (req, res) => {
  res.render("siniestros/listado", { siniestros: siniestroMockService.listar() });
});

router.get("/siniestros/nuevo", (req, res) => {
  res.render("siniestros/nuevo", {
    titulo: "Registrar Siniestro",
    vehiculos: vehiculoMockService.listar(),
    choferes: choferMockService.listar(),
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
  res.render("siniestros/detalle", { siniestro });
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

module.exports = router;
