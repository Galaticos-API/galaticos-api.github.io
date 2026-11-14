/* Galáticos — sistema de órbitas, estrelas e pequenos utilitários */

(function () {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function el(name, attrs, parent) {
    var node = document.createElementNS(NS, name);
    for (var k in attrs) {
      if (Object.prototype.hasOwnProperty.call(attrs, k)) node.setAttribute(k, attrs[k]);
    }
    if (parent) parent.appendChild(node);
    return node;
  }

  /* ───────── Campo de estrelas (fixo, sem animação) ───────── */

  function drawStars() {
    var host = document.getElementById("stars");
    if (!host) return;
    var seed = 20261114;
    function rnd() {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    }
    var svg = el("svg", { width: "100%", height: "100%", "aria-hidden": "true", preserveAspectRatio: "none", viewBox: "0 0 1000 700" }, host);
    for (var i = 0; i < 110; i++) {
      var big = rnd() > 0.92;
      el("circle", {
        cx: (rnd() * 1000).toFixed(1),
        cy: (rnd() * 700).toFixed(1),
        r: big ? 1.7 : (0.5 + rnd() * 0.8).toFixed(2),
        fill: big ? "#ffc24b" : "#ece9ff",
        "fill-opacity": (0.25 + rnd() * 0.6).toFixed(2)
      }, svg);
    }
  }

  /* ───────── Sistema de órbitas ───────── */

  var PROJECTS = [
    { id: "api-1", n: 1, color: "#ff7a59", name: "API-1", title: "Atestados e avaliação de equipes ágeis", period: 26, start: 0.9 },
    { id: "api-2", n: 2, color: "#2ec4b6", name: "API-2", title: "Sistema de PDI para a Youtan", period: 38, start: 3.6 },
    { id: "api-3", n: 3, color: "#5aa9ff", name: "API-3", title: "Mapa de oportunidade para crédito inclusivo", period: 52, start: 2.1 },
    { id: "api-4", n: 4, color: "#ffc24b", name: "API-4", title: "Sinapse, base inteligente de requisitos", period: 70, start: 5.2 }
  ];

  var RADII = [74, 122, 170, 218, 262, 300];
  var C = 320;

  function drawOrbits() {
    var host = document.getElementById("orbit");
    if (!host) return;

    var svg = el("svg", {
      viewBox: "0 0 640 640",
      role: "group",
      "aria-label": "Sistema de órbitas: quatro projetos concluídos em seis semestres"
    }, host);

    var defs = el("defs", {}, svg);
    var glow = el("radialGradient", { id: "sunGlow" }, defs);
    el("stop", { offset: "0%", "stop-color": "#ffc24b", "stop-opacity": "0.55" }, glow);
    el("stop", { offset: "100%", "stop-color": "#ffc24b", "stop-opacity": "0" }, glow);

    el("circle", { cx: C, cy: C, r: 120, fill: "url(#sunGlow)" }, svg);

    RADII.forEach(function (r, i) {
      var done = i < PROJECTS.length;
      el("circle", {
        cx: C, cy: C, r: r,
        "class": "ring " + (done ? "done" : "todo"),
        style: "--i:" + i
      }, svg);
    });

    /* semestres ainda não cursados */
    [4, 5].forEach(function (i) {
      var r = RADII[i];
      var t = el("text", {
        x: C, y: C - r + 5,
        "class": "ring-note",
        "paint-order": "stroke",
        stroke: "#12102f",
        "stroke-width": 8,
        "stroke-linejoin": "round"
      }, svg);
      t.textContent = (i + 1) + "º semestre";
    });

    el("circle", { cx: C, cy: C, r: 36, fill: "#ffc24b" }, svg);
    var g = el("text", { x: C, y: C + 2, "class": "sun-g" }, svg);
    g.textContent = "G";

    var planets = PROJECTS.map(function (p, i) {
      var a = el("a", { href: "#" + p.id, "class": "planet", style: "--i:" + i }, svg);
      a.setAttribute("aria-label", p.name + ": " + p.title);
      el("circle", { "class": "halo", r: 25, fill: "transparent", stroke: "transparent" }, a);
      el("circle", { "class": "body", r: 15, fill: p.color, stroke: "#12102f", "stroke-width": 3 }, a);
      var num = el("text", { "class": "num" }, a);
      num.textContent = p.n;
      var lbl = el("text", {
        y: 39,
        "paint-order": "stroke",
        stroke: "#12102f",
        "stroke-width": 6,
        "stroke-linejoin": "round"
      }, a);
      lbl.textContent = p.name;
      return a;
    });

    var paused = false;
    var angles = PROJECTS.map(function (p) { return p.start; });

    function place() {
      planets.forEach(function (node, i) {
        var x = C + RADII[i] * Math.cos(angles[i]);
        var y = C + RADII[i] * Math.sin(angles[i]);
        node.setAttribute("transform", "translate(" + x.toFixed(2) + " " + y.toFixed(2) + ")");
      });
    }
    place();

    planets.forEach(function (node) {
      node.addEventListener("pointerenter", function () { paused = true; });
      node.addEventListener("pointerleave", function () { paused = false; });
      node.addEventListener("focus", function () { paused = true; });
      node.addEventListener("blur", function () { paused = false; });
    });

    if (reduceMotion) return;

    var last = performance.now();
    function tick(now) {
      var dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      if (!paused && !document.hidden) {
        for (var i = 0; i < angles.length; i++) {
          angles[i] += (Math.PI * 2 / PROJECTS[i].period) * dt;
        }
        place();
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ───────── Copiar git clone ───────── */

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy") ? resolve() : reject();
      } catch (e) {
        reject(e);
      } finally {
        document.body.removeChild(ta);
      }
    });
  }

  function wireCopy() {
    var live = document.getElementById("live");
    document.querySelectorAll("[data-copy]").forEach(function (btn) {
      var label = btn.textContent;
      btn.addEventListener("click", function () {
        copyText(btn.getAttribute("data-copy")).then(function () {
          btn.textContent = "Copiado";
          if (live) live.textContent = "Comando copiado para a área de transferência";
          setTimeout(function () { btn.textContent = label; }, 1800);
        }, function () {
          btn.textContent = "Não foi possível copiar";
          setTimeout(function () { btn.textContent = label; }, 2200);
        });
      });
    });
  }

  /* ───────── Avatares: iniciais se a foto não carregar ───────── */

  function wireAvatars() {
    document.querySelectorAll(".avatar img").forEach(function (img) {
      function fallback() {
        var box = img.parentNode;
        box.textContent = box.getAttribute("data-initials") || "";
      }
      img.addEventListener("error", fallback);
      if (img.complete && img.naturalWidth === 0) fallback();
    });
  }

  /* ───────── Rodapé e easter egg ───────── */

  function footer() {
    var y = document.getElementById("year");
    if (y) y.textContent = new Date().getFullYear();

    if (window.console && console.log) {
      console.log(
        "%cGaláticos%c\nVocê abriu o console, então já faz parte da tripulação.\nO código deste site está em github.com/Galaticos-API/galaticos-api.github.io",
        "font:800 28px system-ui;color:#ffc24b;background:#12102f;padding:6px 12px;border-radius:8px",
        "font:14px system-ui;color:#8b6cff"
      );
    }
  }

  drawStars();
  drawOrbits();
  wireCopy();
  wireAvatars();
  footer();
})();
