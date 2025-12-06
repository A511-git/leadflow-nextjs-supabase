import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient, SupabaseClient } from "npm:@supabase/supabase-js@2";

interface CreateTaskInput {
    application_id: string;
    task_type: "call" | "email" | "review";
    due_at: string;
}
interface ErrorResponse {
    error: string[] | string;
    message: string;
}
interface SuccessResponse {
    success: boolean;
    task_id: string;
}

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request): Promise<Response> => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const body = (await req.json()) as Partial<CreateTaskInput>;
        const { application_id, task_type, due_at } = body;

        const errors: string[] = [];

        if (!application_id) errors.push("application_id is required");
        if (!task_type) errors.push("task_type is required");
        if (!due_at) errors.push("due_at is required");

        if (errors.length > 0) {
            const res: ErrorResponse = { error: errors, message: "Missing fields" };
            return new Response(JSON.stringify(res), {
                status: 400,
                headers: corsHeaders,
            });
        }
        const allowedTypes = ["call", "email", "review"] as const;
        if (!allowedTypes.includes(task_type as any)) {
            errors.push("task_type must be one of: call, email, review.");
        }

        const dueDate = new Date(due_at!);
        if (isNaN(dueDate.getTime()) || dueDate <= new Date()) {
            errors.push("due_at must be a valid future datetime.");
        }

        if (errors.length > 0) {
            const res: ErrorResponse = { error: errors, message: "Invalid data" };
            return new Response(JSON.stringify(res), {
                status: 400,
                headers: corsHeaders,
            });
        }

        const supabase: SupabaseClient = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );

        const { data: appData, error: appErr } = await supabase
            .from("applications")
            .select("tenant_id")
            .eq("id", application_id)
            .single();

        if (appErr || !appData) {
            const res: ErrorResponse = {
                error: "Invalid application_id",
                message: "Application not found",
            };
            return new Response(JSON.stringify(res), {
                status: 400,
                headers: corsHeaders,
            });
        }

        const tenant_id = appData.tenant_id;

        const { data, error } = await supabase
            .from("tasks")
            .insert({
                related_id: application_id,
                type: task_type,
                due_at: dueDate.toISOString(),
                title: `${task_type} task`,
                tenant_id,
            })
            .select("id")
            .single();

        if (error || !data) {
            const res: ErrorResponse = {
                error: "Failed to create task",
                message: "Database insert failed",
            };

            return new Response(JSON.stringify(res), {
                status: 500,
                headers: corsHeaders,
            });
        }
        const task_id = data.id;

        await supabase.realtime.send({
            type: "broadcast",
            event: "task.created",
            payload: { task_id, application_id, task_type, due_at },
        });

        const success: SuccessResponse = {
            success: true,
            task_id,
        };

        return new Response(JSON.stringify(success), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    } catch (err) {
        const errorMsg =
            typeof err === "string" ? err : (err as Error).message ?? "Unknown error";

        const res: ErrorResponse = {
            error: errorMsg,
            message: "Unexpected server error",
        };

        return new Response(JSON.stringify(res), {
            status: 400,
            headers: corsHeaders,
        });
    }
});
