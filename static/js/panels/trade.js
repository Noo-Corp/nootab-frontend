let refreshInterval = null;

window.addEventListener("load", function () {
	const input = document.getElementById('stock-input');

	input.addEventListener('keydown', (e) => {
		if (e.key === 'Enter') {
			addStock();
		}
	});

	document.getElementById("refresh").addEventListener("click", () => {
		refreshStocks("active");
	});

	refreshStocks("load");

	refreshInterval = setInterval(() => {
		refreshStocks("passive");
	}, 5 * 60 * 1000); // 5 minutes
});

function refreshStocks(behaviour) {
	if (behaviour === "active") {
		document.getElementById("stocks-container").innerHTML = "";
	}

	const stocks = JSON.parse(localStorage.getItem("stocks") || "[]");

	if (stocks.length === 0) {
		document.getElementById("main-title").textContent = "NOO TRADE";
		document.getElementById("refresh").style.display = "none";
		return;
	}

	stocks.forEach(fetchAndRenderStockPanel);

	updateRefreshedAtTime();
	document.getElementById("refresh").style.display = "inline";
}

function updateRefreshedAtTime() {
	const refreshedAtElement = document.getElementById("main-title");
	const currentTime = new Date().toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit"
	});
	refreshedAtElement.textContent = `Refreshed at ${currentTime}`;
}

function addStock() {
	const input = document.getElementById("stock-input");
	const symbol = input.value.trim().toUpperCase();
	if (!symbol) return;

	let stocks = JSON.parse(localStorage.getItem("stocks") || "[]");
	if (stocks.includes(symbol)) return;

	stocks.push(symbol);
	localStorage.setItem("stocks", JSON.stringify(stocks));

	fetchAndRenderStockPanel(symbol);
	input.value = "";

	updateRefreshedAtTime();
	document.getElementById("refresh").style.display = "inline";
}

function fetchAndRenderStockPanel(symbol) {
	fetch(`https://api.nootab.com/stock?symbol=${encodeURIComponent(symbol)}`, {
		method: "GET",
		credentials: "include"
	})
	.then(response => response.json())
	.then(data => {
		renderStockPanel(symbol, data);
	})
	.catch(() => {
		console.error(`Failed to load data for ${symbol}`);
	});
}

function renderStockPanel(symbol, data) {
	const container = document.getElementById("stocks-container");

	const panel = document.createElement("div");
	panel.className = "stock-panel";

	const price = data.price;
	const change = data.change;
	const percent = data.percent_change;
	const high = data.high;
	const low = data.low;
	const dividends = data.dividends || [];

	let changeClass = "neutral";
	if (change > 0) changeClass = "positive";
	else if (change < 0) changeClass = "negative";

	let dividendHtml = `
		<div class="dividend-content" style="display: none;">
			<div class="dividend-title">Dividend History</div>
			${dividends.map(d => `
				<div class="dividend-row">
					<span>${d[0]}</span>
					<span>$${d[1].toFixed(2)}</span>
				</div>
			`).join("")}
		</div>
	`;

	let infoHtml = `
		<div class="stock-symbol">${symbol}</div>
		<div class="stock-info">
			<span class="label">$${price.toFixed(2)}</span>
			<span class="${changeClass}">${change.toFixed(2)} (${percent.toFixed(2)}%)</span>
		</div>
		<div class="stock-divider"></div>
		<div class="stock-extra"><span class="label">Daily High:</span> $${high.toFixed(2)}</div>
		<div class="stock-extra"><span class="label">Daily Low:</span> $${low.toFixed(2)}</div>
	`;

	panel.innerHTML = `
		<button class="delete-btn" onclick="deleteStock('${symbol}', this)">✖</button>
		<button class="div-btn" onclick="toggleDiv(this)">DIV</button>
		<div class="stock-content">${infoHtml}${dividendHtml}</div>
	`;

	container.appendChild(panel);
}

function deleteStock(symbol, btn) {
	let stocks = JSON.parse(localStorage.getItem("stocks") || "[]");
	stocks = stocks.filter(s => s !== symbol);
	localStorage.setItem("stocks", JSON.stringify(stocks));

	const panel = btn.closest(".stock-panel");
	if (panel) panel.remove();

	if (stocks.length === 0) {
		document.getElementById("main-title").textContent = "NOO TRADE";
		document.getElementById("refresh").style.display = "none";
	}
}

function toggleDiv(btn) {
	btn.classList.toggle("active");
	const content = btn.closest(".stock-panel").querySelector(".stock-content");
	const dividendSection = content.querySelector(".dividend-content");
	const isActive = btn.classList.contains("active");

	const allStockInfo = Array.from(content.children).filter(el =>
		!el.classList.contains("dividend-content")
	);

	allStockInfo.forEach(el => {
		if (el.classList.contains("dividend-title") || el.closest(".dividend-content")) return;
		el.style.display = isActive ? "none" : "";
	});

	dividendSection.style.display = isActive ? "flex" : "none";
}
