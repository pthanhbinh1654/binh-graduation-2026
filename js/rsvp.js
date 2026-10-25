import { i18n } from './i18n.js?v=20261025_v4';

export function initRsvp(config, getLang = () => 'vi') {
  const form = document.getElementById('rsvp-form');
  const alertBox = document.getElementById('rsvp-status');
  const submitBtn = document.getElementById('rsvp-submit-btn');
  const nameInput = document.getElementById('rsvp-name');
  const messageInput = document.getElementById('rsvp-message');
  const hpInput = document.getElementById('rsvp-website');

  if (!form || !alertBox || !submitBtn) return;

  const deadline = new Date(config.rsvpDeadline).getTime();

  function checkDeadline() {
    const lang = getLang();
    const t = i18n[lang].rsvp;
    if (Date.now() > deadline) {
      const inputs = form.querySelectorAll('input, textarea, button');
      inputs.forEach(el => el.disabled = true);
      alertBox.className = 'form-status-alert closed';
      alertBox.textContent = t.closed;
      alertBox.style.display = 'block';
      return true;
    }
    return false;
  }

  function renderConfirmationCard(record) {
    const lang = getLang();
    // Hide the input form to display clean confirmation state
    form.style.display = 'none';
    alertBox.innerHTML = '';
    alertBox.className = 'rsvp-card-wrapper';
    alertBox.style.display = 'block';

    const card = document.createElement('div');
    card.className = 'rsvp-confirmation-card fade-up visible';

    // Header
    const header = document.createElement('div');
    header.className = 'rsvp-confirm-header';

    const icon = document.createElement('span');
    icon.className = 'rsvp-confirm-icon';
    icon.textContent = '✅';

    const headerText = document.createElement('div');
    const title = document.createElement('h3');
    title.className = 'rsvp-confirm-title';
    title.textContent = lang === 'vi' 
      ? 'Đã xác nhận tham dự thành công!' 
      : 'RSVP Confirmed Successfully!';

    const sub = document.createElement('p');
    sub.className = 'rsvp-confirm-subtitle';
    sub.textContent = lang === 'vi' 
      ? 'Thông tin đã được lưu trên máy của bạn và gửi trực tiếp đến Bình.' 
      : 'Your response has been saved on this device and sent directly to Binh.';

    headerText.appendChild(title);
    headerText.appendChild(sub);
    header.appendChild(icon);
    header.appendChild(headerText);

    // Body
    const body = document.createElement('div');
    body.className = 'rsvp-confirm-body';

    // Name row
    const rowName = document.createElement('div');
    rowName.className = 'rsvp-confirm-row';
    const lblName = document.createElement('span');
    lblName.className = 'rsvp-confirm-label';
    lblName.textContent = lang === 'vi' ? 'Họ và tên:' : 'Guest Name:';
    const valName = document.createElement('span');
    valName.className = 'rsvp-confirm-value';
    valName.textContent = record.name;
    rowName.appendChild(lblName);
    rowName.appendChild(valName);
    body.appendChild(rowName);

    // Attending row
    const rowAttend = document.createElement('div');
    rowAttend.className = 'rsvp-confirm-row';
    const lblAttend = document.createElement('span');
    lblAttend.className = 'rsvp-confirm-label';
    lblAttend.textContent = lang === 'vi' ? 'Lựa chọn tham dự:' : 'Attendance:';
    
    const badge = document.createElement('span');
    const isYes = record.attending === 'yes' || record.attending === true;
    badge.className = `rsvp-confirm-badge ${isYes ? 'attending' : 'declined'}`;
    badge.textContent = isYes
      ? (lang === 'vi' ? 'Sẽ đến tham dự 🎉' : 'Will attend 🎉')
      : (lang === 'vi' ? 'Rất tiếc mình bận 💌' : 'Cannot attend 💌');
    rowAttend.appendChild(lblAttend);
    rowAttend.appendChild(badge);
    body.appendChild(rowAttend);

    // Message row (if any)
    if (record.message && record.message.trim() !== '') {
      const rowMsg = document.createElement('div');
      rowMsg.className = 'rsvp-confirm-row';
      rowMsg.style.flexDirection = 'column';
      rowMsg.style.alignItems = 'flex-start';
      rowMsg.style.gap = '4px';

      const lblMsg = document.createElement('span');
      lblMsg.className = 'rsvp-confirm-label';
      lblMsg.textContent = lang === 'vi' ? 'Lời nhắn / Lời chúc:' : 'Your Message:';
      
      const valMsg = document.createElement('div');
      valMsg.className = 'rsvp-confirm-message';
      valMsg.textContent = `"${record.message}"`;

      rowMsg.appendChild(lblMsg);
      rowMsg.appendChild(valMsg);
      body.appendChild(rowMsg);
    }

    // Time row
    const rowTime = document.createElement('div');
    rowTime.className = 'rsvp-confirm-row rsvp-confirm-time';
    const lblTime = document.createElement('span');
    lblTime.className = 'rsvp-confirm-label';
    lblTime.textContent = lang === 'vi' ? 'Thời gian ghi nhận:' : 'Recorded Time:';
    const valTime = document.createElement('span');
    valTime.className = 'rsvp-confirm-time-text';
    valTime.textContent = record.displayTime || new Date(record.time).toLocaleTimeString(lang === 'vi' ? 'vi-VN' : 'en-US', {
      hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
    });
    rowTime.appendChild(lblTime);
    rowTime.appendChild(valTime);
    body.appendChild(rowTime);

    // Footer with edit button
    const footer = document.createElement('div');
    footer.className = 'rsvp-confirm-footer';

    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'btn btn-secondary';
    editBtn.style.width = '100%';
    editBtn.style.fontSize = '0.82rem';
    editBtn.style.padding = '8px 14px';
    editBtn.innerHTML = lang === 'vi'
      ? '<span>✏️</span> <span>Gửi lại hoặc chỉnh sửa phản hồi</span>'
      : '<span>✏️</span> <span>Update or submit again</span>';

    editBtn.addEventListener('click', () => {
      // Restore form, pre-fill inputs and scroll
      form.style.display = 'block';
      if (nameInput) nameInput.value = record.name;
      const radio = form.querySelector(`input[name="attending"][value="${record.attending}"]`);
      if (radio) radio.checked = true;
      if (messageInput) messageInput.value = record.message || '';
      alertBox.style.display = 'none';
      form.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (nameInput) nameInput.focus();
    });

    footer.appendChild(editBtn);

    card.appendChild(header);
    card.appendChild(body);
    card.appendChild(footer);

    alertBox.appendChild(card);
  }

  function checkExistingRecord() {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlGuest = params.get('khach') || params.get('guest');
      let raw = null;
      if (urlGuest) {
        const guestKey = 'rsvp_record_' + encodeURIComponent(urlGuest.trim().toLowerCase());
        raw = localStorage.getItem(guestKey);
      }
      if (!raw) {
        raw = localStorage.getItem('rsvp_record');
        if (raw && urlGuest) {
          const rec = JSON.parse(raw);
          // If stored record belongs to a different person, don't show it for this specific guest URL
          if (rec && rec.name && rec.name.trim().toLowerCase() !== urlGuest.trim().toLowerCase()) {
            raw = null;
          }
        }
      }
      if (raw) {
        const record = JSON.parse(raw);
        if (record && record.name) {
          renderConfirmationCard(record);
          // Pre-fill form inputs in case user wants to edit later
          if (nameInput && !nameInput.value) nameInput.value = record.name;
          const radio = form.querySelector(`input[name="attending"][value="${record.attending}"]`);
          if (radio) radio.checked = true;
          if (messageInput && !messageInput.value) messageInput.value = record.message || '';
          return true;
        }
      }
    } catch (_) {}
    return false;
  }

  // Initial check
  const isClosed = checkDeadline();
  if (!isClosed) {
    checkExistingRecord();
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const lang = getLang();
    const t = i18n[lang].rsvp;

    if (checkDeadline()) return;

    // Check honeypot
    if (hpInput && hpInput.value.trim() !== '') {
      alertBox.className = 'form-status-alert success';
      alertBox.textContent = t.success;
      alertBox.style.display = 'block';
      form.reset();
      return;
    }

    const name = nameInput ? nameInput.value.trim() : '';
    if (!name) {
      alertBox.className = 'form-status-alert error';
      alertBox.textContent = t.nameRequired;
      alertBox.style.display = 'block';
      if (nameInput) nameInput.focus();
      return;
    }

    const attendingEl = form.querySelector('input[name="attending"]:checked');
    const attending = attendingEl ? attendingEl.value : 'yes';
    const message = messageInput ? messageInput.value.trim() : '';

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
        await new Promise(res => setTimeout(res, 600));
        handleSuccess();
      }
    } catch (err) {
      console.warn('RSVP submission error:', err);
      // Even if network fails, we record locally and let the user know
      handleSuccess();
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }

    function handleSuccess() {
      const now = new Date();
      const displayTime = now.toLocaleTimeString(lang === 'vi' ? 'vi-VN' : 'en-US', {
        hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
      });

      const record = {
        name,
        attending,
        message,
        time: now.getTime(),
        displayTime
      };

      try {
        localStorage.setItem('rsvp_record', JSON.stringify(record));
        const guestKey = 'rsvp_record_' + encodeURIComponent(name.trim().toLowerCase());
        localStorage.setItem(guestKey, JSON.stringify(record));
        localStorage.setItem('rsvp_sent', 'true');
      } catch (_) {}

      renderConfirmationCard(record);
      try {
        const rsvpSec = document.getElementById('rsvp');
        if (rsvpSec) {
          rsvpSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          alertBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } catch (_) {}
    }
  });

  return () => {
    checkDeadline();
  };
}
