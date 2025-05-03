"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, Loader2, ArrowLeft, Mail, Check, X, UserCircle, Shield } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function ConfirmGooglePage() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [createLoading, setCreateLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Load session data on page load
  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        // Get current session data
        const sessionResponse = await fetch('/api/auth/session');
        const sessionData = await sessionResponse.json();
        
        if (!sessionData || !sessionData.user || !sessionData.user.email) {
          throw new Error("No valid session found. Please try signing in again.");
        }
        
        setUserData({
          email: sessionData.user.email,
          name: sessionData.user.name,
          image: sessionData.user.image || sessionData.user.picture
        });
      } catch (err) {
        console.error("Error fetching session data:", err);
        setError(err instanceof Error ? err.message : "Failed to load user data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchSessionData();
  }, []);

  // Handle creating user account
  const handleCreateAccount = async () => {
    if (!userData?.email) {
      setError("User data not available. Please try signing in again.");
      return;
    }
    
    setCreateLoading(true);
    setError(null);
    
    try {
      // Call API to create user account from Google data
      const response = await fetch('/api/auth/create-google-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
        // No body needed - will use session data
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || "Failed to create account");
      }
      
      const result = await response.json();
      
      // Redirect to user dashboard on success
      router.push('/user-app');
      
    } catch (err) {
      console.error("Error creating account:", err);
      setError(err instanceof Error ? err.message : "Failed to create account");
    } finally {
      setCreateLoading(false);
    }
  };

  // Handle cancel - redirect to login page
  const handleCancel = async () => {
    // Sign out first to clear Google auth session
    await fetch('/api/auth/signout', { method: 'POST' });
    router.push('/auth/login');
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-indigo-600 dark:text-indigo-400" />
          <p>Loading session data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 max-w-md w-full">
          <div className="text-center">
            <X className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Error</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
            <Link href="/auth/login">
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                Return to Login
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-2">
      <div className="absolute top-2 left-2">
        <button 
          onClick={handleCancel}
          className="group flex items-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-1.5 rounded-full transition-all duration-300 ease-in-out"
        >
          <ArrowLeft className="mr-2 h-5 w-5 text-gray-500 group-hover:text-indigo-600 dark:text-gray-400 dark:group-hover:text-indigo-400 transition-colors duration-300" />
          <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-600 dark:text-gray-300 dark:group-hover:text-indigo-400 transition-colors duration-300">
            Back to Login
          </span>
        </button>
      </div>
      
      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-6 max-w-md w-full border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center mb-4 space-x-2">
          <Box className="w-8 h-8 text-indigo-600 dark:text-white" />
          <span className="text-2xl font-bold text-gray-800 dark:text-white tracking-tight">Ubuntu Loan</span>
        </div>
        
        <h2 className="text-xl font-bold text-center mb-6 text-gray-800 dark:text-white">Create Your Account</h2>
        
        <div className="flex items-center justify-center mb-6">
          {userData?.image ? (
            <div className="relative w-20 h-20 rounded-full overflow-hidden border-4 border-indigo-200 dark:border-indigo-900">
              <Image 
                src={userData.image} 
                alt="Profile" 
                width={80} 
                height={80}
                className="object-cover" 
              />
            </div>
          ) : (
            <UserCircle className="w-20 h-20 text-indigo-300 dark:text-indigo-500" />
          )}
        </div>
        
        <div className="mb-8 text-center">
          <h3 className="font-semibold text-lg mb-1 text-gray-900 dark:text-white">
            {userData?.name || 'Google User'}
          </h3>
          <div className="flex items-center justify-center text-gray-600 dark:text-gray-400">
            <Mail className="w-4 h-4 mr-1" />
            <span>{userData?.email}</span>
          </div>
        </div>
        
        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg mb-6 border border-indigo-100 dark:border-indigo-800">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Would you like to create an account using your Google profile? This will allow you to easily sign in to Ubuntu Loan in the future.
          </p>
        </div>
        
        {error && (
          <div className="p-3 mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}
        
        <div className="flex flex-col space-y-3">
          <button
            onClick={handleCreateAccount}
            disabled={createLoading}
            className={`w-full py-2.5 px-4 rounded-lg font-medium flex items-center justify-center ${
              createLoading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow transition-all"
            }`}
          >
            {createLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Check className="mr-2 h-5 w-5" />
            )}
            Yes, Create My Account
          </button>
          
          <button
            onClick={handleCancel}
            disabled={createLoading}
            className="w-full py-2.5 px-4 rounded-lg font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all flex items-center justify-center"
          >
            <X className="mr-2 h-5 w-5" />
            No, Cancel
          </button>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            By creating an account, you agree to our <Link href="/terms" className="text-indigo-600 dark:text-indigo-400 hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-indigo-600 dark:text-indigo-400 hover:underline">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
} 