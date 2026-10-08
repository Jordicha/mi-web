// script.js

// Actualiza el año del footer
const anio = document.getElementById("anio");
if (anio) {
  anio.textContent = new Date().getFullYear();
}
/* ====== MODO CLARO / OSCURO (delegación: vale para index y series) ====== */
function leerTema() {
  try {
    let t = localStorage.getItem("theme");
    if (!t) t = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    return t;
  } catch (e) { return "dark"; }
}
function pintarBotonTema(tema) {
  document.querySelectorAll("#theme-toggle").forEach((b) => {
    const claro = tema === "light";
    b.setAttribute("aria-pressed", String(claro));
    const i = b.querySelector(".theme-toggle__icon");
    const l = b.querySelector(".theme-toggle__label");
    if (i) i.textContent = claro ? "☾" : "☀";
    if (l) l.textContent = claro ? "Oscuro" : "Luz";
  });
}
function aplicarTema(tema) {
  document.documentElement.setAttribute("data-theme", tema);
  pintarBotonTema(tema);
}
aplicarTema(leerTema());
document.addEventListener("click", (e) => {
  const b = e.target.closest("#theme-toggle");
  if (!b) return;
  const actual = document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
  const nuevo = actual === "light" ? "dark" : "light";
  try { localStorage.setItem("theme", nuevo); } catch (err) {}
  aplicarTema(nuevo);
});
// Efecto de máquina de escribir en la frase de la cabecera
const frase = document.querySelector(".hero__phrase");

if (frase) {
  const texto = frase.dataset.text || frase.textContent.trim();
  const reducirMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reducirMovimiento) {
    frase.textContent = texto;
  } else {
    frase.textContent = "";
    let i = 0;

    const escribir = () => {
      if (i <= texto.length) {
        frase.textContent = texto.slice(0, i);
        i++;
        setTimeout(escribir, 35);
      }
    };

    escribir();
  }
}

// Muestra las secciones al hacer scroll
const secciones = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    },
    {
      threshold: 0.15
    }
  );

  secciones.forEach((seccion) => observer.observe(seccion));
} else {
  secciones.forEach((seccion) => seccion.classList.add("visible"));
}

// Resalta el enlace activo según la sección visible
const enlaces = Array.from(document.querySelectorAll(".hero__nav a"));
const objetivos = enlaces
  .map((enlace) => document.querySelector(enlace.getAttribute("href")))
  .filter(Boolean);

const actualizarEnlaceActivo = () => {
  const posicion = window.scrollY + window.innerHeight / 3;
  let activo = objetivos[0]?.id || null;

  objetivos.forEach((seccion) => {
    if (seccion.offsetTop <= posicion) {
      activo = seccion.id;
    }
  });

  enlaces.forEach((enlace) => {
    enlace.classList.toggle("activo", enlace.getAttribute("href") === `#${activo}`);
  });
};

window.addEventListener("scroll", actualizarEnlaceActivo);
actualizarEnlaceActivo();

// Filtro de series
const filtros = document.querySelectorAll(".filter");
const tarjetas = document.querySelectorAll(".card");

filtros.forEach((boton) => {
  boton.addEventListener("click", () => {
    const filtro = boton.dataset.filter;

    // Cambia el botón activo
    filtros.forEach((b) => b.classList.remove("filter--active"));
    boton.classList.add("filter--active");

    // Muestra u oculta tarjetas
    tarjetas.forEach((tarjeta) => {
      const coincide =
        filtro === "all" ||
        tarjeta.dataset.genero === filtro;

      tarjeta.classList.toggle("oculta", !coincide);
    });
  });
});
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