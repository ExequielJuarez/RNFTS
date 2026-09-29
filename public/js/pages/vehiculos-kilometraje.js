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

  var vehicleSelect = document.getElementById('select-vehiculo');
  var kmActualDisplay = document.getElementById('km-actual-display');
  var choferDisplay = document.getElementById('chofer-display');
  var kmNuevoInput = document.getElementById('km_nuevo');
  var kmDiffHint = document.getElementById('km-diff-hint');
  var kmActualGlobal = null;

  vehicleSelect.addEventListener('change', function () {
    var opt = this.options[this.selectedIndex];
    if (!this.value) {
      kmActualDisplay.textContent = '0 km'; choferDisplay.textContent = 'Sin asignar'; kmActualGlobal = null; kmDiffHint.textContent = '';
      return;
    }
    var km = parseInt(opt.dataset.km) || 0;
    kmActualDisplay.textContent = km.toLocaleString('es-AR') + ' km';
    choferDisplay.textContent = opt.dataset.chofer;
    kmActualGlobal = km;
    if (!kmNuevoInput.value) kmNuevoInput.value = km;
    actualizarDiff();
  });

  function actualizarDiff() {
    if (kmActualGlobal === null) { kmDiffHint.textContent = ''; return; }
    var nuevo = parseInt(kmNuevoInput.value);
    if (isNaN(nuevo)) { kmDiffHint.textContent = ''; return; }
    var diff = nuevo - kmActualGlobal;
    if (diff > 0) { kmDiffHint.textContent = '+' + diff.toLocaleString('es-AR') + ' km respecto al registro actual'; kmDiffHint.style.color = 'var(--success)'; }
    else if (diff === 0) { kmDiffHint.textContent = 'Sin cambios'; kmDiffHint.style.color = 'var(--text-muted)'; }
    else { kmDiffHint.textContent = 'Valor menor al actual (-' + Math.abs(diff).toLocaleString('es-AR') + ' km)'; kmDiffHint.style.color = 'var(--danger)'; }
  }
  kmNuevoInput.addEventListener('input', actualizarDiff);

  var fechaInput = document.getElementById('fecha_actualizacion');
  var hoy = new Date().toISOString().split('T')[0];
  fechaInput.max = hoy;
  fechaInput.value = hoy;

  // historialTodos se define en un <script> inline en la vista (datos del servidor)
  var historialTodos = window.historialTodos || [];
  var kmChartInstance = null;
  document.getElementById('select-historial').addEventListener('change', function () {
    var patente = this.value;
    var datos = historialTodos.filter(function (h) { return h.patente === patente; })
      .sort(function (a, b) { return new Date(a.fecha) - new Date(b.fecha); });

    if (kmChartInstance) kmChartInstance.destroy();
    if (!datos.length) return;

    kmChartInstance = new Chart(document.getElementById('kmChart'), {
      type: 'line',
      data: {
        labels: datos.map(function (h) { return new Date(h.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' }); }),
        datasets: [{
          label: 'Kilometraje',
          data: datos.map(function (h) { return h.km; }),
          borderColor: '#0e7c6b',
          backgroundColor: 'rgba(14, 124, 107, 0.12)',
          borderWidth: 3,
          pointBackgroundColor: '#0e7c6b',
          pointRadius: 4,
          fill: true,
          tension: 0.3
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
  });

})();
