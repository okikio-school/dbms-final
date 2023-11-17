import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";
import SessionClient from "./session.client";

export default async function SessionServer({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  return <SessionClient session={session}>{children}</SessionClient>;
}
