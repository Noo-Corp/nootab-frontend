window.addEventListener("load", function() {
    const colorProperties = [
        { key: "colour-main-back-text", cssVar: "--backtext" },
        { key: "colour-mode-back", cssVar: "--modeback" },
        { key: "colour-mode-text", cssVar: "--modetext" },
        { key: "colour-mode-text-2", cssVar: "--modetext2" },
        { key: "colour-main-body-back", cssVar: "--bodyback" },
        { key: "colour-main", cssVar: "--main" },
        { key: "colour-main-empty", cssVar: "--empty" },
        { key: "colour-main-hover", cssVar: "--hover" },
        { key: "colour-main-text", cssVar: "--text" },
        { key: "colour-secondary", cssVar: "--secondary" },
        { key: "colour-secondary-hover", cssVar: "--secondaryhover" },
        { key: "colour-secondary-text", cssVar: "--secondarytext" }
    ];

    colorProperties.forEach(({ key, cssVar }) => {
        let value = localStorage.getItem(key);
        document.documentElement.style.setProperty(cssVar, value);
    });

    document.getElementById('checklist-add-btn').addEventListener('click', addTask);
    document.getElementById('checklist-input').addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            addTask(event);
        }
    });

    loadTasks();
});

function loadTasks() {
    const savedTasks = JSON.parse(localStorage.getItem("checklist-list")) || [];
    const checklistList = document.getElementById('checklist-list');
    checklistList.innerHTML = '';

    savedTasks.forEach((task, index) => {
        const li = document.createElement('li');
        if (task.checked) {
            li.classList.add('checked');
        }

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.checked;
        checkbox.addEventListener('change', () => toggleTask(index));

        const span = document.createElement('span');
        span.textContent = task.text;

        const removeBtn = document.createElement('button');
        removeBtn.innerHTML = '&#10006;';
        removeBtn.classList.add('remove-btn');
        removeBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            removeTask(index);
        });

        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(removeBtn);

        li.addEventListener('click', (event) => {
            if (event.target !== checkbox) {
                toggleTask(index);
            }
        });

        checklistList.appendChild(li);
    });
}

function addTask(event) {
    const taskInput = document.getElementById('checklist-input');
    const taskText = taskInput.value.trim();
    
    if (taskText === '') return;

    const savedTasks = JSON.parse(localStorage.getItem("checklist-list")) || [];
    savedTasks.push({ text: taskText, checked: false });
    localStorage.setItem("checklist-list", JSON.stringify(savedTasks));

    taskInput.value = '';

    loadTasks();
}

function removeTask(index) {
    const savedTasks = JSON.parse(localStorage.getItem("checklist-list")) || [];
    savedTasks.splice(index, 1);
    localStorage.setItem("checklist-list", JSON.stringify(savedTasks));

    loadTasks();
}

function toggleTask(index) {
    const savedTasks = JSON.parse(localStorage.getItem("checklist-list")) || [];
    savedTasks[index].checked = !savedTasks[index].checked;
    localStorage.setItem("checklist-list", JSON.stringify(savedTasks));

    loadTasks();
}
