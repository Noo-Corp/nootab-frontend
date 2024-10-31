window.addEventListener("load", function() {
    var plusButton = document.querySelector("#plusButton");
    plusButton.style.display = "block";

    initUrlButtons();

    var urlData = JSON.parse(localStorage.getItem("urls"));
    if (urlData && urlData.length > 0) {
        const container = document.getElementById("urlButtonContainer");
        container.removeChild(container.children[1]);
        container.removeChild(container.children[0]);
    }
});

// Function to retrieve data from local storage
function getUrlsFromStorage() {
	const urls = JSON.parse(localStorage.getItem("urls")) || [];
	const values = JSON.parse(localStorage.getItem("url_values")) || [];
	return {
		urls,
		values
	};
}

// Function to save data to local storage
function saveUrlsToStorage(urls, values) {
	localStorage.setItem("urls", JSON.stringify(urls));
	localStorage.setItem("url_values", JSON.stringify(values));
}

// Function to add a new URL button
function addUrlButton() {
	const container = document.getElementById("urlButtonContainer");
	const divider = document.getElementById("urlDivider");

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

	container.insertBefore(newButton, divider);
	container.insertBefore(newMinusButton, divider);

	localStorage.setItem("emptyURL", false);

	updateURLVisibility();
}

// Function to delete a URL button
function deleteUrlButton(button) {
	const container = document.getElementById("urlButtonContainer");
	const index = Array.from(container.children).indexOf(button);
	const linkedUploadBtn = container.children[index - 1];

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

	container.removeChild(container.children[index]);
	container.removeChild(container.children[index - 1]);

	updateURLVisibility();
}

// Function to update the visibility of the URL container
function updateURLVisibility() {
	const container = document.getElementById("urlButtonContainer");
	const hasSeturlButtons = container.getElementsByClassName("urlButton").length > 0;
	var emptyURL = this.localStorage.getItem("emptyURL");

	if (hasSeturlButtons && emptyURL != "true") {
		container.classList.add("hasSeturlButtons");
		localStorage.setItem("emptyURL", false);
		var urlButtonInitial = document.querySelector(".urlButton.initial");
		var minusButtonInitial = document.querySelector(".minusButton.initial");

		if (urlButtonInitial && minusButtonInitial) {
			urlButtonInitial.style.display = "block";
			minusButtonInitial.style.display = "block";
		}
	} else {
		container.classList.remove("hasSeturlButtons");
		localStorage.setItem("emptyURL", "true");
	}

	if (emptyURL == "true") {
		container.removeChild(container.children[1]);
		container.removeChild(container.children[0]);
	}
}

// Function to go to a URL
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

// Function to open all URLs
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

// Function to initialize the URL buttons on page load
function initUrlButtons() {
	const {
		urls,
		values
	} = getUrlsFromStorage();
	const container = document.getElementById("urlButtonContainer");
	const divider = document.getElementById("urlDivider");

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

		container.insertBefore(newButton, divider);
		container.insertBefore(newMinusButton, divider);
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