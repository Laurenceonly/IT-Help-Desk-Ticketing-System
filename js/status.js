export const STATUSES = ['Open', 'In Progress', 'Resolved', 'Closed'];

const transitions = {
  Open: ['In Progress'],
  'In Progress': ['Resolved'],
  Resolved: ['Closed', 'In Progress'],
  Closed: []
};

export function canChangeStatus(currentStatus, newStatus, assignedTechnician) {
  if (newStatus === 'In Progress' && transitions[currentStatus]?.includes(newStatus) && !assignedTechnician) {
    return { allowed: false, message: 'Assign a technician before changing the ticket to In Progress.' };
  }
  if (!transitions[currentStatus]?.includes(newStatus)) {
    return { allowed: false, message: `Status cannot be changed from ${currentStatus} to ${newStatus}.` };
  }
  return { allowed: true, message: 'Status updated successfully.' };
}

export function nextStatuses(currentStatus) { return transitions[currentStatus] || []; }

export function getResolutionDays(dateCreated, dateResolved) {
  if (!dateResolved) return null;
  const elapsed = new Date(dateResolved) - new Date(dateCreated);
  return Number.isFinite(elapsed) && elapsed >= 0 ? Math.ceil(elapsed / 86400000) : null;
}
