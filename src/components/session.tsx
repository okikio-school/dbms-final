"use client";

import { SessionProvider } from "next-auth/react";

export default function SessionClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SessionProvider>{children}</SessionProvider>;
}
