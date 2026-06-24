import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TAAL_PRESETS } from "@/lib/taal-presets";
import { trainMarkovModel } from "@/lib/tabla-markov";

const ORDER = 2;

export async function POST() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const compositions = await prisma.composition.findMany({ select: { notation: true } });

  const corpus = [
    ...TAAL_PRESETS.map((p) => p.notation),
    ...compositions.map((c) => c.notation),
  ];

  const model = trainMarkovModel(corpus, ORDER);

  await prisma.tablaModel.deleteMany({});
  const saved = await prisma.tablaModel.create({
    data: {
      order: ORDER,
      transitions: model.transitions,
      exampleCount: corpus.length,
    },
  });

  return NextResponse.json({
    trained: true,
    exampleCount: saved.exampleCount,
    trainedAt: saved.trainedAt,
    order: saved.order,
  });
}
