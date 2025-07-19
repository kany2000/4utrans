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
      if (command === 'start-capture') {
        this.handleShortcutCapture();
      }
    });

    console.log('Message listeners and commands set up successfully');
  }

  async handleShortcutCapture() {
    try {
      console.log('Shortcut capture triggered');

      // 获取当前活动标签
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tabs[0]) {
        console.error('No active tab found');
        return;
      }

      const tab = tabs[0];
      console.log('Active tab for shortcut:', tab.url);

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

      // 直接发送截图初始化消息，无需延迟
      try {
        await chrome.tabs.sendMessage(tab.id, { action: 'initCapture' });
        console.log('Shortcut capture initiated successfully');
      } catch (msgError) {
        console.error('Failed to send shortcut message:', msgError);
        // 如果失败，稍等片刻重试一次
        setTimeout(async () => {
          try {
            await chrome.tabs.sendMessage(tab.id, { action: 'initCapture' });
            console.log('Shortcut capture retry successful');
          } catch (retryError) {
            console.error('Shortcut capture retry failed:', retryError);
          }
        }, 200);
      }

    } catch (error) {
      console.error('Shortcut capture failed:', error);
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
}

console.log('Creating ScreenshotTranslator instance...');
const translator = new ScreenshotTranslator();
console.log('Background script loaded successfully');
