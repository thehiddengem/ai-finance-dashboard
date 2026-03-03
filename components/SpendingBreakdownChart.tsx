"use client";

import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { ResponsiveContainer, PieChart, Pie, Tooltip } from "recharts";

type Datum = { name: string; value: number; fill?: string };

type Props = {
  data: Datum[];
};

const CHART_MARGIN = { top: 8, right: 8, bottom: 8, left: 8 };

function formatCurrency(value: number) {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function SpendingBreakdownChart({ data }: Props) {
  // ✅ Prevent "width(-1) height(-1)" measuring loop by rendering after mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const total = useMemo(
    () => data.reduce((sum, d) => sum + (Number(d.value) || 0), 0),
    [data]
  );

  const top = useMemo(() => {
    const sorted = [...data].sort(
      (a, b) => (Number(b.value) || 0) - (Number(a.value) || 0)
    );
    return sorted.slice(0, 5).map((d) => ({
      ...d,
      pct: total > 0 ? Math.round(((Number(d.value) || 0) / total) * 100) : 0,
    }));
  }, [data, total]);

  const tooltipFormatter = useCallback((value: unknown, name: unknown) => {
    const n =
      typeof value === "number"
        ? value
        : typeof value === "string"
        ? Number(value)
        : 0;
    const label = typeof name === "string" ? name : "";
    return [formatCurrency(Number.isFinite(n) ? n : 0), label];
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
      {/* Donut */}
      <div className="md:col-span-2 min-w-0">
        <div className="w-full">
          {mounted ? (
            <ResponsiveContainer width="100%" aspect={1.8}>
              <PieChart margin={CHART_MARGIN}>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius="88%"
                  innerRadius="58%"
                  paddingAngle={2}
                  stroke="transparent"
                  isAnimationActive
                />
               <Tooltip
                  formatter={tooltipFormatter}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid rgba(0,0,0,0.08)",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.10)",
                    padding: "10px 12px",
                  }}
                  itemStyle={{ padding: 0 }}
                  labelStyle={{ fontWeight: 600 }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 rounded-lg bg-gray-50" />
          )}
        </div>
      </div>

      {/* Top categories list */}
      <div className="md:col-span-1 min-w-0">
        <div className="text-sm text-gray-500 mb-2">Top categories</div>

        <div className="space-y-3">
          {top.map((item) => (
            <div key={item.name} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: item.fill ?? "#111827" }}
                />
                <span className="text-sm text-gray-800 truncate">{item.name}</span>
              </div>

              <div className="text-right shrink-0">
                <div className="text-sm font-medium text-gray-900">
                  {formatCurrency(Number(item.value) || 0)}
                </div>
                <div className="text-xs text-gray-500">{item.pct}%</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-lg bg-gray-50 p-3">
          <div className="text-xs text-gray-500">Total expenses</div>
          <div className="text-base font-semibold text-gray-900">
            {formatCurrency(total)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(SpendingBreakdownChart);