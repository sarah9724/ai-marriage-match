import { RadarChart } from '../../components/radar-chart/index.js';
import { AnalysisCard } from '../../components/analysis-card/index.js';
import { Loading } from '../../components/loading/index.js';
import { Message } from '../../components/message/index.js';
import { Dialog } from '../../components/dialog/index.js';
import { CONSTANTS, storageUtils, animationUtils } from '../../utils/index.js';

// DOM元素
const elements = {
    backBtn: document.querySelector('.back-btn'),
    exportBtn: document.querySelector('.export-btn'),
    shareBtn: document.querySelector('.share-btn'),
    radarChart: document.querySelector('#radarChart'),
    dimensionTabs: document.querySelector('.dimension-tabs'),
    dimensionContent: document.querySelector('.dimension-content'),
    adviceTimeline: document.querySelector('.advice-timeline')
};

// 初始化页面
async function initPage() {
    const loading = Loading.show('加载分析数据...');
    
    try {
        // 获取测评数据
        const scores = storageUtils.get(CONSTANTS.STORAGE_KEYS.QUIZ_RESULT);
        console.log('获取到的测评数据:', scores); // 添加调试日志
        
        if (!scores) {
            throw new Error('未找到测评数据');
        }

        // 获取维度得分
        const dimensionScores = scores.dimensions || {};
        console.log('维度得分:', dimensionScores); // 添加调试日志

        // 验证维度得分
        if (!dimensionScores.personality || !dimensionScores.values || !dimensionScores.lifestyle) {
            throw new Error('测评数据不完整，请重新测试');
        }

        // 初始化图表
        initChart(dimensionScores);
        
        // 初始化维度分析
        initDimensionAnalysis(dimensionScores);
        
        // 初始化建议时间轴
        initAdviceTimeline(dimensionScores);
        
        // 绑定事件
        bindEvents();
        
    } catch (error) {
        console.error('初始化页面出错:', error); // 添加调试日志
        Message.error(error.message);
        setTimeout(() => {
            window.location.href = '../result/index.html';
        }, 2000);
    } finally {
        Loading.hide(loading);
    }
}

// 初始化图表
function initChart(scores) {
    const data = {
        labels: Object.keys(scores).map(key => 
            CONSTANTS.DIMENSIONS[key.toUpperCase()].name
        ),
        scores: Object.values(scores),
        averages: Object.keys(scores).map(() => 70) // 示例平均值
    };
    
    RadarChart.create(elements.radarChart, data);
}

// 初始化维度分析
function initDimensionAnalysis(scores) {
    // 默认显示第一个维度
    showDimensionAnalysis('personality', scores.personality);

    // 绑定标签页切换事件
    elements.dimensionTabs.addEventListener('click', (e) => {
        const tab = e.target.closest('.tab');
        if (!tab) return;
        
        // 更新标签页状态
        document.querySelectorAll('.tab').forEach(t => 
            t.classList.remove('active')
        );
        tab.classList.add('active');
        
        // 显示对应维度的分析
        const dimension = tab.dataset.dimension;
        console.log('切换维度:', dimension, scores[dimension]); // 添加调试日志
        showDimensionAnalysis(dimension, scores[dimension]);
    });
}

// 显示维度分析
function showDimensionAnalysis(dimension, score) {
    const analysisData = {
        personality: {
            title: '性格特征分析',
            content: score >= 80 
                ? '你们在性格特征方面非常契合，都能理解和接纳对方的处事方式。这种性格上的和谐有助于减少日常摩擦，让关系更加稳定。'
                : score >= 60
                ? '你们在性格特征方面存在一些差异，但这些差异是可以通过相互理解和包容来化解的。'
                : '你们在性格特征方面存在较大差异，需要更多的沟通和理解。',
            suggestions: [
                '多进行开放的沟通，理解彼此的处事方式',
                '学会欣赏对方性格中的优点',
                '在差异较大的方面互相包容和适应'
            ]
        },
        values: {
            title: '价值观分析',
            content: score >= 80
                ? '你们的价值观高度一致，对人生重要问题的看法比较接近。这是维持长期关系的重要基础。'
                : score >= 60
                ? '你们在价值观方面有一些共同点，也存在一些差异，需要通过交流找到平衡点。'
                : '你们在价值观方面存在较大差异，建议深入交流，了解彼此的人生观。',
            suggestions: [
                '深入交流彼此的人生目标',
                '寻找共同的价值取向',
                '尊重并理解价值观的差异'
            ]
        },
        lifestyle: {
            title: '生活习惯分析',
            content: score >= 80
                ? '你们的生活习惯比较接近，在日常生活中能够和谐相处。这种默契能让同生活更加轻松愉快。'
                : score >= 60
                ? '你们在生活习惯上有一些差异，但通过适当的调整和配合，可以找到舒适的相处方式。'
                : '你们在生活习惯上存在较大差异，需要双方都做出一些改变和适应。',
            suggestions: [
                '建立共同的生活规律',
                '相互体谅对方的习惯',
                '共同制定生活计划'
            ]
        }
    };

    const data = analysisData[dimension];
    if (!data) {
        console.error('未找到维度数据:', dimension);
        return;
    }

    const card = AnalysisCard.create({
        title: data.title,
        score: score,
        content: data.content,
        suggestions: data.suggestions
    });

    elements.dimensionContent.innerHTML = '';
    elements.dimensionContent.appendChild(card);
}

// 初始化建议时间轴
function initAdviceTimeline(scores) {
    const adviceItems = document.querySelectorAll('.timeline-item');
    adviceItems.forEach(item => {
        const period = item.dataset.period;
        const content = item.querySelector('.advice-content');
        
        // 根据不同时期生成建议
        const advice = generateAdvice(scores, period);
        content.textContent = advice;
    });
}

// 生成建议
function generateAdvice(scores, period) {
    // 根据得分情况生成建议
    const highestScore = Math.max(...Object.values(scores));
    const lowestScore = Math.min(...Object.values(scores));
    const avgScore = Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length;
    
    const adviceMap = {
        short: '近期可以通过共同活动增进了解...',
        medium: avgScore >= 75 
            ? '在未来3-6个月，可以继续保持良好的沟通和理解，进一步加深感情。'
            : '在未来3-6个月，建议重点关注彼此的差异，通过沟通和理解来增进感情。',
        long: avgScore >= 75
            ? '长期来看，你们有很好的发展基础，可以考虑进一步深化关系。'
            : '长期来看，需要双方都付出努力，在关键问题上达成共识。'
    };
    
    return adviceMap[period];
}

// 绑定事件
function bindEvents() {
    // 返回按钮
    elements.backBtn.addEventListener('click', () => {
        window.location.href = '../result/index.html';
    });
    
    // 导出报告
    elements.exportBtn.addEventListener('click', () => {
        Dialog.confirm({
            title: '导出报告',
            content: '确定要导出分析报告吗？',
            confirmText: '确定',
            cancelText: '取消'
        }).then(confirmed => {
            if (confirmed) {
                const loading = Loading.show('正在生成报告...');
                setTimeout(() => {
                    try {
                        // 生成报告内容
                        const reportContent = generateReport();
                        
                        // 创建下载链接
                        const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = '情侣契合度分析报告.txt';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        window.URL.revokeObjectURL(url);
                        Message.success('报告已下载');
                    } catch (err) {
                        console.error('生成报告失败:', err);
                        Message.error(err.message || '生成报告失败，请重试');
                    } finally {
                        Loading.hide(loading);
                    }
                }, 1500);
            }
        });
    });
    
    // 分享结果
    elements.shareBtn.addEventListener('click', () => {
        if (navigator.share) {
            navigator.share({
                title: 'AI情侣契合度测试分析报告',
                text: '查看我的详细析报告！',
                url: window.location.href
            }).catch(err => {
                console.error('分享失败:', err);
                Message.error('分享失败，请重试');
            });
        } else {
            // 复制链接到剪贴板
            navigator.clipboard.writeText(window.location.href)
                .then(() => Message.success('链接已复制到剪贴板'))
                .catch(() => Message.error('复制失败，请手动复制链接'));
        }
    });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initPage); 

// 生成报告内容
function generateReport() {
    const scores = storageUtils.get(CONSTANTS.STORAGE_KEYS.QUIZ_RESULT);
    if (!scores || !scores.dimensions) {
        throw new Error('测评数据不完整');
    }

    const date = new Date().toLocaleDateString();
    return `AI情侣契合度测试分析报告

生成日期：${date}

总体评分：${scores.total}分

维度得分：
- 性格特征：${scores.dimensions.personality}分
- 价值观：${scores.dimensions.values}分
- 生活习惯：${scores.dimensions.lifestyle}分

详细分析：
${generateDetailedAnalysis(scores.dimensions)}

改善建议：
${generateAdvice(scores.dimensions, 'short')}
${generateAdvice(scores.dimensions, 'medium')}
${generateAdvice(scores.dimensions, 'long')}
`;
}

// 生成详细分析
function generateDetailedAnalysis(dimensions) {
    const analysis = [];
    
    if (dimensions.personality) {
        analysis.push(`性格特征：
            ${dimensions.personality >= 80 
                ? '你们在性格特征方面非常契合，都能理解和接纳对方的处事方式。'
                : dimensions.personality >= 60
                ? '你们在性格特征方面存在一些差异，但这些差异是可以通过相互理解和包容来化解的。'
                : '你们在性格特征方面存在较大差异，需要更多的沟通和理解。'}`);
    }
    
    if (dimensions.values) {
        analysis.push(`价值观：
            ${dimensions.values >= 80
                ? '你们的价值观高度一致，对人生重要问题的看法比较接近。'
                : dimensions.values >= 60
                ? '你们在价值观方面有一些共同点，也存在一些差异���需要通过交流找到平衡点。'
                : '你们在价值观方面存在较大差异，建议深入交流，了解彼此的人生观。'}`);
    }
    
    if (dimensions.lifestyle) {
        analysis.push(`生活习惯：
            ${dimensions.lifestyle >= 80
                ? '你们的生活习惯比较接近，在日常生活中能够和谐相处。'
                : dimensions.lifestyle >= 60
                ? '你们在生活习惯上有一些差异，但通过适当的调整和配合，可以找到舒适的相处方式。'
                : '你们在生活习惯上存在较大差异，需要双方都做出一些改变和适应。'}`);
    }
    
    return analysis.join('\n\n');
}