"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Student = { id: string; name: string };
type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE";

export function SessionManageCard({
  sessionId,
  title,
  startsAt,
  meetingLink,
  initialSummary,
  students,
  initialAttendance,
}: {
  sessionId: string;
  title: string;
  startsAt: string;
  meetingLink: string;
  initialSummary: string;
  students: Student[];
  initialAttendance: Record<string, AttendanceStatus>;
}) {
  const router = useRouter();
  const [summary, setSummary] = useState(initialSummary);
  const [savingSummary, setSavingSummary] = useState(false);
  const [attendance, setAttendance] = useState(initialAttendance);

  const saveSummary = async () => {
    setSavingSummary(true);
    await fetch(`/api/sessions/${sessionId}/summary`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: summary }),
    });
    setSavingSummary(false);
    router.refresh();
  };

  const markAttendance = async (studentId: string, status: AttendanceStatus) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
    await fetch(`/api/sessions/${sessionId}/attendance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, status }),
    });
  };

  return (
    <div className="rounded-md border border-neutral-200 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <span className="font-medium">{title}</span>
        <span className="text-sm text-neutral-500">{new Date(startsAt).toLocaleString()}</span>
      </div>
      <a
        href={meetingLink}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-orange-600 font-medium"
      >
        Meeting link →
      </a>

      <div>
        <label className="block text-sm font-medium mb-1">Lecture summary</label>
        <textarea
          rows={3}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
        <button
          onClick={saveSummary}
          disabled={savingSummary}
          className="mt-2 rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium hover:bg-neutral-100 disabled:opacity-50"
        >
          {savingSummary ? "Saving..." : "Save summary"}
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Attendance</label>
        {students.length === 0 && (
          <p className="text-sm text-neutral-500">No enrolled students yet.</p>
        )}
        <div className="space-y-1.5">
          {students.map((s) => (
            <div key={s.id} className="flex items-center justify-between text-sm">
              <span>{s.name}</span>
              <div className="flex gap-1">
                {(["PRESENT", "LATE", "ABSENT"] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => markAttendance(s.id, st)}
                    className={`rounded-md px-2 py-1 text-xs font-medium border ${
                      attendance[s.id] === st
                        ? st === "PRESENT"
                          ? "bg-green-600 text-white border-green-600"
                          : st === "LATE"
                          ? "bg-yellow-500 text-white border-yellow-500"
                          : "bg-red-600 text-white border-red-600"
                        : "border-neutral-300 text-neutral-600"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
