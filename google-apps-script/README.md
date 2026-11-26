# Saving leads to Google Sheets

The website already emails every lead to gbishop24@icloud.com. These steps also save a copy of each lead into the two spreadsheets in the garybishoprealestate@gmail.com Google Drive:

- Seller / home-value form → **Selling a Home Form Responses**
- Buyer form → **Buying a Home Form Responses**

Do this once. Until it is finished, the emails still send as they do now.

## Steps

1. Sign in to Google as **garybishoprealestate@gmail.com** (the account that owns those two spreadsheets).
2. Open https://script.google.com/home and click **New project**.
3. Click the title **Untitled project** and rename it to **Lead recorder**.
4. Select all of the sample code, delete it, and paste in the entire `Code.gs` file from this folder. Click the save icon.
5. Click **Deploy** → **New deployment**.
6. Click the gear icon beside “Select type” and choose **Web app**.
7. Set **Execute as** to **Me** and **Who has access** to **Anyone**. Do not choose “Anyone with a Google account.”
8. Click **Deploy**. Pick the same Gmail account and click **Allow**. If Google says it has not verified the app, click **Advanced**, then **Go to Lead recorder (unsafe)**. That screen is normal. This is your own script.
9. Copy the **Web app URL**. It starts with `https://script.google.com/macros/s/` and ends with `/exec`.
10. Open that URL in a new tab. You should see “Lead recorder is running” and both file names marked “found.” If one says NOT FOUND, the file name does not match, or this Google account cannot open the file.
11. In Netlify, open this website → **Site configuration** → **Environment variables** → **Add a variable**.
    - Key: `GOOGLE_SHEETS_WEB_APP_URL`
    - Value: the Web app URL you copied
    - Apply it to Production (All scopes is fine).
12. Open **Deploys** → **Trigger deploy** → **Deploy site**, and wait until it finishes.
13. Send one test from the home-page form and one from the Buyers page. Each test should email you and add a row to the matching spreadsheet. Delete the test rows when you are done.

If you change `Code.gs` later: **Deploy** → **Manage deployments** → pencil icon → **Version: New version** → **Deploy**. The URL stays the same. You do not change Netlify again.

## Do the column headers have to match?

No. You do not have to set up columns yourself.

- On an empty spreadsheet, the first lead creates the headers: **Timestamp**, then one column per question (First Name, Email, and so on).
- If row 1 already has headers, a column is used when its header matches the question. Capital letters and extra spaces do not matter. “First Name”, “first name”, and “firstName” all match. “Email Address” and “Phone Number” match too.
- If an old header does not match any question, that column is left blank and the answer is added in a new column on the right. Nothing is dropped. Rename the old header to the question name if you want future answers in that column.
- Headers have to be in row 1. New rows are added on the first tab.
- The file names have to be exactly **Selling a Home Form Responses** and **Buying a Home Form Responses**.

The time in the Timestamp column is Eastern Time. FormSubmit’s own hidden fields (`_subject`, `_captcha`, `_template`) are not written to the sheet.

## If the email arrives but the sheet does not

- Open the Web app URL again and see which file says NOT FOUND.
- In Netlify, open the latest function log for `save-lead`.
- The form still emails gbishop24@icloud.com when the sheet step fails, and also when `GOOGLE_SHEETS_WEB_APP_URL` is not set yet.

A few other notes:

- Someone who has turned JavaScript off still sends the email, but that lead is not added to the sheet.
- If two files share the same name, the most recently updated one is used. Rename the old copy.
- The spreadsheets need to be in this Google account’s My Drive. A file that lives only in a shared drive may not be found.
- The Web app URL is not a password, but do not post it in public. Someone who has the URL can add rows. They cannot read the sheet. The URL is stored in Netlify, not in the public website code.
