export function formatDate(value) {
  if (!value) return 'Not resolved';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown date';
  return new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

export function element(tag, className, content) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (content !== undefined) node.textContent = content;
  return node;
}

export function priorityBadge(priority) {
  return element('span', `badge priority-${priority.toLowerCase()}`, priority);
}

export function statusLabel(status) {
  const node = element('span', 'status');
  const dotName = { Open: 'open', 'In Progress': 'progress', Resolved: 'resolved', Closed: 'closed' }[status] || 'closed';
  node.append(element('i', `dot dot-${dotName}`), document.createTextNode(status));
  return node;
}

export function ticketLink(ticket) {
  const link = element('a', 'ticket-link', ticket.id);
  link.href = `ticket-details.html?id=${encodeURIComponent(ticket.id)}`;
  link.append(element('span', '', ticket.description));
  return link;
}

export function message(node, text, error = false) {
  node.textContent = text;
  node.classList.toggle('is-error', error);
  node.hidden = false;
}

export function clearMessage(node) {
  node.textContent = '';
  node.hidden = true;
}
