window.addEventListener("load", function() {
    document.getElementById('main-title').addEventListener('keydown', (event) => {
		if (['Enter', 'Escape'].includes(event.key)) {
			event.preventDefault();
			event.target.blur();
		}
	});
});

function getUrlParams() {
	const urlParams = new URLSearchParams(window.location.search);
	return { panelIndex: urlParams.get('index'), isPopped: urlParams.get('popped') };
}


function loadSidepanel(panelType) {
	const panelOrderLength = JSON.parse(localStorage.getItem('panel-order')).length;
	const { panelIndex } = getUrlParams();
	const vals = JSON.parse(localStorage.getItem(`vals-${panelType}`)) || [];
	const orders = JSON.parse(localStorage.getItem(`orders-${panelType}`)) || new Array(panelOrderLength);

	const sidebarListElement = document.getElementById('sidebar-list');
	sidebarListElement.innerHTML = '';

	vals.forEach((val, index) => {
		const li = document.createElement('li');
		if (index === orders[panelIndex] - 1) li.classList.add('selected');

		const removeBtn = document.createElement('button');
		removeBtn.innerHTML = '&#10006;';
		removeBtn.classList.add('remove-btn');
		removeBtn.addEventListener('click', (event) => {
			event.stopPropagation();
			removeMulti(panelType, index);
		});

		li.textContent = val[0];
		li.appendChild(removeBtn);
		li.addEventListener('click', () => switchMulti(panelType, panelIndex, index));
		sidebarListElement.appendChild(li);
	});

	const newButton = document.createElement('button');
	newButton.textContent = 'NEW';
	newButton.classList.add('new-btn');
	newButton.addEventListener('click', (event) => newMulti(panelType, event));

	sidebarListElement.appendChild(newButton);

	document.getElementById('sidebar').style.width = "300px";
	document.getElementById('sidebar').style.marginRight = "8px";
}


function removeMulti(panelType, index) {
	const panelOrderLength = JSON.parse(localStorage.getItem('panel-order')).length;
	const orders = JSON.parse(localStorage.getItem(`orders-${panelType}`)) || new Array(panelOrderLength);
	const { panelIndex } = getUrlParams();

	if (index === orders[panelIndex] - 1) {
        if (panelType == "note") {
            document.getElementById("note-editor").value = "";
        } else if (panelType == "checklist") {
			document.getElementById('checklist-list').innerHTML = "";
		}
		document.getElementById('main-title').textContent = "Untitled";
	}

	const vals = JSON.parse(localStorage.getItem(`vals-${panelType}`));
	if (vals.length === 1) {
		localStorage.setItem(`vals-${panelType}`, "[]");
		localStorage.setItem(`orders-${panelType}`, JSON.stringify(new Array(panelOrderLength)));
	} else {
		vals.splice(index, 1);
		for (let i = 0; i < orders.length; i++) {
			if (orders[i] === index + 1) orders[i] = null;
			else if (orders[i] > index + 1) orders[i] -= 1;
		}

        localStorage.setItem(`vals-${panelType}`, JSON.stringify(vals));
		localStorage.setItem(`orders-${panelType}`, JSON.stringify(orders));
	}

	loadSidepanel(panelType);
}


function switchMulti(panelType, panelIndex, index) {
	const panelOrderLength = JSON.parse(localStorage.getItem('panel-order')).length;
	let orders = JSON.parse(localStorage.getItem(`orders-${panelType}`)) || new Array(panelOrderLength);
	orders[panelIndex] = index + 1;

	localStorage.setItem(`orders-${panelType}`, JSON.stringify(orders));
	loadSidepanel(panelType);

	if (panelType == "note") {
        loadNote();
    } else if (panelType == "checklist") {
		loadChecklist();
	}
}


function newMulti(panelType, event) {
    event.stopPropagation();

	const { panelIndex } = getUrlParams();

    const vals = JSON.parse(localStorage.getItem(`vals-${panelType}`)) || [];

	const nm = ['Untitled', ''];
	vals.push(nm);

	localStorage.setItem(`vals-${panelType}`, JSON.stringify(vals));

	switchMulti(panelType, panelIndex, vals.length-1)
}


function titleEditable(title) {
	title.contentEditable = "true";
	title.focus();
}