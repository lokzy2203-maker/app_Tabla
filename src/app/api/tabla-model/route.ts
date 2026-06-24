import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const model = await prisma.tablaModel.findFirst({ orderBy: { trainedAt: "desc" } });

  if (!model) {
    return NextResponse.json({ trained: false });
  }

  return NextResponse.json({
    trained: true,
    exampleCount: model.exampleCount,
    trainedAt: model.trainedAt,
    order: model.order,
  });
}
