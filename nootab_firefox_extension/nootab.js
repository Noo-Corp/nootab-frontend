const url = "https://nootab.com/";

async function setFocusOnUrl() {
  await browser.tabs.update({ url });
}

setFocusOnUrl();