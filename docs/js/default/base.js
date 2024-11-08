window.addEventListener("load", () => {
    const logo = document.querySelector('#logo img');
    logo.addEventListener('click', handleLogoClick);

    loadPanels();
});

function handleLogoClick() {
    const logo = document.getElementById('logo');
    const isLightMode = localStorage.getItem("colour-mode-back") === '#F5F5F5' || localStorage.getItem("colour-mode-back") === null;

    if (isLightMode) {
        animateLogo(logo);
    } else {
        animateZzzEffect();
        pulseLogo(logo);
    }
}

function animateLogo(logo) {
    logo.classList.remove('animate');
    void logo.offsetWidth;
    logo.classList.add('animate');
}

function animateZzzEffect() {
    const zzzContainer = document.querySelector(".zzz-container");
    const zzzChildren = zzzContainer.querySelectorAll("div");

    zzzChildren.forEach(child => {
        child.classList.add("zzz-animate");
        child.textContent = "Z";
        child.addEventListener("animationend", () => {
            child.classList.remove("zzz-animate");
            child.textContent = "";
        });
    });
}

function pulseLogo(logo) {
    logo.classList.remove('pulse');
    void logo.offsetWidth;
    logo.classList.add('pulse');
}

function addToPanelOrder(panelName) {
    let panelOrder = JSON.parse(localStorage.getItem('panel-order')) || [];
    if (panelOrder.length < 8 && (panelName == "blank" || !panelOrder.includes(panelName))) {
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
    panelOrder.forEach(panelName => {
        var panel = document.createElement('div');
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
    document.getElementById('panelContainer').style.width = "calc(100% - 340px)";
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
    document.getElementById('panelContainer').style.width = "calc(100% - 20px)";
}