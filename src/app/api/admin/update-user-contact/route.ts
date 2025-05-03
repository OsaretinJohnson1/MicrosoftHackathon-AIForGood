import { NextRequest, NextResponse } from "next/server"
import { users } from "@/database/ubuntu-lend/schema"
import { getUserByField, updateUserDataMultipleFields, sendConfirmationByEmail, sendConfirmationBySMS } from "@/lib/utils"
import { sendEmail, sendSMS } from "@/lib/otp-utils"
import { auth } from "@/auth"
import { eq } from "drizzle-orm"
import { db } from "@/database/db"
import validator from "validator";


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
    const { userId, contactType, contactValue, countryCode } = body
    
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }
    
    if (!contactType || (contactType !== "email" && contactType !== "phone")) {
      return NextResponse.json(
        { error: "Valid contact type (email or phone) is required" },
        { status: 400 }
      )
    }
    
    if (!contactValue) {
      return NextResponse.json(
        { error: "Contact value is required" },
        { status: 400 }
      )
    }
    
    // Validate email format
    if (contactType === "email" && !validator.isEmail(contactValue)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      )
    }
    
    if (contactType === "phone") {
        // strip out everything except digits
        const digitsOnly = contactValue.replace(/\D/g, "");
      
        // 1) ensure max 25 digits
        if (digitsOnly.length > 25) {
          return NextResponse.json(
            { error: "Phone number must not exceed 25 digits" },
            { status: 400 }
          );
        }
      
        // 2) now do your basic format check (allows +, spaces, -, etc)
        const normalized = contactValue.replace(/\s+/g, "");
        if (!validator.isMobilePhone(normalized, "any")) {
          return NextResponse.json(
            { error: "Please enter a valid phone number" },
            { status: 400 }
          );
        }
      }      
    
    // Find the user by ID
    const userResult = await db.select().from(users).where(eq(users.id, parseInt(String(userId)))).limit(1)
    
    if (!userResult || userResult.length === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }
    
    // Extract the user from the result
    const user = userResult[0]
    
    // Format phone number with country code if provided and if contact type is phone
    let formattedContactValue = contactValue
    if (contactType === "phone" && countryCode) {
      // Remove leading zero if present
      const cleanedPhone = contactValue.startsWith('0') ? contactValue.substring(1) : contactValue
      formattedContactValue = `${countryCode}${cleanedPhone}`
    }
    
    // Check if the new contact value already exists for another user
    const existingQuery = contactType === "email" 
      ? eq(users.email, formattedContactValue)
      : eq(users.phone, formattedContactValue);
    
    const existingUsers = await db.select().from(users).where(existingQuery);
    
    // If contact exists for a different user, return error
    const isDuplicate = existingUsers.some((existingUser: {id: number}) => existingUser.id !== parseInt(String(userId)));
    if (existingUsers.length > 0 && isDuplicate) {
      return NextResponse.json(
        { error: `This ${contactType} already exists for another user. Please choose a different ${contactType}.` },
        { status: 400 }
      )
    }
    
    // Update the user's contact information in the database
    const updateData: any = {}
    updateData[contactType] = formattedContactValue
    
    await updateUserDataMultipleFields(user.id, updateData, users)
    
    // Log the action (for audit purposes)
    console.log(`Contact information (${contactType}) updated by admin (${session.user.id}) for user ${user.id}, notification sent via ${contactType}`)
    
    // Get the original and updated contact information
    const originalEmail = user.email
    const originalPhone = user.phone
    const updatedEmail = contactType === "email" ? formattedContactValue : originalEmail
    const updatedPhone = contactType === "phone" ? formattedContactValue : originalPhone
    
    // Send notifications based on available contact methods
    const notificationResults = []
    
    // Always try to send email notification if email is available
    if (updatedEmail) {
      try {
        const isNewEmail = contactType === "email"
        const emailResult = await sendConfirmationByEmail(updatedEmail, user, isNewEmail)
        notificationResults.push({ type: "email", success: true })
      } catch (error) {
        console.error("Failed to send email notification:", error)
        notificationResults.push({ type: "email", success: false })
      }
    }
    
    // Always try to send SMS notification if phone is available
    if (updatedPhone) {
      try {
        const isNewPhone = contactType === "phone"
        const smsResult = await sendConfirmationBySMS(updatedPhone, user, isNewPhone)
        notificationResults.push({ type: "sms", success: true })
      } catch (error) {
        console.error("Failed to send SMS notification:", error)
        notificationResults.push({ type: "sms", success: false })
      }
    }
    
    // Check if any notifications were sent
    if (notificationResults.length === 0) {
      return NextResponse.json(
        { error: "No valid contact methods available for notification" },
        { status: 400 }
      )
    }
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: `User's ${contactType} updated successfully. ${
        notificationResults.length > 0 
          ? `Notifications sent to all available contact methods.` 
          : `No notifications were sent.`
      }`,
      user: { 
        id: user.id,
        [contactType]: formattedContactValue 
      },
      notifications: notificationResults
    })
    
  } catch (error) {
    console.error("Update contact error:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
} 