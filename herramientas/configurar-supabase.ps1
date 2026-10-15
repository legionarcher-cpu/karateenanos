<#  ==================================================
    KARATE PARA LOS ENANOS · CONFIGURAR SUPABASE
    Lo abre "Configurar Supabase.bat" (en la carpeta principal).

    Pide la URL del proyecto y la clave anon (o publishable) de Supabase, revisa que
    no sea la clave secreta, prueba la conexión (que exista la función kara_estado del
    archivo sql/kara_supabase.sql) y las guarda en js/supabase.js.
    También cambia el ?v= de js/supabase.js en index.html para que el navegador
    tome la configuración nueva.

    Uso sin preguntas (opcional):
      configurar-supabase.ps1 -Url https://xxxx.supabase.co -Clave eyJ...   (guardar)
      configurar-supabase.ps1 -Borrar                                       (volver a "solo este navegador")
    ================================================== #>
param([string]$Url, [string]$Clave, [switch]$Borrar, [switch]$SinProbar)

$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12  # Supabase pide TLS 1.2

$Raiz = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$ArchivoJs = Join-Path $Raiz 'js\supabase.js'
$ArchivoIndex = Join-Path $Raiz 'index.html'
$Utf8 = New-Object Text.UTF8Encoding $false

function Titulo($texto) { Write-Host ''; Write-Host "  $texto" -ForegroundColor Yellow }
function Bien($texto) { Write-Host "  [OK] $texto" -ForegroundColor Green }
function Mal($texto) { Write-Host "  [X]  $texto" -ForegroundColor Red }
function Nota($texto) { Write-Host "       $texto" -ForegroundColor DarkGray }

# Escribe la URL y la clave en js/supabase.js y cambia el ?v= en index.html
function Save-Configuracion([string]$u, [string]$c) {
    $js = [IO.File]::ReadAllText($ArchivoJs, $Utf8)
    $js = [regex]::Replace($js, "const SUPABASE_URL = '[^']*';", "const SUPABASE_URL = '$u';")
    $js = [regex]::Replace($js, "const SUPABASE_ANON_KEY = '[^']*';", "const SUPABASE_ANON_KEY = '$c';")
    [IO.File]::WriteAllText($ArchivoJs, $js, $Utf8)
    $html = [IO.File]::ReadAllText($ArchivoIndex, $Utf8)
    $html = [regex]::Replace($html, 'js/supabase\.js\?v=[^"]*', "js/supabase.js?v=$(Get-Date -Format 'yyyyMMddHHmm')")
    [IO.File]::WriteAllText($ArchivoIndex, $html, $Utf8)
}

# Lee lo que dice por dentro una clave JWT: role (anon o service_role) y ref (de qué proyecto es)
function Get-DatosJwt([string]$jwt) {
    try {
        $parte = $jwt.Split('.')[1].Replace('-', '+').Replace('_', '/')
        while ($parte.Length % 4) { $parte += '=' }
        return [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($parte)) | ConvertFrom-Json
    } catch { return $null }
}
function Get-RolJwt([string]$jwt) { $d = Get-DatosJwt $jwt; if ($d) { $d.role } }

Clear-Host
Titulo 'KARATE PARA LOS ENANOS - CONFIGURAR SUPABASE'
Nota 'Guarda la URL y la clave publica de Supabase en js/supabase.js.'
Nota 'Antes: ejecutar sql/kara_supabase.sql en Supabase (SQL Editor > New query > Run).'

# ---------- Volver a "solo este navegador" ----------
if ($Borrar) {
    Save-Configuracion '' ''
    Bien 'Se quito la conexion: la pagina vuelve a guardar todo en cada navegador.'
    exit 0
}

# ---------- Valores actuales ----------
$actual = [IO.File]::ReadAllText($ArchivoJs, $Utf8)
$urlActual = [regex]::Match($actual, "const SUPABASE_URL = '([^']*)';").Groups[1].Value
if ($urlActual) { Nota "Configuracion actual: $urlActual" } else { Nota 'Configuracion actual: ninguna (solo este navegador).' }

# ---------- URL ----------
Titulo '1. URL del proyecto'
Nota 'Supabase > tu proyecto > Project Settings > API > "Project URL"'
while ($true) {
    if (-not $Url) { $Url = Read-Host '  Pega la URL (ej. https://abcdefgh.supabase.co)' }
    $Url = $Url.Trim().TrimEnd('/') -replace '/rest/v1.*$', ''
    if ($Url -match '^https://[a-z0-9-]+\.supabase\.co$') { Bien $Url; break }
    if ($Url -match '^https://\S+$') { Nota 'No parece una URL de supabase.co, pero se usara igual.'; break }
    Mal 'Tiene que empezar con https:// (ej. https://abcdefgh.supabase.co)'
    $Url = ''
}

# ---------- Clave ----------
Titulo '2. Clave publica (anon / publishable)'
Nota 'Project Settings > API > "anon public" (empieza con eyJ...) o "publishable" (sb_publishable_...)'
Nota 'NUNCA la "service_role" ni la "secret".'
while ($true) {
    if (-not $Clave) { $Clave = Read-Host '  Pega la clave' }
    $Clave = $Clave.Trim()
    if ($Clave -like 'sb_secret_*') { Mal 'Esa es la clave SECRETA. Usa la "publishable" o la "anon public".'; $Clave = ''; continue }
    if ($Clave -like 'sb_publishable_*') { Bien 'Clave publishable'; break }
    if ($Clave -match '^eyJ[\w-]+\.[\w-]+\.[\w-]+$') {
        $rol = Get-RolJwt $Clave
        if ($rol -eq 'service_role') { Mal 'Esa es la clave service_role (da control total). Usa la "anon public".'; $Clave = ''; continue }
        if ($rol -and $rol -ne 'anon') { Nota "La clave dice role=$rol; se esperaba anon." }
        # Cada proyecto tiene su propia clave: la clave dice de qué proyecto es (ref)
        $refClave = (Get-DatosJwt $Clave).ref
        $refUrl = if ($Url -match '^https://([a-z0-9-]+)\.supabase\.co$') { $Matches[1] } else { $null }
        if ($refClave -and $refUrl -and $refClave -ne $refUrl) {
            Mal "Esta clave es del proyecto '$refClave', pero la URL es del proyecto '$refUrl'."
            Nota 'La clave anon NO es de la cuenta: cada proyecto tiene la suya.'
            Nota "  - Si el SQL de Karate esta en el proyecto '$refUrl': copia la clave anon de ESE proyecto."
            Nota "  - Si quieres usar el proyecto '$refClave' (ej. el de Mystica): ejecuta ahi el SQL y usa"
            Nota "    la URL https://$refClave.supabase.co"
            $r = Read-Host "  Usar la URL https://$refClave.supabase.co con esta clave? (S/N)"
            if ($r -match '^[sS]') { $Url = "https://$refClave.supabase.co"; Bien "URL cambiada a $Url" }
            else { $Clave = ''; continue }
        }
        Bien 'Clave anon'
        break
    }
    Mal 'No parece una clave de Supabase (eyJ... o sb_publishable_...).'
    $Clave = ''
}

# ---------- Probar la conexión ----------
$guardar = $true
if (-not $SinProbar) {
    Titulo '3. Probando la conexion...'
    $cabeceras = @{ apikey = $Clave }
    if ($Clave.StartsWith('eyJ')) { $cabeceras.Authorization = "Bearer $Clave" }
    try {
        $estado = Invoke-RestMethod -Method Post -Uri "$Url/rest/v1/rpc/kara_estado" -Headers $cabeceras -ContentType 'application/json' -Body '{}' -TimeoutSec 20
        Bien "Conectado a '$($estado.dojo.nombre)'. Sobrinos guardados en la nube: $(@($estado.sobrinos).Count)"
    } catch {
        $codigo = $null; $detalle = ''
        if ($_.Exception.Response) {
            $codigo = [int]$_.Exception.Response.StatusCode
            try { $detalle = (New-Object IO.StreamReader($_.Exception.Response.GetResponseStream())).ReadToEnd() } catch { }
        }
        if ($codigo -eq 404 -or $detalle -match 'PGRST202') {
            Mal 'La URL y la clave estan bien, pero en ESTE proyecto no esta la funcion kara_estado.'
            Nota "Ejecuta sql/kara_supabase.sql en el proyecto $Url (SQL Editor > New query > Run)."
            Nota 'Si al ejecutarlo salio un error, no se creo nada: revisa el mensaje en Supabase.'
        } elseif ($detalle -match 'Invalid API key|No API key') {
            Mal 'Supabase dice que la clave no es valida para este proyecto.'
            Nota 'Copia la "anon public" de Project Settings > API de ESE mismo proyecto.'
        } elseif ($codigo -eq 401 -or $codigo -eq 403) {
            Mal 'Supabase no dejo usar la funcion (permiso). Vuelve a ejecutar sql/kara_supabase.sql completo.'
            Nota "Respuesta: $detalle"
        } elseif ($codigo) {
            Mal "Supabase respondio con error $codigo. $detalle"
        } else {
            Mal "No se pudo llegar a $Url (sin internet o URL equivocada)."
        }
        $r = Read-Host '  Guardar la configuracion de todas formas? (S/N)'
        $guardar = $r -match '^[sS]'
    }
}

# ---------- Guardar ----------
if ($guardar) {
    Save-Configuracion $Url $Clave
    Titulo 'Listo'
    Bien 'Guardado en js/supabase.js'
    Nota 'Si usas GitHub: sube los cambios (js/supabase.js e index.html).'
    Nota 'La primera vez que cada equipo abra la pagina, si la nube esta vacia, sube los sobrinos que tenia guardados.'
} else {
    Mal 'No se guardo nada.'
}
