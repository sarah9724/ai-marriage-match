import { CONSTANTS, storageUtils, urlUtils, animationUtils } from '../../utils/index.js';
import { Message } from '../../components/message/index.js';
import { Loading } from '../../components/loading/index.js';
import { Dialog } from '../../components/dialog/index.js';

// 题目数据
const questions = [
    // 性格特征题目
    {
        id: 1,
        dimension: CONSTANTS.DIMENSIONS.PERSONALITY.key,
        text: "在做决定时,你更倾向于:",
        options: [
            { value: 'A', text: '理性分析后决定' },
            { value: 'B', text: '根据感觉来决定' },
            { value: 'C', text: '两者都有' }
        ]
    },
    {
        id: 2,
        dimension: CONSTANTS.DIMENSIONS.PERSONALITY.key,
        text: "遇到分歧时,你通常会:",
        options: [
            { value: 'A', text: '据理力争' },
            { value: 'B', text: '先让一步' },
            { value: 'C', text: '视情况而定' }
        ]
    },
    {
        id: 3,
        dimension: CONSTANTS.DIMENSIONS.PERSONALITY.key,
        text: "对于生活,你更看重:",
        options: [
            { value: 'A', text: '规律和计划' },
            { value: 'B', text: '随性和自由' },
            { value: 'C', text: '平衡兼顾' }
        ]
    },
    // 价值观题目
    {
        id: 4,
        dimension: CONSTANTS.DIMENSIONS.VALUES.key,
        text: "你认为婚姻中最重要的是:",
        options: [
            { value: 'A', text: '相互理解' },
            { value: 'B', text: '共同成长' },
            { value: 'C', text: '忠诚信任' }
        ]
    },
    {
        id: 5,
        dimension: CONSTANTS.DIMENSIONS.VALUES.key,
        text: "对于未来生活,你更希望:",
        options: [
            { value: 'A', text: '事业为重' },
            { value: 'B', text: '家庭为主' },
            { value: 'C', text: '两者平衡' }
        ]
    },
    {
        id: 6,
        dimension: CONSTANTS.DIMENSIONS.VALUES.key,
        text: "理想的亲子教育方式是:",
        options: [
            { value: 'A', text: '严格要求' },
            { value: 'B', text: '放养自由' },
            { value: 'C', text: '因材施教' }
        ]
    },
    {
        id: 7,
        dimension: CONSTANTS.DIMENSIONS.VALUES.key,
        text: "你期望的生活节奏是:",
        options: [
            { value: 'A', text: '充实忙碌' },
            { value: 'B', text: '舒���安逸' },
            { value: 'C', text: '张弛有度' }
        ]
    },
    // 生活习惯题目
    {
        id: 8,
        dimension: CONSTANTS.DIMENSIONS.LIFESTYLE.key,
        text: "对于金钱,你的态度是:",
        options: [
            { value: 'A', text: '量入为出' },
            { value: 'B', text: '及时享受' },
            { value: 'C', text: '储蓄为主' }
        ]
    },
    {
        id: 9,
        dimension: CONSTANTS.DIMENSIONS.LIFESTYLE.key,
        text: "闲暇时间你喜欢:",
        options: [
            { value: 'A', text: '外出社交' },
            { value: 'B', text: '宅家休息' },
            { value: 'C', text: '看情况决定' }
        ]
    },
    {
        id: 10,
        dimension: CONSTANTS.DIMENSIONS.LIFESTYLE.key,
        text: "对于家务分工,你认为:",
        options: [
            { value: 'A', text: '明确分工' },
            { value: 'B', text: '随机应变' },
            { value: 'C', text: '能者多劳' }
        ]
    }
];

// 状态管理
let currentQuestionIndex = 0;
let answers = {};

// DOM元素
const elements = {
    questionText: document.querySelector('.question-text'),
    optionsList: document.querySelector('.options-list'),
    prevButton: document.querySelector('.prev-btn'),
    nextButton: document.querySelector('.next-btn'),
    progressFill: document.querySelector('.progress-fill'),
    currentNumber: document.querySelector('.current'),
    totalNumber: document.querySelector('.total'),
    retryBtn: document.querySelector('.retry-btn')
};

// 初始化
function init() {
    // 从存储加载答案
    const savedAnswers = storageUtils.get(CONSTANTS.STORAGE_KEYS.QUIZ_ANSWERS);
    if (savedAnswers) {
        answers = savedAnswers;
        currentQuestionIndex = Object.keys(answers).length;
    }

    // 更新总题数显示
    elements.totalNumber.textContent = questions.length;
    
    // 显示第一题
    showQuestion(currentQuestionIndex);
}

// 显示题目
function showQuestion(index) {
    const question = questions[index];
    
    // 更新题目文本
    elements.questionText.textContent = question.text;
    elements.questionText.dataset.questionId = question.id;
    elements.questionText.dataset.dimension = question.dimension;

    // 更新选项
    elements.optionsList.innerHTML = question.options.map(option => `
        <div class="option" data-value="${option.value}">
            <input type="radio" name="q${question.id}" id="q${question.id}_${option.value}" 
                   value="${option.value}" ${answers[question.id] === option.value ? 'checked' : ''}>
            <label for="q${question.id}_${option.value}">${option.text}</label>
        </div>
    `).join('');

    // 更新进度
    updateProgress();

    // 更新按钮状态
    updateButtons();
}

// 更新进度显示
function updateProgress() {
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    animationUtils.animateProgress(elements.progressFill, progress);
    elements.currentNumber.textContent = currentQuestionIndex + 1;
}

// 更新按钮状态
function updateButtons() {
    elements.prevButton.disabled = currentQuestionIndex === 0;
    
    if (currentQuestionIndex === questions.length - 1) {
        elements.nextButton.textContent = '提交';
    } else {
        elements.nextButton.textContent = '下一题';
    }
}

// 保存答案
function saveAnswer(questionId, value) {
    answers[questionId] = value;
    storageUtils.save(CONSTANTS.STORAGE_KEYS.QUIZ_ANSWERS, answers);
}

// 事件监听
elements.optionsList.addEventListener('change', (e) => {
    if (e.target.type === 'radio') {
        const questionId = elements.questionText.dataset.questionId;
        saveAnswer(questionId, e.target.value);
        
        // 自动下一题
        if (currentQuestionIndex < questions.length - 1) {
            setTimeout(() => {
                currentQuestionIndex++;
                showQuestion(currentQuestionIndex);
            }, 300);
        }
    }
});

elements.prevButton.addEventListener('click', () => {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        showQuestion(currentQuestionIndex);
    }
});

elements.nextButton.addEventListener('click', () => {
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        showQuestion(currentQuestionIndex);
    } else {
        submitAnswers();
    }
});

// 提交答案
async function submitAnswers() {
    const answeredQuestions = Object.keys(answers).length;
    if (answeredQuestions < questions.length) {
        Message.warning('请回答所有问题后再提交');
        return;
    }

    const loading = Loading.show('正在计算结果...');
    try {
        // 保存结果
        storageUtils.save(CONSTANTS.STORAGE_KEYS.QUIZ_RESULT, {
            answers,
            timestamp: Date.now()
        });
        Message.success('提交成功');
        window.location.href = '../result/index.html';
    } catch (err) {
        Message.error('提交失败，请重试');
        console.error(err);
    } finally {
        Loading.hide(loading);
    }
}

// 重新测试时
elements.retryBtn.addEventListener('click', async () => {
    const confirmed = await Dialog.confirm({
        title: '确认重新测试',
        content: '重新测试将清除当前的答案，确定继续吗？'
    });
    
    if (confirmed) {
        storageUtils.remove(CONSTANTS.STORAGE_KEYS.QUIZ_ANSWERS);
        window.location.href = '/quiz.html';
    }
});

// 初始化页面
document.addEventListener('DOMContentLoaded', init); 