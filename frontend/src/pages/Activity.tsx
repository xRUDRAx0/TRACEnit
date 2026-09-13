import React, { useEffect, useState } from 'react';
import { Search, ChevronDown, ChevronRight, PlayCircle, StopCircle, FileText, Database, Zap, Activity as ActivityIcon, Sparkles } from 'lucide-react';
import { useObservation } from '../hooks/useObservation';
import InspectModal from '../components/InspectModal';
import PageHeader from '../components/ui/PageHeader';
import EmptyState from '../components/ui/EmptyState';
import { API_URL } from '../config';

export default function Activity() {
  const { isActive, toggleObservation, liveEvents, currentSessionId, livePattern } = useObservation();
  
  const [sessions, setSessions] = useState<any[]>([]);
  const [allEvents, setAllEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [sessRes, evRes] = await Promise.all([
          fetch(`${API_URL}/api/sessions`),
          fetch(`${API_URL}/api/events`)
        ]);
        const [sessData, evData] = await Promise.all([sessRes.json(), evRes.json()]);
        setSessions(Array.isArray(sessData) ? sessData : []);
        setAllEvents(Array.isArray(evData) ? evData : []);
      } catch (err) {
        console.error('Failed to load activity data', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [isActive]);

  const eventsBySession: Record<string, any[]> = {};
  
  allEvents.forEach(e => {
    const sid = e.sessionId || e.workflowId;
    if (sid) {
      if (!eventsBySession[sid]) eventsBySession[sid] = [];
      eventsBySession[sid].push(e);
    }
  });

  if (currentSessionId && liveEvents.length > 0) {
    eventsBySession[currentSessionId] = [...liveEvents];
  }

  const getSessionNumber = (sessionId: string) => {
    const idx = [...sessions].reverse().findIndex(s => s.id === sessionId);
    return idx >= 0 ? idx + 1 : sessions.length + 1;
  };

  const getAppIcon = (appName: string) => {
    if (!appName) return { icon: FileText, color: 'text-text-secondary' };
    if (appName === 'Spreadsheet' || appName.includes('Excel')) return { icon: Database, color: 'text-success' };
    if (appName === 'Gmail' || appName.includes('Chrome')) return { icon: Zap, color: 'text-warning' };
    if (appName === 'Report' || appName.includes('Word')) return { icon: ActivityIcon, color: 'text-accent' };
    return { icon: FileText, color: 'text-text-secondary' };
  };

  const getSemanticAction = (act: any) => {
    if (act.action === 'click') return `Clicked "${act.elementName || act.target || 'UI Element'}"`;
    if (act.action === 'copy') return `Copied data from ${act.application}`;
    if (act.action === 'type') return `Typed text`;
    return act.action.replace('_', ' ');
  };

  const renderTimeline = (sessionEvents: any[]) => {
    const filtered = sessionEvents.filter(e => 
      e.action.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (e.target && e.target.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (e.application && e.application.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (filtered.length === 0) return <div className="p-4 text-xs text-text-muted">No matching events.</div>;

    return (
      <div className="py-4 pl-4 pr-4 border-t border-border bg-surface-secondary/30 relative">
        <div className="absolute left-8 top-8 bottom-8 w-px bg-border"></div>
        <div className="space-y-3">
          {filtered.map((act, i) => {
            const appName = act.app || act.application || 'Unknown';
            const { icon: Icon, color } = getAppIcon(appName);
            const time = new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

            return (
              <div key={i} className="flex gap-4 relative">
                <div className="w-16 text-[10px] font-bold text-text-muted pt-2 shrink-0 text-right">
                  {time}
                </div>
                <div className="w-6 h-6 rounded-full bg-surface border border-border flex items-center justify-center shrink-0 mt-0.5 relative z-10">
                  <div className="w-1.5 h-1.5 rounded-full bg-text-muted"></div>
                </div>
                <div 
                  className="flex-1 bg-surface border border-border rounded-md p-3 hover:border-accent/40 transition-colors cursor-pointer shadow-sm flex items-center justify-between group"
                  onClick={() => setSelectedEvent({...act, sessionNumber: getSessionNumber(act.sessionId || act.workflowId)})}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${color}`} />
                    <div>
                      <p className="text-xs font-bold text-text-primary capitalize">{getSemanticAction(act)}</p>
                      <p className="text-[10px] text-text-secondary">{appName} {act.windowTitle ? `· ${act.windowTitle}` : ''}</p>
                    </div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 text-[10px] font-bold text-accent px-2 py-1 bg-surface-secondary rounded transition-opacity">
                    Inspect
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  let displaySessions = [...sessions];
  if (currentSessionId && !displaySessions.find(s => s.id === currentSessionId)) {
    displaySessions.unshift({
      id: currentSessionId,
      startTime: liveEvents[0]?.timestamp || new Date().toISOString(),
      endTime: null,
      isLive: true
    });
  }
  
  displaySessions.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      
      {/* Page Header */}
      <PageHeader
        title="Desktop Activity Telemetry"
        description="Recorded desktop sessions and live event stream."
        icon={ActivityIcon}
        badgeText={isActive ? "Live Recording" : "Standby"}
        badgeType={isActive ? "success" : "warning"}
        actions={
          <button 
            onClick={toggleObservation}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-md transition-all ${
              isActive 
                ? 'bg-surface hover:bg-surface-secondary text-error border border-border'
                : 'btn-primary'
            }`}
          >
            {isActive ? <><StopCircle className="w-4 h-4" /> Stop Observation</> : <><PlayCircle className="w-4 h-4" /> Start Observation</>}
          </button>
        }
      />

      {/* Feature: TRACE LIVE STREAM */}
      {isActive && (
        <div className="solid-card rounded-lg border border-border overflow-hidden mb-8 bg-surface">
          <div className="bg-surface-secondary/70 p-4 flex items-center justify-between border-b border-border">
            <div className="flex items-center gap-3">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success"></span>
              </span>
              <h2 className="text-xs font-bold text-text-primary uppercase tracking-wider">TRACE LIVE STREAM</h2>
            </div>
            <p className="text-[10px] font-bold text-text-muted uppercase">Real-Time Telemetry Active</p>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">Recent Live Events</h3>
              <div className="space-y-3">
                {liveEvents.slice(0, 5).map((act, i) => {
                  const appName = act.app || act.application || 'Unknown';
                  const { icon: Icon, color } = getAppIcon(appName);
                  return (
                    <div key={i} className="flex gap-3 items-start p-2 rounded-lg bg-surface-secondary/40 border border-border/50">
                      <Icon className={`w-4 h-4 mt-0.5 ${color}`} />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-text-primary capitalize">{getSemanticAction(act)}</p>
                        <p className="text-[10px] text-text-secondary truncate">{appName} {act.windowTitle ? `· ${act.windowTitle}` : ''}</p>
                      </div>
                    </div>
                  );
                })}
                {liveEvents.length === 0 && <p className="text-xs text-text-muted">Listening for desktop events...</p>}
              </div>
            </div>
            
            <div className="bg-surface-secondary/60 rounded-xl p-4 border border-border/80">
              <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-accent" /> Pattern Intelligence
              </h3>
              {livePattern && livePattern.repeatedActions && livePattern.repeatedActions.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-warning" />
                    <p className="text-xs font-bold text-text-primary">Repetitive Pattern Detected</p>
                  </div>
                  <p className="text-xs text-text-secondary font-mono bg-surface p-2.5 rounded-lg border border-border">
                    {livePattern.repeatedActions.join(' → ')}
                  </p>
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-text-muted uppercase">Confidence Score</span>
                    <span className="text-xs font-black text-success">{livePattern.workflowSimilarityPercentage}%</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-text-muted">Analyzing event sequence in real time...</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Sessions Container */}
      <div className="solid-card rounded-2xl overflow-hidden flex flex-col border border-border bg-surface">
        <div className="p-4 border-b border-border bg-surface-secondary/40">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search sessions or actions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface border border-border rounded-xl px-10 py-2 text-xs font-bold text-text-primary focus:outline-none focus:border-accent transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-12 text-center text-xs text-text-muted font-medium">Loading session telemetry...</div>
          ) : displaySessions.length === 0 ? (
            <EmptyState
              icon={ActivityIcon}
              title="No observation sessions recorded"
              description="Start observing to capture desktop workflows."
            />
          ) : (
            <div className="divide-y divide-border">
              {displaySessions.map((session) => {
                const sEvents = eventsBySession[session.id] || [];
                if (searchTerm && !sEvents.some(e => 
                  e.action.toLowerCase().includes(searchTerm.toLowerCase()) || 
                  (e.target && e.target.toLowerCase().includes(searchTerm.toLowerCase()))
                )) {
                  if (searchTerm !== '') return null;
                }

                const uniqueApps = new Set(sEvents.map(e => e.app || e.application)).size;
                const isExpanded = expandedSessionId === session.id;
                const isLive = session.isLive || (isActive && session.id === currentSessionId);
                
                let timeString = '';
                if (session.startTime) {
                  const start = new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  const end = session.endTime ? new Date(session.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now';
                  timeString = `${start} – ${end}`;
                }

                return (
                  <div key={session.id} className="bg-surface transition-colors">
                    {/* Session Header Bar */}
                    <div 
                      className={`p-5 flex items-center justify-between cursor-pointer hover:bg-surface-secondary/80 ${isExpanded ? 'bg-surface-secondary/60' : ''}`}
                      onClick={() => setExpandedSessionId(isExpanded ? null : session.id)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-text-muted">
                          {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-sm font-bold text-text-primary">Session #{getSessionNumber(session.id)}</h3>
                            {isLive && (
                              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-success/10 text-success border border-success/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></span> Recording
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-text-secondary font-medium">
                            Today · {timeString}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-8 text-right">
                        <div>
                          <p className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider mb-0.5">Events</p>
                          <p className="text-sm font-bold text-text-primary">{sEvents.length}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider mb-0.5">Apps</p>
                          <p className="text-sm font-bold text-text-primary">{uniqueApps}</p>
                        </div>
                      </div>
                    </div>

                    {/* Timeline Expansion */}
                    {isExpanded && renderTimeline(sEvents)}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <InspectModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </div>
  );
}
