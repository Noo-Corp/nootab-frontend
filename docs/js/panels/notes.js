window.addEventListener("load", function() {
	//set document colours from localStorage
	const colorProperties = [
		{ key: "colour-main-back-text", cssVar: "--backtext" },
		{ key: "colour-mode-back", cssVar: "--modeback" },
		{ key: "colour-mode-text", cssVar: "--modetext" },
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

	document.addEventListener("keydown", documentKeyHandler);

	const saved_note_text = localStorage.getItem("notes-main") || "";
	document.getElementById('editor').value = saved_note_text;

	document.getElementById('editor-save-btn').addEventListener('click', saveNote);
	document.getElementById('editor').addEventListener('input', indicateSave);
});

function documentKeyHandler(event) {
	if (event.ctrlKey && event.key === 's') {
		event.preventDefault();
		saveNote(event);
	}
}

function saveNote() {
	localStorage.setItem("notes-main", document.getElementById("editor").value);
	document.getElementById("editor-save-btn").textContent = "Save";
	document.getElementById("editor-alert").style.display = "none";
}

function indicateSave() {
	document.getElementById("editor-save-btn").textContent = "*Save";
	document.getElementById("editor-alert").style.display = "block";
}