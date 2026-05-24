# 🚀 QuickTranslate - 快译

<br>

<p align="center">
  <img src="icons/icon128.png" alt="QuickTranslate" width="128"/>
</p>

<p align="center">
  <img alt="Version" src="https://img.shields.io/badge/version-2.5.0-667EEA?style=flat-square&logo=google-chrome"/>
  <img alt="Chrome" src="https://img.shields.io/badge/Chrome-Extension-blue?style=flat-square&logo=google-chrome"/>
  <img alt="License" src="https://img.shields.io/badge/license-MIT-764BA2?style=flat-square"/>
</p>

<p align="center">
  <strong>🌐 Language / 语言 / 言語 / 언어:</strong>
  <a href="README.md">中文</a> ·
  <a href="README-en.md">English</a> ·
  <a href="README-ja.md">日本語</a> ·
  <a href="README-ko.md">한국어</a> ·
  <a href="README-zh-TW.md">繁體中文</a>
</p>

---

> 🎉 **Select text to translate instantly**, supporting Google, Microsoft, GLM, LLM and other translation engines

**QuickTranslate** is a powerful Chrome browser extension featuring innovative DOM text extraction technology for precise web page text recognition and instant translation.

## ✨ Key Features

<details>
<summary>✨ <strong>Expand</strong></summary>

### 🌟 **Quick Translation Panel (New!)**
- **Select to Translate** - Automatically shows translation button after selecting text on webpage
- **One-click Translation** - Steps reduced from 5 to 2
- **Lightning Fast** - Translation speed improved by 75%, from ~2s to ~0.5s
- **Beautiful Panel** - Purple gradient theme floating translation panel
- **Smart Positioning** - Translation button appears near selected text
- **One-click Copy** - Quickly copy translation results to clipboard

### 🎯 **Precision Recognition Technology**
- **DOM Direct Extraction** - Skip OCR, extract text directly from web page structure, accuracy up to **98%+**
- **Smart Area Detection** - Multi-point sampling algorithm
- **Auto Filtering** - Automatically filter CSS styles, code snippets
- **Cache Optimization** - Smart caching mechanism

### 🧠 **Intelligent Language Processing**
- **AI Language Detection** - Based on deep character feature analysis, accuracy up to **99%+**
- **Multi-language Support** - Supports Japanese, Korean, English, Chinese and 10+ languages
- **Context Understanding** - Intelligent recognition of mixed language content
- **Simplified/Traditional Chinese** - Auto-detection

### ⚡ **Three Translation Modes**
- **Quick Translation** - Select text → Click button → View result (**Recommended for daily use**)
- **Screenshot Translation** - Alt+1 → Select area → OCR → Translate
- **Hover Translation** - Hold Alt → Hover over text → Auto-translate
- **Multi-engine** - Google + MyMemory backup, success rate **95%+**

### 🎨 **Modern Interface Design**
- **Intuitive Operation** - Drag to select, instant translation
- **Smooth Animations** - Beautiful visual feedback
- **Smart Hints** - Real-time status display
- **Responsive Design** - Adapts to different screen sizes

</details>
---

## 🤩 Version Highlights

## v2.5.0 (Current Version)
- Multi-language interface switching
- Supports 5 interface languages: Simplified Chinese, Traditional Chinese, English, Japanese, Korean
- Auto-detect browser default language
- Optimized display effects in different languages

<details>
<summary>✨ <strong>Version Details</strong></summary>

## 🚀 Independent Translation Panel + History + Word Book (New!)
- **Quick Panel** - Press `Ctrl+Shift+Q` to open floating panel
- **Translation History** - Auto-save up to 500 records
- **Word Book** - Save favorite translations
- **Save from All Methods** - Screenshot, selection, and hover translation all support saving

### 🌍 **Multi-language Interface**
- Supports **5 interface languages**
- Auto-detect browser language
- Manual switch via language selector
- Settings auto-save

## 🌟 Hover Translation (v2.1.2)
- Hold **Alt key** and hover over text to translate
- No text selection needed
- Beautiful floating bubble display
- Enable/disable in advanced settings

## 🚀 Quick Translation Panel (v2.0.0)

**Before (5 steps):**
1. Click extension icon
2. Click "Start Screenshot"
3. Select area
4. Wait for OCR
5. View result

**After (2 steps):**
1. Select text
2. Click translate button

**Performance:**
- Steps: 5 → 2 ⬇️ **60%**
- Speed: ~2s → ~0.5s ⬆️ **75%**

</details>

---

## 📦 Installation

### 🛠️ Developer Installation (Recommended)
```bash
# 1. Clone project
git clone https://github.com/kany2000/QuickTranslate.git
cd QuickTranslate

# 2. Install in Chrome
# Open Chrome → chrome://extensions/
# Enable "Developer mode"
# Click "Load unpacked"
# Select QuickTranslate folder
```

---

## 🚀 How to Use

### First Setup
1. **Open Settings** - Click 📷 icon in browser toolbar
2. **Configure Language** - Select target language and recognition language
3. **Save** - Click **"💾 Save"** button
4. **Start Using**

### Quick Keys (Recommended)
1. **Smart Translation** - Press `Alt+1`
2. **Select Text** - Drag to select area
3. **View Result** - Translation window appears

### Quick Panel (Ctrl+Shift+Q)
1. Press `Ctrl+Shift+Q` to open floating panel
2. Enter text and click translate
3. Copy or save results
4. Click × or ESC to close

### Hover Translation (Hold Alt)
1. Enable in advanced settings
2. Hold Alt key and hover over text
3. Translation bubble appears automatically
4. Release Alt to close

---

## 🎨 Interface Display

### Main Interface (v2.5.0)

```
┌─────────────────────────────────┐
│  QuickTranslate 快译            │
│  English                    v2.5.0│
├─────────────────────────────────┤
│  📷 Start Capture               │
│  Drag to select, auto-translate │
├─────────────────────────────────┤
│  Default: Alt+1 Smart Translate │
├─────────────────────────────────┤
│  Target: [English ▼]            │
│  OCR: [Auto Detect ▼]          │
│  💾 Save                        │
├─────────────────────────────────┤
│  📜 History    ⭐ Word Book     │
│  ⚙️ Advanced Settings           │
└─────────────────────────────────┘
```

### Quick Translation Panel

```
┌─────────────────────────────────────────┐
│  🌐 Quick Translate              ×     │
├─────────────────────────────────────────┤
│  Original                               │
│  "Hello World"                          │
├─────────────────────────────────────────┤
│  Translation                             │
│  你好世界                                │
├─────────────────────────────────────────┤
│  [⚡ Google]        [Copy] [Save]    │
└─────────────────────────────────────────┘
```

### Multi-Engine Results (v2.2.0)

```
┌─────────────────────────────────────────┐
│  ┌─ Google Translate ─────────────┐  │
│  │  你好世界                        │  │
│  │                          [Copy]  │  │
│  └──────────────────────────────────┘  │
│  ┌─ Microsoft ──────────────────────┐  │
│  │  你好世界                        │  │
│  │                          [Copy]  │  │
│  └──────────────────────────────────┘  │
│                                          │
│  ⚡ 2 succeeded, click to copy        │
└─────────────────────────────────────────┘
```

### Hover Translation Bubble

```
    ┌────────────────────────┐
    │  Hello World           │
    │  ────────────────    │
    │  你好世界               │
    └────────────────────────┘
              ↓
         (hover position)
```

---

## ⚙️ Settings

### Main Settings
- **Target Language** - Translation target language
- **OCR Language** - Text recognition language (Auto recommended)
- **Quick Save** - Save configuration immediately

### Advanced Settings
- **Translation Service** - Google, Microsoft, GLM, Custom LLM
- **API Configuration** - API keys for third-party services
- **Quick Panel** - Auto-show translation button after text selection
- **Hover Translation** - Hold Alt to translate (needs enable)
- **Multi-engine Comparison** - Show Google / Microsoft / LLM results
- **Auto Copy** - Auto-copy translation results
- **Shortcut Keys** - Custom shortcut combinations

### Shortcut Keys

#### Default Shortcuts
- **Alt+1** - Smart translation mode

#### Custom Shortcuts
1. Advanced Settings → Shortcut area
2. Click **"Change"** button
3. Press new key combination
4. Settings auto-save
5. Or set manually at `chrome://extensions/shortcuts`

---

## 🛠️ Technical Architecture

### 🏗️ Core Tech Stack
- **Manifest V3** - Latest Chrome extension standard
- **DOM API** - Direct text extraction technology
- **Fetch API** - Modern network requests
- **Chrome Extension APIs** - System-level integration
- **ES6+ Modules** - Modular architecture

### 🧠 Intelligent Algorithms
- **Multi-point Sampling** - Smart density adjustment
- **Character Feature Analysis** - High-precision language detection
- **Overlap Calculation** - Precise area detection
- **Cache Strategy** - LRU cache mechanism

---

## 📊 Performance

| Metric | Value | Description |
|------|-------|-------------|
| Text Recognition | 98%+ | DOM direct extraction |
| Language Detection | 99%+ | Smart feature analysis |
| Translation Success | 95%+ | Multi-engine support |
| Response Time | <500ms | Selection to result |
| Shortcut Response | <100ms | System-level shortcuts |
| Supported Languages | 10+ | Major languages |

---

## 🔧 FAQ

**Q: Shortcuts not working?**
A: Go to `chrome://extensions/shortcuts` to check and configure shortcuts.

**Q: Some text cannot be recognized?**
A: Ensure selected area contains clear text, avoid images or special formats.

**Q: Translation result is original text?**
A: Usually a language detection issue. Try reloading the extension.

**Q: Which languages are supported?**
A: Currently supports Japanese, Korean, English, etc. translated to Chinese.

---

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.

---

**⭐ If this project helps you, please give us a star!**

**🚀 Press Alt+1 to start your smart translation journey!**
