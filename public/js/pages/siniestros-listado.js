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

  var filtroTexto = document.getElementById('filtro-texto');
  var filtroEstado = document.getElementById('filtro-estado');
  var filtroMes = document.getElementById('filtro-mes');
  var filas = document.querySelectorAll('.fila-siniestro');

  function filtrar() {
    var txt = filtroTexto.value.toLowerCase();
    var est = filtroEstado.value;
    var mes = filtroMes.value;
    filas.forEach(function (fila) {
      var contenido = fila.innerText.toLowerCase();
      var cumpleEstado = !est || fila.dataset.estado === est;
      var cumpleMes = !mes || fila.dataset.fecha.slice(0, 7) === mes;
      fila.style.display = (contenido.includes(txt) && cumpleEstado && cumpleMes) ? '' : 'none';
    });
  }
  filtroTexto.addEventListener('input', filtrar);
  filtroEstado.addEventListener('change', filtrar);
  filtroMes.addEventListener('change', filtrar);

  document.getElementById('btn-exportar').addEventListener('click', function () {
    var headers = ['Fecha', 'Patente', 'Vehículo', 'Chofer', 'Tercero', 'Estado'];
    var rows = [headers.join(',')];
    filas.forEach(function (fila) {
      if (fila.style.display === 'none') return;
      var celdas = fila.querySelectorAll('td');
      var fila_csv = [
        fila.dataset.fecha,
        celdas[1].querySelector('.is-primary').textContent.trim(),
        celdas[1].querySelector('span:last-child').textContent.trim(),
        celdas[2].textContent.trim(),
        celdas[3].querySelector('span').textContent.trim(),
        fila.dataset.estado,
      ].map(function (v) { return '"' + String(v).replace(/"/g, '""') + '"'; }).join(',');
      rows.push(fila_csv);
    });
    var blob = new Blob(["﻿" + rows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = 'Siniestros.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  });

})();
