"use client";

import type { Metadata } from "next/types";

import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Something went wrong - Carl Post",
  description: "An error has occured, please try again later",
};

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <article className="max-w-[85ch] px-2 mx-auto py-16 ">
      <div className="max-w-[65ch] mx-auto text-center py-16">
        <header className="space-y-2 pt-8 pb-4">
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-8xl">
            Something went wrong!
          </h1>
          <Button
            variant={"ghost"}
            onClick={
              // Attempt to recover by trying to re-render the segment
              () => reset()
            }
          >
            Try again
          </Button>
          <Image
            src={"/carl-error.png"}
            alt={"Something went wrong..."}
            width={400}
            height={400}
            className="object-center mx-auto py-5"
          />
        </header>
      </div>
    </article>
  );
}