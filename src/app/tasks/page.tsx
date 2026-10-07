import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/login/actions";

export default async function TasksPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) {
    redirect("/login");
  }

  const email =
    typeof data.claims.email === "string" ? data.claims.email : "Signed in";

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-border px-6 py-3">
        <p className="font-heading text-base font-semibold">Task List</p>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{email}</span>
          <form action={signOut}>
            <Button type="submit" variant="outline" size="sm">
              Sign out
            </Button>
          </form>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center p-6">
        <p className="text-muted-foreground">Task list coming in US-3</p>
      </main>
    </div>
  );
}
