export type Language = 'bn' | 'en';

export interface Product {
  id: string;
  name: string;
  nameBn: string;
  category: string;
  categoryBn: string;
  subcategory: string;
  subcategoryBn: string;
  brand: string;
  sku: string;
  price: number;
  oldPrice?: number;
  discountPercent?: number;
  costPrice: number;
  stock: number;
  lowStockThreshold: number;
  colors: string[];
  sizes: string[];
  images: string[];
  videoUrl?: string;
  description: string;
  descriptionBn: string;
  specifications: Record<string, string>;
  warranty: string;
  warrantyBn: string;
  returnPolicy: string;
  returnPolicyBn: string;
  deliveryDays: string;
  deliveryDaysBn: string;
  tags: string[];
  rating: number;
  reviewsCount: number;
  isFlashSale?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  isTrending?: boolean;
  needTags: ('gift' | 'office' | 'campus' | 'wedding' | 'travel' | 'party' | 'couple' | 'formal' | 'everyday')[];
  reviews: ProductReview[];
  sellerName?: string;
  sellerRating?: number;
}

export interface ProductReview {
  id: string;
  userName: string;
  rating: number;
  date: string;
  comment: string;
  commentBn?: string;
  verifiedPurchase: boolean;
  userImage?: string;
  photoUrl?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

export interface BundleOffer {
  id: string;
  title: string;
  titleBn: string;
  description: string;
  descriptionBn: string;
  productIds: string[];
  regularPrice: number;
  bundlePrice: number;
  badge: string;
}

export interface SavedAddress {
  id: string;
  label: 'Home' | 'Office' | 'Other';
  labelBn: string;
  name: string;
  phone: string;
  district: string;
  area: string;
  fullAddress: string;
  isDefault?: boolean;
}

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Processing'
  | 'Packed'
  | 'Shipped'
  | 'Out for Delivery'
  | 'Delivered'
  | 'On Hold'
  | 'Cancelled'
  | 'Returned';

export interface OrderTimelineStep {
  status: OrderStatus;
  statusBn: string;
  date: string;
  completed: boolean;
  description: string;
  descriptionBn: string;
}

export type CourierPartner =
  | 'Steadfast'
  | 'RedX'
  | 'Pathao'
  | 'Paperfly'
  | 'Sundarban'
  | 'eCourier';

export interface CourierConsignmentInfo {
  courierName: CourierPartner;
  courierNameBn: string;
  consignmentId: string;
  trackingCode: string;
  trackingUrl: string;
  courierStatus:
    | 'Pending Pickup'
    | 'Handed to Courier'
    | 'In Transit'
    | 'Out for Delivery'
    | 'Delivered'
    | 'Returned'
    | 'Partially Delivered';
  weightKg: number;
  codAmount: number;
  shippingCharge: number;
  dispatchedDate: string;
  specialInstructions?: string;
  hubName?: string;
}

export interface OrderCallLog {
  id: string;
  timestamp: string;
  caller: string;
  callerRole: string;
  callOutcome: 'Confirmed' | 'Customer Unreachable' | 'Number Busy' | 'Requested Delay' | 'Customer Cancelled' | 'Wrong Info';
  notes: string;
}

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  alternativePhone?: string;
  email?: string;
  address: {
    district: string;
    area: string;
    fullAddress: string;
  };
  items: CartItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  deliveryFee: number;
  totalAmount: number;
  paymentMethod: 'cod' | 'bkash' | 'nagad' | 'card' | 'rocket';
  paymentStatus: 'Pending' | 'Paid';
  paymentDetails?: {
    senderNumber?: string;
    trxId?: string;
    amount?: number;
    accountType?: 'Merchant' | 'Personal';
  };
  orderDate: string;
  orderSource?: 'Website' | 'Facebook' | 'WhatsApp' | 'Phone Call';
  customerNote?: string;
  status: OrderStatus;
  holdReason?: string;
  cancelReason?: string;
  timeline: OrderTimelineStep[];
  trackingNumber: string;
  courier: string;
  courierInfo?: CourierConsignmentInfo;
  callLogs?: OrderCallLog[];
  confirmedBy?: string;
  confirmedAt?: string;
}

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minPurchase: number;
  description: string;
  descriptionBn: string;
  active: boolean;
  expiryDate: string;
}

export interface UserNotification {
  id: string;
  title: string;
  titleBn: string;
  message: string;
  messageBn: string;
  time: string;
  type: 'order' | 'discount' | 'price_drop' | 'flash_sale';
  read: boolean;
  linkProductId?: string;
}

export interface Category {
  id: string;
  name: string;
  nameBn: string;
  icon: string;
  subcategories: string[];
  subcategoriesBn: string[];
  bannerImage: string;
}

// -------------------------------------------------------------
// SUPER ADMIN & ROLE-BASED ACCESS CONTROL (RBAC)
// -------------------------------------------------------------
export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'STAFF';

export type PermissionAction =
  | 'view'
  | 'create'
  | 'edit'
  | 'delete'
  | 'approve'
  | 'export'
  | 'manage';

export type SystemModule =
  | 'products'
  | 'orders'
  | 'categories'
  | 'coupons'
  | 'couriers'
  | 'customers'
  | 'homepage'
  | 'settings'
  | 'roles'
  | 'reports';

export type RolePermissionMatrix = Record<
  UserRole,
  Record<SystemModule, PermissionAction[]>
>;

export interface RegisteredCustomer {
  id: string;
  name: string;
  phone: string;
  email: string;
  password?: string;
  isGoogleUser?: boolean;
  avatarUrl?: string;
  createdAt: string;
}

export interface StaffAccount {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone: string;
  role: UserRole;
  isActive: boolean;
  lastLogin: string;
}

// -------------------------------------------------------------
// BUSINESS CONFIGURATIONS (SUPER ADMIN CONTROL)
// -------------------------------------------------------------
export interface HeroBannerSlide {
  id: string | number;
  badgeBn: string;
  badgeEn: string;
  titleBn: string;
  titleEn: string;
  subtitleBn: string;
  subtitleEn: string;
  ctaBn: string;
  ctaEn: string;
  category?: string;
  need?: string;
  bgGradient?: string;
  image: string;
  imageStoragePath?: string;
  active?: boolean;
}

export interface WebsiteSettings {
  storeName: string;
  storeNameBn: string;
  tagline: string;
  taglineBn: string;
  taglineBn2?: string;
  taglineBn3?: string;
  domain: string;
  hotline: string;
  whatsappNumber: string;
  supportEmail: string;
  officeAddress: string;
  officeAddressBn: string;
  currencySymbol: string;
  logoUrl: string;
  mobileLogoUrl?: string;
  faviconUrl?: string;
  logoStoragePath?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface DeliverySettings {
  insideDhakaFee: number;
  chattogramFee: number;
  outsideDhakaFee: number;
  freeDeliveryThreshold: number;
  expressDeliveryFee: number;
  insideDhakaDays: string;
  chattogramDays: string;
  outsideDhakaDays: string;
  // Special Delivery Offers
  chattogramFreeDeliveryOffer: boolean;
  chattogramOfferTextBn: string;
  dhakaFreeDeliveryOffer?: boolean;
}

export interface PaymentSettings {
  codEnabled: boolean;
  bkashEnabled: boolean;
  bkashNumber: string;
  bkashAccountType: 'Merchant' | 'Personal';
  bkashAccountName?: string;
  bkashInstructionsBn?: string;
  nagadEnabled: boolean;
  nagadNumber: string;
  nagadAccountType: 'Merchant' | 'Personal';
  nagadAccountName?: string;
  nagadInstructionsBn?: string;
  rocketEnabled: boolean;
  rocketNumber: string;
  onlineCardGatewayEnabled: boolean;
  taxPercent: number;
}

export interface CourierConfig {
  id: CourierPartner;
  name: string;
  nameBn: string;
  isActive: boolean;
  apiKey: string;
  secretKey: string;
  merchantId: string;
  webhookUrl: string;
  autoAssignInsideDhaka: boolean;
  autoAssignOutsideDhaka: boolean;
  baseChargeDhaka: number;
  baseChargeOutside: number;
  trackingUrlTemplate: string;
}

export interface ReturnPolicySettings {
  allowedDays: number;
  allowRefund: boolean;
  allowExchange: boolean;
  customerCoversReturnFee: boolean;
  policyNotesBn: string;
  policyNotesEn: string;
}

export interface SeoSettings {
  metaTitle: string;
  metaTitleBn: string;
  metaDescription: string;
  metaDescriptionBn: string;
  metaKeywords: string;
  ogImageUrl: string;
}

export interface LiveChatSettings {
  enableFloatingButton: boolean;
  floatingButtonPosition?: 'bottom-right' | 'bottom-left';
  widgetCalloutTextBn: string;
  // AI Sales Agent
  enableAiSalesAgent: boolean;
  aiSalesAgentName: string;
  // WhatsApp Channel
  enableDirectWhatsApp: boolean;
  whatsappNumber: string;
  whatsappMessageTemplate: string;
  // Facebook Messenger Channel
  enableMessenger: boolean;
  messengerPageUrlOrId: string;
  // Direct Call Hotline Channel
  enableDirectCall: boolean;
  callHotlineNumber: string;
  // Live Chat Drawer Channel
  enableLiveChat: boolean;
  agentName: string;
  agentStatusText: string;
  agentAvatarUrl: string;
  liveChatGreetingBn: string;
  liveChatGreetingEn: string;
  supportHours: string;
}

export type MessageChannel = 'livechat' | 'whatsapp' | 'messenger';

export interface UnifiedMessage {
  id: string;
  sender: 'customer' | 'staff' | 'ai';
  senderName: string;
  text: string;
  timestamp: string;
  productId?: string;
  productName?: string;
  productPrice?: number;
  productImage?: string;
}

export interface UnifiedConversation {
  id: string;
  channel: MessageChannel;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  customerAvatar?: string;
  unreadCount: number;
  lastMessage: string;
  lastMessageTime: string;
  messages: UnifiedMessage[];
  status: 'open' | 'resolved' | 'waiting';
}

export interface HomepageSectionConfig {
  showHeroBanner: boolean;
  showCategoryGrid: boolean;
  showFlashSale: boolean;
  showTrending: boolean;
  showNewArrivals: boolean;
  showBestSellers: boolean;
  showShopByBudget: boolean;
  showShopByNeed: boolean;
  showCompleteTheLook: boolean;
  showReviews: boolean;
  showTrustBadges: boolean;
}

export interface OrderSettings {
  autoConfirmOnlinePaid: boolean;
  minOrderValue: number;
  allowCustomerCancelWithinMinutes: number;
  enableSoundNotificationOnNewOrder: boolean;
}

export interface ReviewSettings {
  autoApproveNewReviews: boolean;
  allowImageUploadInReviews: boolean;
  minimumRatingToFeature: number;
}
