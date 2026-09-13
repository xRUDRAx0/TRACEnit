import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Zap, ArrowRight, Layers, AlertTriangle, Sparkles } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import EmptyState from '../components/ui/EmptyState';
import { API_URL } from '../config';

interface AnalysisData {
  pattern: {
    targetWorkflowId: string;
    occurrenceCount: number;
    averageDurationSeconds: number;
    repeatedActions: string[];
    workflowSimilarityPercentage: number;
    estimatedAutomationPotential: string;
  };
  ai: {
    workflowName: string;
    automationPotential: number;
    summary: string;
    insights: any[];
    automationPlan: {
      steps: any[];
      humanApprovalSteps: string[];
    };
  };
}

export default function Analysis() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const workflowId = queryParams.get('workflowId');

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalysisData | null>(null);
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!workflowId) {
      setError('No workflow ID provided for analysis.');
      setLoading(false);
      return;
    }

    const fetchAnalysis = async () => {
      try {
        const response = await fetch(`${API_URL}/api/workflows/${workflowId}/analyze`, {
          method: 'POST'
        });
        const result = await response.json();
        
        if (result.success) {
          setData({ pattern: result.pattern, ai: result.ai });
        } else {
          setError(result.error || 'Failed to analyze workflow.');
        }
      } catch (err) {
        console.error('Failed to analyze workflow', err);
        setError('Connection error to backend.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [workflowId]);

  const handleGenerateAutomation = async () => {
    if (!data || !workflowId) return;
    setGenerating(true);
    try {
      const response = await fetch(`${API_URL}/api/automation/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aiAnalysis: data.ai, workflowId })
      });
      const result = await response.json();
      if (result.success) {
        navigate(`/builder?planId=${result.planId}`);
      } else {
        alert('Failed to generate automation plan');
      }
    } catch (err) {
      console.error(err);
      alert('Error generating automation plan');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      <PageHeader
        title="AI Workflow Analysis"
        description="AI-generated automation feasibility analysis."
        icon={Sparkles}
        badgeText={data?.ai?.workflowName || "Analysis Engine"}
        badgeType="accent"
      />

      {loading ? (
        <div className="solid-card p-12 text-center rounded-lg border border-border bg-surface">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <h3 className="text-sm font-bold text-text-primary">Analyzing Workflow Telemetry...</h3>
          <p className="text-xs text-text-secondary mt-1">Generating step sequence models and feasibility scores.</p>
        </div>
      ) : error || !data ? (
        <EmptyState
          icon={AlertTriangle}
          title="Analysis Unavailable"
          description={error || "Select a workflow pattern from the Workflows tab to analyze."}
          action={
            <button onClick={() => navigate('/workflows')} className="btn-primary text-xs py-2 px-4">
              View Workflows
            </button>
          }
        />
      ) : (
        <div className="space-y-6">
          {/* Executive Summary Header Card */}
          <div className="solid-card p-6 sm:p-8 rounded-lg border border-border bg-surface">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-6 mb-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-accent">AI Diagnosis</span>
                <h2 className="text-2xl font-bold text-text-primary mt-1">{data.ai.workflowName}</h2>
                <p className="text-xs text-text-secondary mt-1">{data.ai.summary}</p>
              </div>

              <div className="p-4 rounded-md bg-success/10 border border-success/20 text-center shrink-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-success">Feasibility Score</span>
                <p className="text-3xl font-bold text-success mt-0.5">{data.ai.automationPotential}%</p>
              </div>
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <div className="p-4 rounded-md bg-surface-secondary/50 border border-border">
                <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">Occurrences</p>
                <p className="text-xl font-bold text-text-primary">{data.pattern.occurrenceCount} runs</p>
              </div>

              <div className="p-4 rounded-md bg-surface-secondary/50 border border-border">
                <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">Avg. Duration</p>
                <p className="text-xl font-bold text-text-primary">{Math.round(data.pattern.averageDurationSeconds / 60)} mins</p>
              </div>

              <div className="p-4 rounded-md bg-surface-secondary/50 border border-border">
                <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">Sequence Match</p>
                <p className="text-xl font-bold text-accent">{data.pattern.workflowSimilarityPercentage}%</p>
              </div>

              <div className="p-4 rounded-md bg-surface-secondary/50 border border-border">
                <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">Estimated Savings</p>
                <p className="text-xl font-bold text-success">~{Math.round(data.pattern.averageDurationSeconds / 60)}m/run</p>
              </div>
            </div>

            {/* Action CTA */}
            <button
              onClick={handleGenerateAutomation}
              disabled={generating}
              className="btn-primary w-full py-2.5 text-xs disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {generating ? (
                <>
                  <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                  <span>Generating Automation Plan...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Generate Playwright Blueprint Plan</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Action Steps Breakdown */}
          <div className="solid-card p-6 sm:p-8 rounded-lg border border-border bg-surface">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4 text-accent" /> Identified Action Sequence
            </h3>

            <div className="space-y-3">
              {data.pattern.repeatedActions.map((action, idx) => (
                <div key={idx} className="p-3.5 rounded-md bg-surface-secondary/50 border border-border flex items-center gap-3">
                  <div className="w-6 h-6 rounded-md bg-surface border border-border text-text-primary text-xs font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </div>
                  <p className="text-xs font-mono font-semibold text-text-primary">{action}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
