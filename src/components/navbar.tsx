"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/context/AuthContext";

export default function Navbar() {
  const { user, signOut } = useAuth();

  return (
    <nav className="w-full px-6 py-3 border-b bg-background flex items-center justify-between">
      {/* LEFT: Logo */}
      <Link href="/" className="text-xl font-semibold">
        LearnLynk CRM
      </Link>

      {/* RIGHT: Auth Buttons */}
      <div className="flex items-center gap-3">
        {!user ? (
          <>
            <Link href="/login">
              <Button variant="outline">Login</Button>
            </Link>

            <Link href="/signup">
              <Button>Sign Up</Button>
            </Link>
          </>
        ) : (
          <Button
            variant="destructive"
            onClick={async () => {
              await signOut();
            }}
          >
            Logout
          </Button>
        )}
      </div>
    </nav>
  );
}
