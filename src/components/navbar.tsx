'use client'

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

import { navigationMenuTriggerStyle } from "@/components/ui/navigation-menu"

import Link from "next/link"

export function Navbar() {
    return (
        <NavigationMenu>
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
                <NavigationMenuItem>
                    <p>SEARCHBAR</p>
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
    );
}