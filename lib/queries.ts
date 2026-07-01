import { supabase } from "@/lib/supabase";
import type { Family, Member, Form, ActivityLog, Location, Submission } from "@/lib/types";

export async function getDashboardStats() {
  const [familiesRes, membersRes, formsRes, pendingRes] = await Promise.all([
    supabase.from("families").select("*", { count: "exact", head: true }),
    supabase.from("members").select("*", { count: "exact", head: true }),
    supabase.from("forms").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("submissions").select("*", { count: "exact", head: true }).eq("status", "pending"),
  ]);

  return {
    totalFamilies: familiesRes.count ?? 0,
    totalMembers: membersRes.count ?? 0,
    activeForms: formsRes.count ?? 0,
    pendingReviews: pendingRes.count ?? 0,
  };
}

export async function getRecentFamilies(limit = 5) {
  const { data } = await supabase
    .from("families")
    .select("*, locations(*)")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as (Family & { locations: Location | null })[];
}

export async function getActivityFeed(limit = 5) {
  const { data } = await supabase
    .from("activity_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as ActivityLog[];
}

export async function getFamilies(page = 0, pageSize = 10, search = "", statusFilter = "all") {
  let query = supabase
    .from("families")
    .select("*, locations(*)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1);

  if (search) {
    query = query.or(`family_code.ilike.%${search}%,head_of_family.ilike.%${search}%`);
  }
  if (statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }

  const { data, count } = await query;
  return { families: (data ?? []) as (Family & { locations: Location | null })[], total: count ?? 0 };
}

export async function getMembers(page = 0, pageSize = 10, search = "") {
  let query = supabase
    .from("members")
    .select("*, families(family_code)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1);

  if (search) {
    query = query.ilike("full_name", `%${search}%`);
  }

  const { data, count } = await query;
  return { members: (data ?? []) as (Member & { families: { family_code: string } | null })[], total: count ?? 0 };
}

export async function getForms() {
  const { data } = await supabase.from("forms").select("*").order("created_at", { ascending: false });
  return (data ?? []) as Form[];
}

export async function getSubmissions(page = 0, pageSize = 10, statusFilter = "all") {
  let query = supabase
    .from("submissions")
    .select("*, forms(title), families(family_code,head_of_family)", { count: "exact" })
    .order("submitted_at", { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1);

  if (statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }

  const { data, count } = await query;
  return { submissions: (data ?? []) as (Submission & { forms: { title: string } | null; families: { family_code: string; head_of_family: string } | null })[], total: count ?? 0 };
}

export async function getLocations() {
  const { data } = await supabase.from("locations").select("*").order("name");
  return (data ?? []) as Location[];
}

export async function logActivity(actor: string, action: string, entityType?: string, icon = "✓", color = "#eef2ff") {
  await supabase.from("activity_log").insert({ actor, action, entity_type: entityType, icon, color });
}
