-- ============================================================
-- TRACE / WorkTwin — Supabase PostgreSQL Database Schema
-- Migration: 20260913000000_initial_trace_schema.sql
-- ============================================================

-- 1. Observation Sessions
CREATE TABLE IF NOT EXISTS public.observation_sessions (
    id VARCHAR(255) PRIMARY KEY,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    status VARCHAR(50) NOT NULL DEFAULT 'Recording',
    duration_in_seconds INTEGER NOT NULL DEFAULT 0,
    event_count INTEGER NOT NULL DEFAULT 0
);

-- Index for session queries ordered by start time
CREATE INDEX IF NOT EXISTS idx_observation_sessions_started_at ON public.observation_sessions (started_at DESC);
CREATE INDEX IF NOT EXISTS idx_observation_sessions_status ON public.observation_sessions (status);

-- 2. Workflows
CREATE TABLE IF NOT EXISTS public.workflows (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Recorded',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    duration_in_seconds INTEGER NOT NULL DEFAULT 0,
    event_count INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_workflows_created_at ON public.workflows (created_at DESC);

-- 3. Workflow Events (Telemetry)
CREATE TABLE IF NOT EXISTS public.workflow_events (
    id VARCHAR(255) PRIMARY KEY,
    workflow_id VARCHAR(255),
    session_id VARCHAR(255) REFERENCES public.observation_sessions(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    application VARCHAR(255) NOT NULL,
    window_title TEXT,
    action VARCHAR(100) NOT NULL,
    element_name TEXT,
    element_type VARCHAR(100),
    x INTEGER,
    y INTEGER,
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_workflow_events_session_id ON public.workflow_events (session_id);
CREATE INDEX IF NOT EXISTS idx_workflow_events_workflow_id ON public.workflow_events (workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_events_timestamp ON public.workflow_events (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_workflow_events_action ON public.workflow_events (action);

-- 4. Automation Plans
CREATE TABLE IF NOT EXISTS public.automation_plans (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    workflow_id VARCHAR(255),
    trigger JSONB NOT NULL DEFAULT '{"type": "manual"}'::jsonb,
    steps JSONB NOT NULL DEFAULT '[]'::jsonb,
    status VARCHAR(50) NOT NULL DEFAULT 'Draft',
    version INTEGER NOT NULL DEFAULT 1,
    confidence NUMERIC DEFAULT 95,
    estimated_manual_duration INTEGER NOT NULL DEFAULT 0,
    time_saved_per_run INTEGER NOT NULL DEFAULT 0,
    success_rate NUMERIC DEFAULT 100,
    execution_count INTEGER DEFAULT 0,
    average_duration INTEGER DEFAULT 0,
    applications JSONB DEFAULT '[]'::jsonb,
    variables JSONB DEFAULT '[]'::jsonb,
    intent TEXT
);

CREATE INDEX IF NOT EXISTS idx_automation_plans_status ON public.automation_plans (status);

-- 5. Execution Runs
CREATE TABLE IF NOT EXISTS public.execution_runs (
    run_id VARCHAR(255) PRIMARY KEY,
    automation_id VARCHAR(255) REFERENCES public.automation_plans(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'Running',
    current_step_index INTEGER NOT NULL DEFAULT 0,
    step_results JSONB NOT NULL DEFAULT '[]'::jsonb,
    context JSONB DEFAULT '{}'::jsonb,
    started_at BIGINT NOT NULL,
    completed_at BIGINT,
    time_saved INTEGER
);

CREATE INDEX IF NOT EXISTS idx_execution_runs_automation_id ON public.execution_runs (automation_id);
CREATE INDEX IF NOT EXISTS idx_execution_runs_status ON public.execution_runs (status);
CREATE INDEX IF NOT EXISTS idx_execution_runs_started_at ON public.execution_runs (started_at DESC);

-- 6. Application Settings & AI Caching
CREATE TABLE IF NOT EXISTS public.app_settings (
    key VARCHAR(255) PRIMARY KEY,
    value JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Row Level Security (RLS) Policies
-- ============================================================

ALTER TABLE public.observation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.execution_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Full access policies for application backend and authenticated/anon roles
CREATE POLICY "Public full access to observation_sessions" ON public.observation_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access to workflows" ON public.workflows FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access to workflow_events" ON public.workflow_events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access to automation_plans" ON public.automation_plans FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access to execution_runs" ON public.execution_runs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access to app_settings" ON public.app_settings FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- Seed Demo Data
-- ============================================================

INSERT INTO public.automation_plans (
    id, name, workflow_id, trigger, status, version, confidence,
    estimated_manual_duration, time_saved_per_run, success_rate, execution_count,
    average_duration, applications, variables, intent, steps
) VALUES (
    'auto_demo_sales',
    'Weekly Sales Report',
    'wf_demo',
    '{"type": "manual"}'::jsonb,
    'Approved',
    3,
    96,
    272,
    260,
    98,
    14,
    12,
    '["Excel", "Email"]'::jsonb,
    '["current_week"]'::jsonb,
    'Run my weekly sales report',
    '[
        {"type": "receive_weekly_sales_email"},
        {"type": "download_sales_csv"},
        {"type": "open_spreadsheet"},
        {"type": "clean_invalid_rows"},
        {"type": "calculate_total_sales"},
        {"type": "calculate_average_order_value"},
        {"type": "update_management_report"},
        {"type": "generate_summary"},
        {"type": "human_approval", "originalAction": "send_summary"}
    ]'::jsonb
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.app_settings (key, value) VALUES (
    'observation',
    '{"active": false}'::jsonb
) ON CONFLICT (key) DO NOTHING;
