
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Marketplace from './components/Marketplace';
import WhyUs from './components/WhyUs';
import Platforms from './components/Platforms';
import MascotContact from './components/MascotContact';
import AICurator from './components/AICurator';
import MarketplacePage from './pages/MarketplacePage';
import LicensePage from './pages/LicensePage';
import ProductDetailPage from './pages/ProductDetailPage';
import AboutPage from './pages/AboutPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import CheckoutPage from './pages/CheckoutPage';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PageType, Product } from './types';
import { PRODUCTS } from './constants';

const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { user } = useAuth();

  // Redirect to home if user logs out while on profile page
  useEffect(() => {
    if (!user && currentPage === 'profile') {
      navigateTo('home');
    }
  }, [user, currentPage]);

  // Handle back button/browser history
  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash.startsWith('product-detail/')) {
        const id = hash.split('/')[1];
        const product = PRODUCTS.find(p => p.id === id);
        if (product) {
          setSelectedProduct(product);
          setCurrentPage('product-detail');
        } else {
          setCurrentPage('marketplace');
        }
      } else if (hash === 'marketplace') {
        setCurrentPage('marketplace');
      } else if (hash === 'license') {
        setCurrentPage('license');
      } else if (hash === 'about') {
        setCurrentPage('about');
      } else if (hash === 'login') {
        setCurrentPage('login');
      } else if (hash === 'profile') {
        setCurrentPage('profile');
      } else if (hash === 'checkout') {
        setCurrentPage('checkout');
      } else {
        setCurrentPage('home');
      }
    };
    window.addEventListener('popstate', handlePopState);
    handlePopState();
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (page: PageType, product?: Product) => {
    setCurrentPage(page);
    if (page === 'product-detail' && product) {
      setSelectedProduct(product);
      window.location.hash = `product-detail/${product.id}`;
    } else {
      window.location.hash = page === 'home' ? '' : page;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen pb-20 overflow-x-hidden">
      <Navbar onNavigate={navigateTo} currentPage={currentPage} />
      
      <main className="space-y-12">
        {currentPage === 'home' && (
          <>
            <Hero 
              onExplore={() => navigateTo('marketplace')} 
              onWorkWithUs={() => navigateTo('about')}
            />
            
            <div className="container mx-auto px-4" id="benefits">
              <div className="bg-white/40 backdrop-blur-xl rounded-[4rem] p-8 md:p-16 border-2 border-white shadow-2xl">
                <WhyUs />
              </div>
            </div>

            <Marketplace 
              title="Latest Releases" 
              limit={3} 
              onSeeAll={() => navigateTo('marketplace')} 
              onNavigateToLicense={() => navigateTo('license')}
            />

            <Platforms />

            <AICurator />
          </>
        )}

        {currentPage === 'marketplace' && (
          <MarketplacePage 
            onNavigateToLicense={() => navigateTo('license')} 
            onSelectProduct={(p) => navigateTo('product-detail', p)}
          />
        )}

        {currentPage === 'license' && (
          <LicensePage onBack={() => navigateTo('marketplace')} />
        )}

        {currentPage === 'about' && (
          <AboutPage onBack={() => navigateTo('home')} />
        )}

        {currentPage === 'login' && (
          <LoginPage 
            onSuccess={() => navigateTo('profile')}
            onBack={() => navigateTo('home')}
          />
        )}

        {currentPage === 'profile' && user && (
          <ProfilePage 
            onBack={() => navigateTo('home')} 
            onNavigateToShop={() => navigateTo('marketplace')}
          />
        )}

        {currentPage === 'checkout' && (
          <CheckoutPage 
            onSuccess={() => navigateTo('home')}
            onBack={() => navigateTo('marketplace')}
            onNavigateToProfile={() => navigateTo('profile')}
            onNavigateToLogin={() => navigateTo('login')}
          />
        )}

        {currentPage === 'product-detail' && selectedProduct && (
          <ProductDetailPage 
            product={selectedProduct} 
            onBack={() => navigateTo('marketplace')}
            onNavigateToLicense={() => navigateTo('license')}
          />
        )}
      </main>

      <footer className="text-center py-12 text-gray-500 relative">
        <div className="mb-6 flex flex-wrap justify-center items-center gap-6">
          <a href="https://www.instagram.com/mnostva" target="_blank" className="hover:text-pink-500 transition-colors font-bold">Instagram</a>
          <a href="https://www.artstation.com/mnostva" target="_blank" className="hover:text-pink-500 transition-colors font-bold">ArtStation</a>
          <a href="https://x.com/mnostva" target="_blank" className="hover:text-pink-500 transition-colors font-bold">X (Twitter)</a>
          <button 
            onClick={() => navigateTo('license')} 
            className="hover:text-pink-500 transition-colors font-bold uppercase tracking-widest text-[11px]"
          >
            License
          </button>
        </div>
        <p className="font-medium">© {new Date().getFullYear()} Mnostva Art. Stay Colorful! 🌈</p>
      </footer>

      <MascotContact />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
