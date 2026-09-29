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

  // repuestosCatalogo se define en un <script> inline en la vista (datos del servidor)
  var repuestosCatalogo = window.repuestosCatalogo || [];

  document.getElementById('fecha').value = new Date().toISOString().split('T')[0];

  var selectVehiculo = document.getElementById('select-vehiculo');
  var kmServicioInput = document.getElementById('km_servicio');
  var kmHint = document.getElementById('km-actual-hint');

  function actualizarKmHint() {
    var opt = selectVehiculo.options[selectVehiculo.selectedIndex];
    if (opt && opt.value) {
      kmHint.textContent = 'Km registrado en base: ' + Number(opt.dataset.km).toLocaleString('es-AR');
      if (!kmServicioInput.value) kmServicioInput.value = opt.dataset.km;
    } else {
      kmHint.textContent = '';
    }
  }
  selectVehiculo.addEventListener('change', actualizarKmHint);
  if (selectVehiculo.value) actualizarKmHint();

  function calcularTotal() {
    var totalRepuestos = 0;
    document.querySelectorAll('.repuesto-row').forEach(function (fila) {
      var cant = parseFloat(fila.querySelector('[name="cantidad"]').value) || 0;
      var costo = parseFloat(fila.querySelector('[name="costo_unitario"]').value) || 0;
      totalRepuestos += cant * costo;
    });
    var manoObra = parseFloat(document.getElementById('mano_obra').value) || 0;
    document.getElementById('costo_total').value = (totalRepuestos + manoObra).toFixed(2);
    document.getElementById('costo_repuestos').value = totalRepuestos.toFixed(2);
  }
  document.getElementById('mano_obra').addEventListener('input', calcularTotal);

  document.getElementById('btn-add-repuesto').addEventListener('click', function () {
    var opciones = repuestosCatalogo.map(function (r) {
      return '<option value="' + r.id + '" data-precio="' + r.costoUnitario + '">' + r.nombre + ' (Stock: ' + r.stock + ')</option>';
    }).join('');

    var row = document.createElement('div');
    row.className = 'repuesto-row';
    row.innerHTML =
      '<select name="id_repuesto" class="select-repuesto" required><option value="" selected disabled>-- Seleccione repuesto --</option>' + opciones + '</select>' +
      '<input type="number" name="cantidad" placeholder="Cant." min="1" value="1" required>' +
      '<input type="number" name="costo_unitario" placeholder="Costo $" step="0.01" required>' +
      '<button type="button" class="btn-remove-row">×</button>';

    document.getElementById('contenedor-repuestos').appendChild(row);

    row.querySelector('.select-repuesto').addEventListener('change', function () {
      var opt = this.options[this.selectedIndex];
      row.querySelector('[name="costo_unitario"]').value = opt.dataset.precio || 0;
      calcularTotal();
    });
    row.querySelectorAll('input').forEach(function (inp) { inp.addEventListener('input', calcularTotal); });
    row.querySelector('.btn-remove-row').addEventListener('click', function () { row.remove(); calcularTotal(); });
  });

  document.getElementById('form-mantenimiento').addEventListener('submit', function (e) {
    var kmActual = parseFloat(selectVehiculo.options[selectVehiculo.selectedIndex]?.dataset.km) || 0;
    var kmServicio = parseFloat(kmServicioInput.value) || 0;
    if (kmServicio < kmActual) {
      e.preventDefault();
      alert('El km del servicio no puede ser menor al actual (' + kmActual.toLocaleString('es-AR') + ').');
    } else {
      calcularTotal();
    }
  });

})();
