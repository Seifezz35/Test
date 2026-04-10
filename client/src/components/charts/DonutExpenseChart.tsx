import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { PieDatum } from "@/types";

const COLORS = ["#F59E0B", "#FB923C", "#FCD34D", "#FDBA74"];

export const DonutExpenseChart = ({ data }: { data: PieDatum[] }) => (
  <div className="h-64 rounded-[1.75rem] border border-white/10 bg-white/5 p-4">
    <div className="mb-2">
      <h3 className="text-sm font-semibold text-white">الدخل مقابل المصاريف</h3>
      <p className="text-xs text-slate-400">مقارنة سريعة بين الداخل والخارج من الفترة المختارة</p>
    </div>
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} dataKey="value" innerRadius={55} outerRadius={82} paddingAngle={4}>
          {data.map((entry, index) => (
            <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  </div>
);
