const express = require("express");
const router = express.Router();

const vehiculoMockService = require("../services/vehiculoMockService");

const usuarioSesion = {
  nombre: "Administrador Sistema",
  rol: "ADMINISTRADOR",
  iniciales: "AS",
};

router.get("/", (req, res) => res.redirect("/vehiculos"));

router.get("/vehiculos", (req, res) => {
  const vehiculos = vehiculoMockService.listar();
  res.render("vehiculos/ficha", {
    titulo: "Inventario de Vehículos",
    usuario: usuarioSesion,
    notificaciones: 21,
    vehiculos,
    vehiculo: vehiculos[0],
    mostrarDetalle: false,
  });
});

router.get("/vehiculos/:patente", (req, res, next) => {
  const vehiculos = vehiculoMockService.listar();
  const vehiculo = vehiculoMockService.obtenerPorPatente(req.params.patente);
  if (!vehiculo) return next();

  res.render("vehiculos/ficha", {
    titulo: vehiculo.patente,
    usuario: usuarioSesion,
    notificaciones: 21,
    vehiculos,
    vehiculo,
    mostrarDetalle: true,
  });
});

module.exports = router;
