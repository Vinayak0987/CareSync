import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingCart, Plus, Minus, Upload, X, Check, FileText, Filter, Package, Clock, Truck, CheckCircle, MapPin, AlertTriangle, Shield, Stethoscope, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useOrders } from '@/contexts/OrderContext';
import { useProducts, type StoreProduct } from '@/contexts/ProductContext';
import { currentPatient } from '@/lib/mockData';

// Product type alias for clarity
type Product = StoreProduct;

// Default categories (will be extended by products from DB)
const defaultCategories = ['All', 'Pain Relief', 'Heart Health', 'Allergy', 'Diabetes', 'Supplements', 'Digestive', 'Devices', 'Antibiotics'];

interface CartItem {
  product: Product;
  quantity: number;
}

export function MedicalStoreView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [prescriptionUploaded, setPrescriptionUploaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { addOrder, getPatientOrders } = useOrders();
  const { storeProducts, loading, fetchStoreProducts } = useProducts();
  const patientOrders = getPatientOrders(currentPatient.name);

  // Fetch store products on mount
  useEffect(() => {
    fetchStoreProducts();
  }, [fetchStoreProducts]);

  // Derive categories from products
  const categories = useMemo(() => {
    const productCategories = [...new Set(storeProducts.map(p => p.category))];
    return ['All', ...defaultCategories.filter(c => c !== 'All'), ...productCategories.filter(c => !defaultCategories.includes(c))];
  }, [storeProducts]);

  // Use storeProducts from context
  const filteredProducts = storeProducts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product: Product) => {
    if (product.prescription && !prescriptionUploaded) {
      toast.error('Prescription required', {
        description: 'Please upload a valid prescription first',
      });
      setShowUploadModal(true);
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    toast.success('Added to cart', { description: product.name });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev =>
      prev.map(item => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
      }).filter(item => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleUploadPrescription = () => {
    if (!uploadedFile) return;

    // Simulate upload
    toast.success('Prescription uploaded successfully!', {
      description: 'You can now order prescription medicines',
    });
    setPrescriptionUploaded(true);
    setShowUploadModal(false);
    setUploadedFile(null);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const checkout = async () => {
    // Create order using the shared context
    const hasPrescriptionItems = cart.some(item => item.product.prescription);

    console.log('Checkout called with cart:', cart);
    console.log('Creating order for:', currentPatient.name);

    try {
      await addOrder({
        patientName: currentPatient.name,
        patientAvatar: currentPatient.avatar,
        items: cart.map(item => ({
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
        })),
        total: cartTotal,
        status: 'pending',
        prescription: hasPrescriptionItems,
        prescriptionVerified: hasPrescriptionItems && prescriptionUploaded,
        deliveryAddress: 'Andheri West, Mumbai',
      });

      console.log('Order created successfully');

      toast.success('Order placed successfully!', {
        description: 'Your medicines will be delivered in 2-3 hours',
      });
      setCart([]);
      setShowCart(false);
    } catch (error) {
      console.error('Failed to create order:', error);
      toast.error('Failed to place order', {
        description: 'Please try again',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'processing': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'dispatched': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'delivered': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock size={14} />;
      case 'processing': return <Package size={14} />;
      case 'dispatched': return <Truck size={14} />;
      case 'delivered': return <CheckCircle size={14} />;
      default: return <Clock size={14} />;
    }
  };

  // Show loading state
  if (loading && storeProducts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-4" />
          <p className="text-muted-foreground">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold mb-2">Medical Store</h1>
          <p className="text-muted-foreground">Order medicines and healthcare products</p>
        </div>
        <div className="flex gap-2 self-start">
          <Button
            variant="outline"
            onClick={() => setShowOrders(true)}
            className="relative"
          >
            <Package size={18} className="mr-2" />
            Orders
            {patientOrders.length > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-blue-500 text-white rounded-full text-xs flex items-center justify-center">
                {patientOrders.length}
              </span>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowCart(true)}
            className="relative"
          >
            <ShoppingCart size={18} className="mr-2" />
            Cart
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-primary-foreground rounded-full text-xs flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Button>
        </div>
      </motion.div>

      {/* Search & Upload */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search medicines, supplements, devices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant={prescriptionUploaded ? "default" : "outline"}
          onClick={() => setShowUploadModal(true)}
          className={prescriptionUploaded ? "bg-emerald-600 hover:bg-emerald-700" : ""}
        >
          {prescriptionUploaded ? (
            <>
              <Check size={16} className="mr-2" />
              Prescription ✓
            </>
          ) : (
            <>
              <Upload size={16} className="mr-2" />
              Upload Prescription
            </>
          )}
        </Button>
      </motion.div>

      {/* Category Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2 overflow-x-auto pb-2"
      >
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
              selectedCategory === category
                ? "bg-primary text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {category}
          </button>
        ))}
      </motion.div>

      {/* Prescription Guide - Easy to understand legend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-gradient-to-r from-blue-50 to-amber-50 dark:from-blue-950/30 dark:to-amber-950/30 rounded-xl p-4 border border-border"
      >
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <AlertTriangle size={16} className="text-amber-600" />
          Medicine Guide
        </h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {/* No Prescription */}
          <div className="flex items-center gap-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg p-3 border-2 border-emerald-400">
            <div className="flex-shrink-0 w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
              <Shield size={20} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">✅ No Prescription Required</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">You can buy directly</p>
            </div>
          </div>
          {/* Prescription Required */}
          <div className="flex items-center gap-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg p-3 border-2 border-amber-400">
            <div className="flex-shrink-0 w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center">
              <Stethoscope size={20} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-amber-700 dark:text-amber-400 text-sm">⚠️ Prescription Required</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Upload prescription first</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Products Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredProducts.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            className={cn(
              "bg-card rounded-xl overflow-hidden border-2 shadow-sm hover:shadow-md transition-all",
              product.prescription
                ? "border-amber-300 dark:border-amber-600"
                : "border-emerald-300 dark:border-emerald-600"
            )}
          >
            {/* Prescription indicator banner at top */}
            {product.prescription ? (
              <div className="bg-amber-100 dark:bg-amber-900/50 px-3 py-1.5 flex items-center gap-2 border-b border-amber-200 dark:border-amber-700">
                <Stethoscope size={14} className="text-amber-600" />
                <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                  ⚠️ Prescription Required
                </span>
              </div>
            ) : (
              <div className="bg-emerald-100 dark:bg-emerald-900/50 px-3 py-1.5 flex items-center gap-2 border-b border-emerald-200 dark:border-emerald-700">
                <Shield size={14} className="text-emerald-600" />
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  ✅ No Prescription Needed
                </span>
              </div>
            )}

            <div className="p-4">
              <div className="text-4xl mb-3">{product.image}</div>
              <div className="mb-2">
                <h3 className="font-medium text-sm">{product.name}</h3>
                <p className="text-xs text-muted-foreground">{product.category}</p>
              </div>
              <div className="flex items-center justify-between mt-3">
                <p className="font-display font-bold text-lg">₹{product.price}</p>
                {product.inStock ? (
                  <Button
                    size="sm"
                    onClick={() => addToCart(product)}
                    className={cn(
                      "h-9",
                      product.prescription
                        ? "bg-amber-600 hover:bg-amber-700"
                        : "bg-emerald-600 hover:bg-emerald-700"
                    )}
                  >
                    <Plus size={14} className="mr-1" />
                    Add
                  </Button>
                ) : (
                  <span className="text-xs text-red-500 font-medium">Out of Stock</span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Search size={48} className="mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No products found</p>
        </div>
      )}

      {/* Upload Prescription Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground/30 backdrop-blur-sm z-50"
              onClick={() => setShowUploadModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
            >
              <div className="w-full max-w-md bg-card rounded-2xl p-6 shadow-xl pointer-events-auto mx-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display font-semibold text-lg">Upload Prescription</h2>
                  <button onClick={() => setShowUploadModal(false)} className="p-2 hover:bg-muted rounded-lg">
                    <X size={20} />
                  </button>
                </div>

                <p className="text-sm text-muted-foreground mb-6">
                  Upload a valid prescription to order prescription medicines. We accept images and PDF files.
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {!uploadedFile ? (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors"
                  >
                    <FileText size={40} className="mx-auto text-muted-foreground mb-3" />
                    <p className="font-medium mb-1">Click to upload</p>
                    <p className="text-xs text-muted-foreground">JPG, PNG, PDF up to 10MB</p>
                  </button>
                ) : (
                  <div className="border border-border rounded-xl p-4 flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <FileText size={24} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{uploadedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(uploadedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <button
                      onClick={() => setUploadedFile(null)}
                      className="p-2 hover:bg-muted rounded-lg text-muted-foreground"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <Button variant="outline" className="flex-1" onClick={() => setShowUploadModal(false)}>
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 btn-hero"
                    onClick={handleUploadPrescription}
                    disabled={!uploadedFile}
                  >
                    <Upload size={16} className="mr-2" />
                    Upload
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <AnimatePresence>
        {showCart && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground/30 backdrop-blur-sm z-50"
              onClick={() => setShowCart(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-card border-l border-border z-50 flex flex-col"
            >
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h2 className="font-display font-semibold text-lg">Your Cart</h2>
                <button onClick={() => setShowCart(false)} className="p-2 hover:bg-muted rounded-lg">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart size={48} className="mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Your cart is empty</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.product.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl">{item.product.image}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.product.name}</p>
                        <p className="text-sm text-primary">₹{item.product.price}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.product.id, -1)}
                          className="w-7 h-7 rounded-full bg-background border border-border flex items-center justify-center hover:bg-muted"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-6 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, 1)}
                          className="w-7 h-7 rounded-full bg-background border border-border flex items-center justify-center hover:bg-muted"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="p-1.5 text-muted-foreground hover:text-red-500"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-4 border-t border-border space-y-4">
                  <div className="flex items-center justify-between text-lg">
                    <span className="font-medium">Total</span>
                    <span className="font-display font-bold">₹{cartTotal}</span>
                  </div>
                  <Button onClick={checkout} className="w-full btn-hero h-12">
                    <Check size={18} className="mr-2" />
                    Checkout
                  </Button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Orders Drawer */}
      <AnimatePresence>
        {showOrders && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground/30 backdrop-blur-sm z-50"
              onClick={() => setShowOrders(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-card border-l border-border z-50 flex flex-col"
            >
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h2 className="font-display font-semibold text-lg">My Orders</h2>
                <button onClick={() => setShowOrders(false)} className="p-2 hover:bg-muted rounded-lg">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {patientOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package size={48} className="mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No orders yet</p>
                    <p className="text-sm text-muted-foreground mt-1">Place your first order from the store!</p>
                  </div>
                ) : (
                  patientOrders.map((order) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-muted/50 rounded-xl p-4 border border-border"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-muted-foreground font-mono">{order.id}</span>
                        <span className={cn(
                          "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border",
                          getStatusColor(order.status)
                        )}>
                          {getStatusIcon(order.status)}
                          <span className="capitalize">{order.status}</span>
                        </span>
                      </div>

                      <div className="space-y-2 mb-3">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex items-center justify-between text-sm">
                            <span>{item.name} × {item.quantity}</span>
                            <span className="text-muted-foreground">₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>

                      <div className="border-t border-border pt-3 mt-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Total</span>
                          <span className="font-display font-bold">₹{order.total}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin size={12} />
                          {order.deliveryAddress}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Ordered: {order.orderDate}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
