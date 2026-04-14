"use client";

import { useState } from "react";

function DynamicField({ path, value, onChange }: { path: string[]; value: unknown; onChange: (nextValue: unknown) => void }) {
  const fieldLabel = path[path.length - 1]?.replace(/([A-Z])/g, " $1").trim() ?? "Value";

  if (typeof value === "string") {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={Math.max(1, Math.min(4, value.split("\n").length))}
        placeholder={fieldLabel}
        className="w-full rounded-xl border border-rose-100 bg-rose-50/30 px-4 py-2 text-sm outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
      />
    );
  }

  if (typeof value === "number") {
    return (
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        placeholder={fieldLabel}
        className="w-full rounded-xl border border-rose-100 bg-rose-50/30 px-4 py-2 text-sm outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
      />
    );
  }

  if (typeof value === "boolean") {
    return (
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 rounded border-rose-200 text-rose-700 focus:ring-rose-200"
        />
        <span className="text-sm">Enabled</span>
      </label>
    );
  }

  if (Array.isArray(value)) {
    return (
      <div className="space-y-4 rounded-xl border border-rose-100 bg-slate-50/50 p-4">
        {value.map((item, index) => (
          <div key={index} className="space-y-2 border-b border-rose-100 pb-4 last:border-0 last:pb-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-slate-500">Item {index + 1}</span>
              <button
                type="button"
                onClick={() => {
                  const nextArray = [...value];
                  nextArray.splice(index, 1);
                  onChange(nextArray);
                }}
                className="text-xs text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
            <DynamicField path={[...path, String(index)]} value={item} onChange={(nextItem) => {
              const nextArray = [...value];
              nextArray[index] = nextItem;
              onChange(nextArray);
            }} />
          </div>
        ))}
        <button
          type="button"
          onClick={() => {
            const newItem = value.length > 0 ? JSON.parse(JSON.stringify(value[0])) : "";
            onChange([...value, newItem]);
          }}
          className="text-xs font-semibold text-rose-500 hover:text-rose-700"
        >
          + Add Item
        </button>
      </div>
    );
  }

  if (typeof value === "object" && value !== null) {
    return (
      <div className="space-y-4">
        {Object.entries(value).map(([key, childValue]) => (
          <div key={key}>
            <DynamicField path={[...path, key]} value={childValue} onChange={(nextChild) => {
              onChange({ ...value, [key]: nextChild });
            }} />
          </div>
        ))}
      </div>
    );
  }

  return <p className="text-sm text-slate-500">Unsupported field type</p>;
}

export function DynamicJsonForm({ initialJson, onChange }: { initialJson: string; onChange: (json: string) => void }) {
  const [data, setData] = useState<unknown>(() => {
    try {
      return JSON.parse(initialJson);
    } catch {
      return {};
    }
  });

  const handleChange = (nextData: unknown) => {
    setData(nextData);
    onChange(JSON.stringify(nextData, null, 2));
  };

  return (
    <div className="space-y-4">
      <DynamicField path={[]} value={data} onChange={handleChange} />
    </div>
  );
}
