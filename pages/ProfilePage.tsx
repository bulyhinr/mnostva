
import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import ScrollReveal from '../components/ScrollReveal';
import { Toaster, toast } from 'react-hot-toast';

interface ProfilePageProps {
  onBack: () => void;
  onNavigateToShop: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ onBack, onNavigateToShop }) => {
  const { user, orders, logs, updateProfile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'purchases' | 'settings' | 'logs'>('dashboard');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Settings form state
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    password: '',
    avatar: user?.avatar || '' // Keep current avatar URL
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  if (!user) return null;

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800';
  };

  const activeAvatar = avatarPreview || user.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=Mnostva';

  const uploadFile = async (file: File): Promise<string> => {
    const token = localStorage.getItem('accessToken');
    if (!token) throw new Error("No token");

    // 1. Get signed upload URL
    const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/storage/generate-upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ contentType: file.type, isPublic: true })
    });

    if (!res.ok) throw new Error('Failed to get upload URL');

    const { uploadUrl, key } = await res.json();

    // 2. Upload file directly to R2
    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file
    });

    if (!uploadRes.ok) throw new Error('Failed to upload file to storage');

    return key;
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setShowSuccess(false);

    try {
      let finalAvatarUrl = formData.avatar;

      if (avatarFile) {
        const key = await uploadFile(avatarFile);
        finalAvatarUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/storage/public/${key}`;
      }

      const updateData: any = {
        name: formData.name,
        email: formData.email,
        bio: formData.bio,
        avatar: finalAvatarUrl,
      };

      if (formData.password) {
        updateData.password = formData.password;
      }

      await updateProfile(updateData);

      setIsUpdating(false);
      setShowSuccess(true);
      toast.success('Profile updated successfully! ✨');
      setFormData(prev => ({ ...prev, password: '', avatar: finalAvatarUrl })); // Clear password field, update avatar
      setAvatarFile(null); // Clear pending file

      // Reset success state after some time
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Update failed", error);
      toast.error("Failed to update profile. Please try again.");
      setIsUpdating(false);
    }
  };

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
    }
  };

  return (
    <div className="min-h-screen pt-10 pb-20 px-4">
      <Toaster position="top-center" reverseOrder={false} />
      <ScrollReveal className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[#8a7db3] font-black uppercase tracking-widest hover:translate-x-[-4px] transition-transform"
          >
            ← Back
          </button>
          <button
            onClick={logout}
            className="text-pink-600 font-black uppercase tracking-widest text-xs hover:underline flex items-center gap-2 transition-colors"
          >
            Logout 👋
          </button>
        </div>

        <div className="bg-white rounded-[3.5rem] shadow-2xl overflow-hidden border-b-8 border-black/10 flex flex-col lg:flex-row min-h-[700px]">
          {/* Sidebar */}
          <div className="lg:w-1/4 bg-gray-50/80 p-8 lg:border-r-4 border-white flex flex-col">
            <div className="text-center mb-10">
              <div
                className="w-24 h-24 rounded-full border-4 border-[#8a7db3] mx-auto mb-4 overflow-hidden bg-white shadow-xl relative group cursor-pointer"
                onClick={() => activeTab === 'settings' && fileInputRef.current?.click()}
              >
                <img src={activeAvatar} alt={user.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                {activeTab === 'settings' && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-[8px] font-black uppercase">Change</span>
                  </div>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleAvatarSelect}
              />
              <h2 className="text-2xl font-black text-gray-900 truncate">{user.name}</h2>
            </div>

            <nav className="space-y-3 flex-grow">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
                { id: 'purchases', label: 'My Assets', icon: '📦' },
                { id: 'settings', label: 'Settings', icon: '⚙️' },
                { id: 'logs', label: 'Activity', icon: '📜' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setShowSuccess(false);
                    // Reset preview when leaving settings
                    if (activeTab === 'settings' && tab.id !== 'settings') {
                      setAvatarPreview(null);
                      setAvatarFile(null);
                      setFormData(prev => ({ ...prev, name: user.name, email: user.email, bio: user.bio || '', password: '' }));
                    }
                  }}
                  className={`w-full text-left px-6 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all flex items-center gap-4 ${activeTab === tab.id
                    ? 'bg-[#8a7db3] text-white shadow-lg translate-x-2'
                    : 'text-gray-600 hover:bg-white hover:text-[#8a7db3] hover:shadow-sm'
                    }`}
                >
                  <span className="text-xl filter drop-shadow-sm">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>

            <div className="mt-10 p-4 bg-white/50 rounded-2xl border border-white">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Support ID</p>
              <p className="text-xs font-mono text-gray-900 font-bold">#{user.id.toUpperCase()}</p>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:w-3/4 p-8 lg:p-14">
            {activeTab === 'dashboard' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-10 tracking-tight">Hello, <span className="text-[#8a7db3]">{user.name.split(' ')[0]}</span>! <span className="animate-pulse">🌈</span></h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                  <div className="bg-pink-50 p-7 rounded-[2.5rem] border-2 border-pink-100 shadow-sm group hover:scale-[1.02] transition-transform">
                    <span className="block text-[10px] font-black text-pink-500 uppercase tracking-widest mb-1">Total Assets</span>
                    <span className="text-4xl font-black text-pink-600">{orders.reduce((acc, o) => acc + (o.items?.length || 0), 0)}</span>
                  </div>
                  <div className="bg-[#8a7db3]/5 p-7 rounded-[2.5rem] border-2 border-[#8a7db3]/10 shadow-sm group hover:scale-[1.02] transition-transform">
                    <span className="block text-[10px] font-black text-[#8a7db3] uppercase tracking-widest mb-1">Orders Count</span>
                    <span className="text-4xl font-black text-[#8a7db3]">{orders.length}</span>
                  </div>
                  <div className="bg-[#a2c367]/10 p-7 rounded-[2.5rem] border-2 border-[#a2c367]/20 shadow-sm group hover:scale-[1.02] transition-transform">
                    <span className="block text-[10px] font-black text-[#a2c367] uppercase tracking-widest mb-1">Member Since</span>
                    <span className="text-xl font-black text-gray-800 flex items-center gap-2">
                      {new Date(user.joinedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
                      <span className="text-xs">✨</span>
                    </span>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-black text-gray-900 uppercase flex items-center gap-3">
                      <span className="w-10 h-10 bg-gray-100 rounded-2xl flex items-center justify-center text-lg">📜</span>
                      Order History
                    </h3>
                  </div>

                  {orders.length > 0 ? (
                    <div className="space-y-6">
                      {orders.map((order) => {
                        const items = order.items || [];
                        return (
                          <div key={order.id} className="bg-white rounded-[2.5rem] border-2 border-gray-100 shadow-xl shadow-purple-500/5 hover:border-[#8a7db3]/30 transition-all group overflow-hidden">
                            <div className="bg-gray-50/50 px-8 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-gray-100">
                              <div className="flex items-center gap-4">
                                <span className="bg-[#8a7db3] text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                                  #{order.id}
                                </span>
                                <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">
                                  {new Date(order.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-[#a2c367] uppercase tracking-[0.2em] bg-[#a2c367]/10 px-3 py-1 rounded-full border border-[#a2c367]/20">
                                  {order.status}
                                </span>
                              </div>
                            </div>

                            <div className="p-8 flex flex-col md:flex-row md:items-center gap-8">
                              <div className="flex -space-x-4 overflow-hidden shrink-0">
                                {items.slice(0, 4).map((item, idx) => (
                                  <div key={idx} className="inline-block h-16 w-16 rounded-2xl ring-4 ring-white shadow-lg overflow-hidden relative group-hover:scale-110 transition-transform">
                                    <img className="h-full w-full object-cover" src={item.imageUrl} alt="" onError={handleImageError} />
                                    {idx === 3 && items.length > 4 && (
                                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-black text-xs">
                                        +{items.length - 3}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>

                              <div className="flex-grow">
                                <h4 className="font-black text-xl text-gray-900 mb-2">
                                  {items.length === 1 ? items[0].name : `${items.length} Asset Pack Bundle`}
                                </h4>
                                <div className="text-xs text-gray-500 font-medium space-y-1">
                                  {items.slice(0, 4).map((i, idx) => (
                                    <div key={idx} className="flex justify-between w-full max-w-xs border-b border-gray-50 pb-1 last:border-0">
                                      <span className="truncate pr-4">{i.name}</span>
                                      <span className="font-bold text-gray-900 shrink-0">${(i.price).toFixed(2)}</span>
                                    </div>
                                  ))}
                                  {items.length > 4 && (
                                    <p className="text-[10px] text-gray-400 pt-1 italic">...and {items.length - 4} more items</p>
                                  )}
                                </div>
                              </div>

                              <div className="flex flex-col items-end shrink-0 gap-3">
                                <div className="text-right">
                                  <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Order Total</span>
                                  <span className="text-3xl font-black text-gray-900">${(order.total || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex gap-2">
                                  <button className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all">
                                    Receipt 📥
                                  </button>
                                  <button
                                    onClick={() => setActiveTab('purchases')}
                                    className="bg-gray-900 hover:bg-[#8a7db3] text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg"
                                  >
                                    Library
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-20 bg-gray-50 rounded-[3rem] border-4 border-dashed border-gray-100">
                      <p className="text-gray-500 font-bold mb-6 text-xl">You haven't made any purchases yet!</p>
                      <button
                        onClick={onNavigateToShop}
                        className="bg-[#8a7db3] text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:translate-y-[-4px] transition-all"
                      >
                        Start Your Journey 🛍️
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'purchases' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-3xl font-black text-gray-900 mb-10 uppercase tracking-tight">Your Stylized <span className="text-pink-500 underline decoration-wavy decoration-pink-200 underline-offset-8">Collection</span></h2>

                {orders.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {orders.flatMap(order => order.items || []).map((item: any, i) => {
                      const isDeleted = item.isDeleted;
                      const imageUrl = item.imageUrl;
                      const name = item.name;
                      const description = item.description;
                      const category = item.category;

                      return (
                        <div key={i} className={`flex gap-5 p-5 bg-gray-50 rounded-[2.5rem] border-2 border-white shadow-sm hover:shadow-xl transition-all group ${isDeleted ? 'opacity-70 grayscale' : ''}`}>
                          <div className="w-28 h-28 rounded-3xl overflow-hidden bg-gray-200 shrink-0 border-4 border-white shadow-lg group-hover:scale-105 transition-transform">
                            <img src={imageUrl} className="w-full h-full object-cover" onError={handleImageError} alt={name} />
                          </div>
                          <div className="flex flex-col justify-center flex-grow">
                            <h4 className="font-black text-gray-900 text-lg leading-tight group-hover:text-[#8a7db3] transition-colors">{name}</h4>

                            {isDeleted ? (
                              <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mt-1 mb-2">Discontinued Asset</p>
                            ) : (
                              <span className="text-[10px] font-black text-[#8a7db3] uppercase tracking-widest mt-1 mb-2 block">{category}</span>
                            )}

                            <p className="text-xs text-gray-500 mb-4 line-clamp-2 leading-relaxed">
                              {isDeleted ? 'This item is no longer available in the store.' : (description || 'Unlock your creative potential with this unique asset pack. Includes high-quality files ready for your projects.')}
                            </p>

                            <div className="flex items-center gap-3 mb-4">
                              <span className="font-black text-pink-500 text-lg">${(item.price).toFixed(2)}</span>
                              <span className="text-[9px] bg-pink-50 text-pink-600 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold border border-pink-100">Purchased</span>
                            </div>

                            <button
                              onClick={async () => {
                                const productId = item.productId || item.product?.id;

                                if (isDeleted || !productId) {
                                  toast.error('This asset has been removed from our servers. Please contact support.', {
                                    style: { borderRadius: '1rem', background: '#333', color: '#fff', fontSize: '12px' }
                                  });
                                  return;
                                }

                                try {
                                  const loadingToast = toast.loading('Securely preparing download...', {
                                    style: { borderRadius: '1rem', fontSize: '12px' }
                                  });
                                  const token = localStorage.getItem('accessToken');
                                  const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/storage/generate-download`, {
                                    method: 'POST',
                                    headers: {
                                      'Content-Type': 'application/json',
                                      'Authorization': `Bearer ${token}`
                                    },
                                    body: JSON.stringify({ productId })
                                  });

                                  if (!response.ok) {
                                    toast.dismiss(loadingToast);
                                    toast.error('Download permission denied. Contact support.', { duration: 4000 });
                                    return;
                                  }

                                  const data = await response.json();
                                  toast.dismiss(loadingToast);
                                  toast.success('Download starting! 🚀', { duration: 3000 });
                                  window.open(data.downloadUrl, '_blank');
                                } catch (e) {
                                  console.error(e);
                                  toast.dismiss();
                                  toast.error('Network error during download.');
                                }
                              }}
                              className={`bg-white text-gray-800 border-2 border-gray-100 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${isDeleted
                                ? 'cursor-not-allowed opacity-50 hover:bg-gray-100'
                                : 'hover:bg-[#8a7db3] hover:text-white hover:border-[#8a7db3]'
                                }`}>
                              {isDeleted ? 'Unavailable 🚫' : 'Download Files'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-24 bg-gray-50/50 rounded-[4rem] border-4 border-dashed border-gray-100">
                    <div className="text-6xl mb-6">🏜️</div>
                    <p className="text-gray-500 font-black text-2xl mb-8">No assets in your library yet!</p>
                    <button
                      onClick={onNavigateToShop}
                      className="bg-[#8a7db3] text-white px-12 py-5 rounded-[2rem] font-black uppercase tracking-widest shadow-2xl hover:translate-y-[-4px] transition-all"
                    >
                      Explore the Shop 🪄
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-xl">
                <h2 className="text-3xl font-black text-gray-900 mb-10 uppercase tracking-tight tracking-tight">Profile <span className="text-[#8a7db3]">Settings</span></h2>

                <form onSubmit={handleUpdate} className="space-y-8">
                  <div className="text-center mb-8">
                    <div className="relative inline-block group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                      <div className="w-32 h-32 rounded-full border-4 border-[#8a7db3] overflow-hidden mx-auto shadow-xl">
                        <img src={activeAvatar} alt="Avatar Preview" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                      </div>
                      <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-xs font-black uppercase">Change Photo</span>
                      </div>
                      <div className="absolute bottom-0 right-0 bg-[#8a7db3] text-white p-2 rounded-full shadow-lg border-2 border-white">
                        <span className="text-lg">📷</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-4 font-bold uppercase tracking-wide">Click to update avatar</p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-[11px] font-black text-gray-600 uppercase tracking-widest mb-3 ml-4">Display Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-gray-50 border-4 border-transparent focus:border-[#8a7db3] focus:bg-white rounded-[2rem] px-8 py-5 font-bold outline-none transition-all text-gray-900 shadow-inner"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-black text-gray-600 uppercase tracking-widest mb-3 ml-4">Email Address</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-gray-50 border-4 border-transparent focus:border-[#8a7db3] focus:bg-white rounded-[2rem] px-8 py-5 font-bold outline-none transition-all text-gray-900 shadow-inner"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-black text-gray-600 uppercase tracking-widest mb-3 ml-4">Change Password</label>
                      <input
                        type="password"
                        placeholder="Current password hidden (leave blank to keep current)"
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                        className="w-full bg-gray-50 border-4 border-transparent focus:border-[#8a7db3] focus:bg-white rounded-[2rem] px-8 py-5 font-bold outline-none transition-all text-gray-900 shadow-inner"
                      />
                      <p className="text-[10px] text-gray-400 mt-2 ml-4 font-medium">Only enter if you want to change it.</p>
                    </div>
                    <div>
                      <label className="block text-[11px] font-black text-gray-600 uppercase tracking-widest mb-3 ml-4">Your Bio</label>
                      <textarea
                        value={formData.bio}
                        onChange={e => setFormData({ ...formData, bio: e.target.value })}
                        rows={4}
                        placeholder="Tell us about your creative journey..."
                        className="w-full bg-gray-50 border-4 border-transparent focus:border-[#8a7db3] focus:bg-white rounded-[2.5rem] px-8 py-5 font-bold outline-none transition-all resize-none text-gray-900 shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className={`w-full py-6 rounded-[2rem] font-black text-xl shadow-2xl transition-all uppercase tracking-widest border-b-8 flex items-center justify-center gap-3 ${isUpdating
                        ? 'bg-purple-400 text-white border-purple-600/30 scale-95 cursor-wait'
                        : showSuccess
                          ? 'bg-[#a2c367] text-white border-[#8db151]/30 animate-in zoom-in duration-300'
                          : 'bg-[#8a7db3] text-white border-purple-800/30 hover:translate-y-[-4px] active:translate-y-0'
                        }`}
                    >
                      {isUpdating ? (
                        <>
                          <span className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin"></span>
                          Saving Magic...
                        </>
                      ) : showSuccess ? (
                        <>
                          <span>✓</span>
                          Saved! ✨
                        </>
                      ) : (
                        'Save Changes ✨'
                      )}
                    </button>

                    {showSuccess && (
                      <p className="absolute -bottom-8 left-0 right-0 text-center text-[10px] font-black text-[#a2c367] uppercase tracking-widest animate-in fade-in slide-in-from-top-2">
                        Your profile has been polished!
                      </p>
                    )}
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'logs' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-3xl font-black text-gray-900 mb-10 uppercase tracking-tight">Recent <span className="text-gray-400">Activity</span></h2>

                <div className="space-y-4">
                  {logs.length > 0 ? logs.map(log => (
                    <div key={log.id} className="flex items-center justify-between p-6 bg-white border-2 border-gray-100 rounded-[2rem] shadow-sm hover:shadow-md transition-shadow group">
                      <div className="flex items-center gap-5">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner ${log.type === 'purchase' ? 'bg-[#a2c367]/10' :
                          log.type === 'login' ? 'bg-[#8a7db3]/10' : 'bg-pink-100/50'
                          }`}>
                          {log.type === 'purchase' ? '🎨' : log.type === 'login' ? '🔑' : '👤'}
                        </div>
                        <div>
                          <p className="font-black text-gray-900 text-sm group-hover:text-[#8a7db3] transition-colors">{log.description}</p>
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">{new Date(log.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                      <span className={`text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest border ${log.type === 'purchase' ? 'text-[#a2c367] border-[#a2c367]/30' :
                        log.type === 'login' ? 'text-[#8a7db3] border-[#8a7db3]/30' : 'text-pink-400 border-pink-400/30'
                        }`}>
                        {log.type.replace('_', ' ')}
                      </span>
                    </div>
                  )) : (
                    <div className="text-center py-20 text-gray-400">
                      <p className="font-bold">No activity logs yet.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </ScrollReveal >
    </div >
  );
};

export default ProfilePage;
