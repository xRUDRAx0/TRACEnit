import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Wrench, PlayCircle, ShieldCheck, Save, ArrowLeft, CheckCircle2, Sparkles } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import StatusBadge from '../components/ui/StatusBadge';
import EmptyState from '../components/ui/EmptyState';
import { API_URL } from '../config';

interface AutomationStep {
  type?: string;
  action?: string;
  target?: string;
  value?: string;
  url?: string;
  key?: string;
  originalAction?: string;
}

interface AutomationPlan {
  id: string;
  name: string;
  workflowId: string;
  trigger: { type: string };
  steps: AutomationStep[];
  status: 'Draft' | 'Approved';
}

export default function Builder() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const planId = queryParams.get('planId');

  const [plan, setPlan] = useState<AutomationPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!planId) return;
    
    fetch(`${API_URL}/api/automations/${planId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setPlan(data.plan);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [planId]);

  const handleApprove = async () => {
    if (!planId) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/automations/${planId}/approve`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        setPlan(prev => prev ? { ...prev, status: 'Approved' } : null);
        alert('Automation approved and saved successfully!');
        navigate('/automations');
      }
    } catch (err) {
      console.error('Failed to approve automation', err);
      alert('Failed to approve automation.');
    } finally {
      setSaving(false);
    }
  };

  if (loading && !plan) {
    return (
      <div className="w-full max-w-4xl mx-auto py-16 text-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-text-secondary font-medium">Loading automation plan definition...</p>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="w-full max-w-4xl mx-auto py-12">
        <EmptyState
          icon={Wrench}
          title="Automation blueprint not found"
          description="Select a workflow pattern from the Workflows tab to generate a new blueprint."
          action={
            <button onClick={() => navigate('/workflows')} className="btn-primary text-xs py-2 px-4">
              View Workflows
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <PageHeader
        title="Automation Plan Builder"
        description={`Review and approve the automation plan for ${plan.name}.`}
        icon={Wrench}
        badgeText={plan.status}
        badgeType={plan.status === 'Approved' ? 'success' : 'warning'}
        actions={
          <button 
            onClick={() => navigate(-1)} 
            className="px-3.5 py-2 rounded-md bg-surface border border-border hover:bg-surface-secondary text-text-primary text-xs font-medium transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        }
      />

      <div className="solid-card rounded-lg overflow-hidden border border-border bg-surface">
        <div className="p-6 border-b border-border bg-surface-secondary/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent/15 border border-accent/30 rounded-md flex items-center justify-center text-accent">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-text-primary text-base">{plan.name}</h2>
              <p className="text-xs text-text-secondary">Trigger: <span className="font-mono font-bold text-text-primary">{plan.trigger.type.toUpperCase()}</span></p>
            </div>
          </div>
          <StatusBadge status={plan.status} size="md" />
        </div>

        <div className="p-6 sm:p-8 bg-background">
          <div className="relative border-l-2 border-border ml-4 space-y-6 pb-4">
            
            <div className="relative -ml-[13px] flex items-center gap-4">
              <div className="w-6 h-6 rounded-full bg-border border-2 border-surface" />
              <span className="font-semibold text-text-muted text-xs uppercase tracking-wider">Start Workflow Trigger</span>
            </div>

            {plan.steps.map((step, idx) => {
              const isManual = step.type === 'human_approval' || step.action === 'human_approval';
              const actionName = step.action || step.type || 'Unknown';
              
              let details = '';
              if (step.url) details = `Navigate to URL: ${step.url}`;
              else if (step.value && step.target) details = `Type "${step.value}" into "${step.target}"`;
              else if (step.target) details = `Target Element: ${step.target}`;
              else if (step.key) details = `Press Key: ${step.key}`;

              return (
                <div key={idx} className="relative -ml-[21px] flex items-start gap-4 group">
                  <div className={`w-10 h-10 rounded-full border-4 border-surface flex items-center justify-center shrink-0 z-10 ${isManual ? 'bg-warning text-background' : 'bg-accent text-white'} shadow-sm`}>
                    {isManual ? <ShieldCheck className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                  </div>
                  
                  <div className={`flex-1 p-4 rounded-md border ${isManual ? 'bg-warning/10 border-warning/20' : 'bg-surface border-border'} shadow-sm`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${isManual ? 'text-warning' : 'text-accent'}`}>
                          {isManual ? 'Human Approval Checkpoint' : 'Playwright Step'}
                        </span>
                        <h4 className="font-bold text-text-primary text-sm mt-0.5 capitalize">
                          {actionName.replace(/_/g, ' ')}
                        </h4>
                        {details && <p className="text-xs text-text-secondary mt-1 font-mono">{details}</p>}
                      </div>
                      <span className="text-[10px] font-mono font-semibold text-text-muted bg-surface-secondary px-2 py-1 rounded border border-border">
                        step_{idx + 1}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="relative -ml-[13px] flex items-center gap-4 pt-4">
              <div className="w-6 h-6 rounded-full bg-border border-2 border-surface" />
              <span className="font-semibold text-text-muted text-xs uppercase tracking-wider">End Workflow Execution</span>
            </div>
            
          </div>
        </div>

        <div className="p-6 bg-surface border-t border-border flex justify-end gap-4">
          {plan.status !== 'Approved' ? (
            <button 
              onClick={handleApprove}
              disabled={saving}
              className="btn-primary text-xs py-2.5 px-6 flex items-center gap-2"
            >
              {saving ? 'Approving Blueprint...' : 'Approve & Save Automation'} <Save className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center gap-2 text-xs font-bold text-success">
              <CheckCircle2 className="w-4 h-4" />
              <span>Blueprint Approved & Ready for Execution</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
