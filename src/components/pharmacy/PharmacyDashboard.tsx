import { motion } from 'framer-motion';
import {
  Package,
  ShoppingCart,
  AlertTriangle,
  TrendingUp,
  IndianRupee,
  Clock,
  CheckCircle,
  Truck,
  XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { type PatientOrder, type InventoryProduct } from '@/lib/mockData';

interface PharmacyDashboardProps {
  onNavigate: (tab: string) => void;
}

// Pharmacy Products Data
const inventoryProducts: InventoryProduct[] = [
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

// Patient Orders Data
const patientOrders: PatientOrder[] = [
  {
    id: 'ORD-2026-001',
    patientName: 'Ravi Kumar',
    patientAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    items: [
      { name: 'Amlodipine 5mg', quantity: 2, price: 120 },
      { name: 'Metformin 500mg', quantity: 1, price: 85 },
    ],
    total: 325,
    status: 'pending',
    prescription: true,
    prescriptionVerified: true,
    orderDate: '31 Jan 2026, 10:30 AM',
    deliveryAddress: 'Andheri West, Mumbai',
  },
  {
    id: 'ORD-2026-002',
    patientName: 'Priya Sharma',
    patientAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    items: [
      { name: 'Vitamin D3 1000IU', quantity: 1, price: 250 },
      { name: 'Multivitamin Tablets', quantity: 1, price: 320 },
    ],
    total: 570,
    status: 'processing',
    prescription: false,
    prescriptionVerified: false,
    orderDate: '31 Jan 2026, 09:15 AM',
    deliveryAddress: 'Koregaon Park, Pune',
  },
  {
    id: 'ORD-2026-003',
    patientName: 'Amit Patel',
    patientAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    items: [
      { name: 'Insulin Glargine', quantity: 1, price: 850 },
      { name: 'Glucose Test Strips', quantity: 2, price: 450 },
    ],
    total: 1750,
    status: 'dispatched',
    prescription: true,
    prescriptionVerified: true,
    orderDate: '30 Jan 2026, 04:45 PM',
    deliveryAddress: 'Satellite, Ahmedabad',
  },
  {
    id: 'ORD-2026-004',
    patientName: 'Sneha Reddy',
    patientAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    items: [
      { name: 'Paracetamol 500mg', quantity: 3, price: 45 },
      { name: 'Cetirizine 10mg', quantity: 1, price: 35 },
    ],
    total: 170,
    status: 'delivered',
    prescription: false,
    prescriptionVerified: false,
    orderDate: '29 Jan 2026, 11:00 AM',
    deliveryAddress: 'Banjara Hills, Hyderabad',
  },
  {
    id: 'ORD-2026-005',
    patientName: 'Vikram Singh',
    patientAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    items: [
      { name: 'Blood Pressure Monitor', quantity: 1, price: 1299 },
    ],
    total: 1299,
    status: 'pending',
    prescription: false,
    prescriptionVerified: false,
    orderDate: '31 Jan 2026, 11:20 AM',
    deliveryAddress: 'Indiranagar, Bangalore',
  },
  {
    id: 'ORD-2026-006',
    patientName: 'Meera Nair',
    patientAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    items: [
      { name: 'Azithromycin 500mg', quantity: 1, price: 180 },
      { name: 'Pantoprazole 40mg', quantity: 1, price: 110 },
    ],
    total: 290,
    status: 'processing',
    prescription: true,
    prescriptionVerified: true,
    orderDate: '31 Jan 2026, 08:45 AM',
    deliveryAddress: 'MG Road, Kochi',
  },
  {
    id: 'ORD-2026-007',
    patientName: 'Arjun Mehta',
    patientAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
    items: [
      { name: 'Omeprazole 20mg', quantity: 2, price: 95 },
      { name: 'Digital Thermometer', quantity: 1, price: 299 },
    ],
    total: 489,
    status: 'delivered',
    prescription: true,
    prescriptionVerified: true,
    orderDate: '28 Jan 2026, 02:30 PM',
    deliveryAddress: 'Connaught Place, Delhi',
  },
  {
    id: 'ORD-2026-008',
    patientName: 'Kavita Desai',
    patientAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
    items: [
      { name: 'Aspirin 75mg', quantity: 1, price: 55 },
      { name: 'Amlodipine 5mg', quantity: 1, price: 120 },
    ],
    total: 175,
    status: 'cancelled',
    prescription: true,
    prescriptionVerified: false,
    orderDate: '27 Jan 2026, 05:00 PM',
    deliveryAddress: 'Viman Nagar, Pune',
  },
];

// Auto-generate stock alerts from low/out of stock products
const stockAlerts = inventoryProducts
  .filter(p => p.status === 'low-stock' || p.status === 'out-of-stock')
  .map(p => ({
    id: p.id,
    name: p.name,
    stock: p.stock,
    minStock: p.minStock,
    status: p.status,
  }));

export function PharmacyDashboard({ onNavigate }: PharmacyDashboardProps) {
  const totalProducts = inventoryProducts.length;
  const lowStockCount = stockAlerts.filter(a => a.status === 'low-stock').length;
  const outOfStockCount = stockAlerts.filter(a => a.status === 'out-of-stock').length;
  const pendingOrders = patientOrders.filter(o => o.status === 'pending').length;
  const todaysRevenue = patientOrders
    .filter(o => o.status === 'delivered' || o.status === 'dispatched')
    .reduce((sum, o) => sum + o.total, 0);

  const getStatusColor = (status: PatientOrder['status']) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'processing': return 'bg-blue-100 text-blue-700';
      case 'dispatched': return 'bg-purple-100 text-purple-700';
      case 'delivered': return 'bg-emerald-100 text-emerald-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: PatientOrder['status']) => {
    switch (status) {
      case 'pending': return <Clock size={12} />;
      case 'processing': return <Package size={12} />;
      case 'dispatched': return <Truck size={12} />;
      case 'delivered': return <CheckCircle size={12} />;
      case 'cancelled': return <XCircle size={12} />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl sm:text-3xl font-display font-bold mb-2">Inventory Dashboard</h1>
        <p className="text-muted-foreground">Manage stock and fulfill orders</p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <div className="bg-card rounded-xl p-4 border border-border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Package size={20} className="text-primary" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold">{totalProducts}</p>
              <p className="text-xs text-muted-foreground">Total Products</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-4 border border-border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <ShoppingCart size={20} className="text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold">{pendingOrders}</p>
              <p className="text-xs text-muted-foreground">Pending Orders</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-4 border border-border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <AlertTriangle size={20} className="text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold">{lowStockCount + outOfStockCount}</p>
              <p className="text-xs text-muted-foreground">Stock Alerts</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-4 border border-border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <IndianRupee size={20} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold">₹{todaysRevenue.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Today's Revenue</p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Stock Alerts */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-xl border border-border shadow-sm"
        >
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-red-500" />
              <h2 className="font-display font-semibold text-lg">Stock Alerts</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('products')}>
              View All
            </Button>
          </div>

          <div className="divide-y divide-border">
            {stockAlerts.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <CheckCircle size={32} className="mx-auto mb-2 text-emerald-500" />
                <p>All products are well stocked!</p>
              </div>
            ) : (
              stockAlerts.map((alert) => (
                <div key={alert.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{alert.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Min: {alert.minStock} units
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={cn(
                      "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                      alert.status === 'out-of-stock'
                        ? "bg-red-100 text-red-700"
                        : "bg-amber-100 text-amber-700"
                    )}>
                      {alert.status === 'out-of-stock' ? (
                        <>
                          <XCircle size={12} />
                          Out of Stock
                        </>
                      ) : (
                        <>
                          <AlertTriangle size={12} />
                          {alert.stock} left
                        </>
                      )}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-xl border border-border shadow-sm"
        >
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <ShoppingCart size={18} className="text-primary" />
              <h2 className="font-display font-semibold text-lg">Recent Orders</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('orders')}>
              View All
            </Button>
          </div>

          <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
            {patientOrders.slice(0, 5).map((order) => (
              <div key={order.id} className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <img
                    src={order.patientAvatar}
                    alt={order.patientName}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{order.patientName}</p>
                    <p className="text-xs text-muted-foreground">{order.orderDate}</p>
                  </div>
                  <span className={cn(
                    "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                    getStatusColor(order.status)
                  )}>
                    {getStatusIcon(order.status)}
                    <span className="capitalize">{order.status}</span>
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {order.items.length} item{order.items.length > 1 ? 's' : ''}
                  </span>
                  <span className="font-medium">₹{order.total}</span>
                </div>
                {order.prescription && (
                  <div className="mt-2">
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full",
                      order.prescriptionVerified
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    )}>
                      {order.prescriptionVerified ? '✓ Rx Verified' : '⚠ Rx Pending'}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/20 p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={18} className="text-primary" />
          <h3 className="font-display font-semibold">Today's Summary</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-display font-bold text-primary">
              {patientOrders.filter(o => o.status === 'delivered').length}
            </p>
            <p className="text-xs text-muted-foreground">Orders Delivered</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-display font-bold text-primary">
              {patientOrders.filter(o => o.status === 'dispatched').length}
            </p>
            <p className="text-xs text-muted-foreground">In Transit</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-display font-bold text-primary">
              {inventoryProducts.filter(p => p.status === 'in-stock').length}
            </p>
            <p className="text-xs text-muted-foreground">In Stock Items</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-display font-bold text-primary">
              {patientOrders.filter(o => o.prescription && o.prescriptionVerified).length}
            </p>
            <p className="text-xs text-muted-foreground">Rx Verified</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
