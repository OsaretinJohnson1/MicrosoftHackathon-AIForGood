import Google from "next-auth/providers/google";

// Standard Google provider with explicit configuration
export const googleProvider = Google({
    allowDangerousEmailAccountLinking: true,
    clientId: process.env.GOOGLE_CLIENT_ID as string,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    authorization: {
        params: {
            scope: "openid email profile",
            prompt: "select_account"
        }
    }
}); 