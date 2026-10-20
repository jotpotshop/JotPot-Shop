import React, { useState, useEffect, useRef } from 'react';
import {
  MessageCircle,
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const FloatingContactWidget: React.FC = () => {
  const {
    liveChatSettings,
    deliverySettings,
    websiteSettings,
    formatPrice,
    t,
    user,
    conversations,
    sendCustomerChatMessage,
  } = useShop();

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // If floating button is disabled in admin settings, do not render
  if (liveChatSettings.enableFloatingButton === false) {
    return null;
  }

  // Format WhatsApp Link
  const rawWhatsapp = (liveChatSettings.whatsappNumber || websiteSettings.whatsappNumber || '01700000000').replace(/\D/g, '');
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
  const rawMessenger = (liveChatSettings.messengerPageUrlOrId || 'jotpotshop.bd')
    .replace(/^https?:\/\/(www\.)?(facebook\.com|m\.me)\//i, '')
    .trim();
  const messengerUrl = `https://m.me/${rawMessenger || 'jotpotshop.bd'}`;

  // Find customer's active livechat thread
  const activeLiveChatConv = conversations.find(
    c => c.channel === 'livechat' && (c.customerPhone === user.phone || c.customerName === user.name)
  ) || conversations.find(c => c.channel === 'livechat');

  const [localMessages, setLocalMessages] = useState<
    Array<{ sender: 'agent' | 'user' | 'ai'; text: string; time: string; productName?: string; productPrice?: number }>
  >([]);

  // Sync with shop context conversation messages when updated
  useEffect(() => {
    if (activeLiveChatConv && activeLiveChatConv.messages && activeLiveChatConv.messages.length > 0) {
      const mapped = activeLiveChatConv.messages.map(m => ({
        sender: (m.sender === 'customer' ? 'user' : m.sender === 'ai' ? 'ai' : 'agent') as 'agent' | 'user' | 'ai',
        text: m.text,
        time: m.timestamp,
        productName: m.productName,
        productPrice: m.productPrice,
      }));
      setLocalMessages(mapped);
    }
  }, [activeLiveChatConv]);

  // Auto scroll to bottom
  useEffect(() => {
    if (isChatOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [localMessages, isChatOpen, isTyping]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userText = inputText.trim();
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setLocalMessages(prev => [...prev, { sender: 'user', text: userText, time }]);
    setInputText('');
    setIsTyping(true);

    sendCustomerChatMessage(userText, 'livechat', {
      name: user.name || 'ওয়েব গ্রাহক',
      phone: user.phone || '017XXXXXXXX',
    });

    setTimeout(() => {
      setIsTyping(false);
    }, 800);
  };

  const handleQuickQuestion = (question: string) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setLocalMessages(prev => [...prev, { sender: 'user', text: question, time }]);
    setIsTyping(true);

    sendCustomerChatMessage(question, 'livechat', {
      name: user.name || 'ওয়েব গ্রাহক',
      phone: user.phone || '017XXXXXXXX',
    });

    setTimeout(() => {
      setIsTyping(false);
    }, 700);
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-3 sm:right-6 z-40 flex flex-col items-end space-y-2.5 pointer-events-none select-none">
      {/* 1. Live Chat Modal Window */}
      {isChatOpen && (
        <div className="pointer-events-auto mb-2 w-[340px] sm:w-[380px] max-w-[94vw] bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-5 duration-200 z-50">
          {/* Header */}
          <div className="bg-gradient-to-r from-rose-600 via-rose-700 to-rose-800 text-white p-4 flex items-center justify-between shadow-xs">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/20 border-2 border-white/60 flex items-center justify-center text-white shadow-xs overflow-hidden">
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
                <span className="w-3 h-3 bg-emerald-400 border-2 border-rose-700 rounded-full absolute bottom-0 right-0 animate-pulse" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-white leading-tight">
                  {liveChatSettings.agentName || 'কাস্টমার সাপোর্ট ডেস্ক'}
                </h4>
                <p className="text-[11px] text-white/80 font-medium">
                  {liveChatSettings.agentStatusText || 'অনলাইন • সরাসরি সহায়তা'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsChatOpen(false)}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="চ্যাট উইন্ডো বন্ধ করুন"
              aria-label="Close Chat"
            >
              <X className="w-4 h-4" />
            </button>
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

          {/* Messages viewport */}
          <div className="h-[320px] p-3.5 overflow-y-auto space-y-3 text-xs bg-slate-50/70">
            {/* Real Store Greeting */}
            <div className="flex flex-col items-start">
              <div className="max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs bg-white text-gray-800 border border-gray-200/90 rounded-bl-xs shadow-2xs leading-relaxed">
                {liveChatSettings.liveChatGreetingBn ||
                  'আসসালামু আলাইকুম! JotPotShop হেল্পডেস্কে আপনাকে স্বাগতম। পণ্য বা অর্ডার সম্পর্কিত যেকোনো তথ্যের জন্য নিচে লিখুন।'}
              </div>
              <span className="text-[9px] text-gray-400 px-1 mt-0.5">অফিসিয়াল সাপোর্ট</span>
            </div>

            {/* Conversation Messages */}
            {localMessages.map((msg, idx) => {
              const isUser = msg.sender === 'user';
              const isAi = msg.sender === 'ai';
              return (
                <div key={idx} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                  {isAi && (
                    <div className="flex items-center space-x-1 text-[10px] text-purple-600 font-bold mb-0.5 px-1">
                      <Bot className="w-3 h-3" />
                      <span>{liveChatSettings.aiSalesAgentName || 'এআই সেলস সহকারী'}</span>
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

                    {msg.productName && (
                      <div
                        className={`mt-2 p-2 rounded-xl text-left border ${
                          isAi
                            ? 'bg-white/15 border-white/20 text-white'
                            : 'bg-gray-50 border-gray-200 text-gray-900'
                        }`}
                      >
                        <span className="font-bold text-[11px] block truncate">{msg.productName}</span>
                        {msg.productPrice && (
                          <span className="font-extrabold text-amber-300 text-xs">
                            {formatPrice(msg.productPrice)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] text-gray-400 px-1 mt-0.5">{msg.time}</span>
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
            <div ref={messagesEndRef} />
          </div>

          {/* Quick FAQ Suggestion Chips */}
          <div className="px-3 py-1.5 bg-white border-t border-gray-200/60 flex items-center space-x-1.5 overflow-x-auto no-scrollbar text-[11px]">
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
            className="p-2.5 bg-white border-t border-gray-200 flex items-center space-x-2"
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
              disabled={!inputText.trim()}
              className="bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white p-2 rounded-xl cursor-pointer transition-colors shrink-0"
              title="পাঠান"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* 2. Floating Contact Stack: WhatsApp + Facebook Messenger + Live Chat ALL THREE SIMULTANEOUSLY VISIBLE */}
      <div className="pointer-events-auto flex flex-col items-end space-y-2">
        {/* BUTTON 1: WhatsApp (Direct) */}
        {liveChatSettings.enableDirectWhatsApp !== false && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="হোয়াটসঅ্যাপে চ্যাট করুন"
            aria-label="WhatsApp Support"
            className="group flex items-center space-x-2 cursor-pointer transition-transform hover:scale-105 active:scale-95"
          >
            <span className="hidden sm:inline-block bg-white text-gray-800 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md border border-gray-100 opacity-90 group-hover:opacity-100 transition-opacity">
              হোয়াটসঅ্যাপ
            </span>
            <div className="w-12 h-12 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all">
              {/* WhatsApp Official Style Icon */}
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.54 1.772.825 2.788.825 3.181 0 5.767-2.586 5.768-5.766 0-3.18-2.586-5.767-5.767-5.767zm0 10.428c-.896 0-1.688-.261-2.438-.707l-.174-.103-1.808.474.482-1.764-.113-.181c-.503-.801-.769-1.571-.769-2.381 0-2.656 2.161-4.817 4.82-4.817 2.657 0 4.818 2.161 4.818 4.817 0 2.656-2.161 4.818-4.817 4.818zm3.033-3.607c-.166-.083-.982-.484-1.134-.54-.152-.055-.263-.083-.374.083-.111.167-.429.54-.526.651-.097.111-.194.125-.36.042-.166-.083-.701-.258-1.335-.824-.493-.44-.826-.983-.923-1.149-.097-.166-.01-.256.073-.338.075-.074.166-.194.249-.291.083-.097.111-.166.166-.277.055-.111.028-.208-.014-.291-.042-.083-.374-.9-.512-1.233-.135-.324-.272-.28-.374-.285-.097-.005-.208-.006-.319-.006-.111 0-.291.042-.443.208-.152.166-.582.569-.582 1.388 0 .819.596 1.611.679 1.722.083.111 1.173 1.792 2.842 2.513.397.172.707.274.949.351.399.127.762.109 1.049.066.32-.048.982-.401 1.121-.789.138-.387.138-.72.097-.789-.041-.069-.152-.111-.318-.194z" />
              </svg>
            </div>
          </a>
        )}

        {/* BUTTON 2: Facebook Messenger (Direct) */}
        {liveChatSettings.enableMessenger !== false && (
          <a
            href={messengerUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="ফেসবুক মেসেঞ্জারে নক দিন"
            aria-label="Facebook Messenger Support"
            className="group flex items-center space-x-2 cursor-pointer transition-transform hover:scale-105 active:scale-95"
          >
            <span className="hidden sm:inline-block bg-white text-gray-800 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md border border-gray-100 opacity-90 group-hover:opacity-100 transition-opacity">
              মেসেঞ্জার
            </span>
            <div className="w-12 h-12 rounded-full bg-[#0084FF] hover:bg-[#0074e0] text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all">
              {/* Facebook Messenger Style Icon */}
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.145 2 11.258c0 2.91 1.455 5.517 3.735 7.195V22l3.415-1.874c.905.251 1.865.388 2.85.388 5.523 0 10-4.145 10-9.256C22 6.145 17.523 2 12 2zm1.004 12.443l-2.56-2.73-5.002 2.73 5.498-5.836 2.624 2.73 4.938-2.73-5.498 5.836z" />
              </svg>
            </div>
          </a>
        )}

        {/* BUTTON 3: Live Chat (Website Instant Dialog) */}
        {liveChatSettings.enableLiveChat !== false && (
          <div
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="group flex items-center space-x-2 cursor-pointer transition-transform hover:scale-105 active:scale-95"
          >
            <span className="hidden sm:inline-block bg-white text-gray-800 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md border border-gray-100 opacity-90 group-hover:opacity-100 transition-opacity">
              {isChatOpen ? 'চ্যাট বন্ধ করুন' : 'লাইভ চ্যাট'}
            </span>
            <button
              type="button"
              aria-label="Toggle Live Chat"
              className="w-12 h-12 rounded-full bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 hover:from-rose-700 hover:to-amber-600 text-white flex items-center justify-center shadow-xl hover:shadow-2xl transition-all relative cursor-pointer"
            >
              {isChatOpen ? (
                <ChevronDown className="w-6 h-6 text-white" />
              ) : (
                <>
                  <MessageSquare className="w-6 h-6 text-white" />
                  <span className="w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full absolute -top-0.5 -right-0.5 animate-pulse" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
