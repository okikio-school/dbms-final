import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import dynamic from "next/dynamic";
const Editor = dynamic(() => import("@/components/editor.tsx"), { ssr: false });

export default function EditorPage() {
  // Renders the editor instance using a React component.
  return (
    <div className="py-48 mx-auto max-w-screen-md">
      <Button>
        Add Cover
      </Button>
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
      
      <input
        type={"text"}
        className={cn(
          "flex text-inherit text-[length:inherit] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        )} 
        placeholder="Title..." 
      />
      </h1>
      <div className="border border-slate-200 rounded-xl py-8 h-full min-h-[90svh] overflow-hidden">
        <Editor />
      </div>
    </div>
  );
}
