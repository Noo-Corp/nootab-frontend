window.addEventListener("load", function() {
	const light = '#F5F5F5';
	const dark = '#424242';

    var awakeImg = "/static/images/logo-awake.png";
    var asleepImg = "/static/images/logo-asleep.png";
    var darkImg = "/static/images/dark-mode.png";
    var lightImg = "/static/images/light-mode.png";

    //set document colours from localStorage
	const colorProperties = [
		{ key: "colour-main-back-text", cssVar: "--backtext", defaultValue: "#6f6f6f" },
		{ key: "colour-mode-back", cssVar: "--modeback", defaultValue: "#F5F5F5" },
		{ key: "colour-mode-text", cssVar: "--modetext", defaultValue: "#424242" },
		{ key: "colour-mode-text-2", cssVar: "--modetext2", defaultValue: "#6f6f6f" },
		{ key: "colour-main-body-back", cssVar: "--bodyback", defaultValue: "#E8E8E8" },
		{ key: "colour-main", cssVar: "--main", defaultValue: "#ed6461" },
		{ key: "colour-main-empty", cssVar: "--empty", defaultValue: "#b74d4b" },
		{ key: "colour-main-hover", cssVar: "--hover", defaultValue: "#d95b59" },
		{ key: "colour-main-text", cssVar: "--text", defaultValue: "#F5F5F5" },
		{ key: "colour-secondary", cssVar: "--secondary", defaultValue: "#00baff" },
		{ key: "colour-secondary-hover", cssVar: "--secondaryhover", defaultValue: "#00abeb" },
		{ key: "colour-secondary-text", cssVar: "--secondarytext", defaultValue: "#F5F5F5" }
	];
	
	colorProperties.forEach(({ key, cssVar, defaultValue }) => {
		let value = localStorage.getItem(key);
		if (!value) {
		  value = defaultValue;
		}
		localStorage.setItem(key, value);
		document.documentElement.style.setProperty(cssVar, value);
	});

	updateIframesStyles();

	const colourPickerButton = document.querySelector('.colour-picker-button');
	const colourPickerContent = document.querySelector('#colourPickerContent');
	const colourPickerSubmit = document.querySelector('#colourPickerSubmit');
	const colourRandomSelect = document.querySelector('#colourRandomSelect');
	const colourPickerClose = document.querySelector('#close-colour');

	const primaryColourPicker = document.querySelector('#primary-colour-picker');
	const secondaryColourPicker = document.querySelector('#secondary-colour-picker');
	const primaryHidden = document.querySelector('#primary-colour-picker-hidden');
	const secondaryHidden = document.querySelector('#secondary-colour-picker-hidden');

	document.querySelectorAll('.colour-picker-tab').forEach(function(tab) {
		tab.addEventListener('click', function() {
			const colourPicker = tab.querySelector('theme-colour-picker');
			if (colourPicker) {
				const shadow = colourPicker.shadowRoot;
				const colourPickerButton = shadow.querySelector('.colour-picker-button');
				if (colourPickerButton) {
					colourPickerButton.click();
				}
			}
		});
	});	

	colourPickerButton.addEventListener('click', function() {
		var main_colour = localStorage.getItem("colour-main");
		var secondary_colour = localStorage.getItem("colour-secondary");
		primaryHidden.value = main_colour;
		secondaryHidden.value = secondary_colour;
		document.querySelector("#primary-colour-picker").shadowRoot.querySelector(".button-colour").style.background = main_colour;
		document.querySelector("#secondary-colour-picker").shadowRoot.querySelector(".button-colour").style.background = secondary_colour;
		colourPickerContent.classList.add('show');
		document.getElementById("modalOverlay").style.display = "block";
	});

	primaryColourPicker.addEventListener('change', (event) => {
		primaryHidden.value = event.detail.hex;

		var main_colour_active = primaryHidden.value;
		var main_colour_hsv_active = hexToHsv(main_colour_active);

		var palette_active = generatePalette(main_colour_hsv_active, "", 0);
		document.documentElement.style.setProperty('--main', main_colour_active);
		document.documentElement.style.setProperty('--empty', hsvToHex(palette_active.c1));
		document.documentElement.style.setProperty('--hover', hsvToHex(palette_active.c2));
		document.documentElement.style.setProperty('--text', getTextColour(main_colour_active));

		updateIframesStyles();
	});


	secondaryColourPicker.addEventListener('change', (event) => {
		secondaryHidden.value = event.detail.hex;

		var secondary_colour_active = secondaryHidden.value;
		var secondary_colour_hsv_active = hexToHsv(secondary_colour_active);
		var palette_active = generatePalette("", secondary_colour_hsv_active, 0);
		document.documentElement.style.setProperty('--secondary', hsvToHex(palette_active.c3));
		document.documentElement.style.setProperty('--secondaryhover', hsvToHex(palette_active.c4));
		document.documentElement.style.setProperty('--secondarytext', getTextColour(hsvToHex(palette_active.c3)));

		updateIframesStyles();
	});


	colourPickerSubmit.addEventListener('click', function(event) {
		event.preventDefault();

		localStorage.setItem('colour-main', document.documentElement.style.getPropertyValue('--main'));
        localStorage.setItem('colour-secondary', document.documentElement.style.getPropertyValue('--secondary'));
		localStorage.setItem('colour-main-empty', document.documentElement.style.getPropertyValue('--empty'));
        localStorage.setItem('colour-main-hover', document.documentElement.style.getPropertyValue('--hover'));
		localStorage.setItem('colour-main-text', document.documentElement.style.getPropertyValue('--text'));
        localStorage.setItem('colour-secondary-hover', document.documentElement.style.getPropertyValue('--secondaryhover'));
		localStorage.setItem('colour-secondary-text', document.documentElement.style.getPropertyValue('--secondarytext'));

		colourPickerContent.classList.remove('show');
		document.getElementById("modalOverlay").style.display = "none";
	});

	colourRandomSelect.addEventListener('click', function(event) {
		event.preventDefault();

		function componentToHex(c) {
			const hex = c.toString(16);
			return hex.length === 1 ? "0" + hex : hex;
		}

		//generate random colour
		const red = Math.floor(Math.random() * 256);
		const green = Math.floor(Math.random() * 256);
		const blue = Math.floor(Math.random() * 256);
		
		var main_colour_active = "#" + componentToHex(red) + componentToHex(green) + componentToHex(blue);
		var main_colour_hsv_active = hexToHsv(main_colour_active);

		var palette_active = generatePalette(main_colour_hsv_active, "", 1);
		secondary_colour_active = hsvToHex(palette_active.c3);
		document.documentElement.style.setProperty('--main', main_colour_active);
		document.documentElement.style.setProperty('--text', getTextColour(main_colour_active));
		document.documentElement.style.setProperty('--empty', hsvToHex(palette_active.c1));
		document.documentElement.style.setProperty('--hover', hsvToHex(palette_active.c2));
		document.documentElement.style.setProperty('--secondarytext', getTextColour(secondary_colour_active));
		document.documentElement.style.setProperty('--secondary', secondary_colour_active);
		document.documentElement.style.setProperty('--secondaryhover', hsvToHex(palette_active.c4));

		updateIframesStyles();

		primaryHidden.value = main_colour_active;
		secondaryHidden.value = secondary_colour_active;
		document.querySelector("#primary-colour-picker").shadowRoot.querySelector(".button-colour").style.background = main_colour_active;
		document.querySelector("#secondary-colour-picker").shadowRoot.querySelector(".button-colour").style.background = secondary_colour_active;
		this.blur();
	});

	colourPickerClose.addEventListener('click', function(event) {
		event.preventDefault();
		resetToSavedColours();
		colourPickerContent.classList.remove('show');
		document.getElementById("modalOverlay").style.display = "none";
	});

	const darkmode_button = document.querySelector('#darkmode-button');
	const darkmode_image = document.querySelector('#darkmode-button img');

    const logo = document.querySelector('#logo img');

	const mode_back = localStorage.getItem("colour-mode-back");

	if (mode_back == dark) {
		darkmode_image.src = lightImg;
		logo.src = asleepImg;
	} else {
		darkmode_image.src = darkImg;
		logo.src = awakeImg;
	}

	darkmode_button.addEventListener("click", function(event) {
		event.preventDefault();

		const mode_back = localStorage.getItem("colour-mode-back");

		if (mode_back == light) {
			darkmode_image.src = lightImg;
			logo.src = asleepImg;
			document.documentElement.style.setProperty('--bodyback', "#363636");
			document.documentElement.style.setProperty('--modeback', dark);
			document.documentElement.style.setProperty('--modetext', light);
			document.documentElement.style.setProperty('--modetext2', "#999");
			localStorage.setItem('colour-main-body-back', document.documentElement.style.getPropertyValue('--bodyback'));
			localStorage.setItem('colour-mode-back', document.documentElement.style.getPropertyValue('--modeback'));
			localStorage.setItem('colour-mode-text', document.documentElement.style.getPropertyValue('--modetext'));
			localStorage.setItem('colour-mode-text-2', document.documentElement.style.getPropertyValue('--modetext2'));

			updateIframesStyles();
		} else {
			darkmode_image.src = darkImg;
			logo.src = awakeImg;
			document.documentElement.style.setProperty('--bodyback', "#E8E8E8");
			document.documentElement.style.setProperty('--modeback', light);
			document.documentElement.style.setProperty('--modetext', dark);
			document.documentElement.style.setProperty('--modetext2', "#6f6f6f");
			localStorage.setItem('colour-main-body-back', document.documentElement.style.getPropertyValue('--bodyback'));
			localStorage.setItem('colour-mode-back', document.documentElement.style.getPropertyValue('--modeback'));
			localStorage.setItem('colour-mode-text', document.documentElement.style.getPropertyValue('--modetext'));
			localStorage.setItem('colour-mode-text-2', document.documentElement.style.getPropertyValue('--modetext2'));

			updateIframesStyles();
		}
	});
});

document.addEventListener('click', function (e) {
	const colourPicker = document.querySelector("#colourPickerContent");
	const isColourPickerOpen = colourPicker.classList.contains('show');

	if (isColourPickerOpen) {
		const isClickInsidePicker = e.target.closest('#colourPickerContent') || 
									e.target.classList.contains('colour-picker-button') || 
									e.target.id === 'colour-picker-image';

		if (!isClickInsidePicker) {
			resetToSavedColours();
			colourPicker.classList.remove('show');
			document.getElementById("modalOverlay").style.display = "none";
		}
	}
});

document.addEventListener('keydown', function (event) {
	const colourPicker = document.querySelector("#colourPickerContent");

	if (event.key === 'Escape' && colourPicker.classList.contains('show')) {
		resetToSavedColours();
		colourPicker.classList.remove('show');
		document.getElementById("modalOverlay").style.display = "none";
	}
});

function resetToSavedColours() {
	var main_colour = localStorage.getItem("colour-main");
	var main_empty = localStorage.getItem("colour-main-empty");
	var main_hover = localStorage.getItem("colour-main-hover");
	var main_text = localStorage.getItem("colour-main-text");
	var secondary_colour = localStorage.getItem("colour-secondary");
	var secondary_hover = localStorage.getItem("colour-secondary-hover");
	var secondary_text = localStorage.getItem("colour-secondary-text");

	document.documentElement.style.setProperty('--main', main_colour);
	document.documentElement.style.setProperty('--empty', main_empty);
	document.documentElement.style.setProperty('--hover', main_hover);
	document.documentElement.style.setProperty('--text', main_text);
	document.documentElement.style.setProperty('--secondary', secondary_colour);
	document.documentElement.style.setProperty('--secondaryhover', secondary_hover);
	document.documentElement.style.setProperty('--secondarytext', secondary_text);

	updateIframesStyles();
}

function updateIframesStyles() {
    const iframes = document.querySelectorAll('iframe');

    iframes.forEach(function(iframe) {
        const iframeDoc = iframe.contentWindow.document;
        
        if (iframeDoc) {
            let modeback = getComputedStyle(document.documentElement).getPropertyValue('--modeback');
            let modetext = getComputedStyle(document.documentElement).getPropertyValue('--modetext');
			let modetext2 = getComputedStyle(document.documentElement).getPropertyValue('--modetext2');
            let bodyback = getComputedStyle(document.documentElement).getPropertyValue('--bodyback');
            let main = getComputedStyle(document.documentElement).getPropertyValue('--main');
            let backtext = getComputedStyle(document.documentElement).getPropertyValue('--backtext');
            let empty = getComputedStyle(document.documentElement).getPropertyValue('--empty');
            let hover = getComputedStyle(document.documentElement).getPropertyValue('--hover');
            let text = getComputedStyle(document.documentElement).getPropertyValue('--text');
            let secondary = getComputedStyle(document.documentElement).getPropertyValue('--secondary');
            let secondaryhover = getComputedStyle(document.documentElement).getPropertyValue('--secondaryhover');
            let secondarytext = getComputedStyle(document.documentElement).getPropertyValue('--secondarytext');

            iframeDoc.documentElement.style.setProperty('--modeback', modeback);
            iframeDoc.documentElement.style.setProperty('--modetext', modetext);
            iframeDoc.documentElement.style.setProperty('--modetext2', modetext2);
            iframeDoc.documentElement.style.setProperty('--bodyback', bodyback);
            iframeDoc.documentElement.style.setProperty('--main', main);
            iframeDoc.documentElement.style.setProperty('--backtext', backtext);
            iframeDoc.documentElement.style.setProperty('--empty', empty);
            iframeDoc.documentElement.style.setProperty('--hover', hover);
            iframeDoc.documentElement.style.setProperty('--text', text);
            iframeDoc.documentElement.style.setProperty('--secondary', secondary);
            iframeDoc.documentElement.style.setProperty('--secondaryhover', secondaryhover);
            iframeDoc.documentElement.style.setProperty('--secondarytext', secondarytext);
        }
    });
}

function getTextColour(hexCode) {
	const red = parseInt(hexCode.substr(1, 2), 16);
	const green = parseInt(hexCode.substr(3, 2), 16);
	const blue = parseInt(hexCode.substr(5, 2), 16);

	if (red * 0.299 + green * 0.587 + blue * 0.114 > 186) {
		return "#424242";
	} else {
		return "#F5F5F5";
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

function generatePalette(p_hsv, s_hsv, ranFlag) {
	var modifiedHsv = {};

	if(ranFlag) {
		// Calculate the modified values
		var v1 = p_hsv.v - 0.21;
		if (v1 < 0) {
			v1 = p_hsv.v + 0.21;
		}

		var v2 = p_hsv.v + 0.08;
		if (v2 > 1) {
			v2 = p_hsv.v - 0.08;
		}
		if (Math.abs(197 / 2 - p_hsv.h) < 10) {
			var h3 = Math.abs(360 - p_hsv.h);
		} else {
			var h3 = Math.abs(197 - p_hsv.h);
		}
	
		var v4 = p_hsv.v + 0.08;
		if (v4 > 1) {
			v4 = p_hsv.v - 0.08;
		}

		modifiedHsv.c1 = {
			h: p_hsv.h,
			s: p_hsv.s,
			v: v1
		};
		modifiedHsv.c2 = {
			h: p_hsv.h,
			s: p_hsv.s,
			v: v2
		};
		modifiedHsv.c3 = {
			h: h3,
			s: p_hsv.s,
			v: p_hsv.v
		};
		modifiedHsv.c4 = {
			h: h3,
			s: p_hsv.s,
			v: v4
		};

	} else {
		if(p_hsv) {
			// Calculate the modified values
			var v1 = p_hsv.v - 0.21;
			if (v1 < 0) {
				v1 = p_hsv.v + 0.21;
			}
	
			var v2 = p_hsv.v + 0.08;
			if (v2 > 1) {
				v2 = p_hsv.v - 0.08;
			}

			modifiedHsv.c1 = {
				h: p_hsv.h,
				s: p_hsv.s,
				v: v1
			};
			modifiedHsv.c2 = {
				h: p_hsv.h,
				s: p_hsv.s,
				v: v2
			};
		}
	
		if(s_hsv) {
			var h3 = s_hsv.h;

			var v4 = s_hsv.v + 0.08;
			if (v4 > 1) {
				v4 = s_hsv.v - 0.08;
			}

			modifiedHsv.c3 = {
				h: h3,
				s: s_hsv.s,
				v: s_hsv.v
			};
			modifiedHsv.c4 = {
				h: h3,
				s: s_hsv.s,
				v: v4
			};
		}
	}

	return modifiedHsv;
}