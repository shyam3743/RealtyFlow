import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip
} from "recharts";

interface LeadSourceChartProps {
  data: Array<{ source: string; count: number }>;
}

const COLORS = [
  '#1E40AF',
  '#059669',
  '#F59E0B',
  '#9333EA',
  '#EF4444',
  '#06B6D4'
];

export default function LeadSourceChart({ data }: LeadSourceChartProps) {
  const chartData = useMemo(() => {
    return data.map((item, index) => ({
      name: item.source.replace('_', ' ').toUpperCase(),
      value: item.count,
      fill: COLORS[index % COLORS.length]
    }));
  }, [data]);

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip />
          <Legend 
            position="bottom"
            wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
