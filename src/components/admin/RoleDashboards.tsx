import React, { useState } from 'react';
import {
  TrendingUp,
  ShoppingCart,
  Package,
  AlertTriangle,
  CheckCircle,
  Clock,
  Truck,
  Users,
  DollarSign,
  Phone,
  MessageSquare,
  ShieldCheck,
  Send,
  Eye,
  Settings,
  Sparkles,
  Search,
  ChevronRight,
  Database,
  Tag,
  CreditCard,
  UserCheck,
  Layers,
  BarChart3,
  Lock,
  Unlock,
  Shield,
  ArrowUpRight,
  Check,
  Sliders,
  RefreshCw,
  FileText,
  Building2,
  ExternalLink,
  Trash2,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { UserRole, Order, Product, SystemModule, PermissionAction } from '../../types';

interface RoleDashboardsProps {
  setAdminTab: (tab: any) => void;
  onCallOrder: (order: Order) => void;
  onCourierDispatch: (order: Order) => void;
  onEditOrder: (order: Order) => void;
}

// Module metadata for authorized management modules display
interface ManagementModuleMeta {
  id: string;
  systemModule: SystemModule;
  tabKey: string;
  titleBn: string;
  titleEn: string;
  descriptionBn: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  badgeBg: string;
  badgeText: string;
}

const ALL_SYSTEM_MODULES: ManagementModuleMeta[] = [
  {
    id: 'orders',
    systemModule: 'orders',
    tabKey: 'orders',
    titleBn: 'অর্ডার কনফার্মেশন ও ডেলিভারি হাব',
    titleEn: 'Order Confirmation & Fulfillment Hub',
    descriptionBn: 'নতুন অর্ডারের কল ভেরিফিকেশন, স্ট্যাটাস পরিবর্তন, হোয়াটসঅ্যাপ বার্তা ও কুরিয়ারে হ্যান্ডওভার।',
    icon: ShoppingCart,
    color: 'from-rose-500 to-rose-700',
    badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
    badgeText: 'অর্ডার হাব',
  },
  {
    id: 'livechat',
    systemModule: 'homepage',
    tabKey: 'livechat',
    titleBn: 'লাইভ চ্যাট ও কাস্টমার সাপোর্ট ইনবক্স',
    titleEn: 'Omnichannel Support Inbox',
    descriptionBn: 'ওয়েবসাইট লাইভ চ্যাট, হোয়াটসঅ্যাপ ও মেসেঞ্জারে সরাসরি গ্রাহক সহায়তা ও অনুসন্ধান হ্যান্ডলিং।',
    icon: MessageSquare,
    color: 'from-blue-500 to-indigo-700',
    badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
    badgeText: 'সাপোর্ট ডেস্ক',
  },
  {
    id: 'products',
    systemModule: 'products',
    tabKey: 'products',
    titleBn: 'পণ্য ক্যাটালগ ও মূল্য ব্যবস্থাপনা',
    titleEn: 'Product Catalog & Pricing Management',
    descriptionBn: 'নতুন পণ্য তৈরি, নাম, মূল্য, ডিসকাউন্ট, ছবি আপলোড এবং ক্যাটালগ নিয়ন্ত্রণ।',
    icon: Package,
    color: 'from-indigo-500 to-indigo-700',
    badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    badgeText: 'পণ্য ক্যাটালগ',
  },
  {
    id: 'inventory',
    systemModule: 'products',
    tabKey: 'inventory',
    titleBn: 'ইনভেন্টরি ও ওয়্যারহাউজ স্টক কন্ট্রোল',
    titleEn: 'Warehouse Inventory & Stock Alerts',
    descriptionBn: 'ওয়্যারহাউজের স্টক লেভেল পর্যবেক্ষণ, লো-স্টক জরুরি রি-অর্ডার এবং আউট-অব-স্টক ট্র্যাকিং।',
    icon: AlertTriangle,
    color: 'from-amber-500 to-amber-700',
    badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
    badgeText: 'ওয়্যারহাউজ স্টক',
  },
  {
    id: 'categories',
    systemModule: 'categories',
    tabKey: 'categories',
    titleBn: 'ক্যাটাগরি, সাব-ক্যাটাগরি ও ব্র্যান্ডস',
    titleEn: 'Categories & Subcategories Manager',
    descriptionBn: 'নতুন ক্যাটাগরি তৈরি, ক্যাটাগরি আইকন, ব্র্যান্ড নেম ও ফিল্টার ট্যাগ কনফিগারেশন।',
    icon: Tag,
    color: 'from-teal-500 to-teal-700',
    badgeBg: 'bg-teal-50 text-teal-700 border-teal-200',
    badgeText: 'ক্যাটাগরি হাব',
  },
  {
    id: 'couriers',
    systemModule: 'couriers',
    tabKey: 'couriers',
    titleBn: 'কুরিয়ার এপিআই চালান ও ট্র্যাকিং',
    titleEn: 'Couriers API & Consignment Gateway',
    descriptionBn: 'Steadfast, Pathao ও RedX এপিআই চালানের অটো বুকিং, শিপিং লেবেল প্রিন্ট ও পার্সেল ট্র্যাকিং।',
    icon: Truck,
    color: 'from-emerald-500 to-emerald-700',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    badgeText: 'কুরিয়ার লজিস্টিকস',
  },
  {
    id: 'customers',
    systemModule: 'customers',
    tabKey: 'customers',
    titleBn: 'নিবন্ধিত গ্রাহক ডিরেক্টরি',
    titleEn: 'Customer Directory & Profiles',
    descriptionBn: 'নিবন্ধিত গ্রাহকদের যোগাযোগের তথ্য, অর্ডারের ইতিহাস এবং বিশ্বস্ত গ্রাহক তালিকা।',
    icon: Users,
    color: 'from-cyan-500 to-blue-700',
    badgeBg: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    badgeText: 'গ্রাহক ডাটাবেস',
  },
  {
    id: 'coupons',
    systemModule: 'coupons',
    tabKey: 'coupons',
    titleBn: 'কুপন ও প্রমোশনাল ডিসকাউন্ট অফার',
    titleEn: 'Coupons & Promotional Deals',
    descriptionBn: 'ডিসকাউন্ট কুপন কোড তৈরি, শতাংশ/ফিক্সড ছাড়, ন্যূনতম অর্ডারের সীমা ও ক্যাম্পেইন সময়কাল।',
    icon: Sparkles,
    color: 'from-purple-500 to-purple-700',
    badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
    badgeText: 'প্রমোশন হাব',
  },
  {
    id: 'delivery',
    systemModule: 'couriers',
    tabKey: 'delivery',
    titleBn: 'ডেলিভারি চার্জ ও এরিয়া কনফিগারেশন',
    titleEn: 'Delivery Charges & Area Policies',
    descriptionBn: 'ঢাকা সিটি ও ঢাকার বাইরের ডেলিভারি চার্জ নির্ধারণ, ফ্রি ডেলিভারি সীমা ও এক্সপ্রেস চার্জ।',
    icon: Layers,
    color: 'from-orange-500 to-orange-700',
    badgeBg: 'bg-orange-50 text-orange-700 border-orange-200',
    badgeText: 'ডেলিভারি পলিসি',
  },
  {
    id: 'reports',
    systemModule: 'reports',
    tabKey: 'reports',
    titleBn: 'আর্থিক রাজস্ব ও ব্যবসায়িক অ্যানালিটিক্স',
    titleEn: 'Financial Revenue & Analytics Reports',
    descriptionBn: 'দৈনিক ও মাসিক মোট রাজস্ব, বিক্রয় পরিসংখ্যান, আনুমানিক নিট লাভ ও পেমেন্ট মেথড অ্যানালিটিক্স।',
    icon: BarChart3,
    color: 'from-emerald-600 to-teal-800',
    badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    badgeText: 'আর্থিক প্রতিবেদন',
  },
  {
    id: 'roles',
    systemModule: 'roles',
    tabKey: 'roles',
    titleBn: 'টিম মেম্বার ও আরবিএসি রোল কন্ট্রোল',
    titleEn: 'Team Roles & RBAC Permission Matrix',
    descriptionBn: 'স্টাফ অ্যাকাউন্ট তৈরি, গ্র্যানুলার পারমিশন নির্ধারণ এবং নিরাপদ রোল-বেসড এক্সেস কন্ট্রোল।',
    icon: ShieldCheck,
    color: 'from-slate-700 to-slate-900',
    badgeBg: 'bg-slate-100 text-slate-800 border-slate-300',
    badgeText: 'নিরাপত্তা ও টিম',
  },
  {
    id: 'settings',
    systemModule: 'settings',
    tabKey: 'settings',
    titleBn: 'বিজনেস, পেমেন্ট গেটওয়ে ও ক্লাউড সেটিংস',
    titleEn: 'Payment Gateways & System Master Settings',
    descriptionBn: 'বিকাশ ও নগদ মার্চেন্ট ক্রেডেনশিয়াল, ক্লাউড ফায়ারস্টোর এবং মূল প্ল্যাটফর্ম কনফিগারেশন।',
    icon: Settings,
    color: 'from-rose-600 to-rose-900',
    badgeBg: 'bg-rose-50 text-rose-800 border-rose-200',
    badgeText: 'সিস্টেম কনফিগ',
  },
];

export const RoleDashboards: React.FC<RoleDashboardsProps> = ({
  setAdminTab,
  onCallOrder,
  onCourierDispatch,
  onEditOrder,
}) => {
  const {
    orders,
    products,
    confirmOrder,
    coupons,
    staffAccounts,
    registeredCustomers,
    conversations,
    currentRole,
    adminUser,
    paymentSettings,
    rolePermissions,
    hasPermission,
    formatPrice,
    purgeAllDemoData,
    t,
  } = useShop();

  // Common calculations
  const pendingOrders = orders.filter(o => o.status === 'Pending');
  const confirmedOrders = orders.filter(o => o.status === 'Confirmed');
  const shippedOrders = orders.filter(o => o.status === 'Shipped');
  const deliveredOrders = orders.filter(o => o.status === 'Delivered');
  const lowStockProducts = products.filter(p => p.stock <= p.lowStockThreshold);
  const outOfStockProducts = products.filter(p => p.stock === 0);

  const totalSales = orders.reduce((sum, o) => (o.status !== 'Cancelled' ? sum + o.totalAmount : sum), 0);
  const totalBkashNagadSales = orders
    .filter(o => (o.paymentMethod === 'bkash' || o.paymentMethod === 'nagad') && o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0);
  const totalCodSales = orders
    .filter(o => o.paymentMethod === 'cod' && o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const unreadChatCount = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
  const demoOrderIds = ['ORD-9821', 'ORD-9822', 'ORD-9823', 'ORD-9824', 'ORD-9825', 'JPS-2026-9204', 'JPS-2026-8941', 'JPS-2026-7812'];
  const demoOrdersCount = orders.filter(o => demoOrderIds.includes(o.id) || o.id.startsWith('DEMO-') || ['01819234567', '01711223344', '01912998877'].includes(o.phone.replace(/\D/g, ''))).length;

  // Quick product search state for Staff / front desk lookup
  const [staffProductSearch, setStaffProductSearch] = useState('');
  const [showRestrictedModules, setShowRestrictedModules] = useState(false);

  const searchedStaffProducts = staffProductSearch.trim()
    ? products.filter(
        p =>
          p.name.toLowerCase().includes(staffProductSearch.toLowerCase()) ||
          p.nameBn.includes(staffProductSearch) ||
          p.sku.toLowerCase().includes(staffProductSearch.toLowerCase())
      ).slice(0, 6)
    : products.slice(0, 3);

  // -------------------------------------------------------------
  // DYNAMIC ROLE SPECIFIC CONFIGURATION & BADGES
  // -------------------------------------------------------------
  const getRolePresentation = (role: UserRole) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return {
          titleBn: 'সুপার এডমিন (God Mode)',
          titleEn: 'Super Admin Executive Suite',
          badgeBn: '👑 মাস্টার এক্সেস (God Mode)',
          gradient: 'from-gray-950 via-slate-900 to-rose-950',
          border: 'border-rose-900/40',
          accent: 'bg-rose-600',
          textAccent: 'text-rose-400',
          descBn:
            'আপনার কাছে সমস্ত অর্থনৈতিক প্রতিবেদন, বিকাশ/নগদ মার্চেন্ট পেমেন্ট সেটিংস, কুরিয়ার এপিআই ক্রেডেনশিয়াল, আরবিএসি টিম পারমিশন এবং প্ল্যাটফর্ম পরিচালনার পূর্ণ নিয়ন্ত্রণ রয়েছে।',
        };
      case 'ADMIN':
        return {
          titleBn: 'স্টোর এডমিন',
          titleEn: 'Store Operations & Catalog Admin',
          badgeBn: '🛡️ স্টোর এডমিন (Operations & Catalog)',
          gradient: 'from-slate-900 via-indigo-950 to-rose-950',
          border: 'border-indigo-900/40',
          accent: 'bg-indigo-600',
          textAccent: 'text-indigo-400',
          descBn:
            'আপনার দায়িত্ব: পণ্য ক্যাটালগ নিয়ন্ত্রণ, মূল্য ও স্টক আপডেট, কুপন ও প্রমোশনাল অফার, গ্রাহক ডিরেক্টরি এবং সামগ্রিক স্টোর কার্যক্রম তদারকি। সংবেদনশীল পেমেন্ট এপিআই কি ও স্টাফ পাসওয়ার্ড সুরক্ষিত।',
        };
      case 'MANAGER':
        return {
          titleBn: 'অপারেশন ও লজিস্টিকস ম্যানেজার',
          titleEn: 'Operations & Logistics Manager',
          badgeBn: '📋 অপারেশন ম্যানেজার (Logistics & Inventory)',
          gradient: 'from-emerald-900 via-teal-900 to-slate-950',
          border: 'border-emerald-900/40',
          accent: 'bg-emerald-600',
          textAccent: 'text-emerald-400',
          descBn:
            'আপনার দায়িত্ব: নিশ্চিতকৃত অর্ডারের প্যাকেজিং, চালান ও কুরিয়ারে (Steadfast/Pathao) হস্তান্তর, পার্সেল ট্র্যাকিং এবং ওয়্যারহাউজ স্টক লেভেল নিয়ন্ত্রণ। গোপনীয় আর্থিক আয় ও কাস্টমার তালিকা সুরক্ষিত।',
        };
      case 'STAFF':
      default:
        return {
          titleBn: 'কাস্টমার সাপোর্ট ও কল সেন্টার স্টাফ',
          titleEn: 'Support Desk & Order Verification',
          badgeBn: '💼 সাপোর্ট স্টাফ (Front Desk & Call Queue)',
          gradient: 'from-blue-900 via-indigo-900 to-slate-950',
          border: 'border-blue-900/40',
          accent: 'bg-blue-600',
          textAccent: 'text-blue-400',
          descBn:
            'আপনার দায়িত্ব: নতুন গ্রাহকদের ফোন কল করে অর্ডার তথ্য ও ঠিকানা নিশ্চিতকরণ এবং লাইভ চ্যাট/হোয়াটসঅ্যাপে গ্রাহকদের তাৎক্ষণিক সহায়তা প্রদান। সিস্টেমের সমস্ত প্রশাসনিক ও আর্থিক ডেটা সুরক্ষিত।',
        };
    }
  };

  const roleMeta = getRolePresentation(currentRole);

  // -------------------------------------------------------------
  // DYNAMIC AUTHORIZATION LOGIC
  // -------------------------------------------------------------
  // Filter Authorized vs Restricted Management Modules dynamically based on hasPermission
  const authorizedModules = ALL_SYSTEM_MODULES.filter(mod => {
    return hasPermission(mod.systemModule, 'view');
  });

  const restrictedModules = ALL_SYSTEM_MODULES.filter(mod => {
    return !hasPermission(mod.systemModule, 'view');
  });

  // Calculate dynamic permission label & tags for each authorized module
  const getModulePermissionDetails = (mod: ManagementModuleMeta) => {
    if (currentRole === 'SUPER_ADMIN') {
      return {
        levelLabel: '👑 পূর্ণ মাস্টার কন্ট্রোল',
        levelClass: 'bg-rose-100 text-rose-800 border-rose-200',
        allowedActions: ['ভিউ', 'তৈরি', 'এডিট', 'ডিলিট', 'অনুমোদন', 'মাস্টার'],
      };
    }

    const actions = rolePermissions[currentRole]?.[mod.systemModule] || [];

    if (actions.includes('manage') || (actions.includes('create') && actions.includes('edit') && actions.includes('delete'))) {
      return {
        levelLabel: '⚡ সম্পূর্ণ ব্যবস্থাপনা',
        levelClass: 'bg-indigo-100 text-indigo-800 border-indigo-200',
        allowedActions: actions.map(translateAction),
      };
    }

    if (actions.includes('create') || actions.includes('edit')) {
      return {
        levelLabel: '✏️ তৈরি ও পরিবর্তন',
        levelClass: 'bg-blue-100 text-blue-800 border-blue-200',
        allowedActions: actions.map(translateAction),
      };
    }

    if (actions.includes('approve')) {
      return {
        levelLabel: '🚚 অপারেশন ও অনুমোদন',
        levelClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        allowedActions: actions.map(translateAction),
      };
    }

    return {
      levelLabel: '👁️ ভিউ-অনলি এক্সেস',
      levelClass: 'bg-gray-100 text-gray-700 border-gray-200',
      allowedActions: actions.length > 0 ? actions.map(translateAction) : ['ভিউ'],
    };
  };

  function translateAction(action: PermissionAction): string {
    switch (action) {
      case 'view':
        return 'ভিউ';
      case 'create':
        return 'তৈরি';
      case 'edit':
        return 'এডিট';
      case 'delete':
        return 'ডিলিট';
      case 'approve':
        return 'অনুমোদন';
      case 'export':
        return 'এক্সপোর্ট';
      case 'manage':
        return 'মাস্টার';
      default:
        return action;
    }
  }

  // Live stat counter for each module card
  const getModuleLiveCounter = (mod: ManagementModuleMeta): string => {
    switch (mod.id) {
      case 'orders':
        return `${pendingOrders.length}টি কল পেন্ডিং • মোট ${orders.length}টি`;
      case 'products':
        return `${products.length}টি ক্যাটালগ পণ্য`;
      case 'inventory':
        return `${lowStockProducts.length}টি জরুরি রি-স্টক অ্যালার্ট`;
      case 'categories':
        return 'সকল ক্যাটাগরি ও ব্র্যান্ড সক্রিয়';
      case 'couriers':
        return `${shippedOrders.length}টি পার্সেল কুরিয়ারে ট্রানজিটে`;
      case 'customers':
        return `${registeredCustomers.length} জন নিবন্ধিত গ্রাহক`;
      case 'coupons':
        return `${coupons.length}টি সক্রিয় কুপন ক্যাম্পেইন`;
      case 'livechat':
        return unreadChatCount > 0 ? `${unreadChatCount}টি অপঠিত বার্তা!` : 'ইনবক্স আপ-টু-ডেট';
      case 'delivery':
        return 'ঢাকা ও সারা বাংলাদেশ চার্জ কনফিগ';
      case 'reports':
        return `মোট রাজস্ব: ${formatPrice(totalSales)}`;
      case 'roles':
        return `${staffAccounts.length} জন টিম একাউন্ট সক্রিয়`;
      case 'settings':
        return 'ফায়ারস্টোর ও মার্চেন্ট গেটওয়ে সক্রিয়';
      default:
        return 'সক্রিয় মডিউল';
    }
  };

  // -------------------------------------------------------------
  // DYNAMIC STATISTIC / KPI CARDS DEFINITIONS
  // Filtered strictly by hasPermission(card.systemModule, 'view')
  // -------------------------------------------------------------
  interface DynamicStatCard {
    id: string;
    systemModule: SystemModule;
    labelBn: string;
    labelEn: string;
    value: string;
    subtext: string;
    icon: React.ComponentType<{ className?: string }>;
    accentColor: string;
    badgeText?: string;
    targetTab?: string;
    priorityRole?: UserRole[];
  }

  const ALL_STAT_CARDS: DynamicStatCard[] = [
    // Financial / Revenue statistics (Only visible if authorized for reports, e.g. SUPER_ADMIN, and ADMIN if allowed)
    {
      id: 'gross_revenue',
      systemModule: 'reports',
      labelBn: 'মোট সর্বমোট রাজস্ব (Gross Revenue)',
      labelEn: 'Total Gross Revenue',
      value: formatPrice(totalSales),
      subtext: 'সকল নিশ্চিত ও ডেলিভারিকৃত বিক্রয় আয়',
      icon: DollarSign,
      accentColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      badgeText: '↑ ১৫% চলতি মাস',
      targetTab: 'reports',
      priorityRole: ['SUPER_ADMIN', 'ADMIN'],
    },
    {
      id: 'net_profit',
      systemModule: 'reports',
      labelBn: 'আনুমানিক নিট লাভ (~২৫% মার্জিন)',
      labelEn: 'Estimated Net Profit',
      value: formatPrice(Math.round(totalSales * 0.25)),
      subtext: 'কুরিয়ার ডেলিভারি ও পণ্য ক্রয় খরচ বাদে',
      icon: TrendingUp,
      accentColor: 'text-amber-700 bg-amber-50 border-amber-200',
      badgeText: 'আনুমানিক লাভ',
      targetTab: 'reports',
      priorityRole: ['SUPER_ADMIN'],
    },
    {
      id: 'digital_payments',
      systemModule: 'reports',
      labelBn: 'ডিজিটাল পেমেন্ট (bKash ও Nagad)',
      labelEn: 'Digital Payments',
      value: formatPrice(totalBkashNagadSales),
      subtext: `ক্যাশ অন ডেলিভারি (COD): ${formatPrice(totalCodSales)}`,
      icon: CreditCard,
      accentColor: 'text-pink-700 bg-pink-50 border-pink-200',
      badgeText: 'বিকাশ/নগদ মার্চেন্ট',
      targetTab: 'reports',
      priorityRole: ['SUPER_ADMIN'],
    },

    // Order Fulfillment & Workflow statistics (Visible if authorized for orders)
    {
      id: 'pending_orders',
      systemModule: 'orders',
      labelBn: 'কল ভেরিফিকেশন অপেক্ষমান (Pending)',
      labelEn: 'Pending Verification Queue',
      value: `${pendingOrders.length} টি`,
      subtext: 'নতুন অর্ডারে ফোন দিয়ে কনফার্মেশন সম্পন্ন করুন',
      icon: Phone,
      accentColor: 'text-amber-700 bg-amber-50 border-amber-200',
      badgeText: pendingOrders.length > 0 ? 'জরুরি কল প্রয়োজন' : 'সব কল সম্পন্ন',
      targetTab: 'orders',
      priorityRole: ['STAFF', 'ADMIN', 'SUPER_ADMIN'],
    },
    {
      id: 'confirmed_orders',
      systemModule: 'orders',
      labelBn: 'প্যাকিং ও কুরিয়ার হ্যান্ডওভার প্রস্তুত',
      labelEn: 'Confirmed & Packing Ready',
      value: `${confirmedOrders.length} টি`,
      subtext: 'চালান তৈরি ও কুরিয়ারে (Steadfast/Pathao) হস্তান্তর',
      icon: CheckCircle,
      accentColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      badgeText: 'ডিসপ্যাচ প্রস্তুত',
      targetTab: 'orders',
      priorityRole: ['MANAGER', 'ADMIN', 'SUPER_ADMIN'],
    },
    {
      id: 'shipped_orders',
      systemModule: 'couriers',
      labelBn: 'কুরিয়ারে ট্রানজিট (On The Way)',
      labelEn: 'In-Transit Consignments',
      value: `${shippedOrders.length} টি`,
      subtext: 'কুরিয়ার হাবে ডেলিভারির জন্য অন-দ্য-ওয়ে আছে',
      icon: Truck,
      accentColor: 'text-blue-700 bg-blue-50 border-blue-200',
      badgeText: 'স্টেডফাস্ট ও পাঠাও',
      targetTab: 'couriers',
      priorityRole: ['MANAGER', 'ADMIN', 'SUPER_ADMIN'],
    },
    {
      id: 'delivered_orders',
      systemModule: 'orders',
      labelBn: 'সফল ডেলিভারি সম্পন্ন (Delivered)',
      labelEn: 'Successfully Delivered',
      value: `${deliveredOrders.length} টি`,
      subtext: 'কাস্টমার রিসিভ করেছেন এবং ক্যাশ আদায় সম্পন্ন',
      icon: Package,
      accentColor: 'text-purple-700 bg-purple-50 border-purple-200',
      badgeText: '৯৮% সাকসেস রেট',
      targetTab: 'orders',
      priorityRole: ['MANAGER', 'ADMIN', 'SUPER_ADMIN'],
    },

    // Product & Warehouse Inventory statistics (Visible if authorized for products)
    {
      id: 'catalog_products',
      systemModule: 'products',
      labelBn: 'মোট সক্রিয় ক্যাটালগ পণ্য',
      labelEn: 'Total Catalog Products',
      value: `${products.length} টি`,
      subtext: outOfStockProducts.length > 0 ? `${outOfStockProducts.length}টি স্টক শেষ` : 'সব পণ্য স্টকে আছে',
      icon: Package,
      accentColor: 'text-indigo-700 bg-indigo-50 border-indigo-200',
      badgeText: 'লাইভ শপ',
      targetTab: 'products',
      priorityRole: ['ADMIN', 'SUPER_ADMIN', 'STAFF'],
    },
    {
      id: 'low_stock_urgent',
      systemModule: 'products',
      labelBn: 'জরুরি লো-স্টক রি-স্টক অ্যালার্ট',
      labelEn: 'Urgent Low Stock Alerts',
      value: `${lowStockProducts.length} টি পণ্য`,
      subtext: 'স্টক ন্যূনতম সীমার নিচে নেমে গেছে',
      icon: AlertTriangle,
      accentColor: 'text-rose-700 bg-rose-50 border-rose-200',
      badgeText: lowStockProducts.length > 0 ? 'রি-স্টক প্রয়োজন' : 'পর্যাপ্ত স্টক',
      targetTab: 'inventory',
      priorityRole: ['MANAGER', 'ADMIN', 'SUPER_ADMIN'],
    },

    // Customer Support inquiries (Visible if authorized for livechat/homepage)
    {
      id: 'unread_chats',
      systemModule: 'homepage',
      labelBn: 'অপঠিত কাস্টমার হেল্পডেস্ক চ্যাট',
      labelEn: 'Unread Customer Inquiries',
      value: `${unreadChatCount} টি`,
      subtext: 'ওয়েবসাইট লাইভ চ্যাট ও গ্রাহক সহায়তা ইনবক্স',
      icon: MessageSquare,
      accentColor: 'text-teal-700 bg-teal-50 border-teal-200',
      badgeText: unreadChatCount > 0 ? 'উত্তরের অপেক্ষায়' : 'সব ক্লিয়ার',
      targetTab: 'livechat',
      priorityRole: ['STAFF', 'ADMIN', 'SUPER_ADMIN'],
    },

    // Registered Customer directory (Visible if authorized for customers)
    {
      id: 'registered_customers',
      systemModule: 'customers',
      labelBn: 'নিবন্ধিত কাস্টমার অ্যাকাউন্টস',
      labelEn: 'Registered Customers',
      value: `${registeredCustomers.length} জন`,
      subtext: 'সুরক্ষিত গ্রাহক যোগাযোগের ফোন নম্বর ও ডাটাবেস',
      icon: Users,
      accentColor: 'text-cyan-700 bg-cyan-50 border-cyan-200',
      badgeText: 'গ্রাহক ডিরেক্টরি',
      targetTab: 'customers',
      priorityRole: ['ADMIN', 'SUPER_ADMIN'],
    },

    // Active Marketing Coupons (Visible if authorized for coupons)
    {
      id: 'active_coupons',
      systemModule: 'coupons',
      labelBn: 'সক্রিয় প্রমোশনাল কুপন কোড',
      labelEn: 'Active Promo Coupons',
      value: `${coupons.length} টি`,
      subtext: 'গ্রাহকদের জন্য বিশেষ ডিসকাউন্ট ক্যাম্পেইন চালু',
      icon: Tag,
      accentColor: 'text-fuchsia-700 bg-fuchsia-50 border-fuchsia-200',
      badgeText: 'মার্কেটিং অফার',
      targetTab: 'coupons',
      priorityRole: ['ADMIN', 'SUPER_ADMIN'],
    },

    // Security & Team Staff Accounts (Visible if authorized for roles, e.g. SUPER_ADMIN)
    {
      id: 'team_accounts',
      systemModule: 'roles',
      labelBn: 'সক্রিয় টিম ও স্টাফ একাউন্ট',
      labelEn: 'Active Team & RBAC Staff',
      value: `${staffAccounts.length} জন`,
      subtext: 'আরবিএসি মাল্টি-রোল পারমিশন ম্যাট্রিক্স সক্রিয়',
      icon: UserCheck,
      accentColor: 'text-slate-800 bg-slate-100 border-slate-300',
      badgeText: 'আরবিএসি সিকিউরিটি',
      targetTab: 'roles',
      priorityRole: ['SUPER_ADMIN'],
    },

    // System Settings & Infrastructure (Visible if authorized for settings, e.g. SUPER_ADMIN)
    {
      id: 'system_settings',
      systemModule: 'settings',
      labelBn: 'ক্লাউড ডেটাবেস ও গেটওয়ে স্ট্যাটাস',
      labelEn: 'Cloud Database & Gateway Health',
      value: 'সব সক্রিয় (100%)',
      subtext: 'ফায়ারস্টোর ক্লাউড ও পেমেন্ট এপিআই সংযুক্ত',
      icon: Database,
      accentColor: 'text-emerald-800 bg-emerald-50 border-emerald-300',
      badgeText: 'ফায়ারস্টোর লাইভ',
      targetTab: 'settings',
      priorityRole: ['SUPER_ADMIN'],
    },
  ];

  // DYNAMIC FILTER: Keep only statistics cards that the user is authorized to view!
  const authorizedStatCards = ALL_STAT_CARDS.filter(card => {
    return hasPermission(card.systemModule, 'view');
  });

  return (
    <div className="space-y-6">
      {/* ============================================================= */}
      {/* 1. DYNAMIC ROLE HEADER BANNER & AUTHORIZATION OVERVIEW       */}
      {/* ============================================================= */}
      <div
        className={`bg-gradient-to-r ${roleMeta.gradient} rounded-3xl p-6 sm:p-7 text-white shadow-xl border ${roleMeta.border} space-y-5`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center space-x-1.5 bg-white/20 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-black text-white shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{roleMeta.badgeBn}</span>
              </span>
              <span className="inline-flex items-center space-x-1 bg-black/30 backdrop-blur-xs px-2.5 py-1 rounded-full text-[11px] font-bold text-gray-200">
                <span>অনুমোদিত মডিউল:</span>
                <span className="text-white font-black">{authorizedModules.length}টি</span>
              </span>
              <span className="inline-flex items-center space-x-1 bg-black/30 backdrop-blur-xs px-2.5 py-1 rounded-full text-[11px] font-bold text-gray-200">
                <span>অনুমোদিত মেট্রিক:</span>
                <span className="text-white font-black">{authorizedStatCards.length}টি</span>
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              স্বাগতম, {adminUser?.name || 'টিম মেম্বার'}!
            </h2>
            <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
              {roleMeta.descBn}
            </p>
          </div>

          {/* Quick Dynamic Module Jump / Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
            {hasPermission('orders', 'view') && (
              <button
                onClick={() => setAdminTab('orders')}
                className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-3.5 py-2.5 rounded-2xl flex items-center space-x-1.5 cursor-pointer backdrop-blur-xs transition-colors border border-white/20"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>অর্ডার হাব ({pendingOrders.length})</span>
              </button>
            )}

            {hasPermission('couriers', 'view') && (
              <button
                onClick={() => setAdminTab('couriers')}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-3.5 py-2.5 rounded-2xl flex items-center space-x-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>কুরিয়ার চালান ({confirmedOrders.length})</span>
              </button>
            )}

            {hasPermission('roles', 'view') && (
              <button
                onClick={() => setAdminTab('roles')}
                className="bg-amber-500 hover:bg-amber-600 text-gray-950 font-black text-xs px-3.5 py-2.5 rounded-2xl flex items-center space-x-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>টিম রোল ও পারমিশন</span>
              </button>
            )}

            {hasPermission('settings', 'view') && (
              <button
                onClick={() => setAdminTab('settings')}
                className="bg-rose-600 hover:bg-rose-700 text-white font-black text-xs px-3.5 py-2.5 rounded-2xl flex items-center space-x-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>পেমেন্ট ও সেটিংস</span>
              </button>
            )}
          </div>
        </div>

        {/* Secure Session Info */}
        <div className="pt-3 border-t border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-2 text-gray-300">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold text-[11px]">
              নিরাপদ লগইন সেশন: <strong className="text-white font-mono">{adminUser?.email || adminUser?.name || 'লগইনকৃত ব্যবহারকারী'}</strong>
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[10px] bg-white/10 text-gray-200 px-3 py-1 rounded-full font-bold">
              আরবিএসি এক্সেস পলিসি কার্যকর • {roleMeta.badgeBn}
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================= */}
      {/* 2. DYNAMIC ROLE-BASED STATISTICS CARDS (AUTHORIZED METRICS)   */}
      {/* ============================================================= */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-black text-base text-gray-900 flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-rose-600" />
              <span>অনুমোদিত লাইভ পরিসংখ্যান ({authorizedStatCards.length}টি দৃশ্যমান মেট্রিক)</span>
            </h3>
            <p className="text-xs text-gray-500">
              আপনার ভূমিকা ({roleMeta.titleBn}) অনুযায়ী শুধুমাত্র অনুমোদিত মডিউলসমূহের পরিসংখ্যান প্রদর্শিত হচ্ছে।
            </p>
          </div>

          <div className="text-[11px] font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full self-start sm:self-auto flex items-center space-x-1">
            <Lock className="w-3 h-3 text-gray-400" />
            <span>
              অননুমোদিত সংরক্ষিত মেট্রিক লুকানো: {ALL_STAT_CARDS.length - authorizedStatCards.length}টি
            </span>
          </div>
        </div>

        {/* Dynamic Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {authorizedStatCards.map(card => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                onClick={() => card.targetTab && setAdminTab(card.targetTab)}
                className={`bg-white rounded-3xl p-5 border shadow-xs transition-all hover:shadow-md ${
                  card.targetTab ? 'cursor-pointer hover:border-rose-300 group' : ''
                } ${card.accentColor.split(' ')[2] || 'border-gray-200'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500 truncate mr-2">
                    {card.labelBn}
                  </span>
                  <div
                    className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${card.accentColor}`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">{card.value}</h3>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-gray-500 truncate mr-1">{card.subtext}</span>
                    {card.badgeText && (
                      <span className="font-bold text-[10px] px-2 py-0.5 rounded-full shrink-0 bg-gray-100 text-gray-700">
                        {card.badgeText}
                      </span>
                    )}
                  </div>
                </div>

                {card.targetTab && (
                  <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-[10px] font-bold text-gray-400 group-hover:text-rose-600 transition-colors">
                    <span>মডিউল খুলুন</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ============================================================= */}
      {/* 3. DYNAMIC AUTHORIZED MANAGEMENT MODULES GRID                 */}
      {/* ============================================================= */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-extrabold text-base text-gray-900">
                অনুমোদিত ম্যানেজমেন্ট মডিউলসমূহ ({authorizedModules.length}টি মডিউলে এক্সেস অনুমোদিত)
              </h3>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                সক্রিয়
              </span>
            </div>
            <p className="text-xs text-gray-500">
              আপনার রোল ({roleMeta.titleBn}) যে যে ব্যবস্থাপনা মডিউলগুলো দেখার ও পরিচালনার অনুমোদন রাখে, সেগুলো নিচে তালিকাভুক্ত।
            </p>
          </div>

          <button
            onClick={() => setShowRestrictedModules(!showRestrictedModules)}
            className="text-xs font-bold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3.5 py-1.5 rounded-xl flex items-center space-x-1.5 cursor-pointer self-start sm:self-auto transition-colors"
          >
            <Lock className="w-3.5 h-3.5 text-gray-500" />
            <span>
              {showRestrictedModules
                ? 'লককৃত মডিউল লুকান'
                : `লককৃত সংরক্ষিত মডিউল দেখুন (${restrictedModules.length}টি)`}
            </span>
          </button>
        </div>

        {/* Authorized Modules Dynamic Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {authorizedModules.map(mod => {
            const Icon = mod.icon;
            const details = getModulePermissionDetails(mod);
            const liveCount = getModuleLiveCounter(mod);

            return (
              <div
                key={mod.id}
                className="rounded-2xl border border-gray-200 p-4.5 bg-gray-50/50 hover:bg-white hover:border-rose-200 hover:shadow-md transition-all flex flex-col justify-between space-y-3 group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-2.5">
                      <div
                        className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${mod.color} text-white flex items-center justify-center shadow-xs shrink-0`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-sm text-gray-900 group-hover:text-rose-600 transition-colors truncate">
                          {mod.titleBn}
                        </h4>
                        <span className="text-[10px] font-mono text-gray-400 block truncate">
                          {mod.titleEn}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full border shrink-0 ${details.levelClass}`}
                    >
                      {details.levelLabel}
                    </span>
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                    {mod.descriptionBn}
                  </p>

                  {/* Live Status indicator */}
                  <div className="text-[11px] font-bold text-gray-700 bg-white border border-gray-100 rounded-xl px-2.5 py-1.5 flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    <span className="truncate">{liveCount}</span>
                  </div>

                  {/* Allowed Action Badges */}
                  <div className="flex flex-wrap items-center gap-1 pt-1">
                    <span className="text-[10px] font-bold text-gray-400 mr-1">অনুমোদিত একশন:</span>
                    {details.allowedActions.map((action, i) => (
                      <span
                        key={i}
                        className="text-[9px] font-black bg-gray-200 text-gray-800 px-1.5 py-0.5 rounded"
                      >
                        {action}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Direct Action Button */}
                <button
                  onClick={() => setAdminTab(mod.tabKey)}
                  className="w-full mt-2 bg-white hover:bg-rose-600 text-gray-900 hover:text-white border border-gray-200 hover:border-rose-600 font-extrabold text-xs py-2 px-3 rounded-xl flex items-center justify-center space-x-1.5 transition-colors cursor-pointer shadow-xs group-hover:bg-rose-600 group-hover:text-white group-hover:border-rose-600"
                >
                  <span>মডিউলে প্রবেশ করুন</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Collapsible / Expandable Restricted Modules List */}
        {showRestrictedModules && (
          <div className="pt-4 border-t border-gray-200 space-y-3 bg-gray-50/70 p-4 rounded-2xl">
            <div className="flex items-center space-x-2">
              <Lock className="w-4 h-4 text-amber-600" />
              <h4 className="font-extrabold text-sm text-gray-900">
                আপনার ভূমিকার জন্য সংরক্ষিত ও লককৃত মডিউলসমূহ ({restrictedModules.length}টি)
              </h4>
            </div>
            <p className="text-xs text-gray-500">
              নিরাপত্তা নীতি (Strict RBAC Standards) অনুযায়ী এই মডিউলগুলো আপনার বর্তমান ভূমিকার জন্য ব্লক করা আছে। প্রয়োজন হলে সুপার এডমিনের সাথে যোগাযোগ করুন।
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {restrictedModules.map(mod => {
                const Icon = mod.icon;
                return (
                  <div
                    key={mod.id}
                    className="p-3 bg-white rounded-xl border border-gray-200 flex items-center space-x-2.5 opacity-70"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-400 flex items-center justify-center shrink-0">
                      <Lock className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-xs text-gray-700 block truncate">{mod.titleBn}</span>
                      <span className="text-[10px] text-rose-600 font-bold block">লকড (সংরক্ষিত)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ============================================================= */}
      {/* 4. ROLE-SPECIFIC HIGH-PRODUCTIVITY WORKSPACE                  */}
      {/* ============================================================= */}

      {/* 4A. STAFF WORKSPACE: Call Queue & Instant Product Check */}
      {currentRole === 'STAFF' && (
        <div className="space-y-6">
          {/* Priority 1: Customer Phone Call Queue */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-gray-900 flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-rose-600 animate-pulse" />
                  <span>জরুরি কাস্টমার কল ভেরিফিকেশন কিউ</span>
                </h3>
                <p className="text-xs text-gray-500">
                  নতুন অর্ডারের গ্রাহকদের ফোন দিন, ঠিকানা যাচাই করুন এবং 'কনফার্ম' ক্লিক করুন
                </p>
              </div>
              <button
                onClick={() => setAdminTab('orders')}
                className="text-xs font-bold text-rose-600 hover:underline flex items-center space-x-1 cursor-pointer"
              >
                <span>সব অর্ডার দেখুন</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {pendingOrders.length === 0 ? (
              <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 space-y-2">
                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="text-sm font-bold text-gray-700">সব গ্রাহকের কল সম্পন্ন হয়েছে!</p>
                <p className="text-xs text-gray-400">এই মুহূর্তে কোনো পেন্ডিং অর্ডার নেই। নতুন অর্ডার আসলে অ্যালার্ট পাবেন।</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
                {pendingOrders.slice(0, 5).map(o => (
                  <div
                    key={o.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/70 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-black text-xs text-gray-900">#{o.id}</span>
                        <span className="font-bold text-sm text-gray-900">{o.customerName}</span>
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                          কল পেন্ডিং
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
                        <a
                          href={`tel:${o.phone}`}
                          className="font-mono font-bold text-blue-600 hover:underline flex items-center space-x-1 bg-blue-50 px-2 py-0.5 rounded-lg"
                        >
                          <Phone className="w-3 h-3 text-blue-600" />
                          <span>{o.phone}</span>
                        </a>
                        <span className="text-gray-400">•</span>
                        <span>
                          {o.address.area}, {o.address.district}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="font-bold text-rose-600">{formatPrice(o.totalAmount)}</span>
                        <span className="text-gray-400">•</span>
                        <span className="uppercase text-[10px] font-bold bg-gray-100 px-1.5 py-0.5 rounded">
                          {o.paymentMethod}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => onCallOrder(o)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center space-x-1.5 cursor-pointer shadow-xs transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>কল নোট ও রেকর্ড</span>
                      </button>
                      <button
                        onClick={() => confirmOrder(o.id, `${adminUser?.name || 'স্টাফ'} (Staff)`)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center space-x-1.5 cursor-pointer shadow-xs transition-colors"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>কনফার্ম করুন</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Priority 2: Instant Stock & Price Lookup for Customer Call Assistance */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-extrabold text-base text-gray-900 flex items-center space-x-2">
                  <Search className="w-4 h-4 text-indigo-600" />
                  <span>তাৎক্ষণিক স্টক ও পণ্যের মূল্য চেকার (Call Desk Tool)</span>
                </h3>
                <p className="text-xs text-gray-500">
                  গ্রাহক ফোনে কোনো পণ্যের স্টক বা দাম জানতে চাইলে সাথে সাথে পণ্যের নাম লিখুন
                </p>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={staffProductSearch}
                  onChange={e => setStaffProductSearch(e.target.value)}
                  placeholder="পণ্যের নাম বা SKU..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-3 py-1.5 text-xs focus:bg-white focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {searchedStaffProducts.map(p => (
                <div
                  key={p.id}
                  className="p-3.5 rounded-2xl border border-gray-100 bg-gray-50/50 flex items-center space-x-3"
                >
                  <img
                    src={p.images?.[0] || ''}
                    alt={p.name}
                    className="w-12 h-12 rounded-xl object-cover border border-gray-200 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-xs text-gray-900 truncate">{p.nameBn || p.name}</h4>
                    <p className="text-[10px] text-gray-400 font-mono">SKU: {p.sku}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="font-black text-xs text-rose-600">{formatPrice(p.price)}</span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          p.stock <= p.lowStockThreshold
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        স্টক: {p.stock} pcs
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4B. MANAGER WORKSPACE: Logistics Dispatch & Warehouse Alerts */}
      {currentRole === 'MANAGER' && (
        <div className="space-y-6">
          {/* Dispatch Pipeline Queue */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-gray-900 flex items-center space-x-2">
                  <Truck className="w-4 h-4 text-emerald-600" />
                  <span>কুরিয়ার হ্যান্ডওভার ও চালান ডিসপ্যাচ কিউ</span>
                </h3>
                <p className="text-xs text-gray-500">
                  এই অর্ডারগুলো কনফার্ম করা হয়েছে, কুরিয়ারে বুকিং দিয়ে ট্র্যাকিং আইডি বসান
                </p>
              </div>
              <button
                onClick={() => setAdminTab('orders')}
                className="text-xs font-bold text-emerald-700 hover:underline flex items-center space-x-1 cursor-pointer"
              >
                <span>সব চালান দেখুন</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {confirmedOrders.length === 0 ? (
              <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 space-y-2">
                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="text-sm font-bold text-gray-700">কুরিয়ারে পাঠানোর মতো কোনো পেন্ডিং অর্ডার নেই!</p>
                <p className="text-xs text-gray-400">নতুন নিশ্চিতকৃত অর্ডার আসলে এখানে প্রদর্শিত হবে।</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
                {confirmedOrders.slice(0, 5).map(o => (
                  <div
                    key={o.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/70 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-black text-xs text-gray-900">#{o.id}</span>
                        <span className="font-bold text-sm text-gray-900">{o.customerName}</span>
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                          কনফার্মড • প্যাকিং প্রস্তুত
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
                        <span className="font-bold text-gray-800">{o.items.length}টি আইটেম</span>
                        <span className="text-gray-400">•</span>
                        <span>
                          {o.address.area}, {o.address.district}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="font-bold text-rose-600">{formatPrice(o.totalAmount)}</span>
                        <span className="text-gray-400">•</span>
                        <span className="bg-blue-50 text-blue-700 font-bold px-1.5 py-0.5 rounded text-[10px]">
                          কুরিয়ার: {o.courier || 'অনির্ধারিত'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => onCourierDispatch(o)}
                        className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center space-x-1.5 cursor-pointer shadow-xs transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>কুরিয়ারে পাঠান</span>
                      </button>
                      <button
                        onClick={() => onEditOrder(o)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs px-3 py-2 rounded-xl cursor-pointer transition-colors"
                      >
                        এডিট
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Manager Low Stock Urgent Alerts */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-gray-900 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>জরুরি রি-স্টক অ্যালার্ট (ইনভেন্টরি স্বাস্থ্য)</span>
              </h3>
              <button
                onClick={() => setAdminTab('inventory')}
                className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
              >
                সব লো-স্টক পণ্য দেখুন →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {lowStockProducts.slice(0, 6).map(p => (
                <div
                  key={p.id}
                  className="p-3.5 bg-rose-50/50 border border-rose-200 rounded-2xl flex items-center space-x-3"
                >
                  <img
                    src={p.images?.[0] || ''}
                    alt={p.name}
                    className="w-12 h-12 rounded-xl object-cover border border-rose-200 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-xs text-gray-900 truncate">{p.nameBn || p.name}</h4>
                    <p className="text-[10px] text-gray-400 font-mono">SKU: {p.sku}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] text-gray-500">মূল্য: {formatPrice(p.price)}</span>
                      <span className="font-black text-xs text-rose-600 bg-white px-2 py-0.5 rounded-md border border-rose-200">
                        অবশিষ্ট: {p.stock} pcs
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4C. ADMIN WORKSPACE: Store Orders & Fast Operations */}
      {currentRole === 'ADMIN' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-gray-900">সাম্প্রতিক অর্ডার ও স্টোর কার্যকলাপ</h3>
              <button
                onClick={() => setAdminTab('orders')}
                className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
              >
                সব অর্ডার →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 border-b border-gray-200 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Order ID</th>
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3">Items</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.slice(0, 5).map(o => (
                    <tr key={o.id} className="hover:bg-gray-50/50">
                      <td className="py-2.5 px-3 font-mono font-bold text-gray-900">#{o.id}</td>
                      <td className="py-2.5 px-3 font-semibold">{o.customerName}</td>
                      <td className="py-2.5 px-3 text-gray-500">{o.items.length}টি</td>
                      <td className="py-2.5 px-3 font-bold text-rose-600">{formatPrice(o.totalAmount)}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            o.status === 'Delivered'
                              ? 'bg-purple-100 text-purple-700'
                              : o.status === 'Shipped'
                              ? 'bg-blue-100 text-blue-700'
                              : o.status === 'Confirmed'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => onEditOrder(o)}
                          className="text-gray-500 hover:text-blue-600 font-bold text-xs cursor-pointer p-1"
                        >
                          বিস্তারিত
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-xs space-y-3">
              <h4 className="font-extrabold text-sm text-gray-900">এডমিন দ্রুত অ্যাকশন</h4>
              <div className="space-y-2">
                <button
                  onClick={() => setAdminTab('products')}
                  className="w-full text-left p-3 rounded-2xl bg-gray-50 hover:bg-rose-50 border border-gray-100 hover:border-rose-200 transition-colors flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center space-x-2.5">
                    <Package className="w-4 h-4 text-gray-500 group-hover:text-rose-600" />
                    <span className="text-xs font-bold text-gray-800">পণ্য তালিকা ও স্টক পরিবর্তন</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-rose-600" />
                </button>
                <button
                  onClick={() => setAdminTab('categories')}
                  className="w-full text-left p-3 rounded-2xl bg-gray-50 hover:bg-rose-50 border border-gray-100 hover:border-rose-200 transition-colors flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center space-x-2.5">
                    <Tag className="w-4 h-4 text-gray-500 group-hover:text-rose-600" />
                    <span className="text-xs font-bold text-gray-800">ক্যাটাগরি ও ব্র্যান্ডস</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-rose-600" />
                </button>
                <button
                  onClick={() => setAdminTab('customers')}
                  className="w-full text-left p-3 rounded-2xl bg-gray-50 hover:bg-rose-50 border border-gray-100 hover:border-rose-200 transition-colors flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center space-x-2.5">
                    <Users className="w-4 h-4 text-gray-500 group-hover:text-rose-600" />
                    <span className="text-xs font-bold text-gray-800">গ্রাহক ডিরেক্টরি</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-rose-600" />
                </button>
                <button
                  onClick={() => setAdminTab('coupons')}
                  className="w-full text-left p-3 rounded-2xl bg-gray-50 hover:bg-rose-50 border border-gray-100 hover:border-rose-200 transition-colors flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center space-x-2.5">
                    <Sparkles className="w-4 h-4 text-gray-500 group-hover:text-rose-600" />
                    <span className="text-xs font-bold text-gray-800">নতুন কুপন কোড তৈরি</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-rose-600" />
                </button>
                <button
                  onClick={() => setAdminTab('bundles')}
                  className="w-full text-left p-3 rounded-2xl bg-gray-50 hover:bg-rose-50 border border-gray-100 hover:border-rose-200 transition-colors flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center space-x-2.5">
                    <Sparkles className="w-4 h-4 text-amber-500 group-hover:text-amber-600" />
                    <span className="text-xs font-bold text-gray-800">কম্বো ও বান্ডেল অফার (Complete The Look)</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-rose-600" />
                </button>
                <button
                  onClick={() => setAdminTab('occasions')}
                  className="w-full text-left p-3 rounded-2xl bg-gray-50 hover:bg-rose-50 border border-gray-100 hover:border-rose-200 transition-colors flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center space-x-2.5">
                    <Package className="w-4 h-4 text-indigo-500 group-hover:text-indigo-600" />
                    <span className="text-xs font-bold text-gray-800">উপলক্ষ কিউরেটেড কালেকশন (Shop By Need)</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-rose-600" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4D. SUPER ADMIN WORKSPACE: Financial Ledger & Infrastructure */}
      {currentRole === 'SUPER_ADMIN' && (
        <div className="space-y-6">
          {/* Platform Infrastructure & System Health Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900 rounded-3xl p-5 text-white border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-gray-400">Firebase Firestore</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <h4 className="text-base font-extrabold text-emerald-400">লাইভ ক্লাউড ডেটাবেস সক্রিয়</h4>
              <p className="text-[11px] text-gray-400">
                ব্র্যান্ডিং, ক্যাটালগ ক্যাটাগরি ও ব্যানার রিয়েলটাইমে গুগল ফায়ারস্টোর ক্লাউডে সংরক্ষিত হচ্ছে।
              </p>
            </div>

            <div className="bg-slate-900 rounded-3xl p-5 text-white border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-gray-400">Payment Gateways</span>
                <span className="text-[10px] font-bold bg-pink-500/20 text-pink-300 px-2 py-0.5 rounded-full">
                  {paymentSettings.bkashAccountType || 'Merchant'} / {paymentSettings.nagadAccountType || 'Merchant'}
                </span>
              </div>
              <h4 className="text-base font-extrabold text-white">বিকাশ ও নগদ পেমেন্ট মেথড</h4>
              <p className="text-[11px] text-gray-400">
                মার্চেন্ট গেটওয়ে এবং পার্সোনাল সেন্ড মানি (Sender, TrxID, Amount যাচাই) উভয় অপশনই সক্রিয় আছে।
              </p>
            </div>

            <div className="bg-slate-900 rounded-3xl p-5 text-white border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-gray-400">Customer Support Inbox</span>
                <span className="text-[10px] font-bold bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">
                  Omnichannel
                </span>
              </div>
              <h4 className="text-base font-extrabold text-white">লাইভ চ্যাট, WA ও মেসেঞ্জার</h4>
              <p className="text-[11px] text-gray-400">
                সমস্ত কাস্টমার মেসেজ এক ইউনিফাইড ইনবক্সে সেন্ট্রালাইজড আছে। এআই সেলস অ্যাসিস্ট্যান্ট নিয়ন্ত্রণযোগ্য।
              </p>
            </div>
          </div>

          {/* Super Admin: Clean All Demo Data Card */}
          <div className="bg-gradient-to-r from-amber-50 via-rose-50 to-orange-50 border border-amber-200/80 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-600/20">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-extrabold text-sm sm:text-base text-gray-900">
                      সুপার এডমিন: ডেমো ডেটা নিয়ন্ত্রণ ও ক্লিনআপ (Demo Data Purge)
                    </h4>
                    <span className="bg-rose-100 text-rose-800 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-rose-200">
                      👑 সুপার এডমিন ক্ষমতা
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    কাস্টমারদের কাছে যেকোনো ডেমো অর্ডার বা ডেমো প্রোফাইল লুকানো হয়েছে। আপনি চাইলে এক ক্লিকে সিস্টেমের সমস্ত ডেমো অর্ডার, ডেমো কাস্টমার ও ডেমো ঠিকানা চিরতরে ডিলিট করতে পারেন।
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('আপনি কি নিশ্চিত যে সকল ডেমো অর্ডার ও ডেমো কাস্টমার তথ্য মুছে ফেলতে চান? এটি শুধুমাত্র ডেমো ডেটা ডিলিট করবে, রিয়েল কাস্টমারের কোনো তথ্য ক্ষতি হবে না।')) {
                      const res = purgeAllDemoData();
                      alert(res.message);
                    }
                  }}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-1.5 shadow-md shadow-rose-600/20 cursor-pointer transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>সকল ডেমো মুছে ফেলুন (Purge Demo)</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
              <div className="bg-white/80 p-3 rounded-2xl border border-amber-200/60">
                <span className="text-gray-400 block text-[10px] uppercase font-bold">ডেমো অর্ডার শনাক্ত</span>
                <span className="font-black text-rose-600 text-sm">{demoOrdersCount} টি</span>
              </div>
              <div className="bg-white/80 p-3 rounded-2xl border border-amber-200/60">
                <span className="text-gray-400 block text-[10px] uppercase font-bold">রিয়েল কাস্টমার অর্ডার</span>
                <span className="font-black text-emerald-600 text-sm">{orders.length - demoOrdersCount} টি</span>
              </div>
              <div className="bg-white/80 p-3 rounded-2xl border border-amber-200/60">
                <span className="text-gray-400 block text-[10px] uppercase font-bold">কাস্টমার ভিউ স্ট্যাটাস</span>
                <span className="font-bold text-gray-800 text-[11px] flex items-center space-x-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>১০০% রিয়েলিস্টিক</span>
                </span>
              </div>
              <div className="bg-white/80 p-3 rounded-2xl border border-amber-200/60">
                <span className="text-gray-400 block text-[10px] uppercase font-bold">কাস্টমার অথেন্টিকেশন</span>
                <span className="font-bold text-emerald-700 text-[11px]">ইমেইল/ফোন ও পাসওয়ার্ড</span>
              </div>
            </div>
          </div>

          {/* Full Master Recent Orders Ledger */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-sm sm:text-base text-gray-900">
                সাম্প্রতিক অর্ডার ও পূর্ণ লেনদেন মাস্টার তালিকা
              </h4>
              <button
                onClick={() => setAdminTab('orders')}
                className="text-xs text-rose-600 font-bold hover:underline cursor-pointer"
              >
                সব অর্ডার হাব দেখুন →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 border-b border-gray-200 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Order ID</th>
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3">Phone</th>
                    <th className="py-2.5 px-3">Payment</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.slice(0, 5).map(o => (
                    <tr key={o.id} className="hover:bg-gray-50/50">
                      <td className="py-2.5 px-3 font-mono font-bold text-gray-900">#{o.id}</td>
                      <td className="py-2.5 px-3 font-semibold">{o.customerName}</td>
                      <td className="py-2.5 px-3 font-mono text-gray-600">{o.phone}</td>
                      <td className="py-2.5 px-3">
                        <span className="uppercase font-bold text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-800">
                          {o.paymentMethod}
                        </span>
                        {o.paymentDetails?.trxId && (
                          <span className="block text-[9px] font-mono text-pink-700">
                            TrxID: {o.paymentDetails.trxId}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-rose-600">{formatPrice(o.totalAmount)}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            o.status === 'Delivered'
                              ? 'bg-purple-100 text-purple-700'
                              : o.status === 'Shipped'
                              ? 'bg-blue-100 text-blue-700'
                              : o.status === 'Confirmed'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => onEditOrder(o)}
                          className="text-gray-500 hover:text-blue-600 font-bold text-xs cursor-pointer"
                        >
                          বিস্তারিত
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
