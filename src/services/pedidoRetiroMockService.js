// Pedidos de entrega / autorizaciones de retiro de insumos del stock del taller propio.
// Reemplazar por persistencia real (Sequelize) cuando el modelo de datos esté definido.

let nextId = 3;

const pedidos = [
  {
    id: 1,
    repuestoId: 1,
    repuestoNombre: "Aceite 15W40 (litro)",
    cantidad: 20,
    fecha: "2026-09-28",
    motivo: "Cambio de aceite en service de AF006GG",
    vehiculoPatente: "AF006GG",
    autorizadoPor: "Administrador Sistema",
  },
  {
    id: 2,
    repuestoId: 4,
    repuestoNombre: "Pastillas de freno (juego)",
    cantidad: 1,
    fecha: "2026-10-05",
    motivo: "Cambio de pastillas delanteras",
    vehiculoPatente: "AA001BB",
    autorizadoPor: "Administrador Sistema",
  },
];

function listar() {
  return pedidos.slice().sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
}

function crear(datos) {
  const pedido = {
    id: nextId++,
    repuestoId: datos.repuestoId,
    repuestoNombre: datos.repuestoNombre,
    cantidad: datos.cantidad,
    fecha: datos.fecha || new Date().toISOString().slice(0, 10),
    motivo: datos.motivo || "",
    vehiculoPatente: datos.vehiculoPatente || "",
    autorizadoPor: datos.autorizadoPor || "",
  };
  pedidos.push(pedido);
  return pedido;
}

module.exports = { listar, crear };
