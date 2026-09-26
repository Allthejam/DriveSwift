
"use client"

import { Suspense } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { pupils } from "@/lib/data"
import { Car, ChevronDown, LogOut, User, LayoutDashboard, BookOpen, CalendarPlus } from "lucide-react"
import Link from "next/link"

export default function PupilDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pupil = pupils[0];

  return (
    <div className="bg-background min-h-screen">
      <header className="flex items-center h-16 px-4 border-b shrink-0 md:px-6 sticky top-0 bg-background z-50">
        <Link href="/pupil-dashboard" className="flex items-center gap-2 text-lg font-semibold sm:text-base mr-4">
          <Car className="w-6 h-6 text-primary" />
          <span className="font-bold">DriveSwift</span>
          <span className="font-normal text-muted-foreground">| Pupil Portal</span>
        </Link>
        <div className="ml-auto flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                      <AvatarImage src={pupil.avatarUrl || `https://placehold.co/100x100.png?text=${pupil.avatar}`} />
                      <AvatarFallback>{pupil.avatar}</AvatarFallback>
                  </Avatar>
                  <span>{pupil.name}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/pupil-dashboard">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                    </Link>
                </DropdownMenuItem>
                 <DropdownMenuItem asChild>
                  <Link href="/pupil-dashboard/booking">
                    <CalendarPlus className="mr-2 h-4 w-4" />
                    <span>Book a Lesson</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/pupil-dashboard/profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>My Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/pupil-dashboard/training-aids">
                    <BookOpen className="mr-2 h-4 w-4" />
                    <span>Training Aids</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                   <Link href="/">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </header>
      <main>
        <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading pupil portal...</div>}>
          {children}
        </Suspense>
      </main>
    </div>
  )
}
