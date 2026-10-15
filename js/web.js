/* ==================================================
   KARATE PARA LOS ENANOS · LÓGICA PRINCIPAL (index.html)
   Basado en la web de Mystica (web/js/web.js).

   1. Bienvenida: las imágenes del marco se turnan cada PORTADA_SEGUNDOS.
   2. Ventanas internas: cada bloque con data-ventana="historia|cuerpo|posiciones|
      tecnicas|calentamiento|tarjetas|quiz" abre su página de paginas/ dentro de la web,
      "creciendo" desde lo que se tocó. La dirección cambia (index.html#posiciones)
      para compartir o dejar marcada una sección.
   3. Posiciones: las tarjetas se arman con POSICIONES (js/datos.js) y cada una se
      abre en grande en el visor (flechas, teclado o deslizando el dedo).
   4. Pestañas ([data-pestanas]) y lupa: cualquier [data-ampliar] muestra su imagen en grande.

   Los juegos (tarjetas y quiz) están en js/practica.js.
   Las páginas de paginas/ se cargan con fetch: abrir index.html con Live Server
   o desde la web publicada (con doble clic el navegador no las carga).
   ================================================== */

const PORTADA_SEGUNDOS = 6;

const VENTANAS = {
    historia:   { titulo: 'Historia del Karate', icono: 'bi-hourglass-split', color: '#EF4B57', pagina: 'paginas/historia.html' },
    cuerpo:     { titulo: 'Partes del cuerpo', icono: 'bi-person-arms-up', color: '#FF9A1F', pagina: 'paginas/cuerpo.html' },
    posiciones: { titulo: 'Posiciones (dachi)', icono: 'bi-person-standing', color: '#FFC933', pagina: 'paginas/posiciones.html' },
    tecnicas:   { titulo: 'Técnicas y conceptos', icono: 'bi-lightning-charge-fill', color: '#1DBA82', pagina: 'paginas/tecnicas.html' },
    calentamiento: { titulo: 'Calentamiento', icono: 'bi-fire', color: '#F7648A', pagina: 'paginas/calentamiento.html' },
    tarjetas:   { titulo: 'Tarjetas de memoria', icono: 'bi-layers-fill', color: '#3A9BF0', pagina: 'paginas/tarjetas.html' },
    quiz:       { titulo: 'Quiz del dojo', icono: 'bi-patch-question-fill', color: '#9152FA', pagina: 'paginas/quiz.html' },
};

const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ==================================================
   1. BIENVENIDA: IMÁGENES QUE SE TURNAN
   ================================================== */
(function portada() {
    const imagenes = [...document.querySelectorAll('.portada-imagen')];
    const puntos = document.getElementById('portadaPuntos');
    if (!imagenes.length || !puntos) return;
    let actual = 0;
    let temporizador = null;

    const botones = imagenes.map((_, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('aria-label', `Imagen ${i + 1}`);
        b.addEventListener('click', () => { mostrar(i); reiniciar(); });
        puntos.appendChild(b);
        return b;
    });

    function mostrar(i) {
        actual = (i + imagenes.length) % imagenes.length;
        imagenes.forEach((img, n) => img.classList.toggle('activa', n === actual));
        botones.forEach((b, n) => b.classList.toggle('activo', n === actual));
    }

    function reiniciar() {
        clearInterval(temporizador);
        if (!sinMovimiento) temporizador = setInterval(() => mostrar(actual + 1), PORTADA_SEGUNDOS * 1000);
    }

    // Con la pestaña oculta no se gasta en animar
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) clearInterval(temporizador);
        else reiniciar();
    });

    mostrar(0);
    reiniciar();
})();

/* ==================================================
   MENÚ EN CELULAR Y AÑO DEL PIE
   ================================================== */
const menu = document.getElementById('menu');
const menuBoton = document.getElementById('menuBoton');
menuBoton.addEventListener('click', () => {
    const abrir = !menu.classList.contains('abierto');
    menu.classList.toggle('abierto', abrir);
    menuBoton.setAttribute('aria-expanded', String(abrir));
});
menu.addEventListener('click', (e) => {
    if (e.target.closest('a, button')) {
        menu.classList.remove('abierto');
        menuBoton.setAttribute('aria-expanded', 'false');
    }
});
document.getElementById('anio').textContent = new Date().getFullYear();

/* ==================================================
   2. VENTANAS INTERNAS
   ================================================== */
const ventana = document.getElementById('ventana');
const panel = document.getElementById('ventanaPanel');
const cuerpo = document.getElementById('ventanaCuerpo');
const tituloVentana = document.getElementById('ventanaTitulo');

const paginasCargadas = {};  // nombre -> <div> con su contenido (se conserva al cerrar)
let ventanaActual = null;    // nombre de la ventana abierta
let origenActual = null;     // elemento desde el que se abrió (para volver a él al cerrar)
let focoAnterior = null;

// Transformación que lleva el panel al tamaño y lugar del elemento tocado
function transformacionDesde(origen) {
    const fin = panel.getBoundingClientRect();
    const ini = origen && origen.isConnected ? origen.getBoundingClientRect() : null;
    if (!ini || !ini.width || !ini.height || !fin.width) return 'translateY(2rem) scale(0.92)';
    return `translate(${ini.left - fin.left}px, ${ini.top - fin.top}px) scale(${ini.width / fin.width}, ${ini.height / fin.height})`;
}

async function contenidoDe(nombre) {
    if (paginasCargadas[nombre]) return paginasCargadas[nombre];
    const datos = VENTANAS[nombre];
    const caja = document.createElement('div');
    try {
        const respuesta = await fetch(datos.pagina);
        if (!respuesta.ok) throw new Error(respuesta.status);
        caja.innerHTML = await respuesta.text();
        prepararPagina(nombre, caja);
    } catch (err) {
        console.error(`No se pudo cargar ${datos.pagina}:`, err);
        caja.innerHTML = '<div class="ventana-cargando"><p><i class="bi bi-emoji-dizzy" style="font-size:2.5rem"></i><br>No se pudo cargar esta sección.<br>Abre la página con Live Server o desde la web publicada.</p></div>';
        return caja; // no se guarda: se reintenta la próxima vez
    }
    paginasCargadas[nombre] = caja;
    return caja;
}

// Avisa a la página que se deja de ver (por si un juego necesita detenerse)
function avisarSalida(nombre) {
    const caja = paginasCargadas[nombre];
    if (caja) caja.dispatchEvent(new CustomEvent('ventana-salir'));
}

async function abrirVentana(nombre, origen = null, opciones = {}) {
    const datos = VENTANAS[nombre];
    if (!datos) return;

    // Ya abierta otra: se cambia el contenido sin cerrar
    const yaAbierta = !ventana.hidden;
    if (!yaAbierta) {
        focoAnterior = document.activeElement;
        origenActual = origen;
    } else if (ventanaActual && ventanaActual !== nombre) {
        avisarSalida(ventanaActual);
    }
    ventanaActual = nombre;

    tituloVentana.innerHTML = `<i class="bi ${datos.icono}"></i>`;
    tituloVentana.append(datos.titulo);
    panel.querySelector('.ventana-barra').style.setProperty('--color', datos.color);
    const guardada = paginasCargadas[nombre];
    if (!guardada || guardada.parentNode !== cuerpo) {
        cuerpo.replaceChildren(guardada || Object.assign(document.createElement('div'), { className: 'ventana-cargando', textContent: 'Cargando...' }));
        cuerpo.scrollTop = 0;
    }
    history.replaceState(null, '', `#${nombre}`);
    document.body.classList.add('con-ventana');

    if (!yaAbierta) {
        ventana.hidden = false;
        // Animación: el panel crece desde el elemento tocado
        panel.style.transition = 'none';
        panel.style.transform = sinMovimiento ? 'none' : transformacionDesde(origen);
        panel.style.opacity = '0.3';
        void panel.offsetWidth;
        panel.style.transition = 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.35s ease';
        panel.style.transform = 'none';
        panel.style.opacity = '1';
        ventana.classList.add('abierta');
        ventana.querySelector('.ventana-cerrar').focus();
    }

    const contenido = await contenidoDe(nombre);
    if (ventanaActual !== nombre) return; // ya pidió otra
    if (contenido.parentNode !== cuerpo) cuerpo.replaceChildren(contenido);
    // Barra "quién está jugando" de los juegos (js/perfiles.js)
    if (contenido.querySelector('[data-jugador]') && typeof Perfiles !== 'undefined') Perfiles.pintarJugadores();
    if (nombre === 'posiciones') filtrarProductos(contenido, opciones.filtro || null);
    contenido.dispatchEvent(new CustomEvent('ventana-entrar', { detail: opciones }));
}

function cerrarVentana() {
    if (ventana.hidden) return;
    cerrarVisor(true);
    avisarSalida(ventanaActual);
    ventana.classList.remove('abierta');
    panel.style.transition = 'transform 0.38s cubic-bezier(0.4, 0, 0.6, 1), opacity 0.3s ease';
    panel.style.transform = sinMovimiento ? 'none' : transformacionDesde(origenActual);
    panel.style.opacity = '0';
    const terminar = () => {
        ventana.hidden = true; // el contenido se queda: al reabrir la misma ventana sigue igual
        document.body.classList.remove('con-ventana');
        ventanaActual = null;
        if (focoAnterior && focoAnterior.focus) focoAnterior.focus();
    };
    if (sinMovimiento) terminar();
    else setTimeout(terminar, 380);
    history.replaceState(null, '', location.pathname + location.search);
}

// Cualquier [data-ventana] abre la suya (delegado: sirve también dentro de las páginas cargadas)
document.addEventListener('click', (e) => {
    const disparador = e.target.closest('[data-ventana]');
    if (disparador) {
        e.preventDefault();
        cerrarVisor(true); // ej. "Repasar en tarjetas" dentro del visor
        // Los demás data-* del botón llegan a la página (filtro, tema, posicion...)
        abrirVentana(disparador.dataset.ventana, disparador, { ...disparador.dataset });
        return;
    }
    if (e.target.closest('[data-cerrar]')) cerrarVentana();
});

// El foco no se sale de la ventana con Tab; Escape cierra
document.addEventListener('keydown', (e) => {
    if (!visor.hidden || !lupa.hidden) return; // el visor y la lupa manejan su teclado
    if (ventana.hidden) return;
    if (e.key === 'Escape') { cerrarVentana(); return; }
    if (e.key !== 'Tab') return;
    const enfocables = [...panel.querySelectorAll('a[href], button:not([disabled]), input, select, textarea, summary, [tabindex]:not([tabindex="-1"])')]
        .filter((el) => el.offsetParent !== null);
    if (!enfocables.length) return;
    const primero = enfocables[0];
    const ultimo = enfocables[enfocables.length - 1];
    if (e.shiftKey && document.activeElement === primero) { e.preventDefault(); ultimo.focus(); }
    else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primero.focus(); }
});

// Al llegar con index.html#posiciones (enlace compartido) se abre esa ventana
window.addEventListener('DOMContentLoaded', () => {
    const pedida = location.hash.slice(1);
    if (VENTANAS[pedida]) abrirVentana(pedida);
});

// Lo propio de cada página al cargarla por primera vez
function prepararPagina(nombre, caja) {
    prepararPestanas(caja);
    llenarVocabulario(caja);
    if (nombre === 'posiciones') prepararPosiciones(caja);
    if (nombre === 'tecnicas') prepararTecnicas(caja);
    // Juegos: js/practica.js
    if (window.Practica && Practica[nombre]) Practica[nombre](caja);
}

/* ==================================================
   PESTAÑAS: <div class="pestanas" data-pestanas> con botones data-pestana="x"
   y paneles <div class="pestana-panel" data-panel="x">
   ================================================== */
function prepararPestanas(caja) {
    caja.querySelectorAll('[data-pestanas]').forEach((barra) => {
        const paneles = [...barra.parentElement.querySelectorAll(':scope > .pestana-panel')];
        const mostrar = (cual) => {
            barra.querySelectorAll('button').forEach((b) => b.classList.toggle('activo', b.dataset.pestana === cual));
            paneles.forEach((p) => { p.hidden = p.dataset.panel !== cual; });
        };
        barra.addEventListener('click', (e) => {
            const b = e.target.closest('button[data-pestana]');
            if (b) mostrar(b.dataset.pestana);
        });
        mostrar(barra.querySelector('button').dataset.pestana);
    });
    // Un botón con data-ir-pestana="x" (dentro de la página) cambia a esa pestaña
    caja.addEventListener('click', (e) => {
        const ir = e.target.closest('[data-ir-pestana]');
        if (!ir) return;
        const destino = caja.querySelector(`[data-pestanas] button[data-pestana="${ir.dataset.irPestana}"]`);
        if (destino) { destino.click(); destino.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
    });
}

// Tablas <tbody data-vocabulario="cuerpo|mano|pie|conceptos"> se llenan con js/datos.js
function llenarVocabulario(caja) {
    caja.querySelectorAll('[data-vocabulario]').forEach((tbody) => {
        const tema = VOCABULARIO[tbody.dataset.vocabulario];
        if (!tema) return;
        tbody.innerHTML = tema.palabras.map(([jp, kanji, es]) =>
            `<tr><td>${escapar(jp)}</td><td class="kanji" lang="ja">${escapar(kanji)}</td><td>${escapar(es)}</td></tr>`).join('');
    });
}

/* ==================================================
   3. POSICIONES: TARJETAS ARMADAS CON js/datos.js
   ================================================== */
function escapar(t) { return String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

function detallePosicion(p) {
    const lista = (items) => items.map((t) => `<li>${escapar(t)}</li>`).join('');
    return `
        <div class="ficha">
            <div class="peso"><small>Peso (adelante/atrás)</small><strong>${escapar(p.peso)}</strong></div>
            <div><small>Pies</small><strong>${escapar(p.pies)}</strong></div>
            <div><small>Rodillas</small><strong>${escapar(p.rodillas)}</strong></div>
            <div><small>Para qué sirve</small><strong>${escapar(p.uso)}</strong></div>
            <div><small>Kata</small><strong>${escapar(p.kata)}</strong></div>
        </div>
        ${p.significado ? `<h4><i class="bi bi-translate"></i> Qué significa</h4><p>${escapar(p.significado)}</p>` : ''}
        ${p.medidas ? `<h4><i class="bi bi-rulers"></i> Medidas</h4><ul>${lista(p.medidas)}</ul>` : ''}
        <h4><i class="bi bi-list-ol"></i> Cómo se hace</h4>
        <ol>${lista(p.pasos)}</ol>
        ${p.tension ? `<h4><i class="bi bi-arrows-move"></i> Tensión</h4><p>${escapar(p.tension)}</p>` : ''}
        <h4><i class="bi bi-bullseye"></i> Para qué se usa</h4>
        <p>${escapar(p.aplicacion)}</p>
        ${p.errores ? `<h4><i class="bi bi-exclamation-triangle"></i> Errores comunes</h4><ul class="errores">${lista(p.errores)}</ul>` : ''}
        ${p.nota ? `<p><em>${escapar(p.nota)}</em></p>` : ''}
        <button type="button" class="boton boton-azul visor-boton-repasar" data-ventana="tarjetas" data-tema="posiciones">
            <i class="bi bi-layers-fill"></i> Repasar posiciones en tarjetas
        </button>`;
}

// Arma las tarjetas de una lista (POSICIONES o DEFENSAS) dentro de "rejilla" y las conecta
// con sus filtros (.filtros dentro de "zona") y con el visor.
//   grupoDe(item) -> clave del filtro · etiquetaDe(clave) -> texto de la etiqueta · detalleDe(item) -> HTML del visor
function pintarTarjetas(zona, rejilla, lista, { grupoDe, etiquetaDe, detalleDe }) {
    rejilla.innerHTML = lista.map((p) => {
        const grupo = grupoDe(p);
        const largo = [...p.kanji].length > 3 ? ' kanji-largo' : ''; // ej. 上段揚げ受け: letra más chica
        return `
        <article class="producto" data-segmentos="${grupo}" data-kanji="${escapar(p.kanji)}" data-traduccion="${escapar(p.traduccion)}">
            ${p.img
                ? `<figure class="producto-foto"><img src="${p.img}" alt="${escapar(p.nombre)}" loading="lazy"></figure>`
                : `<div class="producto-foto sin-imagen${largo}" lang="ja">${escapar(p.kanji)}</div>`}
            <span class="producto-icono"><i class="bi ${p.icono}"></i></span>
            <h3>${escapar(p.nombre)}</h3>
            <span class="producto-kanji" lang="ja">${escapar(p.kanji)} · ${escapar(p.traduccion)}</span>
            <p class="producto-frase">${escapar(p.frase)}</p>
            <div class="segmentos"><span class="segmento ${grupo}">${escapar(etiquetaDe(grupo))}</span></div>
            <span class="producto-ver">Ver cómo se hace <i class="bi bi-arrow-right"></i></span>
            <div class="producto-detalle">${detalleDe(p)}</div>
        </article>`;
    }).join('');

    const filtros = zona.querySelector('.filtros');
    if (filtros) {
        filtros.addEventListener('click', (e) => {
            const b = e.target.closest('button[data-segmento]');
            if (b) filtrarProductos(zona, b.dataset.segmento === 'todos' ? null : b.dataset.segmento);
        });
    }
    rejilla.querySelectorAll('.producto').forEach((p) => {
        p.tabIndex = 0;
        p.setAttribute('role', 'button');
        p.addEventListener('click', () => abrirProducto(zona, p));
        p.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abrirProducto(zona, p); }
        });
    });
}

function prepararPosiciones(caja) {
    pintarTarjetas(caja, caja.querySelector('#rejillaPosiciones'), POSICIONES, {
        grupoDe: (p) => p.grupo,
        etiquetaDe: (g) => GRUPOS_POSICIONES[g].nombre,
        detalleDe: detallePosicion,
    });

    const resumen = caja.querySelector('#tablaResumen');
    if (resumen) {
        resumen.innerHTML = POSICIONES.map((p) => `<tr>
            <td>${escapar(p.nombre)}</td><td>${escapar(p.peso)}</td><td>${escapar(p.pies)}</td>
            <td>${escapar(p.rodillas)}</td><td>${escapar(p.uso)}</td><td>${escapar(p.kata)}</td></tr>`).join('');
    }
}

/* ==================================================
   TÉCNICAS: BLOQUEOS Y CONTRAATAQUES (DEFENSAS de js/datos.js)
   ================================================== */
function detalleDefensa(d) {
    const lista = (items) => items.map((t) => `<li>${escapar(t)}</li>`).join('');
    return `
        <div class="ficha">
            <div><small>Posición</small><strong>${escapar(d.posicion)}</strong></div>
            <div><small>Nivel</small><strong>${escapar(d.nivel)}</strong></div>
            <div><small>Con qué parte</small><strong>${escapar(d.superficie)}</strong></div>
            <div><small>${d.tipo === 'bloqueo' ? 'Sirve contra' : 'El compañero ataca con'}</small><strong>${escapar(d.contra)}</strong></div>
        </div>
        <h4><i class="bi bi-list-ol"></i> ${d.tipo === 'bloqueo' ? 'Cómo se hace' : 'Paso a paso'}</h4>
        <ol>${lista(d.pasos)}</ol>
        <h4><i class="bi bi-lightbulb"></i> Claves</h4>
        <ul>${lista(d.claves)}</ul>
        <h4><i class="bi bi-exclamation-triangle"></i> Errores comunes</h4>
        <ul class="errores">${lista(d.errores)}</ul>
        <button type="button" class="boton boton-azul visor-boton-repasar" data-ventana="tarjetas" data-tema="tecnicas">
            <i class="bi bi-layers-fill"></i> Repasar técnicas en tarjetas
        </button>`;
}

function prepararTecnicas(caja) {
    const zona = caja.querySelector('#zonaDefensas');
    if (!zona) return;
    pintarTarjetas(zona, zona.querySelector('#rejillaDefensas'), DEFENSAS, {
        grupoDe: (d) => d.tipo,
        etiquetaDe: (t) => TIPOS_DEFENSA[t].nombre,
        detalleDe: detalleDefensa,
    });
}

function filtrarProductos(caja, segmento) {
    caja.querySelectorAll('.filtros button').forEach((b) =>
        b.classList.toggle('activo', (b.dataset.segmento === 'todos' && !segmento) || b.dataset.segmento === segmento));
    let n = 0;
    caja.querySelectorAll('.producto').forEach((p) => {
        const visible = !segmento || (p.dataset.segmentos || '').split(' ').includes(segmento);
        p.hidden = !visible;
        if (visible) {
            // Entran uno detrás de otro, como fotos que se acomodan
            p.style.animation = 'none';
            void p.offsetWidth;
            p.style.animation = '';
            p.style.animationDelay = `${Math.min(n, 12) * 0.04}s`;
            n++;
        }
    });
}

function abrirProducto(caja, producto) {
    const visibles = [...caja.querySelectorAll('.producto')].filter((p) => !p.hidden);
    abrirVisor(visibles, visibles.indexOf(producto));
}

/* ==================================================
   VISOR DE POSICIONES (galería)
   ================================================== */
const visor = document.getElementById('visor');
const visorContenido = document.getElementById('visorContenido');
const visorMiniaturas = document.getElementById('visorMiniaturas');
let visorLista = [];
let visorIndice = 0;
let focoVisor = null;

const iconoDe = (p) => (p.querySelector('.producto-icono i') || {}).className || 'bi bi-star';
const imagenDe = (p) => p.querySelector('.producto-foto img');

function abrirVisor(lista, indice) {
    if (!lista.length) return;
    visorLista = lista;
    focoVisor = document.activeElement;
    visorMiniaturas.replaceChildren(...lista.map((p, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.title = p.querySelector('h3').textContent;
        b.setAttribute('aria-label', b.title);
        const img = imagenDe(p);
        if (img) b.appendChild(Object.assign(document.createElement('img'), { src: img.src, alt: '' }));
        else if ([...p.dataset.kanji].length <= 3) b.textContent = p.dataset.kanji;
        else b.innerHTML = `<i class="${iconoDe(p)}"></i>`; // kanji largo: el ícono
        b.addEventListener('click', () => mostrarProducto(i, i > visorIndice ? 1 : -1));
        return b;
    }));
    visor.hidden = false;
    void visor.offsetWidth;
    visor.classList.add('abierto');
    mostrarProducto(Math.max(0, indice), 0);
    document.getElementById('visorSiguiente').focus();
}

function mostrarProducto(i, direccion) {
    visorIndice = (i + visorLista.length) % visorLista.length;
    const p = visorLista[visorIndice];
    document.getElementById('visorIcono').innerHTML = `<i class="${iconoDe(p)}"></i>`;
    document.getElementById('visorTitulo').textContent = p.querySelector('h3').textContent;
    document.getElementById('visorFrase').textContent = (p.querySelector('.producto-frase') || {}).textContent || '';
    document.getElementById('visorContador').textContent = `${visorIndice + 1} / ${visorLista.length}`;
    const detalle = p.querySelector('.producto-detalle');
    const img = imagenDe(p);

    // A un lado la imagen (o el kanji gigante si no tiene) y al otro el detalle
    let lado;
    if (img) {
        lado = Object.assign(document.createElement('button'), { type: 'button', className: 'visor-foto' });
        lado.dataset.ampliar = img.getAttribute('src');
        lado.setAttribute('aria-label', 'Ver imagen en grande');
        lado.append(Object.assign(document.createElement('img'), { src: img.src, alt: img.alt }));
    } else {
        lado = Object.assign(document.createElement('div'), { className: 'visor-kanji' });
        const largo = [...p.dataset.kanji].length > 3 ? ' class="kanji-largo"' : '';
        lado.innerHTML = `<span lang="ja"${largo}>${escapar(p.dataset.kanji)}</span><small>${escapar(p.dataset.traduccion)}</small>`;
    }
    const texto = document.createElement('div');
    texto.innerHTML = detalle ? detalle.innerHTML : '';
    const galeria = Object.assign(document.createElement('div'), { className: 'visor-galeria' });
    galeria.append(lado, texto);
    visorContenido.replaceChildren(galeria);

    visorContenido.scrollTop = 0;
    visorContenido.classList.remove('entra-derecha', 'entra-izquierda');
    void visorContenido.offsetWidth;
    if (direccion > 0) visorContenido.classList.add('entra-derecha');
    if (direccion < 0) visorContenido.classList.add('entra-izquierda');
    [...visorMiniaturas.children].forEach((b, n) => b.classList.toggle('activo', n === visorIndice));
    const activa = visorMiniaturas.children[visorIndice];
    if (activa) activa.scrollIntoView({ block: 'nearest', inline: 'center', behavior: sinMovimiento ? 'auto' : 'smooth' });
}

function cerrarVisor(inmediato = false) {
    if (visor.hidden) return;
    visor.classList.remove('abierto');
    const terminar = () => {
        visor.hidden = true;
        if (focoVisor && focoVisor.focus && !inmediato) focoVisor.focus();
    };
    if (inmediato || sinMovimiento) terminar();
    else setTimeout(terminar, 300);
}

document.getElementById('visorAnterior').addEventListener('click', () => mostrarProducto(visorIndice - 1, -1));
document.getElementById('visorSiguiente').addEventListener('click', () => mostrarProducto(visorIndice + 1, 1));
visor.addEventListener('click', (e) => { if (e.target.closest('[data-cerrar-visor]')) cerrarVisor(); });

document.addEventListener('keydown', (e) => {
    if (visor.hidden || !lupa.hidden) return;
    if (e.key === 'Escape') cerrarVisor();
    if (e.key === 'ArrowRight') mostrarProducto(visorIndice + 1, 1);
    if (e.key === 'ArrowLeft') mostrarProducto(visorIndice - 1, -1);
});

// Deslizar el dedo para pasar de posición (celular)
let toqueX = null;
visor.addEventListener('touchstart', (e) => { toqueX = e.touches[0].clientX; }, { passive: true });
visor.addEventListener('touchend', (e) => {
    if (toqueX === null) return;
    const dx = e.changedTouches[0].clientX - toqueX;
    toqueX = null;
    if (Math.abs(dx) > 50) mostrarProducto(visorIndice + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
});

/* ==================================================
   4. LUPA: cualquier [data-ampliar="ruta"] muestra la imagen en grande
   ================================================== */
const lupa = document.getElementById('lupa');
const lupaImagen = document.getElementById('lupaImagen');
let focoLupa = null;

document.addEventListener('click', (e) => {
    const ampliar = e.target.closest('[data-ampliar]');
    if (ampliar) {
        focoLupa = ampliar;
        lupaImagen.src = ampliar.dataset.ampliar;
        lupaImagen.alt = (ampliar.querySelector('img') || {}).alt || '';
        lupa.hidden = false;
        lupa.querySelector('.visor-cerrar').focus();
        return;
    }
    if (e.target.closest('[data-cerrar-lupa]')) cerrarLupa();
});
lupa.addEventListener('click', (e) => { if (e.target === lupa) cerrarLupa(); });
document.addEventListener('keydown', (e) => { if (!lupa.hidden && e.key === 'Escape') cerrarLupa(); });

function cerrarLupa() {
    lupa.hidden = true;
    if (focoLupa && focoLupa.focus) focoLupa.focus();
}
