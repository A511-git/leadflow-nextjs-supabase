"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTasksDueToday } from "@/lib/queries/tasks";
import { markTaskComplete } from "@/lib/mutations/tasks";
import { TasksTable } from "@/components/tasksTable";
import { showError, showSuccess } from "@/components/toast";
import { useAuth } from "@/providers/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Spinner } from "@/components/spinner";

export default function TodayPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();
    
    useEffect(() => {
        if (!user && !loading) router.push("/login");
    }, [loading, user, router]);

    if (loading || !user) return <Spinner />

    const { data, isLoading, isError } = useQuery({
        queryKey: ["tasks-today"],
        queryFn: getTasksDueToday,
    });
    
    const mutation = useMutation({
        mutationFn: (id: string) => markTaskComplete(id),
        onSuccess: () => {
            showSuccess("Task marked as completed");
            queryClient.invalidateQueries({ queryKey: ["tasks-today"] });
        },
        onError: () => {
            showError("Failed to update task");
        },
    });
    
    const handleComplete = (id: string) => {
        mutation.mutate(id);
    };
    
    return (
        <div className="w-full flex justify-center">
            <div className="w-full max-w-5xl px-4 py-8">
                <h1 className="text-2xl font-semibold mb-6">Tasks Due Today</h1>

                {isLoading && <Spinner />}
                {isError && <p className="text-red-500">Failed to load tasks.</p>}

                {data?.data && data.data.length > 0 ? (
                    <TasksTable tasks={data.data} onComplete={handleComplete} />
                ) : (
                    !isLoading && <p>No tasks due today.</p>
                )}
            </div>
        </div>
    );
}
