import React, { useState, useEffect } from 'react';
import {
  Package,
  ShoppingCart,
  Users,
  AlertTriangle,
  TrendingUp,
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  Clock,
  Printer,
  DollarSign,
  Download,
  Settings,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Layers,
  Sparkles,
  ArrowLeft,
  X,
  Phone,
  PhoneCall,
  MessageCircle,
  MessageSquare,
  Truck,
  Send,
  FileText,
  Search,
  Filter,
  Eye,
  PauseCircle,
  XCircle,
  ExternalLink,
  ChevronDown,
  RefreshCw,
  Bell,
  Volume2,
  Tag,
  Upload,
  Bot,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { Product, Order, OrderStatus, CourierPartner, UserRole } from '../types';
import { CATEGORIES } from '../data/mockData';
import { RolePermissionManager } from './admin/RolePermissionManager';
import { BusinessSettingsManager } from './admin/BusinessSettingsManager';
import { CategoryManager } from './admin/CategoryManager';
import { OrderCallModal } from './admin/OrderCallModal';
import { OrderEditModal } from './admin/OrderEditModal';
import { CourierDispatchModal } from './admin/CourierDispatchModal';
import { ShippingLabelModal } from './admin/ShippingLabelModal';
import { OmnichannelChatManager } from './admin/OmnichannelChatManager';
import { RoleDashboards } from './admin/RoleDashboards';

const AccessRestrictedCard: React.FC<{
  role: UserRole;
  requiredRole: string;
  moduleName: string;
  onGoBack: () => void;
}> = ({ role, requiredRole, moduleName, onGoBack }) => (
  <div className="bg-white rounded-3xl p-8 sm:p-12 border border-rose-200 shadow-xs text-center space-y-4 max-w-lg mx-auto my-12 animate-in fade-in zoom-in-95 duration-200">
    <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
      <Lock className="w-8 h-8" />
    </div>
    <div className="space-y-1.5">
      <h3 className="text-lg font-black text-gray-900">এক্সেস সংরক্ষিত (Access Restricted)</h3>
      <p className="text-xs text-gray-600 leading-relaxed">
        <strong>"{moduleName}"</strong> মডিউলে প্রবেশের অনুমতি আপনার বর্তমান রোলে (<strong>{role}</strong>) নেই। এটি শুধুমাত্র <strong>{requiredRole}</strong>-এর জন্য সংরক্ষিত।
      </p>
    </div>
    <div className="p-3 bg-rose-50/70 rounded-2xl border border-rose-100 text-[11px] text-rose-800 font-medium">
      🔒 রোল-বেজড এক্সেস কন্ট্রোল (RBAC) নিরাপত্তা নীতি অনুযায়ী অন্য বিভাগের ডেটা সীমাবদ্ধ রাখা হয়েছে।
    </div>
    <button
      onClick={onGoBack}
      className="bg-gray-900 hover:bg-black text-white text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer transition-colors shadow-xs"
    >
      আপনার অনুমোদিত ড্যাশবোর্ডে ফিরে যান →
    </button>
  </div>
);

export const AdminPanel: React.FC = () => {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    orders,
    confirmOrder,
    cancelOrder,
    holdOrder,
    updateOrderStatus,
    updateCourierStatus,
    setSelectedOrderForInvoice,
    setActiveModal,
    setOrderForCall,
    setOrderForEdit,
    setOrderForCourier,
    setOrderForShippingLabel,
    coupons,
    addCoupon,
    deleteCoupon,
    setIsAdminView,
    currentRole,
    setCurrentRole,
    hasPermission,
    websiteSettings,
    deliverySettings,
    courierConfigs,
    hasNewOrderAlert,
    dismissNewOrderAlert,
    conversations,
    registeredCustomers,
    adminUser,
    t,
    formatPrice,
    language,
  } = useShop();

  const unreadChatCount = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  const [adminTab, setAdminTab] = useState<
    | 'dashboard'
    | 'orders'
    | 'products'
    | 'inventory'
    | 'categories'
    | 'couriers'
    | 'customers'
    | 'coupons'
    | 'delivery'
    | 'livechat'
    | 'roles'
    | 'settings'
    | 'reports'
  >('dashboard'); // Defaults to role-specific dashboard

  // Strict RBAC Tab Access Enforcement: Prevent unauthorized role from accessing hidden tabs
  useEffect(() => {
    if (currentRole === 'STAFF') {
      const staffAllowed = ['dashboard', 'orders', 'livechat', 'products'];
      if (!staffAllowed.includes(adminTab)) {
        setAdminTab('dashboard');
      }
    } else if (currentRole === 'MANAGER') {
      const managerAllowed = ['dashboard', 'orders', 'livechat', 'couriers', 'products', 'inventory', 'categories', 'reports'];
      if (!managerAllowed.includes(adminTab)) {
        setAdminTab('dashboard');
      }
    } else if (currentRole === 'ADMIN') {
      const adminAllowed = ['dashboard', 'orders', 'livechat', 'couriers', 'products', 'inventory', 'categories', 'customers', 'coupons', 'delivery', 'reports'];
      if (!adminAllowed.includes(adminTab)) {
        setAdminTab('dashboard');
      }
    }
  }, [currentRole, adminTab]);

  // Order Filters
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState<string>('');

  // Product Filters
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('all');
  const [productSearchQuery, setProductSearchQuery] = useState<string>('');

  // Add Product Modal State
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTitleBn, setNewTitleBn] = useState('');
  const [newCategory, setNewCategory] = useState('men-fashion');
  const [newSubcategory, setNewSubcategory] = useState('Shirts');
  const [newBrand, setNewBrand] = useState('JotPot Brand');
  const [newSku, setNewSku] = useState(`JPS-${Math.floor(1000 + Math.random() * 9000)}`);
  const [newPrice, setNewPrice] = useState(990);
  const [newOldPrice, setNewOldPrice] = useState(1350);
  const [newCostPrice, setNewCostPrice] = useState(550);
  const [newStock, setNewStock] = useState(25);
  const [newColors, setNewColors] = useState('Black, Blue, White');
  const [newSizes, setNewSizes] = useState('M, L, XL');
  const [newImageUrl, setNewImageUrl] = useState('https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80');
  const [newDesc, setNewDesc] = useState('High quality fabric crafted for comfort and elegance.');
  const [newDescBn, setNewDescBn] = useState('আরামদায়ক ও টেকসই সুতি কাপড়ে তৈরি প্রিমিয়াম কোয়ালিটি পণ্য।');

  // Add Category Modal State
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatNameBn, setNewCatNameBn] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('🛍️');
  const [newCatSubcategories, setNewCatSubcategories] = useState('T-Shirts, Jeans, Watches');

  // Add Coupon Modal State
  const [showAddCouponModal, setShowAddCouponModal] = useState(false);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponType, setNewCouponType] = useState<'fixed' | 'percentage'>('fixed');
  const [newCouponVal, setNewCouponVal] = useState(100);
  const [newCouponMin, setNewCouponMin] = useState(1000);
  const [newCouponDesc, setNewCouponDesc] = useState('');

  const handleRoleSwitch = (newRole: UserRole) => {
    setCurrentRole(newRole);
    if (newRole === 'STAFF') {
      const allowed = ['dashboard', 'orders', 'livechat', 'products'];
      if (!allowed.includes(adminTab)) {
        setAdminTab('dashboard');
      }
    } else if (newRole === 'MANAGER') {
      const allowed = ['dashboard', 'orders', 'livechat', 'couriers', 'products', 'inventory', 'categories', 'reports'];
      if (!allowed.includes(adminTab)) {
        setAdminTab('dashboard');
      }
    } else if (newRole === 'ADMIN') {
      const allowed = ['dashboard', 'orders', 'livechat', 'couriers', 'products', 'inventory', 'categories', 'customers', 'coupons', 'delivery', 'reports'];
      if (!allowed.includes(adminTab)) {
        setAdminTab('dashboard');
      }
    }
  };

  // Calculated Stats
  const totalSales = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const pendingOrdersCount = orders.filter(o => o.status === 'Pending').length;
  const confirmedOrdersCount = orders.filter(o => o.status === 'Confirmed').length;
  const shippedOrdersCount = orders.filter(o => o.status === 'Shipped').length;
  const deliveredOrdersCount = orders.filter(o => o.status === 'Delivered').length;
  const lowStockProducts = products.filter(p => p.stock <= p.lowStockThreshold);

  // Filter Orders
  const filteredOrders = orders.filter(order => {
    // Status filter
    if (orderStatusFilter !== 'all') {
      if (orderStatusFilter === 'pending' && order.status !== 'Pending') return false;
      if (orderStatusFilter === 'confirmed' && order.status !== 'Confirmed') return false;
      if (orderStatusFilter === 'shipped' && order.status !== 'Shipped') return false;
      if (orderStatusFilter === 'delivered' && order.status !== 'Delivered') return false;
      if (orderStatusFilter === 'hold' && order.status !== 'On Hold') return false;
      if (orderStatusFilter === 'cancelled' && order.status !== 'Cancelled') return false;
    }
    // Search query
    if (orderSearchQuery.trim()) {
      const q = orderSearchQuery.toLowerCase();
      const matchesId = order.id.toLowerCase().includes(q);
      const matchesCustomer = order.customerName.toLowerCase().includes(q);
      const matchesPhone = order.phone.includes(q) || (order.alternativePhone && order.alternativePhone.includes(q));
      const matchesDistrict = order.address.district.toLowerCase().includes(q);
      const matchesTracking = order.trackingNumber.toLowerCase().includes(q);
      return matchesId || matchesCustomer || matchesPhone || matchesDistrict || matchesTracking;
    }
    return true;
  });

  // Filter Products
  const filteredProducts = products.filter(prod => {
    if (productCategoryFilter !== 'all' && prod.category !== productCategoryFilter) return false;
    if (productSearchQuery.trim()) {
      const q = productSearchQuery.toLowerCase();
      return (
        prod.name.toLowerCase().includes(q) ||
        prod.nameBn.includes(q) ||
        prod.sku.toLowerCase().includes(q) ||
        prod.subcategory.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const discountP = newOldPrice > newPrice ? Math.round(((newOldPrice - newPrice) / newOldPrice) * 100) : 0;

    const created: Product = {
      id: `jps-prod-${Date.now()}`,
      name: newTitle,
      nameBn: newTitleBn || newTitle,
      category: newCategory,
      categoryBn: CATEGORIES.find(c => c.id === newCategory)?.nameBn || 'ফ্যাশন',
      subcategory: newSubcategory,
      subcategoryBn: newSubcategory,
      brand: newBrand,
      sku: newSku,
      price: Number(newPrice),
      oldPrice: Number(newOldPrice),
      discountPercent: discountP,
      costPrice: Number(newCostPrice),
      stock: Number(newStock),
      lowStockThreshold: 5,
      colors: newColors.split(',').map(s => s.trim()).filter(Boolean),
      sizes: newSizes.split(',').map(s => s.trim()).filter(Boolean),
      images: [newImageUrl],
      description: newDesc,
      descriptionBn: newDescBn,
      specifications: { 'Origin': 'Bangladesh', 'Quality': 'Standard A+' },
      warranty: '7 Days Replacement',
      warrantyBn: '৭ দিনের রিপ্লেসমেন্ট',
      returnPolicy: '7 Days Easy Return',
      returnPolicyBn: '৭ দিনের সহজ রিটার্ন',
      deliveryDays: 'Inside Dhaka 24-48 hours',
      deliveryDaysBn: 'ঢাকা সিটিতে ২৪-৪৮ ঘণ্টা',
      tags: [newCategory, newSubcategory.toLowerCase()],
      rating: 5.0,
      reviewsCount: 1,
      isFlashSale: false,
      isBestSeller: true,
      needTags: ['office', 'campus', 'everyday'],
      reviews: [],
    };

    addProduct(created);
    setShowAddProductModal(false);
    setNewTitle('');
    setNewTitleBn('');
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;

    addCoupon({
      code: newCouponCode.trim().toUpperCase(),
      discountType: newCouponType,
      discountValue: Number(newCouponVal),
      minPurchase: Number(newCouponMin),
      description: newCouponDesc || `Special discount on orders above ৳${newCouponMin}`,
      descriptionBn: `৳${newCouponMin} বা তার বেশি অর্ডারে বিশেষ ছাড়`,
      active: true,
      expiryDate: '2026-12-31',
    });

    setShowAddCouponModal(false);
    setNewCouponCode('');
  };

  const handleExportCSV = () => {
    const headers = ['Order ID,Customer Name,Phone,Alt Phone,District,Address,Amount,Payment,Status,Courier,Tracking Code,Date\n'];
    const rows = orders.map(
      o =>
        `"${o.id}","${o.customerName}","${o.phone}","${o.alternativePhone || ''}","${o.address.district}","${o.address.fullAddress.replace(/"/g, '""')}",${o.totalAmount},"${o.paymentMethod}","${o.status}","${o.courier}","${o.trackingNumber}","${o.orderDate}"\n`
    );
    const blob = new Blob([...headers, ...rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `JotPotShop-Orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const openWhatsAppCustomer = (order: Order) => {
    const cleanPhone = order.phone.replace(/\D/g, '');
    const intlPhone = cleanPhone.startsWith('880') ? cleanPhone : `880${cleanPhone.replace(/^0+/, '')}`;
    const textMsg = encodeURIComponent(
      `আসসালামু আলাইকুম ${order.customerName}! JotPotShop থেকে আপনার অর্ডার #${order.id} (মোট মূল্য: ৳${order.totalAmount}) সংক্রান্ত তথ্যের জন্য যোগাযোগ করা হয়েছে। আপনার কোনো জিজ্ঞাসা থাকলে জানাতে পারেন। ধন্যবাদ!`
    );
    window.open(`https://wa.me/${intlPhone}?text=${textMsg}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-100/80 p-3 sm:p-6 text-gray-900">
      {/* Top Super Admin Navigation Header */}
      <div className="max-w-7xl mx-auto bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-gray-200 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <button
            onClick={() => setIsAdminView(false)}
            className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-2xl text-gray-700 transition-colors cursor-pointer"
            title={t('গ্রাহক স্টোরে ফিরে যান', 'Back to Storefront')}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          {websiteSettings.logoUrl && (
            <div className="h-10 max-w-[120px] hidden sm:flex items-center justify-center p-1 bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
              <img
                src={websiteSettings.logoUrl}
                alt={websiteSettings.storeName}
                className="max-h-8 max-w-[100px] object-contain"
              />
            </div>
          )}
          <div>
            <div className="flex items-center space-x-2">
              <span
                className={`text-[10px] font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider ${
                  currentRole === 'SUPER_ADMIN'
                    ? 'bg-rose-600 text-white'
                    : currentRole === 'ADMIN'
                    ? 'bg-purple-600 text-white'
                    : currentRole === 'MANAGER'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-white'
                }`}
              >
                {currentRole.replace('_', ' ')}
              </span>
              <h1 className="text-lg sm:text-xl font-black text-gray-900">
                {websiteSettings.storeName} কন্ট্রোল সেন্টার
              </h1>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              সুপার এডমিন ফুল কন্ট্রোল • অর্ডার ভেরিফিকেশন • কুরিয়ার ইন্টিগ্রেশন • RBAC পারমিশন
            </p>
          </div>
        </div>

        {/* Action Controls & Role Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {/* New Order Alert Bell indicator */}
          {hasNewOrderAlert && (
            <div
              onClick={dismissNewOrderAlert}
              className="bg-rose-50 border border-rose-300 text-rose-700 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 animate-pulse cursor-pointer shadow-xs"
              title="নতুন অর্ডার এসেছে! ক্লিক করে অ্যালার্ট বন্ধ করুন"
            >
              <Bell className="w-4 h-4 text-rose-600" />
              <span>নতুন অর্ডার এসেছে! ({pendingOrdersCount})</span>
            </div>
          )}

          {/* Role Switcher Pill - Only Super Admin can preview/switch other roles */}
          {(!adminUser || adminUser.role === 'SUPER_ADMIN') ? (
            <div className="flex items-center space-x-1 bg-amber-50 p-1 rounded-2xl text-xs font-bold border border-amber-200">
              <span className="text-[10px] text-amber-800 uppercase px-2 font-mono flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                <span>সুপার এডমিন রোল প্রিভিউ:</span>
              </span>
              {(
                [
                  { id: 'SUPER_ADMIN', label: '👑 সুপার এডমিন', tip: 'ফুল মাস্টার এক্সেস' },
                  { id: 'ADMIN', label: '🛡️ এডমিন', tip: 'পণ্য, কুপন ও গ্রাহক কন্ট্রোল' },
                  { id: 'MANAGER', label: '📋 ম্যানেজার', tip: 'কুরিয়ার ও ইনভেন্টরি কন্ট্রোল' },
                  { id: 'STAFF', label: '💼 স্টাফ', tip: 'অর্ডার কল ও চ্যাট সাপোর্ট' },
                ] as const
              ).map(r => (
                <button
                  key={r.id}
                  onClick={() => handleRoleSwitch(r.id)}
                  title={r.tip}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer text-xs font-bold flex items-center space-x-1 ${
                    currentRole === r.id
                      ? 'bg-rose-600 text-white shadow-xs font-black'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  <span>{r.label}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center space-x-2 bg-gray-100 px-3 py-1.5 rounded-2xl text-xs font-bold border border-gray-200 text-gray-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>
                বর্তমান রোল: <strong className="text-gray-900">{adminUser.name}</strong> ({adminUser.role})
              </span>
              <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full font-mono">
                লকড এক্সেস
              </span>
            </div>
          )}

          {/* Add Product Button (Permission gated) */}
          {hasPermission('products', 'create') && (
            <button
              onClick={() => setShowAddProductModal(true)}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center space-x-1.5 shadow-xs cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>{t('পণ্য যোগ', 'Add Product')}</span>
            </button>
          )}

          {/* Export CSV (Permission gated) */}
          {hasPermission('orders', 'export') && (
            <button
              onClick={handleExportCSV}
              className="bg-gray-900 hover:bg-black text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center space-x-1.5 cursor-pointer transition-colors"
              title={t('সব অর্ডার এক্সপোর্ট করুন', 'Export Orders CSV')}
            >
              <Download className="w-4 h-4" />
              <span>CSV</span>
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Sidebar Menu tailored by User Role */}
        <div className="md:col-span-3 bg-white rounded-3xl p-3 border border-gray-200 shadow-xs h-fit space-y-1 text-xs font-bold text-gray-700">
          {/* Active Role Header Pill */}
          <div className="p-2.5 mb-2 rounded-2xl bg-gradient-to-r from-gray-900 via-slate-800 to-gray-900 text-white flex items-center justify-between shadow-xs">
            <div>
              <span className="text-[9px] uppercase tracking-wider text-rose-400 font-mono block">ড্যাশবোর্ড রোল:</span>
              <span className="text-xs font-black">
                {currentRole === 'SUPER_ADMIN'
                  ? '👑 সুপার এডমিন'
                  : currentRole === 'ADMIN'
                  ? '🛡️ এডমিন'
                  : currentRole === 'MANAGER'
                  ? '📋 ম্যানেজার'
                  : '💼 স্টাফ'}
              </span>
            </div>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-mono">
              {currentRole}
            </span>
          </div>

          {/* 1. Dashboard Overview (Staff gets focused view, others get analytics) */}
          <button
            onClick={() => setAdminTab('dashboard')}
            className={`w-full text-left px-3.5 py-2.5 rounded-2xl flex items-center space-x-2.5 transition-colors cursor-pointer ${
              adminTab === 'dashboard' ? 'bg-rose-600 text-white shadow-xs' : 'hover:bg-gray-100'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>
              {currentRole === 'STAFF'
                ? t('স্টাফ ড্যাশবোর্ড ও টাস্ক', 'Staff Dashboard')
                : currentRole === 'MANAGER'
                ? t('ম্যানেজার ড্যাশবোর্ড', 'Manager Dashboard')
                : currentRole === 'ADMIN'
                ? t('এডমিন ড্যাশবোর্ড', 'Admin Dashboard')
                : t('সুপার এডমিন ড্যাশবোর্ড', 'Super Admin Suite')}
            </span>
          </button>

          {/* 2. Orders & Call Verification Hub (All roles) */}
          <button
            onClick={() => setAdminTab('orders')}
            className={`w-full text-left px-3.5 py-2.5 rounded-2xl flex items-center justify-between transition-colors cursor-pointer ${
              adminTab === 'orders' ? 'bg-rose-600 text-white shadow-xs' : 'hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <ShoppingCart className="w-4 h-4" />
              <span>{t('অর্ডার কনফার্মেশন ও কল হাব', 'Orders & Call Hub')}</span>
            </div>
            {pendingOrdersCount > 0 && (
              <span
                className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                  adminTab === 'orders' ? 'bg-white text-rose-600' : 'bg-rose-100 text-rose-700'
                }`}
              >
                {pendingOrdersCount}
              </span>
            )}
          </button>

          {/* 3. Omnichannel Customer Live Chat, WhatsApp & Messenger (All roles: Super Admin, Admin, Manager, Staff) */}
          <button
            onClick={() => setAdminTab('livechat')}
            className={`w-full text-left px-3.5 py-2.5 rounded-2xl flex items-center justify-between transition-colors cursor-pointer ${
              adminTab === 'livechat' ? 'bg-rose-600 text-white shadow-xs' : 'hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <MessageSquare className="w-4 h-4 text-emerald-500" />
              <span>{t('কাস্টমার চ্যাট ইনবক্স (Live/WA/FB)', 'Customer Chat Inbox')}</span>
            </div>
            {unreadChatCount > 0 ? (
              <span className="bg-amber-400 text-gray-950 text-[10px] font-black px-1.5 py-0.5 rounded-full">
                {unreadChatCount}
              </span>
            ) : (
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            )}
          </button>

          {/* 4. Couriers Logistics (Manager, Admin, Super Admin) */}
          {currentRole !== 'STAFF' && (
            <button
              onClick={() => setAdminTab('couriers')}
              className={`w-full text-left px-3.5 py-2.5 rounded-2xl flex items-center space-x-2.5 transition-colors cursor-pointer ${
                adminTab === 'couriers' ? 'bg-rose-600 text-white shadow-xs' : 'hover:bg-gray-100'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>{t('কুরিয়ার ডেলিভারি ও চালান', 'Courier Logistics')}</span>
            </button>
          )}

          {/* 5. Products Catalog (All roles) */}
          <button
            onClick={() => setAdminTab('products')}
            className={`w-full text-left px-3.5 py-2.5 rounded-2xl flex items-center justify-between transition-colors cursor-pointer ${
              adminTab === 'products' ? 'bg-rose-600 text-white shadow-xs' : 'hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Package className="w-4 h-4" />
              <span>{t('পণ্য তালিকা ও স্টক', 'Products Catalog')}</span>
            </div>
            <span className="text-[10px] text-gray-400 font-mono">({products.length})</span>
          </button>

          {/* 6. Inventory Low Stock Alerts (Manager, Admin, Super Admin) */}
          {currentRole !== 'STAFF' && (
            <button
              onClick={() => setAdminTab('inventory')}
              className={`w-full text-left px-3.5 py-2.5 rounded-2xl flex items-center justify-between transition-colors cursor-pointer ${
                adminTab === 'inventory' ? 'bg-rose-600 text-white shadow-xs' : 'hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <AlertTriangle className="w-4 h-4" />
                <span>{t('লো স্টক সতর্কবার্তা', 'Low Stock Alerts')}</span>
              </div>
              {lowStockProducts.length > 0 && (
                <span className="bg-rose-100 text-rose-800 text-[10px] font-black px-1.5 py-0.5 rounded-full">
                  {lowStockProducts.length}
                </span>
              )}
            </button>
          )}

          {/* 7. Categories (Manager, Admin, Super Admin) */}
          {currentRole !== 'STAFF' && (
            <button
              onClick={() => setAdminTab('categories')}
              className={`w-full text-left px-3.5 py-2.5 rounded-2xl flex items-center space-x-2.5 transition-colors cursor-pointer ${
                adminTab === 'categories' ? 'bg-rose-600 text-white shadow-xs' : 'hover:bg-gray-100'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>{t('ক্যাটাগরি ও সাব-ক্যাটাগরি', 'Categories & Brands')}</span>
            </button>
          )}

          {/* 8. Customers Directory (Admin, Super Admin) */}
          {(currentRole === 'ADMIN' || currentRole === 'SUPER_ADMIN') && (
            <button
              onClick={() => setAdminTab('customers')}
              className={`w-full text-left px-3.5 py-2.5 rounded-2xl flex items-center space-x-2.5 transition-colors cursor-pointer ${
                adminTab === 'customers' ? 'bg-rose-600 text-white shadow-xs' : 'hover:bg-gray-100'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>{t('গ্রাহক ডিরেক্টরি', 'Customers Directory')}</span>
            </button>
          )}

          {/* 9. Coupons & Discounts (Admin, Super Admin) */}
          {(currentRole === 'ADMIN' || currentRole === 'SUPER_ADMIN') && (
            <button
              onClick={() => setAdminTab('coupons')}
              className={`w-full text-left px-3.5 py-2.5 rounded-2xl flex items-center space-x-2.5 transition-colors cursor-pointer ${
                adminTab === 'coupons' ? 'bg-rose-600 text-white shadow-xs' : 'hover:bg-gray-100'
              }`}
            >
              <Tag className="w-4 h-4" />
              <span>{t('কুপন ও ডিসকাউন্ট', 'Coupons & Deals')}</span>
            </button>
          )}

          {/* 10. Delivery & Chattogram Offer (Admin, Super Admin) */}
          {(currentRole === 'ADMIN' || currentRole === 'SUPER_ADMIN') && (
            <button
              onClick={() => setAdminTab('delivery')}
              className={`w-full text-left px-3.5 py-2.5 rounded-2xl flex items-center justify-between transition-colors cursor-pointer ${
                adminTab === 'delivery' ? 'bg-rose-600 text-white shadow-xs' : 'hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Truck className="w-4 h-4" />
                <span>{t('ডেলিভারি চার্জ ও চট্টগ্রাম অফার', 'Delivery & Chattogram')}</span>
              </div>
              {deliverySettings.chattogramFreeDeliveryOffer && (
                <span className="bg-amber-400 text-gray-900 text-[9px] font-black px-1.5 py-0.5 rounded-full">
                  অফার
                </span>
              )}
            </button>
          )}

          {/* 11. Reports (Manager, Admin, Super Admin) */}
          {currentRole !== 'STAFF' && (
            <button
              onClick={() => setAdminTab('reports')}
              className={`w-full text-left px-3.5 py-2.5 rounded-2xl flex items-center space-x-2.5 transition-colors cursor-pointer ${
                adminTab === 'reports' ? 'bg-rose-600 text-white shadow-xs' : 'hover:bg-gray-100'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>{t('বিক্রয় ও একাউন্টিং রিপোর্ট', 'Sales & Reports')}</span>
            </button>
          )}

          {/* 12. RBAC Roles & Team Matrix (Super Admin Only) */}
          {currentRole === 'SUPER_ADMIN' && (
            <button
              onClick={() => setAdminTab('roles')}
              className={`w-full text-left px-3.5 py-2.5 rounded-2xl flex items-center space-x-2.5 transition-colors cursor-pointer ${
                adminTab === 'roles' ? 'bg-rose-600 text-white shadow-xs' : 'hover:bg-gray-100'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              <span>{t('রোল ও পারমিশন কন্ট্রোল', 'Roles & RBAC Matrix')}</span>
            </button>
          )}

          {/* 13. All Business & Payment Settings (Super Admin Only) */}
          {currentRole === 'SUPER_ADMIN' && (
            <button
              onClick={() => setAdminTab('settings')}
              className={`w-full text-left px-3.5 py-2.5 rounded-2xl flex items-center space-x-2.5 transition-colors cursor-pointer ${
                adminTab === 'settings' ? 'bg-rose-600 text-white shadow-xs' : 'hover:bg-gray-100'
              }`}
            >
              <Settings className="w-4 h-4 text-rose-500" />
              <span>{t('বিজনেস ও পেমেন্ট সেটিংস', 'All Business Settings')}</span>
            </button>
          )}
        </div>

        {/* Right Dynamic Tab Content */}
        <div className="md:col-span-9 space-y-6">
          {/* TAB: ORDERS & CONFIRMATION SYSTEM */}
          {adminTab === 'orders' && (
            <div className="space-y-4">
              {/* Order Status Filters & Search Bar */}
              <div className="bg-white rounded-3xl p-4 sm:p-5 border border-gray-200 shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-extrabold text-base text-gray-900">
                      {t('অর্ডার কনফার্মেশন ও ডেলিভারি হাব', 'Order Confirmation & Fulfillment')}
                    </h3>
                    <p className="text-xs text-gray-500">
                      কল ভেরিফিকেশন, হোয়াটসঅ্যাপ মেসেজিং, এডিট ও কুরিয়ার ডিসপ্যাচ ম্যানেজমেন্ট
                    </p>
                  </div>

                  {/* Search Order input */}
                  <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={orderSearchQuery}
                      onChange={e => setOrderSearchQuery(e.target.value)}
                      placeholder={t('আইডি, নাম, ফোন বা জেলা দিয়ে খুঁজুন...', 'Search ID, name, phone, district...')}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:border-rose-500"
                    />
                  </div>
                </div>

                {/* Status Badges Filter Bar */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold scrollbar-none">
                  {[
                    { key: 'all', label: 'সব অর্ডার', count: orders.length },
                    { key: 'pending', label: 'যাচাই অপেক্ষমান (New)', count: pendingOrdersCount, color: 'text-amber-700 bg-amber-50' },
                    { key: 'confirmed', label: 'কনফার্মড (Confirmed)', count: confirmedOrdersCount, color: 'text-emerald-700 bg-emerald-50' },
                    { key: 'shipped', label: 'কুরিয়ারে প্রেরিত (Shipped)', count: shippedOrdersCount, color: 'text-blue-700 bg-blue-50' },
                    { key: 'delivered', label: 'ডেলিভার্ড সম্পন্ন', count: deliveredOrdersCount, color: 'text-purple-700 bg-purple-50' },
                    { key: 'hold', label: 'হোল্ডে আছে', count: orders.filter(o => o.status === 'On Hold').length },
                    { key: 'cancelled', label: 'বাতিলকৃত', count: orders.filter(o => o.status === 'Cancelled').length },
                  ].map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setOrderStatusFilter(tab.key)}
                      className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors cursor-pointer flex items-center space-x-1.5 ${
                        orderStatusFilter === tab.key
                          ? 'bg-gray-900 text-white shadow-xs'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10">
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Order Cards List */}
              <div className="space-y-3.5">
                {filteredOrders.length === 0 ? (
                  <div className="bg-white rounded-3xl p-12 text-center border border-gray-200">
                    <ShoppingCart className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="font-bold text-gray-700">কোনো অর্ডার পাওয়া যায়নি</p>
                    <p className="text-xs text-gray-400 mt-1">অন্য কোনো ফিল্টার বা অনুসন্ধান শব্দ ব্যবহার করুন</p>
                  </div>
                ) : (
                  filteredOrders.map(order => {
                    const isNewPending = order.status === 'Pending';
                    const isConfirmed = order.status === 'Confirmed';
                    const isShipped = order.status === 'Shipped';
                    const isDelivered = order.status === 'Delivered';

                    return (
                      <div
                        key={order.id}
                        className={`bg-white rounded-3xl p-5 border transition-all shadow-xs space-y-4 ${
                          isNewPending
                            ? 'border-amber-300 ring-2 ring-amber-400/20 bg-amber-50/10'
                            : 'border-gray-200'
                        }`}
                      >
                        {/* Order Header Row */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 gap-2">
                          <div className="flex items-center space-x-2.5">
                            <span className="font-mono text-sm font-black text-gray-900 bg-gray-100 px-2.5 py-1 rounded-xl">
                              #{order.id}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase ${
                                order.status === 'Pending'
                                  ? 'bg-amber-100 text-amber-800'
                                  : order.status === 'Confirmed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : order.status === 'Shipped'
                                  ? 'bg-blue-100 text-blue-800'
                                  : order.status === 'Delivered'
                                  ? 'bg-purple-100 text-purple-800'
                                  : order.status === 'On Hold'
                                  ? 'bg-orange-100 text-orange-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {order.status === 'Pending' ? 'নতুন (New Order)' : order.status}
                            </span>

                            {order.orderSource && (
                              <span className="text-[10px] font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                Source: {order.orderSource}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center space-x-3 text-xs text-gray-500">
                            <span className="font-mono">{order.orderDate}</span>
                            <span className="font-extrabold text-sm text-rose-600">
                              {formatPrice(order.totalAmount)}
                            </span>
                          </div>
                        </div>

                        {/* Order Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 text-xs">
                          {/* Customer & Address Info (4 cols) */}
                          <div className="sm:col-span-4 space-y-1.5">
                            <div className="flex items-center space-x-1.5">
                              <span className="font-bold text-gray-900 text-sm">{order.customerName}</span>
                            </div>

                            <div className="space-y-0.5 font-mono text-xs">
                              <div className="flex items-center space-x-1.5 text-gray-700 font-bold">
                                <span>📞 {order.phone}</span>
                              </div>
                              {order.alternativePhone && (
                                <div className="text-gray-500 text-[11px]">
                                  <span>Alt: {order.alternativePhone}</span>
                                </div>
                              )}
                            </div>

                            <p className="text-gray-600 leading-snug text-[11px] pt-1">
                              📍 <strong className="text-gray-800">{order.address.district}</strong>, {order.address.area}
                              <br />
                              <span className="text-gray-500">{order.address.fullAddress}</span>
                            </p>

                            {/* Customer Note alert */}
                            {order.customerNote && (
                              <div className="bg-amber-50 text-amber-900 border border-amber-200 p-2 rounded-xl text-[10px] mt-1 italic">
                                💬 <strong>গ্রাহকের নোট:</strong> "{order.customerNote}"
                              </div>
                            )}
                          </div>

                          {/* Ordered Products (5 cols) */}
                          <div className="sm:col-span-5 space-y-2 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                              পণ্যসমূহ ({order.items.length} items):
                            </span>

                            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between text-[11px]">
                                  <div className="flex items-center space-x-2 truncate">
                                    <span className="font-bold text-gray-800 shrink-0">{item.quantity}x</span>
                                    <span className="truncate text-gray-700">{item.product.name}</span>
                                    {item.selectedSize && (
                                      <span className="bg-gray-200 px-1 rounded text-[10px] shrink-0 font-mono">
                                        {item.selectedSize}
                                      </span>
                                    )}
                                  </div>
                                  <span className="font-bold text-gray-900 shrink-0 font-mono">
                                    {formatPrice(item.product.price * item.quantity)}
                                  </span>
                                </div>
                              ))}
                            </div>

                            <div className="pt-2 border-t border-gray-200 flex items-center justify-between text-[11px] text-gray-600">
                              <span>পেমেন্ট: <strong className="uppercase">{order.paymentMethod}</strong> ({order.paymentStatus})</span>
                              <span>ডেলিভারি ফি: <strong>৳{order.deliveryFee}</strong></span>
                            </div>

                            {/* Personal Send Money Transaction Details */}
                            {order.paymentDetails && (
                              <div className="mt-1.5 p-2 rounded-xl bg-pink-50 border border-pink-200 text-[10px] text-pink-950 space-y-1">
                                <div className="flex items-center justify-between font-bold">
                                  <span>{order.paymentDetails.accountType || 'Personal'} সেন্ড মানি যাচাই:</span>
                                  <span className="font-mono text-pink-700 font-bold">{order.paymentDetails.senderNumber}</span>
                                </div>
                                {order.paymentDetails.trxId && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-gray-500">TrxID:</span>
                                    <span className="font-mono font-black text-gray-900 bg-white px-1.5 py-0.5 rounded border border-pink-200">
                                      {order.paymentDetails.trxId}
                                    </span>
                                  </div>
                                )}
                                {order.paymentDetails.amount && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-gray-500">প্রেরিত টাকা:</span>
                                    <span className="font-bold text-rose-600 font-mono">৳{order.paymentDetails.amount}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Courier & Tracking Status (3 cols) */}
                          <div className="sm:col-span-3 space-y-2 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                              কুরিয়ার ও লজিস্টিকস:
                            </span>

                            {order.courierInfo ? (
                              <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-black text-emerald-800 text-xs">
                                    {order.courierInfo.courierName}
                                  </span>
                                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
                                    {order.courierInfo.courierStatus}
                                  </span>
                                </div>
                                <p className="font-mono text-[10px] text-gray-600 truncate">
                                  ID: {order.courierInfo.consignmentId}
                                </p>
                                <p className="text-[10px] text-gray-500">
                                  ওজন: {order.courierInfo.weightKg} KG • চার্জ: ৳{order.courierInfo.shippingCharge}
                                </p>

                                {/* Quick update courier status dropdown */}
                                <select
                                  value={order.courierInfo.courierStatus}
                                  onChange={e => updateCourierStatus(order.id, e.target.value as any)}
                                  className="w-full bg-white border border-gray-200 rounded-lg p-1 text-[10px] font-semibold mt-1 cursor-pointer"
                                >
                                  <option value="In Transit">In Transit (ট্রানজিটে আছে)</option>
                                  <option value="Out for Delivery">Out for Delivery (ডেলিভারিতে বের হয়েছে)</option>
                                  <option value="Delivered">Delivered (সফল ডেলিভারি)</option>
                                  <option value="Returned">Returned (রিটার্ন)</option>
                                </select>
                              </div>
                            ) : (
                              <div className="text-gray-400 text-[11px] py-1">
                                <span>কুরিয়ার এসাইন করা হয়নি</span>
                              </div>
                            )}

                            {order.confirmedBy && (
                              <p className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium">
                                ✓ Verified by {order.confirmedBy}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons Row */}
                        <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
                          {/* Communication tools: Call & WhatsApp */}
                          <div className="flex flex-wrap items-center gap-1.5">
                            <button
                              onClick={() => setOrderForCall(order)}
                              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center space-x-1.5 cursor-pointer transition-colors"
                            >
                              <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{t('কল করুন', 'Call Customer')}</span>
                            </button>

                            <button
                              onClick={() => openWhatsAppCustomer(order)}
                              className="bg-green-50 hover:bg-green-100 text-green-800 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center space-x-1.5 cursor-pointer transition-colors"
                            >
                              <MessageCircle className="w-3.5 h-3.5 text-green-600" />
                              <span>{t('হোয়াটসঅ্যাপ', 'WhatsApp')}</span>
                            </button>

                            <button
                              onClick={() => setOrderForEdit(order)}
                              className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center space-x-1.5 cursor-pointer transition-colors"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>{t('এডিট অর্ডার', 'Edit')}</span>
                            </button>
                          </div>

                          {/* Fulfillment Actions */}
                          <div className="flex flex-wrap items-center gap-1.5">
                            {/* Confirm Order Button */}
                            {isNewPending && hasPermission('orders', 'approve') && (
                              <button
                                onClick={() => confirmOrder(order.id, `${currentRole} Admin`)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl flex items-center space-x-1.5 cursor-pointer shadow-xs transition-colors"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>{t('কনফার্ম অর্ডার', 'Confirm Order')}</span>
                              </button>
                            )}

                            {/* Send to Courier Button */}
                            {(isConfirmed || isNewPending) && hasPermission('couriers', 'approve') && (
                              <button
                                onClick={() => setOrderForCourier(order)}
                                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl flex items-center space-x-1.5 cursor-pointer shadow-xs transition-colors"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>{t('কুরিয়ারে পাঠান', 'Send to Courier')}</span>
                              </button>
                            )}

                            {/* Shipping Label / Consignment Note */}
                            {order.courierInfo && (
                              <button
                                onClick={() => setOrderForShippingLabel(order)}
                                className="bg-gray-900 hover:bg-black text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center space-x-1.5 cursor-pointer transition-colors"
                              >
                                <Printer className="w-3.5 h-3.5" />
                                <span>{t('চালান ও লেবেল', 'Shipping Label')}</span>
                              </button>
                            )}

                            {/* Official Invoice Print */}
                            <button
                              onClick={() => {
                                setSelectedOrderForInvoice(order);
                                setActiveModal('invoice');
                              }}
                              className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center space-x-1.5 cursor-pointer transition-colors"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>{t('ইনভয়েস', 'Invoice')}</span>
                            </button>

                            {/* Hold / Cancel */}
                            {order.status !== 'Cancelled' && order.status !== 'Delivered' && (
                              <div className="flex items-center space-x-1">
                                <button
                                  onClick={() => holdOrder(order.id, 'Admin put on hold for verification')}
                                  className="text-gray-400 hover:text-orange-600 p-1 rounded hover:bg-orange-50 cursor-pointer"
                                  title={t('হোল্ডে রাখুন', 'Hold Order')}
                                >
                                  <PauseCircle className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => cancelOrder(order.id, 'Cancelled from Admin')}
                                  className="text-gray-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 cursor-pointer"
                                  title={t('অর্ডার বাতিল করুন', 'Cancel Order')}
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB: COURIER LOGISTICS */}
          {adminTab === 'couriers' && (
            <div className="space-y-5">
              <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-extrabold text-base text-gray-900">
                      {t('কুরিয়ার লজিস্টিকস ও পার্সেল মনিটরিং', 'Courier Logistics Management')}
                    </h3>
                    <p className="text-xs text-gray-500">
                      Steadfast, RedX, Pathao, Paperfly, Sundarban, eCourier পার্সেল স্ট্যাটাস
                    </p>
                  </div>
                </div>

                {/* 6 Courier Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {courierConfigs.map(c => {
                    const assignedOrders = orders.filter(o => o.courierInfo?.courierName === c.id);
                    const deliveredCount = assignedOrders.filter(o => o.status === 'Delivered').length;
                    const inTransitCount = assignedOrders.filter(o => o.status === 'Shipped').length;
                    const totalCod = assignedOrders.reduce(
                      (sum, o) => sum + (o.paymentMethod === 'cod' ? o.totalAmount : 0),
                      0
                    );

                    return (
                      <div key={c.id} className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-sm text-gray-900">{c.name}</span>
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                            ACTIVE
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                          <div className="bg-white p-2 rounded-xl border border-gray-100">
                            <span className="text-[10px] text-gray-400 block font-bold">বুকিং</span>
                            <span className="font-bold text-gray-900">{assignedOrders.length}</span>
                          </div>
                          <div className="bg-white p-2 rounded-xl border border-gray-100">
                            <span className="text-[10px] text-gray-400 block font-bold">ট্রানজিট</span>
                            <span className="font-bold text-blue-600">{inTransitCount}</span>
                          </div>
                          <div className="bg-white p-2 rounded-xl border border-gray-100">
                            <span className="text-[10px] text-gray-400 block font-bold">ডেলিভার্ড</span>
                            <span className="font-bold text-emerald-600">{deliveredCount}</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-gray-200 flex justify-between text-[11px] text-gray-600">
                          <span>আদায়যোগ্য COD:</span>
                          <strong className="text-rose-600 font-mono">{formatPrice(totalCod)}</strong>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB: ROLE-TAILORED DASHBOARD OVERVIEWS (Super Admin, Admin, Manager, Staff) */}
          {adminTab === 'dashboard' && (
            <RoleDashboards
              setAdminTab={setAdminTab}
              onCallOrder={setOrderForCall}
              onCourierDispatch={setOrderForCourier}
              onEditOrder={setOrderForEdit}
            />
          )}

          {/* TAB: PRODUCTS CATALOG */}
          {adminTab === 'products' && (
            <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-extrabold text-base text-gray-900">
                    {t('পণ্য তালিকা ও ইনভেন্টরি ম্যানেজমেন্ট', 'Products Catalog & Inventory')}
                  </h3>
                  <p className="text-gray-500 text-xs">মূল্য, ডিসকাউন্ট, স্টক ও ভ্যারিয়েন্ট নিয়ন্ত্রণ</p>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={productSearchQuery}
                      onChange={e => setProductSearchQuery(e.target.value)}
                      placeholder="খুঁজুন..."
                      className="bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-3 py-1.5 text-xs w-44"
                    />
                  </div>

                  {hasPermission('products', 'create') && (
                    <button
                      onClick={() => setShowAddProductModal(true)}
                      className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-3 py-1.5 rounded-xl cursor-pointer"
                    >
                      + নতুন পণ্য
                    </button>
                  )}
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-gray-100 rounded-2xl overflow-hidden">
                  <thead className="bg-gray-50 text-gray-500 border-b border-gray-200 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Product</th>
                      <th className="py-2.5 px-3">SKU</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Price</th>
                      <th className="py-2.5 px-3">Stock</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredProducts.map(p => (
                      <tr key={p.id} className="hover:bg-gray-50/50">
                        <td className="py-2.5 px-3">
                          <div className="flex items-center space-x-2.5">
                            <img src={p.images[0]} alt={p.name} className="w-10 h-10 object-cover rounded-xl shrink-0" />
                            <div className="min-w-0">
                              <span className="font-bold text-gray-900 block truncate max-w-xs">{p.name}</span>
                              <span className="text-[10px] text-gray-500">{p.nameBn}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-gray-500">{p.sku}</td>
                        <td className="py-2.5 px-3">{p.category}</td>
                        <td className="py-2.5 px-3 font-bold text-rose-600">{formatPrice(p.price)}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`font-black ${
                              p.stock <= p.lowStockThreshold ? 'text-rose-600 bg-rose-50 px-2 py-0.5 rounded' : 'text-gray-900'
                            }`}
                          >
                            {p.stock} pcs
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            {hasPermission('products', 'edit') && (
                              <button
                                onClick={() => {
                                  const newPriceVal = prompt('নতুন মূল্য লিখুন (৳):', String(p.price));
                                  if (newPriceVal) updateProduct({ ...p, price: Number(newPriceVal) });
                                }}
                                className="text-gray-400 hover:text-blue-600 p-1 cursor-pointer"
                                title="Edit Price"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            )}

                            {hasPermission('products', 'delete') && (
                              <button
                                onClick={() => {
                                  if (confirm(`Are you sure you want to delete ${p.name}?`)) {
                                    deleteProduct(p.id);
                                  }
                                }}
                                className="text-gray-400 hover:text-rose-600 p-1 cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: INVENTORY & LOW STOCK */}
          {adminTab === 'inventory' && (
            <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4 text-xs">
              <div className="flex items-center space-x-2 text-rose-600">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-extrabold text-base text-gray-900">
                  লো স্টক ইনভেন্টরি এলার্ট (৫টি বা তার কম বাকি)
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {lowStockProducts.map(p => (
                  <div key={p.id} className="p-4 bg-rose-50/70 border border-rose-200 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img src={p.images[0]} alt={p.name} className="w-12 h-12 object-cover rounded-xl" />
                      <div>
                        <h4 className="font-bold text-gray-900 line-clamp-1">{p.name}</h4>
                        <span className="text-[10px] text-gray-500 font-mono">SKU: {p.sku}</span>
                        <div className="text-rose-600 font-black mt-0.5">⚠️ মাত্র {p.stock}টি স্টকে বাকি</div>
                      </div>
                    </div>

                    <button
                      onClick={() => updateProduct({ ...p, stock: p.stock + 20 })}
                      className="bg-white hover:bg-rose-600 hover:text-white border border-rose-300 text-rose-700 font-bold px-3 py-1.5 rounded-xl cursor-pointer transition-colors shadow-xs"
                    >
                      +২০ যোগ করুন
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: CATEGORIES & BRANDS */}
          {adminTab === 'categories' && (
            <CategoryManager />
          )}

          {/* TAB: CUSTOMERS */}
          {adminTab === 'customers' && (
            <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4 text-xs">
              <h3 className="font-extrabold text-base text-gray-900">গ্রাহক ডিরেক্টরি ও যোগাযোগ</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-gray-100 rounded-2xl overflow-hidden">
                  <thead className="bg-gray-50 text-gray-500 border-b border-gray-200 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="py-2.5 px-3">Customer</th>
                      <th className="py-2.5 px-3">Phone</th>
                      <th className="py-2.5 px-3">District</th>
                      <th className="py-2.5 px-3">Total Orders</th>
                      <th className="py-2.5 px-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orders.map((o, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50">
                        <td className="py-2.5 px-3 font-bold text-gray-900">{o.customerName}</td>
                        <td className="py-2.5 px-3 font-mono text-gray-600">{o.phone}</td>
                        <td className="py-2.5 px-3">{o.address.district}</td>
                        <td className="py-2.5 px-3 font-bold text-rose-600">{formatPrice(o.totalAmount)}</td>
                        <td className="py-2.5 px-3">
                          <button
                            onClick={() => openWhatsAppCustomer(o)}
                            className="text-green-600 font-bold hover:underline cursor-pointer flex items-center space-x-1"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: COUPONS */}
          {adminTab === 'coupons' && (
            <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-base text-gray-900">কুপন ও প্রমোশনাল কোড</h3>
                <button
                  onClick={() => setShowAddCouponModal(true)}
                  className="bg-rose-600 text-white font-bold px-3 py-1.5 rounded-xl cursor-pointer"
                >
                  + নতুন কুপন
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {coupons.map(c => (
                  <div key={c.code} className="bg-gray-50 p-4 rounded-2xl border border-gray-200 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-mono font-black text-rose-600 text-sm">{c.code}</span>
                      <p className="text-gray-700 font-medium mt-0.5">{c.description}</p>
                      <p className="text-[10px] text-gray-400">Min Purchase: ৳{c.minPurchase} • Expiry: {c.expiryDate}</p>
                    </div>
                    <button
                      onClick={() => deleteCoupon(c.code)}
                      className="text-gray-400 hover:text-rose-600 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: DELIVERY CHARGE & CHATTOGRAM OFFER */}
          {adminTab === 'delivery' && <BusinessSettingsManager initialSection="delivery" />}

          {/* TAB: FLOATING CONTACT WIDGET, LIVE CHAT, WHATSAPP, MESSENGER, CALL (Omnichannel Inbox) */}
          {adminTab === 'livechat' && <OmnichannelChatManager />}

          {/* TAB: ROLES & RBAC MATRIX (Component) */}
          {adminTab === 'roles' && <RolePermissionManager />}

          {/* TAB: SUPER ADMIN BUSINESS SETTINGS (Component) */}
          {adminTab === 'settings' && <BusinessSettingsManager initialSection="general" />}

          {/* TAB: REPORTS & ANALYTICS */}
          {adminTab === 'reports' && (
            <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-5 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-base text-gray-900">বিক্রয় পারফরম্যান্স ও রিপোর্ট</h3>
                  <p className="text-gray-500 text-xs">ক্যাটাগরি ভিত্তিক বিক্রয় ও রাজস্ব বিশ্লেষণ</p>
                </div>
                <button
                  onClick={handleExportCSV}
                  className="bg-gray-900 hover:bg-black text-white font-bold px-3.5 py-2 rounded-xl flex items-center space-x-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Full CSV</span>
                </button>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">ক্যাটাগরি ভিত্তিক বিক্রয়:</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between font-bold mb-1">
                      <span>Men Fashion (ছেলেদের ফ্যাশন)</span>
                      <span>42% (৳14,250)</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-rose-600 h-full w-[42%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-bold mb-1">
                      <span>Gadgets & Devices (গ্যাজেট)</span>
                      <span>35% (৳11,800)</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full w-[35%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-bold mb-1">
                      <span>Women Fashion & Saree (শাড়ি ও ফ্যাশন)</span>
                      <span>23% (৳7,800)</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full w-[23%]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Add Product */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-auto border border-gray-100 flex flex-col max-h-[92vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
              <h3 className="font-extrabold text-base text-gray-900">নতুন পণ্য যোগ করুন</h3>
              <button
                onClick={() => setShowAddProductModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Product Title (English) *</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">পণ্যের নাম (বাংলা) *</label>
                  <input
                    type="text"
                    value={newTitleBn}
                    onChange={e => setNewTitleBn(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Subcategory</label>
                  <input
                    type="text"
                    value={newSubcategory}
                    onChange={e => setNewSubcategory(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">SKU</label>
                  <input
                    type="text"
                    value={newSku}
                    onChange={e => setNewSku(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Price (৳)</label>
                  <input
                    type="number"
                    value={newPrice}
                    onChange={e => setNewPrice(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Old Price (৳)</label>
                  <input
                    type="number"
                    value={newOldPrice}
                    onChange={e => setNewOldPrice(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2 text-xs text-gray-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Cost Price (৳)</label>
                  <input
                    type="number"
                    value={newCostPrice}
                    onChange={e => setNewCostPrice(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Stock</label>
                  <input
                    type="number"
                    value={newStock}
                    onChange={e => setNewStock(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2 text-xs font-bold text-emerald-600"
                  />
                </div>
              </div>

              {/* Direct Product Image Upload (No URL) */}
              <div className="space-y-2">
                <label className="block font-semibold mb-1">পণ্যের ছবি আপলোড (Direct File Upload)</label>
                {newImageUrl ? (
                  <div className="flex items-center space-x-3 p-2 bg-gray-50 border border-gray-200 rounded-xl">
                    <img
                      src={newImageUrl}
                      alt="Product preview"
                      className="w-14 h-14 object-cover rounded-lg border border-gray-200"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-gray-800 truncate">ছবি আপলোড সম্পন্ন</p>
                      <button
                        type="button"
                        onClick={() => setNewImageUrl('')}
                        className="text-[10px] text-rose-600 hover:text-rose-800 font-bold mt-1 cursor-pointer"
                      >
                        ছবি পরিবর্তন বা মুছে ফেলুন
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-gray-300 hover:border-rose-500 hover:bg-rose-50/20 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all">
                    <Upload className="w-6 h-6 text-gray-400 mb-1" />
                    <span className="text-xs font-bold text-gray-700">ডিভাইস থেকে পণ্যের ছবি নির্বাচন করুন</span>
                    <span className="text-[10px] text-gray-400 mt-0.5">PNG, JPG, WEBP (সরাসরি আপলোড)</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setNewImageUrl(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-xl text-xs cursor-pointer shadow-md"
              >
                পণ্য সেভ ও পাবলিশ করুন
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Coupon */}
      {showAddCouponModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 border border-gray-100 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="font-extrabold text-base text-gray-900">নতুন কুপন কোড তৈরি</h3>
              <button onClick={() => setShowAddCouponModal(false)} className="text-gray-400 hover:text-gray-900 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Coupon Code (e.g. EID20)</label>
                <input
                  type="text"
                  required
                  value={newCouponCode}
                  onChange={e => setNewCouponCode(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-mono font-bold uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Discount Amount (৳)</label>
                  <input
                    type="number"
                    value={newCouponVal}
                    onChange={e => setNewCouponVal(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Min Purchase (৳)</label>
                  <input
                    type="number"
                    value={newCouponMin}
                    onChange={e => setNewCouponMin(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-bold"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 rounded-xl cursor-pointer shadow-md"
              >
                কুপন সক্রিয় করুন
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Admin Specific Modals */}
      <OrderCallModal />
      <OrderEditModal />
      <CourierDispatchModal />
      <ShippingLabelModal />
    </div>
  );
};
