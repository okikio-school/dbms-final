// import { authOptions } from "@/pages/api/auth/[...auth]";
// import { SessionProvider } from "next-auth/react";
// import { getServerSession } from "next-auth";

export default function Session({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
  // const session = await getServerSession(authOptions);
  // return <SessionProvider session={session}>{children}</SessionProvider>;
}
