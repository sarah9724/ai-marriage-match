// 消息提示组件
export const Message = {
    // 创建消息容器
    createContainer() {
        const container = document.createElement('div');
        container.className = 'message-container';
        document.body.appendChild(container);
        return container;
    },

    // 显示消息
    show(text, type = 'info', duration = 3000) {
        // 获取或创建容器
        let container = document.querySelector('.message-container');
        if (!container) {
            container = this.createContainer();
        }

        // 创建消息元素
        const message = document.createElement('div');
        message.className = `message message-${type}`;
        message.textContent = text;

        // 添加到容器
        container.appendChild(message);

        // 动画效果
        requestAnimationFrame(() => {
            message.style.opacity = '1';
            message.style.transform = 'translateY(0)';
        });

        // 自动移除
        setTimeout(() => {
            message.style.opacity = '0';
            message.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                container.removeChild(message);
                if (container.children.length === 0) {
                    document.body.removeChild(container);
                }
            }, 300);
        }, duration);
    },

    // 成功消息
    success(text, duration) {
        this.show(text, 'success', duration);
    },

    // 错误消息
    error(text, duration) {
        this.show(text, 'error', duration);
    },

    // 警告消息
    warning(text, duration) {
        this.show(text, 'warning', duration);
    }
}; 