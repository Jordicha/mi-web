// script.js

/* ====== CONFIG ====== */
// Si quieres fijar el endpoint aquí, ponlo; si no, se usa la action del <form>.
const FORM_ENDPOINT = ""; // ej: "https://formspree.io/f/abcde"

/* ====== AÑO DEL FOOTER ====== */
const anio = document.getElementById("anio");
if (anio) anio.textContent = new Date().getFullYear();

/* ====== MODO CLARO / OSCURO ====== */
const btnTema = document.getElementById("theme-toggle");
function leerTema() {
  try {
    let t = localStorage.getItem("theme");
    if (!t) t = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    return t;
  } catch (e) { return "dark"; }
}
function aplicarTema(tema) {
  document.documentElement.setAttribute("data-theme", tema);
  if (btnTema) {
    const claro = tema === "light";
    const imagen = document.getElementById("invader-btn")
    btnTema.setAttribute("aria-pressed", String(claro));
    const icono = btnTema.querySelector(".theme-toggle__icon");
    const etiqueta = btnTema.querySelector(".theme-toggle__label");
    if (icono) icono.textContent = claro ? "☾" : "☀";
    if (etiqueta) etiqueta.textContent = claro ? "Oscuro" : "Luz";
    //if (imagen) imagen.src = claro ? "./alien.png" : "./alien2.png";


  }
}
aplicarTema(leerTema());
if (btnTema) {
  btnTema.addEventListener("click", () => {
    const actual = document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
    const nuevo = actual === "light" ? "dark" : "light";
    try { localStorage.setItem("theme", nuevo); } catch (e) {}
    aplicarTema(nuevo);
  });
}

/* ====== MÁQUINA DE ESCRIBIR ====== */
const frase = document.querySelector(".hero__phrase");
if (frase) {
  const texto = frase.dataset.text || frase.textContent.trim();
  const reducir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducir) frase.textContent = texto;
  else {
    frase.textContent = "";
    let i = 0;
    const escribir = () => { if (i <= texto.length) { frase.textContent = texto.slice(0, i); i++; setTimeout(escribir, 35); } };
    escribir();
  }
}

/* ====== REVELADO AL SCROLL ====== */
const secciones = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const obs = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && e.target.classList.add("visible")), { threshold: .15 });
  secciones.forEach((s) => obs.observe(s));
} else {
  secciones.forEach((s) => s.classList.add("visible"));
}

/* ====== ENLACE ACTIVO EN EL MENÚ ====== */
const enlaces = Array.from(document.querySelectorAll(".hero__nav a"));
const objetivos = enlaces.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);
function actualizarEnlaceActivo() {
  const pos = window.scrollY + window.innerHeight / 3;
  let activo = objetivos[0] ? objetivos[0].id : null;
  objetivos.forEach((s) => { if (s.offsetTop <= pos) activo = s.id; });
  enlaces.forEach((a) => a.classList.toggle("activo", a.getAttribute("href") === "#" + activo));
}
window.addEventListener("scroll", actualizarEnlaceActivo);
actualizarEnlaceActivo();

/* ====== FILTRO DE SERIES ====== */
const filtros = document.querySelectorAll(".filter");
const tarjetas = document.querySelectorAll(".card");
filtros.forEach((b) => b.addEventListener("click", () => {
  const f = b.dataset.filter;
  filtros.forEach((x) => x.classList.remove("filter--active"));
  b.classList.add("filter--active");
  tarjetas.forEach((t) => t.classList.toggle("oculta", !(f === "all" || t.dataset.genero === f)));
}));

/* ====== ENVÍO DEL FORMULARIO (FORMSPREE) ====== */
const formulario = document.getElementById("form-contacto");
if (formulario) {
  const estado = document.getElementById("form-status");
  const boton = document.getElementById("btn-enviar");
  const endpoint = FORM_ENDPOINT || formulario.getAttribute("action");

  const escribirEstado = (m, t) => {
    if (!estado) return;
    estado.textContent = m;
    estado.classList.remove("ok", "error");
    if (t) estado.classList.add(t);
  };

  formulario.addEventListener("submit", async (ev) => {
    ev.preventDefault();

    // Aviso si no has configurado tu ID de Formspree
    if (!endpoint || endpoint.indexOf("TU_ID") !== -1) {
      escribirEstado("✖ Configura tu ID de Formspree en el formulario.", "error");
      return;
    }

    if (!formulario.checkValidity()) { formulario.reportValidity(); return; }

    const datos = Object.fromEntries(new FormData(formulario).entries());

    if (boton) { boton.disabled = true; boton.textContent = "Enviando..."; }
    escribirEstado("Enviando mensaje...", null);

    try {
      const r = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(datos)
      });

      if (r.ok) {
        escribirEstado("✔ Mensaje enviado. ¡Gracias!", "ok");
        formulario.reset();
      } else {
        escribirEstado("✖ No se pudo enviar. Inténtalo de nuevo.", "error");
      }
    } catch (e) {
      escribirEstado("✖ Error de conexión. Inténtalo de nuevo.", "error");
    } finally {
      if (boton) { boton.disabled = false; boton.textContent = "Enviar mensaje"; }
    }
  });
}

/* ============================================================
   MINIJUEGO SPACE INVADERS
   ============================================================ */
(function () {
  const btnAlien = document.getElementById("invader-btn");
  const modal = document.getElementById("game-modal");
  const btnCerrar = document.getElementById("game-close");
  const canvas = document.getElementById("game-canvas");
  if (!btnAlien || !modal || !canvas) return;

  const ctx = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height;

  const CRAB_A = [
    "..X.....X..","...X...X...","..XXXXXXX..",".XX.XXX.XX.",
    "XXXXXXXXXXX","X.XXXXXXX.X","X.X.....X.X","..XXX.XXX.."
  ];
  const CRAB_B = [
    "..X.....X..","X..X...X..X","X.XXXXXXX.X","XX.XXX.XX.X",
    "XXXXXXXXXXX",".XXXXXXXXX.","..X.....X..",".X.......X."
  ];
  const SHIP = [
    "......X......",".....XXX.....",".....XXX.....",".XXXXXXXXXXX.",
    "XXXXXXXXXXXXX","XXXXXXXXXXXXX","XXX..X.X..XXX","..............."
  ];

  const el = {
    score: document.getElementById("g-score"),
    wave: document.getElementById("g-wave"),
    lives: document.getElementById("g-lives"),
    best: document.getElementById("g-best"),
    state: document.getElementById("game-state")
  };

  let colores = { fg: "#fff", bg: "#000" };
  function leerColores() {
    const s = getComputedStyle(document.documentElement);
    colores.fg = (s.getPropertyValue("--fg") || "#fff").trim();
    colores.bg = (s.getPropertyValue("--bg") || "#000").trim();
  }

  const G = {
    activo: false, pausado: false, over: false, raf: null, ult: 0,
    score: 0, wave: 1, lives: 3, best: 0,
    ship: { x: W / 2 - 30, y: H - 40, w: 13 * 4, h: 8 * 4, px: 4, vel: 280 },
    bala: null,
    balasEnemigas: [],
    invaders: [],
    dir: 1, velInv: 28, blink: 0, blinkT: 0,
    cdDisparo: 0
  };
  const INV_COLS = 8, INV_ROWS = 4, INV_W = 11 * 4, INV_H = 8 * 4, INV_GAPX = 12, INV_GAPY = 14;

  function leerBest() { try { return parseInt(localStorage.getItem("si_best") || "0", 10) || 0; } catch (e) { return 0; } }
  function guardarBest(v) { try { localStorage.setItem("si_best", String(v)); } catch (e) {} }

  function crearOleada() {
    G.invaders = [];
    const totalW = INV_COLS * INV_W + (INV_COLS - 1) * INV_GAPX;
    const startX = (W - totalW) / 2;
    const startY = 60;
    for (let r = 0; r < INV_ROWS; r++)
      for (let c = 0; c < INV_COLS; c++)
        G.invaders.push({ x: startX + c * (INV_W + INV_GAPX), y: startY + r * (INV_H + INV_GAPY), alive: true });
    G.dir = 1;
    G.velInv = 28 + (G.wave - 1) * 10;
  }

  function reiniciar() {
    G.score = 0; G.wave = 1; G.lives = 3; G.over = false; G.pausado = false;
    G.ship.x = W / 2 - G.ship.w / 2;
    G.bala = null; G.balasEnemigas = [];
    crearOleada();
    actualizarHUD();
    el.state.textContent = "";
  }

  function actualizarHUD() {
    if (el.score) el.score.textContent = G.score;
    if (el.wave) el.wave.textContent = G.wave;
    if (el.lives) el.lives.textContent = G.lives;
    if (el.best) el.best.textContent = G.best;
  }

  function dibujarSprite(mat, x, y, px, color) {
    ctx.fillStyle = color;
    for (let r = 0; r < mat.length; r++)
      for (let c = 0; c < mat[r].length; c++)
        if (mat[r][c] === "X") ctx.fillRect(x + c * px, y + r * px, px, px);
  }

  function render() {
    ctx.fillStyle = colores.bg;
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = colores.fg; ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, W - 2, H - 2);

    const mat = G.blink ? CRAB_B : CRAB_A;
    for (const inv of G.invaders) if (inv.alive) dibujarSprite(mat, inv.x, inv.y, 4, colores.fg);

    dibujarSprite(SHIP, G.ship.x, G.ship.y, G.ship.px, colores.fg);

    if (G.bala) { ctx.fillStyle = colores.fg; ctx.fillRect(G.bala.x - 2, G.bala.y, 4, 12); }
    ctx.fillStyle = colores.fg;
    for (const b of G.balasEnemigas) ctx.fillRect(b.x - 2, b.y, 4, 10);
  }

  const teclas = {};
  function onKeyDown(e) {
    if (!G.activo) return;
    const k = e.key.toLowerCase();
    if (k === "arrowleft" || k === "a") { teclas.left = true; e.preventDefault(); }
    if (k === "arrowright" || k === "d") { teclas.right = true; e.preventDefault(); }
    if (k === " ") { disparar(); e.preventDefault(); }
    if (k === "p") { alternarPausa(); e.preventDefault(); }
    if (k === "escape") { cerrar(); }
  }
  function onKeyUp(e) {
    const k = e.key.toLowerCase();
    if (k === "arrowleft" || k === "a") teclas.left = false;
    if (k === "arrowright" || k === "d") teclas.right = false;
  }

  function disparar() {
    if (G.pausado || G.over || G.bala) return;
    G.bala = { x: G.ship.x + G.ship.w / 2, y: G.ship.y - 6 };
  }
  function alternarPausa() {
    if (G.over) return;
    G.pausado = !G.pausado;
    el.state.textContent = G.pausado ? "PAUSA" : "";
  }

  function bindHold(id, on, off) {
    const b = document.getElementById(id);
    if (!b) return;
    const down = (e) => { e.preventDefault(); on(); };
    const up = (e) => { e.preventDefault(); off(); };
    b.addEventListener("pointerdown", down);
    b.addEventListener("pointerup", up);
    b.addEventListener("pointerleave", up);
    b.addEventListener("pointercancel", up);
  }
  bindHold("g-left", () => teclas.left = true, () => teclas.left = false);
  bindHold("g-right", () => teclas.right = true, () => teclas.right = false);
  const btnFire = document.getElementById("g-fire");
  if (btnFire) btnFire.addEventListener("pointerdown", (e) => { e.preventDefault(); disparar(); });
  const btnPause = document.getElementById("g-pause");
  if (btnPause) btnPause.addEventListener("click", alternarPausa);

  function update(dt) {
    if (G.pausado || G.over) return;

    if (teclas.left) G.ship.x -= G.ship.vel * dt;
    if (teclas.right) G.ship.x += G.ship.vel * dt;
    G.ship.x = Math.max(8, Math.min(W - G.ship.w - 8, G.ship.x));

    G.blinkT += dt;
    if (G.blinkT > .4) { G.blinkT = 0; G.blink = 1 - G.blink; }

    let vivos = 0, minX = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const inv of G.invaders) if (inv.alive) {
      vivos++; minX = Math.min(minX, inv.x); maxX = Math.max(maxX, inv.x + INV_W); maxY = Math.max(maxY, inv.y);
    }
    if (vivos === 0) {
      G.wave++; G.score += 50; crearOleada(); actualizarHUD();
      el.state.textContent = "¡OLEADA SUPERADA!";
      return;
    }
    const dx = G.dir * G.velInv * dt * (1 + (INV_COLS - vivos) * 0.04);
    for (const inv of G.invaders) if (inv.alive) inv.x += dx;
    if (minX + dx <= 8 || maxX + dx >= W - 8) {
      G.dir *= -1;
      for (const inv of G.invaders) if (inv.alive) inv.y += 18;
    }
    if (maxY + INV_H >= G.ship.y) { finJuego("¡INVASIÓN!"); return; }

    if (G.bala) {
      G.bala.y -= 420 * dt;
      if (G.bala.y < 0) G.bala = null;
      else {
        for (const inv of G.invaders) if (inv.alive &&
          G.bala.x > inv.x && G.bala.x < inv.x + INV_W && G.bala.y > inv.y && G.bala.y < inv.y + INV_H) {
          inv.alive = false; G.bala = null; G.score += 10;
          if (G.score > G.best) { G.best = G.score; guardarBest(G.best); }
          actualizarHUD();
          break;
        }
      }
    }

    G.cdDisparo -= dt;
    if (G.cdDisparo <= 0 && vivos > 0) {
      G.cdDisparo = Math.max(.35, 1.1 - G.wave * 0.08);
      const candidatos = G.invaders.filter((i) => i.alive);
      const inv = candidatos[Math.floor(Math.random() * candidatos.length)];
      G.balasEnemigas.push({ x: inv.x + INV_W / 2, y: inv.y + INV_H });
    }
    for (let i = G.balasEnemigas.length - 1; i >= 0; i--) {
      const b = G.balasEnemigas[i];
      b.y += 220 * dt;
      if (b.y > H) { G.balasEnemigas.splice(i, 1); continue; }
      if (b.x > G.ship.x && b.x < G.ship.x + G.ship.w && b.y > G.ship.y && b.y < G.ship.y + G.ship.h) {
        G.balasEnemigas.splice(i, 1);
        G.lives--;
        actualizarHUD();
        if (G.lives <= 0) { finJuego("GAME OVER"); return; }
      }
    }
  }

  function finJuego(msg) {
    G.over = true;
    if (G.score > G.best) { G.best = G.score; guardarBest(G.best); actualizarHUD(); }
    el.state.textContent = msg + " · PULSA ESPACIO PARA REINTENTAR";
  }

  function loop(t) {
    if (!G.activo) return;
    const dt = Math.min(.05, (t - G.ult) / 1000 || 0);
    G.ult = t;
    update(dt);
    render();
    G.raf = requestAnimationFrame(loop);
  }

  function abrir() {
    leerColores();
    G.best = leerBest();
    reiniciar();
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    G.activo = true; G.ult = performance.now();
    G.raf = requestAnimationFrame(loop);
    if (btnCerrar) btnCerrar.focus();
  }
  function cerrar() {
    G.activo = false;
    if (G.raf) cancelAnimationFrame(G.raf);
    modal.hidden = true;
    document.body.style.overflow = "";
    btnAlien.focus();
  }

  window.addEventListener("keydown", (e) => {
    if (G.activo && G.over && e.key === " ") { e.preventDefault(); reiniciar(); }
  });

  btnAlien.addEventListener("click", abrir);
  if (btnCerrar) btnCerrar.addEventListener("click", cerrar);
  modal.addEventListener("click", (e) => { if (e.target === modal) cerrar(); });
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
})();
/* ====== WIDGET TIEMPO (WeatherAPI) ====== */
(function () {
  const API_KEY = "dc56c1f9dcdb46549c0130913260810";       // ← pega la que te dio weatherapi.com
  const CIUDAD_INICIAL = "jativa";   // ← tu ciudad por defecto
  const cont = document.getElementById("weather");
  const form = document.getElementById("weather-form");
  if (!cont || !form) return;

  const input = document.getElementById("weather-city");

  function renderError(msg) {
    cont.innerHTML = '<p class="weather__error">✖ ' + msg + '</p>';
  }

  function render(data) {
    const loc = data.location;
    const c = data.current;
    cont.innerHTML =
      '<div class="weather__grid">' +
        '<img class="weather__icon" src="https:' + c.condition.icon + '" alt="' + c.condition.text + '">' +
        '<div>' +
          '<h3 class="weather__city">' + loc.name + ', ' + loc.country + '</h3>' +
          '<p class="weather__cond">' + c.condition.text + '</p>' +
          '<p class="weather__temp">' + c.temp_c + '<small>°C</small></p>' +
        '</div>' +
      '</div>' +
      '<div class="weather__meta">' +
        '<span>Humedad <b>' + c.humidity + '%</b></span>' +
        '<span>Viento <b>' + c.wind_kph + ' km/h</b></span>' +
        '<span>Sensación <b>' + c.feelslike_c + '°C</b></span>' +
        '<span>Actualizado <b>' + c.last_updated + '</b></span>' +
      '</div>';
  }

  async function cargar(ciudad) {
    cont.innerHTML = '<p class="weather__loading">Cargando…</p>';
    try {
      const url = "https://api.weatherapi.com/v1/current.json?key=" + API_KEY + "&q=" + encodeURIComponent(ciudad) + "&lang=es";
      const r = await fetch(url);
      if (!r.ok) throw new Error("HTTP " + r.status);
      const data = await r.json();
      render(data);
    } catch (e) {
      renderError("No se pudo cargar el tiempo. Revisa la API key o la ciudad.");
      console.error(e);
    }
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const ciudad = input.value.trim();
    if (ciudad) cargar(ciudad);
  });

  cargar(CIUDAD_INICIAL);
})();