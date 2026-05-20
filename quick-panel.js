/**
 * 4utrans - Quick Translation Panel
 * Version: 2.0.0
 * 快捷翻译面板 - 选中文字即可快速翻译
 */

class QuickTranslationPanel {
  constructor() {
    this.panel = null;
    this.button = null;
    this.isEnabled = true;
    this.minSelectionLength = 2;
    this.translating = false;
    this.currentSelection = null;
    
    this.init();
  }

  init() {
    // 加载用户设置
    this.loadSettings();
    
    // 监听文字选择
    document.addEventListener('mouseup', (e) => this.handleTextSelection(e));
    document.addEventListener('keyup', (e) => this.handleTextSelection(e));
    
    // 点击其他地方关闭面板
    document.addEventListener('mousedown', (e) => this.handleClickOutside(e));
    
    // 监听设置变更
    chrome.storage.onChanged.addListener((changes) => {
      if (changes.quickPanelEnabled) {
        this.isEnabled = changes.quickPanelEnabled.newValue;
      }
      if (changes.minSelectionLength) {
        this.minSelectionLength = changes.minSelectionLength.newValue;
      }
    });
  }

  async loadSettings() {
const settings = await chrome.storage.local.get([
 'quickPanelEnabled',
 'minSelectionLength'
]);
    
    this.isEnabled = settings.quickPanelEnabled !== false; // 默认启用
    this.minSelectionLength = settings.minSelectionLength || 2;
  }

  handleTextSelection(e) {
    // 如果功能未启用，直接返回
    if (!this.isEnabled) return;
    
    // 延迟检查，确保选择完成
    setTimeout(() => {
      const selection = window.getSelection();
      const selectedText = selection.toString().trim();
      
      // 检查选择的文字是否符合条件
      if (selectedText.length < this.minSelectionLength) {
        this.hideButton();
        return;
      }
      
      // 检查是否在输入框中选择（避免干扰正常编辑）
      const activeElement = document.activeElement;
      if (activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.isContentEditable
      )) {
        return;
      }
      
      // 保存当前选择
      this.currentSelection = {
        text: selectedText,
        range: selection.getRangeAt(0)
      };
      
      // 显示翻译按钮
      this.showButton(e.clientX, e.clientY);
    }, 100);
  }

  showButton(x, y) {
    // 移除旧按钮
    this.hideButton();
    
    // 创建翻译按钮
    this.button = document.createElement('div');
    this.button.className = 'quick-translate-button';
    this.button.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/>
      </svg>
      <span>翻译</span>
    `;
    
    // 设置位置（在鼠标附近，稍微偏上）
    this.button.style.left = `${x}px`;
    this.button.style.top = `${y - 50}px`;
    
    // 添加点击事件
    this.button.addEventListener('click', (e) => {
      e.stopPropagation();
      this.translate();
    });
    
    // 添加到页面
    document.body.appendChild(this.button);
    
    // 添加显示动画
    setTimeout(() => {
      this.button.classList.add('show');
    }, 10);
  }

  hideButton() {
    if (this.button) {
      this.button.remove();
      this.button = null;
    }
  }

  async translate() {
    if (!this.currentSelection || this.translating) return;
    
    this.translating = true;
    const text = this.currentSelection.text;
    
    // 隐藏按钮，显示翻译面板
    this.hideButton();
    this.showPanel(text);
    
    try {
      // 获取用户设置
const settings = await chrome.storage.local.get([
 'targetLanguage',
 'apiProvider',
 'apiKey',
 'llmBaseUrl',
 'llmModel'
]);
      
      // 检测源语言
      const sourceLang = this.detectLanguage(text);
      const targetLang = settings.targetLanguage || 'zh-CN';
      
      // 调用翻译API
      const result = await this.callTranslationAPI(
        text,
        sourceLang,
        targetLang,
        settings
      );
      
      // 显示翻译结果
      this.showResult(text, result.translatedText, sourceLang, targetLang);
      
    } catch (error) {
      console.error('Translation error:', error);
      this.showError(error.message || '翻译失败，请稍后重试');
    } finally {
      this.translating = false;
    }
  }

  detectLanguage(text) {
    // 简单的语言检测逻辑
    const hasJapanese = /[\u3040-\u309F\u30A0-\u30FF]/.test(text);
    const hasKorean = /[\uAC00-\uD7AF]/.test(text);
    const hasChinese = /[\u4E00-\u9FFF]/.test(text);
    const hasEnglish = /[a-zA-Z]/.test(text);
    
    if (hasJapanese) return 'ja';
    if (hasKorean) return 'ko';
    if (hasChinese) return 'zh-CN';
    if (hasEnglish) return 'en';
    
    return 'auto';
  }

  async callTranslationAPI(text, sourceLang, targetLang, settings) {
    // 发送消息给background script处理翻译
    return new Promise((resolve, reject) => {
      try {
        chrome.runtime.sendMessage({
          action: 'translate',
          text: text,
          sourceLang: sourceLang,
          targetLang: targetLang,
          apiProvider: settings.apiProvider,
          apiKey: settings.apiKey,
          llmBaseUrl: settings.llmBaseUrl,
          llmModel: settings.llmModel
        }, (response) => {
          // 检查 chrome.runtime.lastError（Content Script 与 Service Worker 连接断开时会产生）
          if (chrome.runtime.lastError) {
            const errMsg = chrome.runtime.lastError.message || '';
            if (errMsg.includes('invalidated') || errMsg.includes('closed') || errMsg.includes('context')) {
              reject(new Error('⚠️ 扩展已更新，请刷新此网页后重试'));
            } else {
              reject(new Error(`连接错误: ${errMsg}`));
            }
            return;
          }
          if (response && response.success) {
            resolve(response);
          } else {
            reject(new Error(response?.error || '翻译服务暂时不可用'));
          }
        });
      } catch (e) {
        // chrome.runtime.sendMessage 本身抛出（扩展上下文已销毁）
        reject(new Error('⚠️ 扩展已更新，请刷新此网页后重试'));
      }
    });
  }

  showPanel(originalText) {
    // 移除旧面板
    this.hidePanel();
    
    // 创建翻译面板
    this.panel = document.createElement('div');
    this.panel.className = 'quick-translate-panel';
    this.panel.innerHTML = `
      <div class="panel-header">
        <span class="panel-title">🌐 快速翻译</span>
        <button class="panel-close">×</button>
      </div>
      <div class="panel-body">
        <div class="original-text">
          <div class="text-label">原文</div>
          <div class="text-content">${this.escapeHtml(originalText)}</div>
        </div>
        <div class="translation-result">
          <div class="text-label">译文</div>
          <div class="text-content loading">
            <div class="loading-spinner"></div>
            <span>翻译中...</span>
          </div>
        </div>
      </div>
      <div class="panel-footer">
        <button class="panel-btn copy-btn" disabled>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
          </svg>
          复制
        </button>
      </div>
    `;
    
    // 设置位置（屏幕中央）
    document.body.appendChild(this.panel);
    
    // 添加事件监听
    this.panel.querySelector('.panel-close').addEventListener('click', () => {
      this.hidePanel();
    });
    
    // 添加显示动画
    setTimeout(() => {
      this.panel.classList.add('show');
    }, 10);
  }

  showResult(originalText, translatedText, sourceLang, targetLang) {
    if (!this.panel) return;
    
    const resultDiv = this.panel.querySelector('.translation-result .text-content');
    resultDiv.className = 'text-content';
    resultDiv.textContent = translatedText;
    
    // 启用复制按钮
    const copyBtn = this.panel.querySelector('.copy-btn');
    copyBtn.disabled = false;
    copyBtn.addEventListener('click', () => {
      this.copyToClipboard(translatedText);
      copyBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        已复制
      `;
      setTimeout(() => {
        copyBtn.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
          </svg>
          复制
        `;
      }, 2000);
    });
  }

  showError(message) {
    if (!this.panel) return;
    
    const resultDiv = this.panel.querySelector('.translation-result .text-content');
    resultDiv.className = 'text-content error';
    resultDiv.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <span>${message}</span>
    `;
  }

  hidePanel() {
    if (this.panel) {
      this.panel.classList.remove('show');
      setTimeout(() => {
        if (this.panel) {
          this.panel.remove();
          this.panel = null;
        }
      }, 300);
    }
  }

  handleClickOutside(e) {
    // 如果点击的不是面板或按钮，则关闭
    if (this.panel && !this.panel.contains(e.target)) {
      this.hidePanel();
    }
    if (this.button && !this.button.contains(e.target)) {
      this.hideButton();
    }
  }

  copyToClipboard(text) {
    // 使用现代API复制文本
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
    } else {
      // 降级方案
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// 初始化快捷翻译面板
if (typeof window !== 'undefined') {
  // 等待 DOM 加载完成
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      console.log('Quick panel: Initializing after DOMContentLoaded');
      window.quickTranslationPanel = new QuickTranslationPanel();
    });
  } else {
    // DOM 已经加载完成
    console.log('Quick panel: Initializing immediately');
    window.quickTranslationPanel = new QuickTranslationPanel();
  }
}
