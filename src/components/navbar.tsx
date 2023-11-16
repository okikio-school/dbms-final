'use client'

import * as React from "react"

import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuIndicator,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    NavigationMenuViewport,
} from "./ui/navigation-menu"

import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
    CommandDialog
} from "@/components/ui/command"

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"

import { navigationMenuTriggerStyle } from "@/components/ui/navigation-menu"

import { Input } from "@/components/ui/input"

import Link from "next/link"

export function Navbar() {
    return (
        <NavigationMenu className="flex max-w-full w-full">
            <NavigationMenuList>
                <NavigationMenuItem>
                    <Link href="/" legacyBehavior passHref>
                        <NavigationMenuLink className={navigationMenuTriggerStyle()}>Home Feed</NavigationMenuLink>
                    </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <Link href="/fyp" legacyBehavior passHref>
                        <NavigationMenuLink className={navigationMenuTriggerStyle()}>For You</NavigationMenuLink>
                    </Link>
                </NavigationMenuItem>
            </NavigationMenuList>
            <div className="flex flex-grow"></div>
            <NavigationMenuList className="flex justify-end">
                <NavigationMenuItem>
                    <Command>
                        <CommandInput placeholder="Search Posts/Authors/Tags"/>
                    </Command>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <p className="text-sm text-muted-foreground">
                        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                            <span className="text-xs">⌘</span>K
                        </kbd>
                    </p>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <Link href="/profile" legacyBehavior passHref>
                        <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                            <Avatar>    
                                <AvatarImage src="https://github.com/okikio.png" alt="@okikio" />
                                <AvatarFallback>ME</AvatarFallback> 
                            </Avatar>
                        </NavigationMenuLink>
                    </Link>
                </NavigationMenuItem>
            </NavigationMenuList>
            <CommandMenu/>
        </NavigationMenu>
    );
}

export function CommandMenu() {
    const [open, setOpen] = React.useState(false)
   
    React.useEffect(() => {
      const down = (e: KeyboardEvent) => {
        if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
          e.preventDefault()
          setOpen((open) => !open)
        }
      }
      document.addEventListener("keydown", down)
      return () => document.removeEventListener("keydown", down)
    }, [])
   
    return (
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search Posts/Authors/Tags" />
      </CommandDialog>
    )
  }