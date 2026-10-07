import type { Metadata } from "next";
import { AUTH_PAGE } from "@/lib/constants/auth";

export const metadata: Metadata = {
  title: AUTH_PAGE.signIn,
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
