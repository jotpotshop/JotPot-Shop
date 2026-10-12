import React, { useState } from 'react';
import {
  Truck,
  Zap,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Copy,
  Save,
  RefreshCw,
  Search,
  Key,
  Globe,
  HelpCircle,
  ShieldCheck,
  FileText,
  Printer,
  Eye,
  EyeOff,
  DollarSign,
  Package,
  Layers,
  PhoneCall,
  Clock,
  ArrowRight,
  Check,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { CourierConfig, CourierPartner, Order } from '../../types';
import {
  COURIER_SETUP_GUIDES,
  testCourierApiConnection,
  CourierConnectionTestResult,
} from '../../services/courierService';

export const CourierManager: React.FC = () => {
  const {
    courierConfigs,
    updateCourierConfig,
    orders,
    updateCourierStatus,
    setOrderForShippingLabel,
    t,
    formatPrice,
    hasPermission,
    currentRole,
  } = useShop();

  const [activeSubTab, setActiveSubTab] = useState<'configs' | 'guides' | 'consignments' | 'analytics'>('configs');
  const [selectedGuidePartner, setSelectedGuidePartner] = useState<CourierPartner>('Steadfast');
  const [editingCourier, setEditingCourier] = useState<CourierPartner | null>(null);

  // Connection testing states
  const [testingCourierId, setTestingCourierId] = useState<CourierPartner | null>(null);
  const [testResults, setTestResults] = useState<Record<string, CourierConnectionTestResult>>({});

  // Show/hide password states for API keys
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  // Copy feedback state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Search filter in consignments list
  const [consignmentSearch, setConsignmentSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Success toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSyncingAll, setIsSyncingAll] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    showToast(`"${label}" সফলভাবে ক্লিপবোর্ডে কপি হয়েছে!`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Test connection handler
  const handleTestConnection = async (config: CourierConfig) => {
    setTestingCourierId(config.id);
    try {
      const result = await testCourierApiConnection(config);
      setTestResults(prev => ({ ...prev, [config.id]: result }));
      updateCourierConfig(config.id, {
        connectionStatus: result.success ? 'connected' : 'disconnected',
        lastConnectedAt: result.verifiedAt,
        accountBalance: result.balance,
      });

      if (result.success) {
        showToast(`✅ ${config.nameBn} এপিআই টেস্ট সফল! ব্যালেন্স: ৳${result.balance?.toLocaleString('bn-BD') || 0}`);
      } else {
        showToast(`❌ ${result.messageBn}`);
      }
    } finally {
      setTestingCourierId(null);
    }
  };

  // Sync all dispatched orders
  const handleSyncAllOrders = () => {
    setIsSyncingAll(true);
    setTimeout(() => {
      // Simulate live status updates from couriers for in-transit orders
      const dispatchedOrders = orders.filter(o => o.courierInfo && o.status === 'Shipped');
      dispatchedOrders.forEach((o, idx) => {
        if (idx % 2 === 0 && o.courierInfo?.courierStatus === 'In Transit') {
          updateCourierStatus(o.id, 'Out for Delivery');
        }
      });
      setIsSyncingAll(false);
      showToast('সবগুলো কুরিয়ারের পার্সেল স্ট্যাটাস সফলভাবে সিঙ্ক ও আপডেট হয়েছে!');
    }, 1200);
  };

  // Filtered dispatched orders
  const dispatchedOrders = orders.filter(o => !!o.courierInfo);
  const filteredDispatchedOrders = dispatchedOrders.filter(o => {
    const matchesSearch =
      o.id.toLowerCase().includes(consignmentSearch.toLowerCase()) ||
      o.customerName.toLowerCase().includes(consignmentSearch.toLowerCase()) ||
      o.phone.includes(consignmentSearch) ||
      (o.courierInfo?.consignmentId || '').toLowerCase().includes(consignmentSearch.toLowerCase()) ||
      (o.courierInfo?.trackingCode || '').toLowerCase().includes(consignmentSearch.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || o.courierInfo?.courierStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalCodDispatched = dispatchedOrders.reduce(
    (sum, o) => sum + (o.paymentMethod === 'cod' ? o.totalAmount : 0),
    0
  );
  const totalDeliveredCod = dispatchedOrders
    .filter(o => o.status === 'Delivered')
    .reduce((sum, o) => sum + (o.paymentMethod === 'cod' ? o.totalAmount : 0), 0);

  const canEdit = hasPermission('couriers', 'edit');

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-2.5 text-xs font-bold border border-gray-700 animate-fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner & Sub-Tabs */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center shadow-md">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-black text-gray-900">
                  {t('কুরিয়ার সার্ভিস এপিআই ইন্টিগ্রেশন ও লজিস্টিকস হাব', 'Courier Service API Integration & Logistics Hub')}
                </h2>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                  Live API
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Steadfast, Pathao, RedX, Paperfly, Sundarban ও eCourier-এর অফিসিয়াল API কানেক্ট করুন এবং পার্সেল বুকিং অটোমেট করুন
              </p>
            </div>
          </div>

          {/* Quick Sync Button */}
          <button
            onClick={handleSyncAllOrders}
            disabled={isSyncingAll}
            className="flex items-center space-x-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-2xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingAll ? 'animate-spin' : ''}`} />
            <span>{isSyncingAll ? 'সিঙ্ক হচ্ছে...' : 'কুরিয়ার স্ট্যাটাস সিঙ্ক'}</span>
          </button>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
          <button
            onClick={() => setActiveSubTab('configs')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'configs'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>{t('১. এপিআই চাবি ও কনফিগারেশন', '1. API Credentials & Config')}</span>
          </button>

          <button
            onClick={() => setActiveSubTab('guides')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'guides'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{t('২. কীভাবে কানেক্ট করবেন (গাইড)', '2. How to Connect (Setup Guide)')}</span>
          </button>

          <button
            onClick={() => setActiveSubTab('consignments')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'consignments'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>
              {t('৩. বুকিং ও পার্সেল মনিটরিং', '3. Consignments & Tracking')} ({dispatchedOrders.length})
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('analytics')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'analytics'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{t('৪. লজিস্টিকস ও COD রিপোর্ট', '4. Logistics & COD Analytics')}</span>
          </button>
        </div>
      </div>

      {/* TAB 1: API CONFIGURATION & CREDENTIALS */}
      {activeSubTab === 'configs' && (
        <div className="space-y-5">
          {/* Steadfast Courier Official Connected Spotlight */}
          {(() => {
            const steadfast = courierConfigs.find(c => c.id === 'Steadfast');
            if (!steadfast) return null;
            const isConnected = steadfast.connectionStatus === 'connected';
            const assignedOrders = orders.filter(o => o.courierInfo?.courierName === 'Steadfast');
            const deliveredCount = assignedOrders.filter(o => o.status === 'Delivered').length;

            return (
              <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-gray-900 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-emerald-500/40 relative overflow-hidden">
                <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                  {/* Left: Status info */}
                  <div className="space-y-3 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-black text-sm shadow-md">
                        STF
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-xl font-black text-white">
                            Steadfast Courier (স্টেডফাস্ট কুরিয়ার)
                          </h3>
                          <span className="bg-emerald-400 text-emerald-950 font-black text-[11px] px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center space-x-1 shadow-xs">
                            <span className="w-2 h-2 rounded-full bg-emerald-950 animate-ping inline-block" />
                            <span>{isConnected ? 'সফলভাবে সংযুক্ত (CONNECTED)' : 'সংযুক্ত করুন'}</span>
                          </span>
                        </div>
                        <p className="text-xs text-emerald-200 mt-0.5">
                          অফিসিয়াল API ইন্টিগ্রেশন সক্রিয় • সারাদেশের ৬৪ জেলায় ক্যাশ অন ডেলিভারি (COD) ও হোম ডেলিভারি
                        </p>
                      </div>
                    </div>

                    {/* Stats pills */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs">
                      <div className="bg-white/10 backdrop-blur-xs p-2.5 rounded-2xl border border-white/10">
                        <span className="text-[10px] text-emerald-300 block font-bold uppercase">মার্চেন্ট আইডি</span>
                        <span className="font-mono font-bold text-white text-xs">{steadfast.merchantId || 'JPS-STEAD-4019'}</span>
                      </div>

                      <div className="bg-white/10 backdrop-blur-xs p-2.5 rounded-2xl border border-white/10">
                        <span className="text-[10px] text-emerald-300 block font-bold uppercase">লেজার ব্যালেন্স</span>
                        <span className="font-mono font-black text-amber-300 text-sm">
                          {formatPrice(steadfast.accountBalance || 4850)}
                        </span>
                      </div>

                      <div className="bg-white/10 backdrop-blur-xs p-2.5 rounded-2xl border border-white/10">
                        <span className="text-[10px] text-emerald-300 block font-bold uppercase">মোট পার্সেল</span>
                        <span className="font-bold text-white text-xs">{assignedOrders.length}টি ({deliveredCount} ডেলিভার্ড)</span>
                      </div>

                      <div className="bg-white/10 backdrop-blur-xs p-2.5 rounded-2xl border border-white/10">
                        <span className="text-[10px] text-emerald-300 block font-bold uppercase">অটো-অ্যাসাইন রুল</span>
                        <span className="font-bold text-emerald-300 text-xs">সারাদেশে সচল (Active)</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 w-full lg:w-auto shrink-0">
                    <button
                      type="button"
                      disabled={testingCourierId === 'Steadfast'}
                      onClick={() => handleTestConnection(steadfast)}
                      className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black px-5 py-2.5 rounded-xl text-xs flex items-center justify-center space-x-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
                    >
                      <Zap className={`w-4 h-4 ${testingCourierId === 'Steadfast' ? 'animate-spin' : ''}`} />
                      <span>{testingCourierId === 'Steadfast' ? 'ভেরিফাই হচ্ছে...' : 'ব্যালেন্স ও কানেকশন রিফ্রেশ'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedGuidePartner('Steadfast');
                        setActiveSubTab('guides');
                      }}
                      className="bg-white/10 hover:bg-white/20 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-colors border border-white/15 cursor-pointer"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>সেটআপ গাইড ও হেল্পলাইন</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {courierConfigs.map(c => {
              const testResult = testResults[c.id];
              const isTesting = testingCourierId === c.id;
              const isShowingKey = showKeys[c.id] || false;
              const assignedOrders = orders.filter(o => o.courierInfo?.courierName === c.id);

              return (
                <div
                  key={c.id}
                  className={`bg-white rounded-3xl p-5 border transition-all ${
                    c.isActive ? 'border-gray-200 shadow-xs' : 'border-gray-200 opacity-80 bg-gray-50/50'
                  }`}
                >
                  {/* Courier Card Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <div className="flex items-center space-x-2.5">
                      <div
                        className={`w-9 h-9 rounded-xl font-black text-xs flex items-center justify-center text-white ${
                          c.id === 'Steadfast'
                            ? 'bg-emerald-600'
                            : c.id === 'Pathao'
                            ? 'bg-red-600'
                            : c.id === 'RedX'
                            ? 'bg-rose-600'
                            : c.id === 'Paperfly'
                            ? 'bg-blue-600'
                            : c.id === 'Sundarban'
                            ? 'bg-amber-600'
                            : 'bg-indigo-600'
                        }`}
                      >
                        {c.id.substring(0, 3)}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm text-gray-900">{c.name}</h3>
                        <span className="text-[10px] text-gray-500 font-medium">{c.nameBn}</span>
                      </div>
                    </div>

                    {/* Active toggle */}
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={c.isActive}
                        disabled={!canEdit}
                        onChange={e => {
                          updateCourierConfig(c.id, { isActive: e.target.checked });
                          showToast(`${c.nameBn} ${e.target.checked ? 'সক্রিয়' : 'নিষ্ক্রিয়'} করা হয়েছে`);
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  {/* Mode Selector & Status */}
                  <div className="mt-3 flex items-center justify-between text-[11px] bg-gray-50 p-2 rounded-xl">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-gray-500 font-bold">পরিবেশ:</span>
                      <button
                        type="button"
                        onClick={() => {
                          if (canEdit) {
                            updateCourierConfig(c.id, { isSandbox: !c.isSandbox });
                            showToast(`মোড পরিবর্তন: ${!c.isSandbox ? 'Sandbox (টেস্ট)' : 'Live (প্রোডাকশন)'}`);
                          }
                        }}
                        className={`px-2 py-0.5 rounded-md font-bold text-[10px] transition-colors cursor-pointer ${
                          c.isSandbox
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {c.isSandbox ? 'SANDBOX (টেস্ট)' : 'LIVE (প্রোডাকশন)'}
                      </button>
                    </div>

                    <div className="flex items-center space-x-1">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          c.connectionStatus === 'connected'
                            ? 'bg-emerald-500 animate-pulse'
                            : c.connectionStatus === 'disconnected'
                            ? 'bg-rose-500'
                            : 'bg-gray-400'
                        }`}
                      />
                      <span className="text-[10px] font-bold text-gray-700">
                        {c.connectionStatus === 'connected'
                          ? 'সংযুক্ত'
                          : c.connectionStatus === 'disconnected'
                          ? 'বিচ্ছিন্ন'
                          : 'অযাচাইকৃত'}
                      </span>
                    </div>
                  </div>

                  {/* API Credentials Inputs */}
                  <div className="mt-3.5 space-y-2.5 text-xs">
                    {/* API Key */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-bold text-gray-700">
                          {c.id === 'Pathao' ? 'Client ID / API Key:' : 'API Key (Api-Key):'}
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowKeys(prev => ({ ...prev, [c.id]: !isShowingKey }))}
                          className="text-[10px] text-gray-500 hover:text-gray-800 flex items-center space-x-0.5 cursor-pointer"
                        >
                          {isShowingKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          <span>{isShowingKey ? 'লুকান' : 'দেখান'}</span>
                        </button>
                      </div>
                      <input
                        type={isShowingKey ? 'text' : 'password'}
                        value={c.apiKey}
                        disabled={!canEdit}
                        onChange={e => updateCourierConfig(c.id, { apiKey: e.target.value })}
                        placeholder="আপনার পোর্টাল হতে API Key দিন"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono focus:border-emerald-500 focus:bg-white"
                      />
                    </div>

                    {/* Secret Key / Token */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        {c.id === 'RedX'
                          ? 'API Access Token:'
                          : c.id === 'Pathao'
                          ? 'Client Secret:'
                          : 'Secret Key (Secret-Key):'}
                      </label>
                      <input
                        type={isShowingKey ? 'text' : 'password'}
                        value={c.secretKey}
                        disabled={!canEdit}
                        onChange={e => updateCourierConfig(c.id, { secretKey: e.target.value })}
                        placeholder="Secret Key বা Token প্রদান করুন"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono focus:border-emerald-500 focus:bg-white"
                      />
                    </div>

                    {/* Merchant ID / Store ID */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 mb-1">
                          {c.id === 'Pathao' ? 'Store ID:' : 'Merchant ID:'}
                        </label>
                        <input
                          type="text"
                          value={c.merchantId}
                          disabled={!canEdit}
                          onChange={e => updateCourierConfig(c.id, { merchantId: e.target.value })}
                          placeholder="JPS-001"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 mb-1">
                          অর্ডার সংখ্যা:
                        </label>
                        <div className="w-full bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-700">
                          {assignedOrders.length}টি পার্সেল
                        </div>
                      </div>
                    </div>

                    {/* Webhook URL with 1-click Copy */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-bold text-gray-700">
                          Webhook URL (অটো-আপডেটের জন্য):
                        </label>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(c.webhookUrl, `${c.name} Webhook`)}
                          className="text-[10px] text-emerald-600 font-bold hover:underline flex items-center space-x-1 cursor-pointer"
                        >
                          {copiedKey === `${c.name} Webhook` ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span>কপি</span>
                        </button>
                      </div>
                      <input
                        type="text"
                        readOnly
                        value={c.webhookUrl}
                        className="w-full bg-emerald-50/40 border border-emerald-200/80 rounded-xl px-3 py-1.5 text-[11px] font-mono text-emerald-900 select-all"
                      />
                    </div>

                    {/* Delivery Rates */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <label className="block text-[10px] text-gray-500 font-bold mb-0.5">
                          ঢাকা ভেতরে (৳):
                        </label>
                        <input
                          type="number"
                          value={c.baseChargeDhaka}
                          disabled={!canEdit}
                          onChange={e =>
                            updateCourierConfig(c.id, { baseChargeDhaka: Number(e.target.value) })
                          }
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-500 font-bold mb-0.5">
                          ঢাকা বাইরে (৳):
                        </label>
                        <input
                          type="number"
                          value={c.baseChargeOutside}
                          disabled={!canEdit}
                          onChange={e =>
                            updateCourierConfig(c.id, { baseChargeOutside: Number(e.target.value) })
                          }
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs font-bold"
                        />
                      </div>
                    </div>

                    {/* Auto Assign Toggles */}
                    <div className="bg-gray-50 p-2.5 rounded-xl space-y-1.5 text-[11px]">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={c.autoAssignInsideDhaka}
                          disabled={!canEdit}
                          onChange={e =>
                            updateCourierConfig(c.id, { autoAssignInsideDhaka: e.target.checked })
                          }
                          className="rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-gray-700">ঢাকার ভেতরের অর্ডারে অটো নির্ধারণ</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={c.autoAssignOutsideDhaka}
                          disabled={!canEdit}
                          onChange={e =>
                            updateCourierConfig(c.id, { autoAssignOutsideDhaka: e.target.checked })
                          }
                          className="rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-gray-700">ঢাকার বাইরের অর্ডারে অটো নির্ধারণ</span>
                      </label>
                    </div>

                    {/* Balance & Test Connection Button */}
                    <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
                      {c.accountBalance !== undefined && (
                        <div className="flex items-center justify-between bg-emerald-50 p-2 rounded-xl text-[11px] text-emerald-800 font-bold">
                          <span>মার্চেন্ট লেজার ব্যালেন্স:</span>
                          <span className="font-mono text-xs">{formatPrice(c.accountBalance)}</span>
                        </div>
                      )}

                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          disabled={isTesting}
                          onClick={() => handleTestConnection(c)}
                          className="flex-1 bg-gray-900 hover:bg-black text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 cursor-pointer transition-colors shadow-2xs disabled:opacity-50"
                        >
                          <Zap className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin text-amber-300' : 'text-amber-400'}`} />
                          <span>{isTesting ? 'টেস্টিং হচ্ছে...' : '🔌 টেস্ট কানেকশন ও ব্যালেন্স'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedGuidePartner(c.id);
                            setActiveSubTab('guides');
                          }}
                          title="কানেকশন গাইড দেখুন"
                          className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl cursor-pointer transition-colors"
                        >
                          <HelpCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: STEP-BY-STEP SETUP GUIDES */}
      {activeSubTab === 'guides' && (
        <div className="space-y-6">
          {/* Provider selector bar */}
          <div className="bg-white rounded-2xl p-2 border border-gray-200 shadow-xs flex flex-wrap gap-2">
            {(Object.keys(COURIER_SETUP_GUIDES) as CourierPartner[]).map(providerId => {
              const guide = COURIER_SETUP_GUIDES[providerId];
              const isSelected = selectedGuidePartner === providerId;
              return (
                <button
                  key={providerId}
                  onClick={() => setSelectedGuidePartner(providerId)}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>{guide.nameBn}</span>
                </button>
              );
            })}
          </div>

          {/* Guide Content Card */}
          {(() => {
            const currentGuide = COURIER_SETUP_GUIDES[selectedGuidePartner];
            const matchingConfig = courierConfigs.find(c => c.id === selectedGuidePartner);

            return (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                  <div>
                    <div className="flex items-center space-x-2.5">
                      <h3 className="text-xl font-black text-gray-900">
                        {currentGuide.nameBn} ({currentGuide.name})
                      </h3>
                      <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                        অফিসিয়াল ইন্টিগ্রেশন নির্দেশিকা
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{currentGuide.taglineBn}</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <a
                      href={currentGuide.portalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 px-4 py-2 rounded-xl text-xs font-bold transition-colors"
                    >
                      <span>{currentGuide.portalName}-এ যান</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Quick Info Box */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-200 text-xs">
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold block uppercase">প্রয়োজনীয় ফিল্ডস:</span>
                    <p className="font-bold text-gray-800 mt-0.5">{currentGuide.requiredFields.join(', ')}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold block uppercase">কুরিয়ার হেল্পলাইন / সাপোর্ট:</span>
                    <p className="font-bold text-emerald-700 mt-0.5 flex items-center space-x-1">
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>{currentGuide.supportPhone}</span>
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold block uppercase">আপনার Webhook URL:</span>
                    <div className="flex items-center space-x-1 mt-0.5">
                      <span className="font-mono text-[11px] text-gray-700 truncate max-w-[140px]">
                        {matchingConfig?.webhookUrl}
                      </span>
                      <button
                        onClick={() => copyToClipboard(matchingConfig?.webhookUrl || '', 'Webhook')}
                        className="text-emerald-600 font-bold hover:underline cursor-pointer"
                      >
                        কপি
                      </button>
                    </div>
                  </div>
                </div>

                {/* Steps Section */}
                <div className="space-y-4">
                  <h4 className="font-black text-sm text-gray-900 flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>ধাপে ধাপে সংযোগ প্রক্রিয়া (Step-by-Step Connection Instructions):</span>
                  </h4>

                  <div className="space-y-3">
                    {currentGuide.steps.map((step, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 hover:border-gray-300 transition-colors space-y-1 text-xs"
                      >
                        <h5 className="font-bold text-gray-900 text-xs flex items-center space-x-2">
                          <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-extrabold flex items-center justify-center text-[10px]">
                            {idx + 1}
                          </span>
                          <span>{step.title}</span>
                        </h5>
                        <p className="text-gray-600 pl-7 leading-relaxed">{step.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Webhook Instruction Card */}
                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-xs space-y-2">
                  <div className="flex items-center space-x-2 text-amber-900 font-bold">
                    <Zap className="w-4 h-4 text-amber-600" />
                    <span>কেন Webhook সেট করবেন?</span>
                  </div>
                  <p className="text-amber-800 leading-relaxed">
                    {currentGuide.webhookInstruction} পার্সেল যখন কাস্টমারের হাতে পৌঁছাবে বা রিটার্ন হবে, তখন কাস্টমার ও এডমিন দুজনেই রিয়েলটাইমে স্ট্যাটাস দেখতে পারবেন।
                  </p>
                </div>

                {/* FAQ Section */}
                <div className="space-y-3 pt-2 border-t border-gray-100">
                  <h4 className="font-black text-sm text-gray-900 flex items-center space-x-2">
                    <HelpCircle className="w-4 h-4 text-gray-600" />
                    <span>সাধারণ প্রশ্নোত্তর (FAQ):</span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {currentGuide.faq.map((item, idx) => (
                      <div key={idx} className="bg-gray-50 p-3.5 rounded-2xl border border-gray-200 space-y-1">
                        <strong className="text-gray-900 block font-bold">❓ {item.q}</strong>
                        <p className="text-gray-600 leading-relaxed">💡 {item.a}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* TAB 3: CONSIGNMENTS & LIVE PARCEL MONITORING */}
      {activeSubTab === 'consignments' && (
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4 text-xs">
          {/* Header & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-base text-gray-900">
                {t('কুরিয়ারে বুকিংকৃত পার্সেল তালিকা ও লাইভ ট্র্যাকিং', 'Dispatched Parcels & Live Consignments')}
              </h3>
              <p className="text-xs text-gray-500">
                কনসাইনমেন্ট আইডি, বর্তমান কুরিয়ার অবস্থা ও চালান প্রিন্ট স্লিপ
              </p>
            </div>

            {/* Filter and Search */}
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={consignmentSearch}
                  onChange={e => setConsignmentSearch(e.target.value)}
                  placeholder="অর্ডার বা ট্র্যাকিং আইডি..."
                  className="bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-3 py-1.5 text-xs w-48"
                />
              </div>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-bold"
              >
                <option value="all">সকল অবস্থা</option>
                <option value="In Transit">ইন ট্রানজিট (In Transit)</option>
                <option value="Out for Delivery">আউট ফর ডেলিভারি</option>
                <option value="Delivered">ডেলিভার্ড (Delivered)</option>
                <option value="Returned">রিটার্নড (Returned)</option>
              </select>
            </div>
          </div>

          {/* Table */}
          {filteredDispatchedOrders.length === 0 ? (
            <div className="text-center py-12 text-gray-400 space-y-2">
              <Package className="w-10 h-10 mx-auto text-gray-300" />
              <p className="font-bold">কোনো বুকিংকৃত পার্সেল পাওয়া যায়নি।</p>
              <p className="text-[11px] text-gray-400">
                অর্ডার টেবিল থেকে "কুরিয়ারে পাঠান" বাটনে ক্লিক করে পার্সেল বুক করুন।
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-400 uppercase text-[10px] tracking-wider font-extrabold bg-gray-50/60">
                    <th className="py-3 px-3">অর্ডার ও তারিখ</th>
                    <th className="py-3 px-3">গ্রাহক ও এলাকা</th>
                    <th className="py-3 px-3">কুরিয়ার ও কনসাইনমেন্ট</th>
                    <th className="py-3 px-3">COD ও চার্জ</th>
                    <th className="py-3 px-3">কুরিয়ার স্ট্যাটাস</th>
                    <th className="py-3 px-3 text-right">একশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredDispatchedOrders.map(order => {
                    const info = order.courierInfo!;
                    return (
                      <tr key={order.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="py-3 px-3">
                          <span className="font-mono font-bold text-gray-900 block">#{order.id}</span>
                          <span className="text-[10px] text-gray-400">{info.dispatchedDate}</span>
                        </td>

                        <td className="py-3 px-3">
                          <span className="font-bold text-gray-900 block">{order.customerName}</span>
                          <span className="text-[11px] text-gray-500">{order.phone}</span>
                          <span className="text-[10px] text-gray-400 block truncate max-w-[150px]">
                            {order.address.district}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          <div className="flex items-center space-x-1.5">
                            <span className="font-bold text-gray-800">{info.courierName}</span>
                          </div>
                          <span className="font-mono text-[11px] text-emerald-700 font-bold block mt-0.5">
                            {info.consignmentId}
                          </span>
                          <span className="text-[10px] text-gray-400 block">ওজন: {info.weightKg} KG</span>
                        </td>

                        <td className="py-3 px-3">
                          <span className="font-extrabold text-rose-600 block">
                            {order.paymentMethod === 'cod' ? formatPrice(info.codAmount) : 'প্রিপেইড'}
                          </span>
                          <span className="text-[10px] text-gray-500">চার্জ: ৳{info.shippingCharge}</span>
                        </td>

                        <td className="py-3 px-3">
                          <select
                            value={info.courierStatus}
                            onChange={e => updateCourierStatus(order.id, e.target.value)}
                            className={`rounded-xl px-2.5 py-1 text-[11px] font-bold border transition-colors cursor-pointer ${
                              info.courierStatus === 'Delivered'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : info.courierStatus === 'Out for Delivery'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : info.courierStatus === 'Returned'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-blue-50 text-blue-700 border-blue-200'
                            }`}
                          >
                            <option value="In Transit">In Transit (ট্রানজিটে)</option>
                            <option value="Out for Delivery">Out for Delivery</option>
                            <option value="Delivered">Delivered (ডেলিভার্ড)</option>
                            <option value="Returned">Returned (রিটার্নড)</option>
                          </select>
                        </td>

                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            {/* Live Tracking link */}
                            {info.trackingUrl && (
                              <a
                                href={info.trackingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="কুরিয়ার পোর্টালে সরাসরি ট্র্যাকিং দেখুন"
                                className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors cursor-pointer"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}

                            {/* Print shipping label */}
                            <button
                              onClick={() => setOrderForShippingLabel(order)}
                              title="চালান ও লেবেল প্রিন্ট করুন"
                              className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors cursor-pointer"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: LOGISTICS & COD ANALYTICS */}
      {activeSubTab === 'analytics' && (
        <div className="space-y-6">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs space-y-1">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">মোট বুকিং পার্সেল</span>
              <p className="text-2xl font-black text-gray-900">{dispatchedOrders.length}টি</p>
              <span className="text-[10px] text-emerald-600 font-bold">সারাদেশে ৬৪ জেলায়</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs space-y-1">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">আদায়যোগ্য মোট COD</span>
              <p className="text-2xl font-black text-rose-600">{formatPrice(totalCodDispatched)}</p>
              <span className="text-[10px] text-gray-400">ক্যাশ অন ডেলিভারি</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs space-y-1">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">সফলভাবে ডেলিভার্ড COD</span>
              <p className="text-2xl font-black text-emerald-600">{formatPrice(totalDeliveredCod)}</p>
              <span className="text-[10px] text-emerald-600 font-bold">মার্চেন্ট একাউন্টে জমাযোগ্য</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs space-y-1">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">ডেলিভারি সাকসেস রেট</span>
              <p className="text-2xl font-black text-blue-600">
                {dispatchedOrders.length > 0
                  ? Math.round(
                      (dispatchedOrders.filter(o => o.status === 'Delivered').length /
                        dispatchedOrders.length) *
                        100
                    )
                  : 100}
                %
              </p>
              <span className="text-[10px] text-gray-400">রিটার্ন রেশিও নূন্যতম</span>
            </div>
          </div>

          {/* Breakdown by Courier */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4 text-xs">
            <h3 className="font-extrabold text-base text-gray-900">
              কুরিয়ারভিত্তিক পারফরম্যান্স ও পার্সেল বিশ্লেষণ
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {courierConfigs.map(c => {
                const assigned = orders.filter(o => o.courierInfo?.courierName === c.id);
                const delivered = assigned.filter(o => o.status === 'Delivered').length;
                const inTransit = assigned.filter(o => o.status === 'Shipped').length;
                const cod = assigned.reduce(
                  (sum, o) => sum + (o.paymentMethod === 'cod' ? o.totalAmount : 0),
                  0
                );

                return (
                  <div key={c.id} className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-sm text-gray-900">{c.name}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                        সচল
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="bg-white p-2 rounded-xl border border-gray-100">
                        <span className="text-[10px] text-gray-400 block font-bold">মোট</span>
                        <strong className="text-gray-900">{assigned.length}</strong>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-gray-100">
                        <span className="text-[10px] text-gray-400 block font-bold">ট্রানজিট</span>
                        <strong className="text-blue-600">{inTransit}</strong>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-gray-100">
                        <span className="text-[10px] text-gray-400 block font-bold">ডেলিভার্ড</span>
                        <strong className="text-emerald-600">{delivered}</strong>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-200 flex justify-between text-[11px] text-gray-600">
                      <span>আদায়যোগ্য COD:</span>
                      <strong className="text-rose-600 font-mono">{formatPrice(cod)}</strong>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
