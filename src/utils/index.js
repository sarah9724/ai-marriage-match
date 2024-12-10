// 常量定义
export const CONSTANTS = {
    STORAGE_KEYS: {
        QUIZ_ANSWERS: 'quizAnswers',
        QUIZ_RESULT: 'quizResult'
    },
    SCORE_LEVELS: {
        PERFECT: { min: 90, label: '天生一对' },
        GOOD: { min: 75, label: '很有潜力' },
        MODERATE: { min: 60, label: '需要磨合' },
        LOW: { min: 0, label: '还需努力' }
    },
    DIMENSIONS: {
        PERSONALITY: {
            key: 'personality',
            name: '性格特征',
            weight: 0.3
        },
        VALUES: {
            key: 'values',
            name: '价值观',
            weight: 0.4
        },
        LIFESTYLE: {
            key: 'lifestyle',
            name: '生活习惯',
            weight: 0.3
        }
    }
};

// 评分算法
export const scoreUtils = {
    // 计算选项匹配度
    calculateOptionMatch(option1, option2) {
        if (option1 === option2) return 100;
        if (option1 === 'C' || option2 === 'C') return 75;
        return 50;
    },

    // 计算维度得分
    calculateDimensionScore(answers1, answers2, questionRange) {
        let totalScore = 0;
        let count = 0;

        for (let i = questionRange.start; i <= questionRange.end; i++) {
            if (answers1[i] && answers2[i]) {
                totalScore += this.calculateOptionMatch(answers1[i], answers2[i]);
                count++;
            }
        }

        return count > 0 ? Math.round(totalScore / count) : 0;
    },

    // 计算总分
    calculateTotalScore(dimensionScores) {
        let totalScore = 0;
        let totalWeight = 0;

        for (const [dimension, score] of Object.entries(dimensionScores)) {
            const weight = CONSTANTS.DIMENSIONS[dimension.toUpperCase()].weight;
            totalScore += score * weight;
            totalWeight += weight;
        }

        return Math.round(totalScore / totalWeight);
    }
};

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

// URL参数工具
export const urlUtils = {
    // 获取URL参数
    getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    },

    // 设置URL参数
    setQueryParam(param, value) {
        const url = new URL(window.location.href);
        url.searchParams.set(param, value);
        window.history.replaceState({}, '', url);
    }
};

// 动画工具
export const animationUtils = {
    // 数字动画
    animateNumber(element, start, end, duration = 1000) {
        const step = (end - start) / (duration / 16);
        let current = start;

        function update() {
            current += step;
            if ((step > 0 && current >= end) || (step < 0 && current <= end)) {
                element.textContent = Math.round(end);
                return;
            }
            element.textContent = Math.round(current);
            requestAnimationFrame(update);
        }

        update();
    },

    // 进度条动画
    animateProgress(element, targetWidth, duration = 300) {
        element.style.transition = `width ${duration}ms ease`;
        element.style.width = `${targetWidth}%`;
    }
};

// 添加建议模板
export const adviceTemplates = {
    PERSONALITY: {
        high: {
            strength: '你们在性格特征方面非常契合，都能理解和接纳对方的处事方式。',
            detail: '这种性格上的和谐有助于减少日常摩擦，让关系更加稳定。'
        },
        low: {
            weakness: '在性格特征方面存在一些差异',
            suggestion: '建议多站在对方角度思考，学会欣赏不同性格的优点。可以通过共同活动增进理解。'
        }
    },
    VALUES: {
        high: {
            strength: '你们的价值观高度一致，对人生重要问题的看法比较接近。',
            detail: '这是维持长期关系的重要基础，有助于共同规划未来。'
        },
        low: {
            weakness: '在价值观方面有一定差异',
            suggestion: '建议开诚布公地交流彼此的人生观和价值取向，寻找共同点和平衡点。'
        }
    },
    LIFESTYLE: {
        high: {
            strength: '你们的生活习惯比较接近，在日常生活中能够和谐相处。',
            detail: '这种默契能让共同生活更加轻松愉快。'
        },
        low: {
            weakness: '在生活习惯上存在差异',
            suggestion: '建议相互体谅，适当调整自己的习惯，找到双方都舒适的相处方式。'
        }
    }
}; 