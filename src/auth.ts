import NextAuth, { AuthError } from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Facebook from "next-auth/providers/facebook";
import { googleProvider } from "./lib/auth-providers";
import { db } from "@/database/db";
import { eq } from "drizzle-orm";
import { users, temporaryGoogleProfiles } from "@/database/AI-For-Good/schema";
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { cookies } from "next/headers";

// Store for tracking registration attempts
export const registrationAttempts = new Map<string, boolean>();

export class InvalidLoginError extends AuthError {
    code = 'invalid_credentials';
    constructor(message: string, details: any) {
        super(message);
        this.message = message;
    }
}

export const { auth, handlers, signIn, signOut } = NextAuth({
    ...authConfig,
    session: { strategy: "jwt" },
    pages: {
        signIn: "/auth/login",
        signOut: "/",
        error: "/auth/login",
    },
    providers: [
        googleProvider,
        Facebook({ allowDangerousEmailAccountLinking: true }),
        GitHub({ allowDangerousEmailAccountLinking: true }),
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
                provider: { label: "Provider", type: "text" },
            },
            async authorize(credentials) {
                try {
                    console.log("Authorize function called with credentials:", { 
                        email: credentials?.email,
                        hasPassword: !!credentials?.password 
                    });
                    
                    // If credentials are not provided or don't include email and password
                    if (!credentials || !credentials.email || !credentials.password) {
                        console.log("Missing required credentials");
                        return null;
                    }

                    // Get user by email
                    console.log("Looking up user with email:", credentials.email);
                    const existingUser = await db.select().from(users)
                        .where(eq(users.email, credentials.email as string))
                        .limit(1);

                    // If user not found
                    if (!existingUser.length) {
                        console.log("User not found:", credentials.email);
                        return null;
                    }

                    const user = existingUser[0];
                    console.log("User found:", { id: user.id, email: user.email });

                    // Check if user has a password
                    if (!user.password) {
                        console.log("User has no password:", credentials.email);
                        return null;
                    }

                    // Verify password
                    console.log("Verifying password...");
                    const passwordsMatch = await bcrypt.compare(
                        credentials.password as string, 
                        user.password as string
                    );

                    if (!passwordsMatch) {
                        console.log("Passwords don't match for user:", credentials.email);
                        return null;
                    }

                    console.log("Password verified, authentication successful");
                    
                    // Password matched, return user
                    return {
                        id: user.id,
                        email: user.email,
                        name: `${user.firstname} ${user.lastname}`,
                        firstname: user.firstname,
                        lastname: user.lastname,
                        phone: user.phone,
                        isAdmin: user.isAdmin,
                    };
                } catch (error) {
                    console.error("Error in authorize function:", error);
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            console.log("SignIn callback - provider:", account?.provider);
            console.log("SignIn callback - account object:", JSON.stringify(account, null, 2));
            
            // Check if this is a Google sign-in
            if (account?.provider === 'google' && profile?.email) {
                const email = profile.email;
                
                console.log("Google auth - looking up user with email:", email);
                
                const existingUsers = await db
                    .select()
                    .from(users)
                    .where(eq(users.email, email as string))
                    .limit(1);

                if (existingUsers.length > 0) {
                    // User exists, allow sign-in and update login stats
                    const userData = existingUsers[0];
                    console.log("Google auth - user found in database, ID:", userData.id);
                    
                    await db
                        .update(users)
                        .set({ 
                            logins: (userData.logins || 0) + 1,
                            lastLogin: new Date().toISOString().replace('T', ' ').replace(/\.\d+Z$/, '')
                        })
                        .where(eq(users.id, userData.id));
                        
                    // Override user properties with database values
                    user.id = String(userData.id);
                    user.isAdmin = userData.isAdmin;
                    user.userStatus = userData.userStatus;
                    user.firstname = userData.firstname;
                    user.lastname = userData.lastname;
                    user.name = `${userData.firstname || ""} ${userData.lastname || ""}`.trim() || user.name;
                    
                    return true;
                } else {
                    // User doesn't exist, create account directly without confirmation
                    console.log("Google auth - Creating new user automatically");
                    
                    // Format name from profile
                    const name = profile.name || '';
                    const nameParts = name.split(' ');
                    const firstname = nameParts[0] || '';
                    const lastname = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
                    
                    // Format the date properly for MySQL
                    const now = new Date();
                    const formattedDate = now.toISOString().slice(0, 19).replace('T', ' ');
                    
                    // Create user data
                    const userData = {
                        email: profile.email,
                        firstname,
                        lastname: lastname || firstname, // Use firstname as lastname if not provided
                        activated: 1,
                        verified: 1, // Mark as verified since it's from Google
                        userStatus: 0,
                        isAdmin: 0,
                        logins: 1,
                        signupDate: formattedDate,
                        profilePic: profile.picture || null
                    };
                    
                    console.log("Creating user with Google data:", { 
                        email: userData.email,
                        firstname: userData.firstname,
                        lastname: userData.lastname
                    });
                    
                    try {
                        // Create the user
                        const result = await db.insert(users).values(userData);
                        
                        // Get the newly created user
                        const newUser = await db
                            .select()
                            .from(users)
                            .where(eq(users.email, profile.email as string))
                            .limit(1);
                        
                        if (newUser.length > 0) {
                            user.id = String(newUser[0].id);
                            user.isAdmin = newUser[0].isAdmin;
                            user.userStatus = newUser[0].userStatus;
                        }
                        
                        return true;
                    } catch (error) {
                        console.error("Error creating user from Google profile:", error);
                        return `/auth/error?error=registration_failed`;
                    }
                }
            }
            return true; // Allow sign-in for other providers
        },
        async jwt({ token, user, account, profile, trigger, isNewUser, session }) {
            console.log("JWT callback - has user:", !!user, "provider:", account?.provider);
            
            let updatedToken = { ...token };
            
            // Copy user information to token when signing in
            if (user) {
                console.log("JWT - user object:", {
                    id: user.id,
                    email: user.email,
                    isAdmin: user.isAdmin,
                    userStatus: user.userStatus
                });
                
                updatedToken = { 
                    ...updatedToken,
                    id: user.id, // Ensure ID is from database, not provider
                    email: user.email,
                    firstname: user.firstname,
                    lastname: user.lastname,
                    name: user.name,
                    picture: user.image, // User type has image, not picture
                    image: user.image,
                    phone: user.phone,
                    userStatus: user.userStatus,
                    isAdmin: user.isAdmin
                };
            }
            
            // Update token when session is updated
            if (trigger === "update") {
                updatedToken = { ...updatedToken, ...session.user };
            }
            
            console.log("updatedToken", updatedToken);
            return updatedToken;
        },
        async session({ session, token }) {
            console.log("Session callback - token:", {
                id: token.id,
                email: token.email,
                isAdmin: token.isAdmin,
                userStatus: token.userStatus
            });

            try {
                // Always use database information for the session
                const email = token.email;
                if (email) {
                    console.log("Session - looking up user with email:", email);
                    const existingUsers = await db
                        .select()
                        .from(users)
                        .where(eq(users.email, email))
                        .limit(1);
                        
                    if (existingUsers.length > 0) {
                        const userData = existingUsers[0];
                        console.log("Session - user found in DB, id:", userData.id, "isAdmin:", userData.isAdmin);
                        
                        session.user = {
                            ...session.user,
                            id: String(userData.id), // Use database ID
                            email: userData.email,
                            firstname: userData.firstname || "",
                            lastname: userData.lastname || "",
                            name: `${userData.firstname || ""} ${userData.lastname || ""}`.trim() || "User",
                            image: userData.profilePic || token.picture || null,
                            phone: userData.phone || token.phone || null,
                            userStatus: userData.userStatus || 0,
                            isAdmin: userData.isAdmin || 0,
                        };
                    } else {
                        console.log("Session - no user found with email:", email);
                    }
                } else if (token.id) {
                    // If no email but we have an ID, try to look up by ID 
                    // (for phone-based authentication)
                    console.log("Session - looking up user with ID:", token.id);
                    const existingUsers = await db
                        .select()
                        .from(users)
                        .where(eq(users.id, parseInt(token.id as string)))
                        .limit(1);
                        
                    if (existingUsers.length > 0) {
                        const userData = existingUsers[0];
                        // console.log("Session - user found by ID, isAdmin:", userData.isAdmin);
                        
                        session.user = {
                            ...session.user,
                            id: String(userData.id),
                            email: userData.email || token.email || null,
                            firstname: userData.firstname || "",
                            lastname: userData.lastname || "",
                            name: `${userData.firstname || ""} ${userData.lastname || ""}`.trim() || "User",
                            image: userData.profilePic || token.picture || null,
                            phone: userData.phone || null,
                            userStatus: userData.userStatus || 0,
                            isAdmin: userData.isAdmin || 0,
                        };
                    } else {
                        console.log("Session - no user found with ID:", token.id);
                    }
                }
                
                // console.log("Final session user:", {
                //     id: session.user?.id,
                //     email: session.user?.email,
                //     isAdmin: session.user?.isAdmin,
                //     userStatus: session.user?.userStatus
                // });
                
                return session;
            } catch (error) {
                console.error("Error in session callback:", error);
                return session;
            }
        },
    },
});