import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

interface PipelineChartProps {
  data: Array<{ status: string; count: number }>;
}

export default function PipelineChart({ data }: PipelineChartProps) {
  const chartData = useMemo(() => {
    const statusOrder = ['new', 'contacted', 'site_visit', 'negotiation', 'booking', 'sale'];
    const statusColors = {
      new: '#1E40AF',
      contacted: '#3B82F6',
      site_visit: '#9333EA',
      negotiation: '#F59E0B',
      booking: '#059669',
      sale: '#22C55E'
    };

    return statusOrder.map(status => {
      const item = data.find(d => d.status === status);
      return {
        name: status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        count: item?.count || 0,
        fill: statusColors[status as keyof typeof statusColors]
      };
    });
  }, [data]);

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#8884d8" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
