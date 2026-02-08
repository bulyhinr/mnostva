
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ScrollReveal from '../components/ScrollReveal';

interface LoginPageProps {
  onSuccess: () => void;
  onBack: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onSuccess, onBack }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignup) {
        if (!name.trim()) {
          setError('Please enter your name');
          setLoading(false);
          return;
        }
        await register(name, email);
        onSuccess();
      } else {
        const success = await login(email, password);
        if (success) {
          onSuccess();
        } else {
          setError('Invalid email or password. Try 123@123.com / 123123');
        }
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 bg-gradient-to-br from-[#8a7db3]/10 to-pink-50">
      <ScrollReveal className="w-full max-w-md">
        <button 
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-[#8a7db3] font-black uppercase tracking-widest hover:translate-x-[-4px] transition-transform"
        >
          ← Back
        </button>

        <div className="bg-white rounded-[3rem] p-10 md:p-12 shadow-2xl border-b-8 border-black/10 text-center">
          <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
            {isSignup ? '🌈' : '✨'}
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-2">
            {isSignup ? 'Join the Magic!' : 'Welcome Back!'}
          </h1>
          <p className="text-gray-500 font-bold mb-8 uppercase tracking-widest text-xs">
            {isSignup ? 'Create your stylized account' : 'Enter your stylized world'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <div className="text-left animate-in fade-in slide-in-from-top-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-4">Full Name</label>
                <input 
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Artist Name"
                  required
                  className="w-full bg-gray-50 border-4 border-transparent focus:border-[#8a7db3] rounded-2xl px-6 py-4 font-bold outline-none transition-all text-[#8a7db3] placeholder-[#8a7db3]/30"
                />
              </div>
            )}
            
            <div className="text-left">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-4">Email Address</label>
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="123@123.com"
                required
                className="w-full bg-gray-50 border-4 border-transparent focus:border-[#8a7db3] rounded-2xl px-6 py-4 font-bold outline-none transition-all text-[#8a7db3] placeholder-[#8a7db3]/30"
              />
            </div>
            
            <div className="text-left">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-4">Password</label>
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                required
                className="w-full bg-gray-50 border-4 border-transparent focus:border-[#8a7db3] rounded-2xl px-6 py-4 font-bold outline-none transition-all text-[#8a7db3] placeholder-[#8a7db3]/30"
              />
            </div>

            {error && (
              <p className="text-pink-500 font-black text-xs uppercase bg-pink-50 p-3 rounded-xl border-2 border-pink-100">
                {error}
              </p>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-[#8a7db3] text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:translate-y-[-4px] active:translate-y-0 transition-all uppercase tracking-widest mt-4 disabled:opacity-50"
            >
              {loading ? 'Magic in progress...' : (isSignup ? 'Create Account 🎨' : 'Login Now 🌈')}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t-2 border-gray-50">
            <p className="text-gray-400 font-bold text-xs">
              {isSignup ? 'Already have an account?' : "Don't have an account?"} {' '}
              <button 
                onClick={() => { setIsSignup(!isSignup); setError(''); }}
                className="text-pink-500 hover:underline cursor-pointer font-black"
              >
                {isSignup ? 'Login here' : 'Sign up here'}
              </button>
            </p>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
};

export default LoginPage;
