// PatternX AI — content script
// Phase 0/2 job: just prove we can read the page and talk to the background worker.
// Phase 2 will replace captureSnippets() with a real MutationObserver that also
// watches for DOM changes (countdown timers, stock counts, banners that appear late).

function captureSnippets() {
  const snippets = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => {
      const text = node.textContent.trim();
      if (text.length < 3 || text.length > 200) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  let node;
  while ((node = walker.nextNode())) {
    snippets.push(node.textContent.trim());
  }

  // Also grab button labels — a lot of dark patterns live in button/CTA text
  // ("Yes, I want to save money" / "No, I like paying full price").
  document.querySelectorAll("button, a[role=button], input[type=submit]").forEach((el) => {
    const label = (el.innerText || el.value || "").trim();
    if (label) snippets.push(label);
  });

  // De-duplicate, cap the batch size so we don't flood the backend on a huge page
  return Array.from(new Set(snippets)).slice(0, 300);
}

function scanPage() {
  const snippets = captureSnippets();
  chrome.runtime.sendMessage({
    type: "PATTERNX_SCAN",
    url: window.location.href,
    snippets,
  });
}

// Listen for the popup asking us to (re)scan
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "PATTERNX_REQUEST_SCAN") {
    scanPage();
    sendResponse({ ok: true });
  }
});

// Scan once automatically after the page settles
window.addEventListener("load", () => {
  setTimeout(scanPage, 1500);
});
