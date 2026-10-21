export interface ToolStep {
  id: string;
  step_index: number;
  tool_name: string;
  arguments: Record<string, any>;
  description: string;
  risk_tier: "READ_ONLY" | "LOW" | "HIGH_DESTRUCTIVE";
  status: "PENDING" | "AWAITING_APPROVAL" | "APPROVED" | "EXECUTING" | "COMPLETED" | "FAILED" | "SKIPPED";
  approval?: {
    id: string;
    status: string;
  };
  error_message?: string;
}

export interface VerificationResult {
  step_id: string;
  target_path: string;
  method: string;
  expected: string;
  actual: string;
  passed: boolean;
}

export interface ProofOfWorkReceipt {
  receipt_id: string;
  task_id: string;
  prompt: string;
  workspace_path: string;
  model_used: string;
  created_at: string;
  completed_at: string;
  planned_steps_count: number;
  approved_steps_count: number;
  executed_steps_count: number;
  verified_steps_count: number;
  verification_results: VerificationResult[];
  wall_clock_ms: number;
  model_latency_ms: number;
  manual_time_avoided_minutes: number;
  status: string;
}

export interface Task {
  id: string;
  prompt: string;
  workspace_path: string;
  autonomy_mode: "REVIEW_ALL" | "SAFE_AUTO" | "DRY_RUN";
  status: "PENDING" | "PLANNING" | "AWAITING_APPROVAL" | "EXECUTING" | "COMPLETED" | "FAILED" | "CANCELLED";
  model_used: string;
  wall_time_ms: number;
  created_at: string;
  completed_at?: string;
  steps: ToolStep[];
  receipt?: ProofOfWorkReceipt;
}

export interface Routine {
  id: string;
  name: string;
  description: string;
  version: number;
  created_at: string;
  steps_count: number;
}

export interface RadarFinding {
  id: string;
  title: string;
  category: string;
  impact: "LOW" | "MEDIUM" | "HIGH";
  urgency: "LOW" | "MEDIUM" | "HIGH";
  estimated_minutes: number;
  reason: string;
  suggested_prompt: string;
}

export interface RadarReport {
  workspace_path: string;
  health_score: number;
  total_findings: number;
  findings: RadarFinding[];
}
