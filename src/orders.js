import { supabase } from './supabase';

export const UNIT_PRICE = 1200; // DA — remplacer par la table products quand elle existera

// Algerian mobile numbers: 05/06/07 + 8 digits (also accepts +213 / 00213)
const PHONE_RE = /^(?:\+213|00213|0)[567]\d{8}$/;

export function validateOrder({ name, phone, street, cartCount }) {
  const errors = {};
  if (cartCount < 1) errors.cart = 'Your cart is empty.';
  if (name.trim().length < 3 || name.length > 80) errors.name = 'Enter your full name.';
  if (!PHONE_RE.test(phone.replace(/[\s.-]/g, ''))) errors.phone = 'Enter a valid Algerian phone number.';
  if (street.trim().length < 5 || street.length > 200) errors.street = 'Enter a complete street address.';
  return errors;
}

export function friendlyError(error) {
  if (!error) return null;
  const status = error.status ?? 0;
  if (status === 401 || status === 403 || error.code === '42501')
    return 'Ordering is temporarily unavailable. Please call us to place your order.';
  if (error.message?.includes('Failed to fetch'))
    return 'No connection. Check your internet and try again.';
  return 'Something went wrong while sending your order. Please try again.';
}

export async function placeOrder({ name, phone, street, building, items, method }) {
  // No .select() on purpose: anon only needs INSERT permission, never SELECT.
  const { error } = await supabase.from('orders').insert([{
    customer_name: name.trim(),
    phone: phone.replace(/[\s.-]/g, ''),
    address: `${street.trim()}, Building/Apt: ${building.trim() || 'N/A'}`,
    total_price: items.length * UNIT_PRICE,
    items,                 // jsonb column: send the array, not JSON.stringify
    payment_method: method,
    status: 'Pending',
  }]);
  return { error, message: friendlyError(error) };
}
