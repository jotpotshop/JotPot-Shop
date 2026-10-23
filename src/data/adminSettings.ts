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
  HelpCenterSettings,
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

export const DEFAULT_HELP_CENTER_SETTINGS: HelpCenterSettings = {
  title: 'Customer Support & Help Center',
  titleBn: 'গ্রাহক সহায়তা ও হেল্প সেন্টার',
  subtitle: 'Answers, delivery guides, and instant direct assistance for your orders',
  subtitleBn: 'অর্ডার ট্র্যাকিং, ডেলিভারি নিয়ম ও দ্রুততম গ্রাহক সহায়তা',
  welcomeMessage: 'Welcome to JotPotShop Customer Help Center. How can we assist you today?',
  welcomeMessageBn: 'ঝটপটশপ সাপোর্ট সেন্টারে আপনাকে স্বাগতম! যেকোনো প্রশ্ন বা সহায়তার জন্য আমরা প্রস্তুত।',
  supportEmail: 'support@jotpotshop.com',
  supportPhone: '01800-JOTPOT',
  businessHours: '9:00 AM - 11:00 PM (Everyday)',
  businessHoursBn: 'সকাল ৯টা - রাত ১১টা (প্রতিদিন)',
  contactButtons: {
    whatsapp: {
      enabled: true,
      label: 'WhatsApp Chat',
      labelBn: 'হোয়াটসঅ্যাপ চ্যাট',
      number: '8801700000000',
      order: 1,
    },
    messenger: {
      enabled: true,
      label: 'Messenger',
      labelBn: 'ফেসবুক মেসেঞ্জার',
      urlOrId: 'jotpotshop.bd',
      order: 2,
    },
    liveChat: {
      enabled: true,
      label: 'Live Support Desk',
      labelBn: 'লাইভ চ্যাট ডেস্ক',
      order: 3,
    },
    directCall: {
      enabled: true,
      label: 'Direct Call',
      labelBn: 'সরাসরি ফোন',
      phone: '01800568768',
      order: 4,
    },
  },
  faqs: [
    {
      id: 'faq-del-1',
      category: 'delivery',
      categoryBn: 'ডেলিভারি',
      question: 'How long does delivery take inside and outside Dhaka?',
      questionBn: 'ডেলিভারি হতে কতক্ষণ সময় লাগে?',
      answer: 'Orders inside Dhaka are delivered within 24 to 48 hours. Outside Dhaka, express delivery is completed within 48 to 72 hours via Steadfast Courier.',
      answerBn: 'ঢাকা সিটির ভেতরে অর্ডার কনফার্মেশনের ২৪-৪৮ ঘণ্টার মধ্যে এবং ঢাকার বাইরে ৪৮-৭২ ঘণ্টার মধ্যে এক্সপ্রেস ডেলিভারি সম্পন্ন হয়।',
      isPublished: true,
      order: 1,
    },
    {
      id: 'faq-del-2',
      category: 'delivery',
      categoryBn: 'ডেলিভারি',
      question: 'What is the delivery fee and is free delivery available?',
      questionBn: 'ডেলিভারি চার্জ কত এবং ফ্রি ডেলিভারি অফার আছে কি?',
      answer: 'Inside Dhaka delivery is ৳60 and outside Dhaka is ৳120. All orders above ৳1500 get 100% Free Delivery nationwide!',
      answerBn: 'ঢাকা সিটির ভেতরে ৳৬০ এবং ঢাকার বাইরে ৳১২০। তবে ৳১৫০০ টাকার বেশি অর্ডারে সারা বাংলাদেশে সম্পূর্ণ ফ্রি ডেলিভারি!',
      isPublished: true,
      order: 2,
    },
    {
      id: 'faq-del-3',
      category: 'delivery',
      categoryBn: 'ডেলিভারি',
      question: 'Can I inspect the parcel before paying Cash on Delivery?',
      questionBn: 'পার্সেল কি ডেলিভারিম্যানের সামনে চেক করে নেওয়া যায়?',
      answer: 'Yes! You can check the package contents in front of the delivery person before paying cash on delivery.',
      answerBn: 'হ্যাঁ, ডেলিভারিম্যানের সামনে পার্সেলটি চেক করে ক্যাশ অন ডেলিভারিতে মূল্য পরিশোধ করতে পারবেন।',
      isPublished: true,
      order: 3,
    },
    {
      id: 'faq-ord-1',
      category: 'order',
      categoryBn: 'অর্ডার',
      question: 'How do I track my order status?',
      questionBn: 'অর্ডার কীভাবে ট্র্যাক করব?',
      answer: 'Click "Track Order" in the top navigation bar and enter your Order ID (e.g. JPS-1001) or phone number for instant live courier status.',
      answerBn: 'আমাদের ওয়েবসাইটের উপরে "Track Order" বাটনে ক্লিক করে আপনার অর্ডার আইডি (যেমন: JPS-1001) অথবা ফোন নম্বর দিয়ে সরাসরি লাইভ কুরিয়ার অবস্থান দেখতে পারবেন।',
      isPublished: true,
      order: 4,
    },
    {
      id: 'faq-ord-2',
      category: 'order',
      categoryBn: 'অর্ডার',
      question: 'Can I modify or cancel my order after placing it?',
      questionBn: 'অর্ডার পরিবর্তন বা বাতিল করতে চাইলে কী করব?',
      answer: 'Before your parcel is dispatched to the courier, you can call our hotline or message us on live chat to update items, address, or cancel.',
      answerBn: 'অর্ডারটি কুরিয়ারে হ্যান্ডওভার হওয়ার পূর্বে আমাদের হটলাইনে কল করে বা লাইভ চ্যাটে জানিয়ে যেকোনো পরিবর্তন বা বাতিল করতে পারবেন।',
      isPublished: true,
      order: 5,
    },
    {
      id: 'faq-pay-1',
      category: 'payment',
      categoryBn: 'পেমেন্ট',
      question: 'What payment options are accepted?',
      questionBn: 'কী কী মাধ্যমে পেমেন্ট করা যায়?',
      answer: 'We support Cash on Delivery, bKash Personal & Merchant, Nagad, and Rocket payments.',
      answerBn: 'ক্যাশ অন ডেলিভারি (পণ্য হাতে পেয়ে টাকা দেওয়া), বিকাশ (bKash), নগদ (Nagad), এবং রকেট (Rocket)-এর মাধ্যমে সুরক্ষিত পেমেন্ট করতে পারবেন।',
      isPublished: true,
      order: 6,
    },
    {
      id: 'faq-pay-2',
      category: 'payment',
      categoryBn: 'পেমেন্ট',
      question: 'Is online advance payment secure?',
      questionBn: 'অনলাইন পেমেন্ট কি সম্পূর্ণ নিরাপদ?',
      answer: 'Yes, your transactions are verified securely and no sensitive card or financial PIN details are ever stored.',
      answerBn: 'হ্যাঁ, আমাদের পেমেন্ট সিস্টেম ব্যাংক-গ্রেড এনক্রিপশনে পরিচালিত, আপনার কোনো সংবেদনশীল পিন বা পাসওয়ার্ড সংরক্ষিত হয় না।',
      isPublished: true,
      order: 7,
    },
    {
      id: 'faq-ret-1',
      category: 'return',
      categoryBn: 'রিটার্ন ও এক্সচেঞ্জ',
      question: 'What is your return and replacement policy?',
      questionBn: 'রিটার্ন পলিসি কী রকম?',
      answer: 'If there is any defect, damage, or discrepancy in your received items, we offer a 7-day hassle-free replacement or return.',
      answerBn: 'পণ্য পাওয়ার পর কোনো ত্রুটি, ক্ষতি বা অমিল থাকলে ৭ দিনের মধ্যে সম্পূর্ণ ফ্রিতে রিটার্ন বা রিপ্লেসমেন্ট সুবিধা পাবেন।',
      isPublished: true,
      order: 8,
    },
    {
      id: 'faq-ret-2',
      category: 'return',
      categoryBn: 'রিটার্ন ও এক্সচেঞ্জ',
      question: 'How fast is refund processed?',
      questionBn: 'টাকা রিফান্ড পেতে কত সময় লাগে?',
      answer: 'Once our warehouse inspects the returned item, your refund is disbursed via bKash or Nagad within 24 to 48 hours.',
      answerBn: 'রিটার্ন পার্সেল ওয়্যারহাউজে রিসিভ হওয়ার পর ২৪ থেকে ৪৮ ঘণ্টার মধ্যে আপনার বিকাশ বা নগদ অ্যাকাউন্টে রিফান্ড পাঠিয়ে দেওয়া হয়।',
      isPublished: true,
      order: 9,
    },
  ],
  supportArticles: [
    {
      id: 'art-1',
      title: 'How to place an order and track delivery',
      titleBn: 'কীভাবে অর্ডার করবেন এবং পার্সেল ট্র্যাক করবেন',
      content: 'Select your preferred products, choose color and size, click "Buy Now" or "Add to Cart", fill in your delivery address and phone number, and choose Cash on Delivery or bKash/Nagad. After placing your order, use your Order ID in the Track Order modal to see real-time updates.',
      contentBn: 'পছন্দের পণ্যটি নির্বাচন করে সাইজ ও কালার বেছে নিন, "এখনই কিনুন" বা "কার্টে যোগ করুন" বাটনে ক্লিক করুন। নাম, ঠিকানা ও সচল মোবাইল নম্বর দিয়ে ক্যাশ অন ডেলিভারি বা বিকাশ নির্বাচন করে অর্ডার সম্পন্ন করুন। অর্ডার আইডির মাধ্যমে যেকোনো সময় স্ট্যাটাস চেক করতে পারবেন।',
      category: 'order',
      isPublished: true,
      order: 1,
    },
    {
      id: 'art-2',
      title: 'Hassle-free 7-day return and exchange guide',
      titleBn: '৭ দিনের সহজ রিটার্ন ও এক্সচেঞ্জ নির্দেশিকা',
      content: 'If the product does not match the description, arrives damaged, or does not fit, contact our customer support team within 7 days. Keep the product in its original packaging with all tags attached.',
      contentBn: 'পণ্যে কোনো সমস্যা বা অমিল থাকলে পাওয়ার ৭ দিনের মধ্যে আমাদের কাস্টমার সাপোর্টে কল বা হোয়াটসঅ্যাপে ছবি সহ মেসেজ দিন। ট্যাগ ও অরিজিনাল প্যাকেজিংসহ পণ্যটি আমাদের ডেলিভারিম্যানকে রিটার্ন দিন।',
      category: 'return',
      isPublished: true,
      order: 2,
    },
  ],
};
