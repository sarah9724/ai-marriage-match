// 雷达图组件
export const RadarChart = {
    // 创建雷达图
    create(container, data, options = {}) {
        const ctx = container.getContext('2d');
        
        return new Chart(ctx, {
            type: 'radar',
            data: {
                labels: data.labels,
                datasets: [{
                    label: '当前得分',
                    data: data.scores,
                    backgroundColor: 'rgba(52, 152, 219, 0.2)',
                    borderColor: 'rgba(52, 152, 219, 1)',
                    pointBackgroundColor: 'rgba(52, 152, 219, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(52, 152, 219, 1)'
                }, {
                    label: '平均水平',
                    data: data.averages,
                    backgroundColor: 'rgba(149, 165, 166, 0.2)',
                    borderColor: 'rgba(149, 165, 166, 1)',
                    pointBackgroundColor: 'rgba(149, 165, 166, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(149, 165, 166, 1)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        angleLines: {
                            display: true
                        },
                        suggestedMin: 0,
                        suggestedMax: 100
                    }
                },
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.raw}分`;
                            }
                        }
                    }
                },
                ...options
            }
        });
    }
}; 