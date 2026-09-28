require("dotenv").config();
const express = require("express");
const path = require("path");
const methodOverride = require("method-override");
const session = require("express-session");

const app = express();

const indexRouter = require("./routes/index.Routes");

const puerto = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "../public")));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(methodOverride("_method"));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(
  session({
    secret: "Secreto_FichaTecnica_123",
    resave: false,
    saveUninitialized: false,
  }),
);

app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  res.locals.flash = req.session.flash || null;
  delete req.session.flash;
  next();
});

app.use("/", indexRouter);

// Error inesperado
app.use((err, req, res, next) => {
  console.error("❌", err);
  if (req.accepts(["html", "json"]) === "json") {
    return res.status(500).json({ ok: false, mensaje: "Error del servidor, probá de nuevo" });
  }
  res.status(500).send("<h1>Algo salió mal</h1><p>Probá de nuevo en unos minutos.</p>");
});

app.listen(puerto, () => console.log(`🚀 Servidor Express corriendo en el puerto ${puerto}`));
