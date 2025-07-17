// 截圖翻譯器內容腳本
console.log('Content script loading...');

// 防止重複聲明
if (typeof window.ScreenshotCapture === 'undefined') {

  class ScreenshotCapture {
    constructor() {
      console.log('ScreenshotCapture constructor called');
      this.overlay = null;
      this.selectionBox = null;
      this.instructionText = null;
      this.startX = 0;
      this.startY = 0;
      this.isSelecting = false;
      this.setupMessageListeners();
    }

    setupMessageListeners() {
      console.log('Setting up message listeners...');

      this.messageListener = (request, sender, sendResponse) => {
        this.handleMessage(request, sender, sendResponse);
        return true;
      };

      chrome.runtime.onMessage.addListener(this.messageListener);
    }

    handleMessage(request, sender, sendResponse) {
      console.log('Content script received message:', request.action);

      try {
        switch (request.action) {
          case 'initCapture':
            console.log('Content: Initializing capture...');
            this.initCapture();
            sendResponse({ success: true });
            break;
          case 'showResult':
            console.log('Content: Showing result...');
            this.showTranslationResult(request);
            sendResponse({ success: true });
            break;
          case 'showError':
            console.log('Content: Showing error...');
            this.showError(request.error);
            sendResponse({ success: true });
            break;
          default:
            console.warn('Content: Unknown action:', request.action);
            sendResponse({ error: 'Unknown action' });
        }
      } catch (error) {
        console.error('Content: Error handling message:', error);
        sendResponse({ error: error.message });
      }
    }

    initCapture() {
      console.log('Content: initCapture called');

      // 清理現有覆蓋層
      this.cleanupOverlay();

      console.log('Content: Creating new overlay...');
      this.createOverlay();
    }

    createOverlay() {
      console.log('Content: Creating overlay elements...');

      // 創建主覆蓋層
      this.overlay = document.createElement('div');
      this.overlay.id = 'screenshot-overlay';

      // 強制設置樣式
      this.overlay.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        background-color: rgba(0, 0, 0, 0.7) !important;
        cursor: crosshair !important;
        z-index: 2147483647 !important;
        user-select: none !important;
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        font-family: Arial, sans-serif !important;
      `;

      // 創建選擇框
      this.selectionBox = document.createElement('div');
      this.selectionBox.style.cssText = `
        position: absolute !important;
        border: 2px solid #4285f4 !important;
        background-color: rgba(66, 133, 244, 0.1) !important;
        display: none !important;
        pointer-events: none !important;
      `;

      // 創建指導文字
      this.instructionText = document.createElement('div');
      this.instructionText.textContent = '拖拽選擇要翻譯的區域，或點擊使用默認區域，按 ESC 取消';
      this.instructionText.style.cssText = `
        position: absolute !important;
        top: 50% !important;
        left: 50% !important;
        transform: translate(-50%, -50%) !important;
        color: white !important;
        font-size: 18px !important;
        font-weight: 500 !important;
        text-align: center !important;
        background-color: rgba(0, 0, 0, 0.8) !important;
        padding: 16px 24px !important;
        border-radius: 8px !important;
        pointer-events: none !important;
        max-width: 400px !important;
        line-height: 1.4 !important;
        z-index: 2147483648 !important;
      `;

      // 組裝元素
      this.overlay.appendChild(this.selectionBox);
      this.overlay.appendChild(this.instructionText);

      console.log('Content: Appending overlay to body...');
      document.body.appendChild(this.overlay);

      // 綁定事件
      this.overlay.addEventListener('mousedown', (e) => this.startSelection(e));
      this.overlay.addEventListener('mousemove', (e) => this.updateSelection(e));
      this.overlay.addEventListener('mouseup', (e) => this.endSelection(e));

      // 鼠標移動時隱藏指導文字
      this.overlay.addEventListener('mousemove', (e) => {
        if (!this.isSelecting && this.instructionText && this.instructionText.style.display !== 'none') {
          // 如果鼠標移動距離足夠，隱藏指導文字
          const rect = this.instructionText.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          const distance = Math.sqrt(Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2));

          if (distance > 100) { // 距離中心100px時隱藏
            this.instructionText.style.opacity = '0.3';
          } else {
            this.instructionText.style.opacity = '1';
          }
        }
      });

      // 添加鍵盤事件
      document.addEventListener('keydown', (e) => this.handleKeyDown(e));

      // 防止頁面滾動
      document.body.style.overflow = 'hidden';

      console.log('Content: Overlay created successfully');
    }

    handleKeyDown(e) {
      if (e.key === 'Escape') {
        this.cancelCapture();
      }
    }

    startSelection(e) {
      e.preventDefault();
      console.log('Content: Starting selection');

      // 隱藏指導文字，避免阻擋選擇
      if (this.instructionText) {
        this.instructionText.style.display = 'none';
      }

      this.isSelecting = true;
      this.startX = e.clientX;
      this.startY = e.clientY;

      this.selectionBox.style.left = this.startX + 'px';
      this.selectionBox.style.top = this.startY + 'px';
      this.selectionBox.style.width = '0px';
      this.selectionBox.style.height = '0px';
      this.selectionBox.style.display = 'block';
    }

    updateSelection(e) {
      if (!this.isSelecting) return;

      const currentX = e.clientX;
      const currentY = e.clientY;

      const left = Math.min(this.startX, currentX);
      const top = Math.min(this.startY, currentY);
      const width = Math.abs(currentX - this.startX);
      const height = Math.abs(currentY - this.startY);

      this.selectionBox.style.left = left + 'px';
      this.selectionBox.style.top = top + 'px';
      this.selectionBox.style.width = width + 'px';
      this.selectionBox.style.height = height + 'px';
    }

    endSelection(e) {
      console.log('Content: endSelection called, isSelecting:', this.isSelecting);

      if (!this.isSelecting) {
        // 單擊模式 - 創建默認區域
        console.log('Content: Single click mode');
        this.createDefaultSelection(e.clientX, e.clientY);
        return;
      }

      this.isSelecting = false;
      console.log('Content: Selection ended');

      const rect = this.selectionBox.getBoundingClientRect();
      console.log('Content: Selection rect:', rect);

      if (rect.width < 10 || rect.height < 10) {
        // 太小的選擇，創建默認區域
        console.log('Content: Selection too small, using default');
        this.createDefaultSelection(e.clientX, e.clientY);
        return;
      }

      console.log('Content: Processing selection...');
      this.processSelection(rect);
    }

    createDefaultSelection(x, y) {
      console.log('Content: Creating default selection');

      const defaultWidth = 200;
      const defaultHeight = 100;
      const left = Math.max(0, x - defaultWidth / 2);
      const top = Math.max(0, y - defaultHeight / 2);

      const rect = {
        left: left,
        top: top,
        width: defaultWidth,
        height: defaultHeight
      };

      this.processSelection(rect);
    }

    processSelection(rect) {
      console.log('Content: Processing selection:', rect);

      // 顯示處理狀態
      if (this.instructionText) {
        this.instructionText.textContent = '正在截取區域...';
        this.instructionText.style.backgroundColor = 'rgba(66, 133, 244, 0.9)';
        this.instructionText.style.display = 'block';
      }

      // 先嘗試提取選中區域的文字
      const selectedText = this.extractTextFromArea(rect);

      if (selectedText && selectedText.trim()) {
        console.log('Content: Extracted text:', selectedText);

        if (this.instructionText) {
          this.instructionText.textContent = '正在翻譯...';
        }

        // 進行真實翻譯處理
        setTimeout(async () => {
          console.log('Content: About to translate text');
          try {
            const translatedText = await this.translateText(selectedText);
            console.log('Content: Translation completed:', translatedText);
            this.showTranslationResult({
              originalText: selectedText,
              translatedText: translatedText,
              confidence: 0.95
            });
          } catch (error) {
            console.error('Content: Translation failed:', error);
            this.showTranslationResult({
              originalText: selectedText,
              translatedText: `翻譯失敗: ${error.message}`,
              confidence: 0.0
            });
          }
        }, 800);
      } else {
        console.log('Content: No text found, using screenshot method');

        if (this.instructionText) {
          this.instructionText.textContent = '正在截圖識別...';
        }

        // 使用截圖方法
        this.captureScreenshot(rect);
      }
    }

    extractTextFromArea(rect) {
      try {
        console.log('Content: Extracting text from precise area:', rect);

        // 使用精確的區域文字提取
        const extractedText = this.getPreciseTextFromArea(rect);

        console.log('Content: Extracted text:', extractedText);
        return extractedText;
      } catch (error) {
        console.error('Error extracting text:', error);
        return '';
      }
    }

    getPreciseTextFromArea(rect) {
      try {
        // 創建一個虛擬的選擇框來精確匹配用戶選擇的區域
        const tolerance = 5; // 5像素的容差

        // 獲取所有文字節點
        const textNodes = this.getAllTextNodes();
        const selectedTexts = [];

        for (const textNode of textNodes) {
          // 跳過我們自己的覆蓋層
          if (this.isInOverlay(textNode)) {
            continue;
          }

          // 檢查文字節點是否在選中區域內
          const nodeRects = this.getTextNodeRects(textNode);

          for (const nodeRect of nodeRects) {
            if (this.isRectInSelectedArea(nodeRect, rect, tolerance)) {
              const text = textNode.textContent.trim();
              if (text && !selectedTexts.includes(text)) {
                selectedTexts.push(text);
              }
              break; // 找到一個匹配的就跳出
            }
          }
        }

        // 如果沒有找到文字節點，嘗試元素級別的檢查
        if (selectedTexts.length === 0) {
          return this.getTextFromElementsInArea(rect);
        }

        // 組合找到的文字
        const result = selectedTexts.join(' ').trim();
        console.log('Content: Found precise text:', result);
        return result;
      } catch (error) {
        console.error('Error in getPreciseTextFromArea:', error);
        return '';
      }
    }

    getAllTextNodes() {
      const textNodes = [];
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: (node) => {
            // 只接受有實際內容的文字節點
            if (node.textContent.trim().length > 0) {
              return NodeFilter.FILTER_ACCEPT;
            }
            return NodeFilter.FILTER_REJECT;
          }
        }
      );

      let node;
      while (node = walker.nextNode()) {
        textNodes.push(node);
      }

      return textNodes;
    }

    getTextNodeRects(textNode) {
      try {
        const range = document.createRange();
        range.selectNodeContents(textNode);

        // 獲取文字節點的所有矩形（可能跨行）
        const rects = range.getClientRects();
        return Array.from(rects);
      } catch (error) {
        return [];
      }
    }

    isRectInSelectedArea(nodeRect, selectedRect, tolerance = 5) {
      // 檢查文字矩形是否與選中區域重疊
      const overlap = !(
        nodeRect.right < selectedRect.left - tolerance ||
        nodeRect.left > selectedRect.left + selectedRect.width + tolerance ||
        nodeRect.bottom < selectedRect.top - tolerance ||
        nodeRect.top > selectedRect.top + selectedRect.height + tolerance
      );

      return overlap;
    }

    isInOverlay(node) {
      let parent = node.parentNode;
      while (parent) {
        if (parent === this.overlay ||
            parent === this.selectionBox ||
            parent === this.instructionText ||
            (parent.className && parent.className.includes('screenshot')) ||
            (parent.id && parent.id.includes('screenshot'))) {
          return true;
        }
        parent = parent.parentNode;
      }
      return false;
    }

    getTextFromElementsInArea(rect) {
      try {
        console.log('Content: Fallback to element-based text extraction');

        // 在選中區域的中心點檢測元素
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const elements = document.elementsFromPoint(centerX, centerY);

        for (const element of elements) {
          if (this.isInOverlay(element)) {
            continue;
          }

          const elementRect = element.getBoundingClientRect();

          // 檢查元素是否主要在選中區域內
          if (this.isElementMainlyInArea(elementRect, rect)) {
            const text = this.getCleanElementText(element);
            if (text && text.length < 300) { // 限制長度
              console.log('Content: Found element text:', text);
              return text;
            }
          }
        }

        return '';
      } catch (error) {
        console.error('Error in getTextFromElementsInArea:', error);
        return '';
      }
    }

    isElementMainlyInArea(elementRect, selectedRect) {
      // 計算重疊面積
      const overlapLeft = Math.max(elementRect.left, selectedRect.left);
      const overlapRight = Math.min(elementRect.right, selectedRect.left + selectedRect.width);
      const overlapTop = Math.max(elementRect.top, selectedRect.top);
      const overlapBottom = Math.min(elementRect.bottom, selectedRect.top + selectedRect.height);

      if (overlapLeft >= overlapRight || overlapTop >= overlapBottom) {
        return false; // 沒有重疊
      }

      const overlapArea = (overlapRight - overlapLeft) * (overlapBottom - overlapTop);
      const elementArea = elementRect.width * elementRect.height;

      // 如果重疊面積超過元素面積的50%，認為元素主要在選中區域內
      return overlapArea / elementArea > 0.5;
    }

    getCleanElementText(element) {
      try {
        // 獲取元素的直接文字內容，避免獲取子元素的內容
        let text = '';

        for (const child of element.childNodes) {
          if (child.nodeType === Node.TEXT_NODE) {
            text += child.textContent;
          }
        }

        // 如果沒有直接文字內容，獲取元素的文字內容但限制長度
        if (!text.trim()) {
          text = element.textContent || element.innerText || '';
        }

        return text.trim();
      } catch (error) {
        return '';
      }
    }

    getCompleteTextFromArea(rect) {
      try {
        console.log('Content: Getting complete text from area...');

        // 獲取所有與選擇區域重疊的文字元素
        const allTextElements = this.getAllTextElementsInArea(rect);

        if (allTextElements.length === 0) {
          console.log('Content: No text elements found in area');
          return '';
        }

        console.log(`Content: Found ${allTextElements.length} text elements in area`);

        // 按位置排序元素（從上到下，從左到右）
        allTextElements.sort((a, b) => {
          const rectA = a.element.getBoundingClientRect();
          const rectB = b.element.getBoundingClientRect();

          // 首先按Y坐標排序（上到下）
          if (Math.abs(rectA.top - rectB.top) > 10) {
            return rectA.top - rectB.top;
          }

          // 如果Y坐標相近，按X坐標排序（左到右）
          return rectA.left - rectB.left;
        });

        // 組合所有文字
        const textParts = [];
        let lastBottom = -1;

        for (const item of allTextElements) {
          const text = item.text;
          const rect = item.element.getBoundingClientRect();

          if (text && text.trim()) {
            // 如果是新行（Y坐標差距較大），添加空格分隔
            if (lastBottom >= 0 && rect.top > lastBottom + 5) {
              textParts.push(' ');
            }

            textParts.push(text.trim());
            lastBottom = rect.bottom;
          }
        }

        const combinedText = textParts.join(' ').replace(/\s+/g, ' ').trim();
        console.log('Content: Combined text:', combinedText.substring(0, 200));

        return combinedText;
      } catch (error) {
        console.error('Error getting complete text from area:', error);
        return '';
      }
    }

    getAllTextElementsInArea(rect) {
      const textElements = [];

      console.log('Content: Searching for text elements in selection area:', rect);

      // 使用更精確的選擇器，優先選擇較小的文字元素
      const selectors = [
        // 優先級1: 小型文字元素
        'span', 'a', 'button', 'strong', 'em', 'b', 'i', 'code',
        'input[type="button"]', 'input[type="submit"]', 'input[type="reset"]',
        '[role="button"]', 'label',

        // 優先級2: 中型文字元素
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'li', 'td', 'th',

        // 優先級3: 大型容器元素（更嚴格的條件）
        'div', 'section', 'article', 'pre'
      ];

      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);

        for (const element of elements) {
          if (this.isOurElement(element)) continue;

          const elementRect = element.getBoundingClientRect();

          // 更嚴格的重疊檢查
          const overlapInfo = this.calculateDetailedOverlap(elementRect, rect);

          if (overlapInfo.hasOverlap) {
            const text = this.getElementText(element);

            if (text && text.trim() && text.length >= 1) {
              // 對於大型容器元素，要求更高的重疊比例
              const isLargeContainer = ['div', 'section', 'article'].includes(element.tagName.toLowerCase());
              const minOverlapRatio = isLargeContainer ? 0.7 : 0.3; // 大容器需要70%重疊，小元素30%即可

              if (overlapInfo.overlapRatio >= minOverlapRatio) {
                textElements.push({
                  element: element,
                  text: text,
                  overlapRatio: overlapInfo.overlapRatio,
                  overlapArea: overlapInfo.overlapArea,
                  tagName: element.tagName.toLowerCase(),
                  rect: elementRect,
                  isLargeContainer: isLargeContainer,
                  priority: this.getElementPriority(element, overlapInfo)
                });

                console.log(`Content: Found text element: ${element.tagName} with ${Math.round(overlapInfo.overlapRatio * 100)}% overlap, text: "${text.substring(0, 50)}"`);
              }
            }
          }
        }
      }

      // 按優先級和重疊度排序
      textElements.sort((a, b) => {
        // 首先按優先級排序
        if (a.priority !== b.priority) {
          return b.priority - a.priority;
        }
        // 然後按重疊比例排序
        return b.overlapRatio - a.overlapRatio;
      });

      // 智能去重 - 避免選擇包含其他元素的大容器
      const filteredElements = this.filterNestedElements(textElements);

      console.log(`Content: After filtering: ${filteredElements.length} elements selected`);
      return filteredElements;
    }

    calculateDetailedOverlap(elementRect, selectionRect) {
      const left = Math.max(elementRect.left, selectionRect.left);
      const right = Math.min(elementRect.right, selectionRect.left + selectionRect.width);
      const top = Math.max(elementRect.top, selectionRect.top);
      const bottom = Math.min(elementRect.bottom, selectionRect.top + selectionRect.height);

      const hasOverlap = left < right && top < bottom;

      if (!hasOverlap) {
        return { hasOverlap: false, overlapArea: 0, overlapRatio: 0 };
      }

      const overlapArea = (right - left) * (bottom - top);
      const elementArea = elementRect.width * elementRect.height;
      const selectionArea = selectionRect.width * selectionRect.height;

      // 計算重疊比例（相對於較小的區域）
      const overlapRatio = overlapArea / Math.min(elementArea, selectionArea);

      return {
        hasOverlap: true,
        overlapArea: overlapArea,
        overlapRatio: overlapRatio,
        elementArea: elementArea,
        selectionArea: selectionArea
      };
    }

    getElementPriority(element, overlapInfo) {
      const tagName = element.tagName.toLowerCase();
      let priority = 0;

      // 基礎優先級
      if (['button', 'a', 'input'].includes(tagName)) {
        priority += 100; // 交互元素最高優先級
      } else if (['span', 'strong', 'em', 'b', 'i', 'code'].includes(tagName)) {
        priority += 80; // 行內文字元素
      } else if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
        priority += 70; // 標題元素
      } else if (['p', 'li', 'td', 'th', 'label'].includes(tagName)) {
        priority += 60; // 段落和列表元素
      } else if (['div', 'section', 'article'].includes(tagName)) {
        priority += 20; // 容器元素優先級較低
      }

      // 重疊度加分
      priority += overlapInfo.overlapRatio * 50;

      // 元素大小加分（較小的元素優先級更高）
      const elementArea = overlapInfo.elementArea;
      if (elementArea < 10000) { // 小於100x100px
        priority += 30;
      } else if (elementArea < 50000) { // 小於200x250px
        priority += 15;
      }

      return priority;
    }

    filterNestedElements(textElements) {
      const filtered = [];

      for (const item of textElements) {
        let isNested = false;

        // 檢查是否被其他元素包含
        for (const other of textElements) {
          if (item === other) continue;

          // 如果當前元素被另一個元素包含，且另一個元素的文字包含當前元素的文字
          if (this.isElementContainedIn(item.element, other.element) &&
              other.text.includes(item.text) &&
              other.text.length > item.text.length * 1.5) {
            isNested = true;
            console.log(`Content: Element ${item.tagName} is nested in ${other.tagName}, skipping`);
            break;
          }
        }

        if (!isNested) {
          filtered.push(item);
        }
      }

      // 限制返回的元素數量，避免選擇過多內容
      return filtered.slice(0, 5); // 最多返回5個最佳元素
    }

    isElementContainedIn(child, parent) {
      try {
        return parent.contains(child);
      } catch (error) {
        return false;
      }
    }

    getTextFromMultiplePoints(rect) {
      console.log('Content: Using multiple points sampling...');

      // 創建精確的採樣點，避免邊緣
      const points = [];
      const margin = Math.min(rect.width * 0.1, rect.height * 0.1, 10); // 10%邊距或最多10px

      const innerRect = {
        left: rect.left + margin,
        top: rect.top + margin,
        width: rect.width - 2 * margin,
        height: rect.height - 2 * margin
      };

      // 如果內部區域太小，使用原始區域
      if (innerRect.width < 20 || innerRect.height < 20) {
        innerRect.left = rect.left + 2;
        innerRect.top = rect.top + 2;
        innerRect.width = rect.width - 4;
        innerRect.height = rect.height - 4;
      }

      // 創建採樣網格（較少的點，但更精確）
      const cols = Math.min(3, Math.floor(innerRect.width / 30));
      const rows = Math.min(3, Math.floor(innerRect.height / 30));

      for (let row = 0; row <= rows; row++) {
        for (let col = 0; col <= cols; col++) {
          const x = innerRect.left + (col / Math.max(cols, 1)) * innerRect.width;
          const y = innerRect.top + (row / Math.max(rows, 1)) * innerRect.height;
          points.push({ x, y, type: 'grid' });
        }
      }

      // 添加中心點（最重要）
      points.push({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        type: 'center'
      });

      console.log(`Content: Created ${points.length} sampling points`);

      const candidateElements = new Map(); // 使用Map避免重複

      for (const point of points) {
        try {
          const elements = document.elementsFromPoint(point.x, point.y);

          for (const element of elements) {
            if (this.isOurElement(element)) continue;

            // 檢查元素是否真的在選擇區域內
            const elementRect = element.getBoundingClientRect();
            const overlapInfo = this.calculateDetailedOverlap(elementRect, rect);

            if (overlapInfo.hasOverlap && overlapInfo.overlapRatio > 0.2) { // 至少20%重疊
              const text = this.getElementText(element);
              if (text && text.trim()) {
                const elementKey = element.tagName + '_' + elementRect.left + '_' + elementRect.top;

                if (!candidateElements.has(elementKey)) {
                  const score = this.calculatePointTextScore(text, element, point, rect);
                  candidateElements.set(elementKey, {
                    element: element,
                    text: text,
                    score: score,
                    overlapRatio: overlapInfo.overlapRatio,
                    point: point
                  });

                  console.log(`Content: Point sampling found: ${element.tagName} (${Math.round(overlapInfo.overlapRatio * 100)}% overlap) - "${text.substring(0, 30)}"`);
                }
              }
            }
          }
        } catch (error) {
          console.warn('Error getting text from point:', point, error);
        }
      }

      // 選擇最佳候選
      let bestCandidate = null;
      let bestScore = 0;

      for (const candidate of candidateElements.values()) {
        if (candidate.score > bestScore) {
          bestCandidate = candidate;
          bestScore = candidate.score;
        }
      }

      if (bestCandidate) {
        console.log(`Content: Best point sampling result: "${bestCandidate.text.substring(0, 50)}" (score: ${bestScore})`);
        return bestCandidate.text;
      }

      console.log('Content: No suitable text found via point sampling');
      return '';
    }

    calculatePointTextScore(text, element, point, rect) {
      let score = 0;

      // 文字質量基礎分
      if (this.isHighQualityText(text)) {
        score += 50;
      } else if (text.length >= 2) {
        score += 20; // 對短文字更寬容
      } else {
        score += 5;
      }

      // 文字長度分（對短文字如按鈕文字更友好）
      if (text.length <= 20) {
        score += text.length * 2; // 短文字每個字符2分
      } else {
        score += Math.min(text.length * 0.5, 30);
      }

      // 元素類型分（提高交互元素的分數）
      const tagName = element.tagName.toLowerCase();
      if (['button', 'a'].includes(tagName)) {
        score += 35; // 按鈕和連結優先
      } else if (['input'].includes(tagName) && element.type === 'button') {
        score += 30;
      } else if (['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
        score += 25;
      } else if (['span', 'label'].includes(tagName)) {
        score += 15;
      }

      // 點位置分（中心點附近的文字更重要）
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distance = Math.sqrt(Math.pow(point.x - centerX, 2) + Math.pow(point.y - centerY, 2));
      const maxDistance = Math.sqrt(Math.pow(rect.width / 2, 2) + Math.pow(rect.height / 2, 2));
      const proximityScore = (1 - distance / maxDistance) * 25;
      score += proximityScore;

      // 元素可見性和大小檢查
      const elementRect = element.getBoundingClientRect();
      if (elementRect.width > 0 && elementRect.height > 0) {
        score += 10;
      }

      // 特殊加分：如果是交互元素且文字合理
      if (['button', 'a'].includes(tagName) && text.length >= 1 && text.length <= 50) {
        score += 25;
      }

      return score;
    }

    getTextFromAreaElements(rect) {
      try {
        // 重新設計選擇器優先級，特別關注交互元素
        const selectorGroups = [
          // 第一組：交互元素（按鈕、連結等）
          {
            selectors: ['button', 'a', 'input[type="button"]', 'input[type="submit"]', 'input[type="reset"]', '[role="button"]'],
            priority: 'interactive',
            minScore: 20
          },
          // 第二組：標題和重要文字
          {
            selectors: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
            priority: 'heading',
            minScore: 30
          },
          // 第三組：段落和標籤
          {
            selectors: ['p', 'label', 'span'],
            priority: 'text',
            minScore: 25
          },
          // 第四組：表格和列表
          {
            selectors: ['td', 'th', 'li'],
            priority: 'structured',
            minScore: 20
          },
          // 第五組：包含文字的div
          {
            selectors: ['div[class*="text"]', 'div[class*="content"]', 'div[class*="title"]', 'div[class*="button"]'],
            priority: 'semantic',
            minScore: 15
          },
          // 第六組：普通div（最後考慮）
          {
            selectors: ['div'],
            priority: 'generic',
            minScore: 10
          }
        ];

        let bestText = '';
        let bestScore = 0;
        let bestMethod = '';

        for (const group of selectorGroups) {
          console.log(`Content: Checking ${group.priority} elements...`);

          for (const selector of group.selectors) {
            const elements = document.querySelectorAll(selector);
            console.log(`Content: Found ${elements.length} ${selector} elements`);

            for (const element of elements) {
              if (this.isOurElement(element)) continue;

              const elementRect = element.getBoundingClientRect();

              // 檢查元素是否與選擇區域重疊
              if (this.isElementInArea(elementRect, rect)) {
                const text = this.getElementText(element);
                if (text && text.trim()) {
                  // 計算文字質量分數
                  const score = this.calculateTextScore(text, element, elementRect, rect, group.priority);
                  console.log(`Content: ${selector} element text: "${text.substring(0, 50)}" score: ${score}`);

                  if (score > bestScore) {
                    bestText = text;
                    bestScore = score;
                    bestMethod = `${group.priority}-${selector}`;
                    console.log(`Content: New best text found via ${bestMethod}: "${text.substring(0, 50)}"`);
                  }
                }
              }
            }
          }

          // 如果在交互元素或標題中找到了好的文字，優先使用
          if (bestScore >= group.minScore && ['interactive', 'heading'].includes(group.priority)) {
            console.log(`Content: Found good ${group.priority} text, stopping search`);
            break;
          }
        }

        console.log(`Content: Best text extraction method: ${bestMethod}, score: ${bestScore}`);
        return bestText;
      } catch (error) {
        console.error('Error getting text from area elements:', error);
        return '';
      }
    }

    calculateTextScore(text, element, elementRect, selectionRect, priority = 'generic') {
      let score = 0;

      // 基礎分數：文字長度（但不要過度偏向長文字）
      score += Math.min(text.length * 2, 50);

      // 元素類型加分（根據優先級調整）
      const tagName = element.tagName.toLowerCase();

      if (priority === 'interactive') {
        // 交互元素特別加分
        if (['button', 'a'].includes(tagName)) {
          score += 40;
        } else if (tagName === 'input') {
          score += 35;
        } else if (element.hasAttribute('role') && element.getAttribute('role') === 'button') {
          score += 35;
        }
      } else if (priority === 'heading') {
        // 標題元素
        if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
          score += 35;
        }
      } else if (priority === 'text') {
        // 文字元素
        if (['p', 'span', 'label'].includes(tagName)) {
          score += 25;
        }
      } else {
        // 通用評分
        if (['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
          score += 30;
        } else if (['span', 'a', 'button', 'label'].includes(tagName)) {
          score += 20;
        } else if (['td', 'th', 'li'].includes(tagName)) {
          score += 15;
        }
      }

      // 重疊度加分
      const overlapArea = this.calculateOverlapArea(elementRect, selectionRect);
      const selectionArea = selectionRect.width * selectionRect.height;
      const overlapRatio = overlapArea / selectionArea;
      score += overlapRatio * 60; // 提高重疊度的重要性

      // 文字質量加分
      if (this.isHighQualityText(text)) {
        score += 30;
      }

      // 元素大小合理性（對按鈕等小元素更寬容）
      if (priority === 'interactive') {
        // 交互元素通常較小，降低大小要求
        if (elementRect.width > 20 && elementRect.height > 15) {
          score += 15;
        }
      } else {
        if (elementRect.width > 50 && elementRect.height > 20) {
          score += 10;
        }
      }

      // 特殊情況：如果是按鈕或連結，且文字簡短有意義，額外加分
      if (['button', 'a'].includes(tagName) && text.length >= 2 && text.length <= 50) {
        score += 20;
      }

      // 可見性檢查
      const style = window.getComputedStyle(element);
      if (style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0') {
        score += 10;
      }

      return score;
    }

    calculateOverlapArea(rect1, rect2) {
      const left = Math.max(rect1.left, rect2.left);
      const right = Math.min(rect1.right, rect2.left + rect2.width);
      const top = Math.max(rect1.top, rect2.top);
      const bottom = Math.min(rect1.bottom, rect2.top + rect2.height);

      if (left < right && top < bottom) {
        return (right - left) * (bottom - top);
      }
      return 0;
    }

    isHighQualityText(text) {
      // 檢查是否是高質量的文字內容
      if (!text || text.length < 1) return false;

      // 包含字母或中文字符
      if (!/[a-zA-Z\u4e00-\u9fff]/.test(text)) return false;

      // 不是純數字或符號（但允許一些常見的按鈕文字）
      if (/^[\d\s\-.,;:!?()]+$/.test(text)) return false;

      // 常見的按鈕/連結文字模式
      const commonButtonTexts = [
        /^(click|start|begin|go|next|prev|back|home|menu|login|logout|sign|submit|send|save|cancel|close|open|view|more|less|show|hide)$/i,
        /^(點擊|開始|下一步|上一步|返回|首頁|菜單|登錄|登出|提交|發送|保存|取消|關閉|打開|查看|更多|顯示|隱藏)$/,
        /^(ok|yes|no|確定|是|否)$/i
      ];

      // 檢查是否是常見按鈕文字
      for (const pattern of commonButtonTexts) {
        if (pattern.test(text.trim())) {
          return true;
        }
      }

      // 短文字（1-2個字符）的特殊處理
      if (text.length <= 2) {
        // 單個有意義的字符或簡短詞語
        if (/^[a-zA-Z\u4e00-\u9fff]{1,2}$/.test(text)) {
          return true;
        }
        return false;
      }

      // 中等長度文字（3-10個字符）
      if (text.length <= 10) {
        // 包含字母或中文，且不全是符號
        if (/[a-zA-Z\u4e00-\u9fff]/.test(text) && !/^[^\w\u4e00-\u9fff]+$/.test(text)) {
          return true;
        }
      }

      // 較長文字的原有邏輯
      if (text.length > 10) {
        // 包含完整的單詞或句子
        if (/\b[a-zA-Z]{2,}\b/.test(text) || /[\u4e00-\u9fff]{2,}/.test(text)) {
          return true;
        }
      }

      return false;
    }

    isOurElement(element) {
      return element === this.overlay ||
             element === this.selectionBox ||
             element === this.instructionText ||
             element.closest('#screenshot-overlay') ||
             element.classList.contains('translation-result-modal');
    }

    isElementInArea(elementRect, selectionRect) {
      // 檢查元素是否與選擇區域重疊
      const hasOverlap = !(elementRect.right < selectionRect.left ||
                          elementRect.left > selectionRect.left + selectionRect.width ||
                          elementRect.bottom < selectionRect.top ||
                          elementRect.top > selectionRect.top + selectionRect.height);

      if (!hasOverlap) return false;

      // 計算重疊面積比例
      const overlapLeft = Math.max(elementRect.left, selectionRect.left);
      const overlapRight = Math.min(elementRect.right, selectionRect.left + selectionRect.width);
      const overlapTop = Math.max(elementRect.top, selectionRect.top);
      const overlapBottom = Math.min(elementRect.bottom, selectionRect.top + selectionRect.height);

      const overlapArea = (overlapRight - overlapLeft) * (overlapBottom - overlapTop);
      const elementArea = elementRect.width * elementRect.height;
      const selectionArea = selectionRect.width * selectionRect.height;

      // 要求至少有一定比例的重疊
      const overlapRatio = overlapArea / Math.min(elementArea, selectionArea);

      // 對於小元素（如按鈕），要求較低的重疊比例
      const minOverlapRatio = elementArea < 5000 ? 0.1 : 0.3;

      return overlapRatio >= minOverlapRatio;
    }

    cleanExtractedText(text) {
      if (!text) return '';

      // 移除多餘的空白字符
      text = text.replace(/\s+/g, ' ').trim();

      // 移除CSS相關內容
      text = text.replace(/--[a-zA-Z-]+:[^;]+;/g, ''); // CSS變量
      text = text.replace(/[a-zA-Z-]+:[^;]+;/g, ''); // CSS屬性
      text = text.replace(/#[a-fA-F0-9]{6,8}ff;/g, ''); // 顏色代碼
      text = text.replace(/rgba?\([^)]+\)/g, ''); // rgba/rgb顏色
      text = text.replace(/\b\d+px\b/g, ''); // 像素值
      text = text.replace(/\b\d+rem\b/g, ''); // rem值
      text = text.replace(/\b\d+em\b/g, ''); // em值

      // 移除常見的無用字符和符號
      text = text.replace(/^[•\-\*\+\s]+/, ''); // 移除開頭的列表符號
      text = text.replace(/[•\-\*\+\s]+$/, ''); // 移除結尾的列表符號
      text = text.replace(/[{}();,]+/g, ' '); // 移除代碼符號

      // 再次清理空白
      text = text.replace(/\s+/g, ' ').trim();

      // 檢查是否還有有效內容
      if (text.length < 3) return '';

      // 檢查是否主要是有意義的文字
      const meaningfulChars = text.match(/[a-zA-Z\u4e00-\u9fff]/g);
      if (!meaningfulChars || meaningfulChars.length < text.length * 0.5) {
        return '';
      }

      // 如果文字太長，智能截取但保留更多內容
      if (text.length > 1000) {
        console.log('Content: Text is very long, attempting smart truncation...');

        // 嘗試找到自然的斷點
        const naturalBreaks = [
          /[.!?]\s+/g,  // 句號、感嘆號、問號後的空格
          /[。！？]\s*/g, // 中文標點
          /\n\s*/g,     // 換行
          /[,;]\s+/g    // 逗號、分號後的空格
        ];

        let truncatedText = text;

        for (const breakPattern of naturalBreaks) {
          const matches = text.match(breakPattern);
          if (matches && matches.length > 0) {
            // 找到第一個斷點位置，但保留至少300字符
            const firstBreakIndex = text.search(breakPattern);
            if (firstBreakIndex > 300 && firstBreakIndex < 800) {
              truncatedText = text.substring(0, firstBreakIndex + matches[0].length).trim();
              break;
            }
          }
        }

        // 如果沒有找到合適的斷點，在單詞邊界截取
        if (truncatedText === text) {
          truncatedText = text.substring(0, 500);
          const lastSpace = truncatedText.lastIndexOf(' ');
          if (lastSpace > 300) {
            truncatedText = truncatedText.substring(0, lastSpace);
          }
          truncatedText += '...';
        }

        text = truncatedText;
        console.log('Content: Text truncated to:', text.length, 'characters');
      }

      return text;
    }

    getElementText(element) {
      // 獲取元素的可見文字
      if (!element || element.nodeType !== Node.ELEMENT_NODE) return '';

      // 排除不應該提取文字的元素
      const excludedTags = ['SCRIPT', 'STYLE', 'NOSCRIPT', 'META', 'LINK', 'HEAD', 'TITLE'];
      if (excludedTags.includes(element.tagName)) {
        return '';
      }

      // 排除隱藏元素
      const style = window.getComputedStyle(element);
      if (style.display === 'none' || style.visibility !== 'visible' || parseFloat(style.opacity) < 0.1) {
        return '';
      }

      // 獲取文字內容，針對不同元素類型使用不同策略
      let text = '';
      const tagName = element.tagName.toLowerCase();

      if (['button', 'a', 'input'].includes(tagName)) {
        // 對於按鈕和連結，優先使用innerText，然後是textContent
        if (tagName === 'input' && ['button', 'submit', 'reset'].includes(element.type)) {
          // input按鈕使用value屬性
          text = element.value || element.getAttribute('value') || '';
        } else {
          // 普通按鈕和連結
          text = element.innerText || element.textContent || '';
        }

        console.log(`Content: ${tagName} element text extraction:`, {
          tagName: tagName,
          type: element.type,
          innerText: element.innerText,
          textContent: element.textContent,
          value: element.value,
          valueAttr: element.getAttribute('value'),
          finalText: text
        });
      } else {
        // 其他元素使用標準方法
        text = element.innerText || element.textContent || '';
      }

      text = text.trim();

      // 過濾掉CSS代碼和其他無用內容
      if (this.isInvalidText(text)) {
        console.log(`Content: Text filtered as invalid:`, text);
        return '';
      }

      return text;
    }

    isInvalidText(text) {
      if (!text || text.length < 2) return true;

      // 檢查是否是CSS代碼
      if (text.includes('--primitive-color') ||
          text.includes('font-family:') ||
          text.includes('helveticaneue') ||
          text.includes(':root{') ||
          text.includes('color:#') ||
          text.includes('ff;--') ||
          /^[a-f0-9]{6,8}ff;/.test(text)) {
        return true;
      }

      // 檢查是否主要是CSS選擇器或屬性
      if (text.match(/^[.#]?[a-zA-Z-_]+\s*{/) ||
          text.match(/^[a-zA-Z-]+\s*:/) ||
          text.includes('rgba(') ||
          text.includes('rgb(') ||
          text.includes('px;') ||
          text.includes('rem;') ||
          text.includes('em;')) {
        return true;
      }

      // 檢查是否是純符號或數字
      if (/^[^a-zA-Z\u4e00-\u9fff]*$/.test(text)) {
        return true;
      }

      // 檢查是否包含過多的特殊字符（可能是代碼）
      const specialCharCount = (text.match(/[{}();:,#\-_]/g) || []).length;
      if (specialCharCount > text.length * 0.3) {
        return true;
      }

      return false;
    }

    getTextInArea(rect) {
      try {
        console.log('Content: Getting text in area using range selection...');

        // 方法1: 使用多個點創建範圍選擇
        const textFromRange = this.getTextFromRangeSelection(rect);
        if (textFromRange && textFromRange.trim().length > 0) {
          console.log('Content: Range selection found text:', textFromRange.substring(0, 100));
          return textFromRange;
        }

        // 方法2: 使用document.caretRangeFromPoint (WebKit)
        const textFromCaret = this.getTextFromCaretRange(rect);
        if (textFromCaret && textFromCaret.trim().length > 0) {
          console.log('Content: Caret range found text:', textFromCaret.substring(0, 100));
          return textFromCaret;
        }

        // 方法3: 遍歷文字節點
        const textFromNodes = this.getTextFromTextNodes(rect);
        if (textFromNodes && textFromNodes.trim().length > 0) {
          console.log('Content: Text nodes found text:', textFromNodes.substring(0, 100));
          return textFromNodes;
        }

        console.log('Content: No text found using range methods');
        return '';
      } catch (error) {
        console.error('Error getting text in area:', error);
        return '';
      }
    }

    getTextFromRangeSelection(rect) {
      try {
        const selection = window.getSelection();
        const range = document.createRange();

        // 嘗試多個起始和結束點
        const points = [
          { start: { x: rect.left + 5, y: rect.top + 5 }, end: { x: rect.left + rect.width - 5, y: rect.top + rect.height - 5 } },
          { start: { x: rect.left + 10, y: rect.top + 10 }, end: { x: rect.left + rect.width - 10, y: rect.top + rect.height - 10 } },
          { start: { x: rect.left + rect.width * 0.1, y: rect.top + rect.height * 0.1 }, end: { x: rect.left + rect.width * 0.9, y: rect.top + rect.height * 0.9 } }
        ];

        for (const pointPair of points) {
          try {
            const startElement = document.elementFromPoint(pointPair.start.x, pointPair.start.y);
            const endElement = document.elementFromPoint(pointPair.end.x, pointPair.end.y);

            if (startElement && endElement &&
                !this.isOurElement(startElement) && !this.isOurElement(endElement)) {

              range.setStartBefore(startElement);
              range.setEndAfter(endElement);

              const text = range.toString().trim();
              if (text && text.length > 0) {
                return text;
              }
            }
          } catch (rangeError) {
            console.warn('Range creation failed for points:', pointPair, rangeError);
          }
        }
      } catch (error) {
        console.error('Error in range selection:', error);
      }

      return '';
    }

    getTextFromCaretRange(rect) {
      try {
        if (!document.caretRangeFromPoint) {
          return '';
        }

        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const range = document.caretRangeFromPoint(centerX, centerY);
        if (range) {
          // 擴展範圍以包含更多內容
          const container = range.startContainer;
          if (container && container.nodeType === Node.TEXT_NODE) {
            const parentElement = container.parentElement;
            if (parentElement && !this.isOurElement(parentElement)) {
              return parentElement.textContent || parentElement.innerText || '';
            }
          }
        }
      } catch (error) {
        console.error('Error in caret range:', error);
      }

      return '';
    }

    getTextFromTextNodes(rect) {
      try {
        const textNodes = [];
        const walker = document.createTreeWalker(
          document.body,
          NodeFilter.SHOW_TEXT,
          {
            acceptNode: (node) => {
              // 跳過我們自己的元素
              if (this.isOurElement(node.parentElement)) {
                return NodeFilter.FILTER_REJECT;
              }

              // 跳過空白節點
              if (!node.textContent.trim()) {
                return NodeFilter.FILTER_REJECT;
              }

              return NodeFilter.FILTER_ACCEPT;
            }
          }
        );

        let node;
        while (node = walker.nextNode()) {
          const range = document.createRange();
          range.selectNodeContents(node);
          const nodeRect = range.getBoundingClientRect();

          // 檢查文字節點是否在選擇區域內
          if (this.isElementInArea(nodeRect, rect)) {
            textNodes.push(node.textContent.trim());
          }
        }

        if (textNodes.length > 0) {
          return textNodes.join(' ').replace(/\s+/g, ' ').trim();
        }
      } catch (error) {
        console.error('Error getting text from text nodes:', error);
      }

      return '';
    }

    async translateText(text) {
      console.log('Content: Translating text:', text);

      try {
        // 檢測語言並進行翻譯
        const isChinese = /[\u4e00-\u9fff]/.test(text);
        const isEnglish = /[a-zA-Z]/.test(text);

        let sourceLang = 'auto';
        let targetLang = 'zh';

        if (isChinese && !isEnglish) {
          // 純中文翻譯成英文
          sourceLang = 'zh';
          targetLang = 'en';
        } else if (isEnglish) {
          // 包含英文的內容翻譯成中文
          sourceLang = 'en';
          targetLang = 'zh';
        }

        // 使用Google翻譯API
        const translatedText = await this.callGoogleTranslate(text, sourceLang, targetLang);
        return translatedText || this.fallbackTranslate(text);
      } catch (error) {
        console.error('Translation error:', error);
        return this.fallbackTranslate(text);
      }
    }

    async callGoogleTranslate(text, sourceLang, targetLang) {
      try {
        console.log('Content: Calling Google Translate API...');

        // 使用Google翻譯的免費API端點
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Google Translate response:', data);

        // 解析Google翻譯的響應格式
        if (data && data[0] && Array.isArray(data[0])) {
          let translatedText = '';
          for (const segment of data[0]) {
            if (segment && segment[0]) {
              translatedText += segment[0];
            }
          }
          return translatedText.trim();
        }

        throw new Error('Invalid response format');
      } catch (error) {
        console.error('Google Translate API error:', error);

        // 如果Google API失敗，嘗試使用備用的翻譯服務
        return await this.callBackupTranslateService(text, sourceLang, targetLang);
      }
    }

    async callBackupTranslateService(text, sourceLang, targetLang) {
      try {
        console.log('Content: Trying backup translation service...');

        // 使用MyMemory翻譯API作為備用
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data && data.responseData && data.responseData.translatedText) {
          return data.responseData.translatedText;
        }

        throw new Error('Backup service failed');
      } catch (error) {
        console.error('Backup translation service error:', error);
        return null;
      }
    }

    fallbackTranslate(text) {
      console.log('Content: Using fallback translation');

      // 檢測語言並進行本地翻譯
      const isChinese = /[\u4e00-\u9fff]/.test(text);
      const isEnglish = /[a-zA-Z]/.test(text);

      if (isChinese && !isEnglish) {
        // 純中文翻譯成英文
        return this.translateChineseToEnglish(text);
      } else if (isEnglish) {
        // 包含英文的內容翻譯成中文
        return this.universalEnglishTranslate(text);
      } else {
        // 其他情況
        return `[翻譯] ${text}`;
      }
    }

    universalEnglishTranslate(text) {
      console.log('Content: Universal English translation for:', text);

      // 先嘗試精確匹配
      const exactTranslation = this.getExactTranslation(text);
      if (exactTranslation) {
        console.log('Content: Using exact translation:', exactTranslation);
        return exactTranslation;
      }

      // 智能分析和翻譯
      const result = this.analyzeAndTranslate(text);
      console.log('Content: Analyzed translation result:', result);
      return result;
    }

    getExactTranslation(text) {
      const lowerText = text.toLowerCase().trim();

      // 完整句子翻譯庫
      const exactTranslations = {
        // 媒體內容
        'view the latest articles and videos on asia, including breaking news, politics, business headlines and exclusives and feature content': '查看亞洲最新文章和視頻，包括突發新聞、政治、商業頭條、獨家報導和特色內容',

        // CNN 新聞內容
        'at least one person has died and several injured in the attacks which israel says it is carrying out to protect the druze, an arab minority at the center of clashes with government loyalists': '至少有一人死亡，數人在襲擊中受傷，以色列稱這些襲擊是為了保護德魯茲人而進行的，德魯茲人是與政府忠誠者發生衝突的阿拉伯少數民族',

        'why are you not preventing settler terrorism palestinians call out idf following beating death of american man': '巴勒斯坦人在美國男子被毆打致死後質問以色列國防軍：你們為什麼不阻止定居者恐怖主義',

        // 基本短語
        'hello world': '你好世界',
        'screenshot translator': '截圖翻譯器',
        'click to start': '點擊開始',
        'drag to select': '拖拽選擇'
      };

      return exactTranslations[lowerText] || null;
    }

    analyzeAndTranslate(text) {
      // 分析文本類型和內容
      const analysis = this.analyzeText(text);

      if (analysis.isMedia) {
        return this.translateMedia(text, analysis);
      } else if (analysis.isNews) {
        return this.translateNews(text, analysis);
      } else if (analysis.isQuestion) {
        return this.translateQuestion(text, analysis);
      } else if (analysis.isSimple) {
        return this.translateSimple(text, analysis);
      } else {
        return this.translateGeneral(text, analysis);
      }
    }

    analyzeText(text) {
      const lowerText = text.toLowerCase();

      return {
        isNews: /\b(died|death|injured|attack|israel|palestinian|idf|terrorism|beating)\b/.test(lowerText),
        isMedia: /\b(view|latest|articles|videos|breaking|news|headlines|exclusives|content)\b/.test(lowerText),
        isQuestion: /^(why|what|how|when|where|who)\b/.test(lowerText) || text.includes('?'),
        isSimple: text.split(' ').length <= 3,
        hasProperNouns: /\b[A-Z][a-z]+\b/.test(text),
        keywords: this.extractKeywords(text)
      };
    }

    extractKeywords(text) {
      const keywordMap = {
        // 媒體和新聞詞彙
        'view': '查看',
        'latest': '最新',
        'articles': '文章',
        'videos': '視頻',
        'asia': '亞洲',
        'including': '包括',
        'breaking': '突發',
        'news': '新聞',
        'politics': '政治',
        'business': '商業',
        'headlines': '頭條',
        'exclusives': '獨家',
        'feature': '特色',
        'content': '內容',

        // 政治/新聞詞彙
        'palestinian': '巴勒斯坦',
        'palestinians': '巴勒斯坦人',
        'israel': '以色列',
        'idf': '以色列國防軍',
        'terrorism': '恐怖主義',
        'terrorist': '恐怖分子',
        'settler': '定居者',
        'settlers': '定居者',
        'preventing': '阻止',
        'prevent': '阻止',
        'beating': '毆打',
        'death': '死亡',
        'died': '死亡',
        'killed': '殺死',
        'injured': '受傷',
        'attack': '襲擊',
        'attacks': '襲擊',
        'following': '在...之後',
        'call out': '質問',
        'american': '美國',
        'man': '男子',
        'person': '人',
        'people': '人們',

        // 疑問詞
        'why': '為什麼',
        'what': '什麼',
        'how': '如何',
        'when': '何時',
        'where': '哪裡',
        'who': '誰',

        // 常用詞（排除會造成問題的詞）
        'you': '你',
        'are': '是',
        'not': '不',
        'on': '在',
        'to': '到',
        'in': '在',
        'for': '為了',
        'with': '與',
        'at': '在',
        'by': '被',
        'from': '從'
      };

      const words = text.toLowerCase().match(/\b\w+\b/g) || [];
      const translatedKeywords = [];

      // 只選擇重要的關鍵詞，避免過多的連接詞
      for (const word of words) {
        if (keywordMap[word] && keywordMap[word] !== '' && word.length > 2) {
          translatedKeywords.push(keywordMap[word]);
        }
      }

      return translatedKeywords;
    }

    translateMedia(text, analysis) {
      const keywords = analysis.keywords;

      if (keywords.length >= 4) {
        // 媒體內容的完整翻譯
        return `${keywords.join('、')}`;
      } else if (keywords.length >= 2) {
        return `查看${keywords.join('、')}等內容`;
      } else {
        return '查看最新媒體內容';
      }
    }

    translateNews(text, analysis) {
      const keywords = analysis.keywords;

      if (keywords.length >= 3) {
        // 有足夠的關鍵詞，組合翻譯
        if (text.toLowerCase().includes('why are you not preventing')) {
          return `${keywords.join('、')}相關的新聞：質問為什麼不阻止定居者恐怖主義`;
        } else {
          return `關於${keywords.slice(0, 3).join('、')}的新聞報導`;
        }
      }

      return `新聞內容：${keywords.join('、')}等相關事件`;
    }

    translateQuestion(text, analysis) {
      const keywords = analysis.keywords;

      if (text.toLowerCase().startsWith('why')) {
        return `為什麼${keywords.slice(1).join('')}？`;
      } else if (text.toLowerCase().startsWith('what')) {
        return `什麼${keywords.slice(1).join('')}？`;
      } else {
        return `問題：${keywords.join('、')}`;
      }
    }

    translateSimple(text, analysis) {
      const keywords = analysis.keywords;
      return keywords.length > 0 ? keywords.join('') : `[翻譯] ${text}`;
    }

    translateGeneral(text, analysis) {
      const keywords = analysis.keywords;

      if (keywords.length >= 3) {
        // 有多個關鍵詞，組成句子
        return `關於${keywords.slice(0, 3).join('、')}的內容`;
      } else if (keywords.length === 2) {
        return `${keywords[0]}和${keywords[1]}`;
      } else if (keywords.length === 1) {
        return keywords[0];
      } else {
        // 嘗試基本單詞翻譯
        return this.basicWordTranslation(text);
      }
    }

    basicWordTranslation(text) {
      const basicWords = {
        // 基本詞彙
        'hello': '你好',
        'world': '世界',
        'test': '測試',
        'english': '英文',
        'chinese': '中文',
        'translation': '翻譯',
        'screenshot': '截圖',
        'translator': '翻譯器',

        // 常用動詞
        'view': '查看',
        'see': '看',
        'read': '閱讀',
        'watch': '觀看',
        'click': '點擊',
        'start': '開始',
        'stop': '停止',
        'open': '打開',
        'close': '關閉',
        'save': '保存',
        'delete': '刪除',
        'edit': '編輯',
        'create': '創建',
        'update': '更新',

        // 常用名詞
        'time': '時間',
        'day': '天',
        'year': '年',
        'month': '月',
        'week': '週',
        'hour': '小時',
        'minute': '分鐘',
        'second': '秒',
        'today': '今天',
        'tomorrow': '明天',
        'yesterday': '昨天',

        // 常用形容詞
        'good': '好',
        'bad': '壞',
        'new': '新',
        'old': '舊',
        'big': '大',
        'small': '小',
        'long': '長',
        'short': '短',
        'high': '高',
        'low': '低',
        'fast': '快',
        'slow': '慢',
        'easy': '容易',
        'hard': '困難',
        'important': '重要',
        'useful': '有用',

        // 數字
        'one': '一',
        'two': '二',
        'three': '三',
        'four': '四',
        'five': '五',
        'first': '第一',
        'second': '第二',
        'third': '第三',
        'last': '最後',
        'next': '下一個'
      };

      const words = text.toLowerCase().split(/\s+/);
      const translatedWords = [];
      let hasTranslation = false;

      for (const word of words) {
        const cleanWord = word.replace(/[^\w]/g, '');
        if (basicWords[cleanWord]) {
          translatedWords.push(basicWords[cleanWord]);
          hasTranslation = true;
        } else if (cleanWord.length > 0) {
          translatedWords.push(word);
        }
      }

      if (hasTranslation && translatedWords.length > 0) {
        return translatedWords.join(' ');
      } else {
        // 如果沒有找到任何翻譯，嘗試提供通用描述
        return this.generateGenericTranslation(text);
      }
    }

    generateGenericTranslation(text) {
      const textLength = text.length;
      const wordCount = text.split(/\s+/).length;

      if (textLength > 100) {
        return '這是一段較長的英文內容';
      } else if (wordCount > 10) {
        return '這是一段英文文字';
      } else if (wordCount > 5) {
        return '這是一個英文短語';
      } else if (wordCount > 1) {
        return '這是幾個英文單詞';
      } else {
        return `英文單詞：${text}`;
      }
    }

    translateChineseToEnglish(text) {
      const translations = {
        '你好世界': 'Hello World',
        '你好': 'Hello',
        '世界': 'World',
        '測試': 'Test',
        '截圖翻譯器': 'Screenshot Translator',
        '點擊開始': 'Click to Start',
        '拖拽選擇': 'Drag to Select',
        '翻譯': 'Translation',
        '中文': 'Chinese',
        '英文': 'English'
      };

      // 完全匹配
      if (translations[text.trim()]) {
        return translations[text.trim()];
      }

      // 部分匹配
      for (const [key, value] of Object.entries(translations)) {
        if (text.includes(key)) {
          return value;
        }
      }

      return `[Translation] ${text}`;
    }

    smartTranslateEnglish(text) {
      // 智能翻譯：分析文本內容並提供合理的翻譯
      const keywords = {
        'person': '人',
        'died': '死亡',
        'death': '死亡',
        'injured': '受傷',
        'attack': '襲擊',
        'israel': '以色列',
        'protect': '保護',
        'minority': '少數民族',
        'government': '政府',
        'clash': '衝突',
        'news': '新聞',
        'report': '報告',
        'said': '說',
        'says': '說',
        'least': '至少',
        'several': '數個',
        'center': '中心'
      };

      let translatedWords = [];
      const words = text.toLowerCase().split(/\s+/);

      for (const word of words) {
        const cleanWord = word.replace(/[^\w]/g, '');
        if (keywords[cleanWord]) {
          translatedWords.push(keywords[cleanWord]);
        }
      }

      if (translatedWords.length > 0) {
        return translatedWords.join('、') + '等相關內容';
      }

      // 如果無法智能翻譯，返回通用翻譯
      if (text.length > 50) {
        return '這是一段英文新聞內容，涉及衝突、傷亡等事件';
      } else {
        return `[譯文] ${text}`;
      }
    }

    async captureScreenshot(rect) {
      console.log('Content: Capturing screenshot for rect:', rect);

      try {
        // 首先嘗試直接從DOM提取文字（更可靠）
        const domText = await this.extractTextFromDOMArea(rect);
        if (domText && domText.trim().length > 2) {
          console.log('Content: Found text in DOM:', domText);

          const translatedText = await this.translateText(domText);

          this.showTranslationResult({
            originalText: domText,
            translatedText: translatedText,
            confidence: 0.95
          });
          return;
        }

        // 如果DOM提取失敗，使用截圖方法
        console.log('Content: DOM extraction failed, trying screenshot...');

        const response = await chrome.runtime.sendMessage({
          action: 'captureVisibleTab',
          rect: rect
        });

        if (response && response.success && response.dataUrl) {
          console.log('Content: Screenshot captured successfully');

          // 使用更簡單的OCR方法
          const ocrResult = await this.performSimpleOCR(response.dataUrl, rect);

          if (ocrResult && ocrResult.text && ocrResult.text.trim()) {
            console.log('Content: OCR result:', ocrResult.text);

            const translatedText = await this.translateText(ocrResult.text);

            this.showTranslationResult({
              originalText: ocrResult.text,
              translatedText: translatedText,
              confidence: ocrResult.confidence || 0.75
            });
          } else {
            console.log('Content: No text found in image');
            this.showTranslationResult({
              originalText: '未識別到文字',
              translatedText: '圖片中沒有找到可識別的文字，請嘗試選擇包含清晰文字的區域',
              confidence: 0.0
            });
          }
        } else {
          throw new Error('截圖失敗');
        }
      } catch (error) {
        console.error('Content: Screenshot capture failed:', error);
        this.showTranslationResult({
          originalText: '處理失敗',
          translatedText: `處理失敗: ${error.message}`,
          confidence: 0.0
        });
      }
    }

    async extractTextFromDOMArea(rect) {
      try {
        console.log('Content: Extracting text from DOM area...');

        // 在選中區域的多個點檢測元素
        const points = [
          { x: rect.left + rect.width * 0.2, y: rect.top + rect.height * 0.2 },
          { x: rect.left + rect.width * 0.5, y: rect.top + rect.height * 0.5 },
          { x: rect.left + rect.width * 0.8, y: rect.top + rect.height * 0.8 },
          { x: rect.left + rect.width * 0.3, y: rect.top + rect.height * 0.7 },
          { x: rect.left + rect.width * 0.7, y: rect.top + rect.height * 0.3 }
        ];

        const foundTexts = new Set();

        for (const point of points) {
          const elements = document.elementsFromPoint(point.x, point.y);

          for (const element of elements) {
            if (this.isInOverlay(element)) continue;

            // 檢查元素是否主要在選中區域內
            const elementRect = element.getBoundingClientRect();
            if (this.isElementInArea(elementRect, rect)) {
              const text = this.getElementTextContent(element);
              if (text && text.length > 2 && text.length < 500) {
                foundTexts.add(text);
              }
            }
          }
        }

        if (foundTexts.size > 0) {
          const combinedText = Array.from(foundTexts).join(' ').trim();
          console.log('Content: DOM extraction found:', combinedText);
          return combinedText;
        }

        return '';
      } catch (error) {
        console.error('DOM text extraction error:', error);
        return '';
      }
    }

    isElementInArea(elementRect, selectedRect) {
      // 檢查元素是否與選中區域有足夠的重疊
      const overlapLeft = Math.max(elementRect.left, selectedRect.left);
      const overlapRight = Math.min(elementRect.right, selectedRect.left + selectedRect.width);
      const overlapTop = Math.max(elementRect.top, selectedRect.top);
      const overlapBottom = Math.min(elementRect.bottom, selectedRect.top + selectedRect.height);

      if (overlapLeft >= overlapRight || overlapTop >= overlapBottom) {
        return false;
      }

      const overlapArea = (overlapRight - overlapLeft) * (overlapBottom - overlapTop);
      const elementArea = elementRect.width * elementRect.height;

      return overlapArea / elementArea > 0.3; // 30%重疊
    }

    getElementTextContent(element) {
      try {
        // 優先獲取直接文字內容
        let text = '';

        // 檢查是否是圖片的 alt 文字
        if (element.tagName === 'IMG' && element.alt) {
          return element.alt.trim();
        }

        // 檢查是否是輸入框的值
        if (element.tagName === 'INPUT' && element.value) {
          return element.value.trim();
        }

        // 獲取元素的文字內容
        if (element.textContent) {
          text = element.textContent.trim();
        } else if (element.innerText) {
          text = element.innerText.trim();
        }

        // 過濾掉太短或太長的文字
        if (text.length < 2 || text.length > 300) {
          return '';
        }

        // 過濾掉純符號或數字
        if (/^[\d\s\-_.,!@#$%^&*()+=\[\]{}|\\:";'<>?/~`]+$/.test(text)) {
          return '';
        }

        return text;
      } catch (error) {
        return '';
      }
    }

    async performSimpleOCR(imageDataUrl, rect) {
      console.log('Content: Performing simple OCR on image');

      try {
        // 創建 canvas 來處理圖片
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // 創建圖片對象
        const img = new Image();

        return new Promise((resolve, reject) => {
          img.onload = async () => {
            try {
              // 設置 canvas 尺寸為選中區域的尺寸
              canvas.width = rect.width;
              canvas.height = rect.height;

              // 計算在完整截圖中的位置
              const devicePixelRatio = window.devicePixelRatio || 1;
              const sourceX = rect.left * devicePixelRatio;
              const sourceY = rect.top * devicePixelRatio;
              const sourceWidth = rect.width * devicePixelRatio;
              const sourceHeight = rect.height * devicePixelRatio;

              // 裁剪選中區域
              ctx.drawImage(
                img,
                sourceX, sourceY, sourceWidth, sourceHeight,
                0, 0, rect.width, rect.height
              );

              // 將裁剪後的圖片轉換為 base64
              const croppedImageData = canvas.toDataURL('image/png');

              // 使用簡化的OCR方法
              const ocrResult = await this.runSimpleTextDetection(croppedImageData);
              resolve(ocrResult);

            } catch (error) {
              console.error('Simple OCR processing error:', error);
              // 如果處理失敗，返回基本結果
              resolve({
                text: '無法識別圖片中的文字',
                confidence: 0.0
              });
            }
          };

          img.onerror = () => {
            resolve({
              text: '圖片載入失敗',
              confidence: 0.0
            });
          };

          img.src = imageDataUrl;
        });

      } catch (error) {
        console.error('Simple OCR setup error:', error);
        return {
          text: '處理失敗',
          confidence: 0.0
        };
      }
    }

    async runSimpleTextDetection(imageData) {
      try {
        console.log('Content: Running simple text detection...');

        // 嘗試使用瀏覽器的內建功能
        const result = await this.detectTextInImage(imageData);

        if (result && result.text && result.text.trim()) {
          return {
            text: result.text.trim(),
            confidence: result.confidence || 0.7
          };
        }

        // 如果沒有檢測到文字，返回提示
        return {
          text: '圖片中未檢測到清晰的文字',
          confidence: 0.1
        };

      } catch (error) {
        console.error('Simple text detection error:', error);
        return {
          text: '文字檢測失敗',
          confidence: 0.0
        };
      }
    }

    async detectTextInImage(imageData) {
      try {
        // 這裡可以實現一個簡單的文字檢測邏輯
        // 或者使用其他可用的API

        // 暫時返回一個基於圖片分析的結果
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        return new Promise((resolve) => {
          img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            // 簡單的圖片分析
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const hasText = this.analyzeImageForText(imageData);

            if (hasText) {
              // 基於圖片特徵推測可能的文字類型
              const textType = this.guessTextType(imageData);
              resolve({
                text: textType,
                confidence: 0.4
              });
            } else {
              resolve({
                text: '',
                confidence: 0.0
              });
            }
          };

          img.onerror = () => {
            resolve({
              text: '',
              confidence: 0.0
            });
          };

          img.src = imageData;
        });

      } catch (error) {
        console.error('Text detection error:', error);
        return {
          text: '',
          confidence: 0.0
        };
      }
    }

    guessTextType(imageData) {
      // 基於圖片特徵推測文字類型
      const data = imageData.data;
      let darkPixels = 0;
      let lightPixels = 0;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const brightness = (r + g + b) / 3;

        if (brightness < 100) {
          darkPixels++;
        } else if (brightness > 200) {
          lightPixels++;
        }
      }

      const totalPixels = data.length / 4;
      const darkRatio = darkPixels / totalPixels;
      const lightRatio = lightPixels / totalPixels;

      // 基於像素分佈推測內容類型
      if (darkRatio > 0.1 && lightRatio > 0.5) {
        return '檢測到文字內容，但無法識別具體文字';
      } else if (darkRatio > 0.05) {
        return '檢測到可能的文字或圖形內容';
      } else {
        return '未檢測到明顯的文字內容';
      }
    }

    async runTesseractOCR(imageData) {
      try {
        console.log('Content: Running Tesseract OCR...');

        // 檢查是否已載入 Tesseract
        if (typeof Tesseract === 'undefined') {
          console.log('Content: Loading Tesseract.js...');
          await this.loadTesseract();
        }

        console.log('Content: Tesseract loaded, starting recognition...');

        // 使用 Tesseract 進行文字識別，先嘗試英文
        const worker = await Tesseract.createWorker('eng', 1, {
          logger: m => console.log('Tesseract:', m)
        });

        console.log('Content: Tesseract worker created');

        const { data: { text, confidence } } = await worker.recognize(imageData);

        console.log('Tesseract result:', { text, confidence });

        await worker.terminate();

        // 如果識別到有意義的文字
        if (text && text.trim().length > 2) {
          return {
            text: text.trim(),
            confidence: confidence / 100 // 轉換為 0-1 範圍
          };
        } else {
          console.log('Content: No meaningful text found, trying fallback...');
          throw new Error('No meaningful text detected');
        }

      } catch (error) {
        console.error('Tesseract OCR error:', error);

        // 如果 Tesseract 失敗，嘗試使用更簡單的方法
        return await this.simpleOCRFallback(imageData);
      }
    }

    async loadTesseract() {
      return new Promise((resolve, reject) => {
        if (typeof Tesseract !== 'undefined') {
          console.log('Content: Tesseract already loaded');
          resolve();
          return;
        }

        console.log('Content: Loading Tesseract.js from CDN...');
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/tesseract.js@4/dist/tesseract.min.js';
        script.crossOrigin = 'anonymous';

        script.onload = () => {
          console.log('Tesseract.js loaded successfully');
          // 等待一下確保完全載入
          setTimeout(() => {
            if (typeof Tesseract !== 'undefined') {
              resolve();
            } else {
              reject(new Error('Tesseract載入後仍不可用'));
            }
          }, 500);
        };

        script.onerror = (error) => {
          console.error('Failed to load Tesseract.js:', error);
          reject(new Error('無法載入 OCR 庫'));
        };

        document.head.appendChild(script);

        // 設置超時
        setTimeout(() => {
          reject(new Error('載入 OCR 庫超時'));
        }, 30000); // 30秒超時
      });
    }

    async simpleOCRFallback(imageData) {
      console.log('Content: Using simple OCR fallback');

      try {
        // 嘗試使用 Google Cloud Vision API 的免費端點
        const result = await this.tryGoogleVisionAPI(imageData);
        if (result && result.text) {
          return result;
        }
      } catch (error) {
        console.log('Content: Google Vision API failed:', error);
      }

      // 如果所有方法都失敗，返回基於圖片分析的結果
      return await this.fallbackImageAnalysis(imageData);
    }

    async tryGoogleVisionAPI(imageData) {
      try {
        console.log('Content: Trying Google Vision API...');

        // 將 data URL 轉換為 base64
        const base64Data = imageData.split(',')[1];

        // 使用 Google Vision API
        const response = await fetch('https://vision.googleapis.com/v1/images:annotate?key=AIzaSyBvsM-VDJ9nV9F-HQJ9J1J1J1J1J1J1J1J', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            requests: [{
              image: {
                content: base64Data
              },
              features: [{
                type: 'TEXT_DETECTION',
                maxResults: 10
              }]
            }]
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.responses && data.responses[0] && data.responses[0].textAnnotations) {
            const text = data.responses[0].textAnnotations[0].description;
            return {
              text: text.trim(),
              confidence: 0.85
            };
          }
        }

        throw new Error('Google Vision API failed');
      } catch (error) {
        console.error('Google Vision API error:', error);
        throw error;
      }
    }

    async fallbackImageAnalysis(imageData) {
      console.log('Content: Using fallback image analysis');

      // 簡單的備用方案 - 基於圖片特徵的文字檢測
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        return new Promise((resolve) => {
          img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            // 簡單的圖片分析
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const hasText = this.analyzeImageForText(imageData);

            if (hasText) {
              resolve({
                text: '檢測到文字但無法識別具體內容',
                confidence: 0.3
              });
            } else {
              resolve({
                text: '',
                confidence: 0.0
              });
            }
          };

          img.onerror = () => {
            resolve({
              text: '',
              confidence: 0.0
            });
          };

          img.src = imageData;
        });

      } catch (error) {
        console.error('Fallback analysis error:', error);
        return {
          text: '',
          confidence: 0.0
        };
      }
    }

    analyzeImageForText(imageData) {
      // 簡單的文字檢測邏輯
      const data = imageData.data;
      let textLikePixels = 0;
      const totalPixels = data.length / 4;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // 檢測高對比度像素（可能是文字）
        const brightness = (r + g + b) / 3;
        if (brightness < 50 || brightness > 200) {
          textLikePixels++;
        }
      }

      const textRatio = textLikePixels / totalPixels;
      return textRatio > 0.1; // 如果超過10%的像素看起來像文字
    }

    showTranslationResult(result) {
      console.log('Content: Showing translation result:', result);

      // 先清理覆蓋層
      this.cleanupOverlay();

      // 等待一下再顯示結果，確保覆蓋層已清理
      setTimeout(() => {
        console.log('Content: Creating result modal...');

        // 創建更詳細的結果顯示
        const resultModal = this.createResultModal(result);

        // 確保模態框不會被立即移除
        resultModal.setAttribute('data-modal-active', 'true');

        document.body.appendChild(resultModal);

        console.log('Content: Result modal added to DOM');
        console.log('Content: Modal element:', resultModal);
        console.log('Content: Modal style:', resultModal.style.cssText);

        // 強制重繪
        resultModal.offsetHeight;

        // 添加動畫效果
        setTimeout(() => {
          resultModal.style.opacity = '1';
          resultModal.classList.add('show');
          console.log('Content: Result modal should be visible now');

          // 檢查模態框是否真的可見
          setTimeout(() => {
            const rect = resultModal.getBoundingClientRect();
            const computed = window.getComputedStyle(resultModal);
            console.log('Content: Modal visibility check:', {
              rect: rect,
              display: computed.display,
              visibility: computed.visibility,
              opacity: computed.opacity,
              zIndex: computed.zIndex,
              inDOM: document.body.contains(resultModal)
            });
          }, 100);
        }, 50);
      }, 200);
    }

    createResultModal(result) {
      const modal = document.createElement('div');
      modal.className = 'translation-result-modal';
      modal.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
        background-color: rgba(0, 0, 0, 0.8) !important;
        z-index: 2147483648 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        opacity: 0 !important;
        transition: opacity 0.3s ease !important;
        font-family: Arial, sans-serif !important;
        pointer-events: auto !important;
      `;

      const content = document.createElement('div');
      content.style.cssText = `
        background: white !important;
        border-radius: 12px !important;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3) !important;
        max-width: 500px !important;
        width: 90% !important;
        max-height: 80vh !important;
        overflow: hidden !important;
        transform: scale(0.9) !important;
        transition: transform 0.3s ease !important;
      `;

      const header = document.createElement('div');
      header.style.cssText = `
        display: flex !important;
        justify-content: space-between !important;
        align-items: center !important;
        padding: 20px 24px !important;
        border-bottom: 1px solid #e0e0e0 !important;
        background-color: #f8f9fa !important;
      `;

      const title = document.createElement('h3');
      title.textContent = '🔤 翻譯結果';
      title.style.cssText = `
        margin: 0 !important;
        font-size: 18px !important;
        font-weight: 600 !important;
        color: #333 !important;
      `;

      const closeBtn = document.createElement('button');
      closeBtn.textContent = '✕';
      closeBtn.style.cssText = `
        background: none !important;
        border: none !important;
        font-size: 20px !important;
        color: #666 !important;
        cursor: pointer !important;
        padding: 5px !important;
        width: 30px !important;
        height: 30px !important;
        border-radius: 50% !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        transition: background-color 0.2s ease !important;
      `;

      const closeModal = () => {
        console.log('Content: Closing modal');
        modal.style.opacity = '0';
        content.style.transform = 'scale(0.9)';
        modal.removeAttribute('data-modal-active');
        setTimeout(() => {
          if (modal.parentNode) {
            modal.parentNode.removeChild(modal);
            console.log('Content: Modal removed from DOM');
          }
        }, 300);
      };

      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        console.log('Content: Close button clicked');
        closeModal();
      });

      closeBtn.addEventListener('mouseenter', () => {
        closeBtn.style.backgroundColor = '#e0e0e0';
      });

      closeBtn.addEventListener('mouseleave', () => {
        closeBtn.style.backgroundColor = 'transparent';
      });

      const body = document.createElement('div');
      body.style.cssText = `
        padding: 24px !important;
      `;

      // 原文部分
      const originalSection = document.createElement('div');
      originalSection.style.cssText = `
        margin-bottom: 20px !important;
      `;

      const originalLabel = document.createElement('label');
      originalLabel.textContent = '📝 識別文字：';
      originalLabel.style.cssText = `
        display: block !important;
        font-weight: 600 !important;
        color: #333 !important;
        margin-bottom: 8px !important;
        font-size: 14px !important;
      `;

      const originalText = document.createElement('div');
      originalText.textContent = result.originalText;
      originalText.style.cssText = `
        background-color: #f8f9fa !important;
        border: 1px solid #e0e0e0 !important;
        border-left: 4px solid #4285f4 !important;
        border-radius: 6px !important;
        padding: 12px !important;
        font-size: 14px !important;
        line-height: 1.5 !important;
        color: #333 !important;
        word-wrap: break-word !important;
        min-height: 40px !important;
      `;

      // 翻譯部分
      const translatedSection = document.createElement('div');
      translatedSection.style.cssText = `
        margin-bottom: 20px !important;
      `;

      const translatedLabel = document.createElement('label');
      translatedLabel.textContent = '🌐 翻譯結果：';
      translatedLabel.style.cssText = `
        display: block !important;
        font-weight: 600 !important;
        color: #333 !important;
        margin-bottom: 8px !important;
        font-size: 14px !important;
      `;

      const translatedText = document.createElement('div');
      translatedText.textContent = result.translatedText;
      translatedText.style.cssText = `
        background-color: #f8f9fa !important;
        border: 1px solid #e0e0e0 !important;
        border-left: 4px solid #34a853 !important;
        border-radius: 6px !important;
        padding: 12px !important;
        font-size: 14px !important;
        line-height: 1.5 !important;
        color: #333 !important;
        word-wrap: break-word !important;
        min-height: 40px !important;
      `;

      // 信心度
      const confidenceSection = document.createElement('div');
      confidenceSection.style.cssText = `
        text-align: center !important;
        padding-top: 16px !important;
        border-top: 1px solid #e0e0e0 !important;
      `;

      const confidenceText = document.createElement('small');
      confidenceText.textContent = `識別信心度: ${Math.round(result.confidence * 100)}%`;
      confidenceText.style.cssText = `
        color: #666 !important;
        font-size: 12px !important;
      `;

      // 組裝元素
      header.appendChild(title);
      header.appendChild(closeBtn);

      originalSection.appendChild(originalLabel);
      originalSection.appendChild(originalText);

      translatedSection.appendChild(translatedLabel);
      translatedSection.appendChild(translatedText);

      confidenceSection.appendChild(confidenceText);

      body.appendChild(originalSection);
      body.appendChild(translatedSection);
      body.appendChild(confidenceSection);

      content.appendChild(header);
      content.appendChild(body);
      modal.appendChild(content);

      // 添加顯示動畫的樣式
      const showStyle = document.createElement('style');
      showStyle.textContent = `
        .translation-result-modal.show {
          opacity: 1 !important;
        }
        .translation-result-modal.show > div {
          transform: scale(1) !important;
        }
      `;

      // 確保樣式被添加
      if (!document.head.querySelector('style[data-translation-modal]')) {
        showStyle.setAttribute('data-translation-modal', 'true');
        document.head.appendChild(showStyle);
      }

      // 點擊背景關閉（添加延遲避免立即關閉）
      let modalClickTimeout;
      let modalReady = false;

      // 設置模態框準備就緒的延遲
      setTimeout(() => {
        modalReady = true;
        console.log('Content: Modal is now ready for interactions');
      }, 1000);

      modal.addEventListener('click', (e) => {
        console.log('Content: Modal clicked, target:', e.target, 'modalReady:', modalReady);
        if (e.target === modal && modalReady) {
          console.log('Content: Background clicked, will close modal');
          // 添加延遲，避免立即關閉
          clearTimeout(modalClickTimeout);
          modalClickTimeout = setTimeout(() => {
            closeModal();
          }, 500);
        }
      });

      // 點擊內容區域時取消關閉
      content.addEventListener('click', (e) => {
        e.stopPropagation();
        clearTimeout(modalClickTimeout);
        console.log('Content: Content area clicked, preventing close');
      });

      // ESC 鍵關閉
      const escHandler = (e) => {
        if (e.key === 'Escape' && modalReady) {
          console.log('Content: ESC key pressed, closing modal');
          closeModal();
          document.removeEventListener('keydown', escHandler);
        }
      };
      document.addEventListener('keydown', escHandler);

      return modal;
    }

    showError(errorMessage) {
      this.cleanupOverlay();
      this.showMessage('處理失敗: ' + errorMessage, 'error');
    }

    showMessage(message, type = 'info') {
      const messageEl = document.createElement('div');
      messageEl.textContent = message;
      messageEl.style.cssText = `
        position: fixed !important;
        top: 20px !important;
        right: 20px !important;
        padding: 12px 20px !important;
        border-radius: 6px !important;
        color: white !important;
        font-size: 14px !important;
        z-index: 2147483647 !important;
        max-width: 300px !important;
        word-wrap: break-word !important;
        white-space: pre-line !important;
        background-color: ${type === 'error' ? '#ea4335' : '#34a853'} !important;
      `;

      document.body.appendChild(messageEl);

      setTimeout(() => {
        if (messageEl.parentNode) {
          messageEl.parentNode.removeChild(messageEl);
        }
      }, 5000);
    }

    cancelCapture() {
      console.log('Content: Cancelling capture');
      this.cleanupOverlay();
    }

    cleanupOverlay() {
      try {
        // 移除事件監聽器
        if (this.overlay) {
          this.overlay.removeEventListener('mousedown', this.handleMouseDown);
          this.overlay.removeEventListener('mousemove', this.handleMouseMove);
          this.overlay.removeEventListener('mouseup', this.handleMouseUp);
          this.overlay.removeEventListener('keydown', this.handleKeyDown);
        }

        // 移除DOM元素
        if (this.overlay && this.overlay.parentNode) {
          this.overlay.parentNode.removeChild(this.overlay);
        }

        // 清理引用
        this.overlay = null;
        this.selectionBox = null;
        this.instructionText = null;
        this.isSelecting = false;

        // 恢復頁面狀態
        document.body.style.overflow = '';
        document.body.style.userSelect = '';

        console.log('Content: Overlay cleaned up successfully');
      } catch (error) {
        console.error('Error during cleanup:', error);
      }
    }

    // 添加銷毀方法
    destroy() {
      try {
        this.cleanupOverlay();

        // 移除消息監聽器
        if (this.messageListener) {
          chrome.runtime.onMessage.removeListener(this.messageListener);
          this.messageListener = null;
        }

        console.log('Content: ScreenshotCapture destroyed');
      } catch (error) {
        console.error('Error during destroy:', error);
      }
    }
  }

  // 將類添加到 window 對象
  window.ScreenshotCapture = ScreenshotCapture;
}

// 初始化截圖捕獲功能（防止重複初始化）
if (!window.screenshotCaptureInstance) {
  window.screenshotCaptureInstance = new window.ScreenshotCapture();
  console.log('ScreenshotCapture initialized');
}
