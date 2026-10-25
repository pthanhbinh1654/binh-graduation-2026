import { i18n } from './i18n.js';

let isPlaying = false;

export function initMusic(musicConfig, getLang = () => 'vi') {
  const musicBtn = document.getElementById('btn-music-toggle');
  const audio = document.getElementById('bg-audio');

  if (!musicBtn || !audio) return;

  function updateButtonUi() {
    const lang = getLang();
    const t = i18n[lang].music;
    if (isPlaying) {
      musicBtn.classList.add('playing');
      musicBtn.setAttribute('title', t.pause);
      musicBtn.setAttribute('aria-label', t.pause);
      musicBtn.innerHTML = '<span class="music-icon" aria-hidden="true">🎵</span>';
    } else {
      musicBtn.classList.remove('playing');
      musicBtn.setAttribute('title', t.play);
      musicBtn.setAttribute('aria-label', t.play);
      musicBtn.innerHTML = '<span class="music-icon" aria-hidden="true">♪</span>';
    }
  }

  // Ensure audio src and volume
  if (!audio.src && musicConfig && musicConfig.src) {
    audio.src = musicConfig.src;
  }
  audio.volume = 0.8;

  // Audio lifecycle events
  audio.addEventListener('play', () => {
    isPlaying = true;
    updateButtonUi();
  });

  audio.addEventListener('pause', () => {
    isPlaying = false;
    updateButtonUi();
  });

  audio.addEventListener('ended', () => {
    // Loop
    audio.currentTime = 0;
    audio.play().catch(() => {});
  });

  // Toggle on user tap / click
  musicBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (!audio.src) {
      audio.src = (musicConfig && musicConfig.src) ? musicConfig.src : 'assets/audio/thanh-xuan.mp3';
    }
    audio.volume = 0.8;
    if (audio.paused) {
      audio.play().then(() => {
        isPlaying = true;
        try { localStorage.setItem('music_playing', 'true'); } catch (_) {}
        updateButtonUi();
      }).catch(err => {
        console.warn('Audio playback error:', err);
      });
    } else {
      audio.pause();
      isPlaying = false;
      try { localStorage.setItem('music_playing', 'false'); } catch (_) {}
      updateButtonUi();
    }
  });

  // Check saved user preference
  try {
    const pref = localStorage.getItem('music_playing');
    if (pref === 'true') {
      audio.play().then(() => {
        isPlaying = true;
        updateButtonUi();
      }).catch(() => {
        // Mobile browsers require user interaction before first audio playback
      });
    }
  } catch (_) {}

  updateButtonUi();

  return () => {
    updateButtonUi();
  };
}
