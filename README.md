# Campus IT Service Desk

A browser-based ticketing prototype for tracking campus IT requests from submission to closure. It brings ticket intake, assignment, status changes, notes, and a dashboard into one interface.

## Highlights

- Dashboard with ticket counts, unassigned requests, and recent activity.
- Searchable ticket list with status, priority, category, and technician filters.
- Ticket details with technician assignment, status history, and dated notes.
- Defined status transitions that prevent invalid changes.
- Automated checks for the application's ticket rules.

## Tech stack

HTML, CSS, and JavaScript modules power the interface and ticket logic. A small Node.js server serves the static files. Ticket data is stored in the browser with `localStorage`.

## Scope

This is a single-browser prototype. It has no shared database, backend API, or sign-in system, so tickets do not sync between users or devices. Sample data is appropriate for demonstrations.

The [scenario analysis](docs/scenario-analysis.md) and [requirements](docs/requirements.md) document the problem and acceptance checks.
