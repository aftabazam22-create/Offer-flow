import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  ShieldCheck,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  LogOut,
  ArrowRight,
} from 'lucide-react';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth, googleProvider } from '../../firebase.js';
import { checkIsFirebaseAdmin } from '../../services/api.js';
import { useStore } from '../../context/StoreContext.js';

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

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { setAdminUser, firebaseUser, t, showToast } = useStore();
  const [authMode, setAuthMode] = useState<'google' | 'email'>('google');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setEmail('');
      setPassword('');
      setError(null);
      setShowPassword(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setEmail('');
    setPassword('');
    setError(null);
    setShowPassword(false);
    onClose();
  };

  if (!isOpen) return null;

  const finalizeAdminUser = async (user: NonNullable<typeof auth.currentUser>) => {
    const authorized = await checkIsFirebaseAdmin(
      user.uid,
      user.email,
      user.emailVerified
    );

    if (!authorized) {
      setError(
        `Access denied for ${user.email || user.uid}. This account (UID: ${user.uid}) is not registered as an Admin.`
      );
      return;
    }

    setAdminUser({
      uid: user.uid,
      email: user.email || '',
      role: 'Super Admin',
      name: user.displayName || user.email?.split('@')[0] || 'Admin',
      photoURL: user.photoURL || undefined,
    });

    showToast(t('Welcome back, Admin!', 'স্বাগতম অ্যাডমিন!'));
    setEmail('');
    setPassword('');
    onSuccess();
    onClose();
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      await finalizeAdminUser(cred.user);
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user') {
        setError('Sign-in popup was closed. Please try again.');
      } else {
        setError(err?.message || 'Google sign-in failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setLoading(true);
    setError(null);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      await finalizeAdminUser(cred.user);
    } catch (err: any) {
      if (err?.code === 'auth/invalid-credential' || err?.code === 'auth/wrong-password') {
        setError('Invalid email or password. Try signing in with Google if your admin account uses Google.');
      } else if (err?.code === 'auth/user-not-found') {
        setError('No Firebase account found with this email.');
      } else {
        setError(err?.message || 'Authentication failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchAccount = async () => {
    await signOut(auth);
    setError(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200/80"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Obsidian Header */}
        <div className="p-6 bg-[#0B0F19] text-white flex items-center justify-between relative overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0 opacity-25"
            style={{
              backgroundImage:
                'radial-gradient(circle at 15% 20%, rgba(225, 29, 72, 0.45), transparent 60%)',
            }}
          />
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600/20 border border-rose-500/30 text-rose-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Offer Flow Admin</h3>
              <p className="text-xs text-slate-400">Protected Store Management Access</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="relative z-10 w-8 h-8 rounded-full text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Clean Segmented Switch */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setAuthMode('google');
                setError(null);
              }}
              className={`min-h-[38px] py-1.5 rounded-lg transition-all whitespace-nowrap ${
                authMode === 'google'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Google Sign-In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('email');
                setError(null);
              }}
              className={`min-h-[38px] py-1.5 rounded-lg transition-all whitespace-nowrap ${
                authMode === 'email'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Email & Password
            </button>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs space-y-2.5">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
              {firebaseUser && (
                <button
                  type="button"
                  onClick={handleSwitchAccount}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-red-200 text-red-700 font-bold text-[11px] hover:bg-red-100/50 transition-colors"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Sign Out & Switch Account</span>
                </button>
              )}
            </div>
          )}

          {authMode === 'google' ? (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Sign in with your authorized Admin Google account to manage products, customer orders, pricing, and delivery rules.
              </p>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full min-h-[44px] py-2.5 px-4 bg-white hover:bg-slate-50 active:scale-[0.99] text-slate-900 border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-3 transition-all disabled:opacity-50 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-rose-500"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
                    <span>Verifying Admin Access...</span>
                  </>
                ) : (
                  <>
                    <GoogleLogoSvg className="w-4 h-4 shrink-0" />
                    <span>Continue with Google Admin</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <form onSubmit={handleEmailSignIn} className="space-y-4" autoComplete="off">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Admin Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    name="admin-email-entry"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter admin email"
                    autoComplete="off"
                    className="w-full min-h-[44px] pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-slate-900 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="admin-pass-entry"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    autoComplete="new-password"
                    className="w-full min-h-[44px] pl-10 pr-11 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-slate-900 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full min-h-[44px] py-3 px-4 bg-slate-900 hover:bg-rose-600 active:scale-[0.99] text-white rounded-xl text-xs font-bold shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{loading ? 'Signing In...' : 'Sign In to Dashboard'}</span>
                {!loading && <ArrowRight className="w-3.5 h-3.5" />}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
