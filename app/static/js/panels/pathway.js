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
    loadGoals();
});


function getUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    return { isPopped: urlParams.get("popped") };
}


function loadGoals() {
    const { isPopped } = getUrlParams();
    const goalsListElement = document.getElementById("goals-list");
    goalsListElement.innerHTML = "";

    const typesToShow = isPopped === "true" 
        ? goalTypes 
        : ["pathway-goals-ongoing", "pathway-goals-current"];

    typesToShow.forEach((type) => {
        const savedGoals = JSON.parse(localStorage.getItem(type)) || [];

        if (savedGoals.length === 0 && isPopped !== "true") return; // Skip empty sections in non-popped view

        const sectionElement = document.createElement("div");
        sectionElement.classList.add("goal-section");

        const header = document.createElement("h3");
        header.textContent = goalTypeHeaders[type];
        sectionElement.appendChild(header);

        savedGoals.forEach((goal, index) => {
            const goalElement = document.createElement("div");
            goalElement.className = "goal";

            // Goal Title (Editable in Popped View)
            const goalTitle = document.createElement("div");
            goalTitle.className = "goal-title";
            if (isPopped === "true") {
                goalTitle.innerHTML = `<span class="editable-value">${goal.name}</span>`;
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
                goalCategory.innerHTML = `Category: <span class="editable-value">${goal.category}</span>`;
                const categoryValue = goalCategory.querySelector(".editable-value");
                categoryValue.contentEditable = "true";
                categoryValue.addEventListener("blur", () => {
                    updateGoalField(type, index, "category", categoryValue.textContent.trim());
                });
                categoryValue.addEventListener("keydown", (e) => handleKeydown(e, type, index, "category", categoryValue));
            } else {
                goalCategory.innerHTML = `Category: ${goal.category}`;
            }
            goalElement.appendChild(goalCategory);

            // Milestone (Editable Value Only)
            const goalMilestone = document.createElement("div");
            if (goal.milestone) {
                goalMilestone.className = "goal-milestone";
                if (isPopped === "true") {
                    goalMilestone.innerHTML = `Next Milestone: <span class="editable-value">${goal.milestone}</span>`;
                    const milestoneValue = goalMilestone.querySelector(".editable-value");
                    milestoneValue.contentEditable = "true";
                    milestoneValue.addEventListener("blur", () => {
                        updateGoalField(type, index, "milestone", milestoneValue.textContent.trim());
                    });
                    milestoneValue.addEventListener("keydown", (e) => handleKeydown(e, type, index, "milestone", milestoneValue));
                } else {
                    goalMilestone.innerHTML = `Next Milestone: ${goal.milestone}`;
                }
                goalElement.appendChild(goalMilestone);
            }

            // Buttons (Only in Popped View)
            const buttonContainer = document.createElement("div");
            buttonContainer.classList.add("goal-actions");

            if (isPopped === "true") {
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
                removeButton.innerHTML = "&#10006;";
                removeButton.addEventListener("click", () => removeGoal(type, index));
                buttonContainer.appendChild(removeButton);
            }

            goalElement.appendChild(buttonContainer);
            sectionElement.appendChild(goalElement);
        });

        // Add Goal Section for Popped View
        if (isPopped === "true") {
            const addGoalContainer = document.createElement("div");
            addGoalContainer.classList.add("add-goal-container");
        
            // Unique Inputs for Name, Category, and Milestone
            const nameInput = document.createElement("input");
            nameInput.type = "text";
            nameInput.id = `goal-name-input-${type}`;
            nameInput.placeholder = "Goal Name";
        
            const categoryInput = document.createElement("input");
            categoryInput.type = "text";
            categoryInput.id = `goal-category-input-${type}`;
            categoryInput.placeholder = "Category";
        
            const milestoneInput = document.createElement("input");
            milestoneInput.type = "text";
            milestoneInput.id = `goal-milestone-input-${type}`;
            milestoneInput.placeholder = "Next Milestone (Optional)";
        
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
}


function addGoal(goalType) {
    const nameInput = document.getElementById(`goal-name-input-${goalType}`);
    const categoryInput = document.getElementById(`goal-category-input-${goalType}`);
    const milestoneInput = document.getElementById(`goal-milestone-input-${goalType}`);

    const name = nameInput.value.trim();
    const category = categoryInput.value.trim();
    const milestone = milestoneInput.value.trim();

    if (!name || !category) {
        alert("Both Name and Category are required to add a goal.");
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
