'use client';

import React, { useEffect, useState } from 'react';
import {
  LayoutDashboard, Gift, ShoppingCart, Users, ClipboardCheck,
  Building, CheckCircle2, Play, Package, Eye, LogOut, Lock, Mail,
  Plus, Edit, Trash2, Calendar, FileText, Check, AlertTriangle, Layers
} from 'lucide-react';
import api from '../utils/api';
import useAuthStore from '../store/authStore';

export default function AdminConsole() {
  const { user, token, initialize, login, logout, loading: authLoading } = useAuthStore();
  const [initialized, setInitialized] = useState(false);

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Dashboard tab state
  const [activeTab, setActiveTab] = useState('overview');

  // Stats state
  const [stats, setStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Products CRUD State
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [showProductForm, setShowProductForm] = useState(false);

  // Product Form Fields
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [stock, setStock] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [customizable, setCustomizable] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  // Orders State
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Personalization Queue State
  const [customQueue, setCustomQueue] = useState<any[]>([]);
  const [queueLoading, setQueueLoading] = useState(false);

  // Corporate Leads State
  const [leads, setLeads] = useState<any[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [quoteDetails, setQuoteDetails] = useState('');
  const [quoteValidUntil, setQuoteValidUntil] = useState('');

  // CMS/Banners State
  const [blogs, setBlogs] = useState<any[]>([]);
  const [blogsLoading, setBlogsLoading] = useState(false);
  const [showBlogForm, setShowBlogForm] = useState(false);
  const [blogTitle, setBlogTitle] = useState('');
  const [blogSlug, setBlogSlug] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [blogAuthor, setBlogAuthor] = useState('');
  const [blogImage, setBlogImage] = useState('');

  // Initialize Authentication State
  useEffect(() => {
    initialize().then(() => setInitialized(true));
  }, []);

  // Load stats when dashboard is active and user is logged in
  useEffect(() => {
    if (initialized && token && user && activeTab === 'overview') {
      loadStats();
    }
  }, [initialized, token, user, activeTab]);

  // Load tab data
  useEffect(() => {
    if (!initialized || !token) return;
    if (activeTab === 'products') loadProducts();
    if (activeTab === 'orders') loadOrders();
    if (activeTab === 'customizations') loadCustomQueue();
    if (activeTab === 'corporate') loadLeads();
    if (activeTab === 'blogs') loadBlogs();
  }, [initialized, token, activeTab]);

  const loadStats = async () => {
    setStatsLoading(true);
    try {
      const res = await api.get<any>('/admin/dashboard');
      setStats(res);
    } catch (e) {
      console.error('Failed to load dashboard metrics', e);
    } finally {
      setStatsLoading(false);
    }
  };

  const loadProducts = async () => {
    setProductsLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get<any[]>('/products/admin'),
        api.get<any[]>('/products/categories'),
      ]);
      setProducts(prodRes);
      setCategories(catRes);
      if (catRes.length > 0 && !categoryId) setCategoryId(catRes[0].id);
    } catch (e) {
      console.error('Failed to load products/categories', e);
    } finally {
      setProductsLoading(false);
    }
  };

  const loadOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await api.get<any[]>('/orders/admin');
      setOrders(res);
    } catch (e) {
      console.error('Failed to load orders pipeline', e);
    } finally {
      setOrdersLoading(false);
    }
  };

  const loadCustomQueue = async () => {
    setQueueLoading(true);
    try {
      const res = await api.get<any[]>('/admin/customization-queue');
      setCustomQueue(res);
    } catch (e) {
      console.error('Failed to load customization queue', e);
    } finally {
      setQueueLoading(false);
    }
  };

  const loadLeads = async () => {
    setLeadsLoading(true);
    try {
      const res = await api.get<any[]>('/corporate/leads');
      setLeads(res);
    } catch (e) {
      console.error('Failed to load corporate leads', e);
    } finally {
      setLeadsLoading(false);
    }
  };

  const loadBlogs = async () => {
    setBlogsLoading(true);
    try {
      const res = await api.get<any[]>('/blog');
      setBlogs(res);
    } catch (e) {
      // Create empty array fallback if blogs API doesn't exist yet
      setBlogs([]);
      console.error('Failed to load blogs', e);
    } finally {
      setBlogsLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      await login({ email, password });
    } catch (err: any) {
      setLoginError(err.message || 'Authentication failed. Please check credentials.');
    }
  };

  // Create or Update Product
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      sku,
      name,
      description,
      price: Number(price),
      costPrice: Number(costPrice),
      stock: Number(stock),
      categoryId,
      customizable,
      images: imageUrl ? [imageUrl] : undefined,
    };

    try {
      if (editProduct) {
        await api.put(`/products/${editProduct.id}`, payload);
      } else {
        await api.post('/products', payload);
      }
      setShowProductForm(false);
      setEditProduct(null);
      loadProducts();
    } catch (err: any) {
      alert(err.message || 'Save product failed');
    }
  };

  const triggerEditProduct = (prod: any) => {
    setEditProduct(prod);
    setSku(prod.sku);
    setName(prod.name);
    setDescription(prod.description);
    setPrice(prod.price.toString());
    setCostPrice(prod.costPrice.toString());
    setStock(prod.stock.toString());
    setCategoryId(prod.categoryId);
    setCustomizable(prod.customizable);
    setImageUrl(prod.images?.[0]?.url || '');
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      loadProducts();
    } catch (err: any) {
      alert(err.message || 'Product delete failed');
    }
  };

  // Update order pipeline status
  const handleUpdateOrderStatus = async (orderId: string, nextStatus: string) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: nextStatus });
      loadOrders();
    } catch (err: any) {
      alert(err.message || 'Order status update failed');
    }
  };

  // Approve/Reject personalized items
  const handleApproveCustomization = async (itemId: string, status: 'APPROVED' | 'REVISION_REQUIRED') => {
    try {
      await api.put(`/admin/customization-queue/${itemId}`, { status });
      loadCustomQueue();
    } catch (err: any) {
      alert(err.message || 'Customization status update failed');
    }
  };

  // Generate Quotation
  const handleCreateQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;
    try {
      const payload = {
        leadId: selectedLead.id,
        validUntil: new Date(quoteValidUntil).toISOString(),
        details: quoteDetails,
      };
      await api.post('/corporate/quotation', payload);
      setSelectedLead(null);
      setQuoteDetails('');
      setQuoteValidUntil('');
      loadLeads();
    } catch (err: any) {
      alert(err.message || 'Quotation creation failed');
    }
  };

  // Create Blog Post
  const handleBlogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: blogTitle,
      slug: blogSlug || blogTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''),
      content: blogContent,
      author: blogAuthor || 'Diya Admin',
      imageUrl: blogImage || undefined,
    };
    try {
      await api.post('/blog', payload);
      setShowBlogForm(false);
      setBlogTitle('');
      setBlogSlug('');
      setBlogContent('');
      setBlogAuthor('');
      setBlogImage('');
      loadBlogs();
    } catch (err: any) {
      alert(err.message || 'Failed to publish blog post');
    }
  };

  if (!initialized || authLoading) {
    return (
      <div className="min-h-screen bg-obsidian-950 flex items-center justify-center">
        <div className="text-gold-400 font-serif tracking-widest animate-pulse">
          INITIALIZING OPERATIONS CONTROL...
        </div>
      </div>
    );
  }

  // Auth Guard: Render Login Screen if not logged in
  if (!token || !user) {
    return (
      <div className="min-h-screen bg-obsidian-950 flex items-center justify-center px-4 relative overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-gold-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-bronze-600/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-md w-full glass-panel p-8 rounded-lg space-y-6 relative border-gold-500/20">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-serif font-bold text-gold-400 tracking-wider">DIYA CREATION</h1>
            <p className="text-xs uppercase tracking-widest text-obsidian-400 font-semibold">Operations Control Console</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {loginError && (
              <div className="bg-red-950/20 border border-red-500/30 text-red-400 text-xs p-3.5 rounded flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-gold-400 block tracking-wider">Operational Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-obsidian-500" />
                <input
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@diyacreation.com"
                  className="w-full bg-obsidian-900/50 border border-gold-500/10 rounded py-2 pl-9 pr-3 text-xs outline-none text-obsidian-50 focus:border-gold-500/30"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-gold-400 block tracking-wider">Security Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-obsidian-500" />
                <input
                  type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-obsidian-900/50 border border-gold-500/10 rounded py-2 pl-9 pr-3 text-xs outline-none text-obsidian-50 focus:border-gold-500/30"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gold-500 hover:bg-gold-600 text-obsidian-950 font-bold py-3 rounded text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all gold-glow cursor-pointer mt-6"
            >
              <Lock className="h-3.5 w-3.5" />
              <span>Authorize Access</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Dashboard layout
  return (
    <div className="min-h-screen bg-obsidian-950 text-obsidian-50 flex flex-col font-sans">
      {/* Top Header */}
      <header className="border-b border-gold-500/10 bg-obsidian-900/40 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="bg-gold-500/10 border border-gold-500/30 w-8 h-8 rounded flex items-center justify-center">
            <Gift className="h-4 w-4 text-gold-400" />
          </div>
          <div>
            <h1 className="text-lg font-serif font-bold text-gold-400 tracking-wider">DIYA CREATION</h1>
            <p className="text-[9px] uppercase tracking-widest text-obsidian-400 font-bold">Standalone Admin Control</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-semibold text-obsidian-100">{user.name}</div>
            <div className="text-[9px] uppercase tracking-wider text-gold-400 font-bold">{user.role}</div>
          </div>
          <button
            onClick={logout}
            className="bg-obsidian-900 hover:bg-obsidian-850 border border-gold-500/10 hover:border-gold-500/30 text-obsidian-300 p-2 rounded transition-colors flex items-center justify-center cursor-pointer"
            title="Secure Sign Out"
          >
            <LogOut className="h-4 w-4 text-red-400" />
          </button>
        </div>
      </header>

      {/* Main Grid Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow w-full">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Navigation Sidebar */}
          <aside className="w-full lg:w-64 flex-shrink-0 glass-panel p-6 rounded-lg space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gold-300 border-b border-gold-500/10 pb-4 font-serif">
              Operations Control
            </h3>
            <div className="flex flex-col space-y-1.5 text-xs">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex items-center space-x-2.5 py-2 px-3 rounded-md text-left transition-colors cursor-pointer ${
                  activeTab === 'overview' ? 'bg-gold-500/15 text-gold-400 font-semibold border-l-2 border-gold-500' : 'text-obsidian-300 hover:bg-obsidian-900'
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard Stats</span>
              </button>

              <button
                onClick={() => setActiveTab('products')}
                className={`flex items-center space-x-2.5 py-2 px-3 rounded-md text-left transition-colors cursor-pointer ${
                  activeTab === 'products' ? 'bg-gold-500/15 text-gold-400 font-semibold border-l-2 border-gold-500' : 'text-obsidian-300 hover:bg-obsidian-900'
                }`}
              >
                <Gift className="h-4 w-4" />
                <span>Catalog Manager</span>
              </button>

              <button
                onClick={() => setActiveTab('orders')}
                className={`flex items-center space-x-2.5 py-2 px-3 rounded-md text-left transition-colors cursor-pointer ${
                  activeTab === 'orders' ? 'bg-gold-500/15 text-gold-400 font-semibold border-l-2 border-gold-500' : 'text-obsidian-300 hover:bg-obsidian-900'
                }`}
              >
                <ShoppingCart className="h-4 w-4" />
                <span>Orders Pipeline</span>
              </button>

              <button
                onClick={() => setActiveTab('customizations')}
                className={`flex items-center space-x-2.5 py-2 px-3 rounded-md text-left transition-colors cursor-pointer ${
                  activeTab === 'customizations' ? 'bg-gold-500/15 text-gold-400 font-semibold border-l-2 border-gold-500' : 'text-obsidian-300 hover:bg-obsidian-900'
                }`}
              >
                <ClipboardCheck className="h-4 w-4" />
                <span>Approval Queue</span>
              </button>

              <button
                onClick={() => setActiveTab('corporate')}
                className={`flex items-center space-x-2.5 py-2 px-3 rounded-md text-left transition-colors cursor-pointer ${
                  activeTab === 'corporate' ? 'bg-gold-500/15 text-gold-400 font-semibold border-l-2 border-gold-500' : 'text-obsidian-300 hover:bg-obsidian-900'
                }`}
              >
                <Building className="h-4 w-4" />
                <span>Corporate Leads</span>
              </button>

              <button
                onClick={() => setActiveTab('blogs')}
                className={`flex items-center space-x-2.5 py-2 px-3 rounded-md text-left transition-colors cursor-pointer ${
                  activeTab === 'blogs' ? 'bg-gold-500/15 text-gold-400 font-semibold border-l-2 border-gold-500' : 'text-obsidian-300 hover:bg-obsidian-900'
                }`}
              >
                <FileText className="h-4 w-4" />
                <span>CMS / Blog Editor</span>
              </button>
            </div>
          </aside>

          {/* Tab Workspaces */}
          <div className="flex-grow w-full overflow-hidden">
            {/* Panel 1: Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-serif font-bold text-gold-300">Dashboard Metrics</h2>
                
                {statsLoading ? (
                  <div className="text-center font-serif text-gold-400 py-16 animate-pulse">LOADING ANALYTICS...</div>
                ) : stats ? (
                  <div className="space-y-8">
                    {/* Stat Cards Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-light text-obsidian-300">
                      <div className="glass-panel p-5 rounded-lg space-y-1">
                        <span className="text-obsidian-400 block uppercase tracking-wider text-[10px] font-bold">Today's Sales</span>
                        <span className="text-xl font-bold text-gold-300 font-serif block">&#8377; {stats.todaySales?.toFixed(2)}</span>
                      </div>
                      <div className="glass-panel p-5 rounded-lg space-y-1">
                        <span className="text-obsidian-400 block uppercase tracking-wider text-[10px] font-bold">AOV (Average Order)</span>
                        <span className="text-xl font-bold text-gold-300 font-serif block">&#8377; {stats.aov?.toFixed(2)}</span>
                      </div>
                      <div className="glass-panel p-5 rounded-lg space-y-1">
                        <span className="text-obsidian-400 block uppercase tracking-wider text-[10px] font-bold">Pending Approvals</span>
                        <span className="text-xl font-bold text-gold-300 font-serif block">{stats.pendingCustomizations} Items</span>
                      </div>
                      <div className="glass-panel p-5 rounded-lg space-y-1">
                        <span className="text-obsidian-400 block uppercase tracking-wider text-[10px] font-bold">Stock Warnings</span>
                        <span className={`text-xl font-bold font-serif block ${stats.lowStock > 0 ? 'text-red-400' : 'text-gold-300'}`}>
                          {stats.lowStock} Low Stock
                        </span>
                      </div>
                    </div>

                    {/* Top Products & Summaries */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                      {/* Top Selling Products */}
                      <div className="glass-panel p-6 rounded-lg space-y-4">
                        <h4 className="font-serif font-bold text-gold-300 border-b border-gold-500/5 pb-2">Top Selling Products</h4>
                        <div className="space-y-3">
                          {stats.topProducts && stats.topProducts.length > 0 ? (
                            stats.topProducts.map((p: any, i: number) => (
                              <div key={i} className="flex justify-between items-center text-xs font-light">
                                <span className="text-obsidian-200">{p.name}</span>
                                <span className="font-bold text-gold-300">
                                  {p.quantity} Units (&#8377; {p.sales?.toFixed(2)})
                                </span>
                              </div>
                            ))
                          ) : (
                            <div className="text-xs text-obsidian-400 italic">No sales recorded yet.</div>
                          )}
                        </div>
                      </div>

                      {/* Summary Data */}
                      <div className="glass-panel p-6 rounded-lg space-y-4">
                        <h4 className="font-serif font-bold text-gold-300 border-b border-gold-500/5 pb-2">Platform Summary</h4>
                        <div className="grid grid-cols-2 gap-4 text-xs font-light">
                          <div className="bg-obsidian-900/50 p-4 rounded border border-gold-500/5 text-center">
                            <span className="text-obsidian-400 uppercase block mb-1 font-semibold text-[9px]">Total Orders</span>
                            <span className="text-base font-bold text-gold-300">{stats.totalOrders}</span>
                          </div>
                          <div className="bg-obsidian-900/50 p-4 rounded border border-gold-500/5 text-center">
                            <span className="text-obsidian-400 uppercase block mb-1 font-semibold text-[9px]">Customers</span>
                            <span className="text-base font-bold text-gold-300">{stats.customerGrowth}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-obsidian-400">Failed to aggregate statistics.</div>
                )}
              </div>
            )}

            {/* Panel 2: Products Manager */}
            {activeTab === 'products' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-serif font-bold text-gold-300">Catalog Manager</h2>
                  <button
                    onClick={() => {
                      setEditProduct(null);
                      setSku('');
                      setName('');
                      setDescription('');
                      setPrice('');
                      setCostPrice('');
                      setStock('');
                      setCustomizable(false);
                      setImageUrl('');
                      setShowProductForm(true);
                    }}
                    className="bg-gold-500 hover:bg-gold-600 text-obsidian-950 font-bold px-4 py-2 rounded text-xs uppercase tracking-wider cursor-pointer"
                  >
                    Add New Product
                  </button>
                </div>

                {showProductForm && (
                  <form onSubmit={handleProductSubmit} className="glass-panel p-6 rounded-lg space-y-4 border-gold-500/30">
                    <h3 className="text-lg font-serif font-bold text-gold-300 border-b border-gold-500/5 pb-2">
                      {editProduct ? 'Edit Product Details' : 'Add New Product'}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-gold-400">SKU Code</label>
                        <input
                          type="text" required value={sku} onChange={(e) => setSku(e.target.value)}
                          className="w-full bg-obsidian-900 border border-gold-500/10 rounded py-2 px-3 text-xs outline-none text-obsidian-50"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-gold-400">Product Name</label>
                        <input
                          type="text" required value={name} onChange={(e) => setName(e.target.value)}
                          className="w-full bg-obsidian-900 border border-gold-500/10 rounded py-2 px-3 text-xs outline-none text-obsidian-50"
                        />
                      </div>
                      <div className="md:col-span-2 space-y-1">
                        <label className="text-[10px] uppercase font-bold text-gold-400">Description</label>
                        <textarea
                          rows={2} required value={description} onChange={(e) => setDescription(e.target.value)}
                          className="w-full bg-obsidian-900 border border-gold-500/10 rounded py-2 px-3 text-xs outline-none text-obsidian-50 resize-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-gold-400">Retail Price (INR)</label>
                        <input
                          type="number" step="0.01" required value={price} onChange={(e) => setPrice(e.target.value)}
                          className="w-full bg-obsidian-900 border border-gold-500/10 rounded py-2 px-3 text-xs outline-none text-obsidian-50"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-gold-400">Cost Price (INR)</label>
                        <input
                          type="number" step="0.01" required value={costPrice} onChange={(e) => setCostPrice(e.target.value)}
                          className="w-full bg-obsidian-900 border border-gold-500/10 rounded py-2 px-3 text-xs outline-none text-obsidian-50"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-gold-400">Warehouse Stock</label>
                        <input
                          type="number" required value={stock} onChange={(e) => setStock(e.target.value)}
                          className="w-full bg-obsidian-900 border border-gold-500/10 rounded py-2 px-3 text-xs outline-none text-obsidian-50"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-gold-400">Catalog Category</label>
                        <select
                          value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
                          className="w-full bg-obsidian-900 border border-gold-500/10 rounded py-2 px-3 text-xs outline-none text-obsidian-300"
                        >
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-gold-400">Image Asset URL</label>
                        <input
                          type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
                          placeholder="https://images.unsplash.com/..."
                          className="w-full bg-obsidian-900 border border-gold-500/10 rounded py-2 px-3 text-xs outline-none text-obsidian-50"
                        />
                      </div>
                      <div className="flex items-center space-x-2 pt-4">
                        <input
                          type="checkbox" id="customizable" checked={customizable} onChange={(e) => setCustomizable(e.target.checked)}
                          className="accent-gold-500"
                        />
                        <label htmlFor="customizable" className="text-xs text-obsidian-300 cursor-pointer select-none">
                          Enable Personalization (Engraving/Card fields)
                        </label>
                      </div>
                    </div>

                    <div className="flex space-x-2 pt-2">
                      <button
                        type="submit"
                        className="bg-gold-500 hover:bg-gold-600 text-obsidian-950 font-bold px-6 py-2 rounded text-xs uppercase tracking-wider cursor-pointer"
                      >
                        Save Product
                      </button>
                      <button
                        type="button" onClick={() => { setShowProductForm(false); setEditProduct(null); }}
                        className="border border-gold-500/20 text-gold-300 px-6 py-2 rounded text-xs uppercase tracking-wider cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {productsLoading ? (
                  <div className="text-center font-serif text-gold-400 py-16 animate-pulse">LOADING CATALOG...</div>
                ) : (
                  <div className="glass-panel rounded-lg overflow-x-auto">
                    <table className="w-full text-xs font-light text-obsidian-300 text-left border-collapse">
                      <thead>
                        <tr className="border-b border-gold-500/10 uppercase text-[9px] font-bold tracking-wider text-gold-400 bg-obsidian-900/40">
                          <th className="p-4">SKU</th>
                          <th className="p-4">Product Name</th>
                          <th className="p-4">Category</th>
                          <th className="p-4">Price</th>
                          <th className="p-4">Stock</th>
                          <th className="p-4 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gold-500/5">
                        {products.map((prod) => (
                          <tr key={prod.id} className="hover:bg-obsidian-900/20">
                            <td className="p-4 font-mono font-medium text-gold-400">{prod.sku}</td>
                            <td className="p-4 font-serif font-bold text-obsidian-100 text-sm">{prod.name}</td>
                            <td className="p-4">{prod.category?.name}</td>
                            <td className="p-4 font-bold">&#8377; {prod.price.toFixed(2)}</td>
                            <td className="p-4 font-medium">
                              <span className={prod.stock === 0 ? 'text-red-400 font-bold' : prod.stock < 10 ? 'text-gold-400' : ''}>
                                {prod.stock} Left
                              </span>
                            </td>
                            <td className="p-4 text-center space-x-3">
                              <button onClick={() => triggerEditProduct(prod)} className="text-gold-400 hover:text-gold-300 font-semibold cursor-pointer">
                                Edit
                              </button>
                              <button onClick={() => handleDeleteProduct(prod.id)} className="text-red-500 hover:text-red-400 font-semibold cursor-pointer">
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Panel 3: Orders Manager */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-serif font-bold text-gold-300">Orders Pipeline</h2>

                {ordersLoading ? (
                  <div className="text-center font-serif text-gold-400 py-16 animate-pulse">LOADING PIPELINE...</div>
                ) : (
                  <div className="glass-panel rounded-lg overflow-x-auto">
                    <table className="w-full text-xs font-light text-obsidian-300 text-left border-collapse">
                      <thead>
                        <tr className="border-b border-gold-500/10 uppercase text-[9px] font-bold tracking-wider text-gold-400 bg-obsidian-900/40">
                          <th className="p-4">Order Code</th>
                          <th className="p-4">Customer</th>
                          <th className="p-4">Amount</th>
                          <th className="p-4">Method</th>
                          <th className="p-4">Current Status</th>
                          <th className="p-4 text-center">Process Pipeline</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gold-500/5">
                        {orders.map((order) => (
                          <tr key={order.id} className="hover:bg-obsidian-900/20">
                            <td className="p-4 font-mono font-bold text-obsidian-100">{order.orderNumber}</td>
                            <td className="p-4">
                              <div className="font-semibold text-obsidian-200">{order.user?.name}</div>
                              <div className="text-[10px] text-obsidian-500">{order.user?.email}</div>
                            </td>
                            <td className="p-4 font-bold text-gold-300">&#8377; {order.totalAmount?.toFixed(2)}</td>
                            <td className="p-4 font-mono">{order.payments?.[0]?.paymentMethod}</td>
                            <td className="p-4 uppercase font-bold text-[10px]">
                              <span className={`px-2 py-0.5 rounded ${
                                order.status === 'CONFIRMED' || order.status === 'DELIVERED'
                                  ? 'bg-green-500/10 text-green-400'
                                  : 'bg-gold-500/10 text-gold-400'
                              }`}>
                                {order.status?.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              {order.status === 'CONFIRMED' && (
                                <button
                                  onClick={() => handleUpdateOrderStatus(order.id, 'PRODUCTION')}
                                  className="bg-gold-500 hover:bg-gold-600 text-obsidian-950 px-3 py-1.5 rounded font-bold uppercase tracking-wider text-[9px] flex items-center space-x-1 mx-auto cursor-pointer"
                                >
                                  <Play className="h-3 w-3" />
                                  <span>Start Production</span>
                                </button>
                              )}
                              {order.status === 'PRODUCTION' && (
                                <button
                                  onClick={() => handleUpdateOrderStatus(order.id, 'PACKED')}
                                  className="bg-gold-500 hover:bg-gold-600 text-obsidian-950 px-3 py-1.5 rounded font-bold uppercase tracking-wider text-[9px] flex items-center space-x-1 mx-auto cursor-pointer"
                                >
                                  <Package className="h-3 w-3" />
                                  <span>Finish Packaging</span>
                                </button>
                              )}
                              {order.status === 'PACKED' && (
                                <button
                                  onClick={() => handleUpdateOrderStatus(order.id, 'SHIPPED')}
                                  className="bg-gold-500 hover:bg-gold-600 text-obsidian-950 px-3 py-1.5 rounded font-bold uppercase tracking-wider text-[9px] flex items-center space-x-1 mx-auto cursor-pointer"
                                >
                                  <Package className="h-3 w-3" />
                                  <span>Ship Package</span>
                                </button>
                              )}
                              {order.status === 'SHIPPED' && (
                                <button
                                  onClick={() => handleUpdateOrderStatus(order.id, 'DELIVERED')}
                                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded font-bold uppercase tracking-wider text-[9px] flex items-center space-x-1 mx-auto cursor-pointer"
                                >
                                  <CheckCircle2 className="h-3 w-3" />
                                  <span>Confirm Delivery</span>
                                </button>
                              )}
                              {order.status === 'DELIVERED' && (
                                <span className="text-[10px] text-green-400 font-bold uppercase flex items-center justify-center space-x-1">
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  <span>Completed</span>
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Panel 4: Personalization Queue */}
            {activeTab === 'customizations' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-serif font-bold text-gold-300">Personalization Approval Queue</h2>
                <p className="text-xs text-obsidian-400 font-light max-w-xl">
                  Review customized messages and uploaded photos submitted by customers. Approve options to advance items to order packaging.
                </p>

                {queueLoading ? (
                  <div className="text-center font-serif text-gold-400 py-16 animate-pulse">LOADING APPROVALS...</div>
                ) : customQueue.length === 0 ? (
                  <div className="glass-panel p-12 text-center text-obsidian-400 font-light text-sm">
                    No custom items awaiting approval.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {customQueue.map((item) => {
                      let parsedCustom: any = null;
                      try {
                        parsedCustom = JSON.parse(item.customizations);
                      } catch (e) {}

                      return (
                        <div key={item.id} className="glass-panel p-5 rounded-lg space-y-4 flex flex-col justify-between">
                          <div className="space-y-3">
                            <div className="flex justify-between items-baseline border-b border-gold-500/5 pb-2">
                              <span className="font-mono font-bold text-gold-400 text-xs">{item.order?.orderNumber}</span>
                              <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded ${
                                item.customStatus === 'APPROVED' ? 'bg-green-500/10 text-green-400' : 'bg-gold-500/10 text-gold-400'
                              }`}>
                                {item.customStatus?.replace('_', ' ')}
                              </span>
                            </div>

                            <div className="text-xs space-y-1 font-light text-obsidian-300">
                              <div>Product: <strong className="text-obsidian-100">{item.product?.name || item.hamper?.box?.name}</strong></div>
                              <div>Customer: <strong>{item.order?.user?.name}</strong></div>
                            </div>

                            {parsedCustom && (
                              <div className="bg-obsidian-900 border border-gold-500/10 p-3.5 rounded text-xs">
                                <span className="text-[10px] uppercase font-bold text-gold-400 block mb-2 tracking-wider">Choices Details</span>
                                {parsedCustom.text && (
                                  <div className="mb-1.5 font-light">
                                    <span className="text-obsidian-400 font-medium block">Personalized Text</span>
                                    <span className="text-obsidian-100 italic">" {parsedCustom.text} "</span>
                                  </div>
                                )}
                                {parsedCustom.ribbonColor && (
                                  <div className="mb-1.5 font-light">
                                    <span className="text-obsidian-400 font-medium block">Ribbon Color</span>
                                    <span className="text-obsidian-100">{parsedCustom.ribbonColor}</span>
                                  </div>
                                )}
                                {parsedCustom.photoUrl && (
                                  <div className="space-y-1.5 pt-1.5 border-t border-gold-500/5">
                                    <span className="text-obsidian-400 font-medium block">Custom Photo Print</span>
                                    <img src={parsedCustom.photoUrl} alt="custom print" className="h-28 w-28 object-cover rounded border border-gold-500/15" />
                                    <a href={parsedCustom.photoUrl} target="_blank" className="text-[10px] text-gold-400 underline block hover:text-gold-300">
                                      Open Image in New Tab
                                    </a>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {item.customStatus === 'PENDING_REVIEW' && (
                            <div className="flex space-x-2 pt-3 border-t border-gold-500/5">
                              <button
                                onClick={() => handleApproveCustomization(item.id, 'APPROVED')}
                                className="flex-grow bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded text-[10px] uppercase tracking-wider transition-colors cursor-pointer"
                              >
                                Approve Design
                              </button>
                              <button
                                onClick={() => handleApproveCustomization(item.id, 'REVISION_REQUIRED')}
                                className="border border-red-500/20 hover:bg-red-500/10 text-red-400 font-bold py-2 px-4 rounded text-[10px] uppercase tracking-wider transition-colors cursor-pointer"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Panel 5: Corporate Leads */}
            {activeTab === 'corporate' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-serif font-bold text-gold-300">Corporate Leads & Quotations</h2>

                {leadsLoading ? (
                  <div className="text-center font-serif text-gold-400 py-16 animate-pulse">LOADING LEADS...</div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <div className="lg:col-span-7 glass-panel rounded-lg overflow-hidden">
                      <table className="w-full text-xs font-light text-obsidian-300 text-left border-collapse">
                        <thead>
                          <tr className="border-b border-gold-500/10 uppercase text-[9px] font-bold tracking-wider text-gold-400 bg-obsidian-900/40">
                            <th className="p-4">Company</th>
                            <th className="p-4">Contact</th>
                            <th className="p-4">Qty</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gold-500/5">
                          {leads.map((lead) => (
                            <tr key={lead.id} className="hover:bg-obsidian-900/20">
                              <td className="p-4 font-bold text-obsidian-100">{lead.companyName}</td>
                              <td className="p-4">
                                <div className="font-semibold">{lead.contactName}</div>
                                <div className="text-[9px] text-obsidian-500">{lead.email}</div>
                              </td>
                              <td className="p-4 font-mono font-medium">{lead.quantity} Pcs</td>
                              <td className="p-4 uppercase font-bold text-[10px]">
                                <span className={`px-2 py-0.5 rounded ${
                                  lead.status === 'QUOTED' ? 'bg-green-500/10 text-green-400' : 'bg-gold-500/10 text-gold-400'
                                }`}>
                                  {lead.status}
                                </span>
                              </td>
                              <td className="p-4 text-center">
                                <button
                                  onClick={() => setSelectedLead(lead)}
                                  className="text-gold-400 hover:text-gold-300 font-semibold cursor-pointer"
                                >
                                  Quote
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="lg:col-span-5">
                      {selectedLead ? (
                        <form onSubmit={handleCreateQuotation} className="glass-panel p-6 rounded-lg space-y-4 border-gold-500/20">
                          <h3 className="text-base font-bold font-serif text-gold-300 border-b border-gold-500/5 pb-2">
                            Generate Quote: {selectedLead.companyName}
                          </h3>
                          
                          <div className="text-xs font-light text-obsidian-400 space-y-2 border-b border-gold-500/5 pb-3">
                            <div>Requirements: <p className="italic bg-obsidian-900 p-2 rounded text-[10px] mt-1">" {selectedLead.requirements} "</p></div>
                            <div>Delivery Date: <strong>{new Date(selectedLead.deliveryDate).toLocaleDateString()}</strong></div>
                            <div>Units: <strong>{selectedLead.quantity} Pcs</strong></div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-gold-400">Pricing breakdown detail details (Plain Text / JSON)</label>
                            <textarea
                              rows={4} required value={quoteDetails} onChange={(e) => setQuoteDetails(e.target.value)}
                              placeholder={`E.g. Assorted Chocolates Chest with gold embossing. Unit price: 200 INR.`}
                              className="w-full bg-obsidian-900 border border-gold-500/10 rounded py-2 px-3 text-xs outline-none text-obsidian-50 resize-none font-mono"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-gold-400">Quotation Valid Until</label>
                            <input
                              type="date" required value={quoteValidUntil} onChange={(e) => setQuoteValidUntil(e.target.value)}
                              className="w-full bg-obsidian-900 border border-gold-500/10 rounded py-2 px-3 text-xs outline-none text-obsidian-300"
                            />
                          </div>

                          <div className="flex space-x-2 pt-2">
                            <button
                              type="submit"
                              className="bg-gold-500 hover:bg-gold-600 text-obsidian-950 font-bold px-6 py-2 rounded text-[10px] uppercase tracking-wider cursor-pointer"
                            >
                              Publish Quotation
                            </button>
                            <button
                              type="button" onClick={() => setSelectedLead(null)}
                              className="border border-gold-500/20 text-gold-300 px-6 py-2 rounded text-[10px] uppercase tracking-wider cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="glass-panel p-8 text-center text-xs font-light text-obsidian-500 rounded-lg">
                          Select a business lead to open the quotation constructor panel.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Panel 6: CMS / Blog Editor */}
            {activeTab === 'blogs' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-serif font-bold text-gold-300">CMS & Blog Editor</h2>
                  <button
                    onClick={() => setShowBlogForm(true)}
                    className="bg-gold-500 hover:bg-gold-600 text-obsidian-950 font-bold px-4 py-2 rounded text-xs uppercase tracking-wider cursor-pointer"
                  >
                    Create Blog Post
                  </button>
                </div>

                {showBlogForm && (
                  <form onSubmit={handleBlogSubmit} className="glass-panel p-6 rounded-lg space-y-4 border-gold-500/30">
                    <h3 className="text-lg font-serif font-bold text-gold-300 border-b border-gold-500/5 pb-2">
                      New Blog Post
                    </h3>

                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-gold-400">Post Title</label>
                        <input
                          type="text" required value={blogTitle} onChange={(e) => setBlogTitle(e.target.value)}
                          placeholder="E.g. Top 5 Chocolates to Gift This Diwali"
                          className="w-full bg-obsidian-900 border border-gold-500/10 rounded py-2 px-3 text-xs outline-none text-obsidian-50"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-gold-400">Custom URL Slug (Optional)</label>
                        <input
                          type="text" value={blogSlug} onChange={(e) => setBlogSlug(e.target.value)}
                          placeholder="E.g. top-5-diwali-chocolates"
                          className="w-full bg-obsidian-900 border border-gold-500/10 rounded py-2 px-3 text-xs outline-none text-obsidian-50"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-gold-400">Author Name</label>
                        <input
                          type="text" value={blogAuthor} onChange={(e) => setBlogAuthor(e.target.value)}
                          placeholder="Diya Master Chocolatier"
                          className="w-full bg-obsidian-900 border border-gold-500/10 rounded py-2 px-3 text-xs outline-none text-obsidian-50"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-gold-400">Cover Image URL</label>
                        <input
                          type="text" value={blogImage} onChange={(e) => setBlogImage(e.target.value)}
                          placeholder="https://images.unsplash.com/..."
                          className="w-full bg-obsidian-900 border border-gold-500/10 rounded py-2 px-3 text-xs outline-none text-obsidian-50"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-gold-400">Content Body (Markdown Supported)</label>
                        <textarea
                          rows={6} required value={blogContent} onChange={(e) => setBlogContent(e.target.value)}
                          placeholder="Write the article content here..."
                          className="w-full bg-obsidian-900 border border-gold-500/10 rounded py-2 px-3 text-xs outline-none text-obsidian-50 resize-y"
                        />
                      </div>
                    </div>

                    <div className="flex space-x-2 pt-2">
                      <button
                        type="submit"
                        className="bg-gold-500 hover:bg-gold-600 text-obsidian-950 font-bold px-6 py-2 rounded text-xs uppercase tracking-wider cursor-pointer"
                      >
                        Publish Post
                      </button>
                      <button
                        type="button" onClick={() => setShowBlogForm(false)}
                        className="border border-gold-500/20 text-gold-300 px-6 py-2 rounded text-xs uppercase tracking-wider cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {blogsLoading ? (
                  <div className="text-center font-serif text-gold-400 py-16 animate-pulse">LOADING BLOGS...</div>
                ) : blogs.length === 0 ? (
                  <div className="glass-panel p-12 text-center text-obsidian-400 font-light text-sm">
                    No articles published yet. Publish an article to make it appear on the customer website.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {blogs.map((blog) => (
                      <div key={blog.id} className="glass-panel p-5 rounded-lg space-y-3 flex flex-col justify-between">
                        <div>
                          {blog.imageUrl && (
                            <img src={blog.imageUrl} alt={blog.title} className="w-full h-40 object-cover rounded mb-3 border border-gold-500/10" />
                          )}
                          <h3 className="font-serif font-bold text-gold-300 text-base leading-snug">{blog.title}</h3>
                          <p className="text-[10px] text-obsidian-500 mt-1">
                            By <strong>{blog.author}</strong> &bull; {new Date(blog.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-obsidian-300 font-light mt-2 line-clamp-3 leading-relaxed">
                            {blog.content}
                          </p>
                        </div>
                        <div className="pt-3 border-t border-gold-500/5 flex justify-between items-center text-[10px]">
                          <span className="font-mono text-obsidian-400 bg-obsidian-900 px-2 py-0.5 rounded">
                            /{blog.slug}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gold-500/10 py-6 text-center text-[10px] uppercase tracking-widest text-obsidian-500 mt-auto">
        &copy; {new Date().getFullYear()} Diya Creation. All rights reserved. SECURE OPERATIONS CONSOLE.
      </footer>
    </div>
  );
}
