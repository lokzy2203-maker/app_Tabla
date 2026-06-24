"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export function NavBar() {
  const { data: session } = useSession();

  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold text-orange-700">
          Tabla Academy
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          {session?.user ? (
            <>
              <Link href="/dashboard" className="text-neutral-700 hover:text-orange-700">
                Dashboard
              </Link>
              <Link href="/courses" className="text-neutral-700 hover:text-orange-700">
                Courses
              </Link>
              <Link href="/tabla-player" className="text-neutral-700 hover:text-orange-700">
                AI Tabla Player
              </Link>
              <span className="text-neutral-400">|</span>
              <span className="text-neutral-500">{session.user.name}</span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-md border border-neutral-300 px-3 py-1.5 hover:bg-neutral-100"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/courses" className="text-neutral-700 hover:text-orange-700">
                Courses
              </Link>
              <Link href="/tabla-player" className="text-neutral-700 hover:text-orange-700">
                AI Tabla Player
              </Link>
              <Link href="/login" className="text-neutral-700 hover:text-orange-700">
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-md bg-orange-600 text-white px-3 py-1.5 hover:bg-orange-700"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
