import React from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Truck,
  ShieldCheck,
  RefreshCw,
  Headphones,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { useStore } from '../context/StoreContext.js';

interface FooterProps {
  onNavigate: (view: string, param?: string) => void;
  onOpenUserLogin?: () => void;
  onOpenAdminLogin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onOpenUserLogin,
  onOpenAdminLogin,
}) => {
  const { settings, firebaseUser, t } = useStore();

  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
      {/* Customer Trust Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-slate-800">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                {t('Fast BD Delivery', 'সারা দেশে দ্রুত ডেলিভারি')}
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                {t('Inside Dhaka 24-48h, across 64 districts', 'ঢাকার ভেতরে ২৪-৪৮ ঘণ্টা, ৬৪ জেলায়')}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                {t('100% Genuine Products', '১০০% আসল পণ্য')}
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                {t('Quality checked with brand warranties', 'পরীক্ষিত কোয়ালিটি ও ওয়ারেন্টি সহ')}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                {t('7-Day Easy Returns', '৭ দিনের সহজ রিটার্ন')}
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                {t('Hassle-free exchange for defective items', 'ত্রুটিপূর্ণ পণ্যে দ্রুত পরিবর্তন')}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                {t('Instant WhatsApp Care', 'হোয়াটসঅ্যাপে সহায়তা')}
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                {t('Order & support via 01745329020', 'সহজ অর্ডার ও হেল্পলাইন')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              {settings?.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt={settings.websiteName || 'Offer Flow'}
                  className="w-9 h-9 rounded-xl object-cover border border-slate-700 bg-white shadow-md shrink-0"
                />
              ) : (
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-600 to-red-600 flex items-center justify-center text-white font-black text-lg shadow-md shrink-0">
                  OF
                </div>
              )}
              <span className="text-xl font-extrabold text-white tracking-tight">
                {!settings?.websiteName || settings.websiteName.toLowerCase() === 'offer flow' ? (
                  <>
                    OFFER<span className="text-rose-500">FLOW</span>
                  </>
                ) : (
                  settings.websiteName
                )}
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              {settings?.tagline || 'BEST OFFERS, ENDLESS SAVINGS'}
              <br />
              {t(
                'Bangladesh’s premier online shopping destination for smart gadgets, electronics, authentic ethnic fashion, and daily essentials with effortless WhatsApp ordering.',
                'স্মার্ট গ্যাজেট, ইলেকট্রনিক্স, খাঁটি দেশি ফ্যাশন এবং নিত্যপ্রয়োজনীয় পণ্যের জন্য বাংলাদেশের নির্ভরযোগ্য ই-কমার্স প্ল্যাটফর্ম।'
              )}
            </p>

            <div className="pt-2 flex flex-col gap-2 text-sm text-slate-300">
              <a
                href={`https://wa.me/8801745329020`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>WhatsApp: 01745329020</span>
              </a>
              <div className="flex items-center gap-2 text-slate-400">
                <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                <span>Dhaka, Bangladesh</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              {t('Explore Marketplace', 'মার্কেটপ্লেস')}
            </h3>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-white transition-colors">
                  {t('Home', 'হোম')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop')} className="hover:text-white transition-colors">
                  {t('All Products', 'সকল পণ্য')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('categories')} className="hover:text-white transition-colors">
                  {t('Categories', 'ক্যাটাগরি')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('flash-sale')} className="hover:text-white transition-colors">
                  {t('Flash Sale Deals', 'ফ্ল্যাশ সেল অফার')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('blog')} className="hover:text-white transition-colors">
                  {t('Tech & Lifestyle Blog', 'ব্লগ ও শপিং টিপস')}
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              {t('Customer Support', 'গ্রাহক সেবা')}
            </h3>
            <ul className="space-y-2.5 text-sm text-slate-400">
              {onOpenUserLogin && (
                <li>
                  <button
                    onClick={onOpenUserLogin}
                    className="text-white hover:text-rose-400 font-semibold transition-colors"
                  >
                    {firebaseUser
                      ? t('My Account & Saved Info', 'আমার অ্যাকাউন্ট')
                      : t('Customer Login / Sign Up', 'কাস্টমার লগইন / রেজিস্টার')}
                  </button>
                </li>
              )}
              <li>
                <button onClick={() => onNavigate('orders')} className="text-rose-400 hover:text-rose-300 font-semibold transition-colors">
                  {t('Track My Order', 'আমার অর্ডার ট্র্যাক করুন')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-white transition-colors">
                  {t('About Us', 'আমাদের সম্পর্কে')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-white transition-colors">
                  {t('Contact & Support', 'যোগাযোগ ও সাপোর্ট')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('return-policy')} className="hover:text-white transition-colors">
                  {t('Return & Refund Policy', 'রিটার্ন ও রিফান্ড পলিসি')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('privacy-policy')} className="hover:text-white transition-colors">
                  {t('Privacy Policy', 'গোপনীয়তা নীতি')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('terms-conditions')} className="hover:text-white transition-colors">
                  {t('Terms & Conditions', 'শর্তাবলী')}
                </button>
              </li>
            </ul>
          </div>

          {/* WhatsApp Direct Order Box */}
          <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              {t('Order Direct via WhatsApp', 'হোয়াটসঅ্যাপে অর্ডার')}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              {t(
                'No lengthy forms. Simply tap Buy Now on any product or message us directly with your order details.',
                'কোনো ঝামেলা ছাড়া সহজেই যেকোনো পণ্য কিনতে ক্লিক করুন অথবা মেসেজ দিন।'
              )}
            </p>
            <a
              href="https://wa.me/8801745329020"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>01745329020</span>
            </a>
          </div>

        </div>
      </div>

      {/* Copyright Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-slate-800 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div>
          {settings?.footerCopyright || '© Offer Flow — All Rights Reserved'}
        </div>
        <div className="font-medium text-slate-400 flex items-center gap-2">
          <span>{settings?.footerCredit || 'App/Web by A.Y HEJAJ'}</span>
          <span className="inline-block w-1 h-1 rounded-full bg-rose-500"></span>
          <span>Bangladesh</span>
          {onOpenAdminLogin && (
            <>
              <span className="inline-block w-1 h-1 rounded-full bg-slate-600"></span>
              <button
                onClick={onOpenAdminLogin}
                className="text-slate-400 hover:text-white transition-colors"
              >
                {t('Admin Portal', 'অ্যাডমিন')}
              </button>
            </>
          )}
        </div>
      </div>
    </footer>
  );
};
