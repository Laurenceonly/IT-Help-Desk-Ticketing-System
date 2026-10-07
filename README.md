# Campus IT Service Desk

A browser-based ticketing system for tracking campus IT requests from submission to closure. It has a dashboard, a searchable ticket list, and a detail page for managing each ticket.

## Run locally

Install Node.js 18 or newer, then run:

```powershell
npm start
```

Open <http://127.0.0.1:3000>. You can also start the server with `node server.mjs`. Keep the server running while using the app. Open it through the local server rather than opening an HTML file with `file://`, which can block JavaScript modules.

Run the automated domain tests with:

```powershell
npm test
```

No dependency installation or build step is required.

## How the system works

1. **Review the dashboard.** It shows counts for Open, In Progress, Resolved, and Closed tickets, highlights Open tickets without an owner, and lists the five newest tickets. The links take you to the relevant ticket list or detail page.
2. **Create a ticket.** Select **New ticket** on the dashboard or ticket list. A dialog asks for the requester's name, category, priority, and issue description. Assigning a technician is optional. Saving creates the next `TKT-0001` style number, records the current date and time, sets the status to **Open**, and opens the new ticket's detail page.
3. **Find a ticket.** On **Tickets**, search description text, combine status, priority, category, and technician filters, or sort by newest, oldest, or priority. **Clear filters** returns to the full list. Select a ticket number to open its detail page.
4. **Manage the ticket.** On the detail page, select a technician and choose **Save assignment**. To advance the ticket, choose a status and select **Update status**. The page shows the allowed next status and rejects invalid changes with an explanation.
5. **Record updates.** Select **Add note** on the detail page. Enter your name and an update in the dialog. Saved notes include their author and date and appear newest first.

### Status rules

| Current status | Allowed next status | Rule |
| --- | --- | --- |
| Open | In Progress | Assign a technician first. |
| In Progress | Resolved | Records the resolution date. |
| Resolved | Closed | Keeps the resolution date. |
| Resolved | In Progress | Reopens the ticket and clears its active resolution date. |
| Closed | None | No further status changes. |

The detail page shows the resolution date and elapsed days after a ticket is resolved. Elapsed days are 24-hour periods rounded up. A rejected status change leaves the ticket unchanged.

## Stack and data

- **Interface:** HTML, CSS, and browser JavaScript modules. The responsive layout uses the device's system font, including San Francisco on Apple devices.
- **Application logic:** JavaScript modules handle ticket validation, numbering, filtering, dashboard counts, notes, and status rules.
- **Storage:** Browser `localStorage` holds tickets and the next ticket number. Data persists across page reloads in the same browser and site origin.
- **Local server:** Node.js serves the static files. There is no backend API, database, sign-in, or shared account system.

Tickets are local to one browser profile on one device. Clearing this site's browser storage removes them, and another browser or device will have a separate ticket list. Use sample data for demonstrations rather than treating this as a shared production help desk.

The source scenario and acceptance checks are in [scenario analysis](docs/scenario-analysis.md) and [requirements](docs/requirements.md).
