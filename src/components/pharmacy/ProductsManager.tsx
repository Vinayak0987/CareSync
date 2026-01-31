import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Package,
  X,
  Save,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { 
  inventoryProducts as initialProducts, 
  productCategories,
  type InventoryProduct 
} from '@/lib/mockData';

export function ProductsManager() {
  const [products, setProducts] = useState<InventoryProduct[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<InventoryProduct | null>(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'Pain Relief',
    price: 0,
    stock: 0,
    minStock: 10,
    image: '💊',
    prescription: false,
    supplier: '',
  });

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddProduct = () => {
    if (!newProduct.name.trim()) {
      toast.error('Please enter product name');
      return;
    }

    const product: InventoryProduct = {
      id: `inv-${Date.now()}`,
      ...newProduct,
      status: newProduct.stock === 0 ? 'out-of-stock' : 
              newProduct.stock < newProduct.minStock ? 'low-stock' : 'in-stock',
      lastRestocked: new Date().toISOString().split('T')[0],
    };

    setProducts([...products, product]);
    setShowAddModal(false);
    setNewProduct({
      name: '',
      category: 'Pain Relief',
      price: 0,
      stock: 0,
      minStock: 10,
      image: '💊',
      prescription: false,
      supplier: '',
    });
    toast.success('Product added successfully!');
  };

  const handleUpdateStock = (id: string, newStock: number) => {
    setProducts(products.map(p => {
      if (p.id === id) {
        const status = newStock === 0 ? 'out-of-stock' : 
                       newStock < p.minStock ? 'low-stock' : 'in-stock';
        return { ...p, stock: newStock, status };
      }
      return p;
    }));
    toast.success('Stock updated!');
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
    toast.success('Product deleted!');
  };

  const getStatusColor = (status: InventoryProduct['status']) => {
    switch (status) {
      case 'in-stock': return 'bg-emerald-100 text-emerald-700';
      case 'low-stock': return 'bg-amber-100 text-amber-700';
      case 'out-of-stock': return 'bg-red-100 text-red-700';
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
          <h1 className="text-2xl sm:text-3xl font-display font-bold mb-2">Products Manager</h1>
          <p className="text-muted-foreground">Manage inventory and stock levels</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="btn-hero self-start">
          <Plus size={16} className="mr-2" />
          Add Product
        </Button>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory('All')}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
              selectedCategory === 'All'
                ? "bg-primary text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            All
          </button>
          {productCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
                selectedCategory === cat
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Products Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl border border-border shadow-sm overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 font-medium text-sm">Product</th>
                <th className="text-left p-4 font-medium text-sm">Category</th>
                <th className="text-left p-4 font-medium text-sm">Price</th>
                <th className="text-left p-4 font-medium text-sm">Stock</th>
                <th className="text-left p-4 font-medium text-sm">Status</th>
                <th className="text-left p-4 font-medium text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{product.image}</span>
                      <div>
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.supplier}</p>
                      </div>
                      {product.prescription && (
                        <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-medium rounded">
                          Rx
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-sm">{product.category}</td>
                  <td className="p-4 text-sm font-medium">₹{product.price}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={product.stock}
                        onChange={(e) => handleUpdateStock(product.id, parseInt(e.target.value) || 0)}
                        className="w-20 h-8 text-sm"
                        min={0}
                      />
                      {product.stock < product.minStock && (
                        <AlertTriangle size={14} className="text-amber-500" />
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      getStatusColor(product.status)
                    )}>
                      {product.status.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingProduct(product)}
                        className="p-1.5 text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-1.5 text-muted-foreground hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="p-12 text-center">
            <Package size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No products found</p>
          </div>
        )}
      </motion.div>

      {/* Add Product Modal */}
      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground/30 backdrop-blur-sm z-50"
              onClick={() => setShowAddModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card rounded-2xl p-6 shadow-xl z-50"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display font-semibold text-lg">Add New Product</h2>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-muted rounded-lg">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Product Name</Label>
                  <Input
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    placeholder="e.g., Paracetamol 500mg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <select
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg border border-border bg-background"
                    >
                      {productCategories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Price (₹)</Label>
                    <Input
                      type="number"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) || 0 })}
                      min={0}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Initial Stock</Label>
                    <Input
                      type="number"
                      value={newProduct.stock}
                      onChange={(e) => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) || 0 })}
                      min={0}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Minimum Stock</Label>
                    <Input
                      type="number"
                      value={newProduct.minStock}
                      onChange={(e) => setNewProduct({ ...newProduct, minStock: parseInt(e.target.value) || 0 })}
                      min={0}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Supplier</Label>
                  <Input
                    value={newProduct.supplier}
                    onChange={(e) => setNewProduct({ ...newProduct, supplier: e.target.value })}
                    placeholder="e.g., Cipla"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="prescription"
                    checked={newProduct.prescription}
                    onChange={(e) => setNewProduct({ ...newProduct, prescription: e.target.checked })}
                    className="w-4 h-4 rounded border-border"
                  />
                  <Label htmlFor="prescription">Requires Prescription</Label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="outline" className="flex-1" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button className="flex-1 btn-hero" onClick={handleAddProduct}>
                  <Save size={16} className="mr-2" />
                  Add Product
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
