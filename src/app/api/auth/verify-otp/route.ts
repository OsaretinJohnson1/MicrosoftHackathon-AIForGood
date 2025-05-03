import { NextRequest, NextResponse } from "next/server";
import { users } from "../../../../database/ubuntu-lend/schema";
import { verifyOtpSchema } from "../../../../lib/definitions";
import { auth } from "../../../../auth";
import { getUserByField, updateUserDataMultipleFields } from "../../../../lib/utils";
import { verifyUserOtp } from "../../../../lib/utils";
// API route handler
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { countryCode, cellPhone, otp, recaptchaToken } = body;
    
    console.log("verify-otp API called with:", { 
      countryCode, 
      cellPhone, 
      hasOtp: !!otp, 
      hasToken: !!recaptchaToken 
    });
    
    // Check for missing required fields and provide detailed errors
    const missingFields = [];
    if (!countryCode) missingFields.push("countryCode");
    if (!cellPhone) missingFields.push("cellPhone");
    if (!otp) missingFields.push("otp");
    if (!recaptchaToken) missingFields.push("recaptchaToken");
    
    if (missingFields.length > 0) {
      console.log("verify-otp API missing fields:", missingFields);
      return NextResponse.json({ 
        error: `Missing required fields: ${missingFields.join(", ")}` 
      }, { status: 400 });
    }
    
    const result = await verifyUserOtp(countryCode, cellPhone, otp, recaptchaToken);
    
    if (!result.success) {
      console.log("verify-otp API verification failed:", result.error);
      if (result.error) {
        return NextResponse.json({ 
          error: result.error,
          errors: result.error 
        }, { status: result.status || 400 });
      }
      return NextResponse.json({ error: result.error }, { status: result.status || 400 });
    }

    console.log("verify-otp API successful verification");
    
    // Store verification data in session - this won't actually create the session yet
    // but will mark this phone/OTP as validated for the next step
    const session = await auth();
    
    // Return a response that indicates verification was successful
    // The frontend will then need to call NextAuth's signIn method
    return NextResponse.json({
      message: "Verification successful",
      user: {
        id: result.user?.id,
        name: `${result.user?.firstname || ""} ${result.user?.lastname || ""}`.trim() || "User",
        email: result.user?.email || "",
        phone: result.user?.phone,
        userStatus: result.user?.userStatus || 0,
        isAdmin: result.user?.isAdmin || 0
      },
      verified: true,
      // Include essential data needed for the next step
      verificationData: {
        otp,
        countryCode,
        cellPhone,
      }
    }, { status: 200 });
    
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json(
      { error: `Error during OTP verification: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
} 