// Blocks Instagram Reels: hides the Reels tab, Reels in feed,
// and shows a block overlay when navigating to /reels/*.

const KEY_IG = 'noreels_instagram';

function isEnabled(cb) {
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.sync.get({ [KEY_IG]: true }, d => cb(d[KEY_IG]));
  } else {
    cb(true);
  }
}

function injectBlockStyles() {
  const style = document.createElement('style');
  style.id = 'noreels-ig-styles';
  style.textContent = `
    /* Hide Reels tab in bottom navigation */
    a[href="/reels/"],
    a[href*="/reels"],
    /* Reels icon in nav */
    [aria-label="Reels"],
    /* Reels section in explore */
    ._ac1z,
    /* Video/Reel items in feed */
    ._aagu:has(video[playsinline]):has([aria-label*="Reel"]) {
      display: none !important;
    }
    /* Block overlay */
    #noreels-ig-overlay {
      position: fixed;
      inset: 0;
      z-index: 999999;
      background: #0a0708;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      color: #f5f0f0;
      text-align: center;
      gap: 1rem;
    }
    #noreels-ig-overlay .nr-icon { font-size: 4rem; }
    #noreels-ig-overlay h2 { font-size: 1.6rem; font-weight: 700; margin: 0; }
    #noreels-ig-overlay p { color: #9e8f8f; font-size: 1rem; max-width: 340px; line-height: 1.6; margin: 0; }
    #noreels-ig-overlay a {
      margin-top: 0.5rem;
      background: linear-gradient(135deg, #f58529, #dd2a7b);
      color: white;
      padding: 0.75rem 2rem;
      border-radius: 50px;
      text-decoration: none;
      font-weight: 600;
      font-size: 0.95rem;
    }
    #noreels-ig-overlay .nr-dismiss {
      background: transparent;
      border: 1px solid rgba(255,255,255,0.15);
      color: #9e8f8f;
      margin-top: 0;
    }
    #noreels-ig-overlay .nr-dismiss:hover { background: rgba(255,255,255,0.05); }
  `;
  document.head.appendChild(style);
}

function incrementStat() {
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.sync.get({ noreels_stat_ig: 0 }, d => {
      chrome.storage.sync.set({ noreels_stat_ig: d.noreels_stat_ig + 1 });
    });
  }
}

function showBlockOverlay() {
  if (document.getElementById('noreels-ig-overlay')) return;
  incrementStat();
  const div = document.createElement('div');
  div.id = 'noreels-ig-overlay';
  div.innerHTML = `
    <div class="nr-icon">🚫</div>
    <h2>Instagram Reels bloqueado</h2>
    <p>NoReels ha bloqueado esta sección para ayudarte a mantener el foco.</p>
    <a href="https://www.instagram.com/">Ir al inicio</a>
  `;
  document.documentElement.appendChild(div);
}

function removeOverlay() {
  const el = document.getElementById('noreels-ig-overlay');
  if (el) el.remove();
}

function checkPath() {
  if (/^\/(reels|reel)(\/|$)/.test(location.pathname)) {
    showBlockOverlay();
  } else {
    removeOverlay();
  }
}

isEnabled(enabled => {
  if (!enabled) return;
  injectBlockStyles();
  checkPath();

  // Instagram is a SPA — intercept pushState
  const _push = history.pushState.bind(history);
  const _replace = history.replaceState.bind(history);
  history.pushState = (...a) => { _push(...a); checkPath(); };
  history.replaceState = (...a) => { _replace(...a); checkPath(); };
  window.addEventListener('popstate', checkPath);

  // MutationObserver to hide Reels as they are injected in the feed
  const observer = new MutationObserver(() => {
    // Target nav links to Reels
    document.querySelectorAll('a[href="/reels/"], a[href="/reels"]').forEach(el => {
      el.closest('li, div[role="listitem"]')?.style.setProperty('display', 'none', 'important');
    });
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
});
