# Campus IT Service Desk

Campus IT Service Desk is a browser-based ticketing prototype for a campus help desk. Staff and students can report hardware, network, software, and account issues. The desk can see which open tickets need an owner, assign a technician, and track each request through resolution and closure.

## Run locally

With Node.js 18 or newer, run `npm start` from the repository root and open <http://127.0.0.1:3000>. The app uses built-in Node.js modules and requires zero dependency installs, API keys, or external services.

Run `npm test` to check ticket creation, technician assignment, status changes, resolution timing, notes, filters, and dashboard counts.

## Work a ticket

1. Select **New ticket** and enter the requester’s name, category, priority, and a description. The app creates a ticket number such as `TKT-0001` and sets the status to **Open**.
2. Use the dashboard to find recent tickets and open tickets without a technician. In **Tickets**, search descriptions, combine filters for status, priority, category, and technician, or sort by date or priority.
3. Open a ticket to assign a technician, update its status, and add notes. Each note shows its author and timestamp, with the newest first.

| Transition | What happens |
| --- | --- |
| Open → In Progress | Requires an assigned technician. |
| In Progress → Resolved | Records the resolution date and displays elapsed days since creation. |
| Resolved → In Progress | Reopens the ticket and clears its previous resolution date. |
| Resolved → Closed | Keeps the resolution date and ends the status workflow. |

## Data and repository layout

This prototype stores tickets and notes in the browser’s `localStorage`. Each browser profile and site origin has its own ticket list. Clearing the site’s storage removes that list. Use sample data for demonstrations.

| Path | Purpose |
| --- | --- |
| [`index.html`](index.html), [`tickets.html`](tickets.html), [`ticket-details.html`](ticket-details.html) | Dashboard, ticket list, and ticket detail. |
| [`css/`](css/), [`logo.svg`](logo.svg) | Shared styles and branding. |
| [`js/`](js/) | Page logic, browser storage, and status rules. |
| [`server.mjs`](server.mjs), [`package.json`](package.json) | Local static server and npm commands. |
| [`tests/`](tests/) | Automated ticket workflow tests. |
| [`docs/`](docs/) | Project requirements, scenario analysis, and course documentation. |
