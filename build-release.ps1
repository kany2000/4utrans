# QuickTranslate Release Builder - Simplified Version
param(
    [Parameter(Mandatory=$true)]
    [string]$Version,
    [string]$OutputDir = "releases"
)

Write-Host "Building QuickTranslate v$Version release packages..." -ForegroundColor Green

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
    "popup.html",
    "popup.js",
    "popup.css",
    "icons",
    "README.md",
    "LICENSE",
    "CHANGELOG.md",
    "test_page.html"
)

$devFiles = $userFiles + @(
    "src",
    "images",
    "USER_GUIDE.md",
    ".gitignore",
    ".gitattributes"
)

# Create user version
$userDir = "QuickTranslate-v$Version-user"
$userPath = Join-Path $OutputDir $userDir

Write-Host "Creating user version: $userDir" -ForegroundColor Cyan

if (Test-Path $userPath) {
    Remove-Item $userPath -Recurse -Force
}
New-Item -ItemType Directory -Path $userPath | Out-Null

foreach ($file in $userFiles) {
    if (Test-Path $file) {
        if (Test-Path $file -PathType Container) {
            Copy-Item $file $userPath -Recurse
        } else {
            Copy-Item $file $userPath
        }
        Write-Host "  Added: $file" -ForegroundColor Green
    } else {
        Write-Host "  Missing: $file" -ForegroundColor Yellow
    }
}

# Create developer version
$devDir = "QuickTranslate-v$Version-dev"
$devPath = Join-Path $OutputDir $devDir

Write-Host "Creating developer version: $devDir" -ForegroundColor Cyan

if (Test-Path $devPath) {
    Remove-Item $devPath -Recurse -Force
}
New-Item -ItemType Directory -Path $devPath | Out-Null

foreach ($file in $devFiles) {
    if (Test-Path $file) {
        if (Test-Path $file -PathType Container) {
            Copy-Item $file $devPath -Recurse
        } else {
            Copy-Item $file $devPath
        }
        Write-Host "  Added: $file" -ForegroundColor Green
    } else {
        Write-Host "  Missing: $file" -ForegroundColor Yellow
    }
}

# Create ZIP files
Write-Host "Creating ZIP packages..." -ForegroundColor Cyan

$userZip = Join-Path $OutputDir "$userDir.zip"
$devZip = Join-Path $OutputDir "$devDir.zip"

# Remove existing ZIP files
if (Test-Path $userZip) { Remove-Item $userZip }
if (Test-Path $devZip) { Remove-Item $devZip }

# Compress files
try {
    Compress-Archive -Path $userPath -DestinationPath $userZip
    Compress-Archive -Path $devPath -DestinationPath $devZip
    Write-Host "  ZIP files created successfully" -ForegroundColor Green
} catch {
    Write-Error "Failed to create ZIP files: $($_.Exception.Message)"
    exit 1
}

# Clean up temporary directories
Remove-Item $userPath -Recurse -Force
Remove-Item $devPath -Recurse -Force

# Show results
Write-Host ""
Write-Host "Release packages created successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Output directory: $OutputDir" -ForegroundColor White
Write-Host "User version: $userDir.zip" -ForegroundColor White
Write-Host "Developer version: $devDir.zip" -ForegroundColor White
Write-Host ""

# Show file sizes
if (Test-Path $userZip) {
    $userSize = [math]::Round((Get-Item $userZip).Length / 1KB, 2)
    Write-Host "File sizes:" -ForegroundColor Cyan
    Write-Host "  User version: $userSize KB" -ForegroundColor White
}

if (Test-Path $devZip) {
    $devSize = [math]::Round((Get-Item $devZip).Length / 1KB, 2)
    Write-Host "  Developer version: $devSize KB" -ForegroundColor White
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Go to https://github.com/kany2000/QuickTranslate/releases" -ForegroundColor White
Write-Host "  2. Click 'Create a new release'" -ForegroundColor White
Write-Host "  3. Tag version: v$Version" -ForegroundColor White
Write-Host "  4. Upload the generated ZIP files" -ForegroundColor White