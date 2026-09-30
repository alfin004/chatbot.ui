export type Intent = 'GREETING' | 'THANKS' | 'HELP' | 'ADD' | 'REMOVE' | 'UPDATE' | 'LIST' | 'CLEAR_CART' | 'CHECKOUT' | 'CANCEL_ORDER' | 'ORDER_STATUS' | 'UNKNOWN' | string;
export interface ChatRequest { message: string }
export interface CartItem { id: string; name: string; quantity: number; unit_price: number; total_price: number; unit?: string | null; category?: string }
export interface MenuItem { id: string; name: string; price: number; quantity?: number; image?: string; unit?: string; category?: string; stock?: number; available?: boolean; keywords?: string[] }
export interface ApiCartItem { item_id?: string; id?: string; name: string; quantity: number; price?: number; unit_price?: number; total_price?: number; unit?: string | null; category?: string }
export interface ChatResponse { success: boolean; session_id?: string; status?: string; intent?: Intent; target?: 'CART' | 'MENU' | null; message?: string; items?: MenuItem[]; cart_items?: CartItem[]; cartItems?: ApiCartItem[]; cart?: { subtotal?: number; total_amount?: number; item_count?: number; total_quantity?: number; [key: string]: unknown }; metadata?: Record<string, unknown>;links?: Array<{ label: string; url: string;}> }
export interface PendingCommand { action: 'ADD' | 'REMOVE' | 'UPDATE' | null; itemId?: string; itemName?: string; quantity?: number }
export type ConversationMessage = { id: string; role: 'user' | 'assistant'; content: string; response?: ChatResponse };
