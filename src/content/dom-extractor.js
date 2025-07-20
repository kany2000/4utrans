/**
 * DOM文字提取器 - 负责从网页DOM结构中精确提取文字内容
 * 优化版本：模块化、缓存、性能优化
 */

class DOMExtractor {
  constructor() {
    this.cache = new Map();
    this.maxCacheSize = 100;
    this.excludeSelectors = [
      'script', 'style', 'noscript', 'iframe', 'object', 'embed',
      '.screenshot-overlay', '.screenshot-selection', '.screenshot-instruction'
    ];
  }

  /**
   * 从指定区域提取文字内容
   * @param {Object} rect - 选择区域坐标
   * @returns {Promise<string>} 提取的文字内容
   */
  async extractTextFromArea(rect) {
    try {
      console.log('DOMExtractor: Starting text extraction for area:', rect);
      
      // 生成采样点
      const samplePoints = this.generateSamplePoints(rect);
      const foundTexts = new Set();
      
      // 多点采样提取文字
      for (const point of samplePoints) {
        const elements = this.getElementsAtPoint(point);
        
        for (const element of elements) {
          if (this.shouldSkipElement(element)) continue;
          
          const elementRect = element.getBoundingClientRect();
          if (this.isElementInArea(elementRect, rect)) {
            const text = this.extractElementText(element);
            if (this.isValidText(text)) {
              foundTexts.add(text);
            }
          }
        }
      }
      
      const combinedText = this.combineTexts(foundTexts);
      console.log('DOMExtractor: Extraction completed:', combinedText);
      
      return combinedText;
    } catch (error) {
      console.error('DOMExtractor: Extraction failed:', error);
      return '';
    }
  }

  /**
   * 生成采样点
   * @param {Object} rect - 选择区域
   * @returns {Array} 采样点数组
   */
  generateSamplePoints(rect) {
    const points = [];
    const { left, top, width, height } = rect;
    
    // 智能采样：根据区域大小调整采样密度
    const density = Math.min(Math.max(width * height / 10000, 9), 25);
    const cols = Math.ceil(Math.sqrt(density));
    const rows = Math.ceil(density / cols);
    
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        points.push({
          x: left + (width * (j + 0.5)) / cols,
          y: top + (height * (i + 0.5)) / rows
        });
      }
    }
    
    return points;
  }

  /**
   * 获取指定点的元素（带缓存）
   * @param {Object} point - 坐标点
   * @returns {Array} 元素数组
   */
  getElementsAtPoint(point) {
    const cacheKey = `${Math.round(point.x)},${Math.round(point.y)}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    const elements = document.elementsFromPoint(point.x, point.y);
    this.setCacheValue(cacheKey, elements);
    
    return elements;
  }

  /**
   * 设置缓存值（带大小限制）
   * @param {string} key - 缓存键
   * @param {*} value - 缓存值
   */
  setCacheValue(key, value) {
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  /**
   * 检查是否应该跳过元素
   * @param {Element} element - DOM元素
   * @returns {boolean} 是否跳过
   */
  shouldSkipElement(element) {
    // 检查是否为排除的元素类型
    if (this.excludeSelectors.some(selector => element.matches?.(selector))) {
      return true;
    }
    
    // 检查是否为覆盖层元素
    if (this.isOverlayElement(element)) {
      return true;
    }
    
    // 检查元素可见性
    if (!this.isElementVisible(element)) {
      return true;
    }
    
    return false;
  }

  /**
   * 检查是否为覆盖层元素
   * @param {Element} element - DOM元素
   * @returns {boolean} 是否为覆盖层
   */
  isOverlayElement(element) {
    let current = element;
    while (current && current !== document.body) {
      if (current.classList?.contains('screenshot-overlay') ||
          current.classList?.contains('screenshot-selection') ||
          current.classList?.contains('screenshot-instruction')) {
        return true;
      }
      current = current.parentElement;
    }
    return false;
  }

  /**
   * 检查元素是否可见
   * @param {Element} element - DOM元素
   * @returns {boolean} 是否可见
   */
  isElementVisible(element) {
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           style.opacity !== '0';
  }

  /**
   * 检查元素是否在指定区域内
   * @param {DOMRect} elementRect - 元素矩形
   * @param {Object} targetRect - 目标区域
   * @returns {boolean} 是否在区域内
   */
  isElementInArea(elementRect, targetRect) {
    const overlap = this.calculateOverlap(elementRect, targetRect);
    const elementArea = elementRect.width * elementRect.height;
    const overlapRatio = elementArea > 0 ? overlap / elementArea : 0;
    
    // 元素至少50%在选中区域内
    return overlapRatio >= 0.5;
  }

  /**
   * 计算重叠面积
   * @param {DOMRect} rect1 - 矩形1
   * @param {Object} rect2 - 矩形2
   * @returns {number} 重叠面积
   */
  calculateOverlap(rect1, rect2) {
    const left = Math.max(rect1.left, rect2.left);
    const right = Math.min(rect1.right, rect2.left + rect2.width);
    const top = Math.max(rect1.top, rect2.top);
    const bottom = Math.min(rect1.bottom, rect2.top + rect2.height);
    
    if (left < right && top < bottom) {
      return (right - left) * (bottom - top);
    }
    return 0;
  }

  /**
   * 提取元素文字内容
   * @param {Element} element - DOM元素
   * @returns {string} 文字内容
   */
  extractElementText(element) {
    const tagName = element.tagName.toLowerCase();
    
    // 针对不同元素类型使用不同策略
    switch (tagName) {
      case 'input':
        if (['button', 'submit', 'reset'].includes(element.type)) {
          return element.value || element.getAttribute('value') || '';
        }
        return element.value || element.placeholder || '';
        
      case 'button':
      case 'a':
        return element.innerText || element.textContent || '';
        
      case 'img':
        return element.alt || element.title || '';
        
      case 'select':
        const selected = element.selectedOptions[0];
        return selected ? selected.textContent : '';
        
      default:
        return element.innerText || element.textContent || '';
    }
  }

  /**
   * 验证文字是否有效
   * @param {string} text - 文字内容
   * @returns {boolean} 是否有效
   */
  isValidText(text) {
    if (!text || typeof text !== 'string') return false;
    
    const trimmed = text.trim();
    
    // 长度检查
    if (trimmed.length < 1 || trimmed.length > 1000) return false;
    
    // 过滤纯数字、纯符号等无意义内容
    if (/^[\d\s\-_=+\[\]{}()\.,;:!?'"]*$/.test(trimmed)) return false;
    
    // 过滤CSS类名、ID等
    if (/^[a-zA-Z0-9\-_]+$/.test(trimmed) && trimmed.length < 3) return false;
    
    return true;
  }

  /**
   * 合并多个文字片段
   * @param {Set} textSet - 文字集合
   * @returns {string} 合并后的文字
   */
  combineTexts(textSet) {
    if (textSet.size === 0) return '';
    
    const texts = Array.from(textSet)
      .filter(text => text.trim().length > 0)
      .sort((a, b) => b.length - a.length); // 按长度排序，优先选择较长的文字
    
    // 去重：移除被其他文字包含的短文字
    const uniqueTexts = [];
    for (const text of texts) {
      const isContained = uniqueTexts.some(existing => 
        existing.includes(text) || text.includes(existing)
      );
      if (!isContained) {
        uniqueTexts.push(text);
      }
    }
    
    return uniqueTexts.join(' ').trim();
  }

  /**
   * 清理缓存
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * 获取缓存统计信息
   * @returns {Object} 缓存统计
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxCacheSize,
      usage: (this.cache.size / this.maxCacheSize * 100).toFixed(1) + '%'
    };
  }
}

// 导出单例
const domExtractor = new DOMExtractor();
export default domExtractor;
