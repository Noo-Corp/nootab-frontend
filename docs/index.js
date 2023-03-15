/*Copyright Alex Moica*/

var calendar = {
	//define variables used throughout the calendar functions
	monthNamesFull: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
	monthNames: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
	dayNames: ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"],
	data: null, //holds data on calendar events
	curDay: 0,
	curMonth: 0,
	curYear: 0,

	//Accesses stored data to dynamically build the given calendar month
	draw: function () {
		calendar.curMonth = parseInt(document.getElementById("sMonth").value); //HTML select element for month
		calendar.curYear = parseInt(document.getElementById("sYear").value); //HTML select element for year
		var daysInMonth = new Date(calendar.curYear, calendar.curMonth + 1, 0).getDate(), //getDate starts months at index 1, so add 1 to curMonth
			firstDay = new Date(calendar.curYear, calendar.curMonth, 1).getDay(), //name of the first day of the week of the month
			endDay = new Date(calendar.curYear, calendar.curMonth, daysInMonth).getDay(); //name of the last day of the week of the month

		calendar.data = localStorage.getItem("calendar" + calendar.curMonth + calendar.curYear); //access web storage objects of the given format for calendar data
		if (calendar.data == null) {
			localStorage.setItem("calendar" + calendar.curMonth + calendar.curYear, "{}"); //if no web storage object exists, instantiate and set value to {}
			calendar.data = {};
		} else {
			calendar.data = JSON.parse(calendar.data); //otherwise, parse data
		}

		//A month can have at most 6 rows of days (if the month begins on a friday)
		//Create a 6*7=42 long array of integers that represent days of the month
		//a 0 in the array represents a 'blank' day that you would see represented on a calendar as the days from the previous/next month
		var tiles = [];
		for (var i = 0; i < firstDay; i++) {
			tiles.push(" ");
		}

		for (var i = 1; i < daysInMonth + 1; i++) {
			tiles.push(i);
		}

		for (var i = 0; i < 6 - endDay; i++) {
			tiles.push(" ");
		}

		while (tiles.length < 42) {
			tiles.push(" ");
		}

		var container = document.getElementById("calContainer");
		var table = document.createElement("table");
		table.id = "calendar";
		container.innerHTML = ""; //clear any previous table so only one table is displayed at a time

		var dayRow = document.createElement("tr"); //generic table row object
		dayRow.id = "dayRow";

		//create the first row of the table that contains names of the week
		var dayNames = calendar.dayNames;
		var numDays = dayNames.length;
		var cellFragment = document.createDocumentFragment();

		for (var i = 0; i < numDays; i++) {
			var dCell = document.createElement("td");
			dCell.innerHTML = dayNames[i];
			cellFragment.appendChild(dCell);
		}

		dayRow.appendChild(cellFragment);
		table.appendChild(dayRow); //append row to the table

		var row = null;
		var cell = null;
		var dayCounter = 0; //count through the tile array
		var zeroCount = 0; //how many empty are at the end of the array

		const today = new Date();
		const day = String(today.getDate());

		// create a document fragment to hold the rows
		const fragment = document.createDocumentFragment();

		// iterate through the rows and columns to create the cells
		for (let y = 0; y < 6; y++) {
			const row = document.createElement("tr");
			row.id = "day";
			let zeroCount = 0; // reset the zero count for each row

			for (let x = 0; x < 7; x++) {
				const cell = document.createElement("td");
				cell.innerHTML = tiles[y * 7 + x];

				if (tiles[y * 7 + x] === " ") {
					cell.id = "empty";
					zeroCount++;
				} else {
					const tile = tiles[y * 7 + x];
					cell.innerHTML = `<div class='cell'>${tile}</div>`;

					if (calendar.data[tile]) {
						const curYear = today.getFullYear();
						const curMonth = today.getMonth();

						if (calendar.curYear === curYear && calendar.curMonth === curMonth && tile == day) {
							const data = calendar.data[tile].replace(/\n/g, "<br>");
							cell.innerHTML = `<div id="current-day" style="padding: 12px;"><div class='cell'>${tile}</div>${data}</div>`;
							cell.style.padding = "0px";
							cell.style.position = "relative";
						} else {
							const data = calendar.data[tile].replace(/\n/g, "<br>");
							cell.innerHTML += data;
						}
					} else {
						cell.style.height = "64px"; // default height of empty cells
						if (calendar.curYear === today.getFullYear() && calendar.curMonth === today.getMonth() && tile == day) {
							cell.innerHTML = `<div id="current-day" style="display: flex;"><div class='cell'>${tile}</div></div>`;
							cell.style.padding = "0px";
							cell.style.position = "relative";
						}
					}

					cell.addEventListener("click", () => calendar.show(cell));
				}

				row.appendChild(cell);
			}

			// remove last row if it only contains zeros
			if (zeroCount !== 7) {
				fragment.appendChild(row);
			}
		}

		// append the document fragment to the container
		table.appendChild(fragment);
		container.appendChild(table);

		calendar.close(); //close the event panel in case it is open when a new calendar is generated
	},

	//show the event panel where the user can add an event on a certain date
	show: function (e) {
		const event = document.getElementById("calEvent");
		const inputForm = document.createElement("form");
		inputForm.addEventListener("submit", calendar.save);

		event.innerHTML = "";
		calendar.curDay = e.querySelector(".cell").textContent;

		let inputPanel = "<h1>" + (calendar.data[calendar.curDay] ? "EDIT EVENT" : "ADD EVENT") + "</h1>";
		inputPanel += "<p>" + calendar.monthNamesFull[calendar.curMonth] + " " + calendar.curDay + ", " + calendar.curYear + "</p>";
		inputPanel += "<textarea id='inputDetails' required>" + (calendar.data[calendar.curDay] || "") + "</textarea>";
		inputPanel += "<input type='button' value='Delete' onclick='calendar.delete()'/>";
		inputPanel += "<input type='button' value='Cancel' onclick='calendar.close()'/>";
		inputPanel += "<input type='submit' value='Save'/>";
		inputForm.innerHTML = inputPanel;
		event.appendChild(inputForm);

		event.style.display = "block";
		setTimeout(() => event.classList.add('show'), 0);

		const event_ta = event.querySelector("textarea");
		event_ta.focus();
		event_ta.setSelectionRange(event_ta.value.length, event_ta.value.length);

		document.addEventListener('click', closeOnClick);
		document.addEventListener('keydown', closeOnClick);
	},

	//write events to localStorage for future instances and have them show up on the calendar
	save: function (e) {
		e.stopPropagation(); //prevent the same event being called
		e.preventDefault(); //prevent submit from submitting the form, instead having it execute the below custom action
		calendar.data[calendar.curDay] = document.getElementById("inputDetails").value;
		localStorage.setItem("calendar" + calendar.curMonth + calendar.curYear, JSON.stringify(calendar.data)); //save events to localStorage by their month and year
		calendar.draw(); //redraw to update calendar
	},

	//delete event from localStorage and have it removed from calendar
	delete: function () {
		if (calendar.data[calendar.curDay]) { //only perform action if there is an event in the cell
			delete calendar.data[calendar.curDay]; //delete event from local array
			localStorage.setItem("calendar" + calendar.curMonth + calendar.curYear, JSON.stringify(calendar.data)); //save local array to localStorage
			calendar.draw(); //redraw to update calendar
		} else {
			var event = document.getElementById("calEvent");
			var event_ta = event.querySelector("textarea");
			event_ta.value = "";
			event_ta.focus();
		}
	},

	//close the event panel by deleting the HTML that makes it up
	close: function () {
		e = document.getElementById("calEvent");
		e.classList.remove('show');
		e.style.display = "none";
		document.removeEventListener("click", closeOnClick);
	}
};

//add a listener to perform the following actions on page load
window.addEventListener("load", function () {
	var today = new Date();
	var sMonth = document.getElementById("sMonth"); //HTML select element for month
	var sYear = document.getElementById("sYear"); //HTML select element for year

	//populate the HTML select element for month with the 12 months defined in calendar
	for (var i = 0; i < 12; i++) {
		var opt = document.createElement('option');
		opt.value = i;
		opt.innerHTML = calendar.monthNames[i];
		//have the current month as the default option selected
		if (i == today.getMonth())
			opt.selected = true;
		sMonth.appendChild(opt);
	}

	//populate the HTML select element for year from 2023 to 5 years after the current year
	for (var i = 2023; i < today.getFullYear() + 6; i++) {
		var opt = document.createElement('option');
		opt.value = i;
		opt.innerHTML = i;
		//have the current year as the default option selected
		if (i == today.getFullYear())
			opt.selected = true;
		sYear.appendChild(opt);
	}

	document.getElementById("btnShow").addEventListener("click", calendar.draw); //listener for on click event on show button
	calendar.draw(); //display calendar for current month and year

    document.addEventListener("keydown", documentKeyHandler);

    //get open panels
    var main_panel_open = localStorage.getItem("panel-main") || "calendar";

    document.getElementById(main_panel_open).style.display = "block";
    document.getElementById(main_panel_open+"-select").style.borderBottom = "6px solid var(--top)";
    document.getElementById(main_panel_open+"-select").style.color = "var(--top)";
    localStorage.setItem("panel-main", main_panel_open);

	//set document colours from localStorage
	var main_colour = localStorage.getItem("colour-main") || "#ed6461";
	var main_colour_hsv = hexToHsv(main_colour);
	var main_mode_back = localStorage.getItem("colour-mode-back") || '#F5F5F5';
	var main_mode_text = localStorage.getItem("colour-mode-text") || '#424242';

	var palette = generatePalette(main_colour_hsv);
	document.documentElement.style.setProperty('--main', main_colour);
	document.documentElement.style.setProperty('--modeback', main_mode_back);
	document.documentElement.style.setProperty('--modetext', main_mode_text);
	document.documentElement.style.setProperty('--header', getTextColor(hsvToHex(palette.c3)));
	document.documentElement.style.setProperty('--text', getTextColor(main_colour));
	document.documentElement.style.setProperty('--empty', hsvToHex(palette.c1));
	document.documentElement.style.setProperty('--hover', hsvToHex(palette.c2));
	document.documentElement.style.setProperty('--top', hsvToHex(palette.c3));
	document.documentElement.style.setProperty('--tophover', hsvToHex(palette.c4));


	const colourPickerButton = document.querySelector('.colour-picker-button');
    const colourPickerImage = document.querySelector('.colour-picker-button img');
    colourPickerImage.src = "images/colour-wheel.png";
	colourPickerButton.addEventListener('click', function () {
		// create color picker input element
		const colourPickerInput = document.createElement('input');
		colourPickerInput.type = 'color';

		// add event listener to alert hex code when color is selected
		colourPickerInput.addEventListener('change', function () {
			var main_colour_active = colourPickerInput.value;
			var main_colour_hsv_active = hexToHsv(main_colour_active);

			var palette_active = generatePalette(main_colour_hsv_active);
			document.documentElement.style.setProperty('--main', main_colour_active);
			document.documentElement.style.setProperty('--header', getTextColor(hsvToHex(palette_active.c3)));
			document.documentElement.style.setProperty('--text', getTextColor(main_colour_active));
			document.documentElement.style.setProperty('--empty', hsvToHex(palette_active.c1));
			document.documentElement.style.setProperty('--hover', hsvToHex(palette_active.c2));
			document.documentElement.style.setProperty('--top', hsvToHex(palette_active.c3));
			document.documentElement.style.setProperty('--tophover', hsvToHex(palette_active.c4));

			// Save the main colour to localStorage
			localStorage.setItem('colour-main', main_colour_active);
		});

		// trigger click event on color picker input to open color picker dialog
		colourPickerInput.click();

		// remove color picker input element when color is selected or when user cancels selection
		colourPickerInput.addEventListener('blur', function () {
			colourPickerInput.remove();
		});

		// add event listener to the document to detect clicks outside the color picker
		document.addEventListener('click', function (event) {
			if (!colourPickerInput.contains(event.target) && event.target !== colourPickerButton) {
				colourPickerInput.remove();
			}
		});
	});


	const darkmode_button = document.querySelector('#darkmode-button');
    const darkmode_image = document.querySelector('#darkmode-button img');
	const logo = document.querySelector('#logo img');

	if (main_mode_back == '#424242') {
		darkmode_image.src = 'images/light-mode.png';
		logo.src = "images/logo-asleep.png";
		document.documentElement.style.setProperty('--bodyback', "#363636");
	} else {
		darkmode_image.src = 'images/dark-mode.png';
		logo.src = "images/logo-awake.png";
		document.documentElement.style.setProperty('--bodyback', "#E8E8E8");
	}

	darkmode_button.addEventListener("click", toggleDarkMode);

	// check if popup was already dismissed
    const popup = document.querySelector('.popup');

	if (localStorage.getItem('popup-dismissed')) {
		popup.style.display = 'none';
	} else {
        popup.style.display = 'block';
    }

	document.getElementById('close-popup').addEventListener('click', popupClick);

	var coll = document.getElementsByClassName("collapsible");
	var i;

	for (i = 0; i < coll.length; i++) {
		coll[i].addEventListener("click", collToggle);
	}

	document.getElementById('logo').addEventListener('click', logoClick);

	var search = document.querySelector(".search-bar form input");
	search.focus();
    

    const saved_note_text = localStorage.getItem("notes-main") || "";
    document.getElementById('editor').value = saved_note_text;

    document.getElementById('editor-save-btn').addEventListener('click', saveNote);
    document.getElementById('editor').addEventListener('input', indicateSave);
});

function documentKeyHandler(event) {
    if (event.key === 'Tab') {
        if (document.getElementById("calEvent").style.display === "none") {
            event.preventDefault();
            var current_mode = localStorage.getItem('panel-main');
            var toggle_to;
            if (current_mode == "calendar") {
                toggle_to = "notes";
            } else if (current_mode == "notes") {
                toggle_to = "calendar";
            }
            openMode(toggle_to);
        }
    } else if (event.ctrlKey && event.key === 's') {
        if (document.getElementById("notes").style.display == "block") {
            event.preventDefault();
            saveNote();
        }
    }
}
  
function logoClick() {
	const logo = document.getElementById('logo');

	if (localStorage.getItem("colour-mode-back") === '#F5F5F5' || localStorage.getItem("colour-mode-back") === null) {
		logo.classList.remove('animate');
		void logo.offsetWidth;
		logo.classList.add('animate');
	} else {
		const zzz_container = document.querySelector(".zzz-container");
            const zzz_children = zzz_container.querySelectorAll("div");
            zzz_children.forEach(function (child) {
                child.classList.add("zzz-animate");
                child.textContent = "Z";
                child.addEventListener("animationend", function () {
                    child.classList.remove("zzz-animate");
                    child.textContent = "";
                });
            });
		logo.classList.remove('pulse');
		void logo.offsetWidth;
		logo.classList.add('pulse');
	}
}

function popupClick() {
    const popup = document.querySelector('.popup');
	localStorage.setItem('popup-dismissed', 'true');
    popup.style.display = 'none';
}

function collToggle() {
	this.classList.toggle("active");
	var content = this.nextElementSibling;
	if (content.style.maxHeight) {
		content.style.maxHeight = null;
	} else {
		content.style.maxHeight = content.scrollHeight + "px";
	}
}


function closeOnClick(event) {
	calEvent = document.getElementById("calEvent");
	if (event.type == "click") {
        if(document.querySelector('#calEvent').classList.contains('show')) {
            if (!calEvent.contains(event.target) && (!event.target.closest('td') || event.target.closest('tr').id == 'dayRow' || event.target.closest('td').id == 'empty')) {
                calendar.close();
                document.removeEventListener("click", closeOnClick);
            }
        }
	} else if (event.type == "keydown") {
		if (event.key === 'Escape') {
			calendar.close();
            document.removeEventListener("keydown", closeOnClick);
		}
	}
}

function getTextColor(hexCode) {
	const red = parseInt(hexCode.substr(1, 2), 16);
	const green = parseInt(hexCode.substr(3, 2), 16);
	const blue = parseInt(hexCode.substr(5, 2), 16);

	if (red * 0.299 + green * 0.587 + blue * 0.114 > 186) {
		return "#424242";
	} else {
		return "#F5F5F5";
	}
}


function toggleDarkMode() {
    const darkmode_image = document.querySelector('#darkmode-button img');
	const logo = document.querySelector('#logo img');
	const light = '#F5F5F5';
	const dark = '#424242';

	if (darkmode_image.getAttribute("src") === 'images/light-mode.png') {
		darkmode_image.src = 'images/dark-mode.png';
		logo.src = "images/logo-awake.png";
		document.documentElement.style.setProperty('--bodyback', "#E8E8E8");
		document.documentElement.style.setProperty('--modeback', light);
		document.documentElement.style.setProperty('--modetext', dark);
		localStorage.setItem('colour-mode-back', light);
		localStorage.setItem('colour-mode-text', dark);
	} else {
		darkmode_image.src = 'images/light-mode.png';
		logo.src = "images/logo-asleep.png";
		document.documentElement.style.setProperty('--bodyback', "#363636");
		document.documentElement.style.setProperty('--modeback', dark);
		document.documentElement.style.setProperty('--modetext', light);
		localStorage.setItem('colour-mode-back', dark);
		localStorage.setItem('colour-mode-text', light);
	}
}


function hexToHsv(hex) {
	// Convert hex code to RGB values
	var r = parseInt(hex.substring(1, 3), 16);
	var g = parseInt(hex.substring(3, 5), 16);
	var b = parseInt(hex.substring(5, 7), 16);

	// Convert RGB values to HSV values
	var max = Math.max(r, g, b);
	var min = Math.min(r, g, b);
	var delta = max - min;

	var h, s, v;

	if (max === 0) {
		s = 0;
	} else {
		s = delta / max;
	}

	if (delta === 0) {
		h = 0;
	} else {
		if (r === max) {
			h = (g - b) / delta;
		} else if (g === max) {
			h = 2 + (b - r) / delta;
		} else {
			h = 4 + (r - g) / delta;
		}

		h *= 60;

		if (h < 0) {
			h += 360;
		}
	}

	v = max / 255;

	// Return HSV values as an object
	return {
		h: h,
		s: s,
		v: v
	};
}


function hsvToHex(hsv) {
	if (typeof hsv === 'string') {
		hsv = JSON.parse(hsv);
	}

	// Convert HSV values to RGB values
	var c = hsv.v * hsv.s;
	var x = c * (1 - Math.abs((hsv.h / 60) % 2 - 1));
	var m = hsv.v - c;
	var r, g, b;

	if (hsv.h >= 0 && hsv.h < 60) {
		r = c;
		g = x;
		b = 0;
	} else if (hsv.h >= 60 && hsv.h < 120) {
		r = x;
		g = c;
		b = 0;
	} else if (hsv.h >= 120 && hsv.h < 180) {
		r = 0;
		g = c;
		b = x;
	} else if (hsv.h >= 180 && hsv.h < 240) {
		r = 0;
		g = x;
		b = c;
	} else if (hsv.h >= 240 && hsv.h < 300) {
		r = x;
		g = 0;
		b = c;
	} else {
		r = c;
		g = 0;
		b = x;
	}

	r = Math.round((r + m) * 255);
	g = Math.round((g + m) * 255);
	b = Math.round((b + m) * 255);

	// Convert RGB values to HEX value
	var hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);

	return hex;
}


function generatePalette(hsv) {
	var modifiedHsv = {};

	// Calculate the modified values
	var v1 = hsv.v - 0.21;
	if (v1 < 0) {
		v1 = hsv.v + 0.21;
	}

	var v2 = hsv.v + 0.08;
	if (v2 > 1) {
		v2 = hsv.v - 0.08;
	}

	if (Math.abs(197 / 2 - hsv.h) < 10) {
		var h3 = Math.abs(360 - hsv.h);
	} else {
		var h3 = Math.abs(197 - hsv.h);
	}

	var v4 = hsv.v + 0.08;
	if (v4 > 1) {
		v4 = hsv.v - 0.08;
	}

	// Add the modified values to the result object
	modifiedHsv.c1 = {
		h: hsv.h,
		s: hsv.s,
		v: v1
	};
	modifiedHsv.c2 = {
		h: hsv.h,
		s: hsv.s,
		v: v2
	};
	modifiedHsv.c3 = {
		h: h3,
		s: hsv.s,
		v: hsv.v
	};
	modifiedHsv.c4 = {
		h: h3,
		s: hsv.s,
		v: v4
	};
	return modifiedHsv;
}

function openMode(modeName) {
    var i, x, panelModes;
    x = document.getElementsByClassName("mode");
    for (i = 0; i < x.length; i++) {
        x[i].style.display = "none";
    }
    panelModes = document.getElementsByClassName("panel-mode");
    for (i = 0; i < x.length; i++) {
        panelModes[i].style.borderBottom = "6px solid #646464";
        panelModes[i].style.color = "#646464";
    }

    document.getElementById(modeName).style.display = "block";
    document.getElementById(modeName+"-select").style.borderBottom = "6px solid var(--top)";
    document.getElementById(modeName+"-select").style.color = "var(--top)";
    if (modeName == "notes") {
        localStorage.setItem('panel-main', "notes");
        document.getElementById("editor").focus();
    } else if (modeName == "calendar") {
        localStorage.setItem('panel-main', "calendar");
        document.querySelector(".search-bar form input").focus();
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

function openAd() {
    window.open('https://creepy-reception.com/b/3mV.0QP-3cpkvCbjmZVtJWZLDS0u0/NFjYY/0/MhD/gV0/LUTVQF2/N/jeQIwdOADdUm', '_blank');
}