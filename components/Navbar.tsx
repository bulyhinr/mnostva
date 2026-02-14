import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { NAV_ITEMS } from '../constants';
import Logo from './Logo';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import CartDrawer from './CartDrawer';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [cartBumping, setCartBumping] = useState(false);
  const { totalItems } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine current page from location
  const getCurrentPage = (): any => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path.startsWith('/marketplace')) return 'marketplace';
    if (path.startsWith('/about')) return 'about';
    if (path.startsWith('/profile')) return 'profile';
    if (path.startsWith('/login')) return 'login';
    if (path.startsWith('/checkout')) return 'checkout';
    if (path.startsWith('/license')) return 'license';
    if (path.startsWith('/product')) return 'product-detail';
    if (path.startsWith('/admin')) return 'admin';
    return 'home';
  };

  const currentPage = getCurrentPage();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsPinned(true);
      } else {
        setIsPinned(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (totalItems > 0) {
      setCartBumping(true);
      const timer = setTimeout(() => setCartBumping(false), 300);
      return () => clearTimeout(timer);
    }
  }, [totalItems]);

  const handleLinkClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();

    if (href === '#home' || href === '/') {
      navigate('/');
    } else if (href === '#marketplace' || href === '/marketplace') {
      navigate('/marketplace');
    } else if (href === '#about' || href === '/about') {
      navigate('/about');
    } else if (href.startsWith('#')) {
      // It's an anchor link (like #benefits)
      if (currentPage !== 'home') {
        navigate('/');
        // Wait for render before scrolling
        setTimeout(() => {
          const element = document.querySelector(href);
          if (element) element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        // Already on home, just scroll
        const element = document.querySelector(href);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }
    }

    setIsOpen(false);
    setIsCartOpen(false);
  };

  const transitionClass = "transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] transform-gpu will-change-[transform,padding,width,background-color,border-radius]";

  return (
    <>
      <div className="h-20 pointer-events-none"></div>

      <nav
        className={`fixed left-0 right-0 z-[150] flex justify-center transform-gpu ${transitionClass} ${isPinned ? 'top-0 px-0' : 'top-4 px-4 md:px-6'
          }`}
      >
        <div
          className={`relative flex items-center justify-between shadow-2xl ${transitionClass} ${isPinned
            ? 'w-full max-w-full rounded-none py-3 px-8 md:px-12 bg-[#8a7db3]/95 backdrop-blur-md border-b-2 border-black/5'
            : 'w-full max-w-7xl rounded-[2.5rem] py-2 px-6 md:px-10 bg-[#8a7db3]/90 backdrop-blur-lg border-b-4 border-black/20'
            }`}
        >
          {/* Logo Section */}
          <div
            className="flex items-center cursor-pointer group shrink-0"
            onClick={() => {
              navigate('/');
              setIsCartOpen(false);
            }}
          >
            <div className={`${transitionClass} flex items-center ${isPinned ? 'h-8 md:h-10' : 'h-12 md:h-16'
              }`}>
              <Logo className="h-full" />
            </div>
          </div>

          {/* Desktop Menu */}
          <div className={`hidden lg:flex items-center ${transitionClass} ${isPinned ? 'gap-8' : 'gap-6'}`}>
            <div className="flex items-center gap-6 mr-4">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => handleLinkClick(e, item.href)}
                  className={`text-white hover:text-pink-200 font-bold transition-colors duration-300 text-[10px] md:text-xs uppercase tracking-[0.2em] relative group py-2 ${isPinned ? 'opacity-90' : 'opacity-100'
                    } ${(item.href === '#marketplace' && currentPage === 'marketplace') ||
                      (item.href === '#home' && currentPage === 'home') ||
                      (item.href === '#about' && currentPage === 'about')
                      ? 'text-pink-200' : ''
                    }`}
                >
                  {item.label}
                  <span className={`absolute -bottom-1 left-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full rounded-full ${((item.href === '#marketplace' && currentPage === 'marketplace') ||
                    (item.href === '#home' && currentPage === 'home') ||
                    (item.href === '#about' && currentPage === 'about')) ? 'w-full' : 'w-0'
                    }`}></span>
                </a>
              ))}
              {user?.isAdmin && (
                <Link
                  to="/admin"
                  className={`text-pink-300 hover:text-white font-black transition-colors duration-300 text-[10px] md:text-xs uppercase tracking-[0.2em] relative group py-2 ${isPinned ? 'opacity-90' : 'opacity-100'
                    } ${currentPage === 'admin' ? 'text-white underline' : ''}`}
                >
                  Admin
                  <span className={`absolute -bottom-1 left-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full rounded-full ${currentPage === 'admin' ? 'w-full' : 'w-0'
                    }`}></span>
                </Link>
              )}
            </div>

            <div className="flex items-center gap-3">
              {user ? (
                <button
                  onClick={() => navigate('/profile')}
                  className={`flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all border border-white/10 ${isPinned ? 'px-3 py-1.5' : 'px-4 py-2.5'
                    }`}
                >
                  <div className="w-6 h-6 rounded-full overflow-hidden border border-white/20">
                    <img src={user.avatar} className="w-full h-full object-cover" alt={user.name} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest truncate max-w-[80px]">{user.name.split(' ')[0]}</span>
                </button>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className={`text-white font-black uppercase tracking-widest text-[10px] hover:text-pink-200 transition-colors ${isPinned ? 'px-2' : 'px-4'
                    }`}
                >
                  Login
                </button>
              )}

              <button
                onClick={() => setIsCartOpen(true)}
                className={`relative bg-white text-[#8a7db3] rounded-full font-black shadow-lg hover:shadow-white/20 active:scale-95 uppercase tracking-tight flex items-center gap-2 transition-all duration-300 ${isPinned ? 'px-5 py-2 text-[10px]' : 'px-7 py-3 text-xs'
                  } ${cartBumping ? 'animate-bounce-short' : ''}`}
              >
                <svg className={`${isPinned ? 'w-4 h-4' : 'w-5 h-5'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Cart
                {totalItems > 0 && (
                  <span className="bg-[#8a7db3] text-white px-1.5 py-0.5 rounded-full text-[9px] min-w-[18px] text-center ml-0.5">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Mobile UI */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={() => setIsCartOpen(true)}
              className={`relative text-white p-2 active:scale-90 transition-transform ${cartBumping ? 'animate-bounce-short' : ''}`}
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {totalItems > 0 && (
                <span className={`absolute -top-1 -right-1 bg-pink-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#8a7db3] transition-transform ${cartBumping ? 'scale-125' : 'scale-100'}`}>
                  {totalItems}
                </span>
              )}
            </button>
            <button
              className="p-2 text-white active:scale-90 transition-transform"
              onClick={() => setIsOpen(!isOpen)}
            >
              <div className="relative w-8 h-6">
                <span className={`absolute left-0 block w-8 h-1 bg-white transition-all duration-300 ${isOpen ? 'top-2.5 rotate-45' : 'top-0'}`}></span>
                <span className={`absolute left-0 top-2.5 block w-8 h-1 bg-white transition-all duration-300 ${isOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                <span className={`absolute left-0 block w-8 h-1 bg-white transition-all duration-300 ${isOpen ? 'bottom-2.5 -rotate-45' : 'bottom-0'}`}></span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        <div className={`absolute top-full left-0 right-0 lg:hidden overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-4'
          }`}>
          <div className={`mx-4 mt-2 bg-[#8a7db3] p-8 shadow-2xl backdrop-blur-2xl border-b-4 border-black/20 ${transitionClass} ${isPinned ? 'rounded-none mx-0' : 'rounded-[2.5rem]'
            }`}>
            <div className="flex flex-col space-y-5">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-xl text-white font-black text-center border-b border-white/10 pb-3 hover:text-pink-200 transition-colors"
                  onClick={(e) => handleLinkClick(e, item.href)}
                >
                  {item.label}
                </a>
              ))}

              {user ? (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    navigate('/profile');
                  }}
                  className="text-xl text-white font-black text-center border-b border-white/10 pb-3 flex items-center justify-center gap-3"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-white">
                    <img src={user.avatar} className="w-full h-full object-cover" alt={user.name} />
                  </div>
                  My Profile
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    navigate('/login');
                  }}
                  className="text-xl text-white font-black text-center border-b border-white/10 pb-3"
                >
                  Login
                </button>
              )}

              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsCartOpen(false);
                  navigate('/marketplace');
                }}
                className="bg-white text-[#8a7db3] px-6 py-4 rounded-2xl font-black text-lg shadow-xl"
              >
                Visit Marketplace
              </button>
            </div>
          </div>
        </div>
      </nav>

      <style>{`
        @keyframes bounce-short {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.3) translateY(-5px); }
        }
        .animate-bounce-short {
          animation: bounce-short 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
      `}</style>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={() => navigate('/checkout')}
      />
    </>
  );
};

export default Navbar;
