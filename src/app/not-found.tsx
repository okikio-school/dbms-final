import type { Metadata } from "next/types";

import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "404 Not Found - Carl Post",
  description: "Couldn't find that page, please try again later",
};

export default function NotFound() {
  return (
    <article className="max-w-[85ch] px-2 mx-auto py-16 ">
      <div className="max-w-[65ch] mx-auto text-center py-16">
        <header className="space-y-2 pt-8 pb-4">
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-6xl">
            Not Found!
          </h1>
          <p className="pb-5">
            <span>We couldn't find that page, please try again later or </span>
            <Link
              href="/"
              className="text-sm font-semibold text-primary underline underline-offset-4"
            >
              Return Home
            </Link>
          </p>
          <Image
            src={"/carl-error.png"}
            alt={"Something went wrong..."}
            width={400}
            height={400}
            className="object-center mx-auto"
          />
        </header>
      </div>
    </article>
  );
}
