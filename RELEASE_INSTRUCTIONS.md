# 🚀 GitHub Releases 发布指南

## 📦 快速发布流程

### 1️⃣ **准备发布**

#### 📝 更新版本信息
```json
// manifest.json
{
  "version": "1.3.0"
}
```

#### 📋 更新变更日志
```markdown
// CHANGELOG.md
## [1.3.0] - 2025-01-20
### 新增功能
- 功能描述...
```

### 2️⃣ **生成发布包**

#### 🖥️ Windows (PowerShell)
```powershell
# 运行打包脚本
.\build-release.ps1 -Version "1.3.0"

# 输出文件
releases/4utrans-v1.3.0-user.zip     # 用户版本 (~70KB)
releases/4utrans-v1.3.0-dev.zip      # 开发者版本 (~180KB)
```

#### 🐧 Linux/macOS (Bash)
```bash
# 给脚本执行权限
chmod +x build-release.sh

# 运行打包脚本
./build-release.sh 1.3.0

# 输出文件
releases/4utrans-v1.3.0-user.zip     # 用户版本
releases/4utrans-v1.3.0-dev.zip      # 开发者版本
```

### 3️⃣ **创建GitHub Release**

#### 🌐 访问发布页面
```
https://github.com/kany2000/4utrans/releases/new
```

#### 📝 填写发布信息
```
Tag version: v1.3.0
Release title: 4utrans v1.3.0 - 智能翻译助手重大更新
Target: main
```

#### 📄 发布描述模板
```markdown
## 🚀 4utrans v1.3.0 - 智能翻译助手重大更新

### ✨ 主要更新
- **快捷键优化** - 默认快捷键更改为Alt+1，更符合用户习惯
- **界面间距优化** - 精细调整布局，消除多余空白，视觉更紧凑美观
- **项目结构优化** - 清理临时文件，保留核心功能，项目结构更加清晰专业

### 📦 下载选项

| 版本类型 | 文件名 | 适用用户 | 大小 |
|---------|--------|----------|------|
| 🎯 **用户版本** | `4utrans-v1.3.0-user.zip` | 普通用户，直接安装使用 | ~70KB |
| 🔧 **开发者版本** | `4utrans-v1.3.0-dev.zip` | 开发者，包含源码和资源 | ~180KB |

### 🛠️ 安装方法
1. 下载对应版本的ZIP文件
2. 解压到本地文件夹
3. 打开Chrome浏览器 → `chrome://extensions/`
4. 开启"开发者模式" → 点击"载入未封装项目"
5. 选择解压后的文件夹

### 🚀 快速开始
- 按 `Alt+1` 启动智能翻译
- 拖拽选择要翻译的文字区域
- 自动显示翻译结果

详细说明请查看 [README.md](https://github.com/kany2000/4utrans#readme)

---
**⭐ 如果这个项目对您有帮助，请给我们一个星标！**
```

#### 📎 上传文件
- 拖拽或选择 `4utrans-v1.3.0-user.zip`
- 拖拽或选择 `4utrans-v1.3.0-dev.zip`

#### ✅ 发布设置
- ✅ Set as the latest release
- ✅ Create a discussion for this release (可选)

### 4️⃣ **发布后验证**

#### 🔍 检查项目
- [ ] Release页面显示正常
- [ ] 下载链接可用
- [ ] ZIP文件可以正常解压
- [ ] Chrome扩展可以正常安装

#### 📢 通知用户
- 更新README.md中的版本信息
- 在项目讨论区发布更新通知
- 回复相关Issue提及新版本

## 📋 发布包内容

### 🎯 用户版本 (`4utrans-v1.3.0-user.zip`)
```
4utrans-v1.3.0-user/
├── manifest.json          # 扩展配置
├── background.js           # 后台服务
├── content.js             # 内容脚本
├── content.css            # 内容样式
├── popup.html             # 弹窗界面
├── popup.js               # 弹窗逻辑
├── popup.css              # 弹窗样式
├── icons/                 # 扩展图标
├── README.md              # 项目说明
├── LICENSE                # 开源许可证
└── CHANGELOG.md           # 版本历史
```

### 🔧 开发者版本 (`4utrans-v1.3.0-dev.zip`)
```
4utrans-v1.3.0-dev/
├── 📦 用户版本所有文件
├── src/                   # 源代码模块
│   ├── content/
│   └── shared/
├── images/                # 界面截图
├── test_page.html         # 测试页面
├── test_translation.html  # 翻译测试
├── USER_GUIDE.md          # 用户指南
├── .gitignore             # Git忽略配置
└── .gitattributes         # Git属性配置
```

## 🎯 发布最佳实践

### ✅ 发布前检查
- [ ] 所有功能测试通过
- [ ] 版本号已更新
- [ ] CHANGELOG.md已更新
- [ ] README.md信息准确
- [ ] 没有调试代码或临时文件

### 📝 版本命名规范
- **主版本**: `v1.0.0` - 重大功能更新
- **次版本**: `v1.1.0` - 新功能添加
- **修订版**: `v1.1.1` - Bug修复

### 🏷️ 标签管理
```bash
# 创建标签
git tag -a v1.3.0 -m "Release v1.3.0"

# 推送标签
git push origin v1.3.0

# 删除标签 (如需要)
git tag -d v1.3.0
git push origin :refs/tags/v1.3.0
```

## 🔄 自动化发布 (可选)

### 📝 GitHub Actions工作流
创建 `.github/workflows/release.yml`:

```yaml
name: Create Release
on:
  push:
    tags: ['v*']
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Build packages
      run: |
        chmod +x build-release.sh
        ./build-release.sh ${GITHUB_REF#refs/tags/v}
    - name: Create Release
      uses: softprops/action-gh-release@v1
      with:
        files: releases/*.zip
        generate_release_notes: true
```

### 🚀 自动发布流程
```bash
# 创建并推送标签即可自动发布
git tag v1.3.0
git push origin v1.3.0
```

---

**🎉 发布指南完成！按照以上步骤即可创建专业的GitHub Releases！**
