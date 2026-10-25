/**
 * ============================================================================
 * GOOGLE APPS SCRIPT: QUẢN LÝ KHÁCH MỜI TỐT NGHIỆP - PHAN THANH BÌNH (2026)
 * ============================================================================
 * Tự động nhận phản hồi Xác nhận tham dự (RSVP) và Lời nhắn/Lời chúc từ web thiệp mời.
 * Dữ liệu lưu trực tiếp vào Google Trang tính (Google Sheets) của bạn theo thời gian thực.
 */

const SHEET_NAME = "Danh Sach Khach";
const MAX_NAME_LENGTH = 100;
const MAX_MESSAGE_LENGTH = 500;

/**
 * Khởi tạo tiêu đề cột trong Google Sheet (Chạy 1 lần khi cài đặt)
 */
function initialSetup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  
  // Tạo hàng tiêu đề rõ ràng
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "Thời gian gửi", 
      "Họ và tên khách mời", 
      "Trạng thái tham dự", 
      "Lời nhắn / Lời chúc gửi Bình",
      "Ghi chú hệ thống"
    ]);
    sheet.getRange(1, 1, 1, 5)
      .setFontWeight("bold")
      .setBackground("#A48A57")
      .setFontColor("#FFFFFF");
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 160);
    sheet.setColumnWidth(2, 200);
    sheet.setColumnWidth(3, 160);
    sheet.setColumnWidth(4, 350);
  }

  Logger.log("Đã khởi tạo bảng tính thành công!");
}

/**
 * Nhận dữ liệu POST từ web thiệp mời khi khách bấm gửi
 */
function doPost(e) {
  const lock = LockService.getScriptLock();

  try {
    // Chờ tối đa 10 giây nếu nhiều người gửi cùng lúc
    lock.waitLock(10000);

    if (!e || !e.postData || !e.postData.contents) {
      return createJsonResponse({ status: "error", message: "Không nhận được dữ liệu" });
    }

    let data;
    try {
      data = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      return createJsonResponse({ status: "error", message: "Sai định dạng dữ liệu" });
    }

    // Bẫy Honeypot chống bot spam (nếu trường ẩn website có giá trị thì bỏ qua)
    if (data.website && String(data.website).trim() !== "") {
      return createJsonResponse({ status: "success", message: "OK" });
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      initialSetup();
      sheet = ss.getSheetByName(SHEET_NAME);
    }

    const name = sanitize(data.name || "Khách mời", MAX_NAME_LENGTH);
    const attending = (data.attending === "yes" || data.attending === "có" || data.attending === true)
      ? "Sẽ đến tham dự 🎉" 
      : "Rất tiếc mình bận 💌";
    const message = sanitize(data.message || "", MAX_MESSAGE_LENGTH);
    const now = new Date();
    const timeFormatted = Utilities.formatDate(now, "Asia/Ho_Chi_Minh", "dd/MM/yyyy HH:mm:ss");

    // Thêm dòng mới vào Google Sheet
    sheet.appendRow([
      timeFormatted, 
      name, 
      attending, 
      message || "(Không có lời nhắn)",
      "Gửi từ Web"
    ]);

    return createJsonResponse({
      status: "success",
      message: "Đã ghi nhận phản hồi thành công"
    });

  } catch (err) {
    Logger.log("Lỗi: " + err.toString());
    return createJsonResponse({ status: "error", message: err.toString() });
  } finally {
    lock.releaseLock();
  }
}

/**
 * Kiểm tra trạng thái Web App
 */
function doGet(e) {
  return createJsonResponse({
    status: "ok",
    service: "Phan Thanh Binh - Graduation RSVP API",
    time: Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "dd/MM/yyyy HH:mm:ss")
  });
}

/**
 * Làm sạch chuỗi dữ liệu
 */
function sanitize(input, maxLength) {
  if (input === null || input === undefined) return "";
  let str = String(input).trim();
  if (maxLength && str.length > maxLength) {
    str = str.substring(0, maxLength);
  }
  return str;
}

/**
 * Trả về kết quả JSON chuẩn
 */
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
