"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export function EnrollButton({
  courseId,
  priceInPaise,
}: {
  courseId: string;
  priceInPaise: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEnroll = async () => {
    setLoading(true);
    setError("");

    const orderRes = await fetch("/api/payments/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId }),
    });

    const orderData = await orderRes.json();
    if (!orderRes.ok) {
      setError(orderData.error ?? "Could not start payment");
      setLoading(false);
      return;
    }

    const rzp = new window.Razorpay({
      key: orderData.keyId,
      amount: orderData.amount,
      currency: "INR",
      order_id: orderData.orderId,
      name: "Tabla Academy",
      description: "Course enrollment",
      handler: async (response: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
      }) => {
        const verifyRes = await fetch("/api/payments/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...response, courseId }),
        });

        if (verifyRes.ok) {
          router.refresh();
        } else {
          setError("Payment verification failed");
        }
        setLoading(false);
      },
      modal: {
        ondismiss: () => setLoading(false),
      },
    });

    rzp.open();
  };

  const handleDevSkip = async () => {
    setLoading(true);
    setError("");

    const res = await fetch("/api/dev/enroll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Could not enroll");
      return;
    }

    router.refresh();
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <div className="flex items-center gap-3">
        <button
          onClick={handleEnroll}
          disabled={loading}
          className="rounded-md bg-orange-600 text-white px-5 py-2.5 text-sm font-medium hover:bg-orange-700 disabled:opacity-50"
        >
          {loading ? "Processing..." : `Enroll for ₹${(priceInPaise / 100).toFixed(0)}`}
        </button>
        {process.env.NODE_ENV !== "production" && (
          <button
            onClick={handleDevSkip}
            disabled={loading}
            className="rounded-md border border-dashed border-neutral-400 text-neutral-600 px-3 py-2.5 text-sm font-medium hover:bg-neutral-100 disabled:opacity-50"
            title="Dev only: creates the enrollment without going through Razorpay"
          >
            Skip payment (dev)
          </button>
        )}
      </div>
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </>
  );
}
