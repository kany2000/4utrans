/**
 * 智能语言检测器 - 基于字符特征和语法模式的高精度语言识别
 * 优化版本：算法优化、缓存机制、准确率提升
 */

class LanguageDetector {
  constructor() {
    this.cache = new Map();
    this.maxCacheSize = 50;
    
    // 字符特征模式
    this.patterns = {
      // 日文特征
      japanese: {
        hiragana: /[\u3040-\u309F]/,
        katakana: /[\u30A0-\u30FF]/,
        kanji: /[\u4E00-\u9FAF]/,
        fullwidth: /[\uFF00-\uFFEF]/,
        particles: /[はがをにでとからまでより]/,
        weight: 0.95
      },
      
      // 韩文特征
      korean: {
        hangul: /[\uAC00-\uD7AF]/,
        jamo: /[\u1100-\u11FF\u3130-\u318F]/,
        weight: 0.98
      },
      
      // 中文特征
      chinese: {
        simplified: /[\u4E00-\u9FFF]/,
        traditional: /[\u4E00-\u9FFF]/,
        punctuation: /[，。！？；：""''（）【】]/,
        weight: 0.85
      },
      
      // 英文特征
      english: {
        alphabet: /[a-zA-Z]/,
        common_words: /\b(the|and|or|but|in|on|at|to|for|of|with|by)\b/i,
        contractions: /\b\w+[''](?:t|s|re|ve|ll|d|m)\b/i,
        weight: 0.90
      },
      
      // 法文特征
      french: {
        alphabet: /[a-zA-ZàâäéèêëïîôöùûüÿçÀÂÄÉÈÊËÏÎÔÖÙÛÜŸÇ]/,
        accents: /[àâäéèêëïîôöùûüÿç]/,
        articles: /\b(le|la|les|un|une|des|du|de|d')\b/i,
        weight: 0.88
      },
      
      // 德文特征
      german: {
        alphabet: /[a-zA-ZäöüßÄÖÜ]/,
        umlauts: /[äöüÄÖÜß]/,
        compounds: /\b\w{10,}\b/,
        articles: /\b(der|die|das|ein|eine|einen|einem|einer)\b/i,
        weight: 0.87
      },
      
      // 西班牙文特征
      spanish: {
        alphabet: /[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ]/,
        accents: /[áéíóúüñ]/,
        articles: /\b(el|la|los|las|un|una|unos|unas)\b/i,
        weight: 0.86
      }
    };
    
    // 语言代码映射
    this.languageCodes = {
      japanese: 'ja',
      korean: 'ko',
      chinese: 'zh',
      english: 'en',
      french: 'fr',
      german: 'de',
      spanish: 'es'
    };
  }

  /**
   * 检测文本语言
   * @param {string} text - 待检测文本
   * @returns {Object} 检测结果 {language, confidence, details}
   */
  detectLanguage(text) {
    if (!text || typeof text !== 'string') {
      return { language: 'unknown', confidence: 0, details: {} };
    }
    
    const cleanText = text.trim();
    if (cleanText.length === 0) {
      return { language: 'unknown', confidence: 0, details: {} };
    }
    
    // 检查缓存
    const cacheKey = this.generateCacheKey(cleanText);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    // 执行检测
    const result = this.performDetection(cleanText);
    
    // 缓存结果
    this.setCacheValue(cacheKey, result);
    
    return result;
  }

  /**
   * 执行语言检测
   * @param {string} text - 文本
   * @returns {Object} 检测结果
   */
  performDetection(text) {
    const scores = {};
    const details = {};
    
    // 计算每种语言的得分
    for (const [language, patterns] of Object.entries(this.patterns)) {
      const score = this.calculateLanguageScore(text, patterns);
      scores[language] = score;
      details[language] = score;
    }
    
    // 找出最高得分
    const sortedScores = Object.entries(scores)
      .sort(([,a], [,b]) => b - a);
    
    const [topLanguage, topScore] = sortedScores[0];
    const [secondLanguage, secondScore] = sortedScores[1] || ['', 0];
    
    // 计算置信度
    const confidence = this.calculateConfidence(topScore, secondScore, text.length);
    
    // 特殊处理：中文简繁体检测
    let finalLanguage = topLanguage;
    if (topLanguage === 'chinese') {
      const chineseVariant = this.detectChineseVariant(text);
      finalLanguage = chineseVariant;
    }
    
    const result = {
      language: this.languageCodes[finalLanguage] || 'unknown',
      confidence: confidence,
      details: {
        scores: scores,
        topCandidates: sortedScores.slice(0, 3),
        textLength: text.length,
        variant: finalLanguage === 'chinese' ? this.detectChineseVariant(text) : null
      }
    };
    
    console.log('LanguageDetector: Detection result:', result);
    return result;
  }

  /**
   * 计算语言得分
   * @param {string} text - 文本
   * @param {Object} patterns - 语言模式
   * @returns {number} 得分
   */
  calculateLanguageScore(text, patterns) {
    let score = 0;
    let totalChecks = 0;
    
    for (const [patternName, pattern] of Object.entries(patterns)) {
      if (patternName === 'weight') continue;
      
      totalChecks++;
      
      if (pattern instanceof RegExp) {
        const matches = text.match(new RegExp(pattern.source, 'g')) || [];
        const ratio = matches.length / Math.max(text.length / 10, 1);
        score += Math.min(ratio, 1);
      }
    }
    
    // 应用语言权重
    const weight = patterns.weight || 1;
    const normalizedScore = totalChecks > 0 ? (score / totalChecks) * weight : 0;
    
    return Math.min(normalizedScore, 1);
  }

  /**
   * 计算置信度
   * @param {number} topScore - 最高得分
   * @param {number} secondScore - 第二高得分
   * @param {number} textLength - 文本长度
   * @returns {number} 置信度 (0-1)
   */
  calculateConfidence(topScore, secondScore, textLength) {
    // 基础置信度基于最高得分
    let confidence = topScore;
    
    // 考虑与第二名的差距
    const gap = topScore - secondScore;
    confidence += gap * 0.3;
    
    // 文本长度影响置信度
    const lengthFactor = Math.min(textLength / 50, 1);
    confidence *= (0.7 + 0.3 * lengthFactor);
    
    // 阈值处理
    if (topScore < 0.3) {
      confidence *= 0.5; // 低分时降低置信度
    }
    
    return Math.min(Math.max(confidence, 0), 1);
  }

  /**
   * 检测中文变体（简体/繁体）
   * @param {string} text - 中文文本
   * @returns {string} 'zh-cn' | 'zh-tw'
   */
  detectChineseVariant(text) {
    // 简体中文特有字符
    const simplifiedChars = /[亿万与从众优国图书时间]/g;
    // 繁体中文特有字符
    const traditionalChars = /[億萬與從眾優國圖書時間]/g;
    
    const simplifiedMatches = (text.match(simplifiedChars) || []).length;
    const traditionalMatches = (text.match(traditionalChars) || []).length;
    
    if (traditionalMatches > simplifiedMatches) {
      return 'zh-tw';
    }
    return 'zh-cn';
  }

  /**
   * 生成缓存键
   * @param {string} text - 文本
   * @returns {string} 缓存键
   */
  generateCacheKey(text) {
    // 使用文本的哈希值作为缓存键
    const maxLength = 100;
    const sample = text.length > maxLength ? 
      text.substring(0, maxLength) : text;
    
    return this.simpleHash(sample);
  }

  /**
   * 简单哈希函数
   * @param {string} str - 字符串
   * @returns {string} 哈希值
   */
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转换为32位整数
    }
    return hash.toString(36);
  }

  /**
   * 设置缓存值
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
   * 批量检测多个文本
   * @param {Array<string>} texts - 文本数组
   * @returns {Array<Object>} 检测结果数组
   */
  detectMultiple(texts) {
    return texts.map(text => this.detectLanguage(text));
  }

  /**
   * 获取支持的语言列表
   * @returns {Array<string>} 语言代码数组
   */
  getSupportedLanguages() {
    return Object.values(this.languageCodes);
  }

  /**
   * 清理缓存
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * 获取缓存统计
   * @returns {Object} 缓存统计信息
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxCacheSize,
      hitRate: this.cacheHits / (this.cacheHits + this.cacheMisses) || 0
    };
  }
}

// 导出单例
const languageDetector = new LanguageDetector();
export default languageDetector;
