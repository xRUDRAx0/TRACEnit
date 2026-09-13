import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, Cpu, PlayCircle, BarChart3, 
  CheckCircle2, RefreshCw, Eye, Search, Clock, ShieldCheck, FileCheck, Lock, Radio
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import TraceLogo from '../components/TraceLogo';

export default function Home() {
  const navigate = useNavigate();
  const { user, isDemoUser } = useAuth();
  const isAuthenticated = !!user || isDemoUser;

  const videoUrl = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260908_125738_eb584080-9f98-489e-adb2-014760aa34da.mp4";
  const posterUrl = "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260908_122011_59c97465-4d23-4fdc-ac40-f6832f573e28.png&w=1920&q=85";

  const userName = user?.user_metadata?.full_name || (user?.email ? user.email.split('@')[0] : (isDemoUser ? 'Operator' : 'Operator'));

  const handleStartObserving = () => {
    navigate('/recorder');
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  const handleExplorePlatform = () => {
    const el = document.getElementById('platform-overview');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      
      {/* 1. HERO SECTION — CINEMATIC VIDEO BACKGROUND WITH FLOATING LOGO & BRAND MARK */}
      <section className="w-full min-h-[85vh] relative flex items-center justify-center overflow-hidden -mt-16 mb-16 border-b border-border bg-background">
        {/* Background Video Layer — VISIBLE CINEMATIC LANDSCAPE */}
        <div className="absolute inset-0 w-full h-full overflow-hidden bg-background">
          <video
            autoPlay
            muted
            loop
            playsInline
            poster={posterUrl}
            aria-hidden="true"
            className="w-full h-full object-cover animate-video-fade"
            style={{ opacity: 0.88 }}
          >
            <source src={videoUrl} type="video/mp4" />
          </video>
          {/* Localized left-side warm ivory gradient for text readability — right side stays open/cinematic */}
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(to right, rgba(251,249,245,0.88) 0%, rgba(251,249,245,0.55) 35%, rgba(251,249,245,0.18) 60%, rgba(251,249,245,0.04) 100%)'
          }} />
          {/* Subtle top fade — header area */}
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(to bottom, rgba(251,249,245,0.22) 0%, transparent 18%, transparent 75%, rgba(251,249,245,0.30) 100%)'
          }} />
        </div>

        {/* Hero Content Container — TWO-COLUMN PRODUCT COMPOSITION */}
        <div className="relative z-10 w-full max-w-[1440px] mx-auto px-6 sm:px-12 py-24 sm:py-32 flex flex-col">
          
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
            
            {/* LEFT COLUMN: GREETING, HIERARCHY, AND ACTIONS */}
            <div className="w-full lg:w-1/2 flex flex-col items-start text-left">
              
              {/* Product Greeting Tag — Prominent Dark Charcoal */}
              <p className="text-lg sm:text-xl font-bold text-text-primary mb-3 font-sans tracking-tight">
                Hello, {userName}.
              </p>

              {/* Product Action Headline — Two-line Layout */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text-primary leading-[1.1] mb-5 tracking-tight font-sans">
                Let's get some<br />
                work done.
              </h1>

              {/* Product Purpose Description */}
              <p className="text-base sm:text-lg text-text-secondary max-w-xl font-normal leading-relaxed mb-8">
                TRACE observes how you work, understands repetitive patterns,<br className="hidden sm:inline" />
                and helps turn them into reliable automation.
              </p>

              {/* Action CTAs */}
              <div className="flex flex-wrap items-center gap-3.5 w-full sm:w-auto">
                <button
                  onClick={handleStartObserving}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-lg bg-text-primary text-white text-sm font-semibold hover:bg-black transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer border border-text-primary"
                >
                  <span>Start Observing</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </button>

                <button
                  onClick={handleGoToDashboard}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-lg bg-surface text-text-primary text-sm font-semibold hover:bg-surface-secondary border border-border-strong transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                >
                  <span>Go to Dashboard</span>
                </button>

                <button
                  onClick={handleExplorePlatform}
                  className="w-full sm:w-auto px-3 py-3.5 text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors flex items-center justify-center gap-1 cursor-pointer bg-transparent border-0"
                >
                  <span>See How It Works</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>

            {/* RIGHT COLUMN: FLOATING LARGE TRACE BRAND MARK — NO CARD, NO ORBIT */}
            <div className="w-full lg:w-1/2 flex justify-center lg:justify-end relative">
              {/* Floating Container — FULLY TRANSPARENT OVER LANDSCAPE, NO WHITE CARD */}
              <div className="relative flex flex-col items-center justify-center py-6 px-4 group" style={{ minHeight: '280px' }}>

                {/* Gold Sparkle Accent 1 — upper right of logo */}
                <div
                  className="absolute pointer-events-none z-20"
                  style={{ top: '8px', right: '16px' }}
                  aria-hidden="true"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 0 L11.8 8.2 L20 10 L11.8 11.8 L10 20 L8.2 11.8 L0 10 L8.2 8.2 Z" fill="#D99B00" fillOpacity="0.82" />
                  </svg>
                </div>

                {/* Gold Sparkle Accent 2 — lower left of logo */}
                <div
                  className="absolute pointer-events-none z-20"
                  style={{ bottom: '64px', left: '12px' }}
                  aria-hidden="true"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 0 L8.3 5.7 L14 7 L8.3 8.3 L7 14 L5.7 8.3 L0 7 L5.7 5.7 Z" fill="#D99B00" fillOpacity="0.65" />
                  </svg>
                </div>

                {/* Large Floating TRACE Logo — directly over cinematic video */}
                <div className="relative z-10 transform transition-transform duration-300 group-hover:scale-[1.02]">
                  <TraceLogo
                    className="h-auto text-text-primary"
                    style={{ width: 'clamp(260px, 30vw, 460px)' } as React.CSSProperties}
                  />
                </div>

                {/* Telemetry & Intelligence Active — Translucent Pill, directly below logo */}
                <div className="relative z-10 mt-5 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-medium text-text-secondary" style={{
                  backgroundColor: 'rgba(251,249,245,0.72)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  borderColor: '#E5E2DA'
                }}>
                  <span className="w-2 h-2 rounded-full bg-success animate-pulse flex-shrink-0" />
                  <span>Telemetry &amp;amp; Intelligence Active</span>
                </div>

              </div>
            </div>

          </div>

          {/* BOTTOM HERO PROCESS INDICATOR: Observe • Understand • Automate */}
          <div className="w-full mt-16 pt-8 border-t border-border flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-3.5 text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary font-mono">
              <span className="text-text-primary font-bold">Observe</span>
              <span className="text-accent text-sm font-bold">•</span>
              <span className="text-text-primary font-bold">Understand</span>
              <span className="text-accent text-sm font-bold">•</span>
              <span className="text-text-primary font-bold">Automate</span>
            </div>

            <div className="flex items-center gap-2 text-[11px] font-mono text-text-muted">
              <span className="w-2 h-2 rounded-full bg-success" />
              <span>TRACE Engine Active</span>
            </div>
          </div>

        </div>
      </section>

      {/* 2. EDITORIAL LIFECYCLE OVERVIEW (5 STAGES) */}
      <section id="platform-overview" className="w-full max-w-[1360px] py-16 px-6 sm:px-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 border-b border-border pb-6 gap-4">
          <div>
            <span className="editorial-label">System Architecture</span>
            <h2 className="font-display text-3xl sm:text-4xl font-normal text-text-primary mt-2">
              The 5-Stage Automation Pipeline
            </h2>
          </div>
          <p className="text-sm text-text-secondary max-w-md">
            From passive work observation to verified headless execution, engineered for enterprise reliability.
          </p>
        </div>

        {/* Editorial Numbered Stage List */}
        <div className="flex flex-col gap-0 divide-y divide-border border-t border-b border-border">
          {[
            { 
              step: '01', 
              title: 'Observe Workflows', 
              subtitle: 'Passive Desktop Telemetry', 
              desc: 'Monitors window titles, application switching, and event streams quietly.',
              icon: Eye,
              badge: 'Stage 01'
            },
            { 
              step: '02', 
              title: 'Understand Patterns', 
              subtitle: 'Pattern & Friction Analysis', 
              desc: 'Analyzes telemetry to calculate friction hours and automation feasibility.',
              icon: Search,
              badge: 'Stage 02'
            },
            { 
              step: '03', 
              title: 'Automate Blueprints', 
              subtitle: 'Deterministic Plan Generation', 
              desc: 'Generates deterministic Playwright blueprints with selector validation.',
              icon: Cpu,
              badge: 'Stage 03'
            },
            { 
              step: '04', 
              title: 'Execute Runners', 
              subtitle: 'Autonomous Browser Execution', 
              desc: 'Executes actions with step screenshot verification and automatic retries.',
              icon: PlayCircle,
              badge: 'Stage 04'
            },
            { 
              step: '05', 
              title: 'Continuous Improvement', 
              subtitle: 'Telemetry ROI & Self-Healing', 
              desc: 'Tracks time saved and continuously heals brittle DOM selectors.',
              icon: RefreshCw,
              badge: 'Stage 05'
            },
          ].map((stage, idx) => (
            <div 
              key={idx} 
              className="py-8 px-2 sm:px-6 flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:bg-surface-secondary/60 transition-colors"
            >
              <div className="flex items-start sm:items-center gap-6 md:w-5/12">
                <span className="font-display text-4xl sm:text-5xl font-light text-text-muted/40 group-hover:text-accent transition-colors">
                  {stage.step}
                </span>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-accent">
                      {stage.badge}
                    </span>
                  </div>
                  <h3 className="font-display text-xl sm:text-2xl font-normal text-text-primary">
                    {stage.title}
                  </h3>
                  <p className="text-xs font-mono text-text-muted mt-0.5">{stage.subtitle}</p>
                </div>
              </div>

              <div className="md:w-6/12">
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                  {stage.desc}
                </p>
              </div>

              <div className="md:w-1/12 flex justify-end">
                <stage.icon className="w-5 h-5 text-text-muted group-hover:text-text-primary transition-colors" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. OPERATIONAL VALUE SECTION */}
      <section id="b2b-value" className="w-full max-w-[1360px] py-16 px-6 sm:px-10 my-8">
        <div className="solid-card p-8 sm:p-14 bg-surface border border-border">
          <div className="max-w-2xl mb-12">
            <span className="editorial-label">Business Impact</span>
            <h2 className="font-display text-3xl sm:text-4xl font-normal text-text-primary mt-2">
              Built for Measurable Operational Gain
            </h2>
            <p className="text-sm text-text-secondary mt-2">
              Eliminate repetitive manual overhead and standardize team execution across web applications.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 divide-y sm:divide-y-0 divide-border">
            {[
              { title: 'Identify Repetitive Friction', desc: 'Pinpoint repetitive tasks and context switching across operations.', icon: Search },
              { title: 'Reduce Manual Effort', desc: 'Shift data entry and web navigation from human operators to runners.', icon: Clock },
              { title: 'Standardize Team Processes', desc: 'Ensure browser actions adhere strictly to verified steps every time.', icon: CheckCircle2 },
              { title: 'Automate Browser Workflows', desc: 'Execute SaaS dashboards, portals, and multi-step web apps reliably.', icon: PlayCircle },
              { title: 'Monitor Execution Health', desc: 'Inspect step screenshots, error logs, and execution status live.', icon: Eye },
              { title: 'Quantify Efficiency Gains', desc: 'Track actual time saved per workflow pattern in your workspace.', icon: BarChart3 },
            ].map((val, idx) => (
              <div key={idx} className="pt-6 sm:pt-0 flex flex-col items-start">
                <div className="w-8 h-8 rounded-md bg-surface-secondary text-text-primary border border-border flex items-center justify-center mb-3">
                  <val.icon className="w-4 h-4 text-accent" />
                </div>
                <h4 className="text-sm font-semibold text-text-primary mb-1.5">{val.title}</h4>
                <p className="text-xs text-text-secondary leading-relaxed">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. WORKFLOW ARCHITECTURE (7 STEPS) */}
      <section id="how-it-works" className="w-full max-w-[1360px] py-16 px-6 sm:px-10">
        <div className="max-w-2xl mb-12">
          <span className="editorial-label">Execution Model</span>
          <h2 className="font-display text-3xl sm:text-4xl font-normal text-text-primary mt-2">
            From Observation to Automated Execution
          </h2>
          <p className="text-sm text-text-secondary mt-2">
            A 7-step practical workflow designed for security, control, and execution fidelity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { step: '01', title: 'Observe Work', desc: 'Run the TRACE observer while conducting daily tasks.' },
            { step: '02', title: 'Capture Workflow Signals', desc: 'Captures window titles, app focus, and event metadata.' },
            { step: '03', title: 'Detect Repetitive Patterns', desc: 'Groups matching event sequences into workflow candidates.' },
            { step: '04', title: 'Generate Automation', desc: 'Converts workflow patterns into Playwright blueprints.' },
            { step: '05', title: 'Review & Approve', desc: 'Enforces human review and security compliance.' },
            { step: '06', title: 'Execute', desc: 'Runs automations on schedule via headless Playwright.' },
            { step: '07', title: 'Learn & Refine', desc: 'Analyzes execution metrics to refine selector stability.' },
          ].map((item, idx) => (
            <div 
              key={idx} 
              className="p-5 rounded-xl bg-surface border border-border flex items-start gap-4 hover:border-border-strong transition-colors solid-card"
            >
              <span className="font-display text-xl font-medium text-accent shrink-0">
                {item.step}
              </span>
              <div>
                <h4 className="text-sm font-semibold text-text-primary mb-1">{item.title}</h4>
                <p className="text-xs text-text-secondary leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. USE CASES SECTION */}
      <section id="use-cases" className="w-full max-w-[1360px] py-16 px-6 sm:px-10">
        <div className="max-w-2xl mb-12">
          <span className="editorial-label">Use Cases</span>
          <h2 className="font-display text-3xl sm:text-4xl font-normal text-text-primary mt-2">
            Enterprise Scenarios
          </h2>
          <p className="text-sm text-text-secondary mt-2">
            Proven application across operational teams managing repetitive web workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-7 rounded-xl bg-surface border border-border flex flex-col justify-between solid-card">
            <div>
              <h4 className="font-display text-lg font-semibold text-text-primary mb-3">Operations & Admin Teams</h4>
              <p className="text-xs text-text-secondary leading-relaxed mb-6">
                Automate multi-portal status checks, weekly report exports, and SaaS vendor dashboard data copying without code.
              </p>
            </div>
            <span className="text-[11px] font-mono font-semibold text-accent uppercase tracking-wider">
              SaaS & Portal Automation →
            </span>
          </div>

          <div className="p-7 rounded-xl bg-surface border border-border flex flex-col justify-between solid-card">
            <div>
              <h4 className="font-display text-lg font-semibold text-text-primary mb-3">Data Entry & Reconciliation</h4>
              <p className="text-xs text-text-secondary leading-relaxed mb-6">
                Transfer structured data between internal web tools and cloud databases with deterministic accuracy.
              </p>
            </div>
            <span className="text-[11px] font-mono font-semibold text-accent uppercase tracking-wider">
              Cross-App Sync →
            </span>
          </div>

          <div className="p-7 rounded-xl bg-surface border border-border flex flex-col justify-between solid-card">
            <div>
              <h4 className="font-display text-lg font-semibold text-text-primary mb-3">Process Standardization</h4>
              <p className="text-xs text-text-secondary leading-relaxed mb-6">
                Capture expert employee knowledge and standardize exact steps into reusable corporate automations.
              </p>
            </div>
            <span className="text-[11px] font-mono font-semibold text-accent uppercase tracking-wider">
              Knowledge Capture →
            </span>
          </div>
        </div>
      </section>

      {/* 6. TRUST & SECURITY */}
      <section className="w-full max-w-[1360px] py-12 px-6 sm:px-10 border-t border-b border-border my-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-accent shrink-0 mt-0.5" />
            <div>
              <h5 className="text-xs font-semibold text-text-primary mb-0.5">Human-in-the-Loop</h5>
              <p className="text-[11px] text-text-secondary">All plans require human approval.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
            <FileCheck className="w-5 h-5 text-accent shrink-0 mt-0.5" />
            <div>
              <h5 className="text-xs font-semibold text-text-primary mb-0.5">Full Proof Logging</h5>
              <p className="text-[11px] text-text-secondary">Step screenshots and DOM event logs.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
            <Lock className="w-5 h-5 text-accent shrink-0 mt-0.5" />
            <div>
              <h5 className="text-xs font-semibold text-text-primary mb-0.5">Supabase Persistence</h5>
              <p className="text-[11px] text-text-secondary">Secure workspace isolation.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
            <Cpu className="w-5 h-5 text-accent shrink-0 mt-0.5" />
            <div>
              <h5 className="text-xs font-semibold text-text-primary mb-0.5">Isolated Runner</h5>
              <p className="text-[11px] text-text-secondary">Headless Playwright contexts.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FINAL EDITORIAL CTA */}
      <section className="w-full max-w-[1360px] py-20 px-6 sm:px-10 text-center">
        <div className="solid-card p-10 sm:p-16 bg-surface border border-border rounded-xl text-center">
          <span className="editorial-label mb-4 inline-block">Get Started Today</span>
          <h2 className="font-display text-3xl sm:text-5xl font-normal text-text-primary max-w-3xl mx-auto mb-6 leading-tight">
            Your team's repetitive work is already telling you what to automate.
          </h2>
          <p className="text-sm sm:text-base text-text-secondary max-w-xl mx-auto mb-10 font-normal leading-relaxed">
            Observe desktop workflows today and generate your first automation plan in minutes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleStartObserving}
              className="btn-primary"
            >
              <span>Start Observing</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>

            <button
              onClick={handleGoToDashboard}
              className="btn-secondary"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
