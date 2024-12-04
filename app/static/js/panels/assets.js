window.addEventListener("load", function () {
    renderAccounts();
    updateNetWorth();
    toggleMoneyVisibility(false);
});


const toggleMoneyVisibility = (toggled=true) => {
    let hideMoney = JSON.parse(localStorage.getItem("hideMoney")) || false;

    if (toggled) {
        hideMoney = !hideMoney;
        localStorage.setItem("hideMoney", hideMoney);
    }
    
    const moneyElements = document.querySelectorAll(".money-value");
    moneyElements.forEach(el => {
        const value = parseFloat(el.dataset.value);
        el.innerHTML = hideMoney ? formatHiddenCurrency(value) : formatCurrency(value);
    });

    document.getElementById("toggle-money").textContent = hideMoney ? "Show Money" : "Hide Money";
};


const formatHiddenCurrency = (amount) => {
    const absAmount = Math.abs(amount).toFixed(2).replace(/[\d.]/g, "*");
    return `<span class="money-value" data-value="${amount}">$${absAmount}</span>`;
};


const formatCurrency = (amount) => {
    const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD"
    }).format(Math.abs(amount));
    return amount < 0 ? `<span class="negative" data-value="${amount}">-${formatted}</span>` : `<span class="money-value" data-value="${amount}">${formatted}</span>`;
};


const getFormattedCurrency = (amount) => {
    const hideMoney = JSON.parse(localStorage.getItem("hideMoney")) || false;
    return hideMoney ? formatHiddenCurrency(amount) : formatCurrency(amount);
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
    netWorthElement.innerHTML = getFormattedCurrency(netWorth);
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

    renderAccounts();
    updateNetWorth();
    toggleMoneyVisibility(false);
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
                ${name} ${getFormattedCurrency(lastValue)}
                <button onclick="deleteAccount('${type}', '${name}')">Delete</button>
            `;
            listElement.appendChild(accountItem);
        }

        const totalElement = document.getElementById(`${type}-total`);
        const totalValue = JSON.parse(localStorage.getItem(`total-${type}`)) || [];
        const latestValue = totalValue.length ? totalValue[totalValue.length - 1].value : 0;
        totalElement.innerHTML = getFormattedCurrency(latestValue);
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
        toggleMoneyVisibility(false);
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

            const newValue = prompt(
                `Account: ${name}\n` +
                `Balance as of ${lastDateFormatted}: ${formatCurrency(lastValue)}\n\n` +
                "Enter the updated balance, or press OK to keep the same value:"
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
    toggleMoneyVisibility(false);
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
            option.textContent = `${name} (${type.charAt(0).toUpperCase() + type.slice(1)})`;
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
            <div class="goal-title">${displayName}${isSpecialGoal ? "" : ` (${goal.account.split("-")[0].charAt(0).toUpperCase() + goal.account.split("-")[0].slice(1)})`} to ${getFormattedCurrency(goal.value)}</div>
            <div class="goal-eta">${etaText}</div>
            <div class="goal-date">${dateText}</div>
            <div class="goal-action"><button onclick="deleteGoal('${goal.id}')">&#10006;</button></div>
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
    toggleMoneyVisibility(false);
};


const deleteGoal = (goalId) => {
    const goals = JSON.parse(localStorage.getItem("goals")) || [];
    const updatedGoals = goals.filter(goal => goal.id !== goalId);
    localStorage.setItem("goals", JSON.stringify(updatedGoals));
    renderGoals();
    toggleMoneyVisibility(false);
};