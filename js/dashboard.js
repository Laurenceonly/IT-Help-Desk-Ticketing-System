import { dashboardCounts, getTickets, selectTickets } from './store.js';
import { element, message, priorityBadge, statusLabel, ticketLink } from './ui.js';

try {
  const tickets = getTickets();
  const counts = dashboardCounts(tickets);
  for (const [name, count] of Object.entries(counts)) {
    document.querySelector(`[data-count="${name}"]`).textContent = count;
  }
  document.querySelector('#attention-heading').lastChild.textContent =
    ` open ticket${counts.unassignedOpen === 1 ? '' : 's'} need${counts.unassignedOpen === 1 ? 's' : ''} an owner`;
  document.querySelector('#attention-panel').hidden = counts.unassignedOpen === 0;
  const recent = document.querySelector('#recent-tickets');
  const latest = selectTickets(tickets).slice(0, 5);
  document.querySelector('#recent-empty').hidden = latest.length > 0;
  for (const ticket of latest) {
    const row = element('tr');
    const cells = Array.from({ length: 5 }, () => element('td'));
    cells[0].append(ticketLink(ticket));
    cells[1].textContent = ticket.category;
    cells[2].append(priorityBadge(ticket.priority));
    cells[3].append(statusLabel(ticket.status));
    cells[4].textContent = ticket.technician || 'Unassigned';
    if (!ticket.technician) cells[4].className = 'unassigned';
    row.append(...cells);
    recent.append(row);
  }
} catch (error) {
  message(document.querySelector('#page-error'), error.message, true);
}

window.addEventListener('storage', () => location.reload());
