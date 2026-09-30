import type { ApiCartItem, CartItem, ChatResponse } from '../types/chat';
const baseUrl = import.meta.env.VITE_API_BASE_URL ?? '';
const endpoint = import.meta.env.VITE_CHAT_ENDPOINT ?? `${baseUrl}/api/v1/chat`;
const orderEndpoint = import.meta.env.VITE_ORDER_ENDPOINT ?? `${baseUrl}/api/v1/order`;
const fallbackTenantId = import.meta.env.VITE_TENANT_ID ?? 'test';
const sessionKey = 'gohu-session-id';
export const getSessionId = () => localStorage.getItem(sessionKey);
export const clearSessionId = () => localStorage.removeItem(sessionKey);
export function getTenantId() {
  const match = window.location.pathname.match(/^\/tenant\/([^/]+)/i);
  return match?.[1] ? decodeURIComponent(match[1]) : fallbackTenantId;
}
function requestHeaders() {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', 'X-Tenant-ID': getTenantId() };
  const sessionId = getSessionId();
  if (sessionId) headers['X-Session-ID'] = sessionId;
  return headers;
}
export async function sendMessage(message: string): Promise<ChatResponse> {
  let response: Response;
  try { response = await fetch(endpoint, { method: 'POST', headers: requestHeaders(), body: JSON.stringify({ message }) }); }
  catch { throw new Error('Unable to connect to the server. Please check your connection and try again.'); }
  if (!response.ok) throw new Error(response.status === 429 ? 'Too many requests. Please wait a moment and try again.' : 'Something went wrong while processing your request. Please try again.');
  const data = await response.json() as ChatResponse;
  const newSession = response.headers.get('X-Session-ID') ?? data.session_id;
  if (newSession) localStorage.setItem(sessionKey, newSession);
  // The deployed API uses camelCase cartItems and item_id/price. Normalize it once
  // at the network boundary so components only handle one predictable cart shape.
  const sourceItems: Array<CartItem | ApiCartItem> = data.cart_items ?? data.cartItems ?? [];
  const cartItems: CartItem[] = sourceItems.map((item) => {
    const unitPrice = 'unit_price' in item && item.unit_price != null ? item.unit_price : ('price' in item ? item.price ?? 0 : 0);
    const quantity = item.quantity ?? 0;
    return { id: ('id' in item ? item.id : undefined) ?? ('item_id' in item ? item.item_id : undefined) ?? item.name, name: item.name, quantity, unit_price: unitPrice, total_price: ('total_price' in item && item.total_price != null) ? item.total_price : unitPrice * quantity, unit: item.unit, category: item.category };
  });
  return { ...data, items: data.items ?? [], cart_items: cartItems, metadata: data.metadata ?? {} };
}

export async function submitOrder(name: string, mobileNumber: string, cartItems: CartItem[]) {
  const orderItems = cartItems.map((item) => ({ item_id: item.id, name: item.name, quantity: item.quantity, price: item.unit_price, unit: item.unit ?? null, category: item.category }));
  let response: Response;
  try { response = await fetch(orderEndpoint, { method: 'POST', headers: requestHeaders(), body: JSON.stringify({ name, mobile_number: mobileNumber, cart_items: orderItems }) }); }
  catch { throw new Error('Unable to connect to the order service. Please check your connection and try again.'); }
  if (!response.ok) {
    if (response.status === 404) throw new Error('Order submission is not available yet. Please try again later.');
    throw new Error('We could not submit your order. Please try again.');
  }
}
