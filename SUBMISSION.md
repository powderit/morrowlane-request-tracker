# Module 3 Playbook Submission — Service Request Portal

**Name:** Cameron Fry
**Live URL:** https://morrowlane-request-tracker.powmow.workers.dev
**Repo:** https://github.com/powderit/morrowlane-request-tracker

> Hosting note: the course steps use Netlify and Supabase. The playbook allows "equivalent tools," so this app uses our company's stack instead: **Cloudflare Workers** for hosting (in place of Netlify) and **Cloudflare D1**, a hosted SQL database, in place of Supabase. Every push to `main` on GitHub rebuilds and redeploys the site automatically.

## What I built

I built the back end for Morrowlane's Service Request Portal: one shared page where Workplace Coordinators log a client's request, set its priority, and update its status as the work moves along. The page now loads every request, shows live counts of open, urgent, and recently completed work, and lets anyone download the full list as a spreadsheet. It checks every new request before saving, so blank fields, unknown locations, or made-up priorities are turned away with a message that says what to fix. Requests are stored in a hosted database, so they're still there after a refresh, a redeploy, or the next day.

## Debug Log

**Symptom:** On my laptop everything worked: the table filled, the tiles showed 9 / 2 / 5, and new requests saved. On the live site, the page loaded but all three tiles showed "–", the table said "No requests to show yet," and submitting the form showed "Something went wrong while saving the request. Please try again." After a refresh nothing was there. The Network tab showed `500` errors on `GET /api/summary`, `GET /api/requests`, and `POST /api/requests`.

**What I asked Claude:**

> [YOUR PROMPT — paste the three-part prompt you used. For example: "I deployed the app to Cloudflare. I expected the table and tiles to load the 22 sample requests and the form to save like it does locally. Instead the tiles show '–', the table is empty, saving fails, and the Network tab shows 500 errors on /api/summary, /api/requests, and POST /api/requests. Here's the Worker log: readFileSync … at node-internal:internal_fs_sync. What's the root cause?"]

**Root cause:** The first version of the back end stored requests in a CSV file in the project's `data/` folder. On my laptop the app can read and write that file. A deployed Cloudflare Worker has no disk, so the code that reads the file failed on every request. The Worker's log showed the failure inside `readFileSync`. Every endpoint depended on that file, so every endpoint returned a 500, and there was nowhere for a new request to be saved.

**Fix:** I moved the data into a hosted database. I created a Cloudflare D1 database called `morrowlane-requests` and a `requests` table with the same columns as the CSV plus an `id`, using rules that only allow the approved locations, priorities, and statuses. Then I imported the 22 starter requests and checked that the database matched the file (22 rows; 9 open, 2 urgent open, 5 completed in August). Finally, I asked Claude to change `lib/store.js` to read and write the database instead of the file, connected the database to the Worker in `wrangler.jsonc`, and pushed to GitHub, which redeployed the site. The setup and import SQL are saved in `migrations/`.

**Verification:** On the live site, the tiles showed 9 / 2 / 5 and the table showed all 22 requests. I submitted a test request (Test Person / Denver / "Test entry - flickering light in suite 5" / High), got a success response (201), and refreshed the page. The entry was still at the top of the table. I also changed its status to Complete, refreshed again, and the change stuck.

## Test pass results

| # | Check | What I did | Result | Fix made |
|---|---|---|---|---|
| 1 | Valid entry | Submitted Test Person / Denver / "Test entry - flickering light in suite 5" / High, then refreshed | Pass: saved (201), and the entry was still at the top after the refresh. Open requests went up by one. | None needed |
| 2 | Empty form | Submitted with every field blank, then with only spaces in the name and description | Pass: rejected (400) with "Requester name is required." Nothing was saved. | None needed |
| 3 | Duplicate-ish | Submitted the same request (same name, location, description, and priority) twice in a row | Fail: both were saved as separate requests (ids 24 and 25). The server has no duplicate check. | [YOUR FIX, or "None, listed under Known limitations"] |
| 4 | Absurd values | Tried a 10,000-character description, a 5,000-character name, "denver" in lowercase, priority "Critical", numbers instead of text, and `<script>` text in the description | Pass: oversized, wrong-case, and unknown values were each rejected with a message naming the field. The `<script>` text saved and displays as plain text; no code ran. | None needed |
| 5 | Hand-checked tile math | Counted straight from the sample CSV: requests not Complete = 9, of those Urgent = 2, Complete in August (the month of the newest request) = 5. Re-counted after test entries were added. | Pass: the tiles showed 9 / 2 / 5 at the start and 13 / 2 / 0 after the test entries, matching my count both times. | None needed |

## Known limitations

- There's no sign-in, so anyone with the link can view, add, and change requests.
- The same request can be submitted twice and both copies are saved; there's no duplicate check.
- Requests can't be edited or deleted from the page, only have their status changed.
- "Completed this month" follows the month of the newest request, so it drops to 0 as soon as the first request of a new month comes in, even though plenty was completed the month before.
- Sending a number instead of text for the name shows "Requester name is required." instead of a clearer "must be text" message.

## Assessment

[YOUR ASSESSMENT — about 250 words, in your own words. Ideas to draw on:
- Where AI moved fast: all five endpoints and the validation rules came together from the README's API contract in one pass, and they worked locally on the first test.
- An almost-right moment: after the first test entry, "Completed this month" dropped from 5 to 0, which looked like a bug. Checking the README showed it's correct: the tile follows the month of the newest request, and the test entry made that November.
- Another one: the Cloudflare setup quietly made a copy of the repo under a different GitHub account, so pushes to the original repo didn't deploy.
- What you'd prompt differently: ask for duplicate protection up front, and ask which repo and account a deploy tool will build from before connecting it.]
