import { config } from './config.js';
import { i18n } from './i18n.js';
import { initCountdown } from './countdown.js';
import { initCalendar } from './calendar.js';
import { initWeather } from './weather.js';
import { initRsvp } from './rsvp.js';
import { initGuestbook } from './guestbook.js';
import { initMusic } from './music.js';
import { initShare, showToast } from './share.js';

let currentLang = 'vi';
let guestName = '';

export function getLang() {
  return currentLang;
}

function sanitizeInput(str) {
  if (!str) return '';
  return str
    .slice(0, 40)
    .replace(/[<>'"`;(){}[\]\\/]/g, '') // remove HTML & code characters
    .replace(/[\x00-\x1F\x7F]/g, '')    // remove control characters
    .replace(/[-_+]/g, ' ')             // replace delimiters with spaces
    .replace(/\s+/g, ' ')               // normalize spaces
    .trim();
}

function applyI18n() {
  const t = i18n[currentLang];
  document.documentElement.lang = currentLang;
  document.title = t.siteTitle;

  // Translate all elements with data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const keyPath = el.getAttribute('data-i18n').split('.');
    let value = t;
    for (const key of keyPath) {
      if (value && value[key] !== undefined) {
        value = value[key];
      } else {
        value = null;
        break;
      }
    }
    if (typeof value === 'string') {
      el.textContent = value;
    }
  });

  // Placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const keyPath = el.getAttribute('data-i18n-placeholder').split('.');
    let value = t;
    for (const key of keyPath) {
      if (value && value[key] !== undefined) {
        value = value[key];
      } else {
        value = null;
        break;
      }
    }
    if (typeof value === 'string') {
      el.placeholder = value;
    }
  });

  // Update personalized greeting
  const greetingEl = document.getElementById('hero-greeting-text');
  if (greetingEl) {
    if (guestName) {
      greetingEl.textContent = `${t.hero.greetingPrefix} ${guestName},`;
    } else {
      greetingEl.textContent = `${t.hero.greetingDefault},`;
    }
  }

  // Update dynamic timeline items
  renderTimeline();

  // Update venue localized text
  const venueNameEl = document.getElementById('venue-name');
  const venueNoteEl = document.getElementById('venue-note');
  const venueAddressEl = document.getElementById('venue-address');
  if (venueNameEl) venueNameEl.textContent = config.venue.name[currentLang];
  if (venueNoteEl) venueNoteEl.textContent = config.venue.note[currentLang];
  if (venueAddressEl) venueAddressEl.textContent = config.venue.address[currentLang];

  // Update Lang toggle button text
  const langToggleBtn = document.getElementById('btn-lang-toggle');
  if (langToggleBtn) {
    langToggleBtn.textContent = t.nav.langSwitch;
  }
}

function renderTimeline() {
  const timelineList = document.getElementById('timeline-list');
  if (!timelineList) return;

  timelineList.innerHTML = '';
  config.timeline.forEach(item => {
    const li = document.createElement('div');
    li.className = 'timeline-item fade-up';

    const dot = document.createElement('div');
    dot.className = 'timeline-dot';

    const card = document.createElement('div');
    card.className = 'timeline-card';

    const time = document.createElement('span');
    time.className = 'timeline-time';
    time.textContent = item.time;

    const desc = document.createElement('p');
    desc.className = 'timeline-desc';
    desc.textContent = item[currentLang] || item.vi;

    card.appendChild(time);
    card.appendChild(desc);
    li.appendChild(dot);
    li.appendChild(card);
    timelineList.appendChild(li);
  });
}

function initIntersectionObserver() {
  const elements = document.querySelectorAll('.fade-up');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  elements.forEach(el => observer.observe(el));
}

function setupEnvelope() {
  const screen = document.getElementById('envelope-screen');
  const openBtn = document.getElementById('btn-open-envelope');

  if (!screen || !openBtn) return;

  const isOpened = sessionStorage.getItem('envelope_opened') === 'true';
  if (isOpened) {
    screen.style.display = 'none';
    screen.classList.add('opened');
  }

  openBtn.addEventListener('click', () => {
    screen.classList.add('opened');
    sessionStorage.setItem('envelope_opened', 'true');
    setTimeout(() => {
      screen.style.display = 'none';
    }, 600);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // 1. Parse URL Parameters
  const params = new URLSearchParams(window.location.search);
  const rawKhach = params.get('khach') || params.get('guest');
  if (rawKhach) {
    guestName = sanitizeInput(rawKhach);
  }

  const urlLang = params.get('lang');
  const storedLang = localStorage.getItem('lang');
  if (urlLang === 'en' || urlLang === 'vi') {
    currentLang = urlLang;
  } else if (storedLang === 'en' || storedLang === 'vi') {
    currentLang = storedLang;
  } else {
    currentLang = 'vi';
  }

  // Pre-fill RSVP form if guestName exists
  const rsvpNameInput = document.getElementById('rsvp-name');
  if (rsvpNameInput && guestName) {
    rsvpNameInput.value = guestName;
  }

  // Setup portrait vs monogram
  const avatarWrap = document.getElementById('hero-avatar-wrap');
  if (avatarWrap) {
    if (config.flags.showPortrait) {
      avatarWrap.innerHTML = `
        <div class="hero-avatar">
          <img src="/assets/img/portrait.webp" alt="${config.owner}" width="140" height="140" />
        </div>
      `;
    } else {
      avatarWrap.innerHTML = `
        <div class="hero-avatar">
          <div class="hero-monogram-placeholder" aria-label="PTB Monogram">PTB</div>
        </div>
      `;
    }
  }

  // Setup Envelope
  setupEnvelope();

  // Apply internationalization strings
  applyI18n();

  // Setup Module instances
  const refreshCountdown = initCountdown(config.ceremonyStart, config.eventEnd, getLang);
  const refreshCalendar = initCalendar(config, getLang);
  const refreshWeather = initWeather(config.venue.lat, config.venue.lng, config.ceremonyStart, getLang);
  const refreshRsvp = initRsvp(config, getLang);
  const refreshGuestbook = initGuestbook(config, getLang);
  const refreshMusic = initMusic(config.music.youtubeId, getLang);
  const refreshShare = initShare(config, getLang);

  // Setup Language Toggle button
  const langToggleBtn = document.getElementById('btn-lang-toggle');
  if (langToggleBtn) {
    langToggleBtn.addEventListener('click', () => {
      currentLang = currentLang === 'vi' ? 'en' : 'vi';
      localStorage.setItem('lang', currentLang);
      applyI18n();
      if (refreshCountdown) refreshCountdown();
      if (refreshCalendar) refreshCalendar();
      if (refreshWeather) refreshWeather();
      if (refreshRsvp) refreshRsvp();
      if (refreshGuestbook) refreshGuestbook();
      if (refreshMusic) refreshMusic();
      if (refreshShare) refreshShare();
    });
  }

  // Helper for app deep links with clipboard fallback
  function setupAppButton(btn, deepLink, address, toastFn) {
    if (!btn) return;
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      // Try to open deep link
      window.location.href = deepLink;
      // Fallback: if still on page after 1.5s, copy address
      setTimeout(() => {
        if (!document.hidden) {
          const addr = typeof address === 'function' ? address() : address;
          navigator.clipboard.writeText(addr).catch(() => {});
          toastFn();
        }
      }, 1500);
    });
  }

  // Lazy-load map iframe using IntersectionObserver
  const mapContainer = document.getElementById('map-container');
  if (mapContainer) {
    const mapObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const iframe = document.createElement('iframe');
          iframe.src = `https://maps.google.com/maps?q=10.02924,105.76941&z=17&output=embed&hl=vi`;
          iframe.title = i18n[currentLang].venue.mapAria;
          iframe.loading = 'lazy';
          iframe.allowFullscreen = true;
          mapContainer.innerHTML = '';
          mapContainer.appendChild(iframe);
          obs.disconnect();
        }
      });
    }, { rootMargin: '200px' });
    mapObserver.observe(mapContainer);
  }

  // Setup Directions, Grab, Be links
  const btnDirections = document.getElementById('btn-directions');
  if (btnDirections) {
    btnDirections.href = `https://www.google.com/maps/dir/?api=1&destination=${config.venue.lat},${config.venue.lng}`;
  }

  const btnOpenMaps = document.getElementById('btn-open-maps');
  if (btnOpenMaps) {
    btnOpenMaps.href = config.venue.mapsUrl;
  }

  const btnGrab = document.getElementById('btn-grab');
  const grabDeepLink = `https://grab.onelink.me/2695613898?pid=dlink&c=direct&is_retargeting=true&af_dp=grab%3A%2F%2Fopen%3Fdropoff_latitude%3D${config.venue.lat}%26dropoff_longitude%3D${config.venue.lng}`;
  setupAppButton(
    btnGrab,
    grabDeepLink,
    () => config.venue.address[currentLang] || config.venue.address.vi,
    () => showToast(i18n[currentLang].venue.addressCopied)
  );

  const btnBe = document.getElementById('btn-be');
  const beDeepLink = `https://begroup.onelink.me/n7vF?af_dp=beapp%3A%2F%2Fbooking%3Fdest_lat%3D${config.venue.lat}%26dest_lng%3D${config.venue.lng}`;
  setupAppButton(
    btnBe,
    beDeepLink,
    () => config.venue.address[currentLang] || config.venue.address.vi,
    () => showToast(i18n[currentLang].venue.addressCopied)
  );

  // Init Fade Up animations
  initIntersectionObserver();
});
