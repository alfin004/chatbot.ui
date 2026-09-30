import type { PendingCommand } from '../types/chat';
export function buildItemCommand(action: 'ADD' | 'REMOVE' | 'UPDATE', itemName: string, quantity: number) {
  const name = itemName.toLowerCase();
  // Keep the product name unchanged for the LLM. The optional plural marker is
  // deliberately separated, so "Butter Chicken" is never changed to a word it
  // might interpret as a different menu item.
  const plural = quantity === 1 ? '' : ' (s)';
  if (action === 'ADD') return `I want ${quantity} ${name}${plural}`;
  if (action === 'REMOVE') return `remove ${quantity} ${name}${plural}`;
  return `update ${name} to ${quantity}`;
}
export function commandFor(action: 'ADD' | 'REMOVE', itemName: string, previous: PendingCommand | null): { command: string; pending: PendingCommand } {
  const quantity = previous?.action === action && previous.itemName === itemName ? (previous.quantity ?? 0) + 1 : 1;
  return { command: buildItemCommand(action, itemName, quantity), pending: { action, itemName, quantity } };
}
