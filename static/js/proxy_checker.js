// 代理节点检查器类
class ProxyChecker {
  constructor() {
    this.cacheKey = 'proxyLatencyCache';
    this.selectedProxyCacheKey = 'selectedProxyCache';
    this.cacheExpiry = 30 * 60 * 1000; // 缓存延迟检测结果 30 分钟
    this.mirrorChecker = window.MirrorChecker ? new window.MirrorChecker() : null;
  }

  // 获取默认代理源
  getDefaultProxy() {
    return window.defaultProxy || "https://gh.llkk.cc";
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

  // 获取用户选择的代理源
  getSelectedProxy() {
    const cachedData = localStorage.getItem(this.selectedProxyCacheKey);
    if (!cachedData) return null;
    
    try {
      return JSON.parse(cachedData);
    } catch (error) {
      return null;
    }
  }

  // 保存用户选择的代理源
  setSelectedProxy(hostname, url) {
    const proxyData = {
      hostname: hostname,
      url: url,
      timestamp: Date.now()
    };
    localStorage.setItem(this.selectedProxyCacheKey, JSON.stringify(proxyData));
  }

  // 立即更新下拉菜单选中状态
  updateDropdownSelection() {
    const dropdown = document.getElementById('proxy-dropdown');
    if (!dropdown || dropdown.classList.contains('hidden')) {
      return;
    }

    const selectedProxy = this.getSelectedProxy();
    if (!selectedProxy) return;

    const buttons = dropdown.querySelectorAll('button');
    buttons.forEach(button => {
      const span = button.querySelector('span.flex');
      if (!span) return;
      
      // 从onclick属性中提取hostname
      const onclickAttr = button.getAttribute('onclick');
      const hostnameMatch = onclickAttr.match(/selectProxy\('([^']+)'/);
      if (!hostnameMatch) return;
      
      const hostname = hostnameMatch[1];
      const isSelected = hostname === selectedProxy.hostname;
      
      // 更新选中状态的显示
      span.innerHTML = `
        ${isSelected ? `
          <svg class="w-4 h-4 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
          </svg>
        ` : '<span class="w-4 h-4 mr-2"></span>'}
        ${hostname}
      `;
    });
  }

  // 选择节点后立即更新下拉菜单 - Checker 类调用
  updateDropdownAfterSelection(hostname, url) {
    // 更新缓存的选择
    this.setSelectedProxy(hostname, url);
    
    // 获取当前的延迟检测结果
    const cachedResults = this.getCachedResults();
    if (cachedResults) {
      // 如果有缓存结果，立即更新下拉菜单
      this.updateDropdownOptions(cachedResults);
    } else {
      // 如果没有缓存结果，重新生成初始下拉菜单
      this.generateInitialDropdown();
    }
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
    const selectedProxy = this.getSelectedProxy();
    const currentSelectedUrl = selectedProxy ? selectedProxy.url : this.getDefaultProxy();
    
    // 确保当前选中的代理源在第一位
    const reorderedResults = [...sortedResults];
    const selectedIndex = reorderedResults.findIndex(result => result.url === currentSelectedUrl);
    
    if (selectedIndex > 0) {
      const selectedResult = reorderedResults.splice(selectedIndex, 1)[0];
      reorderedResults.unshift(selectedResult);
    } else if (selectedIndex === -1) {
        // 如果当前选中的代理源不在检测结果中，添加到第一位
        const selectedHostname = window.extractHostname ? window.extractHostname(currentSelectedUrl) : new URL(currentSelectedUrl).hostname;
        reorderedResults.unshift({
          url: currentSelectedUrl,
          latency: Infinity,
          success: false,
          error: '已选择'
        });
      }
    
    dropdown.innerHTML = `
      <div class="py-1">
        ${reorderedResults.map((result, index) => {
          const hostname = window.extractHostname ? window.extractHostname(result.url) : new URL(result.url).hostname;
          const latency = Math.round(result.latency);
          const isCurrentSelected = result.url === currentSelectedUrl;
          let backgroundColor = '#F2F3F5'; // 默认背景色
          let color = '#1D2129'; // 默认文字颜色
          let latencyText = result.success ? `${latency} ms` : result.error || 'error';

          // 如果是当前选中的项目，使用特殊样式
          if (isCurrentSelected) {
            backgroundColor = '#E8F4FD';
            color = '#1890FF';
            latencyText = result.success ? `${latency} ms` : '已选择';
          } else if (result.success) {
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
              <span class="flex items-center">
                ${isCurrentSelected ? `
                  <svg class="w-4 h-4 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                  </svg>
                ` : '<span class="w-4 h-4 mr-2"></span>'}
                ${hostname}
              </span>
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
    // 立即设置初始显示，避免显示"加载节点..."
    this.initializeWithDefault();
    
    // 在后台异步执行延迟检测
    this.performLatencyCheck(forceRefresh);
  }

  // 立即初始化显示
  initializeWithDefault() {
    // 检查用户之前的选择
    const selectedProxy = this.getSelectedProxy();
    
    if (selectedProxy) {
      // 使用用户之前选择的代理源
      window.defaultHostname = window.extractHostname ? window.extractHostname(selectedProxy.url) : selectedProxy.hostname;
      document.getElementById('selected-proxy').textContent = selectedProxy.hostname;
    } else {
      // 使用默认代理源
      const defaultProxy = this.getDefaultProxy();
      const defaultHostname = window.extractHostname ? window.extractHostname(defaultProxy) : new URL(defaultProxy).hostname;
      window.defaultHostname = defaultHostname;
      document.getElementById('selected-proxy').textContent = defaultHostname;
      // 保存默认选择
      this.setSelectedProxy(defaultHostname, defaultProxy);
    }

    // 生成初始下拉菜单（显示检测中状态）
    this.generateInitialDropdown();
  }

  // 生成初始下拉菜单
  generateInitialDropdown() {
    const dropdown = document.getElementById('proxy-dropdown');
    const selectedProxy = this.getSelectedProxy();
    const selectedUrl = selectedProxy ? selectedProxy.url : this.getDefaultProxy();
    
    // 将选中的代理源放在第一位
    const sortedMirrors = [...window.mirrors];
    const selectedIndex = sortedMirrors.indexOf(selectedUrl);
    if (selectedIndex > 0) {
      sortedMirrors.splice(selectedIndex, 1);
      sortedMirrors.unshift(selectedUrl);
    } else if (selectedIndex === -1 && selectedUrl === this.getDefaultProxy()) {
      sortedMirrors.unshift(selectedUrl);
    }
    
    dropdown.innerHTML = `
      <div class="py-1">
        ${sortedMirrors.map(url => {
          const hostname = window.extractHostname ? window.extractHostname(url) : new URL(url).hostname;
          const isSelected = url === selectedUrl;
          
          return `
             <button class="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex justify-between items-center"
                     onclick="selectProxy('${hostname}', '${url}')">
               <span class="flex items-center">
                 ${isSelected ? `
                   <svg class="w-4 h-4 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                     <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                   </svg>
                 ` : '<span class="w-4 h-4 mr-2"></span>'}
                 ${hostname}
               </span>
               <span class="inline-flex items-center justify-center w-20 h-6 rounded" style="background-color: #F2F3F5; color: #1D2129">
                 ${isSelected ? '已选择' : '检测中...'}
               </span>
             </button>
           `;
        }).join('')}
      </div>
    `;
  }

  // 后台执行延迟检测
  async performLatencyCheck(forceRefresh = false) {
    let results;
    try {
      // 检查缓存，除非强制刷新
      if (!forceRefresh) {
        const cachedResults = this.getCachedResults();
        if (cachedResults) {
          this.updateDropdownOptions(cachedResults);
          return;
        }
      }

      // 测试所有节点
      results = await Promise.all(
        window.mirrors.map(mirror => this.testNodeLatency({
          value: mirror,
          text: window.extractHostname ? window.extractHostname(mirror) : new URL(mirror).hostname
        }))
      );

      const sortedResults = this.sortNodesByLatency(results);
      
      this.updateDropdownOptions(sortedResults);

      // 缓存结果
      localStorage.setItem(this.cacheKey, JSON.stringify({
        timestamp: Date.now(),
        results: sortedResults
      }));
    } catch (error) {
      console.error('延迟检测失败:', error);
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