import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.12.0/firebase-app.js';
import {
  getFirestore, doc, getDoc, getDocs, collection, runTransaction, serverTimestamp
} from 'https://www.gstatic.com/firebasejs/9.12.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: 'AIzaSyBKtqm0KzMmX4cCqT3PhGI2aFcF3LSXnEk',
  authDomain: 'ao-temple.firebaseapp.com',
  projectId: 'ao-temple',
  storageBucket: 'ao-temple.appspot.com',
  messagingSenderId: '426167530682',
  appId: '1:426167530682:web:848a4cb0ceee2ce05cfe83'
};
const db = getFirestore(initializeApp(firebaseConfig));
const $ = (id) => document.getElementById(id);
const WHATSAPP_GROUP_URL = 'https://chat.whatsapp.com/BOurgzSlABs9vGatqsFbBc';
let allDonations = [];
let currentDetails = null;

if (sessionStorage.getItem('login') !== 'true') {
  window.location.replace('pass.html');
}

function setMessage(message, isError = false) {
  $('statusMessage').textContent = message;
  $('statusMessage').classList.toggle('error', isError);
}
function startActionProgress(button, busyLabel, progressMessage) {
  const originalText = button ? button.textContent : '';
  const originalDisabled = button ? button.disabled : false;
  const container = button ? button.closest('.actions, .dialog-actions') : null;
  const peers = container ? [...container.querySelectorAll('button')].filter(item => item !== button).map(item => ({ item, disabled: item.disabled })) : [];

  if (button) {
    button.disabled = true;
    button.classList.add('is-busy');
    button.setAttribute('aria-busy', 'true');
    const spinner = document.createElement('span');
    spinner.className = 'inline-spinner';
    spinner.setAttribute('aria-hidden', 'true');
    const label = document.createElement('span');
    label.textContent = busyLabel;
    button.replaceChildren(spinner, label);
  }
  peers.forEach(({ item }) => { item.disabled = true; });
  $('actionProgressText').textContent = progressMessage;
  $('actionProgress').hidden = false;

  let finished = false;
  return function finishActionProgress() {
    if (finished) return;
    finished = true;
    if (button) {
      button.classList.remove('is-busy');
      button.removeAttribute('aria-busy');
      if (button.isConnected) {
        button.textContent = originalText;
        button.disabled = originalDisabled;
      }
    }
    peers.forEach(({ item, disabled }) => { if (item.isConnected) item.disabled = disabled; });
    $('actionProgress').hidden = true;
  };
}
function text(value) { return String(value == null ? '' : value); }
function formatAmount(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return '—';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
}
function statusOf(record) {
  return text(record.verificationStatus || 'Pending manual verification');
}
function isVerified(record) { return statusOf(record).toLowerCase() === 'verified'; }
// The legacy Apps Script deployment validates this key for protected Sheet actions.
// It is kept out of the UI by the user's request; note that any static-site key is public.
const DONATION_SHEETS_ADMIN_KEY = 'deleteaccess';
function getDonationAdminKey() { return DONATION_SHEETS_ADMIN_KEY; }

function timestampText(value) {
  if (!value) return '';
  const date = value && typeof value.toDate === 'function' ? value.toDate() : new Date(value);
  return Number.isNaN(date.getTime()) ? text(value) : date.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
}
function plainRecord(record) {
  return {
    serialNumber: text(record.serialNumber),
    name: text(record.name),
    amount: record.amount == null || record.amount === '' ? '' : Number(record.amount),
    flatNumber: text(record.flatNumber),
    mobileNumber: text(record.mobileNumber),
    donationType: text(record.donationType || 'Donate for Temple Daily Activities'),
    utrNumber: text(record.utrNumber),
    date: text(record.date),
    verificationStatus: statusOf(record),
    verifiedAt: timestampText(record.verifiedAt),
    verifiedBy: text(record.verifiedBy),
    adminNotes: text(record.adminNotes)
  };
}
async function requestSheetAction(action, record) {
  const endpoint = window.DONATION_SHEETS_WEB_APP_URL;
  const requiresAdminKey = ['verify', 'delete', 'sync'].includes(action);
  const adminKey = getDonationAdminKey();
  if (requiresAdminKey && !adminKey) return { sent: false, reason: 'Enter the Donation Sheet Admin Key first.' };
  if (!endpoint || !endpoint.startsWith('https://script.google.com/macros/s/') || !endpoint.endsWith('/exec')) {
    return { sent: false, reason: 'Google Sheets web app URL is not configured.' };
  }
  try {
    await fetch(endpoint, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      body: JSON.stringify({ action, ...(requiresAdminKey ? { adminKey } : {}), ...plainRecord(record) })
    });
    // Apps Script is called in no-cors mode, so the browser cannot inspect the response body.
    // "sent" means the request left this page; it is not a server-side acknowledgement.
    return { sent: true };
  } catch (error) {
    console.error('Google Sheets sync request failed:', error);
    return { sent: false, reason: 'The Google Sheets sync request could not be sent.' };
  }
}
async function loadDonations() {
  if (sessionStorage.getItem('login') !== 'true') { window.location.replace('pass.html'); return; }
  $('refreshButton').disabled = true;
  setMessage('Loading donation recordsâ¦');
  $('donationRows').replaceChildren();
  const loadingRow = document.createElement('tr');
  const loadingCell = document.createElement('td');
  loadingCell.colSpan = 8;
  loadingCell.className = 'empty';
  loadingCell.textContent = 'Loading donation recordsâ¦';
  loadingRow.appendChild(loadingCell);
  $('donationRows').appendChild(loadingRow);
  try {
    const snapshot = await getDocs(collection(db, 'Donations'));
    allDonations = snapshot.docs.map((item) => ({ ...item.data(), id: item.id }));
    allDonations.sort((a, b) => {
      const aCreated = a.createdAt && typeof a.createdAt.toMillis === 'function' ? a.createdAt.toMillis() : 0;
      const bCreated = b.createdAt && typeof b.createdAt.toMillis === 'function' ? b.createdAt.toMillis() : 0;
      return bCreated - aCreated || text(b.serialNumber).localeCompare(text(a.serialNumber), undefined, { numeric: true });
    });
    refreshFlatFilter();
    renderDonations();
    setMessage('Loaded ' + allDonations.length + ' donation record(s).');
  } catch (error) {
    console.error('Unable to load donations:', error);
    allDonations = [];
    renderDonations();
    setMessage('Donation records could not be loaded. Check Firestore read permissions and reload.', true);
  } finally {
    $('refreshButton').disabled = false;
  }
}
function refreshFlatFilter() {
  const select = $('flatFilter');
  const previous = select.value;
  const flats = [...new Set(allDonations.map((record) => text(record.flatNumber).trim()).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  select.replaceChildren();
  const allOption = document.createElement('option');
  allOption.value = '';
  allOption.textContent = 'All flats';
  select.appendChild(allOption);
  flats.forEach((flat) => {
    const option = document.createElement('option');
    option.value = flat;
    option.textContent = flat;
    select.appendChild(option);
  });
  if (flats.includes(previous)) select.value = previous;
}
function filteredDonations() {
  const query = $('searchInput').value.trim().toLowerCase();
  const status = $('statusFilter').value;
  const flat = $('flatFilter').value;
  const from = $('fromDate').value;
  const to = $('toDate').value;
  return allDonations.filter((record) => {
    const searchable = [record.serialNumber, record.name, record.amount, record.flatNumber, record.mobileNumber, record.utrNumber, record.donationType, record.id]
      .map((v) => text(v).toLowerCase()).join(' ');
    if (query && !searchable.includes(query)) return false;
    if (status === 'pending' && isVerified(record)) return false;
    if (status === 'verified' && !isVerified(record)) return false;
    if (flat && text(record.flatNumber) !== flat) return false;
    const date = text(record.date);
    if (from && (!date || date < from)) return false;
    if (to && (!date || date > to)) return false;
    return true;
  });
}
function addCell(row, value, className) {
  const cell = document.createElement('td');
  cell.textContent = text(value);
  if (className) cell.className = className;
  row.appendChild(cell);
  return cell;
}
function makeButton(label, className, handler, disabled = false) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'btn ' + (className || 'light');
  button.textContent = label;
  button.disabled = disabled;
  button.addEventListener('click', () => handler(button));
  return button;
}
function renderDonations() {
  const pending = allDonations.filter((record) => !isVerified(record)).length;
  $('totalCount').textContent = String(allDonations.length);
  $('pendingCount').textContent = String(pending);
  $('verifiedCount').textContent = String(allDonations.length - pending);
  const tbody = $('donationRows');
  tbody.replaceChildren();
  const records = filteredDonations();
  if (!records.length) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 8;
    cell.className = 'empty';
    cell.textContent = allDonations.length ? 'No donations match these search and filter settings.' : 'No donation records found.';
    row.appendChild(cell);
    tbody.appendChild(row);
    return;
  }
  records.forEach((record) => {
    const row = document.createElement('tr');
    addCell(row, record.serialNumber || 'â', 'receipt-id');
    addCell(row, record.name || 'â');
    addCell(row, record.flatNumber || 'â');
    addCell(row, record.date || 'â');
    addCell(row, record.utrNumber || 'â');
    const statusCell = document.createElement('td');
    const pill = document.createElement('span');
    pill.className = 'pill' + (isVerified(record) ? ' verified' : '');
    pill.textContent = statusOf(record);
    statusCell.appendChild(pill);
    row.appendChild(statusCell);
    const actions = document.createElement('td');
    const actionWrap = document.createElement('div');
    actionWrap.className = 'actions';
    actionWrap.appendChild(makeButton('Details', 'light', () => openDetails(record)));
    actionWrap.appendChild(makeButton('Verify', 'success', button => verifyDonation(record, button), isVerified(record)));
    actionWrap.appendChild(makeButton('Sync Sheet', 'light', button => syncOneRecord(record, button)));
    actionWrap.appendChild(makeButton('Delete', 'danger', button => deleteDonation(record, button)));
    actions.appendChild(actionWrap);
    row.appendChild(actions);
    tbody.appendChild(row);
  });
}
function openDetails(record) {
  currentDetails = record;
  const grid = $('detailsGrid');
  grid.replaceChildren();
  const fields = [
    ['Receipt Number', record.serialNumber],
    ['Firestore Document ID', record.id],
    ['Donor Name', record.name],
    ['Donation Amount', formatAmount(record.amount)],
    ['Flat Number', record.flatNumber],
    ['Mobile Number', record.mobileNumber],
    ['Donation Date', record.date],
    ['Donation Type', record.donationType || 'Donate for Temple Daily Activities'],
    ['UPI Transaction Reference', record.utrNumber],
    ['Verification Status', statusOf(record)],
    ['Submitted At', timestampText(record.createdAt)],
    ['Verified At', timestampText(record.verifiedAt)],
    ['Verified By', record.verifiedBy],
    ['Admin Notes', record.adminNotes]
  ];
  fields.forEach(([label, value]) => {
    const wrap = document.createElement('div');
    wrap.className = 'detail';
    const caption = document.createElement('span');
    caption.textContent = label;
    const strong = document.createElement('strong');
    strong.textContent = text(value) || 'â';
    wrap.append(caption, strong);
    grid.appendChild(wrap);
  });
  const actionWrap = $('detailsActions');
  actionWrap.replaceChildren();
  if (!isVerified(record)) actionWrap.appendChild(makeButton('Verify Payment', 'success', button => verifyDonation(record, button)));
  actionWrap.appendChild(makeButton('Share Group Link', 'light', () => window.open(WHATSAPP_GROUP_URL, '_blank', 'noopener,noreferrer')));
  actionWrap.appendChild(makeButton('Delete Donation', 'danger', button => deleteDonation(record, button)));
  $('detailsDialog').showModal();
}
async function verifyDonation(record, button) {
  if (!getDonationAdminKey()) { setMessage('Enter the Donation Sheet Admin Key first; no record was changed.', true); return; }
  if (sessionStorage.getItem('login') !== 'true') {
    window.location.replace('pass.html');
    return;
  }
  if (isVerified(record)) {
    setMessage('This receipt is already marked Verified.');
    return;
  }
  if (!window.confirm('Confirm that you have checked the temple bank/UPI account and verified receipt ' + text(record.serialNumber) + '?')) return;

  const finishProgress = startActionProgress(
    button,
    'Verifying…',
    'Verifying receipt ' + text(record.serialNumber) + ' in Firestore and sending the Google Sheets update. Please wait…'
  );
  setMessage('Verification is in progress for receipt ' + text(record.serialNumber) + '. Please do not click again.');
  try {
    const rootRef = doc(db, 'Donations', record.id);
    const flatRef = doc(db, 'users', text(record.flatNumber), 'Donations', record.id);
    await runTransaction(db, async (transaction) => {
      const rootSnap = await transaction.get(rootRef);
      if (!rootSnap.exists()) throw new Error('This donation no longer exists in Firestore.');
      const flatSnap = await transaction.get(flatRef);
      const update = {
        verificationStatus: 'Verified',
        verifiedAt: serverTimestamp(),
        verifiedBy: 'Temple Admin',
        updatedAt: serverTimestamp()
      };
      transaction.update(rootRef, update);
      if (flatSnap.exists()) transaction.update(flatRef, update);
    });
    const updated = { ...record, verificationStatus: 'Verified', verifiedAt: new Date(), verifiedBy: 'Temple Admin' };
    allDonations = allDonations.map((item) => item.id === record.id ? updated : item);
    currentDetails = updated;
    const sync = await requestSheetAction('verify', updated);
    renderDonations();
    if ($('detailsDialog').open) openDetails(updated);
    setMessage(sync.sent
      ? 'Receipt ' + text(record.serialNumber) + ' is verified in Firestore. Google Sheets was asked to update; refresh the sheet to confirm.'
      : 'Receipt was verified in Firestore, but the Google Sheets request failed: ' + sync.reason + ' Use Sync Sheet to retry.', !sync.sent);
  } catch (error) {
    console.error('Verification failed:', error);
    setMessage('Could not verify the donation in Firestore: ' + text(error.message || error), true);
  } finally {
    finishProgress();
  }
}
async function syncOneRecord(record, button) {
  if (sessionStorage.getItem('login') !== 'true') { window.location.replace('pass.html'); return; }
  if (!getDonationAdminKey()) { setMessage('Enter the Donation Sheet Admin Key first.', true); return; }
  const finishProgress = startActionProgress(
    button,
    'Syncing…',
    'Syncing receipt ' + text(record.serialNumber) + ' with Google Sheets. Please wait…'
  );
  try {
    const action = isVerified(record) ? 'verify' : 'sync';
    const sync = await requestSheetAction(action, record);
    setMessage(sync.sent
      ? 'Google Sheets sync request sent for receipt ' + text(record.serialNumber) + '. Refresh the sheet to confirm the update.'
      : sync.reason, !sync.sent);
  } catch (error) {
    setMessage('Could not sync receipt ' + text(record.serialNumber) + ': ' + text(error.message || error), true);
  } finally {
    finishProgress();
  }
}
async function deleteDonation(record, button) {
  if (sessionStorage.getItem('login') !== 'true') { window.location.replace('pass.html'); return; }
  if (!getDonationAdminKey()) { setMessage('Enter the Donation Sheet Admin Key first; no record was deleted.', true); return; }
  if (!window.confirm(
    'Permanently delete receipt ' + text(record.serialNumber) + ' (UPI reference ' + text(record.utrNumber) + ')?\n\n' +
    'This deletes its root and per-flat donation records in Firestore and requests row deletion in Google Sheets. The receipt serial remains retired and will not be reused.'
  )) return;

  const finishProgress = startActionProgress(
    button,
    'Deleting…',
    'Deleting receipt ' + text(record.serialNumber) + ' from Firestore and requesting its Google Sheets row deletion. Please wait…'
  );
  setMessage('Deletion is in progress for receipt ' + text(record.serialNumber) + '. Please do not click again.');
  try {
    const rootRef = doc(db, 'Donations', record.id);
    const flatRef = doc(db, 'users', text(record.flatNumber), 'Donations', record.id);
    await runTransaction(db, async (transaction) => {
      const rootSnap = await transaction.get(rootRef);
      const flatSnap = await transaction.get(flatRef);
      if (rootSnap.exists()) transaction.delete(rootRef);
      if (flatSnap.exists()) transaction.delete(flatRef);
      if (!rootSnap.exists() && !flatSnap.exists()) throw new Error('The donation was already deleted from Firestore.');
    });
    allDonations = allDonations.filter((item) => item.id !== record.id);
    if ($('detailsDialog').open) $('detailsDialog').close();
    const sync = await requestSheetAction('delete', record);
    renderDonations();
    setMessage(sync.sent
      ? 'Receipt ' + text(record.serialNumber) + ' was deleted from Firestore. A Google Sheets row-deletion request was sent; refresh the sheet to confirm.'
      : 'Receipt was deleted from Firestore, but Google Sheets sync failed (' + sync.reason + '). Remove its row from the sheet manually if it remains.', !sync.sent);
  } catch (error) {
    console.error('Donation deletion failed:', error);
    setMessage('Could not delete the donation from Firestore: ' + text(error.message || error), true);
  } finally {
    finishProgress();
  }
}

$('refreshButton').addEventListener('click', loadDonations);
['searchInput', 'statusFilter', 'flatFilter', 'fromDate', 'toDate'].forEach((id) => {
  $(id).addEventListener('input', renderDonations);
  $(id).addEventListener('change', renderDonations);
});
$('clearFiltersButton').addEventListener('click', () => {
  $('searchInput').value = '';
  $('statusFilter').value = 'all';
  $('flatFilter').value = '';
  $('fromDate').value = '';
  $('toDate').value = '';
  renderDonations();
});
$('closeDetailsButton').addEventListener('click', () => $('detailsDialog').close());
loadDonations();
