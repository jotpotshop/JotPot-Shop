import React, { useState, useEffect } from 'react';
import {
  MessageCircle,
  PhoneCall,
  X,
  Send,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  MessageSquare,
  HelpCircle,
  Truck,
  ShieldCheck,
  Zap,
  Bot,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const FloatingContactWidget: React.FC = () => {
  const {
    liveChatSettings,
    deliverySettings,
    websiteSettings,
    setActiveModal,
    formatPrice,
    t,
    user,
    conversations,
    sendCustomerChatMessage,
  } = useShop();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'menu' | 'livechat'>('menu');

  // Find customer's active livechat thread if exists
  const activeLiveChatConv = conversations.find(
    c => c.channel === 'livechat' && (c.customerPhone === user.phone || c.customerName === user.name)
  ) || conversations.find(c => c.channel === 'livechat');

  const [localMessages, setLocalMessages] = useState<Array<{ sender: 'agent' | 'user' | 'ai'; text: string; time: string; productName?: string; productPrice?: number }>>([
    {
      sender: 'agent',
      text:
        liveChatSettings.liveChatGreetingBn ||
        'আসসালামু আলাইকুম! JotPotShop হেল্পডেস্কে আপনাকে স্বাগতম। পণ্য বা অর্ডার সম্পর্কিত যে কোনো তথ্যের জন্য মেসেজ দিন।',
      time: 'Just now',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Sync with shop context conversation messages when updated
  useEffect(() => {
    if (activeLiveChatConv && activeLiveChatConv.messages.length > 0) {
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

  // If floating button is disabled in admin settings, do not render
  if (liveChatSettings.enableFloatingButton === false) {
    return null;
  }

  // Format WhatsApp Link
  const rawWhatsapp = (liveChatSettings.whatsappNumber || websiteSettings.whatsappNumber || '01712345678').replace(/\D/g, '');
  const cleanWhatsapp = rawWhatsapp.startsWith('880') ? rawWhatsapp : rawWhatsapp.startsWith('0') ? `88${rawWhatsapp}` : `880${rawWhatsapp}`;
  const whatsappUrl = `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
    liveChatSettings.whatsappMessageTemplate ||
      'হ্যালো JotPotShop! আমি আপনার ওয়েবসাইট থেকে পণ্য সম্পর্কিত তথ্য বা অর্ডার সহায়তার জন্য জানতে চাই।'
  )}`;

  // Format Messenger Link
  const rawMessenger = (liveChatSettings.messengerPageUrlOrId || 'jotpotshop.bd')
    .replace(/^https?:\/\/(www\.)?(facebook\.com|m\.me)\//i, '')
    .trim();
  const messengerUrl = `https://m.me/${rawMessenger}`;

  // Format Call Hotline
  const rawHotline = (liveChatSettings.callHotlineNumber || websiteSettings.hotline || '01812345678').replace(/\D/g, '');
  const hotlineUrl = `tel:${rawHotline}`;

  // Pre-set FAQ responses
  const handleQuickQuestion = (question: string) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setLocalMessages(prev => [...prev, { sender: 'user', text: question, time }]);
    setIsTyping(true);

    setTimeout(() => {
      let reply = '';
      if (question.includes('ডেলিভারি চার্জ') || question.includes('চট্টগ্রাম')) {
        const ctgFree = deliverySettings.chattogramFreeDeliveryOffer;
        reply = `আমাদের ডেলিভারি চার্জ:\n• ঢাকা সিটি: ${formatPrice(deliverySettings.insideDhakaFee)} (${deliverySettings.insideDhakaDays})\n• চট্টগ্রাম সিটি: ${
          ctgFree
            ? `🎉 বিশেষ অফার: আজকে চট্টগ্রামের জন্য ডেলিভারি চার্জ সম্পূর্ণ ফ্রি! (৳০)`
            : `${formatPrice(deliverySettings.chattogramFee)} (${deliverySettings.chattogramDays})`
        }\n• অন্যান্য জেলা: ${formatPrice(deliverySettings.outsideDhakaFee)} (${deliverySettings.outsideDhakaDays})\n\n💡 ৳${deliverySettings.freeDeliveryThreshold} বা তার বেশি অর্ডারে পুরো বাংলাদেশে ফ্রি ডেলিভারি!`;
      } else if (question.includes('ট্র্যাক')) {
        reply = 'আপনার অর্ডার ট্র্যাক করতে উপরের "অর্ডার ট্র্যাক করুন" বোতামে ক্লিক করুন অথবা আপনার ইনভয়েস/অর্ডার আইডি আমাদের পাঠান।';
      } else if (question.includes('পেমেন্ট') || question.includes('ক্যাশ অন ডেলিভারি')) {
        reply = 'আমরা সারা বাংলাদেশে ক্যাশ অন ডেলিভারি (পণ্য হাতে পেয়ে মূল্য পরিশোধ) সুবিধা দিচ্ছি। এছাড়াও বিকাশ, নগদ ও কার্ডের মাধ্যমে নিরাপদে পেমেন্ট করতে পারেন।';
      } else {
        reply = 'ধন্যবাদ আপনার বার্তার জন্য! আমাদের একজন কাস্টমার সাপোর্ট এক্সিকিউটিভ অতি শীঘ্রই আপনার সাথে যোগাযোগ করবেন। দ্রুত উত্তরের জন্য আপনি আমাদের WhatsApp-এও নক দিতে পারেন।';
      }

      setLocalMessages(prev => [
        ...prev,
        {
          sender: 'agent',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setIsTyping(false);
    }, 500);

    // Sync to store unified inbox
    sendCustomerChatMessage(question, 'livechat', {
      name: user.name || 'ওয়েব গ্রাহক',
      phone: user.phone || '017XXXXXXXX',
    });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userText = inputText.trim();
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setLocalMessages(prev => [...prev, { sender: 'user', text: userText, time }]);
    setInputText('');
    setIsTyping(true);

    // Send to shop context omnichannel inbox (AI will automatically reply if AI sales agent is enabled)
    sendCustomerChatMessage(userText, 'livechat', {
      name: user.name || 'ওয়েব গ্রাহক',
      phone: user.phone || '017XXXXXXXX',
    });

    setTimeout(() => {
      setIsTyping(false);
    }, 700);
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 flex flex-col items-end">
      {/* Contact Expandable Popup */}
      {isOpen && (
        <div className="mb-3 w-[330px] sm:w-[380px] bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-rose-600 via-rose-700 to-rose-800 text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img
                  src={
                    liveChatSettings.agentAvatarUrl ||
                    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80'
                  }
                  alt={liveChatSettings.agentName || 'Support Agent'}
                  className="w-10 h-10 rounded-full object-cover border-2 border-white/60 shadow-xs"
                />
                <span className="w-3 h-3 bg-emerald-400 border-2 border-white rounded-full absolute bottom-0 right-0 animate-pulse" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-white leading-tight">
                  {liveChatSettings.agentName || 'সুমাইয়া (কাস্টমার সাপোর্ট)'}
                </h4>
                <p className="text-[11px] text-white/80 font-medium">
                  {liveChatSettings.agentStatusText || 'অনলাইন • সাধারণত ২ মিনিটে উত্তর দেয়'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              {activeTab === 'livechat' && (
                <button
                  onClick={() => setActiveTab('menu')}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer text-xs"
                  title="চ্যানেল মেনু"
                >
                  মেনু
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Offer Flash in Widget Header */}
          {deliverySettings.chattogramFreeDeliveryOffer && (
            <div className="bg-amber-400 text-gray-950 px-3 py-1.5 text-[11px] font-bold flex items-center justify-between">
              <span className="flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-rose-700 shrink-0" />
                <span>আজকে চট্টগ্রামের জন্য ডেলিভারি চার্জ ফ্রি!</span>
              </span>
              <span className="bg-rose-600 text-white px-1.5 py-0.5 rounded text-[10px]">অফার</span>
            </div>
          )}

          {/* Body Content */}
          {activeTab === 'menu' ? (
            <div className="p-4 space-y-3 bg-slate-50/50">
              <p className="text-xs text-gray-600 font-medium px-1">
                {t(
                  'আপনার সুবিধাজনক যেকোনো মাধ্যমে আমাদের সাথে যোগাযোগ করুন:',
                  'Choose your preferred channel to connect with us:'
                )}
              </p>

              {/* Channel 1: Live Chat Drawer */}
              {liveChatSettings.enableLiveChat !== false && (
                <button
                  onClick={() => setActiveTab('livechat')}
                  className="w-full bg-white hover:bg-rose-50/60 border border-gray-200 hover:border-rose-300 rounded-2xl p-3 flex items-center justify-between transition-all group cursor-pointer shadow-2xs"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-100 group-hover:bg-rose-200 flex items-center justify-center text-rose-600 transition-colors">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <div className="flex items-center space-x-1.5">
                        <strong className="text-xs font-bold text-gray-900 group-hover:text-rose-600 transition-colors">
                          {t('লাইভ চ্যাট (ওয়েবসাইটে)', 'Live Chat (Instant)')}
                        </strong>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                      </div>
                      <p className="text-[10px] text-gray-500">
                        {t('সরাসরি ওয়েবসাইটে রিয়েল-টাইম কথোপকথন', 'Chat instantly right here')}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-rose-600 transition-colors" />
                </button>
              )}

              {/* Channel 2: WhatsApp */}
              {liveChatSettings.enableDirectWhatsApp !== false && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-white hover:bg-emerald-50/60 border border-gray-200 hover:border-emerald-300 rounded-2xl p-3 flex items-center justify-between transition-all group cursor-pointer shadow-2xs"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 group-hover:bg-emerald-200 flex items-center justify-center text-emerald-600 transition-colors">
                      <MessageCircle className="w-5 h-5 fill-emerald-600 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="flex items-center space-x-1.5">
                        <strong className="text-xs font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                          {t('হোয়াটসঅ্যাপ (WhatsApp)', 'WhatsApp Support')}
                        </strong>
                        <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1 rounded">
                          Fast
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500 font-mono">
                        {liveChatSettings.whatsappNumber || websiteSettings.whatsappNumber || '01712-345678'}
                      </p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                </a>
              )}

              {/* Channel 3: Messenger */}
              {liveChatSettings.enableMessenger !== false && (
                <a
                  href={messengerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-white hover:bg-blue-50/60 border border-gray-200 hover:border-blue-300 rounded-2xl p-3 flex items-center justify-between transition-all group cursor-pointer shadow-2xs"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center text-blue-600 transition-colors">
                      <MessageCircle className="w-5 h-5 fill-blue-600 text-white" />
                    </div>
                    <div className="text-left">
                      <strong className="text-xs font-bold text-gray-900 group-hover:text-blue-700 transition-colors block">
                        {t('ফেসবুক মেসেঞ্জার (Messenger)', 'Facebook Messenger')}
                      </strong>
                      <p className="text-[10px] text-gray-500">
                        @{rawMessenger || 'jotpotshop.bd'}
                      </p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </a>
              )}

              {/* Channel 4: Direct Call Hotline */}
              {liveChatSettings.enableDirectCall !== false && (
                <a
                  href={hotlineUrl}
                  className="w-full bg-white hover:bg-amber-50/60 border border-gray-200 hover:border-amber-300 rounded-2xl p-3 flex items-center justify-between transition-all group cursor-pointer shadow-2xs"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 group-hover:bg-amber-200 flex items-center justify-center text-amber-600 transition-colors">
                      <PhoneCall className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <strong className="text-xs font-bold text-gray-900 group-hover:text-amber-700 transition-colors block">
                        {t('সরাসরি কল (Hotline)', 'Direct Phone Call')}
                      </strong>
                      <p className="text-[10px] text-gray-500 font-mono">
                        {liveChatSettings.callHotlineNumber || websiteSettings.hotline || '01812-345678'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-amber-600 transition-colors" />
                </a>
              )}

              {/* Operating Hours Note */}
              <div className="pt-2 text-center text-[10px] text-gray-400 border-t border-gray-200/60">
                ⏰ {liveChatSettings.supportHours || 'সাপোর্ট সময়: প্রতিদিন সকাল ৯:০০ টা - রাত ১১:০০ টা'}
              </div>
            </div>
          ) : (
            /* Live Chat Interactive Window */
            <div className="flex flex-col h-[380px] bg-slate-50">
              {/* Messages viewport */}
              <div className="flex-1 p-3 overflow-y-auto space-y-2.5 text-xs">
                {localMessages.map((msg, idx) => {
                  const isUser = msg.sender === 'user';
                  const isAi = msg.sender === 'ai';
                  return (
                    <div
                      key={idx}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                    >
                      {isAi && (
                        <div className="flex items-center space-x-1 text-[10px] text-purple-600 font-bold mb-0.5 px-1">
                          <Bot className="w-3 h-3" />
                          <span>{liveChatSettings.aiSalesAgentName || 'এআই সেলস সহকারী'}</span>
                        </div>
                      )}
                      <div
                        className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs shadow-2xs whitespace-pre-line ${
                          isUser
                            ? 'bg-rose-600 text-white rounded-br-xs'
                            : isAi
                            ? 'bg-gradient-to-r from-purple-700 to-indigo-700 text-white rounded-bl-xs'
                            : 'bg-white text-gray-800 border border-gray-200/80 rounded-bl-xs'
                        }`}
                      >
                        {msg.text}

                        {/* Product recommendation if present */}
                        {msg.productName && (
                          <div className={`mt-2 p-2 rounded-xl text-left border ${isAi ? 'bg-white/15 border-white/20 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}>
                            <span className="font-bold text-[11px] block truncate">{msg.productName}</span>
                            {msg.productPrice && (
                              <span className="font-extrabold text-amber-300 text-xs">{formatPrice(msg.productPrice)}</span>
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
                    <span className="ml-1">উত্তর লেখা হচ্ছে...</span>
                  </div>
                )}
              </div>

              {/* Quick Prompt Chips */}
              <div className="px-3 py-1.5 bg-white/80 border-t border-gray-200/60 flex items-center space-x-1.5 overflow-x-auto no-scrollbar text-[11px]">
                <button
                  type="button"
                  onClick={() => handleQuickQuestion('চট্টগ্রাম ও ঢাকায় ডেলিভারি চার্জ কত?')}
                  className="shrink-0 bg-gray-100 hover:bg-rose-50 text-gray-700 hover:text-rose-600 px-2 py-1 rounded-lg border border-gray-200 cursor-pointer transition-colors"
                >
                  🚚 ডেলিভারি চার্জ কত?
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickQuestion('আমি কিভাবে অর্ডার ট্র্যাক করব?')}
                  className="shrink-0 bg-gray-100 hover:bg-rose-50 text-gray-700 hover:text-rose-600 px-2 py-1 rounded-lg border border-gray-200 cursor-pointer transition-colors"
                >
                  📦 অর্ডার ট্র্যাকিং
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickQuestion('ক্যাশ অন ডেলিভারি ও পেমেন্ট নিয়ম')}
                  className="shrink-0 bg-gray-100 hover:bg-rose-50 text-gray-700 hover:text-rose-600 px-2 py-1 rounded-lg border border-gray-200 cursor-pointer transition-colors"
                >
                  💳 পেমেন্ট তথ্য
                </button>
              </div>

              {/* Message Input Box */}
              <form onSubmit={handleSendMessage} className="p-2.5 bg-white border-t border-gray-200 flex items-center space-x-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  placeholder={t('এখানে আপনার প্রশ্ন লিখুন...', 'Type your message...')}
                  className="flex-1 bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-rose-500"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white p-2 rounded-xl cursor-pointer transition-colors shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Floating Action Button */}
      <div className="flex items-center space-x-2">
        {!isOpen && (
          <div
            onClick={() => setIsOpen(true)}
            className="cursor-pointer bg-white text-gray-800 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg border border-gray-100 flex items-center space-x-1.5 hover:shadow-xl hover:scale-105 transition-all group"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
            <span className="text-[11px] text-gray-900 group-hover:text-rose-600 transition-colors">
              {liveChatSettings.widgetCalloutTextBn || '💬 চ্যাট ও সাপোর্ট'}
            </span>
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Contact and Support"
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 hover:from-rose-700 hover:to-amber-600 text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer relative group"
        >
          {isOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <div className="relative">
              <MessageCircle className="w-7 h-7 fill-white/20 stroke-white" />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full" />
            </div>
          )}
        </button>
      </div>
    </div>
  );
};
