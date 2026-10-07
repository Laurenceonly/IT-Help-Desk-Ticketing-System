# Campus IT Service Desk

A browser-based IT help desk for campus staff, students, and technicians. It uses HTML, CSS, and JavaScript for the interface, with localStorage for ticket data. Node.js is used only to serve the files locally and run tests; there is no backend or database service.

## Run locally

With Node.js 18 or newer:

```powershell
node server.mjs
```

Open <http://127.0.0.1:3000>. Do not open the HTML files directly with `file://`, because browsers may block JavaScript module imports there. To run the domain tests:

```powershell
node --test
```

## Features

- Create numbered tickets that start Open.
- Assign one of three technicians and follow the allowed status transitions.
- Record resolution dates and elapsed days, and reopen a ticket when needed.
- Add dated notes, displayed newest first.
- Search descriptions; filter by status, priority, category, and technician; sort by date or priority.
- View live dashboard counts, including unassigned Open tickets.

Data is stored only in the current browser on the current device. Clearing browser storage removes the tickets. This is suitable for a school demonstration, but it is not shared between users or devices.

See `docs/requirements.md` and `docs/scenario-analysis.md` for the scenario and acceptance criteria.
