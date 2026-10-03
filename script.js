/* =========================================================
   HUELLITAS PREMIUM - Lógica de la página
   ========================================================= */

// Espera a que todo el HTML esté cargado antes de ejecutar el código
document.addEventListener('DOMContentLoaded', () => {
  iniciarMenuHamburguesa();
  iniciarScrollSuave();
  iniciarAnimacionesScroll();
  iniciarValidacionFormulario();
  iniciarImagenesRespaldo();
  document.getElementById('year').textContent = new Date().getFullYear();
});

/* ---------------------------------------------------------
   1. MENÚ HAMBURGUESA (móvil) y sombra de la barra
--------------------------------------------------------- */
function iniciarMenuHamburguesa() {
  const boton = document.getElementById('hamburger');
  const menu = document.getElementById('nav-menu');
  const navbar = document.getElementById('navbar');

  // Abre o cierra el menú al tocar el botón
  boton.addEventListener('click', () => {
    const abierto = menu.classList.toggle('open');
    boton.classList.toggle('open', abierto);
    boton.setAttribute('aria-expanded', abierto);
    boton.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
  });

  // Cierra el menú al elegir un enlace
  menu.querySelectorAll('a').forEach((enlace) => {
    enlace.addEventListener('click', cerrarMenu);
  });

  function cerrarMenu() {
    menu.classList.remove('open');
    boton.classList.remove('open');
    boton.setAttribute('aria-expanded', 'false');
    boton.setAttribute('aria-label', 'Abrir menú');
  }

  // Agrega sombra a la barra cuando se hace scroll
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 10);
  });
}

/* ---------------------------------------------------------
   2. SCROLL SUAVE + enlace activo según la sección visible
--------------------------------------------------------- */
function iniciarScrollSuave() {
  const enlaces = document.querySelectorAll('a[href^="#"]');
  const alturaNav = document.getElementById('navbar').offsetHeight;

  enlaces.forEach((enlace) => {
    enlace.addEventListener('click', (evento) => {
      const destino = document.querySelector(enlace.getAttribute('href'));
      if (!destino) return;               // Enlaces vacíos como href="#"

      evento.preventDefault();
      // Resta la altura de la barra fija para que no tape el título
      const posicion = destino.getBoundingClientRect().top + window.scrollY - alturaNav + 1;
      window.scrollTo({ top: posicion, behavior: 'smooth' });
    });
  });

  // Marca como activo el enlace de la sección que se está viendo
  const secciones = document.querySelectorAll('main section[id]');
  const linksNav = document.querySelectorAll('.nav-link');

  const observador = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        if (entrada.isIntersecting) {
          linksNav.forEach((link) => {
            link.classList.toggle('active', link.getAttribute('href') === `#${entrada.target.id}`);
          });
        }
      });
    },
    { rootMargin: '-45% 0px -50% 0px' }   // Detecta la sección en el centro de la pantalla
  );

  secciones.forEach((seccion) => observador.observe(seccion));
}

/* ---------------------------------------------------------
   3. ANIMACIONES AL HACER SCROLL
--------------------------------------------------------- */
function iniciarAnimacionesScroll() {
  const elementos = document.querySelectorAll('.reveal');

  // Si el navegador es muy antiguo, muestra todo sin animar
  if (!('IntersectionObserver' in window)) {
    elementos.forEach((el) => el.classList.add('visible'));
    return;
  }

  const observador = new IntersectionObserver(
    (entradas, obs) => {
      entradas.forEach((entrada) => {
        if (entrada.isIntersecting) {
          entrada.target.classList.add('visible');
          obs.unobserve(entrada.target);   // Anima solo la primera vez
        }
      });
    },
    { threshold: 0.15 }
  );

  // Pequeño retraso escalonado entre tarjetas de una misma fila
  elementos.forEach((el, indice) => {
    el.style.transitionDelay = `${(indice % 4) * 0.1}s`;
    observador.observe(el);
  });
}

/* ---------------------------------------------------------
   4. VALIDACIÓN DEL FORMULARIO
--------------------------------------------------------- */
function iniciarValidacionFormulario() {
  const formulario = document.getElementById('contact-form');
  const exito = document.getElementById('form-success');

  const campos = {
    nombre: document.getElementById('nombre'),
    correo: document.getElementById('correo'),
    mensaje: document.getElementById('mensaje'),
  };

  // Expresión regular sencilla para validar correos
  const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  // Devuelve el texto del error, o "" si el campo es válido
  function obtenerError(nombreCampo, valor) {
    valor = valor.trim();

    if (nombreCampo === 'nombre') {
      if (valor === '') return 'Por favor escribe tu nombre.';
      if (valor.length < 2) return 'El nombre debe tener al menos 2 caracteres.';
    }
    if (nombreCampo === 'correo') {
      if (valor === '') return 'Por favor escribe tu correo.';
      if (!regexCorreo.test(valor)) return 'Ingresa un correo válido (ej. nombre@correo.com).';
    }
    if (nombreCampo === 'mensaje') {
      if (valor === '') return 'Por favor escribe tu mensaje.';
      if (valor.length < 10) return 'El mensaje debe tener al menos 10 caracteres.';
    }
    return '';
  }

  // Valida un campo y muestra u oculta su mensaje de error
  function validarCampo(nombreCampo) {
    const campo = campos[nombreCampo];
    const textoError = obtenerError(nombreCampo, campo.value);

    document.getElementById(`error-${nombreCampo}`).textContent = textoError;
    campo.classList.toggle('invalid', textoError !== '');
    campo.classList.toggle('valid', textoError === '');
    return textoError === '';
  }

  // Validación en tiempo real: al salir del campo y mientras corrige
  Object.keys(campos).forEach((nombreCampo) => {
    campos[nombreCampo].addEventListener('blur', () => validarCampo(nombreCampo));
    campos[nombreCampo].addEventListener('input', () => {
      if (campos[nombreCampo].classList.contains('invalid')) validarCampo(nombreCampo);
    });
  });

  // Al enviar el formulario
  formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();
    exito.hidden = true;

    // Valida todos los campos (sin cortar en el primero que falle)
    const resultados = Object.keys(campos).map(validarCampo);
    const todoValido = resultados.every(Boolean);

    if (!todoValido) {
      // Lleva el cursor al primer campo con error
      const primerError = formulario.querySelector('.invalid');
      if (primerError) primerError.focus();
      return;
    }

    // Aquí normalmente se enviarían los datos a un servidor.
    // Como es un proyecto de práctica, solo mostramos la confirmación.
    const nombre = campos.nombre.value.trim().split(' ')[0];
    exito.textContent = `¡Gracias, ${nombre}! 🐶 Recibimos tu mensaje y te responderemos muy pronto.`;
    exito.hidden = false;

    formulario.reset();
    Object.values(campos).forEach((campo) => campo.classList.remove('valid', 'invalid'));

    // Oculta la confirmación después de 8 segundos
    setTimeout(() => { exito.hidden = true; }, 8000);
  });
}

/* ---------------------------------------------------------
   5. IMAGEN DE RESPALDO
   Si alguna foto de Unsplash no carga, se muestra un
   placeholder para que la página nunca se vea rota.
--------------------------------------------------------- */
function iniciarImagenesRespaldo() {
  document.querySelectorAll('img').forEach((img) => {
    img.addEventListener('error', () => {
      img.onerror = null;   // Evita un bucle infinito
      img.src = 'https://placehold.co/700x500/fdebd2/4a2c17?text=Huellitas+Premium';
    });
  });
}