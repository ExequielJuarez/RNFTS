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

  var selectVehiculo = document.getElementById('select-vehiculo');
  var selectChofer = document.getElementById('select-chofer');
  var kmSalidaInput = document.getElementById('km-salida');
  var prevVehiculoCard = document.getElementById('preview-vehiculo');
  var prevChoferCard = document.getElementById('preview-chofer');

  selectVehiculo.addEventListener('change', function () {
    var opt = this.options[this.selectedIndex];
    if (this.value) {
      var km = opt.dataset.km ? Number(opt.dataset.km) : 0;
      document.getElementById('prev-vehiculo-patente').textContent = this.value;
      document.getElementById('prev-vehiculo-info').textContent = opt.dataset.modelo + ' · ' + km.toLocaleString('es-AR') + ' km';
      prevVehiculoCard.classList.add('is-active');
      kmSalidaInput.min = km;
      kmSalidaInput.value = km;
    } else {
      document.getElementById('prev-vehiculo-patente').textContent = 'Ninguno';
      document.getElementById('prev-vehiculo-info').textContent = '—';
      prevVehiculoCard.classList.remove('is-active');
    }
  });

  selectChofer.addEventListener('change', function () {
    var opt = this.options[this.selectedIndex];
    if (this.value) {
      document.getElementById('prev-chofer-nombre').textContent = opt.text.trim();
      document.getElementById('prev-chofer-info').textContent = 'DNI ' + opt.dataset.dni;
      prevChoferCard.classList.add('is-active');
    } else {
      document.getElementById('prev-chofer-nombre').textContent = 'Ninguno';
      document.getElementById('prev-chofer-info').textContent = '—';
      prevChoferCard.classList.remove('is-active');
    }
  });

  var fechaDesde = document.getElementById('fecha-desde');
  var fechaHasta = document.getElementById('fecha-hasta');
  var durHint = document.getElementById('duracion-hint');
  var hoy = new Date().toISOString().split('T')[0];
  fechaDesde.min = hoy; fechaDesde.value = hoy; fechaHasta.min = hoy;

  function calcDuracion() {
    if (!fechaDesde.value || !fechaHasta.value) { durHint.textContent = ''; return; }
    var diff = Math.round((new Date(fechaHasta.value) - new Date(fechaDesde.value)) / 86400000);
    if (diff < 0) { durHint.textContent = 'La fecha de fin debe ser posterior a la de inicio.'; durHint.style.color = 'var(--danger)'; }
    else { durHint.textContent = 'Tiempo asignado: ' + diff + ' día' + (diff !== 1 ? 's' : '') + '.'; durHint.style.color = 'var(--success)'; }
  }
  fechaDesde.addEventListener('change', calcDuracion);
  fechaHasta.addEventListener('change', calcDuracion);

  var params = new URLSearchParams(window.location.search);
  var patenteParam = params.get('patente');
  if (patenteParam) {
    selectVehiculo.value = patenteParam;
    selectVehiculo.dispatchEvent(new Event('change'));
  }

})();
