# Graduation Invitation 2026 - Phan Thanh Bình

Trang web thiệp mời Lễ Tốt Nghiệp tĩnh (Static Website) dành riêng cho **Phan Thanh Bình**, Kỹ sư An toàn thông tin - Đại học Cần Thơ.

- **Production URL:** [https://binh-tn2026.pages.dev/](https://binh-tn2026.pages.dev/)
- **Kiến trúc:** Pure HTML5, CSS3 Tokens, Vanilla JavaScript (ES Modules). Không phụ thuộc framework (Zero build step, Zero bundle overhead).
- **Responsive:** Thiết kế Mobile-first, hiển thị tối ưu từ 320px đến 1920px.
- **Phong cách:** Sang trọng, tối giản với bảng màu Deep Navy (`#0a0f1e`) kết hợp Champagne Gold (`#c9a84c`).

---

## 📂 Cấu Trúc Thư Mục Dự Án

```
/home/portfolio/
├── index.html                 # Trang thiệp mời chính (semantic HTML5, đầy đủ schema OG/Twitter)
├── 404.html                   # Trang báo lỗi 404 phong cách đồng bộ
├── _headers                   # Cấu hình bảo mật Cloudflare Pages (CSP, Cache-Control, HSTS)
├── README.md                  # Hướng dẫn triển khai và quản trị website
├── SETUP.md                   # Hướng dẫn chi tiết triển khai Google Apps Script backend
├── css/
│   ├── tokens.css             # Hệ thống biến CSS Design Tokens (màu sắc, typography, spacing)
│   ├── base.css               # CSS Reset, Typography, Custom Scrollbar, Skip-links
│   └── components.css         # Phong bì 3D, Hero aurora, Glass cards, Timeline, Forms...
├── js/
│   ├── config.js              # File cấu hình trung tâm (Thông tin lễ, địa điểm, liên hệ)
│   ├── i18n.js                # Toàn bộ nội dung song ngữ Việt - Anh (VI / EN)
│   ├── main.js                # Bộ điều phối chính, giải mã URL ?khach, lazy-load & animations
│   ├── countdown.js           # Bộ đếm ngược xử lý múi giờ chuẩn ISO 8601 (+07:00)
│   ├── calendar.js            # Tạo link Google Calendar & file .ics (Apple/Outlook)
│   ├── weather.js             # Kết nối Open-Meteo API lấy dự báo thời tiết Cần Thơ
│   ├── rsvp.js                # Biểu mẫu xác nhận tham dự (Anti-spam honeypot + Apps Script)
│   ├── guestbook.js           # Sổ lưu bút trực tuyến với phân trang và chống XSS
│   ├── music.js               # Nút phát nhạc nền YouTube nổi góc màn hình (tự động loop)
│   └── share.js               # Web Share API, tạo mã QR bằng qrcode.min.js & Facebook share
├── assets/
│   └── img/
│       └── og-cover.jpg       # Ảnh xem trước Open Graph 1200x630 khi chia sẻ Facebook/Zalo
├── vendor/
│   └── qrcode.min.js          # Thư viện tạo mã QR độc lập (offline/self-hosted)
├── tools/
│   └── link-generator.html    # Công cụ tạo link mời cá nhân hóa & mã QR hàng loạt cho khách
└── backend/
    └── apps-script.gs         # Mã nguồn Google Apps Script lưu RSVP và sổ lưu bút vào Google Sheet
```

---

## 🚀 Hướng Dẫn Triển Khai Lên Cloudflare Pages

### Cách 1: Kết Nối Thông Qua GitHub (Khuyên dùng)

1. **Đẩy mã nguồn lên GitHub:**
   ```bash
   cd /home/portfolio
   git remote add origin https://github.com/<your-username>/binh-graduation-2026.git
   git branch -M main
   git push -u origin main
   ```
2. **Cấu hình trên Cloudflare Dashboard:**
   - Đăng nhập vào [Cloudflare Dashboard](https://dash.cloudflare.com/) > chọn **Workers & Pages**.
   - Nhấn **Create application** > chọn tab **Pages** > **Connect to Git**.
   - Chọn kho lưu trữ `binh-graduation-2026`.
   - Trong phần cài đặt:
     - **Project name:** `binh-tn2026`
     - **Production branch:** `main`
     - **Framework preset:** `None`
     - **Build command:** *(để trống)*
     - **Build output directory:** `/` *(hoặc để trống/thư mục gốc)*
   - Nhấn **Save and Deploy**. Website của bạn sẽ hoạt động ngay lập tức tại `https://binh-tn2026.pages.dev/`.

### Cách 2: Triển Khai Trực Tiếp Bằng Wrangler CLI (Không cần GitHub)

```bash
# Đăng nhập Cloudflare
npx wrangler login

# Triển khai trực tiếp thư mục hiện tại
npx wrangler pages deploy . --project-name=binh-tn2026
```

---

## 🌐 Cấu Hình Tên Miền Riêng (Custom Domain)

Nếu bạn có tên miền riêng (ví dụ: `binh2026.com` hoặc `totnghiep.phanthanhbinh.dev`):
1. Vào Cloudflare Dashboard > **Workers & Pages** > chọn dự án `binh-tn2026`.
2. Chọn tab **Custom domains** > nhấn **Set up a custom domain**.
3. Nhập tên miền hoặc subdomain của bạn và làm theo hướng dẫn trỏ DNS của Cloudflare.

---

## 🛠️ Hướng Dẫn Tùy Biến Nội Dung

### 1. Thay đổi thông tin cá nhân hoặc thời gian
Mọi thông tin cốt lõi đều được tập trung trong file [js/config.js](file:///home/portfolio/js/config.js):
- **Thời gian diễn ra:** `ceremonyStart`, `eventEnd`, `rsvpDeadline`.
- **Lịch trình buổi lễ:** `timeline` (có thể thêm bớt mốc giờ).
- **Địa điểm & Tọa độ:** `venue.name`, `venue.address`, `venue.note`.
- **Thông tin liên lạc:** Số điện thoại, link Zalo, Facebook.
- **Nhạc nền:** Đổi `music.youtubeId` thành ID video YouTube bạn muốn (ví dụ video `https://www.youtube.com/watch?v=puVRQK77sEc` thì ID là `puVRQK77sEc`).

### 2. Kích hoạt ảnh chân dung cá nhân (Portrait)
Mặc định trang web hiển thị monogram chữ ký vàng `PTB`. Khi bạn có ảnh chân dung tốt nghiệp:
1. Đặt file ảnh chất lượng cao vào `assets/img/portrait.webp` (hoặc `.jpg`).
2. Mở file [js/config.js](file:///home/portfolio/js/config.js) và đổi:
   ```javascript
   flags: {
     showPortrait: true,
     showParking: false
   }
   ```
3. Lưu và commit lên GitHub.

### 3. Tạo link mời cá nhân hóa cho từng khách mời
Bạn có thể gửi thiệp có kèm tên riêng cho từng thầy cô, bạn bè (ví dụ khi mở link sẽ hiện: *"Kính mời Thầy Nam,"*):
- Mở công cụ tạo link có sẵn tại: `https://binh-tn2026.pages.dev/tools/link-generator.html` (hoặc mở file [tools/link-generator.html](file:///home/portfolio/tools/link-generator.html) trên máy).
- Dán danh sách tên bạn bè (mỗi người 1 dòng).
- Bấm **Tạo Danh Sách Link** để nhận toàn bộ link riêng và mã QR để gửi kèm qua Messenger hoặc Zalo.

---

## 🔄 Hướng Dẫn Làm Mới Bộ Nhớ Đệm Ảnh Khi Chia Sẻ (OG Image Cache)

Khi chia sẻ link lên Facebook hoặc Zalo, nếu hình ảnh đại diện (ảnh bìa thiệp mời) chưa hiện hoặc bị lưu phiên bản cũ:

1. **Facebook Sharing Debugger:**
   - Truy cập: [https://developers.facebook.com/tools/debug/](https://developers.facebook.com/tools/debug/)
   - Nhập link `https://binh-tn2026.pages.dev/` và nhấn **Debug**.
   - Nhấn nút **Scrape Again (Thu thập lại dữ liệu)** 1 - 2 lần cho đến khi hình ảnh bìa và tiêu đề hiển thị chính xác.
2. **Zalo:**
   - Zalo thường cập nhật bộ nhớ cache sau vài phút. Nếu cần làm mới tức thì, bạn có thể gửi link kèm một tham số ngẫu nhiên phía sau (ví dụ: `https://binh-tn2026.pages.dev/?v=2`).

---

## 📋 Danh Sách Các Mục Cần Lưu Ý & Hoàn Thiện (TODOs)

- [ ] **Xác thực tọa độ chính xác của Hội trường Rùa:**
  - Tọa độ hiện tại đang đặt xấp xỉ trong `js/config.js` là `lat: 10.0300, lng: 105.7684`. Khi đến trường, bạn có thể bật Google Maps lấy tọa độ chính xác của cửa đón khách để ghim vị trí chuẩn 100%.
- [ ] **Triển khai Google Apps Script:**
  - Làm theo từng bước trong file [SETUP.md](file:///home/portfolio/SETUP.md) để lấy URL Web App dán vào `appsScriptUrl` trong `js/config.js`.
- [ ] **Thay ảnh bìa OG chính thức:**
  - Cập nhật ảnh `assets/img/og-cover.jpg` (kích thước chuẩn 1200x630px) chụp cùng trang phục tốt nghiệp để khi chia sẻ lên mạng xã hội đẹp mắt và ấn tượng nhất.
- [ ] **Cập nhật ảnh chân dung:**
  - Thêm ảnh `assets/img/portrait.webp` và bật cờ `showPortrait: true`.
