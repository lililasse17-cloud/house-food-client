import React, { useState } from 'react';
import { supabase } from './supabase';

const LABELS = {
  ar: {
    title: 'تتبع طلباتك برقم الهاتف',
    placeholder: 'أدخل رقم هاتفك...',
    button: 'عرض الطلبات',
    loading: 'جاري البحث...',
    errorPhone: 'الرجاء إدخال رقم الهاتف.',
    errorNotFound: 'لا توجد طلبات مسجلة برقم الهاتف هذا.',
    errorGeneral: 'حدث خطأ، حاول مرة أخرى.',
    orderNum: 'رقم الطلب:',
    status: 'الحالة:',
    statusNames: {
      New: 'تم استلام طلبك',
      Confirmed: 'تم تأكيد الطلب',
      Preparing: 'قيد التحضير',
      Ready: 'جاهز للتسليم',
      Completed: 'تم التوصيل',
      Cancelled: 'تم إلغاء الطلب',
    }
  },
  en: {
    title: 'Track your orders by phone',
    placeholder: 'Enter your phone number...',
    button: 'View Orders',
    loading: 'Searching...',
    errorPhone: 'Please enter your phone number.',
    errorNotFound: 'No orders found for this phone number.',
    errorGeneral: 'An error occurred, please try again.',
    orderNum: 'Order',
    status: 'Status:',
    statusNames: {
      New: 'Order Received',
      Confirmed: 'Order Confirmed',
      Preparing: 'Preparing',
      Ready: 'Ready for Delivery',
      Completed: 'Completed',
      Cancelled: 'Cancelled',
    }
  }
};

const normalize = (s) => {
  const k = String(s ?? '').trim().toLowerCase();
  const map = {
    new: 'New', pending: 'New',
    confirmed: 'Confirmed',
    preparing: 'Preparing',
    ready: 'Ready',
    completed: 'Completed', delivered: 'Completed',
    cancelled: 'Cancelled', canceled: 'Cancelled',
  };
  return map[k] ?? 'New';
};

// تحويل آمن إلى رقم (نفس لوحة البائع)
const toNum = (v) => {
  if (v === null || v === undefined || v === '') return 0;
  const n = parseFloat(String(v).replace(/[^\d.-]/g, ''));
  return Number.isFinite(n) ? n : 0;
};

// رقم الطلب: نفس منطق لوحة البائع تماماً
const formatOrderNumber = (o) => {
  const seq = toNum(o.order_sequence);
  if (seq > 0) return String(Math.trunc(seq));
  const label = String(o.order_number ?? '').trim();
  if (label) return label;
  return String(o.id ?? '').replace(/-/g, '').slice(0, 8).toUpperCase();
};

// نفس طريقة عرض لوحة البائع (# للأرقام فقط)
const bidiSafe = (n) =>
  n ? `\u2066${/^[A-Za-z]+[-_]/.test(n) ? '' : '#'}${n}\u2069` : '';

export default function TrackOrder({ lang = 'ar' }) {
  const t = LABELS[lang] || LABELS.ar;
  const [phone, setPhone] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOrders = async (ph) => {
    setLoading(true);
    const { data, error } = await supabase.rpc('track_order', {
      p_phone: ph,
    });
    setLoading(false);

    if (error) {
      setError(t.errorGeneral);
      return;
    }

    const list = (Array.isArray(data) ? data : [data]).filter(Boolean);
    if (list.length === 0) {
      setOrders([]);
      setError(t.errorNotFound);
      return;
    }
    setError(null);
    setOrders(list);
  };

  const submit = (e) => {
    e.preventDefault();
    if (!phone.trim()) {
      setError(t.errorPhone);
      return;
    }
    fetchOrders(phone.trim());
  };

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className="w-full text-white">
      <h3 className="text-sm sm:text-base font-bold mb-2.5 text-[#ff8a00]">{t.title}</h3>

      <div className="flex flex-col gap-2 mb-3">
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder={t.placeholder}
          dir="ltr"
          inputMode="tel"
          className="w-full bg-[#2a2a2a] border border-gray-600 rounded-md p-2 text-xs text-white focus:outline-none focus:border-[#ff8a00]"
        />
        <button
          type="button"
          onClick={submit}
          disabled={loading}
          className="w-full bg-[#ff8a00] hover:bg-[#e67a00] text-black font-bold py-2 rounded-full transition-all text-xs cursor-pointer shadow-md disabled:opacity-50"
        >
          {loading ? t.loading : t.button}
        </button>
      </div>

      {error && <p className="text-red-400 text-xs mb-2">{error}</p>}

      {orders.length > 0 && (
        <div className="flex flex-col gap-3 mt-3 max-h-[300px] overflow-y-auto pr-1">
          {orders.map((ord) => {
            const st = normalize(ord.status);
            const statusText = t.statusNames[st] || st;
            const formattedId = formatOrderNumber(ord);

            return (
              <div key={ord.id || ord.order_number} className="border border-gray-700 rounded-lg p-3 bg-[#1a1a1a]">
                <div className="flex justify-between items-center text-[11px] text-gray-400 mb-1">
                  <span>{t.orderNum} {bidiSafe(formattedId)}</span>
                  <span>{ord.created_at ? new Date(ord.created_at).toLocaleDateString(lang === 'ar' ? 'ar-DZ' : 'en-US') : ''}</span>
                </div>
                <p className={`text-xs font-bold ${st === 'Cancelled' ? 'text-red-500' : 'text-[#ff8a00]'}`}>
                  {t.status} {statusText}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}