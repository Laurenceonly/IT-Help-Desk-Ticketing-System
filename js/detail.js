import { addNote, assignTechnician, changeStatus, getTicket } from './store.js';
import { getResolutionDays, nextStatuses, STATUSES } from './status.js';
import { clearMessage, connectDialog, element, formatDate, message, statusLabel } from './ui.js';

const id = new URLSearchParams(location.search).get('id');
const content = document.querySelector('#ticket-content');
const missing = document.querySelector('#missing-ticket');
const pageError = document.querySelector('#page-error');
const assignmentForm = document.querySelector('#assignment-form');
const statusForm = document.querySelector('#status-form');
const noteForm = document.querySelector('#note-form');
const noteDialog = document.querySelector('#note-dialog');
connectDialog(noteDialog, [document.querySelector('#open-note-dialog')]);

function put(selector, text) { document.querySelector(selector).textContent = text; }

function render() {
  try {
    clearMessage(pageError);
    const ticket = getTicket(id);
    missing.hidden = Boolean(ticket);
    content.hidden = !ticket;
    if (!ticket) return;

    document.title = `${ticket.id} · Campus IT Desk`;
    put('#ticket-title', `Ticket ${ticket.id}`);
    put('#ticket-requester-summary', ticket.requester);
    put('#ticket-created-summary', formatDate(ticket.dateCreated));
    put('#ticket-description', ticket.description);
    put('#detail-category', ticket.category);
    put('#detail-resolved', formatDate(ticket.dateResolved));
    put('#detail-technician', ticket.technician || 'Unassigned');
    const days = getResolutionDays(ticket.dateCreated, ticket.dateResolved);
    put('#detail-days', days === null ? 'Not resolved' : `Resolved in ${days} day${days === 1 ? '' : 's'}`);
    const priority = document.querySelector('#detail-priority');
    priority.className = `badge priority-${ticket.priority.toLowerCase()}`;
    priority.textContent = ticket.priority;
    const currentStatus = document.querySelector('#ticket-status');
    currentStatus.replaceChildren(...statusLabel(ticket.status).childNodes);
    currentStatus.className = 'status status-large';
    document.querySelector('#technician').value = ticket.technician || '';

    const statusSelect = document.querySelector('#new-status');
    const options = nextStatuses(ticket.status);
    statusSelect.replaceChildren(new Option('Choose a status', ''), ...STATUSES.map(value => new Option(value, value)));
    statusSelect.value = '';
    put('#status-help', ticket.status === 'Open' && !ticket.technician
      ? 'Assign a technician before changing this ticket to In Progress.'
      : ticket.status === 'Closed' ? 'Closed tickets cannot change status.'
      : `Allowed next: ${options.join(' or ')}.`);
    document.querySelector('#reopen-help').hidden = ticket.status !== 'Resolved';
    document.querySelectorAll('#status-flow li').forEach((item, index) => {
      item.classList.toggle('current', STATUSES[index] === ticket.status);
      item.classList.toggle('completed', index < STATUSES.indexOf(ticket.status));
    });

    const notes = document.querySelector('#notes');
    notes.replaceChildren();
    const ordered = [...(ticket.notes || [])].sort((a, b) => new Date(b.date) - new Date(a.date));
    put('#note-count', `${ordered.length} note${ordered.length === 1 ? '' : 's'}`);
    document.querySelector('#notes-empty').hidden = ordered.length > 0;
    for (const note of ordered) {
      const card = element('article', 'note');
      const body = element('p', '', note.text);
      const meta = element('div', 'note-meta');
      meta.append(element('strong', '', note.author), element('span', '', formatDate(note.date)));
      card.append(body, meta);
      notes.append(card);
    }
  } catch (error) { content.hidden = true; message(pageError, error.message, true); }
}

assignmentForm.addEventListener('submit', event => {
  event.preventDefault();
  const feedback = document.querySelector('#assignment-message');
  try {
    assignTechnician(id, new FormData(assignmentForm).get('technician'));
    clearMessage(document.querySelector('#status-message'));
    message(feedback, 'Technician assignment saved.');
    render();
  } catch (error) { message(feedback, error.message, true); }
});

statusForm.addEventListener('submit', event => {
  event.preventDefault();
  const feedback = document.querySelector('#status-message');
  try {
    changeStatus(id, new FormData(statusForm).get('status'));
    message(feedback, 'Status updated successfully.');
    render();
  } catch (error) { message(feedback, error.message, true); }
});

noteForm.addEventListener('submit', event => {
  event.preventDefault();
  const feedback = document.querySelector('#note-message');
  try {
    addNote(id, Object.fromEntries(new FormData(noteForm)));
    noteForm.reset();
    clearMessage(feedback);
    noteDialog.close();
    message(document.querySelector('#note-success'), 'Note added.');
    render();
  } catch (error) { message(feedback, error.message, true); }
});

render();
window.addEventListener('storage', render);
