#!/bin/bash

# 4utrans Release Builder - Unix/Linux/macOS Version

if [ -z "$1" ]; then
    echo "用法: ./build-release.sh <版本号>"
    echo "例如: ./build-release.sh 1.4.0"
    exit 1
fi

VERSION=$1
OUTPUT_DIR="releases"

echo "Building 4utrans v$VERSION release packages..."

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Define file lists
USER_FILES=(
    "manifest.json"
    "background.js"
    "content.js"
    "content.css"
    "popup.html"
    "popup.js"
    "popup.css"
    "icons"
    "README.md"
    "LICENSE"
    "CHANGELOG.md"
    "test_page.html"
)

DEV_FILES=(
    "manifest.json"
    "background.js"
    "content.js"
    "content.css"
    "popup.html"
    "popup.js"
    "popup.css"
    "icons"
    "README.md"
    "LICENSE"
    "CHANGELOG.md"
    "test_page.html"
    "src"
    "images"
    "USER_GUIDE.md"
)

# Create user version
USER_DIR="4utrans-v${VERSION}-user"
USER_PATH="$OUTPUT_DIR/$USER_DIR"

echo "Creating user version: $USER_DIR"

rm -rf "$USER_PATH"
mkdir -p "$USER_PATH"

for file in "${USER_FILES[@]}"; do
    if [ -e "$file" ]; then
        if [ -d "$file" ]; then
            cp -r "$file" "$USER_PATH/"
        else
            cp "$file" "$USER_PATH/"
        fi
        echo "  Added: $file"
    else
        echo "  Missing: $file"
    fi
done

# Create developer version
DEV_DIR="4utrans-v${VERSION}-dev"
DEV_PATH="$OUTPUT_DIR/$DEV_DIR"

echo "Creating developer version: $DEV_DIR"

rm -rf "$DEV_PATH"
mkdir -p "$DEV_PATH"

for file in "${DEV_FILES[@]}"; do
    if [ -e "$file" ]; then
        if [ -d "$file" ]; then
            cp -r "$file" "$DEV_PATH/"
        else
            cp "$file" "$DEV_PATH/"
        fi
        echo "  Added: $file"
    else
        echo "  Missing: $file"
    fi
done

# Create ZIP files
echo "Creating ZIP packages..."

# Ensure build scripts are not packaged
rm -f "$USER_PATH/build-release.sh" "$USER_PATH/build-release.ps1"
rm -f "$DEV_PATH/build-release.sh" "$DEV_PATH/build-release.ps1"

USER_ZIP="$OUTPUT_DIR/${USER_DIR}.zip"
DEV_ZIP="$OUTPUT_DIR/${DEV_DIR}.zip"

rm -f "$USER_ZIP"
rm -f "$DEV_ZIP"

zip -r "$USER_ZIP" "$USER_PATH"
zip -r "$DEV_ZIP" "$DEV_PATH"

# Clean up temporary directories
rm -rf "$USER_PATH"
rm -rf "$DEV_PATH"

# Show results
echo ""
echo "Release packages created successfully!"
echo ""
echo "Output directory: $OUTPUT_DIR"
echo "User version: $USER_DIR.zip"
echo "Developer version: $DEV_DIR.zip"
echo ""

# Show file sizes
if [ -f "$USER_ZIP" ]; then
    USER_SIZE=$(du -k "$USER_ZIP" | cut -f1)
    echo "File sizes:"
    echo "  User version: $USER_SIZE KB"
fi

if [ -f "$DEV_ZIP" ]; then
    DEV_SIZE=$(du -k "$DEV_ZIP" | cut -f1)
    echo "  Developer version: $DEV_SIZE KB"
fi

echo ""
echo "Next steps:"
echo "  1. Go to https://github.com/kany2000/4utrans/releases"
echo "  2. Click 'Create a new release'"
echo "  3. Tag version: v$VERSION"
echo "  4. Upload the generated ZIP files"
