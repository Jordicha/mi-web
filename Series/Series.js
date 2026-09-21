// script.js

// Actualiza el año del footer
const anio = document.getElementById("anio");
if (anio) {
  anio.textContent = new Date().getFullYear();
}

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