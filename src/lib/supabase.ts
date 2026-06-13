import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://ctdxqijdmpigqgktlwxb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0ZHhxaWpkbXBpZ3Fna3Rsd3hiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5NDg3NTksImV4cCI6MjA5NjUyNDc1OX0.fztm3egC654RiC_dSKn1AuVT8fWH_zE463sfP9Fzpj8'
);

// Strip timezone suffix and parse as local (owner enters times as local, stored as UTC offset)
export function fmtShiftDt(dt: string | null | undefined): string {
  if (!dt) return '';
  const clean = dt.replace(/\+00(:\d{2})?$/, '').replace(/([+-]\d{2}:\d{2}|Z)$/, '').replace(' ', 'T');
  const d = new Date(clean);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export function diffHours(a: string, b: string | null | undefined): number {
  if (!b) return 0;
  const t1 = new Date(a).getTime();
  const t2 = new Date(b).getTime();
  return Math.max(0, (t2 - t1) / 3_600_000);
}
