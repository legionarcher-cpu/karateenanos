/* ==================================================
   KARATE PARA LOS ENANOS · CONEXIÓN CON SUPABASE (opcional)

   Qué hace: llama a las funciones kara_* de la base (sql/kara_supabase.sql) para que
   los sobrinos y sus estrellas se guarden en la nube y se vean igual en todos los
   equipos (GitHub Pages, el lanzador, el celular del tío…). Lo usa js/perfiles.js.

   ▸ Las dos líneas de abajo las llena "Configurar Supabase.bat" (doble clic).
     También se pueden escribir a mano. Dónde se sacan:
       Supabase → tu proyecto → Project Settings → API (o "API Keys")
         SUPABASE_URL      → "Project URL"
         SUPABASE_ANON_KEY → "anon public" (empieza con eyJ…) o "publishable" (sb_publishable_…)

   - Si se dejan vacías, la página funciona igual: todo en este navegador.
   - La clave anon/publishable es PÚBLICA (está hecha para ir en la página).
   - NUNCA poner aquí la clave "service_role" ni "secret" (dan control total).
   ================================================== */

const SUPABASE_URL = 'https://vvqmrllafoqdriwwqaji.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2cW1ybGxhZm9xZHJpd3dxYWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA3OTM1NDYsImV4cCI6MjEwNjM2OTU0Nn0.K0-08H0JWuWnOrYaaM-Ab5jhnVQ-Wsr9ZX2kpfRXK8w';

const Nube = (() => {
    const configurada = !!(SUPABASE_URL && SUPABASE_ANON_KEY);

    // Llama a una función de la base: Nube.rpc('kara_estado')
    // Errores: err.sinConexion = true si no hubo internet
    async function rpc(nombre, parametros = {}) {
        const cabeceras = { apikey: SUPABASE_ANON_KEY, 'Content-Type': 'application/json' };
        // Las claves antiguas (eyJ…) también van como Authorization; las nuevas (sb_publishable_…) solo en apikey
        if (SUPABASE_ANON_KEY.startsWith('eyJ')) cabeceras.Authorization = `Bearer ${SUPABASE_ANON_KEY}`;
        let respuesta;
        try {
            respuesta = await fetch(`${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/rpc/${nombre}`, {
                method: 'POST',
                headers: cabeceras,
                body: JSON.stringify(parametros),
            });
        } catch (e) {
            const err = new Error('Sin conexión con Supabase');
            err.sinConexion = true;
            throw err;
        }
        const texto = await respuesta.text();
        let datos = null;
        try { datos = texto ? JSON.parse(texto) : null; } catch { datos = null; }
        if (!respuesta.ok) {
            const err = new Error((datos && datos.message) || `Error ${respuesta.status}`);
            err.codigo = datos && datos.code;
            throw err;
        }
        return datos;
    }

    return { configurada, rpc };
})();
