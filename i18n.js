// i18n - 国际化翻译文件
// 支持的语言：简体中文(zh-CN)、繁体中文(zh-TW)、英文(en)、日文(ja)、韩文(ko)

const translations = {
  'zh-CN': {
    // 标题和版本
    'app.title': 'QuickTranslate 快译',
    'app.version': 'v2.3.0',

    // 主要按钮
    'btn.startCapture': '开始截图',
    'btn.save': '保存设置',
    'btn.advanced': '高级设置',
    'btn.saveSettings': '保存设置',
    'btn.resetSettings': '重置',
    'btn.close': '×',
    'btn.fetchModels': '🔄 获取可用模型',

    // 提示信息
    'hint.captureDesc': '拖拽选择区域，自动识别并翻译文字',
    'hint.shortcut': '默认快捷键：Alt+1 智能翻译（自动检测语言翻译成目标语言）',
    'hint.apiKey': 'API密钥将安全存储在本地',
    'hint.baseUrl': 'OpenAI 兼容的 API 地址',
    'hint.llmModel': '选择可用模型，或直接输入模型名称',
    'hint.quickPanel': '选中网页文字后自动显示翻译按钮',
    'hint.hover': '按住 Alt 键并将鼠标悬停在文字上，无需选中即可翻译',
    'hint.multiEngine': '同时展示 Google / Microsoft / LLM 翻译结果，方便对比选择',
    'hint.minSelection': '选择少于此字数不会触发翻译按钮',
    'hint.shortcutKey': '使用快捷键快速启动截图翻译',
    'hint.microApiKey': 'Microsoft Translator 需要 API Key',
    'hint.glmApiKey': 'GLM 大模型翻译需要 API Key',

    // 标签
    'label.targetLanguage': '目标语言:',
    'label.ocrLanguage': '识别语言:',
    'label.apiProvider': '翻译服务:',
    'label.microsoftApiKey': 'Microsoft API Key:',
    'label.glmApiKey': 'GLM API Key:',
    'label.customApiKey': '自定义 LLM API Key:',
    'label.baseUrl': 'Base URL:',
    'label.llmModel': '模型名称:',
    'label.minSelection': '最小选择字数:',
    'label.shortcutKey': '快捷键设置:',
    'label.placeholder.key': '输入 Microsoft Translator API Key',
    'label.placeholder.glm': '输入智谱 GLM API Key',
    'label.placeholder.custom': '输入您的 API Key',
    'label.placeholder.url': 'https://api.openai.com/v1',
    'label.placeholder.shortcut': '点击设置快捷键',
    'label.placeholder.selectModel': '-- 请先填写 API Key 和 Base URL --',
    'label.placeholder.customModel': '或直接输入模型名称',

    // 选项
    'opt.autoDetect': '自动检测 (推荐)',
    'opt.google': 'Google Translate (推荐)',
    'opt.microsoft': 'Microsoft Translator',
    'opt.offline': '离线翻译',
    'opt.glm': 'GLM 大模型 (智谱)',
    'opt.custom': 'LLM 自定义 (OpenAI 兼容)',
    'opt.enableQuickPanel': '启用快捷翻译面板 (选中文字即可翻译)',
    'opt.enableHover': '启用悬浮翻译 (按 Alt 键悬停翻译)',
    'opt.multiEngine': '多引擎结果对比',
    'opt.autoCopy': '自动复制翻译结果',

    // 高级设置
    'settings.title': '高级设置',
    'settings.recording': '录制中',
    'settings.pressKey': '按下新的快捷键...',
    'settings.confirmShortcut': '请在 chrome://extensions/shortcuts 中确认快捷键设置',

    // 状态消息
    'status.saving': '保存中...',
    'status.saved': '已保存',
    'status.savedBasic': '基本设置已保存',
    'status.savedAdvanced': '高级设置已保存',
    'status.reset': '设置已重置',
    'status.resetConfirm': '确定要重置所有设置吗？',
    'status.loading': '正在获取模型列表...',
    'status.modelsLoaded': '已载入 {count} 个模型',
    'status.noModels': '未找到可用模型',
    'status.fetchFailed': '获取失败，请手动输入',
    'status.fetchModelsFailed': '获取模型列表失败',
    'status.starting': '正在启动截图...',
    'status.captureStarted': '截图已启动',
    'status.captureFailed': '启动失败',
    'status.capturingError': '无法在此页面使用截图功能',
    'status.connectionRetry': 'Service Worker 未启动，正在重试...',
    'status.connectionRecovered': '连接已恢复，请重新点击开始截图',
    'status.connectionFailed': '连接失败，请重新载入扩展',
    'status.capturingRestricted': '无法在此页面使用快捷键，请切换到普通网页',
    'status.fillApiKey': '请先填写 API Key 和 Base URL',
    'status.fillBaseUrl': '请填写 Base URL',
    'status.fillModel': '请选择或输入模型名称',

    // Toast 消息
    'toast.install': '插件已安装，请点击扩展图标将其固定到工具栏',
    'toast.installTitle': 'QuickTranslate 安装完成',
    'toast.installMessage': 'QuickTranslate已安装！请点击插件图标开始使用。温馨提示：请把插件固定在快捷工具栏方便使用。',

    // 语言名称
    'lang.zh-TW': '繁体中文',
    'lang.zh-CN': '简体中文',
    'lang.en': 'English',
    'lang.ja': '日本語',
    'lang.ko': '한국어',
    'lang.auto': '自动检测'
  },

  'zh-TW': {
    // 標題和版本
    'app.title': 'QuickTranslate 快譯',
    'app.version': 'v2.3.0',

    // 主要按鈕
    'btn.startCapture': '開始截圖',
    'btn.save': '儲存設定',
    'btn.advanced': '進階設定',
    'btn.saveSettings': '儲存設定',
    'btn.resetSettings': '重置',
    'btn.close': '×',
    'btn.fetchModels': '🔄 獲取可用模型',

    // 提示資訊
    'hint.captureDesc': '拖曳選擇區域，自動辨識並翻譯文字',
    'hint.shortcut': '預設快捷鍵：Alt+1 智慧翻譯（自動偵測語言翻譯成目標語言）',
    'hint.apiKey': 'API密鑰將安全儲存在本地',
    'hint.baseUrl': 'OpenAI 相容的 API 位址',
    'hint.llmModel': '選擇可用模型，或直接輸入模型名稱',
    'hint.quickPanel': '選中網頁文字後自動顯示翻譯按鈕',
    'hint.hover': '按住 Alt 鍵並將滑鼠懸停在文字上，無需選中即可翻譯',
    'hint.multiEngine': '同時展示 Google / Microsoft / LLM 翻譯結果，方便對比選擇',
    'hint.minSelection': '選擇少於此字數不會觸發翻譯按鈕',
    'hint.shortcutKey': '使用快捷鍵快速啟動截圖翻譯',
    'hint.microApiKey': 'Microsoft Translator 需要 API Key',
    'hint.glmApiKey': 'GLM 大模型翻譯需要 API Key',

    // 標籤
    'label.targetLanguage': '目標語言:',
    'label.ocrLanguage': '辨識語言:',
    'label.apiProvider': '翻譯服務:',
    'label.microsoftApiKey': 'Microsoft API Key:',
    'label.glmApiKey': 'GLM API Key:',
    'label.customApiKey': '自訂 LLM API Key:',
    'label.baseUrl': 'Base URL:',
    'label.llmModel': '模型名稱:',
    'label.minSelection': '最小選擇字數:',
    'label.shortcutKey': '快捷鍵設定:',
    'label.placeholder.key': '輸入 Microsoft Translator API Key',
    'label.placeholder.glm': '輸入智譜 GLM API Key',
    'label.placeholder.custom': '輸入您的 API Key',
    'label.placeholder.url': 'https://api.openai.com/v1',
    'label.placeholder.shortcut': '點擊設定快捷鍵',
    'label.placeholder.selectModel': '-- 請先填寫 API Key 和 Base URL --',
    'label.placeholder.customModel': '或直接輸入模型名稱',

    // 選項
    'opt.autoDetect': '自動偵測 (推薦)',
    'opt.google': 'Google Translate (推薦)',
    'opt.microsoft': 'Microsoft Translator',
    'opt.offline': '離線翻譯',
    'opt.glm': 'GLM 大模型 (智譜)',
    'opt.custom': 'LLM 自訂 (OpenAI 相容)',
    'opt.enableQuickPanel': '啟用快捷翻譯面板 (選中文字即可翻譯)',
    'opt.enableHover': '啟用懸浮翻譯 (按 Alt 鍵懸停翻譯)',
    'opt.multiEngine': '多引擎結果對比',
    'opt.autoCopy': '自動複製翻譯結果',

    // 進階設定
    'settings.title': '進階設定',
    'settings.recording': '錄製中',
    'settings.pressKey': '按下新的快捷鍵...',
    'settings.confirmShortcut': '請在 chrome://extensions/shortcuts 中確認快捷鍵設定',

    // 狀態訊息
    'status.saving': '儲存中...',
    'status.saved': '已儲存',
    'status.savedBasic': '基本設定已儲存',
    'status.savedAdvanced': '進階設定已儲存',
    'status.reset': '設定已重置',
    'status.resetConfirm': '確定要重置所有設定嗎？',
    'status.loading': '正在獲取模型列表...',
    'status.modelsLoaded': '已載入 {count} 個模型',
    'status.noModels': '未找到可用模型',
    'status.fetchFailed': '獲取失敗，請手動輸入',
    'status.fetchModelsFailed': '獲取模型列表失敗',
    'status.starting': '正在啟動截圖...',
    'status.captureStarted': '截圖已啟動',
    'status.captureFailed': '啟動失敗',
    'status.capturingError': '無法在此頁面使用截圖功能',
    'status.connectionRetry': 'Service Worker 未啟動，正在重試...',
    'status.connectionRecovered': '連接已恢復，請重新點擊開始截圖',
    'status.connectionFailed': '連接失敗，請重新載入擴展',
    'status.capturingRestricted': '無法在此頁面使用快捷鍵，請切換到普通網頁',
    'status.fillApiKey': '請先填寫 API Key 和 Base URL',
    'status.fillBaseUrl': '請填寫 Base URL',
    'status.fillModel': '請選擇或輸入模型名稱',

    // Toast 訊息
    'toast.install': '插件已安裝，請點擊擴展圖標將其固定到工具欄',
    'toast.installTitle': 'QuickTranslate 安裝完成',
    'toast.installMessage': 'QuickTranslate已安裝！請點擊插件圖標開始使用。溫馨提示：請把插件固定在快捷工具欄方便使用。',

    // 語言名稱
    'lang.zh-TW': '繁體中文',
    'lang.zh-CN': '簡體中文',
    'lang.en': 'English',
    'lang.ja': '日本語',
    'lang.ko': '한국어',
    'lang.auto': '自動偵測'
  },

  'en': {
    // Title and version
    'app.title': 'QuickTranslate',
    'app.version': 'v2.3.0',

    // Main buttons
    'btn.startCapture': 'Start Capture',
    'btn.save': 'Save',
    'btn.advanced': 'Advanced Settings',
    'btn.saveSettings': 'Save Settings',
    'btn.resetSettings': 'Reset',
    'btn.close': '×',
    'btn.fetchModels': '🔄 Fetch Available Models',

    // Hints
    'hint.captureDesc': 'Drag to select area, auto recognize and translate text',
    'hint.shortcut': 'Default shortcut: Alt+1 Smart Translate (auto-detect language)',
    'hint.apiKey': 'API key will be securely stored locally',
    'hint.baseUrl': 'OpenAI compatible API address',
    'hint.llmModel': 'Select available model or enter model name directly',
    'hint.quickPanel': 'Translation button appears when text is selected',
    'hint.hover': 'Hold Alt key and hover over text to translate without selecting',
    'hint.multiEngine': 'Show Google / Microsoft / LLM results simultaneously for comparison',
    'hint.minSelection': 'Selection smaller than this will not trigger translation',
    'hint.shortcutKey': 'Use shortcut to quickly start screen capture translation',
    'hint.microApiKey': 'Microsoft Translator requires API Key',
    'hint.glmApiKey': 'GLM model translation requires API Key',

    // Labels
    'label.targetLanguage': 'Target Language:',
    'label.ocrLanguage': 'Recognition Language:',
    'label.apiProvider': 'Translation Service:',
    'label.microsoftApiKey': 'Microsoft API Key:',
    'label.glmApiKey': 'GLM API Key:',
    'label.customApiKey': 'Custom LLM API Key:',
    'label.baseUrl': 'Base URL:',
    'label.llmModel': 'Model Name:',
    'label.minSelection': 'Min Selection Length:',
    'label.shortcutKey': 'Shortcut:',
    'label.placeholder.key': 'Enter Microsoft Translator API Key',
    'label.placeholder.glm': 'Enter Zhipu GLM API Key',
    'label.placeholder.custom': 'Enter your API Key',
    'label.placeholder.url': 'https://api.openai.com/v1',
    'label.placeholder.shortcut': 'Click to set shortcut',
    'label.placeholder.selectModel': '-- Please fill API Key and Base URL first --',
    'label.placeholder.customModel': 'Or enter model name directly',

    // Options
    'opt.autoDetect': 'Auto Detect (Recommended)',
    'opt.google': 'Google Translate (Recommended)',
    'opt.microsoft': 'Microsoft Translator',
    'opt.offline': 'Offline Translation',
    'opt.glm': 'GLM Model (Zhipu)',
    'opt.custom': 'Custom LLM (OpenAI Compatible)',
    'opt.enableQuickPanel': 'Enable Quick Panel (translate on text selection)',
    'opt.enableHover': 'Enable Hover Translation (Alt key)',
    'opt.multiEngine': 'Multi-Engine Comparison',
    'opt.autoCopy': 'Auto Copy Translation',

    // Advanced settings
    'settings.title': 'Advanced Settings',
    'settings.recording': 'Recording',
    'settings.pressKey': 'Press new shortcut...',
    'settings.confirmShortcut': 'Please confirm shortcut in chrome://extensions/shortcuts',

    // Status messages
    'status.saving': 'Saving...',
    'status.saved': 'Saved',
    'status.savedBasic': 'Basic settings saved',
    'status.savedAdvanced': 'Advanced settings saved',
    'status.reset': 'Settings reset',
    'status.resetConfirm': 'Are you sure you want to reset all settings?',
    'status.loading': 'Loading models...',
    'status.modelsLoaded': 'Loaded {count} models',
    'status.noModels': 'No available models found',
    'status.fetchFailed': 'Fetch failed, please enter manually',
    'status.fetchModelsFailed': 'Failed to fetch models',
    'status.starting': 'Starting capture...',
    'status.captureStarted': 'Capture started',
    'status.captureFailed': 'Failed to start',
    'status.capturingError': 'Cannot use capture on this page',
    'status.connectionRetry': 'Service Worker not started, retrying...',
    'status.connectionRecovered': 'Connection restored, please click start again',
    'status.connectionFailed': 'Connection failed, please reload extension',
    'status.capturingRestricted': 'Cannot use shortcut on this page, switch to a normal webpage',
    'status.fillApiKey': 'Please fill API Key and Base URL first',
    'status.fillBaseUrl': 'Please fill Base URL',
    'status.fillModel': 'Please select or enter model name',

    // Toast messages
    'toast.install': 'Extension installed. Click the extension icon to pin it to toolbar',
    'toast.installTitle': 'QuickTranslate Installed',
    'toast.installMessage': 'QuickTranslate installed! Click the icon to start. Tip: Pin to toolbar for easy access.',

    // Language names
    'lang.zh-TW': 'Traditional Chinese',
    'lang.zh-CN': 'Simplified Chinese',
    'lang.en': 'English',
    'lang.ja': 'Japanese',
    'lang.ko': 'Korean',
    'lang.auto': 'Auto Detect'
  },

  'ja': {
    // タイトルとバージョン
    'app.title': 'QuickTranslate',
    'app.version': 'v2.3.0',

    // メインボタン
    'btn.startCapture': 'キャプチャ開始',
    'btn.save': '保存',
    'btn.advanced': '詳細設定',
    'btn.saveSettings': '設定を保存',
    'btn.resetSettings': 'リセット',
    'btn.close': '×',
    'btn.fetchModels': '🔄 モデル一覧を取得',

    // ヒント
    'hint.captureDesc': 'ドラッグして範囲を選択、テキストを自動認識・翻訳',
    'hint.shortcut': 'デフォルトショートカット：Alt+1 スマート翻訳（言語自動検出）',
    'hint.apiKey': 'APIキーは安全にローカルに保存されます',
    'hint.baseUrl': 'OpenAI互換APIアドレス',
    'hint.llmModel': '使用可能なモデルを選択するか、直接入力',
    'hint.quickPanel': 'テキストを選択すると翻訳ボタンが自動表示',
    'hint.hover': 'Altキーを押しながらテキストにホバーで翻訳（選択不要）',
    'hint.multiEngine': 'Google / Microsoft / LLMの結果を同時に表示して比較',
    'hint.minSelection': 'この文字数未満の選択は翻訳トリガーなし',
    'hint.shortcutKey': 'ショートカットでスクリーンキャプチャ翻訳を起動',
    'hint.microApiKey': 'Microsoft TranslatorにはAPI Keyが必要です',
    'hint.glmApiKey': 'GLM翻訳にはAPI Keyが必要です',

    // ラベル
    'label.targetLanguage': '翻訳先言語:',
    'label.ocrLanguage': '認識言語:',
    'label.apiProvider': '翻訳サービス:',
    'label.microsoftApiKey': 'Microsoft API Key:',
    'label.glmApiKey': 'GLM API Key:',
    'label.customApiKey': 'カスタムLLM API Key:',
    'label.baseUrl': 'Base URL:',
    'label.llmModel': 'モデル名:',
    'label.minSelection': '最小選択文字数:',
    'label.shortcutKey': 'ショートカット設定:',
    'label.placeholder.key': 'Microsoft Translator API Keyを入力',
    'label.placeholder.glm': '智譜GLM API Keyを入力',
    'label.placeholder.custom': 'API Keyを入力',
    'label.placeholder.url': 'https://api.openai.com/v1',
    'label.placeholder.shortcut': 'クリックしてショートカットを設定',
    'label.placeholder.selectModel': '-- API KeyとBase URLを先に入力 --',
    'label.placeholder.customModel': 'または直接モデル名を入力',

    // オプション
    'opt.autoDetect': '自動検出 (推奨)',
    'opt.google': 'Google Translate (推奨)',
    'opt.microsoft': 'Microsoft Translator',
    'opt.offline': 'オフライン翻訳',
    'opt.glm': 'GLM大モデル (智譜)',
    'opt.custom': 'カスタムLLM (OpenAI互換)',
    'opt.enableQuickPanel': 'クイックパネルを有効化 (テキスト選択で翻訳)',
    'opt.enableHover': 'ホバー翻訳を有効化 (Altキー)',
    'opt.multiEngine': 'マルチエンジン比較',
    'opt.autoCopy': '翻訳結果を自動コピー',

    // 詳細設定
    'settings.title': '詳細設定',
    'settings.recording': '録音中',
    'settings.pressKey': '新しいショートカットを押してください...',
    'settings.confirmShortcut': 'chrome://extensions/shortcuts でショートカットを確認してください',

    // ステータスメッセージ
    'status.saving': '保存中...',
    'status.saved': '保存完了',
    'status.savedBasic': '基本設定を保存しました',
    'status.savedAdvanced': '詳細設定を保存しました',
    'status.reset': '設定をリセットしました',
    'status.resetConfirm': 'すべての設定をリセットしますか？',
    'status.loading': 'モデル一覧を取得中...',
    'status.modelsLoaded': '{count}個のモデルを読み込みました',
    'status.noModels': '使用可能なモデルが見つかりません',
    'status.fetchFailed': '取得失敗、手動入力してください',
    'status.fetchModelsFailed': 'モデル一覧の取得に失敗しました',
    'status.starting': 'キャプチャを起動中...',
    'status.captureStarted': 'キャプチャを開始しました',
    'status.captureFailed': '起動に失敗しました',
    'status.capturingError': 'このページではキャプチャを使用できません',
    'status.connectionRetry': 'Service Workerが起動していません、再試行中...',
    'status.connectionRecovered': '接続が回復しました。もう一度クリックしてください',
    'status.connectionFailed': '接続に失敗しました。拡張機能を再読み込みしてください',
    'status.capturingRestricted': 'この面ではショートカットを使用できません。通常のWeb面に切り替えてください',
    'status.fillApiKey': 'API KeyとBase URLを先に記入してください',
    'status.fillBaseUrl': 'Base URLを記入してください',
    'status.fillModel': 'モデルを選択または入力してください',

    // Toastメッセージ
    'toast.install': '拡張機能がインストールされました。アイコンをクリックしてツールバーに固定してください',
    'toast.installTitle': 'QuickTranslate インストール完了',
    'toast.installMessage': 'QuickTranslateがインストールされました！アイコンをクリックして開始してください。ヒント：ツールバーに固定すると便利です。',

    // 言語名
    'lang.zh-TW': '繁体字中国語',
    'lang.zh-CN': '簡体字中国語',
    'lang.en': '英語',
    'lang.ja': '日本語',
    'lang.ko': '韓国語',
    'lang.auto': '自動検出'
  },

  'ko': {
    // 제목 및 버전
    'app.title': 'QuickTranslate',
    'app.version': 'v2.3.0',

    // 주요 버튼
    'btn.startCapture': '캡처 시작',
    'btn.save': '저장',
    'btn.advanced': '고급 설정',
    'btn.saveSettings': '설정 저장',
    'btn.resetSettings': '초기화',
    'btn.close': '×',
    'btn.fetchModels': '🔄 사용 가능한 모델 가져오기',

    // 힌트
    'hint.captureDesc': '드래그하여 영역 선택, 텍스트 자동 인식 및 번역',
    'hint.shortcut': '기본 단축키: Alt+1 스마트 번역 (자동 언어 감지)',
    'hint.apiKey': 'API 키는 안전하게 로컬에 저장됩니다',
    'hint.baseUrl': 'OpenAI 호환 API 주소',
    'hint.llmModel': '사용 가능한 모델 선택 또는 직접 입력',
    'hint.quickPanel': '텍스트 선택 시 번역 버튼이 자동으로 표시됩니다',
    'hint.hover': 'Alt 키를 누른 채 텍스트에 호버하면 선택 없이 번역',
    'hint.multiEngine': 'Google / Microsoft / LLM 결과를 동시에 비교',
    'hint.minSelection': '선택한 글자 수가 이보다 적으면 번역 트리거 안 됨',
    'hint.shortcutKey': '단축키로 스크린샷 번역 빠르게 시작',
    'hint.microApiKey': 'Microsoft Translator에 API Key 필요',
    'hint.glmApiKey': 'GLM 모델 번역에 API Key 필요',

    // 라벨
    'label.targetLanguage': '대상 언어:',
    'label.ocrLanguage': '인식 언어:',
    'label.apiProvider': '번역 서비스:',
    'label.microsoftApiKey': 'Microsoft API Key:',
    'label.glmApiKey': 'GLM API Key:',
    'label.customApiKey': '사용자 정의 LLM API Key:',
    'label.baseUrl': 'Base URL:',
    'label.llmModel': '모델 이름:',
    'label.minSelection': '최소 선택 글자 수:',
    'label.shortcutKey': '단축키 설정:',
    'label.placeholder.key': 'Microsoft Translator API Key 입력',
    'label.placeholder.glm': '지피(GLM) API Key 입력',
    'label.placeholder.custom': 'API Key 입력',
    'label.placeholder.url': 'https://api.openai.com/v1',
    'label.placeholder.shortcut': '클릭하여 단축키 설정',
    'label.placeholder.selectModel': '-- 먼저 API Key와 Base URL을 입력하세요 --',
    'label.placeholder.customModel': '또는 모델 이름을 직접 입력',

    // 옵션
    'opt.autoDetect': '자동 감지 (권장)',
    'opt.google': 'Google Translate (권장)',
    'opt.microsoft': 'Microsoft Translator',
    'opt.offline': '오프라인 번역',
    'opt.glm': 'GLM 모델 (지피)',
    'opt.custom': '사용자 정의 LLM (OpenAI 호환)',
    'opt.enableQuickPanel': '빠른 패널 활성화 (텍스트 선택 시 번역)',
    'opt.enableHover': '호버 번역 활성화 (Alt 키)',
    'opt.multiEngine': '멀티 엔진 비교',
    'opt.autoCopy': '번역 결과 자동 복사',

    // 고급 설정
    'settings.title': '고급 설정',
    'settings.recording': '녹음 중',
    'settings.pressKey': '새 단축키를 누르세요...',
    'settings.confirmShortcut': 'chrome://extensions/shortcuts에서 단축키를 확인하세요',

    // 상태 메시지
    'status.saving': '저장 중...',
    'status.saved': '저장됨',
    'status.savedBasic': '기본 설정이 저장되었습니다',
    'status.savedAdvanced': '고급 설정이 저장되었습니다',
    'status.reset': '설정이 초기화되었습니다',
    'status.resetConfirm': '모든 설정을 초기화하시겠습니까?',
    'status.loading': '모델 목록 가져오는 중...',
    'status.modelsLoaded': '{count}개 모델 로드됨',
    'status.noModels': '사용 가능한 모델이 없습니다',
    'status.fetchFailed': '가져오기 실패, 수동으로 입력하세요',
    'status.fetchModelsFailed': '모델 목록 가져오기 실패',
    'status.starting': '캡처 시작 중...',
    'status.captureStarted': '캡처가 시작되었습니다',
    'status.captureFailed': '시작 실패',
    'status.capturingError': '이 페이지에서 캡처를 사용할 수 없습니다',
    'status.connectionRetry': 'Service Worker가 시작되지 않았습니다, 재시도 중...',
    'status.connectionRecovered': '연결이 복구되었습니다. 다시 클릭하세요',
    'status.connectionFailed': '연결 실패, 확장 프로그램을 다시 로드하세요',
    'status.capturingRestricted': '이 페이지에서 단축키를 사용할 수 없습니다. 일반 웹페이지로 전환하세요',
    'status.fillApiKey': '먼저 API Key와 Base URL을 입력하세요',
    'status.fillBaseUrl': 'Base URL을 입력하세요',
    'status.fillModel': '모델을 선택하거나 입력하세요',

    // 토스트 메시지
    'toast.install': '확장 프로그램이 설치되었습니다. 아이콘을 클릭하여 도구 모음에 고정하세요',
    'toast.installTitle': 'QuickTranslate 설치 완료',
    'toast.installMessage': 'QuickTranslate이 설치되었습니다! 아이콘을 클릭하여 시작하세요. 팁: 도구 모음에 고정하면 편리합니다.',

    // 언어 이름
    'lang.zh-TW': '번체 중국어',
    'lang.zh-CN': '간체 중국어',
    'lang.en': '영어',
    'lang.ja': '일본어',
    'lang.ko': '한국어',
    'lang.auto': '자동 감지'
  }
};

// 支持的语言列表
const supportedLanguages = ['zh-CN', 'zh-TW', 'en', 'ja', 'ko'];

// 浏览器语言到应用语言的映射
const browserLanguageMap = {
  'zh': 'zh-CN',
  'zh-CN': 'zh-CN',
  'zh-TW': 'zh-TW',
  'zh-HK': 'zh-TW',
  'zh-SG': 'zh-CN',
  'en': 'en',
  'en-US': 'en',
  'en-GB': 'en',
  'en-AU': 'en',
  'en-CA': 'en',
  'ja': 'ja',
  'ja-JP': 'ja',
  'ko': 'ko',
  'ko-KR': 'ko'
};

// i18n 类
class I18n {
  constructor() {
    this.currentLang = 'en';
    this.init();
  }

  init() {
    // 从 localStorage 获取保存的语言设置
    const savedLang = localStorage.getItem('qtUILanguage');
    if (savedLang && supportedLanguages.includes(savedLang)) {
      this.currentLang = savedLang;
    } else {
      // 检测浏览器语言
      this.currentLang = this.detectBrowserLanguage();
    }
  }

  detectBrowserLanguage() {
    // 获取浏览器语言
    const browserLang = navigator.language || navigator.userLanguage || 'en';
    console.log('I18n: Detected browser language:', browserLang);

    // 尝试直接匹配
    if (supportedLanguages.includes(browserLang)) {
      return browserLang;
    }

    // 尝试语言前缀匹配 (如 zh-CN, en-US 等)
    const langPrefix = browserLang.split('-')[0].toLowerCase();
    if (browserLanguageMap[browserLang]) {
      return browserLanguageMap[browserLang];
    }
    if (browserLanguageMap[langPrefix]) {
      return browserLanguageMap[langPrefix];
    }

    // 不支持的默认语言，返回英文
    return 'en';
  }

  setLanguage(lang) {
    if (supportedLanguages.includes(lang)) {
      this.currentLang = lang;
      localStorage.setItem('qtUILanguage', lang);
      this.updateUI();
      return true;
    }
    return false;
  }

  t(key, params = {}) {
    const translations = this.getTranslations();
    let text = translations[key] || key;

    // 替换参数 {count} 等
    Object.keys(params).forEach(param => {
      text = text.replace(`{${param}}`, params[param]);
    });

    return text;
  }

  getTranslations() {
    return translations[this.currentLang] || translations['en'];
  }

  getCurrentLanguage() {
    return this.currentLang;
  }

  getSupportedLanguages() {
    return supportedLanguages.map(code => ({
      code,
      name: this.t(`lang.${code}`)
    }));
  }

  updateUI() {
    // 更新所有带有 data-i18n 属性的元素
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const translation = this.t(key);
      if (translation) {
        el.textContent = translation;
      }
    });

    // 更新所有带有 data-i18n-placeholder 属性的元素
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const translation = this.t(key);
      if (translation) {
        el.placeholder = translation;
      }
    });

    // 更新语言选择器的选项
    this.updateLanguageOptions();

    // 触发语言变更事件
    window.dispatchEvent(new CustomEvent('qtLanguageChanged', {
      detail: { language: this.currentLang }
    }));
  }

  updateLanguageOptions() {
    const targetLangSelect = document.getElementById('target-language');
    const ocrLangSelect = document.getElementById('ocr-language');

    if (targetLangSelect) {
      const options = targetLangSelect.querySelectorAll('option');
      options.forEach(opt => {
        const langKey = `lang.${opt.value}`;
        const translation = this.t(langKey);
        if (translation && !translation.startsWith('lang.')) {
          opt.textContent = translation;
        }
      });
    }

    if (ocrLangSelect) {
      const options = ocrLangSelect.querySelectorAll('option');
      options.forEach(opt => {
        const langKey = `lang.${opt.value}`;
        const translation = this.t(langKey);
        if (translation && !translation.startsWith('lang.')) {
          opt.textContent = translation;
        }
      });
    }
  }
}

// 创建全局实例
const i18n = new I18n();

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { I18n, i18n, translations, supportedLanguages };
}
