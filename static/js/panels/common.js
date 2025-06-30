window.addEventListener("load", function() {
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
});