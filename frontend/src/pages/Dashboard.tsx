import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Layers, Clock, Zap, FileText, Database, Bot, ArrowUpRight, Sparkles, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useObservation } from '../hooks/useObservation';
import { useAuth } from '../hooks/useAuth';
import PageHeader from '../components/ui/PageHeader';
import EmptyState from '../components/ui/EmptyState';
import { API_URL } from '../config';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, isDemoUser } = useAuth();
  const [data, setData] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [runs, setRuns] = useState<any[]>([]);
  const [automations, setAutomations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('This Week');
  const [isGenerating, setIsGenerating] = useState(false);
  const { liveEvents, isActive } = useObservation();

  const userName = user?.user_metadata?.full_name || (user?.email ? user.email.split('@')[0] : (isDemoUser ? 'Demo Operator' : 'Operator'));

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/api/dashboard`).then(r => r.json()),
      fetch(`${API_URL}/api/events`).then(r => r.json()),
      fetch(`${API_URL}/api/automations/runs`).then(r => r.json()),
      fetch(`${API_URL}/api/automations`).then(r => r.json())
    ]).then(([d, e, r, a]) => {
      setData(d);
      setEvents(Array.isArray(e) ? e : []);
      setRuns(Array.isArray(r) ? r : []);
      setAutomations(Array.isArray(a) ? a : []);
      setLoading(false);
    }).catch(e => {
      console.error('Failed to load dashboard data', e);
      setLoading(false);
    });
  }, [liveEvents.length, isActive]);

  // Combine saved events with live events
  const allEvents = useMemo(() => {
    const liveEventIds = new Set(liveEvents.map(e => e.id));
    const filteredSaved = events.filter(e => !liveEventIds.has(e.id));
    return [...filteredSaved, ...liveEvents];
  }, [events, liveEvents]);

  const {
    activitiesToday, activitiesYesterday,
    workflowsDetected,
    timeSavedMs, timeSavedPreviousMs,
    runsCount, runsPreviousCount,
    chartData, recentActivity
  } = useMemo(() => {
    const now = new Date();
    
    const isToday = (d: Date) => d.toDateString() === now.toDateString();
    const isYesterday = (d: Date) => {
      const y = new Date(now);
      y.setDate(now.getDate() - 1);
      return d.toDateString() === y.toDateString();
    };
    const isThisWeek = (d: Date) => {
      const start = new Date(now);
      start.setDate(now.getDate() - now.getDay());
      start.setHours(0,0,0,0);
      return d >= start;
    };
    const isLastWeek = (d: Date) => {
      const start = new Date(now);
      start.setDate(now.getDate() - now.getDay() - 7);
      start.setHours(0,0,0,0);
      const end = new Date(now);
      end.setDate(now.getDate() - now.getDay() - 1);
      end.setHours(23,59,59,999);
      return d >= start && d <= end;
    };
    const isThisMonth = (d: Date) => d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    const isLastMonth = (d: Date) => {
      const lm = new Date(now);
      lm.setMonth(now.getMonth() - 1);
      return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear();
    };

    const isInPeriod = (dateStr: string, period: string) => {
      const d = new Date(dateStr);
      if (period === 'Today') return isToday(d);
      if (period === 'This Week') return isThisWeek(d);
      if (period === 'This Month') return isThisMonth(d);
      return true;
    };

    const isInPreviousPeriod = (dateStr: string, period: string) => {
      const d = new Date(dateStr);
      if (period === 'Today') return isYesterday(d);
      if (period === 'This Week') return isLastWeek(d);
      if (period === 'This Month') return isLastMonth(d);
      return false;
    };

    const getRunTimeSaved = (run: any) => {
      const runStatus = run.status?.toLowerCase();
      const endTs = run.completedAt || run.endTime;
      const startTs = run.startedAt || run.startTime;
      if (runStatus !== 'completed' || !endTs) return 0;
      
      const runDurationS = (new Date(endTs).getTime() - new Date(startTs).getTime()) / 1000;
      const auto = automations.find(a => a.id === run.automationId);
      
      const manual = auto?.estimatedManualDuration || (runDurationS * 5);
      const savedS = Math.max(0, manual - runDurationS);
      
      return savedS * 1000; // ms
    };

    const activitiesTodayCount = allEvents.filter(e => isToday(new Date(e.timestamp))).length;
    const activitiesYesterdayCount = allEvents.filter(e => isYesterday(new Date(e.timestamp))).length;

    const workflowsDetectedCount = data?.workflowsDetected || 0;
    
    const periodRuns = runs.filter(r => isInPeriod(r.startTime, timeFilter));
    const previousRuns = runs.filter(r => isInPreviousPeriod(r.startTime, timeFilter));

    const runsCountVal = periodRuns.length;
    const runsPreviousCountVal = previousRuns.length;

    const timeSavedMsVal = periodRuns.reduce((acc, r) => acc + getRunTimeSaved(r), 0);
    const timeSavedPreviousMsVal = previousRuns.reduce((acc, r) => acc + getRunTimeSaved(r), 0);

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    let cData = days.map(day => ({ name: day, time: 0 }));
    
    periodRuns.forEach(r => {
      if (r.status === 'completed' && (r.endTime || r.completedAt)) {
        const d = new Date(r.endTime || r.completedAt);
        const savedMins = getRunTimeSaved(r) / 60000;
        cData[d.getDay()].time += savedMins;
      }
    });

    const recentActivityArr = [...allEvents].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5);

    return {
      activitiesToday: activitiesTodayCount,
      activitiesYesterday: activitiesYesterdayCount,
      workflowsDetected: workflowsDetectedCount,
      workflowsYesterday: workflowsDetectedCount,
      timeSavedMs: timeSavedMsVal,
      timeSavedPreviousMs: timeSavedPreviousMsVal,
      runsCount: runsCountVal,
      runsPreviousCount: runsPreviousCountVal,
      chartData: cData,
      recentActivity: recentActivityArr
    };
  }, [allEvents, runs, automations, data, timeFilter]);

  if (loading && !data) {
    return (
      <div className="w-full max-w-[1400px] mx-auto py-16 text-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-text-secondary font-medium">Loading Operations Command Center...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="w-full max-w-[1400px] mx-auto py-12">
        <EmptyState
          title="Unable to load dashboard data"
          description="Could not establish connection with the TRACE backend service."
          action={
            <button 
              onClick={() => window.location.reload()} 
              className="btn-primary text-xs py-2 px-4"
            >
              Retry Connection
            </button>
          }
        />
      </div>
    );
  }

  const formatMs = (ms: number) => {
    if (ms <= 0) return '0m';
    const hrs = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    if (hrs > 0) return `${hrs}h ${m}m`;
    return `${m}m`;
  };

  const getTrend = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? `↑ 100% vs previous` : 'No previous data';
    const diff = current - previous;
    const pct = Math.round((Math.abs(diff) / previous) * 100);
    return diff >= 0 ? `↑ ${pct}% vs previous` : `↓ ${Math.abs(pct)}% vs previous`;
  };

  const formatTime = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const handleBuildAutomation = async () => {
    if (!data.topOpportunity || !data.aiAnalysis) return;
    setIsGenerating(true);
    try {
      const response = await fetch(`${API_URL}/api/automation/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          aiAnalysis: data.aiAnalysis, 
          workflowId: data.topOpportunity.targetWorkflowId 
        })
      });
      const result = await response.json();
      if (result.success) {
        navigate(`/builder?planId=${result.planId}`);
      } else {
        alert('Failed to generate automation plan');
      }
    } catch (e) {
      console.error(e);
      alert('Error generating automation');
    } finally {
      setIsGenerating(false);
    }
  };

  const displayFormattedTime = formatMs(timeSavedMs);

  return (
    <div className="space-y-8 pb-12 max-w-[1400px] w-full mx-auto">
      
      {/* Page Header */}
      <PageHeader
        title={`Welcome back, ${userName}`}
        description="Good morning — your workspace is ready."
        icon={BarChart3}
        badgeText={isActive ? "Observation Active" : "Observer Idle"}
        badgeType={isActive ? "success" : "warning"}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/recorder')}
              className="px-3.5 py-2 rounded-md bg-surface border border-border hover:bg-surface-secondary text-text-primary font-medium text-xs flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Activity className="w-3.5 h-3.5 text-accent" />
              <span>Observer Controller</span>
            </button>
            <button
              onClick={() => navigate('/workflows')}
              className="btn-primary flex items-center gap-1.5 text-xs py-2 px-3.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>View Opportunities</span>
            </button>
          </div>
        }
      />

      {/* Top Operations Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Events Today', value: activitiesToday, trend: getTrend(activitiesToday, activitiesYesterday), trendColor: activitiesToday >= activitiesYesterday ? 'text-success' : 'text-text-muted', icon: Activity, onClick: () => navigate('/activity') },
          { title: 'Workflows Detected', value: workflowsDetected, trend: 'Discovered by AI', trendColor: 'text-text-muted', icon: Layers, onClick: () => navigate('/workflows') },
          { title: `Time Saved (${timeFilter})`, value: displayFormattedTime, trend: getTrend(timeSavedMs, timeSavedPreviousMs), trendColor: timeSavedMs >= timeSavedPreviousMs ? 'text-success' : 'text-text-muted', icon: Clock, onClick: () => navigate('/insights') },
          { title: 'Automations Run', value: runsCount, trend: getTrend(runsCount, runsPreviousCount), trendColor: runsCount >= runsPreviousCount ? 'text-success' : 'text-text-muted', icon: Zap, onClick: () => navigate('/executions') },
        ].map((stat, i) => (
          <div key={i} onClick={stat.onClick} className="solid-card group p-5 flex flex-col justify-between cursor-pointer hover:border-border-strong transition-all rounded-lg bg-surface">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10.5px] font-medium uppercase tracking-wider text-text-muted">{stat.title}</span>
              <stat.icon className="w-4 h-4 text-text-muted group-hover:text-text-primary transition-colors" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-text-primary tracking-tight mb-1">{stat.value}</h3>
              <p className={`text-[11px] font-medium ${stat.trendColor}`}>{stat.trend}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Operations Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Column 1: Live Activity Telemetry */}
        <div className="solid-card p-6 flex flex-col h-[420px] rounded-lg bg-surface border border-border">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xs font-semibold text-text-primary uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-text-secondary" /> Telemetry Stream
            </h2>
            <button onClick={() => navigate('/activity')} className="text-xs font-medium text-text-secondary hover:text-text-primary flex items-center gap-1 transition-colors">
              <span>View all</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-2.5">
            {recentActivity.length > 0 ? recentActivity.map((act: any, i: number) => {
              let ActIcon = FileText;
              if (act.app === 'Spreadsheet' || act.application === 'Excel') ActIcon = Database;
              else if (act.app === 'Gmail') ActIcon = Zap;

              return (
                <div key={i} className="p-3 rounded-md bg-surface-secondary/40 border border-border/80 flex items-start gap-3 text-xs hover:border-border transition-colors">
                  <div className="w-6 h-6 rounded bg-surface border border-border flex items-center justify-center shrink-0 mt-0.5">
                    <ActIcon className="w-3 h-3 text-text-secondary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-semibold text-text-primary truncate">
                        {act.action === 'click' ? `Clicked in ${act.application || 'Browser'}` : act.action === 'type' ? `Typed in ${act.application || 'Browser'}` : `Action in ${act.application || 'Browser'}`}
                      </span>
                      <span className="text-[10px] text-text-muted font-medium">{formatTime(act.timestamp)}</span>
                    </div>
                    <p className="text-[11px] text-text-secondary truncate font-mono">
                      {act.metadata?.elementName || act.metadata?.typedText || act.action}
                    </p>
                  </div>
                </div>
              );
            }) : (
              <EmptyState
                icon={Activity}
                title="No telemetry events yet"
                description="Start observation to capture browser actions."
                action={
                  <button onClick={() => navigate('/recorder')} className="btn-secondary text-xs py-1.5 px-3">
                    Open Recorder
                  </button>
                }
              />
            )}
          </div>
        </div>

        {/* Column 2: Top Automation Opportunity */}
        <div className="solid-card p-6 flex flex-col h-[420px] rounded-lg bg-surface border border-border">
          <h2 className="text-xs font-semibold text-text-primary uppercase tracking-wider mb-6 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-text-secondary" /> Automation Opportunity
          </h2>
          
          {data.topOpportunity ? (
            <div className="flex-1 flex flex-col">
              <h3 className="text-base font-bold text-text-primary mb-1">{data.topOpportunity.name}</h3>
              <p className="text-xs text-text-secondary mb-6">Identified repetitive multi-step workflow pattern</p>
              
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-surface-secondary/40 rounded-md border border-border/80 p-3.5">
                  <p className="text-[10px] text-text-muted font-medium uppercase tracking-wider mb-1">Automation Potential</p>
                  <p className="text-2xl font-bold text-success">{data.aiAnalysis?.automationPotential || 85}%</p>
                </div>
                <div className="bg-surface-secondary/40 rounded-md border border-border/80 p-3.5">
                  <p className="text-[10px] text-text-muted font-medium uppercase tracking-wider mb-1">Occurrences</p>
                  <p className="text-2xl font-bold text-text-primary">{data.topOpportunity.occurrenceCount}</p>
                </div>
                <div className="bg-surface-secondary/40 rounded-md border border-border/80 p-3.5">
                  <p className="text-[10px] text-text-muted font-medium uppercase tracking-wider mb-1">Avg. Duration</p>
                  <p className="text-lg font-bold text-text-primary">{Math.max(1, Math.round((data.topOpportunity.averageDurationSeconds || 0)/60))} min</p>
                </div>
                <div className="bg-surface-secondary/40 rounded-md border border-border/80 p-3.5">
                  <p className="text-[10px] text-text-muted font-medium uppercase tracking-wider mb-1">Potential Saving</p>
                  <p className="text-lg font-bold text-success">~{Math.max(1, Math.round((data.topOpportunity.averageDurationSeconds || 0)/60))}m/run</p>
                </div>
              </div>

              <div className="mt-auto">
                <button 
                  onClick={handleBuildAutomation}
                  disabled={isGenerating}
                  className="btn-primary w-full py-2.5 text-xs disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-background border-t-transparent rounded-full animate-spin" />
                      <span>Generating Automation Plan...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Build Automation Plan</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <EmptyState
              icon={Bot}
              title="No workflow opportunities yet"
              description="Record a repetitive task to generate opportunities."
            />
          )}
        </div>

        {/* Column 3: Time Saved & Analytics Overview */}
        <div className="solid-card p-6 flex flex-col h-[420px] rounded-lg bg-surface border border-border">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xs font-semibold text-text-primary uppercase tracking-wider">Time Saved Chart</h2>
            <select 
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="bg-surface-secondary text-[11px] font-medium text-text-primary border border-border outline-none cursor-pointer rounded-md px-2.5 py-1 focus:border-accent transition-colors"
            >
              <option>Today</option>
              <option>This Week</option>
              <option>This Month</option>
              <option>All Time</option>
            </select>
          </div>
          
          <div className="mb-4">
             <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider mb-0.5">Total Hours Saved</p>
             <h3 className="text-3xl font-bold text-text-primary tracking-tight mb-1">{displayFormattedTime}</h3>
             <p className={`text-[11px] font-medium ${timeSavedMs >= timeSavedPreviousMs ? 'text-success' : 'text-text-muted'}`}>{getTrend(timeSavedMs, timeSavedPreviousMs)}</p>
          </div>

          <div className="flex-1 w-full min-h-[140px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-secondary)', fontSize: 9, fontWeight: 500}} tickFormatter={(v) => `${Math.round(v)}m`} />
                <XAxis dataKey="name" tick={{fill: 'var(--text-secondary)', fontSize: 9, fontWeight: 500}} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{stroke: 'var(--border-strong)', strokeWidth: 1, strokeDasharray: '4 4'}} 
                  contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border-strong)', borderRadius: '8px', fontSize: '11px', fontWeight: '600', color: 'var(--text-primary)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                />
                <Line type="monotone" dataKey="time" stroke="var(--accent)" strokeWidth={2} dot={{r: 3, fill: 'var(--surface)', stroke: 'var(--accent)', strokeWidth: 2}} activeDot={{r: 5, fill: 'var(--accent)', strokeWidth: 0}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
