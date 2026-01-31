import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ShoppingCart, Plus, Minus, Upload, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  inStock: boolean;
  prescription: boolean;
}

const products: Product[] = [
  { id: '1', name: 'Paracetamol 500mg', category: 'Pain Relief', price: 45, image: '💊', inStock: true, prescription: false },
  { id: '2', name: 'Amlodipine 5mg', category: 'Heart Health', price: 120, image: '💊', inStock: true, prescription: true },
  { id: '3', name: 'Cetirizine 10mg', category: 'Allergy', price: 35, image: '💊', inStock: true, prescription: false },
  { id: '4', name: 'Metformin 500mg', category: 'Diabetes', price: 85, image: '💊', inStock: true, prescription: true },
  { id: '5', name: 'Vitamin D3', category: 'Supplements', price: 250, image: '💊', inStock: true, prescription: false },
  { id: '6', name: 'Aspirin 75mg', category: 'Heart Health', price: 55, image: '💊', inStock: false, prescription: true },
  { id: '7', name: 'Omeprazole 20mg', category: 'Digestive', price: 95, image: '💊', inStock: true, prescription: true },
  { id: '8', name: 'Multivitamin Plus', category: 'Supplements', price: 320, image: '💊', inStock: true, prescription: false },
];

interface CartItem {
  product: Product;
  quantity: number;
}

export function MedicalStoreView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = (product: Product) => {
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

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const checkout = () => {
    toast.success('Order placed successfully!', {
      description: 'Your medicines will be delivered soon',
    });
    setCart([]);
    setShowCart(false);
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
            placeholder="Search medicines..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Upload size={16} className="mr-2" />
          Upload Prescription
        </Button>
      </motion.div>

      {/* Products Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredProducts.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="vitals-card"
          >
            <div className="text-4xl mb-3">{product.image}</div>
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-medium text-sm">{product.name}</h3>
                <p className="text-xs text-muted-foreground">{product.category}</p>
              </div>
              {product.prescription && (
                <span className="px-1.5 py-0.5 bg-warning/10 text-warning text-[10px] font-medium rounded">
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

      {/* Cart Drawer */}
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
                      className="p-1.5 text-muted-foreground hover:text-alert"
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
    </div>
  );
}
