const validExpenseRanges = [
	"1mo",
	"3mo",
	"6mo",
	"1yr",
	"all"
];

let currentExpenseRange = localStorage.getItem(
	"expense-range"
) || "1mo";

if (!validExpenseRanges.includes(currentExpenseRange)) {
	currentExpenseRange = "1mo";
}


window.addEventListener("load", function () {
	initializeExpenseData();

	const { isPopped } = getUrlParams();

	if (isPopped === "true") {
		document.getElementById("main-container").classList.add("popped");
	}

	document.querySelectorAll(".expense-range-button").forEach(button => {
		button.classList.toggle(
			"active",
			button.dataset.range === currentExpenseRange
		);
	});

	renderPresets();
	renderCategories();
	renderCategoryRows();
	renderExpenseSummary();
});


function getUrlParams() {
	const urlParams = new URLSearchParams(window.location.search);
	return { isPopped: urlParams.get("popped") };
}


function initializeExpenseData() {
	if (localStorage.getItem("expense-categories") === null) {
		localStorage.setItem("expense-categories", JSON.stringify([
			"Groceries",
			"Dining",
			"Transportation",
			"Utilities",
			"Shopping",
			"Repayment"
		]));

		localStorage.setItem("expense-repayment-added", "true");
	} else if (localStorage.getItem("expense-repayment-added") === null) {
		const categories = getCategories();

		if (!categories.some(category => {
			return category.trim().toLowerCase() === "repayment";
		})) {
			categories.push("Repayment");
			saveCategories(categories);
		}

		localStorage.setItem("expense-repayment-added", "true");
	}

	if (localStorage.getItem("expense-category-rows") === null) {
		localStorage.setItem("expense-category-rows", JSON.stringify([]));
	}

	if (localStorage.getItem("expense-category-row-ids") === null) {
		localStorage.setItem("expense-category-row-ids", JSON.stringify([]));
	}

	if (localStorage.getItem("expense-dates") === null) {
		localStorage.setItem("expense-dates", JSON.stringify([]));
	}

	if (localStorage.getItem("expense-merchants") === null) {
		localStorage.setItem("expense-merchants", JSON.stringify([]));
	}

	if (localStorage.getItem("expense-amounts") === null) {
		localStorage.setItem("expense-amounts", JSON.stringify([]));
	}
}


function hasExpenseData() {
	const amounts = JSON.parse(
		localStorage.getItem("expense-amounts")
	) || [];

	return amounts.length > 0;
}


function getPresets() {
	return JSON.parse(localStorage.getItem("expense-presets")) || [];
}


function savePresets(presets) {
	localStorage.setItem("expense-presets", JSON.stringify(presets));
}


function createPreset() {
	const nameInput = prompt("Specify a name for the preset:");
	if (!nameInput) return;

	const name = nameInput.trim();
	if (!name) return;

	const dateInput = prompt("Specify the column for Date of Expense:");
	if (dateInput === null) return;

	const categoryInput = prompt("Specify the column for Category:");
	if (categoryInput === null) return;

	const merchantInput = prompt("Specify the column for Merchant (optional):");
	if (merchantInput === null) return;

	const amountInput = prompt("Specify the column for Amount:");
	if (amountInput === null) return;

	const date = Number(dateInput);
	const category = Number(categoryInput);
	const merchant = merchantInput.trim() === "" ? null : Number(merchantInput);
	const amount = Number(amountInput);

	if (
		!Number.isInteger(date) || date < 1 ||
		!Number.isInteger(category) || category < 1 ||
		(merchant !== null && (!Number.isInteger(merchant) || merchant < 1)) ||
		!Number.isInteger(amount) || amount < 1
	) {
		alert("Columns must be positive whole numbers.");
		return;
	}

	const presets = getPresets();

	presets.push({
		name: name,
		columns: {
			date: date,
			category: category,
			merchant: merchant,
			amount: amount
		},
		lastExpenseDate: null
	});

	savePresets(presets);
	renderPresets();
	renderExpenseSummary();
}


function renderPresets() {
	const presets = getPresets();
	const presetList = document.getElementById("preset-list");
	const addItem = document.getElementById("preset-add-item");
	const createButton = document.getElementById("create-preset-button");

	presetList.querySelectorAll(".preset-item").forEach(item => item.remove());

	if (presets.length == 0) {
		createButton.style.display = "block";
		addItem.classList.remove("active");
		return;
	}

	createButton.style.display = "none";
	addItem.classList.add("active");

	presets.forEach((preset, index) => {
		const presetItem = document.createElement("li");
		const presetButton = document.createElement("button");
		const presetInfo = document.createElement("div");
		const presetName = document.createElement("span");
		const presetDate = document.createElement("span");
		const uploadImage = document.createElement("span");
		const removeButton = document.createElement("button");

		presetItem.classList.add("preset-item");

		presetButton.classList.add("preset-button");
		presetButton.type = "button";

		presetInfo.classList.add("preset-info");

		presetName.classList.add("preset-name");
		presetName.textContent = preset.name;

		presetDate.classList.add("preset-date");
		presetDate.textContent = preset.lastExpenseDate
			? `Last expense: ${preset.lastExpenseDate}`
			: "No expenses";

		uploadImage.classList.add("preset-upload");

		presetInfo.appendChild(presetName);
		presetInfo.appendChild(presetDate);

		presetButton.appendChild(presetInfo);
		presetButton.appendChild(uploadImage);

		presetButton.addEventListener("click", function () {
			selectPresetFile(index);
		});

		removeButton.classList.add(
			"popped-element",
			"remove-button",
			"preset-remove-button"
		);

		removeButton.textContent = "✖";

		removeButton.addEventListener("click", function () {
			removePreset(index);
		});

		presetItem.appendChild(presetButton);
		presetItem.appendChild(removeButton);

		presetList.insertBefore(presetItem, addItem);
	});
}


function removePreset(index) {
	const presets = getPresets();

	presets.splice(index, 1);

	savePresets(presets);
	renderPresets();
	renderExpenseSummary();
}


function selectPresetFile(presetIndex) {
	const fileInput = document.createElement("input");

	fileInput.type = "file";
	fileInput.accept = ".csv,text/csv";

	fileInput.addEventListener("change", async function () {
		const file = fileInput.files[0];
		if (!file) return;

		if (!file.name.toLowerCase().endsWith(".csv")) {
			alert("Please select a CSV file.");
			return;
		}

		const csvText = await file.text();

		importPresetCsv(csvText, presetIndex);
	});

	fileInput.click();
}


function cleanMerchantName(merchantName) {
	if (merchantName === null || merchantName === undefined) {
		return null;
	}

	const merchant = String(merchantName).trim();

	if (!merchant) return "";

	const match = merchant.match(/([a-zA-Z0-9-]+)$/);

	let cleanedMerchant = merchant;

	if (match) {
		const trailingPart = match[1];

		const prefix = merchant
			.slice(0, match.index)
			.trimEnd();

		if (prefix) {
			const hasLetter = /[a-zA-Z]/.test(trailingPart);
			const hasNumber = /\d/.test(trailingPart);
			const numericOnly = /^\d+$/.test(trailingPart);

			const characterBeforeSuffix =
				merchant[match.index - 1] || "";

			const hasSpecialSeparator =
				characterBeforeSuffix !== "" &&
				!/[a-zA-Z0-9\s-]/.test(characterBeforeSuffix);

			const looksLikeOrderId =
				hasNumber &&
				(
					hasSpecialSeparator ||
					hasLetter ||
					trailingPart.length >= 4
				);

			if (looksLikeOrderId) {
				cleanedMerchant = prefix
					.replace(/[^a-zA-Z0-9\s-]+$/, "")
					.trimEnd();
			}
		}
	}

	cleanedMerchant = cleanedMerchant
		.replace(/\.(com|ca)$/i, "")
		.trimEnd();

	return cleanedMerchant.toUpperCase();
}


function importPresetCsv(csvText, presetIndex) {
	const presets = getPresets();
	const preset = presets[presetIndex];

	if (!preset) return;

	let rows = parseCsv(csvText);

	if (rows.length == 0) {
		alert("The CSV file is empty.");
		return;
	}

	if (isLikelyHeader(rows[0], preset)) {
		rows.shift();
	}

	const columns = [
		preset.columns.date,
		preset.columns.category,
		preset.columns.amount
	];

	if (preset.columns.merchant !== null) {
		columns.push(preset.columns.merchant);
	}

	const maximumColumn = Math.max(...columns);

	rows = rows.filter(row => {
		return (
			row.length >= maximumColumn &&
			row.some(value => value.trim() !== "")
		);
	});

	if (rows.length == 0) {
		alert("No valid expense rows were found.");
		return;
	}

	const categories = getCategories();

	if (categories.length == 0) {
		alert("Create at least one expense category before uploading expenses.");
		return;
	}

	const categoryRows = getCategoryRows();

	const dates = [];
	const categoryRowIds = [];
	const merchants = [];
	const amounts = [];

	for (const row of rows) {
		const date = row[preset.columns.date - 1].trim();
		const rawCategory = row[preset.columns.category - 1].trim();
		const amount = row[preset.columns.amount - 1].trim();

		const merchant = preset.columns.merchant === null
			? null
			: cleanMerchantName(
				row[preset.columns.merchant - 1]
			);

		const categoryRowId = resolveCategoryMatch(
			rawCategory,
			categories,
			categoryRows
		);

		if (categoryRowId === false) {
			return;
		}

		dates.push(date);
		categoryRowIds.push(categoryRowId);
		merchants.push(merchant);
		amounts.push(amount);
	}

	const latestExpenseDate = getLatestExpenseDate(
		rows,
		preset.columns.date
	);

	if (latestExpenseDate) {
		const latestDate = parseExpenseDate(latestExpenseDate);
		const previousDate = parseExpenseDate(preset.lastExpenseDate);

		if (!previousDate || latestDate > previousDate) {
			preset.lastExpenseDate = latestExpenseDate;
		}
	}

	appendExpenseData("expense-dates", dates);
	appendExpenseData("expense-category-row-ids", categoryRowIds);
	appendExpenseData("expense-merchants", merchants);
	appendExpenseData("expense-amounts", amounts);

	savePresets(presets);
	saveCategoryRows(categoryRows);

	renderPresets();
	renderCategoryRows();
	renderExpenseSummary();
}


function getLatestExpenseDate(rows, dateColumn) {
	let latestDate = null;
	let latestDateText = null;

	rows.forEach(row => {
		const dateText = row[dateColumn - 1].trim();
		const date = parseExpenseDate(dateText);

		if (!date) return;

		if (latestDate === null || date > latestDate) {
			latestDate = date;
			latestDateText = dateText;
		}
	});

	return latestDateText;
}


function parseExpenseDate(dateText) {
	if (!dateText) return null;

	const text = String(dateText).trim();

	let match = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);

	if (match) {
		return createExpenseDate(
			Number(match[1]),
			Number(match[2]),
			Number(match[3])
		);
	}

	match = text.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);

	if (match) {
		return createExpenseDate(
			Number(match[1]),
			Number(match[2]),
			Number(match[3])
		);
	}

	match = text.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);

	if (match) {
		return createExpenseDate(
			Number(match[3]),
			Number(match[1]),
			Number(match[2])
		);
	}

	const date = new Date(text);

	if (isNaN(date)) return null;

	date.setHours(0, 0, 0, 0);

	return date;
}


function createExpenseDate(year, month, day) {
	const date = new Date(year, month - 1, day);

	if (
		date.getFullYear() !== year ||
		date.getMonth() !== month - 1 ||
		date.getDate() !== day
	) {
		return null;
	}

	date.setHours(0, 0, 0, 0);

	return date;
}


function parseExpenseAmount(amountText) {
	if (amountText === null || amountText === undefined) return null;

	let text = String(amountText).trim();

	if (!text) return null;

	const parenthesisNegative =
		text.startsWith("(") &&
		text.endsWith(")");

	text = text
		.replace(/\$/g, "")
		.replace(/,/g, "")
		.replace(/\s/g, "")
		.replace(/[()]/g, "");

	const amount = Number(text);

	if (isNaN(amount)) return null;

	if (parenthesisNegative) {
		return -Math.abs(amount);
	}

	return amount;
}


function parseCsv(csvText) {
	const rows = [];

	let row = [];
	let value = "";
	let quoted = false;

	for (let i = 0; i < csvText.length; i++) {
		const character = csvText[i];

		if (quoted) {
			if (character === '"' && csvText[i + 1] === '"') {
				value += '"';
				i++;
			} else if (character === '"') {
				quoted = false;
			} else {
				value += character;
			}

			continue;
		}

		if (character === '"') {
			quoted = true;
		} else if (character === ",") {
			row.push(value);
			value = "";
		} else if (character === "\n") {
			row.push(value);
			rows.push(row);

			row = [];
			value = "";
		} else if (character !== "\r") {
			value += character;
		}
	}

	if (value !== "" || row.length > 0) {
		row.push(value);
		rows.push(row);
	}

	return rows;
}


function isLikelyHeader(row, preset) {
	const columnNumbers = [
		preset.columns.date,
		preset.columns.category,
		preset.columns.amount
	];

	if (preset.columns.merchant !== null) {
		columnNumbers.push(preset.columns.merchant);
	}

	const headerTerms = [
		"date",
		"transaction date",
		"posting date",
		"category",
		"merchant",
		"description",
		"amount",
		"debit",
		"credit"
	];

	let matches = 0;

	columnNumbers.forEach(columnNumber => {
		const value = (row[columnNumber - 1] || "").trim().toLowerCase();

		if (headerTerms.some(term => value === term || value.includes(term))) {
			matches++;
		}
	});

	return matches >= 2;
}


function resolveCategoryMatch(rawCategory, categories, categoryRows) {
	const normalizedCategory = rawCategory.trim().toLowerCase();

	const existingIndex = categoryRows.findIndex(row => {
		return row[0].trim().toLowerCase() === normalizedCategory;
	});

	if (existingIndex !== -1) {
		const existingRow = categoryRows[existingIndex];

		if (
			existingRow[1] == null ||
			existingRow[1] < 1 ||
			existingRow[1] > categories.length
		) {
			const categoryId = promptCategoryMatch(
				rawCategory,
				categories
			);

			if (categoryId === false) {
				return false;
			}

			existingRow[1] = categoryId;
		}

		return existingIndex + 1;
	}

	const categoryId = promptCategoryMatch(
		rawCategory,
		categories
	);

	if (categoryId === false) {
		return false;
	}

	categoryRows.push([
		rawCategory,
		categoryId
	]);

	return categoryRows.length;
}


function promptCategoryMatch(rawCategory, categories) {
	const categoryOptions = categories
		.map((category, index) => `${index + 1}. ${category}`)
		.join("\n");

	while (true) {
		const categoryInput = prompt(
			`Match "${rawCategory}" to an expense category:\n\n` +
			`${categoryOptions}\n\n` +
			`Enter the category number:`
		);

		if (categoryInput === null) {
			return false;
		}

		const categoryId = Number(categoryInput);

		if (
			Number.isInteger(categoryId) &&
			categoryId >= 1 &&
			categoryId <= categories.length
		) {
			return categoryId;
		}

		alert("Enter a valid category number.");
	}
}


function appendExpenseData(key, values) {
	const storedValues = JSON.parse(localStorage.getItem(key)) || [];

	storedValues.push(...values);

	localStorage.setItem(key, JSON.stringify(storedValues));
}


function getExpenseCategory(expenseIndex) {
	const categoryRowIds = JSON.parse(
		localStorage.getItem("expense-category-row-ids")
	) || [];

	const categoryRows = getCategoryRows();
	const categories = getCategories();
	const categoryRowId = categoryRowIds[expenseIndex];

	if (!categoryRowId) return null;

	const categoryRow = categoryRows[categoryRowId - 1];

	if (!categoryRow || !categoryRow[1]) return null;

	return categories[categoryRow[1] - 1] || null;
}


function getExpenseCategoryId(expenseIndex) {
	const categoryRowIds = JSON.parse(
		localStorage.getItem("expense-category-row-ids")
	) || [];

	const categoryRows = getCategoryRows();
	const categoryRowId = categoryRowIds[expenseIndex];

	if (!categoryRowId) return null;

	const categoryRow = categoryRows[categoryRowId - 1];

	return categoryRow ? categoryRow[1] : null;
}


function getCategories() {
	return JSON.parse(localStorage.getItem("expense-categories")) || [];
}


function saveCategories(categories) {
	localStorage.setItem("expense-categories", JSON.stringify(categories));
}


function addCategory() {
	const categoryInput = prompt("Specify the category:");
	if (!categoryInput) return;

	const category = categoryInput.trim();
	if (!category) return;

	const categories = getCategories();
	const normalizedCategory = category.toLowerCase();

	if (normalizedCategory === "uncategorized") {
		alert("Uncategorized cannot be added as a category.");
		return;
	}

	if (categories.some(existingCategory => {
		return existingCategory.trim().toLowerCase() === normalizedCategory;
	})) {
		alert("That category already exists.");
		return;
	}

	categories.push(category);

	saveCategories(categories);
	renderCategories();
	renderCategoryRows();
	renderExpenseSummary();
}


function renderCategories() {
	const categories = getCategories();
	const categoryList = document.getElementById("category-list");

	categoryList.replaceChildren();

	categories.forEach((category, index) => {
		const categoryItem = document.createElement("li");
		const categoryName = document.createElement("span");

		categoryName.classList.add("category-name");
		categoryName.textContent = category;

		categoryItem.appendChild(categoryName);

		if (category.trim().toLowerCase() !== "repayment") {
			const removeButton = document.createElement("button");

			removeButton.classList.add("remove-button");
			removeButton.textContent = "✖";

			removeButton.addEventListener("click", function () {
				removeCategory(index);
			});

			categoryItem.appendChild(removeButton);
		}

		categoryList.appendChild(categoryItem);
	});

	const addItem = document.createElement("li");
	const addButton = document.createElement("button");

	addItem.classList.add("category-add-item");

	addButton.classList.add("add-button", "category-add-button");
	addButton.textContent = "+";
	addButton.addEventListener("click", addCategory);

	addItem.appendChild(addButton);
	categoryList.appendChild(addItem);
}


function removeCategory(index) {
	const categories = getCategories();

	if (
		categories[index] &&
		categories[index].trim().toLowerCase() === "repayment"
	) {
		return;
	}

	const categoryRows = getCategoryRows();
	const removedCategoryId = index + 1;

	categories.splice(index, 1);

	categoryRows.forEach(row => {
		if (row[1] == removedCategoryId) {
			row[1] = null;
		} else if (row[1] > removedCategoryId) {
			row[1]--;
		}
	});

	saveCategories(categories);
	saveCategoryRows(categoryRows);

	renderCategories();
	renderCategoryRows();
	renderExpenseSummary();
}


function getCategoryRows() {
	return JSON.parse(
		localStorage.getItem("expense-category-rows")
	) || [];
}


function saveCategoryRows(rows) {
	localStorage.setItem(
		"expense-category-rows",
		JSON.stringify(rows)
	);
}


function renderCategoryRows() {
	const categories = getCategories();
	const rows = getCategoryRows();
	const tableBody = document.getElementById("category-table-body");
	const rowsContainer = document.getElementById("category-rows-container");

	tableBody.replaceChildren();

	if (!hasExpenseData() || rows.length == 0) {
		rowsContainer.classList.remove("active");
		return;
	}

	rowsContainer.classList.add("active");

	rows.forEach((row, rowIndex) => {
		const tableRow = document.createElement("tr");
		const rowCell = document.createElement("td");
		const categoryCell = document.createElement("td");
		const categorySelect = document.createElement("select");

		const isUncategorized =
			row[1] == null ||
			row[1] < 1 ||
			row[1] > categories.length;

		if (isUncategorized) {
			tableRow.classList.add("uncategorized-row");
		}

		rowCell.textContent = row[0];

		categorySelect.classList.add("category-select");

		if (isUncategorized) {
			const uncategorizedOption = document.createElement("option");

			uncategorizedOption.textContent = "Uncategorized";
			uncategorizedOption.selected = true;
			uncategorizedOption.disabled = true;
			uncategorizedOption.hidden = true;

			categorySelect.appendChild(uncategorizedOption);
		}

		categories.forEach((category, categoryIndex) => {
			const option = document.createElement("option");
			const categoryId = categoryIndex + 1;

			option.value = categoryId;
			option.textContent = category;

			if (row[1] == categoryId) {
				option.selected = true;
			}

			categorySelect.appendChild(option);
		});

		categorySelect.addEventListener("change", function () {
			rows[rowIndex][1] = Number(this.value);

			saveCategoryRows(rows);
			renderCategoryRows();
			renderExpenseSummary();
		});

		categoryCell.appendChild(categorySelect);

		tableRow.appendChild(rowCell);
		tableRow.appendChild(categoryCell);

		tableBody.appendChild(tableRow);
	});

	const tableRows = Array.from(tableBody.children);

	tableRows.sort((a, b) => {
		const aUncategorized = a.classList.contains("uncategorized-row");
		const bUncategorized = b.classList.contains("uncategorized-row");

		return bUncategorized - aUncategorized;
	});

	tableRows.forEach(row => tableBody.appendChild(row));
}


function setExpenseRange(range) {
	if (!validExpenseRanges.includes(range)) {
		return;
	}

	currentExpenseRange = range;

	localStorage.setItem(
		"expense-range",
		currentExpenseRange
	);

	document.querySelectorAll(".expense-range-button").forEach(button => {
		button.classList.toggle(
			"active",
			button.dataset.range === currentExpenseRange
		);
	});

	renderExpenseSummary();
}


function getMostRecentExpenseDate() {
	const dates = JSON.parse(
		localStorage.getItem("expense-dates")
	) || [];

	let latestDate = null;

	dates.forEach(dateText => {
		const date = parseExpenseDate(dateText);

		if (!date) return;

		if (latestDate === null || date > latestDate) {
			latestDate = date;
		}
	});

	return latestDate;
}


function getExpenseRangeStart(endDate, range) {
	if (range === "all") return null;

	let months = 1;

	if (range === "3mo") {
		months = 3;
	} else if (range === "6mo") {
		months = 6;
	} else if (range === "1yr") {
		months = 12;
	}

	const targetMonth = endDate.getMonth() - months;

	const startDate = new Date(
		endDate.getFullYear(),
		targetMonth,
		1
	);

	const maximumDay = new Date(
		startDate.getFullYear(),
		startDate.getMonth() + 1,
		0
	).getDate();

	startDate.setDate(
		Math.min(endDate.getDate(), maximumDay)
	);

	startDate.setHours(0, 0, 0, 0);

	return startDate;
}


function updateExpenseTitle() {
	const title = document.getElementById("main-title");
	const latestExpenseDate = getMostRecentExpenseDate();

	title.textContent = "EXPENSES";
	title.classList.remove("expense-overdue-title");

	if (!latestExpenseDate) {
		return;
	}

	const currentDate = new Date();

	currentDate.setHours(0, 0, 0, 0);

	const daysSinceExpense = Math.floor(
		(currentDate - latestExpenseDate) /
		(1000 * 60 * 60 * 24)
	);

	if (daysSinceExpense >= 31) {
		title.textContent = "LAST EXPENSE 31+ DAYS AGO";
		title.classList.add("expense-overdue-title");
	}
}


function renderExpenseSummary() {
	updateExpenseTitle();

	const summaryContainer = document.getElementById(
		"expense-summary-container"
	);

	if (!hasExpenseData()) {
		summaryContainer.classList.remove("active");
		return;
	}

	summaryContainer.classList.add("active");

	const expenses = getFilteredExpenses();

	renderExpensePieChart(expenses);
	renderExpenseMerchants(expenses);
}


function getFilteredExpenses() {
	const dates = JSON.parse(
		localStorage.getItem("expense-dates")
	) || [];

	const categoryRowIds = JSON.parse(
		localStorage.getItem("expense-category-row-ids")
	) || [];

	const merchants = JSON.parse(
		localStorage.getItem("expense-merchants")
	) || [];

	const amounts = JSON.parse(
		localStorage.getItem("expense-amounts")
	) || [];

	const categoryRows = getCategoryRows();
	const categories = getCategories();

	const endDate = getMostRecentExpenseDate();

	const startDate = endDate
		? getExpenseRangeStart(endDate, currentExpenseRange)
		: null;

	const expenses = [];

	amounts.forEach((amountText, expenseIndex) => {
		if (currentExpenseRange !== "all") {
			if (!endDate) return;

			const expenseDate = parseExpenseDate(
				dates[expenseIndex]
			);

			if (!expenseDate) return;

			if (
				expenseDate < startDate ||
				expenseDate > endDate
			) {
				return;
			}
		}

		const amount = parseExpenseAmount(amountText);

		if (amount === null) return;

		const categoryRowId = categoryRowIds[expenseIndex];
		const categoryRow = categoryRows[categoryRowId - 1];

		let categoryId = null;
		let categoryName = "Uncategorized";

		if (
			categoryRow &&
			categoryRow[1] != null &&
			categoryRow[1] >= 1 &&
			categoryRow[1] <= categories.length
		) {
			categoryId = categoryRow[1];
			categoryName = categories[categoryId - 1];
		}

		if (
			categoryName &&
			categoryName.trim().toLowerCase() === "repayment"
		) {
			return;
		}

		expenses.push({
			categoryId: categoryId,
			categoryName: categoryName,
			merchant: merchants[expenseIndex],
			amount: amount
		});
	});

	return expenses;
}


function renderExpensePieChart(expenses) {
	const canvas = document.getElementById("expense-pie-chart");
	const emptyMessage = document.getElementById("expense-chart-empty");
	const totalElement = document.getElementById(
		"expense-range-total-value"
	);

	const categories = getCategories();
	const totals = [];

	categories.forEach((category, index) => {
		if (category.trim().toLowerCase() === "repayment") {
			return;
		}

		totals.push({
			name: category,
			categoryId: index + 1,
			total: 0,
			colorIndex: index
		});
	});

	const uncategorized = {
		name: "Uncategorized",
		categoryId: null,
		total: 0,
		colorIndex: categories.length
	};

	expenses.forEach(expense => {
		if (expense.categoryId === null) {
			uncategorized.total += expense.amount;
			return;
		}

		const total = totals.find(item => {
			return item.categoryId === expense.categoryId;
		});

		if (total) {
			total.total += expense.amount;
		}
	});

	const displayTotals = [...totals];

	if (uncategorized.total !== 0) {
		displayTotals.push(uncategorized);
	}

	const netTotal = displayTotals.reduce((sum, item) => {
		return sum + item.total;
	}, 0);

	totalElement.textContent = formatExpenseAmount(netTotal);

	renderExpenseLegend(displayTotals);

	if (expenses.length === 0) {
		canvas.style.display = "none";
		emptyMessage.style.display = "block";
		emptyMessage.textContent = "No expenses in this range.";
		return;
	}

	const pieTotals = displayTotals.filter(item => {
		return item.total > 0;
	});

	const pieTotal = pieTotals.reduce((sum, item) => {
		return sum + item.total;
	}, 0);

	if (pieTotal <= 0) {
		canvas.style.display = "none";
		emptyMessage.style.display = "block";
		emptyMessage.textContent = "No positive net category totals to graph.";
		return;
	}

	canvas.style.display = "block";
	emptyMessage.style.display = "none";

	drawExpensePie(canvas, pieTotals, pieTotal);
}


function drawExpensePie(canvas, totals, total) {
	const context = canvas.getContext("2d");

	context.clearRect(
		0,
		0,
		canvas.width,
		canvas.height
	);

	const centerX = canvas.width / 2;
	const centerY = canvas.height / 2;
	const radius = Math.min(
		canvas.width,
		canvas.height
	) / 2 - 8;

	let startAngle = -Math.PI / 2;

	totals.forEach(item => {
		const sliceAngle =
			(item.total / total) *
			Math.PI *
			2;

		context.beginPath();
		context.moveTo(centerX, centerY);
		context.arc(
			centerX,
			centerY,
			radius,
			startAngle,
			startAngle + sliceAngle
		);
		context.closePath();

		context.fillStyle = getExpenseColor(
			item.colorIndex
		);

		context.fill();

		startAngle += sliceAngle;
	});
}


function renderExpenseLegend(totals) {
	const legend = document.getElementById(
		"expense-chart-legend"
	);

	legend.replaceChildren();

	totals.forEach(item => {
		const legendItem = document.createElement("div");
		const legendDot = document.createElement("span");
		const legendName = document.createElement("span");
		const legendTotal = document.createElement("span");

		legendItem.classList.add("expense-legend-item");
		legendDot.classList.add("expense-legend-dot");
		legendTotal.classList.add("expense-legend-total");

		legendDot.style.backgroundColor = getExpenseColor(
			item.colorIndex
		);

		legendName.textContent = item.name;
		legendTotal.textContent = formatExpenseAmount(
			item.total
		);

		legendItem.appendChild(legendDot);
		legendItem.appendChild(legendName);
		legendItem.appendChild(legendTotal);

		legend.appendChild(legendItem);
	});
}


function renderExpenseMerchants(expenses) {
	const tableBody = document.getElementById(
		"expense-merchants-body"
	);

	const merchantContainer = document.getElementById(
		"expense-merchants-container"
	);

	const merchantHeading = document.getElementById(
		"expense-merchant-heading"
	);

	if (
		!tableBody ||
		!merchantContainer ||
		!merchantHeading
	) {
		return;
	}

	const isPopped = document.getElementById(
		"main-container"
	).classList.contains("popped");

	tableBody.replaceChildren();

	merchantHeading.textContent = isPopped
		? "Merchants"
		: "Highest Spend Merchant";

	const categoryGroups = new Map();

	expenses.forEach(expense => {
		if (
			expense.merchant === null ||
			expense.merchant === undefined ||
			String(expense.merchant).trim() === ""
		) {
			return;
		}

		const categoryKey = expense.categoryId === null
			? "uncategorized"
			: String(expense.categoryId);

		if (!categoryGroups.has(categoryKey)) {
			categoryGroups.set(categoryKey, {
				name: expense.categoryName,
				merchants: new Map()
			});
		}

		const group = categoryGroups.get(categoryKey);
		const merchantName = String(expense.merchant).trim();
		const normalizedMerchant = merchantName.toLowerCase();

		if (!group.merchants.has(normalizedMerchant)) {
			group.merchants.set(normalizedMerchant, {
				name: merchantName,
				total: 0
			});
		}

		group.merchants.get(
			normalizedMerchant
		).total += expense.amount;
	});

	const categories = getCategories();
	const orderedGroups = [];

	categories.forEach((category, index) => {
		if (category.trim().toLowerCase() === "repayment") {
			return;
		}

		const group = categoryGroups.get(
			String(index + 1)
		);

		if (group) {
			orderedGroups.push(group);
		}
	});

	const uncategorized = categoryGroups.get(
		"uncategorized"
	);

	if (uncategorized) {
		orderedGroups.push(uncategorized);
	}

	orderedGroups.forEach(group => {
		const merchantTotals = Array.from(
			group.merchants.values()
		);

		merchantTotals.sort((a, b) => {
			return b.total - a.total;
		});

		const displayedMerchants = isPopped
			? merchantTotals
			: merchantTotals.slice(0, 1);

		displayedMerchants.forEach((merchant, index) => {
			const tableRow = document.createElement("tr");

			if (index === 0) {
				tableRow.classList.add("expense-merchant-category-start");
			}
			const categoryCell = document.createElement("td");
			const merchantCell = document.createElement("td");
			const amountCell = document.createElement("td");

			categoryCell.classList.add(
				"expense-merchant-category"
			);

			merchantCell.classList.add(
				"expense-merchant-name"
			);

			amountCell.classList.add(
				"expense-merchant-amount"
			);

			categoryCell.textContent = index === 0
				? group.name
				: "";

			merchantCell.textContent = merchant.name;

			amountCell.textContent = formatExpenseAmount(
				merchant.total
			);

			tableRow.appendChild(categoryCell);
			tableRow.appendChild(merchantCell);
			tableRow.appendChild(amountCell);

			tableBody.appendChild(tableRow);
		});
	});

	merchantContainer.style.display =
		tableBody.children.length > 0
			? "block"
			: "none";
}


function getExpenseColor(index) {
	return `hsl(${(index * 67) % 360}, 65%, 55%)`;
}


function formatExpenseAmount(amount) {
	const absoluteAmount = Math.abs(amount).toLocaleString(
		undefined,
		{
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		}
	);

	if (amount < 0) {
		return `-$${absoluteAmount}`;
	}

	return `$${absoluteAmount}`;
}