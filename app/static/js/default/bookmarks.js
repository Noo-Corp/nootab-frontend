window.addEventListener("load", function() {
	const editBtn = document.querySelector("#editUrlButton");
	const bookmarksContent = document.querySelector('#bookmarksContent');
	const linksClose = document.querySelector('#close-links');

    initUrls();

	editBtn.addEventListener('click', function() {
		bookmarksContent.classList.add('show');
		document.getElementById("modalOverlay").style.display = "block";
	});

	linksClose.addEventListener('click', function(event) {
		event.preventDefault();
		bookmarksContent.classList.remove('show');
		document.getElementById("modalOverlay").style.display = "none";
	});

	document.addEventListener('click', function (e) {
		const bookmarksContent = document.querySelector('#bookmarksContent');
		const isBookmarksOpen = bookmarksContent.classList.contains('show');
	
		if (isBookmarksOpen) {
			const isClickInsideModal = e.target.closest('#bookmarksContent') || 
										e.target.id === 'editUrlButton';
	
			if (!isClickInsideModal) {
				bookmarksContent.classList.remove('show');
				document.getElementById("modalOverlay").style.display = "none";
			}
		}
	});
	
	document.addEventListener('keydown', function (event) {
		const bookmarksContent = document.querySelector('#bookmarksContent');
	
		if (event.key === 'Escape' && bookmarksContent.classList.contains('show')) {
			bookmarksContent.classList.remove('show');
			document.getElementById("modalOverlay").style.display = "none";
		}
	});
});

function initUrls() {
	const {
		urls,
		values,
		launch
	} = getUrlsFromStorage();
	const buttons = document.getElementById("urlButtons");
	const bookmarkTableBody = document.getElementById("bookmarkTableBody");
    buttons.innerHTML = '';
	bookmarkTableBody.innerHTML = '';

	urls.forEach((url, index) => {
		// Bookmarks Table
        const row = document.createElement("tr");

        const launchCell = document.createElement("td");
        const launchBtn = document.createElement("button");
		if (launch[index] == true) {
			launchBtn.innerHTML = "&#9733;";
		} else {
			launchBtn.innerHTML = "&#9734;";
		}
        launchBtn.onclick = (event) => toggleLaunch(event, index);
		launchBtn.classList.add("launch-link");
        launchCell.appendChild(launchBtn);
        row.appendChild(launchCell);

        const orderCell = document.createElement("td");
        const orderInput = document.createElement("input");
        orderInput.value = index + 1; // Display as 1-based index
		orderInput.className = "orderInput";
        orderCell.appendChild(orderInput);
        row.appendChild(orderCell);

		$(orderInput).spinner({
			step: -1,
			min: 1,
			max: urls.length
		}).siblings('.ui-spinner-up, .ui-spinner-down').addClass("spinner-bookmark-button");

		$(orderInput).on('change', function() {
			const newIndex = parseInt(this.value) - 1;
			updateOrder(index, newIndex);
		});

		$(orderInput).on('keydown', function(event) {
			if (event.key === "ArrowUp" || event.key === "ArrowDown") {
				const newIndex = parseInt(this.value) - 1;
				updateOrder(index, newIndex);
			}
		});

        const nameCell = document.createElement("td");
        nameCell.innerText = values[index];
        row.appendChild(nameCell);

        const actionsCell = document.createElement("td");
        const editBtn = document.createElement("button");
        editBtn.innerHTML = "&#9998;";
		editBtn.onclick = (event) => editBookmark(event, index);
		editBtn.classList.add("edit-link");
        actionsCell.appendChild(editBtn);

        const deleteBtn = document.createElement("button");
        deleteBtn.innerHTML = "&#10006;";
        deleteBtn.onclick = (event) => deleteUrl(event, index);
		deleteBtn.classList.add("delete-link");
        actionsCell.appendChild(deleteBtn);
        row.appendChild(actionsCell);

        bookmarkTableBody.appendChild(row);
		
		// Bookmarks
		const newButton = document.createElement("button");
		newButton.className = "urlButton";

		if (launch[index] == true) {
			newButton.classList.add("wide");
		}
		
		setupUrlButtons(newButton, url, values[index]);

		buttons.append(newButton);
	});

	$('.spinner-bookmark-button').click(function(event) {
		event.stopPropagation();
		$(this).siblings('input').change();
	});

	updateURLVisibility();
}

function addUrlButton(event) {
	event.stopPropagation();
	var url = prompt("Enter Bookmark URL:");
	if (url != null && url.trim() !== "") {
		var value = prompt("Enter Bookmark Name (Optional):");

		if (value.trim() == "" || value == null) {
			value = url.replace(/^(https?:\/\/)?(www\.)?/, '').substring(0, 8);
			if (url.length > 8) {
				value += "..";
			}
		}

		const newButton = document.createElement("button");
		newButton.className = "urlButton";
		
		setupUrlButtons(newButton, url, value);

		const {
			urls,
			values,
			launch
		} = getUrlsFromStorage();
		urls.push(url);
		values.push(value);
		launch.push(false);
		saveUrlsToStorage(urls, values, launch);
	}

	initUrls();
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
}

function updateOrder(oldIndex, newIndex) {
    const { urls, values, launch } = getUrlsFromStorage();
    if (newIndex < 0 || newIndex >= urls.length || oldIndex === newIndex) return;

    // Move the item in the arrays
    const urlToMove = urls.splice(oldIndex, 1)[0];
    const valueToMove = values.splice(oldIndex, 1)[0];
	const launchToMove = launch.splice(oldIndex, 1)[0];
    urls.splice(newIndex, 0, urlToMove);
    values.splice(newIndex, 0, valueToMove);
	launch.splice(newIndex, 0, launchToMove);

    saveUrlsToStorage(urls, values, launch);
    initUrls(); // Refresh the table
}

function getUrlsFromStorage() {
	const urls = JSON.parse(localStorage.getItem("urls")) || [];
	const values = JSON.parse(localStorage.getItem("url_values")) || [];
	const launch = JSON.parse(localStorage.getItem("url_launch")) || [];
	return {
		urls,
		values,
		launch
	};
}

function saveUrlsToStorage(urls, values, launch) {
	localStorage.setItem("urls", JSON.stringify(urls));
	localStorage.setItem("url_values", JSON.stringify(values));
	localStorage.setItem("url_launch", JSON.stringify(launch));
}

function updateURLVisibility() {
	const buttons = document.getElementById("urlButtons");
	const hasSeturlButtons = buttons.getElementsByClassName("urlButton").length > 0;

	if (hasSeturlButtons) {
		buttons.classList.add("hasSeturlButtons");

		document.getElementById("openAllUrlsButton").style.display = "block";
		document.getElementById("urlDivider").style.display = "block";
	} else {
		buttons.classList.remove("hasSeturlButtons");
		document.getElementById("openAllUrlsButton").style.display = "none";
		document.getElementById("urlDivider").style.display = "none";
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
			values,
			launch
		} = getUrlsFromStorage();
		urls.push(url);
		values.push(value);
		saveUrlsToStorage(urls, values, launch);
	}
}

function openAllUrls() {
	const {
		urls,
		values,
		launch
	} = getUrlsFromStorage();

	const setUrlButtons = document.querySelectorAll(".urlButton");
	if (setUrlButtons.length > 0) {
		for (let i = 0; i < setUrlButtons.length; i++) {
			if (launch[i] == true) {
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
}

function toggleLaunch(event, index) {
	event.stopPropagation();

    const { urls, values, launch } = getUrlsFromStorage();
	launch[index] = !launch[index];
    localStorage.setItem("url_launch", JSON.stringify(launch));
	initUrls(); // Refresh the table
}

function editBookmark(event, index) {
    event.stopPropagation();

    const { urls, values, launch } = getUrlsFromStorage();
    const newUrl = prompt("Edit Bookmark URL:", urls[index]);
    const newValue = prompt("Edit Bookmark Name:", values[index]);

    if (newUrl && newUrl !== "") {
        urls[index] = newUrl;
        values[index] = newValue || newValue.replace(/^(https?:\/\/)?(www\.)?/, '').substring(0, 8);
        saveUrlsToStorage(urls, values, launch);
        initUrls(); // Refresh the table
    }
}

function deleteUrl(event, index) {
	event.stopPropagation();

    const { urls, values, launch } = getUrlsFromStorage();
    urls.splice(index, 1);
    values.splice(index, 1);
	launch.splice(index, 1);
    saveUrlsToStorage(urls, values, launch);
    initUrls(); // Refresh the table
}