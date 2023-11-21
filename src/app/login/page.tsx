import { UserAuthForm } from "@/components/user-auth";
import { getServerSession, type AuthOptions } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/_options";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default async function LoginPage() {
  const session = await getServerSession(authOptions as unknown as AuthOptions)
  const search = headers().get("x-search") ?? "";
  if (session?.user) {
    const searchParams = new URLSearchParams(search);
    const callbackUrl = searchParams.get("callbackUrl");
    redirect(callbackUrl ? callbackUrl : "/")
  }
  
  return (
    <div className="container relative grid h-[100dvh] flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex">
        <div className="absolute inset-0 bg-gray-50">
          <Image
            src="https://images.pexels.com/photos/19036675/pexels-photo-19036675/free-photo-of-interior-of-rijksmueum-research-library.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
            alt="Authentication"
            fill
            className="block"
          />
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;This library has saved me countless hours of work and
              helped me deliver stunning designs to my clients faster than
              ever before.&rdquo;
            </p>
            <footer className="text-sm">Sofia Davis</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Log in to your account
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your email below to login
            </p>
          </div>
          <UserAuthForm type="login" />
          <p className="px-8 text-center text-sm text-muted-foreground">
            By clicking continue, you agree to our{" "}
            <Link
              href="/terms"
              className="underline underline-offset-4 hover:text-primary"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="underline underline-offset-4 hover:text-primary"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
