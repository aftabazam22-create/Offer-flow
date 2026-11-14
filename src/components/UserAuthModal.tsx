import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Package,
  Heart,
  LogOut,
  ShieldCheck,
  MapPin,
  Phone,
  Save,
  RefreshCw,
} from 'lucide-react';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase.js';
import { useStore } from '../context/StoreContext.js';

const BD_DISTRICTS = [
  'Dhaka',
  'Chattogram',
  'Sylhet',
  'Rajshahi',
  'Khulna',
  'Barishal',
  'Rangpur',
  'Mymensingh',
  'Gazipur',
  'Narayanganj',
  'Cumilla',
  'Cox’s Bazar',
  'Bogura',
  'Jessore',
  'Dinajpur',
  'Tangail',
  'Kushtia',
  'Feni',
  'Brahmanbaria',
  'Noakhali',
  'Pabna',
  'Jamalpur',
  'Faridpur',
  'Narsingdi',
  'Manikganj',
  'Munshiganj',
  'Sirajganj',
  'Other 64 Districts',
];

interface UserAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string, param?: string) => void;
  onOpenAdminLogin: () => void;
}

export const UserAuthModal: React.FC<UserAuthModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onOpenAdminLogin,
}) => {
  const {
    firebaseUser,
    userProfile,
    updateUserProfile,
    isAdmin,
    logoutUser,
    myOrderNumbers,
    wishlistCount,
    t,
    showToast,
  } = useStore();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  // Profile editor state when logged in
  const [profName, setProfName] = useState('');
  const [profPhone, setProfPhone] = useState('');
  const [profDistrict, setProfDistrict] = useState('Dhaka');
  const [profArea, setProfArea] = useState('');
  const [profAddress, setProfAddress] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setInfoMsg(null);
      setPassword('');
      setShowPassword(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (firebaseUser) {
      setProfName(
        userProfile?.displayName ||
          firebaseUser.displayName ||
          firebaseUser.email?.split('@')[0] ||
          ''
      );
      setProfPhone(userProfile?.phone || '');
      setProfDistrict(userProfile?.district || 'Dhaka');
      setProfArea(userProfile?.area || '');
      setProfAddress(userProfile?.address || '');
    }
  }, [firebaseUser, userProfile]);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    setInfoMsg(null);
    try {
      await signInWithPopup(auth, googleProvider);
      showToast(t('Logged in with Google!', 'গুগল দিয়ে লগইন সফল হয়েছে!'));
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user') {
        setError(t('Sign-in popup was closed.', 'লগইন পপআপ বন্ধ করা হয়েছে।'));
      } else {
        setError(err?.message || t('Google login failed.', 'গুগল লগইন ব্যর্থ হয়েছে।'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setLoading(true);
    setError(null);
    setInfoMsg(null);

    try {
      if (mode === 'register') {
        if (!fullName.trim()) {
          setError(t('Please enter your full name.', 'আপনার পুরো নাম লিখুন।'));
          setLoading(false);
          return;
        }
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        await updateProfile(cred.user, { displayName: fullName.trim() });
        try {
          await sendEmailVerification(cred.user);
        } catch {
          // Ignore verification email rate errors
        }
        showToast(t('Account created successfully!', 'নতুন অ্যাকাউন্ট তৈরি হয়েছে!'));
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
        showToast(t('Welcome back!', 'স্বাগতম! লগইন সফল হয়েছে'));
      }
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/operation-not-allowed') {
        setError(
          t(
            'Email/Password login is not enabled in Firebase Authentication yet. Please use "Continue with Google" above, or enable Email/Password in Firebase Console -> Authentication -> Sign-in method.',
            'ফায়ারবেসে ইমেইল/পাসওয়ার্ড লগইন এখনো চালু করা হয়নি। অনুগ্রহ করে উপরের "Google দিয়ে লগইন" ব্যবহার করুন, অথবা Firebase Console > Authentication > Sign-in method থেকে Email/Password চালু করুন।'
          )
        );
      } else if (code === 'auth/email-already-in-use') {
        setError(
          t(
            'An account already exists with this email. Try logging in instead.',
            'এই ইমেইল দিয়ে আগেই অ্যাকাউন্ট খোলা হয়েছে। লগইন করার চেষ্টা করুন।'
          )
        );
      } else if (code === 'auth/weak-password') {
        setError(
          t('Password must be at least 6 characters.', 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।')
        );
      } else if (
        code === 'auth/invalid-credential' ||
        code === 'auth/wrong-password' ||
        code === 'auth/user-not-found'
      ) {
        setError(
          t(
            'Invalid email or password. If you signed up with Google, use Google Sign-In above.',
            'ইমেইল বা পাসওয়ার্ড সঠিক নয়। আগে Google দিয়ে লগইন করে থাকলে উপরের Google বাটন ব্যবহার করুন।'
          )
        );
      } else {
        setError(err?.message || t('Authentication failed.', 'লগইন করা সম্ভব হয়নি।'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email.trim()) {
      setError(t('Enter your email address first to reset password.', 'পাসওয়ার্ড রিসেট করতে আগে ইমেইল লিখুন।'));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setInfoMsg(
        t(
          'Password reset link sent to your email!',
          'আপনার ইমেইলে পাসওয়ার্ড রিসেট লিংক পাঠানো হয়েছে!'
        )
      );
    } catch (err: any) {
      setError(err?.message || t('Could not send reset email.', 'রিসেট ইমেইল পাঠানো যায়নি।'));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser) return;
    if (!firebaseUser.emailVerified) {
      setError(
        t(
          'Please verify your email address first before saving profile details.',
          'প্রোফাইল সেভ করার আগে অনুগ্রহ করে আপনার ইমেইল ভেরিফাই করুন।'
        )
      );
      return;
    }
    if (!profName.trim()) {
      setError(t('Display name is required.', 'আপনার নাম লিখুন।'));
      return;
    }
    setSavingProfile(true);
    setError(null);
    setInfoMsg(null);
    try {
      await updateUserProfile({
        displayName: profName.trim(),
        email: firebaseUser.email || '',
        phone: profPhone.trim(),
        district: profDistrict,
        area: profArea.trim(),
        address: profAddress.trim(),
        photoURL: firebaseUser.photoURL || '',
      });
      showToast(t('Delivery details saved!', 'ঠিকানা ও তথ্য সেভ করা হয়েছে!'));
      setInfoMsg(
        t(
          'Your saved info will auto-fill during checkout.',
          'অর্ডার করার সময় আপনার ঠিকানা অটোমেটিক বসে যাবে।'
        )
      );
    } catch {
      setError(t('Failed to save profile details.', 'তথ্য সেভ করা যায়নি।'));
    } finally {
      setSavingProfile(false);
    }
  };

  const handleResendVerification = async () => {
    if (!firebaseUser) return;
    try {
      await sendEmailVerification(firebaseUser);
      setInfoMsg(t('Verification email sent! Check your inbox.', 'ভেরিফিকেশন ইমেইল পাঠানো হয়েছে!'));
    } catch {
      setError(t('Please wait a moment before requesting another email.', 'কিছুক্ষণ পর আবার চেষ্টা করুন।'));
    }
  };

  const handleRefreshVerification = async () => {
    if (!firebaseUser) return;
    await firebaseUser.reload();
    if (firebaseUser.emailVerified) {
      setInfoMsg(t('Email verified! Reloading profile...', 'ইমেইল ভেরিফাই সম্পন্ন!'));
      showToast(t('Email verified!', 'ইমেইল ভেরিফাই হয়েছে!'));
    } else {
      setError(t('Email is not verified yet. Please check your inbox/spam.', 'ইমেইল এখনো ভেরিফাই হয়নি। ইনবক্স/স্প্যাম চেক করুন।'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 my-4">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-rose-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-400/30 text-rose-300 flex items-center justify-center overflow-hidden">
              {firebaseUser?.photoURL ? (
                <img
                  src={firebaseUser.photoURL}
                  alt={firebaseUser.displayName || 'User'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {firebaseUser
                  ? t('My Account', 'আমার অ্যাকাউন্ট')
                  : mode === 'login'
                  ? t('Customer Login', 'কাস্টমার লগইন')
                  : t('Create Account', 'নতুন অ্যাকাউন্ট খুলুন')}
              </h3>
              <p className="text-[11px] text-slate-300">
                {firebaseUser
                  ? firebaseUser.email || firebaseUser.displayName
                  : t('Sync orders & fast checkout', 'সহজ অর্ডার ও লাইভ ট্র্যাকিং')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {infoMsg && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{infoMsg}</span>
            </div>
          )}

          {!firebaseUser ? (
            <>
              {/* 1-Click Google Login */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold shadow-lg flex items-center justify-center gap-3 transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span className="w-5 h-5 rounded-full bg-white text-slate-900 font-black text-[11px] flex items-center justify-center">
                    G
                  </span>
                )}
                <span>{t('Continue with Google', 'Google দিয়ে লগইন করুন')}</span>
              </button>

              <div className="relative flex items-center py-1">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="shrink mx-3 text-[11px] font-bold uppercase text-slate-400">
                  {t('or use email', 'অথবা ইমেইল দিয়ে')}
                </span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              {/* Login / Sign Up Switch */}
              <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-2xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                  }}
                  className={`py-2 rounded-xl transition-all ${
                    mode === 'login'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {t('Sign In', 'লগইন')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setError(null);
                  }}
                  className={`py-2 rounded-xl transition-all ${
                    mode === 'register'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {t('Sign Up', 'রেজিস্টার')}
                </button>
              </div>

              <form onSubmit={handleEmailSubmit} className="space-y-3">
                {mode === 'register' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t('Full Name', 'আপনার পুরো নাম')}
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder={t('e.g. Tanvir Hossain', 'যেমন: তানভীর হোসেন')}
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('Email Address', 'ইমেইল অ্যাড্রেস')}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@gmail.com"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      {t('Password', 'পাসওয়ার্ড')}
                    </label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={handlePasswordReset}
                        className="text-[11px] font-semibold text-rose-600 hover:underline"
                      >
                        {t('Forgot password?', 'পাসওয়ার্ড ভুলে গেছেন?')}
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t('Minimum 6 characters', 'কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড')}
                      className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-rose-600/25 transition-all disabled:opacity-50"
                >
                  {loading
                    ? t('Please wait...', 'অপেক্ষা করুন...')
                    : mode === 'login'
                    ? t('Login to My Account', 'লগইন করুন')
                    : t('Create Customer Account', 'অ্যাকাউন্ট তৈরি করুন')}
                </button>
              </form>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>{t('Store owner?', 'স্টোর অ্যাডমিন?')}</span>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAdminLogin();
                  }}
                  className="inline-flex items-center gap-1 font-bold text-slate-700 hover:text-rose-600"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-rose-500" />
                  <span>{t('Admin Portal Login', 'অ্যাডমিন পোর্টাল লগইন')}</span>
                </button>
              </div>
            </>
          ) : (
            /* Logged-In Customer Account Dashboard */
            <div className="space-y-4">
              {/* Quick Navigation Cards */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigate('orders');
                  }}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-rose-50 border border-slate-200/70 transition-colors text-left"
                >
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-rose-600" />
                    <span className="text-xs font-bold text-slate-800">
                      {t('My Orders', 'আমার অর্ডার')}
                    </span>
                  </div>
                  <span className="text-[11px] font-black bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                    {myOrderNumbers.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigate('wishlist');
                  }}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-rose-50 border border-slate-200/70 transition-colors text-left"
                >
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-rose-600" />
                    <span className="text-xs font-bold text-slate-800">
                      {t('Wishlist', 'উইশলিস্ট')}
                    </span>
                  </div>
                  <span className="text-[11px] font-black bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">
                    {wishlistCount}
                  </span>
                </button>
              </div>

              {isAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigate('admin');
                  }}
                  className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>{t('Open Admin Dashboard', 'অ্যাডমিন ড্যাশবোর্ডে যান')}</span>
                </button>
              )}

              {!firebaseUser.emailVerified && (
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs space-y-2">
                  <p className="font-semibold">
                    {t(
                      'Verify your email to save your delivery address across devices.',
                      'আপনার ঠিকানা সেভ করতে ইমেইল ভেরিফাই করুন।'
                    )}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      className="px-2.5 py-1 rounded-lg bg-amber-600 text-white font-bold text-[11px]"
                    >
                      {t('Send Link', 'লিংক পাঠান')}
                    </button>
                    <button
                      type="button"
                      onClick={handleRefreshVerification}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-amber-800 font-bold text-[11px]"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>{t('I Verified', 'ভেরিফাই করেছি')}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Saved Delivery Info Form */}
              <form
                onSubmit={handleSaveProfile}
                className="space-y-3 pt-2 border-t border-slate-100"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <MapPin className="w-3.5 h-3.5 text-rose-600" />
                  <span>{t('Saved Delivery Information', 'সেভ করা ডেলিভারি ঠিকানা')}</span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    {t('Full Name', 'পুরো নাম')}
                  </label>
                  <input
                    type="text"
                    required
                    value={profName}
                    onChange={(e) => setProfName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:border-rose-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      {t('Mobile Number', 'মোবাইল নম্বর')}
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        value={profPhone}
                        onChange={(e) => setProfPhone(e.target.value.replace(/[^0-9]/g, ''))}
                        maxLength={11}
                        placeholder="017XXXXXXXX"
                        className="w-full pl-8 pr-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:outline-hidden focus:border-rose-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      {t('District', 'জেলা')}
                    </label>
                    <select
                      value={profDistrict}
                      onChange={(e) => setProfDistrict(e.target.value)}
                      className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:border-rose-500"
                    >
                      {BD_DISTRICTS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    {t('Area / Thana', 'এলাকা / থানা')}
                  </label>
                  <input
                    type="text"
                    value={profArea}
                    onChange={(e) => setProfArea(e.target.value)}
                    placeholder={t('e.g. Dhanmondi, Mirpur', 'যেমন: ধানমন্ডি, মিরপুর')}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    {t('Full Address', 'বিস্তারিত ঠিকানা')}
                  </label>
                  <textarea
                    rows={2}
                    value={profAddress}
                    onChange={(e) => setProfAddress(e.target.value)}
                    placeholder={t('House, Road, Block...', 'বাড়ি নং, রোড নং...')}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:border-rose-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>
                    {savingProfile
                      ? t('Saving...', 'সেভ হচ্ছে...')
                      : t('Save Delivery Info', 'ঠিকানা সেভ করুন')}
                  </span>
                </button>
              </form>

              <button
                type="button"
                onClick={async () => {
                  await logoutUser();
                  showToast(t('Logged out successfully', 'সফলভাবে লগআউট হয়েছে'));
                  onClose();
                }}
                className="w-full py-2.5 border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-slate-600 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t('Logout', 'লগআউট')}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
