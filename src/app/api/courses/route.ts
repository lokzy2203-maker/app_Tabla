import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const courses = await prisma.course.findMany({
    include: { teacher: { select: { name: true } }, _count: { select: { enrollments: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(courses);
}

const createSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  priceInPaise: z.number().int().min(0),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = createSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const course = await prisma.course.create({
    data: { ...parsed.data, teacherId: session.user.id },
  });

  return NextResponse.json(course);
}
