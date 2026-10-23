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
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const $ = (id) => document.getElementById(id);
const pageLoader = $('pageLoader');
const loaderText = $('loaderText');
const donationForm = $('donationForm');
const donationSection = $('donationSection');
const receiptSection = $('receiptSection');

function setLoading(show, message) {
  loaderText.textContent = message || 'Loading...';
  pageLoader.style.display = show ? 'flex' : 'none';
}
function todayInIndia() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(new Date());
  const item = {};
  parts.forEach((part) => { item[part.type] = part.value; });
  return item.year + '-' + item.month + '-' + item.day;
}
function safeText(value) {
  return String(value == null ? '' : value);
}
function formatAmount(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return '—';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
}
function formatAmountForPdf(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return '—';
  // jsPDF's built-in Helvetica font may not include the Indian rupee glyph.
  return 'INR ' + new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
}
const UPI_PAYMENT_BASE = 'upi://pay?pa=0798062a0170493.bqr%40kotak&pn=ARVIND%20OASIS%20APARTMENTS%20OWNERS%20ASSOCIATION%20TEMPLE&cu=INR';
function refreshUpiPaymentLink() {
  const amountText = $('donationAmount').value.trim();
  const amount = Number(amountText);
  const valid = amountText && Number.isFinite(amount) && amount >= 1;
  $('openUpiButton').href = UPI_PAYMENT_BASE + (valid ? '&am=' + encodeURIComponent(amount.toFixed(2)) : '');
}
function setStatus(message, isError) {
  $('formStatus').textContent = message || '';
  $('formStatus').style.color = isError ? '#a00000' : '#256029';
}

async function verifyResidentSession(flatNumber, residentName, email) {
  if (!flatNumber || localStorage.getItem('input') !== 'true' || !residentName || !email) {
    window.location.replace('index.html');
    return null;
  }
  const residentId = residentName.replace(/\s+/g, '_') + '_' + email;
  const residentRef = doc(db, 'users', flatNumber, 'residents', residentId);
  const residentSnap = await getDoc(residentRef);
  if (!residentSnap.exists()) {
    localStorage.removeItem('input');
    window.location.replace('index.html');
    return null;
  }
  return residentSnap.data() || {};
}

async function loadHistory(flatNumber) {
  $('historyLoading').hidden = false;
  $('historyEmpty').hidden = true;
  $('historyTableWrap').hidden = true;
  $('historyError').textContent = '';
  try {
    const snapshot = await getDocs(collection(db, 'users', flatNumber, 'Donations'));
    const records = [];
    snapshot.forEach((item) => records.push(item.data()));
    records.sort((a, b) => {
      const aTime = a.createdAt && typeof a.createdAt.toMillis === 'function' ? a.createdAt.toMillis() : 0;
      const bTime = b.createdAt && typeof b.createdAt.toMillis === 'function' ? b.createdAt.toMillis() : 0;
      return bTime - aTime;
    });
    const tbody = $('historyRows');
    tbody.replaceChildren();
    records.forEach((record) => {
      const tr = document.createElement('tr');
      [
        record.date || '',
        record.serialNumber ? String(record.serialNumber) : '',
        formatAmount(record.amount),
        record.donationType || 'Donate for Temple Daily Activities',
        record.utrNumber || '',
        record.verificationStatus || 'Pending manual verification'
      ].forEach((value) => {
        const td = document.createElement('td');
        td.textContent = safeText(value);
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    $('historyLoading').hidden = true;
    if (records.length === 0) $('historyEmpty').hidden = false;
    else $('historyTableWrap').hidden = false;
  } catch (error) {
    console.error('Unable to load donation history:', error);
    $('historyLoading').hidden = true;
    $('historyError').textContent = 'Donation history could not be loaded. Please refresh the page.';
  }
}

async function requestSheetSync(record) {
  const endpoint = window.DONATION_SHEETS_WEB_APP_URL;
  if (!endpoint || !/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec(?:\?.*)?$/.test(endpoint)) {
    console.info('Donation Sheet sync is not configured. Firestore donation record was saved.');
    return;
  }
  try {
    await fetch(endpoint, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      body: JSON.stringify({
        action: 'submit',
        serialNumber: record.serialNumber,
        name: record.name,
        amount: record.amount,
        flatNumber: record.flatNumber,
        mobileNumber: record.mobileNumber,
        donationType: record.donationType,
        utrNumber: record.utrNumber,
        date: record.date,
        verificationStatus: record.verificationStatus || 'Pending manual verification',
        verifiedAt: record.verifiedAt || ''
      })
    });
  } catch (error) {
    console.error('Donation details were saved in Firestore, but the Sheets sync request could not be sent:', error);
  }
}

function showReceipt(record) {
  $('receiptSerial').textContent = record.serialNumber;
  $('receiptName').textContent = record.name;
  $('receiptAmount').textContent = formatAmount(record.amount);
  $('receiptFlat').textContent = record.flatNumber;
  $('receiptMobile').textContent = record.mobileNumber;
  $('receiptDate').textContent = record.date;
  $('receiptType').textContent = record.donationType;
  $('receiptUtr').textContent = record.utrNumber;
  $('receiptStatus').textContent = 'Donation details submitted. Payment verification is pending.';
  $('goBackButton').disabled = true;
  donationSection.hidden = true;
  receiptSection.hidden = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });
  $('downloadReceiptButton').onclick = () => downloadReceipt(record);
  $('shareReceiptButton').onclick = () => shareReceipt(record);
  $('goBackButton').onclick = () => {
    receiptSection.hidden = true;
    donationSection.hidden = false;
    donationForm.reset();
    $('donationDate').value = todayInIndia();
    $('donationAmount').value = '';
    refreshUpiPaymentLink();
    $('flatNumber').value = localStorage.getItem('flatNumber') || '';
    $('donorName').value = localStorage.getItem('residentName') || '';
    setStatus('', false);
    loadHistory(localStorage.getItem('flatNumber'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
}

function buildReceiptPdf(record) {
  if (!window.jspdf || !window.jspdf.jsPDF) throw new Error('PDF library unavailable');
  const pdf = new window.jspdf.jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  pdf.setFillColor(255, 248, 220);
  pdf.rect(0, 0, pageWidth, 297, 'F');
  pdf.setDrawColor(183, 138, 43);
  pdf.setLineWidth(1.2);
  pdf.roundedRect(15, 18, pageWidth - 30, 250, 4, 4, 'S');
  pdf.setTextColor(139, 0, 0);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(17);
  pdf.text('Shri Varasiddhi Vinayaka Temple', pageWidth / 2, 36, { align: 'center' });
  pdf.setFontSize(12);
  pdf.setTextColor(85, 65, 45);
  pdf.text('Donation Acknowledgement', pageWidth / 2, 45, { align: 'center' });
  pdf.setFillColor(255, 241, 197);
  pdf.roundedRect(55, 54, pageWidth - 110, 20, 3, 3, 'FD');
  pdf.setTextColor(139, 0, 0);
  pdf.setFontSize(21);
  pdf.text(String(record.serialNumber), pageWidth / 2, 67, { align: 'center' });
  const fields = [
    ['Donor Name', record.name],
    ['Donation Amount', formatAmountForPdf(record.amount)],
    ['Flat Number', record.flatNumber],
    ['Mobile Number', record.mobileNumber],
    ['Donation Date', record.date],
    ['Donation Type', record.donationType],
    ['UPI Transaction Reference', record.utrNumber]
  ];
  let y = 92;
  fields.forEach((field) => {
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(80, 50, 30);
    pdf.setFontSize(10);
    pdf.text(field[0], 28, y);
    pdf.setFont('helvetica', 'normal');
    const lines = pdf.splitTextToSize(safeText(field[1]), pageWidth - 62);
    pdf.text(lines, 82, y);
    y += Math.max(12, lines.length * 5 + 3);
  });
  pdf.setDrawColor(210, 190, 150);
  pdf.line(25, y + 3, pageWidth - 25, y + 3);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(139, 0, 0);
  pdf.setFontSize(10);
  pdf.text(
    String(record.verificationStatus || 'Pending manual verification').toLowerCase() === 'verified'
      ? 'Payment verified by Temple Committee'
      : 'Payment verification pending',
    pageWidth / 2, y + 13, { align: 'center' }
  );
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(75, 65, 55);
  pdf.setFontSize(9);
  pdf.text('This document acknowledges submission of donation details.', pageWidth / 2, y + 20, { align: 'center' });
  pdf.text('Payment status is subject to Temple Committee verification.', pageWidth / 2, y + 26, { align: 'center' });
  return pdf;
}

function downloadReceipt(record) {
  try {
    const pdf = buildReceiptPdf(record);
    pdf.save('Temple-Donation-Receipt-' + String(record.serialNumber) + '.pdf');
    $('receiptStatus').textContent = 'Receipt downloaded. Keep it for your records.';
    $('goBackButton').disabled = false;
  } catch (error) {
    console.warn('PDF download unavailable; opening the browser print dialog instead.', error);
    window.print();
    $('receiptStatus').textContent = 'If the print dialog opened, choose Save as PDF. You can now go back.';
    $('goBackButton').disabled = false;
  }
}

function downloadPdfBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

async function shareReceipt(record) {
  const filename = 'Temple-Donation-Receipt-' + String(record.serialNumber) + '.pdf';
  const shareText = 'Shri Varasiddhi Vinayaka Temple donation receipt ' + String(record.serialNumber) +
    '\nAmount: ' + formatAmount(record.amount) +
    '\nDonor: ' + safeText(record.name) +
    '\nFlat: ' + safeText(record.flatNumber) +
    '\nUPI reference: ' + safeText(record.utrNumber) +
    '\nPayment verification is subject to Temple Committee confirmation.';
  try {
    const pdf = buildReceiptPdf(record);
    const blob = pdf.output('blob');
    const file = typeof File === 'function' ? new File([blob], filename, { type: 'application/pdf' }) : null;
    let canShareFile = false;
    try { canShareFile = !!(file && navigator.share && navigator.canShare && navigator.canShare({ files: [file] })); }
    catch (canShareError) { console.info('PDF file sharing is not supported by this browser.', canShareError); }
    $('goBackButton').disabled = false;

    // On supported phones this opens Android's native share sheet with the PDF attached.
    // The user chooses WhatsApp/the destination and confirms sending; websites cannot
    // force a particular WhatsApp group or send without the user's confirmation.
    if (canShareFile) {
      try {
        await navigator.share({ files: [file], title: 'Temple Donation Receipt ' + String(record.serialNumber), text: shareText });
        $('receiptStatus').textContent = 'Receipt shared. Choose WhatsApp, select the intended group or contact, and tap Send.';
      } catch (shareError) {
        if (shareError && shareError.name === 'AbortError') {
          $('receiptStatus').textContent = 'Sharing cancelled. Your receipt is still available to download.';
          return;
        }
        console.warn('Native PDF sharing failed; downloading the receipt instead.', shareError);
        downloadPdfBlob(blob, filename);
        $('receiptStatus').textContent = 'The phone could not attach the PDF to the share sheet. The receipt was downloaded; attach it manually in WhatsApp.';
      }
      return;
    }

    // Fallback: always download the PDF, then open the native share sheet for the
    // accompanying text if available. Some browsers do not allow PDF file sharing.
    downloadPdfBlob(blob, filename);
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Temple Donation Receipt ' + String(record.serialNumber), text: shareText });
        $('receiptStatus').textContent = 'Receipt PDF downloaded. Your browser can share the message but not attach PDFs here; attach the downloaded PDF manually in WhatsApp.';
      } catch (shareError) {
        $('receiptStatus').textContent = shareError && shareError.name === 'AbortError'
          ? 'Receipt PDF downloaded. Sharing was cancelled; attach the PDF manually in WhatsApp when ready.'
          : 'Receipt PDF downloaded. Open WhatsApp and attach the downloaded PDF manually.';
      }
    } else {
      $('receiptStatus').textContent = 'Receipt PDF downloaded. Your browser does not support the native share sheet; attach the PDF manually in WhatsApp or another app.';
    }
  } catch (error) {
    console.error('Unable to create a shareable receipt PDF:', error);
    $('receiptStatus').textContent = 'Could not create the PDF. Use Download Receipt PDF, then share the saved file from your phone.';
  }
}

async function initializeDonationPage() {
  const flatNumber = localStorage.getItem('flatNumber');
  const residentName = localStorage.getItem('residentName');
  const email = localStorage.getItem('email');
  if (!flatNumber || localStorage.getItem('input') !== 'true') {
    window.location.replace('index.html');
    return;
  }

  $('flatNumber').value = flatNumber;
  $('donorName').value = residentName || '';
  $('donationDate').value = todayInIndia();
  refreshUpiPaymentLink();
  $('donationAmount').addEventListener('input', refreshUpiPaymentLink);
  $('openUpiButton').addEventListener('click', (event) => {
    const amountText = $('donationAmount').value.trim();
    const amount = Number(amountText);
    if (!amountText || !Number.isFinite(amount) || amount < 1) {
      event.preventDefault();
      setStatus('Enter the donation amount (at least ₹1) before opening your UPI app.', true);
      $('donationAmount').focus();
    }
  });
  $('utrNumber').addEventListener('input', (event) => {
    event.target.value = event.target.value.replace(/\D/g, '').slice(0, 12);
  });

  try {
    const residentData = await verifyResidentSession(flatNumber, residentName, email);
    if (!residentData) return;
    if (residentData.mobileNumber || residentData.mobile) {
      $('mobileNumber').value = String(residentData.mobileNumber || residentData.mobile).replace(/\D/g, '').slice(-10);
    }
    $('donorName').value = residentData.name || residentName || '';
    await loadHistory(flatNumber);
  } catch (error) {
    console.error('Unable to verify the resident session:', error);
    $('formStatus').textContent = 'Unable to verify the signed-in resident. Please sign in again before donating.';
    $('formStatus').style.color = '#a00000';
    return;
  } finally {
    setLoading(false);
  }

  donationForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    setStatus('', false);
    if (!donationForm.reportValidity()) return;

    const name = $('donorName').value.trim();
    const date = $('donationDate').value;
    const flat = localStorage.getItem('flatNumber');
    const mobileNumber = $('mobileNumber').value.trim();
    const amountText = $('donationAmount').value.trim();
    const amount = Number(amountText);
    const donationType = $('donationType').value;
    const utrNumber = $('utrNumber').value.trim();

    if (!name || !flat) {
      setStatus('Please sign in again before submitting the donation.', true);
      return;
    }
    if (!/^[6-9][0-9]{9}$/.test(mobileNumber)) {
      setStatus('Enter a valid 10-digit Indian mobile number.', true);
      $('mobileNumber').focus();
      return;
    }
    if (!amountText || !Number.isFinite(amount) || amount < 1 || Math.abs(amount * 100 - Math.round(amount * 100)) > 0.00001) {
      setStatus('Enter a valid donation amount of at least ₹1, with up to two decimal places.', true);
      $('donationAmount').focus();
      return;
    }
    if (!/^[0-9]{12}$/.test(utrNumber)) {
      setStatus('UPI reference must contain exactly 12 digits.', true);
      $('utrNumber').focus();
      return;
    }

    $('submitDonation').disabled = true;
    setLoading(true, 'Saving donation details securely...');
    try {
      const donationId = 'UPI_' + utrNumber;
      const donationRef = doc(db, 'Donations', donationId);
      const flatDonationRef = doc(db, 'users', flat, 'Donations', donationId);
      const counterRef = doc(db, 'receiptNumbers', 'donationsCounter');

      const receipt = await runTransaction(db, async (transaction) => {
        const duplicateSnap = await transaction.get(donationRef);
        const counterSnap = await transaction.get(counterRef);
        if (duplicateSnap.exists()) {
          const duplicateError = new Error('This UPI reference has already been submitted.');
          duplicateError.code = 'DUPLICATE_UPI';
          throw duplicateError;
        }
        const previousValue = counterSnap.exists()
          ? Number(counterSnap.data().lastSerialNumber || 0)
          : 0;
        const serialNumber = String(previousValue + 1).padStart(3, '0');
        const record = {
          serialNumber,
          name,
          amount,
          date,
          flatNumber: flat,
          mobileNumber,
          donationType,
          utrNumber,
          paymentMethod: 'UPI',
          verificationStatus: 'Pending manual verification',
          sheetSyncStatus: window.DONATION_SHEETS_WEB_APP_URL ? 'queued' : 'not_configured',
          createdAt: serverTimestamp()
        };
        transaction.set(donationRef, record);
        transaction.set(flatDonationRef, record);
        transaction.set(counterRef, {
          lastSerialNumber: previousValue + 1,
          updatedAt: serverTimestamp()
        });
        return record;
      });

      await requestSheetSync(receipt);
      setLoading(false);
      showReceipt(receipt);
      await loadHistory(flat);
    } catch (error) {
      console.error('Donation submission failed:', error);
      setLoading(false);
      if (error && error.code === 'DUPLICATE_UPI') {
        setStatus('This UPI reference has already been submitted. Check your donation history or contact the Temple Committee.', true);
      } else {
        setStatus('The donation details could not be saved. Please try again. If this continues, contact the Temple Committee.', true);
      }
    } finally {
      $('submitDonation').disabled = false;
      if (pageLoader.style.display !== 'none') setLoading(false);
    }
  });
}

setLoading(true, 'Loading donation page...');
initializeDonationPage();
