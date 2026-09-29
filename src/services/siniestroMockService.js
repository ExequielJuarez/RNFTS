// Datos de demostración para Siniestros y Seguros.
// Reemplazar por consultas reales (Sequelize) cuando el modelo de datos esté definido.

let siniestros = [
  {
    id: 1,
    patente: "AB002CC",
    vehiculoMarca: "Ford Ranger",
    choferNombre: "Roberto Álvarez",
    choferDni: "24.887.310",
    fecha: "2025-10-02",
    fechaRegistro: "2025-10-02",
    ubicacion: "Ruta 5, km 34",
    descripcion:
      "El vehículo derrapó en la ruta por lluvia intensa e impactó contra el guardarraíl, provocando pérdida total.",
    danosVehiculo: "Pérdida total del vehículo.",
    tercero: null,
    archivos: ["parte-policial.pdf", "fotos-choque.jpg"],
    estado: "RESUELTO",
  },
  {
    id: 2,
    patente: "AD004EE",
    vehiculoMarca: "Chevrolet S-10",
    choferNombre: "Diego Ríos",
    choferDni: "33.109.774",
    fecha: "2026-08-28",
    fechaRegistro: "2026-08-29",
    ubicacion: "Av. San Martín y Belgrano",
    descripcion: "Choque leve en cruce de avenidas con un vehículo particular al girar en U.",
    danosVehiculo: "Rotura de óptica delantera derecha y paragolpes.",
    tercero: {
      vehiculo: "AC456DE - VW Gol",
      seguro: "La Caja Seguros",
      conductor: "Martín Soto",
      contacto: "11-2233-4455",
    },
    archivos: ["denuncia-seguro.pdf"],
    estado: "EN PROCESO",
  },
];

function listar() {
  return siniestros;
}

function obtenerPorId(id) {
  return siniestros.find((s) => String(s.id) === String(id));
}

module.exports = { listar, obtenerPorId };
