window.addEventListener("load", () => {
    loadPanels();
    loadPanelOrderList();
});

function loadPanels() {
    const panelContainer = document.getElementById('panelContainer');
    const panelOrder = JSON.parse(localStorage.getItem('panel-order')) || [];
    const flippedPanels = JSON.parse(localStorage.getItem('flipped-panels')) || [];

    if(panelOrder == "") {
        var panel = document.createElement('div');
        panel.textContent = "+";
        panel.classList.add('panel');
        panel.classList.add('empty');
        panel.onclick = toggleSidePanel;
        panelContainer.appendChild(panel);
        return;
    }
    panelContainer.innerHTML = '';
    panelOrder.forEach((panelName, index) => {
        var panel = document.createElement('div');
        var panelNumber = document.createElement('div');
        panelNumber.classList.add('panel-number');
        panelNumber.innerText = index + 1;
        panel.append(panelNumber);
        panel.classList.add('panel');

        const iframe = document.createElement('iframe');
        if (panelName.toLowerCase() != 'blank') {
            iframe.src = `/panel/${panelName.toLowerCase()}?index=${index}&popped=false`;
            panel.classList.add(panelName.toLowerCase());
        } else {
            panel.classList.add('blank');
        }

        if (flippedPanels[index]) {
            iframe.style.display = "none";
            panelFlipInitial(panel, index);
        }

        iframe.style.visibility = 'hidden';
        iframe.onload = () => onFrameLoad(iframe, false);
        panel.appendChild(iframe);

        if (panelName != "blank") {
            const privacyBtn = document.createElement('button');
            privacyBtn.className = 'panel-privacy';
            privacyBtn.onclick = function(event) { panelFlip(event, this); };
            privacyBtn.innerHTML = '&#10551;';
            panel.appendChild(privacyBtn);

            if (!flippedPanels[index]) {
                const button = document.createElement('button');
                button.className = 'panel-popout';
                button.onclick = function(event) { panelPopout(event, this); };
                button.innerHTML = '&#10063;';
                panel.appendChild(button);
            }
        }

        panelContainer.appendChild(panel);
    });

    const sidePanel = document.getElementById('sidePanel');
    const isOpen = sidePanel.style.right === '0px';
    if (isOpen) {
        const blankPanels = document.querySelectorAll('.panel.blank');
        blankPanels.forEach(panel => {
            panel.style.borderColor = "var(--backtext)";
        });
        const panelNumbers = document.querySelectorAll('.panel-number');
        panelNumbers.forEach(number => {
            number.style.opacity = 1;
            number.style.display = "block";
        });
    }
}

function onFrameLoad(iframe, popped=false) {
    iframe.style.visibility = 'visible';

    if (popped) {
        iframe.parentNode.classList.remove('popout');
    }
}

function toggleSidePanel(event) {
    event.stopPropagation();
    const sidePanel = document.getElementById('sidePanel');
    sidePanel.style.right = '0px';
    const blankPanels = document.querySelectorAll('.panel.blank');
    blankPanels.forEach(panel => {
        panel.style.borderColor = "var(--backtext)";
    });
    const panelNumbers = document.querySelectorAll('.panel-number');
    panelNumbers.forEach(number => {
        number.style.opacity = 1;
        number.style.display = "block";
    });
    document.getElementById('panelContainer').style.width = "calc(100% - 340px)";
    document.getElementById("modalOverlay").style.display = "block";
}

document.addEventListener('click', function (event) {
    const isPanelPopout = document.querySelector('.panel.popout') || false;
    const sidePanel = document.getElementById('sidePanel');
    const isOpen = sidePanel.style.right === '0px';

	if (isOpen) {
		const isClickInside = event.target.closest('#sidePanel');
        if (!isClickInside) {
			closePanel(event);
		}
	}

    if (isPanelPopout) {
        const isClickInside = event.target.closest('.panel.popout');
        if (!isClickInside) {
            closePopoutPanel();
        }
    }
});

document.addEventListener('keydown', function (event) {
    const sidePanel = document.getElementById('sidePanel');
    const isOpen = sidePanel.style.right === '0px';

	if (event.key === 'Escape' && isOpen) {
        closePanel(event);
	}
});

function closePanel(event) {
    const sidePanel = document.getElementById('sidePanel');
    event.preventDefault();
    sidePanel.style.right = '-320px';
    const blankPanels = document.querySelectorAll('.panel.blank');
    blankPanels.forEach(panel => {
        panel.style.borderColor = "transparent";
    });
    const panelNumbers = document.querySelectorAll('.panel-number');
    panelNumbers.forEach(number => {
        number.style.opacity = 0;
    });

    sidePanel.addEventListener('transitionend', () => {
        if (sidePanel.style.right === '-320px') {
            panelNumbers.forEach(number => {
                number.style.display = 'none';
            });
        }
    });

    document.getElementById('panelContainer').style.width = "calc(100% - 20px)";
    document.getElementById("modalOverlay").style.display = "none";
}

function loadPanelOrderList() {
    const panelOrderList = document.getElementById('panelOrderList');
    const panelOrder = JSON.parse(localStorage.getItem('panel-order')) || [];

    panelOrderList.innerHTML = '';

    if (panelOrder.length === 0) {
        const row = document.createElement('tr');
        row.id = "empty-panel-order-tr";

        const cell = document.createElement('td');
        cell.id = "empty-panel-order-td";
        cell.textContent = "NO PANELS";

        row.appendChild(cell);
        panelOrderList.appendChild(row);
        return;
    }

    panelOrder.forEach((panelName, index) => {
        const row = document.createElement('tr');

        // Panel Order Input (1-based)
        const orderCell = document.createElement('td');
        const orderInput = document.createElement('input');
        orderInput.value = index + 1; // Display as 1-based index
        orderInput.className = "orderInput";
        orderCell.appendChild(orderInput);
        row.appendChild(orderCell);

        $(orderInput).spinner({
            step: -1,
            min: 1,
            max: panelOrder.length
        }).siblings('.ui-spinner-up, .ui-spinner-down').addClass("spinner-panel-button");

        $(orderInput).on('change', function() {
            const newIndex = parseInt(this.value) - 1;
            updatePanelOrder(index, newIndex);
        });

        $(orderInput).on('keydown', function(event) {
            if (event.key === "ArrowUp" || event.key === "ArrowDown") {
                const newIndex = parseInt(this.value) - 1;
                updatePanelOrder(index, newIndex);
            }
        });

        // Panel Name
        const nameCell = document.createElement('td');
        nameCell.innerText = panelName;
        nameCell.classList.add("panel-name-cell");
        row.appendChild(nameCell);

        // Remove Button
        const deleteCell = document.createElement('td');
        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = "&#10006;";
        deleteBtn.classList.add("panel-delete-button");
        deleteBtn.onclick = (event) => deletePanel(event, index);
        deleteCell.appendChild(deleteBtn);
        row.appendChild(deleteCell);

        panelOrderList.appendChild(row);
    });

    $('.spinner-panel-button').click(function(event) {
		event.stopPropagation();
		$(this).siblings('input').change();
	});
}

function updatePanelOrder(oldIndex, newIndex) {
    const panelOrder = JSON.parse(localStorage.getItem('panel-order')) || [];
    const noteTextsOrder = JSON.parse(localStorage.getItem('orders-note')) || [];
    const checklistListsOrder = JSON.parse(localStorage.getItem('orders-checklist')) || [];
    const flippedPanels = JSON.parse(localStorage.getItem('flipped-panels')) || [];

    if (newIndex < 0 || newIndex >= panelOrder.length || oldIndex === newIndex) return;

    const panelNameToMove = panelOrder.splice(oldIndex, 1)[0];
    const panelNoteToMove = noteTextsOrder.splice(oldIndex, 1)[0];
    const panelChecklistToMove = checklistListsOrder.splice(oldIndex, 1)[0];
    const flippedPanelToMove = flippedPanels.splice(oldIndex, 1)[0];

    panelOrder.splice(newIndex, 0, panelNameToMove);
    localStorage.setItem('panel-order', JSON.stringify(panelOrder));

    noteTextsOrder.splice(newIndex, 0, panelNoteToMove);
    localStorage.setItem('orders-note', JSON.stringify(noteTextsOrder));

    checklistListsOrder.splice(newIndex, 0, panelChecklistToMove);
    localStorage.setItem('orders-checklist', JSON.stringify(checklistListsOrder));

    flippedPanels.splice(newIndex, 0, flippedPanelToMove);
    localStorage.setItem('flipped-panels', JSON.stringify(flippedPanels));

    loadPanels();
    loadPanelOrderList();
}

function addToPanelOrder(panelName) {
    let panelOrder = JSON.parse(localStorage.getItem('panel-order')) || [];
    let noteTextsOrder = JSON.parse(localStorage.getItem('orders-note')) || [];
    let checklistListsOrder = JSON.parse(localStorage.getItem('orders-checklist')) || [];
    let flippedPanels = JSON.parse(localStorage.getItem('flipped-panels')) || [];

    if (panelOrder.length < 8) {
        if (panelOrder.includes(panelName) && ["gmail", "calendar", "pathway", "assets", "trade"].includes(panelName)) {
            return
        }

        panelOrder.push(panelName);
        localStorage.setItem('panel-order', JSON.stringify(panelOrder));

        noteTextsOrder.push(null);
        localStorage.setItem('orders-note', JSON.stringify(noteTextsOrder));

        checklistListsOrder.push(null);
        localStorage.setItem('orders-checklist', JSON.stringify(checklistListsOrder));

        flippedPanels.push(false);
        localStorage.setItem('flipped-panels', JSON.stringify(flippedPanels));

        loadPanels();
        loadPanelOrderList();
    }
}

function deletePanel(event, index) {
    event.stopPropagation();

    const panelOrder = JSON.parse(localStorage.getItem('panel-order')) || [];
	const noteTextsOrder = JSON.parse(localStorage.getItem('orders-note')) || [];
    const checklistListsOrder = JSON.parse(localStorage.getItem('orders-checklist')) || [];
    const flippedPanels = JSON.parse(localStorage.getItem('flipped-panels')) || [];

    if (panelOrder.length == 1) {
        localStorage.removeItem('panel-order');
        localStorage.removeItem('orders-note');
        localStorage.removeItem('orders-checklist');
        localStorage.removeItem('flipped-panels');
        document.getElementById('panelContainer').innerHTML = '';
    } else {
        panelOrder.splice(index, 1);
        localStorage.setItem('panel-order', JSON.stringify(panelOrder));

        noteTextsOrder.splice(index, 1);
        localStorage.setItem('orders-note', JSON.stringify(noteTextsOrder));

        checklistListsOrder.splice(index, 1);
        localStorage.setItem('orders-checklist', JSON.stringify(checklistListsOrder));

        flippedPanels.splice(index, 1);
        localStorage.setItem('flipped-panels', JSON.stringify(flippedPanels));
    }

    loadPanels();
    loadPanelOrderList();
}

function clearPanelOrder() {
    localStorage.removeItem('panel-order');
    localStorage.removeItem('orders-note');
    localStorage.removeItem('orders-checklist');
    localStorage.removeItem('flipped-panels');
    document.getElementById('panelContainer').innerHTML = '';
    loadPanels();
    loadPanelOrderList();
}

function panelFlipInitial(panel, panelIndex) {
    const flipText = document.createElement('div');
    flipText.className = "flip-text";

    const panelClass = panel.className.split(' ')[1];
    if (panelClass === "notes") {
        const noteTextsOrder = JSON.parse(localStorage.getItem('orders-note'));
        const noteVals = JSON.parse(localStorage.getItem('vals-note'));
        const noteTitle = noteVals[noteTextsOrder[panelIndex]-1]?.[0];

        flipText.textContent = noteTitle || panelClass;
    } else {
        flipText.textContent = panelClass;
    }

    panel.style.backgroundColor = "var(--modeback)";
    panel.appendChild(flipText);

    panel.classList.add("shifted");

    const poppedButton = panel.querySelector('.panel-popout');
    if (poppedButton) {
        poppedButton.remove();
    }
}

function panelFlip(event, button) {
    event.stopPropagation();
    const mainPanel = button.closest('.panel');
    const panelIndex = Array.from(mainPanel.parentNode.children).indexOf(mainPanel);
    let flippedPanels = JSON.parse(localStorage.getItem('flipped-panels')) || [];

    while (flippedPanels.length < panelIndex + 1) {
        flippedPanels.push(false);
    }

    flippedPanels[panelIndex] = !flippedPanels[panelIndex];

    if (flippedPanels[panelIndex]) {
        mainPanel.querySelector('iframe').style.display = "none";
        mainPanel.classList.add("shifted");
        panelFlipInitial(mainPanel, panelIndex);
    } else {
        const iframe = mainPanel.querySelector('iframe');
        mainPanel.style.backgroundColor = "var(--bodyback)";
        const flipText = mainPanel.querySelector('.flip-text');
        if (flipText) {
            flipText.remove();
        }
        iframe.style.display = "block";
        iframe.src = iframe.src;

        mainPanel.classList.remove("shifted");

        const button = document.createElement('button');
        button.className = 'panel-popout';
        button.onclick = function(event) { panelPopout(event, this); };
        button.innerHTML = '&#10063;';
        mainPanel.appendChild(button);
    }

    localStorage.setItem('flipped-panels', JSON.stringify(flippedPanels));
}

function panelPopout(event, button) {
    event.stopPropagation();
    const isPanelPopout = document.querySelector('.panel.popout') || false;

    if (isPanelPopout) {
        closePopoutPanel();
    } else {
        const mainPanel = button.closest('.panel');
        if (mainPanel) {
            const iframe = mainPanel.querySelector('iframe');
            document.getElementById("modalOverlay").style.display = "block";
            const panels = document.querySelectorAll('.panel');
            panels.forEach(panel => {
                if (panel !== mainPanel) {   
                    panel.style.display = "none";
                }
            });
            button.innerHTML = '&#9783;';
            button.classList.add('popped');
            iframe.onload = () => onFrameLoad(iframe, false);
            iframe.src = iframe.src.replace(/([?&])popped=[^&]*/, `$1popped=true`);
            mainPanel.classList.add('popout');
            mainPanel.querySelector('.panel-privacy').style.display = "none";
        }
    }
}

function closePopoutPanel() {
    const panelPopout = document.querySelector('.panel.popout');
    const iframe = panelPopout.querySelector('iframe');
    iframe.src = panelPopout.querySelector('iframe').src.replace(/([?&])popped=[^&]*/, `$1popped=false`);
    iframe.onload = () => onFrameLoad(iframe, true);

    const button = document.querySelector('.panel-popout.popped');
    button.innerHTML = '&#10063;';
    button.classList.remove('popped');

    document.getElementById("modalOverlay").style.display = "none";
    const panels = document.querySelectorAll('.panel');
    panels.forEach(panel => {
        panel.style.display = "flex";
    });

    loadPanels();
}