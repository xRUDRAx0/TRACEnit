import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayCircle, StopCircle, CheckCircle2, Zap, BrainCircuit, Save, ArrowLeft } from 'lucide-react';
import { useObservation } from '../hooks/useObservation';
import PageHeader from '../components/ui/PageHeader';
import { API_URL } from '../config';

export default function Recorder() {
  const navigate = useNavigate();
  const { isActive, toggleObservation, liveEvents, currentSessionId } = useObservation();
  
  const [analyzing, setAnalyzing] = useState(false);
  const [proposedWorkflow, setProposedWorkflow] = useState<any>(null);

  const handleToggle = async () => {
    if (isActive) {
      const sessionId = currentSessionId;
      await toggleObservation();
      
      if (sessionId && liveEvents.length > 0) {
        setAnalyzing(true);
        try {
          const res = await fetch(`${API_URL}/api/teach`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId })
          });
          const data = await res.json();
          setProposedWorkflow(data);
        } catch (err) {
          console.error('Analysis failed', err);
        } finally {
          setAnalyzing(false);
        }
      }
    } else {
      setProposedWorkflow(null);
      await toggleObservation();
    }
  };

  const handleSave = async () => {
    if (!proposedWorkflow) return;
    try {
      await fetch(`${API_URL}/api/automations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(proposedWorkflow)
      });
      navigate('/workflows');
    } catch (err) {
      console.error('Failed to save workflow', err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <PageHeader
        title="Teach TRACE Recorder"
        description="Perform your task normally — TRACE captures it."
        icon={BrainCircuit}
        badgeText={isActive ? "Recording" : "Standby"}
        badgeType={isActive ? "success" : "warning"}
        actions={
          <button 
            onClick={() => navigate('/dashboard')} 
            className="px-3.5 py-2 rounded-md bg-surface border border-border hover:bg-surface-secondary text-text-primary text-xs font-medium transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
        }
      />

      {!proposedWorkflow && !analyzing && (
        <div className="solid-card p-12 text-center flex flex-col items-center rounded-lg border border-border bg-surface">
          <button 
            onClick={handleToggle}
            className={`w-32 h-32 rounded-full flex flex-col items-center justify-center transition-all shadow-md hover:scale-105 active:scale-95 ${
              isActive 
                ? 'bg-error text-white animate-pulse' 
                : 'bg-accent text-white'
            }`}
          >
            {isActive ? <StopCircle className="w-10 h-10 mb-1" /> : <PlayCircle className="w-10 h-10 mb-1 pl-1" />}
            <span className="font-bold text-xs uppercase tracking-wider">{isActive ? 'Finish Session' : 'Start Recording'}</span>
          </button>
          
          {isActive && (
            <div className="mt-8 text-center animate-in slide-in-from-bottom-4">
              <p className="text-xs font-bold text-error mb-1 flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-error animate-ping"></span> Recording desktop events in real time...
              </p>
              <p className="text-xs text-text-muted font-mono">{liveEvents.length} actions captured</p>
            </div>
          )}
        </div>
      )}

      {analyzing && (
        <div className="solid-card p-12 text-center flex flex-col items-center space-y-4 rounded-lg border border-border bg-surface">
          <div className="w-10 h-10 border-3 border-accent border-t-transparent rounded-full animate-spin"></div>
          <div>
            <h3 className="text-base font-bold text-text-primary">Analyzing Captured Telemetry...</h3>
            <p className="text-xs text-text-secondary mt-1">Extracting logical DOM selectors and building automation steps.</p>
          </div>
        </div>
      )}

      {proposedWorkflow && !analyzing && (
        <div className="solid-card rounded-lg overflow-hidden border border-border bg-surface">
          <div className="bg-surface-secondary/70 p-6 text-center border-b border-border">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs font-bold bg-success/10 text-success border border-success/20 mb-3">
              <CheckCircle2 className="w-4 h-4" /> WORKFLOW BLUEPRINT DISCOVERED
            </span>
            <h2 className="text-2xl font-bold text-text-primary mb-1">{proposedWorkflow.name}</h2>
            <p className="text-xs text-text-secondary max-w-md mx-auto">
              TRACE translated {proposedWorkflow.executionCount || liveEvents.length} recorded events into {proposedWorkflow.steps?.length || 0} Playwright steps.
            </p>
          </div>

          <div className="p-6 grid grid-cols-3 gap-4 text-center">
            <div className="p-3.5 bg-surface-secondary/50 rounded-md border border-border">
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Manual Time</p>
              <p className="text-lg font-bold text-text-secondary">{Math.floor((proposedWorkflow.estimatedManualDuration || 0)/60)}m {(proposedWorkflow.estimatedManualDuration || 0)%60}s</p>
            </div>
            <div className="p-3.5 bg-surface-secondary/50 rounded-md border border-border">
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Automated Time</p>
              <p className="text-lg font-bold text-accent">{Math.floor((proposedWorkflow.averageDuration || 0)/60)}m {(proposedWorkflow.averageDuration || 0)%60}s</p>
            </div>
            <div className="p-3.5 bg-surface-secondary/50 rounded-md border border-border">
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Time Saved</p>
              <p className="text-lg font-bold text-success flex items-center justify-center gap-1">
                <Zap className="w-4 h-4" />
                {Math.floor((proposedWorkflow.timeSavedPerRun || 0)/60)}m {(proposedWorkflow.timeSavedPerRun || 0)%60}s
              </p>
            </div>
          </div>

          <div className="px-6 pb-6 flex flex-col items-center">
            <button 
              onClick={handleSave}
              className="btn-primary w-full sm:w-auto px-8 py-2.5 text-xs flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" /> Save Blueprint to Workspace
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
