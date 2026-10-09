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
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_COUPONS,
  INITIAL_SAVED_ADDRESSES,
  INITIAL_NOTIFICATIONS,
  CATEGORIES,
} from '../data/mockData';
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
  FirebaseConnectionDiagnostic,
  FIREBASE_PROJECT_INFO,
} from '../lib/firebase';

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

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, color?: string, size?: string) => void;
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
    paymentMethod: 'cod' | 'bkash' | 'nagad' | 'card' | 'rocket';
    deliveryOption: 'inside' | 'outside' | 'chattogram';
    orderSource?: 'Website' | 'Facebook' | 'WhatsApp' | 'Phone Call';
    paymentDetails?: {
      senderNumber?: string;
      trxId?: string;
      amount?: number;
      accountType?: 'Merchant' | 'Personal';
    };
  }) => Order;
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
  loginWithGoogle: (googleUser?: { name: string; email: string; avatarUrl?: string }) => void;

  // Omnichannel Conversations & AI Assistant
  conversations: UnifiedConversation[];
  activeChatConversationId: string | null;
  setActiveChatConversationId: (id: string | null) => void;
  sendCustomerChatMessage: (text: string, channel?: MessageChannel, customerDetails?: { name?: string; phone?: string; email?: string }) => void;
  replyToConversation: (conversationId: string, replyText: string, staffName?: string, attachedProductId?: string) => void;
  toggleAiSalesAgent: (enabled?: boolean) => void;

  // Notifications
  notifications: UserNotification[];
  markNotificationRead: (id: string) => void;
  hasNewOrderAlert: boolean;
  dismissNewOrderAlert: () => void;

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

  // Firebase backend integration
  firebaseStatus: FirebaseConnectionDiagnostic | null;
  isFirebaseConnected: boolean;
  refreshFirebaseConnection: () => Promise<FirebaseConnectionDiagnostic>;
  saveBrandingToRemote: (settings: Partial<WebsiteSettings>) => Promise<boolean>;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('jps_lang') as Language) || 'bn';
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('jps_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('jps_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('jps_wishlist');
    return saved ? JSON.parse(saved) : ['jps-prod-101', 'jps-prod-102'];
  });

  const [comparisonList, setComparisonList] = useState<string[]>([]);

  const [recentlyViewed, setRecentlyViewed] = useState<string[]>(() => {
    const saved = localStorage.getItem('jps_recent');
    return saved ? JSON.parse(saved) : ['jps-prod-101', 'jps-prod-104', 'jps-prod-106'];
  });

  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>(() => {
    const saved = localStorage.getItem('jps_addresses');
    return saved ? JSON.parse(saved) : INITIAL_SAVED_ADDRESSES;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('jps_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [notifications, setNotifications] = useState<UserNotification[]>(INITIAL_NOTIFICATIONS);
  const [hasNewOrderAlert, setHasNewOrderAlert] = useState<boolean>(false);

  const [selectedLocation, setSelectedLocation] = useState<string>('Dhaka (ঢাকা)');

  const [user, setUser] = useState<UserState>(() => {
    const saved = localStorage.getItem('jps_user');
    return saved ? JSON.parse(saved) : { isLoggedIn: false, name: '', phone: '', email: '' };
  });

  const [registeredCustomers, setRegisteredCustomers] = useState<RegisteredCustomer[]>(() => {
    try {
      const saved = localStorage.getItem('jps_registered_customers');
      return saved ? JSON.parse(saved) : INITIAL_REGISTERED_CUSTOMERS;
    } catch {
      return INITIAL_REGISTERED_CUSTOMERS;
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
    return DEFAULT_ROLE_PERMISSIONS;
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
      return saved ? { ...DEFAULT_PAYMENT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_PAYMENT_SETTINGS;
    } catch {
      return DEFAULT_PAYMENT_SETTINGS;
    }
  });

  const [courierConfigs, setCourierConfigs] = useState<CourierConfig[]>(() => {
    try {
      const saved = localStorage.getItem('jps_courier_configs');
      return saved ? JSON.parse(saved) : DEFAULT_COURIER_CONFIGS;
    } catch {
      return DEFAULT_COURIER_CONFIGS;
    }
  });

  const [returnPolicySettings, setReturnPolicySettings] = useState<ReturnPolicySettings>(DEFAULT_RETURN_POLICY);
  const [seoSettings, setSeoSettings] = useState<SeoSettings>(DEFAULT_SEO_SETTINGS);
  const [liveChatSettings, setLiveChatSettings] = useState<LiveChatSettings>(() => {
    try {
      const saved = localStorage.getItem('jps_live_chat_settings');
      return saved ? { ...DEFAULT_LIVE_CHAT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_LIVE_CHAT_SETTINGS;
    } catch {
      return DEFAULT_LIVE_CHAT_SETTINGS;
    }
  });
  const [homepageSections, setHomepageSections] = useState<HomepageSectionConfig>(DEFAULT_HOMEPAGE_SECTIONS);
  const [orderSettings, setOrderSettings] = useState<OrderSettings>(DEFAULT_ORDER_SETTINGS);
  const [reviewSettings, setReviewSettings] = useState<ReviewSettings>(DEFAULT_REVIEW_SETTINGS);

  // Dynamic Categories Management with local & Firebase persistence
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('jps_categories');
    return saved ? JSON.parse(saved) : CATEGORIES;
  });

  // Dynamic Hero Banners Management with local & Firebase persistence
  const [heroBanners, setHeroBanners] = useState<HeroBannerSlide[]>(() => {
    const saved = localStorage.getItem('jps_hero_banners');
    return saved ? JSON.parse(saved) : DEFAULT_HERO_BANNERS;
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

    return () => unsubscribe();
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
    localStorage.setItem('jps_cart', JSON.stringify(cart));
  }, [cart]);

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
  const addToCart = (product: Product, quantity = 1, color?: string, size?: string) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(
        item =>
          item.product.id === product.id &&
          item.selectedColor === (color || product.colors[0]) &&
          item.selectedSize === (size || product.sizes[0])
      );

      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex].quantity += quantity;
        return next;
      }

      return [
        ...prev,
        {
          product,
          quantity,
          selectedColor: color || product.colors[0],
          selectedSize: size || product.sizes[0],
        },
      ];
    });
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
    setCart(prev =>
      prev.map(item => {
        if (
          item.product.id === productId &&
          (!color || item.selectedColor === color) &&
          (!size || item.selectedSize === size)
        ) {
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const addBundleToCart = (productIds: string[], _bundleDiscountPrice: number) => {
    const itemsToAdd = products.filter(p => productIds.includes(p.id));
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
    setCoupons(prev => [coupon, ...prev]);
  };

  const updateCoupon = (updated: Coupon) => {
    setCoupons(prev => prev.map(c => (c.code === updated.code ? updated : c)));
  };

  const deleteCoupon = (code: string) => {
    setCoupons(prev => prev.filter(c => c.code !== code));
  };

  // Addresses
  const addSavedAddress = (addr: SavedAddress) => {
    setSavedAddresses(prev => [...prev, addr]);
  };

  const deleteSavedAddress = (id: string) => {
    setSavedAddresses(prev => prev.filter(a => a.id !== id));
  };

  // Order Placement
  const placeOrder = (orderData: {
    customerName: string;
    phone: string;
    alternativePhone?: string;
    district: string;
    area: string;
    fullAddress: string;
    customerNote?: string;
    paymentMethod: 'cod' | 'bkash' | 'nagad' | 'card' | 'rocket';
    deliveryOption: 'inside' | 'outside' | 'chattogram';
    orderSource?: 'Website' | 'Facebook' | 'WhatsApp' | 'Phone Call';
    paymentDetails?: {
      senderNumber?: string;
      trxId?: string;
      amount?: number;
      accountType?: 'Merchant' | 'Personal';
    };
  }): Order => {
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

    const initialTimeline: OrderTimelineStep[] = [
      {
        status: 'Pending',
        statusBn: 'নতুন অর্ডার প্লেস করা হয়েছে',
        date: dateStr,
        completed: true,
        description: 'Order placed by customer via web checkout',
        descriptionBn: 'গ্রাহকের অর্ডার সফলভাবে সিস্টেমে যুক্ত হয়েছে',
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
      trackingNumber: 'PENDING',
      courier: 'Not Assigned',
      callLogs: [],
    };

    // Update product stock (Stock decrement)
    setProducts(prev => {
      return prev.map(p => {
        const orderedItem = cart.find(ci => ci.product.id === p.id);
        if (orderedItem) {
          const newStock = Math.max(0, p.stock - orderedItem.quantity);
          return { ...p, stock: newStock };
        }
        return p;
      });
    });

    // Save order
    setOrders(prev => [newOrder, ...prev]);

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

    return newOrder;
  };

  const dismissNewOrderAlert = () => {
    setHasNewOrderAlert(false);
  };

  // Order Confirmation & Review Workflow
  const confirmOrder = (orderId: string, confirmedBy = 'Admin') => {
    const now = new Date();
    const dateStr =
      now.toLocaleDateString('en-GB') + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setOrders(prev =>
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

    setOrders(prev =>
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

    setOrders(prev =>
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
    setOrders(prev =>
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

    setOrders(prev =>
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

    setOrders(prev =>
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

    setOrders(prev =>
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
    setOrders(prev =>
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

  // Products CRUD
  const addProduct = (product: Product) => {
    setProducts(prev => [product, ...prev]);
  };

  const updateProduct = (updated: Product) => {
    setProducts(prev => prev.map(p => (p.id === updated.id ? updated : p)));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  // User auth
  const loginUser = (info: { name: string; phone: string; email: string }) => {
    setUser({
      isLoggedIn: true,
      name: info.name,
      phone: info.phone,
      email: info.email,
    });
  };

  const logoutUser = () => {
    setUser({ isLoggedIn: false, name: '', phone: '', email: '' });
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
    };

    setRegisteredCustomers(prev => [newCustomer, ...prev]);
    setUser({
      isLoggedIn: true,
      name: newCustomer.name,
      phone: newCustomer.phone,
      email: newCustomer.email,
    });

    return { success: true, message: 'কাস্টমার অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে! স্বাগতম।' };
  };

  // Customer Login with Password
  const loginCustomerWithPassword = (identifier: string, pass: string) => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = pass.trim();

    // Check demo customer accounts
    if (
      (cleanId === '01712345678' || cleanId === 'tanvir.ahmed@gmail.com' || cleanId === 'tanvir') &&
      (cleanPass === 'password123' || cleanPass === '123456')
    ) {
      setUser({
        isLoggedIn: true,
        name: 'Tanvir Ahmed (তানভীর আহমেদ)',
        phone: '01712345678',
        email: 'tanvir.ahmed@gmail.com',
      });
      return { success: true, message: 'লগইন সফল হয়েছে!' };
    }

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
      return { success: true, message: 'লগইন সফল হয়েছে!' };
    }

    return { success: false, message: 'ভুল মোবাইল নম্বর/ইমেইল অথবা পাসওয়ার্ড! অনুগ্রহ করে সঠিক তথ্য দিন।' };
  };

  // One-click Google Login
  const loginWithGoogle = (googleUser?: { name: string; email: string; avatarUrl?: string }) => {
    const gName = googleUser?.name || 'গুগল গ্রাহক (Google User)';
    const gEmail = googleUser?.email || 'google.shopper@gmail.com';
    const gAvatar = googleUser?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80';

    let existing = registeredCustomers.find(c => c.email.toLowerCase() === gEmail.toLowerCase());
    if (!existing) {
      existing = {
        id: `cust-g-${Date.now()}`,
        name: gName,
        phone: '01700000000',
        email: gEmail,
        isGoogleUser: true,
        avatarUrl: gAvatar,
        createdAt: new Date().toISOString(),
      };
      setRegisteredCustomers(prev => [existing!, ...prev]);
    }

    setUser({
      isLoggedIn: true,
      name: existing.name,
      phone: existing.phone,
      email: existing.email,
    });
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
    const perms = rolePermissions[currentRole]?.[module] || [];
    return perms.includes(action) || perms.includes('manage');
  };

  const updateRolePermission = (role: UserRole, module: SystemModule, actions: PermissionAction[]) => {
    setRolePermissions(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [module]: actions,
      },
    }));
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
      setWebsiteSettings(merged);
      localStorage.setItem('jps_website_settings', JSON.stringify(merged));
      await saveBrandingToFirestore(merged);
      return true;
    } catch (err) {
      console.error('Failed to save branding to Firestore:', err);
      return false;
    }
  };

  const updateDeliverySettings = (settings: Partial<DeliverySettings>) => {
    setDeliverySettings(prev => ({ ...prev, ...settings }));
  };

  const updatePaymentSettings = (settings: Partial<PaymentSettings>) => {
    setPaymentSettings(prev => ({ ...prev, ...settings }));
  };

  const updateCourierConfig = (courierId: CourierPartner, config: Partial<CourierConfig>) => {
    setCourierConfigs(prev =>
      prev.map(c => (c.id === courierId ? { ...c, ...config } : c))
    );
  };

  const updateReturnPolicySettings = (settings: Partial<ReturnPolicySettings>) => {
    setReturnPolicySettings(prev => ({ ...prev, ...settings }));
  };

  const updateSeoSettings = (settings: Partial<SeoSettings>) => {
    setSeoSettings(prev => ({ ...prev, ...settings }));
  };

  const updateLiveChatSettings = (settings: Partial<LiveChatSettings>) => {
    setLiveChatSettings(prev => ({ ...prev, ...settings }));
  };

  const updateHomepageSections = (config: Partial<HomepageSectionConfig>) => {
    setHomepageSections(prev => ({ ...prev, ...config }));
  };

  const updateOrderSettings = (settings: Partial<OrderSettings>) => {
    setOrderSettings(prev => ({ ...prev, ...settings }));
  };

  const updateReviewSettings = (settings: Partial<ReviewSettings>) => {
    setReviewSettings(prev => ({ ...prev, ...settings }));
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

    // Check staff accounts list
    const match = staffAccounts.find(
      s => (s.email.toLowerCase() === cleanId || s.phone === cleanId || s.id === cleanId) && s.password === cleanPass
    );

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
      return updated;
    });
  };

  const updateStaffAccount = (updated: StaffAccount) => {
    setStaffAccounts(prev => {
      const updatedList = prev.map(s => (s.id === updated.id ? updated : s));
      localStorage.setItem('jps_staff_accounts', JSON.stringify(updatedList));
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
      return updatedList;
    });
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
        websiteSettings,
        updateWebsiteSettings,
        deliverySettings,
        updateDeliverySettings,
        paymentSettings,
        updatePaymentSettings,
        courierConfigs,
        updateCourierConfig,
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
