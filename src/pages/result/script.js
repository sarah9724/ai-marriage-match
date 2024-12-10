import { CONSTANTS, storageUtils, urlUtils, animationUtils, scoreUtils, adviceTemplates } from '../../utils/index.js';

// DOM元素
const elements = {
    scoreNumber: document.querySelector('.score-number'),
    scoreLevel: document.querySelector('.score-level'),
    scoreDesc: document.querySelector('.score-desc'),
    dimensionScores: document.querySelector('.dimension-scores'),
    adviceStrength: document.querySelector('.advice-strength'),
    adviceSuggestion: document.querySelector('.advice-suggestion'),
    shareBtn: document.querySelector('#share-btn'),
    retryBtn: document.querySelector('#retry-btn'),
    analysisBtn: document.querySelector('#analysis-btn')
};

// 初始化页面
function initPage() {
    const result = storageUtils.get(CONSTANTS.STORAGE_KEYS.QUIZ_RESULT);
    
    if (!result) {
        // 如果没有结果数据，重定向到测评页面
        window.location.href = '../quiz/index.html';
        return;
    }

    const scores = {
        total: result.total,
        dimensions: result.dimensions
    };
    displayResults(scores);
    initializeButtons();
}

// 计算得分
function calculateScores(answers) {
    // 按维度分组题目
    const questionsByDimension = {
        [CONSTANTS.DIMENSIONS.PERSONALITY.key]: [1, 2, 3],
        [CONSTANTS.DIMENSIONS.VALUES.key]: [4, 5, 6, 7],
        [CONSTANTS.DIMENSIONS.LIFESTYLE.key]: [8, 9, 10]
    };

    // 计算各维度得分
    const dimensionScores = {};
    for (const [dimension, questionIds] of Object.entries(questionsByDimension)) {
        const dimensionAnswers = {};
        questionIds.forEach(id => {
            dimensionAnswers[id] = answers[id];
        });

        dimensionScores[dimension] = scoreUtils.calculateDimensionScore(
            dimensionAnswers,
            dimensionAnswers, // MVP阶段只计算单人答案
            { start: questionIds[0], end: questionIds[questionIds.length - 1] }
        );
    }

    // 计算总分
    const totalScore = scoreUtils.calculateTotalScore(dimensionScores);

    // 保存结果
    storageUtils.save(CONSTANTS.STORAGE_KEYS.QUIZ_RESULT, {
        total: totalScore,
        dimensions: dimensionScores,
        answers,
        timestamp: Date.now()
    });

    return {
        total: totalScore,
        dimensions: dimensionScores
    };
}

// 显示结果
function displayResults(scores) {
    // 显示总分
    displayTotalScore(scores.total);
    
    // 显示维度得分
    displayDimensionScores(scores.dimensions);
    
    // 显示建议
    displayAdvice(scores.dimensions);
}

// 显示总分
function displayTotalScore(score) {
    // 动画显示分数
    animationUtils.animateNumber(elements.scoreNumber, 0, score);

    // 获取等级和描述
    const scoreLevel = getScoreLevel(score);
    elements.scoreLevel.textContent = scoreLevel.label;
    elements.scoreDesc.textContent = getScoreDescription(scoreLevel.label);
}

// 显示维度得分
function displayDimensionScores(dimensionScores) {
    // 清空现有内容
    elements.dimensionScores.innerHTML = '';

    // 添加各维度得分
    Object.entries(CONSTANTS.DIMENSIONS).forEach(([key, dimension]) => {
        const score = dimensionScores[dimension.key];
        const dimensionHtml = `
            <div class="dimension-item">
                <div class="dimension-label">${dimension.name}</div>
                <div class="dimension-bar">
                    <div class="bar-fill" data-dimension="${dimension.name}" style="width: 0%">
                        ${score}%
                    </div>
                </div>
            </div>
        `;
        elements.dimensionScores.insertAdjacentHTML('beforeend', dimensionHtml);

        // 添加动画效果
        setTimeout(() => {
            const barFill = elements.dimensionScores
                .querySelector(`[data-dimension="${dimension.name}"]`);
            animationUtils.animateProgress(barFill, score);
        }, 300);
    });
}

// 显示建议
function displayAdvice(dimensionScores) {
    const { strength, suggestion } = generateAdvice(dimensionScores);
    
    elements.adviceStrength.textContent = strength;
    elements.adviceSuggestion.textContent = suggestion;
}

// 获取分数等级
function getScoreLevel(score) {
    for (const [key, level] of Object.entries(CONSTANTS.SCORE_LEVELS)) {
        if (score >= level.min) {
            return level;
        }
    }
    return CONSTANTS.SCORE_LEVELS.LOW;
}

// 获取分数描述
function getScoreDescription(level) {
    const descriptions = {
        '天生一对': '你们的契合度非常高，很适合发展长期关系。',
        '很有潜力': '你们的关系基础良好，通过努力可以建立更深厚的感情。',
        '需要磨合': '你们存在一些差异，需要更多理解和包容。',
        '还需努力': '你们在很多方面存在差异，需要认真考虑是否合适。'
    };
    return descriptions[level] || descriptions['还需努力'];
}

// 生成建议
function generateAdvice(dimensionScores) {
    // 找出最高和最低维度
    let highestDim = null;
    let lowestDim = null;
    let highestScore = -1;
    let lowestScore = 101;
    let adviceContent = {
        strengths: [],
        suggestions: []
    };

    Object.entries(dimensionScores).forEach(([key, score]) => {
        const dimension = key.toUpperCase();
        const template = adviceTemplates[dimension];

        if (score >= 80) {
            adviceContent.strengths.push({
                dimension: CONSTANTS.DIMENSIONS[dimension].name,
                text: template.high.strength,
                detail: template.high.detail
            });
        } else if (score < 60) {
            adviceContent.suggestions.push({
                dimension: CONSTANTS.DIMENSIONS[dimension].name,
                weakness: template.low.weakness,
                suggestion: template.low.suggestion
            });
        }

        if (score > highestScore) {
            highestScore = score;
            highestDim = CONSTANTS.DIMENSIONS[key.toUpperCase()].name;
        }
        if (score < lowestScore) {
            lowestScore = score;
            lowestDim = CONSTANTS.DIMENSIONS[key.toUpperCase()].name;
        }
    });

    // 生成优势和建议文本
    let strengthText = '';
    let suggestionText = '';

    if (adviceContent.strengths.length > 0) {
        const strength = adviceContent.strengths[0];
        strengthText = `${strength.text}${strength.detail}`;
    } else {
        strengthText = `你们在${highestDim}方面相对较为契合，这是一个良好的开始。`;
    }

    if (adviceContent.suggestions.length > 0) {
        const suggestion = adviceContent.suggestions[0];
        suggestionText = `${suggestion.weakness}，${suggestion.suggestion}`;
    } else {
        suggestionText = `虽然在${lowestDim}方面还有提升空间，建议通过良好的沟通来增进理解。`;
    }

    return {
        strength: strengthText,
        suggestion: suggestionText
    };
}

// 初始化按钮事件
function initializeButtons() {
    if (!elements.analysisBtn || !elements.shareBtn || !elements.retryBtn) {
        console.error('按钮元素未找到:', {
            analysisBtn: elements.analysisBtn,
            shareBtn: elements.shareBtn,
            retryBtn: elements.retryBtn
        });
        return;
    }

    // 分析按钮
    elements.analysisBtn.addEventListener('click', () => {
        console.log('点击分析按钮');
        window.location.href = '../analysis/index.html';
    });

    // 分享按钮
    elements.shareBtn.addEventListener('click', async () => {
        console.log('点击分享按钮');
        try {
            if (navigator.share) {
                await navigator.share({
                    title: 'AI情侣契合度测试结果',
                    text: `我的契合度得分是${elements.scoreNumber.textContent}分！`,
                    url: window.location.href
                });
            } else {
                // 复制链接到剪贴板
                await navigator.clipboard.writeText(window.location.href);
                Message.success('链接已复制到剪贴板');
            }
        } catch (err) {
            console.error('分享失败:', err);
            Message.error('分享失败，请重试');
        }
    });

    // 重置测试按钮
    elements.retryBtn.addEventListener('click', () => {
        console.log('点击重新测试按钮');
        // 清除所有测试相关的存储
        storageUtils.remove(CONSTANTS.STORAGE_KEYS.QUIZ_ANSWERS);
        storageUtils.remove(CONSTANTS.STORAGE_KEYS.QUIZ_RESULT);
        
        // 跳转到测评页面
        window.location.href = '../quiz/index.html';
    });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initPage); 