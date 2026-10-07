import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const hasSupabaseEnv = Boolean(supabaseUrl && anonKey && serviceRoleKey);

const TEST_PASSWORD = "rls-test-password-12";

type TestUser = {
  id: string;
  email: string;
  client: SupabaseClient;
};

describe("RLS — two users", () => {
  if (!hasSupabaseEnv) {
    it.skip(
      "skipped — set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY in .env.local",
      () => {},
    );
    return;
  }

  const admin = createClient(supabaseUrl!, serviceRoleKey!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  let userA!: TestUser;
  let userB!: TestUser;
  let taskId: string;
  let taskTitle: string;

  beforeAll(async () => {
    const suffix = crypto.randomUUID();
    const emailA = `rls-test-a-${suffix}@example.com`;
    const emailB = `rls-test-b-${suffix}@example.com`;

    const { data: createdA, error: createAErr } =
      await admin.auth.admin.createUser({
        email: emailA,
        password: TEST_PASSWORD,
        email_confirm: true,
      });
    if (createAErr || !createdA.user) {
      throw createAErr ?? new Error("Failed to create user A");
    }

    const { data: createdB, error: createBErr } =
      await admin.auth.admin.createUser({
        email: emailB,
        password: TEST_PASSWORD,
        email_confirm: true,
      });
    if (createBErr || !createdB.user) {
      throw createBErr ?? new Error("Failed to create user B");
    }

    const clientA = createClient(supabaseUrl!, anonKey!, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const clientB = createClient(supabaseUrl!, anonKey!, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { error: signInAErr } = await clientA.auth.signInWithPassword({
      email: emailA,
      password: TEST_PASSWORD,
    });
    if (signInAErr) {
      throw signInAErr;
    }

    const { error: signInBErr } = await clientB.auth.signInWithPassword({
      email: emailB,
      password: TEST_PASSWORD,
    });
    if (signInBErr) {
      throw signInBErr;
    }

    userA = { id: createdA.user.id, email: emailA, client: clientA };
    userB = { id: createdB.user.id, email: emailB, client: clientB };

    taskTitle = `RLS task ${suffix}`;
    const { data: inserted, error: insertErr } = await userA.client
      .from("tasks")
      .insert({
        title: taskTitle,
        priority: 3,
        due_date: "2026-12-01",
      })
      .select("id, title")
      .single();

    if (insertErr || !inserted) {
      throw insertErr ?? new Error("User A failed to insert task");
    }
    taskId = inserted.id;
  });

  afterAll(async () => {
    if (!hasSupabaseEnv) {
      return;
    }
    await admin.auth.admin.deleteUser(userA.id);
    await admin.auth.admin.deleteUser(userB.id);
  });

  it("user A can read their own task", async () => {
    const { data, error } = await userA.client
      .from("tasks")
      .select("id, title")
      .eq("id", taskId)
      .single();

    expect(error).toBeNull();
    expect(data?.title).toBe(taskTitle);
  });

  it("user B cannot see user A's tasks in a list query", async () => {
    const { data, error } = await userB.client
      .from("tasks")
      .select("id, user_id");

    expect(error).toBeNull();
    const rowsForA = (data ?? []).filter((row) => row.id === taskId);
    expect(rowsForA).toHaveLength(0);
  });

  it("user B cannot read user A's task by id", async () => {
    const { data, error } = await userB.client
      .from("tasks")
      .select("id")
      .eq("id", taskId);

    expect(error).toBeNull();
    expect(data ?? []).toHaveLength(0);
  });

  it("user B cannot update user A's task", async () => {
    const { data: updated, error } = await userB.client
      .from("tasks")
      .update({ title: "Hacked by B" })
      .eq("id", taskId)
      .select("id");

    expect(error).toBeNull();
    expect(updated ?? []).toHaveLength(0);

    const { data: unchanged } = await userA.client
      .from("tasks")
      .select("title")
      .eq("id", taskId)
      .single();

    expect(unchanged?.title).toBe(taskTitle);
  });

  it("user B cannot insert a task owned by user A", async () => {
    const { error } = await userB.client.from("tasks").insert({
      user_id: userA.id,
      title: "Impersonation attempt",
      priority: 2,
      due_date: "2026-12-02",
    });

    expect(error).not.toBeNull();
  });
});
