(function () {
  "use strict";

  var shell = document.getElementById("appShell");
  var sidebar = document.getElementById("appSidebar");
  var scrim = document.getElementById("sidebarScrim");
  var btnHamburger = document.getElementById("btnHamburger");
  var btnCollapse = document.getElementById("btnCollapse");

  var MOBILE_QUERY = window.matchMedia("(max-width: 860px)");
  var TABLET_QUERY = window.matchMedia("(max-width: 1180px)");

  function isMobile() {
    return MOBILE_QUERY.matches;
  }

  function isTablet() {
    return TABLET_QUERY.matches && !MOBILE_QUERY.matches;
  }

  function closeMobileSidebar() {
    if (!sidebar) return;
    sidebar.classList.remove("is-open");
    sidebar.classList.remove("is-expanded");
    if (scrim) scrim.classList.remove("is-visible");
    if (btnHamburger) btnHamburger.setAttribute("aria-expanded", "false");
  }

  function toggleMobileSidebar() {
    if (!sidebar) return;
    var stateClass = isTablet() ? "is-expanded" : "is-open";
    var open = sidebar.classList.toggle(stateClass);
    if (scrim) scrim.classList.toggle("is-visible", open);
    if (btnHamburger) btnHamburger.setAttribute("aria-expanded", String(open));
  }

  function toggleDesktopCollapse() {
    if (!shell) return;
    var collapsed = shell.classList.toggle("is-sidebar-collapsed");
    try {
      localStorage.setItem("ft.sidebarCollapsed", collapsed ? "1" : "0");
    } catch (e) {
      /* almacenamiento no disponible: se ignora, no es crítico */
    }
  }

  if (btnHamburger) {
    btnHamburger.addEventListener("click", function () {
      if (TABLET_QUERY.matches) {
        toggleMobileSidebar();
      } else {
        toggleDesktopCollapse();
      }
    });
  }

  if (scrim) {
    scrim.addEventListener("click", closeMobileSidebar);
  }

  if (btnCollapse) {
    btnCollapse.addEventListener("click", toggleDesktopCollapse);
  }

  // Restaura preferencia de sidebar colapsado (sólo aplica en escritorio vía CSS)
  try {
    if (shell && localStorage.getItem("ft.sidebarCollapsed") === "1") {
      shell.classList.add("is-sidebar-collapsed");
    }
  } catch (e) {
    /* almacenamiento no disponible: se ignora */
  }

  // Grupos de navegación expandibles (ej. "Vehículos")
  document.querySelectorAll("[data-nav-toggle]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var group = btn.closest(".nav-group");
      if (group) group.classList.toggle("is-open");
    });
  });

  // Patrón maestro-detalle en mobile: alternar entre listado y ficha
  document.querySelectorAll("[data-open-detail]").forEach(function (el) {
    el.addEventListener("click", function () {
      var container = document.querySelector(".master-detail");
      if (container && isMobile()) container.classList.add("showing-detail");
    });
  });

  document.querySelectorAll("[data-back-to-list]").forEach(function (el) {
    el.addEventListener("click", function () {
      var container = document.querySelector(".master-detail");
      if (container) container.classList.remove("showing-detail");
    });
  });

  TABLET_QUERY.addEventListener("change", function () {
    closeMobileSidebar();
  });

  // Preview de nombre de archivo en los campos de carga de imágenes/documentos
  document.querySelectorAll("[data-preview-for]").forEach(function (preview) {
    var input = document.getElementById(preview.getAttribute("data-preview-for"));
    if (!input) return;
    input.addEventListener("change", function () {
      if (input.files && input.files.length > 0) {
        preview.textContent = "Archivo seleccionado: " + input.files[0].name;
        preview.classList.add("has-file");
      } else {
        preview.textContent = "Sin imagen seleccionada";
        preview.classList.remove("has-file");
      }
    });
  });

  // Filtro de texto genérico para columnas de listado (busca en data-search)
  document.querySelectorAll("[data-list-search]").forEach(function (input) {
    var container = document.querySelector(input.getAttribute("data-list-search"));
    if (!container) return;
    input.addEventListener("input", function () {
      var term = input.value.trim().toLowerCase();
      container.querySelectorAll("[data-search]").forEach(function (item) {
        var haystack = item.getAttribute("data-search").toLowerCase();
        item.style.display = haystack.indexOf(term) === -1 ? "none" : "";
      });
    });
  });
})();

(function () {
  "use strict";

  if (typeof Chart === "undefined") return;

  var dataEl = document.getElementById("reportes-chart-data");
  if (!dataEl) return;
  var datos;
  try {
    datos = JSON.parse(dataEl.textContent);
  } catch (e) {
    return;
  }

  var raiz = getComputedStyle(document.documentElement);
  var colorAccent = (raiz.getPropertyValue("--accent") || "").trim() || "#0e7c6b";
  var colorDanger = (raiz.getPropertyValue("--danger") || "").trim() || "#b3261e";
  var colorGrid = (raiz.getPropertyValue("--border-subtle") || "").trim() || "#e3e7ed";
  var colorAxis = (raiz.getPropertyValue("--text-muted") || "").trim() || "#8994a3";
  var colorInk = (raiz.getPropertyValue("--text-secondary") || "").trim() || "#4b5768";

  var formatoARS = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });

  Chart.defaults.font.family = "-apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, system-ui, sans-serif";
  Chart.defaults.font.size = 12;
  Chart.defaults.color = colorAxis;
  Chart.defaults.plugins.legend.display = false;
  Chart.defaults.plugins.tooltip.backgroundColor = "#101828";
  Chart.defaults.plugins.tooltip.padding = 10;
  Chart.defaults.plugins.tooltip.cornerRadius = 8;
  Chart.defaults.plugins.tooltip.displayColors = false;

  function ejeNumerico(callback, enteros, maxValor) {
    return {
      beginAtZero: true,
      suggestedMax: enteros ? Math.max(2, Math.ceil(maxValor * 1.3)) : undefined,
      grid: { color: colorGrid, drawTicks: false },
      border: { display: false },
      ticks: { color: colorAxis, callback: callback, precision: enteros ? 0 : undefined },
    };
  }

  function ejeCategoria() {
    return {
      grid: { display: false },
      border: { display: false },
      ticks: { color: colorInk, font: { weight: "600" } },
    };
  }

  function barraVertical(id, labels, valores, color, formatoMoneda) {
    var el = document.getElementById(id);
    if (!el) return;
    new Chart(el, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            data: valores,
            backgroundColor: color,
            borderRadius: 4,
            borderSkipped: false,
            maxBarThickness: 46,
            categoryPercentage: 0.55,
            barPercentage: 0.9,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: ejeCategoria(),
          y: ejeNumerico(formatoMoneda ? function (v) { return formatoARS.format(v); } : undefined, !formatoMoneda, Math.max.apply(null, valores)),
        },
        plugins: {
          tooltip: {
            callbacks: formatoMoneda ? { label: function (ctx) { return formatoARS.format(ctx.parsed.y); } } : {},
          },
        },
      },
    });
  }

  function barraHorizontal(id, labels, valores, color) {
    var el = document.getElementById(id);
    if (!el) return;
    new Chart(el, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            data: valores,
            backgroundColor: color,
            borderRadius: 4,
            borderSkipped: false,
            maxBarThickness: 22,
            categoryPercentage: 0.55,
            barPercentage: 0.9,
          },
        ],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: ejeNumerico(undefined, true, Math.max.apply(null, valores)),
          y: ejeCategoria(),
        },
      },
    });
  }

  function dona(id, valores, colores) {
    var el = document.getElementById(id);
    if (!el) return;
    new Chart(el, {
      type: "doughnut",
      data: {
        datasets: [
          {
            data: valores,
            backgroundColor: colores,
            borderWidth: 2,
            borderColor: "#ffffff",
            hoverOffset: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "68%",
        plugins: { legend: { display: false } },
      },
    });
  }

  if (datos.topVehiculos.length) {
    barraVertical(
      "chartTopVehiculos",
      datos.topVehiculos.map(function (v) { return v.patente; }),
      datos.topVehiculos.map(function (v) { return v.total; }),
      colorDanger,
      true
    );
  }
  if (datos.porLocalidad.length) {
    dona("chartLocalidad", datos.porLocalidad.map(function (d) { return d.cantidad; }), datos.coloresLocalidad);
  }
  if (datos.porTipoServicio.length) {
    barraHorizontal(
      "chartTipoServicio",
      datos.porTipoServicio.map(function (t) { return t.tipo; }),
      datos.porTipoServicio.map(function (t) { return t.cantidad; }),
      colorAccent
    );
  }
  if (datos.siniestrosPorVehiculo.length) {
    barraVertical(
      "chartSiniestros",
      datos.siniestrosPorVehiculo.map(function (s) { return s.patente; }),
      datos.siniestrosPorVehiculo.map(function (s) { return s.cantidad; }),
      colorDanger,
      false
    );
  }
  if (datos.choferesConMasViajes.length) {
    barraHorizontal(
      "chartChoferes",
      datos.choferesConMasViajes.map(function (c) { return c.nombre; }),
      datos.choferesConMasViajes.map(function (c) { return c.cantidad; }),
      colorAccent
    );
  }
  if (datos.destinosMasFrecuentes.length) {
    dona("chartDestinos", datos.destinosMasFrecuentes.map(function (d) { return d.cantidad; }), datos.coloresDestinos);
  }
})();
