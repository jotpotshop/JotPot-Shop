import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  PhoneCall,
  HelpCircle,
  Send,
  ChevronDown,
  ChevronUp,
  Clock,
  MessageCircle,
  Lock,
  LogIn,
  ShieldCheck,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { HelpCenterFaqCategory } from '../types';

export const CustomerSupportModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    helpCenterSettings,
    conversations,
    sendCustomerChatMessage,
    user,
    t,
    language,
  } = useShop();

  const [activeFaqCategory, setActiveFaqCategory] = useState<HelpCenterFaqCategory>('delivery');
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConversation = user.isLoggedIn
    ? conversations.find(
        c =>
          c.channel === 'livechat' &&
          ((user.uid && c.customerUid === user.uid) ||
            (user.phone && c.customerPhone === user.phone) ||
            (user.email && c.customerEmail && c.customerEmail.toLowerCase() === user.email.toLowerCase()))
      )
    : undefined;

  const publishedFaqs = (helpCenterSettings.faqs || [])
    .filter(f => f.category === activeFaqCategory && f.isPublished)
    .sort((a, b) => a.order - b.order);

  useEffect(() => {
    if (publishedFaqs.length > 0) {
      setOpenFaqId(publishedFaqs[0].id);
    } else {
      setOpenFaqId(null);
    }
  }, [activeFaqCategory, helpCenterSettings.faqs?.length]);

  useEffect(() => {
    if (activeModal === 'support') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeConversation?.messages?.length, activeModal]);

  if (activeModal !== 'support') return null;

  const rawWhatsapp = (
    helpCenterSettings.contactButtons?.whatsapp?.number ||
    '01700000000'
  ).replace(/\D/g, '');
  const cleanWhatsapp = rawWhatsapp.startsWith('880')
    ? rawWhatsapp
    : rawWhatsapp.startsWith('0')
    ? `88${rawWhatsapp}`
    : `880${rawWhatsapp}`;
  const whatsappUrl = `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
    'হ্যালো JotPotShop! আমি সহায়তা কেন্দ্র থেকে যোগাযোগ করছি।'
  )}`;

  const phoneCallNumber =
    helpCenterSettings.contactButtons?.directCall?.phone ||
    helpCenterSettings.supportPhone ||
    '01800568768';
  const cleanPhone = phoneCallNumber.replace(/\D/g, '');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isSending) return;

    const text = chatInput.trim();
    setIsSending(true);

    sendCustomerChatMessage(text, 'livechat', {
      name: user.name || 'ওয়েব গ্রাহক',
      phone: user.phone || '017XXXXXXXX',
      email: user.email || '',
    });

    setChatInput('');
    setTimeout(() => {
      setIsSending(false);
    }, 600);
  };

  const isBn = language === 'bn';

  return (
    <div className="fixed inset-0 z-50 bg-black/55 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-auto border border-[#e6e3dd] flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#111827] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
              <PhoneCall className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h3 className="font-editorial font-bold text-base sm:text-lg text-white">
                {isBn ? helpCenterSettings.titleBn : helpCenterSettings.title}
              </h3>
              <p className="text-xs text-gray-300">
                {isBn ? helpCenterSettings.subtitleBn : helpCenterSettings.subtitle}
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveModal(null)}
            className="p-2 text-gray-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contact Channels Row */}
        <div className="p-4 sm:p-5 bg-[#faf9f7] border-b border-[#e6e3dd] grid grid-cols-1 sm:grid-cols-3 gap-3 tabular-nums">
          {helpCenterSettings.contactButtons?.directCall?.enabled !== false && (
            <a
              href={`tel:${cleanPhone}`}
              className="bg-white p-3.5 rounded-xl border border-[#e6e3dd] hover:border-[#111827] flex items-center gap-3 transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-[#faf9f7] border border-[#e6e3dd] text-[#881337] flex items-center justify-center shrink-0">
                <PhoneCall className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] text-gray-500 font-medium block">
                  {t('সরাসরি কল করুন', 'Direct Call')}
                </span>
                <strong className="text-xs text-[#111827] font-mono truncate block">
                  {helpCenterSettings.supportPhone || '01800-JOTPOT'}
                </strong>
              </div>
            </a>
          )}

          {helpCenterSettings.contactButtons?.whatsapp?.enabled !== false && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="bg-white p-3.5 rounded-xl border border-[#e6e3dd] hover:border-[#15803d] flex items-center gap-3 transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-[#faf9f7] border border-[#e6e3dd] text-[#15803d] flex items-center justify-center shrink-0">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] text-gray-500 font-medium block">
                  WhatsApp
                </span>
                <strong className="text-xs text-[#15803d] font-mono truncate block">
                  +{cleanWhatsapp}
                </strong>
              </div>
            </a>
          )}

          <div className="bg-white p-3.5 rounded-xl border border-[#e6e3dd] flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#faf9f7] border border-[#e6e3dd] text-[#111827] flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] text-gray-500 font-medium block">
                {t('সহায়তা সময়', 'Support Hours')}
              </span>
              <strong className="text-xs text-[#111827] truncate block">
                {isBn ? helpCenterSettings.businessHoursBn : helpCenterSettings.businessHours}
              </strong>
            </div>
          </div>
        </div>

        {/* Support Body */}
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left: Dynamic FAQs */}
          <div className="md:col-span-7 space-y-4">
            <h4 className="text-xs font-bold text-[#111827] flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-[#881337]" />
              <span>{t('সাধারণ প্রশ্নোত্তর (FAQ)', 'Frequently Asked Questions')}</span>
            </h4>

            <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs font-semibold scrollbar-none">
              {(
                [
                  { key: 'delivery', labelBn: 'ডেলিভারি', labelEn: 'Delivery' },
                  { key: 'order', labelBn: 'অর্ডার', labelEn: 'Order' },
                  { key: 'payment', labelBn: 'পেমেন্ট', labelEn: 'Payment' },
                  { key: 'return', labelBn: 'রিটার্ন', labelEn: 'Return' },
                  { key: 'general', labelBn: 'সাধারণ', labelEn: 'General' },
                ] as const
              ).map(cat => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setActiveFaqCategory(cat.key)}
                  className={`px-3 py-1.5 min-h-[34px] rounded-lg transition-colors cursor-pointer whitespace-nowrap border ${
                    activeFaqCategory === cat.key
                      ? 'bg-[#111827] border-[#111827] text-white'
                      : 'bg-[#faf9f7] border-[#e6e3dd] text-gray-700 hover:border-[#111827]'
                  }`}
                >
                  {isBn ? cat.labelBn : cat.labelEn}
                </button>
              ))}
            </div>

            {publishedFaqs.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-[#e6e3dd] rounded-xl text-xs space-y-1">
                <p className="font-semibold text-[#111827]">
                  {t(
                    'বর্তমানে এই বিভাগে কোনো প্রশ্নোত্তর যুক্ত নেই।',
                    'No published FAQs in this category at the moment.'
                  )}
                </p>
                <p className="text-gray-500">
                  {t(
                    'যেকোনো সহায়তার জন্য ডানপাশের লাইভ চ্যাটে লিখুন বা কল করুন।',
                    'Please reach out via Live Chat or call our hotline.'
                  )}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {publishedFaqs.map(faq => {
                  const isOpen = openFaqId === faq.id;
                  const questionText = isBn ? faq.questionBn : faq.question || faq.questionBn;
                  const answerText = isBn ? faq.answerBn : faq.answer || faq.answerBn;

                  return (
                    <div
                      key={faq.id}
                      className="border border-[#e6e3dd] rounded-xl overflow-hidden bg-white text-xs"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                        className="w-full text-left p-3.5 font-semibold text-[#111827] flex items-center justify-between hover:bg-[#faf9f7] transition-colors cursor-pointer"
                      >
                        <span>{questionText}</span>
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4 text-gray-500 shrink-0 ml-2" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-500 shrink-0 ml-2" />
                        )}
                      </button>
                      {isOpen && (
                        <div className="p-3.5 bg-[#faf9f7] text-gray-700 border-t border-[#e6e3dd] leading-relaxed whitespace-pre-line">
                          {answerText}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Live Chat Desk */}
          <div className="md:col-span-5 flex flex-col h-[340px] bg-[#faf9f7] rounded-xl border border-[#e6e3dd] overflow-hidden">
            <div className="bg-[#111827] text-white px-4 py-3 flex items-center justify-between text-xs">
              <span className="font-semibold">
                {t('লাইভ চ্যাট সাপোর্ট', 'Live Customer Support')}
              </span>
              <span className="text-[11px] text-emerald-300 font-medium">অনলাইন</span>
            </div>

            {!user.isLoggedIn ? (
              <div className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-3 bg-white">
                <div className="w-11 h-11 rounded-xl bg-[#faf9f7] border border-[#e6e3dd] text-[#881337] flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-[#111827] text-sm">
                    {t('লাইভ চ্যাটে লগইন প্রয়োজন', 'Login Required for Live Chat')}
                  </h4>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed max-w-xs">
                    {t(
                      'আপনার কথোপকথন ও অর্ডার তথ্যের গোপনীয়তা রক্ষায় চ্যাটে যুক্ত হতে লগইন করুন।',
                      'Please sign in to protect your privacy during live support.'
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveModal('login')}
                  className="py-2.5 px-4 min-h-[38px] bg-[#881337] hover:bg-[#6d0f2c] text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>{t('লগইন / রেজিস্টার করুন', 'Login / Register')}</span>
                </button>
                <div className="text-[11px] text-gray-500 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#15803d]" />
                  <span>{t('সুরক্ষিত সেশন', 'Secure Session')}</span>
                </div>
              </div>
            ) : (
              <>
                <div className="flex-1 p-3 overflow-y-auto space-y-2.5 text-xs">
                  <div className="flex justify-start">
                    <div className="max-w-[85%] p-2.5 rounded-xl rounded-bl-none bg-white border border-[#e6e3dd] text-[#111827] leading-relaxed">
                      {isBn
                        ? helpCenterSettings.welcomeMessageBn ||
                          'আসসালামু আলাইকুম! ঝটপটশপ সাপোর্ট সেন্টারে আপনাকে স্বাগতম। কীভাবে সাহায্য করতে পারি?'
                        : helpCenterSettings.welcomeMessage ||
                          'Welcome to JotPotShop Support. How can we help you today?'}
                    </div>
                  </div>

                  {activeConversation &&
                    activeConversation.messages.map(m => {
                      const isUser = m.sender === 'customer';
                      return (
                        <div
                          key={m.id}
                          className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                        >
                          <div
                            className={`max-w-[85%] p-2.5 rounded-xl leading-relaxed whitespace-pre-line ${
                              isUser
                                ? 'bg-[#881337] text-white rounded-br-none'
                                : 'bg-white border border-[#e6e3dd] text-[#111827] rounded-bl-none'
                            }`}
                          >
                            {m.text}
                          </div>
                          <span className="text-[10px] text-gray-400 px-1 mt-0.5 tabular-nums">
                            {m.timestamp} {isUser && '· পাঠানো হয়েছে'}
                          </span>
                        </div>
                      );
                    })}
                  <div ref={messagesEndRef} />
                </div>

                <form
                  onSubmit={handleSendMessage}
                  className="p-2 bg-white border-t border-[#e6e3dd] flex gap-1.5"
                >
                  <input
                    type="text"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    placeholder={t('এখানে মেসেজ লিখুন...', 'Type your message...')}
                    className="flex-1 min-h-[38px] bg-[#faf9f7] border border-[#e6e3dd] rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-[#111827]"
                  />
                  <button
                    type="submit"
                    disabled={!chatInput.trim() || isSending}
                    className="bg-[#881337] hover:bg-[#6d0f2c] disabled:opacity-40 text-white px-3 py-2 min-h-[38px] rounded-lg transition-colors cursor-pointer shrink-0 flex items-center justify-center"
                    title={t('মেসেজ পাঠান', 'Send')}
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
