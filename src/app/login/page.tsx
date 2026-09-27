'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Car, Shield, Building, GraduationCap, Loader2, Eye, EyeOff } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { setPersistence, browserLocalPersistence, browserSessionPersistence } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    // Auto-fill email if remembered from a previous session
    if (typeof window !== 'undefined') {
      const savedEmail = localStorage.getItem('driveswift_remembered_email');
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (rememberMe) {
        await setPersistence(auth, browserLocalPersistence);
        localStorage.setItem('driveswift_remembered_email', email);
      } else {
        await setPersistence(auth, browserSessionPersistence);
        localStorage.removeItem('driveswift_remembered_email');
      }

      await login(email, password);
      toast({
        title: "Welcome Back!",
        description: "Logged in successfully.",
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
      <Card className="mx-auto w-full max-w-md shadow-xl border-border/60">
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
                <Link href="#" className="ml-auto inline-block text-xs text-primary hover:underline font-medium">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2 py-1">
              <Checkbox 
                id="remember" 
                checked={rememberMe} 
                onCheckedChange={(checked) => setRememberMe(!!checked)} 
              />
              <Label 
                htmlFor="remember" 
                className="text-xs font-normal text-muted-foreground cursor-pointer select-none"
              >
                Remember email & stay logged in
              </Label>
            </div>

            <Button type="submit" className="w-full font-semibold" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                'Sign in'
              )}
            </Button>
            
            <div className="mt-4 text-center text-xs text-muted-foreground">
                Don&apos;t have an account?{' '}
                <Link href="/sign-up" className="text-primary underline font-medium">
                  Sign up
                </Link>
            </div>
          </form>

          <Separator className="my-6" />

          <div className="space-y-3">
             <CardTitle className="text-xs text-center text-muted-foreground uppercase tracking-wider font-semibold pb-1">One-Click Mock Logins</CardTitle>
            <Button variant="outline" className="w-full text-xs" asChild>
              <Link href="/dashboard?schoolId=school-elite&instructorId=instructor-elite">
                <Building className="mr-2 h-3.5 w-3.5 text-primary" />
                Login as Admin for Elite Driving Academy
              </Link>
            </Button>
            <Button variant="outline" className="w-full text-xs" asChild>
              <Link href="/dashboard?schoolId=school-driveswift&instructorId=instructor-driveswift-alex">
                <Building className="mr-2 h-3.5 w-3.5 text-primary" />
                Login as Admin for DriveSwift Academy
              </Link>
            </Button>
             <Button variant="outline" className="w-full text-xs" asChild>
              <Link href="/dashboard?schoolId=school-citylearners&instructorId=instructor-citylearners-mike">
                 <Building className="mr-2 h-3.5 w-3.5 text-primary" />
                Login as Admin for City Learners
              </Link>
            </Button>
            <Button variant="outline" className="w-full text-xs" asChild>
                <Link href="/pupil-dashboard">
                    <GraduationCap className="mr-2 h-3.5 w-3.5 text-primary" />
                    Login as Pupil
                </Link>
            </Button>
             <Button variant="outline" className="w-full text-xs" asChild>
              <Link href="/dashboard?instructorId=super-admin">
                <Shield className="mr-2 h-3.5 w-3.5 text-primary" />
                Login as Super Admin
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
