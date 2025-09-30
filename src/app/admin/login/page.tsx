'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/logo';
import { useAuth } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const auth = useAuth();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // In a real app, use a secure username/password.
    // For this demo, we use a hardcoded admin user for simplicity.
    if (username !== 'sijan' || password !== 'sijan') {
       setError('Invalid username or password.');
       setLoading(false);
       return;
    }

    try {
      // Use a dummy email for the hardcoded user, as Firebase requires it.
      const adminEmail = 'admin@aisolutions.com';
      await signInWithEmailAndPassword(auth, adminEmail, password);
      router.push('/admin');
    } catch (authError: any) {
        // This block will handle cases where the admin user doesn't exist yet.
        if (authError.code === 'auth/user-not-found' || authError.code === 'auth/invalid-credential') {
            try {
                const adminEmail = 'admin@aisolutions.com';
                await createUserAndSignIn(adminEmail, password);
                router.push('/admin');
            } catch (creationError) {
                 setError('Failed to create admin user. Please try again.');
                 console.error('Admin user creation error:', creationError);
            }
        } else {
            setError('An unknown error occurred during login.');
            console.error('Login error:', authError);
        }
    } finally {
      setLoading(false);
    }
  };

  const createUserAndSignIn = async (email: string, pass: string) => {
    try {
        const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } = await import('firebase/auth');
        const auth = getAuth();
        await createUserWithEmailAndPassword(auth, email, pass);
        await signInWithEmailAndPassword(auth, email, pass);
    } catch (e) {
        console.error("Could not create and sign in admin user", e);
        throw e; // re-throw to be caught by the caller
    }
  }


  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <Logo href="/admin" />
          </div>
          <CardTitle className="font-headline text-2xl">Admin Login</CardTitle>
          <CardDescription>
            Enter your credentials to access the dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="sijan"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="sijan"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Log In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
