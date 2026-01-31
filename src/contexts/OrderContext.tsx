import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { type PatientOrder } from '@/lib/mockData';

const API_BASE_URL = 'http://localhost:5000/api';

interface OrderContextType {
  orders: PatientOrder[];
  loading: boolean;
  error: string | null;
  addOrder: (order: Omit<PatientOrder, 'id' | 'orderDate'>) => Promise<void>;
  updateOrderStatus: (orderId: string, status: PatientOrder['status']) => Promise<void>;
  getPatientOrders: (patientName: string) => PatientOrder[];
  refreshOrders: () => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<PatientOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all orders from backend
  const refreshOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/orders`);
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      const data = await response.json();
      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    refreshOrders();
  }, [refreshOrders]);

  // Auto-refresh every 5 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      refreshOrders();
    }, 5000);

    return () => clearInterval(interval);
  }, [refreshOrders]);

  // Create a new order
  const addOrder = useCallback(async (orderData: Omit<PatientOrder, 'id' | 'orderDate'>) => {
    try {
      setError(null);
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create order');
      }

      const newOrder = await response.json();
      console.log('Order created:', newOrder);

      // Add to local state immediately for responsiveness
      setOrders(prev => [newOrder, ...prev]);
    } catch (err) {
      console.error('Error creating order:', err);
      setError(err instanceof Error ? err.message : 'Failed to create order');
      throw err;
    }
  }, []);

  // Update order status
  const updateOrderStatus = useCallback(async (orderId: string, status: PatientOrder['status']) => {
    try {
      setError(null);
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update order status');
      }

      const updatedOrder = await response.json();
      console.log('Order status updated:', updatedOrder);

      // Update local state immediately
      setOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, status } : order
        )
      );
    } catch (err) {
      console.error('Error updating order status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update order status');
      throw err;
    }
  }, []);

  // Get orders for a specific patient (filtered from current state)
  const getPatientOrders = useCallback((patientName: string) => {
    return orders.filter(order => order.patientName === patientName);
  }, [orders]);

  return (
    <OrderContext.Provider value={{
      orders,
      loading,
      error,
      addOrder,
      updateOrderStatus,
      getPatientOrders,
      refreshOrders
    }}>
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
