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
  document.querySelectorAll('.firma-pad').forEach(function (canvas) {
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#0f1b2d';
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    var wrap = canvas.closest('.firma-pad-wrap');
    var form = wrap.querySelector('[data-firma-form]');
    var input = form.querySelector('[data-firma-input]');
    var btnGuardar = form.querySelector('[data-firma-guardar]');
    var btnLimpiar = wrap.querySelector('[data-firma-limpiar]');

    var dibujando = false;
    var tieneTrazo = false;

    function posicion(e) {
      var rect = canvas.getBoundingClientRect();
      var escalaX = canvas.width / rect.width;
      var escalaY = canvas.height / rect.height;
      return { x: (e.clientX - rect.left) * escalaX, y: (e.clientY - rect.top) * escalaY };
    }

    function iniciar(e) {
      dibujando = true;
      var p = posicion(e);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      if (canvas.setPointerCapture) canvas.setPointerCapture(e.pointerId);
    }

    function mover(e) {
      if (!dibujando) return;
      var p = posicion(e);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      tieneTrazo = true;
      if (btnGuardar) btnGuardar.disabled = false;
    }

    function terminar() {
      dibujando = false;
    }

    canvas.addEventListener('pointerdown', iniciar);
    canvas.addEventListener('pointermove', mover);
    canvas.addEventListener('pointerup', terminar);
    canvas.addEventListener('pointercancel', terminar);
    canvas.addEventListener('pointerleave', terminar);

    if (btnLimpiar) {
      btnLimpiar.addEventListener('click', function () {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        tieneTrazo = false;
        if (btnGuardar) btnGuardar.disabled = true;
      });
    }

    function construirFirmaGuardada(slotDiv, etiqueta, nombre, fecha, dataUrl) {
      slotDiv.innerHTML = '';
      var etiquetaEl = document.createElement('span');
      etiquetaEl.className = 'firma-etiqueta';
      etiquetaEl.textContent = etiqueta;
      var img = document.createElement('img');
      img.className = 'firma-img';
      img.src = dataUrl;
      img.alt = 'Firma de ' + nombre;
      var strong = document.createElement('strong');
      strong.textContent = nombre;
      var fechaEl = document.createElement('span');
      fechaEl.className = 'firma-fecha';
      fechaEl.textContent = 'Firmado el ' + fecha;
      slotDiv.appendChild(etiquetaEl);
      slotDiv.appendChild(img);
      slotDiv.appendChild(strong);
      slotDiv.appendChild(fechaEl);
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!tieneTrazo) return;
      input.value = canvas.toDataURL('image/png');
      if (btnGuardar) btnGuardar.disabled = true;

      // Se guarda por fetch (en vez de un submit normal) para no recargar la página
      // entera: así una firma pendiente en el otro recuadro no se pierde al guardar esta.
      fetch(form.getAttribute('action'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
        body: new URLSearchParams(new FormData(form)).toString(),
      })
        .then(function (r) {
          if (!r.ok) throw new Error('No se pudo guardar la firma');
          return r.json();
        })
        .then(function (data) {
          var slotDiv = wrap.closest('.firma-slot');
          var etiqueta = slotDiv.dataset.etiqueta;
          var nombreFirma = (data.firma && data.firma.nombre) || slotDiv.dataset.nombre;
          var fechaFirma = new Date(data.firma.fecha + 'T00:00:00').toLocaleDateString('es-AR');
          construirFirmaGuardada(slotDiv, etiqueta, nombreFirma, fechaFirma, data.firma.dataUrl);
        })
        .catch(function () {
          if (btnGuardar) btnGuardar.disabled = false;
          alert('No se pudo guardar la firma. Probá de nuevo.');
        });
    });
  });
})();
