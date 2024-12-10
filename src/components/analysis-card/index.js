// 分析卡片组件
export const AnalysisCard = {
    // 创建分析卡片
    create({ title, score, content, suggestions }) {
        const card = document.createElement('div');
        card.className = 'analysis-card';
        
        card.innerHTML = `
            <div class="card-header">
                <h3 class="card-title">${title}</h3>
                <div class="card-score">
                    <span class="score-number">${score}</span>
                    <span class="score-label">分</span>
                </div>
            </div>
            <div class="card-content">
                <div class="content-section">
                    <h4>详细分析</h4>
                    <p>${content}</p>
                </div>
                <div class="suggestions-section">
                    <h4>改进建议</h4>
                    <ul class="suggestions-list">
                        ${suggestions.map(item => `
                            <li class="suggestion-item">
                                <span class="suggestion-icon">✦</span>
                                <span class="suggestion-text">${item}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            </div>
        `;
        
        return card;
    }
}; 