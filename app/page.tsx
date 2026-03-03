"use client";

import { useEffect, useMemo, useState } from "react";
import SpendingBreakdownChart from "../components/SpendingBreakdownChart";
import TemplateEditor from "../components/TemplateEditor";
import PeopleSettingsPanel from "../components/PeopleSetting"

import { loadTemplate, saveTemplate, defaultTemplate } from "../utils/template";
import type { TemplateRow } from "../utils/template";

import {
  loadPeopleSettings,
  defaultPeopleSettings,
  type PeopleSettings,
} from "../utils/settings";

function formatCurrency(amount: number) {
  return amount.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

const COLORS = [
  "#3B82F6", // blue
  "#22C55E", // green
  "#F59E0B", // amber
  "#A855F7", // purple
  "#EF4444", // red
  "#06B6D4", // cyan
  "#F97316", // orange
  "#84CC16", // lime
  "#EC4899", // pink
  "#6366F1", // indigo
];

function getCurrentMonthLabel() {
  const now = new Date();
  return now.toLocaleString("en-US", { month: "long", year: "numeric" });
}

function num(v: unknown) {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function sumType(rows: TemplateRow[], type: TemplateRow["type"]) {
  return rows
    .filter((r) => r.type === type)
    .reduce(
      (acc, r) => {
        acc.p1 += num(r.person1);
        acc.p2 += num(r.person2);
        return acc;
      },
      { p1: 0, p2: 0 }
    );
}

function buildExpenseChartData(
  rows: TemplateRow[],
  mode: "household" | "person1" | "person2"
) {
  const expenses = rows.filter((r) => r.type === "expense");
  const map = new Map<string, number>();

  for (const r of expenses) {
    const name = (r.category ?? "").trim() || "Other";

    const value =
      mode === "person1"
        ? num(r.person1)
        : mode === "person2"
        ? num(r.person2)
        : num(r.person1) + num(r.person2);

    map.set(name, (map.get(name) ?? 0) + value);
  }

  return Array.from(map.entries())
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value], index) => ({
      name,
      value,
      fill: COLORS[index % COLORS.length],
    }));
}

export default function Home() {
  const [rows, setRows] = useState<TemplateRow[]>([]);
  const [people, setPeople] = useState<PeopleSettings>(defaultPeopleSettings());
  const [chartMode, setChartMode] = useState<"household" | "person1" | "person2">(
    "household"
  );

  // ✅ Seed defaults on first run
  useEffect(() => {
    const loadedPeople = loadPeopleSettings();
    setPeople(loadedPeople);

    const saved = loadTemplate();
    if (saved.length > 0) {
      setRows(saved);
    } else {
      const seed = defaultTemplate();
      setRows(seed);
      saveTemplate(seed);
    }
  }, []);

  useEffect(() => {
    if (rows.length > 0) saveTemplate(rows);
  }, [rows]);

  const income = useMemo(() => sumType(rows, "income"), [rows]);
  const expenses = useMemo(() => sumType(rows, "expense"), [rows]);
  const savings = useMemo(() => sumType(rows, "savings"), [rows]);

  const totalIncome = income.p1 + income.p2;
  const totalExpenses = expenses.p1 + expenses.p2;
  const totalSavings = savings.p1 + savings.p2;

  const net = {
    p1: income.p1 - expenses.p1 - savings.p1,
    p2: income.p2 - expenses.p2 - savings.p2,
  };
  const totalNet = net.p1 + net.p2;

  const savingsRate =
    totalIncome > 0 ? ((totalSavings / totalIncome) * 100).toFixed(1) : "0.0";

  // ✅ Product KPI: % of income spent
  const expensePct = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;
  const expensePctLabel = expensePct.toFixed(1);
  const expensePctTone =
    expensePct >= 70
      ? "text-red-600"
      : expensePct >= 50
      ? "text-amber-600"
      : "text-green-600";

  const chartData = useMemo(
    () => buildExpenseChartData(rows, chartMode),
    [rows, chartMode]
  );

  const [insights, setInsights] = useState<{ summary: string; suggestion: string } | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  const handleGenerateInsights = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows, people }),
      });
      const data = await res.json();
      setInsights(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-semibold text-gray-900 mb-1">
        AI-Powered Split Finance Dashboard
      </h1>
      <p className="text-gray-500 text-sm">
  Track income, expenses, and savings for two people — with AI insights.
</p>
      <p className="text-gray-500 mb-6">{getCurrentMonthLabel()}</p>

      {/* TOP: Summary cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-sm text-gray-500">Total Income</h2>
          <p className="text-2xl font-bold">{formatCurrency(totalIncome)}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-sm text-gray-500">Total Expenses</h2>
          <p className="text-2xl font-bold">{formatCurrency(totalExpenses)}</p>

          <p className={`text-sm mt-1 ${expensePctTone}`}>
            {expensePctLabel}% of income spent
          </p>

          <p className="text-sm mt-1 text-gray-400">— vs last month</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-sm text-gray-500">Total Savings</h2>
          <p className="text-2xl font-bold">{formatCurrency(totalSavings)}</p>
          <p className="text-sm text-gray-500 mt-1">Savings Rate: {savingsRate}%</p>
        </div>
      </section>

      {/* TOP: Chart + AI */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl p-6 shadow-sm lg:col-span-2">
          <div className="flex items-start justify-between gap-4 mb-4">
            <h2 className="text-lg font-semibold">Spending Breakdown</h2>

            {/* Animated segmented control */}
            <div className="relative inline-flex rounded-xl border border-gray-200 bg-white p-1">
              <span
                className={`absolute top-1 bottom-1 rounded-lg bg-gray-900 transition-all duration-200 ease-out ${
                  chartMode === "household"
                    ? "left-1 w-[96px]"
                    : chartMode === "person1"
                    ? "left-[100px] w-[88px]"
                    : "left-[192px] w-[88px]"
                }`}
              />

              <button
                type="button"
                onClick={() => setChartMode("household")}
                className={`relative z-10 px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  chartMode === "household" ? "text-white" : "text-gray-700"
                }`}
              >
                Together
              </button>

              <button
                type="button"
                onClick={() => setChartMode("person1")}
                className={`relative z-10 px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  chartMode === "person1" ? "text-white" : "text-gray-700"
                }`}
              >
                {people.person1Name}
              </button>

              <button
                type="button"
                onClick={() => setChartMode("person2")}
                className={`relative z-10 px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  chartMode === "person2" ? "text-white" : "text-gray-700"
                }`}
              >
                {people.person2Name}
              </button>
            </div>
          </div>

          <SpendingBreakdownChart data={chartData} />
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-2">AI Insights</h2>
          <p className="text-sm text-gray-500 mb-4">
            A plain-English summary of your spending patterns.
          </p>

          <div className="rounded-lg bg-gray-50 p-4 min-h-[96px]">
            {insights ? (
              <>
                <p className="text-sm text-gray-700 mb-2">{insights.summary}</p>
                <p className="text-sm text-gray-600">{insights.suggestion}</p>
              </>
            ) : (
              <p className="text-sm text-gray-500">
                Generate AI-powered insights from your spending data.
              </p>
            )}
          </div>

          <button
            onClick={handleGenerateInsights}
            disabled={loading || rows.length === 0}
            className="mt-4 w-full rounded-lg bg-gray-900 text-white py-2 text-sm font-medium hover:bg-gray-800 disabled:opacity-60"
            type="button"
          >
            {loading ? "Generating..." : "Generate Insights"}
          </button>
        </div>
      </section>

      {/* MIDDLE: Person name editor */}
      <div className="mb-6">
        <PeopleSettingsPanel onChange={(s) => setPeople(s)} />
      </div>

      {/* BOTTOM: Excel table */}
      <TemplateEditor
        rows={rows}
        onChange={setRows}
        person1Label={people.person1Name}
        person2Label={people.person2Name}
      />

      {/* Split Summary */}
      <div className="mt-6 bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-3">Split Summary</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="py-2 pr-3">Row</th>
                <th className="py-2 pr-3">{people.person1Name}</th>
                <th className="py-2 pr-3">{people.person2Name}</th>
                <th className="py-2 pr-3">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-3 pr-3 font-medium">Income</td>
                <td className="py-3 pr-3">{formatCurrency(income.p1)}</td>
                <td className="py-3 pr-3">{formatCurrency(income.p2)}</td>
                <td className="py-3 pr-3 font-semibold">{formatCurrency(totalIncome)}</td>
              </tr>
              <tr className="border-b">
                <td className="py-3 pr-3 font-medium">Expenses</td>
                <td className="py-3 pr-3">{formatCurrency(expenses.p1)}</td>
                <td className="py-3 pr-3">{formatCurrency(expenses.p2)}</td>
                <td className="py-3 pr-3 font-semibold">{formatCurrency(totalExpenses)}</td>
              </tr>
              <tr className="border-b">
                <td className="py-3 pr-3 font-medium">Savings</td>
                <td className="py-3 pr-3">{formatCurrency(savings.p1)}</td>
                <td className="py-3 pr-3">{formatCurrency(savings.p2)}</td>
                <td className="py-3 pr-3 font-semibold">{formatCurrency(totalSavings)}</td>
              </tr>
              <tr className="border-t">
                <td className="py-3 pr-3 font-semibold">Net</td>
                <td className="py-3 pr-3 font-semibold">{formatCurrency(net.p1)}</td>
                <td className="py-3 pr-3 font-semibold">{formatCurrency(net.p2)}</td>
                <td className="py-3 pr-3 font-bold">{formatCurrency(totalNet)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-xs text-gray-500 mt-3">
          Net = Income − Expenses − Savings (same as your sheet).
        </p>
      </div>
    </main>
  );
}