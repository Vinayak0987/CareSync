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
  productCategories,
  type InventoryProduct
} from '@/lib/mockData';

// Initial pharmacy products data
const initialProducts: InventoryProduct[] = [
  { id: 'inv-001', name: 'Paracetamol 500mg', category: 'Pain Relief', price: 45, stock: 250, minStock: 50, status: 'in-stock', image: '💊', prescription: false, supplier: 'Cipla', lastRestocked: '2026-01-28' },
  { id: 'inv-002', name: 'Amlodipine 5mg', category: 'Heart Health', price: 120, stock: 85, minStock: 30, status: 'in-stock', image: '❤️', prescription: true, supplier: 'Sun Pharma', lastRestocked: '2026-01-25' },
  { id: 'inv-003', name: 'Insulin Glargine', category: 'Diabetes', price: 850, stock: 8, minStock: 15, status: 'low-stock', image: '💉', prescription: true, supplier: 'Novo Nordisk', lastRestocked: '2026-01-20' },
  { id: 'inv-004', name: 'Metformin 500mg', category: 'Diabetes', price: 85, stock: 120, minStock: 40, status: 'in-stock', image: '💊', prescription: true, supplier: "Dr. Reddy's", lastRestocked: '2026-01-27' },
  { id: 'inv-005', name: 'Cetirizine 10mg', category: 'Allergy', price: 35, stock: 0, minStock: 25, status: 'out-of-stock', image: '🤧', prescription: false, supplier: 'Cipla', lastRestocked: '2026-01-15' },
  { id: 'inv-006', name: 'Omeprazole 20mg', category: 'Digestive', price: 95, stock: 65, minStock: 20, status: 'in-stock', image: '💊', prescription: true, supplier: 'Lupin', lastRestocked: '2026-01-26' },
  { id: 'inv-007', name: 'Aspirin 75mg', category: 'Heart Health', price: 55, stock: 12, minStock: 25, status: 'low-stock', image: '❤️', prescription: true, supplier: 'Bayer', lastRestocked: '2026-01-22' },
  { id: 'inv-008', name: 'Vitamin D3 1000IU', category: 'Supplements', price: 250, stock: 180, minStock: 30, status: 'in-stock', image: '☀️', prescription: false, supplier: 'HealthKart', lastRestocked: '2026-01-29' },
  { id: 'inv-009', name: 'Blood Pressure Monitor', category: 'Devices', price: 1299, stock: 15, minStock: 5, status: 'in-stock', image: '🩺', prescription: false, supplier: 'Omron', lastRestocked: '2026-01-24' },
  { id: 'inv-010', name: 'Glucose Test Strips', category: 'Diabetes', price: 450, stock: 5, minStock: 20, status: 'low-stock', image: '🩸', prescription: false, supplier: 'Accu-Chek', lastRestocked: '2026-01-18' },
  { id: 'inv-011', name: 'Azithromycin 500mg', category: 'Antibiotics', price: 180, stock: 75, minStock: 25, status: 'in-stock', image: '💊', prescription: true, supplier: 'Zydus', lastRestocked: '2026-01-30' },
  { id: 'inv-012', name: 'Pantoprazole 40mg', category: 'Digestive', price: 110, stock: 90, minStock: 30, status: 'in-stock', image: '💊', prescription: true, supplier: 'Alkem', lastRestocked: '2026-01-28' },
  { id: 'inv-013', name: 'Multivitamin Tablets', category: 'Supplements', price: 320, stock: 200, minStock: 40, status: 'in-stock', image: '💪', prescription: false, supplier: 'Himalaya', lastRestocked: '2026-01-31' },
  { id: 'inv-014', name: 'Ibuprofen 400mg', category: 'Pain Relief', price: 60, stock: 3, minStock: 30, status: 'low-stock', image: '💊', prescription: false, supplier: 'Abbott', lastRestocked: '2026-01-10' },
  { id: 'inv-015', name: 'Digital Thermometer', category: 'Devices', price: 299, stock: 25, minStock: 10, status: 'in-stock', image: '🌡️', prescription: false, supplier: 'Dr. Trust', lastRestocked: '2026-01-27' },
];

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

  // Validation errors state
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

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

  const handleAddProduct = () => {
    // Validate form before submission
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    const product: InventoryProduct = {
      id: `inv-${Date.now()}`,
      ...newProduct,
      name: newProduct.name.trim(),
      supplier: newProduct.supplier.trim(),
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
    setErrors({});
    toast.success('Product added successfully!');
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
                <Button className="flex-1 h-11 btn-hero" onClick={handleAddProduct}>
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
