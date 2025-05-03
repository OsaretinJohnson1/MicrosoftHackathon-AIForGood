'use client'

import Link from "next/link"
import { signOut, useSession } from "next-auth/react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {HelpCircle, LogOut, Settings } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "../ui/button";


export default function ProfileDropdown(){
    const {data: session} = useSession();

    const user = {
        name: session?.user?.name,
        email: session?.user?.email,
        avatar: session?.user?.image,
        unreadNotifications: 0,
    }


    return <DropdownMenu>
    <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name || ""} />
                <AvatarFallback>
                    {user.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")}
                </AvatarFallback>
            </Avatar>
        </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
            </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
     <DropdownMenuItem asChild>
            <Link href="/user-dashboard/profile">
                <Avatar className="mr-2 h-4 w-4" />
                Profile
            </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
            <Link href="/user-dashboard/settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
            </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
            <Link href="/user-dashboard/support">
                <HelpCircle className="mr-2 h-4 w-4" />
                Support
            </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator /> 
        <DropdownMenuItem asChild>
            <button onClick={()=>{signOut()}}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
            </button>
        </DropdownMenuItem>
    </DropdownMenuContent>
</DropdownMenu>
}