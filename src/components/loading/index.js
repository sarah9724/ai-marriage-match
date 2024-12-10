// 加载组件
export const Loading = {
    // 创建加载元素
    create(text = '加载中...') {
        const loading = document.createElement('div');
        loading.className = 'loading-container';
        loading.innerHTML = `
            <div class="loading-spinner"></div>
            <div class="loading-text">${text}</div>
        `;
        return loading;
    },

    // 显示加载
    show(text) {
        const loading = this.create(text);
        document.body.appendChild(loading);
        document.body.style.overflow = 'hidden';
        return loading;
    },

    // 隐藏加载
    hide(loading) {
        if (loading && loading.parentNode) {
            loading.parentNode.removeChild(loading);
            document.body.style.overflow = '';
        }
    }
}; 