const url = "https://nootab.com/";

async function setFocusOnUrl() {
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  const tab = tabs[0];

  await browser.tabs.create({ url, active: true, index: tab.index + 1 });
  await browser.tabs.remove(tab.id);
}

setFocusOnUrl();