"use client";

import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Colors that look good in both light and dark modes, prioritizing contrast
const COLORS = ["#4f46e5", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

interface ChartProps {
  title: string;
  data: Record<string, string | number>[];
}

export function RegistrationsLineChart({ title, data }: ChartProps) {
  const { resolvedTheme: theme } = useTheme();
  const textColor = theme === "dark" ? "#e2e8f0" : "#334155";
  const gridColor = theme === "dark" ? "#334155" : "#e2e8f0";

  return (
    <Card className="h-full border border-border shadow-soft">
      <CardHeader>
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px] w-full pb-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis dataKey="name" stroke={textColor} fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke={textColor} fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: theme === "dark" ? "#0f172a" : "#fff", borderColor: gridColor, color: textColor, borderRadius: "8px" }}
              itemStyle={{ color: COLORS[0] }}
            />
            <Line type="monotone" dataKey="users" stroke={COLORS[0]} strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function EnrollmentsAreaChart({ title, data }: ChartProps) {
  const { resolvedTheme: theme } = useTheme();
  const textColor = theme === "dark" ? "#e2e8f0" : "#334155";
  const gridColor = theme === "dark" ? "#334155" : "#e2e8f0";

  return (
    <Card className="h-full border border-border shadow-soft">
      <CardHeader>
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px] w-full pb-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorEnrollments" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS[1]} stopOpacity={0.3} />
                <stop offset="95%" stopColor={COLORS[1]} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis dataKey="name" stroke={textColor} fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke={textColor} fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: theme === "dark" ? "#0f172a" : "#fff", borderColor: gridColor, color: textColor, borderRadius: "8px" }}
            />
            <Area type="monotone" dataKey="enrollments" stroke={COLORS[1]} strokeWidth={3} fillOpacity={1} fill="url(#colorEnrollments)" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function CourseEnrollmentsBarChart({ title, data }: ChartProps) {
  const { resolvedTheme: theme } = useTheme();
  const textColor = theme === "dark" ? "#e2e8f0" : "#334155";
  const gridColor = theme === "dark" ? "#334155" : "#e2e8f0";

  return (
    <Card className="h-full border border-border shadow-soft">
      <CardHeader>
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px] w-full pb-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis dataKey="name" stroke={textColor} fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke={textColor} fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip
              cursor={{ fill: theme === "dark" ? "#1e293b" : "#f8fafc" }}
              contentStyle={{ backgroundColor: theme === "dark" ? "#0f172a" : "#fff", borderColor: gridColor, color: textColor, borderRadius: "8px" }}
            />
            <Bar dataKey="enrollments" fill={COLORS[2]} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function CompletionRatesBarChart({ title, data }: ChartProps) {
  const { resolvedTheme: theme } = useTheme();
  const textColor = theme === "dark" ? "#e2e8f0" : "#334155";
  const gridColor = theme === "dark" ? "#334155" : "#e2e8f0";

  return (
    <Card className="h-full border border-border shadow-soft">
      <CardHeader>
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px] w-full pb-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
            <XAxis type="number" domain={[0, 100]} stroke={textColor} fontSize={12} tickLine={false} axisLine={false} />
            <YAxis type="category" dataKey="name" stroke={textColor} fontSize={11} tickLine={false} axisLine={false} width={80} />
            <Tooltip
              cursor={{ fill: theme === "dark" ? "#1e293b" : "#f8fafc" }}
              contentStyle={{ backgroundColor: theme === "dark" ? "#0f172a" : "#fff", borderColor: gridColor, color: textColor, borderRadius: "8px" }}
            />
            <Bar dataKey="rate" fill={COLORS[0]} radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function AudienceDistributionPieChart({ title, data }: ChartProps) {
  const { resolvedTheme: theme } = useTheme();
  const textColor = theme === "dark" ? "#e2e8f0" : "#334155";
  const gridColor = theme === "dark" ? "#334155" : "#e2e8f0";

  return (
    <Card className="h-full border border-border shadow-soft">
      <CardHeader>
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px] w-full pb-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: theme === "dark" ? "#0f172a" : "#fff", borderColor: gridColor, color: textColor, borderRadius: "8px" }}
            />
            <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: "12px", color: textColor }} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
