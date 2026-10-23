# Donation Verification — one-time deployment update

The static Temple Website cannot edit an already deployed Google Apps Script project through GitHub. The repository now contains the updated endpoint in scripts/Donations.gs; replace the source in the existing Apps Script project so the current /exec URL supports verification and deletion.

## Update the existing Apps Script Web App

1. Open the existing Apps Script project that owns the URL in donations-config.js.
2. Replace the complete contents of Code.gs with the current repository file scripts/Donations.gs, then save.
3. In Project Settings → Script Properties, keep the existing `DONATIONS_ADMIN_KEY` value (`deleteaccess`) unchanged, as requested. The value in the Donation Verification page must match exactly.
4. Open Deploy → Manage deployments, edit the existing Web App deployment, choose New version, and deploy. Keep the existing deployment URL so the website config does not need another URL change.
5. Open the website's Admin Panel → Donation Verification. Enter the exact DONATIONS_ADMIN_KEY into the field at the top and click Use Key for This Tab. The key is kept in session storage for this tab and cleared when the tab session ends or the Clear Key button is used.

## What the endpoint does

- New public donation submissions append a pending row and reject duplicate UPI references.
- Admin sync, verify, and delete actions require the private Script Property key.
- The sheet layout is A:K, with `Amount` in column C, `Verification Status` in I, `Verified At` in J, and `Admin Notes` in K. The script inserts column C once if it detects the legacy A:J header layout, preserving existing rows.
- Deletion removes the matching row by UTR or receipt serial. The Firestore counter document receiptNumbers/donationsCounter is intentionally not deleted or decremented, so receipt serials remain permanently retired and are not reused.
- Each new donation amount is stored in Firestore, included in the receipt, and sent to Google Sheets as a numeric rupee value. The amount is passed into the UPI payment link.
- Receipt sharing uses the native Web Share API to attach the PDF where the browser supports file sharing. The donor must choose WhatsApp and select the group/contact, then tap Send; a website cannot silently select a WhatsApp group or send a file without user confirmation. If PDF sharing is unsupported, the PDF downloads and the page offers native text sharing when available, with instructions to attach the PDF manually.
- The website's Firestore record update and a Sheet mutation are separate services, not one atomic transaction. This static site uses a cross-origin no-cors request and cannot read Apps Script's response body. Check the Google Sheet if a request fails to appear.

## Important access-control note

The existing website's admin login is a client-side session flag, not server-authenticated identity. The separate Apps Script key protects spreadsheet verify/delete operations, but it does not replace strict Firestore security rules. Before using this with sensitive production data, Firestore rules should restrict donation verification/deletion writes to trusted administrators.
