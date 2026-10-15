/* ==================================================
   KARATE PARA LOS ENANOS · JUEGOS DE PRÁCTICA
   Cada página de juego se prepara al cargarse por primera vez (js/web.js llama a
   Practica.<nombre>(caja)). Usan POSICIONES y VOCABULARIO de js/datos.js.

   1. Ayudantes (mezclar, voz, pitido, confeti, temas). Las estrellas de cada sobrino,
      los cinturones y los premios están en js/perfiles.js (Perfiles.sumarEstrellas).
   2. Tarjetas de memoria: elegir la opción correcta ("¡Intenta otra vez!" si no),
      1 estrella cada 5 aciertos a la primera; mezclar, al revés y escuchar.
   3. Quiz del dojo: hasta 10 preguntas de opción múltiple por tema.
   4. Calentamiento: lista de ejercicios para marcar y pausa del video al salir.

   Al abrir una ventana llega el evento 'ventana-entrar' (con los data-* del botón,
   ej. data-tema="cuerpo") y al dejarla 'ventana-salir'.
   ================================================== */

/* ==================================================
   AYUDANTES
   Las estrellas, los sobrinos y los cinturones están en js/perfiles.js.
   ================================================== */
function mezclar(lista) {
    const copia = [...lista];
    for (let i = copia.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia;
}

// Leer en voz alta (si el navegador lo permite)
function hablar(texto) {
    if (!('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const frase = new SpeechSynthesisUtterance(texto);
    frase.lang = 'es-ES';
    const voz = speechSynthesis.getVoices().find((v) => v.lang && v.lang.startsWith('es'));
    if (voz) frase.voice = voz;
    frase.rate = 0.95;
    speechSynthesis.speak(frase);
}

// Campana / pitido con Web Audio (sin archivos de sonido)
let audio = null;
function pitido(frecuencia = 880, duracion = 0.18, veces = 1) {
    try {
        audio = audio || new (window.AudioContext || window.webkitAudioContext)();
        for (let i = 0; i < veces; i++) {
            const osc = audio.createOscillator();
            const vol = audio.createGain();
            const inicio = audio.currentTime + i * (duracion + 0.08);
            osc.frequency.value = frecuencia;
            osc.type = 'triangle';
            vol.gain.setValueAtTime(0.25, inicio);
            vol.gain.exponentialRampToValueAtTime(0.001, inicio + duracion);
            osc.connect(vol).connect(audio.destination);
            osc.start(inicio);
            osc.stop(inicio + duracion);
        }
    } catch { /* sin audio */ }
}

// Confeti de celebración dentro de un elemento
function confeti(dentro) {
    if (sinMovimiento) return;
    const colores = ['#E63946', '#FFB703', '#1DBA82', '#3A9BF0', '#9152FA', '#F7648A'];
    const capa = document.createElement('div');
    capa.className = 'confeti';
    for (let i = 0; i < 40; i++) {
        const p = document.createElement('span');
        p.style.left = `${Math.random() * 100}%`;
        p.style.background = colores[i % colores.length];
        p.style.animationDelay = `${Math.random() * 0.4}s`;
        p.style.setProperty('--giro', `${Math.random() * 720 - 360}deg`);
        capa.appendChild(p);
    }
    dentro.appendChild(capa);
    setTimeout(() => capa.remove(), 2200);
}

// Botones de temas (una sola opción activa). incluirTodo agrega "¡De todo!"
function pintarTemas(contenedor, alElegir, incluirTodo = false) {
    const temas = Object.entries(VOCABULARIO).map(([clave, t]) => ({ clave, nombre: t.nombre, icono: t.icono }));
    if (incluirTodo) temas.push({ clave: 'todo', nombre: '¡De todo un poco!', icono: 'bi-shuffle' });
    contenedor.innerHTML = temas.map((t) =>
        `<button type="button" data-tema="${t.clave}"><i class="bi ${t.icono}"></i> ${t.nombre}</button>`).join('');
    const elegir = (clave) => {
        contenedor.querySelectorAll('button').forEach((b) => b.classList.toggle('activo', b.dataset.tema === clave));
        alElegir(clave);
    };
    contenedor.addEventListener('click', (e) => {
        const b = e.target.closest('button[data-tema]');
        if (b) elegir(b.dataset.tema);
    });
    return elegir;
}

// Palabras de un tema como objetos { jp, kanji, es }
function palabrasDe(tema) {
    const claves = tema === 'todo' ? Object.keys(VOCABULARIO) : [tema];
    return claves.flatMap((c) => VOCABULARIO[c].palabras.map(([jp, kanji, es]) => ({ jp, kanji, es })));
}

window.Practica = {};

/* ==================================================
   2. TARJETAS DE MEMORIA
   ================================================== */
const ACIERTOS_POR_ESTRELLA = 5;
const ESTRELLAS_TARJETAS_DIA = 4;   // máximo de estrellas por día con este juego (por sobrino)
const CLAVE_VISTAS = 'karate-enanos-tarjetas-vistas';

// Tarjetas que el sobrino volteó sin responder hoy (en este navegador): ya no dan aciertos ese día
function fechaHoy() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function vistasDeHoy() {
    const s = Perfiles.activo();
    const quien = s ? s.id : 'nadie';
    let todo = {};
    try { todo = JSON.parse(localStorage.getItem(CLAVE_VISTAS)) || {}; } catch { todo = {}; }
    if (!todo[quien] || todo[quien].fecha !== fechaHoy()) todo[quien] = { fecha: fechaHoy(), claves: [] };
    return {
        tiene: (clave) => todo[quien].claves.includes(clave),
        agregar(clave) {
            if (this.tiene(clave)) return;
            todo[quien].claves.push(clave);
            // Solo se guarda lo de hoy
            Object.keys(todo).forEach((k) => { if (todo[k].fecha !== fechaHoy()) delete todo[k]; });
            try { localStorage.setItem(CLAVE_VISTAS, JSON.stringify(todo)); } catch { /* sin almacenamiento */ }
        },
    };
}

// Estrellas de tarjetas ganadas hoy: se guardan como marcas tarjetas-1 … tarjetas-4 (también en la nube)
const estrellasTarjetasHoy = () =>
    Array.from({ length: ESTRELLAS_TARJETAS_DIA }, (_, i) => Perfiles.tieneMarcaHoy(`tarjetas-${i + 1}`)).filter(Boolean).length;

Practica.tarjetas = function (caja) {
    const $ = (s) => caja.querySelector(s);
    const tarjeta = $('[data-tarjeta]');
    const mensaje = $('[data-mensaje]');
    let lista = [];
    let indice = 0;
    let invertido = false;
    let respondida = false;  // ya eligió la opción correcta en esta tarjeta
    let fallo = false;       // se equivocó al menos una vez en esta tarjeta
    let aciertos = 0;        // aciertos a la primera (cada 5 = 1 estrella)
    let pasarSola = null;
    const sabidas = new Set();
    const claveDe = (p) => p.jp + p.es;

    function avisar(texto, tipo = '') {
        mensaje.textContent = texto;
        mensaje.className = `quiz-mensaje ${tipo}`;
    }

    function pintarAciertos() {
        const hoy = estrellasTarjetasHoy();
        $('[data-aciertos]').textContent = aciertos;
        $('[data-ganadas]').textContent = `${hoy} / ${ESTRELLAS_TARJETAS_DIA}`;
        const llevo = aciertos % ACIERTOS_POR_ESTRELLA;
        // Con las estrellas del día completas ya no se muestran los puntitos
        $('[data-hacia-estrella]').hidden = hoy >= ESTRELLAS_TARJETAS_DIA;
        $('[data-hacia-estrella]').innerHTML = Array.from({ length: ACIERTOS_POR_ESTRELLA }, (_, i) =>
            `<i class="bi ${i < llevo ? 'bi-circle-fill' : 'bi-circle'}"></i>`).join('');
    }

    function pintarOpciones(p) {
        const valor = (x) => (invertido ? x.jp : x.es);
        const letras = ['A', 'B', 'C', 'D'];
        $('[data-opciones]').replaceChildren(...opcionesPara(p, lista, valor).map((texto, i) => {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'quiz-opcion';
            b.innerHTML = `<span class="letra">${letras[i]}</span>`;
            b.append(texto);
            b.addEventListener('click', () => responder(b, texto === valor(p)));
            return b;
        }));
    }

    function pintar() {
        clearTimeout(pasarSola);
        const p = lista[indice];
        respondida = false;
        fallo = false;
        avisar(vistasDeHoy().tiene(claveDe(p)) ? '👀 Esta ya la viste hoy: practícala, pero no suma aciertos.' : '');
        tarjeta.classList.remove('volteada');
        tarjeta.classList.remove('entra');
        void tarjeta.offsetWidth;
        tarjeta.classList.add('entra');
        // Se cambia el texto un instante después, para que no se vea la respuesta al voltear de regreso
        setTimeout(() => {
            $('[data-kanji]').textContent = invertido ? '' : p.kanji;
            $('[data-japones]').textContent = invertido ? p.es : p.jp;
            $('[data-espanol]').textContent = invertido ? p.jp : p.es;
            $('[data-japones-atras]').textContent = invertido ? p.kanji : `${p.jp} · ${p.kanji}`;
            caja.querySelector('.tarjeta-frente small').textContent = invertido ? '¿Cómo se dice en japonés?' : '¿Qué significa?';
        }, 120);
        pintarOpciones(p);
        pintarAciertos();
        $('[data-contador]').textContent = `${indice + 1} / ${lista.length}`;
        $('[data-sabidas]').textContent = `${sabidas.size} / ${lista.length}`;
        $('[data-barra]').style.width = `${(sabidas.size / lista.length) * 100}%`;
        tarjeta.classList.toggle('sabida', sabidas.has(claveDe(p)));
    }

    // Da la estrella de cada 5 aciertos, si todavía quedan de las 4 del día
    function premiar() {
        if (!Perfiles.activo()) {
            Perfiles.sumarEstrellas(1, 'tarjetas');  // abre "¿Quién va a entrenar hoy?"
            return '¡5 aciertos! (elige tu nombre para guardar estrellas)';
        }
        const hoy = estrellasTarjetasHoy();
        if (hoy >= ESTRELLAS_TARJETAS_DIA) return `¡5 aciertos! Ya ganaste tus ${ESTRELLAS_TARJETAS_DIA} estrellas de tarjetas de hoy. ¡Sigue practicando!`;
        const dio = Perfiles.sumarEstrellas(1, 'tarjetas');
        if (!dio) return '¡5 aciertos! (ya llegaste al límite de estrellas de hoy)';
        Perfiles.marcaHoy(`tarjetas-${hoy + 1}`);
        return hoy + 1 === ESTRELLAS_TARJETAS_DIA
            ? `¡5 aciertos! Ganaste 1 estrella ⭐ (ya tienes las ${ESTRELLAS_TARJETAS_DIA} de hoy)`
            : '¡5 aciertos! Ganaste 1 estrella ⭐';
    }

    function responder(boton, bien) {
        if (respondida) return;
        if (!bien) {
            fallo = true;
            boton.disabled = true;
            boton.classList.add('incorrecta');
            avisar(mezclar(['¡Intenta otra vez! 💪', '¡Casi! Intenta otra vez', 'Esa no es… ¡intenta otra vez!'])[0], 'mal');
            pitido(220, 0.25);
            return;
        }
        respondida = true;
        caja.querySelectorAll('.tarjetas-opciones .quiz-opcion').forEach((b) => { b.disabled = true; });
        boton.classList.add('correcta');
        tarjeta.classList.add('volteada');
        const p = lista[indice];
        const vista = vistasDeHoy().tiene(claveDe(p));
        if (fallo || vista || sabidas.has(claveDe(p))) {
            // Acertó después de equivocarse, ya la había volteado hoy o ya la sabía en esta ronda: no cuenta
            avisar(fallo ? '¡Ahora sí! Esta vuelve a salir para que la practiques.'
                : vista ? '¡Correcto! (ya la habías visto hoy, no suma)' : '¡Correcto! Esa ya la sabías.', 'bien');
            pitido(880, 0.12);
        } else {
            sabidas.add(claveDe(p));
            aciertos++;
            if (aciertos % ACIERTOS_POR_ESTRELLA === 0) {
                avisar(premiar(), 'bien');
                pitido(660, 0.15, 3);
            } else {
                avisar(mezclar(['¡Correcto! ✔', '¡Muy bien!', '¡Oss!', '¡Eso es!'])[0], 'bien');
                pitido(880, 0.12, 2);
            }
            pintarAciertos();
            $('[data-sabidas]').textContent = `${sabidas.size} / ${lista.length}`;
            $('[data-barra]').style.width = `${(sabidas.size / lista.length) * 100}%`;
            tarjeta.classList.add('sabida');
        }
        if (sabidas.size === lista.length) {
            avisar('¡Te sabes todas las tarjetas de este tema! 🏆', 'bien');
            confeti(caja.querySelector('.tarjetas-zona'));
            pitido(660, 0.15, 3);
            return;
        }
        // Si falló, la tarjeta se va al final del mazo para verla otra vez
        pasarSola = setTimeout(() => (fallo ? alFinal() : mover(1)), 1800);
    }

    function cargar(tema) {
        lista = mezclar(palabrasDe(tema));
        indice = 0;
        sabidas.clear();
        pintar();
    }

    const mover = (paso) => { indice = (indice + paso + lista.length) % lista.length; pintar(); };
    function alFinal() {
        const [p] = lista.splice(indice, 1);
        lista.push(p);
        if (indice >= lista.length) indice = 0;
        pintar();
    }

    // Voltear para ver la respuesta: se puede, pero esa tarjeta ya no da aciertos en todo el día
    function voltear() {
        const p = lista[indice];
        if (!respondida && !tarjeta.classList.contains('volteada')) {
            const vistas = vistasDeHoy();
            if (!vistas.tiene(claveDe(p)) && !sabidas.has(claveDe(p))) {
                vistas.agregar(claveDe(p));
                avisar('👀 Viste la respuesta: esta tarjeta hoy ya no suma aciertos.');
            }
        }
        tarjeta.classList.toggle('volteada');
    }
    tarjeta.addEventListener('click', voltear);
    $('[data-voltear]').addEventListener('click', voltear);
    $('[data-anterior]').addEventListener('click', () => mover(-1));
    $('[data-siguiente]').addEventListener('click', () => mover(1));
    $('[data-mezclar]').addEventListener('click', () => { lista = mezclar(lista); indice = 0; pintar(); });
    $('[data-invertir]').addEventListener('click', (e) => {
        invertido = !invertido;
        e.currentTarget.classList.toggle('activo', invertido);
        pintar();
    });
    // Al revés y sin responder se lee el español, para no decir la respuesta
    $('[data-escuchar]').addEventListener('click', () => {
        const p = lista[indice];
        hablar(invertido && !respondida ? p.es : p.jp.replace(/\(.*?\)/g, ''));
    });

    // Teclado: flechas para pasar (la barra espaciadora voltea porque la tarjeta es un botón)
    document.addEventListener('keydown', (e) => {
        if (!caja.isConnected || document.getElementById('ventana').hidden || !document.getElementById('visor').hidden) return;
        if (e.key === 'ArrowRight') mover(1);
        if (e.key === 'ArrowLeft') mover(-1);
    });
    // Deslizar el dedo
    let toqueX = null;
    tarjeta.addEventListener('touchstart', (e) => { toqueX = e.touches[0].clientX; }, { passive: true });
    tarjeta.addEventListener('touchend', (e) => {
        if (toqueX === null) return;
        const dx = e.changedTouches[0].clientX - toqueX;
        toqueX = null;
        if (Math.abs(dx) > 50) { e.preventDefault(); mover(dx < 0 ? 1 : -1); }
    });

    const elegirTema = pintarTemas($('[data-temas]'), cargar);
    elegirTema('cuerpo');
    pintarAciertos();
    caja.addEventListener('ventana-salir', () => clearTimeout(pasarSola));
    caja.addEventListener('ventana-entrar', (e) => {
        if (e.detail && e.detail.tema && VOCABULARIO[e.detail.tema]) elegirTema(e.detail.tema);
    });
};

/* ==================================================
   3. QUIZ DEL DOJO
   ================================================== */
const PREGUNTAS_POR_QUIZ = 10;

// Arma la pregunta con 3 opciones falsas que no repitan la respuesta correcta
function opcionesPara(correcta, todas, valor) {
    const vistos = new Set([valor(correcta)]);
    const falsas = [];
    for (const otra of mezclar(todas)) {
        const v = valor(otra);
        if (vistos.has(v)) continue;
        vistos.add(v);
        falsas.push(v);
        if (falsas.length === 3) break;
    }
    return mezclar([valor(correcta), ...falsas]);
}

function preguntasDe(tema) {
    if (tema === 'posiciones') {
        const tipos = [
            (p) => ({ kanji: p.kanji, texto: `¿Qué significa ${p.nombre}?`, respuesta: p.traduccion, opciones: opcionesPara(p, POSICIONES, (x) => x.traduccion) }),
            (p) => ({ kanji: '', texto: `¿Qué posición es? "${p.frase}"`, respuesta: p.nombre, opciones: opcionesPara(p, POSICIONES, (x) => x.nombre) }),
            (p) => ({ kanji: p.kanji, texto: `¿Para qué se usa ${p.nombre}?`, respuesta: p.uso, opciones: opcionesPara(p, POSICIONES, (x) => x.uso) }),
            (p) => ({ kanji: p.kanji, texto: `¿A qué grupo pertenece ${p.nombre}?`, respuesta: GRUPOS_POSICIONES[p.grupo].nombre, opciones: Object.values(GRUPOS_POSICIONES).map((g) => g.nombre) }),
        ];
        return mezclar(POSICIONES).slice(0, PREGUNTAS_POR_QUIZ).map((p, i) => tipos[i % tipos.length](p));
    }
    const palabras = palabrasDe(tema);
    return mezclar(palabras).slice(0, PREGUNTAS_POR_QUIZ).map((p, i) => (i % 3 === 2
        // Una de cada tres al revés: del español al japonés
        ? { kanji: '', texto: `¿Cómo se dice "${p.es}" en japonés?`, respuesta: p.jp, opciones: opcionesPara(p, palabras, (x) => x.jp) }
        : { kanji: p.kanji, texto: `¿Qué significa "${p.jp}"?`, respuesta: p.es, opciones: opcionesPara(p, palabras, (x) => x.es) }));
}

Practica.quiz = function (caja) {
    const $ = (s) => caja.querySelector(s);
    const pasos = [...caja.querySelectorAll('[data-paso]')];
    let tema = 'cuerpo';
    let preguntas = [];
    let actual = 0;
    let puntos = 0;   // respuestas correctas
    let ganadas = 0;  // estrellas guardadas de verdad (puede ser menos por el límite diario)

    const mostrarPaso = (nombre) => pasos.forEach((p) => { p.hidden = p.dataset.paso !== nombre; });

    function empezar() {
        preguntas = preguntasDe(tema);
        actual = 0;
        puntos = 0;
        ganadas = 0;
        $('[data-puntos]').textContent = '0';
        mostrarPaso('juego');
        pintarPregunta();
    }

    function pintarPregunta() {
        const q = preguntas[actual];
        $('[data-contador]').textContent = `Pregunta ${actual + 1} de ${preguntas.length}`;
        $('[data-barra]').style.width = `${(actual / preguntas.length) * 100}%`;
        $('[data-kanji]').textContent = q.kanji;
        $('[data-kanji]').hidden = !q.kanji;
        $('[data-pregunta]').textContent = q.texto;
        $('[data-mensaje]').textContent = '';
        $('[data-mensaje]').className = 'quiz-mensaje';
        $('[data-siguiente]').hidden = true;
        const letras = ['A', 'B', 'C', 'D'];
        $('[data-opciones]').replaceChildren(...q.opciones.map((texto, i) => {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'quiz-opcion';
            b.innerHTML = `<span class="letra">${letras[i]}</span>`;
            b.append(texto);
            b.addEventListener('click', () => responder(b, texto));
            return b;
        }));
    }

    function responder(boton, texto) {
        const q = preguntas[actual];
        const bien = texto === q.respuesta;
        caja.querySelectorAll('.quiz-opcion').forEach((b) => {
            b.disabled = true;
            if (b.lastChild.textContent === q.respuesta) b.classList.add('correcta');
        });
        const mensaje = $('[data-mensaje]');
        if (bien) {
            puntos++;
            const dio = Perfiles.sumarEstrellas(1);
            ganadas += dio;
            $('[data-puntos]').textContent = ganadas;
            mensaje.textContent = dio
                ? mezclar(['¡Correcto! ⭐', '¡Muy bien! ⭐', '¡Oss! ⭐', '¡Eso es! ⭐'])[0]
                : Perfiles.activo() ? '¡Correcto! (ya llegaste al límite de estrellas de hoy)' : '¡Correcto! (elige tu nombre para guardar estrellas)';
            mensaje.classList.add('bien');
            pitido(880, 0.12, 2);
        } else {
            boton.classList.add('incorrecta');
            mensaje.textContent = `Casi… la respuesta era: ${q.respuesta}`;
            mensaje.classList.add('mal');
            pitido(220, 0.25);
        }
        const boton2 = $('[data-siguiente]');
        boton2.hidden = false;
        boton2.innerHTML = actual === preguntas.length - 1 ? 'Ver resultado <i class="bi bi-trophy"></i>' : 'Siguiente <i class="bi bi-arrow-right"></i>';
        boton2.focus();
    }

    function terminar() {
        mostrarPaso('final');
        const total = preguntas.length;
        const nota = puntos / total;
        const [icono, titulo] = nota === 1 ? ['bi-trophy-fill', '¡Perfecto, eres un maestro!']
            : nota >= 0.8 ? ['bi-award-fill', '¡Excelente trabajo!']
            : nota >= 0.5 ? ['bi-hand-thumbs-up-fill', '¡Bien hecho!']
            : ['bi-emoji-smile-fill', '¡Sigue entrenando!'];
        $('[data-medalla]').innerHTML = `<i class="bi ${icono}"></i>`;
        $('[data-titulo-final]').textContent = titulo;
        $('[data-texto-final]').textContent = `Acertaste ${puntos} de ${total} y ganaste ${ganadas} ${ganadas === 1 ? 'estrella' : 'estrellas'}.`
            + (ganadas < puntos && Perfiles.activo() ? ' (Llegaste al límite de estrellas de hoy: ¡mañana sigues sumando!)' : '');
        $('[data-estrellas-final]').innerHTML = Array.from({ length: total }, (_, i) =>
            `<i class="bi ${i < puntos ? 'bi-star-fill' : 'bi-star'}" style="animation-delay:${i * 0.08}s"></i>`).join('');
        if (nota >= 0.8) confeti(caja.querySelector('.quiz-final'));
    }

    $('[data-siguiente]').addEventListener('click', () => {
        actual++;
        if (actual < preguntas.length) pintarPregunta();
        else terminar();
    });
    $('[data-empezar]').addEventListener('click', empezar);
    $('[data-otra-vez]').addEventListener('click', empezar);
    $('[data-cambiar-tema]').addEventListener('click', () => mostrarPaso('inicio'));

    const elegirTema = pintarTemas($('[data-temas]'), (t) => { tema = t; }, true);
    elegirTema('cuerpo');
    caja.addEventListener('ventana-entrar', (e) => {
        if (e.detail && e.detail.tema) {
            elegirTema(e.detail.tema);
            mostrarPaso('inicio');
        }
    });
};

/* ==================================================
   4. CALENTAMIENTO: LISTA DE EJERCICIOS Y VIDEO
   Al marcar todos los ejercicios: celebración y ESTRELLAS_CALENTAMIENTO estrellas
   (una vez al día por sobrino). Al cerrar la ventana el video se pausa.
   ================================================== */
const ESTRELLAS_CALENTAMIENTO = 5;

Practica.calentamiento = function (caja) {
    const lista = caja.querySelector('[data-lista]');
    const casillas = [...lista.querySelectorAll('input[type="checkbox"]')];
    const listo = lista.querySelector('[data-listo]');

    function actualizar() {
        const hechos = casillas.filter((c) => c.checked).length;
        lista.querySelector('[data-barra]').style.width = `${(hechos / casillas.length) * 100}%`;
        const completo = hechos === casillas.length;
        if (completo && listo.hidden) {
            let dio = 0;
            if (!Perfiles.tieneMarcaHoy('calentamiento')) {
                dio = Perfiles.sumarEstrellas(ESTRELLAS_CALENTAMIENTO, 'calentamiento');
                if (dio) Perfiles.marcaHoy('calentamiento');
            }
            lista.querySelector('[data-premio]').textContent = dio ? `+${dio} ⭐` : '';
            confeti(lista);
            pitido(660, 0.15, 3);
        }
        listo.hidden = !completo;
    }

    casillas.forEach((c) => c.addEventListener('change', () => {
        c.closest('.ejercicio').classList.toggle('hecho', c.checked);
        if (c.checked) pitido(880, 0.06);
        actualizar();
    }));
    lista.querySelector('[data-reiniciar]').addEventListener('click', () => {
        casillas.forEach((c) => { c.checked = false; c.closest('.ejercicio').classList.remove('hecho'); });
        actualizar();
    });

    // Pausar el video al cerrar o cambiar de ventana (API de YouTube por postMessage)
    caja.addEventListener('ventana-salir', () => {
        const video = caja.querySelector('[data-video]');
        if (video && video.contentWindow) {
            video.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }), '*');
        }
    });
};
