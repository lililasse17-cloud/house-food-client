import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { validateOrder, placeOrder, UNIT_PRICE } from './orders';
import bgImg from './assets/bg.png';
import burgerImg from './assets/burger.png';
import btnImg from './assets/btn.png';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80';

const MENU_ADDONS = {
  Burgers: [
    { id: 'cheese', name: { en: 'Extra Melted Cheese', ar: 'جبنة ذائبة إضافية' }, price: 50 },
    { id: 'sauce', name: { en: 'Special Burger Sauce', ar: 'صوص برغر خاص' }, price: 30 },
    { id: 'bacon', name: { en: 'Crispy Beef Bacon', ar: 'بيكون مقرمش' }, price: 80 },
  ],
  Pizza: [
    { id: 'mozzarella', name: { en: 'Extra Mozzarella', ar: 'موزاريلا مضاعفة' }, price: 100 },
    { id: 'mushrooms', name: { en: 'Fresh Mushrooms', ar: 'فطر طازج' }, price: 60 },
    { id: 'olives', name: { en: 'Black Olives', ar: 'زيتون أسود' }, price: 30 },
  ],
  Drinks: [
    { id: 'ice', name: { en: 'Extra Ice Cubes', ar: 'ثلج إضافي' }, price: 0 },
    { id: 'lemon', name: { en: 'Lemon Slice', ar: 'شريحة ليمون' }, price: 20 },
  ],
};

const SIZES = [
  { id: 'regular', name: { en: 'Regular', ar: 'عادي' }, extra: 0 },
  { id: 'large', name: { en: 'Large (+100 DA)', ar: 'كبير (+100 د.ج)' }, extra: 100 },
];

const TEXT = {
  en: {
    nav: { home: 'HOME', menu: 'MENU', offers: 'OFFERS', contact: 'CONTACT' },
    offersAlert: 'Offers coming soon!',
    heroLine1: 'ENJOY FLAVOR.',
    heroLine2: 'DELIVERED FAST.',
    heroText: 'Fresh ingredients, mouthwatering recipes, and quick delivery right to your door.',
    orderNow: 'Order Now',
    features: [
      { icon: '🍃', title: 'Fresh Ingredients', sub: '100% Organic & Quality' },
      { icon: '⏰', title: 'Fast Delivery', sub: 'Hot & Fresh in 30 Mins' },
      { icon: '🔥', title: 'Premium Taste', sub: 'Made with Passion' },
    ],
    exploreMenu: 'EXPLORE OUR MENU',
    categories: { All: 'All', Burgers: 'Burgers', Pizza: 'Pizza', Drinks: 'Drinks' },
    loading: 'Loading menu...',
    emptyTitle: 'No products available at the moment',
    emptySub: 'New items will appear here as soon as they are added by the restaurant.',
    defaultDesc: 'A delicious meal prepared just for you.',
    productImage: 'Product Image',
    saleTitle: 'Get 20% Off Your First Order!',
    saleSub: 'Use code FOOD20 at checkout for instant discount.',
    claim: 'Claim Discount',
    cartTitle: 'Shopping Cart',
    cartSub: 'Review your items before checkout.',
    cartEmptyTitle: 'Your Cart is Empty',
    cartEmptySub: "Looks like you haven't added any meals yet.",
    exploreBtn: 'Explore Menu',
    item: 'Item',
    unitPrice: 'Unit Price',
    quantity: 'Quantity',
    subtotal: 'Subtotal',
    classicMeal: 'Classic Meal',
    orderSummary: 'Order Summary',
    deliveryFee: 'Delivery Fee',
    total: 'Total',
    checkoutBtn: 'Proceed to Checkout',
    deliveryInfo: 'Delivery Information',
    fullName: 'Full Name',
    phone: 'Phone Number',
    street: 'Street Address',
    building: 'Building / Apt. Number',
    paymentMethods: 'Payment Methods',
    cod: 'Cash on Delivery',
    codSub: 'Pay when order arrives',
    ccp: 'BaridiMob / CCP Transfer',
    ccpSub: 'Transfer and upload proof',
    upload: 'Upload Receipt Photo',
    totalPrice: 'Total Price',
    placeOrder: 'Place Order',
    placing: 'Placing Order...',
    contactUs: 'Contact Us',
    email: 'Email',
    phoneLabel: 'Phone',
    hours: 'Opening Hours',
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    addToCart: 'Add to Cart',
    detailsFallback: 'A detailed description of the product.',
    orderSuccess: 'Order Placed Successfully!',
    orderSuccessSub: 'Your order has been sent to the restaurant dashboard.',
    backHome: 'Back to Home',
    addedToast: 'Added to cart successfully!',
    viewCart: 'View Cart',
    chooseSize: 'Choose Size',
    extraAddons: 'Optional Add-ons',
  },
  ar: {
    nav: { home: 'الرئيسية', menu: 'المنيو', offers: 'العروض', contact: 'اتصل بنا' },
    offersAlert: 'العروض قريباً!',
    heroLine1: 'استمتع بالنكهة.',
    heroLine2: 'توصيل سريع.',
    heroText: 'مكونات طازجة، وصفات شهية، وتوصيل سريع حتى باب منزلك.',
    orderNow: 'اطلب الآن',
    features: [
      { icon: '🍃', title: 'مكونات طازجة', sub: '100% طبيعية وعالية الجودة' },
      { icon: '⏰', title: 'توصيل سريع', sub: 'ساخن وطازج خلال 30 دقيقة' },
      { icon: '🔥', title: 'طعم مميز', sub: 'محضّر بشغف' },
    ],
    exploreMenu: 'اكتشف المنيو',
    categories: { All: 'الكل', Burgers: 'برغر', Pizza: 'بيتزا', Drinks: 'مشروبات' },
    loading: 'جاري تحميل المنيو...',
    emptyTitle: 'لا توجد منتجات متاحة حالياً',
    emptySub: 'ستظهر المنتجات هنا فور إضافتها من طرف المطعم.',
    defaultDesc: 'وجبة لذيذة محضّرة خصيصاً لك.',
    productImage: 'صورة المنتج',
    saleTitle: 'احصل على خصم 20% على طلبك الأول!',
    saleSub: 'استخدم الكود FOOD20 عند الدفع للحصول على خصم فوري.',
    claim: 'احصل على الخصم',
    cartTitle: 'سلة التسوق',
    cartSub: 'راجع منتجاتك قبل إتمام الطلب.',
    cartEmptyTitle: 'سلتك فارغة',
    cartEmptySub: 'يبدو أنك لم تضف أي وجبة بعد.',
    exploreBtn: 'تصفح المنيو',
    item: 'المنتج',
    unitPrice: 'سعر الوحدة',
    quantity: 'الكمية',
    subtotal: 'المجموع الفرعي',
    classicMeal: 'وجبة كلاسيكية',
    orderSummary: 'ملخص الطلب',
    deliveryFee: 'رسوم التوصيل',
    total: 'المجموع',
    checkoutBtn: 'متابعة إلى الدفع',
    deliveryInfo: 'معلومات التوصيل',
    fullName: 'الاسم الكامل',
    phone: 'رقم الهاتف',
    street: 'عنوان الشارع',
    building: 'رقم العمارة / الشقة',
    paymentMethods: 'طرق الدفع',
    cod: 'الدفع عند الاستلام',
    codSub: 'ادفع عند وصول الطلب',
    ccp: 'تحويل بريدي موب / CCP',
    ccpSub: 'قم بالتحويل وارفع الإثبات',
    upload: 'ارفع صورة الوصل',
    totalPrice: 'السعر الإجمالي',
    placeOrder: 'تأكيد الطلب',
    placing: 'جاري إرسال الطلب...',
    contactUs: 'اتصل بنا',
    email: 'البريد',
    phoneLabel: 'الهاتف',
    hours: 'ساعات العمل',
    days: ['الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد'],
    addToCart: 'أضف إلى السلة',
    detailsFallback: 'وصف تفصيلي للمنتج.',
    orderSuccess: 'تم إرسال الطلب بنجاح!',
    orderSuccessSub: 'تم إرسال طلبك إلى لوحة تحكم المطعم.',
    backHome: 'العودة للرئيسية',
    addedToast: 'تمت الإضافة إلى السلة بنجاح!',
    viewCart: 'عرض السلة',
    chooseSize: 'اختر الحجم',
    extraAddons: 'إضافات اختيارية',
  },
};

function App() {
  const [lang, setLang] = useState('en');
  const t = TEXT[lang];

  const [currentPage, setCurrentPage] = useState('home');
  const [activeCategory, setActiveCategory] = useState('All');
  const categories = ['All', 'Burgers', 'Pizza', 'Drinks'];

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [cartItems, setCartItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [selectedSize, setSelectedSize] = useState('regular');
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [itemQuantity, setItemQuantity] = useState(1);

  const [toastMessage, setToastMessage] = useState(null);

  const [paymentMethod, setPaymentMethod] = useState('ccp');
  const [orderPlaced, setOrderPlaced] = useState(false);

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [buildingNumber, setBuildingNumber] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchProducts();

    const channel = supabase
      .channel('public:products')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        fetchProducts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('products').select('*');
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (itemName) => {
    setToastMessage(`${itemName}: ${t.addedToast}`);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const openProductModal = (product) => {
    setSelectedProduct(product);
    setSelectedSize('regular');
    setSelectedAddons([]);
    setItemQuantity(1);
  };

  const toggleAddon = (addon) => {
    if (selectedAddons.some((a) => a.id === addon.id)) {
      setSelectedAddons(selectedAddons.filter((a) => a.id !== addon.id));
    } else {
      setSelectedAddons([...selectedAddons, addon]);
    }
  };

  const getModalFinalPrice = () => {
    if (!selectedProduct) return 0;
    const base = Number(selectedProduct.price || UNIT_PRICE);
    const sizeExtra = selectedSize === 'large' ? 100 : 0;
    const addonsExtra = selectedAddons.reduce((acc, curr) => acc + curr.price, 0);
    return (base + sizeExtra + addonsExtra) * itemQuantity;
  };

  const addToCartFromModal = () => {
    if (selectedProduct) {
      const configuredItem = {
        ...selectedProduct,
        cartId: `${selectedProduct.id}-${Date.now()}`,
        finalPrice: getModalFinalPrice() / itemQuantity,
        quantity: itemQuantity,
        selectedSize: selectedSize === 'large' ? 'Large' : 'Regular',
        addons: selectedAddons.map((a) => a.name[lang]),
      };

      setCartItems((prev) => [...prev, configuredItem]);
      showToast(selectedProduct.name);
    }
    setSelectedProduct(null);
  };

  const quickAdd = (e, product) => {
    e.stopPropagation();
    if (product.category && product.category !== 'Drinks') {
      openProductModal(product);
      return;
    }

    const simpleItem = {
      ...product,
      cartId: `${product.id}-${Date.now()}`,
      finalPrice: Number(product.price || UNIT_PRICE),
      quantity: 1,
      addons: [],
    };
    setCartItems((prev) => [...prev, simpleItem]);
    showToast(product.name);
  };

  const updateQuantity = (cartId, delta) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.cartId === cartId) {
            const newQty = (item.quantity || 1) + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const filteredProducts =
    activeCategory === 'All'
      ? products
      : products.filter((p) => p.category?.trim().toLowerCase() === activeCategory.trim().toLowerCase());

  const total = cartItems.reduce(
    (sum, item) => sum + Number(item.finalPrice || item.price || UNIT_PRICE) * (item.quantity || 1),
    0
  );

  const scrollToSection = (id) => {
    setCurrentPage('home');
    setMobileMenuOpen(false);
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 150);
  };

  const handlePlaceOrder = async () => {
    if (isSubmitting) return;

    const errors = validateOrder({
      name: customerName,
      phone: customerPhone,
      street: streetAddress,
      cartCount: cartItems.length,
    });
    const firstError = Object.values(errors)[0];
    if (firstError) {
      alert(firstError);
      return;
    }

    setIsSubmitting(true);
    try {
      let receiptUrl = '';
      if (paymentMethod === 'ccp' && receiptFile) {
        const fileExt = receiptFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('receipts')
          .upload(`public/${fileName}`, receiptFile);

        if (!uploadError) {
          const { data: publicURL } = supabase.storage.from('receipts').getPublicUrl(`public/${fileName}`);
          receiptUrl = publicURL?.publicUrl || '';
        }
      }

      const { error, message } = await placeOrder({
        name: customerName,
        phone: customerPhone,
        street: streetAddress,
        building: buildingNumber,
        items: cartItems,
        method: paymentMethod,
        receiptUrl,
      });

      if (error) {
        alert(message);
        return;
      }

      setOrderPlaced(true);
      setCartItems([]);
      setCustomerName('');
      setCustomerPhone('');
      setStreetAddress('');
      setBuildingNumber('');
      setReceiptFile(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderHeader = () => (
    <header className="w-full max-w-[1200px] mx-auto flex justify-between items-center py-3 px-4 sm:px-6 md:py-6 border-b border-gray-700/50 relative z-50 bg-[#080808]/80 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="lg:hidden text-white hover:text-[#ff8a00] p-1.5 rounded-lg border border-gray-800 bg-[#141414] focus:outline-none transition cursor-pointer"
          aria-label="Toggle Menu"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div
          onClick={() => {
            setCurrentPage('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-1 font-audiowide text-base sm:text-2xl tracking-widest cursor-pointer hover:scale-105 transition-transform"
        >
          <span className="text-[#ff8a00]">HOUSE</span>
          <span className="text-white">FOOD</span>
        </div>
      </div>

      <nav className="hidden lg:flex gap-8 text-sm tracking-wide font-sans items-center">
        <button
          type="button"
          onClick={() => {
            setCurrentPage('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`hover:text-[#ff8a00] transition cursor-pointer ${
            currentPage === 'home' ? 'text-[#ff8a00]' : 'text-white'
          }`}
        >
          {t.nav.home}
        </button>
        <button
          type="button"
          onClick={() => scrollToSection('menu-section')}
          className="hover:text-[#ff8a00] transition text-white cursor-pointer"
        >
          {t.nav.menu}
        </button>
        <button
          type="button"
          onClick={() => alert(t.offersAlert)}
          className="hover:text-[#ff8a00] transition text-white cursor-pointer"
        >
          {t.nav.offers}
        </button>
        <button
          type="button"
          onClick={() => scrollToSection('footer-section')}
          className="hover:text-[#ff8a00] transition text-white cursor-pointer"
        >
          {t.nav.contact}
        </button>
      </nav>

      <div className="flex items-center gap-3 sm:gap-5">
        <div className="flex items-center gap-1 text-[11px] sm:text-xs font-bold bg-[#1a1a1a] px-2.5 sm:px-3 py-1 rounded-full border border-gray-700">
          <button
            type="button"
            onClick={() => setLang('en')}
            className={`px-1.5 py-0.5 rounded transition ${
              lang === 'en' ? 'bg-[#ff8a00] text-black font-extrabold' : 'text-gray-400 hover:text-white'
            }`}
          >
            EN
          </button>
          <span className="text-gray-500">|</span>
          <button
            type="button"
            onClick={() => setLang('ar')}
            className={`px-1.5 py-0.5 rounded transition ${
              lang === 'ar' ? 'bg-[#ff8a00] text-black font-extrabold' : 'text-gray-400 hover:text-white'
            }`}
          >
            AR
          </button>
        </div>
        <div
          onClick={() => setCurrentPage('cart')}
          className="relative text-[#ff8a00] text-xl sm:text-2xl cursor-pointer hover:scale-110 active:scale-95 transition-transform"
        >
          🛒
          {cartItems.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center font-bold">
              {cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0)}
            </span>
          )}
        </div>
      </div>
    </header>
  );

  return (
    <div
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className="min-h-screen bg-[#080808] w-full text-white overflow-x-hidden relative font-sans"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Audiowide&family=Inria+Serif:wght@400;700&display=swap');
        .font-audiowide { font-family: 'Audiowide', cursive; }
        .font-inria { font-family: 'Inria Serif', serif; }
        @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-8px); } 100% { transform: translateY(0px); } }
        .animate-float { animation: float 4s ease-in-out infinite; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fadeInUp 0.4s ease-out forwards; }
      `}</style>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          ></div>

          <div
            className={`fixed top-0 bottom-0 ${
              lang === 'ar' ? 'right-0 border-l' : 'left-0 border-r'
            } w-[280px] bg-[#0f0f0f] border-gray-800 p-6 flex flex-col justify-between shadow-2xl z-10`}
          >
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-gray-800">
                <div className="flex items-center gap-1 font-audiowide text-xl tracking-widest">
                  <span className="text-[#ff8a00]">HOUSE</span>
                  <span className="text-white">FOOD</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-400 hover:text-white p-1 text-2xl cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <nav className="flex flex-col gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentPage('home');
                    setMobileMenuOpen(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`text-start py-3 px-4 rounded-xl font-medium transition cursor-pointer ${
                    currentPage === 'home'
                      ? 'bg-[#ff8a00]/10 text-[#ff8a00] font-bold'
                      : 'text-gray-300 hover:bg-[#1a1a1a] hover:text-white'
                  }`}
                >
                  🏠 {t.nav.home}
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection('menu-section')}
                  className="text-start py-3 px-4 rounded-xl font-medium text-gray-300 hover:bg-[#1a1a1a] hover:text-white transition cursor-pointer"
                >
                  🍽️ {t.nav.menu}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    alert(t.offersAlert);
                  }}
                  className="text-start py-3 px-4 rounded-xl font-medium text-gray-300 hover:bg-[#1a1a1a] hover:text-white transition cursor-pointer"
                >
                  🔥 {t.nav.offers}
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection('footer-section')}
                  className="text-start py-3 px-4 rounded-xl font-medium text-gray-300 hover:bg-[#1a1a1a] hover:text-white transition cursor-pointer"
                >
                  📞 {t.nav.contact}
                </button>
              </nav>
            </div>

            <div className="pt-6 border-t border-gray-800">
              <button
                type="button"
                onClick={() => {
                  setCurrentPage('cart');
                  setMobileMenuOpen(false);
                }}
                className="w-full bg-[#ff8a00] text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <span>🛒</span> {t.cartTitle} ({cartItems.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-4 end-4 sm:bottom-6 sm:end-6 z-50 bg-[#ff8a00] text-black font-bold px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 text-xs sm:text-sm animate-fade-in-up">
          <span>✅ {toastMessage}</span>
          <button
            type="button"
            onClick={() => setCurrentPage('cart')}
            className="bg-black text-white text-[10px] sm:text-xs px-2.5 py-1 rounded hover:bg-gray-800 transition"
          >
            {t.viewCart}
          </button>
        </div>
      )}

      {/* ===================== HOME ===================== */}
      {currentPage === 'home' && (
        <>
          <section className="relative w-full overflow-hidden bg-[#080808]">
            <div
              aria-hidden="true"
              className="absolute inset-0 w-full h-full bg-cover bg-bottom opacity-90 z-0 pointer-events-none"
              style={{ backgroundImage: `url(${bgImg})` }}
            ></div>

            {renderHeader()}

            <div className="flex lg:hidden flex-col items-center text-center px-4 pt-6 pb-14 relative z-10">
              <h1 className={`font-inria font-bold text-[#f1e2e2] text-3xl sm:text-4xl animate-fade-in-up m-0 p-0 ${lang === 'ar' ? 'leading-[1.4]' : 'leading-[1.2]'}`}>
                {t.heroLine1}
              </h1>
              <h2 className={`font-inria font-bold text-[#ff8a00] text-3xl sm:text-4xl animate-fade-in-up m-0 p-0 mt-2 ${lang === 'ar' ? 'leading-[1.4]' : 'leading-[1.2]'}`}>
                {t.heroLine2}
              </h2>
              <p className="font-inria text-[#a0aec0] text-sm mt-3 max-w-[280px] leading-relaxed">
                {t.heroText}
              </p>

              <div className="relative w-[80%] max-w-[280px] mt-4 mb-2 animate-float">
                <img
                  src={burgerImg}
                  alt="Delicious Burger"
                  className="w-full h-auto object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.9)]"
                />
              </div>

              <div className="animate-fade-in-up mt-2">
                <button
                  type="button"
                  onClick={() => scrollToSection('menu-section')}
                  className="hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer animate-pulse"
                >
                  <img
                    src={btnImg}
                    alt={t.orderNow}
                    className="w-[200px] sm:w-[220px] drop-shadow-[0_8px_20px_rgba(255,138,0,0.6)] object-contain"
                  />
                </button>
              </div>
            </div>

            <div className="hidden lg:flex w-full max-w-[1200px] mx-auto justify-between items-center px-8 sm:px-12 md:px-16 py-20 relative z-10">
              <div className="flex flex-col items-start text-left max-w-xl z-20 animate-fade-in-up">
                <h1 className={`font-inria font-bold text-[#f1e2e2] text-[54px] xl:text-[62px] m-0 p-0 ${lang === 'ar' ? 'leading-[1.4]' : 'leading-[1.2]'}`}>
                  {t.heroLine1}
                </h1>
                <h2 className={`font-inria font-bold text-[#ff8a00] text-[54px] xl:text-[62px] m-0 p-0 mt-3 ${lang === 'ar' ? 'leading-[1.4]' : 'leading-[1.2]'}`}>
                  {t.heroLine2}
                </h2>
                <p className="font-inria text-[#a0aec0] text-lg mt-4 max-w-md leading-relaxed">
                  {t.heroText}
                </p>

                <div className="mt-8">
                  <button
                    type="button"
                    onClick={() => scrollToSection('menu-section')}
                    className="hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer animate-pulse hover:animate-none"
                  >
                    <img
                      src={btnImg}
                      alt={t.orderNow}
                      className="w-[210px] xl:w-[230px] drop-shadow-[0_8px_20px_rgba(255,138,0,0.5)] object-contain"
                    />
                  </button>
                </div>
              </div>

              <div className="relative z-10 w-[450px] xl:w-[500px]">
                <div className="relative w-full flex justify-center items-center animate-float">
                  <img
                    src={burgerImg}
                    alt="Delicious Burger"
                    className="w-full h-auto object-contain drop-shadow-[0_30px_40px_rgba(0,0,0,0.95)]"
                  />
                </div>
              </div>
            </div>
          </section>

          <div className="w-full flex flex-col items-center relative z-30 px-4 sm:px-6 -mt-6 sm:-mt-10 animate-fade-in-up">
            <div className="w-full max-w-[1000px] bg-[#111111] border border-[#2b2b2b] rounded-2xl md:rounded-[40px] py-4 px-4 sm:py-6 md:py-8 md:px-12 flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0 shadow-2xl hover:border-[#ff8a00]/40 transition-colors duration-300">
              {t.features.map((f, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <div className="hidden sm:block h-10 w-px bg-gray-700"></div>}
                  <div className="flex flex-col items-center text-center group cursor-default">
                    <div className="text-xl sm:text-2xl md:text-3xl mb-0.5 sm:mb-1 opacity-80 group-hover:scale-110 transition-transform duration-300">{f.icon}</div>
                    <h3 className="font-inria font-bold text-white text-sm sm:text-base md:text-lg">{f.title}</h3>
                    <p className="font-sans text-[#ffaa00] text-[10px] sm:text-xs mt-0.5">{f.sub}</p>
                  </div>
                </React.Fragment>
              ))}
            </div>

            <div id="menu-section" className="w-full max-w-[1100px] mt-12 sm:mt-20 flex flex-col items-center">
              <h2 className="font-inria font-bold text-xl sm:text-3xl md:text-4xl text-white tracking-widest mb-5 sm:mb-8 text-center">
                {t.exploreMenu}
              </h2>

              <div className="flex justify-center gap-2 sm:gap-4 mb-6 sm:mb-10 flex-wrap">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3.5 sm:px-5 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-bold border-2 transition-all duration-300 cursor-pointer ${
                      activeCategory === cat
                        ? 'border-[#ff8a00] text-[#ff8a00] scale-105 shadow-[0_5px_15px_rgba(255,138,0,0.3)] bg-[#ff8a00]/10'
                        : 'border-[#333] text-gray-400 hover:border-gray-500 hover:text-white'
                    }`}
                  >
                    {t.categories[cat]}
                  </button>
                ))}
              </div>

              {loading ? (
                <p className="text-center text-gray-400 py-10 animate-pulse">{t.loading}</p>
              ) : filteredProducts.length === 0 ? (
                <div className="w-full max-w-[600px] bg-[#111] border border-gray-800 rounded-3xl p-6 sm:p-10 text-center my-4 flex flex-col items-center">
                  <div className="text-4xl mb-2">🍽️</div>
                  <p className="text-base sm:text-lg text-white font-semibold mb-1">{t.emptyTitle}</p>
                  <p className="text-xs text-gray-500 max-w-sm">{t.emptySub}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-7 w-full max-w-[1000px]">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => openProductModal(product)}
                      className="bg-[#1a1a1a] border border-[#2b2520] rounded-[18px] p-4 flex flex-col hover:-translate-y-2 hover:border-[#ff8a00]/50 transition-all duration-300 cursor-pointer group shadow-lg"
                    >
                      <div className="w-full h-[170px] bg-[#2a2a2a] rounded-[14px] mb-3 overflow-hidden flex items-center justify-center">
                        <img
                          src={product.image_url || FALLBACK_IMAGE}
                          alt={product.name}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = FALLBACK_IMAGE;
                          }}
                          className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                        />
                      </div>
                      <h4 className="text-white font-bold text-base mb-1 group-hover:text-[#ff8a00] transition-colors">{product.name}</h4>
                      <p className="text-gray-400 text-xs mb-3 line-clamp-2">
                        {product.description || t.defaultDesc}
                      </p>
                      <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-800">
                        <span className="text-[#ffaa00] font-bold text-lg font-audiowide">
                          {product.price} DA
                        </span>
                        <button
                          type="button"
                          onClick={(e) => quickAdd(e, product)}
                          className="bg-[#ffaa00] text-black w-8 h-8 rounded-lg font-extrabold text-xl flex items-center justify-center hover:scale-110 active:scale-90 transition-transform duration-200 cursor-pointer shadow-md"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="w-full max-w-[1000px] bg-[#111111] border border-[#333] rounded-[15px] p-4 sm:p-5 mt-12 mb-8 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl">
              <div className="flex items-center gap-3 text-center sm:text-left">
                <span className="bg-[#ffaa00] text-black text-[11px] font-black px-2.5 py-1 rounded animate-pulse shrink-0 shadow-md">
                  SALE
                </span>
                <div>
                  <h3 className="text-white font-sans font-bold text-sm sm:text-base">{t.saleTitle}</h3>
                  <p className="text-gray-400 text-[11px] mt-0.5">{t.saleSub}</p>
                </div>
              </div>
              <button
                type="button"
                className="bg-[#ffaa00] text-black font-bold px-5 py-1.5 rounded-full text-xs hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer shrink-0 shadow-md"
              >
                {t.claim} &rarr;
              </button>
            </div>
          </div>
        </>
      )}

      {/* ===================== CART ===================== */}
      {currentPage === 'cart' && (
        <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 animate-fade-in-up">
          {renderHeader()}
          <div className="mt-6 sm:mt-10">
            <div className="flex flex-col mb-6">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🛒</span>
                <h1 className="text-2xl sm:text-3xl font-sans font-medium">
                  {t.cartTitle}
                </h1>
              </div>
              <p className="text-gray-500 text-xs sm:text-sm mt-1">{t.cartSub}</p>
            </div>

            {cartItems.length === 0 ? (
              <div className="w-full bg-[#111111] border border-gray-800 rounded-2xl p-8 sm:p-14 flex flex-col items-center justify-center text-center my-6">
                <div className="text-5xl mb-2">🛒</div>
                <h2 className="text-lg sm:text-xl font-bold text-white mb-1">{t.cartEmptyTitle}</h2>
                <p className="text-gray-400 text-xs sm:text-sm max-w-sm mb-5">{t.cartEmptySub}</p>
                <button
                  type="button"
                  onClick={() => setCurrentPage('home')}
                  className="bg-[#ff8a00] text-black font-bold px-6 py-2 rounded-full hover:scale-105 transition-all text-xs sm:text-sm"
                >
                  {t.exploreBtn}
                </button>
              </div>
            ) : (
              <div className="flex flex-col lg:flex-row gap-6 items-start">
                <div className="w-full lg:flex-1 bg-[#111111] border border-gray-800 rounded-2xl p-4 sm:p-5">
                  {cartItems.map((item, index) => {
                    const price = Number(item.finalPrice || item.price || UNIT_PRICE);
                    const qty = item.quantity || 1;
                    return (
                      <div
                        key={item.cartId || index}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-3.5 border-b border-gray-800 last:border-0 gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-700 rounded-lg overflow-hidden shrink-0">
                            <img
                              src={item.image_url || FALLBACK_IMAGE}
                              alt={item.name}
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = FALLBACK_IMAGE;
                              }}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="text-white font-medium text-xs sm:text-sm">
                              {item.name || t.classicMeal}
                            </div>
                            {item.selectedSize && (
                              <div className="text-[10px] text-gray-400">
                                {t.chooseSize}: {item.selectedSize}
                              </div>
                            )}
                            {item.addons?.length > 0 && (
                              <div className="text-[10px] text-[#ff8a00]">
                                + {item.addons.join(', ')}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                          <div className="flex items-center gap-2 bg-[#1e1e1e] px-2 py-1 rounded-lg border border-gray-700">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.cartId, -1)}
                              className="text-gray-400 hover:text-white font-bold text-sm cursor-pointer px-1"
                            >
                              -
                            </button>
                            <span className="font-bold text-xs min-w-[16px] text-center text-white">{qty}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.cartId, 1)}
                              className="text-gray-400 hover:text-white font-bold text-sm cursor-pointer px-1"
                            >
                              +
                            </button>
                          </div>

                          <span className="text-[#ffaa00] font-bold text-xs sm:text-sm whitespace-nowrap">
                            {price * qty} DA
                          </span>

                          <button
                            type="button"
                            onClick={() => setCartItems(cartItems.filter((_, i) => i !== index))}
                            className="text-[#ff4444] hover:scale-110 transition p-1 text-sm cursor-pointer"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="w-full lg:w-[320px] bg-[#111111] border border-gray-800 rounded-2xl p-4 sm:p-5 shadow-xl shrink-0">
                  <h2 className="text-base font-bold mb-3">{t.orderSummary}</h2>
                  <div className="flex justify-between text-gray-400 text-xs mb-2">
                    <span>{t.subtotal}</span>
                    <span>{total} DA</span>
                  </div>
                  <div className="flex justify-between text-gray-400 text-xs mb-3">
                    <span>{t.deliveryFee}</span>
                    <span>0 DA</span>
                  </div>
                  <div className="border-t border-gray-700 pt-3 mb-5 flex justify-between items-center">
                    <span className="text-lg font-bold">{t.total}</span>
                    <span className="text-[#ff8a00] text-base font-bold font-audiowide">{total} DA</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentPage('checkout')}
                    className="w-full bg-[#ff8a00] hover:bg-[#e67a00] text-black font-bold py-2.5 rounded-full transition-all text-xs cursor-pointer shadow-md"
                  >
                    {t.checkoutBtn}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================== CHECKOUT ===================== */}
      {currentPage === 'checkout' && (
        <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 animate-fade-in-up">
          {renderHeader()}
          <div className="mt-6 sm:mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="bg-[#1e1e1e] rounded-[18px] p-5 sm:p-6 w-full border border-gray-800">
              <h2 className="text-base sm:text-lg font-bold mb-3 text-white">{t.deliveryInfo}</h2>
              <div className="flex flex-col gap-2.5">
                <input
                  type="text"
                  placeholder={t.fullName}
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-[#2a2a2a] border border-gray-600 rounded-md p-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-[#ff8a00]"
                />
                <input
                  type="tel"
                  placeholder={t.phone}
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-[#2a2a2a] border border-gray-600 rounded-md p-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-[#ff8a00]"
                />
                <input
                  type="text"
                  placeholder={t.street}
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  className="w-full bg-[#2a2a2a] border border-gray-600 rounded-md p-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-[#ff8a00]"
                />
                <input
                  type="text"
                  placeholder={t.building}
                  value={buildingNumber}
                  onChange={(e) => setBuildingNumber(e.target.value)}
                  className="w-full bg-[#2a2a2a] border border-gray-600 rounded-md p-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-[#ff8a00]"
                />
              </div>
            </div>

            <div className="w-full flex flex-col gap-3">
              <h2 className="text-base sm:text-lg font-bold text-white">{t.paymentMethods}</h2>

              <div
                onClick={() => setPaymentMethod('cod')}
                className={`border rounded-[14px] p-3.5 cursor-pointer flex items-center gap-3 ${
                  paymentMethod === 'cod' ? 'border-white bg-[#1e1e1e]' : 'border-gray-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === 'cod' ? 'border-white' : 'border-gray-500'
                  }`}
                >
                  {paymentMethod === 'cod' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                </div>
                <div>
                  <h3 className="text-white font-medium text-xs sm:text-sm">{t.cod}</h3>
                  <p className="text-gray-500 text-[11px]">{t.codSub}</p>
                </div>
              </div>

              <div
                onClick={() => setPaymentMethod('ccp')}
                className={`border rounded-[14px] p-3.5 cursor-pointer flex flex-col gap-2.5 ${
                  paymentMethod === 'ccp' ? 'border-white bg-[#1e1e1e]' : 'border-gray-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === 'ccp' ? 'border-white' : 'border-gray-500'
                    }`}
                  >
                    {paymentMethod === 'ccp' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                  </div>
                  <div>
                    <h3 className="text-white font-medium text-xs sm:text-sm">{t.ccp}</h3>
                    <p className="text-gray-500 text-[11px]">{t.ccpSub}</p>
                  </div>
                </div>
                {paymentMethod === 'ccp' && (
                  <div className="w-full border border-dashed border-gray-600 rounded-xl p-3 flex flex-col items-center justify-center bg-[#2a2a2a] relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setReceiptFile(e.target.files[0])}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <span className="text-white text-xs text-center">
                      {receiptFile ? `✅ ${receiptFile.name}` : t.upload}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-[#1e1e1e] rounded-[18px] p-5 sm:p-6 w-full border border-gray-800">
              <h2 className="text-base sm:text-lg font-bold mb-3 text-white">{t.orderSummary}</h2>
              <div className="flex justify-between items-center mb-5 pt-2 border-t border-gray-700">
                <span className="text-[#ff8a00] font-bold text-sm">{t.totalPrice}</span>
                <span className="text-[#ff8a00] font-bold text-sm">{total} DA</span>
              </div>
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
                className="w-full bg-[#ff8a00] hover:bg-[#e67a00] text-black font-bold py-2.5 rounded-full transition-all text-xs disabled:opacity-60 cursor-pointer shadow-md"
              >
                {isSubmitting ? t.placing : t.placeOrder}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== FOOTER ===================== */}
      {currentPage === 'home' && (
        <footer id="footer-section" className="w-full bg-[#d97c11] pt-8 pb-6 px-4 sm:px-6 flex flex-col items-center mt-14">
          <div className="w-full max-w-[1200px] flex flex-col sm:flex-row justify-between items-start gap-6 text-white">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 mb-2 font-audiowide text-xl">
                <span className="text-[#1a0f02]">FOOD</span> <span className="text-white font-sans font-bold">House</span>
              </div>
              <h4 className="font-bold underline underline-offset-4 decoration-[#3b1f02] mb-1 text-xs uppercase text-[#3b1f02]">
                {t.contactUs}
              </h4>
              <p className="text-xs">{t.email}: support@foodhouse-demo.com</p>
              <p className="text-xs mt-0.5">{t.phoneLabel}: +1 (555) 234-5678</p>
            </div>

            <div>
              <h4 className="font-bold underline underline-offset-4 decoration-[#3b1f02] mb-1.5 text-xs uppercase text-[#3b1f02]">
                {t.hours}
              </h4>
              <ul className="text-xs space-y-0.5 font-sans">
                {t.days.map((day) => (
                  <li key={day}>{day} — 10:00 AM - 11:00 PM</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="w-full max-w-[1200px] h-px bg-[#b5640b] mt-6"></div>
        </footer>
      )}

      {/* ===================== PRODUCT MODAL ===================== */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in-up">
          <div className="bg-[#121212] w-full max-w-[700px] max-h-[90vh] overflow-y-auto p-4 sm:p-6 relative border border-[#2b2520] rounded-2xl shadow-2xl">
            <button
              type="button"
              onClick={() => setSelectedProduct(null)}
              className="absolute top-3 end-4 text-gray-400 hover:text-white text-2xl cursor-pointer"
            >
              ×
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-1">
              <div className="bg-[#1a1a1a] w-full aspect-square rounded-[14px] overflow-hidden flex items-center justify-center">
                <img
                  src={selectedProduct.image_url || FALLBACK_IMAGE}
                  alt={selectedProduct.name}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = FALLBACK_IMAGE;
                  }}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex flex-col text-white">
                <h2 className="font-bold text-xl sm:text-2xl">{selectedProduct.name}</h2>
                <p className="text-gray-400 text-xs mt-1 leading-relaxed">
                  {selectedProduct.description || t.detailsFallback}
                </p>

                <div className="mt-3">
                  <h3 className="text-xs uppercase tracking-wider font-bold text-gray-400 mb-1">
                    {t.chooseSize}
                  </h3>
                  <div className="flex gap-2">
                    {SIZES.map((size) => (
                      <button
                        key={size.id}
                        type="button"
                        onClick={() => setSelectedSize(size.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold border transition ${
                          selectedSize === size.id
                            ? 'border-[#ff8a00] bg-[#ff8a00]/10 text-[#ff8a00]'
                            : 'border-gray-700 text-gray-300'
                        }`}
                      >
                        {size.name[lang]}
                      </button>
                    ))}
                  </div>
                </div>

                {MENU_ADDONS[selectedProduct.category] && (
                  <div className="mt-3">
                    <h3 className="text-xs uppercase tracking-wider font-bold text-gray-400 mb-1">
                      {t.extraAddons}
                    </h3>
                    <div className="flex flex-col gap-1">
                      {MENU_ADDONS[selectedProduct.category].map((addon) => {
                        const isChecked = selectedAddons.some((a) => a.id === addon.id);
                        return (
                          <label
                            key={addon.id}
                            onClick={() => toggleAddon(addon)}
                            className={`flex justify-between items-center p-1.5 px-2 rounded-lg border text-xs cursor-pointer transition ${
                              isChecked
                                ? 'border-[#ff8a00] bg-[#ff8a00]/10 text-white'
                                : 'border-gray-800 text-gray-300'
                            }`}
                          >
                            <span className="flex items-center gap-1.5">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {}}
                                className="accent-[#ff8a00]"
                              />
                              {addon.name[lang]}
                            </span>
                            <span className="text-[#ffaa00] font-bold">
                              {addon.price > 0 ? `+${addon.price} DA` : 'مجاناً'}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between mt-4 pt-2.5 border-t border-gray-800">
                  <div className="flex items-center gap-2 bg-[#1e1e1e] px-2 py-0.5 rounded-lg border border-gray-700">
                    <button
                      type="button"
                      onClick={() => setItemQuantity(Math.max(1, itemQuantity - 1))}
                      className="text-gray-400 hover:text-white font-bold text-sm cursor-pointer px-1"
                    >
                      -
                    </button>
                    <span className="font-bold text-xs min-w-[14px] text-center">{itemQuantity}</span>
                    <button
                      type="button"
                      onClick={() => setItemQuantity(itemQuantity + 1)}
                      className="text-gray-400 hover:text-white font-bold text-sm cursor-pointer px-1"
                    >
                      +
                    </button>
                  </div>

                  <span className="text-lg font-audiowide font-bold text-[#ff8a00]">
                    {getModalFinalPrice()} DA
                  </span>
                </div>

                <button
                  type="button"
                  onClick={addToCartFromModal}
                  className="w-full mt-3 bg-[#ff8a00] hover:bg-[#e67a00] text-black font-bold py-2 rounded-lg transition text-xs cursor-pointer shadow-md"
                >
                  {t.addToCart}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ORDER SUCCESS */}
      {orderPlaced && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 animate-fade-in-up">
          <div className="bg-[#111] border border-[#ff8a00] rounded-2xl p-6 max-w-xs w-full text-center flex flex-col items-center">
            <div className="text-4xl mb-2">🎉</div>
            <h2 className="text-lg font-bold text-white mb-1">{t.orderSuccess}</h2>
            <p className="text-gray-400 text-xs mb-4">{t.orderSuccessSub}</p>
            <button
              type="button"
              onClick={() => {
                setOrderPlaced(false);
                setCurrentPage('home');
              }}
              className="bg-[#ff8a00] text-black font-bold px-5 py-2 rounded-full hover:scale-105 transition-all text-xs cursor-pointer shadow-md"
            >
              {t.backHome}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { validateOrder, placeOrder, UNIT_PRICE } from './orders';
import bgImg from './assets/bg.png';
import burgerImg from './assets/burger.png';
import btnImg from './assets/btn.png';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80';

const MENU_ADDONS = {
  Burgers: [
    { id: 'cheese', name: { en: 'Extra Melted Cheese', ar: 'جبنة ذائبة إضافية' }, price: 50 },
    { id: 'sauce', name: { en: 'Special Burger Sauce', ar: 'صوص برغر خاص' }, price: 30 },
    { id: 'bacon', name: { en: 'Crispy Beef Bacon', ar: 'بيكون مقرمش' }, price: 80 },
  ],
  Pizza: [
    { id: 'mozzarella', name: { en: 'Extra Mozzarella', ar: 'موزاريلا مضاعفة' }, price: 100 },
    { id: 'mushrooms', name: { en: 'Fresh Mushrooms', ar: 'فطر طازج' }, price: 60 },
    { id: 'olives', name: { en: 'Black Olives', ar: 'زيتون أسود' }, price: 30 },
  ],
  Drinks: [
    { id: 'ice', name: { en: 'Extra Ice Cubes', ar: 'ثلج إضافي' }, price: 0 },
    { id: 'lemon', name: { en: 'Lemon Slice', ar: 'شريحة ليمون' }, price: 20 },
  ],
};

const SIZES = [
  { id: 'regular', name: { en: 'Regular', ar: 'عادي' }, extra: 0 },
  { id: 'large', name: { en: 'Large (+100 DA)', ar: 'كبير (+100 د.ج)' }, extra: 100 },
];

const TEXT = {
  en: {
    nav: { home: 'HOME', menu: 'MENU', offers: 'OFFERS', contact: 'CONTACT' },
    offersAlert: 'Offers coming soon!',
    heroLine1: 'ENJOY FLAVOR.',
    heroLine2: 'DELIVERED FAST.',
    heroText: 'Fresh ingredients, mouthwatering recipes, and quick delivery right to your door.',
    orderNow: 'Order Now',
    features: [
      { icon: '🍃', title: 'Fresh Ingredients', sub: '100% Organic & Quality' },
      { icon: '⏰', title: 'Fast Delivery', sub: 'Hot & Fresh in 30 Mins' },
      { icon: '🔥', title: 'Premium Taste', sub: 'Made with Passion' },
    ],
    exploreMenu: 'EXPLORE OUR MENU',
    categories: { All: 'All', Burgers: 'Burgers', Pizza: 'Pizza', Drinks: 'Drinks' },
    loading: 'Loading menu...',
    emptyTitle: 'No products available at the moment',
    emptySub: 'New items will appear here as soon as they are added by the restaurant.',
    defaultDesc: 'A delicious meal prepared just for you.',
    productImage: 'Product Image',
    saleTitle: 'Get 20% Off Your First Order!',
    saleSub: 'Use code FOOD20 at checkout for instant discount.',
    claim: 'Claim Discount',
    cartTitle: 'Shopping Cart',
    cartSub: 'Review your items before checkout.',
    cartEmptyTitle: 'Your Cart is Empty',
    cartEmptySub: "Looks like you haven't added any meals yet.",
    exploreBtn: 'Explore Menu',
    item: 'Item',
    unitPrice: 'Unit Price',
    quantity: 'Quantity',
    subtotal: 'Subtotal',
    classicMeal: 'Classic Meal',
    orderSummary: 'Order Summary',
    deliveryFee: 'Delivery Fee',
    total: 'Total',
    checkoutBtn: 'Proceed to Checkout',
    deliveryInfo: 'Delivery Information',
    fullName: 'Full Name',
    phone: 'Phone Number',
    street: 'Street Address',
    building: 'Building / Apt. Number',
    paymentMethods: 'Payment Methods',
    cod: 'Cash on Delivery',
    codSub: 'Pay when order arrives',
    ccp: 'BaridiMob / CCP Transfer',
    ccpSub: 'Transfer and upload proof',
    upload: 'Upload Receipt Photo',
    totalPrice: 'Total Price',
    placeOrder: 'Place Order',
    placing: 'Placing Order...',
    contactUs: 'Contact Us',
    email: 'Email',
    phoneLabel: 'Phone',
    hours: 'Opening Hours',
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    addToCart: 'Add to Cart',
    detailsFallback: 'A detailed description of the product.',
    orderSuccess: 'Order Placed Successfully!',
    orderSuccessSub: 'Your order has been sent to the restaurant dashboard.',
    backHome: 'Back to Home',
    addedToast: 'Added to cart successfully!',
    viewCart: 'View Cart',
    chooseSize: 'Choose Size',
    extraAddons: 'Optional Add-ons',
  },
  ar: {
    nav: { home: 'الرئيسية', menu: 'المنيو', offers: 'العروض', contact: 'اتصل بنا' },
    offersAlert: 'العروض قريباً!',
    heroLine1: 'استمتع بالنكهة.',
    heroLine2: 'توصيل سريع.',
    heroText: 'مكونات طازجة، وصفات شهية، وتوصيل سريع حتى باب منزلك.',
    orderNow: 'اطلب الآن',
    features: [
      { icon: '🍃', title: 'مكونات طازجة', sub: '100% طبيعية وعالية الجودة' },
      { icon: '⏰', title: 'توصيل سريع', sub: 'ساخن وطازج خلال 30 دقيقة' },
      { icon: '🔥', title: 'طعم مميز', sub: 'محضّر بشغف' },
    ],
    exploreMenu: 'اكتشف المنيو',
    categories: { All: 'الكل', Burgers: 'برغر', Pizza: 'بيتزا', Drinks: 'مشروبات' },
    loading: 'جاري تحميل المنيو...',
    emptyTitle: 'لا توجد منتجات متاحة حالياً',
    emptySub: 'ستظهر المنتجات هنا فور إضافتها من طرف المطعم.',
    defaultDesc: 'وجبة لذيذة محضّرة خصيصاً لك.',
    productImage: 'صورة المنتج',
    saleTitle: 'احصل على خصم 20% على طلبك الأول!',
    saleSub: 'استخدم الكود FOOD20 عند الدفع للحصول على خصم فوري.',
    claim: 'احصل على الخصم',
    cartTitle: 'سلة التسوق',
    cartSub: 'راجع منتجاتك قبل إتمام الطلب.',
    cartEmptyTitle: 'سلتك فارغة',
    cartEmptySub: 'يبدو أنك لم تضف أي وجبة بعد.',
    exploreBtn: 'تصفح المنيو',
    item: 'المنتج',
    unitPrice: 'سعر الوحدة',
    quantity: 'الكمية',
    subtotal: 'المجموع الفرعي',
    classicMeal: 'وجبة كلاسيكية',
    orderSummary: 'ملخص الطلب',
    deliveryFee: 'رسوم التوصيل',
    total: 'المجموع',
    checkoutBtn: 'متابعة إلى الدفع',
    deliveryInfo: 'معلومات التوصيل',
    fullName: 'الاسم الكامل',
    phone: 'رقم الهاتف',
    street: 'عنوان الشارع',
    building: 'رقم العمارة / الشقة',
    paymentMethods: 'طرق الدفع',
    cod: 'الدفع عند الاستلام',
    codSub: 'ادفع عند وصول الطلب',
    ccp: 'تحويل بريدي موب / CCP',
    ccpSub: 'قم بالتحويل وارفع الإثبات',
    upload: 'ارفع صورة الوصل',
    totalPrice: 'السعر الإجمالي',
    placeOrder: 'تأكيد الطلب',
    placing: 'جاري إرسال الطلب...',
    contactUs: 'اتصل بنا',
    email: 'البريد',
    phoneLabel: 'الهاتف',
    hours: 'ساعات العمل',
    days: ['الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد'],
    addToCart: 'أضف إلى السلة',
    detailsFallback: 'وصف تفصيلي للمنتج.',
    orderSuccess: 'تم إرسال الطلب بنجاح!',
    orderSuccessSub: 'تم إرسال طلبك إلى لوحة تحكم المطعم.',
    backHome: 'العودة للرئيسية',
    addedToast: 'تمت الإضافة إلى السلة بنجاح!',
    viewCart: 'عرض السلة',
    chooseSize: 'اختر الحجم',
    extraAddons: 'إضافات اختيارية',
  },
};

function App() {
  const [lang, setLang] = useState('en');
  const t = TEXT[lang];

  const [currentPage, setCurrentPage] = useState('home');
  const [activeCategory, setActiveCategory] = useState('All');
  const categories = ['All', 'Burgers', 'Pizza', 'Drinks'];

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [cartItems, setCartItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [selectedSize, setSelectedSize] = useState('regular');
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [itemQuantity, setItemQuantity] = useState(1);

  const [toastMessage, setToastMessage] = useState(null);

  const [paymentMethod, setPaymentMethod] = useState('ccp');
  const [orderPlaced, setOrderPlaced] = useState(false);

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [buildingNumber, setBuildingNumber] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchProducts();

    const channel = supabase
      .channel('public:products')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        fetchProducts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('products').select('*');
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (itemName) => {
    setToastMessage(`${itemName}: ${t.addedToast}`);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const openProductModal = (product) => {
    setSelectedProduct(product);
    setSelectedSize('regular');
    setSelectedAddons([]);
    setItemQuantity(1);
  };

  const toggleAddon = (addon) => {
    if (selectedAddons.some((a) => a.id === addon.id)) {
      setSelectedAddons(selectedAddons.filter((a) => a.id !== addon.id));
    } else {
      setSelectedAddons([...selectedAddons, addon]);
    }
  };

  const getModalFinalPrice = () => {
    if (!selectedProduct) return 0;
    const base = Number(selectedProduct.price || UNIT_PRICE);
    const sizeExtra = selectedSize === 'large' ? 100 : 0;
    const addonsExtra = selectedAddons.reduce((acc, curr) => acc + curr.price, 0);
    return (base + sizeExtra + addonsExtra) * itemQuantity;
  };

  const addToCartFromModal = () => {
    if (selectedProduct) {
      const configuredItem = {
        ...selectedProduct,
        cartId: `${selectedProduct.id}-${Date.now()}`,
        finalPrice: getModalFinalPrice() / itemQuantity,
        quantity: itemQuantity,
        selectedSize: selectedSize === 'large' ? 'Large' : 'Regular',
        addons: selectedAddons.map((a) => a.name[lang]),
      };

      setCartItems((prev) => [...prev, configuredItem]);
      showToast(selectedProduct.name);
    }
    setSelectedProduct(null);
  };

  const quickAdd = (e, product) => {
    e.stopPropagation();
    if (product.category && product.category !== 'Drinks') {
      openProductModal(product);
      return;
    }

    const simpleItem = {
      ...product,
      cartId: `${product.id}-${Date.now()}`,
      finalPrice: Number(product.price || UNIT_PRICE),
      quantity: 1,
      addons: [],
    };
    setCartItems((prev) => [...prev, simpleItem]);
    showToast(product.name);
  };

  const updateQuantity = (cartId, delta) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.cartId === cartId) {
            const newQty = (item.quantity || 1) + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const filteredProducts =
    activeCategory === 'All'
      ? products
      : products.filter((p) => p.category?.trim().toLowerCase() === activeCategory.trim().toLowerCase());

  const total = cartItems.reduce(
    (sum, item) => sum + Number(item.finalPrice || item.price || UNIT_PRICE) * (item.quantity || 1),
    0
  );

  const scrollToSection = (id) => {
    setCurrentPage('home');
    setMobileMenuOpen(false);
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 150);
  };

  const handlePlaceOrder = async () => {
    if (isSubmitting) return;

    const errors = validateOrder({
      name: customerName,
      phone: customerPhone,
      street: streetAddress,
      cartCount: cartItems.length,
    });
    const firstError = Object.values(errors)[0];
    if (firstError) {
      alert(firstError);
      return;
    }

    setIsSubmitting(true);
    try {
      let receiptUrl = '';
      if (paymentMethod === 'ccp' && receiptFile) {
        const fileExt = receiptFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('receipts')
          .upload(`public/${fileName}`, receiptFile);

        if (!uploadError) {
          const { data: publicURL } = supabase.storage.from('receipts').getPublicUrl(`public/${fileName}`);
          receiptUrl = publicURL?.publicUrl || '';
        }
      }

      const { error, message } = await placeOrder({
        name: customerName,
        phone: customerPhone,
        street: streetAddress,
        building: buildingNumber,
        items: cartItems,
        method: paymentMethod,
        receiptUrl,
      });

      if (error) {
        alert(message);
        return;
      }

      setOrderPlaced(true);
      setCartItems([]);
      setCustomerName('');
      setCustomerPhone('');
      setStreetAddress('');
      setBuildingNumber('');
      setReceiptFile(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderHeader = () => (
    <header className="w-full max-w-[1200px] mx-auto flex justify-between items-center py-3 px-4 sm:px-6 md:py-6 border-b border-gray-700/50 relative z-50 bg-[#080808]/80 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="lg:hidden text-white hover:text-[#ff8a00] p-1.5 rounded-lg border border-gray-800 bg-[#141414] focus:outline-none transition cursor-pointer"
          aria-label="Toggle Menu"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div
          onClick={() => {
            setCurrentPage('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-1 font-audiowide text-base sm:text-2xl tracking-widest cursor-pointer hover:scale-105 transition-transform"
        >
          <span className="text-[#ff8a00]">HOUSE</span>
          <span className="text-white">FOOD</span>
        </div>
      </div>

      <nav className="hidden lg:flex gap-8 text-sm tracking-wide font-sans items-center">
        <button
          type="button"
          onClick={() => {
            setCurrentPage('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`hover:text-[#ff8a00] transition cursor-pointer ${
            currentPage === 'home' ? 'text-[#ff8a00]' : 'text-white'
          }`}
        >
          {t.nav.home}
        </button>
        <button
          type="button"
          onClick={() => scrollToSection('menu-section')}
          className="hover:text-[#ff8a00] transition text-white cursor-pointer"
        >
          {t.nav.menu}
        </button>
        <button
          type="button"
          onClick={() => alert(t.offersAlert)}
          className="hover:text-[#ff8a00] transition text-white cursor-pointer"
        >
          {t.nav.offers}
        </button>
        <button
          type="button"
          onClick={() => scrollToSection('footer-section')}
          className="hover:text-[#ff8a00] transition text-white cursor-pointer"
        >
          {t.nav.contact}
        </button>
      </nav>

      <div className="flex items-center gap-3 sm:gap-5">
        <div className="flex items-center gap-1 text-[11px] sm:text-xs font-bold bg-[#1a1a1a] px-2.5 sm:px-3 py-1 rounded-full border border-gray-700">
          <button
            type="button"
            onClick={() => setLang('en')}
            className={`px-1.5 py-0.5 rounded transition ${
              lang === 'en' ? 'bg-[#ff8a00] text-black font-extrabold' : 'text-gray-400 hover:text-white'
            }`}
          >
            EN
          </button>
          <span className="text-gray-500">|</span>
          <button
            type="button"
            onClick={() => setLang('ar')}
            className={`px-1.5 py-0.5 rounded transition ${
              lang === 'ar' ? 'bg-[#ff8a00] text-black font-extrabold' : 'text-gray-400 hover:text-white'
            }`}
          >
            AR
          </button>
        </div>
        <div
          onClick={() => setCurrentPage('cart')}
          className="relative text-[#ff8a00] text-xl sm:text-2xl cursor-pointer hover:scale-110 active:scale-95 transition-transform"
        >
          🛒
          {cartItems.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center font-bold">
              {cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0)}
            </span>
          )}
        </div>
      </div>
    </header>
  );

  return (
    <div
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className="min-h-screen bg-[#080808] w-full text-white overflow-x-hidden relative font-sans"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Audiowide&family=Inria+Serif:wght@400;700&display=swap');
        .font-audiowide { font-family: 'Audiowide', cursive; }
        .font-inria { font-family: 'Inria Serif', serif; }
        @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-8px); } 100% { transform: translateY(0px); } }
        .animate-float { animation: float 4s ease-in-out infinite; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fadeInUp 0.4s ease-out forwards; }
      `}</style>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          ></div>

          <div
            className={`fixed top-0 bottom-0 ${
              lang === 'ar' ? 'right-0 border-l' : 'left-0 border-r'
            } w-[280px] bg-[#0f0f0f] border-gray-800 p-6 flex flex-col justify-between shadow-2xl z-10`}
          >
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-gray-800">
                <div className="flex items-center gap-1 font-audiowide text-xl tracking-widest">
                  <span className="text-[#ff8a00]">HOUSE</span>
                  <span className="text-white">FOOD</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-400 hover:text-white p-1 text-2xl cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <nav className="flex flex-col gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentPage('home');
                    setMobileMenuOpen(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`text-start py-3 px-4 rounded-xl font-medium transition cursor-pointer ${
                    currentPage === 'home'
                      ? 'bg-[#ff8a00]/10 text-[#ff8a00] font-bold'
                      : 'text-gray-300 hover:bg-[#1a1a1a] hover:text-white'
                  }`}
                >
                  🏠 {t.nav.home}
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection('menu-section')}
                  className="text-start py-3 px-4 rounded-xl font-medium text-gray-300 hover:bg-[#1a1a1a] hover:text-white transition cursor-pointer"
                >
                  🍽️ {t.nav.menu}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    alert(t.offersAlert);
                  }}
                  className="text-start py-3 px-4 rounded-xl font-medium text-gray-300 hover:bg-[#1a1a1a] hover:text-white transition cursor-pointer"
                >
                  🔥 {t.nav.offers}
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection('footer-section')}
                  className="text-start py-3 px-4 rounded-xl font-medium text-gray-300 hover:bg-[#1a1a1a] hover:text-white transition cursor-pointer"
                >
                  📞 {t.nav.contact}
                </button>
              </nav>
            </div>

            <div className="pt-6 border-t border-gray-800">
              <button
                type="button"
                onClick={() => {
                  setCurrentPage('cart');
                  setMobileMenuOpen(false);
                }}
                className="w-full bg-[#ff8a00] text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <span>🛒</span> {t.cartTitle} ({cartItems.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-4 end-4 sm:bottom-6 sm:end-6 z-50 bg-[#ff8a00] text-black font-bold px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 text-xs sm:text-sm animate-fade-in-up">
          <span>✅ {toastMessage}</span>
          <button
            type="button"
            onClick={() => setCurrentPage('cart')}
            className="bg-black text-white text-[10px] sm:text-xs px-2.5 py-1 rounded hover:bg-gray-800 transition"
          >
            {t.viewCart}
          </button>
        </div>
      )}

      {/* ===================== HOME ===================== */}
      {currentPage === 'home' && (
        <>
          <section className="relative w-full overflow-hidden bg-[#080808]">
            <div
              aria-hidden="true"
              className="absolute inset-0 w-full h-full bg-cover bg-bottom opacity-90 z-0 pointer-events-none"
              style={{ backgroundImage: `url(${bgImg})` }}
            ></div>

            {renderHeader()}

            <div className="flex lg:hidden flex-col items-center text-center px-4 pt-6 pb-14 relative z-10">
              <h1 className={`font-inria font-bold text-[#f1e2e2] text-3xl sm:text-4xl animate-fade-in-up m-0 p-0 ${lang === 'ar' ? 'leading-[1.4]' : 'leading-[1.2]'}`}>
                {t.heroLine1}
              </h1>
              <h2 className={`font-inria font-bold text-[#ff8a00] text-3xl sm:text-4xl animate-fade-in-up m-0 p-0 mt-2 ${lang === 'ar' ? 'leading-[1.4]' : 'leading-[1.2]'}`}>
                {t.heroLine2}
              </h2>
              <p className="font-inria text-[#a0aec0] text-sm mt-3 max-w-[280px] leading-relaxed">
                {t.heroText}
              </p>

              <div className="relative w-[80%] max-w-[280px] mt-4 mb-2 animate-float">
                <img
                  src={burgerImg}
                  alt="Delicious Burger"
                  className="w-full h-auto object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.9)]"
                />
              </div>

              <div className="animate-fade-in-up mt-2">
                <button
                  type="button"
                  onClick={() => scrollToSection('menu-section')}
                  className="hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer animate-pulse"
                >
                  <img
                    src={btnImg}
                    alt={t.orderNow}
                    className="w-[200px] sm:w-[220px] drop-shadow-[0_8px_20px_rgba(255,138,0,0.6)] object-contain"
                  />
                </button>
              </div>
            </div>

            <div className="hidden lg:flex w-full max-w-[1200px] mx-auto justify-between items-center px-8 sm:px-12 md:px-16 py-20 relative z-10">
              <div className="flex flex-col items-start text-left max-w-xl z-20 animate-fade-in-up">
                <h1 className={`font-inria font-bold text-[#f1e2e2] text-[54px] xl:text-[62px] m-0 p-0 ${lang === 'ar' ? 'leading-[1.4]' : 'leading-[1.2]'}`}>
                  {t.heroLine1}
                </h1>
                <h2 className={`font-inria font-bold text-[#ff8a00] text-[54px] xl:text-[62px] m-0 p-0 mt-3 ${lang === 'ar' ? 'leading-[1.4]' : 'leading-[1.2]'}`}>
                  {t.heroLine2}
                </h2>
                <p className="font-inria text-[#a0aec0] text-lg mt-4 max-w-md leading-relaxed">
                  {t.heroText}
                </p>

                <div className="mt-8">
                  <button
                    type="button"
                    onClick={() => scrollToSection('menu-section')}
                    className="hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer animate-pulse hover:animate-none"
                  >
                    <img
                      src={btnImg}
                      alt={t.orderNow}
                      className="w-[210px] xl:w-[230px] drop-shadow-[0_8px_20px_rgba(255,138,0,0.5)] object-contain"
                    />
                  </button>
                </div>
              </div>

              <div className="relative z-10 w-[450px] xl:w-[500px]">
                <div className="relative w-full flex justify-center items-center animate-float">
                  <img
                    src={burgerImg}
                    alt="Delicious Burger"
                    className="w-full h-auto object-contain drop-shadow-[0_30px_40px_rgba(0,0,0,0.95)]"
                  />
                </div>
              </div>
            </div>
          </section>

          <div className="w-full flex flex-col items-center relative z-30 px-4 sm:px-6 -mt-6 sm:-mt-10 animate-fade-in-up">
            <div className="w-full max-w-[1000px] bg-[#111111] border border-[#2b2b2b] rounded-2xl md:rounded-[40px] py-4 px-4 sm:py-6 md:py-8 md:px-12 flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0 shadow-2xl hover:border-[#ff8a00]/40 transition-colors duration-300">
              {t.features.map((f, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <div className="hidden sm:block h-10 w-px bg-gray-700"></div>}
                  <div className="flex flex-col items-center text-center group cursor-default">
                    <div className="text-xl sm:text-2xl md:text-3xl mb-0.5 sm:mb-1 opacity-80 group-hover:scale-110 transition-transform duration-300">{f.icon}</div>
                    <h3 className="font-inria font-bold text-white text-sm sm:text-base md:text-lg">{f.title}</h3>
                    <p className="font-sans text-[#ffaa00] text-[10px] sm:text-xs mt-0.5">{f.sub}</p>
                  </div>
                </React.Fragment>
              ))}
            </div>

            <div id="menu-section" className="w-full max-w-[1100px] mt-12 sm:mt-20 flex flex-col items-center">
              <h2 className="font-inria font-bold text-xl sm:text-3xl md:text-4xl text-white tracking-widest mb-5 sm:mb-8 text-center">
                {t.exploreMenu}
              </h2>

              <div className="flex justify-center gap-2 sm:gap-4 mb-6 sm:mb-10 flex-wrap">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3.5 sm:px-5 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-bold border-2 transition-all duration-300 cursor-pointer ${
                      activeCategory === cat
                        ? 'border-[#ff8a00] text-[#ff8a00] scale-105 shadow-[0_5px_15px_rgba(255,138,0,0.3)] bg-[#ff8a00]/10'
                        : 'border-[#333] text-gray-400 hover:border-gray-500 hover:text-white'
                    }`}
                  >
                    {t.categories[cat]}
                  </button>
                ))}
              </div>

              {loading ? (
                <p className="text-center text-gray-400 py-10 animate-pulse">{t.loading}</p>
              ) : filteredProducts.length === 0 ? (
                <div className="w-full max-w-[600px] bg-[#111] border border-gray-800 rounded-3xl p-6 sm:p-10 text-center my-4 flex flex-col items-center">
                  <div className="text-4xl mb-2">🍽️</div>
                  <p className="text-base sm:text-lg text-white font-semibold mb-1">{t.emptyTitle}</p>
                  <p className="text-xs text-gray-500 max-w-sm">{t.emptySub}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-7 w-full max-w-[1000px]">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => openProductModal(product)}
                      className="bg-[#1a1a1a] border border-[#2b2520] rounded-[18px] p-4 flex flex-col hover:-translate-y-2 hover:border-[#ff8a00]/50 transition-all duration-300 cursor-pointer group shadow-lg"
                    >
                      <div className="w-full h-[170px] bg-[#2a2a2a] rounded-[14px] mb-3 overflow-hidden flex items-center justify-center">
                        <img
                          src={product.image_url || FALLBACK_IMAGE}
                          alt={product.name}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = FALLBACK_IMAGE;
                          }}
                          className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                        />
                      </div>
                      <h4 className="text-white font-bold text-base mb-1 group-hover:text-[#ff8a00] transition-colors">{product.name}</h4>
                      <p className="text-gray-400 text-xs mb-3 line-clamp-2">
                        {product.description || t.defaultDesc}
                      </p>
                      <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-800">
                        <span className="text-[#ffaa00] font-bold text-lg font-audiowide">
                          {product.price} DA
                        </span>
                        <button
                          type="button"
                          onClick={(e) => quickAdd(e, product)}
                          className="bg-[#ffaa00] text-black w-8 h-8 rounded-lg font-extrabold text-xl flex items-center justify-center hover:scale-110 active:scale-90 transition-transform duration-200 cursor-pointer shadow-md"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="w-full max-w-[1000px] bg-[#111111] border border-[#333] rounded-[15px] p-4 sm:p-5 mt-12 mb-8 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl">
              <div className="flex items-center gap-3 text-center sm:text-left">
                <span className="bg-[#ffaa00] text-black text-[11px] font-black px-2.5 py-1 rounded animate-pulse shrink-0 shadow-md">
                  SALE
                </span>
                <div>
                  <h3 className="text-white font-sans font-bold text-sm sm:text-base">{t.saleTitle}</h3>
                  <p className="text-gray-400 text-[11px] mt-0.5">{t.saleSub}</p>
                </div>
              </div>
              <button
                type="button"
                className="bg-[#ffaa00] text-black font-bold px-5 py-1.5 rounded-full text-xs hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer shrink-0 shadow-md"
              >
                {t.claim} &rarr;
              </button>
            </div>
          </div>
        </>
      )}

      {/* ===================== CART ===================== */}
      {currentPage === 'cart' && (
        <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 animate-fade-in-up">
          {renderHeader()}
          <div className="mt-6 sm:mt-10">
            <div className="flex flex-col mb-6">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🛒</span>
                <h1 className="text-2xl sm:text-3xl font-sans font-medium">
                  {t.cartTitle}
                </h1>
              </div>
              <p className="text-gray-500 text-xs sm:text-sm mt-1">{t.cartSub}</p>
            </div>

            {cartItems.length === 0 ? (
              <div className="w-full bg-[#111111] border border-gray-800 rounded-2xl p-8 sm:p-14 flex flex-col items-center justify-center text-center my-6">
                <div className="text-5xl mb-2">🛒</div>
                <h2 className="text-lg sm:text-xl font-bold text-white mb-1">{t.cartEmptyTitle}</h2>
                <p className="text-gray-400 text-xs sm:text-sm max-w-sm mb-5">{t.cartEmptySub}</p>
                <button
                  type="button"
                  onClick={() => setCurrentPage('home')}
                  className="bg-[#ff8a00] text-black font-bold px-6 py-2 rounded-full hover:scale-105 transition-all text-xs sm:text-sm"
                >
                  {t.exploreBtn}
                </button>
              </div>
            ) : (
              <div className="flex flex-col lg:flex-row gap-6 items-start">
                <div className="w-full lg:flex-1 bg-[#111111] border border-gray-800 rounded-2xl p-4 sm:p-5">
                  {cartItems.map((item, index) => {
                    const price = Number(item.finalPrice || item.price || UNIT_PRICE);
                    const qty = item.quantity || 1;
                    return (
                      <div
                        key={item.cartId || index}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-3.5 border-b border-gray-800 last:border-0 gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-700 rounded-lg overflow-hidden shrink-0">
                            <img
                              src={item.image_url || FALLBACK_IMAGE}
                              alt={item.name}
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = FALLBACK_IMAGE;
                              }}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="text-white font-medium text-xs sm:text-sm">
                              {item.name || t.classicMeal}
                            </div>
                            {item.selectedSize && (
                              <div className="text-[10px] text-gray-400">
                                {t.chooseSize}: {item.selectedSize}
                              </div>
                            )}
                            {item.addons?.length > 0 && (
                              <div className="text-[10px] text-[#ff8a00]">
                                + {item.addons.join(', ')}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                          <div className="flex items-center gap-2 bg-[#1e1e1e] px-2 py-1 rounded-lg border border-gray-700">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.cartId, -1)}
                              className="text-gray-400 hover:text-white font-bold text-sm cursor-pointer px-1"
                            >
                              -
                            </button>
                            <span className="font-bold text-xs min-w-[16px] text-center text-white">{qty}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.cartId, 1)}
                              className="text-gray-400 hover:text-white font-bold text-sm cursor-pointer px-1"
                            >
                              +
                            </button>
                          </div>

                          <span className="text-[#ffaa00] font-bold text-xs sm:text-sm whitespace-nowrap">
                            {price * qty} DA
                          </span>

                          <button
                            type="button"
                            onClick={() => setCartItems(cartItems.filter((_, i) => i !== index))}
                            className="text-[#ff4444] hover:scale-110 transition p-1 text-sm cursor-pointer"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="w-full lg:w-[320px] bg-[#111111] border border-gray-800 rounded-2xl p-4 sm:p-5 shadow-xl shrink-0">
                  <h2 className="text-base font-bold mb-3">{t.orderSummary}</h2>
                  <div className="flex justify-between text-gray-400 text-xs mb-2">
                    <span>{t.subtotal}</span>
                    <span>{total} DA</span>
                  </div>
                  <div className="flex justify-between text-gray-400 text-xs mb-3">
                    <span>{t.deliveryFee}</span>
                    <span>0 DA</span>
                  </div>
                  <div className="border-t border-gray-700 pt-3 mb-5 flex justify-between items-center">
                    <span className="text-lg font-bold">{t.total}</span>
                    <span className="text-[#ff8a00] text-base font-bold font-audiowide">{total} DA</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentPage('checkout')}
                    className="w-full bg-[#ff8a00] hover:bg-[#e67a00] text-black font-bold py-2.5 rounded-full transition-all text-xs cursor-pointer shadow-md"
                  >
                    {t.checkoutBtn}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================== CHECKOUT ===================== */}
      {currentPage === 'checkout' && (
        <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 animate-fade-in-up">
          {renderHeader()}
          <div className="mt-6 sm:mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="bg-[#1e1e1e] rounded-[18px] p-5 sm:p-6 w-full border border-gray-800">
              <h2 className="text-base sm:text-lg font-bold mb-3 text-white">{t.deliveryInfo}</h2>
              <div className="flex flex-col gap-2.5">
                <input
                  type="text"
                  placeholder={t.fullName}
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-[#2a2a2a] border border-gray-600 rounded-md p-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-[#ff8a00]"
                />
                <input
                  type="tel"
                  placeholder={t.phone}
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-[#2a2a2a] border border-gray-600 rounded-md p-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-[#ff8a00]"
                />
                <input
                  type="text"
                  placeholder={t.street}
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  className="w-full bg-[#2a2a2a] border border-gray-600 rounded-md p-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-[#ff8a00]"
                />
                <input
                  type="text"
                  placeholder={t.building}
                  value={buildingNumber}
                  onChange={(e) => setBuildingNumber(e.target.value)}
                  className="w-full bg-[#2a2a2a] border border-gray-600 rounded-md p-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-[#ff8a00]"
                />
              </div>
            </div>

            <div className="w-full flex flex-col gap-3">
              <h2 className="text-base sm:text-lg font-bold text-white">{t.paymentMethods}</h2>

              <div
                onClick={() => setPaymentMethod('cod')}
                className={`border rounded-[14px] p-3.5 cursor-pointer flex items-center gap-3 ${
                  paymentMethod === 'cod' ? 'border-white bg-[#1e1e1e]' : 'border-gray-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === 'cod' ? 'border-white' : 'border-gray-500'
                  }`}
                >
                  {paymentMethod === 'cod' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                </div>
                <div>
                  <h3 className="text-white font-medium text-xs sm:text-sm">{t.cod}</h3>
                  <p className="text-gray-500 text-[11px]">{t.codSub}</p>
                </div>
              </div>

              <div
                onClick={() => setPaymentMethod('ccp')}
                className={`border rounded-[14px] p-3.5 cursor-pointer flex flex-col gap-2.5 ${
                  paymentMethod === 'ccp' ? 'border-white bg-[#1e1e1e]' : 'border-gray-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === 'ccp' ? 'border-white' : 'border-gray-500'
                    }`}
                  >
                    {paymentMethod === 'ccp' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                  </div>
                  <div>
                    <h3 className="text-white font-medium text-xs sm:text-sm">{t.ccp}</h3>
                    <p className="text-gray-500 text-[11px]">{t.ccpSub}</p>
                  </div>
                </div>
                {paymentMethod === 'ccp' && (
                  <div className="w-full border border-dashed border-gray-600 rounded-xl p-3 flex flex-col items-center justify-center bg-[#2a2a2a] relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setReceiptFile(e.target.files[0])}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <span className="text-white text-xs text-center">
                      {receiptFile ? `✅ ${receiptFile.name}` : t.upload}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-[#1e1e1e] rounded-[18px] p-5 sm:p-6 w-full border border-gray-800">
              <h2 className="text-base sm:text-lg font-bold mb-3 text-white">{t.orderSummary}</h2>
              <div className="flex justify-between items-center mb-5 pt-2 border-t border-gray-700">
                <span className="text-[#ff8a00] font-bold text-sm">{t.totalPrice}</span>
                <span className="text-[#ff8a00] font-bold text-sm">{total} DA</span>
              </div>
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
                className="w-full bg-[#ff8a00] hover:bg-[#e67a00] text-black font-bold py-2.5 rounded-full transition-all text-xs disabled:opacity-60 cursor-pointer shadow-md"
              >
                {isSubmitting ? t.placing : t.placeOrder}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== FOOTER ===================== */}
      {currentPage === 'home' && (
        <footer id="footer-section" className="w-full bg-[#d97c11] pt-8 pb-6 px-4 sm:px-6 flex flex-col items-center mt-14">
          <div className="w-full max-w-[1200px] flex flex-col sm:flex-row justify-between items-start gap-6 text-white">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 mb-2 font-audiowide text-xl">
                <span className="text-[#1a0f02]">FOOD</span> <span className="text-white font-sans font-bold">House</span>
              </div>
              <h4 className="font-bold underline underline-offset-4 decoration-[#3b1f02] mb-1 text-xs uppercase text-[#3b1f02]">
                {t.contactUs}
              </h4>
              <p className="text-xs">{t.email}: support@foodhouse-demo.com</p>
              <p className="text-xs mt-0.5">{t.phoneLabel}: +1 (555) 234-5678</p>
            </div>

            <div>
              <h4 className="font-bold underline underline-offset-4 decoration-[#3b1f02] mb-1.5 text-xs uppercase text-[#3b1f02]">
                {t.hours}
              </h4>
              <ul className="text-xs space-y-0.5 font-sans">
                {t.days.map((day) => (
                  <li key={day}>{day} — 10:00 AM - 11:00 PM</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="w-full max-w-[1200px] h-px bg-[#b5640b] mt-6"></div>
        </footer>
      )}

      {/* ===================== PRODUCT MODAL ===================== */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in-up">
          <div className="bg-[#121212] w-full max-w-[700px] max-h-[90vh] overflow-y-auto p-4 sm:p-6 relative border border-[#2b2520] rounded-2xl shadow-2xl">
            <button
              type="button"
              onClick={() => setSelectedProduct(null)}
              className="absolute top-3 end-4 text-gray-400 hover:text-white text-2xl cursor-pointer"
            >
              ×
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-1">
              <div className="bg-[#1a1a1a] w-full aspect-square rounded-[14px] overflow-hidden flex items-center justify-center">
                <img
                  src={selectedProduct.image_url || FALLBACK_IMAGE}
                  alt={selectedProduct.name}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = FALLBACK_IMAGE;
                  }}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex flex-col text-white">
                <h2 className="font-bold text-xl sm:text-2xl">{selectedProduct.name}</h2>
                <p className="text-gray-400 text-xs mt-1 leading-relaxed">
                  {selectedProduct.description || t.detailsFallback}
                </p>

                <div className="mt-3">
                  <h3 className="text-xs uppercase tracking-wider font-bold text-gray-400 mb-1">
                    {t.chooseSize}
                  </h3>
                  <div className="flex gap-2">
                    {SIZES.map((size) => (
                      <button
                        key={size.id}
                        type="button"
                        onClick={() => setSelectedSize(size.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold border transition ${
                          selectedSize === size.id
                            ? 'border-[#ff8a00] bg-[#ff8a00]/10 text-[#ff8a00]'
                            : 'border-gray-700 text-gray-300'
                        }`}
                      >
                        {size.name[lang]}
                      </button>
                    ))}
                  </div>
                </div>

                {MENU_ADDONS[selectedProduct.category] && (
                  <div className="mt-3">
                    <h3 className="text-xs uppercase tracking-wider font-bold text-gray-400 mb-1">
                      {t.extraAddons}
                    </h3>
                    <div className="flex flex-col gap-1">
                      {MENU_ADDONS[selectedProduct.category].map((addon) => {
                        const isChecked = selectedAddons.some((a) => a.id === addon.id);
                        return (
                          <label
                            key={addon.id}
                            onClick={() => toggleAddon(addon)}
                            className={`flex justify-between items-center p-1.5 px-2 rounded-lg border text-xs cursor-pointer transition ${
                              isChecked
                                ? 'border-[#ff8a00] bg-[#ff8a00]/10 text-white'
                                : 'border-gray-800 text-gray-300'
                            }`}
                          >
                            <span className="flex items-center gap-1.5">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {}}
                                className="accent-[#ff8a00]"
                              />
                              {addon.name[lang]}
                            </span>
                            <span className="text-[#ffaa00] font-bold">
                              {addon.price > 0 ? `+${addon.price} DA` : 'مجاناً'}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between mt-4 pt-2.5 border-t border-gray-800">
                  <div className="flex items-center gap-2 bg-[#1e1e1e] px-2 py-0.5 rounded-lg border border-gray-700">
                    <button
                      type="button"
                      onClick={() => setItemQuantity(Math.max(1, itemQuantity - 1))}
                      className="text-gray-400 hover:text-white font-bold text-sm cursor-pointer px-1"
                    >
                      -
                    </button>
                    <span className="font-bold text-xs min-w-[14px] text-center">{itemQuantity}</span>
                    <button
                      type="button"
                      onClick={() => setItemQuantity(itemQuantity + 1)}
                      className="text-gray-400 hover:text-white font-bold text-sm cursor-pointer px-1"
                    >
                      +
                    </button>
                  </div>

                  <span className="text-lg font-audiowide font-bold text-[#ff8a00]">
                    {getModalFinalPrice()} DA
                  </span>
                </div>

                <button
                  type="button"
                  onClick={addToCartFromModal}
                  className="w-full mt-3 bg-[#ff8a00] hover:bg-[#e67a00] text-black font-bold py-2 rounded-lg transition text-xs cursor-pointer shadow-md"
                >
                  {t.addToCart}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ORDER SUCCESS */}
      {orderPlaced && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 animate-fade-in-up">
          <div className="bg-[#111] border border-[#ff8a00] rounded-2xl p-6 max-w-xs w-full text-center flex flex-col items-center">
            <div className="text-4xl mb-2">🎉</div>
            <h2 className="text-lg font-bold text-white mb-1">{t.orderSuccess}</h2>
            <p className="text-gray-400 text-xs mb-4">{t.orderSuccessSub}</p>
            <button
              type="button"
              onClick={() => {
                setOrderPlaced(false);
                setCurrentPage('home');
              }}
              className="bg-[#ff8a00] text-black font-bold px-5 py-2 rounded-full hover:scale-105 transition-all text-xs cursor-pointer shadow-md"
            >
              {t.backHome}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;