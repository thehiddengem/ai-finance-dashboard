import { NextResponse } from "next/server";

type TemplateRow = {
  id: string;
  type: "income" | "expense" | "savings";
  category: string;
  person1: number;
  person2: number;
  isShared: boolean;
};

type PeopleSettings = {
  person1Name: string;
  person2Name: string;
};

function num(v: unknown) {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function sumType(rows: TemplateRow[], type: TemplateRow["type"]) {
  return rows
    .filter((r) => r.type === type)
    .reduce(
      (acc, r) => {
        acc.person1 += num(r.person1);
        acc.person2 += num(r.person2);
        return acc;
      },
      { person1: 0, person2: 0 }
    );
}

function topExpenses(rows: TemplateRow[], limit = 3) {
  const map = new Map<string, number>();
  for (const r of rows) {
    if (r.type !== "expense") continue;
    const k = (r.category ?? "").trim() || "Other";
    const v = num(r.person1) + num(r.person2);
    map.set(k, (map.get(k) ?? 0) + v);
  }
  return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, limit);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const rows: TemplateRow[] = Array.isArray(body?.rows) ? body.rows : [];
  const people: PeopleSettings = body?.people ?? { person1Name: "Person 1", person2Name: "Person 2" };

  const income = sumType(rows, "income");
  const expenses = sumType(rows, "expense");
  const savings = sumType(rows, "savings");

  const totalIncome = income.person1 + income.person2;
  const totalExpenses = expenses.person1 + expenses.person2;
  const totalSavings = savings.person1 + savings.person2;

  const net = {
    person1: income.person1 - expenses.person1 - savings.person1,
    person2: income.person2 - expenses.person2 - savings.person2,
  };
  const totalNet = net.person1 + net.person2;

  const top = topExpenses(rows, 3);

  const summary =
    `${people.person1Name}: Net $${net.person1.toFixed(0)} • ` +
    `${people.person2Name}: Net $${net.person2.toFixed(0)} • ` +
    `Household Net $${totalNet.toFixed(0)}.` +
    (top.length ? ` Top expenses: ${top.map(([k, v]) => `${k} ($${v.toFixed(0)})`).join(", ")}.` : "");

  let suggestion = "Try reviewing your top expense and adjusting one category by 5–10%.";
  if (totalIncome > 0 && totalExpenses / totalIncome > 0.6) {
    suggestion = "Expenses are > 60% of income — reduce your largest expense category first.";
  } else if (totalIncome > 0 && totalSavings / totalIncome >= 0.2) {
    suggestion = "Savings rate is 20%+ — consider automating the savings allocations.";
  } else if (totalNet < 0) {
    suggestion = "Net is negative — reduce expenses or temporarily lower savings allocations.";
  }

  return NextResponse.json({ summary, suggestion });
}