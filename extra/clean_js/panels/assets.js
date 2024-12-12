window.addEventListener("load", function () {
    renderAccounts();
    updateNetWorth();

    populateGraphDropdown();

    const accountHistory = JSON.parse(localStorage.getItem("net-worth") || "[]");
    if (accountHistory.length != 0) {
        renderGraph();
    }

    const { isPopped } = getUrlParams();
    if (isPopped !== "true") {
        restrictView();
    }

    const goalInputField = document.getElementById("goal-value");
    goalInputField.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            addGoal();
        }
    });
});


function getUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    return { isPopped: urlParams.get("popped") };
}


const restrictView = () => {
    const poppedElements = document.querySelectorAll(".popped-element");
    poppedElements.forEach(el => el.style.display = "none");

    const dueBtn = document.getElementById("due-btn");

    document.getElementById("capital-container").style.border = "none";
    document.getElementById("capital-debt-container").style.marginTop = "20px";
    dueBtn.style.position = "relative";
    dueBtn.style.left = "initial";
    dueBtn.style.transform = "initial";
    dueBtn.style.fontSize = "12px";
    document.getElementById("graph-container").style.marginTop = 0;
    document.getElementById("graph-container").style.overflow = "hidden";
    document.getElementById("graph-data").style.height = "100%";
    document.getElementById("assets-container").style.marginLeft = 0;
    document.getElementById("assets-container").style.marginRight = 0;

    const goalsList = document.getElementById("goals-list");
    const goals = goalsList.querySelectorAll("li");
    goals.forEach((goal, index) => {
        if (index === 0) {
            goal.style.display = "flex";
            goal.querySelector(".goal-action").style.display = "none";
            goal.querySelector(".goal-date").style.display = "none";
            goal.querySelector(".goal-eta").style.marginRight = 0;
        } else {
            goal.style.display = "none";
        }
    });
};


const updateLastUpdate = () => {
    let lastUpdateDate = localStorage.getItem('lastUpdateDate') ? new Date(localStorage.getItem('lastUpdateDate')) : null;
    const currentDate = new Date();
    const diffDays = lastUpdateDate ? Math.floor((currentDate - lastUpdateDate) / (1000 * 3600 * 24)) : 0;
    const dueETA = 7 - diffDays;
    const dueBtn = document.querySelector("#due-btn");

    if (dueETA == 1) {
        dueBtn.innerHTML = "Update in <span id='update-time'>" + dueETA + "</span> Day";
    } else {
        dueBtn.innerHTML = "Update in <span id='update-time'>" + dueETA + "</span> Days";
    }

    if (dueETA == 0) {
        dueBtn.innerHTML = "Update <span id='update-time'>Now</span>";
        dueBtn.classList.add("due");
    } else if (dueETA < 0) {
        dueBtn.textContent = "Update Overdue";
        dueBtn.classList.add("overdue");
    } else {
        dueBtn.classList.remove("due");
        dueBtn.classList.remove("overdue");
    }
};


const calculateWeeklyRate = (accountHistory) => {
    if (accountHistory.length < 2) {
        return "";
    }

    const latestValue = accountHistory[accountHistory.length - 1].value;
    const secondLatestValue = accountHistory[accountHistory.length - 2].value;

    if (secondLatestValue === 0) {
        return latestValue === 0 
            ? `<span class="weekly-rate popped-element">(0.00%)</span>` 
            : `<span class="weekly-rate popped-element">(Infinity%)</span>`;
    }

    const weeklyRate = ((latestValue - secondLatestValue) / Math.abs(secondLatestValue)) * 100;

    return weeklyRate < 0 
        ? `<span class="weekly-rate negative popped-element">(${weeklyRate.toFixed(2)}%)</span>` 
        : `<span class="weekly-rate popped-element">(${weeklyRate.toFixed(2)}%)</span>`;
};


const formatCurrency = (amount, account=null) => {
    const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD"
    }).format(Math.abs(amount));

    let weeklyRate = "";
    if (account && account == "net-worth") {
        const accountHistory = JSON.parse(localStorage.getItem(account) || "[]");
        weeklyRate = calculateWeeklyRate(accountHistory);
    }
    return amount < 0 ? `<span class="negative" data-value="${amount}">-${formatted}${weeklyRate}</span></span>` : `<span data-value="${amount}">${formatted}${weeklyRate}</span></span>`;
};


const formatDays = (days) => {
    if (days <= 0) return "Achieved";
    const years = Math.floor(days / 365);
    const months = Math.floor((days % 365) / 30);
    const remainingDays = days % 30;
    const parts = [];
    if (years > 0) parts.push(`${years} year${years > 1 ? "s" : ""}`);
    if (months > 0) parts.push(`${months} month${months > 1 ? "s" : ""}`);
    if (remainingDays > 0) parts.push(`${remainingDays} day${remainingDays > 1 ? "s" : ""}`);
    return parts.join(", ");
};


const updateNetWorth = () => {
    const totalAssets = calculateTotal("capital");
    const totalDebt = calculateTotal("debt");
    const netWorth = totalAssets - totalDebt;

    const netWorthElement = document.getElementById("net-worth");
    netWorthElement.dataset.value = netWorth;
    netWorthElement.innerHTML = formatCurrency(netWorth, "net-worth");
};



const calculateTotal = (type) => {
    const accounts = JSON.parse(localStorage.getItem(type)) || {};
    return Object.values(accounts).reduce((sum, accountHistory) => {
        const lastValue = accountHistory[accountHistory.length - 1]?.value || 0;
        return sum + lastValue;
    }, 0);
};


const addAccount = (type) => {
    const nameInput = prompt(`Enter a name for the ${type.charAt(0).toUpperCase() + type.slice(1)} account:`);
    if (!nameInput) return;

    const name = nameInput.trim();
    if (!name) return;

    const initialValue = parseFloat(prompt("Enter the initial value for the account:"));
    if (isNaN(initialValue) || (initialValue < 0)) return;

    const accounts = JSON.parse(localStorage.getItem(type)) || {};
    if (accounts[name]) return;

    accounts[name] = [{ date: new Date().toLocaleDateString('en-US'), value: initialValue }];
    localStorage.setItem(type, JSON.stringify(accounts));

    updateDerivedValues();
    renderAccounts();
    updateNetWorth();
    renderGoals();
    populateGraphDropdown();
    renderGraphLog();
};


const renderAccounts = () => {
    ["capital", "debt"].forEach((type) => {
        const listElement = document.getElementById(`${type}-list`);
        listElement.innerHTML = "";

        const accounts = JSON.parse(localStorage.getItem(type)) || {};
        for (const [name, history] of Object.entries(accounts)) {
            const lastValue = history[history.length - 1]?.value || 0;

            const accountItem = document.createElement("li");
            accountItem.innerHTML = `
                <div>${name}</div>
                <div>${formatCurrency(lastValue)}</div>
                <div><button class="popped-element remove-button" onclick="deleteAccount('${type}', '${name}')">&#10006;</button></div>
            `;
            listElement.appendChild(accountItem);
        }

        const totalElement = document.getElementById(`${type}-total`);
        const totalValue = JSON.parse(localStorage.getItem(`total-${type}`)) || [];
        const latestValue = totalValue.length ? totalValue[totalValue.length - 1].value : 0;
        totalElement.innerHTML = "["+formatCurrency(latestValue)+"]";
    });

    updateDerivedValues();
    renderGoalsDropdown();
    renderGoals();
};


const deleteAccountGoals = (account) => {
    const goals = JSON.parse(localStorage.getItem("goals")) || [];
    const updatedGoals = goals.filter(goal => goal.account !== account);
    localStorage.setItem("goals", JSON.stringify(updatedGoals));
};


const deleteAccount = (type, name) => {
    if (confirm(`Are you sure you want to delete the ${type.charAt(0).toUpperCase() + type.slice(1)} account "${name}"?`)) {
        const accounts = JSON.parse(localStorage.getItem(type)) || {};
        delete accounts[name];
        localStorage.setItem(type, JSON.stringify(accounts));

        updateDerivedValues();
        renderAccounts();
        updateNetWorth();
        renderGoals();
        populateGraphDropdown();
        renderGraphLog();
    }
};


const updateBalances = () => {
    ["capital", "debt"].forEach((type) => {
        const accounts = JSON.parse(localStorage.getItem(type)) || {};
        for (const [name, history] of Object.entries(accounts)) {
            const lastValue = history[history.length - 1]?.value || 0;
            const lastDateRaw = new Date(history[history.length - 1]?.date);
            const lastDate = lastDateRaw.toLocaleDateString("en-US");
            const lastDateFormatted = lastDateRaw.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric"
            });

            const formattedValue = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD"
            }).format(Math.abs(lastValue));

            const newValue = prompt(
                `━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                `     ✨ Account Update ✨     \n` +
                `━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
                `📂 Account: ${name}\n` +
                `💰 Last Balance (as of ${lastDateFormatted}): ${formattedValue}\n\n` +
                `➡️ Enter the updated balance below,\n` +
                `   or press OK to keep the same value.\n\n` +
                `━━━━━━━━━━━━━━━━━━━━━━━━━`
            );

            const parsedValue = newValue === null || newValue.trim() === "" ? lastValue : parseFloat(newValue);
            if (!isNaN(parsedValue)) {
                const todayDate = new Date().toLocaleDateString("en-US");

                if (lastDate === todayDate) {
                    history[history.length - 1] = { date: todayDate, value: parsedValue };
                } else {
                    history.push({ date: todayDate, value: parsedValue });
                }
            }
        }
        localStorage.setItem(type, JSON.stringify(accounts));
    });

    updateDerivedValues();
    renderAccounts();
    updateNetWorth();
    renderGraphLog();

    const currentDate = new Date();
    localStorage.setItem('lastUpdateDate', currentDate.toISOString());
    updateLastUpdate();

    const { isPopped } = getUrlParams();
    if (isPopped !== "true") {
        restrictView();
    }
};


const updateDerivedValues = () => {
    const updateDerivedValue = (key, value) => {
        const history = JSON.parse(localStorage.getItem(key)) || [];
        const todayDate = new Date().toLocaleDateString("en-US");

        if (history.length && history[history.length - 1].date === todayDate) {
            history[history.length - 1].value = value;
        } else {
            history.push({ date: todayDate, value });
        }

        localStorage.setItem(key, JSON.stringify(history));
    };

    // Calculate and update total capital
    const totalCapital = calculateTotal("capital");
    updateDerivedValue("total-capital", totalCapital);

    // Calculate and update total debt
    const totalDebt = calculateTotal("debt");
    updateDerivedValue("total-debt", totalDebt);

    // Calculate and update net worth
    const netWorth = totalCapital - totalDebt;
    updateDerivedValue("net-worth", netWorth);
};


const renderGoalsDropdown = () => {
    const dropdown = document.getElementById("goal-account");
    dropdown.innerHTML = "";

    const specialOptions = [
        { value: "net-worth", label: "Net Worth" },
        { value: "total-capital", label: "Total Capital" },
        { value: "total-debt", label: "Total Debt" }
    ];

    specialOptions.forEach(option => {
        const specialOption = document.createElement("option");
        specialOption.value = option.value;
        specialOption.textContent = option.label;
        dropdown.appendChild(specialOption);
    });

    ["capital", "debt"].forEach((type) => {
        const accounts = JSON.parse(localStorage.getItem(type)) || {};
        for (const name of Object.keys(accounts)) {
            const option = document.createElement("option");
            option.value = `${type}-${name}`;
            option.textContent = `${name}`;
            dropdown.appendChild(option);
        }
    });
};


const renderGoals = () => {
    const goalsList = document.getElementById("goals-list");
    goalsList.innerHTML = "";

    const goals = JSON.parse(localStorage.getItem("goals")) || [];
    const accountsData = {
        ...JSON.parse(localStorage.getItem("capital") || "{}"),
        ...JSON.parse(localStorage.getItem("debt") || "{}"),
        "net-worth": JSON.parse(localStorage.getItem("net-worth") || "[]"),
        "total-capital": JSON.parse(localStorage.getItem("total-capital") || "[]"),
        "total-debt": JSON.parse(localStorage.getItem("total-debt") || "[]"),
    };

    const calculateSpecialValue = (type) => {
        switch (type) {
            case "net-worth":
                return calculateTotal("capital") - calculateTotal("debt");
            case "total-capital":
                return calculateTotal("capital");
            case "total-debt":
                return calculateTotal("debt");
            default:
                return null;
        }
    };

    const processedGoals = goals.map(goal => {
        const isSpecialGoal = ["net-worth", "total-capital", "total-debt"].includes(goal.account);

        let accountHistory;

        if (isSpecialGoal) {
            accountHistory = accountsData[goal.account] || [];
        } else {
            accountHistory = accountsData[goal.account.split("-")[1]] || [];
        }

        const currentValue = isSpecialGoal ? calculateSpecialValue(goal.account) : (accountHistory?.length ? accountHistory[accountHistory.length - 1].value : 0);

        if (accountHistory.length < 2) {
            return { ...goal, etaDays: null, etaDate: null, notEnoughData: true, notAchievable: false };
        }

        const totalChange = accountHistory[accountHistory.length - 1].value - accountHistory[0].value;
        const totalDays = (new Date(accountHistory[accountHistory.length - 1].date) - new Date(accountHistory[0].date)) / (1000 * 60 * 60 * 24);
        const dailyRate = totalDays != 0 ? totalChange / totalDays : 0;

        const remainingValue = goal.value - currentValue;
        const etaDays = dailyRate != 0 ? Math.ceil(remainingValue / dailyRate) : -1;

        if (etaDays <= 0) {
            return { ...goal, etaDays: null, etaDate: null, notEnoughData: false, notAchievable: true };
        }

        const etaDate =  new Date(Date.now() + etaDays * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });

        return {
            ...goal,
            etaDays,
            etaDate,
            notEnoughData: accountHistory.length < 2,
            notAchievable: etaDays <= 0,
        };
    });

    const sortedGoals = processedGoals.sort((a, b) => {
        if (a.etaDays === null) return 1;
        if (b.etaDays === null) return -1;
        return a.etaDays - b.etaDays;
    });

    sortedGoals.forEach((goal) => {
        const isSpecialGoal = ["net-worth", "total-capital", "total-debt"].includes(goal.account);
        const displayName = isSpecialGoal ? goal.account.replace(/-/g, " ") : goal.account.split("-")[1];

        const etaText = goal.notEnoughData
            ? "Not enough data"
            : goal.notAchievable
                ? "N/A"
                : formatDays(goal.etaDays);

        const etaDateText = goal.notEnoughData || goal.notAchievable
            ? ""
            : goal.etaDate || "";

        const goalItem = document.createElement("li");
        const dateText = etaDateText === "" ? "N/A" : etaDateText;
        goalItem.innerHTML = `
            <div class="goal-title">${formatCurrency(goal.value)} <span class="goal-account-name">-- ${displayName}</span></div>
            <div class="goal-eta">${etaText}</div>
            <div class="goal-date">${dateText}</div>
            <div class="goal-action"><button class="popped-element remove-button" onclick="deleteGoal('${goal.id}')">&#10006;</button></div>
        `;
        goalsList.appendChild(goalItem);
    });
};


const addGoal = () => {
    const dropdown = document.getElementById("goal-account");
    const goalAccount = dropdown.value;
    const goalInput = document.getElementById("goal-value");
    const goalValue = parseFloat(goalInput.value);

    if (!goalAccount || isNaN(goalValue)) return;

    const goals = JSON.parse(localStorage.getItem("goals")) || [];
    const goalId = Date.now().toString();
    goals.push({ id: goalId, account: goalAccount, value: goalValue });
    localStorage.setItem("goals", JSON.stringify(goals));

    goalInput.value = "";

    renderGoals();
};


const deleteGoal = (goalId) => {
    const goals = JSON.parse(localStorage.getItem("goals")) || [];
    const updatedGoals = goals.filter(goal => goal.id !== goalId);
    localStorage.setItem("goals", JSON.stringify(updatedGoals));
    renderGoals();
};


const populateGraphDropdown = () => {
    const dropdown = document.getElementById("account-selector");
    dropdown.innerHTML = "";

    const specialOptions = [
        { value: "net-worth", label: "Net Worth" },
        { value: "total-capital", label: "Total Capital" },
        { value: "total-debt", label: "Total Debt" }
    ];

    specialOptions.forEach(option => {
        const specialOption = document.createElement("option");
        specialOption.value = option.value;
        specialOption.textContent = option.label;
        dropdown.appendChild(specialOption);
    });

    ["capital", "debt"].forEach((type) => {
        const accounts = JSON.parse(localStorage.getItem(type)) || {};
        for (const name of Object.keys(accounts)) {
            const option = document.createElement("option");
            option.value = `${type}-${name}`;
            option.textContent = `${name}`;
            dropdown.appendChild(option);
        }
    });
};


const toggleGraphLogView = () => {
    let isLogView = document.getElementById("account-graph") === null;
    
    isLogView = !isLogView;
    if (isLogView) {
        document.getElementById("graph-data").classList.add("height-limit");
        renderLogs();
    } else {
        document.getElementById("graph-data").classList.remove("height-limit");
        renderGraph();
    }
    const logView = document.getElementById('toggle-log-view');
    if (isLogView) {
        logView.innerHTML = "&#9736;";
        logView.classList.add("log-view-pad");
    } else {
        logView.innerHTML = "&#9776;";
        logView.classList.remove("log-view-pad");
    }

    const box = document.getElementById("main-container");
    box.scrollTop = box.scrollHeight;
}


const renderGraphLog = (dropTrigger = false) => {
    const isLogView = document.getElementById("account-graph") === null;

    if (isLogView) {
        document.getElementById("graph-data").classList.add("height-limit");
        renderLogs();
    } else {
        document.getElementById("graph-data").classList.remove("height-limit");
        renderGraph();
    }

    if (dropTrigger) {
        const box = document.getElementById("main-container");
        box.scrollTop = box.scrollHeight;
    }
}


const renderGraph = () => {
    const graphContainer = document.getElementById("graph-data");
    graphContainer.innerHTML = '<canvas id="account-graph"></canvas>';

    const dropdown = document.getElementById("account-selector");
    const selectedAccount = dropdown.value;

    const accountsData = {
        ...JSON.parse(localStorage.getItem("capital") || "{}"),
        ...JSON.parse(localStorage.getItem("debt") || "{}"),
        "net-worth": JSON.parse(localStorage.getItem("net-worth") || "[]"),
        "total-capital": JSON.parse(localStorage.getItem("total-capital") || "[]"),
        "total-debt": JSON.parse(localStorage.getItem("total-debt") || "[]"),
    };

    const isSpecialGoal = ["net-worth", "total-capital", "total-debt"].includes(selectedAccount);

    let accountHistory;

    if (isSpecialGoal) {
        accountHistory = accountsData[selectedAccount] || [];
    } else {
        accountHistory = accountsData[selectedAccount.split("-")[1]] || [];
    }

    if (accountHistory.length === 0) {
        alert("Not enough data available for this account.");
        return;
    }

    const labels = accountHistory.map(entry => entry.date);
    const data = accountHistory.map(entry => entry.value);

    const canvas = document.getElementById("account-graph");
    const ctx = canvas.getContext("2d");

    if (canvas.dataset.chartInstance) {
        const existingChart = Chart.getChart(canvas);
        if (existingChart) {
            existingChart.destroy();
        }
    }

    const linearRegression = (x, y) => {
        const n = x.length;
        const sumX = x.reduce((acc, val) => acc + val, 0);
        const sumY = y.reduce((acc, val) => acc + val, 0);
        const sumXY = x.reduce((acc, val, idx) => acc + (val * y[idx]), 0);
        const sumX2 = x.reduce((acc, val) => acc + (val * val), 0);

        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        return { slope, intercept };
    };

    const xValues = accountHistory.map(entry => new Date(entry.date).getTime());
    const yValues = accountHistory.map(entry => entry.value);

    const { slope, intercept } = linearRegression(xValues, yValues);
    
    const regressionLine = xValues.map(xVal => ({
        x: xVal,
        y: slope * xVal + intercept
    }));

    const rootStyles = getComputedStyle(document.documentElement);
    const modeText = rootStyles.getPropertyValue('--modetext').trim();
    const mainColur = rootStyles.getPropertyValue('--main').trim();
    const mainColurHover = rootStyles.getPropertyValue('--hover').trim();
    const secondaryColour = rootStyles.getPropertyValue('--secondary').trim();

    const accountChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "",
                data: data,
                borderColor: mainColur,
                backgroundColor: mainColurHover,
                borderWidth: 2,
                tension: 0
            }, {
                label: "Linear Fit",
                data: regressionLine,
                borderColor: secondaryColour,
                borderWidth: 2,
                fill: false,
                showLine: true,
                pointRadius: 0,
                borderDash: [5, 5]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day',
                        tooltipFormat: 'll',
                        displayFormats: {
                            day: 'MMM D'
                        }
                    },
                    title: {
                        display: false
                    },
                    grid: {
                        color: "rgba(111, 111, 111, 0.4)",
                    },
                    ticks: {
                        color: modeText,
                    }
                },
                y: {
                    title: {
                        display: false
                    },
                    beginAtZero: true,
                    grid: {
                        color: "rgba(111, 111, 111, 0.4)",
                    },
                    ticks: {
                        color: modeText,
                        callback: function(value) {
                            return '$' + new Intl.NumberFormat().format(value.toFixed(2));
                        }
                    }
                }
            }
        }
    });

    canvas.dataset.chartInstance = accountChart.id;
};


const generateLogRows = (accountHistory, debtAccount=false) => {
    let rows = '';
    for (let i = accountHistory.length - 1; i >= 0; i--) {
        const entry = accountHistory[i];
        const nextEntry = i > 0 ? accountHistory[i - 1] : null;

        let absoluteChange = nextEntry ? entry.value - nextEntry.value : 0;
        let relativeChange = nextEntry ? (absoluteChange / nextEntry.value) * 100 : 0;

        const formattedAbs = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD"
        }).format(Math.abs(absoluteChange));

        // Highlight the highest and lowest values
        let isHighest = i === accountHistory.findIndex(e => e.value === Math.max(...accountHistory.map(a => a.value)));
        let isLowest = i === accountHistory.findIndex(e => e.value === Math.min(...accountHistory.map(a => a.value)));

        if (debtAccount) {
            let tempVar = isHighest;
            isHighest = isLowest;
            isLowest = tempVar;
        
            absoluteChange = absoluteChange == 0
            ? `<span>${formattedAbs}</span>`
            : absoluteChange > 0
            ? `<span class="negative">${formattedAbs}</span>`
            : `<span>-${formattedAbs}</span>`;

            relativeChange = relativeChange > 0 
            ? `<span class="negative">${relativeChange.toFixed(2)}%</span>` 
            : `<span>${relativeChange.toFixed(2)}%</span>`;
        } else {
            absoluteChange = absoluteChange < 0
            ? `<span class="negative">-${formattedAbs}</span>`
            : `<span>${formattedAbs}</span>`;

            relativeChange = relativeChange < 0 
            ? `<span class="negative">${relativeChange.toFixed(2)}%</span>` 
            : `<span>${relativeChange.toFixed(2)}%</span>`;
        }

        rows += `
            <tr class="${isHighest ? 'highest' : isLowest ? 'lowest' : ''}">
                <td>${entry.date}</td>
                <td>${formatCurrency(entry.value)}</td>
                <td>${absoluteChange}</td>
                <td>${relativeChange}</td>
            </tr>
        `;
    }
    return rows;
};


const renderLogs = () => {
    const dropdown = document.getElementById("account-selector");
    const selectedAccount = dropdown.value;

    const accountsData = {
        ...JSON.parse(localStorage.getItem("capital") || "{}"),
        ...JSON.parse(localStorage.getItem("debt") || "{}"),
        "net-worth": JSON.parse(localStorage.getItem("net-worth") || "[]"),
        "total-capital": JSON.parse(localStorage.getItem("total-capital") || "[]"),
        "total-debt": JSON.parse(localStorage.getItem("total-debt") || "[]"),
    };

    const isSpecialGoal = ["net-worth", "total-capital", "total-debt"].includes(selectedAccount);

    let accountHistory;

    if (isSpecialGoal) {
        accountHistory = accountsData[selectedAccount] || [];
    } else {
        accountHistory = accountsData[selectedAccount.split("-")[1]] || [];
    }

    let debtAccount = false;

    if (selectedAccount == "total-debt" || selectedAccount.split("-")[0] == "debt") {
        debtAccount = true;
    }

    if (accountHistory.length === 0) {
        alert("Not enough data available for this account.");
        return;
    }

    const logContainer = document.getElementById("graph-data");
    logContainer.innerHTML = `
        <table id="log-table">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Value</th>
                    <th>Absolute &#916;</th>
                    <th>Relative &#916;</th>
                </tr>
            </thead>
            <tbody>
                ${generateLogRows(accountHistory, debtAccount)}
            </tbody>
        </table>
    `;
};
