import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { Buyer, Product, Bill, LogEntry, Notification } from '../types';
import { api } from '../api';

interface AppContextType {
  isAuthenticated: boolean;
  isInitialized: boolean;
  login: (password: string) => Promise<void>;
  logout: () => void;
  buyers: Buyer[];
  addBuyer: (buyer: Omit<Buyer, 'id'>) => Promise<void>;
  updateBuyer: (buyer: Buyer) => Promise<void>;
  deleteBuyer: (id: string) => Promise<void>;
  productsCount: number;
  addProduct: (product: Omit<Product, 'id'>) => Promise<Product>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  bills: Bill[];
  addBill: (bill: Omit<Bill, 'id' | 'billNumber'>) => Promise<Bill>;
  logs: LogEntry[];
  notifications: Notification[];
  addNotification: (type: Notification['type'], message: string) => void;
  removeNotification: (id: string) => void;
  fetchData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [productsCount, setProductsCount] = useState<number>(0);
  const [bills, setBills] = useState<Bill[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((type: Notification['type'], message: string) => {
    const newNotification: Notification = {
      id: Date.now().toString(),
      type,
      message,
    };
    setNotifications(prev => [newNotification, ...prev.slice(0, 4)]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const data = await api.getInitialData();
      setBuyers(data.buyers);
      setProductsCount(data.productsCount);
      setBills(data.bills);
      setLogs(data.logs);
    } catch (error) {
      addNotification('error', 'Failed to load application data.');
      console.error(error);
    }
  }, [addNotification]);
  
  const checkAuthStatus = useCallback(async () => {
    try {
        const { isAuthenticated: authStatus } = await api.checkAuth();
        setIsAuthenticated(authStatus);
        if (authStatus) {
            await fetchData();
        }
    } catch {
        setIsAuthenticated(false);
    } finally {
        setIsInitialized(true);
    }
  }, [fetchData]);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = async (password: string) => {
    try {
      await api.login(password);
      setIsAuthenticated(true);
      await fetchData();
    } catch (error) {
      addNotification('error', (error as Error).message);
      throw error;
    }
  };

  const logout = async () => {
    await api.logout();
    setIsAuthenticated(false);
    setBuyers([]);
    setProductsCount(0);
    setBills([]);
    setLogs([]);
    addNotification('info', 'You have been successfully logged out.');
  };

  const addBuyer = async (buyer: Omit<Buyer, 'id'>) => {
    const newBuyer = await api.addBuyer(buyer);
    setBuyers(prev => [newBuyer, ...prev]);
    addNotification('success', `Buyer "${newBuyer.name}" was added.`);
    await fetchData(); // re-fetch logs
  };

  const updateBuyer = async (updatedBuyer: Buyer) => {
    await api.updateBuyer(updatedBuyer);
    setBuyers(prev => prev.map(b => b.id === updatedBuyer.id ? updatedBuyer : b));
    addNotification('success', `Buyer "${updatedBuyer.name}" was updated.`);
    await fetchData(); // re-fetch logs
  };

  const deleteBuyer = async (id: string) => {
    const buyerName = buyers.find(b => b.id === id)?.name || 'Unknown';
    await api.deleteBuyer(id);
    setBuyers(prev => prev.filter(b => b.id !== id));
    addNotification('warning', `Buyer "${buyerName}" has been deleted.`);
    await fetchData(); // re-fetch logs
  };

  const addProduct = async (product: Omit<Product, 'id'>): Promise<Product> => {
    const newProduct = await api.addProduct(product);
    setProductsCount(prev => prev + 1);
    addNotification('success', `Product "${newProduct.name}" was added.`);
    await fetchData(); // re-fetch logs
    return newProduct;
  };

  const updateProduct = async (updatedProduct: Product) => {
    await api.updateProduct(updatedProduct);
    addNotification('success', `Product "${updatedProduct.name}" was updated.`);
    await fetchData(); // re-fetch logs
  };

  const deleteProduct = async (id: string) => {
    const productName = `Product #${id}`; // Name is not available, use ID
    await api.deleteProduct(id);
    setProductsCount(prev => prev - 1);
    addNotification('warning', `Product "${productName}" has been deleted.`);
    await fetchData(); // re-fetch logs
  };

  const addBill = async (bill: Omit<Bill, 'id' | 'billNumber'>): Promise<Bill> => {
    const newBill = await api.addBill(bill);
    setBills(prev => [newBill, ...prev]);
    addNotification('success', `Bill ${newBill.billNumber} saved successfully.`);
    await fetchData(); // re-fetch logs
    return newBill;
  };

  const value = {
    isInitialized,
    isAuthenticated,
    login,
    logout,
    buyers,
    addBuyer,
    updateBuyer,
    deleteBuyer,
    productsCount,
    addProduct,
    updateProduct,
    deleteProduct,
    bills,
    addBill,
    logs,
    notifications,
    addNotification,
    removeNotification,
    fetchData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};