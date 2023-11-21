import type { AuthOptions } from "next-auth";

import { authOptions } from "./_options";
import NextAuth from "next-auth";

const handler = NextAuth(authOptions as unknown as AuthOptions);
export { handler as GET, handler as POST };
