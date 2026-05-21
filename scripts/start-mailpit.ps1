# Arranca Mailpit en Windows sin Docker (SMTP 1025, UI http://localhost:8025).
# Uso: desde la raíz del repo —  pwsh -File .\scripts\start-mailpit.ps1
param(
  [switch]$DownloadOnly
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$toolsDir = Join-Path $root 'tools\mailpit'
New-Item -ItemType Directory -Force -Path $toolsDir | Out-Null

function Find-MailpitExe {
  Get-ChildItem -Path $toolsDir -Filter mailpit.exe -Recurse -ErrorAction SilentlyContinue |
    Select-Object -First 1
}

$exeInfo = Find-MailpitExe
if (-not $exeInfo) {
  Write-Host 'Descargando Mailpit desde GitHub (release estable)...'
  $osArch = [System.Runtime.InteropServices.RuntimeInformation]::OSArchitecture
  $zipName = if ($osArch -eq 'Arm64') { 'mailpit-windows-arm64.zip' } else { 'mailpit-windows-amd64.zip' }

  $rel = Invoke-RestMethod -Uri 'https://api.github.com/repos/axllent/mailpit/releases/latest' `
    -Headers @{ 'User-Agent' = 'BarberiaPage-MailpitSetup' }
  $asset = $rel.assets | Where-Object { $_.name -eq $zipName } | Select-Object -First 1
  if (-not $asset) {
    throw "No se encontró $zipName en el último release."
  }
  $zip = Join-Path $toolsDir 'mailpit-download.zip'
  Invoke-WebRequest -Uri $asset.browser_download_url -OutFile $zip -UseBasicParsing
  Expand-Archive -Path $zip -DestinationPath $toolsDir -Force
  Remove-Item $zip -Force
  $exeInfo = Find-MailpitExe
  if (-not $exeInfo) {
    throw 'mailpit.exe no apareció tras descomprimir. Revisa tools/mailpit.'
  }
}

if ($DownloadOnly) {
  Write-Host "Mailpit listo: $($exeInfo.FullName)"
  exit 0
}

Write-Host ''
Write-Host 'Mailpit en ejecución — Bandeja: http://localhost:8025   SMTP: 127.0.0.1:1025'
Write-Host 'Deja esta ventana abierta. Ctrl+C para detener.'
Write-Host ''
& $exeInfo.FullName
