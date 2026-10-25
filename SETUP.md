# Hướng Dẫn Kết Nối Google Sheets Nhận Danh Sách Khách Tham Dự (2 Phút)

Tài liệu này hướng dẫn cách kết nối form **Xác nhận tham dự** trên web thiệp mời với một file **Google Sheet (Google Trang tính)** trên tài khoản Google của bạn, để mỗi khi có bạn bè hoặc người thân xác nhận, dữ liệu sẽ tự động nhảy vào Sheet theo thời gian thực.

---

## 📋 Bạn sẽ xem được gì trong Google Sheet?
Bảng tính sẽ tự động cập nhật 4 cột rõ ràng:
1. **Thời gian gửi**: Ngày, giờ chính xác.
2. **Họ và tên khách mời**: Tên người xác nhận.
3. **Trạng thái tham dự**: `Sẽ đến tham dự 🎉` hoặc `Rất tiếc mình bận 💌` (bạn có thể bấm lọc xem nhanh ai đi, ai bận).
4. **Lời nhắn / Lời chúc gửi Bình**: Khách dặn dò hoặc chúc mừng tốt nghiệp.

---

## Bước 1: Tạo Google Sheet Mới

1. Mở trình duyệt và truy cập [sheets.new](https://sheets.new) (hoặc vào Google Drive tạo một bảng tính mới).
2. Đổi tên file thành: `Khách Mời Tốt Nghiệp 2026 - Phan Thanh Bình`.

---

## Bước 2: Dán Code Tự Động (Apps Script)

1. Trên thanh menu của Google Sheet, chọn **Tiện ích mở rộng (Extensions)** ➔ **Apps Script**.
2. Xóa sạch mọi chữ có sẵn trong khung code.
3. Mở file [backend/apps-script.gs](file:///home/portfolio/backend/apps-script.gs), **sao chép toàn bộ code** và dán vào đó.
4. Nhấn biểu tượng **Lưu (Save / Ctrl+S)**.

---

## Bước 3: Tạo Cột Tự Động

1. Ở thanh công cụ trên cùng của Apps Script, cạnh nút "Gỡ lỗi", chọn hàm **`initialSetup`**.
2. Bấm nút **Chạy (Run)**.
3. Khi Google hiện thông báo cấp quyền:
   - Nhấn **Xem lại quyền (Review Permissions)**.
   - Chọn tài khoản Google của bạn.
   - Bấm **Nâng cao (Advanced)** ➔ **Đi tới [Tên dự án] (không an toàn)**.
   - Bấm **Cho phép (Allow)**.
4. Quay lại Google Sheet, bạn sẽ thấy hàng tiêu đề màu vàng ánh kim đã được tạo sẵn đẹp mắt!

---

## Bước 4: Lấy Link Kết Nối (Triển khai Web App)

1. Ở góc trên bên phải màn hình Apps Script, bấm nút **Triển khai (Deploy)** màu xanh ➔ chọn **Tùy chọn triển khai mới (New deployment)**.
2. Bấm vào biểu tượng bánh răng ⚙️ cạnh chữ "Chọn loại" ➔ chọn **Ứng dụng web (Web app)**.
3. Cài đặt đúng 2 mục sau:
   - **Thực thi dưới dạng (Execute as):** `Tôi (tài khoản của bạn)`
   - **Ai có quyền truy cập (Who has access):** **Bất kỳ ai (Anyone)** *(Bắt buộc chọn Anyone để khách không cần đăng nhập Google vẫn gửi được)*.
4. Bấm **Triển khai (Deploy)**.
5. Sao chép dòng **URL ứng dụng web (Web app URL)** (có dạng `https://script.google.com/macros/s/AKfycb.../exec`).

---

## Bước 5: Dán URL vào Web Thiệp Mời

1. Mở file `js/config.js` trong thư mục dự án.
2. Dán link vừa copy vào dòng `appsScriptUrl`:
   ```javascript
   appsScriptUrl: "https://script.google.com/macros/s/AKfycb.../exec"
   ```
3. Lưu file, commit và push lên GitHub. 

Từ lúc này, mọi phản hồi từ khách sẽ bay thẳng vào Google Sheet trên điện thoại của bạn!
