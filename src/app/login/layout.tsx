import type { Metadata } from "next";
import { AUTH_PAGE } from "@/lib/constants/auth";

export const metadata: Metadata = {
  title: AUTH_PAGE.signInLabel,
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="flex min-h-dvh flex-1 flex-col">{children}</div>;
}
