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
import { AnimatePresence, motion } from "framer-motion"

type CardProps = ComponentProps<typeof Card> & { user: typeof users.$inferSelect }

export function UserCard({ className, ...props }: CardProps) {
  return (
    <Card className={cn("w-full", className)} {...props}>
      <CardHeader>        
        <AnimatePresence initial={false}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <CardTitle>{props.user.name}</CardTitle>
          </motion.div>
        </AnimatePresence>
        <CardDescription>{props.user.bio}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <EditForm user={props.user} />
      </CardContent>
    </Card>
  )
}

