# QuickTranslate Build Script for Chrome Web Store
$ErrorActionPreference = "Stop"

$ProjectRoot = $PSScriptRoot
$OutputFile = Join-Path $ProjectRoot "quicktranslate-webstore.zip"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "QuickTranslate WebStore Build" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Clean previous build
if (Test-Path $OutputFile) {
    Remove-Item -Force $OutputFile
    Write-Host "[CLEAN] Removed old build" -ForegroundColor Yellow
}

# Files to include
$Files = @(
    "manifest.json",
    "background.js",
    "content.js",
    "content.css",
    "quick-panel.js",
    "quick-panel.css",
    "float-panel.js",
    "float-panel.css",
    "popup.html",
    "popup.js",
    "tesseract.min.js",
    "i18n.js"
)

$TempDir = Join-Path $ProjectRoot "_build_temp"
if (Test-Path $TempDir) {
    Remove-Item -Recurse -Force $TempDir
}
New-Item -ItemType Directory -Path $TempDir | Out-Null

# Copy files
Write-Host "[BUILD] Copying files..." -ForegroundColor Yellow
foreach ($file in $Files) {
    $src = Join-Path $ProjectRoot $file
    if (Test-Path $src) {
        Copy-Item $src $TempDir
        Write-Host "  + $file" -ForegroundColor Green
    } else {
        Write-Host "  ! $file NOT FOUND" -ForegroundColor Red
    }
}

# Copy icons folder
$IconsSrc = Join-Path $ProjectRoot "icons"
$IconsDest = Join-Path $TempDir "icons"
if (Test-Path $IconsSrc) {
    Copy-Item $IconsSrc $TempDir -Recurse
    Write-Host "  + icons/" -ForegroundColor Green
}

# Create ZIP
Write-Host ""
Write-Host "[BUILD] Creating ZIP archive..." -ForegroundColor Yellow
Compress-Archive -Path (Join-Path $TempDir "*") -DestinationPath $OutputFile

# Cleanup
Remove-Item -Recurse -Force $TempDir

$Size = [math]::Round((Get-Item $OutputFile).Length / 1KB, 2)
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "[DONE] Build complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "Output: $OutputFile" -ForegroundColor White
Write-Host "Size: $Size KB" -ForegroundColor White
Write-Host ""
Write-Host "Ready for Chrome Web Store upload!" -ForegroundColor Cyan
