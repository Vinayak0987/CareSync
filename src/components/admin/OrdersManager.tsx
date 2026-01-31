import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search,
  Clock,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  FileText,
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { patientOrders as initialOrders, type PatientOrder } from '@/lib/mockData';

type OrderStatus = PatientOrder['status'];

export function OrdersManager() {
  const [orders, setOrders] = useState<PatientOrder[]>(initialOrders);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all');

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          order.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders(orders.map(o => 
      o.id === orderId ? { ...o, status: newStatus } : o
    ));
    toast.success(`Order ${orderId} marked as ${newStatus}`);
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'processing': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'dispatched': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'delivered': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return <Clock size={16} />;
      case 'processing': return <Package size={16} />;
      case 'dispatched': return <Truck size={16} />;
      case 'delivered': return <CheckCircle size={16} />;
      case 'cancelled': return <XCircle size={16} />;
    }
  };

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    switch (currentStatus) {
      case 'pending': return 'processing';
      case 'processing': return 'dispatched';
      case 'dispatched': return 'delivered';
      default: return null;
    }
  };

  const statusFilters: (OrderStatus | 'all')[] = ['all', 'pending', 'processing', 'dispatched', 'delivered', 'cancelled'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl sm:text-3xl font-display font-bold mb-2">Orders Manager</h1>
        <p className="text-muted-foreground">Track and fulfill patient orders</p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 sm:grid-cols-5 gap-3"
      >
        {(['pending', 'processing', 'dispatched', 'delivered', 'cancelled'] as OrderStatus[]).map((status) => {
          const count = orders.filter(o => o.status === status).length;
          return (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={cn(
                "p-3 rounded-xl border text-center transition-all",
                filterStatus === status 
                  ? getStatusColor(status)
                  : "bg-card border-border hover:border-primary/50"
              )}
            >
              <p className="text-lg font-display font-bold">{count}</p>
              <p className="text-xs capitalize">{status}</p>
            </button>
          );
        })}
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
            placeholder="Search by patient name or order ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {statusFilters.map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all capitalize",
                filterStatus === status
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {status}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Orders List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        {filteredOrders.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-12 text-center">
            <Package size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No orders found</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <motion.div
              key={order.id}
              layout
              className="bg-card rounded-xl border border-border p-4 shadow-sm"
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Order Info */}
                <div className="flex items-center gap-3 flex-1">
                  <img
                    src={order.patientAvatar}
                    alt={order.patientName}
                    className="w-12 h-12 rounded-full object-cover border-2 border-border"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-muted-foreground font-mono">{order.id}</span>
                      <span className={cn(
                        "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border",
                        getStatusColor(order.status)
                      )}>
                        {getStatusIcon(order.status)}
                        <span className="capitalize">{order.status}</span>
                      </span>
                      {order.prescription && (
                        <span className={cn(
                          "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                          order.prescriptionVerified 
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        )}>
                          <FileText size={10} />
                          {order.prescriptionVerified ? 'Rx ✓' : 'Rx ⚠'}
                        </span>
                      )}
                    </div>
                    <p className="font-medium">{order.patientName}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin size={12} />
                      {order.deliveryAddress}
                    </p>
                  </div>
                </div>

                {/* Items */}
                <div className="flex-shrink-0">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {order.items.map((item, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-1 bg-muted rounded-lg"
                      >
                        {item.name} × {item.quantity}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">{order.orderDate}</p>
                </div>

                {/* Total & Actions */}
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-lg font-display font-bold">₹{order.total}</p>
                    <p className="text-xs text-muted-foreground">
                      {order.items.length} item{order.items.length > 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {getNextStatus(order.status) && (
                      <Button
                        size="sm"
                        onClick={() => updateOrderStatus(order.id, getNextStatus(order.status)!)}
                        className="btn-hero"
                      >
                        {order.status === 'pending' && 'Process'}
                        {order.status === 'processing' && 'Dispatch'}
                        {order.status === 'dispatched' && 'Deliver'}
                      </Button>
                    )}
                    {order.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateOrderStatus(order.id, 'cancelled')}
                        className="text-red-600 hover:bg-red-50"
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  );
}
