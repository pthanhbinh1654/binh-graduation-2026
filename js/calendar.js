import { i18n } from './i18n.js';

export function initCalendar(config, getLang = () => 'vi') {
  const gcalBtn = document.getElementById('btn-gcal');

  function getEventData() {
    const lang = getLang();
    const t = i18n[lang].calendar;
    const v = config.venue;

    // ISO strings to UTC format YYYYMMDDTHHmmssZ
    const startUtc = new Date(config.ceremonyStart).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const endUtc = new Date(config.eventEnd).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

    const title = t.eventTitle;
    const details = `${t.eventTitle}\n${config.school[lang]} - ${config.university[lang]}\n${v.name[lang]}\n${v.note[lang]}\nHotline: ${config.contact.phone}`;
    const location = `${v.name[lang]}, ${v.address[lang]}`;

    return {
      title,
      details,
      location,
      startUtc,
      endUtc,
      lang
    };
  }

  function updateGcalLink() {
    if (!gcalBtn) return;
    const { title, details, location, startUtc, endUtc } = getEventData();

    const gcalUrl = new URL('https://calendar.google.com/calendar/render');
    gcalUrl.searchParams.set('action', 'TEMPLATE');
    gcalUrl.searchParams.set('text', title);
    gcalUrl.searchParams.set('dates', `${startUtc}/${endUtc}`);
    gcalUrl.searchParams.set('details', details);
    gcalUrl.searchParams.set('location', location);
    gcalUrl.searchParams.set('ctz', 'Asia/Ho_Chi_Minh');

    gcalBtn.setAttribute('href', gcalUrl.toString());
    gcalBtn.setAttribute('target', '_blank');
    gcalBtn.setAttribute('rel', 'noopener noreferrer');
  }

  if (gcalBtn) {
    updateGcalLink();
  }

  return updateGcalLink;
}