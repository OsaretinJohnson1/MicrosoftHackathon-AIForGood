import { NextRequest } from "next/server";
import { auth } from "../../../auth";

// This route handles the OAuth callback
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  
  // Get the session to see if the user is authenticated
  const session = await auth();
  
  if (session && session.user?.email) {
    try {
      // Check if the user already exists in our database
      const checkResponse = await fetch(`${request.nextUrl.origin}/api/auth/check-user-exists?email=${encodeURIComponent(session.user.email)}`, {
        method: "GET",
      });
      
      const result = await checkResponse.json();
      
      if (result.exists) {
        // User exists, redirect to the original callback URL
        return Response.redirect(new URL(callbackUrl, request.url));
      } else {
        // User doesn't exist, redirect to confirmation page
        return Response.redirect(new URL("/auth/confirm-google", request.url));
      }
    } catch (error) {
      console.error("Error checking user existence:", error);
      // On error, default to confirmation page for safety
      return Response.redirect(new URL("/auth/confirm-google", request.url));
    }
  }
  
  // If no session or no email, redirect to the original callback URL
  return Response.redirect(new URL(callbackUrl, request.url));
} 