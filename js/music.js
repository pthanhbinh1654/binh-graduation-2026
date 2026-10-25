import { i18n } from './i18n.js';

let player = null;
let isPlayerReady = false;
let isPlaying = false;

export function initMusic(youtubeId, getLang = () => 'vi') {
  const musicBtn = document.getElementById('btn-music-toggle');
  const playerContainer = document.getElementById('yt-player');

  if (!musicBtn || !youtubeId) return;

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

  // Load YouTube IFrame API if not already present
  if (!window.YT) {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  }

  window.onYouTubeIframeAPIReady = () => {
    player = new window.YT.Player('yt-player', {
      height: '1',
      width: '1',
      videoId: youtubeId,
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        modestbranding: 1,
        rel: 0,
        playsinline: 1,
        loop: 1,
        playlist: youtubeId
      },
      events: {
        onReady: (event) => {
          isPlayerReady = true;
          // Check if previously set to play
          const pref = localStorage.getItem('music_playing');
          if (pref === 'true') {
            try {
              event.target.unMute();
              event.target.playVideo();
              isPlaying = true;
              updateButtonUi();
            } catch (_) {}
          }
        },
        onStateChange: (event) => {
          if (event.data === window.YT.PlayerState.PLAYING) {
            isPlaying = true;
            updateButtonUi();
          } else if (event.data === window.YT.PlayerState.PAUSED) {
            isPlaying = false;
            updateButtonUi();
          } else if (event.data === window.YT.PlayerState.ENDED) {
            // Loop playback
            try {
              player.playVideo();
            } catch (_) {}
          }
        },
        onError: (err) => {
          console.warn('YouTube Player error code:', err.data);
          // Hide floating button and show external link if error
          musicBtn.style.display = 'none';
          const fallbackEl = document.getElementById('music-fallback-link');
          if (fallbackEl) {
            fallbackEl.style.display = 'inline-block';
            fallbackEl.href = `https://www.youtube.com/watch?v=${youtubeId}`;
          }
        }
      }
    });
  };

  musicBtn.addEventListener('click', () => {
    if (!isPlayerReady || !player) {
      // If player not ready yet, retry when ready
      return;
    }

    try {
      if (isPlaying) {
        player.pauseVideo();
        isPlaying = false;
        try { localStorage.setItem('music_playing', 'false'); } catch (_) {}
      } else {
        player.unMute();
        player.setVolume(70);
        player.playVideo();
        isPlaying = true;
        try { localStorage.setItem('music_playing', 'true'); } catch (_) {}
      }
      updateButtonUi();
    } catch (e) {
      console.warn('Error toggling music:', e);
    }
  });

  updateButtonUi();

  return () => {
    updateButtonUi();
  };
}
