/**
 * Donation sheet synchronizer for Shri Varasiddhi Vinayaka Temple.
 *
 * Deploy as a Web App (execute as the spreadsheet owner; access: Anyone).
 * Set Script Property DONATIONS_ADMIN_KEY in Project Settings. Public "submit"
 * requests can only append a new pending UPI reference. "sync", "verify", and
 * "delete" require the admin key and are used by the admin verification page.
 */
const DONATIONS_SPREADSHEET_ID = '1QTmLXMIjXSDtmUDwM0-S9ZL88C-_ny2aY1lww2VZmcI';
const DONATIONS_SHEET_NAME = 'Sheet1';
const DONATIONS_HEADERS = [
  'Serial Number', 'Name', 'Amount', 'Flat Number', 'Mobile', 'Donation Type',
  'UTR Number', 'Date', 'Verification Status', 'Verified At', 'Admin Notes'
];

function doGet() {
  return ContentService.createTextOutput('Shri Varasiddhi Vinayaka Temple donation sheet endpoint is active.');
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    const payload = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const action = String(payload.action || 'submit').trim().toLowerCase();
    if (!['submit', 'sync', 'verify', 'delete'].includes(action)) {
      return jsonResponse({ ok: false, message: 'Unsupported action.' });
    }
    if (['sync', 'verify', 'delete'].includes(action) && !isAuthorizedAdmin_(payload.adminKey)) {
      return jsonResponse({ ok: false, message: 'Admin key is missing or invalid.' });
    }

    lock.waitLock(10000);
    try {
      const spreadsheet = SpreadsheetApp.openById(DONATIONS_SPREADSHEET_ID);
      const sheet = spreadsheet.getSheetByName(DONATIONS_SHEET_NAME);
      if (!sheet) return jsonResponse({ ok: false, message: 'Donation sheet tab not found.' });
      ensureDonationHeaders_(sheet);

      const utrNumber = String(payload.utrNumber || '').trim();
      const serialNumber = String(payload.serialNumber || '').trim();
      const rowNumber = findDonationRow_(sheet, utrNumber, serialNumber);

      if (action === 'delete') {
        if (rowNumber > 1) sheet.deleteRow(rowNumber);
        return jsonResponse({ ok: true, message: rowNumber > 1 ? 'Donation row deleted.' : 'Donation row already absent.' });
      }

      if (action === 'verify') {
        if (rowNumber > 1) {
          const current = sheet.getRange(rowNumber, 1, 1, DONATIONS_HEADERS.length).getValues()[0];
          if (payload.amount != null && payload.amount !== '') current[2] = Number(payload.amount);
          current[8] = 'Verified';
          current[9] = String(payload.verifiedAt || new Date().toISOString());
          current[10] = safeCell(payload.adminNotes || current[10] || '');
          sheet.getRange(rowNumber, 1, 1, DONATIONS_HEADERS.length).setValues([current]);
          return jsonResponse({ ok: true, message: 'Donation marked Verified.' });
        }
        writeDonationRow_(sheet, payload, 'Verified', String(payload.verifiedAt || new Date().toISOString()));
        return jsonResponse({ ok: true, message: 'Missing donation row recreated as Verified.' });
      }

      if (action === 'sync') {
        writeDonationRow_(sheet, payload, String(payload.verificationStatus || 'Pending manual verification'), String(payload.verifiedAt || ''));
        return jsonResponse({ ok: true, message: 'Donation row synchronized.' });
      }

      // Public submit: validate and reject duplicate UTRs rather than overwriting existing rows.
      validateDonation_(payload, true);
      if (rowNumber > 1) {
        return jsonResponse({ ok: false, message: 'This UPI reference is already present.' });
      }
      writeDonationRow_(sheet, payload, 'Pending manual verification', '');
      return jsonResponse({ ok: true, message: 'Donation row appended.' });
    } finally {
      lock.releaseLock();
    }
  } catch (error) {
    return jsonResponse({ ok: false, message: String(error && error.message || error) });
  }
}

function isAuthorizedAdmin_(providedKey) {
  const expected = PropertiesService.getScriptProperties().getProperty('DONATIONS_ADMIN_KEY');
  return !!expected && !!providedKey && String(providedKey) === expected;
}

function ensureDonationHeaders_(sheet) {
  const oldHeaders = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getDisplayValues()[0]
    .map(value => String(value || '').trim().toLowerCase());
  // One-time migration: insert Amount at column C without shifting or overwriting existing data.
  if (oldHeaders[0] === 'serial number' && oldHeaders[1] === 'name' && oldHeaders[2] === 'flat number' && !oldHeaders.includes('amount')) {
    sheet.insertColumnAfter(2);
  }
  sheet.getRange(1, 1, 1, DONATIONS_HEADERS.length).setValues([DONATIONS_HEADERS]);
  sheet.setFrozenRows(1);
}

function validateDonation_(payload, requireAmount = false) {
  const amountText = String(payload.amount == null ? '' : payload.amount).trim();
  const amount = Number(amountText);
  const invalidAmount = amountText ? (!Number.isFinite(amount) || amount <= 0 || Math.abs(amount * 100 - Math.round(amount * 100)) > 0.00001) : requireAmount;
  const serialNumber = String(payload.serialNumber || '').trim();
  const name = String(payload.name || '').trim();
  const flatNumber = String(payload.flatNumber || '').trim().toUpperCase();
  const mobileNumber = String(payload.mobileNumber || '').trim();
  const donationType = String(payload.donationType || '').trim();
  const utrNumber = String(payload.utrNumber || '').trim();
  const date = String(payload.date || '').trim();

  if (!/^\d{3,}$/.test(serialNumber) ||
      !name || name.length > 100 ||
      invalidAmount ||
      !/^([A-F])?(00[1-4]|0?[1-9]0[1-4]|1[0-9]0[1-4])$/.test(flatNumber) ||
      !/^[6-9]\d{9}$/.test(mobileNumber) ||
      donationType !== 'Donate for Temple Daily Activities' ||
      !/^\d{12}$/.test(utrNumber) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error('Invalid donation data.');
  }
}

function writeDonationRow_(sheet, payload, statusOverride, verifiedAtOverride) {
  validateDonation_(payload);
  const utrNumber = String(payload.utrNumber).trim();
  const serialNumber = String(payload.serialNumber).trim();
  const rowNumber = findDonationRow_(sheet, utrNumber, serialNumber);
  const current = rowNumber > 1
    ? sheet.getRange(rowNumber, 1, 1, DONATIONS_HEADERS.length).getValues()[0]
    : [];
  const existingStatus = String(current[8] || '').trim();
  const incomingStatus = String(statusOverride || payload.verificationStatus || 'Pending manual verification');
  const status = existingStatus.toLowerCase() === 'verified' && incomingStatus.toLowerCase() !== 'verified'
    ? existingStatus
    : incomingStatus;
  const verifiedAt = verifiedAtOverride || current[9] || '';
  const notes = payload.adminNotes || current[10] || '';
  const amountValue = payload.amount != null && String(payload.amount).trim() !== ''
    ? Number(payload.amount)
    : (current[2] !== '' && Number(current[2]) > 0 ? Number(current[2]) : '');
  if (payload.amount != null && String(payload.amount).trim() !== '' && (!Number.isFinite(amountValue) || amountValue <= 0 || Math.abs(amountValue * 100 - Math.round(amountValue * 100)) > 0.00001)) {
    throw new Error('Donation amount must be a positive number with up to two decimal places.');
  }
  const values = [
    serialNumber,
    safeCell(payload.name),
    amountValue,
    safeCell(String(payload.flatNumber).trim().toUpperCase()),
    safeCell(payload.mobileNumber),
    safeCell(payload.donationType),
    utrNumber,
    String(payload.date),
    status,
    verifiedAt,
    safeCell(notes)
  ];
  let targetRow = rowNumber;
  if (rowNumber > 1) sheet.getRange(rowNumber, 1, 1, DONATIONS_HEADERS.length).setValues([values]);
  else { sheet.appendRow(values); targetRow = sheet.getLastRow(); }
  sheet.getRange(targetRow, 3).setNumberFormat('\"₹\"#,##0.00');
}

function findDonationRow_(sheet, utrNumber, serialNumber) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return 0;
  const values = sheet.getRange(2, 1, lastRow - 1, DONATIONS_HEADERS.length).getDisplayValues();
  for (let i = 0; i < values.length; i++) {
    const matchesUtr = utrNumber && String(values[i][6]).trim() === String(utrNumber).trim();
    const matchesSerial = serialNumber && String(values[i][0]).trim().padStart(3, '0') === String(serialNumber).trim().padStart(3, '0');
    if (matchesUtr || matchesSerial) return i + 2;
  }
  return 0;
}

function safeCell(value) {
  const text = String(value == null ? '' : value);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function jsonResponse(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}
