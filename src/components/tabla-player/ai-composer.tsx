"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type ModelStatus =
  | { trained: false }
  | { trained: true; exampleCount: number; trainedAt: string; order: number };

type Composition = {
  id: string;
  title: string;
  taal: string | null;
  notation: string;
  owner: { name: string };
};

export function AiComposer({
  notation,
  onLoad,
}: {
  notation: string;
  onLoad: (notation: string) => void;
}) {
  const { data: session } = useSession();
  const [status, setStatus] = useState<ModelStatus | null>(null);
  const [compositions, setCompositions] = useState<Composition[]>([]);
  const [title, setTitle] = useState("");
  const [length, setLength] = useState(16);
  const [saving, setSaving] = useState(false);
  const [training, setTraining] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const refresh = async () => {
    const [statusRes, compositionsRes] = await Promise.all([
      fetch("/api/tabla-model"),
      fetch("/api/compositions"),
    ]);
    if (statusRes.ok) setStatus(await statusRes.json());
    if (compositionsRes.ok) setCompositions(await compositionsRes.json());
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional fetch-on-mount
    if (session?.user) refresh();
  }, [session?.user]);

  if (!session?.user) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white p-4 text-sm text-neutral-500">
        Sign in to save compositions, train the AI Composer, and generate new patterns.
      </div>
    );
  }

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    setError("");

    const res = await fetch("/api/compositions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, notation }),
    });

    setSaving(false);
    if (!res.ok) {
      setError((await res.json()).error ?? "Could not save");
      return;
    }
    setTitle("");
    refresh();
  };

  const handleTrain = async () => {
    setTraining(true);
    setError("");

    const res = await fetch("/api/tabla-model/train", { method: "POST" });

    setTraining(false);
    if (!res.ok) {
      setError((await res.json()).error ?? "Training failed");
      return;
    }
    refresh();
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setError("");

    const res = await fetch("/api/tabla-model/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ length }),
    });

    const data = await res.json();
    setGenerating(false);

    if (!res.ok) {
      setError(data.error ?? "Generation failed");
      return;
    }
    onLoad(data.notation);
  };

  return (
    <div className="space-y-6 rounded-lg border border-neutral-200 bg-white p-4">
      <div>
        <h2 className="text-lg font-medium mb-1">AI Composer</h2>
        <p className="text-xs text-neutral-500">
          A trainable model (an n-gram Markov chain over bol sequences — not a neural network,
          but a real generative model) learns rhythmic patterns from the bundled taal presets and
          any compositions saved below, then generates new bol sequences in that learned style.
        </p>
      </div>

      <div className="text-sm rounded-md bg-neutral-50 px-3 py-2 border border-neutral-200">
        {status === null ? (
          "Loading model status..."
        ) : status.trained ? (
          <>
            Trained on <strong>{status.exampleCount}</strong> example
            {status.exampleCount === 1 ? "" : "s"} ·{" "}
            {new Date(status.trainedAt).toLocaleString()}
          </>
        ) : (
          "Not trained yet."
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Save current notation as a training example</label>
        <div className="flex gap-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. My Teentaal variation"
            className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
          <button
            onClick={handleSave}
            disabled={saving || !title.trim()}
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm font-medium hover:bg-neutral-100 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      <div>
        <button
          onClick={handleTrain}
          disabled={training}
          className="rounded-md bg-neutral-800 text-white px-4 py-2 text-sm font-medium hover:bg-neutral-900 disabled:opacity-50"
        >
          {training ? "Training..." : "Train model"}
        </button>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Generated length: {length} bols</label>
          <input
            type="range"
            min={4}
            max={64}
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="w-48"
          />
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating || status?.trained !== true}
          className="rounded-md bg-orange-600 text-white px-4 py-2 text-sm font-medium hover:bg-orange-700 disabled:opacity-50"
        >
          {generating ? "Generating..." : "Generate composition"}
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {compositions.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-2">Saved compositions ({compositions.length})</p>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {compositions.map((c) => (
              <button
                key={c.id}
                onClick={() => onLoad(c.notation)}
                className="flex w-full items-center justify-between text-left text-sm rounded-md px-2 py-1.5 hover:bg-neutral-100"
              >
                <span>{c.title}</span>
                <span className="text-neutral-400">{c.owner.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
