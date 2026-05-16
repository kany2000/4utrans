#!/bin/bash
# 4utrans Release Builder for Linux/macOS

VERSION=$1
OUTPUT_DIR=${2:-"releases"}

if [ -z "$VERSION" ]; then
    echo "❌ 错误: 请指定版本号"
    echo "用法: ./build-release.sh 1.3.0"
    exit 1
fi

echo "🚀 开始构建 4utrans v$VERSION 发布包..."

# 创建输出目录
mkdir -p "$OUTPUT_DIR"

# 检查manifest.json版本
if [ -f "manifest.json" ]; then
    CURRENT_VERSION=$(grep '"version"' manifest.json | sed 's/.*"version": "\([^"]*\)".*/\1/')
    if [ "$VERSION" != "$CURRENT_VERSION" ]; then
        echo "⚠️  警告: 指定版本 ($VERSION) 与manifest.json中的版本 ($CURRENT_VERSION) 不匹配"
        read -p "是否继续? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
else
    echo "⚠️  警告: 找不到manifest.json文件"
fi

# 定义文件列表
USER_FILES="manifest.json background.js content.js content.css popup.html popup.js popup.css icons README.md LICENSE CHANGELOG.md"
DEV_FILES="$USER_FILES src images test_page.html test_translation.html USER_GUIDE.md .gitignore .gitattributes"

# 创建用户版本
USER_DIR="4utrans-v$VERSION-user"
USER_PATH="$OUTPUT_DIR/$USER_DIR"

echo "📦 创建用户版本: $USER_DIR"
rm -rf "$USER_PATH"
mkdir -p "$USER_PATH"

for file in $USER_FILES; do
    if [ -e "$file" ]; then
        cp -r "$file" "$USER_PATH/"
        echo "  ✅ $file"
    else
        echo "  ⚠️  $file (不存在)"
    fi
done

# 创建开发者版本
DEV_DIR="4utrans-v$VERSION-dev"
DEV_PATH="$OUTPUT_DIR/$DEV_DIR"

echo "📦 创建开发者版本: $DEV_DIR"
rm -rf "$DEV_PATH"
mkdir -p "$DEV_PATH"

for file in $DEV_FILES; do
    if [ -e "$file" ]; then
        cp -r "$file" "$DEV_PATH/"
        echo "  ✅ $file"
    else
        echo "  ⚠️  $file (不存在)"
    fi
done

# 创建ZIP文件
echo "🗜️  创建ZIP压缩包..."
cd "$OUTPUT_DIR"

if command -v zip > /dev/null; then
    zip -r "$USER_DIR.zip" "$USER_DIR" > /dev/null 2>&1
    zip -r "$DEV_DIR.zip" "$DEV_DIR" > /dev/null 2>&1
    echo "  ✅ ZIP文件创建成功"
else
    echo "❌ 错误: 找不到zip命令，请安装zip工具"
    echo "  Ubuntu/Debian: sudo apt-get install zip"
    echo "  CentOS/RHEL: sudo yum install zip"
    echo "  macOS: zip命令应该已预装"
    cd ..
    exit 1
fi

cd ..

# 清理临时目录
rm -rf "$USER_PATH" "$DEV_PATH"

# 显示结果
echo ""
echo "🎉 发布包创建完成!"
echo ""
echo "📁 输出目录: $OUTPUT_DIR"
echo "📦 用户版本: $USER_DIR.zip"
echo "📦 开发者版本: $DEV_DIR.zip"
echo ""

# 显示文件大小
if [ -f "$OUTPUT_DIR/$USER_DIR.zip" ]; then
    USER_SIZE=$(du -h "$OUTPUT_DIR/$USER_DIR.zip" | cut -f1)
    echo "📊 文件大小:"
    echo "  用户版本: $USER_SIZE"
fi

if [ -f "$OUTPUT_DIR/$DEV_DIR.zip" ]; then
    DEV_SIZE=$(du -h "$OUTPUT_DIR/$DEV_DIR.zip" | cut -f1)
    echo "  开发者版本: $DEV_SIZE"
fi

echo ""
echo "🚀 下一步: 上传到GitHub Releases"
echo "  1. 前往 https://github.com/kany2000/4utrans/releases"
echo "  2. 点击 'Create a new release'"
echo "  3. 标签版本: v$VERSION"
echo "  4. 上传生成的ZIP文件"
echo ""
echo "💡 提示: 可以使用以下命令快速打开GitHub Releases页面"
echo "  xdg-open https://github.com/kany2000/4utrans/releases/new  # Linux"
echo "  open https://github.com/kany2000/4utrans/releases/new      # macOS"
