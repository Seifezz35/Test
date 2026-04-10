import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export const MonthlyTrendChart = ({
  data
}: {
  data: { month: string; netProfit: number; trips: number }[];
}) => (
  <div className="h-72 rounded-[1.75rem] border border-white/10 bg-white/5 p-4">
    <div className="mb-4">
      <h3 className="text-sm font-semibold text-white">الترند الشهري</h3>
      <p className="text-xs text-slate-400">كيف يتغير الربح الكلي عبر الشهور</p>
    </div>
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid stroke="rgba(148, 163, 184, 0.15)" vertical={false} />
        <XAxis dataKey="month" tick={{ fill: "#cbd5e1", fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
        <Tooltip />
        <Line type="monotone" dataKey="netProfit" stroke="#F59E0B" strokeWidth={3} dot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);
