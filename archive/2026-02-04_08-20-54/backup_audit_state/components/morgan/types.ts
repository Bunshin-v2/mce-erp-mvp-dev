export interface MorganProject {
  id: string;
  name: string;
  code: string;
  location: string;
  progress: number;
  value: number;
  status: 'CONSTRUCTION' | 'ACTIVE' | 'ONGOING' | 'COMPLETED';
  risk: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface MorganMetric {
  label: string;
  value: string | number;
  trend?: number;
  status?: 'success' | 'warning' | 'danger' | 'neutral';
  subtext?: string;
}
