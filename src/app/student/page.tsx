import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function StudentDashboard() {
  const session = await auth();

  const enrollments = await prisma.enrollment.findMany({
    where: { studentId: session!.user.id },
    include: { course: true },
  });

  const courseIds = enrollments.map((e) => e.courseId);

  const upcomingSessions = await prisma.liveSession.findMany({
    where: { courseId: { in: courseIds }, startsAt: { gte: new Date() } },
    include: { course: { select: { title: true } } },
    orderBy: { startsAt: "asc" },
    take: 5,
  });

  const attendances = await prisma.attendance.findMany({
    where: { studentId: session!.user.id },
    include: { session: { select: { title: true, startsAt: true } } },
    orderBy: { markedAt: "desc" },
    take: 10,
  });

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 w-full space-y-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">My Learning</h1>
        <Link
          href="/student/practice"
          className="rounded-md bg-orange-600 text-white px-4 py-2 text-sm font-medium hover:bg-orange-700"
        >
          AI Practice Assistant
        </Link>
      </div>

      <section>
        <h2 className="text-lg font-medium mb-3">My Courses</h2>
        {enrollments.length === 0 && (
          <p className="text-sm text-neutral-500">
            You&apos;re not enrolled in any courses yet.{" "}
            <Link href="/courses" className="text-orange-600 font-medium">
              Browse courses →
            </Link>
          </p>
        )}
        <div className="grid sm:grid-cols-2 gap-3">
          {enrollments.map((e) => (
            <Link
              key={e.id}
              href={`/courses/${e.course.id}`}
              className="rounded-md border border-neutral-200 bg-white p-4 hover:shadow-sm"
            >
              {e.course.title}
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-medium mb-3">Upcoming Sessions</h2>
        {upcomingSessions.length === 0 && (
          <p className="text-sm text-neutral-500">No upcoming sessions scheduled.</p>
        )}
        <div className="space-y-2">
          {upcomingSessions.map((s) => (
            <div key={s.id} className="rounded-md border border-neutral-200 p-3 text-sm flex justify-between">
              <span>
                {s.title} <span className="text-neutral-500">· {s.course.title}</span>
              </span>
              <span className="text-neutral-500">{new Date(s.startsAt).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-medium mb-3">Recent Attendance</h2>
        {attendances.length === 0 && (
          <p className="text-sm text-neutral-500">No attendance records yet.</p>
        )}
        <div className="space-y-1.5">
          {attendances.map((a) => (
            <div key={a.id} className="flex items-center justify-between text-sm">
              <span>
                {a.session.title} · {new Date(a.session.startsAt).toLocaleDateString()}
              </span>
              <span
                className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                  a.status === "PRESENT"
                    ? "bg-green-100 text-green-700"
                    : a.status === "LATE"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {a.status}
              </span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
