"use client";

import type { ComponentProps } from "react";
import { BellRing, Check, PencilIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
 
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Input } from "@/components/ui/input"
import { useState } from "react"

import type { users } from "@/db/schema";
import { getUsers } from "@/lib/actions";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EditForm } from "@/components/edit-card";

type CardProps = ComponentProps<typeof Card> & { user: typeof users.$inferSelect }

export function UserCard({ className, ...props }: CardProps) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Card className={cn("w-full", className)} {...props}>
      <CardHeader>
        <CardTitle>{props.user.name}</CardTitle>
        <CardDescription>{props.user.bio}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Collapsible
          open={isOpen}
          onOpenChange={setIsOpen}
          className="w-full space-y-2"
        >
          <div className="flex items-center justify-between space-x-4">
            <CollapsibleTrigger asChild>
              <Button variant="secondary" size="sm" className="flex gap-2 px-3">
                <PencilIcon className="h-4 w-4" />
                <span>Edit</span>
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="space-y-2">
            <EditForm user={props.user} />
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  )
}

