"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ContentUploadForm({ courseId }: { courseId: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("file", file);

    const res = await fetch(`/api/courses/${courseId}/content`, {
      method: "POST",
      body: formData,
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Upload failed");
      return;
    }

    setTitle("");
    setFile(null);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 items-start">
      <input
        required
        placeholder="Content title (e.g. Teentaal notation)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="rounded-md border border-neutral-300 px-3 py-2 text-sm flex-1"
      />
      <input
        required
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="text-sm"
      />
      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-orange-600 text-white px-4 py-2 text-sm font-medium hover:bg-orange-700 disabled:opacity-50"
      >
        {loading ? "Uploading..." : "Upload"}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
