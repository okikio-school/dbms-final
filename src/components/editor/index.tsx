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
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";

import dynamic from "next/dynamic";

import { Check, ChevronsUpDown, SplitSquareHorizontal } from "lucide-react";
import { useEffect, useState } from "react";

import Markdown from "react-markdown";
import { Label } from "@/components/ui/label";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";

import useFormPersist from 'react-hook-form-persist'
import { Checkbox } from "@/components/ui/checkbox";

import { getPost, newPost, savePost } from "@/lib/actions";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "../ui/use-toast";
import Link from "next/link";

const Editor = dynamic(() => import("./editor.tsx"), { ssr: false });

const FormSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  content: z.string(),
  publishedStatus: z.boolean(),
  isFeatured: z.boolean(),
  metadata: z.object({
    title: z.string(),
    description: z.string().optional(),
  }).optional(),
  type: z.enum(['post', 'page']),
  publishedDate: z.date().optional(),
  updatedDate: z.date().optional(),
});


const publishStatuses = [
  { label: "Publish", value: true },
  { label: "Draft", value: false },
] as const

export default function EditorPage({ postId, versionId, initialPost }: { postId: string, versionId: number, initialPost: z.infer<typeof FormSchema>  }) {
  // Stores the editor's contents as Markdown.
  const [mode, setMode] = useState<"edit" | "split" | "preview">("edit");
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: Object.assign({}, {
      title: "",
      description: "",
      content: "",
      publishedStatus: false,
      isFeatured: false,
      metadata: {
        title: "",
        description: "",
      },
      type: "post",
      publishedDate: new Date()
    }, initialPost)
  });

  // useFormPersist("editorState", {
  //   watch: form.watch,
  //   setValue: form.setValue,
  //   storage: globalThis?.localStorage
  // })

  function onSubmit(data: z.infer<typeof FormSchema>) {
    console.log(data);

    (async () => {
      const post = await savePost({
        title: data.title,
        description: data.description,
        content: data.content,
        publishedStatus: data.publishedStatus,
        isFeatured: data.isFeatured,
        metadata: data.metadata,
        type: data.type,
        publishedDate: data.publishedDate!.toString(),
        updatedDate: new Date().toString(),
        postId,
        versionId
      });
      console.log({
        post
      })

      if (!(post && post.postId && typeof post.version === "number")) {
        toast({ title: "Something went wrong saving your post. Please try again." });
      } else { 
        toast({ title: "Saved!" });
      }
      // console.log(await listPostVersions())

    })()
  }

  return (
    <div className="pt-20 pb-24 w-full max-h-screen mx-auto max-w-screen-lg xl:max-w-screen-xl">

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex bg-background h-full flex-col">
          <div className="z-[1005] container px-2 sticky top-20">
            <div className={cn(
              "backdrop-blur-md border border-muted bg-muted/80 rounded-full",
              "flex flex-row items-center px-4 py-4 sm:space-y-0 md:h-16"
            )}>
              <h2 className="text-lg font-semibold max-w-xs truncate">{(form.watch("title") || "New Post")}</h2>
              <div className="flex-grow"></div>
              <div className="flex space-x-2">

                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline">
                      <span className="sr-only">Show history</span>
                      <CounterClockwiseClockIcon className="h-4 w-4" />
                    </Button>
                  </SheetTrigger>

                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>History</SheetTitle>
                      <SheetDescription>
                        History...
                      </SheetDescription>
                    </SheetHeader>

                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                          Name
                        </Label>
                        <Input id="name" value="Pedro Duarte" className="col-span-3" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="username" className="text-right">
                          Username
                        </Label>
                        <Input id="username" value="@peduarte" className="col-span-3" />
                      </div>
                    </div>

                    <SheetFooter>
                      <SheetClose asChild>
                        <Button type="submit">Save changes</Button>
                      </SheetClose>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>

                <Button variant="outline" asChild>
                  <Link href={`/post/${postId}/${versionId}`}>
                    Preview
                  </Link>
                </Button>
                <Button type="submit" className={cn({ hidden: form.watch("publishedStatus") })}>Save</Button>
                <Button type="submit" className={cn({ hidden: !form.watch("publishedStatus") })}>Publish</Button>
                {/* <EditorActions /> */}
              </div>
            </div>

          </div>

          <div className="px-2 py-4 flex flex-col">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only">Title</FormLabel>

                  <FormControl>
                    <textarea
                      maxLength={150}
                      placeholder="Article Title…"
                      className={cn(
                        "w-full scroll-m-20 text-3xl font-bold resize-none min-h-[40px]",
                        "min-h-[1em] rounded-md bg-background px-3 py-2 ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
                        "h-[calc(1lh+1rem)]"
                      )}
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only">Description</FormLabel>

                  <FormControl>
                    <textarea
                      maxLength={150}
                      placeholder="Description…"
                      className={cn(
                        "w-full scroll-m-20 text-xl font-normal resize-none",
                        "min-h-[40px] rounded-md bg-background px-3 py-2 ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                      )}
                      {...field}
                    />
                  </FormControl>
                </FormItem>
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
            <div className="container h-full px-4">
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

                    <FormField
                      control={form.control}
                      name="publishedStatus"
                      render={({ field }) => (
                        <FormItem className="flex flex-col gap-3 space-y-0 py-2">
                          <FormLabel>
                            Status
                          </FormLabel>

                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  role="combobox"
                                  className={cn(
                                    "w-[150px] flex items-center",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {publishStatuses.find(
                                      (language) => Boolean(language.value) === field.value
                                    )?.label ?? "+ Set status"}
                                  <div className="flex-grow"></div>
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                              <Command>
                                <CommandInput placeholder="Change status..." />
                                <CommandList>
                                  <CommandEmpty>No results found.</CommandEmpty>
                                  <CommandGroup>
                                    {publishStatuses.map((status) => (
                                      <CommandItem
                                        key={status.label}
                                        value={status.label}
                                        onSelect={() => {
                                          form.setValue("publishedStatus", Boolean(status.value))
                                        }}
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            status.value === field.value
                                              ? "opacity-100"
                                              : "opacity-0"
                                          )}
                                        />
                                        {status.label}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </FormItem>
                      )}
                    />
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
                          <Editor markdown={form.getValues().content ?? ""} setMarkdown={(x) => form.setValue("content", x)} />
                        </div>

                        <div className="">
                          <div className={cn(
                            "h-full min-h-[300px] rounded-md border bg-muted lg:min-h-[700px] px-14 py-8",
                            { "hidden": !["split", "preview"].includes(mode) },
                            `
                              prose prose-slate
                              max-w-full
                              prose-headings:scroll-m-20 prose-headings:text-inherit prose-headings:my-0 prose-headings:border-b-foreground
                              prose-h1:text-3xl prose-h1:font-bold prose-h1:lg:text-5xl lg:prose-h1:leading-[1.5]
                              prose-h2:text-3xl prose-h2:border-b prose-h2:pb-2 prose-h2:lg:text-4xl prose-h2:font-semibold
                              prose-h2:transition-colors prose-h2:first:mt-0
                              prose-h3:text-2xl prose-h3:font-semibold
                              prose-h4:text-xl prose-h4:font-semibold
                              prose-p:my-0
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
                            <Markdown>{form.watch("content")}</Markdown>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </Tabs>
        </form>
      </Form>
    </div>
  );
}
