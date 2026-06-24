import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function CoursesPage() {
  const courses = await prisma.course.findMany({
    include: { teacher: { select: { name: true } }, _count: { select: { enrollments: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 w-full">
      <h1 className="text-2xl font-semibold mb-6">Courses</h1>

      {courses.length === 0 && (
        <p className="text-neutral-500">No courses published yet.</p>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course) => (
          <Link
            key={course.id}
            href={`/courses/${course.id}`}
            className="rounded-lg border border-neutral-200 bg-white p-4 hover:shadow-sm transition-shadow"
          >
            <h2 className="font-medium text-lg mb-1">{course.title}</h2>
            <p className="text-sm text-neutral-500 mb-3 line-clamp-2">{course.description}</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-500">by {course.teacher.name}</span>
              <span className="font-semibold text-orange-700">
                ₹{(course.priceInPaise / 100).toFixed(0)}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
