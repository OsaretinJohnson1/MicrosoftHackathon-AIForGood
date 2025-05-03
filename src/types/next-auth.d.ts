import { DefaultSession } from "next-auth"

declare module "next-auth" {
  /**
   * Extend the built-in session types
   */
  interface Session {
    user: {
      id?: string
      firstname?: string
      lastname?: string
      email?: string
      phone?: string
      userStatus?: number
      isAdmin?: number
    } & DefaultSession["user"]
  }

  /**
   * Extend the built-in user types
   */
  interface User {
    id?: string
    firstname?: string
    lastname?: string
    email?: string
    phone?: string
    userStatus?: number
    isAdmin?: number
  }
} 