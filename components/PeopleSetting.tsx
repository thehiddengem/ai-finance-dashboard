"use client";

import { useEffect, useState } from "react";
import {
  loadPeopleSettings,
  savePeopleSettings,
  defaultPeopleSettings,
  type PeopleSettings,
} from "../utils/settings";

type Props = {
  onChange: (settings: PeopleSettings) => void;
};

export default function PeopleSettingsPanel({ onChange }: Props) {
  const [settings, setSettings] = useState<PeopleSettings>(defaultPeopleSettings());

  // ✅ Draft input values so you can clear the field while typing
  const [draft1, setDraft1] = useState("");
  const [draft2, setDraft2] = useState("");

  // Load once
  useEffect(() => {
    const loaded = loadPeopleSettings();
    setSettings(loaded);
    setDraft1(loaded.person1Name);
    setDraft2(loaded.person2Name);
    onChange(loaded);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const commit = (nextDraft1: string, nextDraft2: string) => {
    const next: PeopleSettings = {
      person1Name: nextDraft1.trim() || "Person 1",
      person2Name: nextDraft2.trim() || "Person 2",
    };

    setSettings(next);
    setDraft1(next.person1Name);
    setDraft2(next.person2Name);

    savePeopleSettings(next);
    onChange(next);
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">People</h2>
        <p className="text-sm text-gray-500">Rename columns anytime.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-gray-600 block mb-1">Person 1 name</label>
          <input
            className="border rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-gray-900/20"
            value={draft1}
            onChange={(e) => setDraft1(e.target.value)}
            onBlur={() => commit(draft1, draft2)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                (e.target as HTMLInputElement).blur(); // triggers commit
              }
            }}
            placeholder="Person 1"
          />
          <div className="text-xs text-gray-400 mt-1">
            Saved as: <span className="font-medium text-gray-600">{settings.person1Name}</span>
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-600 block mb-1">Person 2 name</label>
          <input
            className="border rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-gray-900/20"
            value={draft2}
            onChange={(e) => setDraft2(e.target.value)}
            onBlur={() => commit(draft1, draft2)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                (e.target as HTMLInputElement).blur();
              }
            }}
            placeholder="Person 2"
          />
          <div className="text-xs text-gray-400 mt-1">
            Saved as: <span className="font-medium text-gray-600">{settings.person2Name}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          className="rounded-lg bg-gray-900 text-white px-4 py-2 text-sm font-medium hover:bg-gray-800"
          onClick={() => commit(draft1, draft2)}
        >
          Save names
        </button>

        <button
          type="button"
          className="rounded-lg bg-white border border-gray-200 text-gray-700 px-4 py-2 text-sm hover:bg-gray-50"
          onClick={() => {
            setDraft1("Person 1");
            setDraft2("Person 2");
            commit("Person 1", "Person 2");
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}