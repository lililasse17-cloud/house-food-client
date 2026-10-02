import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase';

interface TrackedOrder {
  id: string;
  order_number: string;
  order_sequence: number | null;
  status: string;
  created_at: string;
  updated_at: string;
  total: number;
}

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

const STORAGE_KEY = 'last_tracked_phone';

export default function TrackOrder() {
  const [phone, setPhone] = useState('');
  const [orders, setOrders] = useState<TrackedOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async (ph: string, silent = false) => {
    if (!silent) setLoading(true);
    const { data, error } = await supabase.rpc('track_order', {
      p_phone: ph,
    });
    if (!silent) setLoading(false);

    if (error) {
      if (!silent) setError('حدث خطأ، حاول مرة أخرى.');
      return;
    }
    
    const list = (Array.isArray(data) ? data : [data]).filter(Boolean) as TrackedOrder[];
    if (list.length === 0) {
      if (!silent) {
        setOrders([]);
        setError('لا توجد طلبات مسجلة برقم الهاتف هذا.');
      }
      return;
    }
    setError(null);
    setOrders(list);
    try {
      localStorage.setItem(STORAGE_KEY, ph);
    } catch {
      /* تخزين محلي */
    }
  }, []);

  useEffect(() => {
    try {
      const savedPhone = localStorage.getItem(STORAGE_KEY);
      if (savedPhone) {
        setPhone(savedPhone);
        fetchOrders(savedPhone, true);
      }
    } catch {
      /* لا شيء */
    }
  }, [fetchOrders]);

  const submit = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      setError('الرجاء إدخال رقم الهاتف.');
      return;
    }
    fetchOrders(phone.trim());
  };

  return (
    <div dir="rtl" className="w-full text-white">
      <h3 className="text-sm sm:text-base font-bold mb-2.5 text-[#ff8a00]">تتبع طلباتك برقم الهاتف</h3>

      <div className="flex flex-col gap-2 mb-3">
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="أدخل رقم هاتفك..."
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
          {loading ? 'جاري البحث...' : 'عرض الطلبات'}
        </button>
      </div>

      {error && <p className="text-red-400 text-xs mb-2">{error}</p>}

      {orders.length > 0 && (
        <div className="flex flex-col gap-3 mt-3 max-h-[300px] overflow-y-auto pr-1">
          {orders.map((ord) => {
            const st = normalize(ord.status);
            return (
              <div key={ord.id} className="border border-gray-700 rounded-lg p-3 bg-[#1a1a1a]">
                <div className="flex justify-between items-center text-[11px] text-gray-400 mb-1">
                  <span>طلب رقم: #{ord.order_number || ord.order_sequence || ord.id.slice(0, 6)}</span>
                  <span>{new Date(ord.created_at).toLocaleDateString('ar-DZ')}</span>
                </div>
                <p className={`text-xs font-bold ${st === 'Cancelled' ? 'text-red-500' : 'text-[#ff8a00]'}`}>
                  الحالة: {LABELS[st] || st}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}