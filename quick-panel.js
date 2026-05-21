/**
 * QuickTranslate - Quick Translation Panel
 * Version: 2.1.1
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

    // 悬浮翻译相关
    this.hoverEnabled = false;
    this.hoverBubble = null;
    this.hoverKeyDown = false;
    this.hoverTimeout = null;
    this.currentText = '';
    this.currentX = 0;
    this.currentY = 0;

    this.init();
  }

  async init() {
    // 加载用户设置
    await this.loadSettings();

    // 监听文字选择
    document.addEventListener('mouseup', (e) => this.handleTextSelection(e));
    document.addEventListener('keyup', (e) => this.handleTextSelection(e));

    // 点击其他地方关闭面板
    document.addEventListener('mousedown', (e) => this.handleClickOutside(e));

    // 初始化悬浮翻译
    this.initHoverTranslation();

    // 监听设置变更
    chrome.storage.onChanged.addListener((changes) => {
      console.log('Quick panel: storage changed', changes);
      if (changes.quickPanelEnabled) {
        this.isEnabled = changes.quickPanelEnabled.newValue;
      }
      if (changes.minSelectionLength) {
        this.minSelectionLength = changes.minSelectionLength.newValue;
      }
      if (changes.hoverTranslationEnabled) {
        this.hoverEnabled = changes.hoverTranslationEnabled.newValue;
        console.log('Quick panel: hoverEnabled changed to', this.hoverEnabled);
        if (this.hoverEnabled) {
          this.bindHoverEvents();
        } else {
          this.unbindHoverEvents();
        }
      }
    });
  }

  async loadSettings() {
    const settings = await chrome.storage.local.get([
      'quickPanelEnabled',
      'minSelectionLength',
      'hoverTranslationEnabled'
    ]);

    this.isEnabled = settings.quickPanelEnabled !== false; // 默认启用
    this.minSelectionLength = settings.minSelectionLength || 2;
    this.hoverEnabled = settings.hoverTranslationEnabled || false; // 默认关闭
  }

  // 初始化悬浮翻译
  initHoverTranslation() {
    console.log('Quick panel: initHoverTranslation, hoverEnabled:', this.hoverEnabled);
    if (this.hoverEnabled) {
      this.bindHoverEvents();
    }
  }

  // 绑定悬浮翻译事件
  bindHoverEvents() {
    console.log('Quick panel: bindHoverEvents called');
    document.addEventListener('keydown', (e) => this.handleHoverKeyDown(e));
    document.addEventListener('keyup', (e) => this.handleHoverKeyUp(e));
    document.addEventListener('mousemove', (e) => this.handleHoverMove(e));
  }

  // 解绑悬浮翻译事件
  unbindHoverEvents() {
    console.log('Quick panel: unbindHoverEvents called');
    document.removeEventListener('keydown', (e) => this.handleHoverKeyDown(e));
    document.removeEventListener('keyup', (e) => this.handleHoverKeyUp(e));
    document.removeEventListener('mousemove', (e) => this.handleHoverMove(e));
    this.hideHoverBubble();
  }

  handleHoverKeyDown(e) {
    console.log('Quick panel: Alt key down', { hoverEnabled: this.hoverEnabled, hoverKeyDown: this.hoverKeyDown });
    if (e.key === 'Alt') {
      this.hoverKeyDown = true;
      // 立即触发一次翻译
      this.doHoverTranslate();
    }
  }

  handleHoverKeyUp(e) {
    console.log('Quick panel: Alt key up');
    if (e.key === 'Alt') {
      this.hoverKeyDown = false;
      this.hideHoverBubble();
      this.currentText = '';
    }
  }

  handleHoverMove(e) {
    if (!this.hoverEnabled || !this.hoverKeyDown) return;
    this.currentX = e.clientX;
    this.currentY = e.clientY;

    // 清除之前的延迟
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
    }
    // 使用更短的延迟
    this.hoverTimeout = setTimeout(() => {
      this.doHoverTranslate();
    }, 100);
  }

  async doHoverTranslate() {
    console.log('Quick panel: doHoverTranslate called', {
      hoverEnabled: this.hoverEnabled,
      hoverKeyDown: this.hoverKeyDown,
      currentText: this.currentText,
      x: this.currentX,
      y: this.currentY
    });

    if (!this.hoverEnabled || !this.hoverKeyDown) return;

    const clientX = this.currentX;
    const clientY = this.currentY;
    const text = this.getWordAtPoint(clientX, clientY);

    if (!text || text.length < 2 || text.length > 200) {
      this.hideHoverBubble();
      this.currentText = '';
      return;
    }

    // 如果文字没变化，更新位置即可
    if (text === this.currentText && this.hoverBubble) {
      this.updateHoverBubblePosition(clientX, clientY);
      return;
    }

    this.currentText = text;

    if (!this.hoverBubble) {
      this.createHoverBubble();
    }

    this.updateHoverBubblePosition(clientX, clientY);

    const originalEl = this.hoverBubble.querySelector('.hover-original');
    originalEl.textContent = text;

    const resultEl = this.hoverBubble.querySelector('.hover-result');
    resultEl.innerHTML = '<span class="hover-loading">翻译中...</span>';

    this.hoverBubble.style.display = 'block';

    try {
      const translatedText = await this.translateText(text);
      if (this.hoverBubble && this.currentText === text) {
        resultEl.textContent = translatedText;
      }
    } catch (error) {
      if (this.hoverBubble && this.currentText === text) {
        resultEl.innerHTML = `<span class="hover-error">${error.message}</span>`;
      }
    }
  }

  // 获取指定坐标处的单词
  getWordAtPoint(x, y) {
    // 跳过输入框
    const element = document.elementFromPoint(x, y);
    if (!element) return '';
    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.isContentEditable) {
      return '';
    }

    // 如果是链接或按钮，获取其文字
    if (element.tagName === 'A' || element.tagName === 'BUTTON' ||
        element.getAttribute('role') === 'button') {
      return (element.innerText || element.textContent || '').trim();
    }

    // 使用 caretRangeFromPoint 获取精确位置
    let textNode = null;
    let offset = 0;

    if (document.caretRangeFromPoint) {
      const range = document.caretRangeFromPoint(x, y);
      if (range) {
        textNode = range.startContainer;
        offset = range.startOffset;
      }
    } else {
      // 降级方案
      const pos = this.getPositionFromPoint(x, y);
      if (!pos) return '';
      textNode = pos.node;
      offset = pos.offset;
    }

    if (!textNode || textNode.nodeType !== Node.TEXT_NODE) {
      return '';
    }

    const text = textNode.textContent;
    if (!text) return '';

    // 找到单词边界
    let start = offset;
    let end = offset;

    // 向前查找单词开始
    while (start > 0 && /\w/.test(text[start - 1])) {
      start--;
    }

    // 向后查找单词结束
    while (end < text.length && /\w/.test(text[end])) {
      end++;
    }

    const word = text.substring(start, end).trim();

    // 如果没有找到有效单词，尝试获取附近的短句
    if (!word || word.length < 2) {
      // 获取当前位置附近的几个字符作为备选
      const nearbyText = text.substring(Math.max(0, offset - 10), Math.min(text.length, offset + 10));
      const trimmed = nearbyText.trim();
      if (trimmed.length >= 2) {
        return trimmed;
      }
      return '';
    }

    return word;
  }

  // 降级方案：通过遍历获取位置
  getPositionFromPoint(x, y) {
    const element = document.elementFromPoint(x, y);
    if (!element) return null;

    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          if (node.textContent.trim().length > 0) {
            return NodeFilter.FILTER_ACCEPT;
          }
          return NodeFilter.FILTER_REJECT;
        }
      }
    );

    let node;
    while (node = walker.nextNode()) {
      const range = document.createRange();
      range.selectNodeContents(node);

      const rects = range.getClientRects();
      for (let i = 0; i < rects.length; i++) {
        const rect = rects[i];
        if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
          // 找到了包含点的节点，计算偏移
          const offset = this.getOffsetAtPoint(x, y, node, rect);
          return { node, offset };
        }
      }
    }

    return null;
  }

  getOffsetAtPoint(x, y, textNode, rect) {
    const text = textNode.textContent;
    const range = document.createRange();

    for (let i = 0; i <= text.length; i++) {
      range.setStart(textNode, i);
      range.collapse(true);
      const rects = range.getClientRects();
      if (rects.length === 0) continue;

      const charRect = rects[0];
      if (x < charRect.left + charRect.width / 2) {
        return i;
      }
    }

    return text.length;
  }

  createHoverBubble() {
    this.hoverBubble = document.createElement('div');
    this.hoverBubble.className = 'hover-translate-bubble';
    this.hoverBubble.innerHTML = `
      <div class="hover-original"></div>
      <div class="hover-divider"></div>
      <div class="hover-result">悬停翻译</div>
    `;
    this.hoverBubble.style.display = 'none';
    document.body.appendChild(this.hoverBubble);
  }

  updateHoverBubblePosition(x, y) {
    if (!this.hoverBubble) return;

    const bubbleWidth = 300;
    const bubbleHeight = 80;
    const gap = 10;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let left = x - bubbleWidth / 2;
    left = Math.max(8, Math.min(left, vw - bubbleWidth - 8));

    let top = y - bubbleHeight - gap;
    if (top < 8) {
      top = y + gap;
    }

    this.hoverBubble.style.left = `${left}px`;
    this.hoverBubble.style.top = `${top}px`;
  }

  hideHoverBubble() {
    if (this.hoverBubble) {
      this.hoverBubble.style.display = 'none';
    }
    this.currentText = '';
  }

  async translateText(text) {
    const settings = await chrome.storage.local.get([
      'targetLanguage',
      'apiProvider',
      'apiKey',
      'llmBaseUrl',
      'llmModel'
    ]);

    const sourceLang = this.detectLanguage(text);
    const targetLang = settings.targetLanguage || 'zh-CN';

    return new Promise((resolve, reject) => {
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
        if (chrome.runtime.lastError) {
          reject(new Error('连接失败'));
          return;
        }
        if (response && response.success) {
          resolve(response.translatedText);
        } else {
          reject(new Error(response?.error || '翻译失败'));
        }
      });
    });
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
      
      // 保存当前选择及位置
      const range = selection.getRangeAt(0);
      this.currentSelection = {
        text: selectedText,
        range: range,
        rect: range.getBoundingClientRect()
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

  // 检查扩展上下文是否仍然有效
  isContextValid() {
    try {
      return !!(chrome && chrome.runtime && chrome.runtime.id);
    } catch (e) {
      return false;
    }
  }

  async translate() {
    if (!this.currentSelection || this.translating) return;
    
    this.translating = true;
    const text = this.currentSelection.text;
    const selectionRect = this.currentSelection.rect;
    
    // 隐藏按钮，显示翻译面板
    this.hideButton();
    this.showPanel(text, selectionRect);

    // 最先检查扩展上下文（extension reload 后 content script 会失效）
    if (!this.isContextValid()) {
      this.showError('⚠️ 扩展已更新，请按 F5 刷新此网页后重试');
      this.translating = false;
      return;
    }
    
    try {
      // 获取用户设置
      let settings = {};
      try {
        settings = await chrome.storage.local.get([
          'targetLanguage',
          'apiProvider',
          'apiKey',
          'llmBaseUrl',
          'llmModel'
        ]);
      } catch (storageErr) {
        throw new Error('⚠️ 扩展已更新，请按 F5 刷新此网页后重试');
      }
      
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
      this.showResult(text, result.translatedText, sourceLang, targetLang, result.isBackup ? result.backupService : null);
      
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

  showPanel(originalText, selectionRect) {
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
        <span class="translation-source"></span>
        <button class="panel-btn copy-btn" disabled>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
          </svg>
          复制
        </button>
      </div>
    `;

    document.body.appendChild(this.panel);

    // 计算面板位置（出现在选中文字附近，不遮挡原文）
    if (selectionRect && selectionRect.width > 0) {
      const panelWidth = 400;
      const panelHeight = 220;
      const gap = 10;
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      // 水平方向：以选中区域中心为准，不超出视口
      let left = selectionRect.left + selectionRect.width / 2 - panelWidth / 2;
      left = Math.max(8, Math.min(left, vw - panelWidth - 8));

      // 垂直方向：优先显示在选中文字下方，空间不足则显示在上方
      let top;
      if (vh - selectionRect.bottom >= panelHeight + gap) {
        top = selectionRect.bottom + gap;
      } else if (selectionRect.top >= panelHeight + gap) {
        top = selectionRect.top - panelHeight - gap;
      } else {
        // 两侧都放不下，放在底部可见区域内
        top = Math.max(8, vh - panelHeight - 8);
      }

      this.panel.style.position = 'fixed';
      this.panel.style.left = `${left}px`;
      this.panel.style.top = `${top}px`;
      this.panel.style.transform = 'none';
    }

    // 添加关闭按钮事件
    this.panel.querySelector('.panel-close').addEventListener('click', () => {
      this.hidePanel();
    });

    // 添加拖拽功能
    this.isDragging = false;
    this.dragOffsetX = 0;
    this.dragOffsetY = 0;
    const header = this.panel.querySelector('.panel-header');
    header.style.cursor = 'move';

    // 保存监听器引用，以便后续移除
    this._boundMoveHandler = (e) => {
      if (!this.isDragging) return;
      let left = e.clientX - this.dragOffsetX;
      let top = e.clientY - this.dragOffsetY;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const rect = this.panel.getBoundingClientRect();
      const panelWidth = rect.width;
      const panelHeight = rect.height;
      left = Math.max(0, Math.min(left, vw - panelWidth));
      top = Math.max(0, Math.min(top, vh - panelHeight));
      this.panel.style.left = `${left}px`;
      this.panel.style.top = `${top}px`;
    };
    this._boundMouseUpHandler = () => {
      this.isDragging = false;
    };

    header.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      const rect = this.panel.getBoundingClientRect();
      this.dragOffsetX = e.clientX - rect.left;
      this.dragOffsetY = e.clientY - rect.top;
      e.preventDefault();
    });
    document.addEventListener('mousemove', this._boundMoveHandler);
    document.addEventListener('mouseup', this._boundMouseUpHandler);

    // 标记copy按钮未绑定事件
    this._copyBtnBound = false;

    // 添加显示动画
    setTimeout(() => {
      this.panel.classList.add('show');
    }, 10);
  }

  showResult(originalText, translatedText, sourceLang, targetLang, backupService) {
    if (!this.panel) return;
    
    const resultDiv = this.panel.querySelector('.translation-result .text-content');
    resultDiv.className = 'text-content';
    resultDiv.textContent = translatedText;

    // 显示翻译来源（备用服务时提示）
    const sourceEl = this.panel.querySelector('.translation-source');
    if (sourceEl) {
      if (backupService) {
        sourceEl.textContent = `由 ${backupService} 提供`;
        sourceEl.title = 'Google 翻译不可用，已自动切换至备用服务';
      } else {
        sourceEl.textContent = '';
      }
    }
    
    // 启用复制按钮
    const copyBtn = this.panel.querySelector('.copy-btn');
    copyBtn.disabled = false;

    // 避免重复绑定事件
    if (!this._copyBtnBound) {
      this._copyBtnBound = true;
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
      // 移除拖拽监听器，防止内存泄漏
      if (this._boundMoveHandler) {
        document.removeEventListener('mousemove', this._boundMoveHandler);
        this._boundMoveHandler = null;
      }
      if (this._boundMouseUpHandler) {
        document.removeEventListener('mouseup', this._boundMouseUpHandler);
        this._boundMouseUpHandler = null;
      }

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
