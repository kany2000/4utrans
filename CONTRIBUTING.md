# 🤝 Contributing to QuickTranslate

Thank you for your interest in contributing! 🎉

## 🚀 How to Contribute

### 🐛 Report Bugs
Found a bug? Please [open an Issue](../../issues/new?template=bug_report.md) with:
- Clear description
- Steps to reproduce
- Your OS and extension version
- Screenshots if helpful

### 💡 Suggest Features
Have an idea? [Open a Feature Request](../../issues/new?template=feature_request.md) and tell us:
- What problem does it solve?
- Who would benefit?
- Any implementation ideas?

### 🛠️ Submit Code

**Workflow:**
1. 🍴 Fork the repository
2. 🌿 Create a branch: `git checkout -b feature/your-feature-name`
3. ✏️ Make your changes (follow the code style below)
4. ✅ Test locally in Chrome (developer mode)
5. 📝 Commit: `git commit -m 'Add: your feature'`
6. 🚀 Push: `git push origin feature/your-feature-name`
7. 🔄 Open a Pull Request

### 📋 Code Style

- **JavaScript**: Use meaningful variable names, add comments for complex logic
- **CSS**: Follow BEM naming or keep it consistent with existing code
- **No console.log** in production code
- **Test** your changes before submitting

### 🧪 Local Testing

```bash
# 1. Clone your fork
git clone https://github.com/YOUR_USERNAME/QuickTranslate.git
cd QuickTranslate

# 2. Load in Chrome
#    chrome://extensions → Developer mode ON → "Load unpacked" → select folder

# 3. Test the feature
#    Make sure no console errors in background.js and content.js
```

### 📖 Documentation

- Update README.md if you add new features
- Add comments to complex code
- Keep docs in English (README has i18n versions)

## 📋 Development Setup

```bash
# No build step needed! Manifest V3 extensions work directly.
# Just edit files and reload in chrome://extensions
```

## 💬 Questions?

- Open a [Discussion](../../discussions)
- Or tag me in an Issue

---

**By contributing, you agree that your contributions will be licensed under the MIT License.**
