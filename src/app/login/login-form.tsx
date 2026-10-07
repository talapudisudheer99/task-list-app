"use client";

import { useActionState, useState } from "react";
import { authenticate } from "./actions";
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
import { AppLogo } from "@/components/app-logo";
import { AUTH_PAGE } from "@/lib/constants/auth";
import type { AuthMode, AuthState } from "@/lib/types/auth";

const initialState: AuthState = { error: null };

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
        <Label htmlFor="email">{AUTH_PAGE.emailLabel}</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder={AUTH_PAGE.emailPlaceholder}
          required
          className="h-10"
          onChange={dismissError}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password">{AUTH_PAGE.passwordLabel}</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete={isSignIn ? "current-password" : "new-password"}
          placeholder={AUTH_PAGE.passwordPlaceholder}
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
            ? AUTH_PAGE.signingIn
            : AUTH_PAGE.creatingAccount
          : isSignIn
            ? AUTH_PAGE.signIn
            : AUTH_PAGE.createAccount}
      </Button>
    </form>
  );
}

export function LoginForm() {
  const [mode, setMode] = useState<AuthMode>("signin");
  const isSignIn = mode === "signin";

  return (
    <Card className="w-full max-w-sm py-8 shadow-sm">
      <CardHeader className="items-center text-center">
        <div className="mb-2 flex justify-center">
          <AppLogo iconClassName="size-10" />
        </div>
        <CardTitle className="text-2xl font-semibold">{AUTH_PAGE.title}</CardTitle>
        <CardDescription>{AUTH_PAGE.subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <AuthFields key={mode} mode={mode} />

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {isSignIn ? AUTH_PAGE.noAccount : AUTH_PAGE.hasAccount}{" "}
          <button
            type="button"
            className="font-medium text-primary underline-offset-4 hover:underline"
            onClick={() => setMode(isSignIn ? "signup" : "signin")}
          >
            {isSignIn ? AUTH_PAGE.createAccount : AUTH_PAGE.signIn}
          </button>
        </p>
      </CardContent>
    </Card>
  );
}
