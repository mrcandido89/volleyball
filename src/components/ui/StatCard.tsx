import { Card } from "@/components/ui/Card";

type StatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
};

export function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <Card className="space-y-2 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="text-2xl font-semibold text-slate-100">{value}</p>
      {hint ? <p className="text-xs text-slate-400">{hint}</p> : null}
    </Card>
  );
}
