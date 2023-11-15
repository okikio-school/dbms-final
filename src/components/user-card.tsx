"use client";

import type { users } from "@/db/schema";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { EditForm } from "@/components/edit-card";

type CardProps = ComponentProps<typeof Card> & { user: typeof users.$inferSelect }

export function UserCard({ className, ...props }: CardProps) {
  return (
    <Card className={cn("w-full", className)} {...props}>
      <CardHeader>
        <CardTitle>{props.user.name}</CardTitle>
        <CardDescription>{props.user.bio}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <EditForm user={props.user} />
      </CardContent>
    </Card>
  )
}

