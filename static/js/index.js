// 默认代理源
let currentProxy = "github.akams.cn";

/**
 *
 * 辅助函数
 *
 */
// GitHub URL 校验
function validateGitHubUrl(url) {
  // GitHub URL 正则表达式 - 支持所有 GitHub 相关域名、子域名及 .git 链接
  const githubRegex = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)*(github(usercontent)?\.com)/i;
  return githubRegex.test(url);
}

// 生成代理 URL
function generateProxyUrl(url) {
  if (!url) return "";
  // 移除可能存在的协议前缀
  url = url.replace(/^(https?:\/\/)/, "");
  return `https://${currentProxy}/https://${url}`;
}

// 显示错误消息
function showError(message) {
  const input = document.querySelector("#github-url");
  input.classList.add("border-red-500", "focus:ring-red-500");

  // 显示错误消息
  const errorDiv = document.createElement("div");
  errorDiv.className = "text-red-500 text-sm mt-1";
  errorDiv.textContent = message;

  const existingError = input.parentNode.querySelector(".text-red-500");
  if (existingError) {
    existingError.remove();
  }

  input.parentNode.appendChild(errorDiv);

  // 3秒后清除错误状态
  setTimeout(() => {
    input.classList.remove("border-red-500", "focus:ring-red-500");
    errorDiv.remove();
  }, 3000);
}

// 复制到剪贴板
function copyToClipboard(text, button) {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      // 更新按钮状态
      const icon = button.querySelector("i");
      const span = button.querySelector("span");

      // 保存原始状态
      const originalIcon = "fas fa-copy";
      const originalText = "复制";

      // 更改为成功状态
      icon.className = "fas fa-check";
      span.textContent = "已复制";
      button.classList.add("copy-success");

      // 2秒后恢复原始状态
      setTimeout(() => {
        icon.className = originalIcon;
        span.textContent = originalText;
        button.classList.remove("copy-success");
      }, 2000);
    })
    .catch((err) => {
      console.error("复制失败:", err);
      button.classList.add("copy-error");

      setTimeout(() => {
        button.classList.remove("copy-error");
      }, 2000);
    });
}
// 处理下载事件
function handleDirectDownload() {
  // 获取输入的 URL
  const urlInput = document.querySelector("#github-url");
  const url = urlInput.value.trim();

  // 验证输入
  if (!url) {
    alert("请输入 GitHub 链接");
    return;
  }

  // 验证是否为有效的 GitHub URL
  // if (!validateGitHubUrl(url)) {
  //     alert('仅用于加速下载来自 GitHub 的资源！');
  //     return;
  // }
  if (url.toLowerCase().indexOf("github".toLowerCase()) < 0) {
    alert("仅用于加速下载来自 GitHub 的资源！");
    return;
  }

  // 生成代理 URL
  const proxyUrl = generateProxyUrl(url);

  // 在新窗口打开下载链接
  window.open(proxyUrl, "_blank");
}

/**
 *
 * 输入框下拉菜单
 *
 */
// 切换代理下拉菜单
function toggleProxyDropdown() {
  const dropdown = document.getElementById("proxy-dropdown");
  dropdown.classList.toggle("hidden");
}

// 动态更新选择的代理源到内容区域
function selectProxy(name, url) {
  document.getElementById("selected-proxy").textContent = name;
  // 更新当前代理源，移除 https:// 前缀
  currentProxy = new URL(url).hostname;
  document.getElementById("proxy-dropdown").classList.add("hidden");

  // 如果输入框有值，重新生成链接
  const urlInput = document.getElementById("github-url");
  if (urlInput.value.trim()) {
    updateProxyUrl();
  }
}

/**
 *
 * 选项卡功能
 *
 */

// 默认选项卡
let currentTab = "git-clone";

// 选项卡配置
const tabs = {
  "git-clone": {
    title: "Git Clone",
    content: "git clone https://github.akams.cn/https://github.com/user/repo.git",
    guide: "使用 Git Clone 方式下载仓库：\n1. 复制生成的命令\n2. 在终端中粘贴并执行\n3. 等待克隆完成",
  },
  "wget-curl": {
    title: "Wget && Curl",
    content:
      "wget https://github.akams.cn/https://github.com/user/repo/archive/master.zip\ncurl -O https://proxy.akams.cn/https://github.com/user/repo/archive/master.zip",
    guide: "使用 Wget 或 Curl 下载：\n1. 选择需要的下载命令\n2. 在终端中执行命令\n3. 文件将下载到当前目录",
  },
  "direct-download": {
    title: "Direct Download",
    content: "https://github.akams.cn/https://github.com/user/repo/archive/master.zip",
    guide: "直接在浏览器中下载：\n1. 复制生成的链接\n2. 在浏览器中打开或右键另存为\n3. 选择保存位置并下载",
  },
};
// 更新选项卡
function renderTabContent(tabId) {
  const hasInput = document.querySelector("#github-url").value.trim() !== "";
  const tabButtons = document.querySelectorAll("[data-tab]");
  const contentArea = document.querySelector("#tab-content");
  const indicator = document.querySelector("#tab-indicator");

  // 更新选项卡样式和滑动指示器位置
  tabButtons.forEach((button, index) => {
    if (button.dataset.tab === tabId) {
      button.classList.add("text-blue-500");
      button.classList.remove("text-gray-500");
      
      // 更新滑动指示器位置
      if (indicator) {
        const leftPosition = (index * 33.333) + "%";
        indicator.style.left = leftPosition;
      }
    } else {
      button.classList.remove("text-blue-500");
      button.classList.add("text-gray-500");
    }
  });

  // 更新内容
  if (hasInput) {
    if (tabId === "wget-curl") {
      const [wgetCmd, curlCmd] = tabs[tabId].content.split("\n");
      contentArea.innerHTML = `
                <div class="code-block">
                    <div class="code-content bg-gray-50 font-mono dark:text-gray-200">
                        <div class="text-center">${wgetCmd}</div>
                    </div>
                    <div class="copy-buttons">
                        <button class="copy-btn" onclick="copyToClipboard('${wgetCmd.replace(/'/g, "\\'")}', this)">
                            <i class="fas fa-copy"></i>
                            <span>复制</span>
                        </button>
                    </div>
                </div>
                <div class="code-block">
                    <div class="code-content bg-gray-50 font-mono dark:text-gray-200">
                        <div class="text-center">${curlCmd}</div>
                    </div>
                    <div class="copy-buttons">
                        <button class="copy-btn" onclick="copyToClipboard('${curlCmd.replace(/'/g, "\\'")}', this)">
                            <i class="fas fa-copy"></i>
                            <span>复制</span>
                        </button>
                    </div>
                </div>
            `;
    } else {
      contentArea.innerHTML = `
                <div class="code-block">
                    <div class="code-content bg-gray-50 font-mono dark:text-gray-200">
                        <div class="text-center">${tabs[tabId].content}</div>
                    </div>
                    <div class="copy-buttons">
                        <button class="copy-btn" onclick="copyToClipboard('${tabs[tabId].content.replace(
                          /'/g,
                          "\\'"
                        )}', this)">
                            <i class="fas fa-copy"></i>
                            <span>复制</span>
                        </button>
                    </div>
                </div>
            `;
    }
  } else {
    // 无输入时显示使用说明
    contentArea.innerHTML = `
            <div class="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-900/50 rounded-lg p-2">
                <div class="flex items-start space-x-3">
                    <div class="flex-shrink-0 pt-0.5">
                        <i class="fas fa-info-circle text-blue-400"></i>
                    </div>
                    <div class="flex-grow">
                        <p class="text-blue-700 dark:text-blue-200 text-sm leading-5">
                            ${tabs[tabId].guide}
                        </p>
                    </div>
                </div>
            </div>
        `;
  }
}
// 更新代理 URL
function updateProxyUrl() {
  const urlInput = document.querySelector("#github-url");
  const url = urlInput.value.trim();
  if (!url) {
    alert("请输入 GitHub 链接");
    return;
  }
  const proxyUrl = generateProxyUrl(url);
  // 更新所有选项卡的内容
  tabs["git-clone"].content = `git clone ${proxyUrl}`;
  tabs["wget-curl"].content = `wget ${proxyUrl}\ncurl -O ${proxyUrl}`;
  tabs["direct-download"].content = proxyUrl;
  // 更新当前选项卡显示
  renderTabContent(currentTab);
}



/**
 *
 * 初始化
 *
 */

document.addEventListener("DOMContentLoaded", function () {
  // 初始化主题模式
  initTheme();

  // // 初始化代理选项
  // if (window.proxyChecker) {
  //   window.proxyChecker.init();
  // } else {
  //   console.error('ProxyChecker not initialized');
  // }

  // 初始化选项卡显示
  renderTabContent(currentTab);

  // 绑定选项卡切换事件
  document.querySelectorAll("[data-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      currentTab = button.dataset.tab;
      renderTabContent(currentTab);
    });
  });

  const urlInput = document.querySelector("#github-url");
  const downloadButton = document.querySelector("#download-button");

  // 绑定下载按钮事件
  downloadButton.addEventListener("click", handleDirectDownload);
  // 绑定输入框回车事件
  urlInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      handleDirectDownload();
    }
  });

  // 输入框变化监听
  urlInput.addEventListener("input", function () {
    if (this.value.trim()) {
      updateProxyUrl();
    } else {
      // 清空时显示使用说明
      renderTabContent(currentTab);
    }
  });

  // 检测点击事件
  document.addEventListener("click", function (e) {
    // 点击其他区域关闭代理下拉菜单
    const proxySelector = document.getElementById("proxy-selector");
    const proxyDropdown = document.getElementById("proxy-dropdown");
    if (!proxySelector.contains(e.target)) {
      proxyDropdown.classList.add("hidden");
    }
  });

  const container = document.getElementById("mirrors-container"); // 获取容器

  // 先检测结果容器是否存在，存在的话就先清空
  if (container) {
    // 容器存在，执行清空操作
    const tbody = document.getElementById("mirrors-tbody");
    if (tbody) {
      // 确保 tbody 也存在
      tbody.innerHTML = ""; // 清空表格内容
    } else {
      console.warn("mirrors-tbody not found inside mirrors-container, but container exists.");
      // 可以选择是否清空 container 本身的内容，如果 tbody 是必须的子元素
      // container.innerHTML = ''; // 如果需要清空 container 的所有内容，可以这样做
    }
  } else {
    console.warn("mirrors-container not found! Detection process might not work as expected.");
    // 如果容器不存在，可以根据需求选择是否停止执行后续检测逻辑
    // 例如，可以 return; 提前结束函数执行，或者继续执行但可能无法正确显示结果
    // 这里选择继续执行，但会输出警告信息
  }

  // 绑定移动端菜单事件
  const menuButton = document.getElementById("mobile-menu-button");
  const mobileMenu = document.getElementById("mobile-menu");
  const mobileCheckMirrorsBtn = document.getElementById("mobile-check-mirrors-btn");

  if (menuButton && mobileMenu && mobileCheckMirrorsBtn) {
    // 菜单按钮点击事件
    menuButton.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();

      if (mobileMenu.classList.contains("hidden")) {
        // 显示菜单
        mobileMenu.classList.remove("hidden");
        requestAnimationFrame(() => {
          mobileMenu.classList.add("menu-slide-in");
        });
      } else {
        // 隐藏菜单
        closeMobileMenu();
      }
    });

    // 移动端节点检测按钮点击事件
    mobileCheckMirrorsBtn.addEventListener("click", function (e) {
      e.preventDefault();

      // 触发桌面端检测按钮的点击事件
      const desktopBtn = document.getElementById("check-mirrors-btn");
      if (desktopBtn) {
        desktopBtn.click();
      }

      // 关闭移动端菜单
      closeMobileMenu();
    });

    // 点击页面其他区域关闭菜单
    document.addEventListener("click", function (e) {
      if (!menuButton.contains(e.target) && !mobileMenu.contains(e.target)) {
        if (!mobileMenu.classList.contains("hidden")) {
          closeMobileMenu();
        }
      }
    });

    // ESC键关闭菜单
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !mobileMenu.classList.contains("hidden")) {
        closeMobileMenu();
      }
    });

    // 关闭菜单的统一处理函数
    function closeMobileMenu() {
      mobileMenu.classList.add("menu-slide-out");

      // 等待动画结束后隐藏菜单
      setTimeout(() => {
        mobileMenu.classList.add("hidden");
        mobileMenu.classList.remove("menu-slide-out", "menu-slide-in");
      }, 200); // 与动画时长保持一致
    }
  }

  // 确保页面加载时菜单是隐藏的
  if (mobileMenu) {
    mobileMenu.classList.add("hidden");
  }

  // 窗口大小变化监听
  window.addEventListener("resize", () => {
    if (MirrorsChecker && !document.getElementById("mirrors-container").classList.contains("hidden")) {
      MirrorsChecker.updateTableColumns();
    }
  });
});
