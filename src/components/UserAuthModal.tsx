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
  ArrowRight,
  Truck,
  Sparkles,
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

const GoogleLogoSvg: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
    />
  </svg>
);

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
            'Email/Password login is not enabled in Firebase Authentication yet. Please use "Continue with Google" above.',
            'ফায়ারবেসে ইমেইল/পাসওয়ার্ড লগইন এখনো চালু করা হয়নি। অনুগ্রহ করে উপরের "Continue with Google" ব্যবহার করুন।'
          )
        );
      } else if (code === 'auth/email-already-in-use') {
        setError(
          t(
            'An account already exists with this email. Try signing in instead.',
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
      setError(
        t('Enter your email address first to reset password.', 'পাসওয়ার্ড রিসেট করতে আগে ইমেইল লিখুন।')
      );
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
      setError(
        t(
          'Email is not verified yet. Please check your inbox or spam folder.',
          'ইমেইল এখনো ভেরিফাই হয়নি। ইনবক্স বা স্প্যাম ফোল্ডার চেক করুন।'
        )
      );
    }
  };

  const displayInitial = (
    userProfile?.displayName ||
    firebaseUser?.displayName ||
    firebaseUser?.email ||
    'U'
  )
    .charAt(0)
    .toUpperCase();

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className={`relative w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200/80 my-auto ${
          firebaseUser ? 'max-w-lg' : 'max-w-3xl'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-20 w-9 h-9 rounded-full bg-slate-100/90 hover:bg-slate-200 md:bg-slate-100 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-rose-500"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {!firebaseUser ? (
          /* Luxury Split-Column Auth View */
          <div className="grid grid-cols-1 md:grid-cols-12">
            {/* Left Editorial Brand Showcase (Desktop & Compact Mobile Header) */}
            <div className="md:col-span-5 bg-[#0B0F19] text-white p-5 sm:p-6 md:p-8 flex flex-col justify-between relative overflow-hidden">
              <div
                className="pointer-events-none absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 18% 18%, rgba(225, 29, 72, 0.45), transparent 55%), radial-gradient(circle at 85% 88%, rgba(148, 163, 184, 0.2), transparent 50%)',
                }}
              />

              <div className="relative z-10 space-y-4 md:space-y-6 pr-8 md:pr-0">
                {/* Brand Lockup */}
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-600 to-rose-700 flex items-center justify-center text-white font-black text-sm tracking-tight shadow-md shadow-rose-900/40">
                    OF
                  </div>
                  <span className="text-base font-extrabold tracking-tight text-white">
                    OFFER<span className="text-rose-400">FLOW</span>
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-white text-balance leading-snug">
                    {mode === 'login'
                      ? t('Welcome back to Offer Flow', 'অফার ফ্লো-তে স্বাগতম')
                      : t('Join Offer Flow Membership', 'নতুন সদস্য হিসেবে যোগ দিন')}
                  </h2>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {t(
                      'Sign in once for instant address autofill, live parcel tracking, and seamless Cash on Delivery orders.',
                      'একবার লগইন করলে দ্রুত ঠিকানা অটোফিল, লাইভ অর্ডার ট্র্যাকিং এবং সহজ ক্যাশ অন ডেলিভারি সুবিধা পাবেন।'
                    )}
                  </p>
                </div>
              </div>

              {/* Clean Hairline Benefits List (Desktop) */}
              <div className="relative z-10 hidden md:block pt-6 mt-6 border-t border-white/10 space-y-3.5 text-xs text-slate-300">
                <div className="flex items-start gap-2.5">
                  <Truck className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">
                      {t('1-Tap Express Checkout', '১-ক্লিকে দ্রুত অর্ডার')}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {t('Saved district, area & mobile number', 'সেভ করা ঠিকানা ও মোবাইল নম্বর')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Package className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">
                      {t('Real-Time Order Sync', 'লাইভ অর্ডার আপডেট')}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {t('Follow every step from confirmation to courier', 'কনফার্মেশন থেকে ডেলিভারি পর্যন্ত দেখুন')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">
                      {t('Protected Account Access', 'সুরক্ষিত অ্যাকাউন্ট')}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {t('Encrypted sign-in backed by Google Cloud', 'গুগল ক্লাউড সিকিউরিটি দ্বারা সুরক্ষিত')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Authentication Form Area */}
            <div className="md:col-span-7 p-5 sm:p-6 md:p-8 flex flex-col justify-between space-y-5 max-h-[82vh] overflow-y-auto">
              <div className="space-y-4">
                <div className="space-y-1 pr-8">
                  <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                    {mode === 'login'
                      ? t('Sign in to your account', 'অ্যাকাউন্টে লগইন করুন')
                      : t('Create your account', 'নতুন অ্যাকাউন্ট খুলুন')}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {mode === 'login'
                      ? t('Choose Google or enter your email credentials.', 'গুগল অথবা ইমেইল ও পাসওয়ার্ড ব্যবহার করুন।')
                      : t('Takes less than 30 seconds to get started.', 'শুরু করতে ৩০ সেকেন্ডেরও কম সময় লাগবে।')}
                  </p>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{error}</span>
                  </div>
                )}

                {infoMsg && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{infoMsg}</span>
                  </div>
                )}

                {/* Official Google Sign-In Button */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full min-h-[44px] py-2.5 px-4 bg-white hover:bg-slate-50 active:scale-[0.99] text-slate-800 border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-3 transition-all disabled:opacity-50 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-rose-500"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
                  ) : (
                    <GoogleLogoSvg className="w-4 h-4 shrink-0" />
                  )}
                  <span>{t('Continue with Google', 'Google দিয়ে দ্রুত লগইন করুন')}</span>
                </button>

                <div className="relative flex items-center py-0.5">
                  <div className="flex-grow border-t border-slate-200" />
                  <span className="shrink mx-3 text-[11px] font-medium text-slate-400">
                    {t('or continue with email', 'অথবা ইমেইল ব্যবহার করুন')}
                  </span>
                  <div className="flex-grow border-t border-slate-200" />
                </div>

                {/* Clean Segmented Tabs */}
                <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setError(null);
                    }}
                    className={`min-h-[38px] py-1.5 rounded-lg transition-all whitespace-nowrap ${
                      mode === 'login'
                        ? 'bg-white text-slate-900 shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
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
                    className={`min-h-[38px] py-1.5 rounded-lg transition-all whitespace-nowrap ${
                      mode === 'register'
                        ? 'bg-white text-slate-900 shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {t('Create Account', 'নতুন অ্যাকাউন্ট')}
                  </button>
                </div>

                <form onSubmit={handleEmailSubmit} className="space-y-3.5">
                  {mode === 'register' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {t('Full Name', 'আপনার পুরো নাম')}
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder={t('e.g. Tanvir Hossain', 'যেমন: তানভীর হোসেন')}
                          className="w-full min-h-[44px] pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-slate-900 transition-colors"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t('Email Address', 'ইমেইল অ্যাড্রেস')}
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@gmail.com"
                        className="w-full min-h-[44px] pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-slate-900 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-700">
                        {t('Password', 'পাসওয়ার্ড')}
                      </label>
                      {mode === 'login' && (
                        <button
                          type="button"
                          onClick={handlePasswordReset}
                          className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:underline"
                        >
                          {t('Forgot password?', 'পাসওয়ার্ড ভুলে গেছেন?')}
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={t('Minimum 6 characters', 'কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড')}
                        className="w-full min-h-[44px] pl-10 pr-11 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-slate-900 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 transition-colors"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full min-h-[44px] py-3 px-4 bg-slate-900 hover:bg-rose-600 active:scale-[0.99] text-white rounded-xl text-xs font-bold shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-rose-500"
                  >
                    <span>
                      {loading
                        ? t('Signing you in...', 'অপেক্ষা করুন...')
                        : mode === 'login'
                        ? t('Sign In to Offer Flow', 'লগইন সম্পন্ন করুন')
                        : t('Create Free Account', 'নতুন অ্যাকাউন্ট তৈরি করুন')}
                    </span>
                    {!loading && <ArrowRight className="w-3.5 h-3.5" />}
                  </button>
                </form>
              </div>

              {/* Clean Footer Bar */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>{t('Store Administrator?', 'স্টোর অ্যাডমিন?')}</span>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAdminLogin();
                  }}
                  className="inline-flex items-center gap-1.5 font-bold text-slate-700 hover:text-rose-600 transition-colors whitespace-nowrap"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
                  <span>{t('Admin Portal Sign In', 'অ্যাডমিন পোর্টাল লগইন')}</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Signed-In Member Profile Suite */
          <div>
            {/* Dark Editorial Header */}
            <div className="px-6 py-5 bg-[#0B0F19] text-white flex items-center gap-3.5 pr-14">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-700 text-white flex items-center justify-center overflow-hidden shrink-0 ring-2 ring-white/15 font-black text-base">
                {firebaseUser.photoURL ? (
                  <img
                    src={firebaseUser.photoURL}
                    alt={firebaseUser.displayName || 'User'}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{displayInitial}</span>
                )}
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-white truncate">
                  {userProfile?.displayName ||
                    firebaseUser.displayName ||
                    t('Member Account', 'মেম্বার অ্যাকাউন্ট')}
                </h3>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-300 truncate">
                  <span className="truncate">{firebaseUser.email}</span>
                  {firebaseUser.emailVerified && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="text-emerald-400 font-semibold shrink-0">
                        {t('Verified', 'ভেরিফায়েড')}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{error}</span>
                </div>
              )}

              {infoMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{infoMsg}</span>
                </div>
              )}

              {/* Quick Navigation Cards */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigate('orders');
                  }}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition-colors text-left"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Package className="w-4 h-4 text-rose-600 shrink-0" />
                    <span className="text-xs font-bold text-slate-800 truncate">
                      {t('My Orders', 'আমার অর্ডার')}
                    </span>
                  </div>
                  <span className="text-xs font-extrabold tabular-nums text-slate-900">
                    {myOrderNumbers.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigate('wishlist');
                  }}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition-colors text-left"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Heart className="w-4 h-4 text-rose-600 shrink-0" />
                    <span className="text-xs font-bold text-slate-800 truncate">
                      {t('Wishlist', 'উইশলিস্ট')}
                    </span>
                  </div>
                  <span className="text-xs font-extrabold tabular-nums text-slate-900">
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
                  className="w-full min-h-[42px] py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>{t('Open Admin Dashboard', 'অ্যাডমিন ড্যাশবোর্ডে যান')}</span>
                </button>
              )}

              {!firebaseUser.emailVerified && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
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
                      className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] transition-colors"
                    >
                      {t('Send Verification Link', 'ভেরিফিকেশন লিংক পাঠান')}
                    </button>
                    <button
                      type="button"
                      onClick={handleRefreshVerification}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-amber-900 font-bold text-[11px] hover:bg-amber-100/50 transition-colors"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>{t('Refresh Status', 'চেক করুন')}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Saved Delivery Info Form */}
              <form
                onSubmit={handleSaveProfile}
                className="space-y-3 pt-3 border-t border-slate-100"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <MapPin className="w-3.5 h-3.5 text-rose-600" />
                  <span>{t('Saved Delivery Information', 'সেভ করা ডেলিভারি ঠিকানা')}</span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    {t('Full Name', 'পুরো নাম')}
                  </label>
                  <input
                    type="text"
                    required
                    value={profName}
                    onChange={(e) => setProfName(e.target.value)}
                    className="w-full min-h-[40px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:border-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      {t('Mobile Number', 'মোবাইল নম্বর')}
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        value={profPhone}
                        onChange={(e) => setProfPhone(e.target.value.replace(/[^0-9]/g, ''))}
                        maxLength={11}
                        placeholder="017XXXXXXXX"
                        className="w-full min-h-[40px] pl-8 pr-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:outline-hidden focus:border-slate-900"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      {t('District', 'জেলা')}
                    </label>
                    <select
                      value={profDistrict}
                      onChange={(e) => setProfDistrict(e.target.value)}
                      className="w-full min-h-[40px] px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:border-slate-900"
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
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    {t('Area / Thana', 'এলাকা / থানা')}
                  </label>
                  <input
                    type="text"
                    value={profArea}
                    onChange={(e) => setProfArea(e.target.value)}
                    placeholder={t('e.g. Dhanmondi, Mirpur', 'যেমন: ধানমন্ডি, মিরপুর')}
                    className="w-full min-h-[40px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    {t('Full Address', 'বিস্তারিত ঠিকানা')}
                  </label>
                  <textarea
                    rows={2}
                    value={profAddress}
                    onChange={(e) => setProfAddress(e.target.value)}
                    placeholder={t('House, Road, Block...', 'বাড়ি নং, রোড নং...')}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:border-slate-900"
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="w-full min-h-[42px] py-2.5 bg-slate-900 hover:bg-rose-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
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
                className="w-full min-h-[42px] py-2.5 border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-slate-600 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t('Sign Out', 'লগআউট')}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
