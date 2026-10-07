import test from 'node:test';
import assert from 'node:assert/strict';
import { canChangeStatus, getResolutionDays } from '../js/status.js';
import { addNote, assignTechnician, changeStatus, createTicket, dashboardCounts, getTicket, getTickets, selectTickets } from '../js/store.js';

function memoryStorage() {
  const data = new Map();
  return {
    getItem: key => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, String(value))
  };
}

function makeTicket(storage, overrides = {}, when = '2026-10-01T00:00:00.000Z') {
  return createTicket({ requester: 'Maria Santos', category: 'Network',
    description: 'Wi-Fi drops in the library', priority: 'High', ...overrides }, storage, new Date(when));
}

test('creation generates numbers, validates fields, and starts Open', () => {
  const storage = memoryStorage();
  const first = makeTicket(storage);
  const second = makeTicket(storage);
  assert.equal(first.id, 'TKT-0001');
  assert.equal(second.id, 'TKT-0002');
  assert.equal(first.status, 'Open');
  assert.equal(first.dateResolved, null);
  assert.equal(getTickets(storage).length, 2);
  assert.throws(() => makeTicket(storage, { category: 'Other' }), /valid category/);
  assert.throws(() => makeTicket(storage, { requester: ' ' }), /requester name/);
});

test('status rules require assignment and reject skipped or backward moves', () => {
  const storage = memoryStorage();
  const ticket = makeTicket(storage);
  assert.deepEqual(canChangeStatus('Open', 'In Progress', ''), {
    allowed: false, message: 'Assign a technician before changing the ticket to In Progress.'
  });
  assert.throws(() => changeStatus(ticket.id, 'In Progress', storage), /Assign a technician/);
  assert.throws(() => changeStatus(ticket.id, 'Closed', storage), /Open to Closed/);
  assert.equal(getTicket(ticket.id, storage).status, 'Open');
  assignTechnician(ticket.id, 'Alex Rivera', storage);
  changeStatus(ticket.id, 'In Progress', storage);
  assert.throws(() => changeStatus(ticket.id, 'Closed', storage), /In Progress to Closed/);
  assert.equal(getTicket(ticket.id, storage).status, 'In Progress');
});

test('resolve, reopen, resolve again, and close update the active resolution date', () => {
  const storage = memoryStorage();
  const ticket = makeTicket(storage, { technician: 'Jordan Lee' });
  changeStatus(ticket.id, 'In Progress', storage);
  changeStatus(ticket.id, 'Resolved', storage, new Date('2026-10-03T12:00:00.000Z'));
  assert.equal(getResolutionDays(ticket.dateCreated, getTicket(ticket.id, storage).dateResolved), 3);
  changeStatus(ticket.id, 'In Progress', storage);
  assert.equal(getTicket(ticket.id, storage).dateResolved, null);
  changeStatus(ticket.id, 'Resolved', storage, new Date('2026-10-04T00:00:00.000Z'));
  changeStatus(ticket.id, 'Closed', storage);
  assert.equal(getTicket(ticket.id, storage).dateResolved, '2026-10-04T00:00:00.000Z');
  assert.throws(() => changeStatus(ticket.id, 'Open', storage), /Closed to Open/);
});

test('reopening also requires a technician', () => {
  const storage = memoryStorage();
  const ticket = makeTicket(storage, { technician: 'Jordan Lee' });
  changeStatus(ticket.id, 'In Progress', storage);
  changeStatus(ticket.id, 'Resolved', storage, new Date('2026-10-02T00:00:00.000Z'));
  assignTechnician(ticket.id, '', storage);
  assert.throws(() => changeStatus(ticket.id, 'In Progress', storage), /Assign a technician/);
  assert.equal(getTicket(ticket.id, storage).status, 'Resolved');
  assert.equal(getTicket(ticket.id, storage).dateResolved, '2026-10-02T00:00:00.000Z');
});

test('notes keep author and date, and filters and dashboard reflect tickets', () => {
  const storage = memoryStorage();
  const first = makeTicket(storage, { priority: 'Low' }, '2026-10-02T00:00:00.000Z');
  makeTicket(storage, { priority: 'Critical', category: 'Hardware', description: 'Broken desktop', technician: 'Sam Torres' }, '2026-10-01T00:00:00.000Z');
  addNote(first.id, { text: 'Checking signal', author: 'Alex' }, storage, new Date('2026-10-02T01:00:00.000Z'));
  addNote(first.id, { text: 'Restarted access point', author: 'Alex' }, storage, new Date('2026-10-02T02:00:00.000Z'));
  assert.deepEqual(getTicket(first.id, storage).notes.map(note => note.text), ['Restarted access point', 'Checking signal']);
  const tickets = getTickets(storage);
  assert.deepEqual(selectTickets(tickets, { sort: 'priority' }).map(ticket => ticket.priority), ['Critical', 'Low']);
  assert.deepEqual(selectTickets(tickets, { sort: 'newest' }).map(ticket => ticket.priority), ['Low', 'Critical']);
  assert.deepEqual(selectTickets(tickets, { description: 'WI-FI', technician: 'unassigned' }).map(ticket => ticket.id), [first.id]);
  assert.equal(selectTickets(tickets, { category: 'Hardware', priority: 'Critical' }).length, 1);
  assert.equal(dashboardCounts(tickets).Open, 2);
  assert.equal(dashboardCounts(tickets).unassignedOpen, 1);
});

test('domain validation rejects oversized text and invalid dates', () => {
  const storage = memoryStorage();
  assert.throws(() => makeTicket(storage, { requester: 'x'.repeat(101) }), /100 characters or fewer/);
  assert.throws(() => makeTicket(storage, { description: 'x'.repeat(2001) }), /2000 characters or fewer/);
  assert.throws(() => createTicket({}, storage), /requester name/);
  assert.throws(() => makeTicket(storage, {}, 'not-a-date'), /Creation date is invalid/);

  const ticket = makeTicket(storage);
  assert.throws(() => addNote(ticket.id, { author: 'Alex', text: 'x'.repeat(2001) }, storage), /2000 characters or fewer/);
  assert.throws(() => addNote(ticket.id, { author: 'Alex', text: 'Update' }, storage, new Date('invalid')), /Note date is invalid/);
  assert.equal(getResolutionDays('2026-10-03T00:00:00.000Z', '2026-10-02T00:00:00.000Z'), null);
});

test('damaged or unavailable storage produces a useful error', () => {
  const malformed = memoryStorage();
  malformed.setItem('campus-it-tickets-v1', JSON.stringify([{ id: 'TKT-0001' }]));
  assert.throws(() => getTickets(malformed), /Stored ticket data is invalid/);

  const unavailable = { getItem() { throw new Error('denied'); } };
  assert.throws(() => getTickets(unavailable), /Check browser storage settings/);
});
