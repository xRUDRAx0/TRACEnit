import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bot, Loader2, ChevronRight, AlertTriangle, ArrowLeft } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import EmptyState from '../components/ui/EmptyState';
import { API_URL } from '../config';

export default function AgentView() {
  const location = useLocation();
  const navigate = useNavigate();
  const [logs, setLogs] = useState<any[]>([]);
  const [error, setError] = useState('');
  
  const instruction = location.state?.instruction;

  useEffect(() => {
    if (!instruction) {
      navigate('/dashboard');
      return;
    }

    const runAgentProcess = async () => {
      try {
        setLogs([{ agent: 'TRACE Orchestration Agent', status: 'Parsed natural language intent', detail: instruction }]);
        
        const res = await fetch(`${API_URL}/api/execute-intent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ input: instruction })
        });
        
        const data = await res.json();
        
        if (data.success && data.agentLog) {
          for (let i = 0; i < data.agentLog.length; i++) {
            await new Promise(r => setTimeout(r, 600));
            setLogs(prev => [...prev, data.agentLog[i]]);
          }
          
          await new Promise(r => setTimeout(r, 1000));
          navigate(`/execute/${data.runId}`);
        } else {
          setError(data.message || 'Failed to process automation intent.');
        }
      } catch (err: any) {
        setError(err.message || 'Server connection error.');
      }
    };

    runAgentProcess();
  }, [instruction, navigate]);

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <PageHeader
        title="AI Agent Orchestrator"
        description="Processing automation intent."
        icon={Bot}
        badgeText="Active Swarm"
        badgeType="accent"
        actions={
          <button 
            onClick={() => navigate('/dashboard')} 
            className="px-3.5 py-2 rounded-md bg-surface border border-border hover:bg-surface-secondary text-text-primary text-xs font-medium transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Cancel & Back
          </button>
        }
      />

      <div className="solid-card p-6 sm:p-8 rounded-lg border border-border bg-surface">
        {error ? (
          <EmptyState
            icon={AlertTriangle}
            title="Orchestration Failed"
            description={error}
            action={
              <button onClick={() => navigate('/dashboard')} className="btn-primary text-xs py-2 px-4">
                Return to Dashboard
              </button>
            }
          />
        ) : (
          <div className="space-y-6">
            <div className="p-4 bg-surface-secondary/50 border border-border rounded-md">
               <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Target Intent</p>
               <p className="text-sm font-semibold text-text-primary">"{instruction}"</p>
            </div>
            
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider pl-1">Agent Swarm Activity Log</h3>
            
            <div className="space-y-3 relative before:absolute before:inset-y-0 before:left-[23px] before:w-px before:bg-border">
              {logs.map((log, i) => (
                <div key={i} className="flex gap-4 relative animate-in slide-in-from-left-4 fade-in duration-300">
                  <div className="w-12 flex justify-center shrink-0 pt-1 relative z-10">
                     <div className="w-3.5 h-3.5 rounded-full bg-success ring-4 ring-background border border-success"></div>
                  </div>
                  <div className="flex-1 bg-surface-secondary/50 border border-border rounded-md p-4 shadow-sm">
                    <p className="text-xs font-bold text-text-primary mb-0.5">{log.agent}</p>
                    <p className="text-xs text-text-secondary flex items-center gap-2">
                       <span>{log.status}</span>
                       <ChevronRight className="w-3 h-3 text-border" /> 
                       <span className="font-mono text-accent font-bold">{log.detail}</span>
                    </p>
                  </div>
                </div>
              ))}
              
              {!error && logs.length > 0 && (
                <div className="flex gap-4 relative pt-2">
                  <div className="w-12 flex justify-center shrink-0 pt-1 relative z-10">
                     <Loader2 className="w-4 h-4 text-accent animate-spin bg-background" />
                  </div>
                  <div className="flex-1 text-xs text-text-muted font-bold pt-0.5">
                    Synthesizing Playwright code & launching browser context...
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
