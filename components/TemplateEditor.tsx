"use client";

import { Fragment, useMemo, useState } from "react";
import type { BudgetLineType } from "../types/budget";
import type { TemplateRow } from "../utils/template";

type Props = {
  rows: TemplateRow[];
  onChange: (rows: TemplateRow[]) => void;
  person1Label: string;
  person2Label: string;
};

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function toNumber(value: string) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function formatCurrency(value: number) {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function sectionLabel(type: BudgetLineType) {
  if (type === "income") return "INCOME";
  if (type === "expense") return "EXPENSES";
  return "SAVINGS";
}

function rowTotal(r: TemplateRow) {
  return (Number(r.person1) || 0) + (Number(r.person2) || 0);
}

export default function TemplateEditor({
  rows,
  onChange,
  person1Label,
  person2Label,
}: Props) {
  const [type, setType] = useState<BudgetLineType>("expense");
  const [category, setCategory] = useState("");
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [isShared, setIsShared] = useState(false);

  const canAdd = category.trim().length > 0;

  const addRow = () => {
    if (!canAdd) return;

    const next: TemplateRow[] = [
      ...rows,
      {
        id: uid(),
        type,
        category: category.trim(),
        person1: toNumber(p1),
        person2: toNumber(p2),
        isShared,
      },
    ];

    onChange(next);
    setCategory("");
    setP1("");
    setP2("");
    setIsShared(false);
  };

  const grouped = useMemo(() => {
    const order: BudgetLineType[] = ["income", "expense", "savings"];
    const byType = new Map<BudgetLineType, TemplateRow[]>();
    for (const t of order) byType.set(t, []);

    for (const r of rows) {
      const list = byType.get(r.type) ?? [];
      list.push(r);
      byType.set(r.type, list);
    }

    for (const [t, list] of byType.entries()) {
      list.sort((a, b) => a.category.localeCompare(b.category));
      byType.set(t, list);
    }

    return order.map((t) => ({ type: t, rows: byType.get(t) ?? [] }));
  }, [rows]);

  const totals = useMemo(() => {
    const sum = (t: BudgetLineType) => {
      const r = rows.filter((x) => x.type === t);
      const p1Total = r.reduce((s, x) => s + (Number(x.person1) || 0), 0);
      const p2Total = r.reduce((s, x) => s + (Number(x.person2) || 0), 0);
      return { p1: p1Total, p2: p2Total, total: p1Total + p2Total };
    };

    const income = sum("income");
    const expense = sum("expense");
    const savings = sum("savings");

    const net = {
      p1: income.p1 - expense.p1 - savings.p1,
      p2: income.p2 - expense.p2 - savings.p2,
    };

    return { income, expense, savings, net, netTotal: net.p1 + net.p2 };
  }, [rows]);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Budget Table</h2>
        <p className="text-sm text-gray-500">Excel-style entry.</p>
      </div>

      {/* Add row */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-4">
        <select
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20"
          value={type}
          onChange={(e) => setType(e.target.value as BudgetLineType)}
        >
          <option value="income">Income</option>
          <option value="expense">Expense</option>
          <option value="savings">Savings</option>
        </select>

        <input
          className="border rounded-lg px-3 py-2 text-sm md:col-span-2 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
          placeholder="Category (e.g., Rent/Mortgage)"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />

        <input
          className="border rounded-lg px-3 py-2 text-sm text-right tabular-nums focus:outline-none focus:ring-2 focus:ring-gray-900/20"
          placeholder={person1Label}
          inputMode="decimal"
          value={p1}
          onChange={(e) => setP1(e.target.value)}
        />

        <input
          className="border rounded-lg px-3 py-2 text-sm text-right tabular-nums focus:outline-none focus:ring-2 focus:ring-gray-900/20"
          placeholder={person2Label}
          inputMode="decimal"
          value={p2}
          onChange={(e) => setP2(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && canAdd) {
              e.preventDefault();
              addRow();
            }
          }}
        />

        <label className="flex items-center gap-2 text-sm text-gray-700 md:justify-end">
          <input
            type="checkbox"
            checked={isShared}
            onChange={(e) => setIsShared(e.target.checked)}
          />
          Shared?
        </label>
      </div>

      <button
        type="button"
        disabled={!canAdd}
        onClick={addRow}
        className="mb-6 rounded-lg bg-gray-900 text-white px-4 py-2 text-sm font-medium hover:bg-gray-800 disabled:opacity-60"
      >
        Add Row
      </button>

      {/* Table (NOT scrollable) */}
      <div className="rounded-lg border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white">
            <tr className="text-left text-gray-500 border-b">
              <th className="py-2 px-3">Category</th>
              <th className="py-2 px-3">{person1Label}</th>
              <th className="py-2 px-3">{person2Label}</th>
              <th className="py-2 px-3 text-center">Shared?</th>
              <th className="py-2 px-3 text-right">Total</th>
              <th className="py-2 px-3"></th>
            </tr>
          </thead>

          <tbody>
            {grouped.map((group) => {
              const groupTotals =
                group.type === "income"
                  ? totals.income
                  : group.type === "expense"
                  ? totals.expense
                  : totals.savings;

              return (
                <Fragment key={`group-${group.type}`}>
                  {/* Section header */}
                  <tr className="bg-gray-50">
                    <td colSpan={6} className="py-3 px-3 text-xs font-semibold text-gray-600">
                      {sectionLabel(group.type)}
                    </td>
                  </tr>

                  {group.rows.map((r) => (
                    <tr key={r.id} className="border-b last:border-b-0 hover:bg-gray-50">
                      <td className="py-3 px-3">{r.category}</td>

                      <td className="py-3 px-3">
                        <input
                          className="border rounded-lg px-2 py-1 w-28 text-right tabular-nums focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                          inputMode="decimal"
                          value={String(r.person1 ?? 0)}
                          onChange={(e) => {
                            const v = toNumber(e.target.value);
                            onChange(rows.map((x) => (x.id === r.id ? { ...x, person1: v } : x)));
                          }}
                        />
                      </td>

                      <td className="py-3 px-3">
                        <input
                          className="border rounded-lg px-2 py-1 w-28 text-right tabular-nums focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                          inputMode="decimal"
                          value={String(r.person2 ?? 0)}
                          onChange={(e) => {
                            const v = toNumber(e.target.value);
                            onChange(rows.map((x) => (x.id === r.id ? { ...x, person2: v } : x)));
                          }}
                        />
                      </td>

                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={Boolean(r.isShared)}
                          onChange={(e) => {
                            onChange(
                              rows.map((x) =>
                                x.id === r.id ? { ...x, isShared: e.target.checked } : x
                              )
                            );
                          }}
                        />
                      </td>

                      <td className="py-3 px-3 text-right tabular-nums font-medium">
                        {formatCurrency(rowTotal(r))}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          className="text-xs text-gray-600 hover:text-gray-900"
                          onClick={() => onChange(rows.filter((x) => x.id !== r.id))}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}

                  {/* Group total row */}
                  <tr className="bg-white">
                    <td className="py-3 px-3 font-semibold">
                      TOTAL {sectionLabel(group.type)}
                    </td>
                    <td className="py-3 px-3 font-semibold tabular-nums">
                      {formatCurrency(groupTotals.p1)}
                    </td>
                    <td className="py-3 px-3 font-semibold tabular-nums">
                      {formatCurrency(groupTotals.p2)}
                    </td>
                    <td className="py-3 px-3 text-center text-gray-400">—</td>
                    <td className="py-3 px-3 text-right font-bold tabular-nums">
                      {formatCurrency(groupTotals.total)}
                    </td>
                    <td className="py-3 px-3" />
                  </tr>
                </Fragment>
              );
            })}

            {/* NET row */}
            <tr className="bg-white">
              <td className="py-4 px-3 font-semibold">NET</td>
              <td className="py-4 px-3 font-semibold tabular-nums">
                {formatCurrency(totals.net.p1)}
              </td>
              <td className="py-4 px-3 font-semibold tabular-nums">
                {formatCurrency(totals.net.p2)}
              </td>
              <td className="py-4 px-3 text-center text-gray-400">—</td>
              <td className="py-4 px-3 text-right font-bold tabular-nums">
                {formatCurrency(totals.netTotal)}
              </td>
              <td className="py-4 px-3" />
            </tr>

            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="py-6 px-3 text-sm text-gray-500">
                  No rows yet. Add your first row above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-500 mt-3">
        Tip: Press <span className="font-medium">Enter</span> in the last amount field to quickly
        add a row.
      </p>
    </div>
  );
}