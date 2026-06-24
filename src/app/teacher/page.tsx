import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function TeacherDashboard() {
  const session = await auth();
  const courses = await prisma.course.findMany({
    where: { teacherId: session!.user.id },
    include: { _count: { select: { enrollments: true, liveSessions: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">My Courses</h1>
        <Link
          href="/teacher/courses/new"
          className="rounded-md bg-orange-600 text-white px-4 py-2 text-sm font-medium hover:bg-orange-700"
        >
          + New Course
        </Link>
      </div>

      {courses.length === 0 && (
        <p className="text-neutral-500">You haven&apos;t created any courses yet.</p>
      )}

      <div className="space-y-3">
        {courses.map((course) => (
          <Link
            key={course.id}
            href={`/teacher/courses/${course.id}`}
            className="block rounded-md border border-neutral-200 bg-white p-4 hover:shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{course.title}</span>
              <span className="text-sm text-neutral-500">
                {course._count.enrollments} students · {course._count.liveSessions} sessions
              </span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
