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
  ExternalLink,
  ChevronRight,
  Database,
  Tag,
  CreditCard,
  UserCheck,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { UserRole, Order, Product } from '../../types';

interface RoleDashboardsProps {
  setAdminTab: (tab: any) => void;
  onCallOrder: (order: Order) => void;
  onCourierDispatch: (order: Order) => void;
  onEditOrder: (order: Order) => void;
}

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
    formatPrice,
    t,
  } = useShop();

  // Common calculations
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const confirmedOrders = orders.filter(o => o.status === 'confirmed');
  const shippedOrders = orders.filter(o => o.status === 'shipped');
  const deliveredOrders = orders.filter(o => o.status === 'delivered');
  const lowStockProducts = products.filter(p => p.stock <= p.lowStockThreshold);
  const outOfStockProducts = products.filter(p => p.stock === 0);

  const totalSales = orders.reduce((sum, o) => (o.status !== 'cancelled' ? sum + o.totalAmount : sum), 0);
  const totalBkashNagadSales = orders
    .filter(o => (o.paymentMethod === 'bkash' || o.paymentMethod === 'nagad') && o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0);
  const totalCodSales = orders
    .filter(o => o.paymentMethod === 'cod' && o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const unreadChatCount = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  // Quick product search state for Staff lookup
  const [staffProductSearch, setStaffProductSearch] = useState('');
  const searchedStaffProducts = staffProductSearch.trim()
    ? products.filter(
        p =>
          p.name.toLowerCase().includes(staffProductSearch.toLowerCase()) ||
          p.nameBn.includes(staffProductSearch) ||
          p.sku.toLowerCase().includes(staffProductSearch.toLowerCase())
      ).slice(0, 5)
    : products.slice(0, 3);

  // -------------------------------------------------------------
  // 1. 💼 STAFF DASHBOARD: Support Desk, Call Queue, Chat & Quick Stock Lookup
  // -------------------------------------------------------------
  if (currentRole === 'STAFF') {
    return (
      <div className="space-y-6">
        {/* Staff Header Banner */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 rounded-3xl p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1.5 bg-white/20 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-bold text-blue-100">
              <Phone className="w-3.5 h-3.5 text-blue-200" />
              <span>স্টাফ ওয়ার্কস্টেশন • কাস্টমার সাপোর্ট ও কল সেন্টার হাব</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              স্বাগতম, {adminUser?.name || 'স্টাফ মেম্বার'}!
            </h2>
            <p className="text-xs text-blue-200 max-w-xl">
              আপনার দায়িত্ব: নতুন গ্রাহকদের ফোন কল করে অর্ডার তথ্য ও ঠিকানা নিশ্চিতকরণ এবং লাইভ চ্যাট/হোয়াটসঅ্যাপে গ্রাহকদের তাৎক্ষণিক সহায়তা প্রদান।
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setAdminTab('livechat')}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs px-4 py-3 rounded-2xl flex items-center space-x-2 shadow-md cursor-pointer transition-transform hover:scale-105 active:scale-95"
            >
              <MessageSquare className="w-4 h-4" />
              <span>চ্যাট ইনবক্স ({unreadChatCount})</span>
            </button>
            <button
              onClick={() => setAdminTab('orders')}
              className="bg-white hover:bg-blue-50 text-blue-900 font-extrabold text-xs px-4 py-3 rounded-2xl flex items-center space-x-2 shadow-md cursor-pointer transition-transform hover:scale-105 active:scale-95"
            >
              <Phone className="w-4 h-4 text-blue-600" />
              <span>কল লিস্ট ({pendingOrders.length})</span>
            </button>
          </div>
        </div>

        {/* Staff 4 Key Duty Cards (No Revenue/Financial Data shown for security) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-3xl p-5 border border-amber-200 shadow-xs bg-amber-50/30">
            <div className="flex items-center justify-between text-amber-700 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">কল করা বাকি (Pending)</span>
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="text-2xl font-black text-amber-700">{pendingOrders.length}</h3>
            <span className="text-[11px] text-gray-500 mt-1 inline-block">গ্রাহককে কল করে কনফার্ম করুন</span>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-emerald-200 shadow-xs bg-emerald-50/30">
            <div className="flex items-center justify-between text-emerald-700 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">যাচাইকৃত অর্ডার (Confirmed)</span>
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-black text-emerald-700">{confirmedOrders.length}</h3>
            <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-block">প্যাকিং ও কুরিয়ার প্রস্তুত</span>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-blue-200 shadow-xs bg-blue-50/30">
            <div className="flex items-center justify-between text-blue-700 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">অপঠিত কাস্টমার মেসেজ</span>
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-2xl font-black text-blue-700">{unreadChatCount}</h3>
            <span className="text-[11px] text-blue-600 font-semibold mt-1 inline-block">লাইভ চ্যাট / হোয়াটসঅ্যাপ / এফবি</span>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-xs">
            <div className="flex items-center justify-between text-gray-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">সক্রিয় ক্যাটালগ পণ্য</span>
              <Package className="w-5 h-5 text-gray-600" />
            </div>
            <h3 className="text-2xl font-black text-gray-900">{products.length}</h3>
            <span className="text-[11px] text-gray-400 mt-1 inline-block">স্টক তথ্য নিচে চেক করুন</span>
          </div>
        </div>

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
                <div key={o.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/70 transition-colors">
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
                      <span>{o.address.area}, {o.address.district}</span>
                      <span className="text-gray-400">•</span>
                      <span className="font-bold text-rose-600">{formatPrice(o.totalAmount)}</span>
                      <span className="text-gray-400">•</span>
                      <span className="uppercase text-[10px] font-bold bg-gray-100 px-1.5 py-0.5 rounded">{o.paymentMethod}</span>
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
              <div key={p.id} className="p-3.5 rounded-2xl border border-gray-100 bg-gray-50/50 flex items-center space-x-3">
                <img src={p.image} alt={p.name} className="w-12 h-12 rounded-xl object-cover border border-gray-200 shrink-0" />
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-xs text-gray-900 truncate">{p.nameBn || p.name}</h4>
                  <p className="text-[10px] text-gray-400 font-mono">SKU: {p.sku}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-black text-xs text-rose-600">{formatPrice(p.price)}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      p.stock <= p.lowStockThreshold ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      স্টক: {p.stock} pcs
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 2. 📋 MANAGER DASHBOARD: Logistics, Couriers, Packaging & Inventory
  // -------------------------------------------------------------
  if (currentRole === 'MANAGER') {
    return (
      <div className="space-y-6">
        {/* Manager Header Banner */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-3xl p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1.5 bg-white/20 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-bold text-emerald-100">
              <Truck className="w-3.5 h-3.5 text-emerald-300" />
              <span>লজিস্টিকস ও ইনভেন্টরি ম্যানেজার ওয়ার্কস্টেশন</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              স্বাগতম, {adminUser?.name || 'অপারেশন ম্যানেজার'}!
            </h2>
            <p className="text-xs text-emerald-200 max-w-xl">
              আপনার দায়িত্ব: নিশ্চিতকৃত অর্ডারের প্যাকেজিং, চালান ও কুরিয়ারে (Steadfast/Pathao) হস্তান্তর, পার্সেল ট্র্যাকিং এবং ওয়্যারহাউজ স্টক লেভেল নিয়ন্ত্রণ।
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setAdminTab('couriers')}
              className="bg-white hover:bg-emerald-50 text-emerald-950 font-extrabold text-xs px-4 py-3 rounded-2xl flex items-center space-x-2 shadow-md cursor-pointer transition-transform hover:scale-105 active:scale-95"
            >
              <Truck className="w-4 h-4 text-emerald-600" />
              <span>কুরিয়ার চালান হাব</span>
            </button>
            <button
              onClick={() => setAdminTab('inventory')}
              className="bg-amber-400 hover:bg-amber-500 text-gray-950 font-extrabold text-xs px-4 py-3 rounded-2xl flex items-center space-x-2 shadow-md cursor-pointer transition-transform hover:scale-105 active:scale-95"
            >
              <AlertTriangle className="w-4 h-4 text-gray-950" />
              <span>লো স্টক ({lowStockProducts.length})</span>
            </button>
          </div>
        </div>

        {/* Manager 4 Operational Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-3xl p-5 border border-emerald-200 shadow-xs bg-emerald-50/20">
            <div className="flex items-center justify-between text-emerald-700 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">কুরিয়ার প্রেরণ প্রস্তুত</span>
              <Truck className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-black text-emerald-700">{confirmedOrders.length}</h3>
            <span className="text-[11px] text-gray-500 mt-1 inline-block">চালান তৈরি ও হ্যান্ডওভার করুন</span>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-blue-200 shadow-xs bg-blue-50/20">
            <div className="flex items-center justify-between text-blue-700 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">কুরিয়ারে ট্রানজিট (On The Way)</span>
              <Send className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-2xl font-black text-blue-700">{shippedOrders.length}</h3>
            <span className="text-[11px] text-blue-600 font-semibold mt-1 inline-block">স্টেডফাস্ট ও পাঠাও হাবে</span>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-purple-200 shadow-xs bg-purple-50/20">
            <div className="flex items-center justify-between text-purple-700 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">সফল ডেলিভারি (Delivered)</span>
              <CheckCircle className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-2xl font-black text-purple-700">{deliveredOrders.length}</h3>
            <span className="text-[11px] text-purple-600 font-semibold mt-1 inline-block">৯৮% সাকসেস রেট</span>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-rose-200 shadow-xs bg-rose-50/20">
            <div className="flex items-center justify-between text-rose-700 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">রি-স্টক প্রয়োজন (Low Stock)</span>
              <AlertTriangle className="w-5 h-5 text-rose-600" />
            </div>
            <h3 className="text-2xl font-black text-rose-700">{lowStockProducts.length}</h3>
            <span className="text-[11px] text-rose-600 font-semibold mt-1 inline-block">স্টক শেষ হওয়ার পূর্বে অর্ডার করুন</span>
          </div>
        </div>

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
                <div key={o.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/70 transition-colors">
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
                      <span>{o.address.area}, {o.address.district}</span>
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
              <div key={p.id} className="p-3.5 bg-rose-50/50 border border-rose-200 rounded-2xl flex items-center space-x-3">
                <img src={p.image} alt={p.name} className="w-12 h-12 rounded-xl object-cover border border-rose-200 shrink-0" />
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
    );
  }

  // -------------------------------------------------------------
  // 3. 🛡️ ADMIN DASHBOARD: Store Operations, Products, Customers & Promotions
  // -------------------------------------------------------------
  if (currentRole === 'ADMIN') {
    return (
      <div className="space-y-6">
        {/* Admin Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-rose-950 rounded-3xl p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1.5 bg-rose-600/30 border border-rose-400/30 px-3 py-1 rounded-full text-xs font-bold text-rose-200">
              <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
              <span>স্টোর অপারেশন ও ক্যাটালগ এডমিন ড্যাশবোর্ড</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              স্বাগতম, {adminUser?.name || 'স্টোর এডমিন'}!
            </h2>
            <p className="text-xs text-gray-300 max-w-xl">
              আপনার দায়িত্ব: পণ্য ক্যাটালগ নিয়ন্ত্রণ, মূল্য ও স্টক আপডেট, কুপন ও প্রমোশনাল অফার, গ্রাহক ডিরেক্টরি এবং সামগ্রিক স্টোর কার্যক্রম তদারকি।
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setAdminTab('products')}
              className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs px-4 py-3 rounded-2xl flex items-center space-x-2 shadow-md cursor-pointer transition-transform hover:scale-105 active:scale-95"
            >
              <Package className="w-4 h-4" />
              <span>পণ্য ক্যাটালগ</span>
            </button>
            <button
              onClick={() => setAdminTab('coupons')}
              className="bg-white hover:bg-gray-100 text-gray-900 font-extrabold text-xs px-4 py-3 rounded-2xl flex items-center space-x-2 shadow-md cursor-pointer transition-transform hover:scale-105 active:scale-95"
            >
              <Tag className="w-4 h-4 text-rose-600" />
              <span>কুপন ও অফার ({coupons.length})</span>
            </button>
          </div>
        </div>

        {/* Admin 4 Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-xs">
            <div className="flex items-center justify-between text-gray-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">মোট ক্যাটালগ পণ্য</span>
              <Package className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="text-2xl font-black text-gray-900">{products.length}</h3>
            <span className="text-[11px] text-indigo-600 font-semibold mt-1 inline-block">
              {outOfStockProducts.length > 0 ? `${outOfStockProducts.length}টি স্টক আউট` : 'সব পণ্য স্টকে আছে'}
            </span>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-xs">
            <div className="flex items-center justify-between text-gray-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">নতুন অর্ডার ভলিউম</span>
              <ShoppingCart className="w-5 h-5 text-rose-600" />
            </div>
            <h3 className="text-2xl font-black text-rose-600">{orders.length}</h3>
            <span className="text-[11px] text-gray-500 mt-1 inline-block">
              {pendingOrders.length}টি কনফার্মেশন অপেক্ষমান
            </span>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-xs">
            <div className="flex items-center justify-between text-gray-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">নিবন্ধিত গ্রাহক</span>
              <Users className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-black text-gray-900">{registeredCustomers.length}</h3>
            <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-block">গ্রাহক ডিরেক্টরি সংরক্ষিত</span>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-xs">
            <div className="flex items-center justify-between text-gray-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">সক্রিয় কুপন ও ডিল</span>
              <Tag className="w-5 h-5 text-amber-500" />
            </div>
            <h3 className="text-2xl font-black text-amber-600">{coupons.length}</h3>
            <span className="text-[11px] text-gray-500 mt-1 inline-block">ডিসকাউন্ট ক্যাম্পেইন চালু</span>
          </div>
        </div>

        {/* Quick Operations Table & Actions */}
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
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          o.status === 'delivered'
                            ? 'bg-purple-100 text-purple-700'
                            : o.status === 'shipped'
                            ? 'bg-blue-100 text-blue-700'
                            : o.status === 'confirmed'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {o.status}
                        </span>
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
                    <Tag className="w-4 h-4 text-gray-500 group-hover:text-rose-600" />
                    <span className="text-xs font-bold text-gray-800">নতুন কুপন কোড তৈরি</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-rose-600" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 4. 👑 SUPER ADMIN DASHBOARD: Master Executive Suite & God-Mode Oversight
  // -------------------------------------------------------------
  return (
    <div className="space-y-6">
      {/* Super Admin Executive Banner */}
      <div className="bg-gradient-to-r from-gray-950 via-slate-900 to-rose-950 rounded-3xl p-6 sm:p-7 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5 border border-rose-950/40">
        <div className="space-y-1.5">
          <div className="inline-flex items-center space-x-1.5 bg-gradient-to-r from-rose-600 to-amber-600 px-3 py-1 rounded-full text-xs font-black text-white shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>সুপার এডমিন এক্সিকিউটিভ সুইট • ফুল মাস্টার এক্সেস (God Mode)</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            স্বাগতম, {adminUser?.name || 'Md Mahmudul Hashan'}!
          </h2>
          <p className="text-xs text-gray-300 max-w-xl">
            আপনার কাছে সমস্ত অর্থনৈতিক প্রতিবেদন, বিকাশ/নগদ পেমেন্ট সেটিংস, কুরিয়ার এপিআই ক্রেডেনশিয়াল, আরবিএসি টিম পারমিশন এবং প্ল্যাটফর্ম পরিচালনার পূর্ণ নিয়ন্ত্রণ রয়েছে।
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setAdminTab('roles')}
            className="bg-amber-500 hover:bg-amber-600 text-gray-950 font-black text-xs px-4 py-3 rounded-2xl flex items-center space-x-2 shadow-md cursor-pointer transition-transform hover:scale-105 active:scale-95"
          >
            <ShieldCheck className="w-4 h-4 text-gray-950" />
            <span>রোল ও পারমিশন কন্ট্রোল</span>
          </button>
          <button
            onClick={() => setAdminTab('settings')}
            className="bg-rose-600 hover:bg-rose-700 text-white font-black text-xs px-4 py-3 rounded-2xl flex items-center space-x-2 shadow-md cursor-pointer transition-transform hover:scale-105 active:scale-95"
          >
            <Settings className="w-4 h-4" />
            <span>বিজনেস ও পেমেন্ট সেটিংস</span>
          </button>
        </div>
      </div>

      {/* Super Admin Financial & Master KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">মোট রাজস্ব (Gross Revenue)</span>
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-gray-900">{formatPrice(totalSales)}</h3>
          <span className="text-[10px] text-emerald-600 font-semibold mt-1 inline-block">
            ↑ ১৫% গত সপ্তাহের তুলনায়
          </span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">আনুমানিক নিট লাভ (~২৫%)</span>
            <Sparkles className="w-5 h-5 text-amber-500" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-amber-600">
            {formatPrice(Math.round(totalSales * 0.25))}
          </h3>
          <span className="text-[10px] text-gray-500 mt-1 inline-block">কুরিয়ার ও পণ্য খরচ বাদে</span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">ডিজিটাল পেমেন্ট (bKash/Nagad)</span>
            <CreditCard className="w-5 h-5 text-pink-600" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-pink-600">{formatPrice(totalBkashNagadSales)}</h3>
          <span className="text-[10px] text-gray-400 mt-1 inline-block">
            ক্যাশ অন ডেলিভারি: {formatPrice(totalCodSales)}
          </span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">অ্যাক্টিভ টিম ও স্টাফ</span>
            <UserCheck className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-blue-600">{staffAccounts.length} জন</h3>
          <span className="text-[10px] text-emerald-600 font-semibold mt-1 inline-block">
            সুপার এডমিন, এডমিন, ম্যানেজার ও স্টাফ
          </span>
        </div>
      </div>

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
                      <span className="block text-[9px] font-mono text-pink-700">TrxID: {o.paymentDetails.trxId}</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-rose-600">{formatPrice(o.totalAmount)}</td>
                  <td className="py-2.5 px-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      o.status === 'delivered'
                        ? 'bg-purple-100 text-purple-700'
                        : o.status === 'shipped'
                        ? 'bg-blue-100 text-blue-700'
                        : o.status === 'confirmed'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
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
  );
};
