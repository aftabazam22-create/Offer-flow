import fs from 'fs';
import path from 'path';
import {
  Product,
  Category,
  Banner,
  Advertisement,
  Order,
  Customer,
  Review,
  BlogPost,
  Coupon,
  FlashSaleConfig,
  SiteSettings,
} from '../src/types.js';

interface DatabaseSchema {
  products: Product[];
  categories: Category[];
  banners: Banner[];
  advertisements: Advertisement[];
  orders: Order[];
  customers: Customer[];
  reviews: Review[];
  blogs: BlogPost[];
  coupons: Coupon[];
  flashSale: FlashSaleConfig;
  settings: SiteSettings;
  adminTokens: { token: string; expiresAt: number }[];
}

const DB_FILE_PATH = path.join(process.cwd(), 'data', 'store.json');

const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    name: 'Gadgets & Tech',
    nameBn: 'গ্যাজেট ও টেক',
    slug: 'gadgets-tech',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80',
    icon: 'Headphones',
    isActive: true,
    order: 1,
  },
  {
    id: 'cat-2',
    name: 'Smartphones',
    nameBn: 'স্মার্টফোন ও আনুষাঙ্গিক',
    slug: 'smartphones',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80',
    icon: 'Smartphone',
    isActive: true,
    order: 2,
  },
  {
    id: 'cat-3',
    name: "Men's Fashion",
    nameBn: 'পুরুষদের ফ্যাশন',
    slug: 'mens-fashion',
    image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=400&q=80',
    icon: 'Shirt',
    isActive: true,
    order: 3,
  },
  {
    id: 'cat-4',
    name: "Women's Fashion",
    nameBn: 'নারীদের ফ্যাশন',
    slug: 'womens-fashion',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&q=80',
    icon: 'ShoppingBag',
    isActive: true,
    order: 4,
  },
  {
    id: 'cat-5',
    name: 'Home & Kitchen',
    nameBn: 'বাড়ি ও রান্নাঘর',
    slug: 'home-kitchen',
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400&q=80',
    icon: 'Home',
    isActive: true,
    order: 5,
  },
  {
    id: 'cat-6',
    name: 'Beauty & Skincare',
    nameBn: 'সৌন্দর্য ও যত্ন',
    slug: 'beauty-skincare',
    image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&q=80',
    icon: 'Sparkles',
    isActive: true,
    order: 6,
  },
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'SoundPro ANC Wireless Earbuds',
    nameBn: 'সাউন্ডপ্রো এএনসি ওয়্যারলেস ইয়ারবাডস',
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=85',
      'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800&q=85',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=85'
    ],
    description: 'Active Noise Cancellation (ANC) up to 35dB, 36 hours total battery playtime with charging case, Bluetooth 5.3 instant pairing, and deep punchy bass tailored for music lovers in Bangladesh.',
    shortDescription: 'Active Noise Cancellation, 36h Playtime, Bluetooth 5.3',
    price: 3450,
    discountPrice: 2490,
    discountPercentage: 28,
    stock: 22,
    sku: 'OF-ACC-006',
    category: 'Gadgets & Tech',
    subcategory: 'Audio',
    brand: 'SoundPro',
    tags: ['earbuds', 'wireless', 'audio', 'anc', 'bluetooth'],
    isFeatured: true,
    isNewArrival: false,
    isFlashSale: true,
    specifications: [
      { label: 'ANC Depth', value: '-35dB Hybrid Noise Cancellation' },
      { label: 'Playtime', value: '8 Hours (Single) / 36 Hours (Total)' },
      { label: 'Connectivity', value: 'Bluetooth 5.3 (15m range)' },
      { label: 'Water Resistance', value: 'IPX5 Splash & Sweat Resistant' },
      { label: 'Warranty', value: '6 Months Official Replacement' }
    ],
    deliveryInfo: 'Inside Dhaka: 24-48 Hours. Outside Dhaka: 2-3 Days. Cash on Delivery available.',
    returnInfo: '7 Days easy return policy if defective upon receipt.',
    rating: 4.9,
    reviewCount: 48,
    status: 'active',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'prod-2',
    name: 'Titan Pulse Smartwatch Ultra 2',
    nameBn: 'টাইটান পালস স্মার্টওয়াচ আল্ট্রা ২',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=85',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&q=85',
      'https://images.unsplash.com/photo-1510017803434-a899398421b3?w=800&q=85'
    ],
    description: '1.96-inch AMOLED display with Always-On screen, crystal-clear Bluetooth calling with dual mic, heart rate, SpO2 & sleep tracking, 100+ sports modes and premium stainless steel bezel.',
    shortDescription: '1.96" AMOLED, BT Calling, IP68, 7-Day Battery',
    price: 4990,
    discountPrice: 3850,
    discountPercentage: 23,
    stock: 15,
    sku: 'OF-GAD-002',
    category: 'Gadgets & Tech',
    subcategory: 'Wearables',
    brand: 'Titan',
    tags: ['smartwatch', 'fitness', 'calling', 'amoled', 'gadgets'],
    isFeatured: true,
    isNewArrival: false,
    isFlashSale: true,
    specifications: [
      { label: 'Display', value: '1.96" High-Res AMOLED (410x502)' },
      { label: 'Calling', value: 'HD Bluetooth Calling with Mic & Speaker' },
      { label: 'Battery', value: '380mAh (7-10 Days Regular Use)' },
      { label: 'Health Sensors', value: 'SpO2, Heart Rate, Stress, Sleep' },
      { label: 'Warranty', value: '1 Year Brand Warranty' }
    ],
    deliveryInfo: 'Fast delivery across 64 districts of Bangladesh.',
    returnInfo: '7-day replacement guarantee.',
    rating: 4.8,
    reviewCount: 37,
    status: 'active',
    createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
  },
  {
    id: 'prod-3',
    name: 'ChefChoice Rapid Air Fryer 6L',
    nameBn: 'শেফচয়েস র্যাপিড এয়ার ফ্রায়ার ৬ লিটার',
    images: [
      'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=800&q=85',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=85'
    ],
    description: 'Cook with 85% less oil without sacrificing crunch or flavor. Features 6-liter large non-stick basket, 8 pre-programmed touch presets, 360° rapid thermal airflow, and auto shutoff safety.',
    shortDescription: '6L Digital Touchscreen, 85% Less Oil, 1700W Power',
    price: 7200,
    discountPrice: 5490,
    discountPercentage: 24,
    stock: 8,
    sku: 'OF-KIT-004',
    category: 'Home & Kitchen',
    subcategory: 'Kitchen Appliances',
    brand: 'ChefChoice',
    tags: ['air fryer', 'kitchen', 'cooking', 'healthy', 'home'],
    isFeatured: true,
    isNewArrival: false,
    isFlashSale: true,
    specifications: [
      { label: 'Capacity', value: '6 Liters (Family Size)' },
      { label: 'Power', value: '1700 Watts Fast Heating' },
      { label: 'Control', value: 'One-Touch Digital LED Panel' },
      { label: 'Basket', value: 'Food-Grade Non-Stick Dishwasher Safe' },
      { label: 'Warranty', value: '1 Year Free Service Warranty' }
    ],
    deliveryInfo: 'Free Delivery inside Dhaka over ৳3000.',
    returnInfo: 'Exchange available within 7 days of delivery.',
    rating: 4.9,
    reviewCount: 27,
    status: 'active',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'prod-4',
    name: 'UltraCharge 65W GaN Fast Wall Charger',
    nameBn: 'আল্ট্রাচার্জ ৬৫ ওয়াট ফাস্ট চার্জার',
    images: [
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&q=85',
      'https://images.unsplash.com/photo-1622445268047-97d81bb3fc04?w=800&q=85'
    ],
    description: 'Compact Gallium Nitride (GaN III) fast charger with 2x Type-C and 1x USB-A ports. Powers laptops, MacBooks, iPhones, Samsung smartphones and tablets at maximum speed with surge protection.',
    shortDescription: '65W Dual Type-C + USB-A GaN III Compact Charger',
    price: 2650,
    discountPrice: 1890,
    discountPercentage: 29,
    stock: 22,
    sku: 'OF-ACC-001',
    category: 'Gadgets & Tech',
    subcategory: 'Chargers & Cables',
    brand: 'UltraCharge',
    tags: ['charger', 'gan', 'fast charge', 'type c', 'accessories'],
    isFeatured: false,
    isNewArrival: true,
    isFlashSale: true,
    specifications: [
      { label: 'Max Output', value: '65W Power Delivery (PD 3.0 & QC 4.0)' },
      { label: 'Ports', value: '2x USB Type-C + 1x USB Type-A' },
      { label: 'Technology', value: 'GaN III Semiconductor cooling' },
      { label: 'Compatibility', value: 'Laptops, MacBooks, Android, iOS' },
      { label: 'Warranty', value: '6 Months Replacement' }
    ],
    deliveryInfo: 'Delivered in 24 hours inside Dhaka.',
    returnInfo: 'Instant return at delivery if package damaged.',
    rating: 4.7,
    reviewCount: 56,
    status: 'active',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'prod-5',
    name: 'Premium Platinum Silk Blend Panjabi',
    nameBn: 'প্রিমিয়াম প্লাটিনাম সিল্ক ব্লেন্ড পাঞ্জাবি',
    images: [
      'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=800&q=85',
      'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?w=800&q=85'
    ],
    description: 'Crafted from breathable premium silk-cotton blend with subtle thread embroidery on neckline and cuffs. Perfect fit for Eid, Jummah, family festivals and formal occasions.',
    shortDescription: 'Premium Silk-Cotton Blend with Fine Neckline Embroidery',
    price: 2850,
    discountPrice: 2190,
    discountPercentage: 23,
    stock: 14,
    sku: 'OF-MEN-003',
    category: "Men's Fashion",
    subcategory: 'Ethnic Wear',
    brand: 'Heritage BD',
    tags: ['panjabi', 'mens fashion', 'eid', 'traditional', 'silk'],
    isFeatured: true,
    isNewArrival: true,
    isFlashSale: false,
    specifications: [
      { label: 'Fabric', value: 'Premium Silk-Cotton Blend' },
      { label: 'Fit', value: 'Slim-Regular Traditional Cut' },
      { label: 'Sizes Available', value: '38, 40, 42, 44' },
      { label: 'Buttons', value: 'Handcrafted Metal Accents' },
      { label: 'Care', value: 'Dry Clean or Gentle Cold Hand Wash' }
    ],
    deliveryInfo: 'Home delivery all over Bangladesh. Check before payment.',
    returnInfo: 'Size exchange allowed within 5 days.',
    rating: 4.7,
    reviewCount: 19,
    status: 'active',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 'prod-6',
    name: 'GlowSecret Vitamin C Radiance Serum',
    nameBn: 'গ্লোসিক্রেট ভিটামিন সি রেডিয়েন্স সিরাম',
    images: [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=85',
      'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&q=85'
    ],
    description: 'Dermatologist-tested 15% pure Vitamin C with Hyaluronic Acid & Ferulic Acid. Brightens dark spots, promotes collagen synthesis, protects against UV stress and imparts a natural glow.',
    shortDescription: '15% Vitamin C + Hyaluronic Acid for Glowing Skin',
    price: 1450,
    discountPrice: 990,
    discountPercentage: 32,
    stock: 40,
    sku: 'OF-BEA-005',
    category: 'Beauty & Skincare',
    subcategory: 'Serums & Oils',
    brand: 'GlowSecret',
    tags: ['serum', 'skincare', 'vitamin c', 'radiance', 'beauty'],
    isFeatured: true,
    isNewArrival: false,
    isFlashSale: false,
    specifications: [
      { label: 'Volume', value: '30ml Dropper Bottle' },
      { label: 'Key Actives', value: '15% L-Ascorbic Acid + Hyaluronic Acid' },
      { label: 'Skin Type', value: 'All Skin Types (Non-Comedogenic)' },
      { label: 'Country of Origin', value: 'Korea / Formulated for South Asia' },
      { label: 'Expiry', value: '24 Months from Manufacture' }
    ],
    deliveryInfo: 'Safe and sealed tamper-proof delivery.',
    returnInfo: '100% genuine product guarantee.',
    rating: 4.8,
    reviewCount: 43,
    status: 'active',
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
  {
    id: 'prod-7',
    name: 'Royal Heritage Handwoven Jamdani Saree',
    nameBn: 'রয়্যাল হেরিটেজ হ্যান্ডওভেন জামদানি শাড়ি',
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=85',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&q=85'
    ],
    description: 'Authentic 84-count Dhakai Jamdani saree meticulously handwoven with intricate floral motifs and metallic zari border. Soft, lightweight drape that represents true Bangladeshi heritage.',
    shortDescription: 'Authentic 84 Count Dhakai Jamdani with Metallic Zari Work',
    price: 5800,
    discountPrice: 4850,
    discountPercentage: 16,
    stock: 12,
    sku: 'OF-WOM-007',
    category: "Women's Fashion",
    subcategory: 'Sarees',
    brand: 'Heritage BD',
    tags: ['saree', 'jamdani', 'womens fashion', 'traditional', 'wedding'],
    isFeatured: true,
    isNewArrival: true,
    isFlashSale: false,
    specifications: [
      { label: 'Weave', value: '84 Count Traditional Handloom' },
      { label: 'Length', value: '12 Haat (with Matching Blouse Piece)' },
      { label: 'Material', value: 'Fine Cotton-Silk Zari Weave' },
      { label: 'Origin', value: 'Rupganj, Narayanganj' },
      { label: 'Care', value: 'Dry Clean Recommended' }
    ],
    deliveryInfo: 'Free shipping on all traditional sarees across BD.',
    returnInfo: 'Check the parcel before paying courier.',
    rating: 4.9,
    reviewCount: 31,
    status: 'active',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'prod-8',
    name: 'Smart 3-in-1 Robot Vacuum Cleaner & Mop',
    nameBn: 'স্মার্ট ৩-ইন-১ রোবট ভ্যাকুয়াম ক্লিনার ও মপ',
    images: [
      'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800&q=85',
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&q=85'
    ],
    description: 'Intelligent LiDAR gyroscope navigation, 3000Pa powerful cyclone suction, electronic wet mopping water tank, app and remote control, automatic recharge dock.',
    shortDescription: 'LiDAR Gyro Navigation, 3000Pa Suction, Wet & Dry Mop',
    price: 11500,
    discountPrice: 8900,
    discountPercentage: 23,
    stock: 6,
    sku: 'OF-HOM-008',
    category: 'Home & Kitchen',
    subcategory: 'Home Appliances',
    brand: 'SmartClean',
    tags: ['vacuum', 'robot cleaner', 'home automation', 'cleaning'],
    isFeatured: true,
    isNewArrival: false,
    isFlashSale: false,
    specifications: [
      { label: 'Suction Power', value: '3000Pa Brushless Motor' },
      { label: 'Battery', value: '3200mAh Lithium (120 mins run time)' },
      { label: 'Water Tank', value: '250ml Smart Controlled' },
      { label: 'Navigation', value: 'LiDAR + Anti-Fall Infrared Sensors' },
      { label: 'Warranty', value: '1 Year Motor & Service Warranty' }
    ],
    deliveryInfo: 'Courier delivery with tracking across Bangladesh.',
    returnInfo: '7 Days money-back guarantee for technical defects.',
    rating: 4.8,
    reviewCount: 15,
    status: 'active',
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
  }
];

const INITIAL_BANNERS: Banner[] = [
  {
    id: 'ban-1',
    title: 'MEGA FLASH SALE ⚡',
    subtitle: 'Up to 35% discount on trending premium tech & wearables with instant WhatsApp ordering.',
    badge: 'Limited Time Deal',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&q=85',
    buttonText: 'Shop Flash Sale',
    link: '/shop?filter=flash',
    placement: 'homepage_hero',
    showOnHomepage: true,
    isActive: true,
    order: 1,
  },
  {
    id: 'ban-2',
    title: 'Authentic Heritage Collection 🌟',
    subtitle: 'Exquisite Dhakai Jamdani Sarees & Platinum Panjabis handcrafted for celebrations.',
    badge: 'Exclusive BD Fashion',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200&q=85',
    buttonText: 'Explore Fashion',
    link: '/shop?category=Womens+Fashion',
    placement: 'homepage_hero',
    showOnHomepage: true,
    isActive: true,
    order: 2,
  },
  {
    id: 'ban-3',
    title: 'Modern Smart Home & Kitchen',
    subtitle: 'Upgrade your daily life with high-speed air fryers, blenders, and robotic cleaners.',
    badge: 'Fast Delivery Inside Dhaka',
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1200&q=85',
    buttonText: 'Upgrade Your Home',
    link: '/shop?category=Home+%26+Kitchen',
    placement: 'promo_section',
    showOnHomepage: true,
    isActive: true,
    order: 3,
  }
];

const INITIAL_ADS: Advertisement[] = [
  {
    id: 'ad-1',
    title: 'Free Delivery on Orders over ৳3000',
    subtitle: 'Door-to-door express dispatch across 64 districts in Bangladesh.',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=85',
    buttonText: 'Start Shopping',
    targetUrl: '/shop',
    placement: 'promo_section',
    showOnHomepage: true,
    isActive: true,
  },
  {
    id: 'ad-2',
    title: 'Use Code OFFERFLOW10 for Extra 10% OFF',
    subtitle: 'Applicable on earbuds, smartwatches, and fashion wear during checkout.',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&q=85',
    buttonText: 'Claim Discount',
    targetUrl: '/shop',
    placement: 'announcement',
    showOnHomepage: true,
    isActive: true,
  }
];

const INITIAL_BLOGS: BlogPost[] = [
  {
    id: 'blog-1',
    title: 'Top 5 Smartwatch Features You Need Before Buying in 2026',
    slug: 'top-5-smartwatch-features-guide',
    excerpt: 'Thinking about getting a smartwatch in Bangladesh? Here are the critical specs like AMOLED display, battery backup, and Bluetooth calling.',
    content: `Smartwatches in Bangladesh have evolved from simple fitness bands to true daily productivity tools.
    
### 1. High-Resolution AMOLED Displays
Always-On displays with at least 500 nits of peak brightness ensure your watch face is readable even under direct midday sun in Dhaka or Chittagong.

### 2. Dual-Mic Bluetooth Calling
When commuting via rickshaw or motorcycle, having dual noise-cancelling microphones prevents wind interference, making calls crystal clear without pulling out your smartphone.

### 3. Battery Longevity
Look for watches offering 7 to 10 days of battery life on a single charge. Frequent charging hassles are a thing of the past with efficient processors.

### 4. Health and Vital Monitoring
SpO2, heart rate sensors, and sleep score tracking provide actionable insights into your daily well-being and stress levels.

### 5. Water & Dust Resistance (IP68)
In Bangladesh's monsoon climate, an IP68 rating guarantees peace of mind against sudden rain showers and sweat during workouts.`,
    featuredImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=85',
    author: 'A.Y HEJAJ',
    category: 'Gadgets & Tech',
    tags: ['smartwatch', 'buying guide', 'technology', 'gadgets bd'],
    isPublished: true,
    publishedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    seoTitle: 'Top 5 Smartwatch Features Buying Guide Bangladesh | Offer Flow',
    seoDescription: 'Expert tips on choosing the best smartwatch with Bluetooth calling and AMOLED screen in Bangladesh.',
  },
  {
    id: 'blog-2',
    title: 'How an Air Fryer Can Transform Everyday Bangladeshi Cooking',
    slug: 'how-air-fryer-transforms-bangladeshi-cooking',
    excerpt: 'From crispy beguni and singara to healthy chicken roast, discover how an air fryer saves oil and cooking time without compromising flavor.',
    content: `Traditional Bengali cuisine is famous for its rich flavors and crispy snacks. However, deep-frying in liters of oil is neither healthy nor cost-effective.

### Why Air Fryers Are Revolutionizing Kitchens:
- **85% Less Oil:** Achieve identical crispiness on snacks like samosas, shingaras, and French fries using just a light spray of mustard or olive oil.
- **Fast Reheating:** Unlike microwaves which make fried food soggy, air fryers restore that fresh, hot crunch in under 3 minutes.
- **Less Heat and Mess:** Cooking in hot summers becomes effortless without standing next to open stove flames or dealing with oil splatters.
- **Easy Clean-Up:** Detachable non-stick baskets can be rinsed in seconds.`,
    featuredImage: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=800&q=85',
    author: 'A.Y HEJAJ',
    category: 'Home & Kitchen',
    tags: ['kitchen', 'air fryer', 'healthy food', 'bangladeshi cooking'],
    isPublished: true,
    publishedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    seoTitle: 'Air Fryer Cooking Tips for Bangladeshi Households | Offer Flow',
    seoDescription: 'Learn how to cook healthier traditional snacks using an air fryer in Bangladesh.',
  }
];

const INITIAL_SETTINGS: SiteSettings = {
  websiteName: 'Offer Flow',
  tagline: 'BEST OFFERS, ENDLESS SAVINGS',
  logoUrl: '',
  contactPhone: '01745329020',
  whatsappNumber: '01745329020',
  facebookPage: 'https://facebook.com/offerflowbd',
  tiktokLink: 'https://tiktok.com/@offerflowbd',
  announcementBarText: '⚡ Welcome to Offer Flow! 10% OFF with code OFFERFLOW10 • Fast WhatsApp Ordering & Cash on Delivery across Bangladesh!',
  announcementBarActive: true,
  currencySymbol: '৳',
  currencyCode: 'BDT',
  deliveryChargeInsideDhaka: 70,
  deliveryChargeOutsideDhaka: 120,
  freeDeliveryEnabled: false,
  freeDeliveryThreshold: 3000,
  deliveryInformation: 'Inside Dhaka delivery within 24-48 hours. Outside Dhaka across all 64 districts within 2-4 working days via courier. Customers can inspect the product package upon delivery.',
  returnPolicy: 'Easy 7-day return and exchange policy for any manufacturing defect or damaged transit item. Contact us on WhatsApp (01745329020) with your order number.',
  privacyPolicy: 'Offer Flow values your personal privacy. We never share your contact or address details with any third parties other than the delivery courier handling your parcel.',
  termsAndConditions: 'All orders placed via our WhatsApp ordering system are confirmed by our representative before dispatch. Cash on Delivery is available across Bangladesh.',
  aboutUs: 'Offer Flow is a premier curated e-commerce marketplace in Bangladesh committed to bringing verified gadgets, lifestyle essentials, authentic ethnic fashion, and home appliances at competitive honest prices with seamless WhatsApp convenience.',
  footerCopyright: '© Offer Flow — All Rights Reserved',
  footerCredit: 'App/Web by A.Y HEJAJ',
};

const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'cpn-1',
    code: 'OFFERFLOW10',
    type: 'percentage',
    value: 10,
    minOrderValue: 1000,
    maxDiscount: 500,
    usageLimit: 500,
    timesUsed: 42,
    isActive: true,
  },
  {
    id: 'cpn-2',
    code: 'EID200',
    type: 'fixed',
    value: 200,
    minOrderValue: 1500,
    maxDiscount: 200,
    usageLimit: 200,
    timesUsed: 18,
    isActive: true,
  }
];

const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-1001',
    orderNumber: 'OF-2026-1001',
    customerName: 'Tanvir Hossain',
    phone: '01711223344',
    address: 'House 42, Road 7, Block D, Banani',
    district: 'Dhaka',
    area: 'Banani',
    items: [
      {
        productId: 'prod-1',
        productName: 'SoundPro ANC Wireless Earbuds',
        price: 2490,
        originalPrice: 3450,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=85',
        sku: 'OF-ACC-006'
      }
    ],
    subtotal: 2490,
    discount: 0,
    deliveryFee: 60,
    total: 2550,
    status: 'delivered',
    paymentMethod: 'whatsapp_cod',
    internalNotes: 'Customer confirmed via WhatsApp call. Delivered smoothly.',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'ord-1002',
    orderNumber: 'OF-2026-1002',
    customerName: 'Shakil Ahmed',
    phone: '01822334455',
    address: 'GEC Circle, Nasirabad',
    district: 'Chattogram',
    area: 'Nasirabad',
    items: [
      {
        productId: 'prod-2',
        productName: 'Titan Pulse Smartwatch Ultra 2',
        price: 3850,
        originalPrice: 4990,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=85',
        sku: 'OF-GAD-002'
      }
    ],
    subtotal: 3850,
    discount: 200,
    couponCode: 'EID200',
    deliveryFee: 120,
    total: 3770,
    status: 'shipped',
    paymentMethod: 'whatsapp_cod',
    internalNotes: 'Dispatched via Steadfast Courier. Tracking ID: ST-88291.',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ord-1003',
    orderNumber: 'OF-2026-1003',
    customerName: 'Nusrat Jahan',
    phone: '01933445566',
    address: 'Sector 4, Road 12, Uttara',
    district: 'Dhaka',
    area: 'Uttara',
    items: [
      {
        productId: 'prod-7',
        productName: 'Royal Heritage Handwoven Jamdani Saree',
        price: 4850,
        originalPrice: 5800,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=85',
        sku: 'OF-WOM-007'
      }
    ],
    subtotal: 4850,
    discount: 485,
    couponCode: 'OFFERFLOW10',
    deliveryFee: 0,
    total: 4365,
    status: 'pending',
    paymentMethod: 'whatsapp_cod',
    internalNotes: 'New order placed via WhatsApp checkout. Awaiting packaging.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    name: 'Tanvir Hossain',
    phone: '01711223344',
    address: 'House 42, Road 7, Block D, Banani',
    district: 'Dhaka',
    totalPurchases: 2550,
    totalOrders: 1,
    lastOrderDate: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'cust-2',
    name: 'Shakil Ahmed',
    phone: '01822334455',
    address: 'GEC Circle, Nasirabad',
    district: 'Chattogram',
    totalPurchases: 3770,
    totalOrders: 1,
    lastOrderDate: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'cust-3',
    name: 'Nusrat Jahan',
    phone: '01933445566',
    address: 'Sector 4, Road 12, Uttara',
    district: 'Dhaka',
    totalPurchases: 4365,
    totalOrders: 1,
    lastOrderDate: new Date().toISOString(),
  }
];

const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    productId: 'prod-1',
    productName: 'SoundPro ANC Wireless Earbuds',
    customerName: 'Rahim Ullah',
    rating: 5,
    comment: 'The sound quality and active noise cancelling are awesome for this price! Battery lasts for days. Delivery in Dhaka was within 24 hours.',
    isApproved: true,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'rev-2',
    productId: 'prod-2',
    productName: 'Titan Pulse Smartwatch Ultra 2',
    customerName: 'Mehedi Hasan',
    rating: 5,
    comment: 'Bluetooth calling is super clear. Screen is bright and smooth AMOLED. Really satisfied with Offer Flow service.',
    isApproved: true,
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  }
];

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE_PATH)) {
        const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          products: parsed.products || INITIAL_PRODUCTS,
          categories: parsed.categories || INITIAL_CATEGORIES,
          banners: parsed.banners || INITIAL_BANNERS,
          advertisements: parsed.advertisements || INITIAL_ADS,
          orders: parsed.orders || INITIAL_ORDERS,
          customers: parsed.customers || INITIAL_CUSTOMERS,
          reviews: parsed.reviews || INITIAL_REVIEWS,
          blogs: parsed.blogs || INITIAL_BLOGS,
          coupons: parsed.coupons || INITIAL_COUPONS,
          flashSale: parsed.flashSale || {
            isActive: true,
            title: 'FLASH SALE',
            titleBn: 'ফ্ল্যাশ সেল',
            endTime: new Date(Date.now() + 86400000 * 3).toISOString(),
            discountHighlight: 'Up to 40% OFF',
          },
          settings: { ...INITIAL_SETTINGS, ...(parsed.settings || {}) },
          adminTokens: parsed.adminTokens || [],
        };
      }
    } catch (err) {
      console.error('Failed to read database file, initializing defaults:', err);
    }

    const initial: DatabaseSchema = {
      products: INITIAL_PRODUCTS,
      categories: INITIAL_CATEGORIES,
      banners: INITIAL_BANNERS,
      advertisements: INITIAL_ADS,
      orders: INITIAL_ORDERS,
      customers: INITIAL_CUSTOMERS,
      reviews: INITIAL_REVIEWS,
      blogs: INITIAL_BLOGS,
      coupons: INITIAL_COUPONS,
      flashSale: {
        isActive: true,
        title: 'FLASH SALE',
        titleBn: 'ফ্ল্যাশ সেল',
        endTime: new Date(Date.now() + 86400000 * 3).toISOString(),
        discountHighlight: 'Up to 40% OFF',
      },
      settings: INITIAL_SETTINGS,
      adminTokens: [],
    };

    this.saveData(initial);
    return initial;
  }

  private saveData(dataToSave?: DatabaseSchema) {
    try {
      const dir = path.dirname(DB_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(dataToSave || this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error writing database to disk:', err);
    }
  }

  // PRODUCTS
  getProducts(filters?: { category?: string; search?: string; tag?: string; isFlashSale?: boolean; isFeatured?: boolean }) {
    let list = [...this.data.products];
    if (filters) {
      if (filters.category && filters.category !== 'all') {
        const catLower = filters.category.toLowerCase();
        list = list.filter(p => p.category.toLowerCase() === catLower || p.category.toLowerCase().includes(catLower));
      }
      if (filters.isFlashSale) {
        list = list.filter(p => p.isFlashSale);
      }
      if (filters.isFeatured) {
        list = list.filter(p => p.isFeatured);
      }
      if (filters.search) {
        const q = filters.search.toLowerCase().trim();
        list = list.filter(p =>
          p.name.toLowerCase().includes(q) ||
          (p.nameBn && p.nameBn.toLowerCase().includes(q)) ||
          p.brand.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.tags.some(t => t.toLowerCase().includes(q))
        );
      }
    }
    return list;
  }

  getProductById(id: string) {
    return this.data.products.find(p => p.id === id);
  }

  addProduct(productData: Omit<Product, 'id' | 'createdAt'>) {
    const id = 'prod-' + Date.now();
    const newProd: Product = {
      ...productData,
      id,
      createdAt: new Date().toISOString(),
    };
    this.data.products.unshift(newProd);
    this.saveData();
    return newProd;
  }

  updateProduct(id: string, updates: Partial<Product>) {
    const idx = this.data.products.findIndex(p => p.id === id);
    if (idx === -1) return null;
    this.data.products[idx] = { ...this.data.products[idx], ...updates };
    this.saveData();
    return this.data.products[idx];
  }

  deleteProduct(id: string) {
    const idx = this.data.products.findIndex(p => p.id === id);
    if (idx === -1) return false;
    this.data.products.splice(idx, 1);
    this.saveData();
    return true;
  }

  duplicateProduct(id: string) {
    const prod = this.getProductById(id);
    if (!prod) return null;
    const newProd: Product = {
      ...prod,
      id: 'prod-' + Date.now(),
      name: `${prod.name} (Copy)`,
      sku: `${prod.sku}-COPY`,
      createdAt: new Date().toISOString(),
    };
    this.data.products.unshift(newProd);
    this.saveData();
    return newProd;
  }

  // CATEGORIES
  getCategories() {
    return [...this.data.categories].sort((a, b) => a.order - b.order);
  }

  addCategory(category: Omit<Category, 'id'>) {
    const newCat: Category = {
      ...category,
      id: 'cat-' + Date.now(),
      order: category.order || this.data.categories.length + 1,
    };
    this.data.categories.push(newCat);
    this.saveData();
    return newCat;
  }

  updateCategory(id: string, updates: Partial<Category>) {
    const idx = this.data.categories.findIndex(c => c.id === id);
    if (idx === -1) return null;
    this.data.categories[idx] = { ...this.data.categories[idx], ...updates };
    this.saveData();
    return this.data.categories[idx];
  }

  deleteCategory(id: string) {
    const idx = this.data.categories.findIndex(c => c.id === id);
    if (idx === -1) return false;
    this.data.categories.splice(idx, 1);
    this.saveData();
    return true;
  }

  // BANNERS
  getBanners(placement?: string) {
    let list = [...this.data.banners];
    if (placement) {
      list = list.filter(b => b.placement === placement);
    }
    return list.sort((a, b) => a.order - b.order);
  }

  addBanner(banner: Omit<Banner, 'id'>) {
    const newBanner: Banner = {
      ...banner,
      id: 'ban-' + Date.now(),
      order: banner.order || this.data.banners.length + 1,
    };
    this.data.banners.push(newBanner);
    this.saveData();
    return newBanner;
  }

  updateBanner(id: string, updates: Partial<Banner>) {
    const idx = this.data.banners.findIndex(b => b.id === id);
    if (idx === -1) return null;
    this.data.banners[idx] = { ...this.data.banners[idx], ...updates };
    this.saveData();
    return this.data.banners[idx];
  }

  deleteBanner(id: string) {
    const idx = this.data.banners.findIndex(b => b.id === id);
    if (idx === -1) return false;
    this.data.banners.splice(idx, 1);
    this.saveData();
    return true;
  }

  // ADS
  getAdvertisements() {
    return [...this.data.advertisements];
  }

  addAdvertisement(ad: Omit<Advertisement, 'id'>) {
    const newAd: Advertisement = {
      ...ad,
      id: 'ad-' + Date.now(),
    };
    this.data.advertisements.push(newAd);
    this.saveData();
    return newAd;
  }

  updateAdvertisement(id: string, updates: Partial<Advertisement>) {
    const idx = this.data.advertisements.findIndex(a => a.id === id);
    if (idx === -1) return null;
    this.data.advertisements[idx] = { ...this.data.advertisements[idx], ...updates };
    this.saveData();
    return this.data.advertisements[idx];
  }

  deleteAdvertisement(id: string) {
    const idx = this.data.advertisements.findIndex(a => a.id === id);
    if (idx === -1) return false;
    this.data.advertisements.splice(idx, 1);
    this.saveData();
    return true;
  }

  // ORDERS
  getOrders() {
    return [...this.data.orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>) {
    const count = this.data.orders.length + 1001;
    const orderNumber = `OF-${new Date().getFullYear()}-${count}`;
    const newOrder: Order = {
      ...orderData,
      id: 'ord-' + Date.now(),
      orderNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Update product stocks
    for (const item of newOrder.items) {
      const prod = this.data.products.find(p => p.id === item.productId);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
      }
    }

    // Update customer registry
    const existingCust = this.data.customers.find(c => c.phone === newOrder.phone);
    if (existingCust) {
      existingCust.totalPurchases += newOrder.total;
      existingCust.totalOrders += 1;
      existingCust.lastOrderDate = newOrder.createdAt;
      existingCust.address = newOrder.address;
    } else {
      this.data.customers.push({
        id: 'cust-' + Date.now(),
        name: newOrder.customerName,
        phone: newOrder.phone,
        address: newOrder.address,
        district: newOrder.district,
        totalPurchases: newOrder.total,
        totalOrders: 1,
        lastOrderDate: newOrder.createdAt,
      });
    }

    this.data.orders.unshift(newOrder);
    this.saveData();
    return newOrder;
  }

  updateOrderStatus(id: string, status: Order['status'], internalNotes?: string) {
    const order = this.data.orders.find(o => o.id === id);
    if (!order) return null;
    order.status = status;
    if (internalNotes !== undefined) {
      order.internalNotes = internalNotes;
    }
    order.updatedAt = new Date().toISOString();
    this.saveData();
    return order;
  }

  // CUSTOMERS
  getCustomers() {
    return [...this.data.customers];
  }

  // BLOGS
  getBlogs() {
    return [...this.data.blogs].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }

  getBlogBySlug(slug: string) {
    return this.data.blogs.find(b => b.slug === slug);
  }

  addBlog(blogData: Omit<BlogPost, 'id' | 'publishedAt'>) {
    const newBlog: BlogPost = {
      ...blogData,
      id: 'blog-' + Date.now(),
      publishedAt: new Date().toISOString(),
    };
    this.data.blogs.unshift(newBlog);
    this.saveData();
    return newBlog;
  }

  updateBlog(id: string, updates: Partial<BlogPost>) {
    const idx = this.data.blogs.findIndex(b => b.id === id);
    if (idx === -1) return null;
    this.data.blogs[idx] = { ...this.data.blogs[idx], ...updates };
    this.saveData();
    return this.data.blogs[idx];
  }

  deleteBlog(id: string) {
    const idx = this.data.blogs.findIndex(b => b.id === id);
    if (idx === -1) return false;
    this.data.blogs.splice(idx, 1);
    this.saveData();
    return true;
  }

  // COUPONS
  getCoupons() {
    return [...this.data.coupons];
  }

  validateCoupon(code: string, cartTotal: number) {
    const coupon = this.data.coupons.find(c => c.code.toUpperCase() === code.toUpperCase() && c.isActive);
    if (!coupon) {
      return { valid: false, message: 'Invalid or inactive coupon code' };
    }
    if (cartTotal < coupon.minOrderValue) {
      return {
        valid: false,
        message: `Minimum order amount for this coupon is ৳${coupon.minOrderValue}`,
      };
    }
    if (coupon.usageLimit && coupon.timesUsed >= coupon.usageLimit) {
      return { valid: false, message: 'This coupon usage limit has been reached' };
    }

    let discount = 0;
    if (coupon.type === 'percentage') {
      discount = Math.round((cartTotal * coupon.value) / 100);
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = coupon.value;
    }

    return {
      valid: true,
      coupon,
      discount,
      message: `Coupon applied: ৳${discount} discount`,
    };
  }

  addCoupon(coupon: Omit<Coupon, 'id' | 'timesUsed'>) {
    const newCoupon: Coupon = {
      ...coupon,
      id: 'cpn-' + Date.now(),
      timesUsed: 0,
    };
    this.data.coupons.push(newCoupon);
    this.saveData();
    return newCoupon;
  }

  updateCoupon(id: string, updates: Partial<Coupon>) {
    const idx = this.data.coupons.findIndex(c => c.id === id);
    if (idx === -1) return null;
    this.data.coupons[idx] = { ...this.data.coupons[idx], ...updates };
    this.saveData();
    return this.data.coupons[idx];
  }

  deleteCoupon(id: string) {
    const idx = this.data.coupons.findIndex(c => c.id === id);
    if (idx === -1) return false;
    this.data.coupons.splice(idx, 1);
    this.saveData();
    return true;
  }

  // FLASH SALE
  getFlashSale() {
    return this.data.flashSale;
  }

  updateFlashSale(config: Partial<FlashSaleConfig>) {
    this.data.flashSale = { ...this.data.flashSale, ...config };
    this.saveData();
    return this.data.flashSale;
  }

  // REVIEWS
  getReviews(productId?: string) {
    if (productId) {
      return this.data.reviews.filter(r => r.productId === productId);
    }
    return [...this.data.reviews];
  }

  addReview(review: Omit<Review, 'id' | 'isApproved' | 'createdAt'>) {
    const newReview: Review = {
      ...review,
      id: 'rev-' + Date.now(),
      isApproved: true, // auto-approve or can be moderated in admin
      createdAt: new Date().toISOString(),
    };
    this.data.reviews.unshift(newReview);

    // recalculate product rating
    const prodReviews = this.data.reviews.filter(r => r.productId === review.productId);
    const prod = this.data.products.find(p => p.id === review.productId);
    if (prod) {
      const avg = prodReviews.reduce((acc, r) => acc + r.rating, 0) / prodReviews.length;
      prod.rating = parseFloat(avg.toFixed(1));
      prod.reviewCount = prodReviews.length;
    }

    this.saveData();
    return newReview;
  }

  updateReview(id: string, updates: Partial<Review>) {
    const idx = this.data.reviews.findIndex(r => r.id === id);
    if (idx === -1) return null;
    this.data.reviews[idx] = { ...this.data.reviews[idx], ...updates };
    this.saveData();
    return this.data.reviews[idx];
  }

  deleteReview(id: string) {
    const idx = this.data.reviews.findIndex(r => r.id === id);
    if (idx === -1) return false;
    this.data.reviews.splice(idx, 1);
    this.saveData();
    return true;
  }

  // SETTINGS
  getSettings() {
    return this.data.settings;
  }

  updateSettings(updates: Partial<SiteSettings>) {
    this.data.settings = { ...this.data.settings, ...updates };
    this.saveData();
    return this.data.settings;
  }

  // ADMIN AUTH & SESSIONS
  createAdminToken() {
    const token = 'oftk_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    const expiresAt = Date.now() + 86400000 * 7; // 7 days
    this.data.adminTokens.push({ token, expiresAt });
    // clean expired tokens
    this.data.adminTokens = this.data.adminTokens.filter(t => t.expiresAt > Date.now());
    this.saveData();
    return token;
  }

  verifyAdminToken(token: string) {
    if (!token) return false;
    const match = this.data.adminTokens.find(t => t.token === token && t.expiresAt > Date.now());
    return !!match;
  }

  removeAdminToken(token: string) {
    this.data.adminTokens = this.data.adminTokens.filter(t => t.token !== token);
    this.saveData();
  }

  // STATS
  getDashboardStats() {
    const totalProducts = this.data.products.length;
    const totalOrders = this.data.orders.length;
    const pendingOrders = this.data.orders.filter(o => o.status === 'pending').length;
    const completedOrders = this.data.orders.filter(o => o.status === 'delivered').length;
    const totalCustomers = this.data.customers.length;
    const totalBlogPosts = this.data.blogs.length;
    const activeAds = this.data.advertisements.filter(a => a.isActive).length + this.data.banners.filter(b => b.isActive).length;
    const totalStock = this.data.products.reduce((acc, p) => acc + p.stock, 0);
    const lowStockProducts = this.data.products.filter(p => p.stock <= 10).length;
    const totalRevenue = this.data.orders
      .filter(o => o.status !== 'cancelled')
      .reduce((acc, o) => acc + o.total, 0);

    return {
      totalProducts,
      totalOrders,
      pendingOrders,
      completedOrders,
      totalCustomers,
      totalBlogPosts,
      activeAds,
      totalStock,
      lowStockProducts,
      totalRevenue,
      recentOrders: this.data.orders.slice(0, 5),
    };
  }
}

export const db = new Database();
