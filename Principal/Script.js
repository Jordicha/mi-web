// script.js

/* ====== CONFIG ====== */
// Pega aquí tu endpoint de Formspree (mismo que la action del formulario).
// Si lo dejas vacío, el script usará la action del propio <form>.
const FORM_ENDPOINT = ""; // ej: "https://formspree.io/f/abcde"

/* ====== AÑO DEL FOOTER ====== */
const anio = document.getElementById("anio");
if (anio) {
  anio.textContent = new Date().getFullYear();
}

/* ====== MÁQUINA DE ESCRIBIR ====== */
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

/* ====== REVELADO AL SCROLL ====== */
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
    { threshold: 0.15 }
  );

  secciones.forEach((seccion) => observer.observe(seccion));
} else {
  secciones.forEach((seccion) => seccion.classList.add("visible"));
}

/* ====== ENLACE ACTIVO EN EL MENÚ ====== */
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

/* ====== FILTRO DE SERIES ====== */
const filtros = document.querySelectorAll(".filter");
const tarjetas = document.querySelectorAll(".card");

filtros.forEach((boton) => {
  boton.addEventListener("click", () => {
    const filtro = boton.dataset.filter;

    filtros.forEach((b) => b.classList.remove("filter--active"));
    boton.classList.add("filter--active");

    tarjetas.forEach((tarjeta) => {
      const coincide = filtro === "all" || tarjeta.dataset.genero === filtro;
      tarjeta.classList.toggle("oculta", !coincide);
    });
  });
});

/* ====== ENVÍO DEL FORMULARIO ====== */
const formulario = document.getElementById("form-contacto");

if (formulario) {
  const estado = document.getElementById("form-status");
  const boton = document.getElementById("btn-enviar");
  const endpoint = FORM_ENDPOINT || formulario.getAttribute("action");

  const escribirEstado = (mensaje, tipo) => {
    if (!estado) return;
    estado.textContent = mensaje;
    estado.classList.remove("ok", "error");
    if (tipo) estado.classList.add(tipo);
  };

  formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    // Validación HTML5
    if (!formulario.checkValidity()) {
      formulario.reportValidity();
      return;
    }

    // Recogemos los datos del formulario
    const datos = Object.fromEntries(new FormData(formulario).entries());

    // Estado "enviando"
    if (boton) {
      boton.disabled = true;
      boton.textContent = "Enviando...";
    }
    escribirEstado("Enviando mensaje...", null);

    try {
      const respuesta = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(datos)
      });

      if (respuesta.ok) {
        escribirEstado("✔ Mensaje enviado. ¡Gracias!", "ok");
        formulario.reset();
      } else {
        escribirEstado("✖ No se pudo enviar. Inténtalo de nuevo.", "error");
      }
    } catch (error) {
      escribirEstado("✖ Error de conexión. Inténtalo de nuevo.", "error");
    } finally {
      if (boton) {
        boton.disabled = false;
        boton.textContent = "Enviar mensaje";
      }
    }
  });
}