import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { PieDatum } from "@/types";

const COLORS = ["#F59E0B", "#F97316", "#FDBA74", "#FDE68A"];

export const PlatformSplitChart = ({ data }: { data: PieDatum[] }) => (
  <div className="h-64 rounded-[1.75rem] border border-white/10 bg-white/5 p-4">
    <div className="mb-2">
      <h3 className="text-sm font-semibold text-white">توزيع التطبيقات</h3>
      <p className="text-xs text-slate-400">نسبة الرحلات بين Uber وCareem وInDrive</p>
    </div>
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} dataKey="value" outerRadius={85}>
          {data.map((entry, index) => (
            <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  </div>
);
