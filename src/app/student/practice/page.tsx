import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PracticeUploadForm } from "@/components/student/practice-upload-form";

export default async function PracticePage() {
  const session = await auth();

  const recordings = await prisma.practiceRecording.findMany({
    where: { studentId: session!.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 w-full space-y-8">
      <div>
        <h1 className="text-2xl font-semibold mb-1">AI Practice Assistant</h1>
        <p className="text-sm text-neutral-500">
          Upload a recording of your riyaz and get instant feedback on rhythm, bol clarity, and
          technique.
        </p>
      </div>

      <PracticeUploadForm />

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Past Feedback</h2>
        {recordings.length === 0 && (
          <p className="text-sm text-neutral-500">No practice recordings yet.</p>
        )}
        {recordings.map((r) => (
          <div key={r.id} className="rounded-md border border-neutral-200 bg-white p-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-neutral-500">
                {r.taal ?? "Untagged"} {r.tempoBpm ? `· ${r.tempoBpm} BPM` : ""} ·{" "}
                {new Date(r.createdAt).toLocaleString()}
              </span>
              <span
                className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                  r.status === "COMPLETED"
                    ? "bg-green-100 text-green-700"
                    : r.status === "PENDING"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {r.status}
              </span>
            </div>
            <audio controls src={r.fileUrl} className="w-full mb-2" />
            {r.feedback && (
              <p className="text-sm text-neutral-700 whitespace-pre-wrap">{r.feedback}</p>
            )}
          </div>
        ))}
      </section>
    </main>
  );
}
