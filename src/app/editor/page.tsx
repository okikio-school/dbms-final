"use client";

import { protect, protectClient } from "@/lib/protect";
import { cn } from "@/lib/utils";

import { CounterClockwiseClockIcon } from "@radix-ui/react-icons"

import { Button } from "@/components/ui/button"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Separator } from "@/components/ui/separator"
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

import dynamic from "next/dynamic";
import { EditorSave } from "@/components/editor/save";
import { EditorActions } from "@/components/editor/actions";

import { SplitSquareHorizontal } from "lucide-react";
import { useState } from "react";
import Markdown from "react-markdown";

const Editor = dynamic(() => import("@/components/editor.tsx"), { ssr: false });

export default function EditorPage() {
  protectClient();

  // Stores the editor's contents as Markdown.
  const [markdown, setMarkdown] = useState<string>("");
  const [mode, setMode] = useState<"edit" | "split" | "preview">("edit");

  return (
    <div className="pt-20 pb-24 w-full max-h-screen mx-auto max-w-screen-lg xl:max-w-screen-xl">
      <div className="flex bg-background h-full flex-col">
        <div className="container px-2 bg-background shadow-sm sticky top-20">
          <div className="flex flex-col items-start justify-between space-y-2 px-4 py-4 sm:flex-row sm:items-center sm:space-y-0 md:h-16">
            <h2 className="text-lg font-semibold">New Post</h2>
            <div className="flex space-x-2">

              <div className="flex items-center space-x-2">
                <Button>Publish</Button>
                <Button variant="secondary">
                  <span className="sr-only">Show history</span>
                  <CounterClockwiseClockIcon className="h-4 w-4" />
                </Button>
              </div>

              <EditorActions />
            </div>
          </div>

          <Separator />
        </div>

        <div className="px-2 py-4">
          <textarea
            maxLength={150}
            placeholder="Article Title…"
            className={cn(
              "w-full scroll-m-20 text-3xl font-bold resize-none min-h-[40px]",
              "min-h-[40px] rounded-md bg-background px-3 py-2 ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            )}
          />

          <textarea
            maxLength={150}
            placeholder="Description…"
            className={cn(
              "w-full scroll-m-20 text-xl font-normal resize-none",
              "min-h-[40px] rounded-md bg-background px-3 py-2 ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            )}
          />
        </div>


        <Tabs
          defaultValue={mode}
          className="flex-1"
          onValueChange={(value) => {
            setMode(value as "edit" | "split" | "preview");
          }}
        >
          <div className="container h-full px-4 py-6">
            <div className="grid w-full h-full gap-6 items-stretch md:grid-cols-[1fr_200px]">
              <div className="hidden flex-col space-y-4 sm:flex md:order-2">
                <div className="grid gap-2 sticky top-[10rem] ">
                  <HoverCard openDelay={200}>
                    <HoverCardTrigger asChild>
                      <span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Mode
                      </span>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-[320px] text-sm z-[1010]" side="bottom" align="center">
                      Choose the interface that best suits your task. You can
                      provide: a simple prompt to complete, starting and ending
                      text to insert a completion within, or some text with
                      instructions to edit it.
                    </HoverCardContent>
                  </HoverCard>

                  <TabsList className="grid grid-cols-2 sm:grid-cols-3">
                    <TabsTrigger value="edit">
                      <span className="sr-only">Editing</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="none"
                        className="h-5 w-5"
                      >
                        <rect
                          x="4"
                          y="3"
                          width="12"
                          height="2"
                          rx="1"
                          fill="currentColor"
                        ></rect>
                        <rect
                          x="4"
                          y="7"
                          width="12"
                          height="2"
                          rx="1"
                          fill="currentColor"
                        ></rect>
                        <rect
                          x="4"
                          y="11"
                          width="3"
                          height="2"
                          rx="1"
                          fill="currentColor"
                        ></rect>
                        <rect
                          x="4"
                          y="15"
                          width="4"
                          height="2"
                          rx="1"
                          fill="currentColor"
                        ></rect>
                        <rect
                          x="8.5"
                          y="11"
                          width="3"
                          height="2"
                          rx="1"
                          fill="currentColor"
                        ></rect>
                        <path
                          d="M17.154 11.346a1.182 1.182 0 0 0-1.671 0L11 15.829V17.5h1.671l4.483-4.483a1.182 1.182 0 0 0 0-1.671Z"
                          fill="currentColor"
                        ></path>
                      </svg>
                    </TabsTrigger>

                    <TabsTrigger className="hidden sm:flex" value="split">
                      <span className="sr-only">Split</span>
                      <SplitSquareHorizontal className="w-5 h-5" />
                    </TabsTrigger>

                    <TabsTrigger value="preview">
                      <span className="sr-only">Preview</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="none"
                        className="h-5 w-5"
                      >
                        <rect
                          x="4"
                          y="3"
                          width="12"
                          height="2"
                          rx="1"
                          fill="currentColor"
                        ></rect>
                        <rect
                          x="4"
                          y="7"
                          width="12"
                          height="2"
                          rx="1"
                          fill="currentColor"
                        ></rect>
                        <rect
                          x="4"
                          y="11"
                          width="3"
                          height="2"
                          rx="1"
                          fill="currentColor"
                        ></rect>
                        <rect
                          x="4"
                          y="15"
                          width="3"
                          height="2"
                          rx="1"
                          fill="currentColor"
                        ></rect>
                        <rect
                          x="8.5"
                          y="11"
                          width="3"
                          height="2"
                          rx="1"
                          fill="currentColor"
                        ></rect>
                        <rect
                          x="8.5"
                          y="15"
                          width="3"
                          height="2"
                          rx="1"
                          fill="currentColor"
                        ></rect>
                        <rect
                          x="13"
                          y="11"
                          width="3"
                          height="2"
                          rx="1"
                          fill="currentColor"
                        ></rect>
                      </svg>
                    </TabsTrigger>
                  </TabsList>

                  <div className="hidden md:flex items-center space-x-2">
                    <div className="flex-grow"></div>
                    <EditorSave />
                  </div>
                </div>
              </div>

              <div className="md:order-1">
                <div className="mt-0 border-0 p-0">
                  <div className="flex flex-col space-y-2">
                    <div className={cn(
                      "flex flex-col max-w-full w-full h-full gap-2 md:gap-6",
                      mode === "split" && "grid grid-rows-2 lg:grid-cols-2 lg:grid-rows-1"
                    )}>
                      <div className={cn(
                        "w-full max-w-full rounded-md border border-input bg-background text-sm",
                        "ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                        "py-2 md:py-6 min-h-[40px] md:min-h-[700px] lg:min-h-[700px]",
                        "max-w-full w-full h-full min-h-[300px] lg:min-h-[700px] xl:min-h-[700px]",
                        { "hidden": !["edit", "split"].includes(mode) }
                      )}>
                        <Editor setMarkdown={setMarkdown} />
                      </div>

                      <div className="">
                        <div className={cn(
                          "h-full min-h-[300px] rounded-md border bg-muted lg:min-h-[700px] px-14 py-8",
                          { "hidden": !["split", "preview"].includes(mode) },
                          `
                          prose prose-slate
                          prose-headings:scroll-m-20 prose-headings:text-inherit prose-headings:my-0 prose-headings:border-b-foreground
                          prose-h1:text-3xl prose-h1:font-bold prose-h1:lg:text-5xl
                          prose-h2:text-3xl prose-h2:border-b prose-h2:pb-2 prose-h2:lg:text-4xl prose-h2:font-semibold 
                          prose-h2:transition-colors prose-h2:first:mt-0
                          prose-h3:text-2xl prose-h3:font-semibold
                          prose-h4:text-xl prose-h4:font-semibold
                          prose-p:mt-0
                          prose-blockquote:mt-6 prose-blockquote:border-l-2 prose-blockquote:pl-6 prose-blockquote:italic
                          prose-ul:mt-0 prose-ul:mb-6 prose-ul:list-disc prose-ul:[&>li]:mt-2 
                          prose-ul:leading-9
                          prose-table:w-full 
                          prose-tr:m-0 prose-tr:border-t prose-tr:p-0 prose-tr:even:bg-muted
                          prose-th:border prose-th:px-4 prose-th:py-2 prose-th:text-left prose-th:font-bold prose-th:[&[align=center]]:text-center prose-th:[&[align=right]]:text-right
                          prose-td:border prose-td:px-4 prose-td:py-2 prose-td:text-left prose-td:[&[align=center]]:text-center prose-td:[&[align=right]]:text-right
                          prose-code:relative prose-code:rounded prose-code:bg-muted prose-code:px-[0.3rem] 
                          prose-code:py-[0.2rem] prose-code:font-dm-mono prose-code:text-sm prose-code:font-[500]
                          prose-pre:min-w-1/2 prose-pre:max-w-[45ch] prose-pre:mx-auto prose-pre:overflow-x-auto prose-pre:px-6 prose-pre:py-3 prose-pre:shadow-lg prose-pre:shadow-black prose-pre:font-mono
                          prose-pre:[&_code]:bg-transparent`
                        )}>
                          <Markdown>{markdown}</Markdown>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
