/**
 * ============================================================================
 * GOOGLE APPS SCRIPT BACKEND: LỄ TỐT NGHIỆP - PHAN THANH BÌNH (2026)
 * ============================================================================
 * Handles RSVP confirmations and Guestbook submissions.
 * Stores data directly into Google Sheets.
 */

const RSVP_SHEET = "RSVP";
const GUESTBOOK_SHEET = "Luu But";

const MAX_NAME_LENGTH = 100;
const MAX_RSVP_MESSAGE_LENGTH = 500;
const MAX_GUESTBOOK_LENGTH = 300;

/**
 * Setup helper: Run this once from the Apps Script editor to initialize sheets with headers.
 */
function initialSetup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Setup RSVP Sheet
  let rsvpSheet = ss.getSheetByName(RSVP_SHEET);
  if (!rsvpSheet) {
    rsvpSheet = ss.insertSheet(RSVP_SHEET);
  }
  if (rsvpSheet.getLastRow() === 0) {
    rsvpSheet.appendRow(["Thời gian", "Họ và tên", "Tham dự?", "Lời nhắn", "Nguồn / Ghi chú"]);
    rsvpSheet.getRange(1, 1, 1, 5).setFontWeight("bold").setBackground("#c9a84c").setFontColor("#0a0f1e");
  }

  // 2. Setup Guestbook (Luu But) Sheet
  let gbSheet = ss.getSheetByName(GUESTBOOK_SHEET);
  if (!gbSheet) {
    gbSheet = ss.insertSheet(GUESTBOOK_SHEET);
  }
  if (gbSheet.getLastRow() === 0) {
    gbSheet.appendRow(["Thời gian", "Tên khách", "Lời chúc", "Trạng thái"]);
    gbSheet.getRange(1, 1, 1, 4).setFontWeight("bold").setBackground("#c9a84c").setFontColor("#0a0f1e");
  }

  Logger.log("Khoi tao cac Sheet hoan tat!");
}

/**
 * Handle POST requests (RSVP submissions & Guestbook entries)
 */
function doPost(e) {
  const lock = LockService.getScriptLock();

  try {
    // Wait for up to 10 seconds for concurrent write operations
    lock.waitLock(10000);

    if (!e || !e.postData || !e.postData.contents) {
      return createJsonResponse({ status: "error", message: "No data received" });
    }

    let data;
    try {
      data = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      return createJsonResponse({ status: "error", message: "Invalid JSON format" });
    }

    // Honeypot check: If the website field is filled, silently discard spam
    if (data.website && String(data.website).trim() !== "") {
      return createJsonResponse({ status: "success", message: "OK" });
    }

    const action = data.action || (data.attending ? "rsvp" : "guestbook");
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // ------------------------------------------------------------------------
    // Action: RSVP
    // ------------------------------------------------------------------------
    if (action === "rsvp") {
      let sheet = ss.getSheetByName(RSVP_SHEET);
      if (!sheet) {
        initialSetup();
        sheet = ss.getSheetByName(RSVP_SHEET);
      }

      const name = sanitize(data.name || "Khách", MAX_NAME_LENGTH);
      const attending = data.attending === "yes" || data.attending === "có" || data.attending === true ? "Có tham dự 🎉" : "Không thể tham dự 💌";
      const message = sanitize(data.message || "", MAX_RSVP_MESSAGE_LENGTH);
      const timestamp = new Date();

      sheet.appendRow([timestamp, name, attending, message, data.timestamp || ""]);

      return createJsonResponse({
        status: "success",
        message: "RSVP recorded successfully"
      });
    }

    // ------------------------------------------------------------------------
    // Action: Guestbook (Lưu bút)
    // ------------------------------------------------------------------------
    if (action === "guestbook") {
      let sheet = ss.getSheetByName(GUESTBOOK_SHEET);
      if (!sheet) {
        initialSetup();
        sheet = ss.getSheetByName(GUESTBOOK_SHEET);
      }

      const name = sanitize(data.name || "Ẩn danh", MAX_NAME_LENGTH);
      const message = sanitize(data.message || "", MAX_GUESTBOOK_LENGTH);
      const timestamp = new Date();

      if (!message) {
        return createJsonResponse({ status: "error", message: "Message cannot be empty" });
      }

      sheet.appendRow([timestamp, name, message, "APPROVED"]);

      return createJsonResponse({
        status: "success",
        message: "Guestbook message recorded",
        entry: {
          name: name,
          message: message,
          timestamp: timestamp.toISOString()
        }
      });
    }

    return createJsonResponse({ status: "error", message: "Unknown action" });

  } catch (err) {
    Logger.log("Error in doPost: " + err.toString());
    return createJsonResponse({ status: "error", message: err.toString() });
  } finally {
    lock.releaseLock();
  }
}

/**
 * Handle GET requests (Fetch approved guestbook messages)
 */
function doGet(e) {
  try {
    const action = e && e.parameter ? e.parameter.action : "";

    if (action === "guestbook") {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const sheet = ss.getSheetByName(GUESTBOOK_SHEET);

      if (!sheet) {
        return createJsonResponse({ entries: [] });
      }

      const lastRow = sheet.getLastRow();
      if (lastRow <= 1) {
        return createJsonResponse({ entries: [] });
      }

      // Read columns: Timestamp, Name, Message, Status
      const data = sheet.getRange(2, 1, lastRow - 1, 4).getValues();
      const entries = [];

      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const status = String(row[3]).trim().toUpperCase();

        // Include all entries unless marked SPAM or REJECTED
        if (status !== "REJECTED" && status !== "SPAM") {
          let timeIso = "";
          try {
            timeIso = new Date(row[0]).toISOString();
          } catch (_) {
            timeIso = new Date().toISOString();
          }

          entries.push({
            id: i + 1,
            name: String(row[1] || "Bạn của Bình"),
            message: String(row[2] || ""),
            timestamp: timeIso
          });
        }
      }

      // Sort newest first
      entries.reverse();

      return createJsonResponse({ entries: entries });
    }

    return createJsonResponse({
      status: "ok",
      service: "Graduation Invitation API - Phan Thanh Binh 2026",
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    Logger.log("Error in doGet: " + err.toString());
    return createJsonResponse({ status: "error", message: err.toString() });
  }
}

/**
 * Helper to clean and sanitize input
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
 * Helper to return JSON with proper MIME type
 */
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
