// 对话框组件
export const Dialog = {
    // 创建对话框
    create({ title, content, confirmText = '确定', cancelText = '取消' }) {
        const dialog = document.createElement('div');
        dialog.className = 'dialog-container';
        dialog.innerHTML = `
            <div class="dialog">
                <div class="dialog-header">
                    <h3>${title}</h3>
                </div>
                <div class="dialog-content">
                    ${content}
                </div>
                <div class="dialog-footer">
                    <button class="dialog-btn dialog-cancel">${cancelText}</button>
                    <button class="dialog-btn dialog-confirm">${confirmText}</button>
                </div>
            </div>
        `;
        return dialog;
    },

    // 显示确认对话框
    confirm(options) {
        return new Promise((resolve) => {
            const dialog = this.create(options);
            document.body.appendChild(dialog);
            document.body.style.overflow = 'hidden';

            // 按钮事件
            const confirmBtn = dialog.querySelector('.dialog-confirm');
            const cancelBtn = dialog.querySelector('.dialog-cancel');

            confirmBtn.addEventListener('click', () => {
                this.close(dialog);
                resolve(true);
            });

            cancelBtn.addEventListener('click', () => {
                this.close(dialog);
                resolve(false);
            });
        });
    },

    // 关闭对话框
    close(dialog) {
        dialog.classList.add('dialog-closing');
        setTimeout(() => {
            document.body.removeChild(dialog);
            document.body.style.overflow = '';
        }, 300);
    }
}; 