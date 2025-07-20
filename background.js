// 截圖翻譯器後台服務
console.log('Background script loading...');

class ScreenshotTranslator {
  constructor() {
    console.log('ScreenshotTranslator constructor called');
    this.isProcessing = false;
    this.setupMessageListeners();
    console.log('ScreenshotTranslator initialized');
  }

  setupMessageListeners() {
    console.log('Setting up message listeners...');
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      console.log('Message received:', request.action);
      this.handleMessage(request, sender, sendResponse);
      return true;
    });

    // 設置快捷鍵監聽
    chrome.commands.onCommand.addListener((command) => {
      console.log('Command received:', command);
      if (command === 'smart-translate') {
        this.handleSmartTranslate();
      } else {
        console.log('Unknown command:', command);
      }
    });

    console.log('Message listeners and commands set up successfully');
  }

  async handleSmartTranslate() {
    try {
      console.log('Smart translate triggered');

      // 获取当前活动标签
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tabs[0]) {
        console.error('No active tab found');
        return;
      }

      const tab = tabs[0];
      console.log('Active tab for smart translate:', tab.url);

      // 检查是否是受限制的页面
      if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('edge://')) {
        console.error('Cannot use shortcut on restricted pages');
        // 显示通知提醒用户
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon16.png',
          title: '截图翻译器',
          message: '无法在此页面使用快捷键，请切换到普通网页'
        });
        return;
      }

      // 获取用户设置的目标语言
      const userSettings = await this.getUserSettings();
      console.log('Using user target language:', userSettings.targetLanguage);

      // 注入 content script（如果尚未注入）
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        });
        console.log('Content script injected via shortcut');
      } catch (injectError) {
        console.log('Content script may already be injected:', injectError.message);
      }

      // 发送智能翻译初始化消息
      try {
        const message = {
          action: 'initCapture',
          smartMode: true,
          userSettings: userSettings
        };
        await chrome.tabs.sendMessage(tab.id, message);
        console.log('Smart translate initiated successfully');
      } catch (msgError) {
        console.error('Failed to send smart translate message:', msgError);
        // 如果失败，稍等片刻重试一次
        setTimeout(async () => {
          try {
            const retryMessage = {
              action: 'initCapture',
              smartMode: true,
              userSettings: userSettings
            };
            await chrome.tabs.sendMessage(tab.id, retryMessage);
            console.log('Smart translate retry successful');
          } catch (retryError) {
            console.error('Smart translate retry failed:', retryError);
          }
        }, 200);
      }

    } catch (error) {
      console.error('Smart translate failed:', error);
    }
  }

  async getUserSettings() {
    try {
      const result = await chrome.storage.local.get([
        'targetLanguage',
        'ocrLanguage',
        'apiProvider',
        'autoCopy',
        'showConfidence'
      ]);

      return {
        targetLanguage: result.targetLanguage || 'zh-TW',
        ocrLanguage: result.ocrLanguage || 'auto',
        apiProvider: result.apiProvider || 'google',
        autoCopy: result.autoCopy || false,
        showConfidence: result.showConfidence || false
      };
    } catch (error) {
      console.error('Failed to get user settings:', error);
      return {
        targetLanguage: 'zh-TW',
        ocrLanguage: 'auto',
        apiProvider: 'google',
        autoCopy: false,
        showConfidence: false
      };
    }
  }

  async handleMessage(request, sender, sendResponse) {
    console.log('Handling message:', request.action);

    try {
      switch (request.action) {
        case 'ping':
          console.log('Ping received');
          sendResponse({ success: true, message: 'pong', timestamp: Date.now() });
          break;
        case 'startCapture':
          console.log('Starting capture...');
          this.startCapture(sendResponse);
          break;
        case 'captureVisibleTab':
          console.log('Capturing visible tab...');
          this.captureVisibleTab(request.rect, sendResponse);
          break;
        case 'getSettings':
          console.log('Getting settings...');
          this.getSettings(sendResponse);
          break;
        case 'saveSettings':
          console.log('Saving settings...');
          this.saveSettings(request.settings, sendResponse);
          break;
        case 'translateText':
          console.log('Translating text...');
          this.translateText(request.text, request.sourceLang, request.targetLang, sendResponse);
          break;
        default:
          console.warn('Unknown action:', request.action);
          sendResponse({ error: 'Unknown action' });
      }
    } catch (error) {
      console.error('Error handling message:', error);
      sendResponse({ error: error.message });
    }
  }

  async startCapture(sendResponse) {
    try {
      console.log('Starting capture process...');

      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tabs[0]) {
        throw new Error('No active tab found');
      }

      const tab = tabs[0];
      console.log('Active tab:', tab.url);

      // 檢查是否是受限制的頁面
      if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('edge://')) {
        throw new Error('無法在此頁面使用截圖功能');
      }

      // 注入 content script（如果尚未注入）
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        });
        console.log('Content script injected');
      } catch (injectError) {
        console.log('Content script may already be injected:', injectError.message);
      }

      // 等待一下再發送消息
      setTimeout(async () => {
        try {
          await chrome.tabs.sendMessage(tab.id, { action: 'initCapture' });
          console.log('Init capture message sent');
        } catch (msgError) {
          console.error('Failed to send init message:', msgError);
          sendResponse({ error: '無法初始化截圖功能: ' + msgError.message });
        }
      }, 100);

      sendResponse({ success: true });
    } catch (error) {
      console.error('Failed to start capture:', error);
      sendResponse({ error: error.message });
    }
  }

  async getSettings(sendResponse) {
    try {
      const result = await chrome.storage.local.get([
        'targetLanguage',
        'ocrLanguage',
        'apiProvider',
        'autoCopy',
        'showConfidence',
        'apiKeys'
      ]);

      const settings = {
        targetLanguage: result.targetLanguage || 'zh-TW',
        ocrLanguage: result.ocrLanguage || 'eng',
        apiProvider: result.apiProvider || 'google',
        autoCopy: result.autoCopy || false,
        showConfidence: result.showConfidence !== false,
        apiKeys: result.apiKeys || {}
      };

      sendResponse({ success: true, settings });
    } catch (error) {
      console.error('Failed to get settings:', error);
      sendResponse({ error: error.message });
    }
  }

  async saveSettings(settings, sendResponse) {
    try {
      await chrome.storage.local.set(settings);
      sendResponse({ success: true });
    } catch (error) {
      console.error('Failed to save settings:', error);
      sendResponse({ error: error.message });
    }
  }

  async captureVisibleTab(rect, sendResponse) {
    try {
      console.log('Capturing visible tab with rect:', rect);

      // 獲取當前活動標籤
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tabs[0]) {
        throw new Error('No active tab found');
      }

      const tab = tabs[0];

      // 檢查權限
      if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('edge://')) {
        throw new Error('無法在此頁面進行截圖');
      }

      // 使用 Chrome 的截圖 API
      const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, {
        format: 'png',
        quality: 100
      });

      console.log('Screenshot captured successfully');

      sendResponse({
        success: true,
        dataUrl: dataUrl,
        rect: rect
      });

    } catch (error) {
      console.error('Failed to capture screenshot:', error);
      sendResponse({
        success: false,
        error: error.message
      });
    }
  }

  async translateText(text, sourceLang, targetLang, sendResponse) {
    try {
      console.log(`Background: Translating "${text}" from ${sourceLang} to ${targetLang}`);

      // 使用Google翻譯的免費API端點
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&ie=UTF-8&oe=UTF-8&q=${encodeURIComponent(text)}`;
      console.log('Background: Google Translate URL:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      console.log('Background: Google Translate response status:', response.status);

      if (!response.ok) {
        console.error(`Background: Google Translate HTTP error! status: ${response.status}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Background: Google Translate response data:', data);

      // 解析Google翻譯的響應格式
      if (data && data[0] && Array.isArray(data[0])) {
        let translatedText = '';
        for (const segment of data[0]) {
          if (segment && segment[0]) {
            translatedText += segment[0];
          }
        }
        const result = translatedText.trim();
        console.log('Background: Google Translate result:', result);

        if (result && result !== text) {
          console.log('Background: Translation successful');
          sendResponse({
            success: true,
            translatedText: result,
            sourceLang: sourceLang,
            targetLang: targetLang
          });
        } else {
          console.log('Background: Translation failed - result is empty or same as original');
          throw new Error('Translation result is empty or same as original');
        }
      } else {
        console.log('Background: Translation failed - invalid response format');
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Background: Translation error:', error);

      // 尝试备用翻译服务
      try {
        console.log('Background: Trying backup translation service...');
        const backupResult = await this.callBackupTranslateService(text, sourceLang, targetLang);
        if (backupResult && backupResult !== text) {
          console.log('Background: Backup translation successful:', backupResult);
          sendResponse({
            success: true,
            translatedText: backupResult,
            sourceLang: sourceLang,
            targetLang: targetLang,
            isBackup: true
          });
        } else {
          throw new Error('Backup translation also failed');
        }
      } catch (backupError) {
        console.error('Background: Backup translation failed:', backupError);
        sendResponse({
          success: false,
          error: `Translation failed: ${error.message}. Backup also failed: ${backupError.message}`
        });
      }
    }
  }

  async callBackupTranslateService(text, sourceLang, targetLang) {
    try {
      console.log(`Background: Trying backup translation service - ${sourceLang} -> ${targetLang}`);

      // 使用MyMemory翻譯API作為備用
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`;
      console.log('Background: Backup service URL:', url);

      const response = await fetch(url);
      const data = await response.json();

      console.log('Background: Backup service response:', data);

      if (data && data.responseData && data.responseData.translatedText) {
        const result = data.responseData.translatedText;
        console.log('Background: Backup service result:', result);

        if (result && result !== text && !result.includes('MYMEMORY WARNING')) {
          return result;
        }
      }

      throw new Error('Backup service failed or returned invalid result');
    } catch (error) {
      console.error('Background: Backup translation service error:', error);
      throw error;
    }
  }
}

console.log('Creating ScreenshotTranslator instance...');
const translator = new ScreenshotTranslator();
console.log('Background script loaded successfully');
