/*
 * Site behavior: fills in values from site-config.js, runs the mobile menu
 * and the dropdown menus, and opens FAQ answers before printing.
 * Pages still work without this script; they show the "Available soon"
 * placeholders and a fully expanded menu.
 */
(function () {
  "use strict";

  var config = window.SITE_CONFIG || {};

  function setting(key) {
    var value = config[key];
    return typeof value === "string" ? value.trim() : "";
  }

  function each(selector, fn) {
    Array.prototype.forEach.call(document.querySelectorAll(selector), fn);
  }

  /* ---- Values from site-config.js ---- */

  each("[data-config-link]", function (el) {
    var url = setting(el.getAttribute("data-config-link"));
    if (!url) return;
    el.setAttribute("href", url);
    el.classList.remove("is-pending");
    el.removeAttribute("aria-disabled");
    Array.prototype.forEach.call(el.querySelectorAll(".pending-note"), function (note) {
      note.parentNode.removeChild(note);
    });
  });

  var email = setting("PROGRAM_CONTACT_EMAIL");
  if (email) {
    each("[data-config-email]", function (el) {
      var link = document.createElement("a");
      link.href = "mailto:" + email;
      link.textContent = email;
      el.textContent = "";
      el.appendChild(link);
    });
  }

  each("[data-config-text]", function (el) {
    var text = setting(el.getAttribute("data-config-text"));
    if (!text) return;
    el.textContent = text;
    el.classList.remove("is-pending-text");
  });

  each("[data-year]", function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* ---- Mobile menu ---- */

  var navToggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");

  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      var open = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!open));
      nav.classList.toggle("is-open", !open);
    });
  }

  /* ---- Dropdown menus ---- */

  var desktopHover = window.matchMedia("(min-width: 1024px) and (hover: hover)");
  var desktop = window.matchMedia("(min-width: 1024px)");
  var subToggles = document.querySelectorAll(".sub-toggle");

  function closeMenus(except) {
    Array.prototype.forEach.call(subToggles, function (btn) {
      if (btn !== except) btn.setAttribute("aria-expanded", "false");
    });
  }

  Array.prototype.forEach.call(subToggles, function (btn) {
    var item = btn.parentNode;

    btn.addEventListener("click", function () {
      var open = btn.getAttribute("aria-expanded") === "true";
      if (desktop.matches) closeMenus(btn);
      btn.setAttribute("aria-expanded", String(!open));
    });

    item.addEventListener("mouseleave", function () {
      if (desktopHover.matches) btn.setAttribute("aria-expanded", "false");
    });

    item.addEventListener("focusout", function (event) {
      if (desktop.matches && !item.contains(event.relatedTarget)) {
        btn.setAttribute("aria-expanded", "false");
      }
    });
  });

  document.addEventListener("click", function (event) {
    if (desktop.matches && !event.target.closest(".has-sub")) closeMenus();
  });

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    var openBtn = document.querySelector('.sub-toggle[aria-expanded="true"]');
    if (openBtn && desktop.matches) {
      closeMenus();
      openBtn.focus();
    }
  });

  /* ---- Print: show every FAQ answer ---- */

  window.addEventListener("beforeprint", function () {
    each("details", function (d) {
      if (!d.open) {
        d.setAttribute("data-print-opened", "");
        d.open = true;
      }
    });
  });

  window.addEventListener("afterprint", function () {
    each("details[data-print-opened]", function (d) {
      d.open = false;
      d.removeAttribute("data-print-opened");
    });
  });
})();
