import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { users } from "@/database/ubuntu-lend/schema"
import { getUserByField, updateUserDataMultipleFields } from "@/lib/utils"
import { sendEmail, sendSMS } from "@/lib/otp-utils"
import { auth } from "@/auth"
import { eq } from "drizzle-orm"
import { db } from "@/database/db"

// Generate a random password
function generateRandomPassword(length = 12) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_-+='
  let password = ''
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

// Send password notification via email
async function sendPasswordByEmail(email: string, password: string, userData: any) {
  const subject = "Your Password Has Been Reset"
  const message = `
Hello ${userData.firstname},

Your account password has been reset by an administrator.

Your new password is: ${password}

Please login with this password and change it as soon as possible for security reasons.

This is an automated message, please do not reply.

Regards,
The Ubuntu Lend Team
  `
  
  return sendEmail(email, subject, message)
}

// Send password notification via SMS
async function sendPasswordBySMS(phone: string, password: string, userData: any) {
  const message = `Hello ${userData.firstname}, your UbuntuLend account password has been reset. Your new password is: ${password}. Please login and change it soon.`
  
  return sendSMS(phone, message)
}

export async function POST(request: NextRequest) {
  try {
    // Check if the user is authenticated and is an admin
    const session = await auth()
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized: You must be logged in" },
        { status: 401 }
      )
    }
    
    // Check if user is admin
    if (session.user.isAdmin !== 1 && session.user.userStatus !== 1) {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      )
    }
    
    // Parse the request body
    const body = await request.json()
    const { identifier, notificationType, countryCode } = body
    
    if (!identifier) {
      return NextResponse.json(
        { error: "User identifier (email or phone) is required" },
        { status: 400 }
      )
    }
    
    if (!notificationType || (notificationType !== "email" && notificationType !== "sms")) {
      return NextResponse.json(
        { error: "Valid notification type (email or sms) is required" },
        { status: 400 }
      )
    }
    
    // Find the user by email or phone
    let userField = "email"
    let searchValue = identifier
    
    if (notificationType === "sms") {
      userField = "phone"
      
      // Format phone number with country code if provided
      if (countryCode) {
        // Remove leading zero if present
        const cleanedPhone = identifier.startsWith('0') ? identifier.substring(1) : identifier
        searchValue = `${countryCode}${cleanedPhone}`
      }
    }
    
    console.log(`Searching for user with ${userField}: ${searchValue}`)
    
    const userResult = await getUserByField(userField, searchValue, users, { limit: 1 })
    
    if (!userResult) {
      return NextResponse.json(
        { error: "User not found with the provided identifier" },
        { status: 404 }
      )
    }
    
    // Extract the user from the result
    const user = Array.isArray(userResult) ? userResult[0] : userResult
    
    // Generate a new random password
    const newPassword = generateRandomPassword()
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    
    // Update the user's password in the database
    await updateUserDataMultipleFields(user.id, {
      password: hashedPassword,
    }, users)
    
    // Log the action (for audit purposes)
    console.log(`Password reset by admin (${session.user.id}) for user ${user.id} (${user.email}), notification sent via ${notificationType}`)
    
    // Send the password to the user via the selected notification method
    let notificationResult
    if (notificationType === "email") {
      // Ensure user has a valid email address
      if (!user.email) {
        return NextResponse.json(
          { error: "User does not have a valid email address" },
          { status: 400 }
        )
      }
      
      notificationResult = await sendPasswordByEmail(user.email, newPassword, user)
    } else {
      // Ensure user has a valid phone number
      if (!user.phone) {
        return NextResponse.json(
          { error: "User does not have a valid phone number" },
          { status: 400 }
        )
      }
      
      notificationResult = await sendPasswordBySMS(user.phone, newPassword, user)
    }
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: `Password reset successfully. The new password has been sent to the user's ${notificationType === "email" ? "email address" : "phone number"}.`,
      user: { id: user.id },
      // Include the password in development environment for testing
      ...(process.env.NODE_ENV === 'development' ? { password: newPassword } : {})
    })
    
  } catch (error) {
    console.error("Password reset error:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
} 