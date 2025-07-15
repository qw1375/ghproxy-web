/**
 * HubProxy 网站移动端 JavaScript 功能
 */


/**
 * 初始化移动端菜单
 */
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // 切换菜单显示状态
            mobileMenu.classList.toggle('hidden');
            
            // 更新按钮的aria-expanded属性
            const isExpanded = !mobileMenu.classList.contains('hidden');
            mobileMenuBtn.setAttribute('aria-expanded', isExpanded);
            
            // 添加视觉反馈
            if (isExpanded) {
                mobileMenuBtn.classList.add('bg-gray-100', 'dark:bg-gray-700');
            } else {
                mobileMenuBtn.classList.remove('bg-gray-100', 'dark:bg-gray-700');
            }
        });
        
        // 点击页面其他地方关闭移动端菜单
        document.addEventListener('click', function(e) {
            if (!mobileMenuBtn.contains(e.target) && !mobileMenu.contains(e.target)) {
                mobileMenu.classList.add('hidden');
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
                mobileMenuBtn.classList.remove('bg-gray-100', 'dark:bg-gray-700');
            }
        });
    }
}

/**
 * 初始化移动端子菜单
 */
function initMobileSubmenus() {
    // 服务子菜单
    const servicesButton = document.getElementById('services-menu-button');
    if (servicesButton) {
        servicesButton.addEventListener('click', function(e) {
            e.preventDefault();
            toggleMobileSubmenu('services');
        });
    }
    
    // 资源子菜单
    const resourcesButton = document.getElementById('resources-menu-button');
    if (resourcesButton) {
        resourcesButton.addEventListener('click', function(e) {
            e.preventDefault();
            toggleMobileSubmenu('resources');
        });
    }
}

/**
 * 移动端菜单切换（全局函数，供onclick使用）
 */
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenuIcon = document.getElementById('mobile-menu-icon');
    
    if (mobileMenu && mobileMenuBtn && mobileMenuIcon) {
        // 切换菜单显示状态
        mobileMenu.classList.toggle('hidden');
        
        // 更新按钮的aria-expanded属性
        const isExpanded = !mobileMenu.classList.contains('hidden');
        mobileMenuBtn.setAttribute('aria-expanded', isExpanded);
        
        // 添加视觉反馈
        if (isExpanded) {
            mobileMenuBtn.classList.add('bg-gray-100', 'dark:bg-gray-700');
            // 菜单展开时，图标顺时针旋转90度
            mobileMenuIcon.classList.add('rotate-90');
        } else {
            mobileMenuBtn.classList.remove('bg-gray-100', 'dark:bg-gray-700');
            // 菜单收起时，图标恢复原状
            mobileMenuIcon.classList.remove('rotate-90');
        }
    }
}

/**
 * 关闭移动端菜单
 */
function closeMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenuIcon = document.getElementById('mobile-menu-icon');
    
    if (mobileMenu && mobileMenuBtn && mobileMenuIcon && !mobileMenu.classList.contains('hidden')) {
        mobileMenu.classList.add('hidden');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        mobileMenuBtn.classList.remove('bg-gray-100', 'dark:bg-gray-700');
        // 关闭菜单时，重置图标旋转状态
        mobileMenuIcon.classList.remove('rotate-90');
    }
}

// 点击页面其他地方关闭移动端菜单
document.addEventListener('click', function(e) {
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    
    if (mobileMenu && mobileMenuBtn && 
        !mobileMenuBtn.contains(e.target) && 
        !mobileMenu.contains(e.target)) {
        closeMobileMenu();
    }
});

/**
 * 移动端子菜单切换（全局函数，供onclick使用）
 */
function toggleMobileSubmenu(id) {
    const submenu = document.getElementById(`${id}-submenu`);
    const arrow = document.getElementById(`${id}-arrow`);
    
    if (submenu && arrow) {
        submenu.classList.toggle('hidden');
        arrow.classList.toggle('rotate-180');
    }
}