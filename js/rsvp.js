import { i18n } from './i18n.js';

export function initRsvp(config, getLang = () => 'vi') {
  const form = document.getElementById('rsvp-form');
  const alertBox = document.getElementById('rsvp-status');
  const submitBtn = document.getElementById('rsvp-submit-btn');
  const nameInput = document.getElementById('rsvp-name');
  const hpInput = document.getElementById('rsvp-website');

  if (!form || !alertBox || !submitBtn) return;

  const deadline = new Date(config.rsvpDeadline).getTime();

  function checkDeadline() {
    const lang = getLang();
    const t = i18n[lang].rsvp;
    if (Date.now() > deadline) {
      // Disable form
      const inputs = form.querySelectorAll('input, textarea, button');
      inputs.forEach(el => el.disabled = true);
      alertBox.className = 'form-status-alert closed';
      alertBox.textContent = t.closed;
      return true;
    }
    return false;
  }

  function checkAlreadySubmitted() {
    const lang = getLang();
    const t = i18n[lang].rsvp;
    const sentData = localStorage.getItem('rsvp_sent');
    if (sentData) {
      alertBox.className = 'form-status-alert success';
      alertBox.textContent = t.alreadySubmitted;
      alertBox.style.display = 'block';
      return true;
    }
    return false;
  }

  // Initial checks
  const isClosed = checkDeadline();
  if (!isClosed) {
    checkAlreadySubmitted();
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const lang = getLang();
    const t = i18n[lang].rsvp;

    if (checkDeadline()) return;

    // Check honeypot
    if (hpInput && hpInput.value.trim() !== '') {
      // Bot detected: simulate instant success without executing write
      alertBox.className = 'form-status-alert success';
      alertBox.textContent = t.success;
      form.reset();
      return;
    }

    const name = nameInput ? nameInput.value.trim() : '';
    if (!name) {
      alertBox.className = 'form-status-alert error';
      alertBox.textContent = t.nameRequired;
      if (nameInput) nameInput.focus();
      return;
    }

    const attendingEl = form.querySelector('input[name="attending"]:checked');
    const attending = attendingEl ? attendingEl.value : 'yes';

    const messageEl = document.getElementById('rsvp-message');
    const message = messageEl ? messageEl.value.trim() : '';

    // Set submitting state
    submitBtn.disabled = true;
    const originalText = submitBtn.textContent;
    submitBtn.textContent = t.submitting;
    alertBox.className = 'form-status-alert';
    alertBox.style.display = 'none';

    const payload = {
      action: 'rsvp',
      name: name.slice(0, 100),
      attending: attending,
      message: message.slice(0, 500),
      timestamp: new Date().toISOString()
    };

    try {
      if (config.appsScriptUrl && config.appsScriptUrl.trim() !== '') {
        const response = await fetch(config.appsScriptUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8'
          },
          body: JSON.stringify(payload)
        });

        const result = await response.json();
        if (result && result.status === 'success') {
          handleSuccess();
        } else {
          throw new Error(result ? result.message : 'Submission failed');
        }
      } else {
        // Mock success when Apps Script is not yet configured (Phase A)
        await new Promise(res => setTimeout(res, 800));
        handleSuccess();
      }
    } catch (err) {
      console.warn('RSVP submission error:', err);
      alertBox.className = 'form-status-alert error';
      alertBox.textContent = t.error;
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }

    function handleSuccess() {
      try {
        localStorage.setItem('rsvp_sent', JSON.stringify({ name, attending, time: Date.now() }));
      } catch (_) {}

      alertBox.className = 'form-status-alert success';
      alertBox.textContent = t.success;
      form.reset();
    }
  });

  return () => {
    checkDeadline();
  };
}
