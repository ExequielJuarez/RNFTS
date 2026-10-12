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
const documentoMockService = require("../services/documentoMockService");
const comisionMockService = require("../services/comisionMockService");
const memoMockService = require("../services/memoMockService");
const turnoServiceMockService = require("../services/turnoServiceMockService");
const pedidoRetiroMockService = require("../services/pedidoRetiroMockService");
const { LOCALIDADES } = require("../services/catalogos");

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

function comisionActivaDeVehiculo(patente) {
  const memo = memoMockService.memoActivoDeVehiculo(patente);
  if (!memo) return null;
  const comision = comisionMockService.obtenerPorId(memo.comisionId);
  if (!comision) return null;
  return { memo, comision, estadoInfo: memoMockService.ESTADO_INFO[memoMockService.calcularEstado(memo)] };
}

// ===================== VEHÍCULOS =====================

router.get("/vehiculos", (req, res) => {
  const vehiculos = vehiculoMockService.listar();
  const primero = vehiculos[0];
  const documentos = documentoMockService.listarPorVehiculo(primero.patente).map((d) => ({
    documento: d,
    tipoLabel: (documentoMockService.TIPOS[d.tipo] || {}).label || d.tipo,
    estado: documentoMockService.calcularEstado(d),
    fechaEmisionFmt: documentoMockService.formatoFecha(d.fechaEmision),
    fechaVencimientoFmt: documentoMockService.formatoFecha(d.fechaVencimiento),
  }));
  res.render("vehiculos/ficha", {
    titulo: "Inventario de Vehículos",
    vehiculos,
    vehiculo: primero,
    documentos,
    comisionActiva: comisionActivaDeVehiculo(primero.patente),
    proximoTurno: turnoServiceMockService.proximoTurno(primero.patente),
    mostrarDetalle: false,
  });
});

router.get("/vehiculos/alta", (req, res) => {
  res.render("vehiculos/alta", { titulo: "Cargar Vehículo", localidades: LOCALIDADES });
});

router.post("/vehiculos/alta", (req, res) => {
  const b = req.body;
  vehiculoMockService.crear({
    patente: (b.patente || "").toUpperCase(),
    tipo: b.tipo,
    marca: b.marca,
    modelo: b.modelo,
    anio: Number(b.anio) || null,
    chasis: b.chasis,
    motor: b.motor,
    combustible: b.combustible || "",
    transmision: b.transmision || "",
    estado: b.estado || "DISPONIBLE",
    km: Number(b.km) || 0,
    localidad: b.localidad || "",
    fechaAlta: b.fecha_alta || new Date().toISOString().slice(0, 10),
    observaciones: b.observaciones || "",
    documentacion: {
      cedula: b.cedula_numero || "",
      titular: b.cedula_titular || "",
      seguroCompania: b.seguro_compania || "",
      vencSeguro: b.seguro_vencimiento || "",
      vencRTO: b.rto_vencimiento || "",
      rtoVencida: false,
    },
  });
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
  res.render("vehiculos/editar", { titulo: "Editar " + vehiculo.patente, vehiculo, localidades: LOCALIDADES });
});

router.post("/vehiculos/:patente/editar", (req, res, next) => {
  const vehiculo = vehiculoMockService.obtenerPorPatente(req.params.patente);
  if (!vehiculo) return next();
  const b = req.body;
  vehiculoMockService.actualizar(vehiculo.patente, {
    estado: b.estado || vehiculo.estado,
    km: b.km !== undefined && b.km !== "" ? Number(b.km) : vehiculo.km,
    localidad: b.localidad !== undefined ? b.localidad : vehiculo.localidad,
    observaciones: b.observaciones !== undefined ? b.observaciones : vehiculo.observaciones,
    documentacion: Object.assign({}, vehiculo.documentacion, {
      cedula: b.cedula_numero || vehiculo.documentacion.cedula,
      titular: b.cedula_titular || vehiculo.documentacion.titular,
      seguroCompania: b.seguro_compania || vehiculo.documentacion.seguroCompania,
    }),
  });
  res.redirect("/vehiculos/" + vehiculo.patente);
});

router.get("/vehiculos/:patente/documentos/nuevo", (req, res, next) => {
  const vehiculo = vehiculoMockService.obtenerPorPatente(req.params.patente);
  if (!vehiculo) return next();
  res.render("vehiculos/documento-nuevo", {
    titulo: "Crear Documento",
    vehiculo,
    tipos: documentoMockService.TIPOS_LISTA,
    localidades: LOCALIDADES,
  });
});

router.post("/vehiculos/:patente/documentos", (req, res, next) => {
  const vehiculo = vehiculoMockService.obtenerPorPatente(req.params.patente);
  if (!vehiculo) return next();
  const b = req.body;

  const bienes = [{ cantidad: 1, tipo: vehiculo.tipo, marca: vehiculo.marca, modelo: vehiculo.modelo, dominio: vehiculo.patente }];
  if (Array.isArray(b.bien_dominio)) {
    b.bien_dominio.forEach((dominio, i) => {
      if (!dominio) return;
      bienes.push({
        cantidad: 1,
        tipo: b.bien_tipo[i] || "",
        marca: b.bien_marca[i] || "",
        modelo: b.bien_modelo[i] || "",
        dominio,
      });
    });
  } else if (b.bien_dominio) {
    bienes.push({ cantidad: 1, tipo: b.bien_tipo || "", marca: b.bien_marca || "", modelo: b.bien_modelo || "", dominio: b.bien_dominio });
  }

  const documento = documentoMockService.crear({
    vehiculoPatente: vehiculo.patente,
    tipo: b.tipo,
    fechaEmision: b.fecha_emision,
    localidad: b.localidad || vehiculo.localidad,
    observaciones: b.observaciones || "",
    bienes,
    comodante: {
      nombre: b.comodante_nombre || "Gobierno de la Provincia de Santiago del Estero",
      cargo: b.comodante_cargo || "Ministro de Producción, Recursos Naturales, Forestación, Tierras y Medio Ambiente",
      representante: b.comodante_representante || "",
      dni: b.comodante_dni || "",
      domicilio: b.comodante_domicilio || "",
    },
    comodatario: {
      nombre: b.comodatario_nombre || "",
      representante: b.comodatario_representante || "",
      dni: b.comodatario_dni || "",
      domicilio: b.comodatario_domicilio || "",
    },
  });
  res.redirect("/documentos/" + documento.id);
});

router.get("/documentos/:id", (req, res, next) => {
  const documento = documentoMockService.obtenerPorId(req.params.id);
  if (!documento) return next();
  const vehiculo = vehiculoMockService.obtenerPorPatente(documento.vehiculoPatente);
  res.render("documentos/ver", {
    titulo: (documentoMockService.TIPOS[documento.tipo] || {}).label + " · " + documento.numero,
    documento,
    vehiculo,
    tipoInfo: documentoMockService.TIPOS[documento.tipo],
    estado: documentoMockService.calcularEstado(documento),
    formatoFecha: documentoMockService.formatoFecha,
  });
});

router.post("/documentos/:id/renovar", (req, res, next) => {
  const documento = documentoMockService.renovar(req.params.id, {
    fechaRenovacion: req.body.fecha_renovacion,
    observaciones: req.body.observaciones,
    detalle: req.body.detalle,
  });
  if (!documento) return next();
  res.redirect("/documentos/" + documento.id);
});

router.get("/vehiculos/para-baja", (req, res) => {
  res.render("vehiculos/para-baja", {
    titulo: "Vehículos para Baja",
    vehiculos: vehiculoMockService.listarParaBaja(),
    activeItem: "vehiculos-para-baja",
  });
});

router.get("/vehiculos/para-baja/documento", (req, res) => {
  const seleccionadas = req.query.patentes ? String(req.query.patentes).split(",") : [];
  res.render("vehiculos/para-baja-documento", {
    titulo: "Generar Acta de Baja",
    vehiculos: vehiculoMockService.listarParaBaja(),
    seleccionadas,
    sinSeleccion: req.query.error === "sin-seleccion",
    activeItem: "vehiculos-para-baja",
  });
});

router.post("/vehiculos/para-baja/documento", (req, res) => {
  const b = req.body;
  const patentes = Array.isArray(b.patentes) ? b.patentes : b.patentes ? [b.patentes] : [];
  if (!patentes.length) {
    return res.redirect("/vehiculos/para-baja/documento?error=sin-seleccion");
  }

  const bienes = patentes.map((patente) => {
    const v = vehiculoMockService.obtenerPorPatente(patente);
    return { cantidad: 1, tipo: v ? v.tipo : "", marca: v ? v.marca : "", modelo: v ? v.modelo : "", dominio: patente };
  });

  const documento = documentoMockService.crear({
    vehiculoPatente: patentes[0],
    tipo: "baja",
    fechaEmision: b.fecha_recepcion,
    taller: b.taller,
    fechaRecepcion: b.fecha_recepcion,
    observaciones: b.observaciones,
    bienes,
    comodante: {
      nombre: "Gobierno de la Provincia de Santiago del Estero",
      cargo: "Ministro de Producción, Recursos Naturales, Forestación, Tierras y Medio Ambiente",
      representante: "",
      dni: "",
      domicilio: "",
    },
    comodatario: { nombre: b.taller || "Taller Receptor", representante: "", dni: "", domicilio: "" },
  });

  vehiculoMockService.confirmarBaja(patentes);
  res.redirect("/documentos/" + documento.id);
});

router.get("/vehiculos/:patente", (req, res, next) => {
  const vehiculos = vehiculoMockService.listar();
  const vehiculo = vehiculoMockService.obtenerPorPatente(req.params.patente);
  if (!vehiculo) return next();

  const documentos = documentoMockService.listarPorVehiculo(vehiculo.patente).map((d) => ({
    documento: d,
    tipoLabel: (documentoMockService.TIPOS[d.tipo] || {}).label || d.tipo,
    estado: documentoMockService.calcularEstado(d),
    fechaEmisionFmt: documentoMockService.formatoFecha(d.fechaEmision),
    fechaVencimientoFmt: documentoMockService.formatoFecha(d.fechaVencimiento),
  }));

  res.render("vehiculos/ficha", {
    titulo: vehiculo.patente,
    vehiculos,
    vehiculo,
    documentos,
    comisionActiva: comisionActivaDeVehiculo(vehiculo.patente),
    proximoTurno: turnoServiceMockService.proximoTurno(vehiculo.patente),
    mostrarDetalle: true,
  });
});

// ===================== CHOFERES =====================

function cantidadSiniestrosDeChofer(dni) {
  return siniestroMockService.listar().filter((s) => s.choferDni === dni).length;
}

function cantidadViajesDeChofer(choferId) {
  return memoMockService.listar().filter((m) => String(m.choferId) === String(choferId)).length;
}

router.get("/choferes", (req, res) => {
  const choferes = choferMockService.listar();
  const primero = choferes[0];
  res.render("choferes/ficha", {
    choferes,
    chofer: primero,
    cantidadSiniestros: cantidadSiniestrosDeChofer(primero.dni),
    cantidadViajes: cantidadViajesDeChofer(primero.id),
    mostrarDetalle: false,
    activeItem: "choferes-listado",
  });
});

router.get("/choferes/nuevo", (req, res) => {
  res.render("choferes/carga", { titulo: "Cargar Chofer", activeItem: "choferes-alta" });
});

router.post("/choferes/nuevo", (req, res) => {
  const b = req.body;
  const chofer = choferMockService.crear({
    nombre: b.nombre,
    apellido: b.apellido,
    dni: b.dni,
    telefono: b.telefono,
    email: b.email || null,
    direccion: b.direccion,
    fechaNacimiento: b.fechaNacimiento,
    fechaIngreso: b.fechaIngreso,
    turno: b.turno,
    estado: b.estado || "Activo",
    numeroLicencia: b.numero_licencia,
    categoria: b.categoria,
    fechaEmisionISO: b.fecha_emision,
  });
  res.redirect("/choferes/" + chofer.id);
});

router.get("/choferes/:id/editar", (req, res, next) => {
  const chofer = choferMockService.obtenerPorId(req.params.id);
  if (!chofer) return next();
  res.render("choferes/editar", { titulo: "Editar Chofer", chofer, activeItem: "choferes-listado" });
});

router.post("/choferes/:id/editar", (req, res, next) => {
  const chofer = choferMockService.obtenerPorId(req.params.id);
  if (!chofer) return next();
  const b = req.body;
  chofer.licencia.numero = b.numero_licencia || chofer.licencia.numero;
  chofer.licencia.categoria = b.categoria || chofer.licencia.categoria;
  choferMockService.actualizar(chofer.id, {
    nombre: b.nombre || chofer.nombre,
    apellido: b.apellido || chofer.apellido,
    telefono: b.telefono,
    email: b.email || null,
    direccion: b.direccion,
    turno: b.turno,
    estado: b.estado || chofer.estado,
    motivoBaja: b.estado === "Inactivo" ? b.motivoBaja || chofer.motivoBaja : null,
  });
  res.redirect("/choferes/" + chofer.id);
});

router.post("/choferes/:id/activar", (req, res, next) => {
  const chofer = choferMockService.actualizar(req.params.id, { estado: "Activo", motivoBaja: null });
  if (!chofer) return next();
  res.redirect("/choferes/" + chofer.id);
});

router.post("/choferes/:id/desactivar", (req, res, next) => {
  const chofer = choferMockService.actualizar(req.params.id, { estado: "Inactivo" });
  if (!chofer) return next();
  res.redirect("/choferes/" + chofer.id);
});

router.get("/choferes/:id/licencia/renovar", (req, res, next) => {
  const chofer = choferMockService.obtenerPorId(req.params.id);
  if (!chofer) return next();
  res.render("choferes/licencia-renovar", { titulo: "Renovar Licencia", chofer, activeItem: "choferes-listado" });
});

router.post("/choferes/:id/licencia/renovar", (req, res, next) => {
  const chofer = choferMockService.renovarLicencia(req.params.id, req.body.fecha_retiro, req.body.detalle);
  if (!chofer) return next();
  res.redirect("/choferes/" + chofer.id);
});

router.get("/choferes/:id", (req, res, next) => {
  const choferes = choferMockService.listar();
  const chofer = choferMockService.obtenerPorId(req.params.id);
  if (!chofer) return next();

  res.render("choferes/ficha", {
    choferes,
    chofer,
    cantidadSiniestros: cantidadSiniestrosDeChofer(chofer.dni),
    cantidadViajes: cantidadViajesDeChofer(chofer.id),
    mostrarDetalle: true,
    activeItem: "choferes-listado",
  });
});

// ===================== MANTENIMIENTOS =====================

router.get("/mantenimientos", (req, res) => {
  const ordenes = mantenimientoMockService.listar();
  res.render("mantenimientos/ficha", {
    ordenes,
    orden: ordenes[0],
    proveedores: mantenimientoMockService.proveedores(),
    mostrarDetalle: false,
    activeItem: "mantenimientos-listado",
  });
});

router.get("/mantenimientos/nuevo", (req, res) => {
  res.render("mantenimientos/carga", {
    titulo: "Registrar Mantenimiento",
    vehiculos: vehiculoMockService.listar(),
    repuestos: mantenimientoMockService.listarRepuestos(),
    proveedores: mantenimientoMockService.proveedores(),
    patenteSeleccionada: req.query.patente || "",
    activeItem: "mantenimientos-nuevo",
  });
});

router.post("/mantenimientos/nuevo", (req, res) => {
  const b = req.body;
  const vehiculo = vehiculoMockService.obtenerPorPatente(b.patente);
  const costoRepuestos = Number(b.costo_repuestos) || 0;
  const manoObra = Number(b.mano_obra) || 0;
  const orden = mantenimientoMockService.crear({
    patente: b.patente,
    vehiculo: vehiculo ? vehiculo.marca + " " + vehiculo.modelo : b.patente,
    fecha: b.fecha,
    tipoServicio: b.tipo_servicio,
    estado: b.estado || "Pendiente",
    kmServicio: Number(b.km_servicio) || 0,
    proximoServicioKm: b.proximo_servicio_km ? Number(b.proximo_servicio_km) : null,
    descripcion: b.descripcion,
    observaciones: b.observaciones,
    costoRepuestos,
    manoObra,
    costoTotal: costoRepuestos + manoObra,
    proveedor: b.proveedor || "",
    lugarService: b.lugar_service || "Externo",
    pagado: b.pagado === "on" || b.pagado === "true",
    numeroExpediente: b.numero_expediente || "",
  });
  res.redirect("/mantenimientos/" + orden.id);
});

router.post("/mantenimientos/:id/estado", (req, res, next) => {
  const orden = mantenimientoMockService.actualizarEstado(req.params.id, "Realizado");
  if (!orden) return next();
  res.redirect("/mantenimientos/" + orden.id);
});

router.post("/mantenimientos/:id/pagado", (req, res, next) => {
  const existente = mantenimientoMockService.obtenerPorId(req.params.id);
  if (!existente) return next();
  const orden = mantenimientoMockService.marcarPagado(req.params.id, !existente.pagado);
  res.redirect("/mantenimientos/" + orden.id);
});

router.get("/mantenimientos/turnos", (req, res) => {
  res.render("mantenimientos/turnos", {
    titulo: "Turnos de Service",
    turnos: turnoServiceMockService.listar(),
    activeItem: "mantenimientos-turnos",
  });
});

router.get("/mantenimientos/turnos/nuevo", (req, res) => {
  res.render("mantenimientos/turno-nuevo", {
    titulo: "Programar Turno de Service",
    vehiculos: vehiculoMockService.listar(),
    activeItem: "mantenimientos-turnos",
  });
});

router.post("/mantenimientos/turnos/nuevo", (req, res) => {
  const b = req.body;
  turnoServiceMockService.crear({
    vehiculoPatente: b.vehiculo,
    fechaProgramada: b.fecha_programada,
    tipoServicio: b.tipo_servicio,
    taller: b.taller,
    observaciones: b.observaciones,
  });
  res.redirect("/mantenimientos/turnos");
});

router.post("/mantenimientos/turnos/:id/realizado", (req, res, next) => {
  const turno = turnoServiceMockService.cambiarEstado(req.params.id, "Realizado");
  if (!turno) return next();
  res.redirect("/mantenimientos/turnos");
});

router.post("/mantenimientos/turnos/:id/cancelar", (req, res, next) => {
  const turno = turnoServiceMockService.cambiarEstado(req.params.id, "Cancelado");
  if (!turno) return next();
  res.redirect("/mantenimientos/turnos");
});

router.get("/mantenimientos/:id", (req, res, next) => {
  const ordenes = mantenimientoMockService.listar();
  const orden = mantenimientoMockService.obtenerPorId(req.params.id);
  if (!orden) return next();
  res.render("mantenimientos/ficha", {
    ordenes,
    orden,
    proveedores: mantenimientoMockService.proveedores(),
    mostrarDetalle: true,
    activeItem: "mantenimientos-listado",
  });
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
    pedidos: pedidoRetiroMockService.listar(),
    activeItem: "herramientas-repuestos",
  });
});

router.post("/herramientas/repuestos", (req, res) => {
  mantenimientoMockService.agregarRepuesto({
    nombre: req.body.nombre,
    stock: req.body.stock,
    costoUnitario: req.body.costo_unitario,
  });
  res.redirect("/herramientas/repuestos");
});

router.post("/herramientas/repuestos/:id/eliminar", (req, res) => {
  mantenimientoMockService.eliminarRepuesto(req.params.id);
  res.redirect("/herramientas/repuestos");
});

router.get("/herramientas/repuestos/pedido", (req, res) => {
  res.render("herramientas/repuestos-pedido", {
    titulo: "Pedido de Entrega de Repuestos",
    repuestos: mantenimientoMockService.listarRepuestos(),
    vehiculos: vehiculoMockService.listar(),
    sinStock: req.query.error === "stock",
    activeItem: "herramientas-repuestos",
  });
});

router.post("/herramientas/repuestos/pedido", (req, res) => {
  const b = req.body;
  const cantidad = Number(b.cantidad) || 0;
  const repuesto = mantenimientoMockService.retirarStock(b.repuesto, cantidad);
  if (!repuesto) {
    return res.redirect("/herramientas/repuestos/pedido?error=stock");
  }
  pedidoRetiroMockService.crear({
    repuestoId: repuesto.id,
    repuestoNombre: repuesto.nombre,
    cantidad,
    motivo: b.motivo,
    vehiculoPatente: b.vehiculo || "",
    autorizadoPor: usuarioSesion.nombre,
  });
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

// ===================== COMISIONES =====================

function datosComision(comision) {
  const memos = memoMockService.listarPorComision(comision.id).map((m) => ({
    memo: m,
    estadoInfo: memoMockService.ESTADO_INFO[memoMockService.calcularEstado(m)],
    fechaSalidaFmt: documentoMockService.formatoFecha(m.fechaSalida),
    fechaRegresoFmt: documentoMockService.formatoFecha(m.fechaRegreso),
    vehiculo: vehiculoMockService.obtenerPorPatente(m.vehiculoPatente),
    chofer: choferMockService.obtenerPorId ? choferMockService.obtenerPorId(m.choferId) : null,
  }));
  return { comision, memos };
}

router.get("/comisiones", (req, res) => {
  const comisiones = comisionMockService.listar();
  const primera = comisiones[0];
  res.render("comisiones/ficha", Object.assign({ titulo: "Comisiones", comisiones, mostrarDetalle: false, activeItem: "comisiones-listado" }, datosComision(primera)));
});

router.get("/comisiones/nueva", (req, res) => {
  res.render("comisiones/nueva", { titulo: "Nueva Comisión", activeItem: "comisiones-nueva" });
});

router.post("/comisiones/nueva", (req, res) => {
  const b = req.body;
  const integrantes = [];
  const nombres = Array.isArray(b.integrante_nombre) ? b.integrante_nombre : b.integrante_nombre ? [b.integrante_nombre] : [];
  const dnis = Array.isArray(b.integrante_dni) ? b.integrante_dni : b.integrante_dni ? [b.integrante_dni] : [];
  const cargos = Array.isArray(b.integrante_cargo) ? b.integrante_cargo : b.integrante_cargo ? [b.integrante_cargo] : [];
  nombres.forEach((nombre, i) => {
    if (!nombre) return;
    integrantes.push({ nombre, dni: dnis[i] || "", cargo: cargos[i] || "" });
  });
  const comision = comisionMockService.crear({
    nombre: b.nombre,
    area: b.area,
    comisionado: { nombre: b.comisionado_nombre, dni: b.comisionado_dni, cargo: b.comisionado_cargo, telefono: b.comisionado_telefono },
    integrantes,
    observaciones: b.observaciones,
  });
  res.redirect("/comisiones/" + comision.id);
});

router.get("/comisiones/:id/editar", (req, res, next) => {
  const comision = comisionMockService.obtenerPorId(req.params.id);
  if (!comision) return next();
  res.render("comisiones/editar", { titulo: "Editar Comisión", comision, activeItem: "comisiones-listado" });
});

router.post("/comisiones/:id/editar", (req, res, next) => {
  const comision = comisionMockService.obtenerPorId(req.params.id);
  if (!comision) return next();
  const b = req.body;
  const integrantes = [];
  const nombres = Array.isArray(b.integrante_nombre) ? b.integrante_nombre : b.integrante_nombre ? [b.integrante_nombre] : [];
  const dnis = Array.isArray(b.integrante_dni) ? b.integrante_dni : b.integrante_dni ? [b.integrante_dni] : [];
  const cargos = Array.isArray(b.integrante_cargo) ? b.integrante_cargo : b.integrante_cargo ? [b.integrante_cargo] : [];
  nombres.forEach((nombre, i) => {
    if (!nombre) return;
    integrantes.push({ nombre, dni: dnis[i] || "", cargo: cargos[i] || "" });
  });
  comisionMockService.actualizar(comision.id, {
    nombre: b.nombre,
    area: b.area,
    comisionado: { nombre: b.comisionado_nombre, dni: b.comisionado_dni, cargo: b.comisionado_cargo, telefono: b.comisionado_telefono },
    integrantes,
    observaciones: b.observaciones,
  });
  res.redirect("/comisiones/" + comision.id);
});

router.get("/comisiones/:id/memos/nuevo", (req, res, next) => {
  const comision = comisionMockService.obtenerPorId(req.params.id);
  if (!comision) return next();
  res.render("comisiones/memo-nuevo", {
    titulo: "Reservar Vehículo",
    comision,
    vehiculos: vehiculoMockService.listar().filter((v) => v.estado !== "BAJA"),
    choferes: choferMockService.listar().filter((c) => c.estado === "Activo"),
    conflicto: req.query.error === "conflicto",
    conflictoService: req.query.error === "service",
    diasResguardo: turnoServiceMockService.DIAS_RESGUARDO,
    activeItem: "comisiones-listado",
  });
});

router.post("/comisiones/:id/memos", (req, res, next) => {
  const comision = comisionMockService.obtenerPorId(req.params.id);
  if (!comision) return next();
  const b = req.body;

  if (memoMockService.hayConflicto(b.vehiculo, b.fecha_salida, b.fecha_regreso)) {
    return res.redirect("/comisiones/" + comision.id + "/memos/nuevo?error=conflicto");
  }
  if (turnoServiceMockService.hayConflictoConViaje(b.vehiculo, b.fecha_salida, b.fecha_regreso)) {
    return res.redirect("/comisiones/" + comision.id + "/memos/nuevo?error=service");
  }

  const dnis = Array.isArray(b.integrante_dni) ? b.integrante_dni : b.integrante_dni ? [b.integrante_dni] : [];
  const integrantes = comision.integrantes.filter((i) => dnis.includes(i.dni));

  const memo = memoMockService.crear({
    comisionId: comision.id,
    vehiculoPatente: b.vehiculo,
    choferId: Number(b.chofer) || null,
    integrantes: integrantes.length ? integrantes : comision.integrantes,
    destino: b.destino,
    motivo: b.motivo,
    fechaSalida: b.fecha_salida,
    fechaRegreso: b.fecha_regreso,
  });
  res.redirect("/memos/" + memo.id);
});

router.get("/comisiones/:id", (req, res, next) => {
  const comisiones = comisionMockService.listar();
  const comision = comisionMockService.obtenerPorId(req.params.id);
  if (!comision) return next();
  res.render("comisiones/ficha", Object.assign({ titulo: comision.nombre, comisiones, mostrarDetalle: true, activeItem: "comisiones-listado" }, datosComision(comision)));
});

router.get("/memos/:id", (req, res, next) => {
  const memo = memoMockService.obtenerPorId(req.params.id);
  if (!memo) return next();
  const comision = comisionMockService.obtenerPorId(memo.comisionId);
  const vehiculo = vehiculoMockService.obtenerPorPatente(memo.vehiculoPatente);
  const chofer = choferMockService.obtenerPorId(memo.choferId);
  res.render("memos/ver", {
    titulo: "Memo · " + comision.nombre,
    memo,
    comision,
    vehiculo,
    chofer,
    estadoInfo: memoMockService.ESTADO_INFO[memoMockService.calcularEstado(memo)],
    formatoFecha: documentoMockService.formatoFecha,
  });
});

router.post("/memos/:id/finalizar", (req, res, next) => {
  const memo = memoMockService.finalizar(req.params.id, { fechaRegresoReal: req.body.fecha_regreso_real, detalle: req.body.detalle });
  if (!memo) return next();
  res.redirect("/memos/" + memo.id);
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
const PALETA_LOCALIDADES = ["#0e7c6b", "#1d5fbf", "#a3630f", "#b3261e", "#667085", "#8a3ffc", "#c2410c"];

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

  const conteoLocalidad = {};
  vehiculos.forEach((v) => {
    conteoLocalidad[v.localidad] = (conteoLocalidad[v.localidad] || 0) + 1;
  });
  const porLocalidad = Object.entries(conteoLocalidad).map(([localidad, cantidad]) => ({ localidad, cantidad }));
  const coloresLocalidad = porLocalidad.map((_, i) => PALETA_LOCALIDADES[i % PALETA_LOCALIDADES.length]);

  const conteoServicio = {};
  ordenes.forEach((o) => {
    conteoServicio[o.tipoServicio] = (conteoServicio[o.tipoServicio] || 0) + 1;
  });
  const porTipoServicio = Object.entries(conteoServicio)
    .map(([tipo, cantidad]) => ({ tipo, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad);
  const maxTipoServicio = Math.max(1, ...porTipoServicio.map((t) => t.cantidad));

  const conteoSiniestrosVehiculo = {};
  siniestroMockService.listar().forEach((s) => {
    conteoSiniestrosVehiculo[s.patente] = (conteoSiniestrosVehiculo[s.patente] || 0) + 1;
  });
  const siniestrosPorVehiculo = Object.entries(conteoSiniestrosVehiculo)
    .map(([patente, cantidad]) => ({ patente, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad);
  const maxSiniestrosVehiculo = Math.max(1, ...siniestrosPorVehiculo.map((s) => s.cantidad));

  const conteoViajesChofer = {};
  memoMockService.listar().forEach((m) => {
    if (!m.choferId) return;
    conteoViajesChofer[m.choferId] = (conteoViajesChofer[m.choferId] || 0) + 1;
  });
  const choferesConMasViajes = Object.entries(conteoViajesChofer)
    .map(([choferId, cantidad]) => {
      const chofer = choferMockService.obtenerPorId(choferId);
      return { nombre: chofer ? chofer.nombre + " " + chofer.apellido : "Chofer #" + choferId, cantidad };
    })
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 6);
  const maxViajesChofer = Math.max(1, ...choferesConMasViajes.map((c) => c.cantidad));

  const conteoDestinos = {};
  memoMockService.listar().forEach((m) => {
    conteoDestinos[m.destino] = (conteoDestinos[m.destino] || 0) + 1;
  });
  const destinosMasFrecuentes = Object.entries(conteoDestinos)
    .map(([destino, cantidad]) => ({ destino, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 6);
  const maxDestino = Math.max(1, ...destinosMasFrecuentes.map((d) => d.cantidad));

  res.render("reportes/index", {
    fechaDesde,
    fechaHasta,
    periodoFormateado: `${formatoFechaCorta(fechaDesde)} al ${formatoFechaCorta(fechaHasta)}`,
    estadisticas: {
      costoTotal,
      costoTotalFormateado: formatoARS(costoTotal),
      topVehiculos,
      maxGastoVehiculo,
      porLocalidad,
      coloresLocalidad,
      totalVehiculos: vehiculos.length,
      porTipoServicio,
      maxTipoServicio,
      siniestrosPorVehiculo,
      maxSiniestrosVehiculo,
      choferesConMasViajes,
      maxViajesChofer,
      destinosMasFrecuentes,
      maxDestino,
    },
  });
});

module.exports = router;
