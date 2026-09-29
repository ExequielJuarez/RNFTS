// Datos de demostración para el Inventario de Herramientas.
// Reemplazar por consultas reales (Sequelize) cuando el modelo de datos esté definido.

const ESTADOS = {
  Disponible: "success",
  "En uso": "info",
  "En Reparación": "warning",
  Baja: "danger",
};

function crearHerramienta(datos) {
  return Object.assign({ prestamos: [], observaciones: null, combustibleEnergia: null }, datos, {
    estadoClase: ESTADOS[datos.estado] || "success",
  });
}

const herramientas = [
  crearHerramienta({
    id: 1,
    codigoActivo: "HTI-001",
    nombre: "Taladro Percutor Bosch GSB 550",
    sector: "Taller Mecánico",
    stock: 3,
    estado: "En uso",
    combustibleEnergia: "220V",
    fechaAlta: "2024-02-10",
    prestamos: [
      {
        fechaSalida: "2026-09-15",
        fechaDevolucionEstimada: "2026-09-30",
        fechaDevolucionReal: null,
        nombreOperario: "Carlos Medina",
        sectorDestino: "Obras Distrito Norte",
        estadoPrestamo: "Activo",
      },
      {
        fechaSalida: "2026-06-01",
        fechaDevolucionReal: "2026-06-05",
        nombreOperario: "Carlos Medina",
        sectorDestino: "Taller Mecánico",
        estadoPrestamo: "Devuelto",
      },
    ],
  }),
  crearHerramienta({
    id: 2,
    codigoActivo: "HTI-002",
    nombre: "Amoladora Angular Makita 9557",
    sector: "Construcción A",
    stock: 1,
    estado: "Disponible",
    combustibleEnergia: "220V",
    fechaAlta: "2023-11-05",
  }),
  crearHerramienta({
    id: 3,
    codigoActivo: "HTI-003",
    nombre: "Motoguadaña Stihl FS 220",
    sector: "Espacios Verdes",
    stock: 0,
    estado: "En Reparación",
    combustibleEnergia: "Nafta",
    fechaAlta: "2022-08-18",
    observaciones: "En taller externo por rotura de embrague.",
  }),
  crearHerramienta({
    id: 4,
    codigoActivo: "HTI-004",
    nombre: "Compresor de Aire 100L",
    sector: "Depósito Central",
    stock: 2,
    estado: "Disponible",
    combustibleEnergia: "220V",
    fechaAlta: "2021-04-22",
  }),
  crearHerramienta({
    id: 5,
    codigoActivo: "HTI-005",
    nombre: "Soldadora Inverter 200A",
    sector: "Mantenimiento General",
    stock: 1,
    estado: "Baja",
    fechaAlta: "2019-05-14",
    observaciones: "Dada de baja por daño irreparable en la placa de control.",
  }),
];

const sectores = ["Taller Mecánico", "Construcción A", "Espacios Verdes", "Mantenimiento General", "Depósito Central"];

function listar() {
  return herramientas;
}

function obtenerPorId(id) {
  return herramientas.find((h) => String(h.id) === String(id));
}

function listarSectores() {
  return sectores;
}

module.exports = { listar, obtenerPorId, listarSectores };
