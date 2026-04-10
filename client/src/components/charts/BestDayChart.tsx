import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export const BestDayChart = ({ data }: { data: { day: string; value: number }[] }) => (
  <div className="h-72 rounded-[1.75rem] border border-white/10 bg-white/5 p-4">
    <div className="mb-4">
      <h3 className="text-sm font-semibold text-white">أفضل يوم في الأسبوع</h3>
      <p className="text-xs text-slate-400">متوسط صافي الربح حسب اليوم</p>
    </div>
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <XAxis dataKey="day" tick={{ fill: "#cbd5e1", fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
        <Tooltip />
        <Bar dataKey="value" fill="#F59E0B" radius={[12, 12, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);
