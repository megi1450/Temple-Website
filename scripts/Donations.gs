/**
 * Web app endpoint that mirrors donation submissions into the temple donations sheet.
 * Deploy this script as a Web App, execute as the spreadsheet owner, and set access
 * to "Anyone". The website's public URL does not contain spreadsheet credentials.
 */
const DONATIONS_SPREADSHEET_ID = '1QTmLXMIjXSDtmUDwM0-S9ZL88C-_ny2aY1lww2VZmcI';
const DONATIONS_SHEET_NAME = 'Sheet1';

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    const payload = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const serialNumber = String(payload.serialNumber || '').trim();
    const name = String(payload.name || '').trim();
    const flatNumber = String(payload.flatNumber || '').trim().toUpperCase();
    const mobileNumber = String(payload.mobileNumber || '').trim();
    const donationType = String(payload.donationType || '').trim();
    const utrNumber = String(payload.utrNumber || '').trim();
    const date = String(payload.date || '').trim();

    if (!/^\d{3,}$/.test(serialNumber) ||
        !name || name.length > 100 ||
        !/^([A-F])?(00[1-4]|0?[1-9]0[1-4]|1[0-9]0[1-4])$/.test(flatNumber) ||
        !/^[6-9]\d{9}$/.test(mobileNumber) ||
        donationType !== 'Donate for Temple Daily Activities' ||
        !/^\d{12}$/.test(utrNumber) ||
        !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return jsonResponse({ ok: false, message: 'Invalid donation data.' });
    }

    lock.waitLock(10000);
    try {
      const spreadsheet = SpreadsheetApp.openById(DONATIONS_SPREADSHEET_ID);
      const sheet = spreadsheet.getSheetByName(DONATIONS_SHEET_NAME);
      if (!sheet) return jsonResponse({ ok: false, message: 'Donation sheet tab not found.' });

      const lastRow = sheet.getLastRow();
      if (lastRow >= 2) {
        const existingReferences = sheet.getRange(2, 6, lastRow - 1, 1).getDisplayValues();
        for (let i = 0; i < existingReferences.length; i++) {
          if (String(existingReferences[i][0]).trim() === utrNumber) {
            return jsonResponse({ ok: false, message: 'This UPI reference is already present.' });
          }
        }
      }

      sheet.appendRow([
        serialNumber,
        safeCell(name),
        safeCell(flatNumber),
        safeCell(mobileNumber),
        safeCell(donationType),
        utrNumber,
        date
      ]);
      return jsonResponse({ ok: true, message: 'Donation row appended.' });
    } finally {
      lock.releaseLock();
    }
  } catch (error) {
    return jsonResponse({ ok: false, message: String(error && error.message || error) });
  }
}

function safeCell(value) {
  const text = String(value == null ? '' : value);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function jsonResponse(value) {
  return ContentService
    .createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}
