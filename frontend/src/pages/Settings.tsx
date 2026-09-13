import React, { useState } from 'react';
import { Shield, Eye, Lock, Bot, Bell, User, Key, CheckCircle2, Settings as SettingsIcon } from 'lucide-react';
import { useObservation } from '../hooks/useObservation';
import { useAuth } from '../hooks/useAuth';
import PageHeader from '../components/ui/PageHeader';

export default function Settings() {
  const { isActive, toggleObservation, isLoading } = useObservation();
  const { user, isDemoUser, resetPassword } = useAuth();
  
  const [activeTab, setActiveTab] = useState('Account');
  const [resetSent, setResetSent] = useState(false);

  const tabs = ['Account', 'Observation', 'Privacy', 'Automation Safety', 'AI & Logic', 'Notifications'];

  const userName = user?.user_metadata?.full_name || (user?.email ? user.email.split('@')[0] : (isDemoUser ? 'Demo Operator' : 'Operator'));
  const userEmail = user?.email || (isDemoUser ? 'demo@trace.ai' : 'operator@trace.ai');

  const handlePasswordReset = async () => {
    if (userEmail) {
      await resetPassword(userEmail);
      setResetSent(true);
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-[1400px] mx-auto">
      <PageHeader
        title="Workspace Settings"
        description="Account and workspace configuration."
        icon={SettingsIcon}
        badgeText="TRACE Configuration"
        badgeType="accent"
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Navigation Sidebar Tabs */}
        <div className="md:col-span-1 space-y-1.5">
          {tabs.map((tab, i) => (
            <button 
              key={i} 
              onClick={() => setActiveTab(tab)}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === tab 
                  ? 'bg-text-primary text-white shadow-xs' 
                  : 'text-text-secondary hover:bg-surface-secondary hover:text-text-primary'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Settings Tab Content */}
        <div className="md:col-span-3 space-y-6">

          {/* Account Settings */}
          {activeTab === 'Account' && (
            <section className="solid-card p-6 sm:p-8 rounded-xl border border-border bg-surface">
              <div className="flex items-center gap-3 mb-6">
                <User className="w-5 h-5 text-accent" />
                <h2 className="text-xl font-bold text-text-primary">Account & Profile</h2>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-secondary border border-border">
                  <div className="w-12 h-12 rounded-full bg-accent/15 text-accent font-bold text-lg flex items-center justify-center border border-accent/30 shrink-0">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-text-primary">{userName}</h3>
                      {isDemoUser && (
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-warning/20 text-warning border border-warning/30">
                          Demo Account
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-text-secondary font-medium">{userEmail}</p>
                    <p className="text-[10px] font-semibold text-text-muted mt-1">Enterprise Subscription • Supabase Auth Verified</p>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-border">
                  <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">Security & Credentials</h3>

                  <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-surface-secondary">
                    <div className="flex items-center gap-3">
                      <Key className="w-4 h-4 text-text-secondary" />
                      <div>
                        <p className="text-xs font-bold text-text-primary">Password Reset</p>
                        <p className="text-[11px] text-text-secondary">Send password reset instructions link to your email</p>
                      </div>
                    </div>
                    <button
                      onClick={handlePasswordReset}
                      className="btn-secondary text-xs py-2 px-4 flex items-center gap-2"
                    >
                      {resetSent ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                          <span>Link Sent</span>
                        </>
                      ) : (
                        <span>Send Reset Link</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Observation Settings */}
          {activeTab === 'Observation' && (
            <section className="solid-card p-6 sm:p-8 rounded-xl border border-border bg-surface">
              <div className="flex items-center gap-3 mb-6">
                <Eye className="w-5 h-5 text-text-primary" />
                <h2 className="text-xl font-bold text-text-primary">Observation Settings</h2>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-surface-secondary">
                  <div>
                    <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-1">Global Desktop Telemetry</h3>
                    <p className="text-xs text-text-secondary max-w-sm">When active, TRACE captures desktop interaction metadata to discover workflow friction.</p>
                  </div>
                  <button 
                    onClick={toggleObservation} 
                    disabled={isLoading}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${isActive ? 'bg-success' : 'bg-text-muted'}`}
                  >
                    <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${isActive ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* Privacy Settings */}
          {activeTab === 'Privacy' && (
            <section className="solid-card p-6 sm:p-8 rounded-xl border border-border bg-surface">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-5 h-5 text-text-primary" />
                <h2 className="text-xl font-bold text-text-primary">Privacy & Data Governance</h2>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                TRACE respects employee privacy. Telemetry captures non-sensitive UI interaction metrics (clicks, active window titles, keystroke types). Sensitive inputs like password fields are sanitized locally before reaching Supabase.
              </p>
            </section>
          )}

          {/* Automation Safety */}
          {activeTab === 'Automation Safety' && (
            <section className="solid-card p-6 sm:p-8 rounded-xl border border-border bg-surface">
              <div className="flex items-center gap-3 mb-4">
                <Lock className="w-5 h-5 text-text-primary" />
                <h2 className="text-xl font-bold text-text-primary">Automation Safety & Approval Gates</h2>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                All generated automation plans with high-risk actions (e.g. sending emails or submitting financial reports) require mandatory Human-in-the-Loop approval before execution.
              </p>
            </section>
          )}

          {/* AI & Logic */}
          {activeTab === 'AI & Logic' && (
            <section className="solid-card p-6 sm:p-8 rounded-xl border border-border bg-surface">
              <div className="flex items-center gap-3 mb-4">
                <Bot className="w-5 h-5 text-text-primary" />
                <h2 className="text-xl font-bold text-text-primary">AI & Intent Intelligence</h2>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                Powered by Google Gemini AI for natural language intent resolution and deterministic heuristic fallback when offline.
              </p>
            </section>
          )}

          {/* Notifications */}
          {activeTab === 'Notifications' && (
            <section className="solid-card p-6 sm:p-8 rounded-xl border border-border bg-surface">
              <div className="flex items-center gap-3 mb-4">
                <Bell className="w-5 h-5 text-text-primary" />
                <h2 className="text-xl font-bold text-text-primary">Notification Preferences</h2>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                Receive real-time Socket.IO browser notifications when new pattern opportunities or execution approval requests arise.
              </p>
            </section>
          )}

        </div>
      </div>
    </div>
  );
}
