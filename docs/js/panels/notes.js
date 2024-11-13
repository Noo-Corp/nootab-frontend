window.addEventListener("load", function() {
	//set document colours from localStorage
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

	const urlParams = new URLSearchParams(window.location.search);
	const panelIndex = urlParams.get('index');

	const savedTexts = JSON.parse(localStorage.getItem('note-texts')) || [];
	const textsOrder = JSON.parse(localStorage.getItem('note-texts-order')) || [];
		
	document.getElementById('note-editor').value = savedTexts[textsOrder[panelIndex]] || "";

	document.getElementById('note-editor').addEventListener('change', function() {
        saveNote(panelIndex);
    });
});

function saveNote(panelIndex) {
	let panelOrderLength = JSON.parse(localStorage.getItem('panel-order')).length;
	let savedTexts = JSON.parse(localStorage.getItem('note-texts')) || [];
	let textsOrder = JSON.parse(localStorage.getItem('note-texts-order')) || new Array(panelOrderLength);

	if (textsOrder[panelIndex]) {

	} else {
		savedTexts.append(document.getElementById("note-editor").value)
		textsOrder[panelIndex] = 0;
	}

	savedTexts[panelIndex] = document.getElementById("note-editor").value;
    localStorage.setItem('note-texts', JSON.stringify(savedTexts));
}