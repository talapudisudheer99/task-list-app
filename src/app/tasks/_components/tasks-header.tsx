import { signOut } from "@/app/login/actions";
import { AppLogo } from "@/components/app-logo";
import { PageContainer } from "@/components/page-container";
import { Button } from "@/components/ui/button";
import { AUTH_PAGE } from "@/lib/constants/auth";

export function TasksHeader({ email }: { email: string }) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-card/90 backdrop-blur-md">
      <PageContainer className="flex items-center justify-between gap-4 py-3">
        <AppLogo showLabel />
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <span
            className="hidden max-w-[12rem] truncate rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground sm:inline sm:max-w-[16rem] sm:text-sm"
            title={email}
          >
            {email}
          </span>
          <form action={signOut}>
            <Button type="submit" variant="outline" size="sm" className="shrink-0">
              {AUTH_PAGE.signOut}
            </Button>
          </form>
        </div>
      </PageContainer>
    </header>
  );
}
