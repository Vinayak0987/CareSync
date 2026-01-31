import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Package,
  X,
  Save,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { productCategories } from '@/lib/mockData';
import { useProducts, type InventoryProduct } from '@/contexts/ProductContext';

export function ProductsManager() {
  const { products, loading, fetchProducts, addProduct, updateStock, deleteProduct } = useProducts();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);
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

  // Validation errors state
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Refresh products on mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Validate form fields
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Product name validation
    if (!newProduct.name.trim()) {
      newErrors.name = 'Product name is required';
    } else if (newProduct.name.trim().length < 3) {
      newErrors.name = 'Product name must be at least 3 characters';
    }

    // Price validation
    if (newProduct.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    } else if (newProduct.price > 100000) {
      newErrors.price = 'Price cannot exceed ₹1,00,000';
    }

    // Stock validation
    if (newProduct.stock < 0) {
      newErrors.stock = 'Stock cannot be negative';
    } else if (newProduct.stock > 10000) {
      newErrors.stock = 'Stock cannot exceed 10,000 units';
    }

    // Minimum stock validation
    if (newProduct.minStock < 0) {
      newErrors.minStock = 'Minimum stock cannot be negative';
    } else if (newProduct.minStock > newProduct.stock && newProduct.stock > 0) {
      newErrors.minStock = 'Minimum stock cannot exceed current stock';
    }

    // Supplier validation (optional but if provided, must be valid)
    if (newProduct.supplier && newProduct.supplier.trim().length < 2) {
      newErrors.supplier = 'Supplier name must be at least 2 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddProduct = async () => {
    // Validate form before submission
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setSavingProduct(true);
    try {
      await addProduct({
        name: newProduct.name.trim(),
        category: newProduct.category,
        price: newProduct.price,
        stock: newProduct.stock,
        minStock: newProduct.minStock,
        image: newProduct.image,
        prescription: newProduct.prescription,
        supplier: newProduct.supplier.trim(),
      });

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
      setErrors({});
      toast.success('Product added successfully!');
    } catch (error) {
      console.error('Failed to add product:', error);
      toast.error('Failed to add product. Please try again.');
    } finally {
      setSavingProduct(false);
    }
  };

  // Clear errors when modal closes
  const handleCloseModal = () => {
    setShowAddModal(false);
    setErrors({});
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
  };

  const handleUpdateStock = async (id: string, newStock: number) => {
    try {
      await updateStock(id, newStock);
      toast.success('Stock updated!');
    } catch (error) {
      console.error('Failed to update stock:', error);
      toast.error('Failed to update stock');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteProduct(id);
      toast.success('Product deleted!');
    } catch (error) {
      console.error('Failed to delete product:', error);
      toast.error('Failed to delete product');
    }
  };

  const getStatusColor = (status: InventoryProduct['status']) => {
    switch (status) {
      case 'in-stock': return 'bg-emerald-100 text-emerald-700';
      case 'low-stock': return 'bg-amber-100 text-amber-700';
      case 'out-of-stock': return 'bg-red-100 text-red-700';
    }
  };

  if (loading && products.length === 0) {
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
            <p className="text-sm text-muted-foreground mt-1">Add your first product to get started</p>
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
              onClick={handleCloseModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 m-auto w-[calc(100%-2rem)] sm:w-full max-w-lg h-fit max-h-[85vh] bg-card rounded-2xl shadow-2xl z-50 flex flex-col"
            >
              {/* Modal Header - Sticky */}
              <div className="flex items-center justify-between p-5 border-b border-border bg-card shrink-0">
                <div>
                  <h2 className="font-display font-bold text-xl">Add New Product</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">Fill in the product details below</p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Content - Scrollable */}
              <div className="p-5 space-y-4 overflow-y-auto flex-1 min-h-0">
                {/* Product Name */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Product Name *</Label>
                  <Input
                    value={newProduct.name}
                    onChange={(e) => {
                      setNewProduct({ ...newProduct, name: e.target.value });
                      if (errors.name) setErrors({ ...errors, name: '' });
                    }}
                    placeholder="e.g., Paracetamol 500mg"
                    className={cn("h-11", errors.name && "border-red-500 focus:ring-red-500/20")}
                  />
                  {errors.name && <p className="text-xs text-red-500 flex items-center gap-1"><AlertTriangle size={12} />{errors.name}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Category */}
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Category *</Label>
                    <select
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                      className="w-full h-11 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    >
                      {productCategories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Price */}
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Price (₹) *</Label>
                    <Input
                      type="number"
                      value={newProduct.price}
                      onChange={(e) => {
                        setNewProduct({ ...newProduct, price: parseFloat(e.target.value) || 0 });
                        if (errors.price) setErrors({ ...errors, price: '' });
                      }}
                      min={0}
                      className={cn("h-11", errors.price && "border-red-500 focus:ring-red-500/20")}
                    />
                    {errors.price && <p className="text-xs text-red-500 flex items-center gap-1"><AlertTriangle size={12} />{errors.price}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Initial Stock */}
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Initial Stock *</Label>
                    <Input
                      type="number"
                      value={newProduct.stock}
                      onChange={(e) => {
                        setNewProduct({ ...newProduct, stock: parseInt(e.target.value) || 0 });
                        if (errors.stock) setErrors({ ...errors, stock: '' });
                      }}
                      min={0}
                      className={cn("h-11", errors.stock && "border-red-500 focus:ring-red-500/20")}
                    />
                    {errors.stock && <p className="text-xs text-red-500 flex items-center gap-1"><AlertTriangle size={12} />{errors.stock}</p>}
                  </div>

                  {/* Minimum Stock */}
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Minimum Stock *</Label>
                    <Input
                      type="number"
                      value={newProduct.minStock}
                      onChange={(e) => {
                        setNewProduct({ ...newProduct, minStock: parseInt(e.target.value) || 0 });
                        if (errors.minStock) setErrors({ ...errors, minStock: '' });
                      }}
                      min={0}
                      className={cn("h-11", errors.minStock && "border-red-500 focus:ring-red-500/20")}
                    />
                    {errors.minStock && <p className="text-xs text-red-500 flex items-center gap-1"><AlertTriangle size={12} />{errors.minStock}</p>}
                  </div>
                </div>

                {/* Supplier */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Supplier</Label>
                  <Input
                    value={newProduct.supplier}
                    onChange={(e) => {
                      setNewProduct({ ...newProduct, supplier: e.target.value });
                      if (errors.supplier) setErrors({ ...errors, supplier: '' });
                    }}
                    placeholder="e.g., Cipla, Sun Pharma"
                    className={cn("h-11", errors.supplier && "border-red-500 focus:ring-red-500/20")}
                  />
                  {errors.supplier && <p className="text-xs text-red-500 flex items-center gap-1"><AlertTriangle size={12} />{errors.supplier}</p>}
                </div>

                {/* Prescription Checkbox */}
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <input
                    type="checkbox"
                    id="prescription"
                    checked={newProduct.prescription}
                    onChange={(e) => setNewProduct({ ...newProduct, prescription: e.target.checked })}
                    className="w-5 h-5 rounded border-border accent-primary"
                  />
                  <div>
                    <Label htmlFor="prescription" className="cursor-pointer font-medium">Requires Prescription</Label>
                    <p className="text-xs text-muted-foreground">Enable if this product needs a valid Rx</p>
                  </div>
                </div>
              </div>

              {/* Modal Footer - Sticky */}
              <div className="flex gap-3 p-5 border-t border-border bg-card shrink-0">
                <Button variant="outline" className="flex-1 h-11" onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button
                  className="flex-1 h-11 btn-hero"
                  onClick={handleAddProduct}
                  disabled={savingProduct}
                >
                  {savingProduct ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} className="mr-2" />
                      Add Product
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
