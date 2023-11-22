"use client";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "../ui/navigation-menu";

import { Command, CommandInput } from "@/components/ui/command";
import { CommandMenu } from "@/components/command-menu";

import { navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { NavbarProfile } from "./profile";

import Link from "next/link";

export function Navbar() {
  return (
    <NavigationMenu className="flex max-w-full w-full fixed top-0 left-0 z-[1005]">
      <div className="absolute top-0 left-0 w-full h-[150%] [mask-size:100%_85%] [mask-image:linear-gradient(black_60%,_transparent)] [mask-repeat:no-repeat] bg-white/[0.18] backdrop-blur-xl backdrop-saturate-200 z-10" />

      <NavigationMenuList className="relative z-10 p-2">
        <NavigationMenuItem>
          <Link href="/" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              Home Feed
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/for-you" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              For You
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>

      <div className="flex flex-grow"></div>

      <NavigationMenuList className="flex gap-1 relative z-10 p-2">
        <NavigationMenuItem>
          <Command>
            <CommandInput placeholder="Search Posts/Authors/Tags" />
          </Command>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <p className="text-sm text-muted-foreground">
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <span className="text-xs">⌘</span>K
            </kbd>
          </p>
        </NavigationMenuItem>

        <NavbarProfile />
      </NavigationMenuList>
      <CommandMenu />
    </NavigationMenu>
  );
}
