import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingCart, Plus, Minus, Upload, X, Check, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import api from '@/lib/api';

interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  inStock: boolean;
  requiresPrescription: boolean;
}

const categories = ['All', 'Pain Relief', 'Heart Health', 'Allergy', 'Diabetes', 'Supplements', 'Digestive', 'Devices'];

interface CartItem {
  product: Product;
  quantity: number;
}

export function MedicalStoreView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [prescriptionUploaded, setPrescriptionUploaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const response = await api.get('/medicines');
        setProducts(response.data);
      } catch (error) {
        console.error('Failed to fetch medicines', error);
        toast.error('Failed to load store products');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMedicines();
  }, []);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product: Product) => {
    if (product.requiresPrescription && !prescriptionUploaded) {
      toast.error('Prescription required', {
        description: 'Please upload a valid prescription first',
      });
      setShowUploadModal(true);
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.product._id === product._id);
      if (existing) {
        return prev.map(item => 
          item.product._id === product._id 
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
        if (item.product._id === productId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
      }).filter(item => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product._id !== productId));
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
    try {
      const orderItems = cart.map(item => ({
        name: item.product.name,
        qty: item.quantity,
        image: item.product.image,
        price: item.product.price,
        product: item.product._id,
      }));

      await api.post('/orders', {
        orderItems,
        shippingAddress: {
          address: '123 Main St',
          city: 'Mumbai',
          postalCode: '400001',
          country: 'India',
        },
        paymentMethod: 'Cash',
        totalPrice: cartTotal,
      });

      toast.success('Order placed successfully!', {
        description: 'Your medicines will be delivered in 2-3 hours',
      });
      setCart([]);
      setShowCart(false);
    } catch (error) {
      console.error(error);
      toast.error('Failed to place order');
    }
  };

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
        <Button
          variant="outline"
          onClick={() => setShowCart(true)}
          className="relative self-start"
        >
          <ShoppingCart size={18} className="mr-2" />
          Cart
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-primary-foreground rounded-full text-xs flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </Button>
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

      {/* Products Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredProducts.map((product, index) => (
          <motion.div
            key={product._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            className="bg-card rounded-xl p-4 border border-border shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="mb-3">
              {/* If it's a URL, show img tag, else emoji/text */}
              {product.image.startsWith('http') ? (
                  <img src={product.image} alt={product.name} className="w-full h-32 object-cover rounded-md" />
              ) : (
                  <div className="text-4xl">{product.image}</div>
              )}
            </div>
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-medium text-sm">{product.name}</h3>
                <p className="text-xs text-muted-foreground">{product.category}</p>
              </div>
              {product.requiresPrescription && (
                <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-medium rounded">
                  Rx
                </span>
              )}
            </div>
            <div className="flex items-center justify-between mt-3">
              <p className="font-display font-bold">₹{product.price}</p>
              {product.inStock ? (
                <Button
                  size="sm"
                  onClick={() => addToCart(product)}
                  className="h-8"
                >
                  <Plus size={14} className="mr-1" />
                  Add
                </Button>
              ) : (
                <span className="text-xs text-muted-foreground">Out of Stock</span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {filteredProducts.length === 0 && !isLoading && (
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
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card rounded-2xl p-6 shadow-xl z-50"
            >
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
                    <div key={item.product._id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl">
                          {item.product.image.startsWith('http') ? (
                              <img src={item.product.image} alt={item.product.name} className="w-12 h-12 object-cover rounded-md" />
                          ) : (
                            item.product.image
                          )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.product.name}</p>
                        <p className="text-sm text-primary">₹{item.product.price}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.product._id, -1)}
                          className="w-7 h-7 rounded-full bg-background border border-border flex items-center justify-center hover:bg-muted"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-6 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product._id, 1)}
                          className="w-7 h-7 rounded-full bg-background border border-border flex items-center justify-center hover:bg-muted"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product._id)}
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
    </div>
  );
}
