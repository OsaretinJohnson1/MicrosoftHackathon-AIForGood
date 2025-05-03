'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { signIn } from 'next-auth/react';

export default function CreateAccount() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CreateAccountPage />
        </Suspense>
    )
}

function CreateAccountPage () {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const provider = searchParams.get('provider');

    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [authStep, setAuthStep] = useState<'initial' | 'creating' | 'signing-in'>('initial');

    useEffect(() => {
        if (token && provider === 'google') {
            fetch(`/api/auth/get-temporary-profile?token=${token}&provider=${provider}`)
                .then((res) => res.json())
                .then((data) => {
                    if (data.error) {
                        setError(data.error);
                    } else {
                        setProfile(data.profile);
                    }
                    setLoading(false);
                })
                .catch((error) => {
                    console.error("Error fetching profile:", error);
                    setError("Failed to load profile information");
                    setLoading(false);
                });
        } else {
            setError("Invalid request parameters");
            setLoading(false);
        }
    }, [token, provider]);

    const handleCreateAccount = async () => {
        if (!token || !provider) return;

        setCreating(true);
        setAuthStep('creating');
        try {
            const res = await fetch('/api/auth/create-account', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, provider }),
            });

            const data = await res.json();

            if (data.success) {
                // Account created successfully, now sign in
                setAuthStep('signing-in');
                console.log("Account created:", data.user);
                
                try {
                    // Sign in using the credentials provider with the email from the created account
                    // This approach is similar to what's done in the signup flow
                    const signInResult = await signIn('credentials', {
                        email: data.user.email,
                        mode: 'verify',
                        preVerified: 'true', // Indicate that we already verified the user
                        provider: 'google', // Indicate this is a Google-authenticated user
                        redirect: false,
                        callbackUrl: '/user-app' // Set the correct redirect URL from the start
                    });
                    
                    console.log("Sign in result:", signInResult);
                    
                    if (signInResult?.ok) {
                        // Successfully signed in, redirect to user app
                        console.log("Successfully signed in, redirecting to user app");
                        router.push('/user-app');
                    } else {
                        // If sign-in fails, redirect to login page with email prefilled
                        console.error("Sign-in failed after account creation:", signInResult?.error);
                        router.push(`/auth/login?email=${encodeURIComponent(data.user.email)}&accountCreated=true`);
                    }
                } catch (signInError) {
                    console.error('Error signing in:', signInError);
                    // Fall back to login page
                    router.push(`/auth/login?email=${encodeURIComponent(data.user.email)}&accountCreated=true`);
                }
            } else {
                setError(data.error || 'Failed to create account');
                setCreating(false);
                setAuthStep('initial');
            }
        } catch (err) {
            console.error('Error creating account:', err);
            setError('An unexpected error occurred');
            setCreating(false);
            setAuthStep('initial');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen px-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Create New Account</CardTitle>
                    <CardDescription>
                        You don't have an account linked to this email. Would you like to create one using your {provider} information?
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {error && (
                        <div className="bg-destructive/15 text-destructive p-3 rounded-md mb-4">
                            {error}
                        </div>
                    )}

                    {profile && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                {profile.picture && (
                                    <img
                                        src={profile.picture}
                                        alt="Profile"
                                        className="w-12 h-12 rounded-full"
                                    />
                                )}
                                <div>
                                    <p className="font-medium">{profile.name || 'User'}</p>
                                    <p className="text-sm text-muted-foreground">{profile.email}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button
                        variant="outline"
                        onClick={() => router.push('/auth/login')}
                        disabled={creating}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleCreateAccount}
                        disabled={creating || !profile}
                    >
                        {authStep === 'creating' ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating Account...
                            </>
                        ) : authStep === 'signing-in' ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Signing In...
                            </>
                        ) : (
                            'Create Account'
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
} 