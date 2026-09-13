import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, User as UserIcon, ArrowRight, AlertCircle, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import TraceLogo from '../components/TraceLogo';
import { useAuth } from '../hooks/useAuth';

export default function Signup() {
  const navigate = useNavigate();
  const { signUp, user } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  React.useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'bg-border' };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 25, label: 'Weak', color: 'bg-error' };
    if (score === 2 || score === 3) return { score: 65, label: 'Medium', color: 'bg-warning' };
    return { score: 100, label: 'Strong', color: 'bg-success' };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    if (!acceptedTerms) {
      setErrorMsg('Please accept the TRACE Platform Terms of Service.');
      return;
    }

    setErrorMsg('');
    setLoading(true);

    try {
      const { error } = await signUp(email, password, name);
      if (error) {
        setErrorMsg(error.message || 'Failed to create account.');
      } else {
        setSuccessMsg('Account created successfully! Check your email to verify your account or proceed to sign in.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-10 items-center z-10">
        
        {/* Left Column: Product Value Narrative */}
        <div className="hidden md:flex flex-col pr-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-6 group">
            <TraceLogo className="text-3xl text-text-primary transition-opacity group-hover:opacity-90" />
          </Link>
          
          <h2 className="font-display text-3xl font-normal text-text-primary tracking-tight leading-snug mb-4">
            Build your team's <span className="italic text-accent">Automation Intelligence.</span>
          </h2>

          <p className="text-sm text-text-secondary leading-relaxed mb-8 font-normal">
            Create a TRACE account to start observing desktop telemetry, capturing repetitive task loops, and generating browser automations.
          </p>

          <div className="space-y-4 border-t border-border/80 pt-6">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded bg-accent/15 text-accent flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-text-primary">Instant Friction Discovery</h4>
                <p className="text-[11px] text-text-secondary">Detect repetitive patterns and calculate ROI opportunities automatically.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded bg-success/15 text-success flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-text-primary">Supabase Database Backed</h4>
                <p className="text-[11px] text-text-secondary">Secure workspace persistence and row-level data boundaries.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Signup Form */}
        <div className="w-full max-w-md mx-auto">
          <div className="text-center md:hidden mb-6">
            <Link to="/" className="inline-flex items-center justify-center p-2 rounded-md bg-surface border border-border mb-3">
              <TraceLogo className="text-3xl text-text-primary" />
            </Link>
            <h1 className="font-display text-2xl font-normal text-text-primary">Create TRACE Account</h1>
          </div>

          <div className="solid-card p-6 sm:p-8 border border-border relative rounded-lg bg-surface">
            <div className="mb-6">
              <h2 className="font-display text-xl font-semibold text-text-primary">Create Account</h2>
              <p className="text-xs text-text-secondary mt-1">Get started with enterprise automation intelligence</p>
            </div>

            {errorMsg && (
              <div className="mb-6 p-3 rounded-md bg-error/10 border border-error/20 flex items-start gap-3 text-xs font-medium text-error animate-fade-in-subtle">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg ? (
              <div className="p-6 text-center animate-fade-in-subtle">
                <div className="w-10 h-10 rounded-full bg-success/15 text-success flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h3 className="font-display text-lg font-semibold text-text-primary mb-2">Registration Complete</h3>
                <p className="text-xs text-text-secondary mb-6">{successMsg}</p>
                <Link
                  to="/login"
                  className="btn-primary w-full text-center"
                >
                  Proceed to Sign In
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold text-text-primary uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Alex Mercer"
                      className="w-full pl-10 pr-4 py-2 bg-surface-secondary border border-border/80 rounded-md text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-text-primary uppercase tracking-wider mb-1.5">
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
                      className="w-full pl-10 pr-4 py-2 bg-surface-secondary border border-border/80 rounded-md text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-text-primary uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full pl-10 pr-10 py-2 bg-surface-secondary border border-border/80 rounded-md text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {password && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-[10px] font-semibold text-text-secondary mb-1">
                        <span>Strength</span>
                        <span>{strength.label}</span>
                      </div>
                      <div className="w-full h-1 bg-surface-secondary rounded-full overflow-hidden">
                        <div
                          className={`h-full ${strength.color} transition-all duration-300`}
                          style={{ width: `${strength.score}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-text-primary uppercase tracking-wider mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full pl-10 pr-4 py-2 bg-surface-secondary border border-border/80 rounded-md text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="rounded border-border text-accent focus:ring-accent"
                  />
                  <label htmlFor="terms" className="text-xs text-text-secondary cursor-pointer">
                    I accept the TRACE <span className="text-text-primary font-medium">Terms of Service</span> &{' '}
                    <span className="text-text-primary font-medium">Privacy Policy</span>.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary mt-4"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Create Enterprise Account</span>
                      <ArrowRight className="w-4 h-4 ml-1.5" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          <p className="text-center text-xs text-text-secondary mt-6">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-accent hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
