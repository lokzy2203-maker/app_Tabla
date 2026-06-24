import { NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
  courseId: z.string(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, courseId } = parsed.data;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET ?? "")
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    await prisma.payment.update({
      where: { razorpayOrderId: razorpay_order_id },
      data: { status: "FAILED" },
    });
    return NextResponse.json({ error: "Signature verification failed" }, { status: 400 });
  }

  const enrollment = await prisma.enrollment.create({
    data: { studentId: session.user.id, courseId },
  });

  await prisma.payment.update({
    where: { razorpayOrderId: razorpay_order_id },
    data: {
      status: "PAID",
      razorpayPaymentId: razorpay_payment_id,
      enrollmentId: enrollment.id,
    },
  });

  return NextResponse.json({ success: true });
}
