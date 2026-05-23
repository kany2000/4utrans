/**
 * FloatPanel - 独立翻译面板
 * Version: 2.3.0
 * 独立浮动面板，可打字翻译，附带历史记录和生词本功能
 */

// 内置翻译表（content script 无法访问 popup 的 i18n.js）
const floatTranslations = {
  'zh-CN': {
    'float.title': '快捷面板',
    'float.tab.translate': '翻译',
    'float.tab.history': '历史',
    'float.tab.words': '生词本',
    'float.input.placeholder': '输入文字翻译...',
    'float.btn.translate': '翻译',
    'float.result.label': '译文：',
    'float.btn.copy': '复制',
    'float.btn.save': '收藏',
    'float.btn.clear': '清空',
    'float.btn.delete': '删除',
    'float.history.empty': '暂无历史记录',
    'float.words.empty': '生词本为空',
    'float.error.empty': '请输入文字',
    'float.error.translate': '翻译失败',
    'float.msg.copied': '已复制',
    'float.msg.saved': '已收藏',
    'float.msg.cleared': '已清空',
    'float.confirm.clear': '确定清空所有历史记录？',
    'lang.auto': '自动检测',
    'lang.zh-CN': '简体中文',
    'lang.zh-TW': '繁体中文',
    'lang.en': '英语',
    'lang.ja': '日语',
    'lang.ko': '韩语'
  },
  'zh-TW': {
    'float.title': '快捷面板',
    'float.tab.translate': '翻譯',
    'float.tab.history': '歷史',
    'float.tab.words': '生詞本',
    'float.input.placeholder': '輸入文字翻譯...',
    'float.btn.translate': '翻譯',
    'float.result.label': '譯文：',
    'float.btn.copy': '複製',
    'float.btn.save': '收藏',
    'float.btn.clear': '清空',
    'float.btn.delete': '刪除',
    'float.history.empty': '暫無歷史記錄',
    'float.words.empty': '生詞本為空',
    'float.error.empty': '請輸入文字',
    'float.error.translate': '翻譯失敗',
    'float.msg.copied': '已複製',
    'float.msg.saved': '已收藏',
    'float.msg.cleared': '已清空',
    'float.confirm.clear': '確定清空所有歷史記錄？',
    'lang.auto': '自動偵測',
    'lang.zh-CN': '簡體中文',
    'lang.zh-TW': '繁體中文',
    'lang.en': '英語',
    'lang.ja': '日語',
    'lang.ko': '韓語'
  },
  'en': {
    'float.title': 'Quick Panel',
    'float.tab.translate': 'Translate',
    'float.tab.history': 'History',
    'float.tab.words': 'Word Book',
    'float.input.placeholder': 'Enter text to translate...',
    'float.btn.translate': 'Translate',
    'float.result.label': 'Result:',
    'float.btn.copy': 'Copy',
    'float.btn.save': 'Save',
    'float.btn.clear': 'Clear',
    'float.btn.delete': 'Delete',
    'float.history.empty': 'No history yet',
    'float.words.empty': 'Word book is empty',
    'float.error.empty': 'Please enter text',
    'float.error.translate': 'Translation failed',
    'float.msg.copied': 'Copied',
    'float.msg.saved': 'Saved',
    'float.msg.cleared': 'Cleared',
    'float.confirm.clear': 'Clear all history?',
    'lang.auto': 'Auto Detect',
    'lang.zh-CN': 'Simplified Chinese',
    'lang.zh-TW': 'Traditional Chinese',
    'lang.en': 'English',
    'lang.ja': 'Japanese',
    'lang.ko': 'Korean'
  },
  'ja': {
    'float.title': 'クイックパネル',
    'float.tab.translate': '翻訳',
    'float.tab.history': '履歴',
    'float.tab.words': '単語帳',
    'float.input.placeholder': '翻訳するテキストを入力...',
    'float.btn.translate': '翻訳',
    'float.result.label': '結果：',
    'float.btn.copy': 'コピー',
    'float.btn.save': '保存',
    'float.btn.clear': 'クリア',
    'float.btn.delete': '削除',
    'float.history.empty': '履歴がありません',
    'float.words.empty': '単語帳が空です',
    'float.error.empty': 'テキストを入力してください',
    'float.error.translate': '翻訳失敗',
    'float.msg.copied': 'コピーしました',
    'float.msg.saved': '保存しました',
    'float.msg.cleared': 'クリアしました',
    'float.confirm.clear': 'すべての履歴を削除しますか？',
    'lang.auto': '自動検出',
    'lang.zh-CN': '簡体字中国語',
    'lang.zh-TW': '繁体字中国語',
    'lang.en': '英語',
    'lang.ja': '日本語',
    'lang.ko': '韓国語'
  },
  'ko': {
    'float.title': '빠른 패널',
    'float.tab.translate': '번역',
    'float.tab.history': '기록',
    'float.tab.words': '단어장',
    'float.input.placeholder': '번역할 텍스트 입력...',
    'float.btn.translate': '번역',
    'float.result.label': '결과:',
    'float.btn.copy': '복사',
    'float.btn.save': '저장',
    'float.btn.clear': '지우기',
    'float.btn.delete': '삭제',
    'float.history.empty': '기록이 없습니다',
    'float.words.empty': '단어장이 비어 있습니다',
    'float.error.empty': '텍스트를 입력하세요',
    'float.error.translate': '번역 실패',
    'float.msg.copied': '복사됨',
    'float.msg.saved': '저장됨',
    'float.msg.cleared': '지워짐',
    'float.confirm.clear': '모든 기록을 삭제하시겠습니까?',
    'lang.auto': '자동 감지',
    'lang.zh-CN': '간체 중국어',
    'lang.zh-TW': '번체 중국어',
    'lang.en': '영어',
    'lang.ja': '일본어',
    'lang.ko': '한국어'
  }
};

class FloatPanel {
  constructor() {
    this.panel = null;
    this.currentTab = 'translate'; // translate | history | words
    this.currentTranslation = null;
    this.history = [];
    this.savedWords = [];
    this.lang = 'en'; // 默认语言
  }

  // 初始化面板
  async init() {
    await this.loadUserLanguage();
    this.createPanel();
    this.bindEvents();
    this.loadHistory();
    this.loadSavedWords();
    this.show();
  }

  // 从 background 获取用户设置的语言
  async loadUserLanguage() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ action: 'getSettings' }, (response) => {
        if (response && response.success && response.settings && response.settings.uiLanguage) {
          this.lang = response.settings.uiLanguage;
        } else {
          this.detectBrowserLanguage();
        }
        resolve();
      });
    });
  }

  // 检测浏览器语言
  detectBrowserLanguage() {
    const browserLang = navigator.language || navigator.userLanguage || 'en';
    const langMap = {
      'zh-CN': 'zh-CN', 'zh-TW': 'zh-TW', 'zh-HK': 'zh-TW',
      'en': 'en', 'en-US': 'en', 'en-GB': 'en',
      'ja': 'ja', 'ja-JP': 'ja',
      'ko': 'ko', 'ko-KR': 'ko'
    };
    const prefix = browserLang.split('-')[0].toLowerCase();
    this.lang = langMap[browserLang] || langMap[prefix] || 'en';
  }

  // 获取翻译
  t(key) {
    // 使用内置翻译表，根据 this.lang 获取
    if (floatTranslations[this.lang] && floatTranslations[this.lang][key]) {
      return floatTranslations[this.lang][key];
    }
    // 回退到英文
    if (floatTranslations['en'][key]) {
      return floatTranslations['en'][key];
    }
    // 回退到默认翻译（英文）
    const defaults = {
      'float.title': 'Quick Panel',
      'float.tab.translate': 'Translate',
      'float.tab.history': 'History',
      'float.tab.words': 'Word Book',
      'float.input.placeholder': 'Enter text to translate...',
      'float.btn.translate': 'Translate',
      'float.result.label': 'Result:',
      'float.btn.copy': 'Copy',
      'float.btn.save': 'Save',
      'float.btn.clear': 'Clear',
      'float.btn.delete': 'Delete',
      'float.history.empty': 'No history yet',
      'float.words.empty': 'Word book is empty',
      'float.error.empty': 'Please enter text',
      'float.error.translate': 'Translation failed',
      'float.msg.copied': 'Copied',
      'float.msg.saved': 'Saved',
      'float.msg.cleared': 'Cleared',
      'float.confirm.clear': 'Clear all history?'
    };
    return defaults[key] || key;
  }

  // 创建面板DOM
  createPanel() {
    // 如果已存在则移除
    this.removePanel();

    const t = (key) => this.t(key);

    this.panel = document.createElement('div');
    this.panel.className = 'float-translate-panel';
    this.panel.innerHTML = `
      <div class="float-panel-header">
        <span class="float-panel-title">📝 ${t('float.title')}</span>
        <button class="float-panel-close">×</button>
      </div>
      <div class="float-panel-tabs">
        <button class="float-tab active" data-tab="translate">${t('float.tab.translate')}</button>
        <button class="float-tab" data-tab="history">${t('float.tab.history')}</button>
        <button class="float-tab" data-tab="words">${t('float.tab.words')}</button>
      </div>
      <div class="float-panel-content">
        <div class="float-tab-content active" data-content="translate">
          <div class="float-lang-row">
            <select class="float-source-lang">
              <option value="auto">${t('lang.auto')}</option>
              <option value="zh-CN">简体中文</option>
              <option value="zh-TW">繁體中文</option>
              <option value="en">English</option>
              <option value="ja">日本語</option>
              <option value="ko">한국어</option>
            </select>
            <span class="float-arrow">→</span>
            <select class="float-target-lang">
              <option value="zh-CN">简体中文</option>
              <option value="zh-TW">繁體中文</option>
              <option value="en">English</option>
              <option value="ja">日本語</option>
              <option value="ko">한국어</option>
            </select>
          </div>
          <div class="float-input-area">
            <textarea class="float-input" placeholder="${t('float.input.placeholder')}"></textarea>
            <button class="float-translate-btn">${t('float.btn.translate')}</button>
          </div>
          <div class="float-result-area">
            <div class="float-result-label">${t('float.result.label')}</div>
            <div class="float-result-text"></div>
            <div class="float-result-actions">
              <button class="float-copy-btn">${t('float.btn.copy')}</button>
              <button class="float-save-btn">${t('float.btn.save')}</button>
            </div>
          </div>
        </div>
        <div class="float-tab-content" data-content="history">
          <div class="float-list-container">
            <div class="float-list-header">
              <span>${t('float.tab.history')}</span>
              <button class="float-clear-btn">${t('float.btn.clear')}</button>
            </div>
            <div class="float-list"></div>
          </div>
        </div>
        <div class="float-tab-content" data-content="words">
          <div class="float-list-container">
            <div class="float-list-header">
              <span>${t('float.tab.words')}</span>
            </div>
            <div class="float-list"></div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.panel);
  }

  // 绑定事件
  bindEvents() {
    // 关闭按钮
    this.panel.querySelector('.float-panel-close').addEventListener('click', () => {
      this.hide();
    });

    // Tab切换
    this.panel.querySelectorAll('.float-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const tabName = e.target.dataset.tab;
        this.switchTab(tabName);
      });
    });

    // 翻译按钮
    this.panel.querySelector('.float-translate-btn').addEventListener('click', () => {
      this.doTranslate();
    });

    // 输入框回车翻译（Ctrl+Enter）
    this.panel.querySelector('.float-input').addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'Enter') {
        this.doTranslate();
      }
    });

    // 复制按钮
    this.panel.querySelector('.float-copy-btn').addEventListener('click', () => {
      this.copyTranslation();
    });

    // 收藏按钮
    this.panel.querySelector('.float-save-btn').addEventListener('click', () => {
      this.saveToWords();
    });

    // 清空历史按钮
    this.panel.querySelector('.float-clear-btn')?.addEventListener('click', () => {
      this.clearHistory();
    });

    // 拖动面板
    this.makeDraggable();

    // 点击外部关闭
    document.addEventListener('click', (e) => {
      if (this.panel && !this.panel.contains(e.target)) {
        // 不关闭，保持面板
      }
    });
  }

  // 拖动功能
  makeDraggable() {
    const header = this.panel.querySelector('.float-panel-header');
    let isDragging = false;
    let offsetX, offsetY;

    header.addEventListener('mousedown', (e) => {
      if (e.target.tagName === 'BUTTON') return;
      isDragging = true;
      offsetX = e.clientX - this.panel.offsetLeft;
      offsetY = e.clientY - this.panel.offsetTop;
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      let left = e.clientX - offsetX;
      let top = e.clientY - offsetY;

      // 边界限制
      left = Math.max(0, Math.min(left, window.innerWidth - this.panel.offsetWidth));
      top = Math.max(0, Math.min(top, window.innerHeight - this.panel.offsetHeight));

      this.panel.style.left = `${left}px`;
      this.panel.style.top = `${top}px`;
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
    });
  }

  // 切换Tab
  switchTab(tabName) {
    this.currentTab = tabName;

    // 更新Tab按钮状态
    this.panel.querySelectorAll('.float-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabName);
    });

    // 更新内容显示
    this.panel.querySelectorAll('.float-tab-content').forEach(content => {
      content.classList.toggle('active', content.dataset.content === tabName);
    });

    // 加载对应数据
    if (tabName === 'history') {
      this.renderHistory();
    } else if (tabName === 'words') {
      this.renderSavedWords();
    }
  }

  // 执行翻译
  async doTranslate() {
    const input = this.panel.querySelector('.float-input');
    const resultArea = this.panel.querySelector('.float-result-text');
    const text = input.value.trim();

    if (!text) {
      resultArea.innerHTML = `<span class="float-error">${this.t('float.error.empty')}</span>`;
      return;
    }

    resultArea.innerHTML = `<span class="float-loading">${this.t('float.loading') || '翻译中...'}</span>`;

    try {
      const sourceLang = this.panel.querySelector('.float-source-lang').value;
      const targetLang = this.panel.querySelector('.float-target-lang').value;

      // 发送翻译请求
      const response = await this.translateText(text, sourceLang, targetLang);

      if (response.success) {
        this.currentTranslation = response.translatedText;
        resultArea.textContent = response.translatedText;

        // 保存到历史
        await this.addToHistory({
          original: text,
          translation: response.translatedText,
          sourceLang: sourceLang,
          targetLang: targetLang
        });
      } else {
        resultArea.innerHTML = `<span class="float-error">${response.error}</span>`;
      }
    } catch (error) {
      resultArea.innerHTML = `<span class="float-error">${error.message}</span>`;
    }
  }

  // 翻译请求
  translateText(text, sourceLang, targetLang) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({
        action: 'translateText',
        text: text,
        sourceLang: sourceLang,
        targetLang: targetLang
      }, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error('连接失败'));
          return;
        }
        if (response && response.success) {
          resolve(response);
        } else {
          reject(new Error(response?.error || '翻译失败'));
        }
      });
    });
  }

  // 获取设置
  getSettings() {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ action: 'getSettings' }, (response) => {
        if (response && response.success) {
          resolve(response.settings);
        } else {
          reject(new Error('获取设置失败'));
        }
      });
    });
  }

  // 语言检测
  detectLanguage(text) {
    const hasJapanese = /[぀-ゟ゠-ヿ]/.test(text);
    const hasKorean = /[가-힯]/.test(text);
    const hasChinese = /[一-鿿]/.test(text);
    const hasEnglish = /[a-zA-Z]/.test(text);

    if (hasJapanese) return 'ja';
    if (hasKorean) return 'ko';
    if (hasChinese) return 'zh-CN';
    if (hasEnglish) return 'en';
    return 'auto';
  }

  // 复制翻译结果
  copyTranslation() {
    if (!this.currentTranslation) return;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(this.currentTranslation);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = this.currentTranslation;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }

    // 按钮反馈
    const btn = this.panel.querySelector('.float-copy-btn');
    btn.textContent = this.t('float.msg.copied');
    setTimeout(() => {
      btn.textContent = this.t('float.btn.copy');
    }, 1500);
  }

  // 收藏到生词本
  async saveToWords() {
    if (!this.currentTranslation) return;

    try {
      await this.addToSavedWords({
        original: this.panel.querySelector('.float-input').value.trim(),
        translation: this.currentTranslation
      });

      const btn = this.panel.querySelector('.float-save-btn');
      btn.textContent = this.t('float.msg.saved');
      setTimeout(() => {
        btn.textContent = this.t('float.btn.save');
      }, 1500);
    } catch (error) {
      alert(error.message);
    }
  }

  // 历史记录操作
  loadHistory() {
    chrome.runtime.sendMessage({ action: 'getTranslationHistory' }, (response) => {
      if (response && response.success) {
        this.history = response.data || [];
      }
    });
  }

  async addToHistory(item) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ action: 'addToHistory', item }, (response) => {
        if (response && response.success) {
          this.history.unshift(response.data);
          if (this.history.length > 100) {
            this.history = this.history.slice(0, 100);
          }
        }
        resolve(response);
      });
    });
  }

  async clearHistory() {
    if (!confirm(this.t('float.confirm.clear'))) return;

    chrome.runtime.sendMessage({ action: 'clearHistory' }, (response) => {
      if (response && response.success) {
        this.history = [];
        this.renderHistory();
      }
    });
  }

  renderHistory() {
    const list = this.panel.querySelector('[data-content="history"] .float-list');
    const header = this.panel.querySelector('[data-content="history"] .float-list-header span');

    // 更新标题显示数量
    if (header) {
      header.textContent = `${this.t('float.tab.history')} (${this.history.length}/500)`;
    }

    if (this.history.length === 0) {
      list.innerHTML = `<div class="float-empty">${this.t('float.history.empty')}</div>`;
      return;
    }

    list.innerHTML = this.history.map(item => `
      <div class="float-list-item" data-id="${item.id}">
        <div class="float-item-original">${this.escapeHtml(item.original)}</div>
        <div class="float-item-translation">${this.escapeHtml(item.translation)}</div>
        <div class="float-item-time">${this.formatTime(item.timestamp)}</div>
      </div>
    `).join('');

    // 点击历史项填充到翻译框
    list.querySelectorAll('.float-list-item').forEach(el => {
      el.addEventListener('click', () => {
        const id = parseInt(el.dataset.id);
        const item = this.history.find(h => h.id === id);
        if (item) {
          this.panel.querySelector('.float-input').value = item.original;
          this.panel.querySelector('.float-result-text').textContent = item.translation;
          this.currentTranslation = item.translation;
          this.switchTab('translate');
        }
      });
    });
  }

  // 生词本操作
  loadSavedWords() {
    chrome.runtime.sendMessage({ action: 'getSavedWords' }, (response) => {
      if (response && response.success) {
        this.savedWords = response.data || [];
      }
    });
  }

  addToSavedWords(item) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ action: 'addToSavedWords', item }, (response) => {
        if (response && response.success) {
          this.savedWords.unshift(response.data);
          if (this.savedWords.length > 100) {
            this.savedWords = this.savedWords.slice(0, 100);
          }
        }
        resolve(response);
      });
    });
  }

  removeFromSavedWords(id) {
    chrome.runtime.sendMessage({ action: 'removeFromSavedWords', id }, (response) => {
      if (response && response.success) {
        this.savedWords = this.savedWords.filter(w => w.id !== id);
        this.renderSavedWords();
      }
    });
  }

  renderSavedWords() {
    const list = this.panel.querySelector('[data-content="words"] .float-list');
    const header = this.panel.querySelector('[data-content="words"] .float-list-header span');

    // 更新标题显示数量
    if (header) {
      header.textContent = `${this.t('float.tab.words')} (${this.savedWords.length}/500)`;
    }

    if (this.savedWords.length === 0) {
      list.innerHTML = `<div class="float-empty">${this.t('float.words.empty')}</div>`;
      return;
    }

    list.innerHTML = this.savedWords.map(item => `
      <div class="float-list-item" data-id="${item.id}">
        <div class="float-item-original">${this.escapeHtml(item.original)}</div>
        <div class="float-item-translation">${this.escapeHtml(item.translation)}</div>
        <button class="float-delete-btn">删除</button>
      </div>
    `).join('');

    // 点击生词项填充到翻译框
    list.querySelectorAll('.float-list-item').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target.classList.contains('float-delete-btn')) {
          e.stopPropagation();
          const id = parseInt(el.dataset.id);
          this.removeFromSavedWords(id);
          return;
        }

        const id = parseInt(el.dataset.id);
        const item = this.savedWords.find(w => w.id === id);
        if (item) {
          this.panel.querySelector('.float-input').value = item.original;
          this.panel.querySelector('.float-result-text').textContent = item.translation;
          this.currentTranslation = item.translation;
          this.switchTab('translate');
        }
      });
    });
  }

  // 显示/隐藏面板
  show() {
    if (this.panel) {
      // 居中显示
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const pw = this.panel.offsetWidth || 320;
      const ph = this.panel.offsetHeight || 400;

      this.panel.style.left = `${(vw - pw) / 2}px`;
      this.panel.style.top = `${(vh - ph) / 2}px`;
      this.panel.style.display = 'block';
      setTimeout(() => {
        this.panel.classList.add('show');
      }, 10);
    }
  }

  hide() {
    if (this.panel) {
      this.panel.classList.remove('show');
      setTimeout(() => {
        this.panel.style.display = 'none';
      }, 300);
    }
  }

  removePanel() {
    const existing = document.querySelector('.float-translate-panel');
    if (existing) {
      existing.remove();
    }
  }

  // 工具方法
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  formatTime(timestamp) {
    const date = new Date(timestamp);
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
  }
}

// 创建全局实例
const floatPanel = new FloatPanel();
window.floatPanel = floatPanel;

// 监听来自 background.js 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'openFloatPanel') {
    floatPanel.init();
  }
});

// 初始化（如果页面已加载）
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('Float panel script loaded');
  });
} else {
  console.log('Float panel script loaded');
}
