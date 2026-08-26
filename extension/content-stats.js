// Shared helper injected by content scripts to increment block counters.
// Not used directly — each content script calls chrome.storage itself
// to avoid cross-script messaging complexity.

function incrementStat(key) {
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.sync.get({ [key]: 0 }, d => {
      chrome.storage.sync.set({ [key]: d[key] + 1 });
    });
  }
}
