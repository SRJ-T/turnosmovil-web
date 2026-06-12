import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://ctdxqijdmpigqgktlwxb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0ZHhxaWpkbXBpZ3Fna3Rsd3hiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5NDg3NTksImV4cCI6MjA5NjUyNDc1OX0.fztm3egC654RiC_dSKn1AuVT8fWH_zE463sfP9Fzpj8'
);

export function stripTz(t: string | null | undefined): string {
  if (!t) return '';
  return t.replace(/([+-]\d{2}:\d{2}|Z)$/, '');
}

export function fmtTime(dateStr: string, timeStr: string | null | undefined): string {
  if (!timeStr) return '';
  const clean = stripTz(timeStr);
  const dt = clean.includes('T') ? new Date(clean) : new Date(`${dateStr}T${clean}`);
  if (isNaN(dt.getTime())) return '';
  return dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export function diffHours(clockIn: string, clockOut: string | null | undefined): number {
  if (!clockOut) return 0;
  const a = new Date(stripTz(clockIn));
  const b = new Date(stripTz(clockOut));
  return Math.max(0, (b.getTime() - a.getTime()) / 3_600_000);
}
