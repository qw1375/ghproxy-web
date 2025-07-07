// 代理节点检查器类
class ProxyChecker {
  constructor() {
    this.cacheKey = 'proxyLatencyCache';
    this.currentMirrorKey = 'currentMirror'; // 存储上次使用的节点
    this.cacheExpiry = 30 * 60 * 1000; // 缓存延迟检测结果 30 分钟
    this.mirrorChecker = window.MirrorChecker ? new window.MirrorChecker() : null;
  }

  // 从缓存中获取延迟检测结果
  getCachedResults() {
    const cachedData = localStorage.getItem(this.cacheKey);
    if (!cachedData) return null;

    const { timestamp, results } = JSON.parse(cachedData);
    if (Date.now() - timestamp < this.cacheExpiry) {
      // 标准化缓存结果中的URL以确保一致性
      return results.map(result => {
        try {
          return { ...result, url: new URL(result.url).href };
        } catch (e) {
          console.error('标准化缓存URL失败:', result.url, e);
          return result;
        }
      });
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
      // 标准化URL以确保一致性
      const normalizedUrl = new URL(result.mirror).href;
      return {
        url: normalizedUrl,
        latency: result.time,
        success: result.success,
        error: result.success ? null : 'error'
      };
    } catch (error) {
      // console.error('测试节点延迟失败:', error);
      // 标准化URL以确保一致性
      const normalizedUrl = new URL(mirror.value).href;
      return {
        url: normalizedUrl,
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

  // 选择代理节点
  selectProxy(hostname, url) {
    window.currentProxy = hostname;
    document.getElementById('selected-proxy').textContent = hostname;
    try {
      // 标准化URL以处理 trailing slash 等情况
      const normalizedUrl = new URL(url).href;
      localStorage.setItem(this.currentMirrorKey, normalizedUrl);
    } catch (e) {
      console.error('存储上次使用节点失败: 无效的URL', url, e);
      // 清除无效的存储值
      localStorage.removeItem(this.currentMirrorKey);
    }
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

        // 检查是否为上次使用的节点
        const currentMirror = localStorage.getItem(this.currentMirrorKey);
        let isLastUsed = false;
        if (currentMirror) {
          try {
            const normalizedResultUrl = new URL(result.url).href;
            isLastUsed = normalizedResultUrl === currentMirror;
          } catch (e) {
            isLastUsed = false;
          }
        }
          return `
            <button class="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex justify-between items-center ${hostname === window.currentProxy ? 'bg-gray-200 dark:bg-gray-600 font-medium' : ''}"
                    onclick="window.proxyChecker.selectProxy('${hostname}', '${result.url}')">
              <div class="flex flex-col">
                <span>${hostname}</span>
                ${isLastUsed ? '<span class="bg-[#F2F3F5] text-gray-700 px-2 py-0.5 rounded text-xs mt-1 inline-block text-center">上次使用</span>' : ''}
              </div>
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
          // 对缓存结果应用上次使用节点优先逻辑
          let processedResults = [...cachedResults];
          const currentMirror = localStorage.getItem(this.currentMirrorKey);
          let currentMirrorFound = false;
          
          if (currentMirror) {
            const index = processedResults.findIndex(result => {
              try {
                return new URL(result.url).href === currentMirror && result.success;
              } catch (e) {
                return false;
              }
            });
            
            if (index > -1) {
              currentMirrorFound = true;
              const [lastUsedNode] = processedResults.splice(index, 1);
              processedResults.unshift(lastUsedNode);
            }
          }
          
          // 如果currentMirror存在但未在缓存结果中找到，强制刷新
          if (currentMirror && !currentMirrorFound) {
            this.init(true);
            return;
          }
          
          window.currentProxy = new URL(processedResults[0].url).hostname;
          // 如果currentMirror不存在，保存缓存结果中的第一个节点作为默认上次使用节点
          if (!localStorage.getItem(this.currentMirrorKey)) {
            try {
              const normalizedDefaultUrl = new URL(processedResults[0].url).href;
              localStorage.setItem(this.currentMirrorKey, normalizedDefaultUrl);
            } catch (e) {
              console.error('存储默认缓存节点失败: 无效的URL', processedResults[0].url, e);
            }
          }
          
          this.updateDropdownOptions(processedResults);
          window.currentProxy = new URL(processedResults[0].url).hostname;
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

      let sortedResults = this.sortNodesByLatency(results);
      
      // 检查并调整上次使用的节点到首位
      const currentMirror = localStorage.getItem(this.currentMirrorKey);
      if (currentMirror) {
        const index = sortedResults.findIndex(result => {
          try {
            return new URL(result.url).href === currentMirror && result.success;
          } catch (e) {
            return false;
          }
        });
        if (index > -1) {
          // 将上次使用的节点移到第一个位置
          const [lastUsedNode] = sortedResults.splice(index, 1);
          sortedResults.unshift(lastUsedNode);
        }
      }
      
      // // 调试：输出所有节点的测试结果
      // console.log('所有节点测试结果:', sortedResults.map(result => ({
      //   url: result.url,
      //   latency: result.success ? result.latency : 'error',
      //   success: result.success
      // })));
      
      // 保存默认选中节点到缓存
      try {
        const normalizedDefaultUrl = new URL(sortedResults[0].url).href;
        localStorage.setItem(this.currentMirrorKey, normalizedDefaultUrl);
      } catch (e) {
        console.error('存储默认节点失败: 无效的URL', sortedResults[0].url, e);
        localStorage.removeItem(this.currentMirrorKey);
      }

      // 设置默认选中的代理为延迟最低的节点
      window.currentProxy = new URL(sortedResults[0].url).hostname;
      document.getElementById('selected-proxy').textContent = window.currentProxy;
      this.updateDropdownOptions(sortedResults);

      // 缓存结果
      localStorage.setItem(this.cacheKey, JSON.stringify({
        timestamp: Date.now(),
        results: sortedResults
      }));
    } catch (error) {
      console.error('初始化代理选项失败:', error);
      // 生成默认的下拉菜单并标准化URL
      this.updateDropdownOptions(
        window.mirrors.map(url => {
          try {
            const normalizedUrl = new URL(url).href;
            return {
              url: normalizedUrl,
              latency: Infinity,
              success: false,
              error: 'error'
            };
          } catch (e) {
            console.error('无效的镜像URL:', url, e);
            return {
              url: url,
              latency: Infinity,
              success: false,
              error: 'invalid_url'
            };
          }
        })
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