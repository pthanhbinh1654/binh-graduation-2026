import { i18n } from './i18n.js';

export function initGuestbook(config, getLang = () => 'vi') {
  const form = document.getElementById('guestbook-form');
  const nameInput = document.getElementById('gb-name');
  const messageInput = document.getElementById('gb-message');
  const charCounter = document.getElementById('gb-char-count');
  const submitBtn = document.getElementById('gb-submit-btn');
  const listContainer = document.getElementById('guestbook-list');
  const loadMoreBtn = document.getElementById('gb-load-more');
  const statusAlert = document.getElementById('gb-status');

  if (!form || !listContainer) return;

  const PAGE_SIZE = 5;
  let allEntries = [];
  let visibleCount = PAGE_SIZE;

  // Character counter
  if (messageInput && charCounter) {
    messageInput.addEventListener('input', () => {
      const currentLength = messageInput.value.length;
      const lang = getLang();
      const t = i18n[lang].guestbook;
      charCounter.textContent = `${currentLength}/300 ${t.charCount}`;
    });
  }

  function formatTime(isoString) {
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return '';
      return d.toLocaleDateString(getLang() === 'vi' ? 'vi-VN' : 'en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (_) {
      return '';
    }
  }

  function renderEntries() {
    const lang = getLang();
    const t = i18n[lang].guestbook;

    listContainer.innerHTML = '';

    if (allEntries.length === 0) {
      const emptyCard = document.createElement('div');
      emptyCard.className = 'guestbook-entry';
      const msg = document.createElement('p');
      msg.className = 'guestbook-message';
      msg.style.fontStyle = 'italic';
      msg.style.color = 'var(--color-text-muted)';
      msg.textContent = t.noEntries;
      emptyCard.appendChild(msg);
      listContainer.appendChild(emptyCard);
      if (loadMoreBtn) loadMoreBtn.style.display = 'none';
      return;
    }

    const itemsToDisplay = allEntries.slice(0, visibleCount);

    itemsToDisplay.forEach(item => {
      const card = document.createElement('div');
      card.className = 'guestbook-entry';

      const header = document.createElement('div');
      header.className = 'guestbook-entry-header';

      const author = document.createElement('span');
      author.className = 'guestbook-author';
      // Strictly textContent to avoid XSS
      author.textContent = item.name || '';

      const time = document.createElement('span');
      time.className = 'guestbook-time';
      time.textContent = item.timestamp ? formatTime(item.timestamp) : '';

      header.appendChild(author);
      header.appendChild(time);

      const message = document.createElement('p');
      message.className = 'guestbook-message';
      // Strictly textContent to avoid XSS
      message.textContent = item.message || '';

      card.appendChild(header);
      card.appendChild(message);
      listContainer.appendChild(card);
    });

    if (loadMoreBtn) {
      loadMoreBtn.style.display = visibleCount < allEntries.length ? 'inline-flex' : 'none';
    }
  }

  function showSkeletons() {
    listContainer.innerHTML = '';
    for (let i = 0; i < 3; i++) {
      const skeleton = document.createElement('div');
      skeleton.className = 'guestbook-entry';
      skeleton.innerHTML = `
        <div class="skeleton-box" style="width: 35%; margin-bottom: 8px;"></div>
        <div class="skeleton-box" style="width: 90%;"></div>
        <div class="skeleton-box" style="width: 70%;"></div>
      `;
      listContainer.appendChild(skeleton);
    }
  }

  async function fetchEntries() {
    showSkeletons();

    if (!config.appsScriptUrl || config.appsScriptUrl.trim() === '') {
      // Local demo entry
      allEntries = [
        {
          name: "Phan Thanh Bình",
          message: i18n[getLang()].guestbook.officialGreeting,
          timestamp: new Date().toISOString()
        }
      ];
      renderEntries();
      return;
    }

    try {
      const res = await fetch(`${config.appsScriptUrl}?action=guestbook`);
      if (!res.ok) throw new Error('Guestbook fetch failed');
      const data = await res.json();
      if (Array.isArray(data)) {
        allEntries = data;
      } else if (data && Array.isArray(data.entries)) {
        allEntries = data.entries;
      } else {
        allEntries = [];
      }
      renderEntries();
    } catch (err) {
      console.warn('Could not load guestbook:', err);
      // Fallback
      allEntries = [
        {
          name: "Phan Thanh Bình",
          message: i18n[getLang()].guestbook.officialGreeting,
          timestamp: new Date().toISOString()
        }
      ];
      renderEntries();
    }
  }

  // Load more handler
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      visibleCount += PAGE_SIZE;
      renderEntries();
    });
  }

  // Form submit handler
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const lang = getLang();
    const t = i18n[lang].guestbook;

    const name = nameInput ? nameInput.value.trim() : '';
    const message = messageInput ? messageInput.value.trim() : '';

    if (!name) {
      if (statusAlert) {
        statusAlert.className = 'form-status-alert error';
        statusAlert.textContent = t.nameRequired;
      }
      if (nameInput) nameInput.focus();
      return;
    }

    if (!message) {
      if (statusAlert) {
        statusAlert.className = 'form-status-alert error';
        statusAlert.textContent = t.messageRequired;
      }
      if (messageInput) messageInput.focus();
      return;
    }

    submitBtn.disabled = true;
    const originalBtnText = submitBtn.textContent;
    submitBtn.textContent = t.submitting;

    if (statusAlert) {
      statusAlert.className = 'form-status-alert';
      statusAlert.style.display = 'none';
    }

    const newEntry = {
      action: 'guestbook',
      name: name.slice(0, 100),
      message: message.slice(0, 300),
      timestamp: new Date().toISOString()
    };

    try {
      if (config.appsScriptUrl && config.appsScriptUrl.trim() !== '') {
        const response = await fetch(config.appsScriptUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8'
          },
          body: JSON.stringify(newEntry)
        });
        const resData = await response.json();
        if (resData && resData.status === 'success') {
          handleSuccess();
        } else {
          throw new Error('Failed to post entry');
        }
      } else {
        // Mock save
        await new Promise(r => setTimeout(r, 600));
        handleSuccess();
      }
    } catch (err) {
      console.warn('Guestbook post error:', err);
      if (statusAlert) {
        statusAlert.className = 'form-status-alert error';
        statusAlert.textContent = t.error;
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
    }

    function handleSuccess() {
      allEntries.unshift(newEntry);
      renderEntries();
      form.reset();
      if (charCounter) {
        charCounter.textContent = `0/300 ${t.charCount}`;
      }
      if (statusAlert) {
        statusAlert.className = 'form-status-alert success';
        statusAlert.textContent = t.success;
      }
    }
  });

  fetchEntries();

  return () => {
    renderEntries();
  };
}
