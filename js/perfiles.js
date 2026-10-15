/* ==================================================
   KARATE PARA LOS ENANOS · PERFILES, ESTRELLAS SEMANALES Y PREMIOS
   - Mini-login: cada sobrino toca su nombre (se agregan dentro de la página).
   - Las estrellas son de cada sobrino y se reinician cada semana, el DÍA DE CLASE
     (se elige en el "Panel del tío", dentro de la ventana de acceso).
   - Cinturones: al tocar uno ya alcanzado se ve su premio; los demás están bloqueados.
     Solo cuenta el premio del cinturón más alto de la semana.
   - Dónde se guarda:
       · Sin Supabase (js/supabase.js vacío): en ESTE navegador (localStorage, CLAVE_DATOS).
       · Con Supabase (js/supabase.js con URL y clave anon): en la nube (sql/kara_supabase.sql).
         Cada cambio se guarda al momento en una copia local y se envía a la nube; si no hay
         internet queda en una cola (CLAVE_PENDIENTES) y se manda después. Al abrir la página y
         al volver a ella se trae lo último de la nube. La primera vez que un equipo se conecta,
         si la nube está vacía, se suben los sobrinos que tenía guardados en el navegador.

   Lo usan los juegos (js/practica.js): Perfiles.sumarEstrellas(n), Perfiles.marcaHoy(clave)...
   ================================================== */

const CLAVE_DATOS = 'karate-enanos-datos';            // datos cuando NO hay nube
const CLAVE_NUBE = 'karate-enanos-nube';              // copia local de lo que hay en la nube
const CLAVE_PENDIENTES = 'karate-enanos-pendientes';  // cambios que faltan enviar a la nube
const CLAVE_MIGRADO = 'karate-enanos-migrado';        // este equipo ya revisó si había que subir sus datos a la nube
const LIMITE_DIARIO = 40;  // estrellas máximas por sobrino y por día (con nube manda el de kara_dojos)
const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const AVATARES = ['🐯', '🐻', '🐼', '🦊', '🐸', '🐵', '🦁', '🐨', '🐲', '🦉', '🐺', '🐧'];

const PREMIOS = {
    golosina:  { uno: 'golosina', varios: 'golosinas', img: 'img/golosinas/golosina.webp' },
    paquetito: { uno: 'paquetito', varios: 'paquetitos', img: 'img/golosinas/paquetito.jpg' },
    helado:    { uno: 'helado', varios: 'helados', img: 'img/golosinas/helado.png' },
};

// Estrellas de la semana necesarias para cada cinturón y su premio (sube cada 2 cinturones)
const CINTURONES = [
    { nombre: 'Blanco',    estrellas: 5,   color: '#FFFFFF', premio: [['golosina', 1]] },
    { nombre: 'Amarillo',  estrellas: 15,  color: '#FFC933', premio: [['golosina', 1]] },
    { nombre: 'Naranja',   estrellas: 30,  color: '#FF9A1F', premio: [['golosina', 2]] },
    { nombre: 'Verde',     estrellas: 50,  color: '#1DBA82', premio: [['golosina', 2]] },
    { nombre: 'Azul',      estrellas: 75,  color: '#3A9BF0', premio: [['golosina', 1], ['paquetito', 1]] },
    { nombre: 'Morado',    estrellas: 105, color: '#9152FA', premio: [['golosina', 1], ['paquetito', 1]] },
    { nombre: 'Marrón I',  estrellas: 140, color: '#8B5A2B', premio: [['paquetito', 2]] },
    { nombre: 'Marrón II', estrellas: 180, color: '#6B4220', premio: [['paquetito', 2]] },
    { nombre: 'Negro',     estrellas: 230, color: '#111111', premio: [['helado', 1]] },
];

const Perfiles = (() => {
    /* ---------- Datos guardados ---------- */
    const leer = (clave, vacio) => { try { return JSON.parse(localStorage.getItem(clave)) || vacio; } catch { return vacio; } };
    const escribir = (clave, valor) => { try { localStorage.setItem(clave, JSON.stringify(valor)); } catch { /* solo dura esta visita */ } };

    const enNube = () => Nube.configurada;
    // Restos de la versión con "clave del dojo": ya no se usan
    try { localStorage.removeItem('karate-enanos-clave-dojo'); } catch { /* nada */ }

    function cargar() {
        const d = leer(enNube() ? CLAVE_NUBE : CLAVE_DATOS, null);
        if (d && Array.isArray(d.sobrinos)) return d;
        return { diaClase: 6, activo: null, sobrinos: [] };
    }
    let datos = cargar();
    // Claves del sistema anterior (estrellas sin sobrinos): ya no se usan
    try { ['karate-enanos-estrellas', 'karate-enanos-calentamiento'].forEach((c) => localStorage.removeItem(c)); } catch { /* nada */ }
    function guardar() {
        escribir(enNube() ? CLAVE_NUBE : CLAVE_DATOS, datos);
    }
    const limiteDiario = () => datos.limite || LIMITE_DIARIO;
    const nuevoId = () => (crypto.randomUUID ? crypto.randomUUID()
        : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            return (c === 'x' ? r : ((r & 0x3) | 0x8)).toString(16);
        }));

    /* ---------- Fechas y semanas (la semana empieza el día de clase) ---------- */
    const fechaLocal = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const hoy = () => fechaLocal(new Date());
    function inicioSemana(desplazamiento = 0) {
        const d = new Date();
        d.setHours(12, 0, 0, 0);
        d.setDate(d.getDate() - ((d.getDay() - datos.diaClase + 7) % 7) + desplazamiento * 7);
        return fechaLocal(d);
    }
    function diasParaReinicio() {
        const dif = (new Date().getDay() - datos.diaClase + 7) % 7;
        return 7 - dif;
    }

    /* ---------- Sobrinos ---------- */
    const activo = () => datos.sobrinos.find((s) => s.id === datos.activo) || null;
    const semanaDe = (s, clave) => (s.semanas && s.semanas[clave]) || { estrellas: 0, dias: {}, entregado: false };
    const estrellasDe = (s, clave = inicioSemana()) => semanaDe(s, clave).estrellas;
    const indiceCinturon = (estrellas) => CINTURONES.reduce((ultimo, c, i) => (estrellas >= c.estrellas ? i : ultimo), -1);

    function textoPremio(premio) {
        return premio.map(([tipo, n]) => `${n} ${n === 1 ? PREMIOS[tipo].uno : PREMIOS[tipo].varios}`).join(' + ');
    }
    function imagenesPremio(premio) {
        return premio.map(([tipo, n]) => Array.from({ length: n }, () =>
            `<img src="${PREMIOS[tipo].img}" alt="${PREMIOS[tipo].uno}">`).join('')).join('');
    }

    function agregar(nombre, avatar) {
        const s = { id: nuevoId(), nombre, avatar, semanas: {}, marcas: {} };
        datos.sobrinos.push(s);
        datos.activo = s.id;
        guardar();
        encolar('kara_agregar_sobrino', { p_id: s.id, p_nombre: nombre, p_avatar: avatar });
        return s;
    }

    function elegir(id) {
        datos.activo = id;
        guardar();
        pintarTodo();
    }

    function borrar(id) {
        datos.sobrinos = datos.sobrinos.filter((s) => s.id !== id);
        if (datos.activo === id) datos.activo = null;
        guardar();
        encolar('kara_borrar_sobrino', { p_id: id });
        pintarTodo();
    }

    // Se guardan solo las últimas 8 semanas
    function limpiarSemanas(s) {
        const claves = Object.keys(s.semanas).sort();
        claves.slice(0, Math.max(0, claves.length - 8)).forEach((c) => delete s.semanas[c]);
    }

    /* ---------- Estrellas (las usan los juegos) ---------- */
    // Devuelve cuántas estrellas se sumaron de verdad (0 si no hay sobrino o llegó al límite de hoy)
    function sumarEstrellas(n, motivo = 'quiz') {
        const s = activo();
        if (!s) { abrirAcceso(); return 0; }
        const clave = inicioSemana();
        s.semanas = s.semanas || {};
        const semana = s.semanas[clave] || (s.semanas[clave] = { estrellas: 0, dias: {}, entregado: false });
        const yaHoy = semana.dias[hoy()] || 0;
        const dar = Math.max(0, Math.min(n, limiteDiario() - yaHoy));
        if (!dar) return 0;
        const antes = indiceCinturon(semana.estrellas);
        semana.dias[hoy()] = yaHoy + dar;
        semana.estrellas += dar;
        limpiarSemanas(s);
        guardar();
        encolar('kara_sumar_estrellas', {
            p_sobrino: s.id, p_semana: clave, p_fecha: hoy(), p_cantidad: dar, p_motivo: motivo, p_evento: nuevoId(),
        });
        pintarPanel();
        const despues = indiceCinturon(semana.estrellas);
        if (despues > antes) setTimeout(() => mostrarPremio(despues, true), 700);
        return dar;
    }

    const llegoAlLimite = () => {
        const s = activo();
        return !!s && (semanaDe(s, inicioSemana()).dias[hoy()] || 0) >= limiteDiario();
    };

    // Marcas de "una vez al día" por sobrino (ej. el premio del calentamiento)
    function tieneMarcaHoy(clave) {
        const s = activo();
        return !!s && !!s.marcas && s.marcas[clave] === hoy();
    }
    function marcaHoy(clave) {
        const s = activo();
        if (!s) return;
        s.marcas = s.marcas || {};
        s.marcas[clave] = hoy();
        guardar();
        encolar('kara_marcar', { p_sobrino: s.id, p_marca: clave, p_fecha: hoy() });
    }

    /* ==================================================
       NUBE (Supabase): COLA DE ENVÍOS Y SINCRONIZACIÓN
       ================================================== */
    let pendientes = leer(CLAVE_PENDIENTES, []);
    let enviando = false;
    let estadoNube = '';          // texto para el Panel del tío
    let ultimaSincronizacion = null;

    // Guarda el cambio para enviarlo a la nube (solo si este equipo está conectado)
    function encolar(funcion, parametros) {
        if (!enNube()) return;
        pendientes.push({ funcion, parametros });
        escribir(CLAVE_PENDIENTES, pendientes);
        enviarPendientes();
    }

    // Manda los cambios en orden. Sin internet: se detiene y reintenta después.
    async function enviarPendientes() {
        if (enviando || !enNube()) return;
        enviando = true;
        let enviados = 0;
        try {
            while (pendientes.length) {
                const { funcion, parametros } = pendientes[0];
                try {
                    await Nube.rpc(funcion, parametros);
                } catch (err) {
                    if (err.sinConexion) { estadoNube = 'Sin internet: los cambios se enviarán después'; break; }
                    console.error(`No se pudo guardar en la nube (${funcion}):`, err); // se descarta para no trabar la cola
                }
                pendientes.shift();
                enviados++;
                escribir(CLAVE_PENDIENTES, pendientes);
            }
        } finally {
            enviando = false;
            pintarEstadoNube();
        }
        // Todo enviado: se trae lo último (ej. lo que hizo otro sobrino en otro equipo)
        if (enviados && !pendientes.length) programarTraer();
    }

    let temporizadorTraer = null;
    function programarTraer() {
        clearTimeout(temporizadorTraer);
        temporizadorTraer = setTimeout(traerEstado, 1500);
    }

    // Trae lo último de la nube (no pisa cambios que todavía falten enviar)
    async function traerEstado() {
        if (!enNube()) return;
        try {
            const estado = await Nube.rpc('kara_estado');
            if (pendientes.length) return; // llegaron cambios nuevos mientras tanto: se trae después
            datos = desdeNube(estado, datos.activo);
            revisarMigracion();
            guardar();
            ultimaSincronizacion = new Date();
            estadoNube = '';
            pintarTodo();
        } catch (err) {
            estadoNube = err.sinConexion ? 'Sin internet: se muestran los últimos datos guardados'
                : `Error de la nube: ${err.message} (¿se ejecutó sql/kara_supabase.sql?)`;
            pintarEstadoNube();
        }
    }

    // Convierte lo que devuelve kara_estado al formato de la página
    function desdeNube(estado, activoAnterior) {
        const sobrinos = (estado.sobrinos || []).map((s) => ({
            id: s.id, nombre: s.nombre, avatar: s.avatar, semanas: s.semanas || {}, marcas: s.marcas || {},
        }));
        return {
            diaClase: estado.dojo.dia_clase,
            limite: estado.dojo.limite_diario,
            dojo: estado.dojo.nombre,
            activo: sobrinos.some((s) => s.id === activoAnterior) ? activoAnterior : null,
            sobrinos,
        };
    }

    // Envía lo pendiente y trae lo último de la nube
    async function sincronizar() {
        if (!enNube()) return;
        await enviarPendientes();
        if (!pendientes.length && !enviando) await traerEstado(); // sin internet: se queda la copia local
    }

    // Primera conexión de este equipo: si la nube está vacía y este navegador tenía sobrinos, se suben
    function revisarMigracion() {
        if (leer(CLAVE_MIGRADO, false)) return;
        escribir(CLAVE_MIGRADO, true);
        const locales = leer(CLAVE_DATOS, { sobrinos: [] });
        if (!datos.sobrinos.length && locales.sobrinos && locales.sobrinos.length) subirDatosLocales(locales); // se envía solo (cola)
    }

    function subirDatosLocales(locales) {
        locales.sobrinos.forEach((s) => {
            const id = /^[0-9a-f-]{36}$/i.test(s.id) ? s.id : nuevoId();
            if (datos.activo === s.id || locales.activo === s.id) datos.activo = id;
            datos.sobrinos.push({ ...s, id });
            encolar('kara_agregar_sobrino', { p_id: id, p_nombre: s.nombre, p_avatar: s.avatar });
            Object.entries(s.semanas || {}).forEach(([semana, sem]) => {
                Object.entries(sem.dias || {}).forEach(([fecha, cantidad]) => {
                    if (cantidad > 0) encolar('kara_sumar_estrellas', { p_sobrino: id, p_semana: semana, p_fecha: fecha, p_cantidad: Math.min(cantidad, 50), p_motivo: 'migracion', p_evento: nuevoId() });
                });
                if (sem.entregado) encolar('kara_entregar', { p_sobrino: id, p_semana: semana, p_entregado: true });
            });
            // Marcas del día (calentamiento hecho, estrellas de tarjetas…)
            Object.entries(s.marcas || {}).forEach(([marca, fecha]) =>
                encolar('kara_marcar', { p_sobrino: id, p_marca: marca, p_fecha: fecha }));
        });
    }

    function pintarEstadoNube() {
        const caja = document.querySelector('[data-estado-nube]');
        if (caja) caja.textContent = textoEstadoNube();
    }
    function textoEstadoNube() {
        if (estadoNube) return estadoNube;
        if (pendientes.length) return `Enviando ${pendientes.length} ${pendientes.length === 1 ? 'cambio' : 'cambios'}…`;
        return ultimaSincronizacion ? `Sincronizado a las ${ultimaSincronizacion.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}` : 'Conectado';
    }

    /* ==================================================
       PANEL DE ESTRELLAS (portada) Y CHIP DE LA CABECERA
       ================================================== */
    function pintarPanel() {
        const s = activo();
        const total = s ? estrellasDe(s) : 0;
        const i = indiceCinturon(total);
        const siguiente = CINTURONES[i + 1];

        document.getElementById('chipAvatar').textContent = s ? s.avatar : '👤';
        document.getElementById('chipNombre').textContent = s ? s.nombre : 'Entrar';
        document.getElementById('panelAvatar').textContent = s ? s.avatar : '👤';
        document.getElementById('panelNombre').textContent = s ? `Estrellas de ${s.nombre}` : '¿Quién está entrenando?';
        document.getElementById('estrellasTotal').textContent = total;

        const reinicio = diasParaReinicio();
        const cuando = reinicio === 7 ? `el próximo ${DIAS[datos.diaClase]}` : `el ${DIAS[datos.diaClase]} (en ${reinicio} ${reinicio === 1 ? 'día' : 'días'})`;
        document.getElementById('estrellasCinturon').textContent = !s
            ? 'Toca "Cambiar" y elige tu nombre para guardar tus estrellas.'
            : `${i < 0 ? 'Todavía sin cinturón' : `Cinturón ${CINTURONES[i].nombre.toLowerCase()}`}`
              + `${siguiente ? ` · faltan ${siguiente.estrellas - total} para el ${siguiente.nombre.toLowerCase()}` : ' · ¡llegaste a negro!'}`
              + ` · se reinicia ${cuando}`;

        document.getElementById('cinturones').innerHTML = CINTURONES.map((c, n) => `
            <button type="button" class="cinturon ${n <= i ? 'ganado' : ''} ${n === i ? 'actual' : ''}" data-cinturon="${n}"
                style="--cinturon:${c.color}" aria-label="Cinturón ${c.nombre}: ${n <= i ? 'ver premio' : `bloqueado, ${c.estrellas} estrellas`}">
                <span class="cinturon-tela"></span>
                <small>${c.nombre}</small>
                <span class="cinturon-meta">${n <= i ? '<i class="bi bi-gift-fill"></i>' : `<i class="bi bi-lock-fill"></i> ${c.estrellas}`}</span>
            </button>`).join('');

        // Premio de la semana pasada (para que el tío sepa qué entregar)
        const pasada = document.getElementById('semanaPasada');
        const ip = s ? indiceCinturon(estrellasDe(s, inicioSemana(-1))) : -1;
        pasada.hidden = ip < 0;
        if (ip >= 0) {
            const entregado = semanaDe(s, inicioSemana(-1)).entregado;
            pasada.innerHTML = `<i class="bi bi-calendar-check"></i> Semana pasada: cinturón <strong>${CINTURONES[ip].nombre.toLowerCase()}</strong> → ${textoPremio(CINTURONES[ip].premio)} ${entregado ? '<span class="entregado">✓ entregado</span>' : '<span class="pendiente">por entregar</span>'}`;
        }
    }

    function pintarTodo() {
        pintarPanel();
        // No se redibuja el acceso si alguien está escribiendo en él (ej. un nombre nuevo)
        const foco = document.activeElement;
        const escribiendo = acceso.contains(foco) && foco.matches('input[type="text"], input[type="password"]');
        if (!acceso.hidden && !escribiendo) pintarAcceso();
    }

    /* ==================================================
       DIÁLOGO DE PREMIO (al tocar un cinturón o al subir de cinturón)
       ================================================== */
    const dialogo = document.getElementById('dialogo');
    const dialogoCuerpo = document.getElementById('dialogoCuerpo');
    let focoDialogo = null;

    function abrirDialogo(html) {
        focoDialogo = document.activeElement;
        dialogoCuerpo.innerHTML = html;
        dialogo.hidden = false;
        dialogo.querySelector('.dialogo-cerrar').focus();
    }
    function cerrarDialogo() {
        dialogo.hidden = true;
        if (focoDialogo && focoDialogo.focus) focoDialogo.focus();
    }

    function mostrarPremio(n, subio = false) {
        const s = activo();
        const c = CINTURONES[n];
        const actual = s ? indiceCinturon(estrellasDe(s)) : -1;
        const cinta = `<span class="dialogo-cinturon" style="--cinturon:${c.color}"><span class="cinturon-tela"></span></span>`;
        if (n > actual) {
            abrirDialogo(`${cinta}
                <div class="premio-misterio"><i class="bi bi-gift-fill"></i><span>?</span></div>
                <h2>Cinturón ${c.nombre}</h2>
                <p>Premio sorpresa 🔒. Llega a <strong>${c.estrellas} estrellas</strong> esta semana para descubrirlo.</p>
                ${s ? `<p class="dialogo-nota">Te faltan ${c.estrellas - estrellasDe(s)} estrellas.</p>` : ''}`);
            return;
        }
        const titulo = subio ? `¡Subiste a cinturón ${c.nombre.toLowerCase()}!` : `Cinturón ${c.nombre}`;
        const nota = n === actual
            ? 'Este es tu premio de la semana. ¡Sigue sumando estrellas para un premio mayor!'
            : `Ya lo pasaste: tu premio de la semana ahora es el del cinturón ${CINTURONES[actual].nombre.toLowerCase()}.`;
        abrirDialogo(`${cinta}
            <div class="premio-imagenes">${imagenesPremio(c.premio)}</div>
            <h2>${titulo}</h2>
            <p class="premio-texto">${textoPremio(c.premio)}</p>
            <p class="dialogo-nota">${nota}</p>`);
        if (subio && typeof confeti === 'function') confeti(dialogo.querySelector('.dialogo-tarjeta'));
        if (subio && typeof pitido === 'function') pitido(660, 0.15, 3);
    }

    /* ==================================================
       ACCESO: ¿QUIÉN VA A ENTRENAR? + PANEL DEL TÍO
       ================================================== */
    const acceso = document.getElementById('acceso');
    const accesoCuerpo = document.getElementById('accesoCuerpo');
    let avatarElegido = AVATARES[0];

    function abrirAcceso() {
        pintarAcceso();
        acceso.hidden = false;
        const primero = acceso.querySelector('.perfil-tarjeta, input');
        if (primero) primero.focus();
    }
    function cerrarAcceso() { acceso.hidden = true; }

    function pintarAcceso() {
        const clave = inicioSemana();
        const tarjetas = datos.sobrinos.map((s) => `
            <button type="button" class="perfil-tarjeta ${s.id === datos.activo ? 'activo' : ''}" data-elegir="${s.id}">
                <span class="perfil-avatar">${s.avatar}</span>
                <strong>${escaparTexto(s.nombre)}</strong>
                <small>${estrellasDe(s, clave)} ⭐ esta semana</small>
            </button>`).join('');

        const filas = datos.sobrinos.map((s) => {
            const i = indiceCinturon(estrellasDe(s, clave));
            const ip = indiceCinturon(estrellasDe(s, inicioSemana(-1)));
            const pasada = semanaDe(s, inicioSemana(-1));
            return `<tr>
                <td>${s.avatar} ${escaparTexto(s.nombre)}</td>
                <td>${estrellasDe(s, clave)} ⭐ · ${i < 0 ? 'sin cinturón' : CINTURONES[i].nombre}</td>
                <td>${i < 0 ? '—' : textoPremio(CINTURONES[i].premio)}</td>
                <td>${ip < 0 ? '—' : `${textoPremio(CINTURONES[ip].premio)}
                    <label class="entrega"><input type="checkbox" data-entregado="${s.id}" ${pasada.entregado ? 'checked' : ''}> entregado</label>`}</td>
                <td><button type="button" class="enlace-boton peligro" data-borrar="${s.id}" aria-label="Borrar a ${escaparTexto(s.nombre)}"><i class="bi bi-trash"></i></button></td>
            </tr>`;
        }).join('');

        accesoCuerpo.innerHTML = `
            <h2>¿Quién va a entrenar hoy?</h2>
            <div class="perfiles">${tarjetas}
                <button type="button" class="perfil-tarjeta nuevo" data-nuevo>
                    <span class="perfil-avatar"><i class="bi bi-plus-lg"></i></span><strong>Agregar</strong><small>sobrino nuevo</small>
                </button>
            </div>

            <form class="perfil-form" data-form ${datos.sobrinos.length ? 'hidden' : ''}>
                <h3>${datos.sobrinos.length ? 'Nuevo karateka' : '¡Hola! Escribe tu nombre para empezar'}</h3>
                <input type="text" maxlength="20" placeholder="Nombre" data-nombre aria-label="Nombre" required>
                <div class="avatares">${AVATARES.map((a) => `<button type="button" data-avatar="${a}" class="${a === avatarElegido ? 'activo' : ''}" aria-label="Avatar ${a}">${a}</button>`).join('')}</div>
                <button type="submit" class="boton boton-rojo"><i class="bi bi-check-lg"></i> Guardar y entrar</button>
            </form>

            <details class="panel-tio">
                <summary><i class="bi bi-gear-fill"></i> Panel del tío</summary>
                <label class="dia-clase">Día de clase (las estrellas se reinician ese día):
                    <select data-dia>${DIAS.map((d, n) => `<option value="${n}" ${n === datos.diaClase ? 'selected' : ''}>${d}</option>`).join('')}</select>
                </label>
                ${datos.sobrinos.length ? `<div class="tabla-envoltura"><table class="tabla">
                    <thead><tr><th>Sobrino</th><th>Esta semana</th><th>Premio actual</th><th>Semana pasada</th><th></th></tr></thead>
                    <tbody>${filas}</tbody></table></div>` : '<p>Todavía no hay sobrinos.</p>'}
                ${htmlNube()}
            </details>`;
    }

    // Sección "Guardado" del Panel del tío
    function htmlNube() {
        if (!Nube.configurada) {
            return `<div class="nube"><i class="bi bi-hdd"></i><div><strong>Guardado en este navegador</strong>
                <p>Para ver las mismas estrellas en todos los equipos, configura Supabase con "Configurar Supabase.bat" (ver LEEME.md).</p></div></div>`;
        }
        return `<div class="nube conectada"><i class="bi bi-cloud-check-fill"></i><div><strong>Guardado en la nube${datos.dojo ? ` · ${escaparTexto(datos.dojo)}` : ''}</strong>
            <p data-estado-nube>${escaparTexto(textoEstadoNube())}</p>
            <button type="button" class="enlace-boton" data-sincronizar><i class="bi bi-arrow-repeat"></i> Actualizar ahora</button></div></div>`;
    }

    function escaparTexto(t) { return String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

    accesoCuerpo.addEventListener('click', (e) => {
        const b = e.target.closest('button');
        if (!b) return;
        if (b.dataset.elegir) { elegir(b.dataset.elegir); cerrarAcceso(); return; }
        if (b.hasAttribute('data-nuevo')) {
            const form = accesoCuerpo.querySelector('[data-form]');
            form.hidden = false;
            form.querySelector('[data-nombre]').focus();
            return;
        }
        if (b.dataset.avatar) {
            avatarElegido = b.dataset.avatar;
            accesoCuerpo.querySelectorAll('[data-avatar]').forEach((x) => x.classList.toggle('activo', x === b));
            return;
        }
        if (b.dataset.borrar) {
            const s = datos.sobrinos.find((x) => x.id === b.dataset.borrar);
            if (s && confirm(`¿Borrar a ${s.nombre} y todas sus estrellas?`)) borrar(s.id);
            return;
        }
        if (b.hasAttribute('data-sincronizar')) { estadoNube = 'Actualizando…'; pintarEstadoNube(); estadoNube = ''; sincronizar(); }
    });
    accesoCuerpo.addEventListener('submit', (e) => {
        e.preventDefault();
        const nombre = accesoCuerpo.querySelector('[data-nombre]').value.trim();
        if (!nombre) return;
        agregar(nombre, avatarElegido);
        pintarTodo();
        cerrarAcceso();
    });
    accesoCuerpo.addEventListener('change', (e) => {
        if (e.target.matches('[data-dia]')) {
            datos.diaClase = Number(e.target.value);
            guardar();
            encolar('kara_dia_clase', { p_dia: datos.diaClase });
            pintarTodo();
        }
        if (e.target.matches('[data-entregado]')) {
            const s = datos.sobrinos.find((x) => x.id === e.target.dataset.entregado);
            const clave = inicioSemana(-1);
            s.semanas[clave] = semanaDe(s, clave);
            s.semanas[clave].entregado = e.target.checked;
            guardar();
            encolar('kara_entregar', { p_sobrino: s.id, p_semana: clave, p_entregado: e.target.checked });
            pintarPanel();
        }
    });

    /* ---------- Eventos generales ---------- */
    document.addEventListener('click', (e) => {
        if (e.target.closest('[data-acceso]')) { e.preventDefault(); abrirAcceso(); return; }
        if (e.target.closest('[data-cerrar-acceso]')) { cerrarAcceso(); return; }
        if (e.target.closest('[data-cerrar-dialogo]')) { cerrarDialogo(); return; }
        const cinturon = e.target.closest('[data-cinturon]');
        if (cinturon) mostrarPremio(Number(cinturon.dataset.cinturon));
    });
    // Escape cierra primero estos diálogos (antes que la ventana de abajo)
    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        if (!dialogo.hidden) { cerrarDialogo(); e.stopImmediatePropagation(); }
        else if (!acceso.hidden) { cerrarAcceso(); e.stopImmediatePropagation(); }
    }, true);

    // Al cambiar de día o de semana con la página abierta, se actualiza al volver
    // (con nube, además se traen los cambios hechos en otros equipos)
    document.addEventListener('visibilitychange', () => { if (!document.hidden) { pintarPanel(); sincronizar(); } });
    window.addEventListener('online', sincronizar);

    pintarPanel();
    if (!activo()) abrirAcceso();
    sincronizar().then(() => { if (!activo() && acceso.hidden) abrirAcceso(); });

    return { sumarEstrellas, llegoAlLimite, tieneMarcaHoy, marcaHoy, activo, abrirAcceso, mostrarPremio };
})();
