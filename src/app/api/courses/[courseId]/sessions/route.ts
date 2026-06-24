import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  title: z.string().min(3),
  meetingLink: z.string().url(),
  startsAt: z.string().datetime(),
  durationMin: z.number().int().min(15).max(240).default(60),
});

export async function POST(req: Request, { params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const session = await auth();
  if (!session?.user || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course || course.teacherId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const liveSession = await prisma.liveSession.create({
    data: {
      courseId,
      teacherId: session.user.id,
      title: parsed.data.title,
      meetingLink: parsed.data.meetingLink,
      startsAt: new Date(parsed.data.startsAt),
      durationMin: parsed.data.durationMin,
    },
  });

  return NextResponse.json(liveSession);
}
