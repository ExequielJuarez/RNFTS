// Configuración de multer para subir fotos/fotocopias de documentación.
// Los archivos quedan en public/uploads/<carpeta>, servidos como estáticos.

const multer = require("multer");
const path = require("path");
const fs = require("fs");

const TIPOS_PERMITIDOS = [".jpg", ".jpeg", ".png", ".webp", ".pdf"];

function crearUploader(carpeta) {
  const destino = path.join(__dirname, "../../public/uploads", carpeta);
  fs.mkdirSync(destino, { recursive: true });

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, destino),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const nombre = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      cb(null, nombre);
    },
  });

  return multer({
    storage,
    limits: { fileSize: 8 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, TIPOS_PERMITIDOS.includes(ext));
    },
  });
}

const uploadChoferes = crearUploader("choferes");

// A partir de req.files (modo .fields()) arma un mapa { campo: "/uploads/..." }
// sólo con los campos que realmente trajeron un archivo.
function rutasDeArchivos(files, carpeta) {
  const rutas = {};
  if (!files) return rutas;
  Object.keys(files).forEach((campo) => {
    const archivo = files[campo] && files[campo][0];
    if (archivo) rutas[campo] = `/uploads/${carpeta}/${archivo.filename}`;
  });
  return rutas;
}

module.exports = { uploadChoferes, rutasDeArchivos };
