import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import {
  Product,
  Category,
  Banner,
  Advertisement,
  BlogPost,
  FlashSaleConfig,
  OfferCampaign,
  CartItem,
  SiteSettings,
  UserProfile,
} from '../types.js';
import {
  api,
  checkIsFirebaseAdmin,
  getSavedMyOrderNumbers,
  saveMyOrderNumber,
} from '../services/api.js';
import { auth } from '../firebase.js';
import {
  SEED_CATEGORIES,
  SEED_PRODUCTS,
  SEED_BANNERS,
  SEED_ADS,
  SEED_BLOGS,
  SEED_FLASH_SALE,
  SEED_SETTINGS,
} from '../data/seedData.js';

export interface CheckoutPayload {
  items: CartItem[];
  couponCode?: string;
  discount?: number;
  fromCart?: boolean;
}

export interface AdminUserInfo {
  uid: string;
  email: string;
  role: string;
  name: string;
  photoURL?: string;
}

interface StoreContextType {
  cart: CartItem[];
  wishlist: string[];
  settings: SiteSettings;
  categories: Category[];
  products: Product[];
  banners: Banner[];
  ads: Advertisement[];
  blogs: BlogPost[];
  flashSale: FlashSaleConfig;
  offers: OfferCampaign[];
  storeLoading: boolean;
  isUsingSeedProducts: boolean;
  language: 'en' | 'bn';
  setLanguage: (lang: 'en' | 'bn') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  firebaseUser: FirebaseUser | null;
  authReady: boolean;
  userProfile: UserProfile | null;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  isAdmin: boolean;
  adminUser: AdminUserInfo | null;
  setAdminUser: (u: AdminUserInfo | null) => void;
  logoutAdmin: () => Promise<void>;
  logoutUser: () => Promise<void>;
  myOrderNumbers: string[];
  addMyOrderNumber: (orderNumber: string) => void;
  cartCount: number;
  wishlistCount: number;
  cartCoupon: { code: string; discount: number } | null;
  setCartCoupon: (coupon: { code: string; discount: number } | null) => void;
  addToCart: (product: Product, quantity?: number, selectedColor?: string) => void;
  removeFromCart: (productId: string, selectedColor?: string) => void;
  updateCartQuantity: (productId: string, quantity: number, selectedColor?: string) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isBuyNowModalOpen: boolean;
  setIsBuyNowModalOpen: (open: boolean) => void;
  checkoutPayload: CheckoutPayload | null;
  openBuyNow: (product: Product, quantity?: number, selectedColor?: string) => void;
  openCartCheckout: (items: CartItem[], couponCode?: string, discount?: number) => void;
  formatPrice: (amount: number) => string;
  t: (en: string, bn: string) => string;
  refreshSettings: () => Promise<void>;
  refreshCategories: () => Promise<void>;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('offer_flow_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('offer_flow_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [myOrderNumbers, setMyOrderNumbers] = useState<string[]>(() => getSavedMyOrderNumbers());

  const [language, setLanguage] = useState<'en' | 'bn'>(() => {
    try {
      const saved = localStorage.getItem('offer_flow_lang');
      return (saved as 'en' | 'bn') || 'en';
    } catch {
      return 'en';
    }
  });

  const [settings, setSettings] = useState<SiteSettings>(SEED_SETTINGS);
  const [categories, setCategories] = useState<Category[]>(SEED_CATEGORIES);
  const [products, setProducts] = useState<Product[]>(SEED_PRODUCTS);
  const [banners, setBanners] = useState<Banner[]>(SEED_BANNERS);
  const [ads, setAds] = useState<Advertisement[]>(SEED_ADS);
  const [blogs, setBlogs] = useState<BlogPost[]>(SEED_BLOGS);
  const [flashSale, setFlashSale] = useState<FlashSaleConfig>(SEED_FLASH_SALE);
  const [offers, setOffers] = useState<OfferCampaign[]>([]);
  const [storeLoading, setStoreLoading] = useState(true);
  const [isUsingSeedProducts, setIsUsingSeedProducts] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUserInfo | null>(null);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isBuyNowModalOpen, setIsBuyNowModalOpen] = useState(false);
  const [checkoutPayload, setCheckoutPayload] = useState<CheckoutPayload | null>(null);
  const [cartCoupon, setCartCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const seededOnceRef = useRef(false);

  // Sync Cart to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('offer_flow_cart', JSON.stringify(cart));
    } catch {}
  }, [cart]);

  // Sync Wishlist to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('offer_flow_wishlist', JSON.stringify(wishlist));
    } catch {}
  }, [wishlist]);

  // Sync Language
  useEffect(() => {
    try {
      localStorage.setItem('offer_flow_lang', language);
    } catch {}
  }, [language]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Real-time Firestore subscriptions for storefront & admin
  useEffect(() => {
    let settled = false;
    const markSettled = () => {
      if (!settled) {
        settled = true;
        setStoreLoading(false);
      }
    };

    const unsubProducts = api.subscribeProducts(
      (list, fromSeed) => {
        setProducts(list);
        setIsUsingSeedProducts(fromSeed);
        markSettled();
      },
      () => markSettled()
    );

    const unsubCategories = api.subscribeCategories((list) => {
      setCategories(list);
    });
    const unsubBanners = api.subscribeBanners((list) => {
      setBanners(list);
    });
    const unsubAds = api.subscribeAdvertisements((list) => {
      setAds(list);
    });
    const unsubBlogs = api.subscribeBlogs((list) => {
      setBlogs(list);
    });
    const unsubFlashSale = api.subscribeFlashSale((fs) => {
      setFlashSale(fs);
    });
    const unsubOffers = api.subscribeOffers((list) => {
      setOffers(list);
    });
    const unsubSettings = api.subscribeSettings((s) => {
      setSettings(s);
    });

    const fallbackTimer = window.setTimeout(markSettled, 2500);

    return () => {
      window.clearTimeout(fallbackTimer);
      unsubProducts();
      unsubCategories();
      unsubBanners();
      unsubAds();
      unsubBlogs();
      unsubFlashSale();
      unsubOffers();
      unsubSettings();
    };
  }, []);

  // Firebase Auth listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        const authorized = await checkIsFirebaseAdmin(user.uid, user.email, user.emailVerified);
        if (authorized) {
          setAdminUser({
            uid: user.uid,
            email: user.email || '',
            role: 'Super Admin',
            name: user.displayName || user.email?.split('@')[0] || 'Admin',
            photoURL: user.photoURL || undefined,
          });
          if (!seededOnceRef.current) {
            seededOnceRef.current = true;
            api.seedDefaultsToFirestore(false).catch((err) => {
              console.warn('Auto-seed check skipped/failed:', err);
            });
          }
        } else {
          setAdminUser(null);
        }
      } else {
        setAdminUser(null);
        setUserProfile(null);
      }
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  // Subscribe to customer profile only when auth is ready and user is signed in
  useEffect(() => {
    if (!authReady || !firebaseUser) {
      setUserProfile(null);
      return;
    }

    const unsub = api.subscribeUserProfile(firebaseUser.uid, (profile) => {
      if (profile) {
        setUserProfile(profile);
      } else if (firebaseUser.emailVerified || firebaseUser.phoneNumber) {
        // Initialize profile doc cleanly for verified email or phone users
        api
          .saveUserProfile(firebaseUser.uid, {
            displayName:
              firebaseUser.displayName ||
              firebaseUser.email?.split('@')[0] ||
              firebaseUser.phoneNumber ||
              'Customer',
            email: firebaseUser.email || '',
            phone: firebaseUser.phoneNumber
              ? firebaseUser.phoneNumber.replace(/^\+88/, '')
              : '',
            photoURL: firebaseUser.photoURL || '',
          })
          .then((created) => setUserProfile(created))
          .catch((err) => console.warn('Profile auto-init skipped:', err));
      } else {
        setUserProfile(null);
      }
    });

    return () => unsub();
  }, [authReady, firebaseUser?.uid, firebaseUser?.emailVerified, firebaseUser?.phoneNumber]);

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!firebaseUser) return;
    const saved = await api.saveUserProfile(firebaseUser.uid, data);
    setUserProfile(saved);
  };

  const logoutAdmin = async () => {
    await api.logout();
    setAdminUser(null);
    setUserProfile(null);
  };

  const logoutUser = async () => {
    await api.logout();
    setAdminUser(null);
    setUserProfile(null);
  };

  const addMyOrderNumber = (orderNumber: string) => {
    const updated = saveMyOrderNumber(orderNumber);
    setMyOrderNumbers(updated);
  };

  const refreshSettings = async () => {
    try {
      const data = await api.getSettings();
      setSettings(data);
    } catch (e) {
      console.error('Failed to load settings', e);
    }
  };

  const refreshCategories = async () => {
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (e) {
      console.error('Failed to load categories', e);
    }
  };

  const addToCart = (product: Product, quantity = 1, selectedColor?: string) => {
    const resolvedColor = selectedColor || (product.colors && product.colors.length > 0 ? product.colors[0] : undefined);
    setCart((prev) => {
      const existing = prev.find(
        (item) =>
          item.product.id === product.id &&
          (item.selectedColor || '') === (resolvedColor || '')
      );
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id &&
          (item.selectedColor || '') === (resolvedColor || '')
            ? { ...item, quantity: Math.min(product.stock, item.quantity + quantity) }
            : item
        );
      }
      return [
        ...prev,
        {
          product,
          quantity: Math.min(product.stock, quantity),
          selectedColor: resolvedColor,
        },
      ];
    });
    const colorSuffix = resolvedColor ? ` (${resolvedColor})` : '';
    showToast(
      language === 'bn'
        ? `${product.name}${colorSuffix} কার্টে যোগ করা হয়েছে`
        : `Added ${product.name}${colorSuffix} to cart`
    );
  };

  const removeFromCart = (productId: string, selectedColor?: string) => {
    setCart((prev) =>
      prev.filter((item) => {
        if (item.product.id !== productId) return true;
        if (selectedColor === undefined) return false;
        return (item.selectedColor || '') !== (selectedColor || '');
      })
    );
  };

  const updateCartQuantity = (productId: string, quantity: number, selectedColor?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, selectedColor);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        const match =
          item.product.id === productId &&
          (selectedColor === undefined || (item.selectedColor || '') === (selectedColor || ''));
        return match ? { ...item, quantity } : item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    setCartCoupon(null);
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast(language === 'bn' ? 'উইশলিস্ট থেকে সরানো হয়েছে' : 'Removed from wishlist');
        return prev.filter((id) => id !== productId);
      } else {
        showToast(language === 'bn' ? 'উইশলিস্টে যুক্ত করা হয়েছে' : 'Added to wishlist');
        return [...prev, productId];
      }
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  const openBuyNow = (product: Product, quantity = 1, selectedColor?: string) => {
    const resolvedColor =
      selectedColor || (product.colors && product.colors.length > 0 ? product.colors[0] : undefined);
    setCheckoutPayload({
      items: [{ product, quantity, selectedColor: resolvedColor }],
      fromCart: false,
    });
    setIsBuyNowModalOpen(true);
  };

  const openCartCheckout = (items: CartItem[], couponCode?: string, discount = 0) => {
    setCheckoutPayload({
      items,
      couponCode,
      discount,
      fromCart: true,
    });
    setIsBuyNowModalOpen(true);
  };

  const formatPrice = (amount: number) => {
    const symbol = settings?.currencySymbol || '৳';
    return `${symbol}${amount.toLocaleString('en-IN')}`;
  };

  const t = (en: string, bn: string) => (language === 'bn' ? bn : en);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const wishlistCount = wishlist.length;

  return (
    <StoreContext.Provider
      value={{
        cart,
        wishlist,
        settings,
        categories,
        products,
        banners,
        ads,
        blogs,
        flashSale,
        offers,
        storeLoading,
        isUsingSeedProducts,
        language,
        setLanguage,
        searchQuery,
        setSearchQuery,
        firebaseUser,
        authReady,
        userProfile,
        updateUserProfile,
        isAdmin: !!adminUser,
        adminUser,
        setAdminUser,
        logoutAdmin,
        logoutUser,
        myOrderNumbers,
        addMyOrderNumber,
        cartCount,
        wishlistCount,
        cartCoupon,
        setCartCoupon,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        toggleWishlist,
        isInWishlist,
        isCartOpen,
        setIsCartOpen,
        isBuyNowModalOpen,
        setIsBuyNowModalOpen,
        checkoutPayload,
        openBuyNow,
        openCartCheckout,
        formatPrice,
        t,
        refreshSettings,
        refreshCategories,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
