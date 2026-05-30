# QuickTranslate Release Builder - Dev & User Versions
param(
    [Parameter(Mandatory=$true)]
    [string]$Version,
    [string]$OutputDir = "releases"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "QuickTranslate Build Script v$Version" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$ProjectRoot = $PSScriptRoot

# Create output directory
if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir | Out-Null
}

# Define file lists
$userFiles = @(
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
    "i18n.js",
    "icons",
    "README.md",
    "LICENSE"
)

$devFiles = $userFiles + @(
    "build-release.ps1",
    "build-release.sh",
    "build-webstore.ps1",
    "USER_GUIDE.md"
)

# Create user version
$userDir = "QuickTranslate-v$Version-user"
$userPath = Join-Path $OutputDir $userDir

Write-Host "[BUILD] Creating user version: $userDir" -ForegroundColor Yellow

if (Test-Path $userPath) {
    Remove-Item $userPath -Recurse -Force
}
New-Item -ItemType Directory -Path $userPath | Out-Null

foreach ($file in $userFiles) {
    $src = Join-Path $ProjectRoot $file
    if (Test-Path $src) {
        if (Test-Path $src -PathType Container) {
            Copy-Item $src $userPath -Recurse
        } else {
            Copy-Item $src $userPath
        }
        Write-Host "  + $file" -ForegroundColor Green
    } else {
        Write-Host "  ! $file NOT FOUND" -ForegroundColor Red
    }
}

# Create developer version
$devDir = "QuickTranslate-v$Version-dev"
$devPath = Join-Path $OutputDir $devDir

Write-Host ""
Write-Host "[BUILD] Creating dev version: $devDir" -ForegroundColor Yellow

if (Test-Path $devPath) {
    Remove-Item $devPath -Recurse -Force
}
New-Item -ItemType Directory -Path $devPath | Out-Null

foreach ($file in $devFiles) {
    $src = Join-Path $ProjectRoot $file
    if (Test-Path $src) {
        if (Test-Path $src -PathType Container) {
            Copy-Item $src $devPath -Recurse
        } else {
            Copy-Item $src $devPath
        }
        Write-Host "  + $file" -ForegroundColor Green
    } else {
        Write-Host "  ! $file NOT FOUND" -ForegroundColor Red
    }
}

# Create ZIP files
Write-Host ""
Write-Host "[BUILD] Creating ZIP packages..." -ForegroundColor Yellow

$userZip = Join-Path $OutputDir "$userDir.zip"
$devZip = Join-Path $OutputDir "$devDir.zip"

if (Test-Path $userZip) { Remove-Item $userZip -Force }
if (Test-Path $devZip) { Remove-Item $devZip -Force }

Compress-Archive -Path $userPath -DestinationPath $userZip -Force
Compress-Archive -Path $devPath -DestinationPath $devZip -Force

# Cleanup temp directories
Remove-Item $userPath -Recurse -Force
Remove-Item $devPath -Recurse -Force

# Results
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "[DONE] Build complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Output directory: $OutputDir" -ForegroundColor White

$userSize = [math]::Round((Get-Item $userZip).Length / 1KB, 2)
$devSize = [math]::Round((Get-Item $devZip).Length / 1KB, 2)
Write-Host "User version: $userDir.zip ($userSize KB)" -ForegroundColor Cyan
Write-Host "Dev version:   $devDir.zip ($devSize KB)" -ForegroundColor Cyan
Write-Host ""
