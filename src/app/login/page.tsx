'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Car, Shield, Building, GraduationCap, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await login(email, password);
      toast({
        title: "Welcome Back!",
        description: "Logged in successfully with Firebase.",
      });
      router.push('/dashboard?instructorId=super-admin');
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: err.message || "Invalid credentials. Please check your email and password.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="mx-auto w-full max-w-md">
        <CardHeader className="text-center">
           <Link href="/" className="mb-4 inline-flex items-center justify-center">
            <Car className="h-12 w-12 text-primary" />
          </Link>
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>Log in to your DriveSwift account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="admin@driveswift.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="ml-auto inline-block text-sm underline">
                  Forgot your password?
                </Link>
              </div>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                'Sign in'
              )}
            </Button>
            <div className="mt-4 text-center text-sm">
                Don&apos;t have an account?{' '}
                <Link href="/sign-up" className="underline">
                  Sign up
                </Link>
            </div>
          </form>

          <Separator className="my-6" />

          <div className="space-y-3">
             <CardTitle className="text-base text-center text-muted-foreground font-medium pb-2">One-Click Mock Logins</CardTitle>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/dashboard?schoolId=school-elite&instructorId=instructor-elite">
                <Building className="mr-2 h-4 w-4" />
                Login as Admin for Elite Driving Academy
              </Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/dashboard?schoolId=school-driveswift&instructorId=instructor-driveswift-alex">
                <Building className="mr-2 h-4 w-4" />
                Login as Admin for DriveSwift Academy
              </Link>
            </Button>
             <Button variant="outline" className="w-full" asChild>
              <Link href="/dashboard?schoolId=school-citylearners&instructorId=instructor-citylearners-mike">
                 <Building className="mr-2 h-4 w-4" />
                Login as Admin for City Learners
              </Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
                <Link href="/pupil-dashboard">
                    <GraduationCap className="mr-2 h-4 w-4" />
                    Login as Pupil
                </Link>
            </Button>
             <Button variant="outline" className="w-full" asChild>
              <Link href="/dashboard?instructorId=super-admin">
                <Shield className="mr-2 h-4 w-4" />
                Login as Super Admin
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
