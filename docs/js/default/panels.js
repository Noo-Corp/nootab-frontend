window.addEventListener("load", () => {
    loadPanels();
    loadPanelOrderList();
});

function addToPanelOrder(panelName) {
    let panelOrder = JSON.parse(localStorage.getItem('panel-order')) || [];
    if (panelOrder.length < 8) {
        panelOrder.push(panelName);
        localStorage.setItem('panel-order', JSON.stringify(panelOrder));
        loadPanels();
    }
}

function clearPanelOrder() {
    localStorage.removeItem('panel-order');
    document.getElementById('panelContainer').innerHTML = '';
    loadPanels();
}

function loadPanels() {
    const panelContainer = document.getElementById('panelContainer');
    const panelOrder = JSON.parse(localStorage.getItem('panel-order')) || [];
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
            iframe.src = `html/${panelName.toLowerCase()}.html`;
            panel.classList.add(panelName.toLowerCase());
        } else {
            panel.classList.add('blank');
        }
        iframe.style.visibility = 'hidden';
        iframe.onload = () => onFrameLoad(iframe);
        panel.appendChild(iframe);
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

function onFrameLoad(iframe) {
    iframe.style.visibility = 'visible';
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
    const sidePanel = document.getElementById('sidePanel');
    const isOpen = sidePanel.style.right === '0px';

	if (isOpen) {
		const isClickInside = event.target.closest('#sidePanel');
        if (!isClickInside) {
			closePanel(event);
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
    if (newIndex < 0 || newIndex >= panelOrder.length || oldIndex === newIndex) return;

    // Move the item in the panel order array
    const panelNameToMove = panelOrder.splice(oldIndex, 1)[0];
    panelOrder.splice(newIndex, 0, panelNameToMove);

    // Save the updated order in localStorage
    localStorage.setItem('panel-order', JSON.stringify(panelOrder));

    loadPanels();
    loadPanelOrderList();
}

function addToPanelOrder(panelName) {
    let panelOrder = JSON.parse(localStorage.getItem('panel-order')) || [];
    if (panelOrder.length < 8) {
        panelOrder.push(panelName);
        localStorage.setItem('panel-order', JSON.stringify(panelOrder));
        loadPanels();
        loadPanelOrderList();
    }
}

function deletePanel(event, index) {
    event.stopPropagation();

    const panelOrder = JSON.parse(localStorage.getItem('panel-order')) || [];
    panelOrder.splice(index, 1);
    localStorage.setItem('panel-order', JSON.stringify(panelOrder));

    loadPanels();
    loadPanelOrderList();
}

function clearPanelOrder() {
    localStorage.removeItem('panel-order');
    document.getElementById('panelContainer').innerHTML = '';
    loadPanels();
    loadPanelOrderList();
}