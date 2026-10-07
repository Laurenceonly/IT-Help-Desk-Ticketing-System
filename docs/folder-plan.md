# Folder plan before UI work

The current source tree and framework must be inspected before creating framework-specific application folders. The intended responsibilities are:

```text
docs/                  Scenario analysis and decisions
ticket domain/         Ticket types, categories, priorities, statuses, transition rules
data/                  Ticket and note storage, ticket-number generation, technician list
ticket feature/        Submission, assignment, notes, search, filters, sorting
dashboard feature/     Status counts and unassigned Open count
UI/                    Ticket list, detail, submission, dashboard (later step)
tests/                 Transition and data-behavior checks using project conventions
```

These are responsibilities, not final directory names. Once the repository is readable, map them to its existing framework conventions and create only the needed folders. The status-rule branch should contain the domain rule, the call site that enforces it, meaningful tests, and a concise pull request description.
