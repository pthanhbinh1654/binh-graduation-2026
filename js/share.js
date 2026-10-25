import { i18n } from './i18n.js';

export function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}

export function initShare(config, getLang = () => 'vi') {
  const qrContainer = document.getElementById('qr-container');
  const btnShare = document.getElementById('btn-web-share');
  const btnCopyLink = document.getElementById('btn-copy-link');
  const btnFacebook = document.getElementById('btn-facebook-share');
  const btnCopyAddress = document.getElementById('btn-copy-address');

  const shareUrl = window.location.href.split('#')[0];

  // Generate QR Code
  function generateQr() {
    if (!qrContainer) return;
    try {
      if (typeof window.qrcode === 'function') {
        const qr = window.qrcode(0, 'M');
        qr.addData(shareUrl);
        qr.make();
        // createSvgTag gives crisp scalable vector
        qrContainer.innerHTML = qr.createSvgTag({ cellSize: 5, margin: 2, scalable: true });
        const svgEl = qrContainer.querySelector('svg');
        if (svgEl) {
          svgEl.setAttribute('width', '180');
          svgEl.setAttribute('height', '180');
          svgEl.setAttribute('aria-label', 'QR code to graduation invitation');
        }
      } else {
        // Fallback image using quick public generator
        qrContainer.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(shareUrl)}" alt="QR code" width="180" height="180" />`;
      }
    } catch (e) {
      console.warn('QR code generation error:', e);
    }
  }

  generateQr();

  // Web Share API
  if (btnShare) {
    btnShare.addEventListener('click', async () => {
      const lang = getLang();
      const t = i18n[lang].share;
      const title = i18n[lang].siteTitle;
      const text = i18n[lang].hero.invitationText;

      if (navigator.share) {
        try {
          await navigator.share({
            title: title,
            text: text,
            url: shareUrl
          });
        } catch (err) {
          if (err.name !== 'AbortError') {
            copyToClipboard(shareUrl, t.linkCopied);
          }
        }
      } else {
        copyToClipboard(shareUrl, t.linkCopied);
      }
    });
  }

  // Copy Link button
  if (btnCopyLink) {
    btnCopyLink.addEventListener('click', () => {
      const lang = getLang();
      copyToClipboard(shareUrl, i18n[lang].share.linkCopied);
    });
  }

  // Facebook Share
  if (btnFacebook) {
    btnFacebook.addEventListener('click', (e) => {
      e.preventDefault();
      const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
      window.open(fbUrl, 'fb-share-dialog', 'width=626,height=436');
    });
  }

  // Copy Address button (in Venue section)
  if (btnCopyAddress) {
    btnCopyAddress.addEventListener('click', () => {
      const lang = getLang();
      const address = config.venue.address[lang];
      copyToClipboard(address, i18n[lang].venue.addressCopied);
    });
  }

  function copyToClipboard(text, successToastMsg) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast(successToastMsg);
      }).catch(() => {
        fallbackCopy(text, successToastMsg);
      });
    } else {
      fallbackCopy(text, successToastMsg);
    }
  }

  function fallbackCopy(text, successToastMsg) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.top = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      showToast(successToastMsg);
    } catch (_) {}
    document.body.removeChild(ta);
  }

  return () => {
    // Regenerate QR on lang or state change if needed
  };
}
