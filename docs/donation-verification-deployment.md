# Donation Verification — one-time deployment update

The static Temple Website cannot edit an already deployed Google Apps Script project through GitHub. The repository now contains the updated endpoint in scripts/Donations.gs; replace the source in the existing Apps Script project so the current /exec URL supports verification and deletion.

## Update the existing Apps Script Web App

1. Open the existing Apps Script project that owns the URL in donations-config.js.
2. Replace the complete contents of Code.gs with the current repository file scripts/Donations.gs, then save.
3. In Project Settings → Script Properties, add:
   - Property: DONATIONS_ADMIN_KEY
   - Value: a long random private key (at least 32 characters). Do not put this value in GitHub or public source files.
4. Open Deploy → Manage deployments, edit the existing Web App deployment, choose New version, and deploy. Keep the existing deployment URL so the website config does not need another URL change.
5. Open the website's Admin Panel → Donation Verification. Enter the exact DONATIONS_ADMIN_KEY into the field at the top and click Use Key for This Tab. The key is kept in session storage for this tab and cleared when the tab session ends or the Clear Key button is used.

## What the endpoint does

- New public donation submissions append a pending row and reject duplicate UPI references.
- Admin sync, verify, and delete actions require the private Script Property key.
- Verification updates column H (Verification Status) and column I (Verified At); the complete layout is A:J, with Admin Notes in J.
- Deletion removes the matching row by UTR or receipt serial. The Firestore counter document receiptNumbers/donationsCounter is intentionally not deleted or decremented, so receipt serials remain permanently retired and are not reused.
- The website's Firestore record update and a Sheet mutation are separate services, not one atomic transaction. The page reports that it sent the request, but this static site uses a cross-origin no-cors request and cannot read Apps Script's response body. Check the Google Sheet if a request fails to appear.

## Important access-control note

The existing website's admin login is a client-side session flag, not server-authenticated identity. The separate Apps Script key protects spreadsheet verify/delete operations, but it does not replace strict Firestore security rules. Before using this with sensitive production data, Firestore rules should restrict donation verification/deletion writes to trusted administrators.
