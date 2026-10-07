import { signOut } from "@/app/login/actions";
import { AppLogo } from "@/components/app-logo";
import { PageContainer } from "@/components/page-container";
import { Button } from "@/components/ui/button";
import { AUTH_PAGE } from "@/lib/constants/auth";

export function TasksHeader({ email }: { email: string }) {
  return (
    <header className="border-b border-border">
      <PageContainer className="flex items-center justify-between py-3">
        <AppLogo showLabel />
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{email}</span>
          <form action={signOut}>
            <Button type="submit" variant="outline" size="sm">
              {AUTH_PAGE.signOut}
            </Button>
          </form>
        </div>
      </PageContainer>
    </header>
  );
}
