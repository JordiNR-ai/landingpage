const KEYS = {
  ig: 'noreels_instagram',
  yt: 'noreels_youtube',
  blockedIG: 'noreels_stat_ig',
  blockedYT: 'noreels_stat_yt',
  weekStart: 'noreels_week_start'
};

const $ = id => document.getElementById(id);

function updateGlobalStatus(igOn, ytOn) {
  const active = igOn || ytOn;
  $('globalDot').className = 'status-dot' + (active ? '' : ' off');
  $('globalStatus').textContent = active ? 'Activo' : 'Pausado';
}

function formatTime(blocked) {
  // Estimate ~2 min per blocked attempt
  const mins = blocked * 2;
  if (mins < 60) return mins + ' min';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h + 'h ' + (m > 0 ? m + 'm' : '');
}

function checkWeekReset(cb) {
  chrome.storage.sync.get({ [KEYS.weekStart]: 0 }, d => {
    const now = Date.now();
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    if (now - d[KEYS.weekStart] > weekMs) {
      chrome.storage.sync.set({
        [KEYS.weekStart]: now,
        [KEYS.blockedIG]: 0,
        [KEYS.blockedYT]: 0
      }, cb);
    } else {
      cb();
    }
  });
}

function loadAll() {
  checkWeekReset(() => {
    chrome.storage.sync.get({
      [KEYS.ig]: true,
      [KEYS.yt]: true,
      [KEYS.blockedIG]: 0,
      [KEYS.blockedYT]: 0
    }, d => {
      $('toggleIG').checked = d[KEYS.ig];
      $('toggleYT').checked = d[KEYS.yt];
      updateGlobalStatus(d[KEYS.ig], d[KEYS.yt]);

      const totalBlocked = d[KEYS.blockedIG] + d[KEYS.blockedYT];
      $('statBlocked').textContent = totalBlocked;
      $('statTime').textContent = formatTime(totalBlocked);
      $('statIG').textContent = d[KEYS.blockedIG];
      $('statYT').textContent = d[KEYS.blockedYT];
    });
  });
}

$('toggleIG').addEventListener('change', e => {
  const val = e.target.checked;
  chrome.storage.sync.set({ [KEYS.ig]: val });
  updateGlobalStatus(val, $('toggleYT').checked);
});

$('toggleYT').addEventListener('change', e => {
  const val = e.target.checked;
  chrome.storage.sync.set({ [KEYS.yt]: val });
  updateGlobalStatus($('toggleIG').checked, val);
});

$('resetBtn').addEventListener('click', () => {
  chrome.storage.sync.set({
    [KEYS.blockedIG]: 0,
    [KEYS.blockedYT]: 0,
    [KEYS.weekStart]: Date.now()
  }, loadAll);
});

loadAll();
