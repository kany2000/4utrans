// Popup 界面控制器
class PopupController {
  constructor() {
    this.elements = {};
    this.settings = {};
    this.init();
  }

  init() {
    this.bindElements();
    this.bindEvents();
    this.loadSettings();
  }

  bindElements() {
    this.elements = {
      startCapture: document.getElementById('start-capture'),
      targetLanguage: document.getElementById('target-language'),
      ocrLanguage: document.getElementById('ocr-language'),
      quickSave: document.getElementById('quick-save'),
      settingsBtn: document.getElementById('settings-btn'),
      settingsModal: document.getElementById('settings-modal'),
      closeSettings: document.getElementById('close-settings'),
      apiProvider: document.getElementById('api-provider'),
      apiKey: document.getElementById('api-key'),
      apiKeyGroup: document.querySelector('.api-key-group'),
      autoCopy: document.getElementById('auto-copy'),
      showConfidence: document.getElementById('show-confidence'),
      saveSettings: document.getElementById('save-settings'),
      resetSettings: document.getElementById('reset-settings'),
      statusMessage: document.getElementById('status-message'),
      shortcutKey: document.getElementById('shortcut-key'),
      changeShortcut: document.getElementById('change-shortcut')
    };
  }

  bindEvents() {
    // 開始截圖
    this.elements.startCapture.addEventListener('click', () => {
      this.startCapture();
    });

    // 快速保存基本設置
    this.elements.quickSave.addEventListener('click', () => {
      this.quickSaveBasicSettings();
    });

    // 設置按鈕
    this.elements.settingsBtn.addEventListener('click', () => {
      this.showSettingsModal();
    });

    // 關閉設置
    this.elements.closeSettings.addEventListener('click', () => {
      this.hideSettingsModal();
    });

    // 點擊背景關閉模態框
    this.elements.settingsModal.addEventListener('click', (e) => {
      if (e.target === this.elements.settingsModal) {
        this.hideSettingsModal();
      }
    });

    // API 提供商變更
    this.elements.apiProvider.addEventListener('change', () => {
      this.toggleApiKeyInput();
    });

    // 保存設置
    this.elements.saveSettings.addEventListener('click', () => {
      this.saveSettings();
    });

    // 重置設置
    this.elements.resetSettings.addEventListener('click', () => {
      this.resetSettings();
    });

    // 語言設置變更時顯示提示
    this.elements.targetLanguage.addEventListener('change', () => {
      this.showUnsavedChanges();
    });

    this.elements.ocrLanguage.addEventListener('change', () => {
      this.showUnsavedChanges();
    });

    // ESC 鍵關閉模態框
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !this.elements.settingsModal.classList.contains('hidden')) {
        this.hideSettingsModal();
      }
    });

    // 快捷鍵設置
    this.elements.changeShortcut.addEventListener('click', () => {
      this.startShortcutRecording();
    });

    this.elements.shortcutKey.addEventListener('click', () => {
      this.openShortcutSettings();
    });
  }

  async startCapture() {
    try {
      console.log('Popup: Starting capture...');

      // 顯示處理狀態
      this.showStatus('正在啟動截圖...', 'info');

      // 檢查 Chrome runtime 是否可用
      if (typeof chrome === 'undefined') {
        throw new Error('Chrome 對象不存在');
      }

      if (!chrome.runtime) {
        throw new Error('chrome.runtime 不可用');
      }

      if (!chrome.runtime.sendMessage) {
        throw new Error('chrome.runtime.sendMessage 不可用');
      }

      console.log('Popup: Chrome runtime available, sending message...');

      // 使用 Promise 包裝消息發送，添加超時處理
      const sendMessageWithTimeout = (message, timeout = 5000) => {
        return new Promise((resolve, reject) => {
          const timer = setTimeout(() => {
            reject(new Error('消息發送超時'));
          }, timeout);

          chrome.runtime.sendMessage(message, (response) => {
            clearTimeout(timer);

            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else {
              resolve(response);
            }
          });
        });
      };

      try {
        // 發送開始截圖消息
        const response = await sendMessageWithTimeout({ action: 'startCapture' });

        console.log('Popup: Received response from background:', response);

        if (response && response.error) {
          console.error('Popup: Background returned error:', response.error);
          this.showStatus('啟動失敗: ' + response.error, 'error');
        } else if (response && response.success) {
          console.log('Popup: Capture started successfully');
          this.showStatus('截圖已啟動', 'success');
          // 延遲關閉讓用戶看到成功消息
          setTimeout(() => {
            window.close();
          }, 500);
        } else {
          console.log('Popup: Unexpected response, assuming success');
          this.showStatus('截圖已啟動', 'success');
          setTimeout(() => {
            window.close();
          }, 500);
        }
      } catch (messageError) {
        console.error('Popup: Message sending failed:', messageError);

        // 如果是連接錯誤，提供重試選項
        if (messageError.message.includes('Receiving end does not exist') ||
            messageError.message.includes('消息發送超時')) {
          this.showStatus('Service Worker 未啟動，正在重試...', 'warning');

          // 等待一下再重試
          setTimeout(async () => {
            try {
              const retryResponse = await sendMessageWithTimeout({ action: 'ping' }, 3000);
              if (retryResponse && retryResponse.success) {
                this.showStatus('連接已恢復，請重新點擊開始截圖', 'success');
              } else {
                this.showStatus('連接失敗，請重新載入擴展', 'error');
              }
            } catch (retryError) {
              this.showStatus('連接失敗，請重新載入擴展', 'error');
            }
          }, 1000);
        } else {
          this.showStatus('啟動失敗: ' + messageError.message, 'error');
        }
      }
    } catch (error) {
      console.error('Failed to start capture:', error);
      this.showStatus('啟動失敗: ' + error.message, 'error');
    }
  }

  async loadSettings() {
    try {
      // 首先檢查 Chrome runtime 是否可用
      if (typeof chrome === 'undefined' || !chrome.runtime) {
        console.warn('Chrome runtime not available, using default settings');
        this.useDefaultSettings();
        return;
      }

      // 嘗試發送消息獲取設置
      chrome.runtime.sendMessage({ action: 'getSettings' }, (response) => {
        if (chrome.runtime.lastError) {
          console.warn('Failed to connect to background script:', chrome.runtime.lastError.message);
          this.showStatus('啟動失敗: ' + chrome.runtime.lastError.message, 'error');
          this.useDefaultSettings();
          return;
        }

        if (response && response.success) {
          this.settings = response.settings;
          this.updateUI();
          this.clearStatus(); // 清除錯誤狀態
        } else {
          console.warn('No valid response from background script, using defaults');
          this.useDefaultSettings();
        }
      });
    } catch (error) {
      console.error('Failed to load settings:', error);
      this.showStatus('載入設置失敗: ' + error.message, 'error');
      this.useDefaultSettings();
    }
  }

  useDefaultSettings() {
    // 使用默認設置 - 默認使用Google翻譯
    this.settings = {
      targetLanguage: 'zh-TW',
      ocrLanguage: 'eng',
      apiProvider: 'google',
      autoCopy: false,
      showConfidence: true,
      apiKeys: {}
    };
    this.updateUI();
  }

  clearStatus() {
    const statusEl = this.elements.statusMessage;
    if (statusEl) {
      statusEl.style.display = 'none';
    }
  }

  updateUI() {
    // 更新基本設置
    this.elements.targetLanguage.value = this.settings.targetLanguage || 'zh-TW';
    this.elements.ocrLanguage.value = this.settings.ocrLanguage || 'eng';

    // 更新高級設置
    this.elements.apiProvider.value = this.settings.apiProvider || 'offline';
    this.elements.autoCopy.checked = this.settings.autoCopy || false;
    this.elements.showConfidence.checked = this.settings.showConfidence !== false;

    // 更新 API Key
    const provider = this.settings.apiProvider || 'offline';
    if (this.settings.apiKeys && this.settings.apiKeys[provider]) {
      this.elements.apiKey.value = this.settings.apiKeys[provider];
    }

    // 載入快捷鍵設置
    this.loadShortcutSetting();

    // 切換 API Key 輸入框顯示
    this.toggleApiKeyInput();
  }

  toggleApiKeyInput() {
    const provider = this.elements.apiProvider.value;
    // Google翻譯使用免費API，不需要API Key
    const needsApiKey = provider !== 'offline' && provider !== 'google';

    if (needsApiKey) {
      this.elements.apiKeyGroup.classList.remove('hidden');
    } else {
      this.elements.apiKeyGroup.classList.add('hidden');
    }
  }

  async quickSaveBasicSettings() {
    try {
      const basicSettings = {
        targetLanguage: this.elements.targetLanguage.value,
        ocrLanguage: this.elements.ocrLanguage.value
      };

      // 顯示保存中狀態
      const saveBtn = this.elements.quickSave;
      const originalText = saveBtn.querySelector('.btn-text').textContent;
      saveBtn.querySelector('.btn-text').textContent = '保存中...';
      saveBtn.disabled = true;

      chrome.runtime.sendMessage({
        action: 'saveSettings',
        settings: basicSettings
      }, (response) => {
        if (response && response.success) {
          // 更新本地設置
          this.settings = { ...this.settings, ...basicSettings };

          // 顯示成功狀態
          saveBtn.classList.add('saved');
          saveBtn.querySelector('.btn-text').textContent = '已保存';
          this.showStatus('基本設置已保存', 'success');

          // 恢復按鈕狀態
          setTimeout(() => {
            saveBtn.classList.remove('saved');
            saveBtn.querySelector('.btn-text').textContent = originalText;
            saveBtn.disabled = false;
            this.hideUnsavedChanges();
          }, 1500);
        } else {
          this.showStatus('保存失敗', 'error');
          saveBtn.querySelector('.btn-text').textContent = originalText;
          saveBtn.disabled = false;
        }
      });
    } catch (error) {
      console.error('Failed to save basic settings:', error);
      this.showStatus('保存失敗: ' + error.message, 'error');
    }
  }

  showUnsavedChanges() {
    const saveBtn = this.elements.quickSave;
    if (!saveBtn.classList.contains('saved')) {
      saveBtn.style.animation = 'pulse 1s ease-in-out';
      setTimeout(() => {
        saveBtn.style.animation = '';
      }, 1000);
    }
  }

  hideUnsavedChanges() {
    const saveBtn = this.elements.quickSave;
    saveBtn.style.animation = '';
  }

  async saveSettings() {
    try {
      const provider = this.elements.apiProvider.value;
      const apiKey = this.elements.apiKey.value.trim();

      // 驗證 API Key（如果需要）
      if (provider !== 'offline' && provider !== 'google' && !apiKey) {
        this.showStatus('請輸入 API Key', 'error');
        return;
      }

      // 顯示保存中狀態
      const saveBtn = this.elements.saveSettings;
      const originalText = saveBtn.textContent;
      saveBtn.textContent = '保存中...';
      saveBtn.disabled = true;

      const settings = {
        targetLanguage: this.elements.targetLanguage.value,
        ocrLanguage: this.elements.ocrLanguage.value,
        apiProvider: provider,
        autoCopy: this.elements.autoCopy.checked,
        showConfidence: this.elements.showConfidence.checked,
        apiKeys: {
          ...this.settings.apiKeys,
          [provider]: apiKey
        }
      };

      chrome.runtime.sendMessage({
        action: 'saveSettings',
        settings: settings
      }, (response) => {
        if (response && response.success) {
          this.settings = { ...this.settings, ...settings };

          // 顯示成功狀態
          saveBtn.textContent = '已保存';
          saveBtn.style.background = 'linear-gradient(135deg, #34a853, #34a853)';
          this.showStatus('高級設置已保存', 'success');

          // 更新主界面的設置顯示
          this.updateUI();

          setTimeout(() => {
            this.hideSettingsModal();
            // 恢復按鈕狀態
            saveBtn.textContent = originalText;
            saveBtn.style.background = '';
            saveBtn.disabled = false;
          }, 1000);
        } else {
          this.showStatus('保存失敗', 'error');
          saveBtn.textContent = originalText;
          saveBtn.disabled = false;
        }
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
      this.showStatus('保存失敗: ' + error.message, 'error');

      // 恢復按鈕狀態
      const saveBtn = this.elements.saveSettings;
      saveBtn.textContent = '保存設置';
      saveBtn.disabled = false;
    }
  }

  resetSettings() {
    if (confirm('確定要重置所有設置嗎？')) {
      const defaultSettings = {
        targetLanguage: 'zh-TW',
        ocrLanguage: 'eng',
        apiProvider: 'google',
        autoCopy: false,
        showConfidence: true,
        apiKeys: {}
      };

      chrome.runtime.sendMessage({
        action: 'saveSettings',
        settings: defaultSettings
      }, (response) => {
        if (response && response.success) {
          this.settings = defaultSettings;
          this.updateUI();
          this.showStatus('設置已重置', 'success');
        } else {
          this.showStatus('重置失敗', 'error');
        }
      });
    }
  }

  showSettingsModal() {
    this.elements.settingsModal.classList.remove('hidden');
  }

  hideSettingsModal() {
    this.elements.settingsModal.classList.add('hidden');
  }

  showStatus(message, type = 'info') {
    const statusEl = this.elements.statusMessage;
    statusEl.textContent = message;
    statusEl.className = `status-message ${type}`;
    statusEl.style.display = 'block';

    // 自動隱藏
    setTimeout(() => {
      statusEl.style.display = 'none';
    }, 3000);
  }

  async startShortcutRecording() {
    const input = this.elements.shortcutKey;
    const button = this.elements.changeShortcut;

    // 設置錄製狀態
    input.value = '按下新的快捷鍵...';
    input.focus();
    button.classList.add('shortcut-recording');
    button.textContent = '錄製中';

    // 監聽按鍵
    const handleKeyDown = (e) => {
      e.preventDefault();
      e.stopPropagation();

      const keys = [];
      if (e.ctrlKey) keys.push('Ctrl');
      if (e.altKey) keys.push('Alt');
      if (e.shiftKey) keys.push('Shift');
      if (e.metaKey) keys.push('Cmd');

      // 添加主鍵
      if (e.key && !['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) {
        keys.push(e.key.toUpperCase());
      }

      if (keys.length >= 2) {
        const shortcut = keys.join('+');
        this.saveShortcut(shortcut);
        this.endShortcutRecording();
      }

      // 移除監聽器
      document.removeEventListener('keydown', handleKeyDown, true);
    };

    // 添加監聽器
    document.addEventListener('keydown', handleKeyDown, true);

    // 10秒後自動取消
    setTimeout(() => {
      document.removeEventListener('keydown', handleKeyDown, true);
      this.endShortcutRecording();
    }, 10000);
  }

  endShortcutRecording() {
    const input = this.elements.shortcutKey;
    const button = this.elements.changeShortcut;

    button.classList.remove('shortcut-recording');
    button.textContent = '修改';

    // 恢復原來的快捷鍵顯示
    this.loadShortcutSetting();
  }

  async saveShortcut(shortcut) {
    try {
      // 保存到本地存儲
      await chrome.storage.local.set({ shortcutKey: shortcut });

      this.elements.shortcutKey.value = shortcut;
      this.showStatus(`快捷鍵已設置為: ${shortcut}`, 'success');

      // 注意：Chrome擴展的快捷鍵需要用戶在chrome://extensions/shortcuts手動設置
      this.showStatus('請在 chrome://extensions/shortcuts 中確認快捷鍵設置', 'info');

    } catch (error) {
      console.error('Failed to save shortcut:', error);
      this.showStatus('快捷鍵保存失敗', 'error');
    }
  }

  async loadShortcutSetting() {
    try {
      const result = await chrome.storage.local.get(['shortcutKey']);
      const shortcut = result.shortcutKey || 'Alt+1';
      this.elements.shortcutKey.value = shortcut;
    } catch (error) {
      console.error('Failed to load shortcut setting:', error);
      this.elements.shortcutKey.value = 'Alt+1';
    }
  }

  openShortcutSettings() {
    // 打開Chrome擴展快捷鍵設置頁面
    chrome.tabs.create({
      url: 'chrome://extensions/shortcuts'
    });
  }
}

// 初始化 Popup 控制器
document.addEventListener('DOMContentLoaded', () => {
  new PopupController();
});
