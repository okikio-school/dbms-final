import { getServerSession, type AuthOptions } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/_options";
import SessionClient from "./session.client";

export default async function SessionServer({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions as unknown as AuthOptions);
  return <SessionClient session={session}>{children}</SessionClient>;
}
