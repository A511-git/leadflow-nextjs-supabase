import { supabase } from "@/lib/supabase";

export async function getTasksDueToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return supabase
    .from("tasks")
    .select("*")
    .gte("due_at", today.toISOString())
    .lt("due_at", tomorrow.toISOString())
    .order("due_at", { ascending: true });
}
