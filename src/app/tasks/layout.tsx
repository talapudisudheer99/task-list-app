import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { TasksHeader } from "@/app/tasks/_components/tasks-header";
import { APP } from "@/lib/constants/app";
import { TASKS_PAGE } from "@/lib/constants/tasks";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: TASKS_PAGE.title,
};

export default async function TasksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) {
    redirect("/login");
  }

  const email =
    typeof data.claims.email === "string"
      ? data.claims.email
      : APP.signedInFallbackEmail;

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <TasksHeader email={email} />
      {children}
    </div>
  );
}
