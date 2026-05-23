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
    // 初始化 i18n 并更新 UI
    this.initI18n();
    // 显示欢迎 toast 5 秒
    this.showWelcomeToast();
  }

  initI18n() {
    // i18n 已在 i18n.js 中初始化
    // 如果有保存的 UI 语言设置，使用它
    if (this.settings.uiLanguage && supportedLanguages.includes(this.settings.uiLanguage)) {
      i18n.setLanguage(this.settings.uiLanguage);
    }
    // 更新 UI 文字
    i18n.updateUI();
    // 设置语言选择器的值
    if (this.elements.uiLanguage) {
      this.elements.uiLanguage.value = i18n.getCurrentLanguage();
    }

    // 监听语言变更事件
    window.addEventListener('qtLanguageChanged', (e) => {
      console.log('Language changed to:', e.detail.language);
    });
  }

  async changeUILanguage() {
    const newLang = this.elements.uiLanguage.value;
    console.log('Changing UI language to:', newLang);

    // 更新 i18n 语言
    i18n.setLanguage(newLang);

    // 保存到 storage
    try {
      await chrome.storage.local.set({ uiLanguage: newLang });
      this.showStatus(i18n.t('status.saved'), 'success');
    } catch (error) {
      console.error('Failed to save UI language:', error);
    }
  }

  showWelcomeToast() {
    // 检查是否是首次安装或需要显示欢迎提示
    // 注意：在开发者模式下 onInstalled 不会触发，所以我们也检查是否有任何已保存的设置
    chrome.storage.local.get(['shouldShowWelcome', 'targetLanguage'], (result) => {
      // 如果 shouldShowWelcome 为 true，或者没有任何已保存的设置（首次安装）
      const isFirstInstall = !result.shouldShowWelcome && !result.targetLanguage;

      if (result.shouldShowWelcome === false && !isFirstInstall) {
        return; // 不是首次安装，且不需要显示
      }

      const welcomeToast = document.getElementById('welcome-toast');
      if (welcomeToast) {
        // 添加 visible 类，显示 toast
        welcomeToast.classList.add('visible');

        // 5 秒后隐藏
        setTimeout(() => {
          welcomeToast.classList.remove('visible');
          welcomeToast.classList.add('hidden');
        }, 5000);

        // 点击关闭按钮手动关闭
        const closeBtn = welcomeToast.querySelector('.toast-close');
        if (closeBtn) {
          closeBtn.onclick = () => {
            welcomeToast.classList.remove('visible');
            welcomeToast.classList.add('hidden');
          };
        }
      }

      // 显示后清除标记，避免下次打开 popup 时重复显示
      chrome.storage.local.set({ shouldShowWelcome: false });
    });
  }

  bindElements() {
    this.elements = {
      startCapture: document.getElementById('start-capture'),
      targetLanguage: document.getElementById('target-language'),
      ocrLanguage: document.getElementById('ocr-language'),
      uiLanguage: document.getElementById('ui-language'),
      quickSave: document.getElementById('quick-save'),
      settingsBtn: document.getElementById('settings-btn'),
      historyBtn: document.getElementById('history-btn'),
      wordsBtn: document.getElementById('words-btn'),
      settingsModal: document.getElementById('settings-modal'),
      closeSettings: document.getElementById('close-settings'),
      apiProvider: document.getElementById('api-provider'),
      microsoftApiKey: document.getElementById('microsoft-api-key'),
      microsoftApiKeyGroup: document.getElementById('microsoft-api-key-group'),
      glmApiKey: document.getElementById('glm-api-key'),
      glmApiKeyGroup: document.getElementById('glm-api-key-group'),
      customApiKey: document.getElementById('custom-api-key'),
      customApiKeyGroup: document.getElementById('custom-api-key-group'),
      llmCustomConfig: document.getElementById('llm-custom-config'),
      llmBaseUrl: document.getElementById('llm-base-url'),
      llmModel: document.getElementById('llm-model'),
      llmModelCustom: document.getElementById('llm-model-custom'),
      llmModelHelp: document.getElementById('llm-model-help'),
      fetchModels: document.getElementById('fetch-models'),
      quickPanelEnabled: document.getElementById('quick-panel-enabled'),
      hoverTranslationEnabled: document.getElementById('hover-translation-enabled'),
      multiEngineEnabled: document.getElementById('multi-engine-enabled'),
      minSelectionLength: document.getElementById('min-selection-length'),
      autoCopy: document.getElementById('auto-copy'),
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

    // 歷史按鈕
    this.elements.historyBtn.addEventListener('click', () => {
      this.showHistoryModal();
    });

    // 生詞本按鈕
    this.elements.wordsBtn.addEventListener('click', () => {
      this.showWordsModal();
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

    // UI 語言設置變更時即時切換
    this.elements.uiLanguage.addEventListener('change', () => {
      this.changeUILanguage();
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

    // 獲取模型列表
    this.elements.fetchModels.addEventListener('click', () => {
      this.fetchAvailableModels();
    });

    // 模型選擇變更時切換自定義輸入
    this.elements.llmModel.addEventListener('change', () => {
      const selectedValue = this.elements.llmModel.value;
      if (selectedValue === '__custom__') {
        this.elements.llmModel.classList.add('hidden');
        this.elements.llmModelCustom.classList.remove('hidden');
        this.elements.llmModelCustom.focus();
        this.elements.llmModelHelp.textContent = '請輸入模型名稱，或清空後點擊下方重新選擇';
      } else if (selectedValue) {
        this.elements.llmModel.classList.remove('hidden');
        this.elements.llmModelCustom.classList.add('hidden');
        this.elements.llmModelHelp.textContent = `已選擇: ${selectedValue}`;
      }
      this.showUnsavedChanges();
    });

    // 自定義模型輸入框變更時標記未保存
    this.elements.llmModelCustom.addEventListener('input', () => this.showUnsavedChanges());

    // 自定義模型輸入框失去焦點時，如果為空則顯示下拉框
    this.elements.llmModelCustom.addEventListener('blur', () => {
      const customValue = this.elements.llmModelCustom.value.trim();
      if (!customValue) {
        this.elements.llmModel.classList.remove('hidden');
        this.elements.llmModelCustom.classList.add('hidden');
        this.elements.llmModel.value = '';
        this.elements.llmModelHelp.textContent = '選擇可用模型，或直接輸入模型名稱';
      }
    });

    // LLM 配置變更時標記未保存
    this.elements.customApiKey?.addEventListener('input', () => this.showUnsavedChanges());
    this.elements.llmBaseUrl.addEventListener('input', () => this.showUnsavedChanges());
  }

  async fetchAvailableModels() {
    const apiKey = this.elements.customApiKey?.value.trim() || this.elements.apiKey?.value.trim() || '';
    const baseUrl = this.elements.llmBaseUrl.value.trim();

    if (!apiKey || !baseUrl) {
      this.showStatus('請先填寫 API Key 和 Base URL', 'error');
      return;
    }

    this.showStatus('正在獲取模型列表...', 'info');
    this.elements.fetchModels.disabled = true;
    this.elements.fetchModels.textContent = '載入中...';

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'getModels',
        apiKey: apiKey,
        baseUrl: baseUrl
      });

      if (response && response.success && response.models) {
        const models = response.models;
        this.elements.llmModel.innerHTML = '';

        if (models.length === 0) {
          const option = document.createElement('option');
          option.value = '';
          option.textContent = '-- 未找到模型 --';
          this.elements.llmModel.appendChild(option);
          this.showStatus('未找到可用模型', 'error');
        } else {
          // 添加常用模型選項
          const popularModels = ['gpt-4o', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo', 'claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'];
          const sortedModels = models.sort((a, b) => {
            const aPopular = popularModels.indexOf(a);
            const bPopular = popularModels.indexOf(b);
            if (aPopular !== -1 && bPopular !== -1) return aPopular - bPopular;
            if (aPopular !== -1) return -1;
            if (bPopular !== -1) return 1;
            return a.localeCompare(b);
          });

          sortedModels.forEach(model => {
            const option = document.createElement('option');
            option.value = model;
            option.textContent = model;
            this.elements.llmModel.appendChild(option);
          });

          // 添加自定義選項
          const customOption = document.createElement('option');
          customOption.value = '__custom__';
          customOption.textContent = '-- 或輸入自定義模型 --';
          this.elements.llmModel.appendChild(customOption);

          this.showStatus(`已載入 ${models.length} 個模型`, 'success');
        }
      } else {
        this.showStatus(response?.error || '獲取模型列表失敗', 'error');
        // 添加錯誤提示選項
        this.elements.llmModel.innerHTML = '';
        const option = document.createElement('option');
        option.value = '';
        option.textContent = '-- 獲取失敗，請手動輸入 --';
        this.elements.llmModel.appendChild(option);

        const customOption = document.createElement('option');
        customOption.value = '__custom__';
        customOption.textContent = '-- 或輸入自定義模型 --';
        this.elements.llmModel.appendChild(customOption);
      }
    } catch (error) {
      console.error('Popup: Error fetching models:', error);
      this.showStatus('獲取模型列表失敗: ' + error.message, 'error');
    } finally {
      this.elements.fetchModels.disabled = false;
      this.elements.fetchModels.textContent = '🔄 獲取可用模型';
    }
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
      quickPanelEnabled: true,
      hoverTranslationEnabled: false,
      multiEngineEnabled: false,
      minSelectionLength: 2,
      apiKeys: {},
      llmConfig: {
        baseUrl: '',
        model: ''
      },
      uiLanguage: 'en'
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

    // 更新 UI 語言設置
    if (this.elements.uiLanguage) {
      const savedLang = this.settings.uiLanguage || 'en';
      if (supportedLanguages.includes(savedLang)) {
        this.elements.uiLanguage.value = savedLang;
      }
    }

    // 更新高級設置
    this.elements.apiProvider.value = this.settings.apiProvider || 'google';
    this.elements.autoCopy.checked = this.settings.autoCopy || false;

    // 更新快捷面板設置
    this.elements.quickPanelEnabled.checked = this.settings.quickPanelEnabled !== false;
    this.elements.hoverTranslationEnabled.checked = this.settings.hoverTranslationEnabled || false;
    this.elements.multiEngineEnabled.checked = this.settings.multiEngineEnabled || false;
    this.elements.minSelectionLength.value = this.settings.minSelectionLength || 2;

    // 更新 API Key（根据 provider 显示对应的输入框）
    this.elements.microsoftApiKey.value = this.settings.apiKeys?.microsoft || '';
    this.elements.glmApiKey.value = this.settings.apiKeys?.glm || '';
    this.elements.customApiKey.value = this.settings.apiKeys?.custom || '';

    // 更新 LLM 自定義配置
    if (this.settings.llmConfig) {
      this.elements.llmBaseUrl.value = this.settings.llmConfig.baseUrl || '';
      const savedModel = this.settings.llmConfig.model || '';

      if (savedModel) {
        // 檢查模型是否已在下拉列表中
        const options = this.elements.llmModel.options;
        let found = false;

        for (let i = 0; i < options.length; i++) {
          if (options[i].value === savedModel) {
            this.elements.llmModel.value = savedModel;
            this.elements.llmModel.classList.remove('hidden');
            this.elements.llmModelCustom.classList.add('hidden');
            this.elements.llmModelHelp.textContent = `已選擇: ${savedModel}`;
            found = true;
            break;
          }
        }

        if (!found) {
          // 模型不在列表中，使用自定義輸入框顯示
          this.elements.llmModel.classList.add('hidden');
          this.elements.llmModelCustom.classList.remove('hidden');
          this.elements.llmModelCustom.value = savedModel;
          this.elements.llmModelHelp.textContent = `當前模型: ${savedModel}`;
        }
      } else {
        // 沒有保存的模型，確保下拉框可見
        this.elements.llmModel.classList.remove('hidden');
        this.elements.llmModelCustom.classList.add('hidden');
        this.elements.llmModel.value = '';
      }
    }

    // 載入快捷鍵設置
    this.loadShortcutSetting();

    // 切換 API Key 輸入框顯示
    this.toggleApiKeyInput();
  }

  toggleApiKeyInput() {
    const provider = this.elements.apiProvider.value;

    // 隐藏所有 API Key 输入框
    this.elements.microsoftApiKeyGroup?.classList.add('hidden');
    this.elements.glmApiKeyGroup?.classList.add('hidden');
    this.elements.customApiKeyGroup?.classList.add('hidden');

    // LLM 自定義配置顯示/隱藏（custom 和 offline 需要）
    if (provider === 'custom' || provider === 'offline') {
      this.elements.llmCustomConfig.classList.remove('hidden');
      // 启用 LLM 相关输入框
      this.elements.llmBaseUrl?.removeAttribute('disabled');
      this.elements.llmModel?.removeAttribute('disabled');
      this.elements.llmModelCustom?.removeAttribute('disabled');
      this.elements.fetchModels?.removeAttribute('disabled');
    } else {
      this.elements.llmCustomConfig.classList.add('hidden');
      // 禁用 LLM 相关输入框
      this.elements.llmBaseUrl?.setAttribute('disabled', 'true');
      this.elements.llmModel?.setAttribute('disabled', 'true');
      this.elements.llmModelCustom?.setAttribute('disabled', 'true');
      this.elements.fetchModels?.setAttribute('disabled', 'true');
    }

    // 根据 provider 显示对应的 API Key 输入框
    switch (provider) {
      case 'microsoft':
        this.elements.microsoftApiKeyGroup?.classList.remove('hidden');
        break;
      case 'glm':
        this.elements.glmApiKeyGroup?.classList.remove('hidden');
        break;
      case 'custom':
      case 'offline':
        this.elements.customApiKeyGroup?.classList.remove('hidden');
        break;
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

      // 驗證 LLM 自定義配置（如果選擇了 custom）
      if (provider === 'custom') {
        const baseUrl = this.elements.llmBaseUrl.value.trim();
        const isCustomInputVisible = !this.elements.llmModelCustom.classList.contains('hidden');
        const modelFromDropdown = this.elements.llmModel.value;
        const modelFromCustomInput = this.elements.llmModelCustom.value.trim();
        const finalModel = isCustomInputVisible ? modelFromCustomInput : modelFromDropdown;

        if (!baseUrl) {
          this.showStatus('請填寫 Base URL', 'error');
          return;
        }
        if (!finalModel || finalModel === '__custom__') {
          this.showStatus('請選擇或輸入模型名稱', 'error');
          return;
        }
      }

      // 顯示保存中狀態
      const saveBtn = this.elements.saveSettings;
      const originalText = saveBtn.textContent;
      saveBtn.textContent = '保存中...';
      saveBtn.disabled = true;

      // 收集各 provider 的 API Key
      const apiKeys = {
        ...this.settings.apiKeys,
        microsoft: this.elements.microsoftApiKey?.value.trim() || '',
        glm: this.elements.glmApiKey?.value.trim() || '',
        custom: this.elements.customApiKey?.value.trim() || ''
      };

      const settings = {
        targetLanguage: this.elements.targetLanguage.value,
        ocrLanguage: this.elements.ocrLanguage.value,
        apiProvider: provider,
        autoCopy: this.elements.autoCopy.checked,
        quickPanelEnabled: this.elements.quickPanelEnabled.checked,
        hoverTranslationEnabled: this.elements.hoverTranslationEnabled.checked,
        multiEngineEnabled: this.elements.multiEngineEnabled.checked,
        minSelectionLength: parseInt(this.elements.minSelectionLength.value) || 2,
        apiKeys: apiKeys,
        llmConfig: provider === 'custom' ? {
          baseUrl: this.elements.llmBaseUrl.value.trim(),
          model: (() => {
            const isCustomInputVisible = !this.elements.llmModelCustom.classList.contains('hidden');
            const dropdownValue = this.elements.llmModel.value;
            const customValue = this.elements.llmModelCustom.value.trim();

            // 如果自定義輸入框可見，使用自定義輸入的值
            // 否則使用下拉框的值（但排除 __custom__ 選項）
            let finalModel = isCustomInputVisible ? customValue : dropdownValue;

            // 確保不會保存 __custom__ 這個佔位符
            if (finalModel === '__custom__') {
              finalModel = customValue || '';
            }

            console.log('Popup: Saving LLM model config:', {
              isCustomInputVisible,
              dropdownValue,
              customValue,
              finalModel
            });

            return finalModel;
          })()
        } : this.settings.llmConfig
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
    if (confirm(i18n.t('status.resetConfirm'))) {
      const defaultSettings = {
        targetLanguage: 'zh-TW',
        ocrLanguage: 'eng',
        apiProvider: 'google',
        autoCopy: false,
        quickPanelEnabled: true,
        hoverTranslationEnabled: false,
        multiEngineEnabled: false,
        minSelectionLength: 2,
        apiKeys: {},
        llmConfig: {
          baseUrl: '',
          model: ''
        }
      };

      chrome.runtime.sendMessage({
        action: 'saveSettings',
        settings: defaultSettings
      }, (response) => {
        if (response && response.success) {
          this.settings = defaultSettings;
          this.updateUI();
          this.showStatus(i18n.t('status.reset'), 'success');
        } else {
          this.showStatus('重置失敗', 'error');
        }
      });
    }
  }

  showSettingsModal() {
    this.elements.settingsModal.classList.remove('hidden');
  }

  showHistoryModal() {
    chrome.runtime.sendMessage({ action: 'getTranslationHistory' }, (response) => {
      if (response && response.success) {
        const history = response.data || [];
        const list = history.map(item =>
          `<div class="modal-list-item">
            <div class="modal-item-original">${this.escapeHtml(item.original)}</div>
            <div class="modal-item-translation">${this.escapeHtml(item.translation)}</div>
            <div class="modal-item-time">${new Date(item.timestamp).toLocaleString()}</div>
          </div>`
        ).join('');

        const content = history.length === 0
          ? `<div class="modal-empty">${i18n.t('float.history.empty')}</div>`
          : `<div class="modal-list">${list}</div>`;

        this.showModal(`${i18n.t('btn.history')} (${history.length}/500)`, content);
      }
    });
  }

  showWordsModal() {
    chrome.runtime.sendMessage({ action: 'getSavedWords' }, (response) => {
      if (response && response.success) {
        const words = response.data || [];
        const list = words.map(item =>
          `<div class="modal-list-item">
            <div class="modal-item-original">${this.escapeHtml(item.original)}</div>
            <div class="modal-item-translation">${this.escapeHtml(item.translation)}</div>
            <button class="modal-delete-btn" data-id="${item.id}">${i18n.t('float.btn.delete')}</button>
          </div>`
        ).join('');

        const actionButtons = `
          <div class="modal-actions">
            <button id="words-export-btn" class="secondary-btn">${i18n.t('btn.export')}</button>
            <button id="words-import-btn" class="secondary-btn">${i18n.t('btn.import')}</button>
          </div>
        `;

        const content = words.length === 0
          ? `<div class="modal-empty">${i18n.t('float.words.empty')}</div>${actionButtons}`
          : `<div class="modal-list">${list}</div>${actionButtons}`;

        this.showModal(`${i18n.t('btn.words')} (${words.length}/500)`, content);

        // 绑定删除按钮事件
        document.querySelectorAll('.modal-delete-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.dataset.id);
            chrome.runtime.sendMessage({ action: 'removeFromSavedWords', id }, () => {
              this.showWordsModal(); // 刷新
            });
          });
        });

        // 绑定导出按钮事件
        document.getElementById('words-export-btn')?.addEventListener('click', () => {
          this.exportData();
        });

        // 绑定导入按钮事件
        document.getElementById('words-import-btn')?.addEventListener('click', () => {
          this.importData();
        });
      }
    });
  }

  exportData() {
    chrome.runtime.sendMessage({ action: 'exportData' }, (response) => {
      if (response && response.success) {
        const jsonStr = JSON.stringify(response.data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `quicktranslate-backup-${new Date().toISOString().slice(0,10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        this.showStatus('導出成功', 'success');
      } else {
        this.showStatus('導出失敗', 'error');
      }
    });
  }

  importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          chrome.runtime.sendMessage({ action: 'importData', data }, (response) => {
            if (response && response.success) {
              this.showStatus('導入成功', 'success');
            } else {
              this.showStatus('導入失敗: ' + (response?.error || '未知錯誤'), 'error');
            }
          });
        } catch (err) {
          this.showStatus('文件格式錯誤', 'error');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  showModal(title, content) {
    // 移除已存在的模态框
    const existing = document.querySelector('.float-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.className = 'float-modal';
    modal.innerHTML = `
      <div class="float-modal-content">
        <div class="float-modal-header">
          <span>${title}</span>
          <button class="float-modal-close">×</button>
        </div>
        <div class="float-modal-body">${content}</div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('.float-modal-close').addEventListener('click', () => {
      modal.remove();
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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