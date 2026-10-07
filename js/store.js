import { canChangeStatus, STATUSES } from './status.js';

export const CATEGORIES = ['Hardware', 'Network', 'Software', 'Account'];
export const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];
export const TECHNICIANS = ['Alex Rivera', 'Jordan Lee', 'Sam Torres'];

const TICKETS_KEY = 'campus-it-tickets-v1';
const COUNTER_KEY = 'campus-it-ticket-counter-v1';
const MAX_NAME_LENGTH = 100;
const MAX_TEXT_LENGTH = 2000;

function readStorage(storage, key) {
  try {
    return storage.getItem(key);
  } catch {
    throw new Error('Tickets could not be loaded. Check browser storage settings.');
  }
}

function isValidDateString(value) {
  return typeof value === 'string' && Number.isFinite(Date.parse(value));
}

function isStoredNote(note) {
  return note && typeof note === 'object' &&
    typeof note.text === 'string' &&
    typeof note.author === 'string' &&
    isValidDateString(note.date);
}

function isStoredTicket(ticket) {
  return ticket && typeof ticket === 'object' &&
    /^TKT-\d+$/.test(ticket.id) &&
    typeof ticket.requester === 'string' &&
    CATEGORIES.includes(ticket.category) &&
    typeof ticket.description === 'string' &&
    PRIORITIES.includes(ticket.priority) &&
    STATUSES.includes(ticket.status) &&
    (ticket.technician === '' || TECHNICIANS.includes(ticket.technician)) &&
    isValidDateString(ticket.dateCreated) &&
    (ticket.dateResolved === null || isValidDateString(ticket.dateResolved)) &&
    Array.isArray(ticket.notes) && ticket.notes.every(isStoredNote);
}

export function getTickets(storage = localStorage) {
  const raw = readStorage(storage, TICKETS_KEY);
  if (!raw) return [];
  let tickets;
  try { tickets = JSON.parse(raw); }
  catch { throw new Error('Stored tickets could not be read. Browser data may be damaged.'); }
  if (!Array.isArray(tickets) || !tickets.every(isStoredTicket)) {
    throw new Error('Stored ticket data is invalid. Clear this site’s browser storage to start again.');
  }
  return tickets;
}

export function getTicket(id, storage = localStorage) {
  return getTickets(storage).find(ticket => ticket.id === id);
}

function saveTickets(tickets, storage) {
  try { storage.setItem(TICKETS_KEY, JSON.stringify(tickets)); }
  catch { throw new Error('Ticket could not be saved. Check browser storage settings or available space.'); }
}

function required(value, label, maxLength) {
  const result = String(value ?? '').trim();
  if (!result) throw new Error(`Enter ${label}.`);
  if (result.length > maxLength) throw new Error(`${label[0].toUpperCase()}${label.slice(1)} must be ${maxLength} characters or fewer.`);
  return result;
}

function toIsoString(value, label) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error(`${label} is invalid.`);
  return date.toISOString();
}

export function createTicket(input = {}, storage = localStorage, now = new Date()) {
  const requester = required(input.requester, 'a requester name', MAX_NAME_LENGTH);
  const description = required(input.description, 'a description', MAX_TEXT_LENGTH);
  if (!CATEGORIES.includes(input.category)) throw new Error('Choose a valid category.');
  if (!PRIORITIES.includes(input.priority)) throw new Error('Choose a valid priority.');
  const technician = input.technician || '';
  if (technician && !TECHNICIANS.includes(technician)) throw new Error('Choose a valid technician.');

  const tickets = getTickets(storage);
  const highestStored = tickets.reduce((highest, ticket) => {
    const match = String(ticket.id || '').match(/^TKT-(\d+)$/);
    return match ? Math.max(highest, Number(match[1])) : highest;
  }, 0);
  const counter = Number(readStorage(storage, COUNTER_KEY));
  const number = Math.max(Number.isSafeInteger(counter) && counter > 0 ? counter : 1, highestStored + 1);
  const ticket = {
    id: `TKT-${String(number).padStart(4, '0')}`, requester,
    category: input.category, description, priority: input.priority,
    status: 'Open', technician, dateCreated: toIsoString(now, 'Creation date'), dateResolved: null, notes: []
  };
  saveTickets([ticket, ...tickets], storage);
  try {
    storage.setItem(COUNTER_KEY, String(number + 1));
  } catch {
    // Ticket IDs also use the highest stored ID, so the counter is only an optimization.
  }
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
  const assignment = String(technician ?? '').trim();
  if (assignment && !TECHNICIANS.includes(assignment)) throw new Error('Choose a valid technician.');
  return updateTicket(id, ticket => ({ ...ticket, technician: assignment }), storage);
}

export function changeStatus(id, newStatus, storage = localStorage, now = new Date()) {
  return updateTicket(id, ticket => {
    const result = canChangeStatus(ticket.status, newStatus, ticket.technician);
    if (!result.allowed) throw new Error(result.message);
    return {
      ...ticket,
      status: newStatus,
      dateResolved: newStatus === 'Resolved' ? toIsoString(now, 'Resolution date')
        : newStatus === 'In Progress' ? null : ticket.dateResolved
    };
  }, storage);
}

export function addNote(id, input = {}, storage = localStorage, now = new Date()) {
  const text = required(input.text, 'a note', MAX_TEXT_LENGTH);
  const author = required(input.author, 'your name', MAX_NAME_LENGTH);
  return updateTicket(id, ticket => ({
    ...ticket,
    notes: [{ text, author, date: toIsoString(now, 'Note date') }, ...(ticket.notes || [])]
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
