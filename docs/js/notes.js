window.addEventListener("load", function() {
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