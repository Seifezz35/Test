import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type ProfitBreakdownChartProps = {
  title: string;
  subtitle: string;
  data: { label: string; value: number }[];
};

export const ProfitBreakdownChart = ({
  title,
  subtitle,
  data
}: ProfitBreakdownChartProps) => (
  <div className="h-72 rounded-[1.75rem] border border-white/10 bg-white/5 p-4">
    <div className="mb-4">
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <p className="text-xs text-slate-400">{subtitle}</p>
    </div>
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <XAxis dataKey="label" tick={{ fill: "#cbd5e1", fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
        <Tooltip />
        <Bar dataKey="value" fill="#FB923C" radius={[12, 12, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);
