import { supabase } from './supabase';

export const UNIT_PRICE = 500;

export const validateOrder = ({ name, phone, street, cartCount }) => {
  const errors = {};
  if (!name || name.trim() < 3) errors.name = 'الرجاء إدخال الاسم الكامل بشكل صحيح.';
  if (!phone || phone.trim() < 9) errors.phone = 'الرجاء إدخال رقم هاتف صحيح.';
  if (!street || street.trim() < 3) errors.street = 'الرجاء إدخال عنوان التوصيل.';
  if (cartCount === 0) errors.cart = 'سلة التسوق فارغة.';
  return errors;
};

export const placeOrder = async ({ name, phone, street, building, items, method, receiptFile }) => {
  try {
    let receiptUrl = '';

    if (method === 'ccp' && receiptFile) {
      const fileExt = receiptFile.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(fileName, receiptFile);

      if (uploadError) {
        console.error('Storage Upload Error:', uploadError.message);
        return { error: true, message: 'فشل رفع صورة الوصل. تأكد من إعدادات الـ Storage.' };
      }

      // التصحيح هنا: استدعاء getPublicUrl بالشكل الصحيح والسليم
      const { data: publicURLData } = supabase.storage
        .from('receipts')
        .getPublicUrl(fileName);

      receiptUrl = publicURLData?.publicUrl || '';
    }

    const totalAmount = items.reduce(
      (sum, item) => sum + Number(item.finalPrice || item.price || UNIT_PRICE) * (item.quantity || 1),
      0
    );

    const fullAddress = building ? `${street}, عمارة: ${building}` : street;
    const orderNumber = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          order_number: orderNumber,
          customer_name: name,
          phone: phone,
          address: fullAddress,
          payment_method: method,
          receipt_url: receiptUrl,
          total: totalAmount,
          status: 'pending',
        },
      ])
      .select()
      .single();

    if (orderError) {
      console.error('Order Insert Error:', orderError.message);
      return { error: true, message: `خطأ في إرسال الطلب: ${orderError.message}` };
    }

    const orderId = orderData.id;

    const orderItemsPayload = items.map((item) => ({
      order_id: orderId,
      product_id: item.id || null,
      product_name: item.name || 'وجبة',
      quantity: item.quantity || 1,
      unit_price: Number(item.finalPrice || item.price || UNIT_PRICE),
      subtotal: Number(item.finalPrice || item.price || UNIT_PRICE) * (item.quantity || 1),
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsPayload);

    if (itemsError) {
      console.error('Order Items Insert Error:', itemsError.message);
      return { error: true, message: `خطأ في إدخال تفاصيل الوجبات: ${itemsError.message}` };
    }

    return { error: false, message: 'تم إرسال الطلب بنجاح!' };
  } catch (err) {
    console.error('Unexpected error in placeOrder:', err);
    return { error: true, message: 'حدث خطأ غير متوقع أثناء إتمام الطلب.' };
  }
};