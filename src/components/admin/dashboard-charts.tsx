"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const COLORS = ["#2f6f64", "#e67a35", "#4b7bec", "#20bf6b", "#eb3b5a", "#a55eea", "#778ca3", "#f7b731"];

export function OrdersByDayChart({ data }: { data: { date: string; orders: number; sales: number }[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Bar dataKey="orders" fill="#2f6f64" radius={[6, 6, 0, 0]} name="Commandes" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function StatusPieChart({ data }: { data: { status: string; count: number }[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} dataKey="count" nameKey="status" outerRadius={100} label>
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
