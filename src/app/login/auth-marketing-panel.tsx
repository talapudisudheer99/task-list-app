import {
  CheckCircle2Icon,
  ListTodoIcon,
  SparklesIcon,
} from "lucide-react";
import { AppLogo } from "@/components/app-logo";
import { APP } from "@/lib/constants/app";
import { AUTH_PAGE } from "@/lib/constants/auth";
import type { AuthMode } from "@/lib/types/auth";
type AuthMarketingPanelProps = {
  mode: AuthMode;
};

export function AuthMarketingPanel({ mode }: AuthMarketingPanelProps) {
  const isSignIn = mode === "signin";
  const copy = isSignIn ? AUTH_PAGE.signIn : AUTH_PAGE.signUp;

  return (
    <aside
      className="relative hidden min-h-dvh overflow-hidden bg-primary px-10 py-12 text-primary-foreground lg:flex lg:flex-col lg:justify-between"
      key={mode}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 20%, white 0%, transparent 45%),
            radial-gradient(circle at 80% 0%, white 0%, transparent 35%)`,
        }}
      />
      <div
        className="pointer-events-none absolute -right-24 top-1/3 size-72 rounded-full bg-primary-foreground/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-16 bottom-0 size-56 rounded-full bg-primary-foreground/5 blur-2xl"
        aria-hidden
      />

      <div className="relative z-10">
        <AppLogo
          showLabel
          tileVariant="onPrimary"
          labelClassName="text-primary-foreground"
          iconClassName="size-9"
        />
        <p className="mt-6 max-w-sm text-sm text-primary-foreground/80">
          {AUTH_PAGE.brandTagline}
        </p>
      </div>

      <div className="relative z-10 mt-12 max-w-md">
        <div className="mb-4 flex items-center gap-2 text-primary-foreground/90">
          {isSignIn ? (
            <ListTodoIcon className="size-5 shrink-0" aria-hidden />
          ) : (
            <SparklesIcon className="size-5 shrink-0" aria-hidden />
          )}
          <span className="text-xs font-semibold uppercase tracking-wider">
            {isSignIn ? AUTH_PAGE.modeSignIn : AUTH_PAGE.modeSignUp}
          </span>
        </div>
        <h2 className="font-heading text-3xl font-semibold leading-tight tracking-tight">
          {copy.panelHeadline}
        </h2>
        <p className="mt-3 text-base leading-relaxed text-primary-foreground/85">
          {copy.panelLead}
        </p>
        <ul className="mt-8 flex flex-col gap-3">
          {copy.bullets.map((item) => (
            <li
              key={item}
              className="flex gap-3 text-sm leading-snug text-primary-foreground/90"
            >
              <CheckCircle2Icon
                className="mt-0.5 size-4 shrink-0 text-primary-foreground/70"
                aria-hidden
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="relative z-10 text-xs text-primary-foreground/60">
        {APP.name} · {isSignIn ? "Secure sign-in" : "Free to get started"}
      </p>
    </aside>
  );
}
