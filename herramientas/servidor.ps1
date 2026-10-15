<#  ==================================================
    KARATE PARA LOS ENANOS · MINI SERVIDOR LOCAL
    Lo abre "Abrir Karate.bat" (en la carpeta principal). Sirve la página en
    http://localhost:8765 y la abre en el navegador. No hay que instalar nada.

    - Siempre usa el MISMO puerto (8765): las estrellas de los sobrinos se guardan
      por dirección, si cambiara el puerto parecería que se borraron.
    - Solo responde a este PC (localhost); nadie de la red puede entrar.
    - Si ya está abierto (el puerto está ocupado), solo abre la página otra vez.
    - Para apagarlo: cerrar esta ventana.
    ================================================== #>
param([switch]$SinAbrir)  # -SinAbrir: enciende el servidor sin abrir el navegador (para pruebas)

$Puerto = 8765
$Raiz = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$Direccion = "http://localhost:$Puerto/"

$Tipos = @{
    '.html' = 'text/html; charset=utf-8'; '.css' = 'text/css; charset=utf-8'; '.js' = 'application/javascript; charset=utf-8'
    '.json' = 'application/json; charset=utf-8'; '.md' = 'text/plain; charset=utf-8'; '.txt' = 'text/plain; charset=utf-8'
    '.jpg' = 'image/jpeg'; '.jpeg' = 'image/jpeg'; '.png' = 'image/png'; '.webp' = 'image/webp'; '.gif' = 'image/gif'
    '.svg' = 'image/svg+xml'; '.ico' = 'image/x-icon'; '.mp4' = 'video/mp4'; '.webm' = 'video/webm'; '.mp3' = 'audio/mpeg'
    '.woff2' = 'font/woff2'; '.webmanifest' = 'application/manifest+json'
}

# Abre la página: Edge en modo app (ventana propia, sin barra) o el navegador predeterminado
function Open-Pagina {
    if ($SinAbrir) { return }
    $edge = @("${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe", "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe") |
        Where-Object { Test-Path $_ } | Select-Object -First 1
    if ($edge) { Start-Process $edge "--app=$Direccion" } else { Start-Process $Direccion }
}

$Host.UI.RawUI.WindowTitle = 'Karate para los Enanos - servidor (no cerrar mientras se usa)'
$servidor = New-Object System.Net.HttpListener
$servidor.Prefixes.Add($Direccion)
try {
    $servidor.Start()
} catch {
    # Ya hay uno abierto: solo se abre la página
    Open-Pagina
    exit
}

Write-Host ''
Write-Host '  KARATE PARA LOS ENANOS' -ForegroundColor Yellow
Write-Host "  La pagina esta abierta en $Direccion"
Write-Host '  Deja esta ventana abierta mientras la usan. Para apagar, cierrala.' -ForegroundColor DarkGray
Write-Host ''
Open-Pagina

while ($servidor.IsListening) {
    try {
        $c = $servidor.GetContext()
        $ruta = [Uri]::UnescapeDataString($c.Request.Url.AbsolutePath).TrimStart('/')
        if (-not $ruta -or $ruta.EndsWith('/')) { $ruta += 'index.html' }
        $archivo = [IO.Path]::GetFullPath((Join-Path $Raiz $ruta))

        # Solo se entregan archivos que estén dentro de la carpeta de la página
        if ($archivo.StartsWith($Raiz, [StringComparison]::OrdinalIgnoreCase) -and (Test-Path -LiteralPath $archivo -PathType Leaf)) {
            $bytes = [IO.File]::ReadAllBytes($archivo)
            $ext = [IO.Path]::GetExtension($archivo).ToLower()
            $c.Response.ContentType = if ($Tipos[$ext]) { $Tipos[$ext] } else { 'application/octet-stream' }
            $c.Response.Headers.Add('Cache-Control', 'no-cache')  # los cambios se ven al recargar
            $c.Response.ContentLength64 = $bytes.Length
            $c.Response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $c.Response.StatusCode = 404
        }
        $c.Response.Close()
    } catch {
        # Un pedido que se cortó (ej. se cerró la pestaña) no apaga el servidor
    }
}
