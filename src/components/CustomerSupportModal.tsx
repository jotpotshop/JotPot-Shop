import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  PhoneCall,
  MessageSquare,
  HelpCircle,
  Send,
  ChevronDown,
  ChevronUp,
  Clock,
  MessageCircle,
  ExternalLink,
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

  // Active customer livechat conversation thread
  const activeConversation = conversations.find(
    c =>
      c.channel === 'livechat' &&
      ((user.phone && c.customerPhone === user.phone) ||
        (user.email && c.customerEmail === user.email) ||
        (user.name && c.customerName === user.name))
  ) || conversations.find(c => c.channel === 'livechat');

  // Filter FAQs for active category
  const publishedFaqs = (helpCenterSettings.faqs || [])
    .filter(f => f.category === activeFaqCategory && f.isPublished)
    .sort((a, b) => a.order - b.order);

  // Set default open FAQ when category changes
  useEffect(() => {
    if (publishedFaqs.length > 0) {
      setOpenFaqId(publishedFaqs[0].id);
    } else {
      setOpenFaqId(null);
    }
  }, [activeFaqCategory, helpCenterSettings.faqs?.length]);

  // Scroll messages to bottom
  useEffect(() => {
    if (activeModal === 'support') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeConversation?.messages?.length, activeModal]);

  if (activeModal !== 'support') return null;

  // WhatsApp link format
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

  // Direct phone call format
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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden my-auto border border-gray-100 flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-gray-900 via-rose-950 to-gray-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <PhoneCall className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">
                {isBn ? helpCenterSettings.titleBn : helpCenterSettings.title}
              </h3>
              <p className="text-xs text-gray-300">
                {isBn ? helpCenterSettings.subtitleBn : helpCenterSettings.subtitle}
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveModal(null)}
            className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Contact Channels Quick Row */}
        <div className="p-4 sm:p-5 bg-gray-50/80 border-b border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Direct Phone */}
          {helpCenterSettings.contactButtons?.directCall?.enabled !== false && (
            <a
              href={`tel:${cleanPhone}`}
              className="bg-white p-3.5 rounded-2xl border border-gray-200 hover:border-rose-400 shadow-xs flex items-center space-x-3 transition-colors"
            >
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <PhoneCall className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-gray-400 font-bold block uppercase">
                  {t('সরাসরি ফোন কল', 'DIRECT CALL')}
                </span>
                <strong className="text-xs text-gray-900 truncate block">
                  {helpCenterSettings.supportPhone || '01800-JOTPOT'}
                </strong>
              </div>
            </a>
          )}

          {/* WhatsApp */}
          {helpCenterSettings.contactButtons?.whatsapp?.enabled !== false && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="bg-white p-3.5 rounded-2xl border border-gray-200 hover:border-emerald-400 shadow-xs flex items-center space-x-3 transition-colors"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-gray-400 font-bold block uppercase">
                  WHATSAPP
                </span>
                <strong className="text-xs text-emerald-700 truncate block">
                  +{cleanWhatsapp}
                </strong>
              </div>
            </a>
          )}

          {/* Business Hours */}
          <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-xs flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-gray-400 font-bold block uppercase">
                {t('সহায়তা সময়', 'SUPPORT HOURS')}
              </span>
              <strong className="text-xs text-gray-900 truncate block">
                {isBn ? helpCenterSettings.businessHoursBn : helpCenterSettings.businessHours}
              </strong>
            </div>
          </div>
        </div>

        {/* Support Body */}
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left: Dynamic FAQs (7 cols) */}
          <div className="md:col-span-7 space-y-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center space-x-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-rose-600" />
              <span>{t('সাধারণ প্রশ্নোত্তর (FAQ)', 'Frequently Asked Questions')}</span>
            </h4>

            {/* Category tabs */}
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
                  className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap ${
                    activeFaqCategory === cat.key
                      ? 'bg-rose-600 text-white font-bold'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {isBn ? cat.labelBn : cat.labelEn}
                </button>
              ))}
            </div>

            {/* Accordion List */}
            {publishedFaqs.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-gray-200 rounded-2xl text-xs space-y-1">
                <p className="font-bold text-gray-600">
                  {t(
                    'বর্তমানে এই ক্যাটাগরিতে কোনো প্রশ্নোত্তর প্রকাশিত হয়নি।',
                    'No published FAQs in this category at the moment.'
                  )}
                </p>
                <p className="text-gray-400">
                  {t(
                    'যেকোনো সহায়তার জন্য ডানপাশের লাইভ চ্যাটে লিখুন বা হটলাইনে কল দিন।',
                    'Please reach out via Live Chat or Hotline for assistance.'
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
                      className="border border-gray-200 rounded-xl overflow-hidden bg-white text-xs"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                        className="w-full text-left p-3 font-bold text-gray-900 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <span>{questionText}</span>
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4 text-gray-400 shrink-0 ml-2" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 ml-2" />
                        )}
                      </button>
                      {isOpen && (
                        <div className="p-3 bg-gray-50/70 text-gray-600 border-t border-gray-100 leading-relaxed whitespace-pre-line">
                          {answerText}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Real Live Chat Desk (5 cols) */}
          <div className="md:col-span-5 flex flex-col h-[340px] bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
            <div className="bg-gradient-to-r from-gray-900 to-rose-950 text-white p-3 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold">
                  {t('সরাসরি লাইভ চ্যাট সাপোর্ট', 'Live Customer Support')}
                </span>
              </div>
              <span className="text-[10px] text-emerald-300 font-mono">অনলাইন</span>
            </div>

            {/* Real Messages Viewport */}
            <div className="flex-1 p-3 overflow-y-auto space-y-2.5 text-xs">
              {/* Store Official Welcome Greeting */}
              <div className="flex justify-start">
                <div className="max-w-[85%] p-2.5 rounded-xl rounded-bl-none bg-white border border-gray-200 text-gray-800 shadow-2xs leading-relaxed">
                  {isBn
                    ? helpCenterSettings.welcomeMessageBn ||
                      'আসসালামু আলাইকুম! ঝটপটশপ সাপোর্ট সেন্টারে আপনাকে স্বাগতম। কীভাবে সাহায্য করতে পারি?'
                    : helpCenterSettings.welcomeMessage ||
                      'Welcome to JotPotShop Support. How can we help you today?'}
                </div>
              </div>

              {/* Real Conversation messages from Firestore */}
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
                            ? 'bg-rose-600 text-white font-medium rounded-br-none'
                            : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-2xs'
                        }`}
                      >
                        {m.text}
                      </div>
                      <span className="text-[9px] text-gray-400 px-1 mt-0.5">
                        {m.timestamp} {isUser && '• পাঠানো হয়েছে'}
                      </span>
                    </div>
                  );
                })}
              <div ref={messagesEndRef} />
            </div>

            {/* Real Chat Input */}
            <form
              onSubmit={handleSendMessage}
              className="p-2 bg-white border-t border-gray-200 flex gap-1.5"
            >
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder={t('এখানে মেসেজ লিখুন...', 'Type your message...')}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-rose-500"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || isSending}
                className="bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white p-2 rounded-xl transition-colors cursor-pointer shrink-0"
                title="মেসেজ পাঠান"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
