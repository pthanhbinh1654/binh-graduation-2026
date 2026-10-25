import { i18n } from './i18n.js';

let countdownInterval = null;

export function initCountdown(ceremonyStartIso, eventEndIso, getLang = () => 'vi') {
  const gridEl = document.getElementById('countdown-grid');
  const bannerEl = document.getElementById('countdown-banner');
  const daysEl = document.getElementById('cd-days');
  const hoursEl = document.getElementById('cd-hours');
  const minutesEl = document.getElementById('cd-minutes');
  const secondsEl = document.getElementById('cd-seconds');

  if (!gridEl || !bannerEl) return;

  const targetTime = new Date(ceremonyStartIso).getTime();
  const endTime = new Date(eventEndIso).getTime();

  function update() {
    const now = Date.now();
    const lang = getLang();
    const t = i18n[lang].countdown;

    // Check if event has ended
    if (now >= endTime) {
      gridEl.style.display = 'none';
      bannerEl.style.display = 'block';
      bannerEl.className = 'countdown-special-banner';
      bannerEl.innerHTML = '';

      const p = document.createElement('p');
      p.className = 'countdown-ended-text';
      p.textContent = t.afterEvent;
      bannerEl.appendChild(p);

      if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
      }
      return;
    }

    // Check if today is the event date (in UTC+7 Vietnam Time)
    // Convert current UTC time to Vietnam date YYYY-MM-DD
    const nowVnDate = new Date(now + 7 * 3600 * 1000).toISOString().slice(0, 10);
    const targetVnDate = new Date(targetTime + 7 * 3600 * 1000).toISOString().slice(0, 10);
    const isToday = nowVnDate === targetVnDate;

    // Time difference to start
    const diff = targetTime - now;

    if (diff <= 0) {
      // Happening right now (between start and end)
      gridEl.style.display = 'none';
      bannerEl.style.display = 'block';
      bannerEl.className = 'countdown-special-banner';
      bannerEl.innerHTML = '';

      const h3 = document.createElement('h3');
      h3.textContent = t.dayOf;
      const p = document.createElement('p');
      p.textContent = t.dayOfSub;
      bannerEl.appendChild(h3);
      bannerEl.appendChild(p);
      return;
    }

    // Normal countdown state
    gridEl.style.display = 'grid';

    if (isToday) {
      bannerEl.style.display = 'block';
      bannerEl.className = 'countdown-special-banner';
      bannerEl.innerHTML = '';
      const h3 = document.createElement('h3');
      h3.textContent = t.dayOf;
      bannerEl.appendChild(h3);
    } else {
      bannerEl.style.display = 'none';
    }

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
    if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
    if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
    if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
  }

  if (countdownInterval) {
    clearInterval(countdownInterval);
  }

  update();
  countdownInterval = setInterval(update, 1000);

  // Return refresh function for language changes
  return update;
}
