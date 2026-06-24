import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getRazorpay } from "@/lib/razorpay";

const schema = z.object({ courseId: z.string() });

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const course = await prisma.course.findUnique({ where: { id: parsed.data.courseId } });
  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  const existingEnrollment = await prisma.enrollment.findUnique({
    where: { studentId_courseId: { studentId: session.user.id, courseId: course.id } },
  });
  if (existingEnrollment) {
    return NextResponse.json({ error: "Already enrolled" }, { status: 409 });
  }

  const order = await getRazorpay().orders.create({
    amount: course.priceInPaise,
    currency: "INR",
    notes: { courseId: course.id, studentId: session.user.id },
  });

  const payment = await prisma.payment.create({
    data: {
      studentId: session.user.id,
      amountInPaise: course.priceInPaise,
      razorpayOrderId: order.id,
      status: "CREATED",
    },
  });

  return NextResponse.json({
    orderId: order.id,
    amount: course.priceInPaise,
    keyId: process.env.RAZORPAY_KEY_ID,
    paymentId: payment.id,
    courseId: course.id,
  });
}
