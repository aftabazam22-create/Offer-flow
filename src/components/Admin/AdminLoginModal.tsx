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
} from 'lucide-react';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth, googleProvider } from '../../firebase.js';
import { checkIsFirebaseAdmin } from '../../services/api.js';
import { useStore } from '../../context/StoreContext.js';

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

  // Always start clean with empty fields every time modal opens or closes
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-600/20 border border-rose-500/30 text-rose-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Offer Flow Admin</h3>
              <p className="text-xs text-slate-400">Firebase Secured Admin Portal</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Auth Method Tabs */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-2xl text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setAuthMode('google');
                setError(null);
              }}
              className={`py-2 rounded-xl transition-all ${
                authMode === 'google'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
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
              className={`py-2 rounded-xl transition-all ${
                authMode === 'email'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Email & Password
            </button>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
              {firebaseUser && (
                <button
                  type="button"
                  onClick={handleSwitchAccount}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-red-200 text-red-700 font-bold text-[11px] hover:bg-red-100/50"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Sign Out & Switch Account</span>
                </button>
              )}
            </div>
          )}

          {authMode === 'google' ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs text-slate-600 leading-relaxed">
                Sign in with your authorized Firebase Admin Google account to manage products, categories, banners, and live customer orders.
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold shadow-lg flex items-center justify-center gap-3 transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Admin Access...</span>
                  </>
                ) : (
                  <>
                    <span className="w-5 h-5 rounded-full bg-white text-slate-900 font-black text-[11px] flex items-center justify-center">
                      G
                    </span>
                    <span>Sign in with Google Admin Account</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <form onSubmit={handleEmailSignIn} className="space-y-4" autoComplete="off">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Admin Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    name="admin-email-entry"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter admin email"
                    autoComplete="off"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="admin-pass-entry"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    autoComplete="new-password"
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
                className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/25 transition-all disabled:opacity-50"
              >
                {loading ? 'Signing In...' : 'Sign In to Dashboard'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
