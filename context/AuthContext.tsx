import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Order, ActivityLog } from '../types';
import { authService } from '../services/authService';
import { orderService } from '../services/orderService';


interface AuthContextType {
  user: User | null;
  orders: Order[];
  logs: ActivityLog[];
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User> & { password?: string }) => Promise<void>;
  addOrder: (order: Order) => void;
  addLog: (type: ActivityLog['type'], description: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initial test user for development (fallback)
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
  const [loading, setLoading] = useState(true);

  // Initialize and load from local storage
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);

      // Load cached data first
      const savedOrders = localStorage.getItem('mnostva_orders');
      const savedLogs = localStorage.getItem('mnostva_logs');

      if (savedOrders) setOrders(JSON.parse(savedOrders));
      if (savedLogs) setLogs(JSON.parse(savedLogs));

      // Check if user has valid token
      if (authService.isAuthenticated()) {
        const savedUser = localStorage.getItem('mnostva_user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }

        // Sync orders with backend
        try {
          const token = authService.getAccessToken();
          if (token) {
            const apiOrders = await orderService.getMyOrders(token);
            setOrders(apiOrders);
            localStorage.setItem('mnostva_orders', JSON.stringify(apiOrders));
          }
        } catch (error) {
          console.error('Failed to sync orders:', error);
        }

      } else {
        // Token expired or invalid, clear user
        setUser(null);
        setOrders([]);
        setLogs([]);
        localStorage.removeItem('mnostva_user');
        localStorage.removeItem('mnostva_orders');
        localStorage.removeItem('mnostva_logs');
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  const saveToStorage = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);

      const response = await authService.login(email, password);
      const newUser: User = {
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
        avatar: response.user.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${response.user.name}`,
        bio: response.user.bio || 'Explorer of stylized worlds!',
        joinedAt: new Date().toISOString(), // In real app, this should come from backend
        isAdmin: response.user.isAdmin
      };

      setUser(newUser);
      saveToStorage('mnostva_user', newUser);

      // Clear old data first
      setOrders([]);
      setLogs([]);

      addLog('login', 'User logged in successfully');

      // Sync orders
      try {
        const apiOrders = await orderService.getMyOrders(response.accessToken);
        setOrders(apiOrders);
        saveToStorage('mnostva_orders', apiOrders);
      } catch (e) {
        console.error('Failed to fetch orders on login', e);
      }

      setLoading(false);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      setLoading(false);
      return false;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setLoading(true);

      // Try real API registration
      try {
        const response = await authService.register({ name, email, password });
        const newUser: User = {
          id: response.user.id,
          email: response.user.email,
          name: response.user.name,
          avatar: response.user.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${name}`,
          bio: 'New explorer of stylized worlds!',
          joinedAt: new Date().toISOString(),
          isAdmin: response.user.isAdmin
        };

        setUser(newUser);
        saveToStorage('mnostva_user', newUser);

        // Clear old data for new user
        setOrders([]);
        setLogs([]);
        localStorage.removeItem('mnostva_orders');
        localStorage.removeItem('mnostva_logs');

        addLog('login', 'New account created successfully');
      } catch (apiError) {
        // Fallback to mock registration
        console.warn('API registration failed, using mock:', apiError);
        const newUser: User = {
          id: Math.random().toString(36).substr(2, 9),
          email,
          name,
          avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${name}`,
          bio: 'New explorer of stylized worlds!',
          joinedAt: new Date().toISOString(),
          isAdmin: false
        };

        setUser(newUser);
        saveToStorage('mnostva_user', newUser);

        // Clear old data for new user
        setOrders([]);
        setLogs([]);
        localStorage.removeItem('mnostva_orders');
        localStorage.removeItem('mnostva_logs');

        addLog('login', 'New account created successfully (mock)');
      }

      setLoading(false);
    } catch (error) {
      console.error('Registration error:', error);
      setLoading(false);
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setOrders([]);
    setLogs([]);
    localStorage.removeItem('mnostva_user');
    localStorage.removeItem('mnostva_orders');
    localStorage.removeItem('mnostva_logs');
  };

  const updateProfile = async (data: Partial<User> & { password?: string }) => {
    if (!user) return;

    try {
      const response = await authService.updateProfile(data);

      const updatedUser: User = {
        ...user,
        name: response.name || user.name,
        email: response.email || user.email,
        bio: response.bio || user.bio,
        avatar: response.avatar || user.avatar,
      };

      setUser(updatedUser);
      saveToStorage('mnostva_user', updatedUser);
      addLog('profile_update', 'Updated profile information');
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
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
    <AuthContext.Provider value={{
      user,
      orders,
      logs,
      loading,
      login,
      register,
      logout,
      updateProfile,
      addOrder,
      addLog
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
