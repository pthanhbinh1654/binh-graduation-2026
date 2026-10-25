# Hướng Dẫn Cấu Hình Google Apps Script (RSVP & Sổ Lưu Bút)

Tài liệu này hướng dẫn chi tiết từng bước kết nối biểu mẫu **Xác nhận tham dự (RSVP)** và **Sổ lưu bút (Guestbook)** trên trang web thiệp mời với một file Google Sheet để bạn dễ dàng quản lý danh sách khách và lời chúc.

---

## Bước 1: Tạo Google Sheet Mới

1. Mở trình duyệt và truy cập [Google Sheets](https://sheets.new).
2. Đổi tên file bảng tính thành: `Tot Nghiep 2026 - Phan Thanh Binh`.
3. Bạn có thể để Apps Script tự tạo 2 sheet khi chạy hàm khởi tạo, hoặc tự tạo thủ công 2 sheet (tab) ở thanh phía dưới:
   - **Tab 1:** Đổi tên thành `RSVP`
   - **Tab 2:** Tạo thêm một tab mới và đổi tên thành `Luu But`

> [!TIP]
> Tên 2 sheet phải ghi chính xác: `RSVP` và `Luu But` (không dấu, cách đúng chữ hoa chữ thường).

---

## Bước 2: Dán Code Google Apps Script

1. Trên menu trên cùng của Google Sheet, chọn **Tiện ích mở rộng (Extensions)** > **Apps Script**.
2. Một cửa sổ soạn thảo code sẽ mở ra. Xóa sạch mọi code mẫu mặc định trong file `Code.gs`.
3. Mở file [backend/apps-script.gs](file:///home/portfolio/backend/apps-script.gs) trong dự án này, copy toàn bộ nội dung và dán vào cửa sổ soạn thảo của Apps Script.
4. Đổi tên dự án Apps Script (góc trên bên trái) thành `Graduation-Backend`.
5. Nhấn biểu tượng **Lưu (Save / Ctrl+S)**.

---

## Bước 3: Khởi Tạo Cột Tự Động (Tùy chọn)

1. Ở thanh công cụ trên cùng của Apps Script, cạnh nút "Gỡ lỗi", bạn sẽ thấy menu chọn hàm (dropdown).
2. Chọn hàm `initialSetup` và nhấn nút **Chạy (Run)**.
3. Google sẽ hiển thị thông báo yêu cầu cấp quyền truy cập bảng tính:
   - Nhấn **Xem lại quyền (Review Permissions)**.
   - Chọn tài khoản Google của bạn.
   - Nhấn **Nâng cao (Advanced)** > **Đi tới Graduation-Backend (Không an toàn) / Go to project (unsafe)**.
   - Nhấn **Cho phép (Allow)**.
4. Quay lại Google Sheet, bạn sẽ thấy 2 sheet `RSVP` và `Luu But` đã được tạo đầy đủ tiêu đề cột với màu vàng ánh kim đồng bộ.

---

## Bước 4: Triển Khai Web App (Deploy as Web App)

Đây là bước quan trọng nhất để website của bạn gửi được dữ liệu về Sheet:

1. Ở góc trên bên phải màn hình Apps Script, nhấn nút **Triển khai (Deploy)** màu xanh > chọn **Tùy chọn triển khai mới (New deployment)**.
2. Nhấp vào biểu tượng bánh răng **Chọn loại (Select type)** > chọn **Ứng dụng web (Web app)**.
3. Điền cấu hình như sau:
   - **Mô tả (Description):** `v1.0 - Production`
   - **Thực thi dưới dạng (Execute as):** `Tôi (me@gmail.com)` *(chính tài khoản của bạn)*
   - **Ai có quyền truy cập (Who has access):** **Bất kỳ ai (Anyone)**
     *(Rất quan trọng: Phải chọn "Anyone" để bạn bè không cần đăng nhập Google vẫn gửi được RSVP và lời chúc!)*
4. Nhấn nút **Triển khai (Deploy)**.
5. Google sẽ cấp cho bạn một đường link gọi là **URL ứng dụng web (Web app URL)**, có dạng:
   ```
   https://script.google.com/macros/s/AKfycbx.../exec
   ```
6. Nhấn nút **Sao chép (Copy)** URL này.

---

## Bước 5: Cập Nhật URL Vào Website

1. Mở file [js/config.js](file:///home/portfolio/js/config.js) trong dự án.
2. Tìm đến dòng `appsScriptUrl` và dán URL bạn vừa sao chép vào:
   ```javascript
   export const config = {
     // ...
     appsScriptUrl: "https://script.google.com/macros/s/AKfycbx.../exec"
   };
   ```
3. Lưu file lại.

---

## Bước 6: Kiểm Tra Thử (Test)

1. Mở trang web thiệp mời trên trình duyệt.
2. Thử điền form **Xác nhận tham dự (RSVP)** với tên của bạn và nhấn gửi.
   - Kiểm tra tab `RSVP` trong Google Sheet xem dòng dữ liệu mới đã xuất hiện chưa.
3. Thử viết một lời chúc ở mục **Sổ lưu bút (Guestbook)** và nhấn gửi.
   - Kiểm tra tab `Luu But` xem lời chúc đã lưu và hiển thị trực tiếp lên web chưa.

---

## Bước 7: Quản Lý & Duyệt Lời Chúc (Nếu có spam)

Trong sheet `Luu But`, cột D là `Trạng thái`:
- Mặc định là `APPROVED`.
- Nếu có ai viết lời chúc spam hoặc không phù hợp, bạn chỉ cần gõ vào cột D dòng đó chữ `REJECTED` hoặc xóa dòng đó đi, lời chúc sẽ tự động không hiển thị lên trang web nữa.

---

## Bước 8: Đẩy Lên GitHub & Cloudflare Pages

Sau khi cấu hình xong, hãy commit và đẩy code lên GitHub để Cloudflare Pages tự động cập nhật:
```bash
git add js/config.js
git commit -m "feat: configure Google Apps Script backend URL"
git push origin main
```
