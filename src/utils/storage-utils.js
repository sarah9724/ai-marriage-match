// 存储工具
export const storageUtils = {
    // 保存数据
    save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (err) {
            console.error('保存数据失败:', err);
            return false;
        }
    },

    // 获取数据
    get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (err) {
            console.error('获取数据失败:', err);
            return null;
        }
    },

    // 删除数据
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (err) {
            console.error('删除数据失败:', err);
            return false;
        }
    }
}; 