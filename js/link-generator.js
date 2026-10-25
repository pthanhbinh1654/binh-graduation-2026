const baseUrlInput = document.getElementById('base-url-input');
const langSelect = document.getElementById('lang-select');
const namesInput = document.getElementById('names-input');
const btnGenerate = document.getElementById('btn-generate');
const btnSample = document.getElementById('btn-sample');
const btnClear = document.getElementById('btn-clear');
const btnCopyAll = document.getElementById('btn-copy-all');
const resultsWrapper = document.getElementById('results-wrapper');
const countSummary = document.getElementById('count-summary');
const linksTbody = document.getElementById('links-tbody');
const toast = document.getElementById('toast');

// QR Modal Elements
const qrModal = document.getElementById('qr-modal');
const modalGuestName = document.getElementById('modal-guest-name');
const modalGuestLink = document.getElementById('modal-guest-link');
const modalQrBox = document.getElementById('modal-qr-box');
const btnModalCopy = document.getElementById('btn-modal-copy');
const btnModalClose = document.getElementById('btn-modal-close');

let currentGeneratedLinks = [];
let currentModalLink = '';

// Auto-detect current domain dynamically on page load!
function initBaseUrl() {
  if (baseUrlInput) {
    if (window.location.origin && window.location.origin !== 'null') {
      baseUrlInput.value = window.location.origin + '/';
    } else {
      baseUrlInput.value = 'https://binhtn2026.pthanhbinh1654.workers.dev/';
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBaseUrl);
} else {
  initBaseUrl();
}

function showToast(msg) {
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2600);
}

function copyToClipboard(text, successMsg) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(successMsg);
    }).catch(() => {
      fallbackCopy(text, successMsg);
    });
  } else {
    fallbackCopy(text, successMsg);
  }
}

function fallbackCopy(text, successMsg) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    showToast(successMsg);
  } catch (err) {
    prompt('Sao chép đường link bên dưới:', text);
  }
  document.body.removeChild(ta);
}

function createQrSvg(url, size) {
  try {
    if (typeof window.qrcode === 'function') {
      const qr = window.qrcode(0, 'M');
      qr.addData(url);
      qr.make();
      return qr.createSvgTag({ cellSize: size, margin: 1, scalable: true });
    }
  } catch (e) {
    console.warn('QR generation error:', e);
  }
  return '<span style="font-size:0.75rem; color:var(--color-text-muted);">QR</span>';
}

function buildPersonalizedUrl(base, name, lang) {
  let cleanBase = (base || '').trim();
  if (!cleanBase) {
    cleanBase = window.location.origin || 'https://binhtn2026.pthanhbinh1654.workers.dev';
  }
  if (!/^https?:\/\//i.test(cleanBase)) {
    cleanBase = 'https://' + cleanBase;
  }
  if (!cleanBase.endsWith('/')) {
    cleanBase += '/';
  }

  const slug = name.trim().replace(/\s+/g, '-');

  try {
    const urlObj = new URL(cleanBase);
    urlObj.searchParams.set('khach', slug);
    if (lang === 'en') {
      urlObj.searchParams.set('lang', 'en');
    }
    return urlObj.toString();
  } catch (e) {
    const query = lang === 'en' 
      ? `?khach=${encodeURIComponent(slug)}&lang=en` 
      : `?khach=${encodeURIComponent(slug)}`;
    return cleanBase + query;
  }
}

function generateLinks() {
  const rawText = namesInput ? namesInput.value.trim() : '';
  if (!rawText) {
    showToast('Vui lòng nhập ít nhất một tên khách mời!');
    return;
  }

  const baseUrl = baseUrlInput ? baseUrlInput.value.trim() : '';
  const lang = langSelect ? langSelect.value : 'vi';
  const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  currentGeneratedLinks = [];
  if (linksTbody) linksTbody.innerHTML = '';

  lines.forEach((name, idx) => {
    const fullUrl = buildPersonalizedUrl(baseUrl, name, lang);
    currentGeneratedLinks.push({ name, url: fullUrl });

    const tr = document.createElement('tr');

    // STT
    const tdIdx = document.createElement('td');
    tdIdx.textContent = String(idx + 1);

    // Name
    const tdName = document.createElement('td');
    tdName.style.fontWeight = '500';
    tdName.textContent = name;

    // Link
    const tdLink = document.createElement('td');
    tdLink.className = 'link-cell';
    tdLink.textContent = fullUrl;

    // Action: Copy
    const tdAction = document.createElement('td');
    tdAction.style.textAlign = 'center';
    const copyBtn = document.createElement('button');
    copyBtn.className = 'btn btn-secondary';
    copyBtn.style.padding = '6px 12px';
    copyBtn.style.fontSize = '0.75rem';
    copyBtn.textContent = 'Copy';
    copyBtn.addEventListener('click', () => {
      copyToClipboard(fullUrl, `Đã sao chép link của ${name}!`);
    });
    tdAction.appendChild(copyBtn);

    // QR Code thumbnail
    const tdQr = document.createElement('td');
    tdQr.style.textAlign = 'center';
    const qrWrap = document.createElement('div');
    qrWrap.className = 'qr-thumb-wrap';
    qrWrap.title = 'Nhấn để phóng to mã QR';
    qrWrap.innerHTML = createQrSvg(fullUrl, 2);
    qrWrap.addEventListener('click', () => {
      openQrModal(name, fullUrl);
    });
    tdQr.appendChild(qrWrap);

    tr.appendChild(tdIdx);
    tr.appendChild(tdName);
    tr.appendChild(tdLink);
    tr.appendChild(tdAction);
    tr.appendChild(tdQr);

    if (linksTbody) linksTbody.appendChild(tr);
  });

  if (countSummary) countSummary.textContent = `Danh Sách Đã Tạo (${lines.length} người)`;
  if (resultsWrapper) resultsWrapper.style.display = 'block';
  showToast(`Đã tạo thành công ${lines.length} đường link!`);
}

function openQrModal(name, url) {
  currentModalLink = url;
  if (modalGuestName) modalGuestName.textContent = name;
  if (modalGuestLink) modalGuestLink.textContent = url;
  if (modalQrBox) modalQrBox.innerHTML = createQrSvg(url, 6);
  if (qrModal) qrModal.classList.add('show');
}

function closeQrModal() {
  if (qrModal) qrModal.classList.remove('show');
}

if (btnModalClose) btnModalClose.addEventListener('click', closeQrModal);
if (qrModal) {
  qrModal.addEventListener('click', (e) => {
    if (e.target === qrModal) closeQrModal();
  });
}

if (btnModalCopy) {
  btnModalCopy.addEventListener('click', () => {
    if (currentModalLink) {
      copyToClipboard(currentModalLink, 'Đã sao chép link!');
    }
  });
}

if (btnGenerate) btnGenerate.addEventListener('click', generateLinks);

if (btnSample) {
  btnSample.addEventListener('click', () => {
    if (namesInput) {
      namesInput.value = [
        'Thầy Nam',
        'Cô Lan',
        'Bạn Minh',
        'Gia đình anh Tuấn',
        'Em Linh',
        'Nhóm bạn thân'
      ].join('\n');
    }
    generateLinks();
  });
}

if (btnClear) {
  btnClear.addEventListener('click', () => {
    if (namesInput) namesInput.value = '';
    if (linksTbody) linksTbody.innerHTML = '';
    if (resultsWrapper) resultsWrapper.style.display = 'none';
    currentGeneratedLinks = [];
  });
}

if (btnCopyAll) {
  btnCopyAll.addEventListener('click', () => {
    if (currentGeneratedLinks.length === 0) return;
    const textBlock = currentGeneratedLinks.map(item => `${item.name}: ${item.url}`).join('\n');
    copyToClipboard(textBlock, `Đã sao chép toàn bộ ${currentGeneratedLinks.length} đường link!`);
  });
}
