import React, { useState } from 'react';
import {
  X,
  PhoneCall,
  MessageSquare,
  HelpCircle,
  Send,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const CustomerSupportModal: React.FC = () => {
  const { activeModal, setActiveModal, t } = useShop();

  const [activeFaqCategory, setActiveFaqCategory] = useState<'order' | 'payment' | 'delivery' | 'return'>('delivery');
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'bot' | 'user'; text: string }>>([
    {
      sender: 'bot',
      text: 'আসসালামু আলাইকুম! ঝটপটশপ সাপোর্ট সেন্টারে আপনাকে স্বাগতম। কীভাবে সাহায্য করতে পারি?',
    },
  ]);
  const [chatInput, setChatInput] = useState('');

  if (activeModal !== 'support') return null;

  const faqs = {
    delivery: [
      {
        q: 'ডেলিভারি হতে কতক্ষণ সময় লাগে?',
        a: 'ঢাকা সিটির ভেতরে অর্ডার কনফার্মেশনের ২৪-৪৮ ঘণ্টার মধ্যে এবং ঢাকার বাইরে ৪৮-৭২ ঘণ্টার মধ্যে এক্সপ্রেস ডেলিভারি সম্পন্ন হয়।',
      },
      {
        q: 'ডেলিভারি চার্জ কত?',
        a: 'ঢাকা সিটির ভেতরে ৳৬০ এবং ঢাকার বাইরে ৳১২০। তবে ৳১৫০০ টাকার বেশি অর্ডারে সারা বাংলাদেশে সম্পূর্ণ ফ্রি ডেলিভারি!',
      },
      {
        q: 'পার্সেল কি খোলার পর চেক করে নেওয়া যায়?',
        a: 'হ্যাঁ, ডেলিভারিম্যানের সামনে পার্সেলটি চেক করে ক্যাশ অন ডেলিভারিতে মূল্য পরিশোধ করতে পারবেন।',
      },
    ],
    order: [
      {
        q: 'অর্ডার কীভাবে ট্র্যাক করব?',
        a: 'আমাদের ওয়েবসাইটের উপরে "Track Order" বাটনে ক্লিক করে আপনার অর্ডার আইডি (যেমন: JPS-2026-8941) দিয়ে তাৎক্ষণিক কুরিয়ার অবস্থান দেখতে পারবেন।',
      },
      {
        q: 'অর্ডার পরিবর্তন বা বাতিল করতে চাইলে কী করব?',
        a: 'অর্ডারটি "Shipped" হওয়ার আগে আমাদের হটলাইন 01800-JOTPOT এ কল করে যেকোনো পরিবর্তন বা বাতিল করতে পারবেন।',
      },
    ],
    payment: [
      {
        q: 'কী কী মাধ্যমে পেমেন্ট করা যায়?',
        a: 'ক্যাশ অন ডেলিভারি (পণ্য হাতে পেয়ে টাকা দেওয়া), বিকাশ (bKash), নগদ (Nagad), এবং ভিসা/মাস্টারকার্ডের মাধ্যমে সুরক্ষিত পেমেন্ট করতে পারবেন।',
      },
      {
        q: 'অনলাইন পেমেন্ট কি সম্পূর্ণ নিরাপদ?',
        a: 'হ্যাঁ, আমাদের পেমেন্ট সিস্টেম ব্যাংক-গ্রেড ২৫৬-বিট SSL এনক্রিপশনে পরিচালিত, আপনার কোনো সংবেদনশীল তথ্য সংরক্ষিত হয় না।',
      },
    ],
    return: [
      {
        q: 'রিটার্ন পলিসি কী রকম?',
        a: 'পণ্য পাওয়ার পর কোনো ত্রুটি বা অমিল থাকলে ৭ দিনের মধ্যে সম্পূর্ণ ফ্রিতে রিটার্ন বা রিপ্লেসমেন্ট সুবিধা পাবেন।',
      },
      {
        q: 'টাকা রিফান্ড পেতে কত সময় লাগে?',
        a: 'রিটার্ন পার্সেল রিসিভ হওয়ার পর ২৪ থেকে ৪৮ ঘণ্টার মধ্যে আপনার বিকাশ/নগদ বা ব্যাংক অ্যাকাউন্টে রিফান্ড পাঠিয়ে দেওয়া হয়।',
      },
    ],
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const msg = chatInput.trim();
    setChatMessages(prev => [...prev, { sender: 'user', text: msg }]);
    setChatInput('');

    setTimeout(() => {
      let reply = 'আপনার বার্তার জন্য ধন্যবাদ। আমাদের প্রতিনিধি আপনার সাথে অল্প সময়ের মধ্যে যোগাযোগ করবে। অথবা জরুরি প্রয়োজনে কল করুন 01800-JOTPOT নম্বরে।';
      if (msg.includes('ডেলিভারি') || msg.includes('delivery')) {
        reply = 'ঢাকা সিটিতে ২৪-৪৮ ঘণ্টা ও বাইরে ৪৮-৭২ ঘণ্টার মধ্যে ডেলিভারি পেয়ে যাবেন। ৳১৫০০+ অর্ডারে ডেলিভারি চার্জ সম্পূর্ণ ফ্রি!';
      } else if (msg.includes('বিকাশ') || msg.includes('bkash')) {
        reply = 'বিকাশে পেমেন্ট করতে চেকআউটে bKash অপশনটি বেছে নিয়ে আপনার নম্বর দিন।';
      }
      setChatMessages(prev => [...prev, { sender: 'bot', text: reply }]);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden my-auto border border-gray-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-gray-900 to-rose-950 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <PhoneCall className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">
                {t('গ্রাহক সহায়তা ও হেল্প সেন্টার', 'Customer Support & FAQ')}
              </h3>
              <p className="text-xs text-gray-300">
                {t('২৪/৭ আপনার সেবায় প্রস্তুত আমাদের টিম', 'We are here to assist you 24/7')}
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveModal(null)}
            className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Channels Quick Row */}
        <div className="p-4 sm:p-6 bg-gray-50/80 border-b border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <a
            href="tel:01800568768"
            className="bg-white p-3.5 rounded-2xl border border-gray-200 hover:border-rose-400 shadow-xs flex items-center space-x-3 transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-gray-400 font-bold block uppercase">{t('সরাসরি ফোন', 'DIRECT CALL')}</span>
              <strong className="text-xs text-gray-900">01800-JOTPOT</strong>
            </div>
          </a>

          <a
            href="https://wa.me/8801700000000"
            target="_blank"
            rel="noreferrer"
            className="bg-white p-3.5 rounded-2xl border border-gray-200 hover:border-emerald-400 shadow-xs flex items-center space-x-3 transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-gray-400 font-bold block uppercase">WHATSAPP</span>
              <strong className="text-xs text-emerald-700">+880 1700-000000</strong>
            </div>
          </a>

          <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-xs flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-gray-400 font-bold block uppercase">{t('সহায়তা সময়', 'HOURS')}</span>
              <strong className="text-xs text-gray-900">9:00 AM - 11:00 PM</strong>
            </div>
          </div>
        </div>

        {/* Support Body */}
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left: FAQs (7 cols) */}
          <div className="md:col-span-7 space-y-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center space-x-1">
              <HelpCircle className="w-3.5 h-3.5 text-rose-600" />
              <span>{t('সাধারণ প্রশ্নোত্তর (FAQ)', 'Frequently Asked Questions')}</span>
            </h4>

            {/* Category tabs */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs font-semibold">
              {(['delivery', 'order', 'payment', 'return'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveFaqCategory(cat);
                    setOpenFaqIdx(0);
                  }}
                  className={`px-3 py-1.5 rounded-xl capitalize transition-colors cursor-pointer ${
                    activeFaqCategory === cat
                      ? 'bg-rose-600 text-white font-bold'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Accordion List */}
            <div className="space-y-2">
              {faqs[activeFaqCategory].map((faq, idx) => {
                const isOpen = openFaqIdx === idx;
                return (
                  <div key={idx} className="border border-gray-200 rounded-xl overflow-hidden bg-white text-xs">
                    <button
                      onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                      className="w-full text-left p-3 font-bold text-gray-900 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </button>
                    {isOpen && (
                      <div className="p-3 bg-gray-50/60 text-gray-600 border-t border-gray-100 leading-relaxed">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Instant Live Web Chat Simulation (5 cols) */}
          <div className="md:col-span-5 flex flex-col h-[320px] bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden">
            <div className="bg-gray-900 text-white p-3 flex items-center space-x-2 text-xs">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold">{t('ঝটপট লাইভ চ্যাট', 'JotPot Live Chat')}</span>
            </div>

            {/* Messages */}
            <div className="flex-1 p-3 overflow-y-auto space-y-2 text-xs">
              {chatMessages.map((m, i) => (
                <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] p-2.5 rounded-xl leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-rose-600 text-white font-medium rounded-br-none'
                        : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-2xs'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input bar */}
            <form onSubmit={handleSendMessage} className="p-2 bg-white border-t border-gray-200 flex gap-1.5">
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder={t('মেসেজ লিখুন...', 'Type a message...')}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs focus:outline-hidden focus:border-rose-500"
              />
              <button
                type="submit"
                className="bg-rose-600 hover:bg-rose-700 text-white p-2 rounded-xl transition-colors cursor-pointer"
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
