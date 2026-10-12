# Start een kleine testserver voor het spel. Gebruik:  rechtermuisknop > Uitvoeren met PowerShell, ga dan naar http://localhost:8765/
# Alleen nodig als je het 3D-model (model/bib.glb) lokaal wilt testen. Stoppen: venster sluiten.
param([string]$Root = (Split-Path -Parent $PSScriptRoot), [int]$Port = 8765)
$types = @{ '.html'='text/html; charset=utf-8'; '.js'='text/javascript; charset=utf-8'; '.css'='text/css; charset=utf-8';
            '.json'='application/json'; '.glb'='model/gltf-binary'; '.png'='image/png'; '.jpg'='image/jpeg'; '.svg'='image/svg+xml' }
$l = New-Object System.Net.HttpListener
$l.Prefixes.Add("http://localhost:$Port/")
$l.Start()
while ($l.IsListening) {
  $c = $l.GetContext()
  $p = [Uri]::UnescapeDataString($c.Request.Url.AbsolutePath).TrimStart('/')
  if ($p -eq '') { $c.Response.Redirect('/game/index.html'); $c.Response.Close(); continue }
  $f = Join-Path $Root $p
  if ((Test-Path $f -PathType Leaf) -and ($f.StartsWith($Root))) {
    $b = [IO.File]::ReadAllBytes($f)
    $e = [IO.Path]::GetExtension($f).ToLower()
    $c.Response.ContentType = $(if ($types.ContainsKey($e)) { $types[$e] } else { 'application/octet-stream' })
    $c.Response.Headers.Add('Cache-Control', 'no-store')
    $c.Response.OutputStream.Write($b, 0, $b.Length)
  } else { $c.Response.StatusCode = 404 }
  $c.Response.Close()
}

