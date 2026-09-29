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

  // Donut en CSS puro (conic-gradient) — sin dependencias externas
  document.querySelectorAll('.donut').forEach(function (donut) {
    var values = donut.dataset.values.split(',').map(Number);
    var colors = donut.dataset.colors.split(',');
    var total = values.reduce(function (a, b) { return a + b; }, 0) || 1;
    var acc = 0;
    var stops = values.map(function (v, i) {
      var start = (acc / total) * 360;
      acc += v;
      var end = (acc / total) * 360;
      return colors[i] + ' ' + start + 'deg ' + end + 'deg';
    });
    donut.style.background = values.some(Boolean)
      ? 'conic-gradient(' + stops.join(', ') + ')'
      : 'var(--border-subtle)';
  });

  document.getElementById('alertas-tbody').addEventListener('click', function (e) {
    var btn = e.target.closest('.btn-marcar-leida');
    if (!btn) return;
    fetch('/alertas/' + btn.dataset.id + '/leer', { method: 'POST' }).then(function () {
      var fila = btn.closest('tr');
      fila.style.opacity = '.65';
      fila.dataset.estado = 'leida';
      btn.remove();
    });
  });

  var filas = Array.from(document.querySelectorAll('.alerta-row'));
  var filtroBuscar = document.getElementById('filtro-buscar');
  var filtroDesde = document.getElementById('filtro-desde');
  var filtroHasta = document.getElementById('filtro-hasta');
  var filtroTipo = document.getElementById('filtro-tipo');
  var filtroEstado = document.getElementById('filtro-estado');
  var sinResultados = document.getElementById('sin-resultados');

  function aplicarFiltros() {
    var buscar = filtroBuscar.value.toLowerCase().trim();
    var visibles = 0;
    filas.forEach(function (fila) {
      var ok = true;
      if (buscar && !fila.dataset.buscar.includes(buscar)) ok = false;
      if (filtroTipo.value && fila.dataset.tipo !== filtroTipo.value) ok = false;
      if (filtroEstado.value && fila.dataset.estado !== filtroEstado.value) ok = false;
      if (filtroDesde.value && fila.dataset.fecha < filtroDesde.value) ok = false;
      if (filtroHasta.value && fila.dataset.fecha > filtroHasta.value) ok = false;
      fila.style.display = ok ? '' : 'none';
      if (ok) visibles++;
    });
    sinResultados.style.display = visibles === 0 ? '' : 'none';
    document.querySelectorAll('[data-filtro-tipo]').forEach(function (card) {
      card.classList.toggle('is-active', card.dataset.filtroTipo === filtroTipo.value && filtroTipo.value !== '');
    });
  }
  [filtroBuscar, filtroDesde, filtroHasta, filtroTipo, filtroEstado].forEach(function (el) { el.addEventListener('input', aplicarFiltros); });

  document.getElementById('btn-limpiar').addEventListener('click', function () {
    filtroBuscar.value = ''; filtroDesde.value = ''; filtroHasta.value = ''; filtroTipo.value = ''; filtroEstado.value = '';
    aplicarFiltros();
  });

  document.querySelectorAll('[data-filtro-tipo]').forEach(function (card) {
    card.addEventListener('click', function () {
      filtroTipo.value = card.dataset.filtroTipo;
      aplicarFiltros();
    });
  });

})();
