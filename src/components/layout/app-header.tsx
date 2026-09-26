

"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { LogOut, User, ChevronDown, LayoutDashboard, Users, Bot, BookOpen, Car, Calendar, UserPlus, Shield, Building, Edit, Home, Mail, Inbox, MessageSquare, BarChart, ExternalLink } from "lucide-react"
import { usePathname, useSearchParams } from "next/navigation"
import Link from "next/link"
import { instructors, schools, contactSubmissions } from "@/lib/data"
import { useEffect, useState } from "react"
import { Badge } from "../ui/badge"

function getTitleFromPath(path: string): string {
    const segments = path.split('/').filter(Boolean);
    if (segments.length === 0) return 'Dashboard';
    if (segments.length > 0 && segments[0] === 'dashboard') return 'Dashboard';


    const lastSegment = segments[segments.length - 1];
    
    // Check if last segment is a pupil ID
    if (segments.length > 1 && segments[segments.length - 2] === 'pupils') {
        return "Pupil Details";
    }

    return lastSegment
        .replace(/-/g, ' ')
        .replace(/\b\w/g, char => char.toUpperCase());
}


export function AppHeader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const instructorId = searchParams.get('instructorId') || '1';
  const schoolId = searchParams.get('schoolId') || '1';
  const isSuperAdmin = instructorId === 'super-admin';
  
  const [instructor, setInstructor] = useState(instructors.find(i => i.id === instructorId));
  const [school, setSchool] = useState(schools.find(s => s.id === schoolId));
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    setInstructor(instructors.find(i => i.id === instructorId));
    setSchool(schools.find(s => s.id === schoolId));
  }, [instructorId, schoolId]);

  useEffect(() => {
    if (instructor) {
        const messages = contactSubmissions.filter(cs => cs.email.toLowerCase() === instructor.email.toLowerCase());
        const count = messages.reduce((acc, msg) => {
            return acc + (msg.replies?.filter(r => r.from === 'Super Admin' && !r.isRead).length || 0);
        }, 0);
        setUnreadMessages(count);
    }
  }, [instructor]);


  let title = getTitleFromPath(pathname);
   if (pathname.startsWith('/cms')) {
    title = "Landing Page CMS";
  }


  const name = isSuperAdmin ? "Super Admin" : instructor?.name;
  const initials = isSuperAdmin ? "SA" : instructor?.name.split(' ').map(n => n[0]).join('') || 'IN';
  
  const schoolName = isSuperAdmin ? "All Schools" : school?.name;
  const linkParams = isSuperAdmin ? `instructorId=super-admin` : `instructorId=${instructorId}&schoolId=${schoolId}`;


  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6 sticky top-0 z-50">
        <Link href={`/dashboard?${linkParams}`} className="flex items-center gap-2 font-semibold">
          <Car className="h-6 w-6 text-primary" />
          <div className="hidden sm:flex flex-col items-start leading-tight">
            <span className="">DriveSwift</span>
            <span className="text-xs text-muted-foreground">{schoolName}</span>
          </div>
        </Link>
        <div className="flex-1">
            <h1 className="text-lg font-semibold md:text-2xl ml-4">{title}</h1>
        </div>

        <div className="flex-1 flex justify-center">
            {isSuperAdmin && pathname !== '/dashboard' && (
                <Button asChild variant="outline">
                    <Link href={`/dashboard?${linkParams}`}>
                        <LayoutDashboard className="mr-2" /> Back to Dashboard
                    </Link>
                </Button>
            )}
        </div>


        <div className="ml-auto flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                      <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline-block">{name}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <DropdownMenuItem asChild>
                    <Link href={`/dashboard?${linkParams}`}>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                    </Link>
                </DropdownMenuItem>

                {isSuperAdmin ? (
                     <>
                        <DropdownMenuItem asChild>
                            <Link href={`/schools?${linkParams}`}>
                                <Building className="mr-2 h-4 w-4" /> 
                                <span>Schools</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={`/analytics?${linkParams}`}>
                                <BarChart className="mr-2 h-4 w-4" />
                                <span>Analytics</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Site Management</DropdownMenuLabel>
                         <DropdownMenuItem asChild>
                            <Link href={`/newsletter-admin?${linkParams}`}>
                                <Mail className="mr-2 h-4 w-4" /> 
                                <span>Newsletter Admin</span>
                            </Link>
                        </DropdownMenuItem>
                         <DropdownMenuItem asChild>
                            <Link href={`/contact-submissions?${linkParams}`}>
                                <Inbox className="mr-2 h-4 w-4" /> 
                                <span>Contact Submissions</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={`/cms?${linkParams}`}>
                                <Edit className="mr-2 h-4 w-4" /> 
                                <span>Edit Landing Page</span>
                            </Link>
                        </DropdownMenuItem>
                         <DropdownMenuItem asChild>
                            <Link href="/" target="_blank">
                                <Home className="mr-2 h-4 w-4" /> 
                                <span>View Landing Page</span>
                            </Link>
                        </DropdownMenuItem>
                    </>
                ) : (
                    <>
                        <DropdownMenuItem asChild>
                            <Link href={`/dashboard?${linkParams}#inbox`}>
                                <div className="flex items-center w-full">
                                    <MessageSquare className="mr-2 h-4 w-4" />
                                    <span>Inbox</span>
                                    {unreadMessages > 0 && <Badge className="ml-auto">{unreadMessages}</Badge>}
                                </div>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={`/pupils?${linkParams}`}>
                                <Users className="mr-2 h-4 w-4" />
                                <span>Pupils</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={`/team-calendar?${linkParams}`}>
                                <Calendar className="mr-2 h-4 w-4" />
                                <span>Team Calendar</span>
                            </Link>
                        </DropdownMenuItem>
                         <DropdownMenuItem asChild>
                            <Link href={`/instructors?${linkParams}`}>
                                <UserPlus className="mr-2 h-4 w-4" />
                                <span>Instructors</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={`/lesson-planner?${linkParams}`}>
                                <Bot className="mr-2 h-4 w-4" />
                                <span>AI Lesson Planner</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={`/training-aids?${linkParams}`}>
                                <BookOpen className="mr-2 h-4 w-4" />
                                <span>Training Aids</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href={`/profile?${linkParams}`}>
                                <User className="mr-2 h-4 w-4" />
                                <span>Profile</span>
                            </Link>
                        </DropdownMenuItem>
                    </>
                )}

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
  )
}
