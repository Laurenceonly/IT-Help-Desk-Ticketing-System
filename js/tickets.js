import { createTicket, getTickets, selectTickets } from './store.js';
import { clearMessage, element, formatDate, message, priorityBadge, statusLabel, ticketLink } from './ui.js';

const filters = document.querySelector('#filters');
const form = document.querySelector('#ticket-form');
const rows = document.querySelector('#ticket-rows');
const empty = document.querySelector('#tickets-empty');
const pageError = document.querySelector('#page-error');

const query = new URLSearchParams(location.search);
for (const field of ['status', 'priority', 'category', 'technician', 'sort']) {
  if (query.has(field) && [...filters.elements[field].options].some(option => option.value === query.get(field))) {
    filters.elements[field].value = query.get(field);
  }
}

function render() {
  try {
    clearMessage(pageError);
    const selected = selectTickets(getTickets(), Object.fromEntries(new FormData(filters)));
    rows.replaceChildren();
    document.querySelector('#result-count').textContent = `${selected.length} ticket${selected.length === 1 ? '' : 's'}`;
    empty.hidden = selected.length > 0;
    for (const ticket of selected) {
      const row = element('tr');
      const cells = Array.from({ length: 6 }, () => element('td'));
      cells[0].append(ticketLink(ticket));
      cells[1].textContent = ticket.category;
      cells[2].append(priorityBadge(ticket.priority));
      cells[3].append(statusLabel(ticket.status));
      cells[4].textContent = ticket.technician || 'Unassigned';
      if (!ticket.technician) cells[4].className = 'unassigned';
      cells[5].textContent = formatDate(ticket.dateCreated);
      row.append(...cells);
      rows.append(row);
    }
  } catch (error) { message(pageError, error.message, true); }
}

filters.addEventListener('input', render);
filters.addEventListener('change', render);
document.querySelector('#clear-filters').addEventListener('click', () => {
  filters.reset();
  history.replaceState(null, '', location.pathname + location.hash);
  render();
});
form.addEventListener('submit', event => {
  event.preventDefault();
  const feedback = document.querySelector('#form-message');
  try {
    const ticket = createTicket(Object.fromEntries(new FormData(form)));
    form.reset();
    message(feedback, `${ticket.id} created.`);
    location.href = `ticket-details.html?id=${encodeURIComponent(ticket.id)}`;
  } catch (error) { message(feedback, error.message, true); }
});
render();
