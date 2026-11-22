import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  Bot,
  User,
  ShoppingBag,
  Search,
  CheckCircle2,
  Power,
  PowerOff,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { MessageChannel } from '../../types';

export const OmnichannelChatManager: React.FC = () => {
  const {
    conversations,
    replyToConversation,
    markConversationAsRead,
    updateConversationStatus,
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
          bgColor: 'bg-[#faf9f7] text-[#881337] border-[#e6e3dd]',
        };
      case 'whatsapp':
        return {
          label: 'হোয়াটসঅ্যাপ',
          bgColor: 'bg-[#f0fdf4] text-[#15803d] border-[#bbf7d0]',
        };
      case 'messenger':
        return {
          label: 'মেসেঞ্জার',
          bgColor: 'bg-[#faf9f7] text-[#111827] border-[#e6e3dd]',
        };
      default:
        return {
          label: 'চ্যাট',
          bgColor: 'bg-[#faf9f7] text-gray-800 border-[#e6e3dd]',
        };
    }
  };

  const totalUnread = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  return (
    <div className="space-y-4">
      {/* Top Banner: Omnichannel Hub & AI Sales Toggle */}
      <div className="bg-[#111827] rounded-3xl p-5 text-white shadow-sm border border-[#1f2937]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-[#881337] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                Unified Omnichannel Inbox
              </span>
              {totalUnread > 0 && (
                <span className="bg-[#f0fdf4] text-[#15803d] border border-[#bbf7d0] text-[10px] font-bold px-2.5 py-0.5 rounded-full tabular-nums">
                  {totalUnread}টি নতুন মেসেজ
                </span>
              )}
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white">
              {t('লাইভ চ্যাট, মেসেঞ্জার ও হোয়াটসঅ্যাপ কাস্টমার ইনবক্স', 'Live Chat, Messenger & WhatsApp Inbox')}
            </h2>
            <p className="text-xs text-gray-300 leading-relaxed">
              সকল চ্যানেলের মেসেজ এক জায়গায় জমা হচ্ছে। এখান থেকে সুপার এডমিন, এডমিন, ম্যানেজার ও স্টাফ সহজে উত্তর দিতে পারবেন।
            </p>
          </div>

          {/* AI Sales Assistant ON/OFF Switch */}
          <div className="bg-[#1f2937] rounded-2xl p-3.5 border border-gray-700 flex items-center justify-between gap-4 min-w-[280px]">
            <div className="flex items-center space-x-2.5">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  liveChatSettings.enableAiSalesAgent
                    ? 'bg-[#15803d] text-white'
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs font-bold">
                    {liveChatSettings.aiSalesAgentName || 'এআই সেলস সহকারী'}
                  </span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      liveChatSettings.enableAiSalesAgent
                        ? 'bg-[#f0fdf4] text-[#15803d]'
                        : 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    {liveChatSettings.enableAiSalesAgent ? 'চালু (Active)' : 'বন্ধ (Off)'}
                  </span>
                </div>
                <p className="text-[10px] text-gray-300">
                  {liveChatSettings.enableAiSalesAgent
                    ? 'স্বয়ংক্রিয়ভাবে কথা বলে পণ্য বিক্রি করছে'
                    : 'ম্যানুয়াল উত্তর মোড সক্রিয়'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => toggleAiSalesAgent()}
              className={`px-3 py-1.5 min-h-[38px] rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center space-x-1.5 shrink-0 ${
                liveChatSettings.enableAiSalesAgent
                  ? 'bg-[#15803d] hover:bg-emerald-800 text-white'
                  : 'bg-[#881337] hover:bg-[#6d0f2c] text-white'
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
        <div className="lg:col-span-4 bg-white rounded-3xl border border-[#e6e3dd] shadow-xs p-3 space-y-3 flex flex-col h-[650px]">
          {/* Channel Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold scrollbar-none">
            <button
              onClick={() => setChannelFilter('all')}
              className={`px-3 py-1.5 min-h-[36px] rounded-xl cursor-pointer whitespace-nowrap transition-colors tabular-nums ${
                channelFilter === 'all'
                  ? 'bg-[#111827] text-white'
                  : 'bg-[#faf9f7] border border-[#e6e3dd] text-gray-700 hover:bg-gray-100'
              }`}
            >
              সব ({conversations.length})
            </button>
            <button
              onClick={() => setChannelFilter('livechat')}
              className={`px-3 py-1.5 min-h-[36px] rounded-xl cursor-pointer whitespace-nowrap transition-colors ${
                channelFilter === 'livechat'
                  ? 'bg-[#881337] text-white'
                  : 'bg-[#faf9f7] border border-[#e6e3dd] text-gray-700 hover:bg-gray-100'
              }`}
            >
              লাইভ চ্যাট
            </button>
            <button
              onClick={() => setChannelFilter('whatsapp')}
              className={`px-3 py-1.5 min-h-[36px] rounded-xl cursor-pointer whitespace-nowrap transition-colors ${
                channelFilter === 'whatsapp'
                  ? 'bg-[#15803d] text-white'
                  : 'bg-[#faf9f7] border border-[#e6e3dd] text-gray-700 hover:bg-gray-100'
              }`}
            >
              WhatsApp
            </button>
            <button
              onClick={() => setChannelFilter('messenger')}
              className={`px-3 py-1.5 min-h-[36px] rounded-xl cursor-pointer whitespace-nowrap transition-colors ${
                channelFilter === 'messenger'
                  ? 'bg-[#111827] text-white'
                  : 'bg-[#faf9f7] border border-[#e6e3dd] text-gray-700 hover:bg-gray-100'
              }`}
            >
              Messenger
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
              className="w-full bg-[#faf9f7] border border-[#e6e3dd] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#111827] focus:bg-white focus:border-[#881337] focus:outline-none"
            />
          </div>

          {/* Conversations Scroll List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredConversations.length === 0 ? (
              <div className="text-center py-12 text-gray-500 text-xs">
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
                    className={`w-full text-left p-3 rounded-2xl border transition-colors cursor-pointer relative ${
                      isSelected
                        ? 'border-[#881337] bg-[#faf9f7]'
                        : 'border-[#e6e3dd] bg-white hover:bg-[#faf9f7]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1 gap-2">
                      <span className="font-bold text-xs text-[#111827] truncate">
                        {conv.customerName}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {conv.unreadCount > 0 && (
                          <span className="bg-[#881337] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full tabular-nums">
                            নতুন {conv.unreadCount}
                          </span>
                        )}
                        <span className="text-[10px] text-gray-500 font-medium tabular-nums">
                          {conv.lastMessageTime}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${badge.bgColor}`}>
                        {badge.label}
                      </span>
                      {conv.customerPhone && (
                        <span className="text-[10px] text-gray-500 font-mono tabular-nums">
                          {conv.customerPhone}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-gray-600 line-clamp-1 mt-1 font-normal">
                      {conv.lastMessage}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Chat History & Reply Workspace */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-[#e6e3dd] shadow-xs flex flex-col h-[650px] overflow-hidden">
          {activeConv ? (
            <>
              {/* Header Bar */}
              <div className="p-4 border-b border-[#e6e3dd] bg-[#faf9f7] flex flex-wrap items-center justify-between gap-3 shrink-0">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#881337] text-white font-bold text-sm flex items-center justify-center shrink-0">
                    {activeConv.customerName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-sm text-[#111827]">
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
                    <div className="text-[11px] text-gray-600 flex items-center space-x-2 mt-0.5">
                      {activeConv.customerPhone && (
                        <span className="font-mono tabular-nums">{activeConv.customerPhone}</span>
                      )}
                      <span>•</span>
                      <span className="text-[#15803d] font-semibold">
                        সরাসরি কথোপকথন চলমান
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {activeConv.unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={() => markConversationAsRead(activeConv.id)}
                      className="bg-white hover:bg-gray-100 text-[#111827] border border-[#e6e3dd] text-[10px] font-bold px-2.5 py-1.5 rounded-xl cursor-pointer transition-colors"
                      title="পঠিত হিসেবে চিহ্নিত করুন"
                    >
                      পঠিত চিহ্নিত করুন
                    </button>
                  )}

                  {activeConv.status !== 'resolved' ? (
                    <button
                      type="button"
                      onClick={() => updateConversationStatus(activeConv.id, 'resolved')}
                      className="bg-[#f0fdf4] hover:bg-emerald-100 text-[#15803d] border border-[#bbf7d0] text-[10px] font-bold px-2.5 py-1.5 rounded-xl cursor-pointer transition-colors flex items-center space-x-1"
                      title="সমস্যা সমাধান হলে ক্লোজ করুন"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>সমাধান চিহ্নিত করুন</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => updateConversationStatus(activeConv.id, 'open')}
                      className="bg-white hover:bg-gray-100 text-[#111827] border border-[#e6e3dd] text-[10px] font-bold px-2.5 py-1.5 rounded-xl cursor-pointer transition-colors"
                      title="কথোপকথন পুনরায় চালু করুন"
                    >
                      পুনরায় ওপেন করুন
                    </button>
                  )}

                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-xl border ${
                      activeConv.status === 'open'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : activeConv.status === 'waiting'
                        ? 'bg-white text-[#111827] border-[#e6e3dd]'
                        : 'bg-[#f0fdf4] text-[#15803d] border-[#bbf7d0]'
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
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#faf9f7]">
                {activeConv.messages.map(msg => {
                  const isCustomer = msg.sender === 'customer';
                  const isAi = msg.sender === 'ai';
                  const isStaff = msg.sender === 'staff';

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isCustomer ? 'items-start' : 'items-end'}`}
                    >
                      <div className="flex items-center space-x-1 text-[10px] text-gray-500 mb-0.5 px-1">
                        {isAi && (
                          <span className="text-[#111827] font-bold flex items-center space-x-0.5">
                            <Bot className="w-3 h-3" />
                            <span>{msg.senderName}</span>
                          </span>
                        )}
                        {isStaff && (
                          <span className="text-[#881337] font-bold flex items-center space-x-0.5">
                            <User className="w-3 h-3" />
                            <span>{msg.senderName}</span>
                          </span>
                        )}
                        {isCustomer && (
                          <span className="font-semibold text-gray-700">{msg.senderName}</span>
                        )}
                        <span>•</span>
                        <span className="tabular-nums">{msg.timestamp}</span>
                      </div>

                      <div
                        className={`max-w-[85%] sm:max-w-[70%] p-3.5 rounded-2xl text-xs whitespace-pre-line leading-relaxed ${
                          isCustomer
                            ? 'bg-white text-[#111827] border border-[#e6e3dd] rounded-tl-xs'
                            : isAi
                            ? 'bg-[#111827] text-white border border-[#1f2937] rounded-tr-xs'
                            : 'bg-[#881337] text-white rounded-tr-xs'
                        }`}
                      >
                        <p>{msg.text}</p>

                        {/* If product card attached */}
                        {msg.productId && msg.productName && (
                          <div
                            className={`mt-2.5 p-2 rounded-xl flex items-center space-x-2.5 border ${
                              isCustomer
                                ? 'bg-[#faf9f7] border-[#e6e3dd] text-[#111827]'
                                : 'bg-[#1f2937] border-gray-700 text-white'
                            }`}
                          >
                            {msg.productImage ? (
                              <img
                                src={msg.productImage}
                                alt={msg.productName}
                                referrerPolicy="no-referrer"
                                className="w-10 h-10 object-cover rounded-lg shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-[#faf9f7] border border-[#e6e3dd] flex items-center justify-center shrink-0 text-gray-400">
                                <ShoppingBag className="w-4 h-4" />
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <span className="font-bold text-[11px] block truncate">
                                {msg.productName}
                              </span>
                              {msg.productPrice && (
                                <span className="font-bold text-amber-300 text-xs tabular-nums">
                                  {formatPrice(msg.productPrice)}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] font-bold bg-white text-[#111827] px-2 py-0.5 rounded-lg shrink-0">
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
              <div className="px-4 py-2 border-t border-[#e6e3dd] bg-white flex items-center gap-1.5 overflow-x-auto text-[11px] scrollbar-none shrink-0">
                <span className="text-[10px] text-gray-500 font-bold shrink-0">কুইক রিপ্লাই:</span>
                <button
                  type="button"
                  onClick={() => handleQuickInsert('জী, পণ্যটি বর্তমানে স্টকে এভেইলেবল রয়েছে।')}
                  className="bg-[#faf9f7] hover:bg-gray-100 border border-[#e6e3dd] text-[#111827] px-2.5 py-1 rounded-lg shrink-0 cursor-pointer transition-colors"
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
                  className="bg-[#f0fdf4] hover:bg-emerald-100 border border-[#bbf7d0] text-[#15803d] font-bold px-2.5 py-1 rounded-lg shrink-0 cursor-pointer transition-colors"
                >
                  চট্টগ্রামে ফ্রি ডেলিভারি
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleQuickInsert(
                      'আমরা সারা দেশে ক্যাশ অন ডেলিভারিতে পাঠাচ্ছি। আপনার নাম, ঠিকানা ও নম্বর দিলে অর্ডার কনফার্ম করে দিচ্ছি।'
                    )
                  }
                  className="bg-[#faf9f7] hover:bg-gray-100 border border-[#e6e3dd] text-[#111827] px-2.5 py-1 rounded-lg shrink-0 cursor-pointer transition-colors"
                >
                  ক্যাশ অন ডেলিভারি
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleQuickInsert('আপনার পছন্দের সাইজ ও কালার জানিয়ে আমাদের নিশ্চিত করুন।')
                  }
                  className="bg-[#faf9f7] hover:bg-gray-100 border border-[#e6e3dd] text-[#111827] px-2.5 py-1 rounded-lg shrink-0 cursor-pointer transition-colors"
                >
                  সাইজ ও কালার
                </button>
              </div>

              {/* Reply Form */}
              <form onSubmit={handleSendReply} className="p-3 border-t border-[#e6e3dd] bg-[#faf9f7] space-y-2 shrink-0">
                {/* Product Attachment Dropdown */}
                <div className="flex items-center space-x-2">
                  <ShoppingBag className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                  <select
                    value={selectedProductAttachment}
                    onChange={e => setSelectedProductAttachment(e.target.value)}
                    className="bg-white border border-[#e6e3dd] rounded-xl px-2.5 py-1 text-[11px] text-gray-700 cursor-pointer focus:border-[#881337] tabular-nums"
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
                    className="flex-1 bg-white border border-[#e6e3dd] rounded-2xl p-2.5 text-xs text-[#111827] focus:outline-hidden focus:border-[#881337] resize-none leading-relaxed"
                  />
                  <button
                    type="submit"
                    className="bg-[#881337] hover:bg-[#6d0f2c] text-white font-bold px-4 py-3 min-h-[38px] rounded-2xl flex items-center space-x-1.5 cursor-pointer transition-colors self-end"
                  >
                    <Send className="w-4 h-4" />
                    <span className="text-xs">পাঠান</span>
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400 space-y-2">
              <div className="w-14 h-14 rounded-3xl bg-[#faf9f7] border border-[#e6e3dd] flex items-center justify-center mx-auto text-gray-400">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-[#111827] text-sm">কোনো বার্তা নির্বাচন করা হয়নি</h4>
              <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
                বামপাশের তালিকা থেকে যেকোনো কাস্টমার কথোপকথন নির্বাচন করুন অথবা নতুন কোনো বার্তা আসলে এখানে স্বয়ংক্রিয়ভাবে ভেসে উঠবে।
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
