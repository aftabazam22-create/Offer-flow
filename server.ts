import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db.js';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Auth Middleware for Admin Routes
const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized. Admin token required.' });
  }
  const token = authHeader.split(' ')[1];
  if (!db.verifyAdminToken(token)) {
    return res.status(403).json({ error: 'Invalid or expired admin session. Please login again.' });
  }
  next();
};

// ==========================================
// AUTHENTICATION APIS
// ==========================================
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const configuredUser = process.env.ADMIN_USERNAME || 'hejaj';
  const configuredPass = process.env.ADMIN_PASSWORD || 'afra';

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  if (username.trim().toLowerCase() === configuredUser.toLowerCase() && password === configuredPass) {
    const token = db.createAdminToken();
    return res.json({
      success: true,
      token,
      user: {
        username: configuredUser,
        role: 'Super Admin',
        name: 'A.Y HEJAJ',
      },
    });
  }

  return res.status(401).json({ error: 'Invalid admin username or password' });
});

app.get('/api/auth/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ valid: false });
  }
  const token = authHeader.split(' ')[1];
  const isValid = db.verifyAdminToken(token);
  if (!isValid) {
    return res.status(401).json({ valid: false });
  }
  return res.json({
    valid: true,
    user: {
      username: process.env.ADMIN_USERNAME || 'hejaj',
      role: 'Super Admin',
      name: 'A.Y HEJAJ',
    },
  });
});

app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    db.removeAdminToken(token);
  }
  res.json({ success: true });
});

// ==========================================
// PRODUCTS APIS
// ==========================================
app.get('/api/products', (req, res) => {
  const { category, search, tag, isFlashSale, isFeatured } = req.query;
  const products = db.getProducts({
    category: category as string,
    search: search as string,
    tag: tag as string,
    isFlashSale: isFlashSale === 'true',
    isFeatured: isFeatured === 'true',
  });
  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const product = db.getProductById(req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
});

app.post('/api/products', requireAdmin, (req, res) => {
  try {
    const product = db.addProduct(req.body);
    res.status(201).json(product);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to create product' });
  }
});

app.put('/api/products/:id', requireAdmin, (req, res) => {
  const updated = db.updateProduct(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(updated);
});

app.delete('/api/products/:id', requireAdmin, (req, res) => {
  const success = db.deleteProduct(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json({ success: true });
});

app.post('/api/products/:id/duplicate', requireAdmin, (req, res) => {
  const duplicated = db.duplicateProduct(req.params.id);
  if (!duplicated) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.status(201).json(duplicated);
});

// ==========================================
// CATEGORIES APIS
// ==========================================
app.get('/api/categories', (req, res) => {
  res.json(db.getCategories());
});

app.post('/api/categories', requireAdmin, (req, res) => {
  const cat = db.addCategory(req.body);
  res.status(201).json(cat);
});

app.put('/api/categories/:id', requireAdmin, (req, res) => {
  const updated = db.updateCategory(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Category not found' });
  res.json(updated);
});

app.delete('/api/categories/:id', requireAdmin, (req, res) => {
  const success = db.deleteCategory(req.params.id);
  if (!success) return res.status(404).json({ error: 'Category not found' });
  res.json({ success: true });
});

// ==========================================
// BANNERS APIS
// ==========================================
app.get('/api/banners', (req, res) => {
  const { placement } = req.query;
  res.json(db.getBanners(placement as string));
});

app.post('/api/banners', requireAdmin, (req, res) => {
  const banner = db.addBanner(req.body);
  res.status(201).json(banner);
});

app.put('/api/banners/:id', requireAdmin, (req, res) => {
  const updated = db.updateBanner(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Banner not found' });
  res.json(updated);
});

app.delete('/api/banners/:id', requireAdmin, (req, res) => {
  const success = db.deleteBanner(req.params.id);
  if (!success) return res.status(404).json({ error: 'Banner not found' });
  res.json({ success: true });
});

// ==========================================
// ADS APIS
// ==========================================
app.get('/api/ads', (req, res) => {
  res.json(db.getAdvertisements());
});

app.post('/api/ads', requireAdmin, (req, res) => {
  const ad = db.addAdvertisement(req.body);
  res.status(201).json(ad);
});

app.put('/api/ads/:id', requireAdmin, (req, res) => {
  const updated = db.updateAdvertisement(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Advertisement not found' });
  res.json(updated);
});

app.delete('/api/ads/:id', requireAdmin, (req, res) => {
  const success = db.deleteAdvertisement(req.params.id);
  if (!success) return res.status(404).json({ error: 'Advertisement not found' });
  res.json({ success: true });
});

// ==========================================
// ORDERS APIS
// ==========================================
app.get('/api/orders', requireAdmin, (req, res) => {
  res.json(db.getOrders());
});

app.post('/api/orders', (req, res) => {
  try {
    const order = db.createOrder(req.body);
    res.status(201).json(order);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to record order' });
  }
});

app.put('/api/orders/:id/status', requireAdmin, (req, res) => {
  const { status, internalNotes } = req.body;
  const updated = db.updateOrderStatus(req.params.id, status, internalNotes);
  if (!updated) return res.status(404).json({ error: 'Order not found' });
  res.json(updated);
});

// ==========================================
// CUSTOMERS APIS
// ==========================================
app.get('/api/customers', requireAdmin, (req, res) => {
  res.json(db.getCustomers());
});

// ==========================================
// BLOGS APIS
// ==========================================
app.get('/api/blogs', (req, res) => {
  res.json(db.getBlogs());
});

app.get('/api/blogs/:slug', (req, res) => {
  const blog = db.getBlogBySlug(req.params.slug);
  if (!blog) return res.status(404).json({ error: 'Blog not found' });
  res.json(blog);
});

app.post('/api/blogs', requireAdmin, (req, res) => {
  const blog = db.addBlog(req.body);
  res.status(201).json(blog);
});

app.put('/api/blogs/:id', requireAdmin, (req, res) => {
  const updated = db.updateBlog(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Blog not found' });
  res.json(updated);
});

app.delete('/api/blogs/:id', requireAdmin, (req, res) => {
  const success = db.deleteBlog(req.params.id);
  if (!success) return res.status(404).json({ error: 'Blog not found' });
  res.json({ success: true });
});

// ==========================================
// COUPONS APIS
// ==========================================
app.get('/api/coupons', requireAdmin, (req, res) => {
  res.json(db.getCoupons());
});

app.post('/api/coupons/validate', (req, res) => {
  const { code, cartTotal } = req.body;
  if (!code) return res.status(400).json({ valid: false, message: 'Coupon code is required' });
  const result = db.validateCoupon(code, Number(cartTotal) || 0);
  res.json(result);
});

app.post('/api/coupons', requireAdmin, (req, res) => {
  const coupon = db.addCoupon(req.body);
  res.status(201).json(coupon);
});

app.put('/api/coupons/:id', requireAdmin, (req, res) => {
  const updated = db.updateCoupon(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Coupon not found' });
  res.json(updated);
});

app.delete('/api/coupons/:id', requireAdmin, (req, res) => {
  const success = db.deleteCoupon(req.params.id);
  if (!success) return res.status(404).json({ error: 'Coupon not found' });
  res.json({ success: true });
});

// ==========================================
// FLASH SALE APIS
// ==========================================
app.get('/api/flash-sale', (req, res) => {
  res.json(db.getFlashSale());
});

app.put('/api/flash-sale', requireAdmin, (req, res) => {
  const updated = db.updateFlashSale(req.body);
  res.json(updated);
});

// ==========================================
// REVIEWS APIS
// ==========================================
app.get('/api/reviews', (req, res) => {
  const { productId } = req.query;
  res.json(db.getReviews(productId as string));
});

app.post('/api/reviews', (req, res) => {
  try {
    const review = db.addReview(req.body);
    res.status(201).json(review);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to submit review' });
  }
});

app.put('/api/reviews/:id', requireAdmin, (req, res) => {
  const updated = db.updateReview(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Review not found' });
  res.json(updated);
});

app.delete('/api/reviews/:id', requireAdmin, (req, res) => {
  const success = db.deleteReview(req.params.id);
  if (!success) return res.status(404).json({ error: 'Review not found' });
  res.json({ success: true });
});

// ==========================================
// SITE SETTINGS APIS
// ==========================================
app.get('/api/settings', (req, res) => {
  res.json(db.getSettings());
});

app.put('/api/settings', requireAdmin, (req, res) => {
  const updated = db.updateSettings(req.body);
  res.json(updated);
});

// ==========================================
// STATS API
// ==========================================
app.get('/api/stats', requireAdmin, (req, res) => {
  res.json(db.getDashboardStats());
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// ==========================================
// VITE MIDDLEWARE & STATIC ASSETS
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Offer Flow server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
