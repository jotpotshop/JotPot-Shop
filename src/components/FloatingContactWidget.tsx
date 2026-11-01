import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  Phone,
  CheckCheck,
  ChevronRight,
  Headphones,
  RotateCcw,
  UserCheck,
  ExternalLink,
  Lock,
  LogIn,
  ShieldCheck,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const FloatingContactWidget: React.FC = () => {
  const {
    liveChatSettings,
    helpCenterSettings,
    deliverySettings,
    websiteSettings,
    formatPrice,
    t,
    user,
    conversations,
    sendCustomerChatMessage,
    products,
    setQuickViewProduct,
    setActiveModal,
  } = useShop();

  // Widget state: 'closed' | 'menu' | 'chat'
  const [widgetState, setWidgetState] = useState<'closed' | 'menu' | 'chat'>('closed');
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [messageLimit, setMessageLimit] = useState(25);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);

  // Close menu if user clicks outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (widgetRef.current && !widgetRef.current.contains(event.target as Node)) {
        if (widgetState === 'menu') {
          setWidgetState('closed');
        }
      }
    };
    if (widgetState === 'menu') {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [widgetState]);

  // If floating button is explicitly disabled, do not render
  if (liveChatSettings.enableFloatingButton === false) {
    return null;
  }

  // Format WhatsApp Link
  const rawWhatsapp = (
    helpCenterSettings?.contactButtons?.whatsapp?.number ||
    liveChatSettings.whatsappNumber ||
    websiteSettings.whatsappNumber ||
    '01700000000'
  ).replace(/\D/g, '');
  const cleanWhatsapp = rawWhatsapp.startsWith('880')
    ? rawWhatsapp
    : rawWhatsapp.startsWith('0')
    ? `88${rawWhatsapp}`
    : `880${rawWhatsapp}`;
  const whatsappUrl = `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
    liveChatSettings.whatsappMessageTemplate ||
      'হ্যালো JotPotShop! আমি ওয়েবসাইট থেকে পণ্য বা অর্ডার সহায়তার জন্য যোগাযোগ করছি।'
  )}`;

  // Format Messenger Link
  const rawMessenger = (
    helpCenterSettings?.contactButtons?.messenger?.urlOrId ||
    liveChatSettings.messengerPageUrlOrId ||
    'jotpotshop.bd'
  )
    .replace(/^https?:\/\/(www\.)?(facebook\.com|m\.me)\//i, '')
    .trim();
  const messengerUrl = `https://m.me/${rawMessenger || 'jotpotshop.bd'}`;

  // Direct Call Phone Number
  const directPhone = (
    helpCenterSettings?.contactButtons?.directCall?.phone ||
    liveChatSettings.callHotlineNumber ||
    websiteSettings.hotline ||
    '01800568768'
  ).replace(/\D/g, '');

  // Strictly isolate active livechat thread to authenticated user's UID or verified phone/email
  const activeLiveChatConv = user.isLoggedIn
    ? conversations.find(
        c =>
          c.channel === 'livechat' &&
          ((user.uid && c.customerUid === user.uid) ||
            (user.phone && c.customerPhone === user.phone) ||
            (user.email && c.customerEmail && c.customerEmail.toLowerCase() === user.email.toLowerCase()))
      )
    : undefined;

  const [localMessages, setLocalMessages] = useState<
    Array<{
      sender: 'agent' | 'user' | 'ai';
      text: string;
      time: string;
      productId?: string;
      productName?: string;
      productPrice?: number;
      productImage?: string;
    }>
  >([]);

  // Reset conversation messages immediately upon logout
  useEffect(() => {
    if (!user.isLoggedIn) {
      setLocalMessages([]);
    }
  }, [user.isLoggedIn]);

  // Sync with shop context conversation messages when updated
  useEffect(() => {
    if (user.isLoggedIn && activeLiveChatConv && activeLiveChatConv.messages && activeLiveChatConv.messages.length > 0) {
      const mapped = activeLiveChatConv.messages.map(m => ({
        sender: (m.sender === 'customer' ? 'user' : m.sender === 'ai' ? 'ai' : 'agent') as
          | 'agent'
          | 'user'
          | 'ai',
        text: m.text,
        time: m.timestamp,
        productId: m.productId,
        productName: m.productName,
        productPrice: m.productPrice,
        productImage: m.productImage,
      }));
      setLocalMessages(mapped);
    }
  }, [user.isLoggedIn, activeLiveChatConv?.id, activeLiveChatConv?.messages?.length, activeLiveChatConv?.lastMessage]);

  // Auto scroll to bottom in chat
  useEffect(() => {
    if (widgetState === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [localMessages, widgetState, isTyping]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;

    const userText = inputText.trim();
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setIsSending(true);
    setLastFailedMessage(null);
    setLocalMessages(prev => [...prev, { sender: 'user', text: userText, time }]);
    setInputText('');
    setIsTyping(true);

    try {
      sendCustomerChatMessage(userText, 'livechat', {
        name: user.name || 'ওয়েব গ্রাহক',
        phone: user.phone || '017XXXXXXXX',
        email: user.email || '',
      });
      setTimeout(() => {
        setIsTyping(false);
        setIsSending(false);
      }, 1000);
    } catch {
      setIsTyping(false);
      setIsSending(false);
      setLastFailedMessage(userText);
    }
  };

  const handleQuickQuestion = (question: string) => {
    if (isSending) return;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setIsSending(true);
    setLastFailedMessage(null);
    setLocalMessages(prev => [...prev, { sender: 'user', text: question, time }]);
    setIsTyping(true);

    try {
      sendCustomerChatMessage(question, 'livechat', {
        name: user.name || 'ওয়েব গ্রাহক',
        phone: user.phone || '017XXXXXXXX',
        email: user.email || '',
      });
      setTimeout(() => {
        setIsTyping(false);
        setIsSending(false);
      }, 1000);
    } catch {
      setIsTyping(false);
      setIsSending(false);
      setLastFailedMessage(question);
    }
  };

  const handleRetry = () => {
    if (!lastFailedMessage) return;
    const textToRetry = lastFailedMessage;
    setLastFailedMessage(null);
    handleQuickQuestion(textToRetry);
  };

  // Determine channel visibility from helpCenterSettings or liveChatSettings
  const showWhatsApp =
    helpCenterSettings?.contactButtons?.whatsapp?.enabled ??
    liveChatSettings.enableDirectWhatsApp !== false;
  const showMessenger =
    helpCenterSettings?.contactButtons?.messenger?.enabled ??
    liveChatSettings.enableMessenger !== false;
  const showLiveChat =
    helpCenterSettings?.contactButtons?.liveChat?.enabled ??
    liveChatSettings.enableLiveChat !== false;
  const showDirectCall =
    helpCenterSettings?.contactButtons?.directCall?.enabled ??
    liveChatSettings.enableDirectCall !== false;

  const visibleMessages = localMessages.slice(-messageLimit);
  const hasOlderMessages = localMessages.length > messageLimit;

  // Check if human agent requested / active
  const isHumanTransferred =
    activeLiveChatConv?.status === 'open' &&
    localMessages.some(
      m =>
        m.text.includes('ট্রান্সফার') ||
        m.text.includes('প্রতিনিধি') ||
        m.text.includes('হিউম্যান') ||
        m.text.includes('সাপোর্ট টিম')
    );

  return (
    <div
      ref={widgetRef}
      className="fixed bottom-16 sm:bottom-6 right-3.5 sm:right-6 z-40 flex flex-col items-end pointer-events-auto"
    >
      {/* 1. Live Chat Modal Window */}
      {widgetState === 'chat' && (
        <div className="mb-3 w-[330px] sm:w-[380px] max-w-[94vw] bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-200 z-50">
          {/* Header */}
          <div className="bg-gradient-to-r from-rose-600 via-rose-700 to-rose-800 text-white p-3.5 sm:p-4 flex items-center justify-between shadow-xs">
            <div className="flex items-center space-x-2.5">
              <div className="relative">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/20 border-2 border-white/60 flex items-center justify-center text-white shadow-xs overflow-hidden">
                  {liveChatSettings.agentAvatarUrl ? (
                    <img
                      src={liveChatSettings.agentAvatarUrl}
                      alt={liveChatSettings.agentName || 'Support'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <MessageSquare className="w-5 h-5 text-white" />
                  )}
                </div>
                <span className="w-2.5 h-2.5 bg-emerald-400 border-2 border-rose-700 rounded-full absolute bottom-0 right-0 animate-pulse" />
              </div>
              <div>
                <h4 className="font-extrabold text-xs sm:text-sm text-white leading-tight">
                  {liveChatSettings.agentName || 'JotPotShop কাস্টমার কেয়ার'}
                </h4>
                <p className="text-[10px] sm:text-[11px] text-white/80 font-medium">
                  {isHumanTransferred ? 'হিউম্যান সাপোর্ট ডেস্ক • সক্রিয়' : 'স্মার্ট এআই ও লাইভ সহায়তা'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => setWidgetState('menu')}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer text-[10px] px-2 font-semibold"
                title="সকল যোগাযোগের মাধ্যম"
              >
                মেনু
              </button>
              <button
                onClick={() => setWidgetState('closed')}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="চ্যাট উইন্ডো বন্ধ করুন"
                aria-label="Close Chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Delivery banner if offer active */}
          {deliverySettings.chattogramFreeDeliveryOffer && (
            <div className="bg-amber-400 text-gray-950 px-3 py-1.5 text-[11px] font-bold flex items-center justify-between">
              <span className="flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-rose-700 shrink-0" />
                <span>আজকে চট্টগ্রামের জন্য ডেলিভারি চার্জ সম্পূর্ণ ফ্রি!</span>
              </span>
              <span className="bg-rose-600 text-white px-1.5 py-0.5 rounded text-[10px]">অফার</span>
            </div>
          )}

          {/* Mandatory Login Gate for Live Chat */}
          {!user.isLoggedIn ? (
            <div className="p-6 text-center space-y-4 my-auto bg-slate-50/60">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shadow-xs">
                <Lock className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-gray-900 text-sm sm:text-base">
                  {t('লাইভ চ্যাটে লগইন বাধ্যতামূলক', 'Login Required for Live Chat')}
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed max-w-xs mx-auto">
                  {t(
                    'আপনার কথোপকথন ও ব্যক্তিগত তথ্যের সর্বোচ্চ গোপনীয়তা বজায় রাখতে এবং অর্ডার সহায়তা পেতে অনুগ্রহ করে লগইন বা রেজিস্ট্রেশন করুন।',
                    'To protect your private conversation and order details, please log in or register before using Live Chat.'
                  )}
                </p>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setWidgetState('closed');
                    setActiveModal('dashboard');
                  }}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{t('লগইন / রেজিস্টার করুন', 'Login / Register')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setWidgetState('menu')}
                  className="w-full py-1.5 px-3 text-xs text-gray-500 hover:text-gray-800 font-semibold cursor-pointer"
                >
                  {t('অন্যান্য মাধ্যমে যোগাযোগ করুন', 'View other contact options')}
                </button>
              </div>

              <div className="p-2.5 bg-white rounded-xl border border-gray-200/80 text-[11px] text-gray-500 flex items-center justify-center space-x-1.5 shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{t('প্রতিটি কথোপকথন সম্পূর্ণ ব্যক্তিগত ও সুরক্ষিত', 'Your private chat is 100% confidential')}</span>
              </div>
            </div>
          ) : (
            <>
              {/* Human Handover Reassurance Notice */}
              {isHumanTransferred && (
                <div className="bg-emerald-50 border-b border-emerald-200 text-emerald-900 px-3 py-1.5 text-[10px] font-bold flex items-center space-x-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>সাপোর্ট এজেন্টের কাছে অনুরোধ ফরোয়ার্ড করা হয়েছে।</span>
                </div>
              )}

          {/* Messages viewport */}
          <div className="h-[280px] sm:h-[320px] p-3 sm:p-3.5 overflow-y-auto space-y-3 text-xs bg-slate-50/70">
            {/* Older messages pagination button */}
            {hasOlderMessages && (
              <div className="text-center pt-1 pb-2">
                <button
                  type="button"
                  onClick={() => setMessageLimit(prev => prev + 25)}
                  className="bg-white border border-gray-200 text-gray-600 hover:text-rose-600 px-3 py-1 rounded-full text-[10px] font-bold cursor-pointer shadow-2xs"
                >
                  ↑ পূর্বের মেসেজ দেখুন ({localMessages.length - messageLimit}টি বাকি)
                </button>
              </div>
            )}

            {/* Real Store Greeting */}
            <div className="flex flex-col items-start">
              <div className="max-w-[88%] rounded-2xl px-3.5 py-2 text-xs bg-white text-gray-800 border border-gray-200/90 rounded-bl-xs shadow-2xs leading-relaxed">
                {liveChatSettings.liveChatGreetingBn ||
                  'আসসালামু আলাইকুম! JotPotShop হেল্পডেস্কে আপনাকে স্বাগতম। পণ্য বা অর্ডার সম্পর্কিত যেকোনো তথ্যের জন্য নিচে লিখুন।'}
              </div>
              <span className="text-[9px] text-gray-400 px-1 mt-0.5">অফিসিয়াল সহায়তা</span>
            </div>

            {/* Conversation Messages */}
            {visibleMessages.map((msg, idx) => {
              const isUser = msg.sender === 'user';
              const isAi = msg.sender === 'ai';
              return (
                <div key={idx} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                  {isAi && (
                    <div className="flex items-center space-x-1 text-[10px] text-purple-600 font-bold mb-0.5 px-1">
                      <Bot className="w-3 h-3" />
                      <span>{liveChatSettings.aiSalesAgentName || 'ঝটপট এআই সহকারী'}</span>
                    </div>
                  )}
                  {!isAi && !isUser && (
                    <div className="flex items-center space-x-1 text-[10px] text-emerald-600 font-bold mb-0.5 px-1">
                      <Headphones className="w-3 h-3" />
                      <span>সাপোর্ট অফিসার</span>
                    </div>
                  )}
                  <div
                    className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs shadow-2xs whitespace-pre-line leading-relaxed ${
                      isUser
                        ? 'bg-rose-600 text-white rounded-br-xs'
                        : isAi
                        ? 'bg-gradient-to-r from-purple-700 to-indigo-700 text-white rounded-bl-xs'
                        : 'bg-white text-gray-800 border border-gray-200 rounded-bl-xs'
                    }`}
                  >
                    {msg.text}

                    {/* Interactive Product Card from Real Catalog */}
                    {msg.productName && (
                      <button
                        type="button"
                        onClick={() => {
                          const matched = products.find(
                            p =>
                              p.id === msg.productId ||
                              p.name === msg.productName ||
                              p.nameBn === msg.productName
                          );
                          if (matched) {
                            setQuickViewProduct(matched);
                            setActiveModal('quickView');
                          }
                        }}
                        className={`mt-2 p-2 rounded-xl text-left border w-full flex items-center space-x-2.5 transition-transform hover:scale-[1.02] cursor-pointer ${
                          isAi
                            ? 'bg-white/15 border-white/20 text-white hover:bg-white/25'
                            : 'bg-gray-50 border-gray-200 text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        {msg.productImage && (
                          <img
                            src={msg.productImage}
                            alt={msg.productName}
                            className="w-10 h-10 object-cover rounded-lg border border-white/20 shrink-0"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <span className="font-bold text-[11px] block truncate">{msg.productName}</span>
                          {msg.productPrice && (
                            <span
                              className={`font-extrabold text-xs block ${
                                isAi ? 'text-amber-300' : 'text-rose-600'
                              }`}
                            >
                              {formatPrice(msg.productPrice)}
                            </span>
                          )}
                          <span
                            className={`text-[9px] block ${
                              isAi ? 'text-white/70' : 'text-gray-400'
                            }`}
                          >
                            পণ্যটি দেখতে ক্লিক করুন →
                          </span>
                        </div>
                      </button>
                    )}
                  </div>
                  <div className="flex items-center space-x-1 px-1 mt-0.5 text-[9px] text-gray-400">
                    <span>{msg.time}</span>
                    {isUser && <CheckCheck className="w-3 h-3 text-rose-500" />}
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center space-x-1.5 bg-white border border-gray-200 rounded-full px-3 py-1.5 w-fit text-gray-400 text-[10px]">
                <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-bounce delay-100" />
                <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-bounce delay-200" />
                <span className="ml-1 text-[11px]">উত্তর লেখা হচ্ছে...</span>
              </div>
            )}

            {lastFailedMessage && (
              <div className="flex items-center justify-between p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px]">
                <span>মেসেজ পাঠাতে সমস্যা হয়েছে।</span>
                <button
                  type="button"
                  onClick={handleRetry}
                  className="font-bold text-rose-600 hover:text-rose-800 flex items-center space-x-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>পুনরায় পাঠান</span>
                </button>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Suggestion Chips */}
          <div className="px-3 py-1.5 bg-white border-t border-gray-200/60 flex items-center space-x-1.5 overflow-x-auto no-scrollbar text-[11px]">
            <button
              type="button"
              onClick={() => handleQuickQuestion('আমি একজন মানুষের সাথে / সাপোর্ট এজেন্টের সাথে কথা বলতে চাই')}
              className="shrink-0 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 hover:text-emerald-950 font-bold px-2.5 py-1 rounded-lg border border-emerald-200 cursor-pointer transition-colors flex items-center space-x-1"
            >
              <Headphones className="w-3 h-3 text-emerald-600" />
              <span>👨‍💼 এজেন্টের সাথে কথা বলুন</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickQuestion('চট্টগ্রাম ও ঢাকায় ডেলিভারি চার্জ কত?')}
              className="shrink-0 bg-gray-50 hover:bg-rose-50 text-gray-700 hover:text-rose-600 px-2.5 py-1 rounded-lg border border-gray-200 cursor-pointer transition-colors"
            >
              🚚 ডেলিভারি চার্জ?
            </button>
            <button
              type="button"
              onClick={() => handleQuickQuestion('আমি কিভাবে অর্ডার ট্র্যাক করব?')}
              className="shrink-0 bg-gray-50 hover:bg-rose-50 text-gray-700 hover:text-rose-600 px-2.5 py-1 rounded-lg border border-gray-200 cursor-pointer transition-colors"
            >
              📦 অর্ডার ট্র্যাকিং?
            </button>
            <button
              type="button"
              onClick={() => handleQuickQuestion('ক্যাশ অন ডেলিভারি ও পেমেন্ট নিয়ম')}
              className="shrink-0 bg-gray-50 hover:bg-rose-50 text-gray-700 hover:text-rose-600 px-2.5 py-1 rounded-lg border border-gray-200 cursor-pointer transition-colors"
            >
              💳 পেমেন্ট তথ্য?
            </button>
          </div>

          {/* Input Box */}
          <form
            onSubmit={handleSendMessage}
            className="p-2 sm:p-2.5 bg-white border-t border-gray-200 flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder={t('এখানে মেসেজ লিখুন...', 'Type your message...')}
              className="flex-1 bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-rose-500"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isSending}
              className="bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white p-2 rounded-xl cursor-pointer transition-colors shrink-0"
              title="পাঠান"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
            </>
          )}
        </div>
      )}

      {/* 2. Compact Contact Panel (Launcher Popover Menu) */}
      {widgetState === 'menu' && (
        <div className="mb-2.5 w-[260px] sm:w-[280px] bg-white/98 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200 p-3 flex flex-col space-y-2 animate-in fade-in slide-in-from-bottom-3 duration-150 z-50">
          {/* Panel Header */}
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-extrabold text-gray-900">
                {t('যোগাযোগ ও সাপোর্ট', 'Contact & Support')}
              </span>
            </div>
            <button
              onClick={() => setWidgetState('closed')}
              className="p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
              title="বন্ধ করুন"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* All 4 Channels Options List */}
          <div className="space-y-1.5 text-xs">
            {/* OPTION 1: Live Chat */}
            {showLiveChat && (
              <button
                type="button"
                onClick={() => setWidgetState('chat')}
                className="w-full flex items-center justify-between p-2 rounded-xl bg-gradient-to-r from-rose-50 to-rose-100/60 hover:from-rose-100 hover:to-rose-200/70 border border-rose-200/80 text-rose-950 font-bold transition-all cursor-pointer group text-left"
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    {user.isLoggedIn ? <MessageSquare className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center space-x-1.5">
                      <p className="font-extrabold text-xs text-rose-900 leading-tight">লাইভ চ্যাট</p>
                      {!user.isLoggedIn && (
                        <span className="text-[9px] bg-rose-200 text-rose-800 px-1.5 py-0.5 rounded font-bold">লগইন আবশ্যক</span>
                      )}
                    </div>
                    <p className="text-[10px] text-rose-600 font-medium truncate">
                      {user.isLoggedIn ? 'স্মার্ট এআই ও সরাসরি সহায়তা' : 'লগইন করে চ্যাট শুরু করুন'}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-rose-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </button>
            )}

            {/* OPTION 2: WhatsApp */}
            {showWhatsApp && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-between p-2 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-gray-900 font-bold transition-all cursor-pointer group text-left"
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.54 1.772.825 2.788.825 3.181 0 5.767-2.586 5.768-5.766 0-3.18-2.586-5.767-5.767-5.767zm0 10.428c-.896 0-1.688-.261-2.438-.707l-.174-.103-1.808.474.482-1.764-.113-.181c-.503-.801-.769-1.571-.769-2.381 0-2.656 2.161-4.817 4.82-4.817 2.657 0 4.818 2.161 4.818 4.817 0 2.656-2.161 4.818-4.817 4.818zm3.033-3.607c-.166-.083-.982-.484-1.134-.54-.152-.055-.263-.083-.374.083-.111.167-.429.54-.526.651-.097.111-.194.125-.36.042-.166-.083-.701-.258-1.335-.824-.493-.44-.826-.983-.923-1.149-.097-.166-.01-.256.073-.338.075-.074.166-.194.249-.291.083-.097.111-.166.166-.277.055-.111.028-.208-.014-.291-.042-.083-.374-.9-.512-1.233-.135-.324-.272-.28-.374-.285-.097-.005-.208-.006-.319-.006-.111 0-.291.042-.443.208-.152.166-.582.569-.582 1.388 0 .819.596 1.611.679 1.722.083.111 1.173 1.792 2.842 2.513.397.172.707.274.949.351.399.127.762.109 1.049.066.32-.048.982-.401 1.121-.789.138-.387.138-.72.097-.789-.041-.069-.152-.111-.318-.194z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="font-extrabold text-xs text-gray-900 leading-tight">হোয়াটসঅ্যাপ</p>
                    <p className="text-[10px] text-gray-500 font-medium truncate">সরাসরি চ্যাট</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </a>
            )}

            {/* OPTION 3: Facebook Messenger */}
            {showMessenger && (
              <a
                href={messengerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-between p-2 rounded-xl bg-[#0084FF]/10 hover:bg-[#0084FF]/20 border border-[#0084FF]/30 text-gray-900 font-bold transition-all cursor-pointer group text-left"
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#0084FF] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2C6.477 2 2 6.145 2 11.258c0 2.91 1.455 5.517 3.735 7.195V22l3.415-1.874c.905.251 1.865.388 2.85.388 5.523 0 10-4.145 10-9.256C22 6.145 17.523 2 12 2zm1.004 12.443l-2.56-2.73-5.002 2.73 5.498-5.836 2.624 2.73 4.938-2.73-5.498 5.836z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="font-extrabold text-xs text-gray-900 leading-tight">মেসেঞ্জার</p>
                    <p className="text-[10px] text-gray-500 font-medium truncate">ফেসবুক ইনবক্স</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </a>
            )}

            {/* OPTION 4: Phone Call */}
            {showDirectCall && (
              <a
                href={`tel:${directPhone}`}
                className="w-full flex items-center justify-between p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-gray-900 font-bold transition-all cursor-pointer group text-left"
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Phone className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-extrabold text-xs text-gray-900 leading-tight">সরাসরি কল</p>
                    <p className="text-[10px] text-gray-500 font-medium font-mono truncate">{directPhone}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* 3. Compact Floating Launcher Button */}
      <button
        type="button"
        onClick={() => {
          if (widgetState === 'closed') {
            setWidgetState('menu');
          } else {
            setWidgetState('closed');
          }
        }}
        aria-label="Toggle Contact Options"
        title={widgetState === 'closed' ? 'কাস্টমার সাপোর্ট ও যোগাযোগ' : 'বন্ধ করুন'}
        className="relative group w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 hover:from-rose-700 hover:to-amber-600 text-white flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-200 cursor-pointer active:scale-95 border-2 border-white/80"
      >
        {widgetState !== 'closed' ? (
          <X className="w-5 h-5 text-white transition-transform duration-200 group-hover:rotate-90" />
        ) : (
          <>
            <Headphones className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-white" />
            {/* Live Indicator Dot */}
            <span className="w-3 h-3 bg-emerald-400 border-2 border-white rounded-full absolute -top-0.5 -right-0.5 animate-pulse" />
          </>
        )}
      </button>
    </div>
  );
};
