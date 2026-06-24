import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EnrollButton } from "@/components/enroll-button";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const session = await auth();

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      teacher: { select: { name: true } },
      liveSessions: { orderBy: { startsAt: "asc" }, include: { summary: true } },
      contents: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!course) notFound();

  const enrollment = session?.user
    ? await prisma.enrollment.findUnique({
        where: { studentId_courseId: { studentId: session.user.id, courseId } },
      })
    : null;

  const isEnrolled = Boolean(enrollment);
  const isOwner = session?.user?.id === course.teacherId;
  const canSeeContent = isEnrolled || isOwner;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 w-full">
      <h1 className="text-2xl font-semibold mb-1">{course.title}</h1>
      <p className="text-sm text-neutral-500 mb-4">by {course.teacher.name}</p>
      <p className="text-neutral-700 mb-6">{course.description}</p>

      {session?.user?.role === "STUDENT" && !isEnrolled && (
        <EnrollButton courseId={course.id} priceInPaise={course.priceInPaise} />
      )}
      {!session?.user && (
        <p className="text-sm text-neutral-500">Sign in as a student to enroll in this course.</p>
      )}
      {isEnrolled && (
        <p className="text-sm text-green-700 font-medium">You are enrolled in this course.</p>
      )}

      <section className="mt-8">
        <h2 className="text-lg font-medium mb-3">Live Sessions</h2>
        {course.liveSessions.length === 0 && (
          <p className="text-sm text-neutral-500">No sessions scheduled yet.</p>
        )}
        <div className="space-y-3">
          {course.liveSessions.map((s) => (
            <div key={s.id} className="rounded-md border border-neutral-200 p-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">{s.title}</span>
                <span className="text-sm text-neutral-500">
                  {new Date(s.startsAt).toLocaleString()}
                </span>
              </div>
              {canSeeContent && (
                <a
                  href={s.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-orange-600 font-medium"
                >
                  Join session →
                </a>
              )}
              {s.summary && (
                <p className="text-sm text-neutral-600 mt-2 border-t border-neutral-100 pt-2">
                  <span className="font-medium">Summary: </span>
                  {s.summary.content}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-medium mb-3">Course Content</h2>
        {!canSeeContent && (
          <p className="text-sm text-neutral-500">Enroll to access course materials.</p>
        )}
        {canSeeContent && course.contents.length === 0 && (
          <p className="text-sm text-neutral-500">No content uploaded yet.</p>
        )}
        {canSeeContent && (
          <ul className="space-y-2">
            {course.contents.map((c) => (
              <li key={c.id}>
                <a
                  href={c.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-orange-600 font-medium"
                >
                  {c.title}
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
