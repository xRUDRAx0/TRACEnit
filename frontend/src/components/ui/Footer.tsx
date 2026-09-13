import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import TraceLogo from '../TraceLogo';
import { useAuth } from '../../hooks/useAuth';

export default function Footer() {
  const { user, isDemoUser } = useAuth();
  const isAuthenticated = !!user || isDemoUser;

  return (
    <footer className="w-full border-t border-border/80 bg-surface pt-14 pb-10 px-6 text-xs text-text-muted mt-auto">
      <div className="max-w-[1360px] mx-auto grid grid-cols-1 md:grid-cols-5 gap-10 mb-14">
        {/* Brand & Description Column */}
        <div className="md:col-span-2 flex flex-col items-start pr-4">
          <Link to="/" className="flex items-center gap-2 mb-4 group">
            <TraceLogo className="text-2xl text-text-primary transition-opacity group-hover:opacity-90" />
          </Link>
          <p className="text-text-secondary text-xs leading-relaxed max-w-[360px] mb-5">
            TRACE is an Enterprise Automation Intelligence platform that observes desktop workflows, identifies repetitive friction, and builds deterministic browser automations.
          </p>
          
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm bg-surface-secondary border border-border/70 text-[11px] text-text-secondary">
            <ShieldCheck className="w-3.5 h-3.5 text-success" />
            <span>Workspace Architecture • Supabase Backed Persistence</span>
          </div>
        </div>

        {/* Product Navigation */}
        <div className="flex flex-col gap-2.5">
          <h5 className="editorial-label mb-1">Product</h5>
          <Link to={isAuthenticated ? "/dashboard" : "/login"} className="text-text-secondary hover:text-text-primary transition-colors">
            Dashboard
          </Link>
          <Link to={isAuthenticated ? "/workflows" : "/login"} className="text-text-secondary hover:text-text-primary transition-colors">
            Workflows
          </Link>
          <Link to={isAuthenticated ? "/automations" : "/login"} className="text-text-secondary hover:text-text-primary transition-colors">
            Automations
          </Link>
          <Link to={isAuthenticated ? "/executions" : "/login"} className="text-text-secondary hover:text-text-primary transition-colors">
            Executions Monitor
          </Link>
          <Link to={isAuthenticated ? "/insights" : "/login"} className="text-text-secondary hover:text-text-primary transition-colors">
            Insights & Analytics
          </Link>
        </div>

        {/* Platform & Technology */}
        <div className="flex flex-col gap-2.5">
          <h5 className="editorial-label mb-1">Platform</h5>
          <a href="#platform-overview" className="text-text-secondary hover:text-text-primary transition-colors">
            Architecture Overview
          </a>
          <Link to={isAuthenticated ? "/activity" : "/login"} className="text-text-secondary hover:text-text-primary transition-colors">
            Telemetry Observer
          </Link>
          <Link to={isAuthenticated ? "/analysis" : "/login"} className="text-text-secondary hover:text-text-primary transition-colors">
            AI Blueprint Analysis
          </Link>
          <Link to={isAuthenticated ? "/agent-view" : "/login"} className="text-text-secondary hover:text-text-primary transition-colors">
            Playwright Execution Engine
          </Link>
          <Link to={isAuthenticated ? "/builder" : "/login"} className="text-text-secondary hover:text-text-primary transition-colors">
            Automation Builder
          </Link>
        </div>

        {/* Account & Legal */}
        <div className="flex flex-col gap-2.5">
          <h5 className="editorial-label mb-1">Account</h5>
          {isAuthenticated ? (
            <>
              <Link to="/settings" className="text-text-secondary hover:text-text-primary transition-colors">
                Workspace Settings
              </Link>
              <Link to="/dashboard" className="text-text-secondary hover:text-text-primary transition-colors">
                Active Workspace
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="text-text-secondary hover:text-text-primary transition-colors">
                Sign In
              </Link>
              <Link to="/signup" className="text-text-secondary hover:text-text-primary transition-colors">
                Create Account
              </Link>
              <Link to="/forgot-password" className="text-text-secondary hover:text-text-primary transition-colors">
                Reset Password
              </Link>
            </>
          )}
          <div className="pt-3 border-t border-border/60 flex flex-col gap-1">
            <span className="text-[11px] font-mono text-text-muted">Enterprise WorkTwin Systems</span>
          </div>
        </div>
      </div>

      {/* Bottom Sub-bar */}
      <div className="max-w-[1360px] mx-auto pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-[11px] text-text-secondary font-mono">
            TRACE Platform v2.4 • Operational
          </span>
        </div>

        <p className="text-[11px] text-text-muted font-sans">
          © {new Date().getFullYear()} TRACE / WorkTwin Systems. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

