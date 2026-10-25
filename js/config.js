export const config = {
  siteUrl: (typeof window !== 'undefined' && window.location.origin) 
    ? (window.location.origin + '/') 
    : "https://binhtn2026.pthanhbinh1654.workers.dev/",
  owner: "Phan Thanh Bình",
  degree: { vi: "Kỹ sư An toàn thông tin", en: "Engineer of Information Security" },
  school: { vi: "Trường Công nghệ Thông tin và Truyền thông", en: "School of Information and Communication Technology" },
  university: { vi: "Đại học Cần Thơ", en: "Can Tho University" },
  ceremonyStart: "2026-10-31T13:30:00+07:00",
  eventEnd: "2026-10-31T17:30:00+07:00",
  rsvpDeadline: "2026-10-31T12:00:00+07:00",
  timeline: [
    { time: "13:30", vi: "Lễ trao bằng chính thức (diễn ra bên trong Hội trường Rùa)", en: "Official graduation ceremony (inside Turtle Hall)" },
    { time: "16:00", vi: "⭐ Khung giờ vàng: Gặp gỡ & Chụp ảnh kỷ niệm cùng bạn bè, người thân", en: "⭐ Golden hour: Meetup & commemorative photos with friends & family" }
  ],
  venue: {
    name: { vi: "Hội trường Rùa, Đại học Cần Thơ", en: "Turtle Hall, Can Tho University" },
    note: { vi: "📸 Điểm chụp ảnh: hàng hoa sứ bên phải Hội trường Rùa (nhìn từ ngoài vào)", en: "📸 Photo spot: frangipani trees to the right of Turtle Hall (facing entrance)" },
    mapsUrl: "https://maps.app.goo.gl/4Gg1j6V9ZP4A7pup9",
    lat: 10.02924,
    lng: 105.76941,
    address: { vi: "Hội trường Rùa, Đại học Cần Thơ, Đường 3 Tháng 2, Xuân Khánh, Ninh Kiều, Cần Thơ", en: "Turtle Hall, Can Tho University, 3 Thang 2 Street, Xuan Khanh, Ninh Kieu, Can Tho" }
  },
  contact: {
    phone: "0327397756",
    zalo: "https://zalo.me/0327397756",
    facebook: "https://www.facebook.com/binh.thanh.613766/"
  },
  music: { 
    src: "assets/audio/thanh-xuan.mp3",
    youtubeId: "puVRQK77sEc" 
  },
  flags: {
    showPortrait: false,
    showParking: false
  },
  appsScriptUrl: "https://script.google.com/macros/s/AKfycbyywVGqKmpDJmhCvNMRqiITgMatleaYi34fS9CuZHyQdC9PBkAIl_ms2_JQB5QcF68d/exec"
};
