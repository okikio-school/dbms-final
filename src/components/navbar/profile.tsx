"use client";

import {
  NavigationMenuItem,
  NavigationMenuLink,
} from "../ui/navigation-menu";

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
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";

export function NavbarProfile() {
  const session = useSession();
  if (session.data?.user) {
    return (
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
    );
  }

  return (
    <>
      <NavigationMenuItem>
        <Link href="/login" legacyBehavior passHref>
          <NavigationMenuLink className={navigationMenuTriggerStyle()}>
            Login/Signup
          </NavigationMenuLink>
        </Link>
      </NavigationMenuItem>
    </>
  )
}
