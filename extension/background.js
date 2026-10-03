// PatternX AI — background service worker
// Phase 0/2 job: receive captured snippets from the content script, forward them
// to the backend /analyze endpoint, and cache the latest result per tab so the
// popup can read it instantly.

const BACKEND_URL = "http://localhost:8000/analyze";

const latestResultByTab = {};

async function callBackend(url, snippets) {
  try {
    const res = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url,
        snippets: snippets.map((text) => ({ text })),
      }),
    });
    if (!res.ok) throw new Error(`Backend responded ${res.status}`);
    return await res.json();
  } catch (err) {
    // Backend not running yet (normal in week 1) — fall back to a mock result
    // so the extension UI still has something to show while Phase 3 catches up.
    console.warn("PatternX AI: backend unreachable, using mock result.", err);
    return {
      url,
      safety_score: 100,
      flags: [],
      note: "mock result — start the backend (see /backend/README or run uvicorn) for real scores",
    };
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "PATTERNX_SCAN") {
    const tabId = sender.tab && sender.tab.id;
    callBackend(message.url, message.snippets).then((result) => {
      if (tabId !== undefined) latestResultByTab[tabId] = result;
      chrome.runtime.sendMessage({ type: "PATTERNX_RESULT", tabId, result }).catch(() => {});
    });
  }

  if (message.type === "PATTERNX_GET_LATEST") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0] && tabs[0].id;
      sendResponse({ result: latestResultByTab[tabId] || null });
    });
    return true; // keep the message channel open for the async sendResponse
  }
});
