import { NextRequest, NextResponse } from "next/server";
import { users } from "../../../../database/AI-For-Good/schema";
import { loginSchema } from "../../../../lib/definitions";
import { generateOTP, sendSMS, generateLoginOTPMessage } from "../../../../lib/otp-utils";
import { getUserByField, updateUserDataMultipleFields } from "../../../../lib/utils";
import { processAccountRecovery } from "../../../../lib/utils";


// API route handler
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { phoneNumber, recaptchaToken, email } = body;

        // Check for required recaptchaToken first
        const missingFields = [];
        if (!recaptchaToken) missingFields.push("recaptchaToken");

        // Check for either email OR (cellPhone AND countryCode)
        const hasValidPhone = phoneNumber;
        const hasValidEmail = email ? true : false;

        if (!hasValidEmail && !hasValidPhone) {
        // Neither option is provided
        missingFields.push("either email OR (cellPhone with countryCode)");
        }

        // Now missingFields contains all validation errors
        if (missingFields.length > 0) {
        return new Response(
            JSON.stringify({
            success: false,
            message: `Missing required fields: ${missingFields.join(", ")}`
            }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
        }

        const identifier = phoneNumber || email;
        console.log("identifier", identifier);

        const result = await processAccountRecovery(identifier, recaptchaToken);
        
        if (!result.success) {
            return NextResponse.json(
                result.errors ? { error: result.error, errors: result.errors } : { error: result.error }, 
                { status: result.status || 500 }
            );
        }
        
        return NextResponse.json({
            message: result.message,
            user: result.user,
            otp: result.otp,
            smsSid: result.smsSid
        }, { status: 200 });
        
    } catch (error) {
        console.error("API route error:", error);
        return NextResponse.json({ 
            error: `Error processing request: ${error instanceof Error ? error.message : String(error)}` 
        }, { status: 500 });
    }
}
