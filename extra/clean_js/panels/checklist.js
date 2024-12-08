window.addEventListener("load", function() {
    const { panelIndex, isPopped } = getUrlParams();
	
    loadChecklist();

	if (isPopped === "true") loadSidepanel("checklist");

    document.getElementById('main-title').addEventListener('input', () => updateTitle(panelIndex));
    document.getElementById('checklist-add-btn').addEventListener('click', () => addTask(panelIndex));
    document.getElementById('checklist-input').addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            addTask(panelIndex);
        } else if (event.key === 'Escape') {
            event.preventDefault();
            event.target.blur();
        }
    });
});


function loadChecklist() {
    const { panelIndex } = getUrlParams();
	const savedChecklists = JSON.parse(localStorage.getItem('vals-checklist')) || [];
	const checklistsOrder = JSON.parse(localStorage.getItem('orders-checklist')) || new Array(panelOrderLength);

	const checklist = savedChecklists[checklistsOrder[panelIndex] - 1];
	const checklistElement = document.getElementById('checklist-list');
	const checklistTitleElement = document.getElementById('main-title');

	if (checklist) {
        checklistElement.innerHTML = "";

		checklistTitleElement.innerText = checklist[0] || "Untitled";
        if (Array.isArray(checklist[1])) {
            checklist[1].forEach((task, index) => {
                const li = document.createElement('li');
                if (task.checked) {
                    li.classList.add('checked');
                }
        
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.checked = task.checked;
                checkbox.addEventListener('change', () => toggleTask(panelIndex, index));
        
                const span = document.createElement('span');
                span.textContent = task.text;
        
                const removeBtn = document.createElement('button');
                removeBtn.innerHTML = '&#10006;';
                removeBtn.classList.add('remove-btn');
                removeBtn.addEventListener('click', (event) => {
                    event.stopPropagation();
                    removeTask(panelIndex, index);
                });
        
                li.appendChild(checkbox);
                li.appendChild(span);
                li.appendChild(removeBtn);
        
                li.addEventListener('click', (event) => {
                    if (event.target !== checkbox) {
                        toggleTask(panelIndex, index);
                    }
                });
        
                checklistElement.appendChild(li);
            });
        }
	} else {
        checklistTitleElement.innerText = "Untitled";
    }

    const { isPopped } = getUrlParams();
	if (isPopped === "true") loadSidepanel("checklist");
}

function updateTitle(panelIndex) {
    let savedChecklists = JSON.parse(localStorage.getItem('vals-checklist')) || [];
	let checklistsOrder = JSON.parse(localStorage.getItem('orders-checklist'));

    const checklistTitleElement = document.getElementById('main-title');
    
    let currentChecklist = savedChecklists?.[checklistsOrder?.[panelIndex] - 1] || [];

    if (currentChecklist != "") {
        savedChecklists[checklistsOrder[panelIndex] - 1][0] = checklistTitleElement.innerText;
    } else {
        savedChecklists.push(([checklistTitleElement.innerText, []]))
        checklistsOrder[panelIndex] = savedChecklists.length;
        localStorage.setItem("orders-checklist", JSON.stringify(checklistsOrder));
    }

    localStorage.setItem("vals-checklist", JSON.stringify(savedChecklists));

    const { isPopped } = getUrlParams();
	if (isPopped === "true") loadSidepanel("checklist");
}

function addTask(panelIndex) {
    let savedChecklists = JSON.parse(localStorage.getItem('vals-checklist')) || [];
	let checklistsOrder = JSON.parse(localStorage.getItem('orders-checklist'));

    const checklistTitleElement = document.getElementById('main-title');
    let taskInput = document.getElementById('checklist-input');
    const taskText = taskInput.value.trim();
    
    let checklistTasks = (savedChecklists?.[checklistsOrder[panelIndex] - 1]?.[1]) || [];
    if (taskText != '') {
        checklistTasks.push({ text: taskText, checked: false });    
    }
    
    let currentChecklist = savedChecklists?.[checklistsOrder?.[panelIndex] - 1] || [];

    if (currentChecklist != "") {
        savedChecklists[checklistsOrder[panelIndex] - 1] = ([checklistTitleElement.innerText, checklistTasks]);
    } else {
        savedChecklists.push(([checklistTitleElement.innerText, checklistTasks]))
        checklistsOrder[panelIndex] = savedChecklists.length;
    }

    taskInput.value = '';

    localStorage.setItem("vals-checklist", JSON.stringify(savedChecklists));
    localStorage.setItem("orders-checklist", JSON.stringify(checklistsOrder));

    loadChecklist();
}


function removeTask(panelIndex, index) {
    const savedChecklists = JSON.parse(localStorage.getItem('vals-checklist'));
	const checklistsOrder = JSON.parse(localStorage.getItem('orders-checklist'));

    savedChecklists[checklistsOrder[panelIndex] - 1][1].splice(index, 1);
    localStorage.setItem("vals-checklist", JSON.stringify(savedChecklists));

    loadChecklist();
}


function toggleTask(panelIndex, index) {
    const savedChecklists = JSON.parse(localStorage.getItem('vals-checklist')) || [];
	const checklistsOrder = JSON.parse(localStorage.getItem('orders-checklist')) || [];

    savedChecklists[checklistsOrder[panelIndex] - 1][1][index].checked = !savedChecklists[checklistsOrder[panelIndex] - 1][1][index].checked;

    localStorage.setItem("vals-checklist", JSON.stringify(savedChecklists));

    loadChecklist();
}