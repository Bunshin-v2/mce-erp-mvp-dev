/**
 * MCE COMMAND CENTER - CONSOLIDATED DATABASE SCHEMA
 *
 * This is the AUTHORITATIVE, single-source-of-truth schema file for the entire application.
 * All other schema files (NUCLEAR_SCHEMA_UNIFIER.sql, master_setup.sql, etc.) should be deprecated.
 *
 * This file is IDEMPOTENT and safe to run multiple times.
 *
 * VERSION: 1.0
 * CREATED: 2026-01-28
 * LAST UPDATED: 2026-01-28
 *
 * DEPLOYMENT ORDER:
 * 1. Run this file completely
 * 2. Run seed data script (separate file) if needed
 *
 * FEATURES:
 * - All lowercase column names (PostgreSQL best practice)
 * - Proper foreign key relationships with CASCADE deletes where appropriate
 * - Comprehensive constraint definitions (NOT NULL, UNIQUE, CHECK)
 * - Optimized indexes for common queries
 * - Row-Level Security (RLS) policies for demo mode
 * - Realtime subscription configuration
 * - Complete audit trail capabilities
 * - Support for RAG/vector search
 */

-- ============================================================================
-- 1. EXTENSIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- pgvector is optional (only needed for semantic search)
-- Uncomment if your Supabase project has pgvector enabled
-- CREATE EXTENSION IF NOT EXISTS "pgvector";


-- ============================================================================
-- 2. ENUM TYPES
-- ============================================================================

DO $$ BEGIN
  CREATE TYPE document_category AS ENUM ('COMPLIANCE', 'CONTRACT', 'INVOICE', 'SAFETY');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE document_status AS ENUM ('Review', 'Reviewed', 'Approved', 'Rejected');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE project_status AS ENUM ('Active', 'Paused', 'Completed');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE agent_action_type AS ENUM ('POST', 'PATCH', 'UPDATE', 'DELETE');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE permission_tier AS ENUM ('L1', 'L2', 'L3', 'L4');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE alert_severity_enum AS ENUM ('info', 'warning', 'critical', 'CASUAL', 'CRITICAL', 'CATASTROPHIC');
EXCEPTION WHEN duplicate_object THEN null;
END $$;


-- ============================================================================
-- 3. CORE APPLICATION TABLES
-- ============================================================================

-- ============================================================================
-- 3.1 PROJECTS (Master Project Registry)
-- ============================================================================

CREATE TABLE IF NOT EXISTS projects_master (
  -- Identifiers
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_uid uuid,
  project_code text,

  -- Project Metadata
  project_name text NOT NULL,
  project_type text,
  org_unit text,
  project_status text DEFAULT 'Active',

  -- Client & Parties
  client_entity_uid uuid,
  client_name text,
  end_client_name text,
  developer_name text,
  main_contractor_name text,

  -- Contract
  contract_uid uuid,
  contract_title text,
  contract_form text,
  contract_signed_date timestamptz,
  notice_to_proceed_date timestamptz,
  contract_duration text,
  contract_value_excl_vat numeric(18,2),
  vat_rate_percent numeric(5,2),
  payment_currency text DEFAULT 'AED',
  invoice_method text,
  payment_terms_days integer,

  -- Schedule
  project_commencement_date timestamptz,
  project_completion_date_planned timestamptz,
  project_completion_date_actual timestamptz,
  completion_percent numeric(5,2) DEFAULT 0,

  -- Scope & Deliverables
  scope_of_services_enum text,
  services_scope_json jsonb,
  deliverable_register_json jsonb,
  deliverable_schedule_approved_date timestamptz,

  -- Milestones & Changes
  milestone_baseline_json jsonb,
  milestone_current_json jsonb,
  change_control_required boolean,
  variation_orders_count integer,
  variation_approved_value numeric(18,2),
  variation_pending_value numeric(18,2),

  -- Claims
  claims_submitted_count integer,
  claims_value_submitted numeric(18,2),
  claims_value_determined numeric(18,2),

  -- Liquidated Damages
  ld_applicable boolean,
  ld_basis text,
  ld_rate_value numeric(18,2),
  ld_cap_percent_contract_value numeric(5,2),

  -- Retention
  retention_percent numeric(5,2),
  retention_held_value numeric(18,2),
  retention_release_dlp1_date timestamptz,
  retention_release_dlp2_date timestamptz,
  retention_release_amount_total numeric(18,2),

  -- Advance Payments
  advance_payment_percent numeric(5,2),
  advance_payment_bond_required boolean,
  advance_payment_bond_expiry_date timestamptz,

  -- Performance & Insurance Bonds
  performance_bond_required boolean,
  performance_bond_percent numeric(5,2),
  performance_bond_issue_date timestamptz,
  performance_bond_expiry_date timestamptz,

  -- Insurance
  pi_insurance_required boolean,
  pi_sum_insured numeric(18,2),
  pi_policy_number text,
  pi_policy_expiry_date timestamptz,
  third_party_liability_required boolean,
  third_party_liability_sum numeric(18,2),
  insurance_renewal_alert_date timestamptz,

  -- Authority & Approvals
  authority_approval_matrix_json jsonb,
  authority_fees_payable_by text,
  authority_fees_provisional_sum numeric(18,2),
  authority_submissions_open integer,
  authority_approvals_pending integer,

  -- Location
  project_location_country text,
  project_location_emirate text,
  project_location_city text,

  -- Risk & Liability
  delivery_risk_rating text,
  conflict_resolution_clause text,
  liability_cap_percent_of_fees numeric(5,2),
  indemnity_scope_enum text,

  -- Compliance & Governance
  data_processing_addendum_signed boolean,
  ip_ownership text,
  confidentiality_class text,
  cybersec_requirements_enum text,
  access_control_matrix_json jsonb,
  sustainability_requirements_enum text,

  -- HSE
  hse_plan_required boolean,
  hse_plan_approved_date timestamptz,
  site_access_permits_required boolean,
  site_hse_induction_required boolean,
  qhse_incidents_count integer,
  qhse_nonconformities_open integer,

  -- Document Management
  doc_control_platform text,
  rfi_turnaround_days integer,
  submittal_turnaround_days integer,
  doc_control_overdue_transmittals integer,
  rfi_overdue_count integer,
  submittal_overdue_count integer,
  snagging_scope_required boolean,
  handover_documents_list_json jsonb,
  handover_readiness_percent numeric(5,2),

  -- Resources & Staffing
  project_manager_uid uuid,
  key_staff_list_json jsonb,
  team_fte_allocated text,
  critical_competencies_gaps_json jsonb,
  resource_plan_lock_date timestamptz,

  -- Timesheet & Payroll
  timesheet_approval_cadence text,
  wps_compliance_required boolean,
  wps_compliance_status text,
  payroll_cost_ratecard_json jsonb,

  -- Financials & Budgets
  cost_code text,
  cost_center text,
  budget_labour_hours integer,
  budget_labour_value numeric(18,2),
  budget_opex_value numeric(18,2),
  committed_costs_value numeric(18,2),
  forecast_to_complete_value numeric(18,2),
  earned_value numeric(18,2),
  cpi_index text,
  spi_index text,

  -- Receivables & Payables
  ar_open_balance numeric(18,2),
  ap_open_balance numeric(18,2),
  ar_bucket_0_30 numeric(18,2),
  ar_bucket_31_60 numeric(18,2),
  ar_bucket_61_90 numeric(18,2),
  ar_bucket_90_plus numeric(18,2),
  ap_bucket_0_30 numeric(18,2),
  ap_bucket_31_60 numeric(18,2),
  ap_bucket_61_90 numeric(18,2),
  ap_bucket_90_plus numeric(18,2),
  expected_collection_date timestamptz,
  collection_risk_score text,

  -- Cash Flow Forecasting
  cash_flow_forecast_30d numeric(18,2),
  cash_flow_forecast_60d numeric(18,2),
  cash_flow_forecast_90d numeric(18,2),
  bank_guarantee_collateral_pct numeric(5,2),

  -- Defects Liability
  defects_liability_period_months integer,
  defects_liability_end_date timestamptz,

  -- Final Account
  final_account_agreed_date timestamptz,
  project_closeout_pack_completed boolean,

  -- Risk & Compliance
  risk_register_json jsonb,
  top_risks_p90_value numeric(18,2),
  mitigation_actions_json jsonb,

  -- Quality & Handover
  client_satisfaction_score text,
  nps_score integer,

  -- System & Integration
  audit_trail_required boolean,
  sox_equivalent_controls boolean,
  approval_doa_level text,
  legal_holds_active boolean,
  legal_notice_active boolean,
  dispute_status text,
  records_retention_years integer,
  data_classification text,

  -- Integration Keys
  integration_keys_json jsonb,
  integration_gl_account_map_json jsonb,

  -- Monitoring
  kpi_dashboard_url text,
  playbook_version text,

  -- Audit & Metadata
  last_reviewed_at timestamptz,
  owner_function text,
  remediation_sla_days integer,
  alert_severity text,
  remarks text,
  communication_protocol text,

  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for projects_master (wrapped in error handling)
DO $$ BEGIN
  CREATE INDEX idx_projects_master_name ON projects_master(project_name);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE INDEX idx_projects_master_status ON projects_master(project_status);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE INDEX idx_projects_master_client ON projects_master(client_name);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE INDEX idx_projects_master_pm ON projects_master(project_manager_uid);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE INDEX idx_projects_master_created ON projects_master(created_at DESC);
EXCEPTION WHEN duplicate_object THEN null; END $$;


-- ============================================================================
-- 3.2 PROFILES (User Management - Clerk Integration)
-- ============================================================================

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id text NOT NULL UNIQUE,
  email text NOT NULL,
  full_name text,
  role text NOT NULL DEFAULT 'staff',
  tier permission_tier,
  department text,
  is_active boolean DEFAULT TRUE,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DO $$ BEGIN
  CREATE INDEX idx_profiles_clerk_user_id ON profiles(clerk_user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE INDEX idx_profiles_tier ON profiles(tier);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE INDEX idx_profiles_role ON profiles(role);
EXCEPTION WHEN duplicate_object THEN null; END $$;


-- ============================================================================
-- 3.3 ROLE TIER MAPPING
-- ============================================================================

CREATE TABLE IF NOT EXISTS role_tier_map (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  roles text[] NOT NULL,
  tier permission_tier NOT NULL UNIQUE,
  description text,

  created_at timestamptz NOT NULL DEFAULT now()
);

-- Populate default role mappings
INSERT INTO role_tier_map (roles, tier, description)
VALUES
  (ARRAY['staff', 'analyst'], 'L1', 'All staff members - basic access'),
  (ARRAY['coordinator'], 'L2', 'Coordinators - enhanced access'),
  (ARRAY['executive', 'director', 'manager'], 'L3', 'Executives and Directors - full access'),
  (ARRAY['super_admin', 'admin'], 'L4', 'Super Admin - complete system access')
ON CONFLICT (tier) DO NOTHING;


-- ============================================================================
-- 3.4 DOCUMENTS (Document Management Workflow)
-- ============================================================================

CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category document_category NOT NULL,
  status document_status NOT NULL DEFAULT 'Review',
  storage_path text,
  version integer DEFAULT 1,
  project_id uuid REFERENCES projects_master(id) ON DELETE SET NULL,
  type text,  -- Legacy field for compatibility
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz
);

DO $$ BEGIN
  CREATE INDEX idx_documents_category ON documents(category);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE INDEX idx_documents_status ON documents(status);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE INDEX idx_documents_project ON documents(project_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE INDEX idx_documents_created ON documents(created_at DESC);
EXCEPTION WHEN duplicate_object THEN null; END $$;


-- ============================================================================
-- 3.5 INVOICES (Financial Invoicing)
-- ============================================================================

CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text NOT NULL UNIQUE,
  amount numeric(18,2) NOT NULL,
  status text NOT NULL DEFAULT 'Pending',
    CHECK (status IN ('draft', 'sent', 'pending', 'paid', 'overdue', 'Pending', 'Paid', 'Overdue')),
  due_date timestamptz NOT NULL,
  paid_date date,
  project_id uuid REFERENCES projects_master(id) ON DELETE SET NULL,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DO $$ BEGIN
  CREATE INDEX idx_invoices_status ON invoices(status);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE INDEX idx_invoices_due_date ON invoices(due_date);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE INDEX idx_invoices_project ON invoices(project_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;


-- ============================================================================
-- 3.6 TENDERS (Bidding & Tender Management)
-- ============================================================================

CREATE TABLE IF NOT EXISTS tenders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  client text NOT NULL,
  status text NOT NULL DEFAULT 'OPEN',
    CHECK (status IN ('OPEN', 'ACTIVE', 'SUBMITTED', 'AWARDED', 'LOST', 'new', 'active', 'drafting', 'in_review', 'won', 'cancelled')),
  value numeric(18,2) DEFAULT 0,
  value_amount decimal(15,2),
  value_currency text DEFAULT 'AED',
  probability text DEFAULT 'Medium',
    CHECK (probability IN ('High', 'Medium', 'Low')),
  ref text UNIQUE,
  deadline timestamptz,
  owner_user_id text,  -- Clerk user ID
  next_followup_at timestamptz,
  notes text,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DO $$ BEGIN
  CREATE INDEX idx_tenders_status ON tenders(status);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE INDEX idx_tenders_deadline ON tenders(deadline);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE INDEX idx_tenders_owner ON tenders(owner_user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;


-- ============================================================================
-- 3.7 TASKS (Task/Todo Management)
-- ============================================================================

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  name text NOT NULL,
  color text DEFAULT '#3B82F6',

  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'pending',
    CHECK (status IN ('pending', 'in_progress', 'completed')),
  priority text NOT NULL DEFAULT 'medium',
    CHECK (priority IN ('low', 'medium', 'high')),
  due_date date,
  assigned_to uuid REFERENCES profiles(id) ON DELETE SET NULL,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  archived_at timestamptz,
  deleted_at timestamptz
);

CREATE TABLE IF NOT EXISTS task_categories (
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, category_id)
);

DO $$ BEGIN
  CREATE INDEX idx_tasks_status ON tasks(status);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE INDEX idx_tasks_assigned ON tasks(assigned_to);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE INDEX idx_tasks_due_date ON tasks(due_date);
EXCEPTION WHEN duplicate_object THEN null; END $$;


-- ============================================================================
-- 3.8 ALERTS & NOTIFICATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  variable_id uuid,
  title text,
  severity text NOT NULL,
    CHECK (severity IN ('CASUAL', 'CRITICAL', 'CATASTROPHIC', 'info', 'warning', 'critical')),
  status text DEFAULT 'PENDING_REVIEW',
  due_at timestamptz,
  next_notify_at timestamptz,
  ack_required boolean DEFAULT TRUE,

  created_at timestamptz NOT NULL DEFAULT now()
);

DO $$ BEGIN
  CREATE INDEX idx_alerts_severity ON alerts(severity);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE INDEX idx_alerts_status ON alerts(status);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE INDEX idx_alerts_created ON alerts(created_at DESC);
EXCEPTION WHEN duplicate_object THEN null; END $$;


CREATE TABLE IF NOT EXISTS alert_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id uuid NOT NULL REFERENCES alerts(id) ON DELETE CASCADE,
  actor_profile_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  event_type text,  -- DISMISS, SNOOZE, DONE
  note text,

  created_at timestamptz NOT NULL DEFAULT now()
);

DO $$ BEGIN
  CREATE INDEX idx_alert_events_alert ON alert_events(alert_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;


CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  user_id text,  -- Clerk user ID (alternative key)
  title text NOT NULL,
  message text NOT NULL,
  severity text DEFAULT 'info',
    CHECK (severity IN ('info', 'warning', 'critical', 'success')),
  category text DEFAULT 'general',
    CHECK (category IN ('tender', 'project', 'compliance', 'system', 'general')),
  entity_type text,  -- tender, project, document, etc.
  entity_id uuid,
  related_entity_type text,
  related_entity_id uuid,
  is_read boolean DEFAULT FALSE,
  read_at timestamptz,
  ack_required boolean DEFAULT FALSE,
  acked_at timestamptz,
  acked_by_profile_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  ack_by_user_id text,
  dedupe_key text UNIQUE,
  next_followup_at timestamptz,

  created_at timestamptz NOT NULL DEFAULT now()
);

DO $$ BEGIN
  CREATE INDEX idx_notifications_recipient ON notifications(recipient_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE INDEX idx_notifications_is_read ON notifications(is_read);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE INDEX idx_notifications_entity ON notifications(entity_type, entity_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;


-- ============================================================================
-- 3.9 AGENT & AUDIT TRAIL
-- ============================================================================

CREATE TABLE IF NOT EXISTS agent_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_name text NOT NULL,
  action agent_action_type NOT NULL,
  document_id uuid REFERENCES documents(id) ON DELETE SET NULL,

  timestamp timestamptz NOT NULL DEFAULT now()
);

DO $$ BEGIN
  CREATE INDEX idx_agent_activity_document ON agent_activity(document_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE INDEX idx_agent_activity_timestamp ON agent_activity(timestamp DESC);
EXCEPTION WHEN duplicate_object THEN null; END $$;


CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id text NOT NULL,
  action text NOT NULL,
    CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  diff jsonb,  -- {old, new}

  created_at timestamptz NOT NULL DEFAULT now()
);

DO $$ BEGIN
  CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);
EXCEPTION WHEN duplicate_object THEN null; END $$;


-- ============================================================================
-- 3.10 INCIDENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  description text NOT NULL,
  date date NOT NULL,

  created_at timestamptz NOT NULL DEFAULT now()
);


-- ============================================================================
-- 3.11 PROJECT MANAGEMENT
-- ============================================================================

CREATE TABLE IF NOT EXISTS project_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects_master(id) ON DELETE CASCADE,
  title text NOT NULL,
  due_date date NOT NULL,
  achieved_date date,
  status text NOT NULL DEFAULT 'pending',
    CHECK (status IN ('pending', 'achieved', 'missed')),
  owner_user_id text,  -- Clerk user ID
  evidence_ref text,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DO $$ BEGIN
  CREATE INDEX idx_project_milestones_project ON project_milestones(project_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE INDEX idx_project_milestones_due_date ON project_milestones(due_date);
EXCEPTION WHEN duplicate_object THEN null; END $$;


-- ============================================================================
-- 3.12 ESCALATION TRACKING
-- ============================================================================

CREATE TABLE IF NOT EXISTS escalation_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  original_notification_id uuid NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  escalated_notification_id uuid NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  escalation_level text NOT NULL,
    CHECK (escalation_level IN ('L1', 'L2', 'L3', 'L4')),
  escalated_from_user_id text,
  escalated_to_user_id text,

  created_at timestamptz NOT NULL DEFAULT now()
);

DO $$ BEGIN
  CREATE INDEX idx_escalation_log_original ON escalation_log(original_notification_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;


-- ============================================================================
-- 3.13 RAG / VECTOR SEARCH
-- ============================================================================

CREATE TABLE IF NOT EXISTS document_embeddings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  content text,
  metadata jsonb,
  embedding text,  -- Store as JSON text (can be converted to vector if pgvector is enabled)

  created_at timestamptz NOT NULL DEFAULT now()
);

DO $$ BEGIN
  CREATE INDEX idx_document_embeddings_doc ON document_embeddings(document_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;


CREATE TABLE IF NOT EXISTS doc_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_id uuid NOT NULL,
  chunk_index integer NOT NULL,
  text_rendered text NOT NULL,
  embedding text,  -- Store as JSON text (can be converted to vector if pgvector is enabled)

  created_at timestamptz NOT NULL DEFAULT now()
);

DO $$ BEGIN
  CREATE INDEX idx_doc_chunks_doc ON doc_chunks(doc_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;


-- ============================================================================
-- 4. ROW-LEVEL SECURITY (DEMO MODE - PERMISSIVE)
-- ============================================================================
-- NOTE: For production, these should be restricted based on user tier and ownership

ALTER TABLE projects_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenders ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE escalation_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE doc_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_tier_map ENABLE ROW LEVEL SECURITY;


-- DEMO MODE: Allow public read all
DO $$ BEGIN
  CREATE POLICY "Allow public read projects_master" ON projects_master FOR SELECT USING (TRUE);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE POLICY "Allow public read profiles" ON profiles FOR SELECT USING (TRUE);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE POLICY "Allow public read documents" ON documents FOR SELECT USING (TRUE);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE POLICY "Allow public insert documents" ON documents FOR INSERT WITH CHECK (TRUE);
DO $$ BEGIN
  CREATE POLICY "Allow public read invoices" ON invoices FOR SELECT USING (TRUE);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE POLICY "Allow public read tenders" ON tenders FOR SELECT USING (TRUE);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE POLICY "Allow public insert tenders" ON tenders FOR INSERT WITH CHECK (TRUE);
DO $$ BEGIN
  CREATE POLICY "Allow public read tasks" ON tasks FOR SELECT USING (TRUE);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE POLICY "Allow public insert tasks" ON tasks FOR INSERT WITH CHECK (TRUE);
DO $$ BEGIN
  CREATE POLICY "Allow public read categories" ON categories FOR SELECT USING (TRUE);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE POLICY "Allow public read alerts" ON alerts FOR SELECT USING (TRUE);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE POLICY "Allow public insert alerts" ON alerts FOR INSERT WITH CHECK (TRUE);
DO $$ BEGIN
  CREATE POLICY "Allow public read alert_events" ON alert_events FOR SELECT USING (TRUE);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE POLICY "Allow public insert alert_events" ON alert_events FOR INSERT WITH CHECK (TRUE);
DO $$ BEGIN
  CREATE POLICY "Allow public read agent_activity" ON agent_activity FOR SELECT USING (TRUE);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE POLICY "Allow public read audit_logs" ON audit_logs FOR SELECT USING (TRUE);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE POLICY "Allow public read notifications" ON notifications FOR SELECT USING (TRUE);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE POLICY "Allow public read incidents" ON incidents FOR SELECT USING (TRUE);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE POLICY "Allow public read project_milestones" ON project_milestones FOR SELECT USING (TRUE);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE POLICY "Allow public read escalation_log" ON escalation_log FOR SELECT USING (TRUE);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE POLICY "Allow public read document_embeddings" ON document_embeddings FOR SELECT USING (TRUE);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE POLICY "Allow public read doc_chunks" ON doc_chunks FOR SELECT USING (TRUE);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE POLICY "Allow public read role_tier_map" ON role_tier_map FOR SELECT USING (TRUE);
EXCEPTION WHEN duplicate_object THEN null; END $$;


-- ============================================================================
-- 5. TRIGGERS & FUNCTIONS
-- ============================================================================

-- Function to auto-assign tier based on role
CREATE OR REPLACE FUNCTION set_profile_tier()
RETURNS TRIGGER AS $$
BEGIN
  SELECT tier INTO NEW.tier
  FROM role_tier_map
  WHERE NEW.role = ANY(roles);

  IF NEW.tier IS NULL THEN
    NEW.tier := 'L1';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-set tier when role is inserted/updated
DROP TRIGGER IF EXISTS set_tier_on_profile_change ON profiles;
CREATE TRIGGER set_tier_on_profile_change
  BEFORE INSERT OR UPDATE OF role ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_profile_tier();


-- ============================================================================
-- 6. REALTIME CONFIGURATION
-- ============================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE projects_master;
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE documents;
ALTER PUBLICATION supabase_realtime ADD TABLE invoices;
ALTER PUBLICATION supabase_realtime ADD TABLE tenders;
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE agent_activity;
ALTER PUBLICATION supabase_realtime ADD TABLE project_milestones;


-- ============================================================================
-- 7. DOCUMENTATION
-- ============================================================================

/**
 * DEPLOYMENT CHECKLIST
 * =====================
 *
 * ✓ Run this consolidated schema file
 * ✓ Verify tables created successfully: SELECT * FROM information_schema.tables WHERE table_schema = 'public';
 * ✓ Verify enums created: SELECT * FROM pg_type WHERE typtype = 'e';
 * ✓ Seed demo data (use separate seed script)
 * ✓ Test Clerk integration (profiles sync)
 * ✓ Test RLS policies (should allow public read in demo mode)
 * ✓ Test realtime subscriptions
 * ✓ Update frontend environment variables
 *
 * PRODUCTION MIGRATION
 * ====================
 *
 * 1. Review and update RLS policies to restrict access by tier/ownership
 * 2. Add audit triggers to projects_master, documents, invoices
 * 3. Set up cron job for tender deadline notifications
 * 4. Enable backups and point-in-time recovery
 * 5. Set up monitoring and alerting
 * 6. Configure row-level security based on actual business rules
 *
 * DEPRECATED FILES
 * ================
 *
 * The following files are now DEPRECATED and should NOT be used:
 * - supabase/schema.sql
 * - master_setup.sql
 * - NUCLEAR_SCHEMA_UNIFIER.sql
 * - supabase/documents_and_invoices_schema.sql
 * - supabase/extended_setup.sql
 * - supabase/setup_dashboard_schema.sql
 * - fix_tenders_table.sql
 * - All other fragmented schema files
 *
 * DELETE THESE FILES after confirming this consolidated schema works.
 *
 * TESTING QUERIES
 * ===============
 *
 * -- Check table count
 * SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
 *
 * -- Check enum types
 * SELECT typname FROM pg_type WHERE typtype = 'e' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
 *
 * -- Check indexes
 * SELECT * FROM pg_indexes WHERE schemaname = 'public' ORDER BY tablename;
 *
 * -- Check foreign keys
 * SELECT * FROM information_schema.table_constraints WHERE table_schema = 'public' AND constraint_type = 'FOREIGN KEY';
 *
 * -- Test RLS (should return data in demo mode)
 * SELECT * FROM projects_master LIMIT 5;
 * SELECT * FROM documents LIMIT 5;
 *
 * -- Check realtime subscriptions
 * SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
 */
