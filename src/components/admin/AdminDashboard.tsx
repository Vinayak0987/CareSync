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
import { 
  inventoryProducts, 
  patientOrders, 
  stockAlerts,
  type PatientOrder 
} from '@/lib/mockData';

interface AdminDashboardProps {
  onNavigate: (tab: string) => void;
}

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
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
