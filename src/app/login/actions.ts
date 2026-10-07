"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthState = {
  error: string | null;
  /** Changes on each failed submit so the UI can dismiss stale messages. */
  errorId?: number;
};

function authError(message: string): AuthState {
  return { error: message, errorId: Date.now() };
}

function readableAuthError(message: string) {
  const lower = message.toLowerCase();

  if (lower.includes("invalid login") || lower.includes("invalid credentials")) {
    return "Wrong email or password.";
  }
  if (lower.includes("already registered")) {
    return "An account with this email already exists. Sign in instead.";
  }
  if (lower.includes("at least")) {
    return "Password must be at least 6 characters.";
  }
  if (lower.includes("valid email") || lower.includes("invalid format")) {
    return "Please enter a valid email address.";
  }

  return message;
}

export async function authenticate(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const mode = String(formData.get("mode") ?? "signin");

  if (!email || !password) {
    return authError("Email and password are required.");
  }

  const supabase = await createClient();

  if (mode === "signup") {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      return authError(readableAuthError(error.message));
    }
  } else {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      return authError(readableAuthError(error.message));
    }
  }

  redirect("/tasks");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
