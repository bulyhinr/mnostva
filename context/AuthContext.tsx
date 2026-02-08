
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Order, ActivityLog } from '../types';

interface AuthContextType {
  user: User | null;
  orders: Order[];
  logs: ActivityLog[];
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  addOrder: (order: Order) => void;
  addLog: (type: ActivityLog['type'], description: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initial test user for development
const TEST_USER: User = {
  id: 'u1',
  email: '123@123.com',
  name: 'Mnostva Fan',
  avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Mnostva',
  bio: 'Big fan of stylized 3D art!',
  joinedAt: new Date().toISOString()
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  // Initialize and load from local storage
  useEffect(() => {
    const savedUser = localStorage.getItem('mnostva_user');
    const savedOrders = localStorage.getItem('mnostva_orders');
    const savedLogs = localStorage.getItem('mnostva_logs');

    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedOrders) setOrders(JSON.parse(savedOrders));
    if (savedLogs) setLogs(JSON.parse(savedLogs));
  }, []);

  const saveToStorage = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulated auth check
    if (email === '123@123.com' && password === '123123') {
      setUser(TEST_USER);
      saveToStorage('mnostva_user', TEST_USER);
      addLog('login', 'User logged in successfully');
      return true;
    }
    return false;
  };

  const register = async (name: string, email: string) => {
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      name,
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${name}`,
      bio: 'New explorer of stylized worlds!',
      joinedAt: new Date().toISOString()
    };
    setUser(newUser);
    saveToStorage('mnostva_user', newUser);
    addLog('login', 'New account created successfully');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mnostva_user');
    addLog('login', 'User logged out');
  };

  const updateProfile = (data: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...data };
    setUser(updatedUser);
    saveToStorage('mnostva_user', updatedUser);
    addLog('profile_update', 'Updated profile information');
  };

  const addOrder = (order: Order) => {
    const updatedOrders = [order, ...orders];
    setOrders(updatedOrders);
    saveToStorage('mnostva_orders', updatedOrders);
    addLog('purchase', `Purchased ${order.items.length} items`);
  };

  const addLog = (type: ActivityLog['type'], description: string) => {
    const newLog: ActivityLog = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      description,
      timestamp: new Date().toISOString()
    };
    const updatedLogs = [newLog, ...logs].slice(0, 50); // Keep last 50
    setLogs(updatedLogs);
    saveToStorage('mnostva_logs', updatedLogs);
  };

  return (
    <AuthContext.Provider value={{ user, orders, logs, login, register, logout, updateProfile, addOrder, addLog }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
