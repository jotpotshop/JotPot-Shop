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
  EyeOff,
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
  Target,
  Sliders,
  HelpCircle,
  AlertCircle,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { Product, Order, OrderStatus, CourierPartner, UserRole, NeedTag } from '../types';
import { OCCASIONS_LIST, detectProductOccasions } from '../data/occasionsData';
import { RolePermissionManager } from './admin/RolePermissionManager';
import { BusinessSettingsManager } from './admin/BusinessSettingsManager';
import { CategoryManager } from './admin/CategoryManager';
import { BundleManager } from './admin/BundleManager';
import { OccasionsManager } from './admin/OccasionsManager';
import { OrderCallModal } from './admin/OrderCallModal';
import { OrderEditModal } from './admin/OrderEditModal';
import { CourierDispatchModal } from './admin/CourierDispatchModal';
import { CourierManager } from './admin/CourierManager';
import { ShippingLabelModal } from './admin/ShippingLabelModal';
import { OmnichannelChatManager } from './admin/OmnichannelChatManager';
import { HelpCenterManager } from './admin/HelpCenterManager';
import { TrustSectionManager } from './admin/TrustSectionManager';
import { RoleDashboards } from './admin/RoleDashboards';
import {
  ProductAddModal,
  ProductEditModal,
  ProductDeleteModal,
  BulkProductEditModal,
  BulkProductDeleteModal,
} from './admin/ProductModals';

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

export const ROLE_PERMITTED_TABS: Record<UserRole, string[]> = {
  SUPER_ADMIN: [
    'dashboard',
    'orders',
    'livechat',
    'couriers',
    'products',
    'inventory',
    'categories',
    'bundles',
    'occasions',
    'customers',
    'coupons',
    'delivery',
    'reports',
    'helpcenter',
    'trustsection',
    'roles',
    'settings',
  ],
  ADMIN: [
    'dashboard',
    'orders',
    'livechat',
    'couriers',
    'products',
    'inventory',
    'categories',
    'bundles',
    'occasions',
    'customers',
    'coupons',
    'delivery',
    'reports',
    'helpcenter',
    'trustsection',
    'settings',
  ],
  MANAGER: [
    'dashboard',
    'orders',
    'livechat',
    'couriers',
    'inventory',
    'products',
    'categories',
  ],
  STAFF: [
    'dashboard',
    'orders',
    'livechat',
    'products',
  ],
};

export const AdminPanel: React.FC = () => {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    bulkDeleteProducts,
    bulkUpdateProducts,
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
    updateCustomerStatus,
    adminUser,
    purgeAllDemoData,
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
    | 'bundles'
    | 'occasions'
    | 'couriers'
    | 'customers'
    | 'coupons'
    | 'delivery'
    | 'livechat'
    | 'roles'
    | 'settings'
    | 'reports'
    | 'helpcenter'
    | 'trustsection'
  >('dashboard'); // Defaults to role-specific dashboard

  // Strict RBAC Tab Access Enforcement: Prevent unauthorized role from accessing hidden tabs
  useEffect(() => {
    const permitted = ROLE_PERMITTED_TABS[currentRole] || ['dashboard'];
    if (!permitted.includes(adminTab)) {
      setAdminTab('dashboard');
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

  // Edit & Delete Product Modals State
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [confirmOrderPurgeDemo, setConfirmOrderPurgeDemo] = useState(false);
  const [adminToast, setAdminToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (adminToast) {
      const timer = setTimeout(() => setAdminToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [adminToast]);

  const handleCreateProductAsync = async (created: Product): Promise<{ success: boolean; error?: string }> => {
    const res = await addProduct(created);
    if (res.success) {
      setAdminToast({
        message: `"${created.nameBn || created.name}" পণ্যটি সফলভাবে Firebase-এ সংরক্ষিত ও স্টোরে লাইভ করা হয়েছে!`,
        type: 'success',
      });
      return { success: true };
    } else {
      setAdminToast({
        message: `পণ্য সংরক্ষণ ব্যর্থ: ${res.error || 'Firebase-এ সেভ করা সম্ভব হয়নি'}`,
        type: 'error',
      });
      return { success: false, error: res.error };
    }
  };

  const handleSaveProductEdit = async (updated: Product) => {
    const res = await updateProduct(updated);
    if (res.success) {
      setProductToEdit(null);
      setAdminToast({ message: `"${updated.nameBn || updated.name}" পণ্যটি সফলভাবে আপডেট করা হয়েছে!`, type: 'success' });
      return true;
    } else {
      setAdminToast({ message: `আপডেট ব্যর্থ: ${res.error || 'Firebase-এ আপডেট করা সম্ভব হয়নি'}`, type: 'error' });
      return false;
    }
  };

  const handleConfirmProductDelete = async (productId: string) => {
    const target = products.find(p => p.id === productId);
    const res = await deleteProduct(productId);
    if (res.success) {
      setProductToDelete(null);
      setAdminToast({ message: `"${target?.nameBn || target?.name || 'পণ্য'}" সফলভাবে মুছে ফেলা হয়েছে!`, type: 'success' });
    } else {
      setAdminToast({ message: `মুছে ফেলা ব্যর্থ: ${res.error || 'Firebase ত্রুটি'}`, type: 'error' });
    }
  };

  // Bulk Product Selection & Actions State
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);

  const handleToggleSelectProduct = (productId: string) => {
    setSelectedProductIds(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const handleClearSelection = () => {
    setSelectedProductIds([]);
  };

  const handleBulkDeleteConfirm = async (productIds: string[]) => {
    const res = await bulkDeleteProducts(productIds);
    if (res.success) {
      setSelectedProductIds([]);
      setShowBulkDeleteModal(false);
      setAdminToast({
        message: `নির্বাচিত ${productIds.length}টি পণ্য সফলভাবে Firebase থেকে মুছে ফেলা হয়েছে!`,
        type: 'success',
      });
    } else {
      setAdminToast({
        message: `বাল্ক ডিলিট ব্যর্থ: ${res.error || 'Firebase-এ মুছে ফেলা যায়নি'}`,
        type: 'error',
      });
    }
  };

  const handleBulkEditSave = async (
    productIds: string[],
    updates: Partial<Product>,
    perProductUpdates?: Record<string, Partial<Product>>
  ): Promise<{ success: boolean; error?: string }> => {
    const res = await bulkUpdateProducts(productIds, updates, perProductUpdates);
    if (res.success) {
      setSelectedProductIds([]);
      setShowBulkEditModal(false);
      setAdminToast({
        message: `নির্বাচিত ${productIds.length}টি পণ্যের তথ্য সফলভাবে Firebase-এ আপডেট করা হয়েছে!`,
        type: 'success',
      });
    } else {
      setAdminToast({
        message: `বাল্ক আপডেট ব্যর্থ: ${res.error || 'Firebase-এ সেভ করা যায়নি'}`,
        type: 'error',
      });
    }
    return res;
  };

  const handleRoleSwitch = (newRole: UserRole) => {
    setCurrentRole(newRole);
    const permitted = ROLE_PERMITTED_TABS[newRole] || ['dashboard'];
    if (!permitted.includes(adminTab)) {
      setAdminTab('dashboard');
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


  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;

    const res = await addCoupon({
      code: newCouponCode.trim().toUpperCase(),
      discountType: newCouponType,
      discountValue: Number(newCouponVal),
      minPurchase: Number(newCouponMin),
      description: newCouponDesc || `Special discount on orders above ৳${newCouponMin}`,
      descriptionBn: `৳${newCouponMin} বা তার বেশি অর্ডারে বিশেষ ছাড়`,
      active: true,
      expiryDate: '2026-12-31',
    });

    if (res.success) {
      setShowAddCouponModal(false);
      setNewCouponCode('');
      setAdminToast({ message: 'নতুন কুপন সফলভাবে সংরক্ষণ করা হয়েছে!', type: 'success' });
    } else {
      setAdminToast({ message: `কুপন সেভ ব্যর্থ: ${res.error || 'Firebase ত্রুটি'}`, type: 'error' });
    }
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

  const roleLabelBn =
    currentRole === 'SUPER_ADMIN'
      ? 'সুপার এডমিন'
      : currentRole === 'ADMIN'
      ? 'স্টোর এডমিন'
      : currentRole === 'MANAGER'
      ? 'অপারেশন ম্যানেজার'
      : 'সাপোর্ট স্টাফ';

  return (
    <div className="min-h-screen bg-[#faf9f7] p-3 sm:p-6 text-[#111827]">
      {/* Top Business Control Header */}
      <div className="max-w-7xl mx-auto bg-white rounded-2xl p-4 sm:px-6 sm:py-4 border border-[#e6e3dd] mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <button
            onClick={() => {
              setIsAdminView(false);
              if (typeof window !== 'undefined') {
                window.history.pushState(null, '', '/');
                window.dispatchEvent(new PopStateEvent('popstate'));
              }
            }}
            className="min-h-[38px] p-2.5 bg-[#faf9f7] hover:bg-[#f3f1ed] border border-[#e6e3dd] rounded-xl text-[#374151] hover:text-[#111827] transition-colors cursor-pointer shrink-0"
            title={t('গ্রাহক স্টোরে ফিরে যান', 'Back to Storefront')}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          {websiteSettings.logoUrl && (
            <div className="h-10 max-w-[120px] hidden sm:flex items-center justify-center p-1.5 bg-[#faf9f7] border border-[#e6e3dd] rounded-xl overflow-hidden shrink-0">
              <img
                src={websiteSettings.logoUrl}
                alt={websiteSettings.storeName}
                referrerPolicy="no-referrer"
                className="max-h-7 max-w-[100px] object-contain"
              />
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-[#111827] truncate">
              {websiteSettings.storeName} কন্ট্রোল সেন্টার
            </h1>
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#6b7280] mt-0.5 tabular-nums">
              <ShieldCheck className="w-3.5 h-3.5 text-[#15803d] shrink-0" />
              <span className="font-semibold text-[#111827]">{adminUser?.name || 'অ্যাডমিন'}</span>
              <span aria-hidden="true">·</span>
              <span className="font-medium text-[#881337]">{roleLabelBn}</span>
              <span aria-hidden="true">·</span>
              <span>অনুমোদিত মডিউল: {ROLE_PERMITTED_TABS[currentRole].length}/{ROLE_PERMITTED_TABS.SUPER_ADMIN.length}টি</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {hasNewOrderAlert && (
            <button
              type="button"
              onClick={dismissNewOrderAlert}
              className="min-h-[38px] bg-[#fef2f2] border border-[#fecaca] text-[#991b1b] px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer tabular-nums"
              title="নতুন অর্ডার এসেছে — ক্লিক করে অ্যালার্ট বন্ধ করুন"
            >
              <Bell className="w-4 h-4 text-[#881337]" />
              <span>নতুন অর্ডার ({pendingOrdersCount})</span>
            </button>
          )}

          {hasPermission('products', 'create') && (
            <button
              onClick={() => setShowAddProductModal(true)}
              className="min-h-[38px] bg-[#881337] hover:bg-[#6d0f2c] text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>{t('নতুন পণ্য যোগ', 'Add Product')}</span>
            </button>
          )}

          {hasPermission('orders', 'export') && (
            <button
              onClick={handleExportCSV}
              className="min-h-[38px] bg-[#111827] hover:bg-black text-white text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap"
              title={t('সব অর্ডার এক্সপোর্ট করুন', 'Export Orders CSV')}
            >
              <Download className="w-4 h-4" />
              <span>CSV এক্সপোর্ট</span>
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Sidebar Menu tailored by User Role */}
        <aside className="md:col-span-3 bg-white rounded-2xl p-3 border border-[#e6e3dd] h-fit space-y-1 text-xs font-semibold text-[#374151]">
          <div className="px-3 py-2.5 mb-2 rounded-xl bg-[#faf9f7] border border-[#e6e3dd] flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[#6b7280] block">বর্তমান রোল</span>
              <span className="text-xs font-bold text-[#111827]">{roleLabelBn}</span>
            </div>
            <span className="text-[10px] font-mono text-[#6b7280]">
              {currentRole}
            </span>
          </div>

          {/* 1. Dashboard Overview */}
          <button
            onClick={() => setAdminTab('dashboard')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer ${
              adminTab === 'dashboard' ? 'bg-[#111827] text-white' : 'hover:bg-[#faf9f7] hover:text-[#111827]'
            }`}
          >
            <TrendingUp className="w-4 h-4 shrink-0" />
            <span className="truncate">
              {currentRole === 'STAFF'
                ? t('স্টাফ ড্যাশবোর্ড', 'Staff Dashboard')
                : currentRole === 'MANAGER'
                ? t('ম্যানেজার ড্যাশবোর্ড', 'Manager Dashboard')
                : currentRole === 'ADMIN'
                ? t('এডমিন ড্যাশবোর্ড', 'Admin Dashboard')
                : t('সুপার এডমিন ড্যাশবোর্ড', 'Executive Dashboard')}
            </span>
          </button>

          {/* 2. Orders & Call Verification Hub */}
          <button
            onClick={() => setAdminTab('orders')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
              adminTab === 'orders' ? 'bg-[#111827] text-white' : 'hover:bg-[#faf9f7] hover:text-[#111827]'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <ShoppingCart className="w-4 h-4 shrink-0" />
              <span className="truncate">{t('অর্ডার ও কল হাব', 'Orders & Call Hub')}</span>
            </div>
            {pendingOrdersCount > 0 && (
              <span
                className={`text-[11px] font-bold tabular-nums shrink-0 ${
                  adminTab === 'orders' ? 'text-[#fb7185]' : 'text-[#881337]'
                }`}
              >
                {pendingOrdersCount}
              </span>
            )}
          </button>

          {/* 3. Omnichannel Customer Live Chat */}
          <button
            onClick={() => setAdminTab('livechat')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
              adminTab === 'livechat' ? 'bg-[#111827] text-white' : 'hover:bg-[#faf9f7] hover:text-[#111827]'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <MessageSquare className="w-4 h-4 shrink-0" />
              <span className="truncate">{t('লাইভ চ্যাট ইনবক্স', 'Customer Chat Inbox')}</span>
            </div>
            {unreadChatCount > 0 && (
              <span className="text-[11px] font-bold tabular-nums text-[#881337] shrink-0">
                {unreadChatCount}
              </span>
            )}
          </button>

          {/* 4. Couriers Logistics */}
          {ROLE_PERMITTED_TABS[currentRole].includes('couriers') && (
            <button
              onClick={() => setAdminTab('couriers')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer ${
                adminTab === 'couriers' ? 'bg-[#111827] text-white' : 'hover:bg-[#faf9f7] hover:text-[#111827]'
              }`}
            >
              <Truck className="w-4 h-4 shrink-0" />
              <span className="truncate">{t('কুরিয়ার ও চালান', 'Courier Logistics')}</span>
            </button>
          )}

          {/* 5. Products Catalog */}
          {ROLE_PERMITTED_TABS[currentRole].includes('products') && (
            <button
              onClick={() => setAdminTab('products')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                adminTab === 'products' ? 'bg-[#111827] text-white' : 'hover:bg-[#faf9f7] hover:text-[#111827]'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Package className="w-4 h-4 shrink-0" />
                <span className="truncate">{t('পণ্য তালিকা ও স্টক', 'Products Catalog')}</span>
              </div>
              <span className="text-[11px] opacity-60 font-mono tabular-nums shrink-0">{products.length}</span>
            </button>
          )}

          {/* 6. Inventory Low Stock Alerts */}
          {ROLE_PERMITTED_TABS[currentRole].includes('inventory') && (
            <button
              onClick={() => setAdminTab('inventory')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                adminTab === 'inventory' ? 'bg-[#111827] text-white' : 'hover:bg-[#faf9f7] hover:text-[#111827]'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span className="truncate">{t('লো স্টক সতর্কবার্তা', 'Low Stock Alerts')}</span>
              </div>
              {lowStockProducts.length > 0 && (
                <span className={`text-[11px] font-bold tabular-nums shrink-0 ${adminTab === 'inventory' ? 'text-[#fb7185]' : 'text-[#b91c1c]'}`}>
                  {lowStockProducts.length}
                </span>
              )}
            </button>
          )}

          {/* 7. Categories */}
          {ROLE_PERMITTED_TABS[currentRole].includes('categories') && (
            <button
              onClick={() => setAdminTab('categories')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer ${
                adminTab === 'categories' ? 'bg-[#111827] text-white' : 'hover:bg-[#faf9f7] hover:text-[#111827]'
              }`}
            >
              <Layers className="w-4 h-4 shrink-0" />
              <span className="truncate">{t('ক্যাটাগরি ও ব্র্যান্ডস', 'Categories & Brands')}</span>
            </button>
          )}

          {/* 7b. Complete The Look (Combo Bundles) */}
          {ROLE_PERMITTED_TABS[currentRole].includes('bundles') && (
            <button
              onClick={() => setAdminTab('bundles')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer ${
                adminTab === 'bundles' ? 'bg-[#111827] text-white' : 'hover:bg-[#faf9f7] hover:text-[#111827]'
              }`}
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              <span className="truncate">{t('কম্বো বান্ডেল', 'Combo Bundles')}</span>
            </button>
          )}

          {/* 7c. Occasions & Need Collections */}
          {ROLE_PERMITTED_TABS[currentRole].includes('occasions') && (
            <button
              onClick={() => setAdminTab('occasions')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer ${
                adminTab === 'occasions' ? 'bg-[#111827] text-white' : 'hover:bg-[#faf9f7] hover:text-[#111827]'
              }`}
            >
              <Target className="w-4 h-4 shrink-0" />
              <span className="truncate">{t('উপলক্ষ কালেকশন', 'Occasions & Needs')}</span>
            </button>
          )}

          {/* 8. Customers Directory */}
          {ROLE_PERMITTED_TABS[currentRole].includes('customers') && (
            <button
              onClick={() => setAdminTab('customers')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer ${
                adminTab === 'customers' ? 'bg-[#111827] text-white' : 'hover:bg-[#faf9f7] hover:text-[#111827]'
              }`}
            >
              <Users className="w-4 h-4 shrink-0" />
              <span className="truncate">{t('গ্রাহক ডিরেক্টরি', 'Customers Directory')}</span>
            </button>
          )}

          {/* 9. Coupons & Discounts */}
          {ROLE_PERMITTED_TABS[currentRole].includes('coupons') && (
            <button
              onClick={() => setAdminTab('coupons')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer ${
                adminTab === 'coupons' ? 'bg-[#111827] text-white' : 'hover:bg-[#faf9f7] hover:text-[#111827]'
              }`}
            >
              <Tag className="w-4 h-4 shrink-0" />
              <span className="truncate">{t('কুপন ও ডিসকাউন্ট', 'Coupons & Deals')}</span>
            </button>
          )}

          {/* 10. Delivery & Chattogram Offer */}
          {ROLE_PERMITTED_TABS[currentRole].includes('delivery') && (
            <button
              onClick={() => setAdminTab('delivery')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                adminTab === 'delivery' ? 'bg-[#111827] text-white' : 'hover:bg-[#faf9f7] hover:text-[#111827]'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Truck className="w-4 h-4 shrink-0" />
                <span className="truncate">{t('ডেলিভারি চার্জ ও অফার', 'Delivery Policies')}</span>
              </div>
              {deliverySettings.chattogramFreeDeliveryOffer && (
                <span className="text-[10px] font-bold text-[#15803d] shrink-0">চালু</span>
              )}
            </button>
          )}

          {/* 11. Reports */}
          {ROLE_PERMITTED_TABS[currentRole].includes('reports') && (
            <button
              onClick={() => setAdminTab('reports')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer ${
                adminTab === 'reports' ? 'bg-[#111827] text-white' : 'hover:bg-[#faf9f7] hover:text-[#111827]'
              }`}
            >
              <FileText className="w-4 h-4 shrink-0" />
              <span className="truncate">{t('বিক্রয় ও রিপোর্ট', 'Sales & Reports')}</span>
            </button>
          )}

          {/* 11b. Customer Support & Help Center */}
          {ROLE_PERMITTED_TABS[currentRole].includes('helpcenter') && (
            <button
              onClick={() => setAdminTab('helpcenter')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer ${
                adminTab === 'helpcenter' ? 'bg-[#111827] text-white' : 'hover:bg-[#faf9f7] hover:text-[#111827]'
              }`}
            >
              <HelpCircle className="w-4 h-4 shrink-0" />
              <span className="truncate">{t('হেল্প সেন্টার ও FAQ', 'Help Center & FAQ')}</span>
            </button>
          )}

          {/* 11c. Section Management */}
          {ROLE_PERMITTED_TABS[currentRole].includes('trustsection') && (
            <button
              onClick={() => setAdminTab('trustsection')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer ${
                adminTab === 'trustsection' ? 'bg-[#111827] text-white' : 'hover:bg-[#faf9f7] hover:text-[#111827]'
              }`}
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span className="truncate">{t('নিশ্চিন্ত কেনাকাটা সেকশন', 'Trust Section Editor')}</span>
            </button>
          )}

          {/* 12. RBAC Roles & Team Matrix */}
          {ROLE_PERMITTED_TABS[currentRole].includes('roles') && (
            <button
              onClick={() => setAdminTab('roles')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer ${
                adminTab === 'roles' ? 'bg-[#111827] text-white' : 'hover:bg-[#faf9f7] hover:text-[#111827]'
              }`}
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span className="truncate">{t('রোল ও পারমিশন', 'Roles & RBAC')}</span>
            </button>
          )}

          {/* 13. All Business & Payment Settings */}
          {ROLE_PERMITTED_TABS[currentRole].includes('settings') && (
            <button
              onClick={() => setAdminTab('settings')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer ${
                adminTab === 'settings' ? 'bg-[#111827] text-white' : 'hover:bg-[#faf9f7] hover:text-[#111827]'
              }`}
            >
              <Settings className="w-4 h-4 shrink-0" />
              <span className="truncate">{t('বিজনেস ও পেমেন্ট সেটিংস', 'Business Settings')}</span>
            </button>
          )}
        </aside>

        {/* Right Dynamic Tab Content */}
        <div className="md:col-span-9 space-y-6">
          {!ROLE_PERMITTED_TABS[currentRole].includes(adminTab) ? (
            <AccessRestrictedCard
              role={currentRole}
              requiredRole={
                adminTab === 'roles'
                  ? 'SUPER_ADMIN'
                  : 'ADMIN / SUPER_ADMIN'
              }
              moduleName={adminTab.toUpperCase()}
              onGoBack={() => setAdminTab('dashboard')}
            />
          ) : (
            <>
              {/* TAB 1: ROLE-TAILORED DASHBOARD */}
              {adminTab === 'dashboard' && (
                <RoleDashboards
                  setAdminTab={setAdminTab}
                  onCallOrder={setOrderForCall}
                  onCourierDispatch={setOrderForCourier}
                  onEditOrder={setOrderForEdit}
                />
              )}

              {/* TAB 2: ORDERS & CONFIRMATION SYSTEM */}
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

                  {/* Search Order input & Super Admin demo cleaner */}
                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    {currentRole === 'SUPER_ADMIN' && (
                      !confirmOrderPurgeDemo ? (
                        <button
                          type="button"
                          onClick={() => setConfirmOrderPurgeDemo(true)}
                          className="min-h-[38px] bg-[#faf9f7] hover:bg-[#f3f1ed] text-[#881337] border border-[#e6e3dd] font-semibold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors shrink-0"
                          title="সিস্টেমের সমস্ত ডেমো অর্ডার ডিলিট করুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{t('ডেমো অর্ডার ক্লিন', 'Purge Demo')}</span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-1.5 bg-[#fef2f2] border border-[#fecaca] rounded-xl px-2.5 py-1.5">
                          <span className="text-xs font-semibold text-[#991b1b]">নিশ্চিত?</span>
                          <button
                            type="button"
                            onClick={() => {
                              const res = purgeAllDemoData();
                              setConfirmOrderPurgeDemo(false);
                              setAdminToast({
                                message: res.message,
                                type: res.success ? 'success' : 'error',
                              });
                            }}
                            className="bg-[#991b1b] hover:bg-[#7f1d1d] text-white font-semibold text-xs px-2.5 py-1 rounded-lg cursor-pointer"
                          >
                            হ্যাঁ
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmOrderPurgeDemo(false)}
                            className="bg-white border border-[#e6e3dd] text-[#374151] text-xs px-2 py-1 rounded-lg cursor-pointer"
                          >
                            না
                          </button>
                        </div>
                      )
                    )}

                    <div className="relative w-full sm:w-72">
                      <Search className="w-4 h-4 text-[#6b7280] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={orderSearchQuery}
                        onChange={e => setOrderSearchQuery(e.target.value)}
                        placeholder={t('আইডি, নাম, ফোন বা জেলা দিয়ে খুঁজুন...', 'Search ID, name, phone, district...')}
                        className="w-full min-h-[38px] bg-[#faf9f7] border border-[#e6e3dd] rounded-xl pl-9 pr-3 py-2 text-xs text-[#111827] focus:bg-white focus:border-[#881337] focus:outline-hidden"
                      />
                    </div>
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

                            <div className="space-y-0.5 font-mono text-xs tabular-nums">
                              <div className="flex items-center gap-1.5 text-[#111827] font-semibold">
                                <Phone className="w-3.5 h-3.5 text-[#6b7280] shrink-0" />
                                <span>{order.phone}</span>
                              </div>
                              {order.alternativePhone && (
                                <div className="text-[#6b7280] text-[11px] pl-5">
                                  <span>Alt: {order.alternativePhone}</span>
                                </div>
                              )}
                            </div>

                            <p className="text-[#4b5563] leading-relaxed text-[11px] pt-1">
                              <strong className="text-[#111827]">{order.address.district}</strong> · {order.address.area}
                              <br />
                              <span className="text-[#6b7280]">{order.address.fullAddress}</span>
                            </p>

                            {/* Customer Note */}
                            {order.customerNote && (
                              <div className="bg-[#faf9f7] text-[#374151] border border-[#e6e3dd] p-2.5 rounded-xl text-[11px] mt-1">
                                <strong>গ্রাহকের নোট:</strong> "{order.customerNote}"
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

                            {hasPermission('orders', 'edit') && (
                              <button
                                onClick={() => setOrderForEdit(order)}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center space-x-1.5 cursor-pointer transition-colors"
                              >
                                <Edit className="w-3.5 h-3.5" />
                                <span>{t('এডিট অর্ডার', 'Edit')}</span>
                              </button>
                            )}
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
                            {order.courierInfo && currentRole !== 'STAFF' && (
                              <button
                                onClick={() => setOrderForShippingLabel(order)}
                                className="bg-gray-900 hover:bg-black text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center space-x-1.5 cursor-pointer transition-colors"
                              >
                                <Printer className="w-3.5 h-3.5" />
                                <span>{t('চালান ও লেবেল', 'Shipping Label')}</span>
                              </button>
                            )}

                            {/* Official Invoice Print */}
                            {currentRole !== 'STAFF' && (
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
                            )}

                            {/* Hold / Cancel (Admin & Super Admin only) */}
                            {order.status !== 'Cancelled' && order.status !== 'Delivered' && hasPermission('orders', 'delete') && (
                              <div className="flex items-center space-x-1">
                                <button
                                  onClick={() => holdOrder(order.id, `${currentRole} put on hold for verification`)}
                                  className="text-gray-400 hover:text-orange-600 p-1 rounded hover:bg-orange-50 cursor-pointer"
                                  title={t('হোল্ডে রাখুন', 'Hold Order')}
                                >
                                  <PauseCircle className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => cancelOrder(order.id, `Cancelled by ${currentRole}`)}
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
          {adminTab === 'couriers' && <CourierManager />}

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

              {/* Staff / Manager Role Awareness Notice */}
              {currentRole === 'STAFF' && (
                <div className="bg-[#faf9f7] border border-[#e6e3dd] text-[#374151] rounded-xl p-3 flex items-center gap-2 text-xs">
                  <Eye className="w-4 h-4 text-[#111827] shrink-0" />
                  <span>
                    <strong>স্টাফ ভিউ (রিড-অনলি):</strong> কাস্টমার প্রশ্নের উত্তর দিতে স্টক ও মূল্য অনুসন্ধান করুন। পণ্য তৈরি বা মূল্য পরিবর্তন অনুমোদিত নয়।
                  </span>
                </div>
              )}
              {currentRole === 'MANAGER' && (
                <div className="bg-[#faf9f7] border border-[#e6e3dd] text-[#374151] rounded-xl p-3 flex items-center gap-2 text-xs">
                  <Package className="w-4 h-4 text-[#15803d] shrink-0" />
                  <span>
                    <strong>ম্যানেজার ভিউ:</strong> ক্যাটালগ ও ওয়্যারহাউজ স্টক নিরীক্ষণ। নতুন পণ্য তৈরি ও মূল্য পরিবর্তন স্টোর এডমিনের ক্ষমতা।
                  </span>
                </div>
              )}

              {/* Bulk Actions Bar */}
              {(currentRole === 'SUPER_ADMIN' || currentRole === 'ADMIN') && selectedProductIds.length > 0 && (
                <div className="bg-[#faf9f7] border border-[#881337]/30 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#881337] text-white flex items-center justify-center font-bold text-xs tabular-nums">
                      {selectedProductIds.length}
                    </div>
                    <div>
                      <span className="font-bold text-xs text-[#111827] block tabular-nums">
                        {selectedProductIds.length}টি পণ্য নির্বাচিত
                      </span>
                      <span className="text-[11px] text-[#6b7280]">
                        একসাথে একাধিক পণ্যের মূল্য, স্টক, ক্যাটাগরি পরিবর্তন বা মুছে ফেলুন
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowBulkEditModal(true)}
                      className="min-h-[36px] bg-[#111827] hover:bg-black text-white font-semibold px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>বাল্ক এডিট ({selectedProductIds.length})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowBulkDeleteModal(true)}
                      className="min-h-[36px] bg-[#881337] hover:bg-[#6d0f2c] text-white font-semibold px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>বাল্ক ডিলিট ({selectedProductIds.length})</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleClearSelection}
                      className="min-h-[36px] bg-white hover:bg-[#f3f1ed] text-[#374151] font-semibold px-3 py-1.5 rounded-xl text-xs border border-[#e6e3dd] transition-colors cursor-pointer"
                    >
                      বাতিল
                    </button>
                  </div>
                </div>
              )}

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-[#e6e3dd] rounded-xl overflow-hidden">
                  <thead className="bg-[#faf9f7] text-[#6b7280] border-b border-[#e6e3dd] font-semibold text-[11px]">
                    <tr>
                      {(currentRole === 'SUPER_ADMIN' || currentRole === 'ADMIN') && (
                        <th className="py-2.5 px-3 w-10 text-center">
                          <input
                            type="checkbox"
                            checked={
                              filteredProducts.length > 0 &&
                              filteredProducts.every(p => selectedProductIds.includes(p.id))
                            }
                            ref={input => {
                              if (input) {
                                const allSel =
                                  filteredProducts.length > 0 &&
                                  filteredProducts.every(p => selectedProductIds.includes(p.id));
                                const someSel =
                                  filteredProducts.some(p => selectedProductIds.includes(p.id)) && !allSel;
                                input.indeterminate = someSel;
                              }
                            }}
                            onChange={() => {
                              const filteredIds = filteredProducts.map(p => p.id);
                              const allSel =
                                filteredProducts.length > 0 &&
                                filteredProducts.every(p => selectedProductIds.includes(p.id));
                              if (allSel) {
                                setSelectedProductIds(prev =>
                                  prev.filter(id => !filteredIds.includes(id))
                                );
                              } else {
                                setSelectedProductIds(prev =>
                                  Array.from(new Set([...prev, ...filteredIds]))
                                );
                              }
                            }}
                            className="w-4 h-4 rounded text-[#881337] focus:ring-[#881337] cursor-pointer accent-[#881337]"
                            title="সবগুলো ফিল্টার্ড পণ্য নির্বাচন করুন"
                          />
                        </th>
                      )}
                      <th className="py-2.5 px-3">পণ্য</th>
                      <th className="py-2.5 px-3">SKU</th>
                      <th className="py-2.5 px-3">ক্যাটাগরি</th>
                      <th className="py-2.5 px-3">মূল্য</th>
                      <th className="py-2.5 px-3">স্টক</th>
                      <th className="py-2.5 px-3 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f3f1ed]">
                    {filteredProducts.map(p => {
                      const isSelected = selectedProductIds.includes(p.id);
                      return (
                        <tr
                          key={p.id}
                          className={isSelected ? 'bg-[#881337]/5 transition-colors' : 'hover:bg-[#faf9f7] transition-colors'}
                        >
                          {(currentRole === 'SUPER_ADMIN' || currentRole === 'ADMIN') && (
                            <td className="py-2.5 px-3 text-center">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggleSelectProduct(p.id)}
                                className="w-4 h-4 rounded text-[#881337] focus:ring-[#881337] cursor-pointer accent-[#881337]"
                              />
                            </td>
                          )}
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-2.5">
                              {p.images?.[0] ? (
                                <img
                                  src={p.images[0]}
                                  alt={p.name}
                                  referrerPolicy="no-referrer"
                                  className="w-10 h-10 object-cover rounded-lg border border-[#e6e3dd] shrink-0 bg-[#faf9f7]"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-[#faf9f7] border border-[#e6e3dd] flex items-center justify-center text-[#9ca3af] shrink-0">
                                  <Package className="w-4 h-4" />
                                </div>
                              )}
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-semibold text-[#111827] block truncate max-w-[200px]">{p.name}</span>
                                  <span className="text-[11px] text-[#6b7280]">·</span>
                                  <span className={`text-[11px] font-medium ${p.isPublished === false ? 'text-[#6b7280]' : 'text-[#15803d]'}`}>
                                    {p.isPublished === false ? 'লুকানো' : 'লাইভ'}
                                  </span>
                                </div>
                                <span className="text-[11px] text-[#6b7280]">{p.nameBn}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 font-mono font-medium text-[#6b7280] tabular-nums">{p.sku}</td>
                          <td className="py-2.5 px-3 text-[#374151]">{p.category}</td>
                          <td className="py-2.5 px-3 font-bold text-[#111827] tabular-nums">{formatPrice(p.price)}</td>
                          <td className="py-2.5 px-3 tabular-nums">
                            <span
                              className={`font-semibold ${
                                p.stock <= p.lowStockThreshold ? 'text-[#b91c1c]' : 'text-[#111827]'
                              }`}
                            >
                              {p.stock} পিস
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {(currentRole === 'SUPER_ADMIN' || currentRole === 'ADMIN') && (
                                <>
                                  <button
                                    onClick={async () => {
                                      const nextPublished = !(p.isPublished !== false);
                                      const res = await updateProduct({ ...p, isPublished: nextPublished });
                                      if (res.success) {
                                        setAdminToast({
                                          message: nextPublished
                                            ? `"${p.nameBn || p.name}" স্টোরে প্রকাশিত হয়েছে।`
                                            : `"${p.nameBn || p.name}" স্টোর থেকে লুকানো হয়েছে।`,
                                          type: 'success',
                                        });
                                      } else {
                                        setAdminToast({ message: `ত্রুটি: ${res.error}`, type: 'error' });
                                      }
                                    }}
                                    className={`p-1.5 rounded-lg border border-transparent cursor-pointer transition-colors ${
                                      p.isPublished === false
                                        ? 'text-[#6b7280] hover:bg-[#f3f1ed]'
                                        : 'text-[#15803d] hover:bg-[#f0fdf4]'
                                    }`}
                                    title={p.isPublished === false ? 'স্টোরে প্রকাশ করুন' : 'স্টোর থেকে লুকান'}
                                  >
                                    {p.isPublished === false ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                  </button>
                                  <button
                                    onClick={() => setProductToEdit(p)}
                                    className="p-1.5 rounded-lg text-[#111827] hover:bg-[#faf9f7] border border-transparent hover:border-[#e6e3dd] cursor-pointer transition-colors"
                                    title="পণ্য সম্পাদনা করুন"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => setProductToDelete(p)}
                                    className="p-1.5 rounded-lg text-[#b91c1c] hover:bg-[#fef2f2] border border-transparent cursor-pointer transition-colors"
                                    title="পণ্য মুছে ফেলুন"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </>
                              )}

                              {currentRole === 'MANAGER' && (
                                <span className="text-[11px] text-[#15803d] font-medium">
                                  ওয়্যারহাউজ ভিউ
                                </span>
                              )}

                              {currentRole === 'STAFF' && (
                                <span className="text-[11px] text-[#6b7280]">লুকআপ অনলি</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: INVENTORY & LOW STOCK */}
          {adminTab === 'inventory' && (
            <div className="bg-white rounded-2xl p-6 border border-[#e6e3dd] space-y-4 text-xs">
              <div className="flex items-center gap-2 text-[#b91c1c]">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-bold text-base text-[#111827]">
                  লো স্টক ইনভেন্টরি অ্যালার্ট (৫টি বা তার কম বাকি)
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {lowStockProducts.map(p => (
                  <div key={p.id} className="p-4 bg-[#fef2f2]/60 border border-[#fecaca] rounded-xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {p.images?.[0] ? (
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 object-cover rounded-xl border border-[#fecaca] shrink-0 bg-white"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-white border border-[#fecaca] flex items-center justify-center text-[#b91c1c] shrink-0">
                          <Package className="w-5 h-5" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <h4 className="font-bold text-[#111827] truncate">{p.name}</h4>
                        <span className="text-[11px] text-[#6b7280] font-mono tabular-nums block">SKU: {p.sku}</span>
                        <div className="text-[#b91c1c] font-bold mt-0.5 tabular-nums">মাত্র {p.stock}টি স্টকে বাকি</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {(currentRole === 'SUPER_ADMIN' || currentRole === 'ADMIN') && (
                        <button
                          onClick={() => setProductToEdit(p)}
                          className="bg-white hover:bg-[#faf9f7] border border-[#e6e3dd] text-[#111827] font-semibold px-2.5 py-1.5 rounded-xl cursor-pointer transition-colors text-xs flex items-center gap-1"
                          title="পণ্য সম্পাদনা করুন"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>এডিট</span>
                        </button>
                      )}
                      <button
                        onClick={async () => {
                          const nextVariantStocks = p.variantStocks ? { ...p.variantStocks } : undefined;
                          if (nextVariantStocks) {
                            Object.keys(nextVariantStocks).forEach(k => {
                              nextVariantStocks[k] = (nextVariantStocks[k] || 0) + 20;
                            });
                          }
                          const res = await updateProduct({
                            ...p,
                            stock: p.stock + 20,
                            variantStocks: nextVariantStocks,
                          });
                          if (res.success) {
                            setAdminToast({ message: `"${p.name}" স্টকে ২০টি যোগ করা হয়েছে!`, type: 'success' });
                          } else {
                            setAdminToast({ message: `স্টক আপডেট ব্যর্থ: ${res.error}`, type: 'error' });
                          }
                        }}
                        className="bg-[#881337] hover:bg-[#6d0f2c] text-white font-semibold px-3 py-1.5 rounded-xl cursor-pointer transition-colors tabular-nums"
                      >
                        +২০ যোগ
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: CATEGORIES & BRANDS */}
          {adminTab === 'categories' && (
            <CategoryManager />
          )}

          {/* TAB: COMPLETE THE LOOK (BUNDLES) */}
          {adminTab === 'bundles' && (
            ROLE_PERMITTED_TABS[currentRole].includes('bundles') ? (
              <BundleManager />
            ) : (
              <AccessRestrictedCard
                role={currentRole}
                requiredRole="ADMIN / SUPER_ADMIN"
                moduleName="কম্বো ও বান্ডেল ম্যানেজার"
                onGoBack={() => setAdminTab('dashboard')}
              />
            )
          )}

          {/* TAB: OCCASIONS & NEED COLLECTIONS */}
          {adminTab === 'occasions' && (
            ROLE_PERMITTED_TABS[currentRole].includes('occasions') ? (
              <OccasionsManager />
            ) : (
              <AccessRestrictedCard
                role={currentRole}
                requiredRole="ADMIN / SUPER_ADMIN"
                moduleName="উপলক্ষ ও কালেকশন ম্যানেজার"
                onGoBack={() => setAdminTab('dashboard')}
              />
            )
          )}

          {/* TAB: CUSTOMERS */}
          {adminTab === 'customers' && (() => {
            // Merge registered customer accounts with aggregated order metrics
            const customerRows = registeredCustomers.map(c => {
              const cOrders = orders.filter(
                o =>
                  o.customerUid === c.id ||
                  (c.phone && o.phone === c.phone) ||
                  (c.email && o.email && o.email.toLowerCase() === c.email.toLowerCase())
              );
              const totalSpent = cOrders
                .filter(o => o.status !== 'Cancelled')
                .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
              return {
                id: c.id,
                name: c.name,
                phone: c.phone,
                email: c.email,
                isRegistered: true,
                status: c.status || 'active',
                createdAt: c.createdAt,
                orderCount: cOrders.length,
                totalSpent,
                district: cOrders[0]?.address?.district || '—',
                sampleOrder: cOrders[0],
              };
            });

            // Append guest customers from orders who do not match any registered profile
            const seenKeys = new Set<string>();
            customerRows.forEach(r => {
              if (r.phone) seenKeys.add(r.phone.replace(/\D/g, ''));
              if (r.email) seenKeys.add(r.email.toLowerCase());
            });
            const guestMap = new Map<string, typeof customerRows[number]>();
            orders.forEach(o => {
              const cleanPh = (o.phone || '').replace(/\D/g, '');
              const cleanEm = (o.email || '').toLowerCase();
              if ((cleanPh && seenKeys.has(cleanPh)) || (cleanEm && seenKeys.has(cleanEm))) return;
              const key = cleanPh || cleanEm || o.id;
              const existing = guestMap.get(key);
              if (existing) {
                existing.orderCount += 1;
                if (o.status !== 'Cancelled') existing.totalSpent += o.totalAmount || 0;
              } else {
                guestMap.set(key, {
                  id: `guest-${key}`,
                  name: o.customerName,
                  phone: o.phone,
                  email: o.email || '',
                  isRegistered: false,
                  status: 'active',
                  createdAt: o.orderDate,
                  orderCount: 1,
                  totalSpent: o.status !== 'Cancelled' ? o.totalAmount || 0 : 0,
                  district: o.address?.district || '—',
                  sampleOrder: o,
                });
              }
            });

            const allCustomers = [...customerRows, ...Array.from(guestMap.values())];

            return (
              <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="font-extrabold text-base text-gray-900">গ্রাহক ডিরেক্টরি ও অ্যাকাউন্ট নিয়ন্ত্রণ</h3>
                    <p className="text-[11px] text-gray-500">
                      মোট {registeredCustomers.length} জন নিবন্ধিত কাস্টমার এবং {guestMap.size} জন গেস্ট অর্ডারকারী
                    </p>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-gray-100 rounded-2xl overflow-hidden">
                    <thead className="bg-gray-50 text-gray-500 border-b border-gray-200 uppercase text-[10px] font-bold">
                      <tr>
                        <th className="py-2.5 px-3">Customer</th>
                        <th className="py-2.5 px-3">Contact</th>
                        <th className="py-2.5 px-3">District</th>
                        <th className="py-2.5 px-3">Orders / Spent</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {allCustomers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-gray-400 font-semibold">
                            এখনো কোনো গ্রাহকের তথ্য পাওয়া যায়নি।
                          </td>
                        </tr>
                      ) : (
                        allCustomers.map(c => (
                          <tr key={c.id} className="hover:bg-gray-50/50">
                            <td className="py-2.5 px-3">
                              <span className="font-bold text-gray-900 block">{c.name}</span>
                              <span className="text-[10px] text-gray-400">
                                {c.isRegistered ? 'নিবন্ধিত অ্যাকাউন্ট' : 'গেস্ট অর্ডার'}
                              </span>
                            </td>
                            <td className="py-2.5 px-3">
                              {c.phone && <span className="font-mono text-gray-700 block">{c.phone}</span>}
                              {c.email && <span className="text-[10px] text-gray-500 block">{c.email}</span>}
                            </td>
                            <td className="py-2.5 px-3">{c.district}</td>
                            <td className="py-2.5 px-3">
                              <span className="font-bold text-gray-900">{c.orderCount} টি</span>
                              <span className="text-rose-600 font-bold ml-1.5">({formatPrice(c.totalSpent)})</span>
                            </td>
                            <td className="py-2.5 px-3">
                              {c.isRegistered ? (
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                    c.status === 'disabled'
                                      ? 'bg-rose-100 text-rose-700'
                                      : 'bg-emerald-100 text-emerald-700'
                                  }`}
                                >
                                  {c.status === 'disabled' ? 'নিষ্ক্রিয় (Disabled)' : 'সক্রিয় (Active)'}
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600">
                                  Guest
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <div className="flex items-center justify-end space-x-2">
                                {c.phone && (
                                  <button
                                    onClick={() =>
                                      openWhatsAppCustomer(
                                        c.sampleOrder ||
                                          ({
                                            id: 'SUPPORT',
                                            customerName: c.name,
                                            phone: c.phone,
                                            totalAmount: c.totalSpent,
                                          } as Order)
                                      )
                                    }
                                    className="text-green-600 font-bold hover:underline cursor-pointer flex items-center space-x-1"
                                  >
                                    <MessageCircle className="w-3.5 h-3.5" />
                                    <span>WhatsApp</span>
                                  </button>
                                )}
                                {c.isRegistered && (currentRole === 'SUPER_ADMIN' || currentRole === 'ADMIN') && (
                                  <button
                                    onClick={async () => {
                                      const nextStatus = c.status === 'disabled' ? 'active' : 'disabled';
                                      const res = await updateCustomerStatus(c.id, nextStatus);
                                      if (res.success) {
                                        setAdminToast({
                                          message:
                                            nextStatus === 'disabled'
                                              ? `"${c.name}"-এর অ্যাকাউন্ট নিষ্ক্রিয় করা হয়েছে।`
                                              : `"${c.name}"-এর অ্যাকাউন্ট পুনরায় সক্রিয় করা হয়েছে।`,
                                          type: 'success',
                                        });
                                      } else {
                                        setAdminToast({
                                          message: `স্ট্যাটাস পরিবর্তন ব্যর্থ: ${res.error || 'Firebase ত্রুটি'}`,
                                          type: 'error',
                                        });
                                      }
                                    }}
                                    className={`px-2.5 py-1 rounded-xl font-bold cursor-pointer transition-colors text-[10px] border ${
                                      c.status === 'disabled'
                                        ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                                        : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                                    }`}
                                  >
                                    {c.status === 'disabled' ? 'সক্রিয় করুন' : 'নিষ্ক্রিয় করুন'}
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}

          {/* TAB: COUPONS */}
          {adminTab === 'coupons' && (
            <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-base text-gray-900">কুপন ও প্রমোশনাল কোড</h3>
                {hasPermission('coupons', 'create') && (
                  <button
                    onClick={() => setShowAddCouponModal(true)}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-3 py-1.5 rounded-xl cursor-pointer"
                  >
                    + নতুন কুপন
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {coupons.map(c => (
                  <div key={c.code} className="bg-gray-50 p-4 rounded-2xl border border-gray-200 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-mono font-black text-rose-600 text-sm">{c.code}</span>
                      <p className="text-gray-700 font-medium mt-0.5">{c.description}</p>
                      <p className="text-[10px] text-gray-400">Min Purchase: ৳{c.minPurchase} • Expiry: {c.expiryDate}</p>
                    </div>
                    {hasPermission('coupons', 'delete') && (
                      <button
                        onClick={async () => {
                          const res = await deleteCoupon(c.code);
                          if (res.success) {
                            setAdminToast({ message: `কুপন "${c.code}" মুছে ফেলা হয়েছে!`, type: 'success' });
                          } else {
                            setAdminToast({ message: `কুপন ডিলিট ব্যর্থ: ${res.error}`, type: 'error' });
                          }
                        }}
                        className="text-gray-400 hover:text-rose-600 p-1 cursor-pointer"
                        title="কুপন মুছুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
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

          {/* TAB: CUSTOMER SUPPORT & HELP CENTER (Super Admin) */}
          {adminTab === 'helpcenter' && <HelpCenterManager />}

          {/* TAB: SECTION MANAGEMENT — নিশ্চিন্ত কেনাকাটা ও বিশ্বস্ত ডেলিভারি সেবা */}
          {adminTab === 'trustsection' && <TrustSectionManager />}

          {/* TAB: REPORTS & ANALYTICS */}
          {adminTab === 'reports' && (() => {
            const validOrders = orders.filter(o => o.status !== 'Cancelled');
            const catSalesMap: Record<string, { name: string; amount: number }> = {};
            let totalRevenueFromCategories = 0;

            validOrders.forEach(ord => {
              ord.items.forEach(item => {
                const cat = item.product.category || 'other';
                const catName = item.product.categoryBn || item.product.category || 'অন্যান্য';
                const itemTotal = (item.product.price || 0) * (item.quantity || 1);
                totalRevenueFromCategories += itemTotal;
                if (!catSalesMap[cat]) {
                  catSalesMap[cat] = { name: catName, amount: 0 };
                }
                catSalesMap[cat].amount += itemTotal;
              });
            });

            const categoryStats = Object.entries(catSalesMap)
              .map(([catKey, data]) => {
                const percent =
                  totalRevenueFromCategories > 0
                    ? Math.round((data.amount / totalRevenueFromCategories) * 100)
                    : 0;
                return { catKey, name: data.name, amount: data.amount, percent };
              })
              .sort((a, b) => b.amount - a.amount);

            return (
              <div className="bg-white rounded-2xl p-6 border border-[#e6e3dd] space-y-5 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-base text-[#111827]">বিক্রয় পারফরম্যান্স ও রিপোর্ট</h3>
                    <p className="text-[#6b7280] text-xs">বাস্তব অর্ডার অনুযায়ী ক্যাটাগরি ভিত্তিক বিক্রয় ও রাজস্ব বিশ্লেষণ</p>
                  </div>
                  <button
                    onClick={handleExportCSV}
                    className="bg-[#111827] hover:bg-black text-white font-semibold px-3.5 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>CSV ডাউনলোড</span>
                  </button>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-[#6b7280]">
                    ক্যাটাগরি ভিত্তিক প্রকৃত বিক্রয়:
                  </h4>
                  {categoryStats.length === 0 ? (
                    <div className="py-8 text-center border border-dashed border-[#e6e3dd] rounded-2xl">
                      <p className="text-sm font-bold text-[#374151]">কোনো সম্পন্ন বা সক্রিয় অর্ডারের ডেটা নেই</p>
                      <p className="text-xs text-[#6b7280] mt-1">কাস্টমার অর্ডার প্লেস করলে স্বয়ংক্রিয়ভাবে পরিসংখ্যান আপডেট হবে।</p>
                    </div>
                  ) : (
                    <div className="space-y-3 tabular-nums">
                      {categoryStats.map((stat, idx) => {
                        const colors = ['bg-[#881337]', 'bg-[#111827]', 'bg-[#15803d]', 'bg-[#4b5563]', 'bg-[#9f1239]'];
                        const barColor = colors[idx % colors.length];
                        return (
                          <div key={stat.catKey}>
                            <div className="flex justify-between font-semibold mb-1 text-[#111827]">
                              <span>{stat.name}</span>
                              <span>{stat.percent}% ({formatPrice(stat.amount)})</span>
                            </div>
                            <div className="w-full bg-[#faf9f7] border border-[#e6e3dd] h-2.5 rounded-full overflow-hidden">
                              <div className={`${barColor} h-full`} style={{ width: `${stat.percent}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
            </>
          )}
        </div>
      </div>

      {/* Modal: Add Product */}
      <ProductAddModal
        isOpen={showAddProductModal}
        onClose={() => setShowAddProductModal(false)}
        onSave={handleCreateProductAsync}
      />

      {/* Modal: Add Coupon */}
      {showAddCouponModal && (
        <div className="fixed inset-0 z-50 bg-black/55 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl p-6 border border-[#e6e3dd] space-y-4 text-xs">
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

      {/* Product Edit Modal */}
      <ProductEditModal
        product={productToEdit}
        isOpen={Boolean(productToEdit)}
        onClose={() => setProductToEdit(null)}
        onSave={handleSaveProductEdit}
      />

      {/* Product Delete Modal */}
      <ProductDeleteModal
        product={productToDelete}
        isOpen={Boolean(productToDelete)}
        onClose={() => setProductToDelete(null)}
        onConfirm={handleConfirmProductDelete}
      />

      {/* Bulk Product Edit Modal */}
      <BulkProductEditModal
        products={products.filter(p => selectedProductIds.includes(p.id))}
        isOpen={showBulkEditModal}
        onClose={() => setShowBulkEditModal(false)}
        onSave={handleBulkEditSave}
      />

      {/* Bulk Product Delete Modal */}
      <BulkProductDeleteModal
        products={products.filter(p => selectedProductIds.includes(p.id))}
        isOpen={showBulkDeleteModal}
        onClose={() => setShowBulkDeleteModal(false)}
        onConfirm={handleBulkDeleteConfirm}
      />

      {/* Admin Toast Notification */}
      {adminToast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center space-x-2.5 text-white px-4 py-3 rounded-2xl shadow-2xl border text-xs animate-in slide-in-from-bottom-5 ${
            adminToast.type === 'error'
              ? 'bg-rose-900 border-rose-700'
              : 'bg-slate-900 border-slate-700'
          }`}
        >
          {adminToast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-300 shrink-0" />
          ) : (
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span className="font-semibold">{adminToast.message}</span>
          <button
            onClick={() => setAdminToast(null)}
            className="text-gray-300 hover:text-white p-0.5 cursor-pointer ml-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
