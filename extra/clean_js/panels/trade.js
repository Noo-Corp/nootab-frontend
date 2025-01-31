const STATS_ENDPOINT = "https://trade.nootab.com/stats";
const GRAPH_ENDPOINT = "https://trade.nootab.com/graph";

let chartInstance = null;


function fetchStats(apiKey) {
    fetch(STATS_ENDPOINT, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${apiKey}`
        }
    })
    .then(response => {
        const serverStatus = document.getElementById("server-status");
        if (response.ok) {
            serverStatus.style.display = "none";
            return response.json();
        } else {
            serverStatus.style.display = "block";
            throw new Error('Failed to fetch stats');
        }
    })
    .then(data => {
        if (data) {
            updateStatsTable(data);
        }
    })
    .catch(() => {
        const serverStatus = document.getElementById("server-status");
        serverStatus.style.display = "block";
    });
}


function fetchGraph(apiKey) {
    fetch(GRAPH_ENDPOINT, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${apiKey}`
        }
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        }
    })
    .then(data => renderGraph(data))
    .catch(() => {});
}


function updateStatsTable(data) {
    const statsContainer = document.getElementById("stats-container");
    const statsBody = document.getElementById("stats-body");
    statsBody.innerHTML = "";

    if (!data) return;

    data.sort((a, b) => {
        const aPercent = parseFloat(a["Percent Gain"]);
        const bPercent = parseFloat(b["Percent Gain"]);
        return bPercent - aPercent;
    });

    const isPopped = getUrlParams().isPopped === "true";

    const bestAlgorithm = data[0];

    const panel = document.getElementById("best-algorithm-panel");
    const nameElement = document.getElementById("best-algorithm-name");
    const gainElement = document.getElementById("best-algorithm-gain");
    const avgSellElement = document.getElementById("best-algorithm-avg-sell");
    const winRateElement = document.getElementById("best-algorithm-win-rate");
    const profitFactorElement = document.getElementById("best-algorithm-profit-factor");

    if (!isPopped) {
        statsContainer.style.display = "none";
        panel.style.display = "block";

        nameElement.textContent = bestAlgorithm.Algorithm;
        gainElement.innerHTML = `${formatValue(bestAlgorithm["Gain"], "money")} <span id="best-algorithm-percent-gain">(${formatValue(bestAlgorithm["Percent Gain"], "percent")})</span>`;
        avgSellElement.innerHTML = formatValue(bestAlgorithm["Average Sell Gain"], "money");
        winRateElement.innerHTML = formatValue(bestAlgorithm["Win Rate"], "win_rate");
        profitFactorElement.innerHTML = formatValue(bestAlgorithm["Profit Factor"], "number", "profit_factor");
    } else {
        statsContainer.style.display = "block";
        panel.style.display = "none";
        
        data.forEach(row => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td class="holdings-cell">&#9776;</td>
                <td>${row.Algorithm}</td>
                <td>${formatValue(row["Gain"], "money")}</td>
                <td>${formatValue(row["Trade Gain"], "money")}</td>
                <td>${formatValue(row["Investment Gain"], "money")}</td>
                <td>${formatValue(row["Percent Gain"], "percent")}</td>
                <td>${row.Sells}</td>
                <td>${formatValue(row["Average Sell Gain"], "money")}</td>
                <td>${formatValue(row["Win Rate"], "win_rate")}</td>
                <td>${formatValue(row["Profit Factor"], "number", "profit_factor")}</td>
            `;

            const holdingsCell = tr.querySelector('.holdings-cell');
            holdingsCell.addEventListener('click', () => {
                let holdings = JSON.parse(row["Holdings"].replace(/'/g, '"'));
                let holdingsInfo = '';

                holdings.forEach(holding => {
                    holdingsInfo += `
                        Symbol: ${holding[0]}
                        Units: ${holding[1]}
                        Value: ${formatValue(holding[2], "money", "no-css")}
                        Avg Buy: ${formatValue(holding[3], "money", "no-css")}
                        Gain: ${formatValue(holding[4], "money", "no-css")}
                        Percent Gain: ${formatValue(holding[5], "percent", "no-css")}
                        
                    `;
                });

                alert(`HOLDINGS\n\n${holdingsInfo}`);
            });

            statsBody.appendChild(tr);
        });
    }
}


function formatValue(value, type, flag=null) {
    if (value === "N/A") {
        return value;
    }
    if (type === "money") {
        const number = parseFloat(value);
        if (number < 0) {
            if (flag == "no-css") {
                return `-$${Math.abs(number).toFixed(2)}`;
            }
            return `<span class="negative">-$${Math.abs(number).toFixed(2)}</span>`;
        }
        return `$${number.toFixed(2)}`;
    } else if (type === "percent") {
        const number = parseFloat(value);
        if (number < 0) {
            if (flag == "no-css") {
                return `${(parseFloat(value) * 100).toFixed(2)}%`;
            }
            return `<span class="negative">${(parseFloat(value) * 100).toFixed(2)}%</span>`;
        }
        return `${(parseFloat(value) * 100).toFixed(2)}%`;
    } else if (type === "win_rate") {
        const number = parseFloat(value);
        if (number < 0.5) {
            return `<span class="negative">${(parseFloat(value) * 100).toFixed(2)}%</span>`;
        }
        return `${(parseFloat(value) * 100).toFixed(2)}%`;
    } else if (type === "number") {
        const number = parseFloat(value);

        if (flag == "profit_factor") {
            if (number < 1) {
                return `<span class="negative">${(parseFloat(value)).toFixed(2)}</span>`;
            }
            return `${(parseFloat(value)).toFixed(2)}`;
        }

        if (number < 0) {
            if (flag == "no-css") {
                return `${(parseFloat(value)).toFixed(2)}`;
            }
            return `<span class="negative">${(parseFloat(value)).toFixed(2)}</span>`;
        }
        return `${(parseFloat(value)).toFixed(2)}`;
    }
    return value;
}


function saveApiKey() {
    const apiKey = document.getElementById("apiKey").value;
    if (!apiKey) {
        return;
    }

    fetch(STATS_ENDPOINT, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${apiKey}`
        }
    })
    .then(response => {
        if (response.ok) {
            localStorage.setItem("trade-api-key", apiKey);
            document.getElementById("api-key-input").style.display = "none";
            document.getElementById("best-algorithm-panel").style.display = "block";
            document.getElementById("graph-container").style.display = "block";
            document.getElementById("stats-container").style.display = "block";
            startFetchingStats();
            startFetchingGraph();
        }
    })
}


function startFetchingStats() {
    const apiKey = localStorage.getItem("trade-api-key");
    fetchStats(apiKey);
    setInterval(() => fetchStats(apiKey), 5000);
}


function startFetchingGraph() {
    const apiKey = localStorage.getItem("trade-api-key");
    fetchGraph(apiKey);
    setInterval(() => fetchGraph(apiKey), 150000);
}


function renderGraph(data) {
    const ctx = document.getElementById('algorithm-graph').getContext('2d');

    if (chartInstance) {
        chartInstance.destroy();
    }

    const algorithms = [...new Set(data.map(item => item.Algorithm))];
    const colours = [
        "#4CAF50", "#2196F3", "#FFC107", "#E91E63", "#9C27B0",
        "#FF5722", "#009688", "#3F51B5", "#CDDC39", "#FF9800",
        "#673AB7", "#00BCD4", "#8BC34A", "#607D8B", "#795548"
    ];

    const { isPopped } = getUrlParams();
    const isPoppedView = isPopped == "true";

    const datasets = algorithms.map((algorithm, index) => {
        const algorithmData = data
            .filter(item => item.Algorithm === algorithm)
            .sort((a, b) => new Date(a.Timestamp) - new Date(b.Timestamp));

        return {
            label: algorithm,
            data: algorithmData.map(item => ({
                x: new Date(item.Timestamp),
                y: parseFloat(item.Gain)
            })),
            borderColor: colours[index],
            fill: false,
            pointRadius: isPoppedView ? 3 : 0,
        };
    });

    const rootStyles = getComputedStyle(document.documentElement);
    const modeText = rootStyles.getPropertyValue('--modetext').trim();
    const modeText2 = rootStyles.getPropertyValue('--modetext2').trim();

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'minute',
                        tooltipFormat: 'MMM D, h:mm a',
                    },
                    title: {
                        display: false,
                    },
                    grid: {
                        color: "rgba(111, 111, 111, 0.4)",
                    },
                    ticks: {
                        maxTicksLimit: isPoppedView ? 24 : 4,
                        color: modeText,
                    }
                },
                y: {
                    title: {
                        display: false,
                    },
                    grid: {
                        color: "rgba(111, 111, 111, 0.4)",
                    },
                    ticks: {
                        color: function(c) {
                            if (c['tick']['value'] < 0) {
                                return '#ff5353';
                            } else {
                                return modeText;
                            }
                        },
                        font: {
                            size: isPoppedView ? 12 : 10,
                        },
                        callback: function(value) {
                            if (value < 0) {
                                return `-$${Math.abs(value).toFixed(2)}`;
                            }
                            return `$${value.toFixed(2)}`;
                        }
                    }
                },
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    display: isPoppedView,
                    labels: {
                        color: modeText2,
                        font: {
                            weight: 'bold'
                        }
                    }
                },
            },
        },
    });
}


function expandView() {
    const graphContainer = document.getElementById('graph-container');
    graphContainer.style.height = "60%";
    graphContainer.style.marginLeft = "4px";
    graphContainer.style.marginRight = "4px";
}


function getUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    return { isPopped: urlParams.get("popped") };
}


window.onload = () => {
    const apiKey = localStorage.getItem("trade-api-key");
    if (!apiKey) {
        document.getElementById("api-key-input").style.display = "flex";
        document.getElementById("best-algorithm-panel").style.display = "none";
        document.getElementById("graph-container").style.display = "none";
        document.getElementById("stats-container").style.display = "none";
        return;
    }

    startFetchingStats();
    startFetchingGraph();

    const { isPopped } = getUrlParams();
    if (isPopped == "true") {
        expandView();
    }
};
