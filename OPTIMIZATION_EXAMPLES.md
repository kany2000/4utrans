# 🔧 4utrans 优化示例

本文档展示了如何使用优化后的模块来改进项目性能和可维护性。

## 📊 性能监控使用示例

### 基本使用
```javascript
import performanceMonitor from './src/shared/performance-monitor.js';

// 在DOM提取开始时
performanceMonitor.startTimer('domExtraction', {
  areaSize: rect.width * rect.height,
  elementCount: document.querySelectorAll('*').length
});

// DOM提取完成时
const extractedText = await domExtractor.extractTextFromArea(rect);
const duration = performanceMonitor.endTimer('domExtraction', {
  textLength: extractedText.length,
  success: extractedText.length > 0
});

// 记录自定义指标
performanceMonitor.recordMetric('textExtractionSuccess', 1, {
  method: 'dom',
  language: detectedLanguage
});
```

### 翻译性能监控
```javascript
// 翻译开始
performanceMonitor.startTimer('translation', {
  service: 'google',
  sourceLanguage: sourceLang,
  targetLanguage: targetLang,
  textLength: text.length
});

try {
  const result = await translator.translate(text, sourceLang, targetLang);
  
  // 翻译成功
  performanceMonitor.endTimer('translation', {
    success: true,
    resultLength: result.length,
    confidence: result.confidence
  });
  
} catch (error) {
  // 翻译失败
  performanceMonitor.endTimer('translation', {
    success: false,
    error: error.message,
    retryCount: retryCount
  });
}
```

## 🎯 DOM提取器使用示例

### 基本文字提取
```javascript
import domExtractor from './src/content/dom-extractor.js';

// 提取指定区域的文字
const rect = { left: 100, top: 100, width: 200, height: 50 };
const extractedText = await domExtractor.extractTextFromArea(rect);

console.log('提取的文字:', extractedText);
console.log('缓存统计:', domExtractor.getCacheStats());
```

### 批量提取
```javascript
const areas = [
  { left: 100, top: 100, width: 200, height: 50 },
  { left: 100, top: 200, width: 200, height: 50 },
  { left: 100, top: 300, width: 200, height: 50 }
];

const results = await Promise.all(
  areas.map(area => domExtractor.extractTextFromArea(area))
);

console.log('批量提取结果:', results);
```

### 性能优化使用
```javascript
// 在页面卸载时清理缓存
window.addEventListener('beforeunload', () => {
  domExtractor.clearCache();
});

// 定期检查缓存使用情况
setInterval(() => {
  const stats = domExtractor.getCacheStats();
  if (stats.usage > 80) {
    console.warn('DOM缓存使用率过高:', stats);
  }
}, 30000);
```

## 🧠 语言检测器使用示例

### 单文本检测
```javascript
import languageDetector from './src/content/language-detector.js';

const text = "こんにちは、世界！";
const result = languageDetector.detectLanguage(text);

console.log('检测结果:', result);
// 输出: { language: 'ja', confidence: 0.95, details: {...} }
```

### 批量检测
```javascript
const texts = [
  "Hello world",
  "こんにちは",
  "안녕하세요",
  "你好世界"
];

const results = languageDetector.detectMultiple(texts);
results.forEach((result, index) => {
  console.log(`文本 ${index + 1}: ${result.language} (${result.confidence})`);
});
```

### 高级使用
```javascript
// 检测中文变体
const chineseText = "这是简体中文";
const result = languageDetector.detectLanguage(chineseText);
console.log('中文变体:', result.details.variant); // 'zh-cn'

// 获取详细分析
const detailedResult = languageDetector.detectLanguage("混合text文字");
console.log('详细分析:', result.details.scores);
```

## 🔄 错误处理和重试示例

### 智能重试机制
```javascript
class RetryManager {
  async executeWithRetry(fn, maxRetries = 3, delay = 1000) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        performanceMonitor.startTimer('retryOperation', {
          attempt: i + 1,
          maxRetries
        });
        
        const result = await fn();
        
        performanceMonitor.endTimer('retryOperation', {
          success: true,
          finalAttempt: i + 1
        });
        
        return result;
      } catch (error) {
        console.warn(`尝试 ${i + 1} 失败:`, error.message);
        
        if (i === maxRetries - 1) {
          performanceMonitor.endTimer('retryOperation', {
            success: false,
            finalAttempt: i + 1,
            error: error.message
          });
          throw error;
        }
        
        // 指数退避
        await this.delay(delay * Math.pow(2, i));
      }
    }
  }
  
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 使用示例
const retryManager = new RetryManager();

try {
  const result = await retryManager.executeWithRetry(async () => {
    return await fetch('/api/translate', {
      method: 'POST',
      body: JSON.stringify({ text, sourceLang, targetLang })
    });
  });
  
  console.log('翻译成功:', result);
} catch (error) {
  console.error('翻译最终失败:', error);
}
```

## 🎨 用户界面优化示例

### 响应式设计
```css
/* 适配不同屏幕尺寸 */
.popup-container {
  width: 320px;
  max-width: 90vw;
}

@media (max-width: 360px) {
  .popup-container {
    width: 280px;
    font-size: 14px;
  }
  
  .primary-btn {
    padding: 10px 16px;
    font-size: 14px;
  }
}

@media (max-width: 280px) {
  .popup-container {
    width: 260px;
    font-size: 12px;
  }
}
```

### 深色模式支持
```css
/* 自动适配系统主题 */
@media (prefers-color-scheme: dark) {
  .popup-container {
    background: #2d3748;
    color: #e2e8f0;
    border: 1px solid #4a5568;
  }
  
  .header {
    background: linear-gradient(135deg, #2b6cb0, #2f855a);
  }
  
  .primary-btn {
    background: linear-gradient(135deg, #3182ce, #38a169);
  }
  
  .settings-modal {
    background: #1a202c;
    border: 1px solid #4a5568;
  }
}

/* 手动主题切换 */
[data-theme="dark"] {
  --bg-primary: #2d3748;
  --text-primary: #e2e8f0;
  --border-color: #4a5568;
}

[data-theme="light"] {
  --bg-primary: #ffffff;
  --text-primary: #2d3748;
  --border-color: #e2e8f0;
}
```

### 无障碍访问
```html
<!-- 改进的HTML结构 -->
<button 
  id="start-capture" 
  class="primary-btn"
  aria-label="开始截图翻译"
  aria-describedby="capture-description"
>
  <span class="btn-icon" aria-hidden="true">📷</span>
  <span class="btn-text">开始截图翻译</span>
</button>

<div id="capture-description" class="sr-only">
  点击此按钮开始截图翻译功能，然后在网页上拖拽选择要翻译的文字区域
</div>

<!-- 键盘导航支持 -->
<div class="settings-group" role="group" aria-labelledby="language-settings">
  <h3 id="language-settings">语言设置</h3>
  
  <label for="target-language">目标语言</label>
  <select id="target-language" aria-describedby="target-help">
    <option value="zh-cn">简体中文</option>
    <option value="zh-tw">繁体中文</option>
    <option value="en">English</option>
  </select>
  <div id="target-help" class="help-text">
    选择翻译结果的目标语言
  </div>
</div>
```

### JavaScript无障碍支持
```javascript
// 键盘导航支持
class AccessibilityManager {
  constructor() {
    this.focusableElements = [
      'button',
      'input',
      'select',
      'textarea',
      '[tabindex]:not([tabindex="-1"])'
    ].join(',');
  }
  
  // 管理焦点
  trapFocus(container) {
    const focusable = container.querySelectorAll(this.focusableElements);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    
    container.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
      
      if (e.key === 'Escape') {
        this.closeModal(container);
      }
    });
  }
  
  // 屏幕阅读器公告
  announce(message, priority = 'polite') {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }
}

// 使用示例
const a11y = new AccessibilityManager();

// 翻译完成时通知屏幕阅读器
function onTranslationComplete(result) {
  a11y.announce(`翻译完成：${result.translatedText}`);
}

// 模态框打开时管理焦点
function openSettingsModal() {
  const modal = document.querySelector('.settings-modal');
  modal.classList.remove('hidden');
  a11y.trapFocus(modal);
  
  // 焦点移到第一个可聚焦元素
  const firstFocusable = modal.querySelector('button, input, select');
  if (firstFocusable) {
    firstFocusable.focus();
  }
}
```

## 📈 性能基准测试

### 基准测试脚本
```javascript
// 性能基准测试
class BenchmarkSuite {
  async runDOMExtractionBenchmark() {
    const testAreas = [
      { width: 100, height: 50 },   // 小区域
      { width: 300, height: 200 },  // 中等区域
      { width: 800, height: 600 }   // 大区域
    ];
    
    const results = [];
    
    for (const area of testAreas) {
      const rect = { left: 100, top: 100, ...area };
      
      performanceMonitor.startTimer('benchmark_dom_extraction');
      const text = await domExtractor.extractTextFromArea(rect);
      const duration = performanceMonitor.endTimer('benchmark_dom_extraction');
      
      results.push({
        area: `${area.width}x${area.height}`,
        duration,
        textLength: text.length,
        success: text.length > 0
      });
    }
    
    return results;
  }
  
  async runLanguageDetectionBenchmark() {
    const testTexts = [
      "Hello world",
      "こんにちは世界",
      "안녕하세요 세계",
      "你好世界",
      "Bonjour le monde",
      "Hallo Welt",
      "Hola mundo"
    ];
    
    const results = [];
    
    for (const text of testTexts) {
      performanceMonitor.startTimer('benchmark_language_detection');
      const result = languageDetector.detectLanguage(text);
      const duration = performanceMonitor.endTimer('benchmark_language_detection');
      
      results.push({
        text,
        detectedLanguage: result.language,
        confidence: result.confidence,
        duration
      });
    }
    
    return results;
  }
}

// 运行基准测试
const benchmark = new BenchmarkSuite();

async function runAllBenchmarks() {
  console.log('🚀 开始性能基准测试...');
  
  const domResults = await benchmark.runDOMExtractionBenchmark();
  const langResults = await benchmark.runLanguageDetectionBenchmark();
  
  console.table(domResults);
  console.table(langResults);
  
  // 生成性能报告
  performanceMonitor.reportSummary();
}

// 在开发环境中运行
if (process.env.NODE_ENV === 'development') {
  runAllBenchmarks();
}
```

这些示例展示了如何使用优化后的模块来提升项目的性能、可维护性和用户体验。通过模块化架构、性能监控、智能缓存和无障碍支持，4utrans项目将能够为用户提供更好的翻译体验。
