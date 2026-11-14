import React from 'react';
import { Phone, MessageCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext.js';

export const FloatingWhatsApp: React.FC = () => {
  const { settings, t } = useStore();
  const rawNumber = settings?.whatsappNumber || '01745329020';
  const cleanNumber = rawNumber.startsWith('88') ? rawNumber : `88${rawNumber}`;

  return (
    <aside
      aria-label="WhatsApp quick contact"
      className="fixed bottom-5 right-5 z-40 flex items-center group"
    >
      <a
        href={`https://wa.me/${cleanNumber}?text=${encodeURIComponent('Hello Offer Flow, I have a question about products and ordering.')}`}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white pl-3.5 pr-4 py-3 rounded-full shadow-2xl shadow-emerald-600/40 transition-all duration-300 hover:scale-105 active:scale-95"
        title="Chat on WhatsApp (01745329020)"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-200"></span>
        </span>
        <Phone className="w-5 h-5 fill-white" />
        <span className="text-xs font-extrabold tracking-wide hidden sm:inline">
          {t('WhatsApp Order', 'হোয়াটসঅ্যাপে অর্ডার')}
        </span>
      </a>
    </aside>
  );
};
