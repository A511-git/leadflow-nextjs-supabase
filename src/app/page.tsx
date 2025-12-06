"use client";

import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Spinner } from "@/components/spinner";
import { useAuth } from "@/providers/context/AuthContext";



export default function HomePage() {


  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user && !loading) router.push("/login");
  }, [loading, user, router]);

  if (loading || !user) return <Spinner />


  if(user)
    return (
    <div className="w-full flex justify-center mt-10">
      <div className="max-w-3xl w-full px-4">
        <h1 className="text-3xl font-semibold mb-4">Home</h1>

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
  )


  return (
    <div className="w-full min-h-screen flex p-6">
      {/* 
        FLEX BEHAVIOR:
        - Mobile: items-center + justify-center → centered
        - Desktop: items-start + justify-start → top-left
      */}
      <div className="
        flex flex-1 
        items-center justify-center 
        md:items-start md:justify-start
      ">
        <div className="md:mt-16 md:ml-16 w-full max-w-md">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-3xl">
                Welcome to LearnLynk CRM
              </CardTitle>
              <CardDescription className="mt-2">
                Manage leads, applications, and tasks with ease.
              </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col gap-3 mt-4">
              <Link href="/signup">
                <Button className="px-6 py-2 text-base w-fit">Sign Up</Button>
              </Link>

              <Link href="/login">
                <Button variant="outline" className="px-6 py-2 text-base w-fit">
                  Login
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
