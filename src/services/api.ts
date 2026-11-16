import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  writeBatch,
  serverTimestamp,
  Timestamp,
  Unsubscribe,
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import {
  auth,
  db,
  ADMIN_UID,
  ADMIN_EMAIL,
  OperationType,
  handleFirestoreError,
} from '../firebase.js';
import {
  Product,
  Category,
  Banner,
  Advertisement,
  Order,
  OrderTracking,
  Customer,
  Review,
  BlogPost,
  Coupon,
  FlashSaleConfig,
  OfferCampaign,
  OfferCampaignTheme,
  SiteSettings,
  UserProfile,
} from '../types.js';
import {
  SEED_CATEGORIES,
  SEED_PRODUCTS,
  SEED_BANNERS,
  SEED_ADS,
  SEED_BLOGS,
  SEED_COUPONS,
  SEED_FLASH_SALE,
  SEED_SETTINGS,
} from '../data/seedData.js';
import { shrinkImageDataUrl } from '../utils/imageUtils.js';

const MY_ORDERS_STORAGE_KEY = 'offer_flow_my_orders';

function toIsoString(val: unknown): string {
  if (!val) return new Date().toISOString();
  if (typeof val === 'string') return val;
  if (val instanceof Timestamp) return val.toDate().toISOString();
  if (typeof (val as { toDate?: () => Date }).toDate === 'function') {
    return (val as { toDate: () => Date }).toDate().toISOString();
  }
  return new Date().toISOString();
}

function stripUndefined<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      out[key] = value;
    }
  }
  return out;
}

function makeId(prefix: string): string {
  const rand = Math.random().toString(36).substring(2, 8);
  return `${prefix}-${Date.now()}-${rand}`.replace(/[^a-zA-Z0-9_-]/g, '-');
}

function normalizeProduct(raw: Record<string, unknown>, id: string): Product {
  const price = Number(raw.price) || 0;
  const discountPrice = Number(raw.discountPrice ?? price) || 0;
  const discountPercentage =
    typeof raw.discountPercentage === 'number'
      ? raw.discountPercentage
      : price > discountPrice && price > 0
      ? Math.round(((price - discountPrice) / price) * 100)
      : 0;

  return {
    id: (raw.id as string) || id,
    name: (raw.name as string) || 'Product',
    nameBn: (raw.nameBn as string) || '',
    images: Array.isArray(raw.images) && raw.images.length > 0 ? (raw.images as string[]) : [],
    description: (raw.description as string) || '',
    shortDescription: (raw.shortDescription as string) || '',
    price,
    discountPrice,
    discountPercentage,
    stock: Number(raw.stock) || 0,
    sku: (raw.sku as string) || `OF-${id.slice(-4).toUpperCase()}`,
    category: (raw.category as string) || 'Gadgets & Tech',
    subcategory: (raw.subcategory as string) || '',
    brand: (raw.brand as string) || 'Offer Flow',
    tags: Array.isArray(raw.tags) ? (raw.tags as string[]) : [],
    colors: Array.isArray(raw.colors) ? (raw.colors as string[]).filter((c) => typeof c === 'string' && c.trim()) : [],
    isFeatured: Boolean(raw.isFeatured),
    isNewArrival: Boolean(raw.isNewArrival),
    isFlashSale: Boolean(raw.isFlashSale),
    specifications: Array.isArray(raw.specifications)
      ? (raw.specifications as { label: string; value: string }[])
      : [],
    videoUrl: (raw.videoUrl as string) || '',
    deliveryInfo: (raw.deliveryInfo as string) || '',
    returnInfo: (raw.returnInfo as string) || '',
    rating: Number(raw.rating ?? 4.8),
    reviewCount: Number(raw.reviewCount ?? 0),
    status: raw.status === 'inactive' ? 'inactive' : 'active',
    createdAt: toIsoString(raw.createdAt),
  };
}

function normalizeCategory(raw: Record<string, unknown>, id: string): Category {
  return {
    id: (raw.id as string) || id,
    name: (raw.name as string) || 'Category',
    nameBn: (raw.nameBn as string) || '',
    slug: (raw.slug as string) || id,
    image: (raw.image as string) || '',
    icon: (raw.icon as string) || '',
    isActive: raw.isActive !== false,
    order: Number(raw.order ?? 1),
  };
}

function normalizeBanner(raw: Record<string, unknown>, id: string): Banner {
  return {
    id: (raw.id as string) || id,
    title: (raw.title as string) || '',
    subtitle: (raw.subtitle as string) || '',
    badge: (raw.badge as string) || '',
    image: (raw.image as string) || '',
    buttonText: (raw.buttonText as string) || 'Shop Now',
    link: (raw.link as string) || '/shop',
    placement: (raw.placement as Banner['placement']) || 'homepage_hero',
    showOnHomepage: raw.showOnHomepage !== false,
    isActive: raw.isActive !== false,
    order: Number(raw.order ?? 1),
  };
}

function normalizeAd(raw: Record<string, unknown>, id: string): Advertisement {
  return {
    id: (raw.id as string) || id,
    title: (raw.title as string) || '',
    subtitle: (raw.subtitle as string) || '',
    image: (raw.image as string) || '',
    buttonText: (raw.buttonText as string) || 'Shop Now',
    targetUrl: (raw.targetUrl as string) || '/shop',
    placement: (raw.placement as Advertisement['placement']) || 'promo_section',
    showOnHomepage: raw.showOnHomepage !== false,
    isActive: raw.isActive !== false,
  };
}

function normalizeBlog(raw: Record<string, unknown>, id: string): BlogPost {
  return {
    id: (raw.id as string) || id,
    title: (raw.title as string) || '',
    slug: (raw.slug as string) || id,
    excerpt: (raw.excerpt as string) || '',
    content: (raw.content as string) || '',
    featuredImage: (raw.featuredImage as string) || '',
    author: (raw.author as string) || 'A.Y HEJAJ',
    category: (raw.category as string) || 'Guides',
    tags: Array.isArray(raw.tags) ? (raw.tags as string[]) : [],
    isPublished: raw.isPublished !== false,
    publishedAt: toIsoString(raw.publishedAt || raw.createdAt),
    seoTitle: (raw.seoTitle as string) || '',
    seoDescription: (raw.seoDescription as string) || '',
  };
}

function normalizeCoupon(raw: Record<string, unknown>, id: string): Coupon {
  return {
    id: (raw.id as string) || id,
    code: ((raw.code as string) || '').toUpperCase(),
    type: raw.type === 'fixed' ? 'fixed' : 'percentage',
    value: Number(raw.value) || 0,
    minOrderValue: Number(raw.minOrderValue) || 0,
    maxDiscount: Number(raw.maxDiscount) || 0,
    usageLimit: Number(raw.usageLimit ?? 500),
    timesUsed: Number(raw.timesUsed ?? 0),
    isActive: raw.isActive !== false,
    expiresAt: (raw.expiresAt as string) || '',
  };
}

function normalizeOrder(raw: Record<string, unknown>, id: string): Order {
  return {
    id: (raw.id as string) || id,
    orderNumber: (raw.orderNumber as string) || id,
    userId: (raw.userId as string) || '',
    customerName: (raw.customerName as string) || '',
    phone: (raw.phone as string) || '',
    email: (raw.email as string) || '',
    address: (raw.address as string) || '',
    district: (raw.district as string) || 'Dhaka',
    area: (raw.area as string) || '',
    items: Array.isArray(raw.items) ? (raw.items as Order['items']) : [],
    subtotal: Number(raw.subtotal) || 0,
    discount: Number(raw.discount) || 0,
    deliveryFee: Number(raw.deliveryFee) || 0,
    total: Number(raw.total) || 0,
    couponCode: (raw.couponCode as string) || '',
    status: (raw.status as Order['status']) || 'pending',
    paymentMethod: raw.paymentMethod === 'whatsapp_cod' ? 'whatsapp_cod' : 'cash_on_delivery',
    internalNotes: (raw.internalNotes as string) || '',
    customerNote: (raw.customerNote as string) || '',
    statusNote: (raw.statusNote as string) || '',
    createdAt: toIsoString(raw.createdAt),
    updatedAt: toIsoString(raw.updatedAt),
  };
}

function normalizeOrderTracking(raw: Record<string, unknown>): OrderTracking {
  return {
    orderNumber: (raw.orderNumber as string) || '',
    orderId: (raw.orderId as string) || '',
    status: (raw.status as OrderTracking['status']) || 'pending',
    statusNote: (raw.statusNote as string) || '',
    items: Array.isArray(raw.items) ? (raw.items as OrderTracking['items']) : [],
    subtotal: Number(raw.subtotal) || 0,
    discount: Number(raw.discount) || 0,
    deliveryFee: Number(raw.deliveryFee) || 0,
    total: Number(raw.total) || 0,
    district: (raw.district as string) || 'Dhaka',
    paymentMethod: raw.paymentMethod === 'whatsapp_cod' ? 'whatsapp_cod' : 'cash_on_delivery',
    phoneLast4: (raw.phoneLast4 as string) || '',
    customerNote: (raw.customerNote as string) || '',
    createdAt: toIsoString(raw.createdAt),
    updatedAt: toIsoString(raw.updatedAt),
  };
}

function normalizeReview(raw: Record<string, unknown>, id: string): Review {
  return {
    id: (raw.id as string) || id,
    productId: (raw.productId as string) || '',
    productName: (raw.productName as string) || '',
    customerName: (raw.customerName as string) || 'Customer',
    rating: Number(raw.rating) || 5,
    comment: (raw.comment as string) || '',
    image: (raw.image as string) || '',
    isApproved: raw.isApproved !== false,
    createdAt: toIsoString(raw.createdAt),
  };
}

function normalizeOffer(raw: Record<string, unknown>, id: string): OfferCampaign {
  const allowedThemes: OfferCampaignTheme[] = ['crimson', 'obsidian', 'emerald', 'amber', 'indigo'];
  const rawTheme = raw.theme as OfferCampaignTheme;
  const theme: OfferCampaignTheme = allowedThemes.includes(rawTheme) ? rawTheme : 'crimson';
  return {
    id: (raw.id as string) || id,
    title: (raw.title as string) || 'Special Offer',
    titleBn: (raw.titleBn as string) || '',
    subtitle: (raw.subtitle as string) || '',
    discountHighlight: (raw.discountHighlight as string) || 'LIMITED OFFER',
    theme,
    endTime: (raw.endTime as string) || new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
    isActive: raw.isActive !== false,
    order: Number(raw.order ?? 1),
    productIds: Array.isArray(raw.productIds)
      ? (raw.productIds as unknown[]).filter((x): x is string => typeof x === 'string' && x.trim().length > 0).slice(0, 100)
      : [],
    createdAt: toIsoString(raw.createdAt),
    updatedAt: toIsoString(raw.updatedAt),
  };
}

export function getSavedMyOrderNumbers(): string[] {
  try {
    const raw = localStorage.getItem(MY_ORDERS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export function saveMyOrderNumber(orderNumber: string): string[] {
  const existing = getSavedMyOrderNumbers();
  const clean = orderNumber.trim().toUpperCase();
  if (!clean) return existing;
  const updated = [clean, ...existing.filter((x) => x !== clean)].slice(0, 30);
  try {
    localStorage.setItem(MY_ORDERS_STORAGE_KEY, JSON.stringify(updated));
  } catch {}
  return updated;
}

export async function checkIsFirebaseAdmin(uid?: string, email?: string | null, emailVerified?: boolean): Promise<boolean> {
  if (!uid) return false;
  if (uid === ADMIN_UID) return true;
  if (email && email.toLowerCase() === ADMIN_EMAIL.toLowerCase() && emailVerified) return true;
  try {
    const snap = await getDoc(doc(db, 'admins', uid));
    return snap.exists();
  } catch {
    return false;
  }
}

export const api = {
  // Auth & User Profiles
  async logout() {
    await signOut(auth);
    return { success: true };
  },

  async getUserProfile(uid: string): Promise<UserProfile | null> {
    if (!uid || !/^[a-zA-Z0-9_-]+$/.test(uid)) return null;
    try {
      const snap = await getDoc(doc(db, 'users', uid));
      if (!snap.exists()) return null;
      const d = snap.data();
      return {
        uid: (d.uid as string) || uid,
        displayName: (d.displayName as string) || 'Customer',
        email: (d.email as string) || '',
        phone: (d.phone as string) || '',
        district: (d.district as string) || 'Dhaka',
        area: (d.area as string) || '',
        address: (d.address as string) || '',
        photoURL: (d.photoURL as string) || '',
        createdAt: toIsoString(d.createdAt),
        updatedAt: toIsoString(d.updatedAt),
      };
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, `users/${uid}`);
    }
  },

  subscribeUserProfile(
    uid: string,
    onData: (profile: UserProfile | null) => void
  ): Unsubscribe {
    return onSnapshot(
      doc(db, 'users', uid),
      (snap) => {
        if (!snap.exists()) {
          onData(null);
          return;
        }
        const d = snap.data();
        onData({
          uid: (d.uid as string) || uid,
          displayName: (d.displayName as string) || 'Customer',
          email: (d.email as string) || '',
          phone: (d.phone as string) || '',
          district: (d.district as string) || 'Dhaka',
          area: (d.area as string) || '',
          address: (d.address as string) || '',
          photoURL: (d.photoURL as string) || '',
          createdAt: toIsoString(d.createdAt),
          updatedAt: toIsoString(d.updatedAt),
        });
      },
      (err) => console.error('User profile snapshot error:', err)
    );
  },

  async saveUserProfile(
    uid: string,
    data: Partial<UserProfile>
  ): Promise<UserProfile> {
    const cleanUid = uid.trim().slice(0, 128);
    const ref = doc(db, 'users', cleanUid);
    const displayName = (data.displayName || auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0] || 'Customer')
      .trim()
      .slice(0, 150);

    try {
      const snap = await getDoc(ref);
      const baseFields = stripUndefined({
        uid: cleanUid,
        displayName,
        email: (data.email ?? auth.currentUser?.email ?? '').trim().slice(0, 200) || undefined,
        phone: data.phone !== undefined ? data.phone.trim().slice(0, 30) : undefined,
        district: data.district !== undefined ? data.district.trim().slice(0, 100) : undefined,
        area: data.area !== undefined ? data.area.trim().slice(0, 100) : undefined,
        address: data.address !== undefined ? data.address.trim().slice(0, 500) : undefined,
        photoURL: (data.photoURL ?? auth.currentUser?.photoURL ?? '').trim().slice(0, 1000) || undefined,
      });

      if (!snap.exists()) {
        const createPayload = {
          ...baseFields,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        await setDoc(ref, createPayload);
        return {
          uid: cleanUid,
          displayName,
          email: baseFields.email as string | undefined,
          phone: baseFields.phone as string | undefined,
          district: baseFields.district as string | undefined,
          area: baseFields.area as string | undefined,
          address: baseFields.address as string | undefined,
          photoURL: baseFields.photoURL as string | undefined,
        };
      } else {
        const existingData = snap.data();
        const updatePayload = stripUndefined({
          uid: cleanUid,
          displayName,
          email: (data.email ?? existingData.email ?? auth.currentUser?.email ?? '').trim().slice(0, 200) || undefined,
          phone: data.phone !== undefined ? data.phone.trim().slice(0, 30) : (existingData.phone as string | undefined),
          district: data.district !== undefined ? data.district.trim().slice(0, 100) : (existingData.district as string | undefined),
          area: data.area !== undefined ? data.area.trim().slice(0, 100) : (existingData.area as string | undefined),
          address: data.address !== undefined ? data.address.trim().slice(0, 500) : (existingData.address as string | undefined),
          photoURL: (data.photoURL ?? existingData.photoURL ?? auth.currentUser?.photoURL ?? '').trim().slice(0, 1000) || undefined,
          createdAt: existingData.createdAt,
          updatedAt: serverTimestamp(),
        });
        await updateDoc(ref, updatePayload);
        return {
          uid: cleanUid,
          displayName,
          email: updatePayload.email as string | undefined,
          phone: updatePayload.phone as string | undefined,
          district: updatePayload.district as string | undefined,
          area: updatePayload.area as string | undefined,
          address: updatePayload.address as string | undefined,
          photoURL: updatePayload.photoURL as string | undefined,
        };
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `users/${cleanUid}`);
    }
  },

  // Products
  async getProducts(params?: {
    category?: string;
    search?: string;
    tag?: string;
    isFlashSale?: boolean;
    isFeatured?: boolean;
  }): Promise<Product[]> {
    try {
      const snap = await getDocs(collection(db, 'products'));
      let list = snap.docs.map((d) => normalizeProduct(d.data(), d.id));
      if (list.length === 0) {
        list = [...SEED_PRODUCTS];
      }
      if (params?.category) {
        list = list.filter((p) => p.category === params.category);
      }
      if (params?.isFlashSale) {
        list = list.filter((p) => p.isFlashSale);
      }
      if (params?.isFeatured) {
        list = list.filter((p) => p.isFeatured);
      }
      if (params?.tag) {
        list = list.filter((p) => p.tags.includes(params.tag!));
      }
      if (params?.search) {
        const q = params.search.toLowerCase();
        list = list.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.sku.toLowerCase().includes(q)
        );
      }
      return list.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, 'products');
    }
  },

  subscribeProducts(
    onData: (products: Product[], isFromSeed: boolean) => void,
    onError?: (err: Error) => void
  ): Unsubscribe {
    return onSnapshot(
      collection(db, 'products'),
      (snap) => {
        if (snap.empty) {
          onData([...SEED_PRODUCTS], true);
          return;
        }
        const list = snap.docs
          .map((d) => normalizeProduct(d.data(), d.id))
          .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
        onData(list, false);
      },
      (error) => {
        console.error('Products snapshot error:', error);
        if (onError) onError(error);
      }
    );
  },

  async createProduct(data: Partial<Product>): Promise<Product> {
    const id = (data.id && /^[a-zA-Z0-9_-]+$/.test(data.id)) ? data.id : makeId('prod');
    const price = Number(data.price) || 0;
    const discountPrice = Number(data.discountPrice ?? price) || 0;
    const discountPercentage =
      price > discountPrice && price > 0 ? Math.round(((price - discountPrice) / price) * 100) : 0;

    const payload = stripUndefined({
      id,
      name: (data.name || 'Untitled Product').trim().slice(0, 200),
      nameBn: (data.nameBn || '').trim().slice(0, 200),
      images: Array.isArray(data.images) && data.images.length > 0 ? data.images.slice(0, 10) : [],
      description: (data.description || '').trim().slice(0, 5000),
      shortDescription: (data.shortDescription || data.description || '').trim().slice(0, 500),
      price,
      discountPrice,
      discountPercentage,
      stock: Math.max(0, Number(data.stock) || 0),
      sku: (data.sku || `OF-${Math.floor(1000 + Math.random() * 9000)}`).trim().slice(0, 80),
      category: (data.category || 'Gadgets & Tech').trim().slice(0, 120),
      subcategory: (data.subcategory || '').trim().slice(0, 120),
      brand: (data.brand || 'Offer Flow').trim().slice(0, 120),
      tags: Array.isArray(data.tags) ? data.tags.slice(0, 20) : [],
      colors: Array.isArray(data.colors)
        ? data.colors.map((c) => String(c).trim().slice(0, 50)).filter(Boolean).slice(0, 20)
        : [],
      isFeatured: Boolean(data.isFeatured),
      isNewArrival: data.isNewArrival !== false,
      isFlashSale: Boolean(data.isFlashSale),
      specifications: Array.isArray(data.specifications) ? data.specifications.slice(0, 30) : [],
      videoUrl: (data.videoUrl || '').slice(0, 500),
      deliveryInfo: (data.deliveryInfo || '').slice(0, 1000),
      returnInfo: (data.returnInfo || '').slice(0, 1000),
      rating: Number(data.rating ?? 4.8),
      reviewCount: Number(data.reviewCount ?? 0),
      status: data.status === 'inactive' ? 'inactive' : 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    try {
      await setDoc(doc(db, 'products', id), payload);
      return normalizeProduct({ ...payload, createdAt: new Date().toISOString() }, id);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `products/${id}`);
    }
  },

  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    const existingRef = doc(db, 'products', id);
    const price = data.price !== undefined ? Number(data.price) : undefined;
    const discountPrice = data.discountPrice !== undefined ? Number(data.discountPrice) : undefined;
    const discountPercentage =
      price !== undefined && discountPrice !== undefined
        ? price > discountPrice && price > 0
          ? Math.round(((price - discountPrice) / price) * 100)
          : 0
        : data.discountPercentage;

    const payload = stripUndefined({
      name: data.name !== undefined ? data.name.trim().slice(0, 200) : undefined,
      nameBn: data.nameBn !== undefined ? data.nameBn.trim().slice(0, 200) : undefined,
      images: data.images !== undefined ? data.images.slice(0, 10) : undefined,
      description: data.description !== undefined ? data.description.trim().slice(0, 5000) : undefined,
      shortDescription:
        data.shortDescription !== undefined ? data.shortDescription.trim().slice(0, 500) : undefined,
      price,
      discountPrice,
      discountPercentage,
      stock: data.stock !== undefined ? Math.max(0, Number(data.stock)) : undefined,
      sku: data.sku !== undefined ? data.sku.trim().slice(0, 80) : undefined,
      category: data.category !== undefined ? data.category.trim().slice(0, 120) : undefined,
      subcategory: data.subcategory !== undefined ? data.subcategory.trim().slice(0, 120) : undefined,
      brand: data.brand !== undefined ? data.brand.trim().slice(0, 120) : undefined,
      tags: data.tags !== undefined ? data.tags.slice(0, 20) : undefined,
      colors:
        data.colors !== undefined
          ? data.colors.map((c) => String(c).trim().slice(0, 50)).filter(Boolean).slice(0, 20)
          : undefined,
      isFeatured: data.isFeatured,
      isNewArrival: data.isNewArrival,
      isFlashSale: data.isFlashSale,
      specifications:
        data.specifications !== undefined ? data.specifications.slice(0, 30) : undefined,
      videoUrl: data.videoUrl !== undefined ? data.videoUrl.slice(0, 500) : undefined,
      deliveryInfo: data.deliveryInfo !== undefined ? data.deliveryInfo.slice(0, 1000) : undefined,
      returnInfo: data.returnInfo !== undefined ? data.returnInfo.slice(0, 1000) : undefined,
      rating: data.rating,
      reviewCount: data.reviewCount,
      status: data.status,
      updatedAt: serverTimestamp(),
    });

    try {
      const snap = await getDoc(existingRef);
      if (!snap.exists()) {
        // If product came from SEED_PRODUCTS and wasn't in Firestore yet, create it cleanly
        const seedItem = SEED_PRODUCTS.find((p) => p.id === id);
        return await this.createProduct({ ...seedItem, ...data, id });
      }
      await updateDoc(existingRef, payload);
      const updatedSnap = await getDoc(existingRef);
      return normalizeProduct(updatedSnap.data() || {}, id);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `products/${id}`);
    }
  },

  async deleteProduct(id: string): Promise<{ success: boolean }> {
    try {
      await deleteDoc(doc(db, 'products', id));
      return { success: true };
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `products/${id}`);
    }
  },

  async duplicateProduct(id: string): Promise<Product> {
    try {
      const snap = await getDoc(doc(db, 'products', id));
      const base = snap.exists()
        ? normalizeProduct(snap.data(), id)
        : SEED_PRODUCTS.find((p) => p.id === id);
      if (!base) throw new Error('Product not found');
      return await this.createProduct({
        ...base,
        id: undefined,
        name: `${base.name} (Copy)`,
        sku: `${base.sku}-CPY`,
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `products/duplicate/${id}`);
    }
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    try {
      const snap = await getDocs(collection(db, 'categories'));
      const list = snap.docs.map((d) => normalizeCategory(d.data(), d.id));
      if (list.length === 0) return [...SEED_CATEGORIES];
      return list.sort((a, b) => a.order - b.order);
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, 'categories');
    }
  },

  subscribeCategories(onData: (cats: Category[]) => void): Unsubscribe {
    return onSnapshot(
      collection(db, 'categories'),
      (snap) => {
        if (snap.empty) {
          onData([...SEED_CATEGORIES]);
          return;
        }
        const list = snap.docs
          .map((d) => normalizeCategory(d.data(), d.id))
          .sort((a, b) => a.order - b.order);
        onData(list);
      },
      (err) => console.error('Categories snapshot error:', err)
    );
  },

  async createCategory(data: Partial<Category>): Promise<Category> {
    const id = (data.id && /^[a-zA-Z0-9_-]+$/.test(data.id)) ? data.id : makeId('cat');
    const name = (data.name || 'New Category').trim().slice(0, 120);
    const slug = (
      data.slug ||
      name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') ||
      id
    ).slice(0, 120);

    const payload = stripUndefined({
      id,
      name,
      nameBn: (data.nameBn || '').trim().slice(0, 120),
      slug,
      image:
        (data.image || '').trim() ||
        'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=400&q=80',
      icon: (data.icon || 'Layers').slice(0, 60),
      isActive: data.isActive !== false,
      order: Number(data.order ?? 1),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    try {
      await setDoc(doc(db, 'categories', id), payload);
      return normalizeCategory(payload, id);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `categories/${id}`);
    }
  },

  async updateCategory(id: string, data: Partial<Category>): Promise<Category> {
    const ref = doc(db, 'categories', id);
    const payload = stripUndefined({
      name: data.name !== undefined ? data.name.trim().slice(0, 120) : undefined,
      nameBn: data.nameBn !== undefined ? data.nameBn.trim().slice(0, 120) : undefined,
      slug: data.slug !== undefined ? data.slug.trim().slice(0, 120) : undefined,
      image: data.image !== undefined ? data.image.trim() : undefined,
      icon: data.icon !== undefined ? data.icon.slice(0, 60) : undefined,
      isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
      order: data.order !== undefined ? Number(data.order) : undefined,
      updatedAt: serverTimestamp(),
    });

    try {
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        const seedItem = SEED_CATEGORIES.find((c) => c.id === id);
        return await this.createCategory({ ...seedItem, ...data, id });
      }
      await updateDoc(ref, payload);
      const updated = await getDoc(ref);
      return normalizeCategory(updated.data() || {}, id);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `categories/${id}`);
    }
  },

  async deleteCategory(id: string): Promise<{ success: boolean }> {
    try {
      await deleteDoc(doc(db, 'categories', id));
      return { success: true };
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `categories/${id}`);
    }
  },

  // Banners
  async getBanners(): Promise<Banner[]> {
    try {
      const snap = await getDocs(collection(db, 'banners'));
      if (snap.empty) return [...SEED_BANNERS];
      return snap.docs
        .map((d) => normalizeBanner(d.data(), d.id))
        .sort((a, b) => a.order - b.order);
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, 'banners');
    }
  },

  subscribeBanners(onData: (banners: Banner[]) => void): Unsubscribe {
    return onSnapshot(
      collection(db, 'banners'),
      (snap) => {
        if (snap.empty) {
          onData([...SEED_BANNERS]);
          return;
        }
        onData(
          snap.docs
            .map((d) => normalizeBanner(d.data(), d.id))
            .sort((a, b) => a.order - b.order)
        );
      },
      (err) => console.error('Banners snapshot error:', err)
    );
  },

  async createBanner(data: Partial<Banner>): Promise<Banner> {
    const id = (data.id && /^[a-zA-Z0-9_-]+$/.test(data.id)) ? data.id : makeId('ban');
    const payload = stripUndefined({
      id,
      title: (data.title || 'Offer Banner').trim().slice(0, 200),
      subtitle: (data.subtitle || '').trim().slice(0, 500),
      badge: (data.badge || '').trim().slice(0, 100),
      image:
        (data.image || '').trim() ||
        'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&q=80',
      buttonText: (data.buttonText || 'Shop Now').trim().slice(0, 80),
      link: (data.link || '/shop').trim().slice(0, 300),
      placement: data.placement || 'homepage_hero',
      showOnHomepage: data.showOnHomepage !== false,
      isActive: data.isActive !== false,
      order: Number(data.order ?? 1),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    try {
      await setDoc(doc(db, 'banners', id), payload);
      return normalizeBanner(payload, id);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `banners/${id}`);
    }
  },

  async updateBanner(id: string, data: Partial<Banner>): Promise<Banner> {
    const ref = doc(db, 'banners', id);
    const payload = stripUndefined({
      title: data.title !== undefined ? data.title.trim().slice(0, 200) : undefined,
      subtitle: data.subtitle !== undefined ? data.subtitle.trim().slice(0, 500) : undefined,
      badge: data.badge !== undefined ? data.badge.trim().slice(0, 100) : undefined,
      image: data.image !== undefined ? data.image.trim() : undefined,
      buttonText: data.buttonText !== undefined ? data.buttonText.trim().slice(0, 80) : undefined,
      link: data.link !== undefined ? data.link.trim().slice(0, 300) : undefined,
      placement: data.placement,
      showOnHomepage: data.showOnHomepage,
      isActive: data.isActive,
      order: data.order !== undefined ? Number(data.order) : undefined,
      updatedAt: serverTimestamp(),
    });

    try {
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        const seedItem = SEED_BANNERS.find((b) => b.id === id);
        return await this.createBanner({ ...seedItem, ...data, id });
      }
      await updateDoc(ref, payload);
      const updated = await getDoc(ref);
      return normalizeBanner(updated.data() || {}, id);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `banners/${id}`);
    }
  },

  async deleteBanner(id: string): Promise<{ success: boolean }> {
    try {
      await deleteDoc(doc(db, 'banners', id));
      return { success: true };
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `banners/${id}`);
    }
  },

  // Advertisements
  async getAdvertisements(): Promise<Advertisement[]> {
    try {
      const snap = await getDocs(collection(db, 'advertisements'));
      if (snap.empty) return [...SEED_ADS];
      return snap.docs.map((d) => normalizeAd(d.data(), d.id));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, 'advertisements');
    }
  },

  subscribeAdvertisements(onData: (ads: Advertisement[]) => void): Unsubscribe {
    return onSnapshot(
      collection(db, 'advertisements'),
      (snap) => {
        if (snap.empty) {
          onData([...SEED_ADS]);
          return;
        }
        onData(snap.docs.map((d) => normalizeAd(d.data(), d.id)));
      },
      (err) => console.error('Ads snapshot error:', err)
    );
  },

  // Orders & Customer Tracking
  async getOrders(): Promise<Order[]> {
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map((d) => normalizeOrder(d.data(), d.id));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, 'orders');
    }
  },

  subscribeOrders(onData: (orders: Order[]) => void): Unsubscribe {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    return onSnapshot(
      q,
      (snap) => {
        onData(snap.docs.map((d) => normalizeOrder(d.data(), d.id)));
      },
      (err) => console.error('Orders snapshot error:', err)
    );
  },

  async getMyAuthOrders(uid: string): Promise<Order[]> {
    try {
      const q = query(collection(db, 'orders'), where('userId', '==', uid));
      const snap = await getDocs(q);
      return snap.docs
        .map((d) => normalizeOrder(d.data(), d.id))
        .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, 'orders');
    }
  },

  async getOrderTracking(orderNumber: string): Promise<OrderTracking | null> {
    const clean = orderNumber.trim().toUpperCase();
    if (!clean || !/^[a-zA-Z0-9_-]+$/.test(clean)) return null;
    try {
      const snap = await getDoc(doc(db, 'order_tracking', clean));
      if (!snap.exists()) return null;
      return normalizeOrderTracking(snap.data());
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, `order_tracking/${clean}`);
    }
  },

  subscribeOrderTracking(
    orderNumber: string,
    onData: (tracking: OrderTracking | null) => void
  ): Unsubscribe {
    const clean = orderNumber.trim().toUpperCase();
    return onSnapshot(
      doc(db, 'order_tracking', clean),
      (snap) => {
        if (!snap.exists()) {
          onData(null);
          return;
        }
        onData(normalizeOrderTracking(snap.data()));
      },
      (err) => console.error(`Order tracking snapshot error (${clean}):`, err)
    );
  },

  async createOrder(data: {
    customerName: string;
    phone: string;
    email?: string;
    address: string;
    district: string;
    area?: string;
    items: Order['items'];
    subtotal: number;
    discount: number;
    deliveryFee: number;
    total: number;
    couponCode?: string;
    paymentMethod?: Order['paymentMethod'];
    internalNotes?: string;
    customerNote?: string;
  }): Promise<Order> {
    const orderId = makeId('ord');
    const year = new Date().getFullYear();
    const suffix = Math.floor(100000 + Math.random() * 899999);
    const orderNumber = `OF-${year}-${suffix}`;
    const userId = auth.currentUser?.uid || '';
    const cleanPhone = data.phone.trim();
    const phoneLast4 = cleanPhone.slice(-4);

    // Shrink uploaded data URLs into lightweight thumbnails (~10-25KB) while preserving HTTPS image URLs
    const compactItems = await Promise.all(
      data.items.map(async (item) => {
        const thumb = await shrinkImageDataUrl(item.image || '', 180, 26000);
        return stripUndefined({
          productId: item.productId,
          productName: item.productName,
          price: Number(item.price) || 0,
          originalPrice: Number(item.originalPrice ?? item.price) || 0,
          quantity: Math.max(1, Number(item.quantity) || 1),
          image: thumb,
          sku: item.sku || '',
          selectedColor: item.selectedColor?.trim() ? item.selectedColor.trim().slice(0, 60) : undefined,
        });
      })
    );

    const cleanCustomerNote = data.customerNote?.trim()
      ? data.customerNote.trim().slice(0, 1000)
      : undefined;

    const orderPayload = stripUndefined({
      id: orderId,
      orderNumber,
      userId,
      customerName: data.customerName.trim().slice(0, 150),
      phone: cleanPhone.slice(0, 30),
      email: data.email?.trim() ? data.email.trim().slice(0, 200) : undefined,
      address: data.address.trim().slice(0, 500),
      district: (data.district || 'Dhaka').trim().slice(0, 100),
      area: data.area?.trim() ? data.area.trim().slice(0, 100) : undefined,
      items: compactItems,
      subtotal: Number(data.subtotal) || 0,
      discount: Number(data.discount) || 0,
      deliveryFee: Number(data.deliveryFee) || 0,
      total: Number(data.total) || 0,
      couponCode: data.couponCode?.trim() ? data.couponCode.trim().slice(0, 50) : undefined,
      status: 'pending' as const,
      paymentMethod: (data.paymentMethod || 'cash_on_delivery') as Order['paymentMethod'],
      internalNotes: data.internalNotes?.trim() ? data.internalNotes.trim().slice(0, 1000) : undefined,
      customerNote: cleanCustomerNote,
      statusNote: 'অর্ডারটি গ্রহণ করা হয়েছে। কনফার্মেশনের জন্য অপেক্ষমান।',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const trackingPayload = stripUndefined({
      orderNumber,
      orderId,
      status: 'pending' as const,
      statusNote: 'অর্ডারটি গ্রহণ করা হয়েছে। কনফার্মেশনের জন্য অপেক্ষমান।',
      items: compactItems,
      subtotal: Number(data.subtotal) || 0,
      discount: Number(data.discount) || 0,
      deliveryFee: Number(data.deliveryFee) || 0,
      total: Number(data.total) || 0,
      district: (data.district || 'Dhaka').trim().slice(0, 100),
      paymentMethod: (data.paymentMethod || 'cash_on_delivery') as Order['paymentMethod'],
      phoneLast4,
      customerNote: cleanCustomerNote,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    try {
      const batch = writeBatch(db);
      batch.set(doc(db, 'orders', orderId), orderPayload);
      batch.set(doc(db, 'order_tracking', orderNumber), trackingPayload);
      await batch.commit();

      saveMyOrderNumber(orderNumber);

      const nowIso = new Date().toISOString();
      return normalizeOrder({ ...orderPayload, createdAt: nowIso, updatedAt: nowIso }, orderId);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `orders/${orderId}`);
    }
  },

  async updateOrderStatus(
    id: string,
    status: Order['status'],
    internalNotes?: string,
    statusNote?: string
  ): Promise<void> {
    const orderRef = doc(db, 'orders', id);
    try {
      const snap = await getDoc(orderRef);
      if (!snap.exists()) throw new Error('Order not found');
      const orderData = snap.data();
      const orderNumber = orderData.orderNumber as string;

      const defaultNotes: Record<Order['status'], string> = {
        pending: 'অর্ডারটি গ্রহণ করা হয়েছে। কনফার্মেশনের জন্য অপেক্ষমান।',
        confirmed: 'আপনার অর্ডারটি কনফার্ম করা হয়েছে! শীঘ্রই প্যাকিং শুরু হবে।',
        processing: 'আপনার পণ্যটি কুরিয়ারের জন্য প্যাক করা হচ্ছে।',
        shipped: 'আপনার পার্সেলটি কুরিয়ারে হস্তান্তর করা হয়েছে।',
        delivered: 'অর্ডারটি সফলভাবে ডেলিভারি সম্পন্ন হয়েছে। ধন্যবাদ!',
        cancelled: 'অর্ডারটি বাতিল করা হয়েছে। প্রয়োজনে যোগাযোগ করুন।',
      };

      const finalStatusNote =
        statusNote !== undefined && statusNote.trim() !== ''
          ? statusNote.trim().slice(0, 500)
          : defaultNotes[status];

      const batch = writeBatch(db);
      batch.update(
        orderRef,
        stripUndefined({
          status,
          internalNotes: internalNotes !== undefined ? internalNotes.slice(0, 1000) : orderData.internalNotes ?? '',
          statusNote: finalStatusNote,
          updatedAt: serverTimestamp(),
        })
      );

      if (orderNumber) {
        const trackRef = doc(db, 'order_tracking', orderNumber);
        const trackSnap = await getDoc(trackRef);
        if (trackSnap.exists()) {
          batch.update(trackRef, {
            status,
            statusNote: finalStatusNote,
            updatedAt: serverTimestamp(),
          });
        }
      }

      await batch.commit();
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `orders/${id}`);
    }
  },

  async getCustomers(): Promise<Customer[]> {
    const orders = await this.getOrders();
    const map = new Map<string, Customer>();
    for (const o of orders) {
      const key = o.phone || o.id;
      const prev = map.get(key);
      if (!prev) {
        map.set(key, {
          id: key,
          name: o.customerName,
          phone: o.phone,
          email: o.email,
          address: o.address,
          district: o.district,
          totalPurchases: o.status === 'cancelled' ? 0 : o.total,
          totalOrders: 1,
          lastOrderDate: o.createdAt,
        });
      } else {
        prev.totalOrders += 1;
        if (o.status !== 'cancelled') prev.totalPurchases += o.total;
        if (new Date(o.createdAt) > new Date(prev.lastOrderDate)) {
          prev.lastOrderDate = o.createdAt;
        }
      }
    }
    return Array.from(map.values());
  },

  // Blogs
  async getBlogs(): Promise<BlogPost[]> {
    try {
      const snap = await getDocs(collection(db, 'blogs'));
      if (snap.empty) return [...SEED_BLOGS];
      return snap.docs
        .map((d) => normalizeBlog(d.data(), d.id))
        .sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, 'blogs');
    }
  },

  subscribeBlogs(onData: (blogs: BlogPost[]) => void): Unsubscribe {
    return onSnapshot(
      collection(db, 'blogs'),
      (snap) => {
        if (snap.empty) {
          onData([...SEED_BLOGS]);
          return;
        }
        onData(
          snap.docs
            .map((d) => normalizeBlog(d.data(), d.id))
            .sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt))
        );
      },
      (err) => console.error('Blogs snapshot error:', err)
    );
  },

  async createBlog(data: Partial<BlogPost>): Promise<BlogPost> {
    const id = (data.id && /^[a-zA-Z0-9_-]+$/.test(data.id)) ? data.id : makeId('blog');
    const title = (data.title || 'Untitled Article').trim().slice(0, 250);
    const slug = (
      data.slug ||
      title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') ||
      id
    ).slice(0, 250);

    const payload = stripUndefined({
      id,
      title,
      slug,
      excerpt: (data.excerpt || '').trim().slice(0, 1000),
      content: (data.content || '').trim().slice(0, 25000),
      featuredImage: (data.featuredImage || '').trim() || undefined,
      author: (data.author || 'A.Y HEJAJ').trim().slice(0, 120),
      category: (data.category || 'Guides').trim().slice(0, 120),
      tags: Array.isArray(data.tags) ? data.tags.slice(0, 20) : [],
      isPublished: data.isPublished !== false,
      publishedAt: data.publishedAt || new Date().toISOString(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    try {
      await setDoc(doc(db, 'blogs', id), payload);
      return normalizeBlog(payload, id);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `blogs/${id}`);
    }
  },

  async updateBlog(id: string, data: Partial<BlogPost>): Promise<BlogPost> {
    const ref = doc(db, 'blogs', id);
    const payload = stripUndefined({
      title: data.title !== undefined ? data.title.trim().slice(0, 250) : undefined,
      slug: data.slug !== undefined ? data.slug.trim().slice(0, 250) : undefined,
      excerpt: data.excerpt !== undefined ? data.excerpt.trim().slice(0, 1000) : undefined,
      content: data.content !== undefined ? data.content.trim().slice(0, 25000) : undefined,
      featuredImage: data.featuredImage !== undefined ? data.featuredImage.trim() : undefined,
      author: data.author !== undefined ? data.author.trim().slice(0, 120) : undefined,
      category: data.category !== undefined ? data.category.trim().slice(0, 120) : undefined,
      tags: data.tags !== undefined ? data.tags.slice(0, 20) : undefined,
      isPublished: data.isPublished,
      publishedAt: data.publishedAt,
      updatedAt: serverTimestamp(),
    });

    try {
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        const seedItem = SEED_BLOGS.find((b) => b.id === id);
        return await this.createBlog({ ...seedItem, ...data, id });
      }
      await updateDoc(ref, payload);
      const updated = await getDoc(ref);
      return normalizeBlog(updated.data() || {}, id);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `blogs/${id}`);
    }
  },

  async deleteBlog(id: string): Promise<{ success: boolean }> {
    try {
      await deleteDoc(doc(db, 'blogs', id));
      return { success: true };
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `blogs/${id}`);
    }
  },

  // Coupons
  async getCoupons(): Promise<Coupon[]> {
    try {
      const snap = await getDocs(collection(db, 'coupons'));
      if (snap.empty) return [...SEED_COUPONS];
      return snap.docs.map((d) => normalizeCoupon(d.data(), d.id));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, 'coupons');
    }
  },

  async validateCoupon(
    code: string,
    cartTotal: number
  ): Promise<{ valid: boolean; discount: number; message: string }> {
    const cleanCode = code.trim().toUpperCase();
    const coupons = await this.getCoupons();
    const coupon = coupons.find((c) => c.code.toUpperCase() === cleanCode);

    if (!coupon || !coupon.isActive) {
      return { valid: false, discount: 0, message: 'Invalid or inactive coupon code' };
    }
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return { valid: false, discount: 0, message: 'This coupon has expired' };
    }
    if (coupon.usageLimit > 0 && coupon.timesUsed >= coupon.usageLimit) {
      return { valid: false, discount: 0, message: 'Coupon usage limit reached' };
    }
    if (cartTotal < coupon.minOrderValue) {
      return {
        valid: false,
        discount: 0,
        message: `Minimum order of ৳${coupon.minOrderValue} required for this coupon`,
      };
    }

    let discount =
      coupon.type === 'percentage'
        ? Math.round((cartTotal * coupon.value) / 100)
        : coupon.value;
    if (coupon.maxDiscount > 0 && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }

    return {
      valid: true,
      discount,
      message: `${cleanCode} applied! You saved ৳${discount}`,
    };
  },

  async createCoupon(data: Partial<Coupon>): Promise<Coupon> {
    const id = (data.id && /^[a-zA-Z0-9_-]+$/.test(data.id)) ? data.id : makeId('cpn');
    const payload = stripUndefined({
      id,
      code: (data.code || 'OFFER10').trim().toUpperCase().slice(0, 50),
      type: data.type === 'fixed' ? 'fixed' : 'percentage',
      value: Math.max(0, Number(data.value) || 0),
      minOrderValue: Math.max(0, Number(data.minOrderValue) || 0),
      maxDiscount: Math.max(0, Number(data.maxDiscount) || 0),
      usageLimit: Math.max(0, Number(data.usageLimit ?? 500)),
      timesUsed: Math.max(0, Number(data.timesUsed ?? 0)),
      isActive: data.isActive !== false,
      expiresAt: data.expiresAt?.trim() ? data.expiresAt.trim().slice(0, 60) : undefined,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    try {
      await setDoc(doc(db, 'coupons', id), payload);
      return normalizeCoupon(payload, id);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `coupons/${id}`);
    }
  },

  async updateCoupon(id: string, data: Partial<Coupon>): Promise<Coupon> {
    const ref = doc(db, 'coupons', id);
    const payload = stripUndefined({
      code: data.code !== undefined ? data.code.trim().toUpperCase().slice(0, 50) : undefined,
      type: data.type,
      value: data.value !== undefined ? Math.max(0, Number(data.value)) : undefined,
      minOrderValue:
        data.minOrderValue !== undefined ? Math.max(0, Number(data.minOrderValue)) : undefined,
      maxDiscount:
        data.maxDiscount !== undefined ? Math.max(0, Number(data.maxDiscount)) : undefined,
      usageLimit:
        data.usageLimit !== undefined ? Math.max(0, Number(data.usageLimit)) : undefined,
      isActive: data.isActive,
      expiresAt: data.expiresAt !== undefined ? data.expiresAt.slice(0, 60) : undefined,
      updatedAt: serverTimestamp(),
    });

    try {
      await updateDoc(ref, payload);
      const updated = await getDoc(ref);
      return normalizeCoupon(updated.data() || {}, id);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `coupons/${id}`);
    }
  },

  async deleteCoupon(id: string): Promise<{ success: boolean }> {
    try {
      await deleteDoc(doc(db, 'coupons', id));
      return { success: true };
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `coupons/${id}`);
    }
  },

  // Flash Sale
  async getFlashSale(): Promise<FlashSaleConfig> {
    try {
      const snap = await getDoc(doc(db, 'site_config', 'flash_sale'));
      if (!snap.exists()) return { ...SEED_FLASH_SALE };
      const d = snap.data();
      return {
        isActive: d.isActive !== false,
        title: (d.title as string) || SEED_FLASH_SALE.title,
        titleBn: (d.titleBn as string) || SEED_FLASH_SALE.titleBn,
        endTime: (d.endTime as string) || SEED_FLASH_SALE.endTime,
        discountHighlight: (d.discountHighlight as string) || SEED_FLASH_SALE.discountHighlight,
      };
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, 'site_config/flash_sale');
    }
  },

  subscribeFlashSale(onData: (fs: FlashSaleConfig) => void): Unsubscribe {
    return onSnapshot(
      doc(db, 'site_config', 'flash_sale'),
      (snap) => {
        if (!snap.exists()) {
          onData({ ...SEED_FLASH_SALE });
          return;
        }
        const d = snap.data();
        onData({
          isActive: d.isActive !== false,
          title: (d.title as string) || SEED_FLASH_SALE.title,
          titleBn: (d.titleBn as string) || SEED_FLASH_SALE.titleBn,
          endTime: (d.endTime as string) || SEED_FLASH_SALE.endTime,
          discountHighlight: (d.discountHighlight as string) || SEED_FLASH_SALE.discountHighlight,
        });
      },
      (err) => console.error('Flash sale snapshot error:', err)
    );
  },

  async updateFlashSale(data: Partial<FlashSaleConfig>): Promise<FlashSaleConfig> {
    const ref = doc(db, 'site_config', 'flash_sale');
    const merged: FlashSaleConfig = {
      ...SEED_FLASH_SALE,
      ...data,
    };
    const payload = stripUndefined({
      id: 'flash_sale',
      isActive: Boolean(merged.isActive),
      title: merged.title,
      titleBn: merged.titleBn,
      endTime: merged.endTime,
      discountHighlight: merged.discountHighlight,
      updatedAt: serverTimestamp(),
    });
    try {
      await setDoc(ref, payload);
      return merged;
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'site_config/flash_sale');
    }
  },

  // Custom Offer Campaigns (like Flash Sale, with selected products & timer)
  async getOffers(): Promise<OfferCampaign[]> {
    try {
      const snap = await getDocs(collection(db, 'offers'));
      return snap.docs
        .map((d) => normalizeOffer(d.data(), d.id))
        .sort((a, b) => a.order - b.order);
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, 'offers');
    }
  },

  subscribeOffers(onData: (offers: OfferCampaign[]) => void): Unsubscribe {
    return onSnapshot(
      collection(db, 'offers'),
      (snap) => {
        const list = snap.docs
          .map((d) => normalizeOffer(d.data(), d.id))
          .sort((a, b) => a.order - b.order);
        onData(list);
      },
      (err) => console.error('Offers snapshot error:', err)
    );
  },

  async createOffer(data: Partial<OfferCampaign>): Promise<OfferCampaign> {
    const id = data.id && /^[a-zA-Z0-9_-]+$/.test(data.id) ? data.id : makeId('ofr');
    const allowedThemes: OfferCampaignTheme[] = ['crimson', 'obsidian', 'emerald', 'amber', 'indigo'];
    const theme: OfferCampaignTheme =
      data.theme && allowedThemes.includes(data.theme) ? data.theme : 'crimson';
    const productIds = Array.isArray(data.productIds)
      ? Array.from(new Set(data.productIds.filter((pid) => typeof pid === 'string' && pid.trim()))).slice(0, 100)
      : [];

    const payload = stripUndefined({
      id,
      title: (data.title || 'Special Offer').trim().slice(0, 200),
      titleBn: data.titleBn?.trim() ? data.titleBn.trim().slice(0, 200) : undefined,
      subtitle: data.subtitle?.trim() ? data.subtitle.trim().slice(0, 400) : undefined,
      discountHighlight: (data.discountHighlight || 'SPECIAL OFFER').trim().slice(0, 100),
      theme,
      endTime: (data.endTime || new Date(Date.now() + 72 * 3600 * 1000).toISOString()).slice(0, 60),
      isActive: data.isActive !== false,
      order: Number(data.order ?? 1),
      productIds,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    try {
      await setDoc(doc(db, 'offers', id), payload);
      return normalizeOffer(payload, id);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `offers/${id}`);
    }
  },

  async updateOffer(id: string, data: Partial<OfferCampaign>): Promise<OfferCampaign> {
    const ref = doc(db, 'offers', id);
    const allowedThemes: OfferCampaignTheme[] = ['crimson', 'obsidian', 'emerald', 'amber', 'indigo'];
    const payload = stripUndefined({
      title: data.title !== undefined ? data.title.trim().slice(0, 200) : undefined,
      titleBn: data.titleBn !== undefined ? data.titleBn.trim().slice(0, 200) : undefined,
      subtitle: data.subtitle !== undefined ? data.subtitle.trim().slice(0, 400) : undefined,
      discountHighlight:
        data.discountHighlight !== undefined
          ? data.discountHighlight.trim().slice(0, 100)
          : undefined,
      theme: data.theme && allowedThemes.includes(data.theme) ? data.theme : undefined,
      endTime: data.endTime !== undefined ? data.endTime.slice(0, 60) : undefined,
      isActive: data.isActive !== undefined ? Boolean(data.isActive) : undefined,
      order: data.order !== undefined ? Number(data.order) : undefined,
      productIds:
        data.productIds !== undefined
          ? Array.from(new Set(data.productIds.filter((pid) => typeof pid === 'string' && pid.trim()))).slice(0, 100)
          : undefined,
      updatedAt: serverTimestamp(),
    });

    try {
      await updateDoc(ref, payload);
      const updated = await getDoc(ref);
      return normalizeOffer(updated.data() || {}, id);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `offers/${id}`);
    }
  },

  async deleteOffer(id: string): Promise<{ success: boolean }> {
    try {
      await deleteDoc(doc(db, 'offers', id));
      return { success: true };
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `offers/${id}`);
    }
  },

  // Reviews
  async getReviews(productId?: string): Promise<Review[]> {
    try {
      const q = productId
        ? query(collection(db, 'reviews'), where('productId', '==', productId))
        : collection(db, 'reviews');
      const snap = await getDocs(q);
      return snap.docs
        .map((d) => normalizeReview(d.data(), d.id))
        .filter((r) => r.isApproved)
        .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, 'reviews');
    }
  },

  async addReview(data: Partial<Review>): Promise<Review> {
    const id = makeId('rev');
    const payload = stripUndefined({
      id,
      productId: (data.productId || '').trim(),
      productName: (data.productName || '').trim().slice(0, 200) || undefined,
      customerName: (data.customerName || 'Customer').trim().slice(0, 120),
      rating: Math.min(5, Math.max(1, Number(data.rating) || 5)),
      comment: (data.comment || '').trim().slice(0, 2000),
      isApproved: true,
      createdAt: serverTimestamp(),
    });
    try {
      await setDoc(doc(db, 'reviews', id), payload);
      return normalizeReview({ ...payload, createdAt: new Date().toISOString() }, id);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `reviews/${id}`);
    }
  },

  // Settings
  async getSettings(): Promise<SiteSettings> {
    try {
      const snap = await getDoc(doc(db, 'site_config', 'settings'));
      if (!snap.exists()) return { ...SEED_SETTINGS };
      const raw = snap.data();
      return {
        ...SEED_SETTINGS,
        ...raw,
        freeDeliveryEnabled: Boolean(raw.freeDeliveryEnabled),
      } as SiteSettings;
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, 'site_config/settings');
    }
  },

  subscribeSettings(onData: (settings: SiteSettings) => void): Unsubscribe {
    return onSnapshot(
      doc(db, 'site_config', 'settings'),
      (snap) => {
        if (!snap.exists()) {
          onData({ ...SEED_SETTINGS });
          return;
        }
        const raw = snap.data();
        onData({
          ...SEED_SETTINGS,
          ...raw,
          freeDeliveryEnabled: Boolean(raw.freeDeliveryEnabled),
        } as SiteSettings);
      },
      (err) => console.error('Settings snapshot error:', err)
    );
  },

  async updateSettings(data: Partial<SiteSettings>): Promise<SiteSettings> {
    const ref = doc(db, 'site_config', 'settings');
    const merged: SiteSettings = {
      ...SEED_SETTINGS,
      ...data,
      freeDeliveryEnabled: Boolean(data.freeDeliveryEnabled),
    };
    const payload = stripUndefined({
      id: 'settings',
      websiteName: merged.websiteName,
      tagline: merged.tagline,
      logoUrl: merged.logoUrl,
      contactPhone: merged.contactPhone,
      whatsappNumber: merged.whatsappNumber,
      facebookPage: merged.facebookPage,
      tiktokLink: merged.tiktokLink,
      announcementBarText: merged.announcementBarText,
      announcementBarActive: merged.announcementBarActive,
      currencySymbol: merged.currencySymbol,
      currencyCode: merged.currencyCode,
      deliveryChargeInsideDhaka: Number(merged.deliveryChargeInsideDhaka),
      deliveryChargeOutsideDhaka: Number(merged.deliveryChargeOutsideDhaka),
      freeDeliveryEnabled: Boolean(merged.freeDeliveryEnabled),
      freeDeliveryThreshold: Number(merged.freeDeliveryThreshold),
      deliveryInformation: merged.deliveryInformation,
      returnPolicy: merged.returnPolicy,
      privacyPolicy: merged.privacyPolicy,
      termsAndConditions: merged.termsAndConditions,
      aboutUs: merged.aboutUs,
      footerCopyright: merged.footerCopyright,
      footerCredit: merged.footerCredit,
      updatedAt: serverTimestamp(),
    });

    try {
      await setDoc(ref, payload);
      return merged;
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'site_config/settings');
    }
  },

  // Seed default storefront catalog into Firestore (Admin only)
  async seedDefaultsToFirestore(forceSyncMissing = false): Promise<{ seededCollections: number }> {
    let seededCollections = 0;
    const batch = writeBatch(db);
    let hasWrites = false;

    const checkAndSeedCollection = async <T extends { id: string }>(
      colName: string,
      items: T[],
      mapFn: (item: T) => Record<string, unknown>
    ) => {
      const snap = await getDocs(collection(db, colName));
      if (snap.empty || forceSyncMissing) {
        const existingIds = new Set(snap.docs.map((d) => d.id));
        let addedAny = false;
        for (const item of items) {
          if (!existingIds.has(item.id)) {
            batch.set(doc(db, colName, item.id), mapFn(item));
            hasWrites = true;
            addedAny = true;
          }
        }
        if (addedAny) seededCollections += 1;
      }
    };

    try {
      await checkAndSeedCollection('categories', SEED_CATEGORIES, (c) =>
        stripUndefined({
          ...c,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      );
      await checkAndSeedCollection('products', SEED_PRODUCTS, (p) =>
        stripUndefined({
          ...p,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      );
      await checkAndSeedCollection('banners', SEED_BANNERS, (b) =>
        stripUndefined({
          ...b,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      );
      await checkAndSeedCollection('advertisements', SEED_ADS, (a) =>
        stripUndefined({
          ...a,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      );
      await checkAndSeedCollection('blogs', SEED_BLOGS, (b) =>
        stripUndefined({
          ...b,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      );
      await checkAndSeedCollection('coupons', SEED_COUPONS, (c) =>
        stripUndefined({
          ...c,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      );

      const settingsSnap = await getDoc(doc(db, 'site_config', 'settings'));
      if (!settingsSnap.exists()) {
        batch.set(
          doc(db, 'site_config', 'settings'),
          stripUndefined({
            id: 'settings',
            ...SEED_SETTINGS,
            updatedAt: serverTimestamp(),
          })
        );
        hasWrites = true;
        seededCollections += 1;
      }

      const fsSnap = await getDoc(doc(db, 'site_config', 'flash_sale'));
      if (!fsSnap.exists()) {
        batch.set(
          doc(db, 'site_config', 'flash_sale'),
          stripUndefined({
            id: 'flash_sale',
            ...SEED_FLASH_SALE,
            updatedAt: serverTimestamp(),
          })
        );
        hasWrites = true;
        seededCollections += 1;
      }

      if (hasWrites) {
        await batch.commit();
      }
      return { seededCollections };
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'seed_defaults');
    }
  },
};
