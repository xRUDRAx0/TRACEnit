import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  LogOut, Menu, X, Activity, Cpu, Layers, 
  PlayCircle, BarChart3, Settings as SettingsIcon, Radio, Sparkles, ArrowRight, Bot, Wrench
} from 'lucide-react';
import TraceLogo from './TraceLogo';
import Footer from './ui/Footer';
import { useAuth } from '../hooks/useAuth';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut, isDemoUser } = useAuth();

  const [showProfile, setShowProfile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const isAuthenticated = !!user || isDemoUser;
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const userName = user?.user_metadata?.full_name || (user?.email ? user.email.split('@')[0] : (isDemoUser ? 'Demo Operator' : 'Operator'));
  const userEmail = user?.email || (isDemoUser ? 'demo@trace.ai' : 'operator@trace.ai');
  const userInitial = userName.charAt(0).toUpperCase();

  // Authenticated Workspace Navigation Items
  const workspaceNavItems = [
    { to: '/dashboard', match: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { to: '/activity', match: '/activity', label: 'Activity', icon: Activity },
    { to: '/workflows', match: '/workflows', label: 'Workflows', icon: Cpu },
    { to: '/automations', match: '/automations', label: 'Automations', icon: Layers },
    { to: '/executions', match: '/executions', label: 'Executions', icon: PlayCircle },
    { to: '/recorder', match: '/recorder', label: 'Recorder', icon: Radio },
    { to: '/analysis', match: '/analysis', label: 'Analysis', icon: Sparkles },
    { to: '/agent-view', match: '/agent-view', label: 'Agent View', icon: Bot },
    { to: '/builder', match: '/builder', label: 'Builder', icon: Wrench },
    { to: '/insights', match: '/insights', label: 'Insights', icon: BarChart3 },
    { to: '/settings', match: '/settings', label: 'Settings', icon: SettingsIcon },
  ];

  const handleSignOut = async () => {
    setShowProfile(false);
    await signOut();
    navigate('/login');
  };

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden relative bg-background text-text-primary">
      {/* Top Navigation Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
        isScrolled 
          ? 'nav-blur-bar border-b border-border py-2.5 shadow-2xs' 
          : 'bg-[#FBF9F5]/85 backdrop-blur-xl py-3 border-b border-border/80'
      }`}>
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-[1600px] flex items-center justify-between gap-3 sm:gap-4">
          
          {/* Brand Logo & Context */}
          <div className="flex items-center gap-2.5 shrink-0">
            <Link to="/" className="flex items-center gap-2 group">
              <TraceLogo className="text-xl sm:text-2xl text-text-primary transition-opacity group-hover:opacity-90" />
            </Link>

            {!isHomePage && (
              <span className="hidden xl:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-surface-secondary border border-border text-[9.5px] font-bold uppercase tracking-wider text-text-secondary">
                Workspace
              </span>
            )}
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 min-w-0 justify-center">
            {isHomePage ? (
              // Public Landing Header Navigation
              <div className="flex items-center gap-8 text-[13px] font-medium tracking-[0.02em] text-text-secondary">
                <a href="#platform-overview" className="text-text-primary font-semibold py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-accent after:rounded-full">Platform</a>
                <a href="#how-it-works" className="hover:text-text-primary transition-colors py-1 relative hover:after:content-[''] hover:after:absolute hover:after:bottom-0 hover:after:left-0 hover:after:right-0 hover:after:h-[2px] hover:after:bg-accent hover:after:rounded-full">Architecture</a>
                <a href="#b2b-value" className="hover:text-text-primary transition-colors py-1 relative hover:after:content-[''] hover:after:absolute hover:after:bottom-0 hover:after:left-0 hover:after:right-0 hover:after:h-[2px] hover:after:bg-accent hover:after:rounded-full">Capabilities</a>
                <a href="#use-cases" className="hover:text-text-primary transition-colors py-1 relative hover:after:content-[''] hover:after:absolute hover:after:bottom-0 hover:after:left-0 hover:after:right-0 hover:after:h-[2px] hover:after:bg-accent hover:after:rounded-full">Use Cases</a>
              </div>
            ) : (
              // Authenticated Workspace Header Navigation
              workspaceNavItems.map((item) => {
                const isCurrentActive = location.pathname === item.match || location.pathname.startsWith(`${item.match}/`);
                return (
                  <NavLink
                    key={item.label}
                    to={item.to}
                    className={`px-1.5 2xl:px-2.5 py-1 rounded-md text-[11px] xl:text-[12px] font-medium transition-all flex items-center gap-1.25 whitespace-nowrap ${
                      isCurrentActive
                        ? 'bg-text-primary text-white font-semibold shadow-2xs'
                        : 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary/70'
                    }`}
                  >
                    <item.icon className="w-3.5 h-3.5 opacity-75 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })
            )}
          </nav>

          {/* Controls & Account Profile */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Profile Dropdown or Auth Button */}
            {isAuthenticated ? (
              <div className="relative">
                <button 
                  className="w-8 h-8 rounded-full bg-text-primary text-white flex items-center justify-center text-xs font-bold border border-text-primary hover:opacity-90 transition-all cursor-pointer shadow-xs"
                  onClick={() => setShowProfile(!showProfile)}
                  title="User Account & Workspace Options"
                >
                  {userInitial}
                </button>
                
                {showProfile && (
                  <div className="absolute top-full right-0 mt-2 w-56 solid-card rounded-xl py-1.5 z-50 animate-fade-in-subtle border border-border bg-surface shadow-lg">
                    <div className="px-4 py-3 border-b border-border bg-surface-secondary/50 rounded-t-xl">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="text-xs font-bold text-text-primary truncate">{userName}</p>
                        {isDemoUser && (
                          <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded bg-warning/20 text-warning border border-warning/30">
                            Demo
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-medium text-text-secondary truncate">{userEmail}</p>
                    </div>

                    <Link 
                      to="/dashboard"
                      onClick={() => setShowProfile(false)}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-secondary flex items-center gap-2.5 transition-colors"
                    >
                      <BarChart3 className="w-3.5 h-3.5 text-accent" /> Workspace Dashboard
                    </Link>
                    
                    <Link 
                      to="/settings" 
                      onClick={() => setShowProfile(false)} 
                      className="w-full text-left px-4 py-2 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-secondary flex items-center gap-2.5 transition-colors"
                    >
                      <SettingsIcon className="w-3.5 h-3.5 text-accent" /> Account & Settings
                    </Link>
                    
                    <div className="h-px bg-border my-1" />
                    
                    <button 
                      onClick={handleSignOut} 
                      className="w-full text-left px-4 py-2 text-xs font-medium text-error hover:bg-error/10 flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-md border border-border bg-surface hover:bg-surface-secondary text-text-primary text-xs font-medium transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="hidden sm:flex btn-primary text-xs py-1.5 px-4 flex items-center gap-1.5"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            )}

            {/* Mobile Navigation Drawer Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface-secondary border border-border"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-16 bg-background/98 backdrop-blur-xl z-40 lg:hidden p-6 flex flex-col gap-3 animate-fade-in-subtle border-t border-border">
          <nav className="flex flex-col gap-2">
            {isHomePage ? (
              <>
                <a
                  href="#platform-overview"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-md text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-secondary"
                >
                  Platform
                </a>
                <a
                  href="#how-it-works"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-md text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-secondary"
                >
                  Architecture
                </a>
                <a
                  href="#b2b-value"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-md text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-secondary"
                >
                  Capabilities
                </a>
                <a
                  href="#use-cases"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-md text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-secondary"
                >
                  Use Cases
                </a>
                <div className="h-px bg-border my-2" />
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-md text-sm font-medium text-text-primary hover:bg-surface-secondary flex items-center justify-between"
                >
                  <span>Sign In</span>
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-md text-sm font-semibold btn-primary flex items-center justify-between"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            ) : (
              workspaceNavItems.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-2.5 rounded-md text-sm font-medium flex items-center gap-3 transition-colors ${
                      isActive
                        ? 'bg-text-primary text-white font-semibold'
                        : 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary'
                    }`
                  }
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </NavLink>
              ))
            )}
          </nav>
        </div>
      )}
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden relative z-10 flex flex-col items-center pt-16 pb-12">
        <div 
          key={location.pathname} 
          className={`w-full animate-fade-in-subtle ${isHomePage ? 'flex-1' : 'px-4 sm:px-8 max-w-[1400px]'}`}
        >
          <Outlet />
        </div>
      </main>

      {/* Shared Enterprise Footer */}
      <Footer />
    </div>
  );
}
