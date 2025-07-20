/**
 * 性能监控器 - 收集和分析扩展性能指标
 * 用于优化用户体验和识别性能瓶颈
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.timers = new Map();
    this.enabled = true;
    this.maxMetrics = 1000; // 最大保存指标数量
    
    // 性能阈值
    this.thresholds = {
      domExtraction: 200,    // DOM提取应在200ms内完成
      languageDetection: 50, // 语言检测应在50ms内完成
      translation: 2000,     // 翻译应在2秒内完成
      uiResponse: 100        // UI响应应在100ms内
    };
    
    this.init();
  }

  /**
   * 初始化性能监控
   */
  init() {
    // 监听页面性能事件
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.reportSummary();
      });
    }
    
    // 定期清理旧指标
    setInterval(() => {
      this.cleanupOldMetrics();
    }, 60000); // 每分钟清理一次
  }

  /**
   * 开始计时
   * @param {string} name - 指标名称
   * @param {Object} metadata - 元数据
   */
  startTimer(name, metadata = {}) {
    if (!this.enabled) return;
    
    const timer = {
      name,
      startTime: performance.now(),
      metadata,
      id: this.generateId()
    };
    
    this.timers.set(name, timer);
    console.debug(`PerformanceMonitor: Started timer for ${name}`);
  }

  /**
   * 结束计时并记录指标
   * @param {string} name - 指标名称
   * @param {Object} additionalData - 额外数据
   * @returns {number} 耗时（毫秒）
   */
  endTimer(name, additionalData = {}) {
    if (!this.enabled) return 0;
    
    const timer = this.timers.get(name);
    if (!timer) {
      console.warn(`PerformanceMonitor: No timer found for ${name}`);
      return 0;
    }
    
    const endTime = performance.now();
    const duration = endTime - timer.startTime;
    
    // 记录指标
    this.recordMetric(name, duration, {
      ...timer.metadata,
      ...additionalData,
      timestamp: Date.now()
    });
    
    // 检查是否超过阈值
    this.checkThreshold(name, duration);
    
    this.timers.delete(name);
    console.debug(`PerformanceMonitor: ${name} completed in ${duration.toFixed(2)}ms`);
    
    return duration;
  }

  /**
   * 记录指标
   * @param {string} name - 指标名称
   * @param {number} value - 指标值
   * @param {Object} metadata - 元数据
   */
  recordMetric(name, value, metadata = {}) {
    if (!this.enabled) return;
    
    const metric = {
      name,
      value,
      metadata,
      timestamp: Date.now(),
      id: this.generateId()
    };
    
    // 使用时间戳作为键，确保唯一性
    const key = `${name}_${metric.timestamp}_${metric.id}`;
    this.metrics.set(key, metric);
    
    // 限制指标数量
    if (this.metrics.size > this.maxMetrics) {
      this.cleanupOldMetrics();
    }
  }

  /**
   * 检查性能阈值
   * @param {string} name - 指标名称
   * @param {number} duration - 耗时
   */
  checkThreshold(name, duration) {
    const threshold = this.thresholds[name];
    if (threshold && duration > threshold) {
      console.warn(`PerformanceMonitor: ${name} exceeded threshold (${duration.toFixed(2)}ms > ${threshold}ms)`);
      
      // 记录性能警告
      this.recordMetric(`${name}_warning`, duration, {
        threshold,
        exceeded: duration - threshold,
        severity: duration > threshold * 2 ? 'high' : 'medium'
      });
    }
  }

  /**
   * 获取指标统计
   * @param {string} name - 指标名称
   * @param {number} timeRange - 时间范围（毫秒）
   * @returns {Object} 统计信息
   */
  getMetricStats(name, timeRange = 300000) { // 默认5分钟
    const now = Date.now();
    const cutoff = now - timeRange;
    
    const relevantMetrics = Array.from(this.metrics.values())
      .filter(metric => 
        metric.name === name && 
        metric.timestamp >= cutoff
      );
    
    if (relevantMetrics.length === 0) {
      return null;
    }
    
    const values = relevantMetrics.map(m => m.value);
    const sorted = values.sort((a, b) => a - b);
    
    return {
      count: values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      median: sorted[Math.floor(sorted.length / 2)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)]
    };
  }

  /**
   * 获取所有指标的摘要
   * @returns {Object} 摘要信息
   */
  getSummary() {
    const metricNames = [...new Set(Array.from(this.metrics.values()).map(m => m.name))];
    const summary = {};
    
    for (const name of metricNames) {
      summary[name] = this.getMetricStats(name);
    }
    
    return {
      summary,
      totalMetrics: this.metrics.size,
      activeTimers: this.timers.size,
      uptime: Date.now() - this.startTime
    };
  }

  /**
   * 报告性能摘要
   */
  reportSummary() {
    if (!this.enabled) return;
    
    const summary = this.getSummary();
    console.group('📊 Performance Summary');
    console.table(summary.summary);
    console.log('Total metrics collected:', summary.totalMetrics);
    console.log('Active timers:', summary.activeTimers);
    console.groupEnd();
    
    // 可以发送到分析服务
    this.sendToAnalytics(summary);
  }

  /**
   * 发送数据到分析服务（示例）
   * @param {Object} data - 数据
   */
  sendToAnalytics(data) {
    // 这里可以集成Google Analytics、Mixpanel等
    // 为了隐私考虑，只发送聚合数据，不发送个人信息
    
    try {
      // 示例：发送到自定义分析端点
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        chrome.runtime.sendMessage({
          action: 'reportPerformance',
          data: {
            // 只发送聚合统计，保护用户隐私
            metrics: Object.keys(data.summary).reduce((acc, key) => {
              const stats = data.summary[key];
              if (stats) {
                acc[key] = {
                  count: stats.count,
                  avg: Math.round(stats.avg),
                  p95: Math.round(stats.p95)
                };
              }
              return acc;
            }, {}),
            timestamp: Date.now(),
            version: chrome.runtime.getManifest().version
          }
        });
      }
    } catch (error) {
      console.debug('Analytics reporting failed:', error);
    }
  }

  /**
   * 清理旧指标
   */
  cleanupOldMetrics() {
    const now = Date.now();
    const maxAge = 3600000; // 1小时
    const cutoff = now - maxAge;
    
    let cleaned = 0;
    for (const [key, metric] of this.metrics.entries()) {
      if (metric.timestamp < cutoff) {
        this.metrics.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.debug(`PerformanceMonitor: Cleaned ${cleaned} old metrics`);
    }
  }

  /**
   * 生成唯一ID
   * @returns {string} 唯一ID
   */
  generateId() {
    return Math.random().toString(36).substr(2, 9);
  }

  /**
   * 启用/禁用监控
   * @param {boolean} enabled - 是否启用
   */
  setEnabled(enabled) {
    this.enabled = enabled;
    console.log(`PerformanceMonitor: ${enabled ? 'Enabled' : 'Disabled'}`);
  }

  /**
   * 设置性能阈值
   * @param {string} name - 指标名称
   * @param {number} threshold - 阈值（毫秒）
   */
  setThreshold(name, threshold) {
    this.thresholds[name] = threshold;
    console.log(`PerformanceMonitor: Set threshold for ${name} to ${threshold}ms`);
  }

  /**
   * 获取实时性能信息
   * @returns {Object} 实时信息
   */
  getRealTimeInfo() {
    return {
      memoryUsage: this.getMemoryUsage(),
      activeTimers: this.timers.size,
      totalMetrics: this.metrics.size,
      recentActivity: this.getRecentActivity()
    };
  }

  /**
   * 获取内存使用情况
   * @returns {Object} 内存信息
   */
  getMemoryUsage() {
    if (typeof performance !== 'undefined' && performance.memory) {
      return {
        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
      };
    }
    return null;
  }

  /**
   * 获取最近活动
   * @returns {Array} 最近的指标
   */
  getRecentActivity() {
    const now = Date.now();
    const recent = Array.from(this.metrics.values())
      .filter(metric => now - metric.timestamp < 60000) // 最近1分钟
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10);
    
    return recent;
  }
}

// 创建全局实例
const performanceMonitor = new PerformanceMonitor();

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = performanceMonitor;
} else if (typeof window !== 'undefined') {
  window.performanceMonitor = performanceMonitor;
}

export default performanceMonitor;
