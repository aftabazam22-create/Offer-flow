import React, { useState, useEffect } from 'react';
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu,
  X,
  Phone,
  Globe,
  LogOut,
  ShieldCheck,
  Tag,
  MoreVertical,
  Package,
  Layers,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';
import { useStore } from '../context/StoreContext.js';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string, param?: string) => void;
  onBack?: () => void;
  onOpenUserLogin: () => void;
  onOpenAdminLogin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  onBack,
  onOpenUserLogin,
  onOpenAdminLogin,
}) => {
  const {
    settings,
    categories,
    products,
    cartCount,
    wishlistCount,
    myOrderNumbers,
    language,
    setLanguage,
    searchQuery,
    setSearchQuery,
    setIsCartOpen,
    firebaseUser,
    userProfile,
    isAdmin,
    logoutAdmin,
    t,
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [announcementClosed, setAnnouncementClosed] = useState(false);
  const [threeDotOpen, setThreeDotOpen] = useState(false);

  // Close menus on view change
  useEffect(() => {
    setMobileMenuOpen(false);
    setThreeDotOpen(false);
  }, [currentView]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate('shop', `search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const activeCategories = categories.filter((c) => c.isActive !== false);

  const navLinks = [
    { id: 'home', label: 'Home', labelBn: 'হোম' },
    { id: 'shop', label: 'All Products', labelBn: 'সকল পণ্য' },
    { id: 'categories', label: 'Categories', labelBn: 'ক্যাটাগরি' },
    { id: 'flash-sale', label: 'Flash Sale', labelBn: 'ফ্ল্যাশ সেল', badge: 'HOT' },
    {
      id: 'orders',
      label: 'My Orders',
      labelBn: 'আমার অর্ডার',
      count: myOrderNumbers.length > 0 ? myOrderNumbers.length : undefined,
    },
    { id: 'blog', label: 'Blog', labelBn: 'ব্লগ' },
    { id: 'about', label: 'About Us', labelBn: 'আমাদের সম্পর্কে' },
    { id: 'contact', label: 'Contact', labelBn: 'যোগাযোগ' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white shadow-xs border-b border-slate-100 transition-all">
        {/* Top Announcement Bar */}
        {settings?.announcementBarActive && !announcementClosed && (
          <div className="bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 text-white text-[11px] font-medium py-1 px-3">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 overflow-hidden text-center mx-auto truncate">
                <span className="inline-flex items-center gap-1 bg-white/20 px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider shrink-0">
                  <Tag className="w-2.5 h-2.5" /> Offer Flow
                </span>
                <span className="truncate">{settings.announcementBarText}</span>
              </div>
              <button
                type="button"
                onClick={() => setAnnouncementClosed(true)}
                className="text-white/80 hover:text-white p-0.5 rounded transition-colors shrink-0"
                aria-label="Close Announcement"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Main Bar */}
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-13 md:h-16 gap-1 md:gap-4 min-w-0">
            {/* Top-Left Back Arrow (shown on every page after Homepage) + Mobile Menu + Logo */}
            <div className="flex items-center gap-1 sm:gap-2 min-w-0">
              {currentView !== 'home' && onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  className="p-1.5 sm:p-2 rounded-full bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200/80 transition-all duration-200 active:scale-90 shrink-0"
                  aria-label={t('Go Back', 'পিছনে যান')}
                  title={t('Back', 'পিছনে যান')}
                >
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              )}

              {/* Mobile Menu Button */}
              <button
                type="button"
                onClick={() => {
                  setThreeDotOpen(false);
                  setMobileMenuOpen((prev) => !prev);
                }}
                className="md:hidden p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
                aria-label="Toggle Navigation"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              {/* Offer Flow Logo */}
              <div
                onClick={() => onNavigate('home')}
                className="cursor-pointer flex items-center gap-1.5 sm:gap-2.5 select-none min-w-0"
              >
                <div className="w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-gradient-to-br from-rose-600 to-red-600 flex items-center justify-center text-white font-black text-xs sm:text-sm md:text-lg shadow-sm shadow-rose-500/20 border border-rose-400/30 shrink-0">
                  OF
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs sm:text-lg md:text-xl font-extrabold tracking-tight text-slate-900 leading-none truncate">
                    OFFER<span className="text-rose-600">FLOW</span>
                  </span>
                  <span className="text-[9px] font-bold text-rose-600/90 tracking-widest uppercase mt-0.5 hidden sm:block truncate">
                    {settings?.tagline || 'BEST OFFERS, ENDLESS SAVINGS'}
                  </span>
                </div>
              </div>
            </div>

          {/* Search Bar - Desktop */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-xl relative items-center"
          >
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('Search products, brands, gadgets...', 'পণ্য, ব্র্যান্ড, গ্যাজেট খুঁজুন...')}
                className="w-full pl-11 pr-24 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-full text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition-all shadow-inner"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-14 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 text-xs"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-xs transition-colors"
              >
                {t('Search', 'খুঁজুন')}
              </button>
            </div>
          </form>

          {/* Right Action Icons */}
          <div className="flex items-center gap-0.5 sm:gap-1.5 shrink-0">
            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-bold border border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-colors shrink-0"
              title="Toggle Language"
            >
              <Globe className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-600" />
              <span>{language === 'en' ? 'বাং' : 'EN'}</span>
            </button>

            {/* My Orders Quick Icon (Desktop/Tablet) */}
            <button
              onClick={() => onNavigate('orders')}
              className={`relative p-1.5 sm:p-2 rounded-full transition-colors hidden sm:flex ${
                currentView === 'orders'
                  ? 'text-rose-600 bg-rose-50'
                  : 'text-slate-700 hover:text-rose-600 hover:bg-rose-50'
              }`}
              title={t('My Orders', 'আমার অর্ডার')}
            >
              <Package className="w-5 h-5" />
              {myOrderNumbers.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-emerald-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {myOrderNumbers.length}
                </span>
              )}
            </button>

            {/* Wishlist Icon */}
            <button
              onClick={() => onNavigate('wishlist')}
              className="relative p-1.5 sm:p-2 rounded-full text-slate-700 hover:text-rose-600 hover:bg-rose-50 transition-colors hidden sm:flex"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-rose-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Shopping Cart Icon */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-1.5 sm:p-2 rounded-full text-slate-700 hover:text-rose-600 hover:bg-rose-50 transition-colors flex items-center"
              title="Cart"
            >
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-rose-600 text-white text-[9px] sm:text-[10px] font-bold w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* 3-Dot Catalog & Quick Menu Button */}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setThreeDotOpen((prev) => !prev);
              }}
              className={`p-1.5 sm:p-2 rounded-full transition-colors shrink-0 ${
                threeDotOpen
                  ? 'bg-rose-50 text-rose-600'
                  : 'text-slate-700 hover:text-rose-600 hover:bg-slate-100'
              }`}
              title={t('Catalogs & Quick Menu', 'ক্যাটালগ ও দ্রুত মেন্যু')}
              aria-label="Catalogs Menu"
              aria-expanded={threeDotOpen}
            >
              <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Customer Account / Login & Admin Switcher */}
            {isAdmin ? (
              <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => onNavigate(currentView.startsWith('admin') ? 'home' : 'admin')}
                  className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs"
                  title={t('Admin Dashboard', 'ড্যাশবোর্ড')}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">
                    {currentView.startsWith('admin')
                      ? t('Storefront', 'দোকান')
                      : t('Dashboard', 'ড্যাশবোর্ড')}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={onOpenUserLogin}
                  className="p-1.5 sm:p-2 rounded-full text-slate-600 hover:text-rose-600 hover:bg-slate-100 transition-colors hidden sm:flex"
                  title={t('My Account', 'আমার অ্যাকাউন্ট')}
                >
                  <User className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await logoutAdmin();
                    onNavigate('home');
                  }}
                  className="p-1.5 sm:p-2 rounded-full text-slate-400 hover:text-rose-600 transition-colors"
                  title={t('Logout', 'লগআউট')}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : firebaseUser ? (
              <button
                type="button"
                onClick={onOpenUserLogin}
                className="flex items-center gap-1.5 p-1 sm:pl-1.5 sm:pr-3 sm:py-1 rounded-full bg-rose-50 hover:bg-rose-100 border border-rose-200 text-slate-800 text-xs font-bold transition-colors shrink-0"
                title={t('My Account', 'আমার অ্যাকাউন্ট')}
              >
                {firebaseUser.photoURL ? (
                  <img
                    src={firebaseUser.photoURL}
                    alt="User"
                    className="w-6 h-6 rounded-full object-cover border border-white"
                  />
                ) : (
                  <span className="w-6 h-6 rounded-full bg-rose-600 text-white text-[11px] font-black flex items-center justify-center">
                    {(userProfile?.displayName || firebaseUser.displayName || firebaseUser.email || 'U')
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                )}
                <span className="hidden sm:inline max-w-[90px] truncate">
                  {(userProfile?.displayName || firebaseUser.displayName || 'Account').split(' ')[0]}
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenUserLogin}
                className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-slate-900 hover:bg-rose-600 text-white text-[10px] sm:text-xs font-bold transition-colors shadow-xs shrink-0"
                title={t('Customer Login', 'লগইন')}
              >
                <User className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>{t('Login', 'লগইন')}</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-2">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('Search products, gadgets...', 'পণ্য, গ্যাজেট খুঁজুন...')}
              className="w-full pl-8 pr-16 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-rose-500/30"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 bg-rose-600 text-white px-2.5 py-1 rounded-full text-[10px] font-semibold"
            >
              {t('Search', 'খুঁজুন')}
            </button>
          </form>
        </div>

        {/* Desktop Category Navigation Tabs */}
        <div className="hidden md:flex items-center space-x-1 border-t border-slate-100 py-2.5 overflow-x-auto scrollbar-none">
          {navLinks.map((link) => {
            const isActive =
              currentView === link.id || (link.id === 'shop' && currentView === 'category');
            return (
              <button
                key={link.id}
                onClick={() => onNavigate(link.id)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {link.badge && (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
                  </span>
                )}
                <span>{t(link.label, link.labelBn)}</span>
                {link.count !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                      isActive ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {link.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      </header>

      {/* 3-Dot Catalog & Quick Menu Overlay (rendered outside header so never clipped) */}
      {threeDotOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="fixed inset-0 bg-black/25 backdrop-blur-[1px]"
            onClick={() => setThreeDotOpen(false)}
          />
          <div className="fixed right-2.5 sm:right-6 top-14 sm:top-20 w-[calc(100vw-20px)] max-w-xs sm:w-80 bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden z-[60] animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-rose-400" />
                <span className="text-xs font-bold">
                  {t('All Catalogs & Categories', 'সকল ক্যাটালগ ও ক্যাটাগরি')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold bg-white/15 px-2 py-0.5 rounded-full">
                  {activeCategories.length}
                </span>
                <button
                  type="button"
                  onClick={() => setThreeDotOpen(false)}
                  className="p-1 rounded-full text-slate-300 hover:text-white hover:bg-white/10"
                  aria-label="Close Menu"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="max-h-[45vh] overflow-y-auto p-2 space-y-1">
              {activeCategories.length === 0 ? (
                <p className="p-4 text-center text-xs text-slate-400">
                  {t('No active catalogs found', 'কোনো ক্যাটালগ পাওয়া যায়নি')}
                </p>
              ) : (
                activeCategories.map((cat) => {
                  const count = products.filter((p) => p.category === cat.name).length;
                  return (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => {
                        setThreeDotOpen(false);
                        onNavigate('shop', `category=${encodeURIComponent(cat.name)}`);
                      }}
                      className="w-full flex items-center justify-between gap-2.5 p-2 rounded-2xl hover:bg-rose-50/70 transition-colors text-left group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={
                            cat.image ||
                            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&q=70'
                          }
                          alt={cat.name}
                          className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-slate-800 group-hover:text-rose-600 block truncate">
                            {cat.name}
                          </span>
                          {cat.nameBn && (
                            <span className="text-[10px] text-slate-400 block truncate">
                              {cat.nameBn}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          {count}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-rose-600" />
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Quick Navigator Links inside 3-dot menu */}
            <div className="px-2.5 py-2 border-t border-slate-100 bg-white flex flex-wrap gap-1.5">
              {[
                { id: 'home', label: t('Home', 'হোম') },
                { id: 'shop', label: t('All Products', 'সব পণ্য') },
                { id: 'flash-sale', label: t('Flash Sale', 'ফ্ল্যাশ সেল') },
                { id: 'wishlist', label: t('Wishlist', 'উইশলিস্ট') },
                { id: 'blog', label: t('Blog', 'ব্লগ') },
              ].map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => {
                    setThreeDotOpen(false);
                    onNavigate(item.id);
                  }}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors ${
                    currentView === item.id
                      ? 'bg-rose-600 text-white border-rose-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-rose-300'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="p-2.5 border-t border-slate-100 bg-slate-50/80 space-y-1.5">
              <button
                type="button"
                onClick={() => {
                  setThreeDotOpen(false);
                  onOpenUserLogin();
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white border border-slate-200 hover:border-rose-300 text-xs font-bold text-slate-800 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4 text-rose-600" />
                  <span>
                    {firebaseUser
                      ? t('My Account & Profile', 'আমার অ্যাকাউন্ট ও প্রোফাইল')
                      : t('Customer Login / Register', 'কাস্টমার লগইন / রেজিস্টার')}
                  </span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setThreeDotOpen(false);
                  onNavigate('orders');
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white border border-slate-200 hover:border-rose-300 text-xs font-bold text-slate-800 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-rose-600" />
                  <span>{t('My Orders & Status', 'আমার অর্ডার ও স্ট্যাটাস')}</span>
                </span>
                {myOrderNumbers.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                    {myOrderNumbers.length}
                  </span>
                )}
              </button>

              <div className="flex items-center justify-between px-1 pt-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setThreeDotOpen(false);
                    onNavigate('categories');
                  }}
                  className="py-1.5 text-[11px] font-bold text-rose-600 hover:underline"
                >
                  {t('All Catalogs →', 'সব ক্যাটালগ →')}
                </button>

                {!isAdmin ? (
                  <button
                    type="button"
                    onClick={() => {
                      setThreeDotOpen(false);
                      onOpenAdminLogin();
                    }}
                    className="py-1.5 text-[11px] font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
                  >
                    <ShieldCheck className="w-3 h-3" />
                    <span>{t('Admin Login', 'অ্যাডমিন')}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setThreeDotOpen(false);
                      onNavigate('admin');
                    }}
                    className="py-1.5 text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1"
                  >
                    <ShieldCheck className="w-3 h-3" />
                    <span>{t('Admin Dashboard', 'ড্যাশবোর্ড')}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Drawer Menu (rendered outside header so fixed inset-0 fills screen reliably) */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-[1px]"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10 w-[85vw] max-w-xs h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-left duration-200">
            {/* Drawer Header */}
            <div className="px-4 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-rose-600 flex items-center justify-center font-black text-xs">
                  OF
                </div>
                <span className="font-extrabold text-sm tracking-tight">
                  OFFER<span className="text-rose-400">FLOW</span>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10"
                aria-label="Close Navigation"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="space-y-1">
                <p className="text-[11px] font-bold uppercase text-slate-400 px-3 tracking-wider">
                  {t('Navigation', 'মেন্যু')}
                </p>
                {navLinks.map((link) => (
                  <button
                    type="button"
                    key={link.id}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onNavigate(link.id);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      currentView === link.id
                        ? 'bg-rose-50 text-rose-600'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{t(link.label, link.labelBn)}</span>
                    {link.badge && (
                      <span className="text-[10px] font-bold bg-amber-500 text-white px-2 py-0.5 rounded-full">
                        {link.badge}
                      </span>
                    )}
                    {link.count !== undefined && (
                      <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                        {link.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Catalogs section inside mobile menu */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <p className="text-[11px] font-bold uppercase text-slate-400 px-3 tracking-wider">
                  {t('Product Catalogs', 'পণ্য ক্যাটালগ')}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {activeCategories.map((cat) => (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onNavigate('shop', `category=${encodeURIComponent(cat.name)}`);
                      }}
                      className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 hover:bg-rose-50 border border-slate-100 text-left"
                    >
                      <img
                        src={
                          cat.image ||
                          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&q=70'
                        }
                        alt={cat.name}
                        className="w-8 h-8 rounded-lg object-cover shrink-0"
                      />
                      <span className="text-[11px] font-bold text-slate-800 line-clamp-1">
                        {cat.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenUserLogin();
                  }}
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-slate-800"
                >
                  <User className="w-4 h-4 text-rose-400" />
                  <span>
                    {firebaseUser
                      ? t('My Account & Saved Address', 'আমার অ্যাকাউন্ট ও ঠিকানা')
                      : t('Customer Login / Sign Up', 'কাস্টমার লগইন / অ্যাকাউন্ট খুলুন')}
                  </span>
                </button>

                <a
                  href={`https://wa.me/8801745329020`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-emerald-700"
                >
                  <Phone className="w-4 h-4" />
                  <span>
                    {t('Order via WhatsApp (01745329020)', 'হোয়াটসঅ্যাপে অর্ডার করুন (০১৭৪৫৩২৯০২০)')}
                  </span>
                </a>

                {!isAdmin ? (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAdminLogin();
                    }}
                    className="flex items-center justify-center gap-2 w-full py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{t('Admin Portal Login', 'অ্যাডমিন লগইন')}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onNavigate('admin');
                    }}
                    className="flex items-center justify-center gap-2 w-full py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{t('Open Admin Dashboard', 'অ্যাডমিন ড্যাশবোর্ড')}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
