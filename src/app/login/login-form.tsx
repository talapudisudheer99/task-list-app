"use client";

import { useActionState, useState } from "react";
import { authenticate, type AuthState } from "./actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AuthState = { error: null };

type AuthMode = "signin" | "signup";

/** Form remounts when mode changes so a sign-in error does not appear on sign-up. */
function AuthFields({ mode }: { mode: AuthMode }) {
  const [state, formAction, pending] = useActionState(
    authenticate,
    initialState,
  );
  const [dismissedErrorId, setDismissedErrorId] = useState<number | undefined>(
    undefined,
  );

  const isSignIn = mode === "signin";
  const showError =
    Boolean(state.error) &&
    state.errorId !== undefined &&
    state.errorId !== dismissedErrorId;

  function dismissError() {
    if (state.errorId !== undefined) {
      setDismissedErrorId(state.errorId);
    }
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="mode" value={mode} />

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
          className="h-10"
          onChange={dismissError}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete={isSignIn ? "current-password" : "new-password"}
          placeholder="Enter your password"
          required
          className="h-10"
          onChange={dismissError}
        />
      </div>

      {showError && state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}

      <Button
        type="submit"
        size="lg"
        className="mt-1 h-10 w-full"
        disabled={pending}
      >
        {pending
          ? isSignIn
            ? "Signing in…"
            : "Creating account…"
          : isSignIn
            ? "Sign in"
            : "Create an account"}
      </Button>
    </form>
  );
}

export function LoginForm() {
  const [mode, setMode] = useState<AuthMode>("signin");
  const isSignIn = mode === "signin";

  return (
    <Card className="w-full max-w-sm py-8 shadow-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-semibold">Task List</CardTitle>
        <CardDescription>
          Organize your work, one task at a time.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AuthFields key={mode} mode={mode} />

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {isSignIn ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            type="button"
            className="font-medium text-primary underline-offset-4 hover:underline"
            onClick={() => setMode(isSignIn ? "signup" : "signin")}
          >
            {isSignIn ? "Create an account" : "Sign in"}
          </button>
        </p>
      </CardContent>
    </Card>
  );
}
