import React, { useState, useEffect } from 'react';
import { StoreProvider, useStore } from './context/StoreContext.js';
import { Product } from './types.js';

import { Header } from './components/Header.js';
import { Footer } from './components/Footer.js';
import { HomeView } from './components/HomeView.js';
import { ShopView } from './components/ShopView.js';
import { CategoriesView } from './components/CategoriesView.js';
import { ProductDetailsView } from './components/ProductDetailsView.js';
import { WishlistView } from './components/WishlistView.js';
import { MyOrdersView } from './components/MyOrdersView.js';
import { BlogView } from './components/BlogView.js';
import { AboutPage, ContactPage, PolicyPage } from './components/InfoPages.js';
import { CartDrawer } from './components/CartDrawer.js';
import { BuyNowModal } from './components/BuyNowModal.js';
import { UserAuthModal } from './components/UserAuthModal.js';
import { AdminLoginModal } from './components/Admin/AdminLoginModal.js';
import { AdminLayout } from './components/Admin/AdminLayout.js';
import { FloatingWhatsApp } from './components/FloatingWhatsApp.js';

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error?.message || 'Unexpected application error',
    };
  }

  componentDidCatch(error: Error) {
    console.error('Offer Flow ErrorBoundary caught:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 shadow-xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 font-black text-xl flex items-center justify-center mx-auto">
              OF
            </div>
            <h1 className="text-lg font-black text-slate-900">
              Something went wrong
            </h1>
            <p className="text-xs text-slate-500 break-words">
              {this.state.errorMessage}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm"
            >
              Reload Storefront
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function MainContent() {
  const {
    adminUser,
    categories,
    products,
    banners,
    flashSale,
    blogs,
    ads,
    storeLoading,
    toastMessage,
  } = useStore();

  const [currentView, setCurrentView] = useState<string>('home');
  const [viewParam, setViewParam] = useState<string | undefined>(undefined);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [navHistory, setNavHistory] = useState<
    { view: string; param?: string; productId?: string | null }[]
  >([{ view: 'home' }]);
  const [isUserAuthModalOpen, setIsUserAuthModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // Keep selectedProduct always synced with live Firestore products
  const selectedProduct = selectedProductId
    ? products.find((p) => p.id === selectedProductId) || null
    : null;

  useEffect(() => {
    if (currentView === 'product' && !selectedProduct && products.length > 0 && !storeLoading) {
      setSelectedProductId(products[0].id);
    }
  }, [currentView, selectedProduct, products, storeLoading]);

  const navigateTo = (view: string, param?: string, productIdOverride?: string | null) => {
    const nextProductId =
      view === 'product'
        ? productIdOverride !== undefined
          ? productIdOverride
          : selectedProductId
        : null;

    if (view === 'home' && !param) {
      setNavHistory([{ view: 'home' }]);
    } else {
      setNavHistory((prev) => {
        const last = prev[prev.length - 1];
        if (
          last &&
          last.view === view &&
          last.param === param &&
          (last.productId ?? null) === nextProductId
        ) {
          return prev;
        }
        return [...prev, { view, param, productId: nextProductId }];
      });
    }

    setCurrentView(view);
    setViewParam(param);
    if (view !== 'product') {
      setSelectedProductId(null);
    } else if (productIdOverride !== undefined) {
      setSelectedProductId(productIdOverride);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    if (navHistory.length > 1) {
      const nextHistory = navHistory.slice(0, -1);
      const prevEntry = nextHistory[nextHistory.length - 1];
      setNavHistory(nextHistory);
      setCurrentView(prevEntry.view);
      setViewParam(prevEntry.param);
      setSelectedProductId(prevEntry.productId ?? null);
    } else {
      setNavHistory([{ view: 'home' }]);
      setCurrentView('home');
      setViewParam(undefined);
      setSelectedProductId(null);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProduct = (prod: Product) => {
    navigateTo('product', undefined, prod.id);
  };

  // If in admin mode and user is authenticated Admin, show Admin Portal
  if (currentView === 'admin' && adminUser) {
    return <AdminLayout onNavigateStore={() => navigateTo('home')} onBack={handleBack} />;
  }

  const activeProducts = products.filter((p) => p.status !== 'inactive');
  const activeCategories = categories.filter((c) => c.isActive !== false);

  return (
    <div className="min-h-screen w-full overflow-x-clip flex flex-col bg-slate-50/50 text-slate-800 font-sans antialiased selection:bg-rose-500 selection:text-white">
      {/* Global Header */}
      <Header
        currentView={currentView}
        onNavigate={navigateTo}
        onBack={handleBack}
        onOpenUserLogin={() => setIsUserAuthModalOpen(true)}
        onOpenAdminLogin={() => setIsAdminModalOpen(true)}
      />

      {/* Main Viewport Container */}
      <main
        key={`${currentView}-${viewParam || ''}-${selectedProductId || ''}`}
        className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 animate-in fade-in duration-300"
      >
        {storeLoading ? (
          <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 rounded-full border-4 border-rose-500 border-t-transparent animate-spin"></div>
            <p className="text-xs font-bold text-slate-500 tracking-wider uppercase">
              Loading Offer Flow Bangladesh...
            </p>
          </div>
        ) : (
          <>
            {currentView === 'home' && (
              <HomeView
                banners={banners}
                flashSale={flashSale}
                products={activeProducts}
                categories={activeCategories}
                blogs={blogs}
                ads={ads}
                onSelectProduct={handleSelectProduct}
                onNavigate={navigateTo}
              />
            )}

            {(currentView === 'shop' || currentView === 'flash-sale') && (
              <ShopView
                key={`${currentView}-${viewParam || ''}`}
                products={activeProducts}
                categories={activeCategories}
                initialCategory={
                  viewParam?.startsWith('category=')
                    ? decodeURIComponent(viewParam.replace('category=', ''))
                    : undefined
                }
                initialSearch={
                  viewParam?.startsWith('search=')
                    ? decodeURIComponent(viewParam.replace('search=', ''))
                    : undefined
                }
                initialFlashSale={
                  currentView === 'flash-sale' || viewParam?.includes('isFlashSale=true')
                }
                onSelectProduct={handleSelectProduct}
                onNavigate={navigateTo}
              />
            )}

            {currentView === 'categories' && (
              <CategoriesView
                categories={activeCategories}
                products={activeProducts}
                onSelectCategory={(categoryName) =>
                  navigateTo('shop', `category=${encodeURIComponent(categoryName)}`)
                }
              />
            )}

            {currentView === 'product' && selectedProduct && (
              <ProductDetailsView
                product={selectedProduct}
                allProducts={activeProducts}
                onSelectProduct={handleSelectProduct}
                onNavigate={navigateTo}
                onBack={handleBack}
              />
            )}

            {currentView === 'wishlist' && (
              <WishlistView
                products={activeProducts}
                onSelectProduct={handleSelectProduct}
                onNavigate={navigateTo}
              />
            )}

            {currentView === 'orders' && <MyOrdersView onNavigate={navigateTo} />}

            {currentView === 'blog' && <BlogView blogs={blogs} />}
            {currentView === 'about' && <AboutPage />}
            {currentView === 'contact' && <ContactPage />}
            {(currentView === 'returns' || currentView === 'return-policy') && (
              <PolicyPage type="returns" />
            )}
            {(currentView === 'privacy' || currentView === 'privacy-policy') && (
              <PolicyPage type="privacy" />
            )}
            {(currentView === 'terms' || currentView === 'terms-conditions') && (
              <PolicyPage type="terms" />
            )}
          </>
        )}
      </main>

      {/* Global Footer */}
      <Footer
        onNavigate={navigateTo}
        onOpenUserLogin={() => setIsUserAuthModalOpen(true)}
        onOpenAdminLogin={() => setIsAdminModalOpen(true)}
      />

      {/* Slide-out Cart Drawer */}
      <CartDrawer onNavigate={navigateTo} />

      {/* Quick 1-Click Buy Now & Cart Checkout Modal */}
      <BuyNowModal onNavigate={navigateTo} />

      {/* Customer Login & Account Modal */}
      <UserAuthModal
        isOpen={isUserAuthModalOpen}
        onClose={() => setIsUserAuthModalOpen(false)}
        onNavigate={navigateTo}
        onOpenAdminLogin={() => setIsAdminModalOpen(true)}
      />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onSuccess={() => navigateTo('admin')}
      />

      {/* Floating Direct WhatsApp Order Button */}
      <FloatingWhatsApp />

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 bg-slate-900/95 text-white text-xs font-semibold rounded-full shadow-2xl backdrop-blur-md border border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-200">
          {toastMessage}
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppErrorBoundary>
      <StoreProvider>
        <MainContent />
      </StoreProvider>
    </AppErrorBoundary>
  );
}
