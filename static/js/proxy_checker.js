// 代理节点检查器类
class ProxyChecker {
  constructor() {
    this.cacheKey = 'proxyLatencyCache';
    this.cacheExpiry = 30 * 60 * 1000; // 缓存延迟检测结果 30 分钟
    this.mirrorChecker = window.MirrorChecker ? new window.MirrorChecker() : null;
  }

  // 从缓存中获取延迟检测结果
  getCachedResults() {
    const cachedData = localStorage.getItem(this.cacheKey);
    if (!cachedData) return null;

    const { timestamp, results } = JSON.parse(cachedData);
    if (Date.now() - timestamp < this.cacheExpiry) {
      return results;
    }
    return null;
  }

  // 测试节点延迟
  async testNodeLatency(mirror) {
    try {
      if (!this.mirrorChecker) {
        throw new Error('MirrorChecker not initialized');
      }

      const result = await this.mirrorChecker.testMirror(mirror);
      return {
        url: result.mirror,
        latency: result.time,
        success: result.success,
        error: result.success ? null : 'error'
      };
    } catch (error) {
      // console.error('测试节点延迟失败:', error);
      return {
        url: mirror.value,
        latency: Infinity,
        success: false,
        error: error.message || 'error'
      };
    }
  }

  // 排序节点
  sortNodesByLatency(results) {
    return results.sort((a, b) => a.latency - b.latency);
  }

  // 生成下拉菜单选项
  updateDropdownOptions(sortedResults) {
    const dropdown = document.getElementById('proxy-dropdown');
    dropdown.innerHTML = `
      <div class="py-1">
        ${sortedResults.map(result => {
          const hostname = new URL(result.url).hostname;
          const latency = Math.round(result.latency);
          let backgroundColor = '#F2F3F5'; // 默认背景色
          let color = '#1D2129'; // 默认文字颜色
          let latencyText = result.success ? `${latency} ms` : result.error || 'error';

          if (result.success) {
            if (latency < 500) {
              backgroundColor = '#E8FFEA';
              color = '#00B42A';
            } else if (latency < 1000) {
              backgroundColor = '#FFF7E8';
              color = '#FF7F00';
            } else {
              backgroundColor = '#FFECE8';
              color = '#F53F3F';
            }
          }

          return `
            <button class="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex justify-between items-center"
                    onclick="selectProxy('${hostname}', '${result.url}')">
              <span>${hostname}</span>
              <span class="inline-flex items-center justify-center w-20 h-6 rounded" style="background-color: ${backgroundColor}; color: ${color}">
                ${latencyText}
              </span>
            </button>
          `;
        }).join('')}
      </div>
    `;
  }

  // 初始化代理选项
  async init(forceRefresh = false) {
    let results;
    try {
      // 检查缓存，除非强制刷新
      if (!forceRefresh) {
        const cachedResults = this.getCachedResults();
        if (cachedResults) {
          this.updateDropdownOptions(cachedResults);
          window.currentProxy = new URL(cachedResults[0].url).hostname;
          document.getElementById('selected-proxy').textContent = window.currentProxy;
          return;
        }
      }

      // 测试所有节点
      results = await Promise.all(
        window.mirrors.map(mirror => this.testNodeLatency({
          value: mirror,
          text: new URL(mirror).hostname
        }))
      );

      const sortedResults = this.sortNodesByLatency(results);
      
      // // 调试：输出所有节点的测试结果
      // console.log('所有节点测试结果:', sortedResults.map(result => ({
      //   url: result.url,
      //   latency: result.success ? result.latency : 'error',
      //   success: result.success
      // })));
      
      this.updateDropdownOptions(sortedResults);

      // 设置默认选中的代理为延迟最低的节点
      window.currentProxy = new URL(sortedResults[0].url).hostname;
      document.getElementById('selected-proxy').textContent = window.currentProxy;

      // 缓存结果
      localStorage.setItem(this.cacheKey, JSON.stringify({
        timestamp: Date.now(),
        results: sortedResults
      }));
    } catch (error) {
      console.error('初始化代理选项失败:', error);
      // 如果延迟检测失败，生成默认的下拉菜单
      this.updateDropdownOptions(
        window.mirrors.map(url => ({
          url,
          latency: Infinity,
          success: false,
          error: 'error'
        }))
      );
    }
  }
}

// 初始化实例并绑定到 window 对象
document.addEventListener('DOMContentLoaded', () => {
  if (!window.proxyChecker) {
    window.proxyChecker = new ProxyChecker();
    window.proxyChecker.init();
  }
});