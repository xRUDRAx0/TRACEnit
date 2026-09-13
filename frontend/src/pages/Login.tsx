import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ArrowRight, AlertCircle, ShieldCheck, CheckCircle2, Cpu } from 'lucide-react';
import TraceLogo from '../components/TraceLogo';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signInAsDemoUser, user } = useAuth();

  const from = location.state?.from?.pathname || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // If already logged in, redirect to target
  React.useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }
    setErrorMsg('');
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) {
        setErrorMsg(error.message || 'Failed to sign in. Please check your credentials.');
      } else {
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = () => {
    signInAsDemoUser();
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-10 items-center z-10">
        
        {/* Left Side: Product Value Highlights */}
        <div className="hidden md:flex flex-col pr-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-6 group">
            <TraceLogo className="text-3xl text-text-primary transition-opacity group-hover:opacity-90" />
          </Link>
          
          <h2 className="font-display text-3xl font-normal text-text-primary tracking-tight leading-snug mb-4">
            Welcome back to your <span className="italic text-accent">Automation Workspace.</span>
          </h2>

          <p className="text-sm text-text-secondary leading-relaxed mb-8 font-normal">
            TRACE observes desktop telemetry, captures friction points, and turns manual browser workflows into self-healing automations.
          </p>

          <div className="space-y-4 border-t border-border/80 pt-6">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded bg-success/15 text-success flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-text-primary">Human-in-the-Loop Safety</h4>
                <p className="text-[11px] text-text-secondary">Every generated blueprint requires explicit approval before execution.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded bg-accent/15 text-accent flex items-center justify-center shrink-0 mt-0.5">
                <Cpu className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-text-primary">Headless Playwright Engine</h4>
                <p className="text-[11px] text-text-secondary">Deterministic web automation with step-by-step screenshot evidence.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form Card */}
        <div className="w-full max-w-md mx-auto">
          {/* Header Branding for Mobile */}
          <div className="text-center md:hidden mb-6">
            <Link to="/" className="inline-flex items-center justify-center p-2 rounded-md bg-surface border border-border mb-3">
              <TraceLogo className="text-3xl text-text-primary" />
            </Link>
            <h1 className="font-display text-2xl font-normal text-text-primary">Sign in to TRACE</h1>
          </div>

          <div className="solid-card p-6 sm:p-8 border border-border relative rounded-lg bg-surface">
            <div className="mb-6">
              <h2 className="font-display text-xl font-semibold text-text-primary">Sign In</h2>
              <p className="text-xs text-text-secondary mt-1">Enter your work credentials to access your workspace</p>
            </div>

            {errorMsg && (
              <div className="mb-6 p-3 rounded-md bg-error/10 border border-error/20 flex items-start gap-3 text-xs font-medium text-error animate-fade-in-subtle">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-text-primary uppercase tracking-wider mb-2">
                  Work Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-surface-secondary border border-border/80 rounded-md text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[11px] font-semibold text-text-primary uppercase tracking-wider">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-medium text-accent hover:underline transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-surface-secondary border border-border/80 rounded-md text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary mt-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/80" />
              </div>
              <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
                <span className="bg-surface px-3 text-text-muted font-medium">Or explore instantly</span>
              </div>
            </div>

            {/* Demo Access Button */}
            <button
              type="button"
              onClick={handleDemoSignIn}
              className="w-full btn-secondary text-xs"
            >
              <ShieldCheck className="w-4 h-4 text-warning mr-1.5" />
              <span>Continue with Demo Workspace</span>
            </button>
          </div>

          {/* Footer Link */}
          <p className="text-center text-xs text-text-secondary mt-6">
            Don't have an enterprise account?{' '}
            <Link to="/signup" className="font-semibold text-accent hover:underline">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
