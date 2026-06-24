import Link from "next/link";
import { TablaAvatar } from "@/components/tabla-avatar";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <TablaAvatar className="w-32 h-32 mb-6" />
      <h1 className="text-4xl font-bold tracking-tight text-neutral-900 mb-4">
        Learn Tabla, Online, Live.
      </h1>
      <p className="max-w-xl text-neutral-600 mb-8">
        Live one-on-one and group tabla sessions, course content, attendance tracking, and an
        AI practice assistant that gives you feedback on your riyaz recordings.
      </p>
      <div className="flex gap-3">
        <Link
          href="/courses"
          className="rounded-md bg-orange-600 text-white px-5 py-2.5 text-sm font-medium hover:bg-orange-700"
        >
          Browse Courses
        </Link>
        <Link
          href="/signup"
          className="rounded-md border border-neutral-300 px-5 py-2.5 text-sm font-medium hover:bg-neutral-100"
        >
          Get Started
        </Link>
      </div>
    </main>
  );
}
