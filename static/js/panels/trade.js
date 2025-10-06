let refreshInterval=null;function refreshStocks(e){let t=document.getElementById("loader");t.style.display="block","active"===e&&(document.getElementById("stocks-container").innerHTML="");let n=JSON.parse(localStorage.getItem("stocks")||"[]");if(0===n.length){document.getElementById("main-title").textContent="NOO TRADE",document.getElementById("refresh").style.display="none",t.style.display="none";return}"active"!==e&&(document.getElementById("stocks-container").innerHTML="");Promise.all(n.map(e=>fetchStockData(e))).then(e=>{let n=document.getElementById("stocks-container");n.innerHTML="",e.forEach(({symbol:e,data:t})=>{renderStockPanel(e,t)}),t.style.display="none"}),updateRefreshedAtTime(),document.getElementById("refresh").style.display="inline"}function fetchStockData(e){return fetch(`https://api.nootab.com/stock?symbol=${encodeURIComponent(e)}`,{method:"GET",credentials:"include"}).then(e=>e.json()).then(t=>({symbol:e,data:t})).catch(()=>({symbol:e,data:null}))}function updateRefreshedAtTime(){let e=document.getElementById("main-title"),t=new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});e.textContent=`Refreshed at ${t}`}function addStock(){let e=document.getElementById("stock-input"),t=e.value.trim().toUpperCase();if(!t)return;let n=JSON.parse(localStorage.getItem("stocks")||"[]");n.includes(t)||(n.push(t),localStorage.setItem("stocks",JSON.stringify(n)),fetchAndRenderStockPanel(t),e.value="",updateRefreshedAtTime(),document.getElementById("refresh").style.display="inline")}function fetchAndRenderStockPanel(e){fetchStockData(e).then(({symbol:e,data:t})=>{renderStockPanel(e,t)})}function renderStockPanel(e,t){let n=document.getElementById("stocks-container"),s=document.createElement("div");if(s.className="stock-panel",!t||"number"!=typeof t.price||"number"!=typeof t.change||"number"!=typeof t.percent_change||"number"!=typeof t.daily_high||"number"!=typeof t.daily_low){s.innerHTML=`
			<button class="delete-btn" onclick="deleteStock('${e}', this)">✖</button>
			<div class="stock-symbol">${e}</div>
			<div class="stock-info">Data not available for stock</div>
		`,n.appendChild(s);return}let i=t.price,l=t.change,a=t.percent_change,o=t.daily_high,d=t.daily_low,c=t.dividends||[],r="neutral";l>0?r="positive":l<0&&(r="negative");let y="";c.length>0&&(y=`
			<div class="dividend-content" style="display: none;">
				<div class="dividend-title">Dividend History</div>
				${c.map(e=>`
					<div class="dividend-row">
						<span>${e.date}</span>
						<span>$${e.amount.toFixed(2)}</span>
					</div>
				`).join("")}
			</div>
		`);let p=`
		<div class="stock-symbol">${e}</div>
		<div class="stock-info">
			<span class="label">$${i.toFixed(2)}</span>
			<span class="${r}">${l.toFixed(2)} (${a.toFixed(2)}%)</span>
		</div>
		<div class="stock-divider"></div>
		<div class="stock-extra"><span class="label">Daily High:</span> $${o.toFixed(2)}</div>
		<div class="stock-extra"><span class="label">Daily Low:</span> $${d.toFixed(2)}</div>
	`;s.innerHTML=`
		<button class="delete-btn" onclick="deleteStock('${e}', this)">✖</button>
		${c.length>0?'<button class="div-btn" onclick="toggleDiv(this)">DIV</button>':""}
		<div class="stock-content">${p}${y}</div>
	`,n.appendChild(s)}function deleteStock(e,t){let n=JSON.parse(localStorage.getItem("stocks")||"[]");n=n.filter(t=>t!==e),localStorage.setItem("stocks",JSON.stringify(n));let s=t.closest(".stock-panel");s&&s.remove(),0===n.length&&(document.getElementById("main-title").textContent="NOO TRADE",document.getElementById("refresh").style.display="none")}function toggleDiv(e){e.classList.toggle("active");let t=e.closest(".stock-panel").querySelector(".stock-content"),n=t.querySelector(".dividend-content"),s=e.classList.contains("active"),i=Array.from(t.children).filter(e=>!e.classList.contains("dividend-content"));i.forEach(e=>{e.classList.contains("dividend-title")||e.closest(".dividend-content")||(e.style.display=s?"none":"")}),n.style.display=s?"flex":"none"}window.addEventListener("load",function(){let e=document.getElementById("stock-input");e.addEventListener("keydown",e=>{"Enter"===e.key&&addStock()}),document.getElementById("refresh").addEventListener("click",()=>{refreshStocks("active")}),refreshStocks("load"),refreshInterval=setInterval(()=>{refreshStocks("passive")},3e5)});