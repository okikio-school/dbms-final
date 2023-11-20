"use client";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "./ui/navigation-menu";

import { Command, CommandInput } from "@/components/ui/command";
import { CommandMenu } from "./command-menu";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import {
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuShortcut,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";

export function Navbar() {
  const session = useSession();
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
        {session.data?.user ? (
          <NavigationMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-full w-full p-1 rounded-full">
                  <Avatar>
                    <AvatarImage src={session.data?.user?.image!} alt="@okikio" />
                    <AvatarFallback>ME</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 z-[1010]" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{session?.data?.user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {session?.data?.user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      Profile
                      <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                  Log out
                  <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </NavigationMenuItem>
        ) : (
          <>
            <NavigationMenuItem>
              <Link href="/login" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Login/Signup
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </>
        )}
      </NavigationMenuList>
      <CommandMenu />
    </NavigationMenu>
  );
}
