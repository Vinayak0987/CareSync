import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { type PatientOrder } from '@/lib/mockData';

// Initial orders data (same as pharmacy)
const initialOrders: PatientOrder[] = [
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
];

const ORDERS_STORAGE_KEY = 'caresync_orders';
const ORDER_COUNTER_KEY = 'caresync_order_counter';

// Load from localStorage or use initial data
function loadOrders(): PatientOrder[] {
  try {
    const stored = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load orders from localStorage:', e);
  }
  return initialOrders;
}

function loadOrderCounter(): number {
  try {
    const stored = localStorage.getItem(ORDER_COUNTER_KEY);
    if (stored) {
      return parseInt(stored, 10);
    }
  } catch (e) {
    console.error('Failed to load order counter from localStorage:', e);
  }
  return initialOrders.length + 1;
}

interface OrderContextType {
  orders: PatientOrder[];
  addOrder: (order: Omit<PatientOrder, 'id' | 'orderDate'>) => void;
  updateOrderStatus: (orderId: string, status: PatientOrder['status']) => void;
  getPatientOrders: (patientName: string) => PatientOrder[];
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<PatientOrder[]>(loadOrders);
  const orderCounterRef = useRef(loadOrderCounter());

  // Create a BroadcastChannel for direct tab-to-tab communication
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    channelRef.current = new BroadcastChannel('caresync_orders_channel');
    
    channelRef.current.onmessage = (event) => {
      if (event.data.type === 'SYNC_ORDERS' && event.data.payload) {
        console.log('Received broadcast sync');
        setOrders(event.data.payload);
      }
    };

    return () => {
      channelRef.current?.close();
    };
  }, []);

  // Persist orders to localStorage and Broadcast changes
  useEffect(() => {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    
    // Broadcast to other tabs
    if (channelRef.current) {
      channelRef.current.postMessage({
        type: 'SYNC_ORDERS',
        payload: orders
      });
    }
  }, [orders]);

  // Listen for changes from other tabs (Storage Event Backup)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === ORDERS_STORAGE_KEY && e.newValue) {
        try {
          const newOrders = JSON.parse(e.newValue);
          // Only update if different length to avoid loops (simple check)
          setOrders(prev => {
             if (JSON.stringify(prev) !== e.newValue) {
                return newOrders;
             }
             return prev;
          });
        } catch (err) {
          console.error('Failed to parse synced orders:', err);
        }
      }
      if (e.key === ORDER_COUNTER_KEY && e.newValue) {
        orderCounterRef.current = parseInt(e.newValue, 10);
      }
    };

    // Force reload on window focus to ensure consistency
    const handleFocus = () => {
      const stored = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (stored) {
        try {
          const storedOrders = JSON.parse(stored);
          setOrders(prev => {
            if (JSON.stringify(prev) !== stored) {
               console.log('Focus sync: Updating orders from storage');
               return storedOrders; 
            }
            return prev;
          });
        } catch (e) { console.error(e); }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const addOrder = useCallback((orderData: Omit<PatientOrder, 'id' | 'orderDate'>) => {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    }) + ', ' + now.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true 
    });
    
    // Ensure we have the latest counter
    const currentCounterStr = localStorage.getItem(ORDER_COUNTER_KEY);
    if (currentCounterStr) {
      orderCounterRef.current = Math.max(orderCounterRef.current, parseInt(currentCounterStr, 10));
    }
    
    const orderId = `ORD-2026-${String(orderCounterRef.current).padStart(3, '0')}`;
    orderCounterRef.current += 1;
    localStorage.setItem(ORDER_COUNTER_KEY, String(orderCounterRef.current));
    
    const newOrder: PatientOrder = {
      ...orderData,
      id: orderId,
      orderDate: formattedDate,
    };
    
    console.log('Adding new order:', newOrder);
    setOrders(prev => [newOrder, ...prev]);
  }, []);

  const updateOrderStatus = useCallback((orderId: string, status: PatientOrder['status']) => {
    console.log('Updating order status:', orderId, status);
    setOrders(prev => 
      prev.map(order => 
        order.id === orderId ? { ...order, status } : order
      )
    );
  }, []);

  const getPatientOrders = useCallback((patientName: string) => {
    return orders.filter(order => order.patientName === patientName);
  }, [orders]);

  return (
    <OrderContext.Provider value={{ orders, addOrder, updateOrderStatus, getPatientOrders }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
}
