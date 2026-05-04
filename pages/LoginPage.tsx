import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ScrollReveal from '../components/ScrollReveal';
import { useSearchParams } from 'react-router-dom';

interface LoginPageProps {
  onSuccess: () => void;
  onBack: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onSuccess, onBack }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [resetToken, setResetToken] = useState('');
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  
  const { login, register, forgotPassword, resetPassword } = useAuth();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('reset_token');
    if (token) {
      setResetToken(token);
      setIsResetPassword(true);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (isResetPassword) {
        if (password.length < 6) {
          setError('Password must be at least 6 characters');
          setLoading(false);
          return;
        }
        await resetPassword(resetToken, password);
        setSuccessMsg('Password has been reset successfully. You can now log in.');
        setTimeout(() => {
          setIsResetPassword(false);
          setResetToken('');
          setPassword('');
          // Clear query params to not be stuck in reset mode on reload
          window.history.replaceState({}, document.title, window.location.pathname);
        }, 3000);
      } else if (isForgotPassword) {
        if (!email.trim()) {
          setError('Please enter your email');
          setLoading(false);
          return;
        }
        await forgotPassword(email);
        setSuccessMsg('If an account with this email exists, a reset link has been sent.');
      } else if (isSignup) {
        if (!name.trim()) {
          setError('Please enter your name');
          setLoading(false);
          return;
        }
        if (!acceptedTerms) {
          setError('You must agree to the Terms and Privacy Policy');
          setLoading(false);
          return;
        }
        await register(name, email, password, acceptedTerms);
        onSuccess();
      } else {
        const success = await login(email, password);
        if (success) {
          onSuccess();
        } else {
          setError('Invalid email or password. Try 123@123.com / 123123');
        }
      }
    } catch (err: any) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
        // Handle NestJS standard error response (message can be string or array)
        const msg = err.response.data.message;
        setError(Array.isArray(msg) ? msg.join(', ') : msg);
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderHeader = () => {
    if (isResetPassword) {
      return (
        <>
          <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">🔐</div>
          <h1 className="text-4xl font-black text-gray-900 mb-2">Reset Password</h1>
          <p className="text-gray-500 font-bold mb-8 uppercase tracking-widest text-xs">Choose a new password</p>
        </>
      );
    }
    if (isForgotPassword) {
      return (
        <>
          <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">💌</div>
          <h1 className="text-4xl font-black text-gray-900 mb-2">Forgot Password</h1>
          <p className="text-gray-500 font-bold mb-8 uppercase tracking-widest text-xs">We will send a reset link</p>
        </>
      );
    }
    
    return (
      <>
        <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
          {isSignup ? '🌈' : '✨'}
        </div>
        <h1 className="text-4xl font-black text-gray-900 mb-2">
          {isSignup ? 'Join the Magic!' : 'Welcome Back!'}
        </h1>
        <p className="text-gray-500 font-bold mb-8 uppercase tracking-widest text-xs">
          {isSignup ? 'Create your stylized account' : 'Enter your stylized world'}
        </p>
      </>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 bg-transparent">
      <ScrollReveal className="w-full max-w-md">
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-[#8a7db3] font-black uppercase tracking-widest hover:translate-x-[-4px] transition-transform"
        >
          ← Back
        </button>

        <div className="bg-white rounded-[3rem] p-10 md:p-12 shadow-2xl border-b-8 border-black/10 text-center">
          {renderHeader()}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && !isForgotPassword && !isResetPassword && (
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

            {!isResetPassword && (
              <div className="text-left animate-in fade-in">
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
            )}

            {!isForgotPassword && (
              <div className="text-left animate-in fade-in">
                <div className="flex justify-between items-center mb-2 mx-4">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    {isResetPassword ? 'New Password' : 'Password'}
                  </label>
                  {!isSignup && !isResetPassword && (
                    <button
                      type="button"
                      onClick={() => { setIsForgotPassword(true); setError(''); setSuccessMsg(''); }}
                      className="text-[10px] font-bold text-pink-500 hover:underline uppercase"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  required
                  className="w-full bg-gray-50 border-4 border-transparent focus:border-[#8a7db3] rounded-2xl px-6 py-4 font-bold outline-none transition-all text-[#8a7db3] placeholder-[#8a7db3]/30"
                />
              </div>
            )}

            {isSignup && !isForgotPassword && !isResetPassword && (
              <div className="flex items-center gap-3 text-left px-2 py-3 animate-in fade-in">
                <input
                  id="terms"
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.value === 'on' || e.target.checked)}
                  className="w-5 h-5 accent-[#8a7db3] cursor-pointer shrink-0"
                  required
                />
                <label htmlFor="terms" className="text-xs font-bold text-gray-500 leading-tight cursor-pointer">
                  I agree to the <a href="/legal" target="_blank" rel="noopener noreferrer" className="text-[#8a7db3] hover:underline">Terms and Privacy Policy</a>.
                </label>
              </div>
            )}

            {error && (
              <p className="text-pink-500 font-black text-xs uppercase bg-pink-50 p-3 rounded-xl border-2 border-pink-100 animate-in fade-in">
                {error}
              </p>
            )}

            {successMsg && (
              <p className="text-green-500 font-black text-xs uppercase bg-green-50 p-3 rounded-xl border-2 border-green-100 animate-in fade-in">
                {successMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#8a7db3] text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:translate-y-[-4px] active:translate-y-0 transition-all uppercase tracking-widest mt-4 disabled:opacity-50"
            >
              {loading 
                ? 'Magic in progress...' 
                : isResetPassword 
                  ? 'Update Password 🔑' 
                  : isForgotPassword 
                    ? 'Send Reset Link 📧' 
                    : isSignup 
                      ? 'Create Account 🎨' 
                      : 'Login Now 🌈'
              }
            </button>
          </form>

          <div className="mt-8 pt-8 border-t-2 border-gray-50">
            {isForgotPassword || isResetPassword ? (
              <p className="text-gray-400 font-bold text-xs uppercase text-center">
                Remember your password? {' '}
                <button
                  onClick={() => { 
                    setIsForgotPassword(false); 
                    setIsResetPassword(false);
                    setResetToken('');
                    setError(''); 
                    setSuccessMsg(''); 
                    window.history.replaceState({}, document.title, window.location.pathname);
                  }}
                  className="text-pink-500 hover:underline cursor-pointer font-black"
                >
                  Back to login
                </button>
              </p>
            ) : (
              <p className="text-gray-400 font-bold text-xs text-center">
                {isSignup ? 'Already have an account?' : "Don't have an account?"} {' '}
                <button
                  onClick={() => { setIsSignup(!isSignup); setError(''); setSuccessMsg(''); }}
                  className="text-pink-500 hover:underline cursor-pointer font-black"
                >
                  {isSignup ? 'Login here' : 'Sign up here'}
                </button>
              </p>
            )}
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
};

export default LoginPage;
