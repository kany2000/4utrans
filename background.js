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
        'showConfidence',
        'apiKeys',
        'llmConfig'
      ]);

      return {
        targetLanguage: result.targetLanguage || 'zh-TW',
        ocrLanguage: result.ocrLanguage || 'auto',
        apiProvider: result.apiProvider || 'google',
        autoCopy: result.autoCopy || false,
        showConfidence: result.showConfidence || false,
        apiKeys: result.apiKeys || {},
        llmConfig: result.llmConfig || { baseUrl: '', model: '' }
      };
    } catch (error) {
      console.error('Failed to get user settings:', error);
      return {
        targetLanguage: 'zh-TW',
        ocrLanguage: 'auto',
        apiProvider: 'google',
        autoCopy: false,
        showConfidence: false,
        apiKeys: {},
        llmConfig: { baseUrl: '', model: '' }
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
        case 'getModels':
          console.log('Getting available models...');
          this.getAvailableModels(request.apiKey, request.baseUrl, sendResponse);
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
        'apiKeys',
        'llmConfig'
      ]);

      const settings = {
        targetLanguage: result.targetLanguage || 'zh-TW',
        ocrLanguage: result.ocrLanguage || 'eng',
        apiProvider: result.apiProvider || 'google',
        autoCopy: result.autoCopy || false,
        showConfidence: result.showConfidence !== false,
        apiKeys: result.apiKeys || {},
        llmConfig: result.llmConfig || { baseUrl: '', model: '' }
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

  async getAvailableModels(apiKey, baseUrl, sendResponse) {
    try {
      // 构建 API URL
      let url = baseUrl.trim();
      if (url.endsWith('/')) {
        url = url.slice(0, -1);
      }
      // 尝试 OpenAI 兼容的 models 端点
      const modelsUrl = `${url}/models`;

      console.log('Background: Fetching models from:', modelsUrl);

      const response = await fetch(modelsUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Background: Failed to fetch models:', errorText);
        throw new Error(`Failed to fetch models: ${response.status}`);
      }

      const data = await response.json();

      // 解析 OpenAI 格式的响应
      let models = [];
      if (data.data && Array.isArray(data.data)) {
        models = data.data.map(model => model.id);
      } else if (Array.isArray(data)) {
        models = data.map(model => typeof model === 'string' ? model : model.id);
      }

      console.log('Background: Found models:', models);
      sendResponse({ success: true, models: models });
    } catch (error) {
      console.error('Background: Error fetching models:', error);
      sendResponse({ success: false, error: error.message });
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

      // 获取用户设置的 API Provider
      const settings = await this.getUserSettings();
      const apiProvider = settings.apiProvider || 'google';

      console.log('Background: Using API provider:', apiProvider);

      let result;

      // 根据 API Provider 选择翻译方法
      switch (apiProvider) {
        case 'glm':
          // 使用 GLM 大模型翻译
          const glmApiKey = settings.apiKeys?.glm;
          if (!glmApiKey) {
            throw new Error('GLM API Key 未设置，请在设置中配置');
          }
          result = await this.callGLMTranslate(text, sourceLang, targetLang, glmApiKey);
          break;

        case 'microsoft':
          // 使用 Microsoft Translator（免费）
          result = await this.callMicrosoftTranslate(text, sourceLang, targetLang);
          break;

        case 'custom':
          // 使用通用 LLM（OpenAI 兼容格式）
          const customApiKey = settings.apiKeys?.custom;
          const llmConfig = settings.llmConfig || {};
          if (!customApiKey || !llmConfig.baseUrl || !llmConfig.model) {
            throw new Error('LLM 自定义配置不完整，请检查 API Key、Base URL 和模型名称');
          }
          result = await this.callCustomLLMTranslate(text, sourceLang, targetLang, customApiKey, llmConfig);
          break;

        case 'google':
        default:
          // 默认使用 Google 翻译（免费）
          result = await this.callGoogleTranslate(text, sourceLang, targetLang);
          break;
      }

      sendResponse({
        success: true,
        translatedText: result,
        sourceLang: sourceLang,
        targetLang: targetLang
      });
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

  // 格式化中文翻译结果，在词之间添加空格
  formatChineseResult(text, translatedText, sourceLang) {
    // 检查是否应该添加词间空格
    // 如果原文是英文单词列表（由多个空格分隔的短词组成）且翻译目标是中文
    const isChineseTarget = translatedText.match(/[\u4e00-\u9fff]/) !== null;
    const isEnglishSource = sourceLang === 'en';
    const isWordList = text && text.split(/\s+/).length > 1 && text.split(/\s+/).every(word => word.length <= 15);

    if (isChineseTarget && isEnglishSource && isWordList) {
      // 在每个中文字符之间添加空格（保留标点符号）
      return translatedText.replace(/([\u4e00-\u9fff])([\u4e00-\u9fff])/g, '$1 $2');
    }

    return translatedText;
  }

  // Google 翻译（免费）
  async callGoogleTranslate(text, sourceLang, targetLang) {
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
      throw new Error(`Google Translate HTTP error! status: ${response.status}`);
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
      let result = translatedText.trim();
      // 格式化中文结果，添加词间空格
      result = this.formatChineseResult(text, result, sourceLang);
      console.log('Background: Google Translate result:', result);

      if (result && result !== text) {
        console.log('Background: Google translation successful');
        return result;
      }
    }

    throw new Error('Google translation failed - invalid response format');
  }

  // Microsoft Translator（免费）
  async callMicrosoftTranslate(text, sourceLang, targetLang) {
    try {
      console.log(`Background: Calling Microsoft Translator - ${sourceLang} -> ${targetLang}`);

      // Microsoft Translator API 端点（免费版本）
      const endpoint = 'https://api.cognitive.microsofttranslator.com/translate?api-version=3.0';

      // 语言代码映射
      const langMap = {
        'zh': 'zh-Hans',
        'zh-cn': 'zh-Hans',
        'zh-CN': 'zh-Hans',
        'zh-TW': 'zh-Hant',
        'en': 'en',
        'ja': 'ja',
        'ko': 'ko',
        'fr': 'fr',
        'de': 'de',
        'es': 'es'
      };

      const fromLang = langMap[sourceLang] || sourceLang;
      const toLang = langMap[targetLang] || targetLang;

      const url = `${endpoint}&from=${fromLang}&to=${toLang}`;
      console.log('Background: Microsoft Translator URL:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([{ text: text }])
      });

      console.log('Background: Microsoft Translator response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Background: Microsoft Translator error:', errorText);
        throw new Error(`Microsoft Translator error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Background: Microsoft Translator response:', data);

      if (data && data[0] && data[0].translations && data[0].translations[0]) {
        let result = data[0].translations[0].text;
        // 格式化中文结果，添加词间空格
        result = this.formatChineseResult(text, result, sourceLang);
        console.log('Background: Microsoft translation result:', result);
        return result;
      }

      throw new Error('Microsoft translation failed - invalid response format');
    } catch (error) {
      console.error('Background: Microsoft translation error:', error);
      throw error;
    }
  }

  // GLM 大模型翻译
  async callGLMTranslate(text, sourceLang, targetLang, apiKey) {
    try {
      console.log(`Background: Calling GLM API - ${sourceLang} -> ${targetLang}`);

      // 语言代码映射到 GLM 友好的语言描述
      const langMap = {
        'zh': '中文',
        'zh-cn': '简体中文',
        'zh-TW': '繁体中文',
        'en': '英文',
        'ja': '日文',
        'ko': '韩文',
        'fr': '法文',
        'de': '德文',
        'es': '西班牙文',
        'auto': '自动检测'
      };

      const sourceLangName = langMap[sourceLang] || '源语言';
      const targetLangName = langMap[targetLang] || '目标语言';

      const prompt = `你是一个专业的翻译引擎。请将以下${sourceLangName}文本翻译成${targetLangName}，只返回翻译结果，不要添加任何解释、备注或格式：

${text}`;

      // 设置 60 秒超时
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'glm-4-flash',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.1,
          stream: false
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log('Background: GLM API response status:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Background: GLM API error:', errorData);
        throw new Error(`GLM API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Background: GLM API response:', data);

      if (data.choices && data.choices[0] && data.choices[0].message) {
        let result = data.choices[0].message.content.trim();
        // 格式化中文结果，添加词间空格
        result = this.formatChineseResult(text, result, sourceLang);
        console.log('Background: GLM translation result:', result);
        return result;
      }

      throw new Error('Invalid GLM API response format');
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        console.error('Background: GLM request timeout');
        throw new Error('GLM 请求超时，请检查网络连接或 API 服务状态');
      }
      console.error('Background: GLM translation error:', error);
      throw error;
    }
  }

  // 通用 LLM 翻译（OpenAI 兼容格式）
  async callCustomLLMTranslate(text, sourceLang, targetLang, apiKey, llmConfig) {
    try {
      console.log(`Background: Calling Custom LLM API - ${sourceLang} -> ${targetLang}`);
      console.log('Background: LLM Config:', llmConfig);

      // 语言代码映射到友好的语言描述
      const langMap = {
        'zh': '中文',
        'zh-cn': '简体中文',
        'zh-CN': '简体中文',
        'zh-TW': '繁体中文',
        'en': '英文',
        'ja': '日文',
        'ko': '韩文',
        'fr': '法文',
        'de': '德文',
        'es': '西班牙文',
        'auto': '源语言'
      };

      const sourceLangName = langMap[sourceLang] || sourceLang;
      const targetLangName = langMap[targetLang] || targetLang;

      const prompt = `你是一个专业的翻译引擎。请将以下${sourceLangName}文本翻译成${targetLangName}，只返回翻译结果，不要添加任何解释、备注或格式：

${text}`;

      // 构建 API URL（处理 baseUrl 末尾的斜杠）
      let baseUrl = llmConfig.baseUrl.trim();
      if (baseUrl.endsWith('/')) {
        baseUrl = baseUrl.slice(0, -1);
      }
      const chatEndpoint = `${baseUrl}/chat/completions`;

      console.log('Background: Custom LLM endpoint:', chatEndpoint);

      // 设置 60 秒超时
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      let response;
      try {
        response = await fetch(chatEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: llmConfig.model,
            messages: [
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.1,
            stream: false
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        console.log('Background: Custom LLM response status:', response.status);

        if (!response.ok) {
          const errorData = await response.text();
          console.error('Background: Custom LLM API error:', errorData);
          throw new Error(`Custom LLM API error: ${response.status}`);
        }

        const data = await response.json();
        console.log('Background: Custom LLM response:', data);

        if (data.choices && data.choices[0] && data.choices[0].message) {
          let result = data.choices[0].message.content.trim();
          // 格式化中文结果，添加词间空格
          result = this.formatChineseResult(text, result, sourceLang);
          console.log('Background: Custom LLM translation result:', result);
          return result;
        }

        throw new Error('Invalid Custom LLM API response format');
      } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          console.error('Background: Custom LLM request timeout');
          throw new Error('LLM 请求超时，请检查网络连接或 API 服务状态');
        }
        console.error('Background: Custom LLM translation error:', error);
        throw error;
      }
    } catch (error) {
      console.error('Background: Custom LLM translation error:', error);
      throw error;
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
