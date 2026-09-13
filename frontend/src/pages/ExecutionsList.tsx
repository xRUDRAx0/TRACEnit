import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayCircle, Clock, Zap, Search, ChevronRight } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import StatusBadge from '../components/ui/StatusBadge';
import EmptyState from '../components/ui/EmptyState';
import { API_URL } from '../config';

export default function ExecutionsList() {
  const navigate = useNavigate();
  const [runs, setRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/api/automations/runs`)
      .then(res => res.json())
      .then(data => {
        setRuns(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load runs', err);
        setLoading(false);
      });
  }, []);

  const filteredRuns = runs.filter(run => 
    run.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (run.automationId && run.automationId.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8 pb-12 max-w-[1400px] mx-auto">
      <PageHeader
        title="Execution Monitor"
        description="Execution history and run status."
        icon={PlayCircle}
        badgeText={`${runs.length} Runs`}
        badgeType="accent"
      />

      <div className="solid-card rounded-lg overflow-hidden flex flex-col border border-border bg-surface">
        <div className="p-4 border-b border-border bg-surface-secondary/40">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search execution runs by ID or blueprint..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface border border-border rounded-md px-10 py-2 text-xs font-semibold text-text-primary focus:outline-none focus:border-accent transition-colors"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-xs font-medium text-text-muted">
            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading execution logs...
          </div>
        ) : filteredRuns.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="No execution runs recorded"
            description="Run an automation blueprint to see execution history."
            action={
              <button onClick={() => navigate('/automations')} className="btn-primary text-xs py-2 px-4">
                Go to Automations
              </button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-[10px] text-text-muted font-bold uppercase tracking-wider bg-surface-secondary/30">
                  <th className="py-4 pl-6">Automation Plan</th>
                  <th className="py-4">Started At</th>
                  <th className="py-4">Duration</th>
                  <th className="py-4">Execution Status</th>
                  <th className="py-4 text-right pr-6">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {filteredRuns.map((run, i) => {
                  const duration = (run.endTime || run.completedAt) ? `${Math.round((new Date(run.endTime || run.completedAt).getTime() - new Date(run.startTime || run.startedAt).getTime()) / 1000)}s` : 'Running...';

                  return (
                    <tr 
                      key={i} 
                      className="hover:bg-surface-secondary/50 transition-colors group cursor-pointer" 
                      onClick={() => navigate(`/execute/${run.id}`)}
                    >
                      <td className="py-4 pl-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-md bg-surface border border-border flex items-center justify-center shrink-0">
                            <Zap className="w-5 h-5 text-accent" />
                          </div>
                          <div>
                            <p className="font-bold text-text-primary text-sm">{run.automationId}</p>
                            <p className="text-[10px] text-text-muted font-mono mt-0.5">Run ID: {run.id.substring(0, 12)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 font-bold text-text-secondary text-xs">
                        {new Date(run.startTime || run.startedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                      <td className="py-4 font-bold text-text-secondary text-xs">
                        {duration}
                      </td>
                      <td className="py-4">
                        <StatusBadge status={run.status} size="sm" />
                      </td>
                      <td className="py-4 text-right pr-6">
                        <div className="flex items-center justify-end gap-1 text-xs font-bold text-accent group-hover:translate-x-1 transition-transform">
                          <span>Inspect Run</span>
                          <ChevronRight className="w-4 h-4" />
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
