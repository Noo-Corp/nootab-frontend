const goalTypes = [
    "pathway-goals-ongoing",
    "pathway-goals-current",
    "pathway-goals-next",
    "pathway-goals-short",
    "pathway-goals-medium",
    "pathway-goals-long",
    "pathway-goals-past"
];

const goalTypeHeaders = {
    "pathway-goals-ongoing": "Ongoing",
    "pathway-goals-current": "Current",
    "pathway-goals-next": "Next",
    "pathway-goals-short": "Short Term",
    "pathway-goals-medium": "Medium Term",
    "pathway-goals-long": "Long Term",
    "pathway-goals-past": "Past"
};


window.addEventListener("load", function () {
    const bingoTitle = document.getElementById("bingo-title");
    bingoTitle.textContent = new Date().getFullYear() + " BINGO";

    const viewType = localStorage.getItem("pathway-view");

    if (!viewType || viewType == "pathway") {
        goalStart();
    } else if (viewType == "bingo") {
        bingoStart();
    }
});


function goalStart() {
    document.getElementById("main-title").classList.add("current-title");
    document.getElementById("bingo-title").classList.remove("current-title");
    document.getElementById("main-container").style.height = "calc(100% - 60px)";
    document.getElementById("title-container").style.borderTop = "2px solid var(--modeback)";
    loadGoals();
}


function bingoStart() {
    document.getElementById("main-title").classList.remove("current-title");
    document.getElementById("bingo-title").classList.add("current-title");
    document.getElementById("main-container").style.height = "calc(100% - 45px)";
    document.getElementById("title-container").style.borderTop = "none";
    loadBingo();
}


function getUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    return { isPopped: urlParams.get("popped") };
}


function setView(view) {
    localStorage.setItem("pathway-view", view);

    if (view === "pathway") {
        goalStart();
    } else if (view === "bingo") {
        bingoStart();
    }
}


function loadBingo() {
    let bingoContainer = document.getElementById("goals-list");
    bingoContainer.innerHTML = "";

    const boardSize = 5;
    let bingoData = JSON.parse(localStorage.getItem("bingo-data")) || {
        checked: Array(boardSize).fill().map(() => Array(boardSize).fill(false)),
        texts: Array(boardSize).fill().map(() => Array(boardSize).fill("_")),
    };

    const table = document.createElement("table");
    table.classList.add("bingo-table");

    for (let row = 0; row < boardSize; row++) {
        const tr = document.createElement("tr");

        for (let col = 0; col < boardSize; col++) {
            const td = document.createElement("td");
            td.classList.add("bingo-cell");
            td.dataset.row = row;
            td.dataset.col = col;

            const span = document.createElement("span");
            span.classList.add("bingo-text");
            span.textContent = bingoData.texts[row][col];
            span.contentEditable = true;
            span.spellcheck = false;

            if (row === 2 && col === 2) {
                span.textContent = "Free";
                span.contentEditable = false;
                td.classList.add("checked", "checked-free");
                bingoData.checked[row][col] = true;
            }

            span.addEventListener("click", function(e) {
                e.stopPropagation();
            })

            span.addEventListener("input", function () {
                bingoData.texts[row][col] = this.textContent;
                localStorage.setItem("bingo-data", JSON.stringify(bingoData));
            });

            td.addEventListener("click", function () {
                if (row === 2 && col === 2) return;

                bingoData.checked[row][col] = !bingoData.checked[row][col];
                localStorage.setItem("bingo-data", JSON.stringify(bingoData));

                this.classList.toggle("checked");
                checkBingo(bingoData.checked);
            });

            if (bingoData.checked[row][col]) {
                td.classList.add("checked");
            }

            td.appendChild(span);
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }

    bingoContainer.appendChild(table);
    checkBingo(bingoData.checked);
}


function checkBingo(checkedCells) {
    const boardSize = 5;
    let bingoCount = 0;

    for (let i = 0; i < boardSize; i++) {
        if (checkedCells[i].every(cell => cell)) bingoCount++;
        if (checkedCells.map(row => row[i]).every(cell => cell)) bingoCount++;
    }

    if (checkedCells.map((row, i) => row[i]).every(cell => cell)) bingoCount++;
    if (checkedCells.map((row, i) => row[boardSize - 1 - i]).every(cell => cell)) bingoCount++;

    if (bingoCount == 0) {
        document.querySelector(".bingo-cell.checked.checked-free").innerText = "FREE";
    } else if (bingoCount == 1) {
        document.querySelector(".bingo-cell.checked.checked-free").innerText = "BINGO";
    } else if (bingoCount == 12) {
        document.querySelector(".bingo-cell.checked.checked-free").innerText = "FULL BINGO";
    } else {
        document.querySelector(".bingo-cell.checked.checked-free").innerText = "BINGO x" + bingoCount;
    }
}


function loadGoals() {
    const { isPopped } = getUrlParams();
    const goalsListElement = document.getElementById("goals-list");
    goalsListElement.innerHTML = "";

    const typesToShow = isPopped === "true" 
        ? goalTypes 
        : ["pathway-goals-ongoing", "pathway-goals-current"];

    let hasGoals = false;

    typesToShow.forEach((type) => {
        const savedGoals = JSON.parse(localStorage.getItem(type)) || [];

        if (savedGoals.length === 0 && isPopped !== "true") return; // Skip empty sections in non-popped view

        hasGoals = hasGoals || savedGoals.length > 0;

        const sectionElement = document.createElement("div");
        sectionElement.classList.add("goal-section");
        sectionElement.classList.add(`${goalTypeHeaders[type].toLowerCase().replace(/\s+/g, '-')}`);

        if (isPopped == "false") {
            sectionElement.classList.add("glance-view");
        }

        if (isPopped === "true") {
            const goalHeader = document.createElement("div");
            goalHeader.className = "goal-section-header";
            goalHeader.classList.add(`${goalTypeHeaders[type].toLowerCase().replace(/\s+/g, '-')}`);
            goalHeader.innerHTML = `<span class="header-chevron">&#9660;</span> ${goalTypeHeaders[type]}`;
            const goalChevron = goalHeader.querySelector(".header-chevron");
            goalHeader.addEventListener("click", () => {
                const goalSection = sectionElement.querySelectorAll(".goal");
                const addGoalContainer = sectionElement.querySelector(".add-goal-container");
                const noGoalContainer = sectionElement.querySelector(".no-goals");
                const isCollapsed = goalChevron.textContent == "▶";
            
                goalChevron.innerHTML = isCollapsed ? "&#9660;" : "&#9654;";
                goalSection.forEach((goal) => {
                    goal.style.display = isCollapsed ? "flex" : "none";
                });
                if (addGoalContainer) {
                    addGoalContainer.style.display = isCollapsed ? "flex" : "none";
                }
                if (noGoalContainer) {
                    noGoalContainer.style.display = isCollapsed ? "block" : "none";
                }
            });
            sectionElement.appendChild(goalHeader);
        }

        // Add "No goals" message if no saved goals
        if (savedGoals.length === 0) {
            const noGoalsMessage = document.createElement("div");
            noGoalsMessage.className = "no-goals";
            noGoalsMessage.textContent = "(No goals yet)";
            sectionElement.appendChild(noGoalsMessage);
        } else {
            savedGoals.forEach((goal, index) => {
                const goalElement = document.createElement("div");
                goalElement.className = "goal";

                if (isPopped == "false") {
                    goalElement.classList.add("glance-view");
                }

                // Goal Title (Editable in Popped View)
                const goalTitle = document.createElement("div");
                goalTitle.className = "goal-title";
                if (isPopped === "true") {
                    goalTitle.innerHTML = `<span class="editable-value title">${goal.name}</span>`;
                    const titleValue = goalTitle.querySelector(".editable-value");
                    titleValue.contentEditable = "true";
                    titleValue.addEventListener("blur", () => {
                        updateGoalField(type, index, "name", titleValue.textContent.trim());
                    });
                    titleValue.addEventListener("keydown", (e) => handleKeydown(e, type, index, "name", titleValue));
                } else {
                    goalTitle.innerHTML = goal.name;
                }
                goalElement.appendChild(goalTitle);

                // Category (Editable Value Only)
                const goalCategory = document.createElement("div");
                goalCategory.className = "goal-category";
                if (isPopped === "true") {
                    goalCategory.innerHTML = `<span class="editable-value">${goal.category}</span>`;
                    const categoryValue = goalCategory.querySelector(".editable-value");
                    categoryValue.contentEditable = "true";
                    categoryValue.addEventListener("blur", () => {
                        updateGoalField(type, index, "category", categoryValue.textContent.trim());
                    });
                    categoryValue.addEventListener("keydown", (e) => handleKeydown(e, type, index, "category", categoryValue));
                } else {
                    goalCategory.innerHTML = `${goal.category}`;
                }
                goalElement.appendChild(goalCategory);

                // Milestone (Editable Value Only)
                if (isPopped === "true") {
                    const goalMilestone = document.createElement("div");
                    goalMilestone.className = "goal-milestone";
        
                    if (goal.milestone) {
                        goalMilestone.innerHTML = `<span class="editable-value">${goal.milestone}</span>`;
                    } else {
                        goalMilestone.innerHTML = '<span class="editable-value">_</span>';
                    }
                    const milestoneValue = goalMilestone.querySelector(".editable-value");
                    milestoneValue.contentEditable = "true";
                    milestoneValue.addEventListener("blur", () => {
                        updateGoalField(type, index, "milestone", milestoneValue.textContent.trim());
                    });
                    milestoneValue.addEventListener("keydown", (e) => handleKeydown(e, type, index, "milestone", milestoneValue));
                    goalElement.appendChild(goalMilestone);
                }

                // Buttons (Only in Popped View)
                if (isPopped === "true") {
                    const buttonContainer = document.createElement("div");
                    buttonContainer.classList.add("goal-actions");

                    const promoteButton = document.createElement("button");
                    promoteButton.innerHTML = "&#8613;";
                    promoteButton.addEventListener("click", () => promoteGoal(type, index));
                    buttonContainer.appendChild(promoteButton);

                    const demoteButton = document.createElement("button");
                    demoteButton.innerHTML = "&#8615;";
                    demoteButton.addEventListener("click", () => demoteGoal(type, index));
                    buttonContainer.appendChild(demoteButton);

                    const completeButton = document.createElement("button");
                    completeButton.innerHTML = "&#9745;";
                    completeButton.addEventListener("click", () => completeGoal(type, index));
                    buttonContainer.appendChild(completeButton);

                    const removeButton = document.createElement("button");
                    removeButton.className = "action-remove";
                    removeButton.innerHTML = "&#10006;";
                    removeButton.addEventListener("click", () => removeGoal(type, index));
                    buttonContainer.appendChild(removeButton);

                    goalElement.appendChild(buttonContainer);
                }

                sectionElement.appendChild(goalElement);
            });
        }

        // Add Goal Section for Popped View
        if (isPopped === "true") {
            const addGoalContainer = document.createElement("div");
            addGoalContainer.classList.add("add-goal-container");
        
            // Unique Inputs for Name, Category, and Milestone
            const nameInput = document.createElement("input");
            nameInput.type = "text";
            nameInput.className = "flex-name-input";
            nameInput.id = `goal-name-input-${type}`;
            nameInput.placeholder = "Goal Name";
        
            const categoryInput = document.createElement("input");
            categoryInput.type = "text";
            categoryInput.className = "flex-category-input";
            categoryInput.id = `goal-category-input-${type}`;
            categoryInput.placeholder = "Category";
        
            const milestoneInput = document.createElement("input");
            milestoneInput.type = "text";
            milestoneInput.className = "flex-milestone-input";
            milestoneInput.id = `goal-milestone-input-${type}`;
            if (type == "pathway-goals-past") {
                milestoneInput.placeholder = "Result (Optional)";
            } else {
                milestoneInput.placeholder = "Next Milestone (Optional)";
            }
        
            // Add Button
            const addButton = document.createElement("button");
            addButton.textContent = "+";
            addButton.addEventListener("click", () => {
                addGoal(type);
            });
        
            addGoalContainer.appendChild(nameInput);
            addGoalContainer.appendChild(categoryInput);
            addGoalContainer.appendChild(milestoneInput);
            addGoalContainer.appendChild(addButton);
        
            sectionElement.appendChild(addGoalContainer);
        }

        goalsListElement.appendChild(sectionElement);
    });

    if (!hasGoals) {
        if(isPopped == "false") {
            const noGoalsOverallMessage = document.createElement("div");
            noGoalsOverallMessage.className = "no-goals-overall";
            noGoalsOverallMessage.innerHTML = "No ongoing or current goals<br>Click <span>&#10063;</span> to add goals";
            goalsListElement.appendChild(noGoalsOverallMessage);
        }
    }
}


function addGoal(goalType) {
    const nameInput = document.getElementById(`goal-name-input-${goalType}`);
    const categoryInput = document.getElementById(`goal-category-input-${goalType}`);
    const milestoneInput = document.getElementById(`goal-milestone-input-${goalType}`);

    const name = nameInput.value.trim();
    const category = categoryInput.value.trim();
    const milestone = milestoneInput.value.trim();

    if (!name || !category) {
        alert("Both Goal Name and Category are required to add a goal.");
        return;
    }

    const savedGoals = JSON.parse(localStorage.getItem(goalType)) || [];
    savedGoals.push({ name, category, milestone: milestone || "" });
    localStorage.setItem(goalType, JSON.stringify(savedGoals));

    // Clear inputs
    nameInput.value = "";
    categoryInput.value = "";
    milestoneInput.value = "";

    loadGoals();
}


function removeGoal(type, index) {
    const savedGoals = JSON.parse(localStorage.getItem(type)) || [];
    savedGoals.splice(index, 1);
    localStorage.setItem(type, JSON.stringify(savedGoals));
    loadGoals();
}


function promoteGoal(type, index) {
    const currentIndex = goalTypes.indexOf(type);
    if (currentIndex == 0) return;

    const savedGoals = JSON.parse(localStorage.getItem(type)) || [];
    const goal = savedGoals.splice(index, 1)[0];
    localStorage.setItem(type, JSON.stringify(savedGoals));

    const newType = goalTypes[currentIndex - 1];
    const newGoals = JSON.parse(localStorage.getItem(newType)) || [];
    newGoals.push(goal);
    localStorage.setItem(newType, JSON.stringify(newGoals));

    loadGoals();
}


function demoteGoal(type, index) {
    const currentIndex = goalTypes.indexOf(type);
    if (currentIndex == goalTypes.length - 1) return;

    const savedGoals = JSON.parse(localStorage.getItem(type)) || [];
    const goal = savedGoals.splice(index, 1)[0];
    localStorage.setItem(type, JSON.stringify(savedGoals));

    let newType;
    if (currentIndex === goalTypes.length - 2) { 
        // Special case: demoting into "Past"
        newType = "pathway-goals-past";
        const pastGoals = JSON.parse(localStorage.getItem(newType)) || [];
        pastGoals.unshift(goal); // Prepend to "Past"
        localStorage.setItem(newType, JSON.stringify(pastGoals));
    } else {
        newType = goalTypes[currentIndex + 1];
        const newGoals = JSON.parse(localStorage.getItem(newType)) || [];
        newGoals.push(goal); // Append to other sections
        localStorage.setItem(newType, JSON.stringify(newGoals));
    }

    loadGoals();
}


function completeGoal(type, index) {
    if (type == "pathway-goals-past") return;
    
    const savedGoals = JSON.parse(localStorage.getItem(type)) || [];
    const goal = savedGoals.splice(index, 1)[0];
    localStorage.setItem(type, JSON.stringify(savedGoals));

    const pastGoals = JSON.parse(localStorage.getItem("pathway-goals-past")) || [];
    pastGoals.unshift(goal); // Prepend to "Past"
    localStorage.setItem("pathway-goals-past", JSON.stringify(pastGoals));

    loadGoals();
}


function updateGoalField(goalType, index, field, newValue) {
    const savedGoals = JSON.parse(localStorage.getItem(goalType)) || [];
    if (!savedGoals[index]) return; // Safety check

    savedGoals[index][field] = newValue;
    localStorage.setItem(goalType, JSON.stringify(savedGoals));
    loadGoals();
}


function handleKeydown(e, goalType, index, field, element) {
    if (e.key === "Enter" || e.key === "Escape") {
        updateGoalField(goalType, index, field, element.textContent.trim());
    }
}
