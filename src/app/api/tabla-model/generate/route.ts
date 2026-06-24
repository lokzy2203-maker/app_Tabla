import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateFromModel, formatGeneratedTokens, type Transitions } from "@/lib/tabla-markov";

const schema = z.object({ length: z.number().int().min(4).max(64).default(16) });

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const saved = await prisma.tablaModel.findFirst({ orderBy: { trainedAt: "desc" } });
  if (!saved) {
    return NextResponse.json({ error: "Train the model first" }, { status: 400 });
  }

  const tokens = generateFromModel(
    { order: saved.order, transitions: saved.transitions as Transitions },
    parsed.data.length
  );

  return NextResponse.json({ notation: formatGeneratedTokens(tokens) });
}
