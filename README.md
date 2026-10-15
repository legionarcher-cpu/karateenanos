# Karate para los Enanos · Dojo Shotokan en familia

Página web para repasar y practicar entre clases. Usa la misma idea que la web de **Mystica**: una portada
sencilla con bloques que abren **ventanas internas** (crecen desde el bloque que se toca) y un **visor** tipo
galería para las posiciones.

## Archivos

| Archivo | Qué tiene |
|---|---|
| `index.html` | Portada, bloques de **Aprender** y **Practicar**, estrellas y pie |
| `css/web.css` | Colores, portada, bloques, ventanas, visor, lupa y contenido de las páginas |
| `css/practica.css` | Estilos de los juegos (calentamiento, tarjetas, quiz) |
| `css/perfiles.css` | Acceso de sobrinos, panel de estrellas, cinturones y premios |
| `js/datos.js` | **Todo el contenido**: `POSICIONES` (18 dachi), `DEFENSAS` (5 bloqueos y 5 contraataques) y `VOCABULARIO` (cuerpo, mano, pie, conceptos, técnicas) |
| `js/web.js` | Portada, ventanas internas, posiciones + visor, pestañas, tablas y lupa |
| `js/supabase.js` | Conexión **opcional** con Supabase: URL y clave pública (vacío = solo este navegador) |
| `sql/kara_supabase.sql` | Tablas y funciones `kara_*` para Supabase |
| `js/perfiles.js` | Mini-login de sobrinos, estrellas semanales, cinturones, premios y Panel del tío |
| `js/practica.js` | Calentamiento, Tarjetas de memoria y Quiz del dojo |
| `paginas/*.html` | Contenido de cada ventana: historia, cuerpo, posiciones, tecnicas, calentamiento, tarjetas, quiz |
| `img/golosinas/` | Premios: golosina, paquetito y helado |
| `img/marca/` | Tigre (portada), oso (mascota) y logo de Shotokan |
| `img/cuerpo/`, `img/posiciones/`, `img/tecnicas/` | Infografías usadas en las ventanas |
| `img/laminas/` | Láminas PNG **sin usar**: tienen errores de la IA (ver abajo) |
| `docs/` | Guía técnica original (Word) |
| `Abrir Karate.bat` + `herramientas/servidor.ps1` | Lanzador de doble clic para usarla en el PC sin internet ni Live Server |
| `Configurar Supabase.bat` + `herramientas/configurar-supabase.ps1` | Guarda la URL y la clave anon de Supabase en `js/supabase.js` |

## Abrirla

Con doble clic en `index.html` las ventanas **no** cargan (el navegador no deja leer `paginas/` desde el disco).
Hay tres formas que sí funcionan:

1. **Lanzador (en el PC de los sobrinos)**: doble clic en **`Abrir Karate.bat`**. Enciende un mini servidor
   (`herramientas/servidor.ps1`, no hay que instalar nada) y abre la página en Edge como app, en
   `http://localhost:8765`. Hay que dejar abierta la ventana negra mientras la usan; para apagar, cerrarla.
   Si ya está encendido, otro doble clic solo vuelve a abrir la página. Se le puede hacer un acceso directo en el
   escritorio (clic derecho → Enviar a → Escritorio).
2. **GitHub Pages**: subir la carpeta a un repositorio y activar Pages (Settings → Pages → rama `main`, carpeta
   `/root`). Queda en `https://<usuario>.github.io/<repositorio>/`.
3. **Live Server** (VS Code), para editarla.

**Ojo con las estrellas**: se guardan según la dirección con que se abre la página. Las del lanzador
(`localhost:8765`) y las de GitHub Pages son **distintas**: en cada PC conviene usar siempre la misma forma.

Después de hacer cambios, sube el `?v=` de los CSS/JS en `index.html` y recarga con Ctrl + F5.

## Guardar en la nube (Supabase, opcional)

Sin Supabase, los sobrinos y las estrellas viven en el navegador de cada equipo. Con Supabase se ven **iguales en
todos lados** (GitHub Pages, el lanzador, el celular del tío) y ya no importa con qué dirección se abra la página.

1. Crear un proyecto en [supabase.com](https://supabase.com) (gratis).
2. **SQL Editor → New query**: pegar `sql/kara_supabase.sql` y ejecutar (Run).
3. Doble clic en **`Configurar Supabase.bat`**: pide la "Project URL" y la clave "anon public" (o "publishable")
   de **Project Settings → API**, prueba la conexión y las guarda en `js/supabase.js`. Rechaza la "service_role" /
   "secret". Para quitar la conexión: `Configurar Supabase.bat -Borrar`.
4. Subir los cambios a GitHub (`js/supabase.js` e `index.html`), o abrir con el lanzador.
5. Listo: cada equipo entra directo, sin clave. La primera vez que un equipo abre la página, si la nube está vacía,
   sube los sobrinos y estrellas que tenía guardados en su navegador.

Seguridad: las tablas no se pueden leer ni escribir directo con la clave "anon" (RLS sin políticas); todo pasa por
las funciones `kara_*`, que validan los datos (límite diario, fechas, máximo 30 sobrinos). Pero **no hay clave**: quien
vea la clave anon (está en la página y en GitHub) puede usar esas funciones. Por eso conviene usar **apodos** en vez
de nombres reales. Sin internet, los cambios quedan en cola y se envían cuando vuelve la conexión.

## Pantallas

Probada sin desbordes de 800×600 a 4K (3840×2160) y en celular (390 px). En pantallas de 1700 px o más la página
crece en proporción (letra base en `css/web.css`, arriba); debajo de 900 px el menú pasa a hamburguesa.

## Cambiar o agregar contenido

- **Una posición**: copia un bloque `{ ... }` en `POSICIONES` (`js/datos.js`). Con eso aparece sola en la ventana
  Posiciones, la tabla resumen, el quiz y las tarjetas. Si todavía no tiene imagen, pon `img: null`
  y se muestra su kanji en grande.
- **Un bloqueo o contraataque**: copia un bloque en `DEFENSAS` (`js/datos.js`) con `tipo: 'bloqueo'` o
  `'contraataque'`. Aparece en Técnicas → "Bloqueo y contraataque" y se abre en el visor.
- **Una palabra**: agrégala a `VOCABULARIO` en `js/datos.js` como `['Japonés', 'Kanji', 'Español']`. Aparece en la
  tabla de su tema, en las tarjetas y en el quiz.
- **Una ventana nueva**: crea `paginas/nueva.html`, regístrala en `VENTANAS` (`js/web.js`) y pon un botón con
  `data-ventana="nueva"` en `index.html`.
- **Imágenes de la portada**: `--img-portada-1` y `--img-portada-2` en `css/web.css`.
- **Estrellas y premios de cada cinturón**: `CINTURONES` en `js/perfiles.js`. Límite diario: `LIMITE_DIARIO`.

## Juegos

- **Calentamiento**: video "KARATE 10 BEST STRETCHES" de YouTube (se cambia en `paginas/calentamiento.html`)
  y una lista de ejercicios para marcar; al completarla, 5 estrellas (una vez al día por sobrino). El video se pausa al cerrar
  la ventana. Necesita internet y Live Server (con doble clic YouTube no deja reproducirlo).
- **Tarjetas de memoria**: 4 opciones por tarjeta; si se equivoca sale "¡Intenta otra vez!" y puede volver a
  elegir. Al acertar la tarjeta se voltea y pasa sola. Cada 5 aciertos **a la primera** = 1 estrella
  (`ACIERTOS_POR_ESTRELLA` en `js/practica.js`), **máximo 4 estrellas al día** con este juego
  (`ESTRELLAS_TARJETAS_DIA`; se guardan como marcas `tarjetas-1`…`tarjetas-4`, también en la nube). Se puede seguir
  jugando sin límite. Si acierta después de fallar no cuenta y la tarjeta vuelve a salir al final. Cada tarjeta
  cuenta una vez por ronda. **Voltear** (botón o tocar la tarjeta) muestra la respuesta, pero esa tarjeta ya no suma
  aciertos en todo el día (se recuerda en ese navegador). También: mezclar, al revés (español → japonés) y escuchar.
  Flechas del teclado o deslizar el dedo.
- **Quiz del dojo**: hasta 10 preguntas por tema; cada acierto suma 1 estrella.

## Sobrinos, estrellas y premios

- **Mini-login**: al entrar, "¿Quién va a entrenar hoy?". Cada sobrino toca su nombre y avatar; los nombres se
  agregan ahí mismo con "Agregar". El botón con el avatar (arriba a la derecha) sirve para cambiar de sobrino.
  Dentro de cada juego (calentamiento, tarjetas y quiz) hay una barra "Está jugando …" con el botón **Cambiar**
  (`data-jugador` en `paginas/*.html`); al cambiar, el juego abierto empieza de cero para el otro sobrino.
- **Estrellas**: 1 por acierto en el quiz, 1 cada 5 aciertos en las tarjetas (hasta 4 al día) y 5 por completar el calentamiento (una vez al día). Máximo 40 por día y
  por sobrino. **Se reinician cada semana el día de clase**, que se elige en el **Panel del tío** (sábado por defecto).
- **Cinturones y premios**: solo cuenta el cinturón más alto alcanzado en la semana. Al tocar un cinturón ya
  alcanzado se ve su premio; los que faltan aparecen como premio sorpresa con las estrellas que piden.

| Cinturón | Estrellas | Premio |
|---|---|---|
| Blanco / Amarillo | 5 / 15 | 1 golosina |
| Naranja / Verde | 30 / 50 | 2 golosinas |
| Azul / Morado | 75 / 105 | 1 golosina + 1 paquetito |
| Marrón I / Marrón II | 140 / 180 | 2 paquetitos |
| Negro | 230 | 1 helado |

- **Panel del tío** (dentro de la ventana de acceso): día de clase, estrellas y premio actual de cada sobrino, el
  premio de la **semana pasada** con la casilla "entregado", y en cada fila ✏️ **modificar** (nombre y avatar; las
  estrellas no cambian) y 🗑️ **borrar** (pide confirmación; borra también sus estrellas).
  Con Supabase, modificar necesita la función `kara_editar_sobrino`: si la base se creó antes, ejecutar una vez
  `sql/kara_editar_sobrino.sql` en el SQL Editor (en instalaciones nuevas ya viene en `sql/kara_supabase.sql`).
- Se guarda en el navegador de cada equipo (`karate-enanos-datos`) o, si se configura, en Supabase (ver abajo).

## Enlaces directos

`index.html#historia`, `#cuerpo`, `#posiciones`, `#tecnicas`, `#tarjetas`, `#quiz`.

## Ideas para más adelante

- **Tarjetas con imagen**: mostrar la foto de una posición y que adivinen cuál es (sirve el campo `img` de `POSICIONES`).
- **Micro-videos de kata**: clips cortos (MP4 de pocos segundos, sin sonido, en bucle) en una carpeta `video/`.

## Sobre el contenido

Las medidas son las del documento de `docs/`. Las láminas de `img/laminas/` no se usan
porque tienen términos inventados o equivocados ("Hikigosan", "Fukumi", "Haisoku = talón"). Las de
`img/cuerpo/` son las mismas del documento.
