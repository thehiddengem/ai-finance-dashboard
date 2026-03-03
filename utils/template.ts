export type BudgetLineType = "income" | "expense" | "savings";

export type TemplateRow = {
  id: string;
  type: BudgetLineType;
  category: string;
  person1: number;
  person2: number;
  isShared: boolean;
};

const TEMPLATE_KEY_V2 = "ai_finance_template_v2";
const TEMPLATE_KEY_V1 = "ai_finance_template_v1";

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

type TemplateItemV1 = {
  id: string;
  type: BudgetLineType;
  category: string;
  who: "person1" | "person2" | "shared";
  amount: number;
};

function normalizeCategory(s: string) {
  return (s ?? "").trim();
}

function migrateV1toV2(items: TemplateItemV1[]): TemplateRow[] {
  const map = new Map<string, TemplateRow>();

  for (const it of items) {
    const type = it.type;
    const category = normalizeCategory(it.category) || "Other";
    const key = `${type}||${category}`;

    const existing =
      map.get(key) ??
      ({
        id: uid(),
        type,
        category,
        person1: 0,
        person2: 0,
        isShared: false,
      } as TemplateRow);

    const amt = Number(it.amount) || 0;

    if (it.who === "person1") existing.person1 += amt;
    else if (it.who === "person2") existing.person2 += amt;
    else {
      existing.isShared = true;
      existing.person1 += amt / 2;
      existing.person2 += amt / 2;
    }

    map.set(key, existing);
  }

  for (const row of map.values()) {
    if (row.person1 > 0 && row.person2 > 0) row.isShared = true;
    row.person1 = Math.round(row.person1 * 100) / 100;
    row.person2 = Math.round(row.person2 * 100) / 100;
  }

  return Array.from(map.values());
}

export function defaultTemplate(): TemplateRow[] {
  // EXACTLY matching your screenshot defaults (full sheet)
  return [
    // ======================
    // INCOME
    // ======================
    {
      id: "i1",
      type: "income",
      category: "Per month",
      person1: 3980,
      person2: 4000,
      isShared: false,
    },
    {
      id: "i2",
      type: "income",
      category: "Bonus",
      person1: 0,
      person2: 0,
      isShared: false,
    },
    {
      id: "i3",
      type: "income",
      category: "Other Income",
      person1: 0,
      person2: 0,
      isShared: false,
    },

    // ======================
    // EXPENSES
    // ======================
    {
      id: "e1",
      type: "expense",
      category: "Rent/Mortgage",
      person1: 950,
      person2: 950,
      isShared: true,
    },
    {
      id: "e2",
      type: "expense",
      category: "Groceries",
      person1: 266.74,
      person2: 390,
      isShared: true,
    },
    {
      id: "e3",
      type: "expense",
      category: "Internet",
      person1: 0,
      person2: 72.25,
      isShared: false,
    },
    {
      id: "e4",
      type: "expense",
      category: "Electric",
      person1: 151,
      person2: 0,
      isShared: false,
    },
    {
      id: "e5",
      type: "expense",
      category: "Gas",
      person1: 151.79,
      person2: 0,
      isShared: false,
    },
    {
      id: "e6",
      type: "expense",
      category: "Car Payment",
      person1: 0,
      person2: 530,
      isShared: false,
    },
    {
      id: "e7",
      type: "expense",
      category: "Student loan",
      person1: 0,
      person2: 500,
      isShared: false,
    },
    {
      id: "e8",
      type: "expense",
      category: "Car Insurance",
      person1: 0,
      person2: 208,
      isShared: false,
    },
    {
      id: "e9",
      type: "expense",
      category: "Pet Insurance",
      person1: 0,
      person2: 15,
      isShared: false,
    },
    {
      id: "e10",
      type: "expense",
      category: "Phone",
      person1: 60,
      person2: 80,
      isShared: true,
    },
    {
      id: "e11",
      type: "expense",
      category: "Subscriptions",
      person1: 45,
      person2: 0,
      isShared: false,
    },
    {
      id: "e12",
      type: "expense",
      category: "Eating Out",
      person1: 100,
      person2: 0,
      isShared: false,
    },
    {
      id: "e13",
      type: "expense",
      category: "Work Lunch",
      person1: 112,
      person2: 0,
      isShared: false,
    },
    {
      id: "e14",
      type: "expense",
      category: "Uber/Transit",
      person1: 50,
      person2: 0,
      isShared: false,
    },
    {
      id: "e15",
      type: "expense",
      category: "Gym",
      person1: 99,
      person2: 99,
      isShared: true,
    },
    {
      id: "e16",
      type: "expense",
      category: "Mom",
      person1: 300,
      person2: 0,
      isShared: false,
    },
    {
      id: "e17",
      type: "expense",
      category: "Coffee",
      person1: 65,
      person2: 0,
      isShared: false,
    },

    // ======================
    // SAVINGS
    // ======================
    {
      id: "s1",
      type: "savings",
      category: "Emergency Fund",
      person1: 1000,
      person2: 0,
      isShared: false,
    },
    {
      id: "s2",
      type: "savings",
      category: "Vacation",
      person1: 0,
      person2: 0,
      isShared: false,
    },
    {
      id: "s3",
      type: "savings",
      category: "Investments",
      person1: 400,
      person2: 500,
      isShared: true,
    },
    {
      id: "s4",
      type: "savings",
      category: "Other Savings",
      person1: 50,
      person2: 0,
      isShared: false,
    },
  ];
}

export function loadTemplate(): TemplateRow[] {
  if (typeof window === "undefined") return [];

  // Try v2 first
  const rawV2 = window.localStorage.getItem(TEMPLATE_KEY_V2);
  const parsedV2 = safeParse<any[]>(rawV2, []);

  if (Array.isArray(parsedV2) && parsedV2.length > 0) {
    // ✅ Migrate old shapes to the new person1/person2 shape
    const migrated: TemplateRow[] = parsedV2.map((r, idx) => {
      const id = typeof r?.id === "string" ? r.id : `m${idx}_${uid()}`;
      const type: BudgetLineType =
        r?.type === "income" || r?.type === "expense" || r?.type === "savings"
          ? r.type
          : "expense";

      const category = (r?.category ?? "").toString().trim() || "Other";

      // Support both new + old fields
      const p1 =
        Number.isFinite(Number(r?.person1)) ? Number(r.person1) :
        Number.isFinite(Number(r?.anya)) ? Number(r.anya) :
        0;

      const p2 =
        Number.isFinite(Number(r?.person2)) ? Number(r.person2) :
        Number.isFinite(Number(r?.daniel)) ? Number(r.daniel) :
        0;

      const isShared = Boolean(r?.isShared);

      return {
        id,
        type,
        category,
        person1: Math.round(p1 * 100) / 100,
        person2: Math.round(p2 * 100) / 100,
        isShared,
      };
    });

    // Save back in the new canonical format so it never happens again
    saveTemplate(migrated);
    return migrated;
  }

  // If v2 empty, try v1 and migrate
  const rawV1 = window.localStorage.getItem(TEMPLATE_KEY_V1);
  const parsedV1 = safeParse<TemplateItemV1[]>(rawV1, []);
  if (Array.isArray(parsedV1) && parsedV1.length > 0) {
    const migrated = migrateV1toV2(parsedV1);
    saveTemplate(migrated);
    return migrated;
  }

  return [];
}

export function saveTemplate(rows: TemplateRow[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TEMPLATE_KEY_V2, JSON.stringify(rows));
}