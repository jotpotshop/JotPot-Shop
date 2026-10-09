import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  Bot,
  User,
  Phone,
  Clock,
  Sparkles,
  ShoppingBag,
  ExternalLink,
  Search,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Power,
  PowerOff,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { MessageChannel, UnifiedConversation } from '../../types';

export const OmnichannelChatManager: React.FC = () => {
  const {
    conversations,
    replyToConversation,
    toggleAiSalesAgent,
    liveChatSettings,
    products,
    adminUser,
    formatPrice,
    t,
  } = useShop();

  const [channelFilter, setChannelFilter] = useState<'all' | MessageChannel>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConvId, setSelectedConvId] = useState<string>(() => {
    return conversations[0]?.id || '';
  });
  const [replyText, setReplyText] = useState('');
  const [selectedProductAttachment, setSelectedProductAttachment] = useState<string>('');

  // Filter conversations
  const filteredConversations = conversations.filter(c => {
    if (channelFilter !== 'all' && c.channel !== channelFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = c.customerName.toLowerCase().includes(q);
      const matchPhone = (c.customerPhone || '').toLowerCase().includes(q);
      const matchMsg = c.lastMessage.toLowerCase().includes(q);
      return matchName || matchPhone || matchMsg;
    }
    return true;
  });

  const activeConv = conversations.find(c => c.id === selectedConvId) || filteredConversations[0] || null;

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConv || !replyText.trim()) return;

    replyToConversation(
      activeConv.id,
      replyText.trim(),
      adminUser?.name || 'স্টাফ সাপোর্ট',
      selectedProductAttachment || undefined
    );
    setReplyText('');
    setSelectedProductAttachment('');
  };

  const handleQuickInsert = (text: string) => {
    setReplyText(prev => (prev ? `${prev} ${text}` : text));
  };

  const getChannelBadge = (ch: MessageChannel) => {
    switch (ch) {
      case 'livechat':
        return {
          label: 'ওয়েব লাইভ চ্যাট',
          bgColor: 'bg-rose-100 text-rose-800 border-rose-200',
          dotColor: 'bg-rose-500',
        };
      case 'whatsapp':
        return {
          label: 'হোয়াটসঅ্যাপ',
          bgColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          dotColor: 'bg-emerald-500',
        };
      case 'messenger':
        return {
          label: 'মেসেঞ্জার',
          bgColor: 'bg-blue-100 text-blue-800 border-blue-200',
          dotColor: 'bg-blue-500',
        };
      default:
        return {
          label: 'চ্যাট',
          bgColor: 'bg-gray-100 text-gray-800 border-gray-200',
          dotColor: 'bg-gray-500',
        };
    }
  };

  const totalUnread = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  return (
    <div className="space-y-4">
      {/* Top Banner: Omnichannel Hub & AI Sales Toggle */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 rounded-3xl p-5 text-white shadow-md border border-rose-900/40">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                Unified Omnichannel Inbox
              </span>
              {totalUnread > 0 && (
                <span className="bg-amber-400 text-gray-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                  {totalUnread}টি নতুন মেসেজ
                </span>
              )}
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white">
              {t('লাইভ চ্যাট, মেসেঞ্জার ও হোয়াটসঅ্যাপ কাস্টমার ইনবক্স', 'Live Chat, Messenger & WhatsApp Inbox')}
            </h2>
            <p className="text-xs text-slate-300">
              সকল চ্যানেলের মেসেজ এক জায়গায় জমা হচ্ছে। এখান থেকে সুপার এডমিন, এডমিন, ম্যানেজার ও স্টাফ সহজে উত্তর দিতে পারবেন।
            </p>
          </div>

          {/* AI Sales Assistant ON/OFF Switch */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/15 flex items-center justify-between gap-4 min-w-[280px]">
            <div className="flex items-center space-x-2.5">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  liveChatSettings.enableAiSalesAgent
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs font-black">
                    {liveChatSettings.aiSalesAgentName || 'এআই সেলস সহকারী'}
                  </span>
                  <span
                    className={`text-[9px] font-black px-1.5 py-0.2 rounded ${
                      liveChatSettings.enableAiSalesAgent
                        ? 'bg-emerald-400 text-gray-950'
                        : 'bg-gray-600 text-gray-200'
                    }`}
                  >
                    {liveChatSettings.enableAiSalesAgent ? 'চালু (Active)' : 'বন্ধ (Off)'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-300">
                  {liveChatSettings.enableAiSalesAgent
                    ? 'স্বয়ংক্রিয়ভাবে কথা বলে পণ্য বিক্রি করছে'
                    : 'ম্যানুয়াল উত্তর মোড সক্রিয়'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => toggleAiSalesAgent()}
              className={`px-3 py-1.5 rounded-xl text-xs font-black cursor-pointer transition-all flex items-center space-x-1.5 ${
                liveChatSettings.enableAiSalesAgent
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-gray-950 shadow-md'
                  : 'bg-white/20 hover:bg-white/30 text-white'
              }`}
            >
              {liveChatSettings.enableAiSalesAgent ? (
                <>
                  <Power className="w-3.5 h-3.5" />
                  <span>বন্ধ করুন</span>
                </>
              ) : (
                <>
                  <PowerOff className="w-3.5 h-3.5" />
                  <span>চালু করুন</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Inbox Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Conversation Directory & Channel Filters */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-gray-200 shadow-xs p-3 space-y-3 flex flex-col h-[650px]">
          {/* Channel Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs font-bold scrollbar-none">
            <button
              onClick={() => setChannelFilter('all')}
              className={`px-2.5 py-1.5 rounded-xl cursor-pointer whitespace-nowrap transition-colors ${
                channelFilter === 'all'
                  ? 'bg-gray-900 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              সব ({conversations.length})
            </button>
            <button
              onClick={() => setChannelFilter('livechat')}
              className={`px-2.5 py-1.5 rounded-xl cursor-pointer whitespace-nowrap transition-colors flex items-center space-x-1 ${
                channelFilter === 'livechat'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span>লাইভ চ্যাট</span>
            </button>
            <button
              onClick={() => setChannelFilter('whatsapp')}
              className={`px-2.5 py-1.5 rounded-xl cursor-pointer whitespace-nowrap transition-colors flex items-center space-x-1 ${
                channelFilter === 'whatsapp'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>WhatsApp</span>
            </button>
            <button
              onClick={() => setChannelFilter('messenger')}
              className={`px-2.5 py-1.5 rounded-xl cursor-pointer whitespace-nowrap transition-colors flex items-center space-x-1 ${
                channelFilter === 'messenger'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span>Messenger</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="গ্রাহকের নাম, নম্বর বা মেসেজ খুঁজুন..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-gray-800 focus:bg-white focus:border-rose-500"
            />
          </div>

          {/* Conversations Scroll List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredConversations.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-xs">
                কোনো বার্তা পাওয়া যায়নি
              </div>
            ) : (
              filteredConversations.map(conv => {
                const badge = getChannelBadge(conv.channel);
                const isSelected = activeConv?.id === conv.id;
                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConvId(conv.id)}
                    className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer relative ${
                      isSelected
                        ? 'border-rose-500 bg-rose-50/60 shadow-xs ring-1 ring-rose-400/30'
                        : 'border-gray-100 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-1.5 min-w-0">
                        <span className={`w-2 h-2 rounded-full ${badge.dotColor} shrink-0`} />
                        <span className="font-extrabold text-xs text-gray-900 truncate">
                          {conv.customerName}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-400 shrink-0 font-medium">
                        {conv.lastMessageTime}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${badge.bgColor}`}>
                        {badge.label}
                      </span>
                      {conv.customerPhone && (
                        <span className="text-[10px] text-gray-500 font-mono">
                          {conv.customerPhone}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-gray-600 line-clamp-1 mt-1 font-normal">
                      {conv.lastMessage}
                    </p>

                    {conv.unreadCount > 0 && (
                      <span className="absolute top-2 right-2 w-2 h-2 bg-rose-600 rounded-full" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Chat History & Reply Workspace */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-gray-200 shadow-xs flex flex-col h-[650px] overflow-hidden">
          {activeConv ? (
            <>
              {/* Header Bar */}
              <div className="p-4 border-b border-gray-100 bg-gray-50/70 flex items-center justify-between gap-3 shrink-0">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white font-extrabold text-sm flex items-center justify-center shadow-xs">
                    {activeConv.customerName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-extrabold text-sm text-gray-900">
                        {activeConv.customerName}
                      </h3>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                          getChannelBadge(activeConv.channel).bgColor
                        }`}
                      >
                        {getChannelBadge(activeConv.channel).label}
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-500 flex items-center space-x-2 mt-0.5">
                      {activeConv.customerPhone && (
                        <span className="font-mono">{activeConv.customerPhone}</span>
                      )}
                      <span>•</span>
                      <span className="text-emerald-600 font-semibold flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                        <span>সরাসরি কথোপকথন চলমান</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-xl ${
                      activeConv.status === 'open'
                        ? 'bg-amber-100 text-amber-800'
                        : activeConv.status === 'waiting'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {activeConv.status === 'open'
                      ? 'অপেক্ষমান'
                      : activeConv.status === 'waiting'
                      ? 'রিপ্লাই পাঠানো হয়েছে'
                      : 'সমাধান হয়েছে'}
                  </span>
                </div>
              </div>

              {/* Chat Thread Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
                {activeConv.messages.map(msg => {
                  const isCustomer = msg.sender === 'customer';
                  const isAi = msg.sender === 'ai';
                  const isStaff = msg.sender === 'staff';

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isCustomer ? 'items-start' : 'items-end'}`}
                    >
                      <div className="flex items-center space-x-1 text-[10px] text-gray-400 mb-0.5 px-1">
                        {isAi && (
                          <span className="text-purple-600 font-bold flex items-center space-x-0.5">
                            <Bot className="w-3 h-3" />
                            <span>{msg.senderName}</span>
                          </span>
                        )}
                        {isStaff && (
                          <span className="text-rose-600 font-bold flex items-center space-x-0.5">
                            <User className="w-3 h-3" />
                            <span>{msg.senderName}</span>
                          </span>
                        )}
                        {isCustomer && (
                          <span className="font-semibold text-gray-600">{msg.senderName}</span>
                        )}
                        <span>•</span>
                        <span>{msg.timestamp}</span>
                      </div>

                      <div
                        className={`max-w-[85%] sm:max-w-[70%] p-3.5 rounded-2xl text-xs shadow-2xs whitespace-pre-line leading-relaxed ${
                          isCustomer
                            ? 'bg-white text-gray-800 border border-gray-200 rounded-tl-xs'
                            : isAi
                            ? 'bg-gradient-to-br from-purple-700 via-indigo-700 to-purple-800 text-white rounded-tr-xs shadow-purple-900/10'
                            : 'bg-rose-600 text-white rounded-tr-xs shadow-rose-600/20'
                        }`}
                      >
                        <p>{msg.text}</p>

                        {/* If product card attached */}
                        {msg.productId && msg.productName && (
                          <div
                            className={`mt-2.5 p-2 rounded-xl flex items-center space-x-2.5 border ${
                              isCustomer
                                ? 'bg-gray-50 border-gray-200 text-gray-900'
                                : 'bg-white/10 border-white/20 text-white'
                            }`}
                          >
                            {msg.productImage && (
                              <img
                                src={msg.productImage}
                                alt={msg.productName}
                                className="w-10 h-10 object-cover rounded-lg shrink-0"
                              />
                            )}
                            <div className="min-w-0 flex-1">
                              <span className="font-bold text-[11px] block truncate">
                                {msg.productName}
                              </span>
                              {msg.productPrice && (
                                <span className="font-black text-amber-300 text-xs">
                                  {formatPrice(msg.productPrice)}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] font-bold bg-white text-gray-900 px-2 py-0.5 rounded-lg shrink-0 shadow-2xs">
                              পণ্য সুপারিশ
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Preset Buttons Strip */}
              <div className="px-4 py-2 border-t border-gray-100 bg-white flex items-center gap-1.5 overflow-x-auto text-[11px] scrollbar-none shrink-0">
                <span className="text-[10px] text-gray-400 font-bold shrink-0">কুইক রিপ্লাই:</span>
                <button
                  type="button"
                  onClick={() => handleQuickInsert('জী, পণ্যটি বর্তমানে স্টকে এভেইলেবল রয়েছে।')}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-2.5 py-1 rounded-lg shrink-0 cursor-pointer transition-colors"
                >
                  স্টকে আছে
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleQuickInsert(
                      'আজকের জন্য চট্টগ্রাম সিটিতে ডেলিভারি চার্জ সম্পূর্ণ ফ্রি! এখনই অর্ডার করুন।'
                    )
                  }
                  className="bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold px-2.5 py-1 rounded-lg shrink-0 cursor-pointer transition-colors"
                >
                  🎉 চট্টগ্রামে ফ্রি ডেলিভারি
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleQuickInsert(
                      'আমরা সারা দেশে ক্যাশ অন ডেলিভারিতে পাঠাচ্ছি। আপনার নাম, ঠিকানা ও নম্বর দিলে অর্ডার কনফার্ম করে দিচ্ছি।'
                    )
                  }
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-2.5 py-1 rounded-lg shrink-0 cursor-pointer transition-colors"
                >
                  ক্যাশ অন ডেলিভারি
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleQuickInsert('আপনার পছন্দের সাইজ ও কালার জানিয়ে আমাদের নিশ্চিত করুন।')
                  }
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-2.5 py-1 rounded-lg shrink-0 cursor-pointer transition-colors"
                >
                  সাইজ ও কালার
                </button>
              </div>

              {/* Reply Form */}
              <form onSubmit={handleSendReply} className="p-3 border-t border-gray-200 bg-gray-50/50 space-y-2 shrink-0">
                {/* Product Attachment Dropdown */}
                <div className="flex items-center space-x-2">
                  <ShoppingBag className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <select
                    value={selectedProductAttachment}
                    onChange={e => setSelectedProductAttachment(e.target.value)}
                    className="bg-white border border-gray-200 rounded-xl px-2.5 py-1 text-[11px] text-gray-700 cursor-pointer focus:border-rose-500"
                  >
                    <option value="">পণ্য লিঙ্ক/কার্ড যুক্ত করুন (ঐচ্ছিক)...</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.nameBn || p.name} - ৳{p.price}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <textarea
                    rows={2}
                    required
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder="কাস্টমারকে সরাসরি রিপ্লাই লিখুন (সুপার এডমিন, এডমিন, ম্যানেজার ও স্টাফ যে কেউ উত্তর দিতে পারেন)..."
                    className="flex-1 bg-white border border-gray-200 rounded-2xl p-2.5 text-xs text-gray-900 focus:outline-hidden focus:border-rose-500 resize-none shadow-2xs"
                  />
                  <button
                    type="submit"
                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-3 rounded-2xl flex items-center space-x-1.5 cursor-pointer shadow-md shadow-rose-600/20 active:scale-95 transition-all self-end"
                  >
                    <Send className="w-4 h-4" />
                    <span className="text-xs">পাঠান</span>
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400">
              <MessageSquare className="w-12 h-12 text-gray-300 mb-2" />
              <p className="text-xs">একটি কথোপকথন নির্বাচন করুন</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
