"use client";

import { useAuth } from "@/providers/context/AuthContext";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Spinner } from "@/components/spinner";


export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
          if (!user && !loading) router.push("/login");
      }, [loading, user, router]);
  
      if (loading || !user) return <Spinner />


  return (
    <div className="w-full flex justify-center mt-10">
      <div className="max-w-3xl w-full px-4">
        <h1 className="text-3xl font-semibold mb-4">Dashboard</h1>

        {user && (
          <p className="text-muted-foreground mb-6">
            Logged in as: <span className="font-medium">{user.email}</span>
          </p>
        )}

        <Link href="/dashboard/today">
          <Button>View Today’s Tasks</Button>
        </Link>
      </div>
    </div>
  );
}
