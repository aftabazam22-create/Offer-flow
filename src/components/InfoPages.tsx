import React, { useState } from 'react';
import { Phone, Mail, MapPin, ShieldCheck, Truck, RefreshCw, Send, CheckCircle2 } from 'lucide-react';
import { useStore } from '../context/StoreContext.js';

export const AboutPage: React.FC = () => {
  const { t } = useStore();
  return (
    <div className="max-w-4xl mx-auto space-y-8 bg-white p-6 sm:p-12 rounded-3xl border border-slate-100 shadow-sm">
      <div className="space-y-3">
        <span className="text-xs font-black text-rose-600 uppercase tracking-wider">
          {t('Our Story & Philosophy', 'আমাদের সম্পর্কে')}
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 leading-tight">
          {t('Offer Flow — Empowering Bangladeshi Shoppers with True Value', 'অফার ফ্লো — সাশ্রয়ী ও নির্ভরযোগ্য কেনাকাটার সেরা মাধ্যম')}
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          {t(
            'Founded with a straightforward mission: deliver genuine smart technology, trendy gadgets, authentic ethnic fashion, and daily essentials directly to doorsteps across all 64 districts of Bangladesh with unmatched speed, transparency, and hassle-free WhatsApp purchasing.',
            'অফার ফ্লো একটি বিশ্বস্ত ই-কমার্স প্ল্যাটফর্ম যা বাংলাদেশের ৬৪ জেলার গ্রাহকদের কাছে অথেন্টিক গ্যাজেট, ফ্যাশন ও হোম অ্যাপ্লায়েন্সেস দ্রুত ও ক্যাশ অন ডেলিভারিতে পৌঁছে দিতে প্রতিশ্রুতিবদ্ধ।'
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-slate-100">
        <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100 space-y-2">
          <ShieldCheck className="w-6 h-6 text-rose-600" />
          <h3 className="font-bold text-slate-800 text-sm">{t('100% Authentic Quality', '১০০% আসল পণ্য')}</h3>
          <p className="text-xs text-slate-500">
            {t('Direct sourcing from authorized suppliers and verified brand partners.', 'অনুমোদিত ব্র্যান্ড ও বিশ্বস্ত সোর্স থেকে আমদানিকৃত পণ্য।')}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-2">
          <Truck className="w-6 h-6 text-emerald-600" />
          <h3 className="font-bold text-slate-800 text-sm">{t('Express Nationwide Logistics', 'দ্রুত ডেলিভারি')}</h3>
          <p className="text-xs text-slate-500">
            {t('Next-day in Dhaka and 48-72 hour dispatch to all divisions and thanas.', 'সারা দেশে দ্রুত কুরিয়ার সার্ভিসের মাধ্যমে নিরাপদ ডেলিভারি।')}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 space-y-2">
          <RefreshCw className="w-6 h-6 text-amber-600" />
          <h3 className="font-bold text-slate-800 text-sm">{t('Customer First Guarantee', '৭ দিনের রিটার্ন')}</h3>
          <p className="text-xs text-slate-500">
            {t('Direct unboxing inspection with dedicated 7-day replacement support.', 'ত্রুটিপূর্ণ পণ্যে দ্রুত পরিবর্তন ও সার্বক্ষণিক সাপোর্ট।')}
          </p>
        </div>
      </div>

      <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-slate-800">Architect & Web Director</h4>
          <p className="text-xs text-slate-500">Crafted with precision by A.Y HEJAJ</p>
        </div>
        <a
          href="https://wa.me/8801745329020"
          target="_blank"
          rel="noreferrer"
          className="px-6 py-2.5 bg-emerald-600 text-white rounded-full text-xs font-bold shadow-md hover:bg-emerald-500 transition-colors"
        >
          {t('Talk with Our Team on WhatsApp', 'হোয়াটসঅ্যাপে কথা বলুন')}
        </a>
      </div>
    </div>
  );
};

export const ContactPage: React.FC = () => {
  const { t, showToast } = useStore();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    showToast(t('Message sent! We will call or WhatsApp you shortly.', 'আপনার বার্তা পাঠানো হয়েছে!'));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 bg-white p-6 sm:p-12 rounded-3xl border border-slate-100 shadow-sm">
      <div className="space-y-2">
        <span className="text-xs font-black text-rose-600 uppercase tracking-wider">
          {t('Customer Helpdesk', 'যোগাযোগ ও সাপোর্ট')}
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          {t('We are here to assist you 24/7', 'আমরা আপনাকে সহায়তা করতে সর্বদা প্রস্তুত')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          {t('Have a question about an order, tracking, or bulk wholesale inquiries? Reach out anytime.', 'যেকোনো জিজ্ঞাসা বা অর্ডারের তথ্যের জন্য সরাসরি যোগাযোগ করুন।')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
        {/* Contact Info Cards */}
        <div className="space-y-4">
          <a
            href="https://wa.me/8801745329020"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 hover:bg-emerald-100/70 transition-colors group"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                {t('WhatsApp Hotline (Direct)', 'হোয়াটসঅ্যাপ হটলাইন')}
              </span>
              <span className="text-base font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                01745329020
              </span>
              <span className="text-[11px] text-slate-500 block">{t('Instant response 9 AM - 11 PM', 'সকাল ৯টা থেকে রাত ১১টা')}</span>
            </div>
          </a>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                {t('Email Support', 'ইমেইল')}
              </span>
              <span className="text-sm font-bold text-slate-900">support@offerflow.com.bd</span>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="w-12 h-12 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                {t('Corporate Dispatch Office', 'অফিস ঠিকানা')}
              </span>
              <span className="text-sm font-bold text-slate-900">Dhaka, Bangladesh</span>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
          {sent ? (
            <div className="py-12 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">{t('Message Received!', 'বার্তা গ্রহণ করা হয়েছে!')}</h3>
              <p className="text-xs text-slate-500">{t('Our customer support agent will reach you on WhatsApp or Phone shortly.', 'আমাদের প্রতিনিধি আপনার সাথে যোগাযোগ করবেন।')}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <h3 className="text-sm font-bold text-slate-800">{t('Send us a Quick Message', 'আমাদের মেসেজ পাঠান')}</h3>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t('Name', 'নাম')}</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                  placeholder="Your Name"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t('Mobile Number', 'মোবাইল নম্বর')}</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                  placeholder="017XXXXXXXX"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t('Your Query', 'আপনার মেসেজ')}</label>
                <textarea
                  required
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                  placeholder="Tell us what you need help with..."
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{t('Submit Inquiry', 'পাঠান')}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export const PolicyPage: React.FC<{ type: 'privacy' | 'terms' | 'returns' }> = ({ type }) => {
  const { t } = useStore();

  if (type === 'returns') {
    return (
      <div className="max-w-3xl mx-auto bg-white p-6 sm:p-10 rounded-3xl border border-slate-100 shadow-sm space-y-6">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          {t('7-Day Return & Replacement Policy', '৭ দিনের রিটার্ন ও রিফান্ড পলিসি')}
        </h1>
        <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
          <p>
            At <strong>Offer Flow</strong>, customer confidence is our highest priority. We want you to purchase with complete peace of mind across Bangladesh.
          </p>
          <h3 className="text-base font-bold text-slate-800 pt-2">Eligibility for Return or Replacement:</h3>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>The product received is physically damaged, defective, or not operating according to specifications.</li>
            <li>The item delivered is incorrect in color, size, or model compared to your order.</li>
            <li>All original packaging, accessories, warranty cards, and tags must remain intact.</li>
          </ul>
          <h3 className="text-base font-bold text-slate-800 pt-2">How to Request:</h3>
          <p>
            Simply contact our official WhatsApp hotline <strong>01745329020</strong> within 7 days of receiving the package with an unboxing photo or video. Our courier partner will schedule a reverse pickup or quick replacement at your location.
          </p>
        </div>
      </div>
    );
  }

  if (type === 'privacy') {
    return (
      <div className="max-w-3xl mx-auto bg-white p-6 sm:p-10 rounded-3xl border border-slate-100 shadow-sm space-y-6">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          {t('Privacy Policy', 'গোপনীয়তা নীতি')}
        </h1>
        <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
          <p>
            Offer Flow respects your privacy and is committed to protecting your personal information. This policy explains what information we collect and how we utilize it to serve your orders effectively.
          </p>
          <h3 className="text-base font-bold text-slate-800 pt-2">Information Collected:</h3>
          <p>
            When placing orders via our checkout or direct WhatsApp system, we receive your Name, Mobile Phone Number, and Shipping Address solely for the purpose of dispatching your parcel via authorized courier partners (e.g., Steadfast, RedX, Paperfly).
          </p>
          <h3 className="text-base font-bold text-slate-800 pt-2">Security:</h3>
          <p>
            We never sell, rent, or lease your private information to third-party telemarketers. All session data is stored securely.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 sm:p-10 rounded-3xl border border-slate-100 shadow-sm space-y-6">
      <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
        {t('Terms & Conditions', 'শর্তাবলী')}
      </h1>
      <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
        <p>
          By accessing and placing orders on Offer Flow, you agree to comply with and be bound by the following operating terms and conditions.
        </p>
        <h3 className="text-base font-bold text-slate-800 pt-2">Pricing & Availability:</h3>
        <p>
          All product prices are quoted in Bangladeshi Taka (৳ BDT) and include relevant local trade taxes. Promotional deals and flash sales are valid until stock lasts.
        </p>
        <h3 className="text-base font-bold text-slate-800 pt-2">Cash on Delivery Verification:</h3>
        <p>
          For orders placed with Cash on Delivery, customer care may initiate a quick confirmation call or WhatsApp text before parcel dispatch to verify the shipping address.
        </p>
      </div>
    </div>
  );
};
