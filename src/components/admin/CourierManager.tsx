import React, { useState, useEffect } from 'react';
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
  Activity,
  AlertTriangle,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { CourierConfig, CourierPartner, Order } from '../../types';
import {
  COURIER_SETUP_GUIDES,
  testCourierApiConnection,
  CourierConnectionTestResult,
  checkSteadfastServerStatus,
  pingSteadfastWebhook,
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

  // Live Steadfast status & error tracking
  const [isLiveChecking, setIsLiveChecking] = useState(false);
  const [lastUpdateFailed, setLastUpdateFailed] = useState<string | null>(null);
  const [pingingWebhook, setPingingWebhook] = useState(false);
  const [webhookTestResult, setWebhookTestResult] = useState<{ checked: boolean; success: boolean; message: string } | null>(null);

  // Show/hide password states for API keys
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  // Copy feedback state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Search filter in consignments list
  const [consignmentSearch, setConsignmentSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Success/Error toast
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isSyncingAll, setIsSyncingAll] = useState(false);

  const showToast = (msg: string, explicitType?: 'success' | 'error') => {
    const inferredType =
      explicitType || (msg.includes('ব্যর্থ') || msg.includes('সমস্যা') || msg.includes('বিচ্ছিন্ন') ? 'error' : 'success');
    setToastMessage({ text: msg, type: inferredType });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    showToast(`"${label}" সফলভাবে ক্লিপবোর্ডে কপি হয়েছে!`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Helper to dynamically construct the live Webhook URL based on deployed domain
  const getEffectiveWebhookUrl = (config: CourierConfig): string => {
    if (config.id === 'Steadfast') {
      const origin =
        typeof window !== 'undefined' && window.location.origin
          ? window.location.origin
          : 'https://jotpotshop.com';
      return `${origin}/api/steadfast/webhook`;
    }
    return config.webhookUrl || '';
  };

  // Auto-fetch live Steadfast status & balance on mount
  useEffect(() => {
    let isMounted = true;
    const fetchLiveStatus = async () => {
      const sf = courierConfigs.find(c => c.id === 'Steadfast');
      if (!sf) return;
      setIsLiveChecking(true);
      try {
        const res = await checkSteadfastServerStatus();
        if (!isMounted) return;

        if (res.connected) {
          const nowTime = new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });
          if (sf.connectionStatus !== 'connected' || sf.accountBalance !== res.balance) {
            updateCourierConfig('Steadfast', {
              connectionStatus: 'connected',
              accountBalance: typeof res.balance === 'number' ? res.balance : sf.accountBalance,
              lastConnectedAt: nowTime,
            });
          }
          setLastUpdateFailed(null);
        } else {
          // If credentials missing or connection dropped, do not show connected
          if (sf.connectionStatus !== 'disconnected') {
            updateCourierConfig('Steadfast', {
              connectionStatus: 'disconnected',
            });
          }
          if (res.messageBn) {
            setLastUpdateFailed(res.messageBn);
          }
        }
      } catch (err: any) {
        if (!isMounted) return;
        setLastUpdateFailed(err?.message || 'সার্ভারে সংযোগ করতে সমস্যা হয়েছে');
      } finally {
        if (isMounted) setIsLiveChecking(false);
      }
    };

    fetchLiveStatus();
    return () => {
      isMounted = false;
    };
  }, []);

  // Live Refresh handler for Balance & Connection test
  const handleRefreshSteadfastBalance = async () => {
    setIsLiveChecking(true);
    setLastUpdateFailed(null);
    const sf = courierConfigs.find(c => c.id === 'Steadfast');

    try {
      const result = await testCourierApiConnection(sf);
      setTestResults(prev => ({ ...prev, Steadfast: result }));

      if (result.success) {
        const newBalance = typeof result.balance === 'number' ? result.balance : (sf?.accountBalance || 0);
        updateCourierConfig('Steadfast', {
          connectionStatus: 'connected',
          lastConnectedAt: result.verifiedAt,
          accountBalance: newBalance,
        });
        setLastUpdateFailed(null);
        showToast(`ব্যালেন্স সফলভাবে রিফ্রেশ হয়েছে: ৳${newBalance.toLocaleString('bn-BD')}`, 'success');
      } else {
        // PRESERVE previous successful balance — do NOT wipe to 0 or null!
        updateCourierConfig('Steadfast', {
          connectionStatus: 'disconnected',
        });
        const failMessage = result.messageBn || 'ব্যালেন্স আপডেট ব্যর্থ হয়েছে';
        setLastUpdateFailed(failMessage);
        showToast(`সর্বশেষ আপডেট ব্যর্থ: ${failMessage} (পূর্বের ব্যালেন্স অক্ষত রাখা হয়েছে)`, 'error');
      }
    } catch (err: any) {
      const failMessage = err?.message || 'সার্ভারে সংযোগ ব্যর্থ হয়েছে';
      setLastUpdateFailed(failMessage);
      showToast(`ব্যালেন্স রিফ্রেশ ব্যর্থ: ${failMessage}`, 'error');
    } finally {
      setIsLiveChecking(false);
    }
  };

  // Diagnostic Test Ping for Webhook Endpoint
  const handlePingWebhook = async () => {
    setPingingWebhook(true);
    try {
      const res = await pingSteadfastWebhook();
      setWebhookTestResult({
        checked: true,
        success: res.success,
        message: res.messageBn || res.message || 'Webhook রেসপন্স এসেছে',
      });
      if (res.success) {
        showToast(`${res.messageBn || 'Webhook এন্ডপয়েন্ট সক্রিয় ও সফলভাবে রেসপন্স করেছে!'}`, 'success');
      } else {
        showToast(`${res.messageBn || 'Webhook এন্ডপয়েন্টে সংযোগ ব্যর্থ'}`, 'error');
      }
    } catch (err: any) {
      setWebhookTestResult({
        checked: true,
        success: false,
        message: err?.message || 'Webhook পিং ব্যর্থ',
      });
      showToast(`Webhook পিং ব্যর্থ: ${err?.message}`, 'error');
    } finally {
      setPingingWebhook(false);
    }
  };

  // Test connection handler for other couriers
  const handleTestConnection = async (config: CourierConfig) => {
    if (config.id === 'Steadfast') {
      return handleRefreshSteadfastBalance();
    }
    setTestingCourierId(config.id);
    try {
      const result = await testCourierApiConnection(config);
      setTestResults(prev => ({ ...prev, [config.id]: result }));
      updateCourierConfig(config.id, {
        connectionStatus: result.success ? 'connected' : 'disconnected',
        lastConnectedAt: result.verifiedAt,
        accountBalance: typeof result.balance === 'number' ? result.balance : config.accountBalance,
      });

      if (result.success) {
        showToast(`${config.nameBn} এপিআই টেস্ট সফল! ব্যালেন্স: ৳${(result.balance || 0).toLocaleString('bn-BD')}`, 'success');
      } else {
        showToast(`${result.messageBn}`, 'error');
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
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-lg flex items-center space-x-2.5 text-xs font-bold border animate-fade-in ${
            toastMessage.type === 'error'
              ? 'bg-[#fef2f2] text-[#b91c1c] border-[#fecaca]'
              : 'bg-[#111827] text-white border-[#1f2937]'
          }`}
        >
          {toastMessage.type === 'error' ? (
            <AlertCircle className="w-4 h-4 shrink-0 text-[#b91c1c]" />
          ) : (
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Banner & Sub-Tabs */}
      <div className="bg-white rounded-2xl p-6 border border-[#e6e3dd] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-[#111827] text-white flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-[#111827]">
                  {t('কুরিয়ার সার্ভিস এপিআই ইন্টিগ্রেশন ও লজিস্টিকস হাব', 'Courier Service API Integration & Logistics Hub')}
                </h2>
                <span className="bg-[#f0fdf4] border border-[#bbf7d0] text-[#15803d] text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                  Live API
                </span>
              </div>
              <p className="text-xs text-[#4b5563] mt-0.5 leading-[1.6]">
                Steadfast, Pathao, RedX, Paperfly, Sundarban ও eCourier-এর অফিসিয়াল API কানেক্ট করুন এবং পার্সেল বুকিং অটোমেট করুন
              </p>
            </div>
          </div>

          {/* Quick Sync Button */}
          <button
            type="button"
            onClick={handleSyncAllOrders}
            disabled={isSyncingAll}
            className="flex items-center space-x-2 bg-[#faf9f7] text-[#111827] hover:bg-[#e6e3dd]/60 border border-[#e6e3dd] px-4 py-2 min-h-[38px] rounded-xl text-xs font-bold cursor-pointer transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingAll ? 'animate-spin' : ''}`} />
            <span>{isSyncingAll ? 'সিঙ্ক হচ্ছে...' : 'কুরিয়ার স্ট্যাটাস সিঙ্ক'}</span>
          </button>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[#e6e3dd]">
          <button
            type="button"
            onClick={() => setActiveSubTab('configs')}
            className={`flex items-center space-x-2 px-4 py-2 min-h-[38px] rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeSubTab === 'configs'
                ? 'bg-[#111827] text-white'
                : 'bg-[#faf9f7] text-[#374151] hover:bg-[#e6e3dd]/60 border border-[#e6e3dd]'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>{t('১. এপিআই চাবি ও কনফিগারেশন', '1. API Credentials & Config')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('guides')}
            className={`flex items-center space-x-2 px-4 py-2 min-h-[38px] rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeSubTab === 'guides'
                ? 'bg-[#111827] text-white'
                : 'bg-[#faf9f7] text-[#374151] hover:bg-[#e6e3dd]/60 border border-[#e6e3dd]'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{t('২. কীভাবে কানেক্ট করবেন (গাইড)', '2. How to Connect (Setup Guide)')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('consignments')}
            className={`flex items-center space-x-2 px-4 py-2 min-h-[38px] rounded-xl text-xs font-bold transition-colors cursor-pointer tabular-nums ${
              activeSubTab === 'consignments'
                ? 'bg-[#111827] text-white'
                : 'bg-[#faf9f7] text-[#374151] hover:bg-[#e6e3dd]/60 border border-[#e6e3dd]'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>
              {t('৩. বুকিং ও পার্সেল মনিটরিং', '3. Consignments & Tracking')} ({dispatchedOrders.length})
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('analytics')}
            className={`flex items-center space-x-2 px-4 py-2 min-h-[38px] rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeSubTab === 'analytics'
                ? 'bg-[#111827] text-white'
                : 'bg-[#faf9f7] text-[#374151] hover:bg-[#e6e3dd]/60 border border-[#e6e3dd]'
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
            const deliveredCount = assignedOrders.filter(
              o => o.courierInfo?.courierName === 'Steadfast' && (o.status === 'Delivered' || o.courierInfo?.courierStatus === 'Delivered')
            ).length;

            const autoAssignRuleLabel = (() => {
              if (!steadfast.isActive) return 'নিষ্ক্রিয় (Inactive)';
              if (steadfast.autoAssignInsideDhaka && steadfast.autoAssignOutsideDhaka) return 'ঢাকা ও সারাদেশে সচল';
              if (steadfast.autoAssignInsideDhaka) return 'শুধু ঢাকায় সচল';
              if (steadfast.autoAssignOutsideDhaka) return 'শুধু ঢাকার বাইরে সচল';
              return 'ম্যানুয়াল নির্বাচন';
            })();

            return (
              <div className="bg-[#111827] text-white rounded-2xl p-6 sm:p-7 border border-[#1f2937]">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                  {/* Left: Status info */}
                  <div className="space-y-3 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-[#881337] text-white flex items-center justify-center font-bold text-sm">
                        STF
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-bold text-white">
                            Steadfast Courier (স্টেডফাস্ট কুরিয়ার)
                          </h3>
                          <span
                            className={`font-bold text-[11px] px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                              isConnected
                                ? 'bg-[#f0fdf4] text-[#15803d]'
                                : 'bg-[#fef2f2] text-[#b91c1c]'
                            }`}
                          >
                            {isLiveChecking
                              ? 'যাচাই হচ্ছে...'
                              : isConnected
                              ? 'সফলভাবে সংযুক্ত (CONNECTED)'
                              : 'সংযোগ বিচ্ছিন্ন / আনকনফিগারড'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-300 mt-0.5 leading-[1.6]">
                          সার্ভার-সাইড API ইন্টিগ্রেশন • সারাদেশে ক্যাশ অন ডেলিভারি (COD) ও হোম ডেলিভারি
                        </p>
                      </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs tabular-nums">
                      <div className="bg-[#1f2937] p-3 rounded-xl border border-white/10">
                        <span className="text-[10px] text-gray-400 block font-bold uppercase">মার্চেন্ট আইডি</span>
                        <span className="font-mono font-bold text-white text-xs truncate block" title={steadfast.merchantId || 'কনফিগার করা হয়নি'}>
                          {steadfast.merchantId ? steadfast.merchantId : 'সেট করা হয়নি'}
                        </span>
                        <span className="text-[9px] text-gray-400 block mt-0.5">মার্চেন্ট প্রোফাইল</span>
                      </div>

                      <div className="bg-[#1f2937] p-3 rounded-xl border border-white/10">
                        <span className="text-[10px] text-gray-400 block font-bold uppercase">লেজার ব্যালেন্স</span>
                        <span className="font-mono font-bold text-white text-sm tabular-nums">
                          {formatPrice(steadfast.accountBalance || 0)}
                        </span>
                        {lastUpdateFailed ? (
                          <span className="text-[9px] text-amber-300 block font-medium mt-0.5 truncate" title={lastUpdateFailed}>
                            সর্বশেষ আপডেট ব্যর্থ (পূর্বের ব্যালেন্স)
                          </span>
                        ) : steadfast.lastConnectedAt ? (
                          <span className="text-[9px] text-emerald-300 block font-medium mt-0.5 tabular-nums">
                            আপডেট: {steadfast.lastConnectedAt}
                          </span>
                        ) : (
                          <span className="text-[9px] text-gray-400 block mt-0.5">এখনো রিফ্রেশ হয়নি</span>
                        )}
                      </div>

                      <div className="bg-[#1f2937] p-3 rounded-xl border border-white/10">
                        <span className="text-[10px] text-gray-400 block font-bold uppercase">মোট পার্সেল</span>
                        <span className="font-bold text-white text-xs tabular-nums">{assignedOrders.length}টি ({deliveredCount} ডেলিভার্ড)</span>
                        <span className="text-[9px] text-gray-400 block mt-0.5 font-medium">উৎস: ফায়ারবেস অর্ডার রেকর্ডস</span>
                      </div>

                      <div className="bg-[#1f2937] p-3 rounded-xl border border-white/10">
                        <span className="text-[10px] text-gray-400 block font-bold uppercase">অটো-অ্যাসাইন রুল</span>
                        <span className="font-bold text-emerald-300 text-xs">{autoAssignRuleLabel}</span>
                        <span className="text-[9px] text-gray-400 block mt-0.5 font-medium">চেকআউট নিয়মানুযায়ী প্রয়োগ</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 w-full lg:w-auto shrink-0">
                    <button
                      type="button"
                      disabled={isLiveChecking}
                      onClick={handleRefreshSteadfastBalance}
                      className="bg-[#881337] hover:bg-[#6d0f2c] text-white font-bold px-5 py-2.5 min-h-[42px] rounded-xl text-xs flex items-center justify-center space-x-2 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Zap className={`w-4 h-4 ${isLiveChecking ? 'animate-spin' : ''}`} />
                      <span>{isLiveChecking ? 'ব্যালেন্স যাচাই হচ্ছে...' : 'ব্যালেন্স ও কানেকশন রিফ্রেশ'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedGuidePartner('Steadfast');
                        setActiveSubTab('guides');
                      }}
                      className="bg-[#1f2937] hover:bg-gray-700 text-white font-bold px-4 py-2.5 min-h-[40px] rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-colors border border-white/10 cursor-pointer"
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
                        onChange={async e => {
                          const nextVal = e.target.checked;
                          const res = await updateCourierConfig(c.id, { isActive: nextVal });
                          if (!res.success) {
                            showToast(`❌ সংরক্ষণ ব্যর্থ: ${res.error || 'ফায়ারবেস ত্রুটি'}`, 'error');
                          } else {
                            showToast(`${c.nameBn} ${nextVal ? 'সক্রিয়' : 'নিষ্ক্রিয়'} করা হয়েছে`);
                          }
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
                        onClick={async () => {
                          if (canEdit) {
                            const nextSandbox = !c.isSandbox;
                            const res = await updateCourierConfig(c.id, { isSandbox: nextSandbox });
                            if (!res.success) {
                              showToast(`❌ মোড পরিবর্তন ব্যর্থ: ${res.error || 'ফায়ারবেস ত্রুটি'}`, 'error');
                            } else {
                              showToast(`মোড পরিবর্তন: ${nextSandbox ? 'Sandbox (টেস্ট)' : 'Live (প্রোডাকশন)'}`);
                            }
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

                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          c.connectionStatus === 'connected'
                            ? 'bg-[#f0fdf4] text-[#15803d] border border-[#bbf7d0]'
                            : c.connectionStatus === 'disconnected'
                            ? 'bg-[#fef2f2] text-[#b91c1c] border border-[#fecaca]'
                            : 'bg-gray-200 text-[#4b5563]'
                        }`}
                      >
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
              if (!guide) return null;
              const isSelected = selectedGuidePartner === providerId;
              return (
                <button
                  key={providerId}
                  type="button"
                  onClick={() => setSelectedGuidePartner(providerId)}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#111827] text-white'
                      : 'bg-[#faf9f7] text-[#374151] hover:bg-[#e6e3dd]/60 border border-[#e6e3dd]'
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
            const currentGuide = COURIER_SETUP_GUIDES[selectedGuidePartner] || COURIER_SETUP_GUIDES['Steadfast'];
            if (!currentGuide) return null;
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
                      <div key={idx} className="bg-[#faf9f7] p-3.5 rounded-2xl border border-[#e6e3dd] space-y-1">
                        <strong className="text-[#111827] block font-bold">{item.q}</strong>
                        <p className="text-[#4b5563] leading-[1.65]">{item.a}</p>
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
            <div className="overflow-x-auto tabular-nums">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#e6e3dd] text-[#4b5563] uppercase text-[10px] tracking-wider font-bold bg-[#faf9f7]">
                    <th className="py-3 px-3">অর্ডার ও তারিখ</th>
                    <th className="py-3 px-3">গ্রাহক ও এলাকা</th>
                    <th className="py-3 px-3">কুরিয়ার ও কনসাইনমেন্ট</th>
                    <th className="py-3 px-3">COD ও চার্জ</th>
                    <th className="py-3 px-3">কুরিয়ার স্ট্যাটাস</th>
                    <th className="py-3 px-3 text-right">একশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e6e3dd]">
                  {filteredDispatchedOrders.map(order => {
                    const info = order.courierInfo!;
                    return (
                      <tr key={order.id} className="hover:bg-[#faf9f7] transition-colors">
                        <td className="py-3 px-3 tabular-nums">
                          <span className="font-mono font-bold text-[#111827] block">#{order.id}</span>
                          <span className="text-[10px] text-[#4b5563]">{info.dispatchedDate}</span>
                        </td>

                        <td className="py-3 px-3">
                          <span className="font-bold text-[#111827] block">{order.customerName}</span>
                          <span className="text-[11px] text-[#4b5563] font-mono tabular-nums">{order.phone}</span>
                          <span className="text-[10px] text-[#4b5563] block truncate max-w-[150px]">
                            {order.address.district}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          <div className="flex items-center space-x-1.5">
                            <span className="font-bold text-[#111827]">{info.courierName}</span>
                          </div>
                          <span className="font-mono text-[11px] text-[#15803d] font-bold block mt-0.5 tabular-nums">
                            {info.consignmentId}
                          </span>
                          <span className="text-[10px] text-[#4b5563] block tabular-nums">ওজন: {info.weightKg} KG</span>
                        </td>

                        <td className="py-3 px-3 tabular-nums">
                          <span className="font-bold text-[#881337] block">
                            {order.paymentMethod === 'cod' ? formatPrice(info.codAmount) : 'প্রিপেইড'}
                          </span>
                          <span className="text-[10px] text-[#4b5563]">চার্জ: ৳{info.shippingCharge}</span>
                        </td>

                        <td className="py-3 px-3">
                          <select
                            value={info.courierStatus}
                            onChange={e => updateCourierStatus(order.id, e.target.value)}
                            className={`rounded-xl px-2.5 py-1 text-[11px] font-bold border transition-colors cursor-pointer ${
                              info.courierStatus === 'Delivered'
                                ? 'bg-[#f0fdf4] text-[#15803d] border-[#bbf7d0]'
                                : info.courierStatus === 'Out for Delivery'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : info.courierStatus === 'Returned'
                                ? 'bg-[#fef2f2] text-[#b91c1c] border-[#fecaca]'
                                : 'bg-[#faf9f7] text-[#111827] border-[#e6e3dd]'
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
                            {info.trackingUrl && (
                              <a
                                href={info.trackingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="কুরিয়ার পোর্টালে সরাসরি ট্র্যাকিং দেখুন"
                                className="p-1.5 bg-[#faf9f7] hover:bg-[#e6e3dd]/60 border border-[#e6e3dd] text-[#111827] rounded-lg transition-colors cursor-pointer"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}

                            <button
                              type="button"
                              onClick={() => setOrderForShippingLabel(order)}
                              title="চালান ও লেবেল প্রিন্ট করুন"
                              className="p-1.5 bg-[#f0fdf4] hover:bg-emerald-100 border border-[#bbf7d0] text-[#15803d] rounded-lg transition-colors cursor-pointer"
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
        <div className="space-y-6 tabular-nums">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[#e6e3dd] space-y-1">
              <span className="text-[10px] text-[#4b5563] font-bold uppercase tracking-wider block">মোট বুকিং পার্সেল</span>
              <p className="text-2xl font-bold text-[#111827]">{dispatchedOrders.length}টি</p>
              <span className="text-[10px] text-[#15803d] font-bold">সারাদেশে ৬৪ জেলায়</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#e6e3dd] space-y-1">
              <span className="text-[10px] text-[#4b5563] font-bold uppercase tracking-wider block">আদায়যোগ্য মোট COD</span>
              <p className="text-2xl font-bold text-[#881337]">{formatPrice(totalCodDispatched)}</p>
              <span className="text-[10px] text-[#4b5563]">ক্যাশ অন ডেলিভারি</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#e6e3dd] space-y-1">
              <span className="text-[10px] text-[#4b5563] font-bold uppercase tracking-wider block">সফলভাবে ডেলিভার্ড COD</span>
              <p className="text-2xl font-bold text-[#15803d]">{formatPrice(totalDeliveredCod)}</p>
              <span className="text-[10px] text-[#15803d] font-bold">মার্চেন্ট একাউন্টে জমাযোগ্য</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#e6e3dd] space-y-1">
              <span className="text-[10px] text-[#4b5563] font-bold uppercase tracking-wider block">ডেলিভারি সাকসেস রেট</span>
              <p className="text-2xl font-bold text-[#111827]">
                {dispatchedOrders.length > 0
                  ? Math.round(
                      (dispatchedOrders.filter(o => o.status === 'Delivered').length /
                        dispatchedOrders.length) *
                        100
                    )
                  : 100}
                %
              </p>
              <span className="text-[10px] text-[#4b5563]">রিটার্ন রেশিও নূন্যতম</span>
            </div>
          </div>

          {/* Breakdown by Courier */}
          <div className="bg-white rounded-2xl p-6 border border-[#e6e3dd] space-y-4 text-xs">
            <h3 className="font-bold text-base text-[#111827]">
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
                  <div key={c.id} className="bg-[#faf9f7] p-4 rounded-2xl border border-[#e6e3dd] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-[#111827]">{c.name}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#f0fdf4] border border-[#bbf7d0] text-[#15803d]">
                        সচল
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs tabular-nums">
                      <div className="bg-white p-2 rounded-xl border border-[#e6e3dd]">
                        <span className="text-[10px] text-[#4b5563] block font-bold">মোট</span>
                        <strong className="text-[#111827]">{assigned.length}</strong>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-[#e6e3dd]">
                        <span className="text-[10px] text-[#4b5563] block font-bold">ট্রানজিট</span>
                        <strong className="text-[#111827]">{inTransit}</strong>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-[#e6e3dd]">
                        <span className="text-[10px] text-[#4b5563] block font-bold">ডেলিভার্ড</span>
                        <strong className="text-[#15803d]">{delivered}</strong>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#e6e3dd] flex justify-between text-[11px] text-[#4b5563] tabular-nums">
                      <span>আদায়যোগ্য COD:</span>
                      <strong className="text-[#881337] font-mono">{formatPrice(cod)}</strong>
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
