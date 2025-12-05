import { supabase } from "@/lib/supabase";

export async function markTaskComplete(taskId: string) {
  return supabase
    .from("tasks")
    .update({ status: "completed" })
    .eq("id", taskId);
}
