
"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { pupils as allPupils, instructors } from "@/lib/data"
import { ArrowUpRight, PlusCircle } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

export default function PupilsPage() {
  const searchParams = useSearchParams();
  const schoolId = searchParams.get('schoolId') || '1';

  const [pupils, setPupils] = useState(allPupils);

  useEffect(() => {
    const schoolInstructors = instructors.filter(i => i.schoolId === schoolId);
    const schoolInstructorIds = schoolInstructors.map(i => i.id);
    setPupils(allPupils.filter(p => schoolInstructorIds.includes(p.instructorId)));
  }, [schoolId]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Pupils</CardTitle>
          <CardDescription>
            Manage your pupil records and track their progress.
          </CardDescription>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Pupil
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pupil</TableHead>
              <TableHead className="hidden md:table-cell">Contact</TableHead>
              <TableHead className="hidden md:table-cell">Overall Progress</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pupils.map((pupil) => {
              const overallProgress = Math.round(Object.values(pupil.progress).reduce((a, b) => a + b, 0) / Object.keys(pupil.progress).length);
              const instructor = instructors.find(i => i.id === pupil.instructorId);

              return (
              <TableRow key={pupil.id}>
                <TableCell>
                  <div className="flex items-center gap-4">
                    <Avatar className="hidden h-9 w-9 sm:flex">
                      <AvatarImage src={`https://placehold.co/100x100.png?text=${pupil.avatar}`} />
                      <AvatarFallback>{pupil.avatar}</AvatarFallback>
                    </Avatar>
                    <div className="grid gap-1">
                      <p className="text-sm font-medium leading-none">
                        {pupil.name}
                      </p>
                       <p className="text-sm text-muted-foreground md:hidden">
                        {pupil.email}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                    <div className="text-sm">{pupil.email}</div>
                    <div className="text-xs text-muted-foreground">{pupil.phone}</div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge variant={overallProgress > 75 ? "default" : "secondary"}>
                    {overallProgress}%
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button asChild variant="ghost" size="icon">
                    <Link href={`/pupils/${pupil.id}?instructorId=${pupil.instructorId}&schoolId=${instructor?.schoolId}`}>
                      <ArrowUpRight className="h-4 w-4" />
                      <span className="sr-only">View Pupil</span>
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            )})}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
