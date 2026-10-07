"use server";

import { redirect } from "next/navigation";
import { AUTH_ERRORS } from "@/lib/constants/auth";
import { createClient } from "@/lib/supabase/server";
import type { AuthState } from "@/lib/types/auth";

export type { AuthState };

function authError(message: string): AuthState {
  return { error: message, errorId: Date.now() };
}

function readableAuthError(message: string) {
  const lower = message.toLowerCase();

  if (lower.includes("invalid login") || lower.includes("invalid credentials")) {
    return AUTH_ERRORS.wrongCredentials;
  }
  if (lower.includes("already registered")) {
    return AUTH_ERRORS.alreadyRegistered;
  }
  if (lower.includes("at least")) {
    return AUTH_ERRORS.passwordTooShort;
  }
  if (lower.includes("valid email") || lower.includes("invalid format")) {
    return AUTH_ERRORS.invalidEmail;
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
    return authError(AUTH_ERRORS.missingFields);
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
