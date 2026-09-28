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
})();
