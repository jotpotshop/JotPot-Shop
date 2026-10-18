import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  CartItem,
  Order,
  Coupon,
  SavedAddress,
  UserNotification,
  Language,
  OrderStatus,
  OrderTimelineStep,
  UserRole,
  PermissionAction,
  SystemModule,
  RolePermissionMatrix,
  StaffAccount,
  WebsiteSettings,
  DeliverySettings,
  PaymentSettings,
  CourierConfig,
  CourierPartner,
  CourierConsignmentInfo,
  ReturnPolicySettings,
  SeoSettings,
  LiveChatSettings,
  HomepageSectionConfig,
  OrderSettings,
  ReviewSettings,
  OrderCallLog,
  Category,
  HeroBannerSlide,
  RegisteredCustomer,
  UnifiedConversation,
  UnifiedMessage,
  MessageChannel,
  BundleOffer,
  NeedTag,
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_COUPONS,
  INITIAL_SAVED_ADDRESSES,
  INITIAL_NOTIFICATIONS,
  INITIAL_BUNDLES,
  CATEGORIES,
} from '../data/mockData';
import { detectProductOccasions, generateSmartComboBundle } from '../data/occasionsData';
import {
  DEFAULT_WEBSITE_SETTINGS,
  DEFAULT_DELIVERY_SETTINGS,
  DEFAULT_PAYMENT_SETTINGS,
  DEFAULT_COURIER_CONFIGS,
  DEFAULT_RETURN_POLICY,
  DEFAULT_SEO_SETTINGS,
  DEFAULT_LIVE_CHAT_SETTINGS,
  DEFAULT_HOMEPAGE_SECTIONS,
  DEFAULT_ORDER_SETTINGS,
  DEFAULT_REVIEW_SETTINGS,
  DEFAULT_ROLE_PERMISSIONS,
  INITIAL_STAFF_ACCOUNTS,
  DEFAULT_HERO_BANNERS,
  INITIAL_REGISTERED_CUSTOMERS,
  INITIAL_CONVERSATIONS,
} from '../data/adminSettings';
import {
  testFirebaseConnection,
  saveBrandingToFirestore,
  fetchBrandingFromFirestore,
  subscribeToBranding,
  saveCategoriesToFirestore,
  fetchCategoriesFromFirestore,
  saveHeroBannersToFirestore,
  fetchHeroBannersFromFirestore,
  saveCouriersToFirestore,
  fetchCouriersFromFirestore,
  subscribeToCouriers,
  savePaymentSettingsToFirestore,
  fetchPaymentSettingsFromFirestore,
  subscribeToPaymentSettings,
  saveDeliverySettingsToFirestore,
  fetchDeliverySettingsFromFirestore,
  subscribeToDeliverySettings,
  saveProductsToFirestore,
  fetchProductsFromFirestore,
  subscribeToProducts,
  executeAtomicOrderCheckout,
  saveOrdersToFirestore,
  saveSingleOrderToFirestore,
  fetchOrdersFromFirestore,
  subscribeToOrders,
  saveBundlesToFirestore,
  fetchBundlesFromFirestore,
  saveCouponsToFirestore,
  fetchCouponsFromFirestore,
  subscribeToCoupons,
  saveReturnPolicyToFirestore,
  fetchReturnPolicyFromFirestore,
  saveSeoSettingsToFirestore,
  fetchSeoSettingsFromFirestore,
  saveLiveChatSettingsToFirestore,
  fetchLiveChatSettingsFromFirestore,
  saveHomepageSectionsToFirestore,
  fetchHomepageSectionsFromFirestore,
  saveOrderSettingsToFirestore,
  fetchOrderSettingsFromFirestore,
  saveStaffAccountsToFirestore,
  fetchStaffAccountsFromFirestore,
  saveCustomersToFirestore,
  fetchCustomersFromFirestore,
  subscribeToCustomers,
  signInWithGooglePopup,
  resizeDataUrl,
  FirebaseConnectionDiagnostic,
  FIREBASE_PROJECT_INFO,
} from '../lib/firebase';
import { getAvailableStock } from '../utils/inventory';

export const FREE_DELIVERY_THRESHOLD = 1500;
export const INSIDE_CITY_DELIVERY = 60;
export const OUTSIDE_CITY_DELIVERY = 120;

interface UserState {
  isLoggedIn: boolean;
  name: string;
  phone: string;
  email: string;
}

interface ShopContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (bn: string, en: string) => string;
  formatPrice: (amount: number) => string;

  // Products
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  bulkDeleteProducts: (productIds: string[]) => void;
  bulkUpdateProducts: (productIds: string[], updates: Partial<Product>) => void;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, color?: string, size?: string) => boolean;
  removeFromCart: (productId: string, color?: string, size?: string) => void;
  updateCartQuantity: (productId: string, quantity: number, color?: string, size?: string) => void;
  clearCart: () => void;
  addBundleToCart: (productIds: string[], bundleDiscountPrice: number) => void;

  // Wishlist
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  // Compare
  comparisonList: string[];
  addToComparison: (productId: string) => boolean;
  removeFromComparison: (productId: string) => void;
  clearComparison: () => void;

  // Recently Viewed
  recentlyViewed: string[];
  addToRecentlyViewed: (productId: string) => void;

  // Coupons
  coupons: Coupon[];
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  addCoupon: (coupon: Coupon) => void;
  updateCoupon: (coupon: Coupon) => void;
  deleteCoupon: (code: string) => void;

  // Address
  savedAddresses: SavedAddress[];
  addSavedAddress: (addr: SavedAddress) => void;
  deleteSavedAddress: (id: string) => void;

  // Orders
  orders: Order[];
  placeOrder: (orderData: {
    customerName: string;
    phone: string;
    alternativePhone?: string;
    district: string;
    area: string;
    fullAddress: string;
    customerNote?: string;
    paymentMethod: 'cod' | 'bkash' | 'nagad' | 'rocket';
    deliveryOption: 'inside' | 'outside' | 'chattogram';
    preferredCourier?: CourierPartner | 'Auto';
    courierInstructions?: string;
    orderSource?: 'Website' | 'Facebook' | 'WhatsApp' | 'Phone Call';
    paymentDetails?: {
      senderNumber?: string;
      trxId?: string;
      amount?: number;
      accountType?: 'Merchant' | 'Personal';
    };
  }) => Promise<{ success: boolean; order?: Order; error?: string }>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  confirmOrder: (orderId: string, confirmedBy?: string) => void;
  cancelOrder: (orderId: string, reason: string) => void;
  holdOrder: (orderId: string, reason: string) => void;
  editOrder: (orderId: string, updatedFields: Partial<Order>) => void;
  addCallLog: (orderId: string, log: Omit<OrderCallLog, 'id' | 'timestamp'>) => void;
  sendToCourier: (orderId: string, courierName: CourierPartner, weightKg: number, specialInstructions?: string) => void;
  updateCourierStatus: (orderId: string, courierStatus: any) => void;
  findOrderById: (orderId: string) => Order | undefined;

  // User & Customer Auth
  user: UserState;
  loginUser: (info: { name: string; phone: string; email: string }) => void;
  logoutUser: () => void;
  registeredCustomers: RegisteredCustomer[];
  registerCustomer: (info: { name: string; phone: string; email?: string; password: string }) => { success: boolean; message: string };
  loginCustomerWithPassword: (identifier: string, password: string) => { success: boolean; message: string };
  loginCustomerWithOtp: (phone: string) => { success: boolean; message: string };
  resetCustomerPassword: (phone: string, newPass: string) => { success: boolean; message: string };
  updateCustomerProfile: (updates: { name: string; phone: string; email?: string }) => void;
  loginWithGoogle: (googleUser?: { name: string; email: string; avatarUrl?: string }) => void;

  // Omnichannel Conversations & AI Assistant
  conversations: UnifiedConversation[];
  activeChatConversationId: string | null;
  setActiveChatConversationId: (id: string | null) => void;
  sendCustomerChatMessage: (text: string, channel?: MessageChannel, customerDetails?: { name?: string; phone?: string; email?: string }) => void;
  replyToConversation: (conversationId: string, replyText: string, staffName?: string, attachedProductId?: string) => void;
  toggleAiSalesAgent: (enabled?: boolean) => void;

  // Notifications & Toast
  notifications: UserNotification[];
  markNotificationRead: (id: string) => void;
  hasNewOrderAlert: boolean;
  dismissNewOrderAlert: () => void;
  shopToast: { message: string; type: 'success' | 'error' | 'warning' | 'info' } | null;
  setShopToast: (toast: { message: string; type: 'success' | 'error' | 'warning' | 'info' } | null) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;

  // Location
  selectedLocation: string;
  setSelectedLocation: (loc: string) => void;

  // Cart calculations
  cartSubtotal: number;
  couponDiscount: number;
  deliveryFee: number;
  cartTotal: number;
  freeDeliveryRemaining: number;

  // Modals & Navigation
  activeModal: string | null;
  setActiveModal: (modal: string | null) => void;
  quickViewProduct: Product | null;
  setQuickViewProduct: (prod: Product | null) => void;
  selectedOrderForInvoice: Order | null;
  setSelectedOrderForInvoice: (order: Order | null) => void;
  orderForCall: Order | null;
  setOrderForCall: (order: Order | null) => void;
  orderForEdit: Order | null;
  setOrderForEdit: (order: Order | null) => void;
  orderForCourier: Order | null;
  setOrderForCourier: (order: Order | null) => void;
  orderForShippingLabel: Order | null;
  setOrderForShippingLabel: (order: Order | null) => void;
  trackingOrderId: string | null;
  setTrackingOrderId: (id: string | null) => void;

  // Filters
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (cat: string | null) => void;
  selectedNeed: string | null;
  setSelectedNeed: (need: string | null) => void;
  selectedMaxBudget: number | null;
  setSelectedMaxBudget: (budget: number | null) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;

  // Super Admin & RBAC
  isAdminView: boolean;
  setIsAdminView: (val: boolean) => void;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  staffAccounts: StaffAccount[];
  rolePermissions: RolePermissionMatrix;
  updateRolePermission: (role: UserRole, module: SystemModule, actions: PermissionAction[]) => void;
  hasPermission: (module: SystemModule, action: PermissionAction) => boolean;
  resetRolePermissionsToDefault: () => void;
  purgeAllDemoData: () => { success: boolean; message: string };
  clearAllDemoOrders: () => void;
  clearAllDemoCustomers: () => void;

  // Admin Authentication & Staff Management
  adminUser: StaffAccount | null;
  showAdminLoginModal: boolean;
  setShowAdminLoginModal: (show: boolean) => void;
  adminLogin: (identifier: string, password: string) => { success: boolean; message: string };
  adminLogout: () => void;
  addStaffAccount: (account: Omit<StaffAccount, 'id' | 'lastLogin'>) => void;
  updateStaffAccount: (account: StaffAccount) => void;
  deleteStaffAccount: (id: string) => void;

  // Super Admin Business Settings
  websiteSettings: WebsiteSettings;
  updateWebsiteSettings: (settings: Partial<WebsiteSettings>) => void;
  deliverySettings: DeliverySettings;
  updateDeliverySettings: (settings: Partial<DeliverySettings>) => void;
  paymentSettings: PaymentSettings;
  updatePaymentSettings: (settings: Partial<PaymentSettings>) => void;
  courierConfigs: CourierConfig[];
  updateCourierConfig: (courierId: CourierPartner, config: Partial<CourierConfig>) => void;
  saveAllCourierConfigs: (configs: CourierConfig[]) => Promise<void>;
  returnPolicySettings: ReturnPolicySettings;
  updateReturnPolicySettings: (settings: Partial<ReturnPolicySettings>) => void;
  seoSettings: SeoSettings;
  updateSeoSettings: (settings: Partial<SeoSettings>) => void;
  liveChatSettings: LiveChatSettings;
  updateLiveChatSettings: (settings: Partial<LiveChatSettings>) => void;
  homepageSections: HomepageSectionConfig;
  updateHomepageSections: (config: Partial<HomepageSectionConfig>) => void;
  orderSettings: OrderSettings;
  updateOrderSettings: (settings: Partial<OrderSettings>) => void;
  reviewSettings: ReviewSettings;
  updateReviewSettings: (settings: Partial<ReviewSettings>) => void;

  // Categories Management (Add, Edit, Delete, Custom Icon)
  categories: Category[];
  addCategory: (category: Category) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (categoryId: string) => void;

  // Homepage Hero Banners Management
  heroBanners: HeroBannerSlide[];
  addHeroBanner: (banner: HeroBannerSlide) => void;
  updateHeroBanner: (banner: HeroBannerSlide) => void;
  deleteHeroBanner: (bannerId: string | number) => void;

  // Complete The Look (Combo Bundles)
  bundles: BundleOffer[];
  activeBundleId: string | null;
  addBundle: (bundle: BundleOffer) => void;
  updateBundle: (bundle: BundleOffer) => void;
  deleteBundle: (bundleId: string) => void;
  setActiveBundleId: (id: string | null) => void;
  autoGenerateBundle: () => BundleOffer | null;

  // Occasions & Need Collections ("আপনার কী প্রয়োজন?")
  autoAssignNeedTags: (product: Product) => NeedTag[];
  updateProductNeedTags: (productId: string, needTags: NeedTag[]) => void;
  autoTagAllProducts: () => number;

  // Firebase backend integration
  firebaseStatus: FirebaseConnectionDiagnostic | null;
  isFirebaseConnected: boolean;
  refreshFirebaseConnection: () => Promise<FirebaseConnectionDiagnostic>;
  saveBrandingToRemote: (settings: Partial<WebsiteSettings>) => Promise<boolean>;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const getCustomerCartStorageKey = (phoneOrEmail?: string): string => {
  if (!phoneOrEmail || !phoneOrEmail.trim()) return 'jps_cart_guest';
  const clean = phoneOrEmail.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
  return `jps_cart_cust_${clean}`;
};

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      return (localStorage.getItem('jps_lang') as Language) || 'bn';
    } catch {
      return 'bn';
    }
  });

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('jps_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}
    return INITIAL_PRODUCTS;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const savedUserStr = localStorage.getItem('jps_user');
      let customerId = '';
      if (savedUserStr) {
        const parsed = JSON.parse(savedUserStr);
        if (parsed?.isLoggedIn && (parsed.phone || parsed.email)) {
          customerId = parsed.phone || parsed.email;
        }
      }
      const cartKey = getCustomerCartStorageKey(customerId);
      const savedCart = localStorage.getItem(cartKey);
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) return parsed;
      }
      // Clean up legacy unsandboxed key so old items don't leak to other customers
      localStorage.removeItem('jps_cart');
      return [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('jps_wishlist');
      return saved ? JSON.parse(saved) : ['jps-prod-101', 'jps-prod-102'];
    } catch {
      return ['jps-prod-101', 'jps-prod-102'];
    }
  });

  const [comparisonList, setComparisonList] = useState<string[]>([]);

  const [recentlyViewed, setRecentlyViewed] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('jps_recent');
      return saved ? JSON.parse(saved) : ['jps-prod-101', 'jps-prod-104', 'jps-prod-106'];
    } catch {
      return ['jps-prod-101', 'jps-prod-104', 'jps-prod-106'];
    }
  });

  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    try {
      const saved = localStorage.getItem('jps_coupons');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_COUPONS;
  });
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>(() => {
    try {
      const saved = localStorage.getItem('jps_addresses');
      return saved ? JSON.parse(saved) : INITIAL_SAVED_ADDRESSES;
    } catch {
      return INITIAL_SAVED_ADDRESSES;
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('jps_orders');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_ORDERS;
  });

  const [notifications, setNotifications] = useState<UserNotification[]>(INITIAL_NOTIFICATIONS);
  const [hasNewOrderAlert, setHasNewOrderAlert] = useState<boolean>(false);
  const [shopToast, setShopToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);

  useEffect(() => {
    if (shopToast) {
      const timer = setTimeout(() => setShopToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [shopToast]);

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setShopToast({ message, type });
  };

  const [selectedLocation, setSelectedLocation] = useState<string>('Dhaka (ঢাকা)');

  const [user, setUser] = useState<UserState>(() => {
    try {
      const saved = localStorage.getItem('jps_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.phone === '01712345678' || parsed.email === 'tanvir.ahmed@gmail.com') {
          localStorage.removeItem('jps_user');
          return { isLoggedIn: false, name: '', phone: '', email: '' };
        }
        return parsed;
      }
    } catch {}
    return { isLoggedIn: false, name: '', phone: '', email: '' };
  });

  const [registeredCustomers, setRegisteredCustomers] = useState<RegisteredCustomer[]>(() => {
    try {
      const saved = localStorage.getItem('jps_registered_customers');
      if (saved) {
        const parsed: RegisteredCustomer[] = JSON.parse(saved);
        return parsed.filter(
          c => c.phone !== '01712345678' && c.email?.toLowerCase() !== 'tanvir.ahmed@gmail.com'
        );
      }
      return [];
    } catch {
      return [];
    }
  });

  const [conversations, setConversations] = useState<UnifiedConversation[]>(() => {
    try {
      const saved = localStorage.getItem('jps_unified_conversations');
      return saved ? JSON.parse(saved) : INITIAL_CONVERSATIONS;
    } catch {
      return INITIAL_CONVERSATIONS;
    }
  });

  const [activeChatConversationId, setActiveChatConversationId] = useState<string | null>(null);

  // Admin and Role state
  const [isAdminView, setIsAdminView] = useState<boolean>(false);
  const [adminUser, setAdminUser] = useState<StaffAccount | null>(() => {
    try {
      const saved = localStorage.getItem('jps_active_admin');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    try {
      const saved = localStorage.getItem('jps_active_admin');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.role) return parsed.role;
      }
    } catch {}
    return 'SUPER_ADMIN';
  });
  const [staffAccounts, setStaffAccounts] = useState<StaffAccount[]>(() => {
    const saved = localStorage.getItem('jps_staff_accounts');
    if (saved) {
      try {
        const parsed: StaffAccount[] = JSON.parse(saved);
        const hasMaster = parsed.some(s => s.email === 'mdmahmudulhashan0@gmail.com');
        if (!hasMaster) {
          return [INITIAL_STAFF_ACCOUNTS[0], ...parsed];
        }
        return parsed;
      } catch (e) {
        return INITIAL_STAFF_ACCOUNTS;
      }
    }
    return INITIAL_STAFF_ACCOUNTS;
  });
  const [showAdminLoginModal, setShowAdminLoginModal] = useState<boolean>(false);
  const [rolePermissions, setRolePermissions] = useState<RolePermissionMatrix>(() => {
    try {
      const saved = localStorage.getItem('jps_role_permissions');
      if (saved) {
        const parsed = JSON.parse(saved);
        // If legacy stored matrix gave Manager coupon access or Staff order edit access, reset to strict defaults
        if (
          parsed?.MANAGER?.coupons?.length > 0 ||
          parsed?.MANAGER?.products?.includes('create') ||
          parsed?.STAFF?.orders?.includes('edit')
        ) {
          localStorage.setItem('jps_role_permissions', JSON.stringify(DEFAULT_ROLE_PERMISSIONS));
          return DEFAULT_ROLE_PERMISSIONS;
        }
        return parsed;
      }
      return DEFAULT_ROLE_PERMISSIONS;
    } catch {
      return DEFAULT_ROLE_PERMISSIONS;
    }
  });

  // Business Configurations
  const [websiteSettings, setWebsiteSettings] = useState<WebsiteSettings>(() => {
    try {
      const saved = localStorage.getItem('jps_website_settings');
      return saved ? { ...DEFAULT_WEBSITE_SETTINGS, ...JSON.parse(saved) } : DEFAULT_WEBSITE_SETTINGS;
    } catch {
      return DEFAULT_WEBSITE_SETTINGS;
    }
  });

  const [deliverySettings, setDeliverySettings] = useState<DeliverySettings>(() => {
    try {
      const saved = localStorage.getItem('jps_delivery_settings');
      return saved ? { ...DEFAULT_DELIVERY_SETTINGS, ...JSON.parse(saved) } : DEFAULT_DELIVERY_SETTINGS;
    } catch {
      return DEFAULT_DELIVERY_SETTINGS;
    }
  });

  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>(() => {
    try {
      const saved = localStorage.getItem('jps_payment_settings');
      return saved ? { ...DEFAULT_PAYMENT_SETTINGS, ...JSON.parse(saved), rocketEnabled: false } : { ...DEFAULT_PAYMENT_SETTINGS, rocketEnabled: false };
    } catch {
      return { ...DEFAULT_PAYMENT_SETTINGS, rocketEnabled: false };
    }
  });

  const [courierConfigs, setCourierConfigs] = useState<CourierConfig[]>(() => {
    try {
      const saved = localStorage.getItem('jps_courier_configs');
      if (saved) {
        const parsed: CourierConfig[] = JSON.parse(saved);
        return DEFAULT_COURIER_CONFIGS.map(def => {
          const match = parsed.find(p => p.id === def.id);
          if (!match) return def;
          // Filter out legacy demo keys
          const isDemoKey =
            match.apiKey === 'stf_live_api_jotpot_89312b9' ||
            match.apiKey === 'rdx_prod_key_jps_38192a' ||
            match.apiKey === 'pth_client_id_jotpot' ||
            match.apiKey === 'ppf_api_jotpot_392' ||
            match.apiKey === 'scs_token_jps_5510' ||
            match.apiKey === 'eco_api_key_jotpot_21';
          if (isDemoKey) {
            return {
              ...def,
              apiKey: '',
              secretKey: '',
              merchantId: '',
              connectionStatus: 'disconnected',
              isActive: false,
              accountBalance: 0,
            };
          }
          return { ...def, ...match };
        });
      }
      return DEFAULT_COURIER_CONFIGS;
    } catch {
      return DEFAULT_COURIER_CONFIGS;
    }
  });

  const [returnPolicySettings, setReturnPolicySettings] = useState<ReturnPolicySettings>(() => {
    try {
      const saved = localStorage.getItem('jps_return_policy_settings');
      return saved ? { ...DEFAULT_RETURN_POLICY, ...JSON.parse(saved) } : DEFAULT_RETURN_POLICY;
    } catch {
      return DEFAULT_RETURN_POLICY;
    }
  });
  const [seoSettings, setSeoSettings] = useState<SeoSettings>(() => {
    try {
      const saved = localStorage.getItem('jps_seo_settings');
      return saved ? { ...DEFAULT_SEO_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SEO_SETTINGS;
    } catch {
      return DEFAULT_SEO_SETTINGS;
    }
  });
  const [liveChatSettings, setLiveChatSettings] = useState<LiveChatSettings>(() => {
    try {
      const saved = localStorage.getItem('jps_live_chat_settings');
      return saved ? { ...DEFAULT_LIVE_CHAT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_LIVE_CHAT_SETTINGS;
    } catch {
      return DEFAULT_LIVE_CHAT_SETTINGS;
    }
  });
  const [homepageSections, setHomepageSections] = useState<HomepageSectionConfig>(() => {
    try {
      const saved = localStorage.getItem('jps_homepage_sections');
      return saved ? { ...DEFAULT_HOMEPAGE_SECTIONS, ...JSON.parse(saved) } : DEFAULT_HOMEPAGE_SECTIONS;
    } catch {
      return DEFAULT_HOMEPAGE_SECTIONS;
    }
  });
  const [orderSettings, setOrderSettings] = useState<OrderSettings>(() => {
    try {
      const saved = localStorage.getItem('jps_order_settings');
      return saved ? { ...DEFAULT_ORDER_SETTINGS, ...JSON.parse(saved) } : DEFAULT_ORDER_SETTINGS;
    } catch {
      return DEFAULT_ORDER_SETTINGS;
    }
  });
  const [reviewSettings, setReviewSettings] = useState<ReviewSettings>(() => {
    try {
      const saved = localStorage.getItem('jps_review_settings');
      return saved ? { ...DEFAULT_REVIEW_SETTINGS, ...JSON.parse(saved) } : DEFAULT_REVIEW_SETTINGS;
    } catch {
      return DEFAULT_REVIEW_SETTINGS;
    }
  });

  // Dynamic Categories Management with local & Firebase persistence
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem('jps_categories');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return CATEGORIES;
  });

  // Dynamic Hero Banners Management with local & Firebase persistence
  const [heroBanners, setHeroBanners] = useState<HeroBannerSlide[]>(() => {
    try {
      const saved = localStorage.getItem('jps_hero_banners');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_HERO_BANNERS;
  });

  // Dynamic Complete The Look (Combo Bundles) with local storage persistence
  const [bundles, setBundles] = useState<BundleOffer[]>(() => {
    try {
      const saved = localStorage.getItem('jps_bundles');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_BUNDLES;
  });

  const [activeBundleId, setActiveBundleIdState] = useState<string | null>(() => {
    try {
      return localStorage.getItem('jps_active_bundle') || (INITIAL_BUNDLES[0]?.id || null);
    } catch {
      return INITIAL_BUNDLES[0]?.id || null;
    }
  });

  // Firebase connection & status
  const [firebaseStatus, setFirebaseStatus] = useState<FirebaseConnectionDiagnostic | null>(null);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(false);

  const refreshFirebaseConnection = async (): Promise<FirebaseConnectionDiagnostic> => {
    try {
      const diagnostic = await testFirebaseConnection();
      setFirebaseStatus(diagnostic);
      setIsFirebaseConnected(diagnostic.connected);
      return diagnostic;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      const fallbackDiag: FirebaseConnectionDiagnostic = {
        connected: false,
        timestamp: new Date().toISOString(),
        projectId: FIREBASE_PROJECT_INFO.projectId,
        databaseId: FIREBASE_PROJECT_INFO.databaseId,
        storageBucket: FIREBASE_PROJECT_INFO.storageBucket,
        authDomain: FIREBASE_PROJECT_INFO.authDomain,
        message: 'Firebase connection failed',
        error: errorMsg,
      };
      setFirebaseStatus(fallbackDiag);
      setIsFirebaseConnected(false);
      return fallbackDiag;
    }
  };

  useEffect(() => {
    // Test Firebase connection on mount
    refreshFirebaseConnection();

    // Clean up oversized local logo data URL if any exists from previous sessions
    const localSaved = localStorage.getItem('jps_website_settings');
    if (localSaved) {
      try {
        const parsed = JSON.parse(localSaved);
        if (parsed.logoUrl?.startsWith('data:') && parsed.logoUrl.length > 50000) {
          resizeDataUrl(parsed.logoUrl, 320, 0.70).then(compactUrl => {
            const sanitized = { ...parsed, logoUrl: compactUrl };
            setWebsiteSettings(prev => ({ ...prev, logoUrl: compactUrl }));
            localStorage.setItem('jps_website_settings', JSON.stringify(sanitized));
            saveBrandingToFirestore(sanitized).catch(() => {});
          });
        }
      } catch {}
    }

    // Fetch branding from Firestore
    fetchBrandingFromFirestore()
      .then(remoteSettings => {
        if (remoteSettings && (remoteSettings.logoUrl || remoteSettings.storeName)) {
          setWebsiteSettings(prev => ({
            ...prev,
            ...remoteSettings,
          }));
        }
      })
      .catch(err => {
        console.warn('Initial branding fetch from Firestore:', err);
      });

    // Real-time listener for live sync
    const unsubscribe = subscribeToBranding(remoteBranding => {
      if (remoteBranding && Object.keys(remoteBranding).length > 0) {
        setWebsiteSettings(prev => ({
          ...prev,
          ...remoteBranding,
        }));
      }
    });

    // Fetch categories from Firestore
    fetchCategoriesFromFirestore()
      .then(remoteCats => {
        if (remoteCats && remoteCats.length > 0) {
          setCategories(remoteCats);
          localStorage.setItem('jps_categories', JSON.stringify(remoteCats));
        }
      })
      .catch(err => {
        console.warn('Initial categories fetch from Firestore:', err);
      });

    // Fetch hero banners from Firestore
    fetchHeroBannersFromFirestore()
      .then(remoteBanners => {
        if (remoteBanners && remoteBanners.length > 0) {
          setHeroBanners(remoteBanners);
          localStorage.setItem('jps_hero_banners', JSON.stringify(remoteBanners));
        }
      })
      .catch(err => {
        console.warn('Initial hero banners fetch from Firestore:', err);
      });

    // Fetch and subscribe couriers from Firestore
    fetchCouriersFromFirestore()
      .then(remoteCouriers => {
        if (remoteCouriers && remoteCouriers.length > 0) {
          const sanitized = remoteCouriers.map(c => {
            const isDemo =
              c.apiKey === 'stf_live_api_jotpot_89312b9' ||
              c.apiKey === 'rdx_prod_key_jps_38192a' ||
              c.apiKey === 'pth_client_id_jotpot' ||
              c.apiKey === 'ppf_api_jotpot_392' ||
              c.apiKey === 'scs_token_jps_5510' ||
              c.apiKey === 'eco_api_key_jotpot_21';
            if (isDemo) {
              return {
                ...c,
                apiKey: '',
                secretKey: '',
                merchantId: '',
                connectionStatus: 'disconnected' as const,
                isActive: false,
                accountBalance: 0,
              };
            }
            return c;
          });
          setCourierConfigs(sanitized);
          localStorage.setItem('jps_courier_configs', JSON.stringify(sanitized));
        } else {
          saveCouriersToFirestore(DEFAULT_COURIER_CONFIGS).catch(() => {});
        }
      })
      .catch(err => {
        console.warn('Initial couriers fetch from Firestore:', err);
      });

    const unsubCouriers = subscribeToCouriers(remoteCouriers => {
      if (remoteCouriers && remoteCouriers.length > 0) {
        const sanitized = remoteCouriers.map(c => {
          const isDemo =
            c.apiKey === 'stf_live_api_jotpot_89312b9' ||
            c.apiKey === 'rdx_prod_key_jps_38192a' ||
            c.apiKey === 'pth_client_id_jotpot';
          if (isDemo) {
            return {
              ...c,
              apiKey: '',
              secretKey: '',
              merchantId: '',
              connectionStatus: 'disconnected' as const,
              isActive: false,
              accountBalance: 0,
            };
          }
          return c;
        });
        setCourierConfigs(sanitized);
      }
    });

    // Fetch and subscribe Payment Settings from Firestore
    fetchPaymentSettingsFromFirestore()
      .then(remotePayment => {
        if (remotePayment && (remotePayment.bkashNumber || remotePayment.nagadNumber)) {
          setPaymentSettings(prev => ({ ...prev, ...remotePayment, rocketEnabled: false }));
          localStorage.setItem('jps_payment_settings', JSON.stringify({ ...remotePayment, rocketEnabled: false }));
        } else {
          savePaymentSettingsToFirestore({ ...DEFAULT_PAYMENT_SETTINGS, rocketEnabled: false }).catch(() => {});
        }
      })
      .catch(err => {
        console.warn('Initial payment settings fetch from Firestore:', err);
      });

    const unsubPayment = subscribeToPaymentSettings(remotePayment => {
      if (remotePayment) {
        setPaymentSettings(prev => ({ ...prev, ...remotePayment, rocketEnabled: false }));
      }
    });

    // Fetch and subscribe Delivery Settings from Firestore
    fetchDeliverySettingsFromFirestore()
      .then(remoteDelivery => {
        if (remoteDelivery && remoteDelivery.insideDhakaFee !== undefined) {
          setDeliverySettings(prev => ({ ...prev, ...remoteDelivery }));
          localStorage.setItem('jps_delivery_settings', JSON.stringify(remoteDelivery));
        } else {
          saveDeliverySettingsToFirestore(DEFAULT_DELIVERY_SETTINGS).catch(() => {});
        }
      })
      .catch(err => {
        console.warn('Initial delivery settings fetch from Firestore:', err);
      });

    const unsubDelivery = subscribeToDeliverySettings(remoteDelivery => {
      if (remoteDelivery) {
        setDeliverySettings(prev => ({ ...prev, ...remoteDelivery }));
      }
    });

    // Fetch and subscribe Products Catalog from Firestore
    fetchProductsFromFirestore()
      .then(remoteProds => {
        if (remoteProds && remoteProds.length > 0) {
          setProducts(remoteProds);
          localStorage.setItem('jps_products', JSON.stringify(remoteProds));
        } else {
          // Initialize remote database with current catalog so Netlify visitors get initial products
          saveProductsToFirestore(products).catch(() => {});
        }
      })
      .catch(err => {
        console.warn('Initial products fetch from Firestore:', err);
      });

    const unsubProducts = subscribeToProducts(remoteProds => {
      if (remoteProds && remoteProds.length > 0) {
        setProducts(remoteProds);
      }
    });

    // Fetch and subscribe Orders from Firestore
    fetchOrdersFromFirestore()
      .then(remoteOrders => {
        if (remoteOrders && remoteOrders.length > 0) {
          setOrders(remoteOrders);
          localStorage.setItem('jps_orders', JSON.stringify(remoteOrders));
        } else {
          saveOrdersToFirestore(orders).catch(() => {});
        }
      })
      .catch(err => {
        console.warn('Initial orders fetch from Firestore:', err);
      });

    const unsubOrders = subscribeToOrders(remoteOrders => {
      if (remoteOrders && remoteOrders.length > 0) {
        setOrders(remoteOrders);
      }
    });

    // Fetch Combo Bundles from Firestore
    fetchBundlesFromFirestore()
      .then(remoteBundles => {
        if (remoteBundles && remoteBundles.length > 0) {
          setBundles(remoteBundles);
          localStorage.setItem('jps_bundles', JSON.stringify(remoteBundles));
        } else {
          saveBundlesToFirestore(bundles).catch(() => {});
        }
      })
      .catch(err => {
        console.warn('Initial bundles fetch from Firestore:', err);
      });

    // Fetch and subscribe Promo Coupons from Firestore
    fetchCouponsFromFirestore()
      .then(remoteCoupons => {
        if (remoteCoupons && remoteCoupons.length > 0) {
          setCoupons(remoteCoupons);
          localStorage.setItem('jps_coupons', JSON.stringify(remoteCoupons));
        } else {
          saveCouponsToFirestore(coupons).catch(() => {});
        }
      })
      .catch(err => {
        console.warn('Initial coupons fetch from Firestore:', err);
      });

    const unsubCoupons = subscribeToCoupons(remoteCoupons => {
      if (remoteCoupons && remoteCoupons.length > 0) {
        setCoupons(remoteCoupons);
      }
    });

    // Fetch Return Policy from Firestore
    fetchReturnPolicyFromFirestore()
      .then(remotePolicy => {
        if (remotePolicy) {
          setReturnPolicySettings(prev => ({ ...prev, ...remotePolicy }));
          localStorage.setItem('jps_return_policy_settings', JSON.stringify(remotePolicy));
        }
      })
      .catch(() => {});

    // Fetch SEO Settings from Firestore
    fetchSeoSettingsFromFirestore()
      .then(remoteSeo => {
        if (remoteSeo) {
          setSeoSettings(prev => ({ ...prev, ...remoteSeo }));
          localStorage.setItem('jps_seo_settings', JSON.stringify(remoteSeo));
        }
      })
      .catch(() => {});

    // Fetch LiveChat Settings from Firestore
    fetchLiveChatSettingsFromFirestore()
      .then(remoteChat => {
        if (remoteChat) {
          setLiveChatSettings(prev => ({ ...prev, ...remoteChat }));
          localStorage.setItem('jps_live_chat_settings', JSON.stringify(remoteChat));
        }
      })
      .catch(() => {});

    // Fetch Homepage Sections from Firestore
    fetchHomepageSectionsFromFirestore()
      .then(remoteHome => {
        if (remoteHome) {
          setHomepageSections(prev => ({ ...prev, ...remoteHome }));
          localStorage.setItem('jps_homepage_sections', JSON.stringify(remoteHome));
        }
      })
      .catch(() => {});

    // Fetch Order Settings from Firestore
    fetchOrderSettingsFromFirestore()
      .then(remoteOrderRules => {
        if (remoteOrderRules) {
          setOrderSettings(prev => ({ ...prev, ...remoteOrderRules }));
          localStorage.setItem('jps_order_settings', JSON.stringify(remoteOrderRules));
        }
      })
      .catch(() => {});

    // Fetch Staff Accounts from Firestore
    fetchStaffAccountsFromFirestore()
      .then(remoteStaff => {
        if (remoteStaff && remoteStaff.length > 0) {
          const hasMaster = remoteStaff.some(s => s.email === 'mdmahmudulhashan0@gmail.com');
          const finalStaff = hasMaster ? remoteStaff : [INITIAL_STAFF_ACCOUNTS[0], ...remoteStaff];
          setStaffAccounts(finalStaff);
          localStorage.setItem('jps_staff_accounts', JSON.stringify(finalStaff));
        }
      })
    // Fetch and subscribe Registered Customers from Firestore
    fetchCustomersFromFirestore()
      .then(remoteCusts => {
        if (remoteCusts && remoteCusts.length > 0) {
          const sanitized = remoteCusts.filter(
            c => c.phone !== '01712345678' && c.email?.toLowerCase() !== 'tanvir.ahmed@gmail.com'
          );
          setRegisteredCustomers(sanitized);
          localStorage.setItem('jps_registered_customers', JSON.stringify(sanitized));
        }
      })
      .catch(() => {});

    const unsubCustomers = subscribeToCustomers(remoteCusts => {
      if (remoteCusts) {
        const sanitized = remoteCusts.filter(
          c => c.phone !== '01712345678' && c.email?.toLowerCase() !== 'tanvir.ahmed@gmail.com'
        );
        setRegisteredCustomers(sanitized);
      }
    });

    return () => {
      unsubscribe();
      unsubPayment();
      unsubDelivery();
      unsubProducts();
      unsubOrders();
      unsubCoupons();
      unsubCustomers();
      unsubCouriers();
    };
  }, []);

  // Active modals
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<Order | null>(null);
  const [orderForCall, setOrderForCall] = useState<Order | null>(null);
  const [orderForEdit, setOrderForEdit] = useState<Order | null>(null);
  const [orderForCourier, setOrderForCourier] = useState<Order | null>(null);
  const [orderForShippingLabel, setOrderForShippingLabel] = useState<Order | null>(null);
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedNeed, setSelectedNeed] = useState<string | null>(null);
  const [selectedMaxBudget, setSelectedMaxBudget] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<string>('featured');

  // Persistence
  useEffect(() => {
    localStorage.setItem('jps_lang', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('jps_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    const customerId = user.isLoggedIn ? (user.phone || user.email) : '';
    const cartKey = getCustomerCartStorageKey(customerId);
    localStorage.setItem(cartKey, JSON.stringify(cart));

    // Also persist customer's cart to their registered customer profile & Firestore if logged in
    if (user.isLoggedIn && customerId) {
      const cleanPhone = user.phone ? user.phone.replace(/\D/g, '') : '';
      const cleanEmail = (user.email || '').toLowerCase().trim();
      setRegisteredCustomers(prev => {
        const idx = prev.findIndex(
          c => (cleanPhone && c.phone.replace(/\D/g, '') === cleanPhone) ||
               (cleanEmail && c.email.toLowerCase().trim() === cleanEmail)
        );
        if (idx !== -1 && JSON.stringify(prev[idx].cart || []) !== JSON.stringify(cart)) {
          const next = [...prev];
          next[idx] = { ...next[idx], cart };
          localStorage.setItem('jps_registered_customers', JSON.stringify(next));
          saveCustomersToFirestore(next).catch(() => {});
          return next;
        }
        return prev;
      });
    }
  }, [cart, user.isLoggedIn, user.phone, user.email]);

  useEffect(() => {
    localStorage.setItem('jps_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('jps_recent', JSON.stringify(recentlyViewed));
  }, [recentlyViewed]);

  useEffect(() => {
    localStorage.setItem('jps_addresses', JSON.stringify(savedAddresses));
  }, [savedAddresses]);

  useEffect(() => {
    localStorage.setItem('jps_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('jps_website_settings', JSON.stringify(websiteSettings));
  }, [websiteSettings]);

  useEffect(() => {
    localStorage.setItem('jps_delivery_settings', JSON.stringify(deliverySettings));
  }, [deliverySettings]);

  useEffect(() => {
    localStorage.setItem('jps_payment_settings', JSON.stringify(paymentSettings));
  }, [paymentSettings]);

  useEffect(() => {
    localStorage.setItem('jps_courier_configs', JSON.stringify(courierConfigs));
  }, [courierConfigs]);

  useEffect(() => {
    localStorage.setItem('jps_live_chat_settings', JSON.stringify(liveChatSettings));
  }, [liveChatSettings]);

  useEffect(() => {
    localStorage.setItem('jps_registered_customers', JSON.stringify(registeredCustomers));
  }, [registeredCustomers]);

  useEffect(() => {
    localStorage.setItem('jps_unified_conversations', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem('jps_role_permissions', JSON.stringify(rolePermissions));
  }, [rolePermissions]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (bn: string, en: string) => {
    return language === 'bn' ? bn : en;
  };

  const toBanglaNumber = (num: number | string): string => {
    const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(num).replace(/[0-9]/g, digit => banglaDigits[Number(digit)]);
  };

  const formatPrice = (amount: number): string => {
    const rounded = Math.round(amount);
    const formatted = new Intl.NumberFormat('en-IN').format(rounded);
    if (language === 'bn') {
      return `৳${toBanglaNumber(formatted)}`;
    }
    return `৳${formatted}`;
  };

  // Cart operations
  const addToCart = (product: Product, quantity = 1, color?: string, size?: string): boolean => {
    const liveProd = products.find(p => p.id === product.id) || product;
    const targetColor = color || liveProd.colors[0];
    const targetSize = size || liveProd.sizes[0];
    const available = getAvailableStock(liveProd, targetColor, targetSize);

    if (available <= 0) {
      showToast(
        language === 'bn'
          ? `দুঃখিত! "${liveProd.nameBn || liveProd.name}" বর্তমানে স্টক আউট!`
          : `Sorry! "${liveProd.name}" is out of stock!`,
        'error'
      );
      return false;
    }

    let wasAdded = true;
    setCart(prev => {
      const existingIndex = prev.findIndex(
        item =>
          item.product.id === liveProd.id &&
          item.selectedColor === targetColor &&
          item.selectedSize === targetSize
      );

      if (existingIndex > -1) {
        const currentQty = prev[existingIndex].quantity;
        if (currentQty >= available) {
          showToast(
            language === 'bn'
              ? `স্টকে মাত্র ${available}টি উপলব্ধ এবং তা ইতিমধ্যে ব্যাগে রয়েছে!`
              : `Only ${available} units available and already in cart!`,
            'warning'
          );
          wasAdded = false;
          return prev;
        }

        const newQty = Math.min(available, currentQty + quantity);
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: newQty,
          product: liveProd,
        };
        return next;
      }

      const initialQty = Math.min(available, Math.max(1, quantity));
      return [
        ...prev,
        {
          product: liveProd,
          quantity: initialQty,
          selectedColor: targetColor,
          selectedSize: targetSize,
        },
      ];
    });

    if (wasAdded) {
      showToast(
        language === 'bn'
          ? `✓ "${liveProd.nameBn || liveProd.name}" আপনার ব্যাগে যোগ হয়েছে!`
          : `✓ Added "${liveProd.name}" to your shopping bag!`,
        'success'
      );
    }

    return wasAdded;
  };

  const removeFromCart = (productId: string, color?: string, size?: string) => {
    setCart(prev =>
      prev.filter(item => {
        if (item.product.id !== productId) return true;
        if (color && item.selectedColor !== color) return true;
        if (size && item.selectedSize !== size) return true;
        return false;
      })
    );
  };

  const updateCartQuantity = (productId: string, quantity: number, color?: string, size?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, color, size);
      return;
    }
    const liveProd = products.find(p => p.id === productId);
    const available = getAvailableStock(liveProd, color, size);

    if (quantity > available) {
      showToast(
        language === 'bn'
          ? `দুঃখিত, স্টকে মাত্র ${available}টি অবশিষ্ট আছে!`
          : `Sorry, only ${available} left in stock!`,
        'warning'
      );
    }

    const finalQty = Math.min(Math.max(1, quantity), available);
    if (finalQty <= 0) {
      removeFromCart(productId, color, size);
      return;
    }

    setCart(prev =>
      prev.map(item => {
        if (
          item.product.id === productId &&
          (!color || item.selectedColor === color) &&
          (!size || item.selectedSize === size)
        ) {
          return { ...item, quantity: finalQty, product: liveProd || item.product };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
    const customerId = user.isLoggedIn ? (user.phone || user.email) : '';
    const cartKey = getCustomerCartStorageKey(customerId);
    localStorage.removeItem(cartKey);
    localStorage.removeItem('jps_cart_guest');
    localStorage.removeItem('jps_cart');

    if (user.isLoggedIn && customerId) {
      const cleanPhone = user.phone ? user.phone.replace(/\D/g, '') : '';
      const cleanEmail = (user.email || '').toLowerCase().trim();
      setRegisteredCustomers(prev => {
        const next = prev.map(c =>
          (cleanPhone && c.phone.replace(/\D/g, '') === cleanPhone) ||
          (cleanEmail && c.email.toLowerCase().trim() === cleanEmail)
            ? { ...c, cart: [] }
            : c
        );
        localStorage.setItem('jps_registered_customers', JSON.stringify(next));
        saveCustomersToFirestore(next).catch(() => {});
        return next;
      });
    }
  };

  const addBundleToCart = (productIds: string[], _bundleDiscountPrice: number) => {
    const itemsToAdd = products.filter(p => productIds.includes(p.id));
    const outOfStockItems = itemsToAdd.filter(p => getAvailableStock(p) <= 0);

    if (outOfStockItems.length > 0) {
      const names = outOfStockItems.map(p => `"${p.nameBn || p.name}"`).join(', ');
      showToast(
        language === 'bn'
          ? `বান্ডেলের কিছু পণ্য (${names}) স্টক আউট থাকায় যোগ করা যায়নি।`
          : `Cannot add bundle because some items (${names}) are out of stock.`,
        'error'
      );
      return;
    }

    itemsToAdd.forEach(p => {
      addToCart(p, 1, p.colors[0], p.sizes[0]);
    });
    setActiveModal('cart');
  };

  // Wishlist
  const toggleWishlist = (productId: string) => {
    setWishlist(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      }
      return [...prev, productId];
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  // Compare
  const addToComparison = (productId: string): boolean => {
    if (comparisonList.includes(productId)) return true;
    if (comparisonList.length >= 4) {
      return false;
    }
    setComparisonList(prev => [...prev, productId]);
    return true;
  };

  const removeFromComparison = (productId: string) => {
    setComparisonList(prev => prev.filter(id => id !== productId));
  };

  const clearComparison = () => {
    setComparisonList([]);
  };

  // Recently Viewed
  const addToRecentlyViewed = (productId: string) => {
    setRecentlyViewed(prev => {
      const filtered = prev.filter(id => id !== productId);
      return [productId, ...filtered].slice(0, 10);
    });
  };

  // Cart Math
  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  let couponDiscount = 0;
  if (appliedCoupon && cartSubtotal >= appliedCoupon.minPurchase) {
    if (appliedCoupon.discountType === 'percentage') {
      couponDiscount = Math.round((cartSubtotal * appliedCoupon.discountValue) / 100);
    } else {
      couponDiscount = appliedCoupon.discountValue;
    }
  }

  const freeDeliveryRemaining = Math.max(0, deliverySettings.freeDeliveryThreshold - cartSubtotal);
  const deliveryFee =
    cart.length === 0 ? 0 : cartSubtotal >= deliverySettings.freeDeliveryThreshold ? 0 : deliverySettings.insideDhakaFee;
  const cartTotal = Math.max(0, cartSubtotal - couponDiscount + deliveryFee);

  // Coupons
  const applyCoupon = (code: string) => {
    const trimmed = code.trim().toUpperCase();
    const found = coupons.find(c => c.code.toUpperCase() === trimmed && c.active);
    if (!found) {
      return {
        success: false,
        message: language === 'bn' ? 'অকার্যকর কুপন কোড' : 'Invalid promo coupon code',
      };
    }
    if (cartSubtotal < found.minPurchase) {
      return {
        success: false,
        message:
          language === 'bn'
            ? `এই কুপনের জন্য ন্যূনতম ৳${found.minPurchase}-এর অর্ডার প্রয়োজন`
            : `Minimum order of ৳${found.minPurchase} required for this coupon`,
      };
    }
    setAppliedCoupon(found);
    return {
      success: true,
      message: language === 'bn' ? 'কুপন সফলভাবে যুক্ত হয়েছে!' : 'Coupon applied successfully!',
    };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const addCoupon = (coupon: Coupon) => {
    setCoupons(prev => {
      const updated = [coupon, ...prev];
      localStorage.setItem('jps_coupons', JSON.stringify(updated));
      saveCouponsToFirestore(updated).catch(err => {
        console.warn('Failed to sync coupon to Firestore:', err);
      });
      return updated;
    });
  };

  const updateCoupon = (updated: Coupon) => {
    setCoupons(prev => {
      const next = prev.map(c => (c.code === updated.code ? updated : c));
      localStorage.setItem('jps_coupons', JSON.stringify(next));
      saveCouponsToFirestore(next).catch(err => {
        console.warn('Failed to sync updated coupon to Firestore:', err);
      });
      return next;
    });
  };

  const deleteCoupon = (code: string) => {
    setCoupons(prev => {
      const next = prev.filter(c => c.code !== code);
      localStorage.setItem('jps_coupons', JSON.stringify(next));
      saveCouponsToFirestore(next).catch(err => {
        console.warn('Failed to sync deleted coupon to Firestore:', err);
      });
      return next;
    });
  };

  // Addresses
  const addSavedAddress = (addr: SavedAddress) => {
    setSavedAddresses(prev => [...prev, addr]);
  };

  const deleteSavedAddress = (id: string) => {
    setSavedAddresses(prev => prev.filter(a => a.id !== id));
  };

  // Synchronize orders to React state, localStorage, and Cloud Firestore
  const syncOrders = (updater: (prev: Order[]) => Order[]) => {
    setOrders(prev => {
      const next = updater(prev);
      localStorage.setItem('jps_orders', JSON.stringify(next));
      saveOrdersToFirestore(next).catch(err => {
        console.warn('Failed to sync orders to Firestore:', err);
      });
      return next;
    });
  };

  // Order Placement
  const placeOrder = async (orderData: {
    customerName: string;
    phone: string;
    alternativePhone?: string;
    district: string;
    area: string;
    fullAddress: string;
    customerNote?: string;
    paymentMethod: 'cod' | 'bkash' | 'nagad' | 'rocket';
    deliveryOption: 'inside' | 'outside' | 'chattogram';
    preferredCourier?: CourierPartner | 'Auto';
    courierInstructions?: string;
    orderSource?: 'Website' | 'Facebook' | 'WhatsApp' | 'Phone Call';
    paymentDetails?: {
      senderNumber?: string;
      trxId?: string;
      amount?: number;
      accountType?: 'Merchant' | 'Personal';
    };
  }): Promise<{ success: boolean; order?: Order; error?: string }> => {
    const now = new Date();
    const dateStr =
      now.toLocaleDateString('en-GB') + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const orderId = `JPS-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Accurate delivery charge calculation (Dhaka, Chattogram, Outside, and Free Offers)
    const districtLower = (orderData.district || '').toLowerCase();
    const isChattogram =
      orderData.deliveryOption === 'chattogram' ||
      districtLower.includes('chattogram') ||
      districtLower.includes('chittagong') ||
      orderData.district.includes('চট্টগ্রাম');

    let deliveryCharge = 0;
    if (cartSubtotal >= deliverySettings.freeDeliveryThreshold) {
      deliveryCharge = 0;
    } else if (isChattogram) {
      deliveryCharge = deliverySettings.chattogramFreeDeliveryOffer ? 0 : deliverySettings.chattogramFee;
    } else if (
      orderData.deliveryOption === 'inside' ||
      districtLower.includes('dhaka') ||
      orderData.district.includes('ঢাকা')
    ) {
      deliveryCharge = deliverySettings.dhakaFreeDeliveryOffer ? 0 : deliverySettings.insideDhakaFee;
    } else {
      deliveryCharge = deliverySettings.outsideDhakaFee;
    }

    const total = Math.max(0, cartSubtotal - couponDiscount + deliveryCharge);

    // Courier assignment from active configured couriers
    const isInsideDhaka =
      orderData.deliveryOption === 'inside' ||
      districtLower.includes('dhaka') ||
      orderData.district.includes('ঢাকা');

    let assignedCourier: CourierConfig | undefined = undefined;
    if (orderData.preferredCourier && orderData.preferredCourier !== 'Auto') {
      assignedCourier = courierConfigs.find(c => c.id === orderData.preferredCourier && c.isActive);
    }

    if (!assignedCourier) {
      if (isInsideDhaka) {
        assignedCourier = courierConfigs.find(c => c.isActive && c.autoAssignInsideDhaka);
      } else {
        assignedCourier = courierConfigs.find(c => c.isActive && c.autoAssignOutsideDhaka);
      }
    }

    if (!assignedCourier) {
      assignedCourier = courierConfigs.find(c => c.isActive);
    }

    let courierConsignment: CourierConsignmentInfo | undefined = undefined;
    let trackingNumber = 'PENDING';
    let courierDisplayName = 'Not Assigned';

    if (assignedCourier) {
      courierDisplayName = assignedCourier.name;
      const providerPrefixes: Record<CourierPartner, string> = {
        Steadfast: 'STF',
        Pathao: 'PTH',
        RedX: 'RDX',
        Paperfly: 'PPF',
        Sundarban: 'SND',
        eCourier: 'ECO',
      };
      const prefix = providerPrefixes[assignedCourier.id] || 'TRK';
      const trackingCode = `${prefix}-${Math.floor(100000 + Math.random() * 900000)}BD`;
      const trackingUrl = assignedCourier.trackingUrlTemplate
        ? assignedCourier.trackingUrlTemplate.replace('{TRACKING_ID}', trackingCode)
        : `https://steadfast.com.bd/t/${trackingCode}`;

      trackingNumber = trackingCode;
      courierConsignment = {
        courierName: assignedCourier.id,
        courierNameBn: assignedCourier.nameBn,
        consignmentId: `CONS-${Date.now()}`,
        trackingCode: trackingCode,
        trackingUrl: trackingUrl,
        courierStatus: 'Pending Pickup',
        weightKg: 0.5,
        codAmount: orderData.paymentMethod === 'cod' ? total : 0,
        shippingCharge: deliveryCharge,
        dispatchedDate: dateStr,
        specialInstructions: orderData.courierInstructions || orderData.customerNote,
      };
    }

    const initialTimeline: OrderTimelineStep[] = [
      {
        status: 'Pending',
        statusBn: 'নতুন অর্ডার প্লেস করা হয়েছে',
        date: dateStr,
        completed: true,
        description: 'Order placed by customer via web checkout',
        descriptionBn: assignedCourier
          ? `অর্ডার সিস্টেমে গ্রহণ করা হয়েছে (${assignedCourier.nameBn} নির্ধারিত)`
          : 'গ্রাহকের অর্ডার সফলভাবে সিস্টেমে যুক্ত হয়েছে',
      },
    ];

    const newOrder: Order = {
      id: orderId,
      customerName: orderData.customerName,
      phone: orderData.phone,
      alternativePhone: orderData.alternativePhone,
      address: {
        district: orderData.district,
        area: orderData.area,
        fullAddress: orderData.fullAddress,
      },
      items: [...cart],
      subtotal: cartSubtotal,
      discount: couponDiscount,
      couponCode: appliedCoupon?.code,
      deliveryFee: deliveryCharge,
      totalAmount: total,
      paymentMethod: orderData.paymentMethod,
      paymentStatus: orderData.paymentMethod === 'cod' ? 'Pending' : 'Paid',
      paymentDetails: orderData.paymentDetails,
      orderDate: dateStr,
      orderSource: orderData.orderSource || 'Website',
      customerNote: orderData.customerNote,
      status: 'Pending',
      timeline: initialTimeline,
      trackingNumber: trackingNumber,
      courier: courierDisplayName,
      courierInfo: courierConsignment,
      callLogs: [],
    };

    // Step 1: Pre-validate client cart against current local stock before calling server
    const clientOutOfStock = cart.filter(ci => {
      const p = products.find(prod => prod.id === ci.product.id) || ci.product;
      return getAvailableStock(p, ci.selectedColor, ci.selectedSize) < ci.quantity;
    });

    if (clientOutOfStock.length > 0) {
      const issues = clientOutOfStock
        .map(ci => `"${ci.product.nameBn || ci.product.name}"`)
        .join(', ');
      return {
        success: false,
        error:
          language === 'bn'
            ? `দুঃখিত! ব্যাগে থাকা কিছু পণ্যের পর্যাপ্ত স্টক নেই (${issues})। অনুগ্রহ করে ব্যাগে চেক করুন।`
            : `Some items in your cart exceed available stock (${issues}). Please adjust your cart.`,
      };
    }

    // Step 2: Atomic backend checkout with Firestore runTransaction
    const checkoutResult = await executeAtomicOrderCheckout(
      newOrder,
      adminUser?.email || 'jotpotshop.official@gmail.com'
    );

    if (!checkoutResult.success) {
      return {
        success: false,
        error:
          checkoutResult.error ||
          (language === 'bn'
            ? 'স্টক ঘাটতির কারণে অর্ডার সম্পন্ন করা যায়নি।'
            : 'Could not place order due to insufficient stock.'),
      };
    }

    const confirmedOrder = checkoutResult.order || newOrder;

    // Step 3: Optimistically update product stock and variant stocks locally
    setProducts(prev => {
      return prev.map(p => {
        const orderedItem = cart.find(ci => ci.product.id === p.id);
        if (orderedItem) {
          const newStock = Math.max(0, p.stock - orderedItem.quantity);
          let newVariants = p.variantStocks ? { ...p.variantStocks } : undefined;
          if (newVariants) {
            const color = orderedItem.selectedColor?.trim();
            const size = orderedItem.selectedSize?.trim();
            if (color && size && typeof newVariants[`${color}-${size}`] === 'number') {
              newVariants[`${color}-${size}`] = Math.max(0, newVariants[`${color}-${size}`] - orderedItem.quantity);
            }
            if (color && typeof newVariants[color] === 'number') {
              newVariants[color] = Math.max(0, newVariants[color] - orderedItem.quantity);
            }
            if (size && typeof newVariants[size] === 'number') {
              newVariants[size] = Math.max(0, newVariants[size] - orderedItem.quantity);
            }
          }
          return { ...p, stock: newStock, variantStocks: newVariants };
        }
        return p;
      });
    });

    // Save order
    syncOrders(prev => [confirmedOrder, ...prev.filter(o => o.id !== confirmedOrder.id)]);

    // Send customer notification
    const orderNotif: UserNotification = {
      id: `notif-${Date.now()}`,
      title: `Order Placed #${orderId}`,
      titleBn: `নতুন অর্ডার সম্পন্ন হয়েছে #${orderId}`,
      message: `Your order of ৳${total} has been placed. Review in progress.`,
      messageBn: `আপনার ৳${total} টাকার অর্ডার গৃহীত হয়েছে। শীঘ্রই যোগাযোগ করা হবে।`,
      time: 'Just now',
      type: 'order',
      read: false,
    };
    setNotifications(prev => [orderNotif, ...prev]);

    // Trigger Admin Sound / New Order Alert
    setHasNewOrderAlert(true);

    // Clear cart
    clearCart();

    return {
      success: true,
      order: confirmedOrder,
    };
  };

  const dismissNewOrderAlert = () => {
    setHasNewOrderAlert(false);
  };

  // Order Confirmation & Review Workflow
  const confirmOrder = (orderId: string, confirmedBy = 'Admin') => {
    const now = new Date();
    const dateStr =
      now.toLocaleDateString('en-GB') + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    syncOrders(prev =>
      prev.map(ord => {
        if (ord.id !== orderId) return ord;

        const timelineStep: OrderTimelineStep = {
          status: 'Confirmed',
          statusBn: 'অর্ডার নিশ্চিত করা হয়েছে',
          date: dateStr,
          completed: true,
          description: `Order verified and confirmed by ${confirmedBy}`,
          descriptionBn: `${confirmedBy} কর্তৃক গ্রাহকের তথ্য যাচাই করে অর্ডার নিশ্চিত করা হয়েছে`,
        };

        const existingWithoutDupes = ord.timeline.filter(t => t.status !== 'Confirmed');

        return {
          ...ord,
          status: 'Confirmed',
          confirmedBy,
          confirmedAt: dateStr,
          timeline: [...existingWithoutDupes, timelineStep],
        };
      })
    );
  };

  const cancelOrder = (orderId: string, reason: string) => {
    const now = new Date();
    const dateStr =
      now.toLocaleDateString('en-GB') + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    syncOrders(prev =>
      prev.map(ord => {
        if (ord.id !== orderId) return ord;

        // Restore stock
        ord.items.forEach(item => {
          setProducts(currProducts =>
            currProducts.map(p =>
              p.id === item.product.id ? { ...p, stock: p.stock + item.quantity } : p
            )
          );
        });

        const cancelStep: OrderTimelineStep = {
          status: 'Cancelled',
          statusBn: 'অর্ডার বাতিল করা হয়েছে',
          date: dateStr,
          completed: true,
          description: `Order cancelled. Reason: ${reason}`,
          descriptionBn: `অর্ডার বাতিল। কারণ: ${reason}`,
        };

        return {
          ...ord,
          status: 'Cancelled',
          cancelReason: reason,
          timeline: [...ord.timeline, cancelStep],
        };
      })
    );
  };

  const holdOrder = (orderId: string, reason: string) => {
    const now = new Date();
    const dateStr =
      now.toLocaleDateString('en-GB') + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    syncOrders(prev =>
      prev.map(ord => {
        if (ord.id !== orderId) return ord;

        const holdStep: OrderTimelineStep = {
          status: 'On Hold',
          statusBn: 'অর্ডার হোল্ডে রাখা হয়েছে',
          date: dateStr,
          completed: true,
          description: `Order put on hold. Reason: ${reason}`,
          descriptionBn: `অর্ডার হোল্ডে রাখা হয়েছে। কারণ: ${reason}`,
        };

        return {
          ...ord,
          status: 'On Hold',
          holdReason: reason,
          timeline: [...ord.timeline, holdStep],
        };
      })
    );
  };

  const editOrder = (orderId: string, updatedFields: Partial<Order>) => {
    syncOrders(prev =>
      prev.map(ord => {
        if (ord.id !== orderId) return ord;
        return {
          ...ord,
          ...updatedFields,
        };
      })
    );
  };

  const addCallLog = (orderId: string, log: Omit<OrderCallLog, 'id' | 'timestamp'>) => {
    const now = new Date();
    const timestamp =
      now.toLocaleDateString('en-GB') + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newLog: OrderCallLog = {
      id: `call-${Date.now()}`,
      timestamp,
      ...log,
    };

    syncOrders(prev =>
      prev.map(ord => {
        if (ord.id !== orderId) return ord;
        return {
          ...ord,
          callLogs: [newLog, ...(ord.callLogs || [])],
        };
      })
    );
  };

  // Courier Dispatch
  const sendToCourier = (
    orderId: string,
    courierName: CourierPartner,
    weightKg: number,
    specialInstructions = ''
  ) => {
    const now = new Date();
    const dateStr =
      now.toLocaleDateString('en-GB') + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const prefixes: Record<CourierPartner, string> = {
      Steadfast: 'STF',
      RedX: 'RDX',
      Pathao: 'PTH',
      Paperfly: 'PPF',
      Sundarban: 'SND',
      eCourier: 'ECO',
    };

    const courierCfg = courierConfigs.find(c => c.id === courierName);
    const trackingCode = `${prefixes[courierName]}-${Math.floor(1000000 + Math.random() * 9000000)}BD`;
    const trackingUrl = courierCfg
      ? courierCfg.trackingUrlTemplate.replace('{TRACKING_ID}', trackingCode)
      : `https://jotpotshop.com/track/${trackingCode}`;

    syncOrders(prev =>
      prev.map(ord => {
        if (ord.id !== orderId) return ord;

        const codAmount = ord.paymentMethod === 'cod' ? ord.totalAmount : 0;
        const shippingCharge =
          ord.address.district.includes('Dhaka') || ord.address.district.includes('ঢাকা')
            ? courierCfg?.baseChargeDhaka || 60
            : courierCfg?.baseChargeOutside || 120;

        const shippedStep: OrderTimelineStep = {
          status: 'Shipped',
          statusBn: `${courierCfg?.nameBn || courierName}-এ হস্তান্তর সম্পন্ন`,
          date: dateStr,
          completed: true,
          description: `Dispatched via ${courierName}. Tracking: ${trackingCode}`,
          descriptionBn: `${courierCfg?.nameBn || courierName} কুরিয়ারে বুকিং সম্পন্ন হয়েছে। ট্র্যাকিং: ${trackingCode}`,
        };

        return {
          ...ord,
          status: 'Shipped',
          trackingNumber: trackingCode,
          courier: courierCfg?.name || courierName,
          courierInfo: {
            courierName,
            courierNameBn: courierCfg?.nameBn || courierName,
            consignmentId: trackingCode,
            trackingCode,
            trackingUrl,
            courierStatus: 'In Transit',
            weightKg,
            codAmount,
            shippingCharge,
            dispatchedDate: dateStr,
            specialInstructions,
            hubName: `${ord.address.district} Hub`,
          },
          timeline: [...ord.timeline.filter(t => t.status !== 'Shipped'), shippedStep],
        };
      })
    );
  };

  const updateCourierStatus = (orderId: string, courierStatus: any) => {
    const now = new Date();
    const dateStr =
      now.toLocaleDateString('en-GB') + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    syncOrders(prev =>
      prev.map(ord => {
        if (ord.id !== orderId || !ord.courierInfo) return ord;

        let newOrderStatus: OrderStatus = ord.status;
        let stepDesc = '';
        let stepDescBn = '';

        if (courierStatus === 'In Transit') {
          newOrderStatus = 'Shipped';
          stepDesc = 'Parcel is moving between hubs';
          stepDescBn = 'পার্সেলটি কুরিয়ার হাবে ট্রানজিটে আছে';
        } else if (courierStatus === 'Out for Delivery') {
          newOrderStatus = 'Out for Delivery';
          stepDesc = 'Rider is on the way to customer address';
          stepDescBn = 'রাইডার ডেলিভারি সম্পন্ন করতে রওয়ানা দিয়েছে';
        } else if (courierStatus === 'Delivered') {
          newOrderStatus = 'Delivered';
          stepDesc = 'Successfully delivered & COD collected';
          stepDescBn = 'পণ্য সফলভাবে পৌঁছে দেওয়া হয়েছে ও ক্যাশ গ্রহণ করা হয়েছে';
        } else if (courierStatus === 'Returned') {
          newOrderStatus = 'Returned';
          stepDesc = 'Customer rejected parcel. Returning to hub';
          stepDescBn = 'গ্রাহক গ্রহণ করেননি। পার্সেল ফেরত আসছে';
        }

        const newStep: OrderTimelineStep = {
          status: newOrderStatus,
          statusBn:
            newOrderStatus === 'Delivered'
              ? 'সফল ডেলিভারি সম্পন্ন'
              : newOrderStatus === 'Out for Delivery'
              ? 'ডেলিভারিতে বের হয়েছে'
              : newOrderStatus === 'Returned'
              ? 'পার্সেল রিটার্ন'
              : 'ট্রানজিটে আছে',
          date: dateStr,
          completed: true,
          description: stepDesc,
          descriptionBn: stepDescBn,
        };

        return {
          ...ord,
          status: newOrderStatus,
          paymentStatus: newOrderStatus === 'Delivered' ? 'Paid' : ord.paymentStatus,
          courierInfo: {
            ...ord.courierInfo,
            courierStatus,
          },
          timeline: [...ord.timeline.filter(t => t.status !== newOrderStatus), newStep],
        };
      })
    );
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    syncOrders(prev =>
      prev.map(ord => {
        if (ord.id !== orderId) return ord;

        const updatedTimeline = ord.timeline.map(step => {
          if (step.status === status) {
            return {
              ...step,
              completed: true,
              date:
                new Date().toLocaleDateString('en-GB') +
                ' ' +
                new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
          }
          return step;
        });

        return {
          ...ord,
          status,
          timeline: updatedTimeline,
          paymentStatus: status === 'Delivered' ? 'Paid' : ord.paymentStatus,
        };
      })
    );
  };

  const findOrderById = (orderId: string) => {
    const cleanId = orderId.trim().toUpperCase();
    return orders.find(
      o =>
        o.id.toUpperCase() === cleanId ||
        o.trackingNumber.toUpperCase() === cleanId ||
        (o.courierInfo && o.courierInfo.consignmentId.toUpperCase() === cleanId)
    );
  };

  // Products CRUD with auto-occasion tagging & local storage persistence
  const addProduct = (product: Product) => {
    const finalProduct: Product = {
      ...product,
      needTags:
        product.needTags && product.needTags.length > 0
          ? product.needTags
          : detectProductOccasions(product),
    };
    setProducts(prev => {
      const next = [finalProduct, ...prev];
      localStorage.setItem('jps_products', JSON.stringify(next));
      saveProductsToFirestore(next).catch(err => {
        console.warn('Failed to sync added product to Firestore:', err);
      });
      return next;
    });
  };

  const updateProduct = (updated: Product) => {
    const finalProduct: Product = {
      ...updated,
      needTags:
        updated.needTags && updated.needTags.length > 0
          ? updated.needTags
          : detectProductOccasions(updated),
    };
    setProducts(prev => {
      const next = prev.map(p => (p.id === finalProduct.id ? finalProduct : p));
      localStorage.setItem('jps_products', JSON.stringify(next));
      saveProductsToFirestore(next).catch(err => {
        console.warn('Failed to sync updated product to Firestore:', err);
      });
      return next;
    });
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => {
      const next = prev.filter(p => p.id !== id);
      localStorage.setItem('jps_products', JSON.stringify(next));
      saveProductsToFirestore(next).catch(err => {
        console.warn('Failed to sync deleted product to Firestore:', err);
      });
      return next;
    });
  };

  const bulkDeleteProducts = (productIds: string[]) => {
    const idSet = new Set(productIds);
    setProducts(prev => {
      const next = prev.filter(p => !idSet.has(p.id));
      localStorage.setItem('jps_products', JSON.stringify(next));
      saveProductsToFirestore(next).catch(err => {
        console.warn('Failed to sync bulk deleted products to Firestore:', err);
      });
      return next;
    });
  };

  const bulkUpdateProducts = (productIds: string[], updates: Partial<Product>) => {
    const idSet = new Set(productIds);
    setProducts(prev => {
      const next = prev.map(p => {
        if (!idSet.has(p.id)) return p;
        return {
          ...p,
          ...updates,
          needTags:
            updates.needTags && updates.needTags.length > 0
              ? updates.needTags
              : p.needTags,
        };
      });
      localStorage.setItem('jps_products', JSON.stringify(next));
      saveProductsToFirestore(next).catch(err => {
        console.warn('Failed to sync bulk updated products to Firestore:', err);
      });
      return next;
    });
  };

  // Complete The Look (Bundles) Operations
  const addBundle = (newBundle: BundleOffer) => {
    setBundles(prev => {
      const updated = [newBundle, ...prev];
      localStorage.setItem('jps_bundles', JSON.stringify(updated));
      saveBundlesToFirestore(updated).catch(() => {});
      return updated;
    });
    if (newBundle.isActive !== false) {
      setActiveBundleId(newBundle.id);
    }
  };

  const updateBundle = (updatedBundle: BundleOffer) => {
    setBundles(prev => {
      const updated = prev.map(b => (b.id === updatedBundle.id ? updatedBundle : b));
      localStorage.setItem('jps_bundles', JSON.stringify(updated));
      saveBundlesToFirestore(updated).catch(() => {});
      return updated;
    });
  };

  const deleteBundle = (bundleId: string) => {
    setBundles(prev => {
      const updated = prev.filter(b => b.id !== bundleId);
      localStorage.setItem('jps_bundles', JSON.stringify(updated));
      saveBundlesToFirestore(updated).catch(() => {});
      return updated;
    });
    if (activeBundleId === bundleId) {
      const remaining = bundles.filter(b => b.id !== bundleId);
      const nextActive = remaining[0]?.id || null;
      setActiveBundleId(nextActive);
    }
  };

  const setActiveBundleId = (id: string | null) => {
    setActiveBundleIdState(id);
    if (id) {
      localStorage.setItem('jps_active_bundle', id);
    } else {
      localStorage.removeItem('jps_active_bundle');
    }
  };

  const autoGenerateBundle = (): BundleOffer | null => {
    const generated = generateSmartComboBundle(products, bundles);
    if (generated) {
      addBundle(generated);
      return generated;
    }
    return null;
  };

  // Occasions ("আপনার কী প্রয়োজন?") Operations
  const autoAssignNeedTags = (prod: Product): NeedTag[] => {
    return detectProductOccasions(prod);
  };

  const updateProductNeedTags = (productId: string, needTags: NeedTag[]) => {
    setProducts(prev => {
      const updated = prev.map(p => (p.id === productId ? { ...p, needTags } : p));
      localStorage.setItem('jps_products', JSON.stringify(updated));
      saveProductsToFirestore(updated).catch(() => {});
      return updated;
    });
  };

  const autoTagAllProducts = (): number => {
    let taggedCount = 0;
    setProducts(prev => {
      const updated = prev.map(p => {
        if (!p.needTags || p.needTags.length === 0) {
          taggedCount++;
          return { ...p, needTags: detectProductOccasions(p) };
        }
        return p;
      });
      localStorage.setItem('jps_products', JSON.stringify(updated));
      saveProductsToFirestore(updated).catch(() => {});
      return updated;
    });
    return taggedCount;
  };

  // Helper to switch cart to a specific customer's isolated bag
  const switchCustomerCart = (customerId: string, registeredCust?: RegisteredCustomer) => {
    const targetCartKey = getCustomerCartStorageKey(customerId);
    const savedCustomerCart = localStorage.getItem(targetCartKey);
    let loadedCart: CartItem[] = [];

    if (savedCustomerCart) {
      try {
        const parsed = JSON.parse(savedCustomerCart);
        if (Array.isArray(parsed) && parsed.length > 0) loadedCart = parsed;
      } catch {}
    }

    if (loadedCart.length === 0 && registeredCust?.cart && registeredCust.cart.length > 0) {
      loadedCart = registeredCust.cart;
    }

    // If customer has no prior saved cart, but just browsed as guest in this immediate session, carry over guest items
    if (loadedCart.length === 0) {
      const guestCartStr = localStorage.getItem('jps_cart_guest');
      if (guestCartStr) {
        try {
          const guestParsed = JSON.parse(guestCartStr);
          if (Array.isArray(guestParsed) && guestParsed.length > 0) {
            loadedCart = guestParsed;
          }
        } catch {}
      }
    }

    // Always clear guest and legacy cart once logged in
    localStorage.removeItem('jps_cart_guest');
    localStorage.removeItem('jps_cart');

    setCart(loadedCart);
    localStorage.setItem(targetCartKey, JSON.stringify(loadedCart));
  };

  // User auth
  const loginUser = (info: { name: string; phone: string; email: string }) => {
    setUser({
      isLoggedIn: true,
      name: info.name,
      phone: info.phone,
      email: info.email,
    });
    switchCustomerCart(info.phone || info.email);
  };

  const logoutUser = () => {
    // 1. Save current customer's cart under their personal storage key
    if (user.isLoggedIn && (user.phone || user.email)) {
      const key = getCustomerCartStorageKey(user.phone || user.email);
      localStorage.setItem(key, JSON.stringify(cart));
    }
    // 2. Clear active in-memory cart completely so no other user or guest sees this customer's bag
    setCart([]);
    setAppliedCoupon(null);
    localStorage.removeItem('jps_cart_guest');
    localStorage.removeItem('jps_cart');
    setUser({ isLoggedIn: false, name: '', phone: '', email: '' });
  };

  // Synchronize registered customers to state, localStorage, and Cloud Firestore
  const syncCustomers = (updater: (prev: RegisteredCustomer[]) => RegisteredCustomer[]) => {
    setRegisteredCustomers(prev => {
      const next = updater(prev);
      localStorage.setItem('jps_registered_customers', JSON.stringify(next));
      saveCustomersToFirestore(next).catch(err => {
        console.warn('Failed to sync customers to Firestore:', err);
      });
      return next;
    });
  };

  // Customer Registration with Password
  const registerCustomer = (info: { name: string; phone: string; email?: string; password: string }) => {
    if (!info.name.trim() || !info.phone.trim() || !info.password) {
      return { success: false, message: 'অনুগ্রহ করে নাম, মোবাইল নম্বর এবং পাসওয়ার্ড প্রদান করুন।' };
    }
    const cleanPhone = info.phone.trim();
    const cleanEmail = (info.email || '').trim().toLowerCase();

    const exists = registeredCustomers.some(
      c => c.phone === cleanPhone || (cleanEmail && c.email.toLowerCase() === cleanEmail)
    );
    if (exists) {
      return { success: false, message: 'এই মোবাইল নম্বর বা ইমেইল দিয়ে ইতিমধ্যে অ্যাকাউন্ট তৈরি করা হয়েছে। লগইন করুন।' };
    }

    const newCustomer: RegisteredCustomer = {
      id: `cust-${Date.now()}`,
      name: info.name.trim(),
      phone: cleanPhone,
      email: cleanEmail || `${cleanPhone}@customer.jotpotshop.com`,
      password: info.password,
      isGoogleUser: false,
      createdAt: new Date().toISOString(),
      cart: [...cart],
    };

    syncCustomers(prev => [newCustomer, ...prev]);
    setUser({
      isLoggedIn: true,
      name: newCustomer.name,
      phone: newCustomer.phone,
      email: newCustomer.email,
    });
    switchCustomerCart(newCustomer.phone || newCustomer.email, newCustomer);

    return { success: true, message: 'কাস্টমার অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে! স্বাগতম।' };
  };

  // Customer Login with Password (Real credentials only, NO demo backdoor)
  const loginCustomerWithPassword = (identifier: string, pass: string) => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = pass.trim();

    const found = registeredCustomers.find(
      c => (c.phone === cleanId || c.email.toLowerCase() === cleanId) && c.password === cleanPass
    );

    if (found) {
      setUser({
        isLoggedIn: true,
        name: found.name,
        phone: found.phone,
        email: found.email,
      });
      switchCustomerCart(found.phone || found.email, found);
      return { success: true, message: 'লগইন সফল হয়েছে!' };
    }

    return { success: false, message: 'ভুল মোবাইল নম্বর/ইমেইল অথবা পাসওয়ার্ড! অনুগ্রহ করে সঠিক তথ্য দিন।' };
  };

  // One-click Google Login
  const loginWithGoogle = (googleUser?: { name: string; email: string; avatarUrl?: string }) => {
    if (!googleUser?.email) return;
    const gName = googleUser.name || 'Google User';
    const gEmail = googleUser.email.toLowerCase();
    const gAvatar = googleUser.avatarUrl || '';

    let existing = registeredCustomers.find(c => c.email.toLowerCase() === gEmail);
    if (!existing) {
      existing = {
        id: `cust-g-${Date.now()}`,
        name: gName,
        phone: '',
        email: gEmail,
        isGoogleUser: true,
        avatarUrl: gAvatar,
        createdAt: new Date().toISOString(),
        cart: [...cart],
      };
      syncCustomers(prev => [existing!, ...prev]);
    }

    setUser({
      isLoggedIn: true,
      name: existing.name,
      phone: existing.phone,
      email: existing.email,
    });
    switchCustomerCart(existing.email, existing);
  };

  // Instant Phone OTP Login
  const loginCustomerWithOtp = (phone: string) => {
    const cleanPhone = phone.trim().replace(/\D/g, '');
    if (cleanPhone.length < 11) {
      return { success: false, message: 'অনুগ্রহ করে সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন।' };
    }

    let existing = registeredCustomers.find(c => c.phone.replace(/\D/g, '') === cleanPhone);
    if (!existing) {
      const newCust: RegisteredCustomer = {
        id: `cust-${Date.now()}`,
        name: `গ্রাহক-${cleanPhone.slice(-4)}`,
        phone: cleanPhone,
        email: `${cleanPhone}@customer.jotpotshop.com`,
        isGoogleUser: false,
        createdAt: new Date().toISOString(),
        cart: [...cart],
      };
      syncCustomers(prev => [newCust, ...prev]);
      existing = newCust;
    }

    setUser({
      isLoggedIn: true,
      name: existing.name,
      phone: existing.phone,
      email: existing.email,
    });
    switchCustomerCart(existing.phone || existing.email, existing);

    return { success: true, message: `স্বাগতম ${existing.name}! ওটিপি যাচাই সফল হয়েছে।` };
  };

  // Reset Customer Password
  const resetCustomerPassword = (phone: string, newPass: string) => {
    const cleanPhone = phone.trim().replace(/\D/g, '');
    if (cleanPhone.length < 11) {
      return { success: false, message: 'সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন।' };
    }
    if (!newPass || newPass.length < 6) {
      return { success: false, message: 'নতুন পাসওয়ার্ড কমপক্ষে ৬ ডিজিটের হতে হবে।' };
    }

    const found = registeredCustomers.find(c => c.phone.replace(/\D/g, '') === cleanPhone);
    if (!found) {
      return { success: false, message: 'এই নম্বরে কোনো অ্যাকাউন্ট পাওয়া যায়নি। নতুন অ্যাকাউন্ট রেজিস্ট্রেশন করুন।' };
    }

    syncCustomers(prev =>
      prev.map(c => (c.phone.replace(/\D/g, '') === cleanPhone ? { ...c, password: newPass } : c))
    );

    setUser({
      isLoggedIn: true,
      name: found.name,
      phone: found.phone,
      email: found.email,
    });
    switchCustomerCart(found.phone || found.email, found);

    return { success: true, message: 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে এবং আপনি লগইন হয়েছেন!' };
  };

  // Update Customer Profile
  const updateCustomerProfile = (updates: { name: string; phone: string; email?: string }) => {
    setUser(prev => ({
      ...prev,
      name: updates.name.trim() || prev.name,
      phone: updates.phone.trim() || prev.phone,
      email: (updates.email || prev.email || '').trim(),
    }));

    syncCustomers(prev =>
      prev.map(c =>
        c.phone === user.phone || (c.email && c.email.toLowerCase() === user.email.toLowerCase())
          ? {
              ...c,
              name: updates.name.trim() || c.name,
              phone: updates.phone.trim() || c.phone,
              email: (updates.email || c.email).trim(),
            }
          : c
      )
    );
  };

  // Toggle AI Sales Agent
  const toggleAiSalesAgent = (enabled?: boolean) => {
    const nextVal = enabled !== undefined ? enabled : !liveChatSettings.enableAiSalesAgent;
    updateLiveChatSettings({ enableAiSalesAgent: nextVal });
  };

  // Send Customer Chat Message (Omnichannel)
  const sendCustomerChatMessage = (
    text: string,
    channel: MessageChannel = 'livechat',
    customerDetails?: { name?: string; phone?: string; email?: string }
  ) => {
    const custName = customerDetails?.name || user.name || 'গ্রাহক (Customer)';
    const custPhone = customerDetails?.phone || user.phone || '017XXXXXXXX';
    const custEmail = customerDetails?.email || user.email || '';
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMsg: UnifiedMessage = {
      id: `msg-${Date.now()}`,
      sender: 'customer',
      senderName: custName,
      text,
      timestamp: timeStr,
    };

    setConversations(prev => {
      const existingIdx = prev.findIndex(
        c => c.channel === channel && (c.customerPhone === custPhone || c.customerName === custName)
      );

      let updatedList: UnifiedConversation[];
      let targetConvId: string;

      if (existingIdx >= 0) {
        const existing = prev[existingIdx];
        const updatedConv: UnifiedConversation = {
          ...existing,
          unreadCount: existing.unreadCount + 1,
          lastMessage: text,
          lastMessageTime: 'এইমাত্র',
          status: 'open',
          messages: [...existing.messages, newMsg],
        };
        targetConvId = existing.id;
        updatedList = [updatedConv, ...prev.filter((_, idx) => idx !== existingIdx)];
      } else {
        const newConvId = `conv-${channel}-${Date.now()}`;
        targetConvId = newConvId;
        const newConv: UnifiedConversation = {
          id: newConvId,
          channel,
          customerName: custName,
          customerPhone: custPhone,
          customerEmail: custEmail,
          unreadCount: 1,
          lastMessage: text,
          lastMessageTime: 'এইমাত্র',
          status: 'open',
          messages: [newMsg],
        };
        updatedList = [newConv, ...prev];
      }

      // If AI Sales Assistant is ON, AI generates smart conversational sales response
      if (liveChatSettings.enableAiSalesAgent) {
        setTimeout(() => {
          const lower = text.toLowerCase();
          let matchedProduct = products.find(p => {
            const nameLower = (p.name + ' ' + p.nameBn + ' ' + p.category + ' ' + p.subcategory).toLowerCase();
            if (lower.includes('শার্ট') || lower.includes('shirt')) return nameLower.includes('shirt') || nameLower.includes('শার্ট');
            if (lower.includes('পাঞ্জাবি') || lower.includes('panjabi')) return nameLower.includes('panjabi') || nameLower.includes('পাঞ্জাবি');
            if (lower.includes('শাড়ি') || lower.includes('saree') || lower.includes('জামদানি')) return nameLower.includes('saree') || nameLower.includes('শাড়ি') || nameLower.includes('জামদানি');
            if (lower.includes('ঘড়ি') || lower.includes('watch')) return nameLower.includes('watch') || nameLower.includes('ঘড়ি');
            if (lower.includes('ইয়ারবাড') || lower.includes('earbud') || lower.includes('হেডফোন')) return nameLower.includes('earbud') || nameLower.includes('headphone');
            return false;
          }) || products[0];

          let aiText = '';
          if (lower.includes('ডেলিভারি') || lower.includes('চট্টগ্রাম') || lower.includes('চার্জ')) {
            const ctgFree = deliverySettings.chattogramFreeDeliveryOffer;
            aiText = `আসসালামু আলাইকুম! আমাদের ডেলিভারি চার্জ: ঢাকা সিটিতে ৳${deliverySettings.insideDhakaFee} (${deliverySettings.insideDhakaDays})। ${ctgFree ? '🎉 বিশেষ অফার: চট্টগ্রামে আজকে ডেলিভারি সম্পূর্ণ ফ্রি (৳০)!' : `চট্টগ্রামে ৳${deliverySettings.chattogramFee} (${deliverySettings.chattogramDays})।`} এছাড়া ৳${deliverySettings.freeDeliveryThreshold}+ অর্ডারে সারা দেশে ফ্রি ডেলিভারি!`;
          } else if (lower.includes('পেমেন্ট') || lower.includes('বিকাশ') || lower.includes('ক্যাশ')) {
            aiText = `আমরা সারা বাংলাদেশে ক্যাশ অন ডেলিভারি (হাতে পেয়ে টাকা পরিশোধ) সুবিধা দিচ্ছি। এছাড়া বিকাশ ও নগদে পার্সোনাল সেন্ড-মানি বা মার্চেন্ট পেমেন্ট করে দ্রুত অর্ডার করতে পারেন।`;
          } else if (matchedProduct) {
            aiText = `আসসালামু আলাইকুম! আপনি কি "${matchedProduct.nameBn || matchedProduct.name}" খুঁজছেন? এটি বর্তমানে স্টকে রয়েছে, রেগুলার প্রাইস ৳${matchedProduct.oldPrice || matchedProduct.price + 300}, কিন্তু বিশেষ অফারে মাত্র ৳${matchedProduct.price} টাকায় পাচ্ছেন! সারা দেশে ক্যাশ অন ডেলিভারি সুবিধা রয়েছে। আপনি চাইলে আমি এখনই অর্ডার কনফার্ম করতে সহায়তা করতে পারি।`;
          } else {
            aiText = `আসসালামু আলাইকুম! আমি ঝটপট এআই সেলস সহকারী। আমাদের স্টোরে ফ্যাশন, প্রিমিয়াম পাঞ্জাবি, শার্ট, জামদানি শাড়ি এবং লেটেস্ট গ্যাজেট কালেকশন ডিসকাউন্টে চলছে। আপনি কি কোনো নির্দিষ্ট পণ্য খুঁজছেন?`;
          }

          const aiMsg: UnifiedMessage = {
            id: `msg-ai-${Date.now()}`,
            sender: 'ai',
            senderName: liveChatSettings.aiSalesAgentName || 'ঝটপট এআই সেলস সহকারী',
            text: aiText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            productId: matchedProduct?.id,
            productName: matchedProduct?.nameBn || matchedProduct?.name,
            productPrice: matchedProduct?.price,
            productImage: matchedProduct?.images?.[0],
          };

          setConversations(current =>
            current.map(c =>
              c.id === targetConvId
                ? {
                    ...c,
                    lastMessage: aiText,
                    lastMessageTime: 'এইমাত্র',
                    messages: [...c.messages, aiMsg],
                  }
                : c
            )
          );
        }, 600);
      }

      return updatedList;
    });
  };

  // Staff / Admin Reply to Conversation
  const replyToConversation = (
    conversationId: string,
    replyText: string,
    staffName?: string,
    attachedProductId?: string
  ) => {
    if (!replyText.trim()) return;
    const author = staffName || adminUser?.name || 'স্টাফ সাপোর্ট (Staff)';
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let attachedProd = attachedProductId ? products.find(p => p.id === attachedProductId) : undefined;

    const newReply: UnifiedMessage = {
      id: `msg-staff-${Date.now()}`,
      sender: 'staff',
      senderName: author,
      text: replyText.trim(),
      timestamp: timeStr,
      productId: attachedProd?.id,
      productName: attachedProd?.nameBn || attachedProd?.name,
      productPrice: attachedProd?.price,
      productImage: attachedProd?.images?.[0],
    };

    setConversations(prev =>
      prev.map(c => {
        if (c.id === conversationId) {
          return {
            ...c,
            unreadCount: 0,
            lastMessage: replyText.trim(),
            lastMessageTime: 'এইমাত্র',
            status: 'waiting',
            messages: [...c.messages, newReply],
          };
        }
        return c;
      })
    );
  };

  const handleSetCurrentRole = (role: UserRole) => {
    setCurrentRole(role);
    const match = staffAccounts.find(s => s.role === role) || INITIAL_STAFF_ACCOUNTS.find(s => s.role === role);
    if (match) {
      setAdminUser(match);
      localStorage.setItem('jps_active_admin', JSON.stringify(match));
    }
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  // RBAC Permission Checking
  const hasPermission = (module: SystemModule, action: PermissionAction): boolean => {
    if (currentRole === 'SUPER_ADMIN') return true; // Super Admin has god-mode
    // Super Admin & Admin have full authority for products, categories, coupons, homepage (occasions & bundles)
    if (currentRole === 'ADMIN') {
      if (['products', 'categories', 'coupons', 'homepage', 'orders', 'customers'].includes(module)) {
        return true;
      }
    }
    const perms = rolePermissions[currentRole]?.[module] || [];
    return perms.includes(action) || perms.includes('manage');
  };

  const updateRolePermission = (role: UserRole, module: SystemModule, actions: PermissionAction[]) => {
    setRolePermissions(prev => {
      const updated = {
        ...prev,
        [role]: {
          ...prev[role],
          [module]: actions,
        },
      };
      localStorage.setItem('jps_role_permissions', JSON.stringify(updated));
      return updated;
    });
  };

  const resetRolePermissionsToDefault = () => {
    setRolePermissions(DEFAULT_ROLE_PERMISSIONS);
    localStorage.setItem('jps_role_permissions', JSON.stringify(DEFAULT_ROLE_PERMISSIONS));
  };

  // Business Configurations updates
  const updateWebsiteSettings = (settings: Partial<WebsiteSettings>) => {
    setWebsiteSettings(prev => {
      const merged = { ...prev, ...settings };
      localStorage.setItem('jps_website_settings', JSON.stringify(merged));
      // Background sync to Firestore
      saveBrandingToFirestore(merged).catch(err => {
        console.warn('Could not sync branding to Firestore:', err);
      });
      return merged;
    });
  };

  const saveBrandingToRemote = async (settings: Partial<WebsiteSettings>): Promise<boolean> => {
    try {
      const merged = { ...websiteSettings, ...settings };
      // Sanitize and compress data URLs before storing and syncing
      if (merged.logoUrl?.startsWith('data:') && merged.logoUrl.length > 50000) {
        merged.logoUrl = await resizeDataUrl(merged.logoUrl, 320, 0.70);
      }
      if (merged.mobileLogoUrl?.startsWith('data:') && merged.mobileLogoUrl.length > 30000) {
        merged.mobileLogoUrl = await resizeDataUrl(merged.mobileLogoUrl, 180, 0.70);
      }
      if (merged.faviconUrl?.startsWith('data:') && merged.faviconUrl.length > 15000) {
        merged.faviconUrl = await resizeDataUrl(merged.faviconUrl, 48, 0.65);
      }

      setWebsiteSettings(merged);
      localStorage.setItem('jps_website_settings', JSON.stringify(merged));
      await saveBrandingToFirestore(merged);
      return true;
    } catch (err) {
      console.warn('Failed to save branding to Firestore:', err);
      return false;
    }
  };

  const updateDeliverySettings = (settings: Partial<DeliverySettings>) => {
    setDeliverySettings(prev => {
      const merged = { ...prev, ...settings };
      localStorage.setItem('jps_delivery_settings', JSON.stringify(merged));
      saveDeliverySettingsToFirestore(merged).catch(err => {
        console.warn('Failed to sync delivery settings to Firestore:', err);
      });
      return merged;
    });
  };

  const updatePaymentSettings = (settings: Partial<PaymentSettings>) => {
    setPaymentSettings(prev => {
      const merged = { ...prev, ...settings };
      localStorage.setItem('jps_payment_settings', JSON.stringify(merged));
      savePaymentSettingsToFirestore(merged).catch(err => {
        console.warn('Failed to sync payment settings to Firestore:', err);
      });
      return merged;
    });
  };

  const updateCourierConfig = (courierId: CourierPartner, config: Partial<CourierConfig>) => {
    setCourierConfigs(prev => {
      const updated = prev.map(c => (c.id === courierId ? { ...c, ...config } : c));
      saveCouriersToFirestore(updated).catch(() => {});
      return updated;
    });
  };

  const saveAllCourierConfigs = async (configs: CourierConfig[]): Promise<void> => {
    setCourierConfigs(configs);
    localStorage.setItem('jps_courier_configs', JSON.stringify(configs));
    await saveCouriersToFirestore(configs);
  };

  const updateReturnPolicySettings = (settings: Partial<ReturnPolicySettings>) => {
    setReturnPolicySettings(prev => {
      const merged = { ...prev, ...settings };
      localStorage.setItem('jps_return_policy_settings', JSON.stringify(merged));
      saveReturnPolicyToFirestore(merged).catch(err => {
        console.warn('Failed to sync return policy to Firestore:', err);
      });
      return merged;
    });
  };

  const updateSeoSettings = (settings: Partial<SeoSettings>) => {
    setSeoSettings(prev => {
      const merged = { ...prev, ...settings };
      localStorage.setItem('jps_seo_settings', JSON.stringify(merged));
      saveSeoSettingsToFirestore(merged).catch(err => {
        console.warn('Failed to sync SEO settings to Firestore:', err);
      });
      return merged;
    });
  };

  const updateLiveChatSettings = (settings: Partial<LiveChatSettings>) => {
    setLiveChatSettings(prev => {
      const merged = { ...prev, ...settings };
      localStorage.setItem('jps_live_chat_settings', JSON.stringify(merged));
      saveLiveChatSettingsToFirestore(merged).catch(err => {
        console.warn('Failed to sync livechat settings to Firestore:', err);
      });
      return merged;
    });
  };

  const updateHomepageSections = (config: Partial<HomepageSectionConfig>) => {
    setHomepageSections(prev => {
      const merged = { ...prev, ...config };
      localStorage.setItem('jps_homepage_sections', JSON.stringify(merged));
      saveHomepageSectionsToFirestore(merged).catch(err => {
        console.warn('Failed to sync homepage sections to Firestore:', err);
      });
      return merged;
    });
  };

  const updateOrderSettings = (settings: Partial<OrderSettings>) => {
    setOrderSettings(prev => {
      const merged = { ...prev, ...settings };
      localStorage.setItem('jps_order_settings', JSON.stringify(merged));
      saveOrderSettingsToFirestore(merged).catch(err => {
        console.warn('Failed to sync order settings to Firestore:', err);
      });
      return merged;
    });
  };

  const updateReviewSettings = (settings: Partial<ReviewSettings>) => {
    setReviewSettings(prev => {
      const merged = { ...prev, ...settings };
      localStorage.setItem('jps_review_settings', JSON.stringify(merged));
      return merged;
    });
  };

  // Categories CRUD
  const addCategory = (category: Category) => {
    setCategories(prev => {
      const updated = [category, ...prev];
      localStorage.setItem('jps_categories', JSON.stringify(updated));
      saveCategoriesToFirestore(updated).catch(err =>
        console.warn('Could not sync category to Firestore:', err)
      );
      return updated;
    });
  };

  const updateCategory = (updatedCat: Category) => {
    setCategories(prev => {
      const updated = prev.map(c => (c.id === updatedCat.id ? updatedCat : c));
      localStorage.setItem('jps_categories', JSON.stringify(updated));
      saveCategoriesToFirestore(updated).catch(err =>
        console.warn('Could not sync category to Firestore:', err)
      );
      return updated;
    });
  };

  const deleteCategory = (categoryId: string) => {
    setCategories(prev => {
      const updated = prev.filter(c => c.id !== categoryId);
      localStorage.setItem('jps_categories', JSON.stringify(updated));
      saveCategoriesToFirestore(updated).catch(err =>
        console.warn('Could not sync category to Firestore:', err)
      );
      return updated;
    });
  };

  // Hero Banners CRUD
  const addHeroBanner = (banner: HeroBannerSlide) => {
    setHeroBanners(prev => {
      const updated = [...prev, banner];
      localStorage.setItem('jps_hero_banners', JSON.stringify(updated));
      saveHeroBannersToFirestore(updated).catch(err =>
        console.warn('Could not sync hero banner to Firestore:', err)
      );
      return updated;
    });
  };

  const updateHeroBanner = (updatedBanner: HeroBannerSlide) => {
    setHeroBanners(prev => {
      const updated = prev.map(b => (b.id === updatedBanner.id ? updatedBanner : b));
      localStorage.setItem('jps_hero_banners', JSON.stringify(updated));
      saveHeroBannersToFirestore(updated).catch(err =>
        console.warn('Could not sync hero banner to Firestore:', err)
      );
      return updated;
    });
  };

  const deleteHeroBanner = (bannerId: string | number) => {
    setHeroBanners(prev => {
      const updated = prev.filter(b => b.id !== bannerId);
      localStorage.setItem('jps_hero_banners', JSON.stringify(updated));
      saveHeroBannersToFirestore(updated).catch(err =>
        console.warn('Could not sync hero banner to Firestore:', err)
      );
      return updated;
    });
  };

  // Admin Login and Session Management
  const adminLogin = (identifier: string, password: string): { success: boolean; message: string } => {
    const cleanId = (identifier || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    if (!cleanId || !cleanPass) {
      return { success: false, message: 'অনুগ্রহ করে ইউজারনেম/ইমেইল এবং পাসওয়ার্ড লিখুন।' };
    }

    // Super Admin direct match (as specified by user)
    if (
      (cleanId === 'mdmahmudulhashan0@gmail.com' || cleanId === 'mdmahmudulhashan0') &&
      cleanPass === 'MahmuduLHashAn0@#'
    ) {
      const superAdmin = staffAccounts.find(s => s.role === 'SUPER_ADMIN') || INITIAL_STAFF_ACCOUNTS[0];
      const updatedUser: StaffAccount = {
        ...superAdmin,
        lastLogin: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', Today',
      };
      setAdminUser(updatedUser);
      setCurrentRole('SUPER_ADMIN');
      setIsAdminView(true);
      setShowAdminLoginModal(false);
      localStorage.setItem('jps_active_admin', JSON.stringify(updatedUser));
      return { success: true, message: 'সুপার এডমিন হিসেবে সফলভাবে লগইন সম্পন্ন হয়েছে!' };
    }

    // Check staff accounts list (matching by full email, username prefix before @, phone, or ID)
    const match = staffAccounts.find(s => {
      const emailLower = s.email.toLowerCase();
      const usernamePrefix = emailLower.split('@')[0];
      const idLower = s.id.toLowerCase();
      const phoneClean = s.phone.trim();

      const identifierMatches =
        emailLower === cleanId ||
        usernamePrefix === cleanId ||
        idLower === cleanId ||
        phoneClean === cleanId;

      return identifierMatches && s.password === cleanPass;
    });

    if (match) {
      if (!match.isActive) {
        return { success: false, message: 'এই এডমিন একাউন্টটি বর্তমানে নিষ্ক্রিয় (Disabled) রয়েছে।' };
      }
      const updatedUser: StaffAccount = {
        ...match,
        lastLogin: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', Today',
      };
      setAdminUser(updatedUser);
      setCurrentRole(updatedUser.role);
      setIsAdminView(true);
      setShowAdminLoginModal(false);
      localStorage.setItem('jps_active_admin', JSON.stringify(updatedUser));
      setStaffAccounts(prev => prev.map(s => (s.id === updatedUser.id ? updatedUser : s)));
      return { success: true, message: `স্বাগতম ${updatedUser.name}! সফলভাবে লগইন হয়েছে।` };
    }

    return { success: false, message: 'ভুল ইমেইল/ইউজারনেম বা পাসওয়ার্ড। পুনরায় সঠিক তথ্য দিন।' };
  };

  const adminLogout = () => {
    setAdminUser(null);
    setIsAdminView(false);
    localStorage.removeItem('jps_active_admin');
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', '/');
    }
  };

  const addStaffAccount = (newStaff: Omit<StaffAccount, 'id' | 'lastLogin'>) => {
    const created: StaffAccount = {
      ...newStaff,
      id: `staff-${Date.now()}`,
      lastLogin: 'Never',
    };
    setStaffAccounts(prev => {
      const updated = [...prev, created];
      localStorage.setItem('jps_staff_accounts', JSON.stringify(updated));
      saveStaffAccountsToFirestore(updated).catch(err => {
        console.warn('Failed to sync staff account to Firestore:', err);
      });
      return updated;
    });
  };

  const updateStaffAccount = (updated: StaffAccount) => {
    setStaffAccounts(prev => {
      const updatedList = prev.map(s => (s.id === updated.id ? updated : s));
      localStorage.setItem('jps_staff_accounts', JSON.stringify(updatedList));
      saveStaffAccountsToFirestore(updatedList).catch(err => {
        console.warn('Failed to sync updated staff account to Firestore:', err);
      });
      return updatedList;
    });
    if (adminUser?.id === updated.id) {
      setAdminUser(updated);
      localStorage.setItem('jps_active_admin', JSON.stringify(updated));
    }
  };

  const deleteStaffAccount = (id: string) => {
    setStaffAccounts(prev => {
      // Protect master superadmin from deletion
      const updatedList = prev.filter(s => !(s.id === id && s.email === 'mdmahmudulhashan0@gmail.com'));
      localStorage.setItem('jps_staff_accounts', JSON.stringify(updatedList));
      saveStaffAccountsToFirestore(updatedList).catch(err => {
        console.warn('Failed to sync deleted staff account to Firestore:', err);
      });
      return updatedList;
    });
  };

  // Super Admin: Purge All Demo Data
  const purgeAllDemoData = () => {
    const demoOrderIds = [
      'ORD-9821',
      'ORD-9822',
      'ORD-9823',
      'ORD-9824',
      'ORD-9825',
      'JPS-2026-9204',
      'JPS-2026-8941',
      'JPS-2026-7812',
    ];
    const demoPhones = ['01819234567', '01711223344', '01912998877', '01712345678'];
    const realOrders = orders.filter(
      o =>
        !demoOrderIds.includes(o.id) &&
        !o.id.startsWith('DEMO-') &&
        !demoPhones.includes(o.phone?.replace(/\D/g, '')) &&
        !['Shakil Mahmud', 'Tanvir Ahmed', 'Farhana Akter'].includes(o.customerName)
    );
    setOrders(realOrders);
    localStorage.setItem('jps_orders', JSON.stringify(realOrders));
    saveOrdersToFirestore(realOrders, adminUser?.email || 'jotpotshop.official@gmail.com');

    // Clear demo addresses
    setSavedAddresses([]);
    localStorage.setItem('jps_addresses', JSON.stringify([]));

    // Clear demo notifications
    setNotifications([]);
    localStorage.setItem('jps_notifications', JSON.stringify([]));

    // Clear demo conversations
    setConversations([]);
    localStorage.setItem('jps_unified_conversations', JSON.stringify([]));

    // Clear demo customers
    syncCustomers(prev =>
      prev.filter(
        c =>
          !c.id.startsWith('demo-') &&
          !c.name.includes('Demo') &&
          !c.name.includes('ডেমো') &&
          !demoPhones.includes(c.phone?.replace(/\D/g, ''))
      )
    );

    return {
      success: true,
      message: 'সকল ডেমো ডেটা সফলভাবে মুছে ফেলা হয়েছে! শপ এখন ১০০% রিয়েল কাস্টমার ডেটায় প্রস্তুত।',
    };
  };

  const clearAllDemoOrders = () => {
    const demoOrderIds = [
      'ORD-9821',
      'ORD-9822',
      'ORD-9823',
      'ORD-9824',
      'ORD-9825',
      'JPS-2026-9204',
      'JPS-2026-8941',
      'JPS-2026-7812',
    ];
    const demoPhones = ['01819234567', '01711223344', '01912998877', '01712345678'];
    const realOrders = orders.filter(
      o =>
        !demoOrderIds.includes(o.id) &&
        !o.id.startsWith('DEMO-') &&
        !demoPhones.includes(o.phone?.replace(/\D/g, '')) &&
        !['Shakil Mahmud', 'Tanvir Ahmed', 'Farhana Akter'].includes(o.customerName)
    );
    setOrders(realOrders);
    localStorage.setItem('jps_orders', JSON.stringify(realOrders));
    saveOrdersToFirestore(realOrders, adminUser?.email || 'jotpotshop.official@gmail.com');
  };

  const clearAllDemoCustomers = () => {
    const demoPhones = ['01819234567', '01711223344', '01912998877', '01712345678'];
    syncCustomers(prev =>
      prev.filter(
        c =>
          !c.id.startsWith('demo-') &&
          !c.name.includes('Demo') &&
          !c.name.includes('ডেমো') &&
          !demoPhones.includes(c.phone?.replace(/\D/g, ''))
      )
    );
  };

  return (
    <ShopContext.Provider
      value={{
        language,
        setLanguage,
        t,
        formatPrice,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        bulkDeleteProducts,
        bulkUpdateProducts,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        addBundleToCart,
        wishlist,
        toggleWishlist,
        isInWishlist,
        comparisonList,
        addToComparison,
        removeFromComparison,
        clearComparison,
        recentlyViewed,
        addToRecentlyViewed,
        coupons,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        addCoupon,
        updateCoupon,
        deleteCoupon,
        savedAddresses,
        addSavedAddress,
        deleteSavedAddress,
        orders,
        placeOrder,
        updateOrderStatus,
        confirmOrder,
        cancelOrder,
        holdOrder,
        editOrder,
        addCallLog,
        sendToCourier,
        updateCourierStatus,
        findOrderById,
        user,
        loginUser,
        logoutUser,
        registeredCustomers,
        registerCustomer,
        loginCustomerWithPassword,
        loginCustomerWithOtp,
        resetCustomerPassword,
        updateCustomerProfile,
        loginWithGoogle,
        conversations,
        activeChatConversationId,
        setActiveChatConversationId,
        sendCustomerChatMessage,
        replyToConversation,
        toggleAiSalesAgent,
        notifications,
        markNotificationRead,
        hasNewOrderAlert,
        dismissNewOrderAlert,
        shopToast,
        setShopToast,
        showToast,
        selectedLocation,
        setSelectedLocation,
        cartSubtotal,
        couponDiscount,
        deliveryFee,
        cartTotal,
        freeDeliveryRemaining,
        activeModal,
        setActiveModal,
        quickViewProduct,
        setQuickViewProduct,
        selectedOrderForInvoice,
        setSelectedOrderForInvoice,
        orderForCall,
        setOrderForCall,
        orderForEdit,
        setOrderForEdit,
        orderForCourier,
        setOrderForCourier,
        orderForShippingLabel,
        setOrderForShippingLabel,
        trackingOrderId,
        setTrackingOrderId,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        selectedNeed,
        setSelectedNeed,
        selectedMaxBudget,
        setSelectedMaxBudget,
        sortBy,
        setSortBy,
        isAdminView,
        setIsAdminView,
        currentRole,
        setCurrentRole: handleSetCurrentRole,
        staffAccounts,
        rolePermissions,
        updateRolePermission,
        hasPermission,
        resetRolePermissionsToDefault,
        purgeAllDemoData,
        clearAllDemoOrders,
        clearAllDemoCustomers,
        websiteSettings,
        updateWebsiteSettings,
        deliverySettings,
        updateDeliverySettings,
        paymentSettings,
        updatePaymentSettings,
        courierConfigs,
        updateCourierConfig,
        saveAllCourierConfigs,
        returnPolicySettings,
        updateReturnPolicySettings,
        seoSettings,
        updateSeoSettings,
        liveChatSettings,
        updateLiveChatSettings,
        homepageSections,
        updateHomepageSections,
        orderSettings,
        updateOrderSettings,
        reviewSettings,
        updateReviewSettings,
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        heroBanners,
        addHeroBanner,
        updateHeroBanner,
        deleteHeroBanner,
        bundles,
        activeBundleId,
        addBundle,
        updateBundle,
        deleteBundle,
        setActiveBundleId,
        autoGenerateBundle,
        autoAssignNeedTags,
        updateProductNeedTags,
        autoTagAllProducts,
        adminUser,
        showAdminLoginModal,
        setShowAdminLoginModal,
        adminLogin,
        adminLogout,
        addStaffAccount,
        updateStaffAccount,
        deleteStaffAccount,
        firebaseStatus,
        isFirebaseConnected,
        refreshFirebaseConnection,
        saveBrandingToRemote,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};
