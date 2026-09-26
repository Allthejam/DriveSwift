
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { schools as allSchools, instructors as allInstructors, pupils as allPupils, lessons as allLessons, signupRequests as allSignupRequests, subscriptionTierPrices, type School, type Instructor } from "@/lib/data";
import { Bar, BarChart, CartesianGrid, Line, LineChart, Pie, PieChart, Sector, Tooltip, XAxis, YAxis } from "recharts";
import { Building, GraduationCap, Users, BookOpen, Clock, PoundSterling, Database, LogIn, FileUp, UserX } from "lucide-react";
import { format, parseISO } from 'date-fns';
import Link from 'next/link';
import { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const chartConfig = {
    schools: {
        label: "Schools",
    },
    pdi: {
        label: "PDI",
        color: "hsl(var(--chart-1))",
    },
    adi: {
        label: "ADI",
        color: "hsl(var(--chart-2))",
    },
     solo: {
        label: "Solo",
        color: "hsl(var(--chart-2))",
    },
    school: {
        label: "School",
        color: "hsl(var(--chart-3))",
    },
    academy: {
        label: "Academy",
        color: "hsl(var(--chart-4))",
    },
    enterprise: {
        label: "Enterprise",
        color: "hsl(var(--chart-5))",
    },
    count: {
        label: "Count",
        color: "hsl(var(--primary))",
    },
    revenue: {
        label: "Revenue",
        color: "hsl(var(--chart-2))",
    }
}

export default function AnalyticsPage() {
    const [schools, setSchools] = useState<School[]>([]);
    const [instructors, setInstructors] = useState<Instructor[]>([]);
    const [pupils, setPupils] = useState<any[]>([]);
    const [lessons, setLessons] = useState<any[]>([]);
    const [signupRequests, setSignupRequests] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setSchools(allSchools);
        setInstructors(allInstructors);
        setPupils(allPupils);
        setLessons(allLessons);
        setSignupRequests(allSignupRequests);
        setIsLoading(false);
    }, []);

    const signupsByMonth = signupRequests.reduce((acc, req) => {
        const month = format(parseISO(req.date), 'MMM yyyy');
        acc[month] = (acc[month] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const signupsChartData = Object.entries(signupsByMonth).map(([month, count]) => ({ month, schools: count })).sort((a,b) => new Date(a.month).getTime() - new Date(b.month).getTime());

    const accountTypes = instructors.reduce((acc, instructor) => {
        const type = instructor.accountType.toLowerCase();
        acc[type] = (acc[type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const accountTypesChartData = Object.entries(accountTypes).map(([name, value]) => ({ name: name.toUpperCase(), value, fill: `var(--color-${name})` }));
    
    const subscriptionTiers = schools.reduce((acc, school) => {
        const tier = school.subscriptionTier;
        acc[tier] = (acc[tier] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const subscriptionTiersChartData = Object.entries(subscriptionTiers).map(([tier, count]) => ({
        tier: chartConfig[tier as keyof typeof chartConfig]?.label || tier,
        count
    }));

    const monthlyRevenue = schools.reduce((total, school) => {
        if (school.subscriptionStatus === 'active' || school.subscriptionStatus === 'trial') {
            return total + (subscriptionTierPrices[school.subscriptionTier] || 0);
        }
        return total;
    }, 0);

    // This is a simplified projection for the chart. A real implementation would use historical payment data.
    const revenueChartData = [
        { month: 'Jan', revenue: monthlyRevenue * 0.5 },
        { month: 'Feb', revenue: monthlyRevenue * 0.6 },
        { month: 'Mar', revenue: monthlyRevenue * 0.75 },
        { month: 'Apr', revenue: monthlyRevenue * 0.8 },
        { month: 'May', revenue: monthlyRevenue * 0.9 },
        { month: 'Jun', revenue: monthlyRevenue },
    ];


    const recentSignups = [...signupRequests].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
    const cancelledAccounts = schools.filter(s => s.subscriptionStatus === 'cancelled').slice(0, 5);
    
    if (isLoading) {
        return (
            <div className="space-y-6">
                 <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-4 w-24" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-8 w-16 mb-2" />
                                <Skeleton className="h-3 w-32" />
                            </CardContent>
                        </Card>
                    ))}
                 </div>
                 <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                     {Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-5 w-32 mb-2" />
                                <Skeleton className="h-4 w-48" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-[250px] w-full" />
                            </CardContent>
                        </Card>
                    ))}
                 </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Schools</CardTitle>
                        <Building className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{schools.length}</div>
                        <p className="text-xs text-muted-foreground">Currently on the platform</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Instructors</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{instructors.length}</div>
                         <p className="text-xs text-muted-foreground">Across all schools</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Pupils</CardTitle>
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pupils.length}</div>
                         <p className="text-xs text-muted-foreground">Currently learning</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Lessons</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{lessons.length}</div>
                         <p className="text-xs text-muted-foreground">Logged in the system</p>
                    </CardContent>
                </Card>
                <Card className="bg-green-50 border-green-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-green-800">Monthly Revenue</CardTitle>
                        <PoundSterling className="h-4 w-4 text-green-700" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-800">£{monthlyRevenue.toFixed(2)}</div>
                         <p className="text-xs text-green-700">Estimated monthly recurring revenue</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                 <Card>
                    <CardHeader>
                        <CardTitle>New School Sign-ups</CardTitle>
                        <CardDescription>A summary of new schools joining the platform.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="h-[250px] w-full">
                            <BarChart data={signupsChartData} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                                <YAxis />
                                <Tooltip content={<ChartTooltipContent />} />
                                <Bar dataKey="schools" fill="hsl(var(--primary))" radius={4} />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Subscription Tiers</CardTitle>
                        <CardDescription>Distribution of active subscription plans.</CardDescription>
                    </CardHeader>
                     <CardContent>
                        <ChartContainer config={chartConfig} className="h-[250px] w-full">
                           <BarChart data={subscriptionTiersChartData} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="tier" tickLine={false} axisLine={false} tickMargin={8} />
                                <YAxis />
                                <Tooltip content={<ChartTooltipContent />} />
                                <Bar dataKey="count" fill="hsl(var(--primary))" radius={4} />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Instructor Account Types</CardTitle>
                        <CardDescription>Distribution of PDI vs ADI accounts.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center">
                        <ChartContainer config={chartConfig} className="h-[250px] w-full">
                            <PieChart>
                                <Tooltip content={<ChartTooltipContent nameKey="name" />} />
                                <Pie data={accountTypesChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} />
                            </PieChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Platform Revenue</CardTitle>
                        <CardDescription>A simplified projection of monthly subscription revenue.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="h-[250px] w-full">
                            <LineChart data={revenueChartData} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                                <YAxis tickFormatter={(value) => `£${value}`} />
                                <Tooltip content={<ChartTooltipContent formatter={(value) => `£${value}`} />} />
                                <Line dataKey="revenue" type="monotone" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={true} />
                            </LineChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Firebase Usage (Mock Data)</CardTitle>
                        <CardDescription>A mock report of key Firebase service usage for cost monitoring.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>This is simulated data</AlertTitle>
                            <AlertDescription>In a live app, this would connect to Firebase monitoring APIs.</AlertDescription>
                        </Alert>
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="p-4 bg-muted rounded-lg">
                                <h4 className="text-sm font-medium text-muted-foreground">Firestore Reads</h4>
                                <p className="text-2xl font-bold">{(pupils.length * 100).toLocaleString()}</p>
                                <p className="text-xs text-muted-foreground">past 30 days</p>
                            </div>
                            <div className="p-4 bg-muted rounded-lg">
                                <h4 className="text-sm font-medium text-muted-foreground">Firestore Writes</h4>
                                <p className="text-2xl font-bold">{(pupils.length * 20).toLocaleString()}</p>
                                <p className="text-xs text-muted-foreground">past 30 days</p>
                            </div>
                             <div className="p-4 bg-muted rounded-lg">
                                <h4 className="text-sm font-medium text-muted-foreground">Authentication</h4>
                                <p className="text-2xl font-bold">{instructors.length + pupils.length}</p>
                                <p className="text-xs text-muted-foreground">Active Users</p>
                            </div>
                             <div className="p-4 bg-muted rounded-lg">
                                <h4 className="text-sm font-medium text-muted-foreground">Genkit Calls</h4>
                                <p className="text-2xl font-bold">{(instructors.length * 5).toLocaleString()}</p>
                                <p className="text-xs text-muted-foreground">past 30 days</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
             </div>
             <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Sign-ups</CardTitle>
                        <CardDescription>The latest schools to join the platform, pending approval.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>School Name</TableHead>
                                    <TableHead>Owner</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentSignups.map(req => (
                                    <TableRow key={req.id}>
                                        <TableCell className="font-medium">{req.schoolName}</TableCell>
                                        <TableCell>{req.ownerName}</TableCell>
                                        <TableCell><Badge variant="secondary">{req.accountType}</Badge></TableCell>
                                        <TableCell>{format(parseISO(req.date), 'dd/MM/yyyy')}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><UserX /> Inactive / Cancelled Schools</CardTitle>
                        <CardDescription>A list of recently churned or inactive accounts.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>School Name</TableHead>
                                    <TableHead>Owner</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {cancelledAccounts.length > 0 ? cancelledAccounts.map(school => {
                                    const owner = instructors.find(i => i.id === school.ownerId);
                                    return (
                                        <TableRow key={school.id}>
                                            <TableCell className="font-medium">{school.name}</TableCell>
                                            <TableCell>{owner?.name || 'N/A'}</TableCell>
                                            <TableCell><Badge variant="destructive">{school.subscriptionStatus}</Badge></TableCell>
                                        </TableRow>
                                    )
                                }) : (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center">No cancelled accounts found.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
             </div>
        </div>
    )
}

    