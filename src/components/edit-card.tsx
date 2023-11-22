"use client";

import type { users } from "@/db/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { PencilIcon } from "lucide-react";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { updateUserData } from "@/lib/actions";
import { mutate } from "swr";

const FormSchema = z.object({
  name: z.string().min(3, {
    message: "Name must longer than 3 characters",
  }),
  bio: z.string().max(160, {
    message: "Bio must not be longer than 160 characters.",
  }),
});

export function EditForm({ user }: { user: typeof users.$inferSelect }) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    (async () => {
      try {
        mutate(
          "/api/list-users",
          (currentData: NonNullable<typeof users.$inferSelect>[] = []) => {
            return currentData.map((item) =>
              item.userId === user.userId
                ? { ...item, ...(data as typeof users.$inferInsert) }
                : item
            );
          },
          false
        );
        await updateUserData(user.userId, data as typeof users.$inferInsert);
        toast({
          title: "Success! You submitted the following values:",
          description: (
            <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
              <code className="text-white">
                {JSON.stringify(data, null, 2)}
              </code>
            </pre>
          ),
        });
      } catch (e) {
        toast({
          title: "Error! We hit a snag while saving the values:",
          description: (
            <pre className="mt-2 w-[340px] rounded-md bg-red-950 p-4">
              <code className="text-white">
                {JSON.stringify(data, null, 2)}
              </code>
            </pre>
          ),
        });
      }
    })();
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm" className="flex gap-2 px-3">
          <PencilIcon className="h-4 w-4" />
          <span>Edit Profile</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
            <DialogHeader>
              <DialogTitle>Edit profile</DialogTitle>
              <DialogDescription>
                Make changes to users profile here. Click save when you're done.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="name"
                defaultValue={user.name}
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-1">
                    <FormLabel>Name</FormLabel>

                    <div className="space-y-4">
                      <FormControl>
                        <Input placeholder="John Doe..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                defaultValue={user.bio!}
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-1">
                    <FormLabel>Bio</FormLabel>

                    <div className="space-y-4">
                      <FormControl>
                        <Textarea
                          placeholder="Tell us a little bit about this person."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription></FormDescription>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="submit">Save changes</Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
