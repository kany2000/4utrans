#!/bin/bash

# QuickTranslate Release Builder - Dev & User Versions
# Usage: ./build-release.sh <version>

set -e

if [ -z "$1" ]; then
    echo "Usage: ./build-release.sh <version>"
    echo "Example: ./build-release.sh 2.5.0"
    exit 1
fi

VERSION=$1
PROJECT_ROOT=$PWD
OUTPUT_DIR="$PROJECT_ROOT/releases"

echo "========================================"
echo "QuickTranslate Build Script v$VERSION"
echo "========================================"
echo ""

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Define file lists
USER_FILES=(
    "manifest.json"
    "background.js"
    "content.js"
    "content.css"
    "quick-panel.js"
    "quick-panel.css"
    "float-panel.js"
    "float-panel.css"
    "popup.html"
    "popup.js"
    "tesseract.min.js"
    "i18n.js"
    "icons"
    "README.md"
    "LICENSE"
)

DEV_FILES=(
    "manifest.json"
    "background.js"
    "content.js"
    "content.css"
    "quick-panel.js"
    "quick-panel.css"
    "float-panel.js"
    "float-panel.css"
    "popup.html"
    "popup.js"
    "tesseract.min.js"
    "i18n.js"
    "icons"
    "README.md"
    "LICENSE"
    "build-release.ps1"
    "build-release.sh"
    "build-webstore.ps1"
    "USER_GUIDE.md"
)

# Create user version
USER_DIR="QuickTranslate-v${VERSION}-user"
USER_PATH="$OUTPUT_DIR/$USER_DIR"

echo "[BUILD] Creating user version: $USER_DIR"
rm -rf "$USER_PATH"
mkdir -p "$USER_PATH"

for file in "${USER_FILES[@]}"; do
    src="$PROJECT_ROOT/$file"
    if [ -e "$src" ]; then
        if [ -d "$src" ]; then
            cp -r "$src" "$USER_PATH/"
        else
            cp "$src" "$USER_PATH/"
        fi
        echo "  + $file"
    else
        echo "  ! $file NOT FOUND"
    fi
done

# Create dev version
DEV_DIR="QuickTranslate-v${VERSION}-dev"
DEV_PATH="$OUTPUT_DIR/$DEV_DIR"

echo ""
echo "[BUILD] Creating dev version: $DEV_DIR"
rm -rf "$DEV_PATH"
mkdir -p "$DEV_PATH"

for file in "${DEV_FILES[@]}"; do
    src="$PROJECT_ROOT/$file"
    if [ -e "$src" ]; then
        if [ -d "$src" ]; then
            cp -r "$src" "$DEV_PATH/"
        else
            cp "$src" "$DEV_PATH/"
        fi
        echo "  + $file"
    else
        echo "  ! $file NOT FOUND"
    fi
done

# Create ZIP files
echo ""
echo "[BUILD] Creating ZIP packages..."

USER_ZIP="$OUTPUT_DIR/${USER_DIR}.zip"
DEV_ZIP="$OUTPUT_DIR/${DEV_DIR}.zip"

rm -f "$USER_ZIP"
rm -f "$DEV_ZIP"

cd "$OUTPUT_DIR"
zip -rq "$USER_DIR.zip" "$USER_DIR"
zip -rq "$DEV_DIR.zip" "$DEV_DIR"
cd - > /dev/null

# Cleanup temp directories
rm -rf "$USER_PATH"
rm -rf "$DEV_PATH"

# Results
echo ""
echo "========================================"
echo "[DONE] Build complete!"
echo "========================================"
echo ""
echo "Output directory: $OUTPUT_DIR"

USER_SIZE=$(du -k "$USER_ZIP" | cut -f1)
DEV_SIZE=$(du -k "$DEV_ZIP" | cut -f1)
echo "User version: $USER_DIR.zip ($USER_SIZE KB)"
echo "Dev version:   $DEV_DIR.zip ($DEV_SIZE KB)"
echo ""
