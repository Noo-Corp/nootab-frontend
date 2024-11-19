window.addEventListener("load", function() {
	const { panelIndex, isPopped } = getUrlParams();

	loadNote();

	if (isPopped === "true") loadSidepanel("note");

	document.getElementById('note-editor').addEventListener('input', () => saveNote(panelIndex));
	document.getElementById('main-title').addEventListener('input', () => saveNote(panelIndex));
});


function loadNote() {
	const panelOrderLength = JSON.parse(localStorage.getItem('panel-order')).length;
	const { panelIndex } = getUrlParams();
	const savedNotes = JSON.parse(localStorage.getItem('vals-note')) || [];
	const textsOrder = JSON.parse(localStorage.getItem('orders-note')) || new Array(panelOrderLength);

	const note = savedNotes[textsOrder[panelIndex] - 1];
	const noteEditorElement = document.getElementById('note-editor');
	const noteTitleElement = document.getElementById('main-title');

	if (note) {
		noteTitleElement.innerText = note[0] || "Untitled";
		noteEditorElement.value = note[1] || "";
	} else {
		noteTitleElement.innerText = "Untitled";
		noteEditorElement.value = "";
	}
}


function saveNote(panelIndex) {
	let savedNotes = JSON.parse(localStorage.getItem('vals-note')) || [];
	let textsOrder = JSON.parse(localStorage.getItem('orders-note'));

	let noteTitle = document.getElementById("main-title").innerText;
	let noteText = document.getElementById("note-editor").value;
	let note = [noteTitle, noteText];

	if (textsOrder[panelIndex]) {
		savedNotes[textsOrder[panelIndex] - 1] = note;
	} else {
		savedNotes.push(note);
		textsOrder[panelIndex] = savedNotes.length;
		localStorage.setItem('orders-note', JSON.stringify(textsOrder));
	}

	localStorage.setItem('vals-note', JSON.stringify(savedNotes));

	const { isPopped } = getUrlParams();
	if (isPopped === "true") loadSidepanel("note");
}
