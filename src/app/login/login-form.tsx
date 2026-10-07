"use client";

import { useActionState, useState } from "react";
import { authenticate } from "./actions";
import { AuthMarketingPanel } from "./auth-marketing-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppLogo } from "@/components/app-logo";
import { APP } from "@/lib/constants/app";
import { AUTH_PAGE } from "@/lib/constants/auth";
import type { AuthMode, AuthState } from "@/lib/types/auth";
import { cn } from "@/lib/utils";

const initialState: AuthState = { error: null };

function ModeToggle({
  mode,
  onModeChange,
}: {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
}) {
  return (
    <div
      className="grid grid-cols-2 gap-1 rounded-lg border border-border bg-muted/40 p-1"
      role="tablist"
      aria-label="Authentication mode"
    >
      {(
        [
          { value: "signin" as const, label: AUTH_PAGE.modeSignIn },
          { value: "signup" as const, label: AUTH_PAGE.modeSignUp },
        ] as const
      ).map((option) => {
        const selected = mode === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={selected}
            className={cn(
              "rounded-md px-3 py-2 text-sm font-medium transition-colors",
              selected
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
            onClick={() => onModeChange(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

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
  const copy = isSignIn ? AUTH_PAGE.signIn : AUTH_PAGE.signUp;
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
    <div className="flex flex-col gap-6">
      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          {copy.headline}
        </h1>
        <p className="text-sm text-muted-foreground">{copy.description}</p>
      </div>

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
            className="h-11 bg-background"
            onChange={dismissError}
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between gap-2">
            <Label htmlFor="password">{AUTH_PAGE.passwordLabel}</Label>
            {!isSignIn ? (
              <span className="text-xs text-muted-foreground">
                {AUTH_PAGE.passwordHintSignUp}
              </span>
            ) : null}
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete={isSignIn ? "current-password" : "new-password"}
            placeholder={
              isSignIn
                ? AUTH_PAGE.passwordPlaceholderSignIn
                : AUTH_PAGE.passwordPlaceholderSignUp
            }
            required
            className="h-11 bg-background"
            onChange={dismissError}
          />
        </div>

        {showError && state.error ? (
          <div
            className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            role="alert"
          >
            {state.error}
          </div>
        ) : null}

        <Button
          type="submit"
          size="lg"
          className="mt-1 h-11 w-full text-base"
          disabled={pending}
        >
          {pending
            ? isSignIn
              ? AUTH_PAGE.signingIn
              : AUTH_PAGE.creatingAccount
            : isSignIn
              ? AUTH_PAGE.signInLabel
              : AUTH_PAGE.createAccountLabel}
        </Button>
      </form>
    </div>
  );
}

export function LoginForm() {
  const [mode, setMode] = useState<AuthMode>("signin");

  return (
    <div className="grid min-h-dvh w-full flex-1 lg:grid-cols-2">
      <AuthMarketingPanel mode={mode} />

      <section className="flex min-h-dvh flex-col justify-center bg-background px-6 py-10 sm:px-10 lg:px-16 xl:px-20">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <AppLogo showLabel labelClassName="text-lg" iconClassName="size-9" />
          </div>

          <ModeToggle mode={mode} onModeChange={setMode} />

          <div className="mt-8">
            <AuthFields key={mode} mode={mode} />
          </div>

          <p className="mt-8 text-center text-xs text-muted-foreground lg:text-left">
            {APP.name} · {AUTH_PAGE.brandTagline}
          </p>
        </div>
      </section>
    </div>
  );
}
