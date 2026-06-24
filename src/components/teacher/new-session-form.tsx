"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function NewSessionForm({ courseId }: { courseId: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch(`/api/courses/${courseId}/sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        meetingLink,
        startsAt: new Date(startsAt).toISOString(),
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Could not schedule session");
      return;
    }

    setTitle("");
    setMeetingLink("");
    setStartsAt("");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 items-start">
      <input
        required
        placeholder="Session title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="rounded-md border border-neutral-300 px-3 py-2 text-sm flex-1"
      />
      <input
        required
        placeholder="Zoom / Meet link"
        value={meetingLink}
        onChange={(e) => setMeetingLink(e.target.value)}
        className="rounded-md border border-neutral-300 px-3 py-2 text-sm flex-1"
      />
      <input
        required
        type="datetime-local"
        value={startsAt}
        onChange={(e) => setStartsAt(e.target.value)}
        className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
      />
      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-orange-600 text-white px-4 py-2 text-sm font-medium hover:bg-orange-700 disabled:opacity-50"
      >
        {loading ? "Scheduling..." : "Schedule"}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
