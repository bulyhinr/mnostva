import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import { ProtectedRoute } from './components/ProtectedRoute';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { PRODUCTS } from './constants';

// Home Page Component
const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      <Hero
        onExplore={() => navigate('/marketplace')}
        onWorkWithUs={() => navigate('/about')}
      />

      <div className="container mx-auto px-4" id="benefits">
        <div className="bg-white/40 backdrop-blur-xl rounded-[4rem] p-8 md:p-16 border-2 border-white shadow-2xl">
          <WhyUs />
        </div>
      </div>

      <Marketplace
        title="Latest Releases"
        limit={3}
        onSeeAll={() => navigate('/marketplace')}
        onNavigateToLicense={() => navigate('/license')}
      />

      <Platforms />

      <AICurator />
    </>
  );
};

// Product Detail Wrapper to handle route params and fetching
const ProductDetailWrapper: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadProduct = async () => {
      if (!productId) return;

      // 1. Check static constants first
      const staticProduct = PRODUCTS.find(p => p.id === productId);
      if (staticProduct) {
        setProduct(staticProduct);
        setLoading(false);
        return;
      }

      // 2. Try fetching from backend
      try {
        const { productService } = await import('./services/productService');
        const backendProduct = await productService.getProductById(productId);

        if (backendProduct) {
          // Map backend product to frontend shape
          const mappedProduct = {
            id: backendProduct.id,
            name: backendProduct.title,
            price: backendProduct.price / 100,
            category: backendProduct.category,
            imageUrl: backendProduct.previewImageKey ? `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/storage/public/${backendProduct.previewImageKey}` : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800',
            description: backendProduct.description,
            tags: [backendProduct.category || 'Asset', '3D Model'],
            features: Array.isArray(backendProduct.features) ? backendProduct.features : (typeof backendProduct.features === 'string' ? (backendProduct.features as string).split(',').filter(Boolean) : []),
            packContent: Array.isArray(backendProduct.packContent) ? backendProduct.packContent : (typeof backendProduct.packContent === 'string' ? (backendProduct.packContent as string).split(',').filter(Boolean) : []),
            compatibility: Array.isArray(backendProduct.compatibility) ? backendProduct.compatibility : (typeof backendProduct.compatibility === 'string' ? (backendProduct.compatibility as string).split(',').filter(Boolean) : []),
            technicalSpecs: backendProduct.technicalSpecs || {},
            externalLinks: backendProduct.externalLinks || {},
            discount: backendProduct.discount,
            galleryImages: backendProduct.galleryImages || [],
            previewImageKey: backendProduct.previewImageKey
          };
          setProduct(mappedProduct);
        } else {
          navigate('/marketplace', { replace: true });
        }
      } catch (error) {
        console.error("Failed to load product", error);
        navigate('/marketplace', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [productId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-[#8a7db3] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return null; // Will redirect via useEffect
  }

  return (
    <ProductDetailPage
      product={product}
      onBack={() => navigate('/marketplace')}
      onNavigateToLicense={() => navigate('/license')}
    />
  );
};

import AdminPage from './pages/AdminPage';

// Main App Content with Routes
const AppContent: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pb-20 overflow-x-hidden">
      <Navbar />

      <main className="space-y-12">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/marketplace" element={
            <MarketplacePage
              onNavigateToLicense={() => navigate('/license')}
              onSelectProduct={(p) => navigate(`/product/${p.id}`)}
            />
          } />
          <Route path="/product/:productId" element={<ProductDetailWrapper />} />
          <Route path="/license" element={<LicensePage onBack={() => navigate('/marketplace')} />} />
          <Route path="/about" element={<AboutPage onBack={() => navigate('/')} />} />
          <Route path="/login" element={<LoginPage onSuccess={() => navigate('/profile')} onBack={() => navigate('/')} />} />
          <Route path="/checkout" element={
            <CheckoutPage
              onSuccess={() => navigate('/')}
              onBack={() => navigate('/marketplace')}
              onNavigateToProfile={() => navigate('/profile')}
              onNavigateToLogin={() => navigate('/login')}
            />
          } />

          {/* Protected Routes */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage
                onBack={() => navigate('/')}
                onNavigateToShop={() => navigate('/marketplace')}
              />
            </ProtectedRoute>
          } />

          <Route path="/admin" element={
            <ProtectedRoute adminOnly>
              <AdminPage />
            </ProtectedRoute>
          } />

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <footer className="text-center py-12 text-gray-500 relative">
        <div className="mb-6 flex flex-wrap justify-center items-center gap-6">
          <a href="https://www.instagram.com/mnostva" target="_blank" className="hover:text-pink-500 transition-colors font-bold">Instagram</a>
          <a href="https://www.artstation.com/mnostva" target="_blank" className="hover:text-pink-500 transition-colors font-bold">ArtStation</a>
          <a href="https://x.com/mnostva" target="_blank" className="hover:text-pink-500 transition-colors font-bold">X (Twitter)</a>
          <button
            onClick={() => navigate('/license')}
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

// Root App Component
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
