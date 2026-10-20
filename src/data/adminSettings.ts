import {
  WebsiteSettings,
  DeliverySettings,
  PaymentSettings,
  CourierConfig,
  ReturnPolicySettings,
  SeoSettings,
  LiveChatSettings,
  HomepageSectionConfig,
  OrderSettings,
  ReviewSettings,
  RolePermissionMatrix,
  StaffAccount,
  RegisteredCustomer,
  UnifiedConversation,
} from '../types';

export const DEFAULT_WEBSITE_SETTINGS: WebsiteSettings = {
  storeName: 'JotPotShop',
  storeNameBn: 'ঝটপট শপ',
  tagline: 'Everything you need, in one place',
  taglineBn: 'যা দরকার, এক জায়গায়',
  taglineBn2: 'আপনার বিশ্বস্ত অনলাইন শপিং পার্টনার',
  taglineBn3: 'দ্রুততম ডেলিভারি ও সেরা মানের নিশ্চয়তা',
  domain: 'jotpotshop.com',
  hotline: '01800-JOTPOT (01800-568768)',
  whatsappNumber: '+8801700000000',
  supportEmail: 'support@jotpotshop.com',
  officeAddress: 'Level 5, Concord Tower, Road 11, Banani, Dhaka-1213, Bangladesh',
  officeAddressBn: 'লেভেল ৫, কনকর্ড টাওয়ার, রোড ১১, বনানী, ঢাকা-১২১৩, বাংলাদেশ',
  currencySymbol: '৳',
  logoUrl: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=120&q=80',
};

export const DEFAULT_HERO_BANNERS: import('../types').HeroBannerSlide[] = [
  {
    id: 'banner-1',
    badgeBn: '⚡ বৈশাখী ও ঈদ মেগা সেল',
    badgeEn: '⚡ SEASONAL MEGA SALE',
    titleBn: 'যা দরকার, এক জায়গায় — সেরা দামে সেরা কোয়ালিটি!',
    titleEn: 'Everything You Need, In One Place — Best Quality & Price!',
    subtitleBn: 'ছেলেদের প্রিমিয়াম শার্ট, ঐতিহ্যবাহী জামদানি শাড়ি ও এক্সেসরিজে সর্বোচ্চ ৪৫% পর্যন্ত নিশ্চিত ছাড়।',
    subtitleEn: 'Upto 45% discount on Men Fashion, Traditional Sarees & Accessories.',
    ctaBn: 'অফার দেখুন',
    ctaEn: 'Explore Deals',
    category: 'deals-offers',
    bgGradient: 'from-slate-900 via-rose-950 to-slate-900',
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1200&q=80',
    active: true,
  },
  {
    id: 'banner-2',
    badgeBn: '📱 আল্ট্রা গ্যাজেট ফেস্ট',
    badgeEn: '📱 ULTRA GADGET FEST',
    titleBn: 'AMOLED কলিং স্মার্টওয়াচ ও ANC ইয়ারবাডস',
    titleEn: 'AMOLED Calling Smartwatches & ANC Earbuds',
    subtitleBn: 'বাংলা ফন্ট নোটিফিকেশন সাপোর্ট, দীর্ঘস্থায়ী ব্যাটারি ও ব্র্যান্ড ওয়ারেন্টিসহ গ্যাজেট কালেকশন।',
    subtitleEn: 'Full Bangla font support, crystal clear calling & official brand warranty.',
    ctaBn: 'গ্যাজেট কিনুন',
    ctaEn: 'Shop Gadgets',
    category: 'gadgets',
    bgGradient: 'from-blue-950 via-slate-900 to-indigo-950',
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=1200&q=80',
    active: true,
  },
  {
    id: 'banner-3',
    badgeBn: '🎁 প্রিয়জনের জন্য স্পেশাল উপহার',
    badgeEn: '🎁 LUXURY GIFT COMBOS',
    titleBn: 'লাক্সারি গিফট হ্যাম্পার ও এক্সক্লুসিভ কম্বো বক্স',
    titleEn: 'Luxury Gift Hampers & Exclusive Combo Boxes',
    subtitleBn: 'জন্মদিন, বিয়ে বা বিশেষ দিনে উপহার দিতে আকর্ষণীয় প্যাকেজিং ও ফ্রি গিফট কার্ড সুবিধা।',
    subtitleEn: 'Thoughtfully curated gift hampers with premium packaging and fast delivery.',
    ctaBn: 'গিফট আইডিয়া দেখুন',
    ctaEn: 'View Gifts',
    category: 'gift-items',
    need: 'gift',
    bgGradient: 'from-amber-950 via-rose-950 to-slate-900',
    image: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=1200&q=80',
    active: true,
  },
];

export const DEFAULT_DELIVERY_SETTINGS: DeliverySettings = {
  insideDhakaFee: 60,
  chattogramFee: 80,
  outsideDhakaFee: 120,
  freeDeliveryThreshold: 1500,
  expressDeliveryFee: 150,
  insideDhakaDays: '২৪-৪৮ ঘণ্টা (১-২ দিন)',
  chattogramDays: '২৪-৪৮ ঘণ্টা (১-২ দিন)',
  outsideDhakaDays: '৪৮-৭২ ঘণ্টা (২-৩ দিন)',
  chattogramFreeDeliveryOffer: true,
  chattogramOfferTextBn: '🎉 অফার: আজকে চট্টগ্রামের জন্য ডেলিভারি চার্জ সম্পূর্ণ ফ্রি!',
  dhakaFreeDeliveryOffer: false,
};

export const DEFAULT_PAYMENT_SETTINGS: PaymentSettings = {
  codEnabled: true,
  bkashEnabled: true,
  bkashNumber: '01712-345678',
  bkashAccountType: 'Merchant',
  bkashAccountName: 'JotPotShop Official',
  bkashInstructionsBn: 'বিকাশ অ্যাপ অথবা *247# ডায়াল করে পেমেন্ট বা সেন্ড মানি করুন।',
  nagadEnabled: true,
  nagadNumber: '01812-345678',
  nagadAccountType: 'Merchant',
  nagadAccountName: 'JotPotShop Official',
  nagadInstructionsBn: 'নগদ অ্যাপ অথবা *167# ডায়াল করে পেমেন্ট বা সেন্ড মানি করুন।',
  rocketEnabled: false,
  rocketNumber: '01912-345678-9',
  rocketAccountType: 'Personal',
  rocketAccountName: 'JotPotShop Official',
  rocketInstructionsBn: 'রকেট অ্যাপ অথবা *322# ডায়াল করে সেন্ড মানি বা পেমেন্ট সম্পন্ন করুন।',
  taxPercent: 0,
};

export const DEFAULT_COURIER_CONFIGS: CourierConfig[] = [
  {
    id: 'Steadfast',
    name: 'Steadfast Courier',
    nameBn: 'স্টেডফাস্ট কুরিয়ার',
    isActive: false,
    apiKey: '',
    secretKey: '',
    merchantId: '',
    webhookUrl: '',
    autoAssignInsideDhaka: true,
    autoAssignOutsideDhaka: true,
    baseChargeDhaka: 60,
    baseChargeOutside: 120,
    trackingUrlTemplate: 'https://steadfast.com.bd/t/{TRACKING_ID}',
    isSandbox: false,
    connectionStatus: 'disconnected',
    lastConnectedAt: '',
    accountBalance: 0,
    pickupAddress: '',
    pickupPhone: '',
  },
  {
    id: 'RedX',
    name: 'RedX Logistics',
    nameBn: 'রেডএক্স ডেলিভারি',
    isActive: false,
    apiKey: '',
    secretKey: '',
    merchantId: '',
    webhookUrl: '',
    autoAssignInsideDhaka: false,
    autoAssignOutsideDhaka: false,
    baseChargeDhaka: 60,
    baseChargeOutside: 125,
    trackingUrlTemplate: 'https://redx.com.bd/track/{TRACKING_ID}',
    isSandbox: false,
    connectionStatus: 'disconnected',
    accountBalance: 0,
  },
  {
    id: 'Pathao',
    name: 'Pathao Courier',
    nameBn: 'পাঠাও কুরিয়ার',
    isActive: false,
    apiKey: '',
    secretKey: '',
    merchantId: '',
    webhookUrl: '',
    autoAssignInsideDhaka: false,
    autoAssignOutsideDhaka: false,
    baseChargeDhaka: 60,
    baseChargeOutside: 120,
    trackingUrlTemplate: 'https://pathao.com/courier/orders/{TRACKING_ID}',
    isSandbox: false,
    connectionStatus: 'disconnected',
    accountBalance: 0,
  },
  {
    id: 'Paperfly',
    name: 'Paperfly Private Ltd.',
    nameBn: 'পেপারফ্লাই',
    isActive: false,
    apiKey: '',
    secretKey: '',
    merchantId: '',
    webhookUrl: '',
    autoAssignInsideDhaka: false,
    autoAssignOutsideDhaka: false,
    baseChargeDhaka: 65,
    baseChargeOutside: 120,
    trackingUrlTemplate: 'https://paperfly.com.bd/tracking/{TRACKING_ID}',
    isSandbox: false,
    connectionStatus: 'disconnected',
    accountBalance: 0,
  },
  {
    id: 'Sundarban',
    name: 'Sundarban Courier Service',
    nameBn: 'সুন্দরবন কুরিয়ার সার্ভিস',
    isActive: false,
    apiKey: '',
    secretKey: '',
    merchantId: '',
    webhookUrl: '',
    autoAssignInsideDhaka: false,
    autoAssignOutsideDhaka: false,
    baseChargeDhaka: 70,
    baseChargeOutside: 130,
    trackingUrlTemplate: 'https://sundarbancourier.com/trace?cn={TRACKING_ID}',
    isSandbox: false,
    connectionStatus: 'disconnected',
    accountBalance: 0,
  },
  {
    id: 'eCourier',
    name: 'eCourier Limited',
    nameBn: 'ই-কুরিয়ার',
    isActive: false,
    apiKey: '',
    secretKey: '',
    merchantId: '',
    webhookUrl: '',
    autoAssignInsideDhaka: false,
    autoAssignOutsideDhaka: false,
    baseChargeDhaka: 60,
    baseChargeOutside: 120,
    trackingUrlTemplate: 'https://ecourier.com.bd/track?ref={TRACKING_ID}',
    isSandbox: false,
    connectionStatus: 'disconnected',
    accountBalance: 0,
  },
];

export const DEFAULT_RETURN_POLICY: ReturnPolicySettings = {
  allowedDays: 7,
  allowRefund: true,
  allowExchange: true,
  customerCoversReturnFee: false,
  policyNotesBn: 'পণ্য পাওয়ার ৭ দিনের মধ্যে যেকোনো ত্রুটি বা সাইজ পরিবর্তনের জন্য সম্পূর্ণ ফ্রি এক্সচেঞ্জ অথবা ক্যাশ রিফান্ড পাওয়া যাবে। রাইডারের সামনে পণ্য চেক করে নেওয়া যাবে।',
  policyNotesEn: 'Enjoy a 7-day hassle-free replacement or full refund policy. Customers can inspect the product in front of delivery rider.',
};

export const DEFAULT_SEO_SETTINGS: SeoSettings = {
  metaTitle: 'JotPotShop - যা দরকার, এক জায়গায় | সেরা অনলাইন শপিং বাংলাদেশ',
  metaTitleBn: 'JotPotShop - যা দরকার, এক জায়গায় | সেরা অনলাইন শপিং বাংলাদেশ',
  metaDescription: 'বাংলাদেশের দ্রুততম ও সবচেয়ে বিশ্বস্ত ই-কমার্স প্ল্যাটফর্ম JotPotShop। ফ্যাশন, গ্যাজেট, জুয়েলারি ও ঘরের প্রয়োজনীয় সব পণ্য ক্যাশ অন ডেলিভারিতে কিনুন।',
  metaDescriptionBn: 'বাংলাদেশের দ্রুততম ও সবচেয়ে বিশ্বস্ত ই-কমার্স প্ল্যাটফর্ম JotPotShop। ফ্যাশন, গ্যাজেট, জুয়েলারি ও ঘরের প্রয়োজনীয় সব পণ্য ক্যাশ অন ডেলিভারিতে কিনুন।',
  metaKeywords: 'online shopping bangladesh, jotpotshop, men fashion, jamdani saree, gadgets dhaka, steadfast courier delivery',
  ogImageUrl: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1200&q=80',
};

export const DEFAULT_LIVE_CHAT_SETTINGS: LiveChatSettings = {
  enableFloatingButton: true,
  floatingButtonPosition: 'bottom-right',
  widgetCalloutTextBn: '💬 সাহায্য প্রয়োজন? চ্যাট করুন',
  // AI Sales Assistant
  enableAiSalesAgent: true,
  aiSalesAgentName: 'ঝটপট এআই সেলস সহকারী',
  // WhatsApp Channel
  enableDirectWhatsApp: true,
  whatsappNumber: '01712-345678',
  whatsappMessageTemplate: 'হ্যালো JotPotShop! আমি আপনার ওয়েবসাইট থেকে পণ্য সম্পর্কিত তথ্য বা অর্ডার সহায়তার জন্য জানতে চাই।',
  // Facebook Messenger Channel
  enableMessenger: true,
  messengerPageUrlOrId: 'jotpotshop.bd',
  // Direct Call Hotline Channel
  enableDirectCall: true,
  callHotlineNumber: '01812-345678',
  // Live Chat Drawer Channel
  enableLiveChat: true,
  agentName: 'সুমাইয়া (সাপোর্ট স্পেশালিস্ট)',
  agentStatusText: 'অনলাইন • সাধারণত ২ মিনিটে উত্তর দেয়',
  agentAvatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
  liveChatGreetingBn: 'আসসালামু আলাইকুম! JotPotShop হেল্পডেস্কে স্বাগতম। আপনাকে কীভাবে সাহায্য করতে পারি?',
  liveChatGreetingEn: 'Welcome to JotPotShop! How can our support team assist you today?',
  supportHours: 'প্রতিদিন সকাল ৯:০০ টা - রাত ১১:০০ টা (সাপ্তাহিক ৭ দিন)',
};

export const DEFAULT_HOMEPAGE_SECTIONS: HomepageSectionConfig = {
  showHeroBanner: true,
  showCategoryGrid: true,
  showFlashSale: true,
  showTrending: true,
  showNewArrivals: true,
  showBestSellers: true,
  showShopByBudget: true,
  showShopByNeed: true,
  showCompleteTheLook: true,
  showReviews: true,
  showTrustBadges: true,
};

export const DEFAULT_ORDER_SETTINGS: OrderSettings = {
  autoConfirmOnlinePaid: true,
  minOrderValue: 200,
  allowCustomerCancelWithinMinutes: 30,
  enableSoundNotificationOnNewOrder: true,
};

export const DEFAULT_REVIEW_SETTINGS: ReviewSettings = {
  autoApproveNewReviews: false,
  allowImageUploadInReviews: true,
  minimumRatingToFeature: 4,
};

// -------------------------------------------------------------
// DEFAULT RBAC PERMISSION MATRIX (STRICT ROLE SEPARATION)
// -------------------------------------------------------------
export const DEFAULT_ROLE_PERMISSIONS: RolePermissionMatrix = {
  // 1. 👑 SUPER ADMIN: Full God-Mode Master Access
  SUPER_ADMIN: {
    products: ['view', 'create', 'edit', 'delete', 'approve', 'export', 'manage'],
    orders: ['view', 'create', 'edit', 'delete', 'approve', 'export', 'manage'],
    categories: ['view', 'create', 'edit', 'delete', 'approve', 'export', 'manage'],
    coupons: ['view', 'create', 'edit', 'delete', 'approve', 'export', 'manage'],
    couriers: ['view', 'create', 'edit', 'delete', 'approve', 'export', 'manage'],
    customers: ['view', 'create', 'edit', 'delete', 'approve', 'export', 'manage'],
    homepage: ['view', 'create', 'edit', 'delete', 'approve', 'export', 'manage'],
    settings: ['view', 'create', 'edit', 'delete', 'approve', 'export', 'manage'],
    roles: ['view', 'create', 'edit', 'delete', 'approve', 'export', 'manage'],
    reports: ['view', 'create', 'edit', 'delete', 'approve', 'export', 'manage'],
  },

  // 2. 🛡️ ADMIN (Store Admin): Store catalog, orders, marketing, coupons, customer contacts
  // Restricted: Cannot touch secret system payment keys (settings) or staff password roles matrix
  ADMIN: {
    products: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
    orders: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
    categories: ['view', 'create', 'edit', 'delete', 'export'],
    coupons: ['view', 'create', 'edit', 'delete', 'export'],
    couriers: ['view', 'create', 'edit', 'approve', 'export'],
    customers: ['view', 'create', 'edit', 'export'],
    homepage: ['view', 'edit'],
    settings: [], // Restricted: Only Super Admin can access Payment Gateways & Master Business Settings
    roles: [],    // Restricted: Only Super Admin can create/edit staff accounts & permissions
    reports: ['view', 'export'],
  },

  // 3. 📋 MANAGER (Operations & Logistics): Packaging, courier consignment, warehouse inventory
  // Restricted: Cannot create or delete products, cannot touch coupons, customer private database, financial profits, settings or roles
  MANAGER: {
    products: ['view', 'edit'], // Stock inventory management only; cannot delete products or change pricing
    orders: ['view', 'approve', 'export'], // Can approve and dispatch orders; cannot cancel or delete orders
    categories: ['view'], // View-only
    coupons: [],   // Restricted: No coupon management
    couriers: ['view', 'create', 'approve', 'export'], // Full logistics, shipping label printing & courier booking
    customers: [], // Restricted: No customer private database access
    homepage: [],  // Restricted
    settings: [],  // Restricted
    roles: [],     // Restricted
    reports: [],   // Restricted: Cannot view total revenue or profit margins
  },

  // 4. 💼 STAFF (Support & Order Verification Desk): Phone call confirmation & live chat customer support
  // Restricted: View-only order phone verification and chat; cannot confirm to courier, cannot edit prices, cannot delete anything
  STAFF: {
    products: ['view'], // View-only: Stock & price lookup for answering customer inquiries
    orders: ['view'],   // View-only: Call customer, add verification notes; cannot cancel, delete, or dispatch
    categories: ['view'], // View-only
    coupons: [],   // Restricted
    couriers: [],  // Restricted: Logistics handled by Manager
    customers: [], // Restricted: Full customer directory protected
    homepage: [],  // Restricted
    settings: [],  // Restricted
    roles: [],     // Restricted
    reports: [],   // Restricted: Financials protected
  },
};

export const INITIAL_STAFF_ACCOUNTS: StaffAccount[] = [
  {
    id: 'staff-master-superadmin',
    name: 'Md Mahmudul Hashan',
    email: 'mdmahmudulhashan0@gmail.com',
    password: 'MahmuduLHashAn0@#',
    phone: '01712345678',
    role: 'SUPER_ADMIN',
    isActive: true,
    lastLogin: 'Active Now',
  },
  {
    id: 'staff-002',
    name: 'Nusrat Jahan (Operations Admin)',
    email: 'admin.nusrat@jotpotshop.com',
    password: 'AdminPassword123!',
    phone: '01711000002',
    role: 'ADMIN',
    isActive: true,
    lastLogin: 'Today, 01:20 PM',
  },
  {
    id: 'staff-003',
    name: 'Mahmudul Hasan (Order Manager)',
    email: 'manager.mahmud@jotpotshop.com',
    password: 'ManagerPassword123!',
    phone: '01711000003',
    role: 'MANAGER',
    isActive: true,
    lastLogin: 'Today, 11:15 AM',
  },
  {
    id: 'staff-004',
    name: 'Sultana Razia (Support Staff)',
    email: 'staff.sultana@jotpotshop.com',
    password: 'StaffPassword123!',
    phone: '01711000004',
    role: 'STAFF',
    isActive: true,
    lastLogin: 'Today, 09:30 AM',
  },
];

export const INITIAL_REGISTERED_CUSTOMERS: RegisteredCustomer[] = [];


export const INITIAL_CONVERSATIONS: UnifiedConversation[] = [];
