import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, Zap, Search, Sparkles } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import EmptyState from '../components/ui/EmptyState';
import TraceLogo from '../components/TraceLogo';
import { API_URL } from '../config';

export default function Workflows() {
  const navigate = useNavigate();
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/api/dashboard`)
      .then(res => res.json())
      .then(data => {
        setWorkflows(data.detectedWorkflows || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load workflows', err);
        setLoading(false);
      });
  }, []);

  const filteredWorkflows = workflows.filter(w => 
    w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (w.repeatedActions && w.repeatedActions.join(' ').toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8 pb-12 max-w-[1400px] mx-auto">
      <PageHeader
        title="Discovered Workflows"
        description="Detected repetitive workflow patterns."
        icon={Layers}
        badgeText={`${workflows.length} Patterns`}
        badgeType="accent"
        actions={
          <button
            onClick={() => navigate('/builder')}
            className="btn-primary flex items-center gap-2 text-xs py-2 px-4"
          >
            <Sparkles className="w-4 h-4" />
            <span>Create Custom Blueprint</span>
          </button>
        }
      />

      <div className="solid-card rounded-lg overflow-hidden flex flex-col border border-border bg-surface">
        <div className="p-4 border-b border-border bg-surface-secondary/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search detected workflows by name or action..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface border border-border rounded-md px-10 py-2 text-xs font-semibold text-text-primary focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-text-secondary font-semibold">
            <span>Filter by status:</span>
            <span className="px-2.5 py-1 rounded-md bg-surface border border-border text-text-primary text-[11px]">All Patterns</span>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-xs font-medium text-text-muted">
            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Analyzing event clusters for workflow patterns...
          </div>
        ) : filteredWorkflows.length === 0 ? (
          <EmptyState
            icon={Layers}
            title="No workflow patterns detected"
            description="Record a workflow to detect repetitive patterns."
            action={
              <button onClick={() => navigate('/recorder')} className="btn-primary text-xs py-2 px-4">
                Start Recorder Session
              </button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-[10px] text-text-muted font-bold uppercase tracking-wider bg-surface-secondary/30">
                  <th className="py-4 pl-6">Workflow Pattern</th>
                  <th className="py-4">Occurrences</th>
                  <th className="py-4">Feasibility Score</th>
                  <th className="py-4">Status</th>
                  <th className="py-4 text-right pr-6">Automation Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {filteredWorkflows.map((row: any, i: number) => {
                  const isReady = row.status === 'Ready';
                  const sbg = isReady ? 'text-success bg-success/10 border-success/20' : 'text-warning bg-warning/10 border-warning/20';
                  
                  return (
                    <tr key={i} className="hover:bg-surface-secondary/50 transition-colors group">
                      <td className="py-4 pl-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-md bg-surface border border-border flex items-center justify-center shrink-0">
                            <Layers className="w-5 h-5 text-accent" />
                          </div>
                          <div>
                            <p className="font-bold text-text-primary text-sm">{row.name}</p>
                            <p className="text-[11px] text-text-secondary truncate max-w-md font-mono mt-0.5">
                              {row.repeatedActions ? row.repeatedActions.join(' → ') : 'Multi-step action loop'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 font-semibold text-text-primary">
                        <span className="px-2.5 py-1 rounded-md bg-surface-secondary border border-border text-xs font-mono">
                          {row.occurrenceCount} runs
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-text-primary text-xs">{row.score || 85}%</span>
                          <div className="w-20 h-1.5 bg-surface-secondary rounded-full overflow-hidden border border-border/50">
                            <div className={`h-full rounded-full ${isReady ? 'bg-success' : 'bg-warning'}`} style={{ width: `${row.score || 85}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-sm border ${sbg} inline-flex items-center gap-1.5`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span> {row.status}
                        </span>
                      </td>
                      <td className="py-4 text-right pr-6">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => navigate(`/analysis`)} 
                            className="btn-secondary text-xs py-1.5 px-3"
                          >
                            <TraceLogo className="text-xs" /> Analyze
                          </button>
                          <button 
                            onClick={() => navigate(`/builder`)} 
                            className="btn-primary text-xs py-1.5 px-3.5 flex items-center gap-1.5"
                          >
                            <Zap className="w-3.5 h-3.5" /> Generate Plan
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
