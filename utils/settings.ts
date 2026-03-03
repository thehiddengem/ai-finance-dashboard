export type PeopleSettings = {
  person1Name: string;
  person2Name: string;
};

const PEOPLE_KEY = "ai_finance_people_v1";

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function defaultPeopleSettings(): PeopleSettings {
  return { person1Name: "Person 1", person2Name: "Person 2" };
}

export function loadPeopleSettings(): PeopleSettings {
  if (typeof window === "undefined") return defaultPeopleSettings();
  const raw = window.localStorage.getItem(PEOPLE_KEY);
  const parsed = safeParse<Partial<PeopleSettings>>(raw, {});
  return {
    person1Name: (parsed.person1Name ?? "Person 1").trim() || "Person 1",
    person2Name: (parsed.person2Name ?? "Person 2").trim() || "Person 2",
  };
}

export function savePeopleSettings(settings: PeopleSettings) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PEOPLE_KEY, JSON.stringify(settings));
}