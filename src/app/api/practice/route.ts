import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { anthropic } from "@/lib/anthropic";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const taal = (formData.get("taal") as string | null) ?? undefined;
  const tempoBpm = formData.get("tempoBpm") ? Number(formData.get("tempoBpm")) : undefined;
  const notes = (formData.get("notes") as string | null) ?? "";

  if (!file) {
    return NextResponse.json({ error: "Missing audio file" }, { status: 400 });
  }

  const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const filePath = path.join(process.cwd(), "public", "uploads", "practice", safeName);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  const recording = await prisma.practiceRecording.create({
    data: {
      studentId: session.user.id,
      fileUrl: `/uploads/practice/${safeName}`,
      taal,
      tempoBpm,
      status: "PENDING",
    },
  });

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: `You are an experienced tabla guru giving feedback to a student's riyaz (practice) session. You cannot hear the actual audio, so base your feedback on the details below and give general, actionable coaching tips for this taal and tempo, as well as common pitfalls students hit at this level.

Taal: ${taal ?? "not specified"}
Target tempo: ${tempoBpm ? `${tempoBpm} BPM` : "not specified"}
Student's notes about this practice session: ${notes || "none provided"}

Give feedback in 4-6 short bullet points covering: rhythm/laya steadiness, bol clarity, hand technique, and one suggested drill for next practice.`,
        },
      ],
    });

    const feedback = message.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n");

    const updated = await prisma.practiceRecording.update({
      where: { id: recording.id },
      data: { feedback, status: "COMPLETED" },
    });

    return NextResponse.json(updated);
  } catch {
    await prisma.practiceRecording.update({
      where: { id: recording.id },
      data: { status: "FAILED" },
    });
    return NextResponse.json(recording);
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const recordings = await prisma.practiceRecording.findMany({
    where: { studentId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(recordings);
}
