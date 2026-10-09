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
  rocketEnabled: true,
  rocketNumber: '01912-345678-9',
  onlineCardGatewayEnabled: true,
  taxPercent: 0,
};

export const DEFAULT_COURIER_CONFIGS: CourierConfig[] = [
  {
    id: 'Steadfast',
    name: 'Steadfast Courier',
    nameBn: 'স্টেডফাস্ট কুরিয়ার',
    isActive: true,
    apiKey: 'stf_live_api_jotpot_89312b9',
    secretKey: 'sec_stf_9381742091',
    merchantId: 'JPS-STEAD-4019',
    webhookUrl: 'https://jotpotshop.com/api/courier/steadfast/webhook',
    autoAssignInsideDhaka: true,
    autoAssignOutsideDhaka: true,
    baseChargeDhaka: 60,
    baseChargeOutside: 120,
    trackingUrlTemplate: 'https://steadfast.com.bd/t/{TRACKING_ID}',
  },
  {
    id: 'RedX',
    name: 'RedX Logistics',
    nameBn: 'রেডএক্স ডেলিভারি',
    isActive: true,
    apiKey: 'rdx_prod_key_jps_38192a',
    secretKey: 'sec_rdx_48102948',
    merchantId: 'REDX-MER-8291',
    webhookUrl: 'https://jotpotshop.com/api/courier/redx/webhook',
    autoAssignInsideDhaka: false,
    autoAssignOutsideDhaka: false,
    baseChargeDhaka: 60,
    baseChargeOutside: 125,
    trackingUrlTemplate: 'https://redx.com.bd/track/{TRACKING_ID}',
  },
  {
    id: 'Pathao',
    name: 'Pathao Courier',
    nameBn: 'পাঠাও কুরিয়ার',
    isActive: true,
    apiKey: 'pth_client_id_jotpot',
    secretKey: 'sec_pathao_92817264',
    merchantId: 'PTH-STORE-3310',
    webhookUrl: 'https://jotpotshop.com/api/courier/pathao/webhook',
    autoAssignInsideDhaka: true,
    autoAssignOutsideDhaka: false,
    baseChargeDhaka: 60,
    baseChargeOutside: 120,
    trackingUrlTemplate: 'https://pathao.com/courier/orders/{TRACKING_ID}',
  },
  {
    id: 'Paperfly',
    name: 'Paperfly Private Ltd.',
    nameBn: 'পেপারফ্লাই',
    isActive: true,
    apiKey: 'ppf_api_jotpot_392',
    secretKey: 'sec_paperfly_38190',
    merchantId: 'PPF-JOTPOT-09',
    webhookUrl: 'https://jotpotshop.com/api/courier/paperfly/webhook',
    autoAssignInsideDhaka: false,
    autoAssignOutsideDhaka: true,
    baseChargeDhaka: 65,
    baseChargeOutside: 120,
    trackingUrlTemplate: 'https://paperfly.com.bd/tracking/{TRACKING_ID}',
  },
  {
    id: 'Sundarban',
    name: 'Sundarban Courier Service',
    nameBn: 'সুন্দরবন কুরিয়ার সার্ভিস',
    isActive: true,
    apiKey: 'scs_token_jps_5510',
    secretKey: 'sec_sundarban_9921',
    merchantId: 'SND-BAN-019',
    webhookUrl: 'https://jotpotshop.com/api/courier/sundarban/webhook',
    autoAssignInsideDhaka: false,
    autoAssignOutsideDhaka: false,
    baseChargeDhaka: 70,
    baseChargeOutside: 130,
    trackingUrlTemplate: 'https://sundarbancourier.com/trace?cn={TRACKING_ID}',
  },
  {
    id: 'eCourier',
    name: 'eCourier Limited',
    nameBn: 'ই-কুরিয়ার',
    isActive: true,
    apiKey: 'eco_api_key_jotpot_21',
    secretKey: 'sec_ecourier_4819',
    merchantId: 'ECO-STORE-782',
    webhookUrl: 'https://jotpotshop.com/api/courier/ecourier/webhook',
    autoAssignInsideDhaka: false,
    autoAssignOutsideDhaka: false,
    baseChargeDhaka: 60,
    baseChargeOutside: 120,
    trackingUrlTemplate: 'https://ecourier.com.bd/track?ref={TRACKING_ID}',
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
// DEFAULT RBAC PERMISSION MATRIX
// -------------------------------------------------------------
export const DEFAULT_ROLE_PERMISSIONS: RolePermissionMatrix = {
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
  ADMIN: {
    products: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
    orders: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
    categories: ['view', 'create', 'edit', 'export'],
    coupons: ['view', 'create', 'edit', 'delete', 'export'],
    couriers: ['view', 'create', 'edit', 'approve', 'export'],
    customers: ['view', 'create', 'edit', 'export'],
    homepage: ['view', 'edit'],
    settings: [], // Restricted: Only Super Admin can access Payment & Master Business Settings
    roles: [],    // Restricted: Only Super Admin can modify Roles Matrix
    reports: ['view', 'export'],
  },
  MANAGER: {
    products: ['view', 'create', 'edit', 'export'],
    orders: ['view', 'edit', 'approve', 'export'],
    categories: ['view', 'export'],
    coupons: ['view', 'export'],
    couriers: ['view', 'approve', 'export'],
    customers: ['view'],
    homepage: ['view'],
    settings: [], // Restricted
    roles: [],    // Restricted
    reports: ['view', 'export'],
  },
  STAFF: {
    products: ['view'], // View-only: cannot create, edit, or delete products
    orders: ['view', 'edit'], // Call verification notes and packing check only
    categories: ['view'],
    coupons: [],   // Restricted: Staff cannot view or create coupons
    couriers: [],  // Restricted: Logistics managed by Manager/Admin
    customers: [], // Restricted: Staff cannot view whole customer database
    homepage: [],  // Restricted
    settings: [],  // Restricted
    roles: [],     // Restricted
    reports: [],   // Restricted: Staff cannot see revenue, profits or financial reports
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

export const INITIAL_REGISTERED_CUSTOMERS: RegisteredCustomer[] = [
  {
    id: 'cust-001',
    name: 'Tanvir Ahmed',
    phone: '01712345678',
    email: 'tanvir.ahmed@gmail.com',
    password: 'password123',
    isGoogleUser: false,
    createdAt: '2026-10-01T10:00:00Z',
  },
  {
    id: 'cust-002',
    name: 'Farhana Sultana',
    phone: '01811223344',
    email: 'farhana.ctg@gmail.com',
    password: 'password123',
    isGoogleUser: true,
    createdAt: '2026-10-05T14:30:00Z',
  },
];

export const INITIAL_CONVERSATIONS: UnifiedConversation[] = [
  {
    id: 'conv-live-01',
    channel: 'livechat',
    customerName: 'তানভীর আহমেদ (Tanvir)',
    customerPhone: '01712345678',
    customerEmail: 'tanvir.ahmed@gmail.com',
    unreadCount: 1,
    lastMessage: 'আসসালামু আলাইকুম, ব্ল্যাক ক্যাজুয়াল শার্ট কি স্টকে আছে? চট্টগ্রামে কত দিনে পাবো?',
    lastMessageTime: '১০ মিনিট আগে',
    status: 'open',
    messages: [
      {
        id: 'msg-1',
        sender: 'customer',
        senderName: 'তানভীর আহমেদ',
        text: 'আসসালামু আলাইকুম, ব্ল্যাক ক্যাজুয়াল শার্ট কি স্টকে আছে? চট্টগ্রামে কত দিনে পাবো?',
        timestamp: '10:45 AM',
      },
      {
        id: 'msg-2',
        sender: 'ai',
        senderName: 'ঝটপট এআই সেলস সহকারী',
        text: 'ওয়ালাইকুম আসসালাম তানভীর ভাই! জী, আমাদের প্রিমিয়াম ব্ল্যাক স্লিম-ফিট ক্যাজুয়াল শার্ট (৳৯৯০) স্টকে এভেইলেবল রয়েছে। চট্টগ্রামে ১-২ দিনের মধ্যে পেয়ে যাবেন, আর স্পেশাল অফারে আজ চট্টগ্রামের জন্য ডেলিভারি সম্পূর্ণ ফ্রি! আপনি কি সরাসরি অর্ডার কনফার্ম করতে চান?',
        timestamp: '10:46 AM',
        productId: 'prod-1',
        productName: 'প্রিমিয়াম ব্ল্যাক স্লিম-ফিট ক্যাজুয়াল শার্ট',
        productPrice: 990,
      },
      {
        id: 'msg-3',
        sender: 'customer',
        senderName: 'তানভীর আহমেদ',
        text: 'হ্যাঁ, আমি L সাইজ নিবো। সাইজ চার্টটা নিশ্চিত করবেন?',
        timestamp: '10:48 AM',
      },
    ],
  },
  {
    id: 'conv-wa-02',
    channel: 'whatsapp',
    customerName: 'ফারহানা সুলতানা (চট্টগ্রাম)',
    customerPhone: '01811223344',
    customerEmail: 'farhana.ctg@gmail.com',
    unreadCount: 2,
    lastMessage: 'জামদানি শাড়ির কালার অপশন আর ব্লাউজ পিস সম্পর্কে জানতে চাচ্ছিলাম।',
    lastMessageTime: '২৫ মিনিট আগে',
    status: 'open',
    messages: [
      {
        id: 'msg-wa-1',
        sender: 'customer',
        senderName: 'ফারহানা সুলতানা',
        text: 'জামদানি শাড়ির কালার অপশন আর ব্লাউজ পিস সম্পর্কে জানতে চাচ্ছিলাম।',
        timestamp: '10:30 AM',
      },
    ],
  },
  {
    id: 'conv-fb-03',
    channel: 'messenger',
    customerName: 'রাকিব হাসান (Facebook)',
    customerPhone: '01912987654',
    unreadCount: 0,
    lastMessage: 'অর্ডারটি কনফার্ম হয়েছে। ধন্যবাদ আপনাদের দ্রুত সার্ভিসের জন্য!',
    lastMessageTime: '১ ঘণ্টা আগে',
    status: 'resolved',
    messages: [
      {
        id: 'msg-fb-1',
        sender: 'customer',
        senderName: 'রাকিব হাসান',
        text: 'স্মার্টওয়াচের ব্যাটারি লাইফ কতদিন ব্যাকআপ দেয়?',
        timestamp: '09:15 AM',
      },
      {
        id: 'msg-fb-2',
        sender: 'staff',
        senderName: 'সুমাইয়া (সাপোর্ট স্পেশালিস্ট)',
        text: 'হ্যালো রাকিব ভাই! AMOLED স্মার্টওয়াচটি স্বাভাবিক ব্যবহারে ৫-৭ দিন এবং স্ট্যান্ডবাই মোডে ১৫ দিন পর্যন্ত ব্যাকআপ দেয়। বক্সের সাথে ফাস্ট ওয়্যারলেস চার্জার রয়েছে।',
        timestamp: '09:20 AM',
      },
      {
        id: 'msg-fb-3',
        sender: 'customer',
        senderName: 'রাকিব হাসান',
        text: 'অর্ডারটি কনফার্ম হয়েছে। ধন্যবাদ আপনাদের দ্রুত সার্ভিসের জন্য!',
        timestamp: '09:40 AM',
      },
    ],
  },
];
