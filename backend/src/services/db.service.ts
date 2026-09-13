import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ============================================================
// Supabase Client Initialization
// ============================================================
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'SUPABASE_URL and SUPABASE_ANON_KEY must be set in your .env file. ' +
    'See backend/.env.example for configuration.'
  );
}

const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);
console.log('Supabase client initialized:', supabaseUrl);

// ============================================================
// TypeScript Interfaces (unchanged — preserves all API contracts)
// ============================================================

export interface AiAnalysisResult {
  workflowName: string;
  summary: string;
  whyAutomate: string;
  automationPotential: number;
  recommendedAction: string;
  estimatedTimeSaving: string;
  confidence: number;
  insights: any[];
  automationPlan: {
    steps: any[];
    humanApprovalSteps: string[];
    reasoning: string;
  };
}

export interface ObservationSession {
  id: string;
  startedAt: string;
  endedAt?: string;
  status: 'Recording' | 'Completed';
  durationInSeconds: number;
  eventCount: number;
}

export interface Workflow {
  id: string;
  name: string;
  status: 'Recorded' | 'Analyzed' | 'Automated';
  createdAt: string;
  durationInSeconds: number;
  eventCount: number;
}

export interface WorkflowEvent {
  id: string;
  workflowId?: string;
  sessionId?: string;
  timestamp: string;
  application: 'Gmail' | 'Spreadsheet' | 'Report' | string;
  action: string;
  target: string;
  metadata?: Record<string, any>;
}

export interface AutomationStep {
  type: string;
  originalAction?: string;
  action?: string;
  target?: string;
  value?: string;
  url?: string;
  key?: string;
}

export interface AutomationPlan {
  id: string;
  name: string;
  workflowId: string;
  trigger: { type: string };
  steps: AutomationStep[];
  status: 'Draft' | 'Approved';
  version: number;
  confidence: number;
  estimatedManualDuration: number;
  timeSavedPerRun: number;
  successRate: number;
  executionCount: number;
  averageDuration: number;
  applications: string[];
  variables: string[];
  intent?: string;
}

export interface StepResult {
  step: string;
  status: 'Pending' | 'Running' | 'WaitingForApproval' | 'Completed' | 'Failed' | 'Recovering' | 'Verifying' | 'Cancelled';
  originalAction?: string;
  recoveryReason?: string;
}

export interface ExecutionRun {
  runId: string;
  automationId: string;
  status: 'Running' | 'WaitingForApproval' | 'WaitingForUser' | 'Completed' | 'Failed' | 'Recovering' | 'Verifying' | 'Cancelled';
  currentStepIndex: number;
  stepResults: StepResult[];
  context?: Record<string, any>;
  startedAt: number;
  completedAt?: number;
  timeSaved?: number;
}

// ============================================================
// Row mapping helpers (DB snake_case <-> TS camelCase)
// ============================================================

function rowToSession(row: any): ObservationSession {
  return {
    id: row.id,
    startedAt: row.started_at,
    endedAt: row.ended_at ?? undefined,
    status: row.status,
    durationInSeconds: row.duration_in_seconds,
    eventCount: row.event_count,
  };
}

function sessionToRow(s: ObservationSession) {
  return {
    id: s.id,
    started_at: s.startedAt,
    ended_at: s.endedAt ?? null,
    status: s.status,
    duration_in_seconds: s.durationInSeconds,
    event_count: s.eventCount,
  };
}

function rowToWorkflow(row: any): Workflow {
  return {
    id: row.id,
    name: row.name,
    status: row.status,
    createdAt: row.created_at,
    durationInSeconds: row.duration_in_seconds,
    eventCount: row.event_count,
  };
}

function workflowToRow(w: Workflow) {
  return {
    id: w.id,
    name: w.name,
    status: w.status,
    created_at: w.createdAt,
    duration_in_seconds: w.durationInSeconds,
    event_count: w.eventCount,
  };
}

function rowToEvent(row: any): WorkflowEvent {
  return {
    id: row.id,
    workflowId: row.workflow_id ?? undefined,
    sessionId: row.session_id ?? undefined,
    timestamp: row.timestamp,
    application: row.application,
    action: row.action,
    target: row.element_name ?? row.target ?? '',
    metadata: row.metadata ?? {},
  };
}

function eventToRow(e: WorkflowEvent) {
  return {
    id: e.id,
    workflow_id: e.workflowId ?? null,
    session_id: e.sessionId ?? null,
    timestamp: e.timestamp,
    application: e.application,
    action: e.action,
    element_name: e.target ?? null,
    metadata: e.metadata ?? {},
  };
}

function rowToAutomation(row: any): AutomationPlan {
  return {
    id: row.id,
    name: row.name,
    workflowId: row.workflow_id,
    trigger: row.trigger,
    steps: row.steps,
    status: row.status,
    version: row.version,
    confidence: Number(row.confidence),
    estimatedManualDuration: row.estimated_manual_duration,
    timeSavedPerRun: row.time_saved_per_run,
    successRate: Number(row.success_rate),
    executionCount: row.execution_count,
    averageDuration: row.average_duration,
    applications: row.applications ?? [],
    variables: row.variables ?? [],
    intent: row.intent ?? undefined,
  };
}

function automationToRow(p: AutomationPlan) {
  return {
    id: p.id,
    name: p.name,
    workflow_id: p.workflowId,
    trigger: p.trigger,
    steps: p.steps,
    status: p.status,
    version: p.version,
    confidence: p.confidence,
    estimated_manual_duration: p.estimatedManualDuration,
    time_saved_per_run: p.timeSavedPerRun,
    success_rate: p.successRate,
    execution_count: p.executionCount,
    average_duration: p.averageDuration,
    applications: p.applications,
    variables: p.variables,
    intent: p.intent ?? null,
  };
}

function rowToExecution(row: any): ExecutionRun {
  return {
    runId: row.run_id,
    automationId: row.automation_id,
    status: row.status,
    currentStepIndex: row.current_step_index,
    stepResults: row.step_results ?? [],
    context: row.context ?? {},
    startedAt: row.started_at,
    completedAt: row.completed_at ?? undefined,
    timeSaved: row.time_saved ?? undefined,
  };
}

function executionToRow(r: ExecutionRun) {
  return {
    run_id: r.runId,
    automation_id: r.automationId,
    status: r.status,
    current_step_index: r.currentStepIndex,
    step_results: r.stepResults,
    context: r.context ?? {},
    started_at: r.startedAt,
    completed_at: r.completedAt ?? null,
    time_saved: r.timeSaved ?? null,
  };
}

// ============================================================
// Helper: throw on Supabase errors
// ============================================================
function assertNoError(error: any, context: string) {
  if (error) {
    console.error(`[DbService] Supabase error in ${context}:`, error.message);
    throw new Error(`Supabase ${context} failed: ${error.message}`);
  }
}

// ============================================================
// In-memory runtime state (not persisted — intentional)
// ============================================================
let activeSessionId: string | null = null;

// ============================================================
// DbService — Supabase PostgreSQL implementation
// ============================================================
export class DbService {

  // ----------------------------------------------------------
  // Active session tracking (runtime only, not DB-persisted)
  // ----------------------------------------------------------

  getActiveWorkflowId(): string | null {
    return activeSessionId;
  }

  setActiveWorkflowId(id: string | null): void {
    activeSessionId = id;
  }

  // ----------------------------------------------------------
  // Workflows
  // ----------------------------------------------------------

  async saveWorkflow(workflow: Workflow): Promise<void> {
    const { error } = await supabase
      .from('workflows')
      .upsert(workflowToRow(workflow), { onConflict: 'id' });
    assertNoError(error, 'saveWorkflow');
  }

  async getWorkflows(): Promise<Workflow[]> {
    const { data, error } = await supabase
      .from('workflows')
      .select('*')
      .order('created_at', { ascending: false });
    assertNoError(error, 'getWorkflows');
    return (data ?? []).map(rowToWorkflow);
  }

  // ----------------------------------------------------------
  // Observation Sessions
  // ----------------------------------------------------------

  async saveSession(session: ObservationSession): Promise<void> {
    const { error } = await supabase
      .from('observation_sessions')
      .upsert(sessionToRow(session), { onConflict: 'id' });
    assertNoError(error, 'saveSession');
  }

  async getSessionById(sessionId: string): Promise<ObservationSession | null> {
    const { data, error } = await supabase
      .from('observation_sessions')
      .select('*')
      .eq('id', sessionId)
      .maybeSingle();
    assertNoError(error, 'getSessionById');
    return data ? rowToSession(data) : null;
  }

  async getSessions(): Promise<ObservationSession[]> {
    const { data, error } = await supabase
      .from('observation_sessions')
      .select('*')
      .order('started_at', { ascending: false });
    assertNoError(error, 'getSessions');
    return (data ?? []).map(rowToSession);
  }

  // ----------------------------------------------------------
  // Workflow Events
  // ----------------------------------------------------------

  async saveEvents(events: WorkflowEvent[]): Promise<void> {
    if (events.length === 0) return;
    const rows = events.map(eventToRow);
    const { error } = await supabase
      .from('workflow_events')
      .upsert(rows, { onConflict: 'id' });
    assertNoError(error, 'saveEvents');
  }

  async getEventsByWorkflowId(workflowId: string): Promise<WorkflowEvent[]> {
    const { data, error } = await supabase
      .from('workflow_events')
      .select('*')
      .eq('workflow_id', workflowId);
    assertNoError(error, 'getEventsByWorkflowId');
    return (data ?? []).map(rowToEvent);
  }

  async getEventsBySessionId(sessionId: string): Promise<WorkflowEvent[]> {
    const { data, error } = await supabase
      .from('workflow_events')
      .select('*')
      .eq('session_id', sessionId)
      .order('timestamp', { ascending: true });
    assertNoError(error, 'getEventsBySessionId');
    return (data ?? []).map(rowToEvent);
  }

  async getAllEvents(): Promise<WorkflowEvent[]> {
    const { data, error } = await supabase
      .from('workflow_events')
      .select('*')
      .order('timestamp', { ascending: false });
    assertNoError(error, 'getAllEvents');
    return (data ?? []).map(rowToEvent);
  }

  // ----------------------------------------------------------
  // Automation Plans
  // ----------------------------------------------------------

  async saveAutomation(plan: AutomationPlan): Promise<void> {
    const { error } = await supabase
      .from('automation_plans')
      .upsert(automationToRow(plan), { onConflict: 'id' });
    assertNoError(error, 'saveAutomation');
  }

  async getAutomationById(planId: string): Promise<AutomationPlan | null> {
    const { data, error } = await supabase
      .from('automation_plans')
      .select('*')
      .eq('id', planId)
      .maybeSingle();
    assertNoError(error, 'getAutomationById');
    return data ? rowToAutomation(data) : null;
  }

  async getAllAutomations(): Promise<AutomationPlan[]> {
    const { data, error } = await supabase
      .from('automation_plans')
      .select('*');
    assertNoError(error, 'getAllAutomations');
    return (data ?? []).map(rowToAutomation);
  }

  async deleteAutomation(planId: string): Promise<void> {
    // Execution runs have ON DELETE CASCADE in the schema, so deleting the plan is enough.
    const { error } = await supabase
      .from('automation_plans')
      .delete()
      .eq('id', planId);
    assertNoError(error, 'deleteAutomation');
  }

  // ----------------------------------------------------------
  // Execution Runs
  // ----------------------------------------------------------

  async saveExecutionRun(run: ExecutionRun): Promise<void> {
    const { error } = await supabase
      .from('execution_runs')
      .upsert(executionToRow(run), { onConflict: 'run_id' });
    assertNoError(error, 'saveExecutionRun');
  }

  async getExecutionRun(runId: string): Promise<ExecutionRun | null> {
    const { data, error } = await supabase
      .from('execution_runs')
      .select('*')
      .eq('run_id', runId)
      .maybeSingle();
    assertNoError(error, 'getExecutionRun');
    return data ? rowToExecution(data) : null;
  }

  async getLatestCompletedExecution(automationId: string): Promise<ExecutionRun | null> {
    const { data, error } = await supabase
      .from('execution_runs')
      .select('*')
      .eq('automation_id', automationId)
      .eq('status', 'Completed')
      .order('completed_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    assertNoError(error, 'getLatestCompletedExecution');
    return data ? rowToExecution(data) : null;
  }

  async getAllExecutions(): Promise<ExecutionRun[]> {
    const { data, error } = await supabase
      .from('execution_runs')
      .select('*')
      .order('started_at', { ascending: false });
    assertNoError(error, 'getAllExecutions');
    return (data ?? []).map(rowToExecution);
  }

  // ----------------------------------------------------------
  // Application Settings & AI Analysis Cache
  // ----------------------------------------------------------

  async getObservationSettings(): Promise<{ active: boolean }> {
    const { data, error } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'observation')
      .maybeSingle();
    assertNoError(error, 'getObservationSettings');
    return (data?.value as { active: boolean }) ?? { active: false };
  }

  async saveObservationSettings(settings: { active: boolean }): Promise<void> {
    const { error } = await supabase
      .from('app_settings')
      .upsert({ key: 'observation', value: settings, updated_at: new Date().toISOString() }, { onConflict: 'key' });
    assertNoError(error, 'saveObservationSettings');
  }

  async saveAiAnalysis(analysis: AiAnalysisResult): Promise<void> {
    const { error } = await supabase
      .from('app_settings')
      .upsert({ key: 'ai_analysis', value: analysis, updated_at: new Date().toISOString() }, { onConflict: 'key' });
    assertNoError(error, 'saveAiAnalysis');
  }

  async getAiAnalysis(): Promise<AiAnalysisResult | null> {
    const { data, error } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'ai_analysis')
      .maybeSingle();
    assertNoError(error, 'getAiAnalysis');
    return data ? (data.value as AiAnalysisResult) : null;
  }

  // ----------------------------------------------------------
  // Clear all observation data (used when starting a fresh session)
  // ----------------------------------------------------------

  async clearObservationData(): Promise<void> {
    // Delete in order: events → sessions → workflows (FK constraints respected)
    const { error: evErr } = await supabase.from('workflow_events').delete().neq('id', '');
    assertNoError(evErr, 'clearObservationData:events');

    const { error: sessErr } = await supabase.from('observation_sessions').delete().neq('id', '');
    assertNoError(sessErr, 'clearObservationData:sessions');

    const { error: wfErr } = await supabase.from('workflows').delete().neq('id', '');
    assertNoError(wfErr, 'clearObservationData:workflows');

    // Also clear cached AI analysis
    const { error: aiErr } = await supabase
      .from('app_settings')
      .delete()
      .eq('key', 'ai_analysis');
    assertNoError(aiErr, 'clearObservationData:ai_analysis');
  }
}
