// PatternX AI — popup UI
// Phase 0/2 job: show whatever the background worker last computed, and let the
// shopper trigger a fresh scan. Phase 5 will replace this with the full
// React dashboard described in the build plan.

const scoreEl = document.getElementById("score");
const flagsEl = document.getElementById("flags");
const emptyEl = document.getElementById("empty");
const rescanBtn = document.getElementById("rescan");

function render(result) {
  if (!result) {
    emptyEl.style.display = "block";
    scoreEl.textContent = "--";
    flagsEl.innerHTML = "";
    return;
  }
  emptyEl.style.display = "none";
  scoreEl.textContent = result.safety_score ?? "--";
  flagsEl.innerHTML = (result.flags || [])
    .map(
      (f) =>
        `<div class="flag"><b>${f.pattern}</b>${f.text} (confidence ${Math.round(
          (f.confidence || 0) * 100
        )}%)</div>`
    )
    .join("");
}

chrome.runtime.sendMessage({ type: "PATTERNX_GET_LATEST" }, (response) => {
  render(response && response.result);
});

rescanBtn.addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { type: "PATTERNX_REQUEST_SCAN" });
    scoreEl.textContent = "...";
    setTimeout(() => {
      chrome.runtime.sendMessage({ type: "PATTERNX_GET_LATEST" }, (response) => {
        render(response && response.result);
      });
    }, 1200);
  });
});
