"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function PracticeUploadForm() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [taal, setTaal] = useState("");
  const [tempoBpm, setTempoBpm] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    if (taal) formData.append("taal", taal);
    if (tempoBpm) formData.append("tempoBpm", tempoBpm);
    if (notes) formData.append("notes", notes);

    const res = await fetch("/api/practice", { method: "POST", body: formData });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Upload failed");
      return;
    }

    setFile(null);
    setTaal("");
    setTempoBpm("");
    setNotes("");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-md border border-neutral-200 bg-white p-4">
      <div>
        <label className="block text-sm font-medium mb-1">Practice recording (audio)</label>
        <input
          required
          type="file"
          accept="audio/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="text-sm"
        />
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Taal</label>
          <input
            value={taal}
            onChange={(e) => setTaal(e.target.value)}
            placeholder="e.g. Teentaal"
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Target tempo (BPM)</label>
          <input
            type="number"
            value={tempoBpm}
            onChange={(e) => setTempoBpm(e.target.value)}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Notes (what you were working on)</label>
        <textarea
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-orange-600 text-white px-4 py-2 text-sm font-medium hover:bg-orange-700 disabled:opacity-50"
      >
        {loading ? "Getting feedback..." : "Get AI feedback"}
      </button>
    </form>
  );
}
