import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({ content: z.string().min(5) });

export async function POST(
  req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const session = await auth();
  if (!session?.user || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const liveSession = await prisma.liveSession.findUnique({ where: { id: sessionId } });
  if (!liveSession || liveSession.teacherId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const summary = await prisma.lectureSummary.upsert({
    where: { sessionId },
    create: { sessionId, content: parsed.data.content },
    update: { content: parsed.data.content },
  });

  return NextResponse.json(summary);
}
