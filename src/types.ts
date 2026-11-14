export interface Product {
  id: string;
  name: string;
  nameBn?: string;
  images: string[];
  description: string;
  shortDescription: string;
  price: number;
  discountPrice: number;
  discountPercentage: number;
  stock: number;
  sku: string;
  category: string;
  subcategory?: string;
  brand: string;
  tags: string[];
  colors?: string[];
  isFeatured: boolean;
  isNewArrival: boolean;
  isFlashSale: boolean;
  specifications: { label: string; value: string }[];
  videoUrl?: string;
  deliveryInfo?: string;
  returnInfo?: string;
  rating: number;
  reviewCount: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  nameBn: string;
  slug: string;
  image: string;
  icon?: string;
  isActive: boolean;
  order: number;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  image: string;
  buttonText: string;
  link: string;
  placement: 'homepage_hero' | 'promo_section' | 'product_page' | 'category_page' | 'popup' | 'announcement';
  showOnHomepage: boolean;
  isActive: boolean;
  order: number;
  startDate?: string;
  endDate?: string;
}

export interface Advertisement {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  buttonText: string;
  targetUrl: string;
  placement: 'homepage_hero' | 'promo_section' | 'product_page' | 'category_page' | 'popup' | 'announcement';
  showOnHomepage: boolean;
  isActive: boolean;
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  image: string;
  sku?: string;
  selectedColor?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  customerName: string;
  phone: string;
  email?: string;
  address: string;
  district: string;
  area: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  couponCode?: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: 'cash_on_delivery' | 'whatsapp_cod';
  internalNotes: string;
  customerNote?: string;
  statusNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderTracking {
  orderNumber: string;
  orderId: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  statusNote?: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  district: string;
  paymentMethod: 'cash_on_delivery' | 'whatsapp_cod';
  phoneLast4?: string;
  customerNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
  district?: string;
  totalPurchases: number;
  totalOrders: number;
  lastOrderDate: string;
}

export interface Review {
  id: string;
  productId: string;
  productName: string;
  customerName: string;
  rating: number;
  comment: string;
  image?: string;
  isApproved: boolean;
  createdAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  author: string;
  category: string;
  tags: string[];
  isPublished: boolean;
  publishedAt: string;
  seoTitle?: string;
  seoDescription?: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderValue: number;
  maxDiscount: number;
  usageLimit: number;
  timesUsed: number;
  isActive: boolean;
  expiresAt?: string;
}

export interface FlashSaleConfig {
  isActive: boolean;
  title: string;
  titleBn: string;
  endTime: string;
  discountHighlight: string;
}

export interface SiteSettings {
  websiteName: string;
  tagline: string;
  logoUrl: string;
  contactPhone: string;
  whatsappNumber: string;
  facebookPage: string;
  tiktokLink: string;
  announcementBarText: string;
  announcementBarActive: boolean;
  currencySymbol: string;
  currencyCode: string;
  deliveryChargeInsideDhaka: number;
  deliveryChargeOutsideDhaka: number;
  freeDeliveryThreshold: number;
  deliveryInformation: string;
  returnPolicy: string;
  privacyPolicy: string;
  termsAndConditions: string;
  aboutUs: string;
  footerCopyright: string;
  footerCredit: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email?: string;
  phone?: string;
  district?: string;
  area?: string;
  address?: string;
  photoURL?: string;
  createdAt?: string;
  updatedAt?: string;
}
