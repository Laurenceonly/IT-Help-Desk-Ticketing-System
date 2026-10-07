# Requirements: IT Help Desk Ticketing System

Source: `Scenario_2_IT_Help_Desk_Ticketing_System.md` supplied for this project. Each requirement includes a check for later review.

| ID | Requirement | Acceptance check |
| --- | --- | --- |
| R01 | Create a ticket with requester name, category, description, and priority. | A valid submission appears in the ticket list and detail page. |
| R02 | Generate a unique `TKT-0001` style number. | Successive tickets have distinct, increasing numbers. |
| R03 | Start each ticket as Open and record its creation date. | A new ticket shows Open and a creation timestamp. |
| R04 | Offer Hardware, Network, Software, and Account categories. | Only these categories can be saved. |
| R05 | Offer Low, Medium, High, and Critical priorities. | Only these priorities can be saved. |
| R06 | Allow assignment from at least three technicians. | A saved assignment appears on the ticket. |
| R07 | Enforce the allowed status changes. | Open → In Progress → Resolved → Closed and Resolved → In Progress succeed; other moves fail with an error. |
| R08 | Require a technician to enter In Progress. | An unassigned Open ticket stays Open and shows an assignment message. |
| R09 | Record resolution date and elapsed days. | Resolving a ticket displays both values. |
| R10 | Add dated notes with an author. | Notes appear newest first on the detail page. |
| R11 | Filter by status, priority, category, and technician. | Each filter narrows the list and can be combined. |
| R12 | Search words in descriptions. | Matching descriptions appear; nonmatching descriptions do not. |
| R13 | Sort by priority or date. | Priority is Critical, High, Medium, Low; date order is consistent. |
| R14 | Show dashboard counts. | Counts for all four statuses and unassigned Open tickets match the stored data. |
| R15 | Provide ticket list, ticket detail, and dashboard pages. | Each page is reachable and shows the required information. |

## Data rules

- A ticket requires a number, requester name, category, description, priority, status, and creation date. Technician and resolution date may be empty. Notes begin empty.
- A rejected status change leaves status and dates unchanged.
- Closing retains the resolution date. Reopening clears the active resolution date so a later resolution records a new one.
- Notes require nonempty text and author; the system supplies the date.

## Delivery stages

1. Commit and push the prompt log, requirements, and scenario analysis on `main`.
2. Build the basic application on `main` and commit it before branching.
3. Add status rules and focused tests on `feature/status-rules`.
4. Push the feature branch and open a pull request against `main`.
