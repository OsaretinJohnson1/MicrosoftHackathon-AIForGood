import NextAuth, { AuthError } from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import { db } from "@/database/db";
import { eq } from "drizzle-orm";
import { users, temporaryGoogleProfiles } from "@/database/AI-For-Good/schema";
import crypto from 'crypto';

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
        Google({
            allowDangerousEmailAccountLinking: true,
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        Facebook({ allowDangerousEmailAccountLinking: true }),
        GitHub({ allowDangerousEmailAccountLinking: true }),
        Credentials({
            name: "Phone Number",
            credentials: {
                cellPhone: { label: "Phone Number", type: "text" },
                email: { label: "Email", type: "text" },
                otp: { label: "Verification Code", type: "text" },
                mode: { label: "Mode", type: "text" },
                countryCode: { label: "Country Code", type: "text" },
                recaptchaToken: { label: "reCAPTCHA Token", type: "text" },
                preVerified: { label: "Pre-verified", type: "text" },
                provider: { label: "Provider", type: "text" },
            },
            async authorize(credentials) {
                try {
                    if (credentials?.provider === 'google' && credentials?.email) {
                        const email = credentials.email as string;
                        console.log("NextAuth authorize (Google flow) for:", email);

                        const existingUsers = await db
                            .select()
                            .from(users)
                            .where(eq(users.email, email))
                            .limit(1);

                        if (!existingUsers || existingUsers.length === 0) {
                            console.log("NextAuth authorize failed: Google user not found");
                            throw new InvalidLoginError("User not found", {});
                        }

                        const userData = existingUsers[0];
                        console.log("NextAuth authorize success (Google flow), returning user data for ID:", userData.id);
                        
                        await db
                            .update(users)
                            .set({ 
                                logins: (userData.logins || 0) + 1,
                                lastLogin: new Date().toISOString().replace('T', ' ').replace(/\.\d+Z$/, '')
                            })
                            .where(eq(users.id, userData.id));

                        return {
                            id: String(userData.id),
                            phone: userData.phone,
                            firstname: userData.firstname || "",
                            lastname: userData.lastname || "",
                            email: userData.email,
                            name: `${userData.firstname || ""} ${userData.lastname || ""}`.trim() || "User",
                            picture: userData.profilePic || null,
                            image: userData.profilePic || null,
                            userStatus: userData.userStatus || 0,
                            isAdmin: userData.isAdmin || 0,
                        };
                    }

                    if (!credentials?.cellPhone) {
                        throw new InvalidLoginError("Phone number is required", {});
                    }

                    const cellPhone = credentials.cellPhone as string;
                    const countryCode = (credentials.countryCode as string) ?? "+27";
                    console.log("NextAuth authorize processing for:", cellPhone, countryCode);

                    if (credentials?.mode !== 'verify') {
                        console.log("NextAuth authorize failed: Invalid mode", credentials?.mode);
                        throw new InvalidLoginError("Invalid mode", {});
                    }

                    const fullPhoneNumber = `${countryCode}${cellPhone}`;
                    console.log("NextAuth looking up user with phone:", fullPhoneNumber);

                    const existingUsers = await db
                        .select()
                        .from(users)
                        .where(eq(users.phone, fullPhoneNumber))
                        .limit(1);

                    if (!existingUsers || existingUsers.length === 0) {
                        console.log("NextAuth authorize failed: User not found");
                        throw new InvalidLoginError("User not found", {});
                    }

                    const userData = existingUsers[0];
                    console.log("NextAuth authorize success, returning user data for ID:", userData.id);
                    
                    await db
                        .update(users)
                        .set({ 
                            logins: (userData.logins || 0) + 1,
                            lastLogin: new Date().toISOString().replace('T', ' ').replace(/\.\d+Z$/, '')
                        })
                        .where(eq(users.id, userData.id));

                    return {
                        id: String(userData.id),
                        phone: userData.phone,
                        firstname: userData.firstname || "",
                        lastname: userData.lastname || "",
                        email: userData.email || `${cellPhone}@placeholder.com`,
                        name: `${userData.firstname || ""} ${userData.lastname || ""}`.trim() || "User",
                        picture: userData.profilePic || null,
                        image: userData.profilePic || null,
                        userStatus: userData.userStatus || 0,
                        isAdmin: userData.isAdmin || 0,
                    };
                } catch (err: any) {
                    console.error("NextAuth authorize error:", err);
                    throw new InvalidLoginError(err.message || "Authentication failed", {});
                }
            },
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            console.log("SignIn callback - provider:", account?.provider);
            
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
                    console.log("Google auth - user found in database, ID:", userData.id, "isAdmin:", userData.isAdmin);
                    
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
                    
                    console.log("Google auth - updated user object:", {
                        id: user.id,
                        isAdmin: user.isAdmin,
                        userStatus: user.userStatus
                    });
                    
                    return true;
                } else {
                    // User doesn't exist, store profile and redirect to account creation confirmation
                    const token = crypto.randomUUID();
                    await db.insert(temporaryGoogleProfiles).values({
                        token,
                        profileData: JSON.stringify(profile),
                        createdAt: new Date(),
                    });
                    return `/auth/create-account?token=${token}&provider=google`;
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