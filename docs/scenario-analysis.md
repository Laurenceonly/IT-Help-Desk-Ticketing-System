# Scenario analysis: IT Help Desk Ticketing System

## Problem and users

Campus IT receives reports on paper and through messages. Reports can be lost, urgency is unclear, and ownership is hard to track. The application gives each request a ticket number and a visible path from submission to closure.

Staff and students submit tickets. IT technicians are assigned tickets, record notes, and update progress. The IT office needs a dashboard showing workload and unassigned requests.

## Ticket lifecycle

1. A requester supplies a name, category, description, and priority. The system creates a unique `TKT-0001` style number, records the creation date, and sets the status to **Open**.
2. A technician may be assigned at creation or afterward.
3. **Open → In Progress** requires an assigned technician.
4. **In Progress → Resolved** records the resolution date and allows elapsed days to be displayed.
5. **Resolved → Closed** finishes the ticket. **Resolved → In Progress** reopens it when the fix did not work.
6. All other status changes are rejected with a useful error and leave the ticket unchanged.

| Current status | Allowed next status | Additional rule |
| --- | --- | --- |
| Open | In Progress | A technician must be assigned. |
| In Progress | Resolved | Save the resolution date. |
| Resolved | Closed | Retain the resolution date. |
| Resolved | In Progress | Clear the active resolution date. |
| Closed | None | No further changes. |

The scenario specifies one resolution date. Clearing it on reopen ties that field to the current resolution; a complete history would need a separate audit log.

## Data and screens

Each ticket stores its number, requester name, category, description, priority, status, assigned technician, creation date, optional resolution date, and notes. Each note stores text, author, and date, and the newest appears first.

- **Ticket list:** filter by status, priority, category, and technician; search descriptions; sort by priority with Critical first or by date.
- **Ticket detail:** show all ticket information, assignment, status controls, resolution time, and notes.
- **Dashboard:** count Open, In Progress, Resolved, and Closed tickets, plus Open tickets without an assigned technician.
- **Submission:** collect required fields and create an Open ticket automatically.

## Assumptions and limits

- Use the suggested HTML, CSS, JavaScript, and localStorage stack unless a later project decision changes it. LocalStorage is browser-specific and is only suitable for a school demonstration.
- Provide at least three placeholder technicians until actual names are supplied.
- Use the scenario's sample formula for resolution days: elapsed 24-hour periods rounded up.
- Authentication and per-user visibility are outside the scenario. A demonstration may show all tickets, but real personal information would need access controls.
- Build and commit the basic application on `main`. Add the status validation on `feature/status-rules` and review it through a pull request.

## Implementation risks

- Ticket numbers must not be reused after deletion or malformed stored data.
- Every status update path must run the same validation, and a failed change must preserve status and dates.
- Descriptions and notes should be rendered as text so user input cannot run as HTML.
