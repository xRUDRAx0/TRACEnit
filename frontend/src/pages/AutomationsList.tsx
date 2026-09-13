import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, PlayCircle, Trash2, Search, Sparkles } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import StatusBadge from '../components/ui/StatusBadge';
import EmptyState from '../components/ui/EmptyState';
import { API_URL } from '../config';

export default function AutomationsList() {
  const navigate = useNavigate();
  const [automations, setAutomations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/api/automations`)
      .then(res => res.json())
      .then(data => {
        setAutomations(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load automations', err);
        setLoading(false);
      });
  }, []);

  const handleRunNow = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/api/automations/${id}/execute`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        navigate(`/execute/${data.runId}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this automation plan?')) return;
    try {
      const res = await fetch(`${API_URL}/api/automations/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setAutomations(prev => prev.filter(a => a.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredAutomations = automations.filter(a =>
    a.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.name && a.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8 pb-12 max-w-[1400px] mx-auto">
      <PageHeader
        title="Automation Plans"
        description="Automation blueprints ready to run."
        icon={Zap}
        badgeText={`${automations.length} Active Plans`}
        badgeType="success"
        actions={
          <button 
            onClick={() => navigate('/workflows')} 
            className="btn-primary flex items-center gap-2 text-xs py-2 px-4"
          >
            <Sparkles className="w-4 h-4" />
            <span>New Automation from Pattern</span>
          </button>
        }
      />

      <div className="solid-card rounded-lg overflow-hidden flex flex-col border border-border bg-surface">
        <div className="p-4 border-b border-border bg-surface-secondary/40 flex items-center justify-between gap-4">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search automation blueprints..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface border border-border rounded-md px-10 py-2 text-xs font-semibold text-text-primary focus:outline-none focus:border-accent transition-colors"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-xs font-medium text-text-muted">
            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading automation plans...
          </div>
        ) : filteredAutomations.length === 0 ? (
          <EmptyState
            icon={Zap}
            title="No automation blueprints found"
            description="Convert a workflow pattern into an automation."
            action={
              <button onClick={() => navigate('/workflows')} className="btn-primary text-xs py-2 px-4">
                Browse Discovered Workflows
              </button>
            }
          />
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredAutomations.map((automation, i) => (
                <div key={i} className="solid-card p-6 flex flex-col rounded-lg border border-border hover:border-border transition-all bg-surface">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-md bg-accent/15 border border-accent/30 flex items-center justify-center text-accent shrink-0">
                        <Zap className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-text-primary font-bold text-sm truncate max-w-[180px]">{automation.name || automation.id}</h3>
                        <StatusBadge status={automation.status || 'approved'} size="sm" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 mb-6">
                     <p className="text-xs text-text-secondary mb-3 leading-relaxed">
                       Executes {automation.steps?.length || 0} deterministic Playwright browser actions.
                     </p>
                     <div className="text-[10px] font-semibold text-text-muted uppercase tracking-widest bg-surface-secondary/60 p-2 rounded-md border border-border/60">
                       Trigger Mode: <span className="text-text-primary font-mono">Manual / Event</span>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="p-3 bg-surface-secondary/50 border border-border rounded-md">
                      <p className="text-[10px] text-text-muted font-semibold uppercase tracking-wider mb-0.5">Steps</p>
                      <p className="text-base font-bold text-text-primary">{automation.steps?.length || 0}</p>
                    </div>
                    <div className="p-3 bg-surface-secondary/50 border border-border rounded-md">
                      <p className="text-[10px] text-text-muted font-semibold uppercase tracking-wider mb-0.5">Runner</p>
                      <p className="text-base font-bold text-accent">Playwright</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-auto">
                    <button 
                      onClick={() => handleRunNow(automation.id)} 
                      className="btn-primary flex-1 py-2 text-xs flex items-center justify-center gap-2"
                    >
                      <PlayCircle className="w-4 h-4" /> Run Now
                    </button>
                    <button 
                      onClick={() => handleDelete(automation.id)} 
                      className="p-2 bg-surface hover:bg-error/10 text-text-secondary hover:text-error rounded-md border border-border transition-colors shadow-sm" 
                      title="Delete Automation Blueprint"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
