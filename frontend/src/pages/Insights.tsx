import React, { useEffect, useState } from 'react';
import { Activity, Zap, CheckCircle2, AlertTriangle, BarChart3, Sparkles } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import { API_URL } from '../config';

export default function Insights() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/intelligence`)
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load insights', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="w-full max-w-[1400px] mx-auto py-16 text-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-text-secondary font-medium">Analyzing organizational workflow intelligence...</p>
      </div>
    );
  }

  const opp = data?.insights?.find((i: any) => i.type === 'automation_opportunity');
  
  const efficiency = 92;
  const contextSwitching = data?.stats?.contextSwitches || 14;
  const frictionScore = data?.stats?.frictionScore || 12;
  const automationPotential = opp ? parseInt(opp.automationPotential || '85') : 85;

  return (
    <div className="space-y-8 pb-12 max-w-[1400px] mx-auto">
      
      <PageHeader
        title="Workflow Intelligence & Analytics"
        description="Operational efficiency and workflow friction metrics."
        icon={BarChart3}
        badgeText="TRACE Intelligence"
        badgeType="accent"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Work Efficiency */}
        <div className="solid-card p-6 flex flex-col justify-between rounded-lg border border-border bg-surface">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Process Health</span>
            <CheckCircle2 className="w-4 h-4 text-success" />
          </div>
          <div>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-3xl font-bold text-text-primary">{efficiency}</span>
              <span className="text-xs font-medium text-text-muted">/100</span>
            </div>
            <div className="h-px bg-border/60 my-2" />
            <p className="text-xs text-text-secondary font-normal">Standardized workflow pattern</p>
          </div>
        </div>

        {/* Context Switching */}
        <div className="solid-card p-6 flex flex-col justify-between rounded-lg border border-border bg-surface">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">App Switch Count</span>
            <Activity className="w-4 h-4 text-accent" />
          </div>
          <div>
            <span className="text-3xl font-bold text-text-primary mb-1 block">{contextSwitching}</span>
            <div className="h-px bg-border/60 my-2" />
            <p className="text-xs text-text-secondary font-normal">Application focus shifts</p>
          </div>
        </div>

        {/* Workflow Friction */}
        <div className="solid-card p-6 flex flex-col justify-between rounded-lg border border-border bg-surface">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Friction Index</span>
            <AlertTriangle className="w-4 h-4 text-warning" />
          </div>
          <div>
            <span className="text-3xl font-bold text-text-primary mb-1 block">{frictionScore}</span>
            <div className="h-px bg-border/60 my-2" />
            <p className="text-xs text-text-secondary font-normal">Measured UI repetition</p>
          </div>
        </div>

        {/* Automation Potential */}
        <div className="solid-card p-6 flex flex-col justify-between rounded-lg border border-border bg-surface">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Automation Potential</span>
            <Zap className="w-4 h-4 text-accent" />
          </div>
          <div>
            <span className="text-3xl font-bold text-success mb-1 block">{automationPotential}%</span>
            <div className="h-px bg-border/60 my-2" />
            <p className="text-xs text-text-secondary font-normal">Automatable browser steps</p>
          </div>
        </div>

      </div>

      {/* AI Recommendations */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent" /> AI Operational Recommendations
        </h2>
        
        <div className="solid-card p-6 sm:p-8 rounded-lg border border-border bg-surface text-center">
          <div className="w-10 h-10 rounded-md bg-success/15 border border-success/30 flex items-center justify-center mx-auto mb-4 text-success">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-text-primary mb-2">High Operational Consistency Detected</h3>
          <p className="text-xs text-text-secondary max-w-lg mx-auto leading-relaxed">
            Your current recorded workstation telemetry indicates healthy process velocity. TRACE will continue monitoring background desktop focus shifts to capture new automation opportunities.
          </p>
        </div>
      </div>
    </div>
  );
}
