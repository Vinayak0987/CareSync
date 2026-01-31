import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:5000/api';

// Types
export interface InventoryProduct {
    id: string;
    name: string;
    category: string;
    price: number;
    stock: number;
    minStock: number;
    status: 'in-stock' | 'low-stock' | 'out-of-stock';
    image: string;
    prescription: boolean;
    supplier: string;
    lastRestocked: string;
}

export interface StoreProduct {
    id: string;
    name: string;
    category: string;
    price: number;
    image: string;
    inStock: boolean;
    prescription: boolean;
}

interface ProductContextType {
    // Pharmacy products (full details)
    products: InventoryProduct[];
    // Store products (simplified)
    storeProducts: StoreProduct[];
    loading: boolean;
    error: string | null;
    // Actions
    fetchProducts: () => Promise<void>;
    fetchStoreProducts: () => Promise<void>;
    addProduct: (product: Omit<InventoryProduct, 'id' | 'status' | 'lastRestocked'>) => Promise<void>;
    updateProduct: (id: string, updates: Partial<InventoryProduct>) => Promise<void>;
    updateStock: (id: string, stock: number) => Promise<void>;
    deleteProduct: (id: string) => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: React.ReactNode }) {
    const [products, setProducts] = useState<InventoryProduct[]>([]);
    const [storeProducts, setStoreProducts] = useState<StoreProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch all products (for pharmacy)
    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(`${API_BASE_URL}/products`);
            if (!response.ok) throw new Error('Failed to fetch products');
            const data = await response.json();
            setProducts(data);
        } catch (err) {
            console.error('Error fetching products:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch products');
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch store products (for patients)
    const fetchStoreProducts = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(`${API_BASE_URL}/products/store`);
            if (!response.ok) throw new Error('Failed to fetch store products');
            const data = await response.json();
            setStoreProducts(data);
        } catch (err) {
            console.error('Error fetching store products:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch store products');
        } finally {
            setLoading(false);
        }
    }, []);

    // Add a new product
    const addProduct = useCallback(async (productData: Omit<InventoryProduct, 'id' | 'status' | 'lastRestocked'>) => {
        try {
            setError(null);
            const response = await fetch(`${API_BASE_URL}/products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to add product');
            }

            const newProduct = await response.json();
            setProducts(prev => [newProduct, ...prev]);
        } catch (err) {
            console.error('Error adding product:', err);
            setError(err instanceof Error ? err.message : 'Failed to add product');
            throw err;
        }
    }, []);

    // Update a product
    const updateProduct = useCallback(async (id: string, updates: Partial<InventoryProduct>) => {
        try {
            setError(null);
            const response = await fetch(`${API_BASE_URL}/products/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update product');
            }

            const updatedProduct = await response.json();
            setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
        } catch (err) {
            console.error('Error updating product:', err);
            setError(err instanceof Error ? err.message : 'Failed to update product');
            throw err;
        }
    }, []);

    // Update stock only
    const updateStock = useCallback(async (id: string, stock: number) => {
        try {
            setError(null);
            const response = await fetch(`${API_BASE_URL}/products/${id}/stock`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stock }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update stock');
            }

            const updatedProduct = await response.json();
            setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
        } catch (err) {
            console.error('Error updating stock:', err);
            setError(err instanceof Error ? err.message : 'Failed to update stock');
            throw err;
        }
    }, []);

    // Delete a product
    const deleteProduct = useCallback(async (id: string) => {
        try {
            setError(null);
            const response = await fetch(`${API_BASE_URL}/products/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete product');
            }

            setProducts(prev => prev.filter(p => p.id !== id));
        } catch (err) {
            console.error('Error deleting product:', err);
            setError(err instanceof Error ? err.message : 'Failed to delete product');
            throw err;
        }
    }, []);

    // Initial load
    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    return (
        <ProductContext.Provider value={{
            products,
            storeProducts,
            loading,
            error,
            fetchProducts,
            fetchStoreProducts,
            addProduct,
            updateProduct,
            updateStock,
            deleteProduct,
        }}>
            {children}
        </ProductContext.Provider>
    );
}

export function useProducts() {
    const context = useContext(ProductContext);
    if (context === undefined) {
        throw new Error('useProducts must be used within a ProductProvider');
    }
    return context;
}
