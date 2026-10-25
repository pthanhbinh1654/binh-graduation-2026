import { i18n } from './i18n.js';

export function initCalendar(config, getLang = () => 'vi') {
  const gcalBtn = document.getElementById('btn-gcal');
  const icsBtn = document.getElementById('btn-ics');

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

  function downloadIcs() {
    const { title, details, location, startUtc, endUtc } = getEventData();
    const nowUtc = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const cleanDetails = details.replace(/\n/g, '\\n');
    const cleanLocation = location.replace(/,/g, '\\,');

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Phan Thanh Binh//Graduation Invitation 2026//VI',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:graduation-binh-2026-${Date.now()}@binh-tn2026.pages.dev`,
      `DTSTAMP:${nowUtc}`,
      `DTSTART:${startUtc}`,
      `DTEND:${endUtc}`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${cleanDetails}`,
      `LOCATION:${cleanLocation}`,
      'STATUS:CONFIRMED',
      'BEGIN:VALARM',
      'TRIGGER:-P1D',
      'ACTION:DISPLAY',
      'DESCRIPTION:Reminder: Graduation Ceremony tomorrow',
      'END:VALARM',
      'BEGIN:VALARM',
      'TRIGGER:-PT2H',
      'ACTION:DISPLAY',
      'DESCRIPTION:Reminder: Graduation Ceremony starts in 2 hours',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const tempLink = document.createElement('a');
    tempLink.href = url;
    tempLink.setAttribute('download', 'Le-Tot-Nghiep-Phan-Thanh-Binh-2026.ics');
    document.body.appendChild(tempLink);
    tempLink.click();
    document.body.removeChild(tempLink);
    URL.revokeObjectURL(url);
  }

  if (gcalBtn) {
    updateGcalLink();
  }

  if (icsBtn) {
    icsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      downloadIcs();
    });
  }

  return updateGcalLink;
}
