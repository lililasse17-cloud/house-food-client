import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase';

type DbStatus = 'New' | 'Confirmed' | 'Preparing' | 'Ready' | 'Completed' | 'Cancelled';

interface TrackedOrder {
  order_number: string;
  order_sequence: number | null;
  status: string;
  created_at: string;
  updated_at: string;
}

const FLOW: DbStatus[] = ['New', 'Confirmed', 'Preparing', 'Ready', 'Completed'];

const LABELS: Record<string, string> = {
  New: 'تم استلام طلبك',
  Confirmed: 'تم تأكيد الطلب',
  Preparing: 'قيد التحضير',
  Ready: 'جاهز للتسليم',
  Completed: 'تم التوصيل',
  Cancelled: 'تم إلغاء الطلب',
};

const normalize = (s: unknown): string => {
  const k = String(s ?? '').trim().toLowerCase();
  const map: Record<string, string> = {
    new: 'New', pending: 'New',
    confirmed: 'Confirmed',
    preparing: 'Preparing',
    ready: 'Ready',
    completed: 'Completed', delivered: 'Completed',
    cancelled: 'Cancelled', canceled: 'Cancelled',
  };
  return map[k] ?? 'New';
};

const STORAGE_KEY = 'last_tracked_order';

export default function TrackOrder() {
  const [orderNumber, setOrderNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async (num: string, ph: string, silent = false) => {
    if (!silent) setLoading(true);
    const { data, error } = await supabase.rpc('track_order', {
      p_order_number: num,
      p_phone: ph,
    });
    if (!silent) setLoading(false);

    if (error) {
      if (!silent) setError('حدث خطأ، حاول مرة أخرى.');
      return;
    }
    const row = (Array.isArray(data) ? data[0] : data) as TrackedOrder | undefined;
    if (!row) {
      if (!silent) {
        setOrder(null);
        setError('لم نجد طلباً بهذه البيانات. تأكد من رقم الطلب ورقم الهاتف.');
      }
      return;
    }
    setError(null);
    setOrder(row);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ num, ph }));
    } catch {
      /* تخزين محلي اختياري */
    }
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const { num, ph } = JSON.parse(saved);
        setOrderNumber(num);
        setPhone(ph);
        fetchStatus(num, ph, true);
      }
    } catch {
      /* لا شيء */
    }
  }, [fetchStatus]);

  useEffect(() => {
    if (!order) return;
    const st = normalize(order.status);
    if (st === 'Completed' || st === 'Cancelled') return;
    const id = setInterval(() => fetchStatus(orderNumber, phone, true), 10000);
    return () => clearInterval(id);
  }, [order, orderNumber, phone, fetchStatus]);

  const submit = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!orderNumber.trim() || !phone.trim()) {
      setError('أدخل رقم الطلب ورقم الهاتف.');
      return;
    }
    fetchStatus(orderNumber.trim(), phone.trim());
  };

  const status = order ? normalize(order.status) : null;
  const currentIdx = status ? FLOW.indexOf(status as DbStatus) : -1;

  return (
    <div dir="rtl" className="w-full text-white">
      <h3 className="text-lg font-bold mb-3 text-[#ff8a00]">تتبع حالة طلبك لحظة بلحظة</h3>

      <div className="flex flex-col gap-2.5 mb-4">
        <input
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          placeholder="رقم الطلب (مثال: 1 أو ORD-...)"
          dir="ltr"
          className="w-full bg-[#2a2a2a] border border-gray-600 rounded-md p-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-[#ff8a00]"
        />
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="رقم الهاتف المستخدم في الطلب"
          dir="ltr"
          inputMode="tel"
          className="w-full bg-[#2a2a2a] border border-gray-600 rounded-md p-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-[#ff8a00]"
        />
        <button
          type="button"
          onClick={submit}
          disabled={loading}
          className="w-full bg-[#ff8a00] hover:bg-[#e67a00] text-black font-bold py-2.5 rounded-full transition-all text-xs cursor-pointer shadow-md disabled:opacity-50"
        >
          {loading ? 'جاري البحث...' : 'تتبع الطلب'}
        </button>
      </div>

      {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

      {order && status && (
        <div className="border border-gray-700 rounded-xl p-4 bg-[#1a1a1a] mt-3">
          <p className="text-xs text-gray-400 mb-1">
            رقم الطلب: <span className="text-white font-mono">{order.order_number || order.order_sequence}</span>
          </p>
          <p
            className={`text-base font-bold my-2 ${
              status === 'Cancelled' ? 'text-red-500' : 'text-[#ff8a00]'
            }`}
          >
            {LABELS[status] || status}
          </p>

          {status !== 'Cancelled' && (
            <ol className="list-none p-0 m-0 flex flex-col gap-2.5 mt-3">
              {FLOW.map((s, i) => {
                const done = i <= currentIdx;
                return (
                  <li key={s} className={`flex items-center gap-2.5 text-xs ${done ? 'opacity-100 text-white' : 'opacity-40 text-gray-400'}`}>
                    <span
                      className={`w-3 h-3 rounded-full inline-block shrink-0 ${
                        done ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-gray-600'
                      }`}
                    />
                    <span className={i === currentIdx ? 'font-bold text-[#ff8a00]' : ''}>{LABELS[s]}</span>
                  </li>
                );
              })}
            </ol>
          )}

          <p className="text-[10px] text-gray-500 mt-4 pt-2 border-t border-gray-800">
            آخر تحديث: {new Date(order.updated_at).toLocaleString('ar-DZ')}
          </p>
        </div>
      )}
    </div>
  );
}