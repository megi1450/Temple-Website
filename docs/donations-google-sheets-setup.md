# Donations page — Google Sheets bridge setup

The Donations page stores each accepted submission in Firestore first:
- Donations/{UPI_reference} (central record)
- users/{flatNumber}/Donations/{UPI_reference} (that flat's history)
- receiptNumbers/donationsCounter (monotonic receipt serial counter)

The Apps Script in scripts/Donations.gs mirrors the submission to the new spreadsheet:
https://docs.google.com/spreadsheets/d/1QTmLXMIjXSDtmUDwM0-S9ZL88C-_ny2aY1lww2VZmcI/edit

## One-time setup

1. Open the spreadsheet above and choose Extensions → Apps Script.
2. Replace the starter editor contents with the contents of scripts/Donations.gs from this repository, then save the project.
3. Select Deploy → New deployment → Web app.
4. Set Execute as to your account (the account that can write to the spreadsheet).
5. Set Who has access to Anyone, then deploy and authorize the requested Google permissions.
6. Copy the deployed web app URL ending in /exec.
7. In this repository, open donations-config.js and set window.DONATION_SHEETS_WEB_APP_URL to that URL. Commit the change.

The website sends a no-cors request to Apps Script; browsers cannot read the response. Firestore therefore remains the source of truth if a sheet mirror request is blocked or the endpoint is unavailable. Verify a test donation appears in both Firestore and the spreadsheet before announcing the feature as fully operational.

## UPI reference validation

The website accepts exactly 12 numeric digits for the common UPI RRN/reference format and rejects duplicate references by using a deterministic Firestore document ID. A matching format is not proof of payment; the committee must verify the transaction in the receiving bank account/statement. Never mark a donation as paid solely because a reference number passes validation.

## Sheet columns

Serial Number | Name | Flat Number | Mobile | Donation Type | UTR Number | Date
