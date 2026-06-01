// Blocks YouTube Shorts: redirects /shorts/* to normal video player
// and hides the Shorts shelf in the feed.

const KEY_YT = 'noreels_youtube';

function isEnabled(cb) {
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.sync.get({ [KEY_YT]: true }, d => cb(d[KEY_YT]));
  } else {
    cb(true);
  }
}

function redirectShort() {
  const path = location.pathname;
  if (/^\/shorts\/([^/?#]+)/.test(path)) {
    const videoId = path.match(/^\/shorts\/([^/?#]+)/)[1];
    location.replace('https://www.youtube.com/watch?v=' + videoId);
  }
}

function injectBlockStyles() {
  const style = document.createElement('style');
  style.id = 'noreels-yt-styles';
  style.textContent = `
    /* Hide Shorts shelf on homepage */
    ytd-rich-shelf-renderer[is-shorts],
    ytd-reel-shelf-renderer,
    ytd-shorts,
    #shorts-container,
    [overlay-style="SHORTS"],
    ytd-guide-entry-renderer a[href="/shorts"],
    tp-yt-paper-item.ytd-guide-entry-renderer[href="/shorts"],
    a.yt-simple-endpoint[href="/shorts"],
    /* Sidebar Shorts link */
    ytd-mini-guide-entry-renderer a[href="/shorts"],
    /* Shorts chip in search filters */
    yt-chip-cloud-chip-renderer:has([title="Shorts"]) {
      display: none !important;
    }
    /* Block page overlay when navigating to /shorts directly */
    #noreels-block-overlay {
      position: fixed;
      inset: 0;
      z-index: 999999;
      background: #0a0708;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-family: 'YouTube Sans', sans-serif;
      color: #f5f0f0;
      text-align: center;
      gap: 1rem;
    }
    #noreels-block-overlay .nr-icon { font-size: 4rem; }
    #noreels-block-overlay h2 { font-size: 1.6rem; font-weight: 700; margin: 0; }
    #noreels-block-overlay p { color: #9e8f8f; font-size: 1rem; max-width: 340px; line-height: 1.6; margin: 0; }
    #noreels-block-overlay a {
      margin-top: 0.5rem;
      background: #e53e3e;
      color: white;
      padding: 0.75rem 2rem;
      border-radius: 50px;
      text-decoration: none;
      font-weight: 600;
      font-size: 0.95rem;
    }
    #noreels-block-overlay a:hover { background: #c53030; }
  `;
  document.head.appendChild(style);
}

function incrementStat() {
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.sync.get({ noreels_stat_yt: 0 }, d => {
      chrome.storage.sync.set({ noreels_stat_yt: d.noreels_stat_yt + 1 });
    });
  }
}

function showBlockOverlay() {
  if (document.getElementById('noreels-block-overlay')) return;
  incrementStat();
  const div = document.createElement('div');
  div.id = 'noreels-block-overlay';
  div.innerHTML = `
    <div class="nr-icon">🚫</div>
    <h2>YouTube Shorts bloqueado</h2>
    <p>NoReels ha bloqueado este contenido corto para ayudarte a mantener el foco.</p>
    <a href="https://www.youtube.com/">Ir a YouTube</a>
  `;
  document.documentElement.appendChild(div);
}

function checkAndBlock() {
  isEnabled(enabled => {
    if (!enabled) return;
    if (/^\/shorts(\/|$)/.test(location.pathname)) {
      redirectShort();
      showBlockOverlay();
    }
  });
}

isEnabled(enabled => {
  if (!enabled) return;
  injectBlockStyles();
  checkAndBlock();

  // SPA navigation: YouTube updates the URL without full page loads
  const _pushState = history.pushState.bind(history);
  const _replaceState = history.replaceState.bind(history);
  history.pushState = (...args) => { _pushState(...args); checkAndBlock(); };
  history.replaceState = (...args) => { _replaceState(...args); checkAndBlock(); };
  window.addEventListener('popstate', checkAndBlock);

  // Hide Shorts shelf when new content loads via MutationObserver
  const observer = new MutationObserver(() => {
    // Remove Shorts shelf nodes added dynamically
    document.querySelectorAll(
      'ytd-rich-shelf-renderer[is-shorts], ytd-reel-shelf-renderer'
    ).forEach(el => el.remove());
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
});
