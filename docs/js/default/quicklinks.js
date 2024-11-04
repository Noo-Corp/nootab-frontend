window.addEventListener("load", function() {
    document.querySelector("#plusButton").style.display = "block";
    initUrlButtons();
	var urlData = JSON.parse(localStorage.getItem("urls"));
    if (urlData && urlData.length > 0) {
		const buttons = document.getElementById("urlButtons");
        buttons.removeChild(buttons.children[1]);
        buttons.removeChild(buttons.children[0]);
    }
});

function getUrlsFromStorage() {
	const urls = JSON.parse(localStorage.getItem("urls")) || [];
	const values = JSON.parse(localStorage.getItem("url_values")) || [];
	return {
		urls,
		values
	};
}

function saveUrlsToStorage(urls, values) {
	localStorage.setItem("urls", JSON.stringify(urls));
	localStorage.setItem("url_values", JSON.stringify(values));
}

function addUrlButton() {
	const buttons = document.getElementById("urlButtons");

	const newButton = document.createElement("button");
	newButton.className = "urlButton";
	newButton.onclick = function() {
		goToUrl(this);
	};
	newButton.innerHTML = "+ New";

	const newMinusButton = document.createElement("button");
	newMinusButton.className = "minusButton";
	newMinusButton.onclick = function() {
		deleteUrlButton(this);
	};
	newMinusButton.innerHTML = "-";//"&#9734;";

	buttons.append(newButton);
	buttons.append(newMinusButton);

	localStorage.setItem("emptyURL", false);

	updateURLVisibility();
}

function deleteUrlButton(button) {
	const buttons = document.getElementById("urlButtons");
	const index = Array.from(buttons.children).indexOf(button);
	const linkedUploadBtn = buttons.children[index - 1];

	const {
		urls,
		values
	} = getUrlsFromStorage();
	if (linkedUploadBtn.dataset.url) {
		const urlIndex = urls.findIndex(url => url === linkedUploadBtn.dataset.url);
		const valueIndex = values.findIndex(value => value === linkedUploadBtn.dataset.value);
		if (urlIndex > -1) {
			urls.splice(urlIndex, 1);
		}
		if (valueIndex > -1) {
			values.splice(valueIndex, 1);
		}
		saveUrlsToStorage(urls, values);
	}

	buttons.removeChild(buttons.children[index]);
	buttons.removeChild(buttons.children[index - 1]);

	updateURLVisibility();
}

function updateURLVisibility() {
	const buttons = document.getElementById("urlButtons");
	const hasSeturlButtons = buttons.getElementsByClassName("urlButton").length > 0;
	var emptyURL = this.localStorage.getItem("emptyURL");

	if (hasSeturlButtons && emptyURL != "true") {
		buttons.classList.add("hasSeturlButtons");
		localStorage.setItem("emptyURL", false);
		var urlButtonInitial = document.querySelector(".urlButton.initial");
		var minusButtonInitial = document.querySelector(".minusButton.initial");

		if (urlButtonInitial && minusButtonInitial) {
			urlButtonInitial.style.display = "block";
			minusButtonInitial.style.display = "block";
		}

		document.getElementById("openAllUrlsButton").style.display = "block";
		document.getElementById("urlDivider").style.display = "block";
	} else {
		buttons.classList.remove("hasSeturlButtons");
		document.getElementById("openAllUrlsButton").style.display = "none";
		document.getElementById("urlDivider").style.display = "none";
		localStorage.setItem("emptyURL", "true");
	}

	if (emptyURL == "true") {
		buttons.removeChild(buttons.children[1]);
		buttons.removeChild(buttons.children[0]);
	}
}

function goToUrl(button) {
	var url = prompt("Enter the URL:");

	if (url !== "" && url != null) {
		var value = prompt("(Optional) Enter the name:");
		
		if (value == "" || value == null) {
			value = url.replace(/^(https?:\/\/)?(www\.)?/, '').substring(0, 8);
			if (url.length > 8) {
				value += "..";
			}
		}
		
		setupUrlButtons(button, url, value);

		const {
			urls,
			values
		} = getUrlsFromStorage();
		urls.push(url);
		values.push(value);
		saveUrlsToStorage(urls, values);
	}
}

function openAllUrls() {
	const setUrlButtons = document.querySelectorAll(".urlButton");
	if (setUrlButtons.length > 0) {
		for (let i = 0; i < setUrlButtons.length; i++) {
			var url = setUrlButtons[i].dataset.url;
			if (url !== "" && url != null) {
				if (!url.startsWith("http://") && !url.startsWith("https://")) {
					url = "https://" + url;
				}
				window.open(url, '_blank');
			}
		}
	}
}

function initUrlButtons() {
	const {
		urls,
		values
	} = getUrlsFromStorage();
	const buttons = document.getElementById("urlButtons");

	urls.forEach((url, index) => {
		const newButton = document.createElement("button");
		newButton.className = "urlButton";
		
		setupUrlButtons(newButton, url, values[index]);
		
		const newMinusButton = document.createElement("button");
		newMinusButton.className = "minusButton";
		newMinusButton.onclick = function() {
			deleteUrlButton(this);
		};
		newMinusButton.innerHTML = "-";//"&#9734;";

		buttons.append(newButton);
		buttons.append(newMinusButton);
	});

	updateURLVisibility();
}

function setupUrlButtons(button, url, value) {
	button.dataset.value = value;
	button.dataset.url = url;

	var urlHref = url;

	if (!url.startsWith("http://") && !url.startsWith("https://")) {
		urlHref = "https://" + url;
	}

	button.onclick = function() {
		window.location.href = urlHref;
	};

	button.innerText = value;
	button.style.borderStyle = "solid";
	button.style.borderRight = "none";
}