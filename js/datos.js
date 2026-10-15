/* ==================================================
   DATOS DEL DOJO · KARATE PARA LOS ENANOS
   Todo el contenido que comparten las ventanas y los juegos:
     - POSICIONES: cada dachi (ventana Posiciones, tarjetas y quiz)
     - VOCABULARIO: palabras por tema (ventana Partes del cuerpo, tarjetas y quiz)
   Fuente: docs/Dachi del Karate Shotokan — Guía técnica.docx (referencia JKA / Nakayama).

   ▸ Para agregar una posición: copiar un bloque { ... } de POSICIONES y cambiarlo.
     img: ruta desde index.html (o null si todavía no tiene imagen: se ve su kanji).
     grupo: 'naturales' | 'fundamentales' | 'especiales'
   ================================================== */

const POSICIONES = [
    /* ---------- POSICIONES NATURALES (SHIZENTAI) ---------- */
    {
        id: 'heisoku', nombre: 'Heisoku-dachi', kanji: '閉足立', traduccion: 'Pies cerrados',
        grupo: 'naturales', img: 'img/posiciones/heisoku-dachi.jpg', icono: 'bi-person-standing',
        frase: 'Pies juntos, como un soldadito en atención.',
        peso: '50/50', pies: 'Juntos, paralelos', rodillas: 'Rectas, sueltas', uso: 'Atención', kata: 'Kankū Dai, Bassai Dai',
        pasos: [
            'Pies completamente juntos: los bordes internos se tocan del talón a los dedos.',
            'Los dos pies apuntan al frente.',
            'Piernas rectas pero sin bloquear las rodillas; cadera neutra.',
            'Brazos a los lados o con los puños según el kata.',
        ],
        aplicacion: 'Posición de atención. Inicio de kata como Kankū Dai (manos en triángulo), Bassai Dai (puño cubierto) y Jion.',
    },
    {
        id: 'musubi', nombre: 'Musubi-dachi', kanji: '結び立', traduccion: 'Posición anudada',
        grupo: 'naturales', img: 'img/posiciones/musubi-dachi.jpg', icono: 'bi-heart',
        frase: 'Talones juntos y puntas abiertas en V: ¡la del saludo!',
        peso: '50/50', pies: 'Talones juntos, V abierta', rodillas: 'Rectas, sueltas', uso: 'Saludo', kata: 'Inicio y final de todos',
        pasos: [
            'Talones juntos y puntas abiertas formando una V (unos 45° entre los pies; algunas escuelas a ~60°).',
            'Rodillas sin bloquear.',
            'Palmas sobre los muslos o brazos a los lados.',
            'Mirada al frente.',
        ],
        aplicacion: 'La posición del saludo de pie (ritsu-rei) al inicio y al final de la clase y de cada kata.',
    },
    {
        id: 'heiko', nombre: 'Heikō-dachi', kanji: '平行立', traduccion: 'Pies paralelos',
        grupo: 'naturales', img: 'img/posiciones/heiko-dachi.jpg', icono: 'bi-pause',
        frase: 'Pies paralelos al ancho de la cadera, como rieles de tren.',
        peso: '50/50', pies: 'Paralelos, ancho de caderas', rodillas: 'Sueltas', uso: 'Kihon en el sitio', kata: '—',
        pasos: [
            'Desde Musubi, separa los pies al ancho de las caderas.',
            'Los bordes externos de los pies quedan alineados con la cadera.',
            'Pies completamente paralelos.',
            'Peso 50/50, rodillas sueltas.',
        ],
        aplicacion: 'Entrenar técnicas de brazo sin moverse (kihon en el sitio) y trabajar respiración y kime con una base estable.',
    },
    {
        id: 'hachiji', nombre: 'Hachiji-dachi (Shizentai)', kanji: '八字立', traduccion: 'Forma del kanji 八',
        grupo: 'naturales', img: 'img/posiciones/hachiji-dachi.jpg', icono: 'bi-hourglass-split',
        frase: 'La posición de "preparado" (yōi): pies como el kanji 八.',
        peso: '50/50', pies: 'Ancho de hombros, puntas algo afuera', rodillas: 'Sueltas', uso: 'Yōi (preparado)', kata: 'Todos los Heian',
        pasos: [
            'Desde Musubi, desliza el pie derecho y luego el izquierdo hacia afuera.',
            'Quedan al ancho de los hombros, con las puntas un poquito hacia afuera (15–20° cada una), como el trazo 八.',
            'Rodillas apenas flexionadas y tanden (abdomen bajo) firme.',
            'Puños frente a los muslos, a un puño de distancia.',
        ],
        aplicacion: 'Es el yōi de la mayoría de los kata (todos los Heian) y de los ejercicios de kihon. Permite reaccionar hacia cualquier dirección.',
        nota: 'También se llama Soto-hachiji-dachi o simplemente Shizentai.',
    },
    {
        id: 'uchihachiji', nombre: 'Uchi-hachiji-dachi', kanji: '内八字立', traduccion: '8 hacia adentro',
        grupo: 'naturales', img: 'img/posiciones/uchi-hachiji-dachi.jpg', icono: 'bi-arrows-angle-contract',
        frase: 'Como Hachiji, pero las puntas miran hacia adentro.',
        peso: '50/50', pies: 'Ancho de hombros, puntas adentro', rodillas: 'Ligeramente adentro', uso: 'Transición', kata: '—',
        pasos: [
            'Pies al ancho de los hombros.',
            'Las puntas giran hacia adentro y los talones hacia afuera.',
            'Rodillas ligeramente hacia adentro: una base más cerrada y protectora.',
        ],
        aplicacion: 'Postura de transición; se considera la base de Sanchin y Hangetsu en su forma alta.',
    },
    {
        id: 'teiji', nombre: 'Teiji-dachi', kanji: '丁字立', traduccion: 'Forma de T',
        grupo: 'naturales', img: 'img/posiciones/teiji-dachi.jpg', icono: 'bi-type',
        frase: 'Los pies dibujan una letra T en el suelo.',
        peso: '50/50', pies: 'Delantero al frente, trasero a 90°', rodillas: 'Sueltas', uso: 'Transición, guardia', kata: '—',
        pasos: [
            'El pie delantero apunta al frente.',
            'El pie trasero queda perpendicular (90°).',
            'Si alargas la línea del pie delantero hacia atrás, toca el centro del talón trasero: se forma una T.',
            'Separación: más o menos un pie de distancia.',
        ],
        aplicacion: 'Postura de transición y de guardia natural; ayuda a entender la alineación de Kokutsu-dachi.',
    },
    {
        id: 'renoji', nombre: 'Renoji-dachi', kanji: 'レの字立', traduccion: 'Forma de la letra レ',
        grupo: 'naturales', img: null, icono: 'bi-signpost',
        frase: 'Como Teiji, pero la línea pasa por el talón: forma una L.',
        peso: '50/50', pies: 'En L (katakana レ)', rodillas: 'Sueltas', uso: 'Transición', kata: '—',
        pasos: [
            'Igual que Teiji-dachi…',
            '…pero la línea del pie delantero pasa por el talón del pie trasero (no por su centro).',
            'Se forma una L parecida al katakana レ.',
        ],
        aplicacion: 'Postura de transición; es la versión alta y corta de la alineación de Kokutsu-dachi.',
    },

    /* ---------- POSICIONES FUNDAMENTALES ---------- */
    {
        id: 'zenkutsu', nombre: 'Zenkutsu-dachi', kanji: '前屈立', traduccion: 'Posición adelantada',
        grupo: 'fundamentales', img: null, icono: 'bi-arrow-up-right-circle',
        frase: 'La posición de ataque: rodilla de adelante doblada, pierna de atrás recta.',
        significado: 'zen = adelante, kutsu = flexionar: "posición con flexión hacia adelante".',
        peso: '60/40', pies: 'Largo ~2 hombros, ancho de caderas', rodillas: 'Delantera flexionada; trasera recta', uso: 'Ataque', kata: 'Todos los Heian',
        medidas: [
            'Largo: unos dos anchos de hombros entre los talones (según tu estatura).',
            'Ancho: el de las caderas/hombros. ¡Nunca los dos pies en la misma línea!',
            'Peso: ~60 % adelante y ~40 % atrás (algunas escuelas 70/30).',
        ],
        pasos: [
            'Desde Hachiji-dachi, adelanta un pie la distancia indicada.',
            'Dobla la rodilla delantera hasta que tape los dedos del pie; la espinilla queda casi vertical.',
            'La pierna trasera queda recta y firme, empujando el suelo con todo el pie.',
            'Pie delantero al frente; pie trasero lo más al frente posible (~30°, máximo 45°).',
            'Los dos talones bien apoyados: el de atrás no se levanta.',
            'Tronco vertical. Cadera en hanmi (45°) para bloquear o shōmen (de frente) para golpear.',
        ],
        tension: 'La pierna de adelante empuja hacia adelante y la de atrás hacia atrás, como si estiraras el suelo entre los pies.',
        aplicacion: 'La posición de ataque por excelencia: oi-zuki, gyaku-zuki y mae-geri. También sirve para bloquear avanzando. Es la más usada en kihon y en los Heian.',
        errores: ['Rodilla delantera pasada de los dedos o hacia adentro', 'Talón trasero levantado', 'Pies sobre la misma línea', 'Tronco inclinado hacia adelante', 'Glúteos hacia atrás'],
    },
    {
        id: 'kokutsu', nombre: 'Kokutsu-dachi', kanji: '後屈立', traduccion: 'Posición atrasada',
        grupo: 'fundamentales', img: null, icono: 'bi-shield',
        frase: 'La posición de defensa: el peso va sobre la pierna de atrás.',
        significado: 'ko = atrás, kutsu = flexionar: "posición con flexión hacia atrás".',
        peso: '30/70', pies: 'Talones en línea, trasero a 90°', rodillas: 'Ambas afuera; trasera muy flexionada', uso: 'Defensa', kata: 'Heian Nidan en adelante',
        medidas: [
            'Largo: igual o un poco menos que Zenkutsu (1,5–2 anchos de hombros).',
            'Alineación: los dos talones sobre la misma línea.',
            'Peso: ~70 % atrás y ~30 % adelante.',
        ],
        pasos: [
            'El pie delantero apunta al frente; el trasero gira a 90°.',
            'Dobla mucho la rodilla trasera, empujándola hacia afuera hasta que quede sobre los dedos del pie trasero.',
            'La rodilla delantera está un poco doblada y apunta al frente.',
            'La cadera baja y queda en hanmi (casi de perfil), sobre la pierna de atrás.',
            'Tronco vertical: el peso se carga bajando la cadera, no echándose hacia atrás.',
        ],
        tension: 'Ambas rodillas empujan hacia afuera; se siente como "cerrar" las caderas sobre la pierna de atrás.',
        aplicacion: 'Posición defensiva: absorbe el ataque retrocediendo y deja libre la pierna delantera para patear (mae-geri, kekomi). Va con shutō-uke y uchi-uke.',
        errores: ['Pies en distintas líneas (parece un Zenkutsu corto)', 'Rodilla trasera hacia adentro', 'Tronco inclinado', 'Peso repartido 50/50', 'Cadera de frente (shōmen)'],
    },
    {
        id: 'kiba', nombre: 'Kiba-dachi', kanji: '騎馬立', traduccion: 'Posición del jinete',
        grupo: 'fundamentales', img: null, icono: 'bi-arrows-expand-vertical',
        frase: '¡Como si montaras a caballo! Pies paralelos y rodillas afuera.',
        significado: 'ki = montar, ba = caballo. En Okinawa se llamaba Naihanchi-dachi; Funakoshi renombró ese kata como Tekki ("caballo de hierro").',
        peso: '50/50', pies: 'Paralelos, ~2 hombros de ancho', rodillas: 'Hacia afuera', uso: 'Lateral, corta distancia', kata: 'Tekki Shodan–Sandan',
        medidas: [
            'Ancho: unos dos anchos de hombros entre los bordes internos de los pies.',
            'Peso: 50/50.',
        ],
        pasos: [
            'Pies paralelos apuntando al frente (pueden girar muy poquito hacia adentro).',
            'Dobla las dos rodillas hasta que los muslos se acerquen a la horizontal (según tu flexibilidad).',
            'Empuja las rodillas hacia afuera hasta que queden sobre la línea de los pies.',
            'Los bordes externos de los pies presionan el suelo: sientes que "abres" el suelo.',
            'Coxis hacia abajo, tronco vertical; el oponente imaginario está a un lado.',
        ],
        tension: 'Rodillas hacia afuera y pies agarrando el suelo hacia adentro: muy estable hacia los lados.',
        aplicacion: 'Combate a corta distancia y desplazamientos laterales; base de yoko-empi, uraken y yoko-kekomi, y de los tres Tekki. Aparece en Heian Sandan y Godan. ¡Pone las piernas fuertes!',
        errores: ['Rodillas hacia adentro', 'Puntas hacia afuera (eso ya es Shiko-dachi)', 'Glúteos atrás y espalda arqueada', 'Demasiado estrecha o demasiado ancha'],
    },

    /* ---------- POSICIONES ESPECIALES ---------- */
    {
        id: 'fudo', nombre: 'Fudō-dachi (Sōchin-dachi)', kanji: '不動立', traduccion: 'Posición inamovible',
        grupo: 'especiales', img: null, icono: 'bi-bricks',
        frase: 'Mezcla de Zenkutsu y Kiba: ¡nadie te mueve!',
        significado: 'fudō = inamovible. Se llama Sōchin-dachi porque es la posición del kata Sōchin.',
        peso: '~50/50', pies: 'Delantero al frente, trasero ~45°', rodillas: 'Ambas flexionadas, afuera', uso: 'Estabilidad en todas direcciones', kata: 'Sōchin',
        pasos: [
            'Parte de Kiba-dachi y gira la cadera ~45° hacia el oponente.',
            'El pie delantero apunta al frente y el trasero queda a ~45°.',
            'Dobla las dos rodillas por igual (la de atrás también, a diferencia de Zenkutsu).',
            'Empuja las dos rodillas hacia afuera, como en Kiba. Cadera baja, tronco vertical.',
        ],
        aplicacion: 'Junta la potencia de Zenkutsu con la estabilidad de Kiba. Resiste empujes en cualquier dirección.',
        errores: ['Pierna trasera recta (se vuelve Zenkutsu)', 'Rodillas hacia adentro', 'Peso cargado atrás'],
    },
    {
        id: 'hangetsu', nombre: 'Hangetsu-dachi', kanji: '半月立', traduccion: 'Media luna',
        grupo: 'especiales', img: null, icono: 'bi-moon',
        frase: 'Rodillas hacia adentro y pasos en media luna.',
        significado: 'hangetsu = media luna. Viene del kata Hangetsu (en Okinawa, Seisan).',
        peso: '50/50', pies: 'Delantero hacia adentro', rodillas: 'Hacia adentro', uso: 'Corta distancia, proteger ingle', kata: 'Hangetsu',
        pasos: [
            'Pie delantero girado hacia adentro (~45°); el trasero al frente o un poco adentro.',
            'Las dos rodillas dobladas y apretadas hacia adentro, cerrando la ingle.',
            'Glúteos y abdomen bajo contraídos.',
            'Al avanzar, el pie pasa cerca del otro y dibuja un arco (media luna), sin subir la cadera.',
        ],
        aplicacion: 'Protege la ingle y da estabilidad muy cerca del oponente. Se entrena con respiración lenta y tensión.',
        errores: ['Rodillas que no se cierran', 'Pies paralelos', 'Paso recto (se pierde el arco)', 'Tensión en los hombros'],
    },
    {
        id: 'sanchin', nombre: 'Sanchin-dachi', kanji: '三戦立', traduccion: 'Las tres batallas',
        grupo: 'especiales', img: null, icono: 'bi-triangle',
        frase: 'Muy corta y cerrada: cuerpo, mente y espíritu.',
        significado: 'san = tres, chin = batalla (cuerpo, mente y espíritu).',
        peso: '50/50', pies: 'Muy corta, delantero hacia adentro', rodillas: 'Hacia adentro', uso: 'Cuerpo a cuerpo, tensión', kata: '(Kihon)',
        pasos: [
            'Muy corta: el talón de adelante queda a la altura de los dedos del pie de atrás. Ancho de hombros.',
            'Pie delantero girado hacia adentro (~30–45°).',
            'Rodillas dobladas y apretadas hacia adentro.',
            'Coxis hacia abajo, glúteos contraídos, pies agarrando el suelo.',
        ],
        aplicacion: 'Combate muy pegado al oponente y entrenamiento de tensión corporal y respiración.',
        errores: ['Demasiado larga (se vuelve Hangetsu)', 'Rodillas hacia afuera', 'Espalda arqueada'],
    },
    {
        id: 'nekoashi', nombre: 'Neko-ashi-dachi', kanji: '猫足立', traduccion: 'Pie de gato',
        grupo: 'especiales', img: null, icono: 'bi-emoji-smile',
        frase: 'Como un gato que apoya la patita, ¡listo para saltar!',
        significado: 'neko = gato, ashi = pie.',
        peso: '10/90', pies: 'Delantero en almohadilla', rodillas: 'Trasera muy flexionada', uso: 'Esquiva y patada delantera', kata: 'Gojūshiho',
        pasos: [
            'Pie trasero girado ~30–45° hacia afuera y bien apoyado; rodilla trasera muy doblada.',
            'Pie delantero apoyado solo en la almohadilla (koshi), con el talón levantado.',
            'Rodilla delantera un poco hacia adentro, protegiendo la ingle.',
            'Cadera baja en hanmi; tronco vertical sobre la pierna de atrás.',
        ],
        aplicacion: 'Defensa con retroceso corto y contraataque inmediato con la pierna delantera (mae-geri), que no lleva peso.',
        errores: ['Peso hacia adelante', 'Talón trasero levantado', 'Tronco echado atrás', 'Rodilla delantera abierta'],
    },
    {
        id: 'shiko', nombre: 'Shiko-dachi', kanji: '四股立', traduccion: 'Posición del sumo',
        grupo: 'especiales', img: null, icono: 'bi-arrows-angle-expand',
        frase: 'Como Kiba, pero con las puntas de los pies hacia afuera.',
        significado: 'shiko es el ejercicio de piernas del sumo.',
        peso: '50/50', pies: 'Como Kiba, puntas a 45° afuera', rodillas: 'Hacia afuera', uso: 'Base baja', kata: '(Poco usada)',
        pasos: [
            'Igual que Kiba-dachi, pero con las puntas de los pies hacia afuera (~45°).',
            'Rodillas sobre los dedos, empujadas hacia afuera.',
            'Tronco vertical.',
        ],
        aplicacion: 'Base estable y baja. En Shotokan casi no se usa, pero se enseña para entender la diferencia con Kiba.',
    },
    {
        id: 'kosa', nombre: 'Kōsa-dachi', kanji: '交叉立', traduccion: 'Posición cruzada',
        grupo: 'especiales', img: null, icono: 'bi-x-lg',
        frase: 'Piernas cruzadas: para girar, avanzar ¡o aterrizar de un salto!',
        significado: 'kōsa = cruce.',
        peso: '~100/0', pies: 'Trasero cruzado, en almohadilla', rodillas: 'Encajadas', uso: 'Transición, giro, aterrizaje', kata: 'Heian Godan',
        pasos: [
            'El pie delantero apoya completo y carga casi todo el peso.',
            'El pie trasero se cruza por detrás y queda junto al de adelante, solo en la almohadilla.',
            'La rodilla trasera se encaja detrás de la pantorrilla delantera; las dos muy dobladas.',
            'Cadera baja; tronco vertical.',
        ],
        aplicacion: 'Para avanzar, girar o acortar distancia rápido, y para aterrizar de un salto: en Heian Godan se aterriza en Kōsa-dachi con gedan-juji-uke.',
        errores: ['Pies separados (deja de ser cruzada)', 'Cadera alta', 'Peso sobre el pie de atrás'],
    },
    {
        id: 'tsuruashi', nombre: 'Tsuru-ashi-dachi', kanji: '鶴足立', traduccion: 'Posición de la grulla',
        grupo: 'especiales', img: null, icono: 'bi-feather',
        frase: '¡En una sola pierna, como una grulla!',
        significado: 'tsuru = grulla. También se llama Sagi-ashi-dachi (sagi = garza).',
        peso: 'Una pierna', pies: 'Pie alzado junto a la rodilla', rodillas: 'Apoyo levemente flexionada', uso: 'Equilibrio, evitar barrido', kata: 'Gankaku',
        pasos: [
            'Todo el peso en una pierna, con la rodilla un poco doblada (no bloqueada).',
            'La otra pierna se recoge alta; el pie va junto a la rodilla de apoyo.',
            'Tronco vertical, cadera estable, mirada fija.',
        ],
        aplicacion: 'Evitar un barrido (ashi-barai), preparar una patada y desarrollar equilibrio. Es la posición del kata Gankaku ("grulla sobre la roca").',
        errores: ['Rodilla de apoyo bloqueada', 'Cadera inclinada', 'Pie levantado demasiado bajo'],
    },
    {
        id: 'jiyu', nombre: 'Jiyū-dachi', kanji: '自由立', traduccion: 'Posición libre de combate',
        grupo: 'especiales', img: null, icono: 'bi-lightning-charge',
        frase: 'La guardia de combate (kumite): ágil y lista para moverse.',
        significado: 'jiyū = libre. No es de kata: es la guardia de kumite.',
        peso: '~50/50', pies: 'Corta, en hanmi', rodillas: 'Sueltas', uso: 'Kumite', kata: '—',
        pasos: [
            'Entre Zenkutsu y Kokutsu, pero más corta y alta.',
            'Peso 50/50 o un poco atrás; cadera en hanmi.',
            'Rodillas sueltas; talón trasero apoyado o apenas levantado para moverte rápido.',
        ],
        aplicacion: 'Jiyū-ippon-kumite y jiyū-kumite: avanzar, retroceder y cambiar de ángulo de forma explosiva.',
    },
];

const GRUPOS_POSICIONES = {
    naturales:     { nombre: 'Naturales', color: 'amarillo' },
    fundamentales: { nombre: 'Fundamentales', color: 'naranja' },
    especiales:    { nombre: 'Especiales', color: 'morado' },
};

/* ==================================================
   VOCABULARIO POR TEMA (japonés, kanji, español)
   ================================================== */
const VOCABULARIO = {
    cuerpo: {
        nombre: 'Cuerpo en general', icono: 'bi-person',
        palabras: [
            ['Atama', '頭', 'Cabeza'],
            ['Kao / Ganmen', '顔 / 顔面', 'Cara'],
            ['Kubi', '首', 'Cuello'],
            ['Kata', '肩', 'Hombro'],
            ['Mune', '胸', 'Pecho'],
            ['Senaka', '背中', 'Espalda'],
            ['Hara / Fukubu', '腹 / 腹部', 'Abdomen'],
            ['Tanden', '丹田', 'Centro de energía y equilibrio, 3 dedos bajo el ombligo'],
            ['Koshi', '腰', 'Cadera / zona lumbar'],
            ['Kinteki', '金的', 'Ingle'],
            ['Ude', '腕', 'Brazo'],
            ['Hiji (Empi)', '肘', 'Codo'],
            ['Tekubi', '手首', 'Muñeca'],
            ['Te', '手', 'Mano'],
            ['Ashi', '足 / 脚', 'Pie / pierna'],
            ['Momo', '腿', 'Muslo'],
            ['Hiza', '膝', 'Rodilla'],
            ['Sune', '脛', 'Espinilla'],
            ['Ashikubi', '足首', 'Tobillo'],
            ['Kakato', '踵', 'Talón'],
        ],
    },
    mano: {
        nombre: 'Superficies de la mano', icono: 'bi-hand-index-thumb',
        palabras: [
            ['Seiken', '正拳', 'Puño frontal: nudillos de índice y medio'],
            ['Uraken', '裏拳', 'Dorso del puño'],
            ['Tettsui', '鉄槌', 'Puño martillo: lado del meñique'],
            ['Shutō', '手刀', 'Canto externo de la mano abierta ("mano sable")'],
            ['Haitō', '背刀', 'Canto interno de la mano (lado del pulgar)'],
            ['Nukite', '貫手', 'Punta de los dedos extendidos'],
            ['Teishō', '底掌', 'Base de la palma'],
            ['Haishu', '背手', 'Dorso de la mano abierta'],
            ['Ippon-ken', '一本拳', 'Nudillo del índice adelantado'],
            ['Nakadaka-ippon-ken', '中高一本拳', 'Nudillo del medio adelantado'],
            ['Hiraken', '平拳', 'Segundas falanges, mano semicerrada'],
            ['Kumade', '熊手', '"Garra de oso": dedos flexionados'],
            ['Washide', '鷲手', '"Pico de águila": yemas juntas'],
            ['Keitō', '鶏頭', '"Cabeza de gallo": base del pulgar'],
        ],
    },
    pie: {
        nombre: 'Superficies del pie', icono: 'bi-person-walking',
        palabras: [
            ['Koshi (Jōsokutei)', '上足底', 'Almohadilla bajo los dedos (golpe de mae-geri)'],
            ['Sokutō', '足刀', 'Canto externo del pie (yoko-geri)'],
            ['Haisoku', '背足', 'Empeine'],
            ['Teisoku', '底足', 'Planta del pie'],
            ['Kakato', '踵', 'Talón (ushiro-geri, fumikomi)'],
            ['Tsumasaki', '爪先', 'Punta de los dedos del pie'],
        ],
    },
    conceptos: {
        nombre: 'Niveles, lados y conceptos', icono: 'bi-compass',
        palabras: [
            ['Jōdan', '上段', 'Nivel alto: cabeza y cuello'],
            ['Chūdan', '中段', 'Nivel medio: tronco'],
            ['Gedan', '下段', 'Nivel bajo: bajo el cinturón'],
            ['Hidari', '左', 'Izquierda'],
            ['Migi', '右', 'Derecha'],
            ['Mae', '前', 'Frente'],
            ['Ushiro', '後ろ', 'Atrás'],
            ['Yoko', '横', 'Lado'],
            ['Shōmen', '正面', 'Cadera y hombros de frente'],
            ['Hanmi', '半身', 'Cadera y hombros a 45°, medio de lado'],
            ['Gyaku-hanmi', '逆半身', 'Hanmi invertido'],
            ['Hikite', '引き手', 'Mano que regresa a la cadera'],
            ['Kime', '極め', 'Concentración total de fuerza en el impacto'],
            ['Zanshin', '残心', 'Atención que permanece después de la técnica'],
            ['Dachi', '立ち', 'Posición de pie, postura'],
            ['Yōi', '用意', '¡Preparado!'],
        ],
    },
};

/* ==================================================
   BLOQUEOS (UKE) Y CONTRAATAQUES
   Ventana Técnicas → pestaña "Bloqueo y contraataque". Cada uno se abre en el visor.
   tipo: 'bloqueo' | 'contraataque'
   Los ejemplos de lado (izquierda/derecha) suponen que el compañero ataca con
   el pie y el puño DERECHOS; si ataca con los izquierdos, todo va al revés.
   ================================================== */
const DEFENSAS = [
    /* ---------- BLOQUEOS ---------- */
    {
        id: 'ageuke', tipo: 'bloqueo', nombre: 'Jōdan age-uke', kanji: '上段揚げ受け', traduccion: 'Bloqueo hacia arriba',
        icono: 'bi-arrow-up-circle', frase: 'Sube el antebrazo y protege la cara como un techo.',
        posicion: 'Zenkutsu-dachi, cadera en hanmi', nivel: 'Jōdan (cara)', superficie: 'Antebrazo', contra: 'Oi-zuki jōdan',
        pasos: [
            'Los brazos se cruzan frente a la cara: el que va a bloquear sube por dentro y el otro baja hacia la cadera.',
            'El antebrazo sube girando y termina delante y arriba de la frente, a un puño de distancia.',
            'El antebrazo queda inclinado: el puño un poco más alto que el codo, para que el golpe resbale hacia arriba.',
            'La otra mano llega a la cadera con fuerza (hikite).',
        ],
        claves: ['El brazo queda DELANTE de la frente, no encima de la cabeza.', 'Los hombros se quedan abajo y relajados.'],
        errores: ['Codo muy abierto hacia el lado', 'Brazo encima de la cabeza (te tapa la vista)', 'Olvidar la mano de hikite', 'Subir los hombros'],
    },
    {
        id: 'sotouke', tipo: 'bloqueo', nombre: 'Chūdan soto-uke', kanji: '中段外受け', traduccion: 'Bloqueo de afuera hacia adentro',
        icono: 'bi-box-arrow-in-right', frase: 'El brazo viene desde atrás de la oreja y barre hacia el centro.',
        posicion: 'Zenkutsu-dachi, cadera en hanmi', nivel: 'Chūdan (tronco)', superficie: 'Antebrazo', contra: 'Oi-zuki chūdan',
        pasos: [
            'Preparación: el puño sube junto a la oreja del mismo lado, con el codo alto; la otra mano va adelante.',
            'El brazo gira de afuera hacia adentro, junto con la cadera.',
            'Termina con el codo doblado (unos 90°), el puño a la altura del hombro y el codo a un puño del cuerpo.',
            'La otra mano regresa a la cadera (hikite).',
        ],
        claves: ['El codo no se pega al cuerpo ni se aleja demasiado: a un puño.', 'El puño no pasa más allá del centro del cuerpo.'],
        errores: ['Bloquear solo con el brazo, sin girar la cadera', 'Puño más alto que la cabeza o más bajo que el pecho', 'Brazo demasiado estirado'],
    },
    {
        id: 'uchiuke', tipo: 'bloqueo', nombre: 'Chūdan uchi-uke', kanji: '中段内受け', traduccion: 'Bloqueo de adentro hacia afuera',
        icono: 'bi-box-arrow-right', frase: 'El brazo sale desde la axila contraria y abre hacia afuera.',
        posicion: 'Zenkutsu-dachi o Kokutsu-dachi', nivel: 'Chūdan (tronco)', superficie: 'Antebrazo', contra: 'Oi-zuki chūdan',
        pasos: [
            'Preparación: el puño del brazo que bloquea va debajo de la axila contraria; la otra mano adelante.',
            'El antebrazo barre de adentro hacia afuera, girando al final.',
            'Termina con el puño a la altura del hombro, el codo doblado y a un puño del cuerpo.',
            'La otra mano regresa a la cadera (hikite).',
        ],
        claves: ['El codo es el eje: casi no se mueve, el que barre es el antebrazo.', 'Gira la cadera a hanmi con el bloqueo.'],
        errores: ['Abrir el brazo más allá del hombro', 'Codo pegado o muy separado del cuerpo', 'Hacerlo lento y sin kime'],
    },
    {
        id: 'gedanbarai', tipo: 'bloqueo', nombre: 'Gedan-barai', kanji: '下段払い', traduccion: 'Barrido hacia abajo',
        icono: 'bi-arrow-down-circle', frase: 'Barre hacia abajo para quitar una patada o un golpe bajo.',
        posicion: 'Zenkutsu-dachi, cadera en hanmi', nivel: 'Gedan (bajo)', superficie: 'Antebrazo', contra: 'Mae-geri chūdan',
        pasos: [
            'Preparación: el puño va junto a la oreja contraria, con la palma hacia la cara; la otra mano se estira abajo y al frente.',
            'El brazo baja en diagonal cruzando el cuerpo.',
            'Termina con el brazo casi recto, el puño a unos dos puños por encima de la rodilla delantera.',
            'La otra mano regresa a la cadera (hikite).',
        ],
        claves: ['Es el primer movimiento de casi todos los Heian.', 'Barre de lado, no golpees la patada de frente.'],
        errores: ['Terminar con el puño muy afuera de la rodilla', 'Inclinar el tronco hacia adelante', 'Doblar mucho el codo'],
    },
    {
        id: 'shutouke', tipo: 'bloqueo', nombre: 'Shutō-uke', kanji: '手刀受け', traduccion: 'Bloqueo con mano de sable',
        icono: 'bi-hand-index', frase: 'Mano abierta como un sable, en posición atrasada.',
        posicion: 'Kokutsu-dachi', nivel: 'Chūdan (tronco)', superficie: 'Shutō (canto de la mano)', contra: 'Oi-zuki chūdan',
        pasos: [
            'Preparación: la mano que bloquea, abierta, va junto a la oreja contraria; la otra se estira al frente.',
            'La mano baja cortando en diagonal y gira al final para bloquear con el canto (shutō).',
            'Termina con la mano a la altura del hombro y el codo a un puño del cuerpo.',
            'La otra mano, abierta y con la palma arriba, queda frente al plexo solar.',
        ],
        claves: ['Los dedos juntos y firmes, el pulgar doblado.', 'El peso va atrás: 70 % en la pierna trasera.'],
        errores: ['Dedos separados o flojos', 'Mano de atrás en la cadera (aquí va frente al pecho)', 'Peso adelante'],
    },

    /* ---------- CONTRAATAQUES (bloqueo + golpe) ---------- */
    {
        id: 'ageuke-gyaku', tipo: 'contraataque', nombre: 'Age-uke + gyaku-zuki', kanji: '揚げ受け・逆突き', traduccion: 'Bloqueo arriba y golpe al revés',
        icono: 'bi-1-circle', frase: 'Te atacan a la cara: bloqueas arriba y golpeas al cuerpo.',
        posicion: 'Zenkutsu-dachi', nivel: 'Defensa jōdan → golpe chūdan', superficie: 'Antebrazo → seiken', contra: 'Oi-zuki jōdan',
        pasos: [
            'Tu compañero avanza con oi-zuki jōdan (golpe a la cara).',
            'Retrocedes con la pierna derecha a Zenkutsu-dachi (queda la izquierda adelante) y haces age-uke con el brazo izquierdo.',
            'Sin dar pasos, giras la cadera de hanmi a shōmen y lanzas gyaku-zuki chūdan con el puño derecho.',
            'El brazo izquierdo regresa a la cadera (hikite) al mismo tiempo que sale el golpe.',
            'Kime y ¡kiai! Luego te quedas en guardia, mirando (zanshin).',
        ],
        claves: ['Bloqueo y golpe son casi un solo movimiento: ¡no te quedes quieto después de bloquear!', 'La fuerza del golpe sale del giro de cadera.'],
        errores: ['Contraatacar sin girar la cadera', 'Subir el tronco al golpear', 'Bajar la guardia después del golpe'],
    },
    {
        id: 'sotouke-gyaku', tipo: 'contraataque', nombre: 'Soto-uke + gyaku-zuki', kanji: '外受け・逆突き', traduccion: 'Bloqueo de afuera y golpe al revés',
        icono: 'bi-2-circle', frase: 'Te atacan al cuerpo: barres hacia adentro y contraatacas.',
        posicion: 'Zenkutsu-dachi', nivel: 'Defensa chūdan → golpe chūdan', superficie: 'Antebrazo → seiken', contra: 'Oi-zuki chūdan',
        pasos: [
            'Tu compañero avanza con oi-zuki chūdan (golpe al cuerpo).',
            'Retrocedes con la pierna derecha a Zenkutsu-dachi y haces soto-uke con el brazo izquierdo.',
            'Giras la cadera a shōmen y lanzas gyaku-zuki chūdan con el puño derecho.',
            'Hikite con el brazo izquierdo, kime y ¡kiai!',
            'Zanshin: sigues mirando a tu compañero.',
        ],
        claves: ['La cadera gira dos veces: a hanmi con el bloqueo y a shōmen con el golpe.', 'Golpea al centro del cuerpo, a la altura del plexo solar.'],
        errores: ['Bloquear tarde, cuando el golpe ya llegó', 'Golpe con el brazo solo', 'Mirar al suelo'],
    },
    {
        id: 'uchiuke-gyaku', tipo: 'contraataque', nombre: 'Uchi-uke + gyaku-zuki', kanji: '内受け・逆突き', traduccion: 'Bloqueo de adentro y golpe al revés',
        icono: 'bi-3-circle', frase: 'Abres el golpe hacia afuera y respondes con el otro puño.',
        posicion: 'Zenkutsu-dachi', nivel: 'Defensa chūdan → golpe chūdan', superficie: 'Antebrazo → seiken', contra: 'Oi-zuki chūdan',
        pasos: [
            'Tu compañero avanza con oi-zuki chūdan.',
            'Retrocedes con la pierna derecha a Zenkutsu-dachi y haces uchi-uke con el brazo izquierdo.',
            'Giras la cadera a shōmen y lanzas gyaku-zuki chūdan con el puño derecho.',
            'Hikite, kime y ¡kiai!',
            'Zanshin.',
        ],
        claves: ['Con uchi-uke el brazo del compañero queda abierto: el camino al centro está libre.', 'Primero bien lento, luego más rápido.'],
        errores: ['Abrir demasiado el bloqueo', 'Golpear antes de bloquear', 'Pies en la misma línea (pierdes equilibrio)'],
    },
    {
        id: 'gedan-gyaku', tipo: 'contraataque', nombre: 'Gedan-barai + gyaku-zuki', kanji: '下段払い・逆突き', traduccion: 'Barrido bajo y golpe al revés',
        icono: 'bi-4-circle', frase: 'Te lanzan una patada: la barres hacia un lado y golpeas.',
        posicion: 'Zenkutsu-dachi', nivel: 'Defensa gedan → golpe chūdan', superficie: 'Antebrazo → seiken', contra: 'Mae-geri chūdan',
        pasos: [
            'Tu compañero lanza mae-geri chūdan (patada de frente) con la pierna derecha.',
            'Retrocedes con la pierna derecha a Zenkutsu-dachi y haces gedan-barai con el brazo izquierdo, barriendo la patada hacia un lado.',
            'Giras la cadera a shōmen y lanzas gyaku-zuki chūdan con el puño derecho.',
            'Hikite, kime y ¡kiai!',
            'Zanshin.',
        ],
        claves: ['Retrocede lo suficiente para que la patada no te alcance.', 'En pareja, el que patea lo hace despacio y controlado.'],
        errores: ['Bloquear la patada de frente en vez de barrerla', 'Inclinarse hacia adelante', 'Quedarse lejos para el contraataque'],
    },
    {
        id: 'shutouke-maegeri', tipo: 'contraataque', nombre: 'Shutō-uke + mae-geri', kanji: '手刀受け・前蹴り', traduccion: 'Mano de sable y patada de frente',
        icono: 'bi-5-circle', frase: 'Bloqueas en posición atrasada y pateas con la pierna libre.',
        posicion: 'Kokutsu-dachi', nivel: 'Defensa chūdan → patada chūdan', superficie: 'Shutō → koshi', contra: 'Oi-zuki chūdan',
        pasos: [
            'Tu compañero avanza con oi-zuki chūdan.',
            'Retrocedes con la pierna derecha a Kokutsu-dachi y haces shutō-uke con la mano izquierda.',
            'Como el peso está atrás, la pierna izquierda (delantera) está libre: lanza mae-geri chūdan con ella, golpeando con el koshi.',
            'Recoge la pierna rápido y vuelve a Kokutsu-dachi o pasa a Zenkutsu-dachi con gyaku-zuki.',
            'Kiai y zanshin.',
        ],
        claves: ['Kokutsu-dachi deja la pierna delantera sin peso: ¡lista para patear!', 'Dedos del pie recogidos hacia arriba en la patada.'],
        errores: ['Pasar el peso adelante antes de patear', 'Dejar la pierna estirada después de la patada', 'Bajar las manos al patear'],
    },
];

const TIPOS_DEFENSA = {
    bloqueo:      { nombre: 'Bloqueos (uke)' },
    contraataque: { nombre: 'Contraataques' },
};

// Las técnicas también se repasan en tarjetas y en el quiz
VOCABULARIO.tecnicas = {
    nombre: 'Técnicas (golpes y bloqueos)', icono: 'bi-lightning-charge',
    palabras: [
        ['Uke', '受け', 'Bloqueo'],
        ['Tsuki', '突き', 'Golpe de puño'],
        ['Geri', '蹴り', 'Patada'],
        ['Age-uke', '揚げ受け', 'Bloqueo hacia arriba (protege la cara)'],
        ['Soto-uke', '外受け', 'Bloqueo de afuera hacia adentro'],
        ['Uchi-uke', '内受け', 'Bloqueo de adentro hacia afuera'],
        ['Gedan-barai', '下段払い', 'Barrido hacia abajo'],
        ['Shutō-uke', '手刀受け', 'Bloqueo con mano de sable'],
        ['Oi-zuki', '追い突き', 'Golpe avanzando, con el puño del lado de la pierna adelantada'],
        ['Gyaku-zuki', '逆突き', 'Golpe con el puño contrario a la pierna adelantada'],
        ['Mae-geri', '前蹴り', 'Patada de frente'],
        ['Kiai', '気合', 'Grito que acompaña al kime'],
        ['Rei', '礼', 'Saludo'],
        ['Kumite', '組手', 'Combate / práctica en pareja'],
    ],
};

// Las posiciones también se pueden repasar como tarjetas y en el quiz
VOCABULARIO.posiciones = {
    nombre: 'Posiciones (dachi)', icono: 'bi-person-arms-up',
    palabras: POSICIONES.map((p) => [p.nombre, p.kanji, p.traduccion]),
};
