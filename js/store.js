import { canChangeStatus, STATUSES } from './status.js';

export const CATEGORIES = ['Hardware', 'Network', 'Software', 'Account'];
export const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];
export const TECHNICIANS = ['Alex Rivera', 'Jordan Lee', 'Sam Torres'];

const TICKETS_KEY = 'campus-it-tickets-v1';
const COUNTER_KEY = 'campus-it-ticket-counter-v1';

export function getTickets(storage = localStorage) {
  const raw = storage.getItem(TICKETS_KEY);
  if (!raw) return [];
  let tickets;
  try { tickets = JSON.parse(raw); }
  catch { throw new Error('Stored tickets could not be read. Browser data may be damaged.'); }
  if (!Array.isArray(tickets)) throw new Error('Stored tickets are invalid.');
  return tickets;
}

export function getTicket(id, storage = localStorage) {
  return getTickets(storage).find(ticket => ticket.id === id);
}

function saveTickets(tickets, storage) {
  try { storage.setItem(TICKETS_KEY, JSON.stringify(tickets)); }
  catch { throw new Error('Ticket could not be saved. Check browser storage settings or available space.'); }
}

function required(value, label) {
  const result = String(value ?? '').trim();
  if (!result) throw new Error(`Enter ${label}.`);
  return result;
}

export function createTicket(input, storage = localStorage, now = new Date()) {
  const requester = required(input.requester, 'a requester name');
  const description = required(input.description, 'a description');
  if (!CATEGORIES.includes(input.category)) throw new Error('Choose a valid category.');
  if (!PRIORITIES.includes(input.priority)) throw new Error('Choose a valid priority.');
  const technician = input.technician || '';
  if (technician && !TECHNICIANS.includes(technician)) throw new Error('Choose a valid technician.');

  const tickets = getTickets(storage);
  const highestStored = tickets.reduce((highest, ticket) => {
    const match = String(ticket.id || '').match(/^TKT-(\d+)$/);
    return match ? Math.max(highest, Number(match[1])) : highest;
  }, 0);
  const counter = Number(storage.getItem(COUNTER_KEY));
  const number = Math.max(Number.isSafeInteger(counter) && counter > 0 ? counter : 1, highestStored + 1);
  const ticket = {
    id: `TKT-${String(number).padStart(4, '0')}`, requester,
    category: input.category, description, priority: input.priority,
    status: 'Open', technician, dateCreated: now.toISOString(), dateResolved: null, notes: []
  };
  saveTickets([ticket, ...tickets], storage);
  storage.setItem(COUNTER_KEY, String(number + 1));
  return ticket;
}

function updateTicket(id, transform, storage) {
  const tickets = getTickets(storage);
  const index = tickets.findIndex(ticket => ticket.id === id);
  if (index < 0) throw new Error('Ticket not found.');
  const updated = transform(tickets[index]);
  tickets[index] = updated;
  saveTickets(tickets, storage);
  return updated;
}

export function assignTechnician(id, technician, storage = localStorage) {
  if (technician && !TECHNICIANS.includes(technician)) throw new Error('Choose a valid technician.');
  return updateTicket(id, ticket => ({ ...ticket, technician }), storage);
}

export function changeStatus(id, newStatus, storage = localStorage, now = new Date()) {
  return updateTicket(id, ticket => {
    const result = canChangeStatus(ticket.status, newStatus, ticket.technician);
    if (!result.allowed) throw new Error(result.message);
    return {
      ...ticket,
      status: newStatus,
      dateResolved: newStatus === 'Resolved' ? now.toISOString()
        : newStatus === 'In Progress' ? null : ticket.dateResolved
    };
  }, storage);
}

export function addNote(id, input, storage = localStorage, now = new Date()) {
  const text = required(input.text, 'a note');
  const author = required(input.author, 'your name');
  return updateTicket(id, ticket => ({
    ...ticket,
    notes: [{ text, author, date: now.toISOString() }, ...(ticket.notes || [])]
  }), storage);
}

export function selectTickets(tickets, filters = {}) {
  const term = String(filters.description || '').trim().toLocaleLowerCase();
  const priorityRank = { Critical: 0, High: 1, Medium: 2, Low: 3 };
  return tickets.filter(ticket =>
    (!filters.status || ticket.status === filters.status) &&
    (!filters.priority || ticket.priority === filters.priority) &&
    (!filters.category || ticket.category === filters.category) &&
    (!filters.technician || (filters.technician === 'unassigned' ? !ticket.technician : ticket.technician === filters.technician)) &&
    (!term || ticket.description.toLocaleLowerCase().includes(term))
  ).sort((a, b) => {
    if (filters.sort === 'priority') {
      const difference = priorityRank[a.priority] - priorityRank[b.priority];
      if (difference) return difference;
    }
    const dateDifference = new Date(b.dateCreated) - new Date(a.dateCreated);
    return filters.sort === 'oldest' ? -dateDifference : dateDifference;
  });
}

export function dashboardCounts(tickets) {
  const counts = Object.fromEntries(STATUSES.map(status => [status, 0]));
  counts.unassignedOpen = 0;
  for (const ticket of tickets) {
    if (ticket.status in counts) counts[ticket.status]++;
    if (ticket.status === 'Open' && !ticket.technician) counts.unassignedOpen++;
  }
  return counts;
}
