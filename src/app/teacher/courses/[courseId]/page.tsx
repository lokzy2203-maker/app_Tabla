import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NewSessionForm } from "@/components/teacher/new-session-form";
import { ContentUploadForm } from "@/components/teacher/content-upload-form";
import { SessionManageCard } from "@/components/teacher/session-manage-card";

export default async function TeacherCourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const session = await auth();

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      liveSessions: {
        orderBy: { startsAt: "asc" },
        include: { summary: true, attendances: true },
      },
      contents: { orderBy: { createdAt: "desc" } },
      enrollments: { include: { student: { select: { id: true, name: true } } } },
    },
  });

  if (!course || course.teacherId !== session?.user.id) notFound();

  const students = course.enrollments.map((e) => e.student);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 w-full space-y-10">
      <div>
        <h1 className="text-2xl font-semibold mb-1">{course.title}</h1>
        <p className="text-sm text-neutral-500">{course.enrollments.length} students enrolled</p>
      </div>

      <section>
        <h2 className="text-lg font-medium mb-3">Schedule a Live Session</h2>
        <NewSessionForm courseId={course.id} />
      </section>

      <section>
        <h2 className="text-lg font-medium mb-3">Sessions</h2>
        <div className="space-y-3">
          {course.liveSessions.map((s) => {
            const attendanceMap = Object.fromEntries(
              s.attendances.map((a) => [a.studentId, a.status])
            );
            return (
              <SessionManageCard
                key={s.id}
                sessionId={s.id}
                title={s.title}
                startsAt={s.startsAt.toISOString()}
                meetingLink={s.meetingLink}
                initialSummary={s.summary?.content ?? ""}
                students={students}
                initialAttendance={attendanceMap}
              />
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-medium mb-3">Course Content</h2>
        <ContentUploadForm courseId={course.id} />
        <ul className="mt-3 space-y-1">
          {course.contents.map((c) => (
            <li key={c.id}>
              <a
                href={c.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-orange-600"
              >
                {c.title}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
