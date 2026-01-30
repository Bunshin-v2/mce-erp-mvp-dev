-- AI Gateway Observability & Control Tables

-- Runtime kill switch / configuration
CREATE TABLE IF NOT EXISTS bot_runtime_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  refuse_all boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Service instance heartbeats ("no doubt" liveness proof)
CREATE TABLE IF NOT EXISTS bot_service_instances (
  instance_id text PRIMARY KEY,
  build_sha text,
  started_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  ready_state boolean NOT NULL DEFAULT false,
  details jsonb NOT NULL DEFAULT '{}'::jsonb
);

-- Health probe reports (cron / external probes)
CREATE TABLE IF NOT EXISTS health_probe_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_at timestamptz NOT NULL DEFAULT now(),
  environment text,
  base_url text,
  status text NOT NULL,
  summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  report jsonb NOT NULL DEFAULT '{}'::jsonb
);

-- Bot audit trail (append-only)
CREATE TABLE IF NOT EXISTS bot_requests (
  request_id uuid PRIMARY KEY,
  received_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,

  tenant_id uuid,
  user_id text,

  outcome text NOT NULL CHECK (outcome IN ('success','refused','degraded','failed')),
  http_status integer NOT NULL,

  index_version_id uuid,
  prompt_template_version text,

  error_code text,
  error_message text,
  error_detail jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_bot_requests_received_at ON bot_requests(received_at DESC);
CREATE INDEX IF NOT EXISTS idx_bot_requests_outcome ON bot_requests(outcome);

CREATE TABLE IF NOT EXISTS bot_retrieval_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES bot_requests(request_id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),

  tenant_id uuid,
  user_id text,
  index_version_id uuid,

  query_hash text,
  retrieval_status text NOT NULL CHECK (retrieval_status IN ('hit','miss','degraded','failed')),
  hit_count integer NOT NULL DEFAULT 0,
  latency_ms integer,
  top_k jsonb NOT NULL DEFAULT '[]'::jsonb,
  failure_reason text
);

CREATE INDEX IF NOT EXISTS idx_bot_retrieval_events_request ON bot_retrieval_events(request_id);
CREATE INDEX IF NOT EXISTS idx_bot_retrieval_events_created ON bot_retrieval_events(created_at DESC);

CREATE TABLE IF NOT EXISTS bot_model_calls (
  call_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES bot_requests(request_id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),

  tenant_id uuid,
  user_id text,
  index_version_id uuid,

  provider text NOT NULL,
  model text,
  operation text NOT NULL CHECK (operation IN ('embed','generate','verify','healthcheck')),
  started_at timestamptz,
  ended_at timestamptz,
  latency_ms integer,
  success boolean NOT NULL DEFAULT false,
  error_code text,
  error_message text,
  error_detail jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_bot_model_calls_request ON bot_model_calls(request_id);
CREATE INDEX IF NOT EXISTS idx_bot_model_calls_created ON bot_model_calls(created_at DESC);
