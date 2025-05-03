import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import Tokens from "csrf";

const tokens = new Tokens();

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    
    // Check if a secret already exists in cookies
    let secret = cookieStore.get("csrf-secret")?.value;
    
    // If no secret exists, create a new one
    if (!secret) {
      secret = tokens.secretSync();
      cookieStore.set("csrf-secret", secret, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });
    }
    
    // Generate a new token based on the secret
    const csrfToken = tokens.create(secret);
    
    return NextResponse.json({ csrfToken }, { status: 200 });
  } catch (error) {
    console.error("CSRF token generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate CSRF token" },
      { status: 500 }
    );
  }
} 