
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ScrollReveal from '../components/ScrollReveal';

interface ProfilePageProps {
  onBack: () => void;
  onNavigateToShop: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ onBack, onNavigateToShop }) => {
  const { user, orders, logs, updateProfile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'purchases' | 'settings' | 'logs'>('dashboard');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Settings form state
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || ''
  });

  if (!user) return null;

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setShowSuccess(false);
    
    // Simulate a polished saving process
    setTimeout(() => {
      updateProfile(formData);
      setIsUpdating(false);
      setShowSuccess(true);
      
      // Reset success state after some time
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1500);
  };

  return (
    <div className="min-h-screen pt-10 pb-20 px-4">
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
              <div className="w-24 h-24 rounded-full border-4 border-[#8a7db3] mx-auto mb-4 overflow-hidden bg-white shadow-xl relative group">
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <span className="text-white text-[8px] font-black uppercase">Edit</span>
                </div>
              </div>
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
                  }}
                  className={`w-full text-left px-6 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all flex items-center gap-4 ${
                    activeTab === tab.id 
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
                    <span className="text-4xl font-black text-pink-600">{orders.reduce((acc, o) => acc + o.items.length, 0)}</span>
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
                      {orders.map((order) => (
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
                              {order.items.slice(0, 4).map((item, idx) => (
                                <div key={idx} className="inline-block h-16 w-16 rounded-2xl ring-4 ring-white shadow-lg overflow-hidden relative group-hover:scale-110 transition-transform">
                                  <img className="h-full w-full object-cover" src={item.imageUrl} alt="" />
                                  {idx === 3 && order.items.length > 4 && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-black text-xs">
                                      +{order.items.length - 3}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>

                            <div className="flex-grow">
                              <h4 className="font-black text-xl text-gray-900 mb-1">
                                {order.items.length === 1 ? order.items[0].name : `${order.items.length} Asset Pack Bundle`}
                              </h4>
                              <p className="text-xs text-gray-500 font-medium">
                                {order.items.map(i => i.name).join(', ').slice(0, 60)}...
                              </p>
                            </div>

                            <div className="flex flex-col items-end shrink-0 gap-3">
                              <div className="text-right">
                                <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Order Total</span>
                                <span className="text-3xl font-black text-gray-900">${order.total.toFixed(2)}</span>
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
                      ))}
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
                    {orders.flatMap(order => order.items).map((item, i) => (
                      <div key={i} className="flex gap-5 p-5 bg-gray-50 rounded-[2.5rem] border-2 border-white shadow-sm hover:shadow-xl transition-all group">
                        <div className="w-28 h-28 rounded-3xl overflow-hidden bg-gray-200 shrink-0 border-4 border-white shadow-lg group-hover:scale-105 transition-transform">
                          <img src={item.imageUrl} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col justify-center">
                          <h4 className="font-black text-gray-900 text-lg leading-tight group-hover:text-[#8a7db3] transition-colors">{item.name}</h4>
                          <span className="text-[10px] font-black text-[#8a7db3] uppercase tracking-widest mt-1 mb-4">{item.category}</span>
                          <button className="bg-white text-gray-800 border-2 border-gray-100 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#8a7db3] hover:text-white hover:border-[#8a7db3] transition-all shadow-sm">
                            Download Files
                          </button>
                        </div>
                      </div>
                    ))}
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
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[11px] font-black text-gray-600 uppercase tracking-widest mb-3 ml-4">Display Name</label>
                      <input 
                        type="text"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-gray-50 border-4 border-transparent focus:border-[#8a7db3] focus:bg-white rounded-[2rem] px-8 py-5 font-bold outline-none transition-all text-gray-900 shadow-inner"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-black text-gray-600 uppercase tracking-widest mb-3 ml-4">Email Address</label>
                      <input 
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        className="w-full bg-gray-50 border-4 border-transparent focus:border-[#8a7db3] focus:bg-white rounded-[2rem] px-8 py-5 font-bold outline-none transition-all text-gray-900 shadow-inner"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-black text-gray-600 uppercase tracking-widest mb-3 ml-4">Your Bio</label>
                      <textarea 
                        value={formData.bio}
                        onChange={e => setFormData({...formData, bio: e.target.value})}
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
                      className={`w-full py-6 rounded-[2rem] font-black text-xl shadow-2xl transition-all uppercase tracking-widest border-b-8 flex items-center justify-center gap-3 ${
                        isUpdating 
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
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner ${
                          log.type === 'purchase' ? 'bg-[#a2c367]/10' : 
                          log.type === 'login' ? 'bg-[#8a7db3]/10' : 'bg-pink-100/50'
                        }`}>
                          {log.type === 'purchase' ? '🎨' : log.type === 'login' ? '🔑' : '👤'}
                        </div>
                        <div>
                          <p className="font-black text-gray-900 text-sm group-hover:text-[#8a7db3] transition-colors">{log.description}</p>
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">{new Date(log.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                      <span className={`text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest border ${
                         log.type === 'purchase' ? 'text-[#a2c367] border-[#a2c367]/30' : 
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
      </ScrollReveal>
    </div>
  );
};

export default ProfilePage;
