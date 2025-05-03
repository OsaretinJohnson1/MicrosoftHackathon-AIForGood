import { NextRequest, NextResponse } from "next/server";
import { users } from "../../../../database/AI-For-Good/schema";
import { loginSchema } from "../../../../lib/definitions";
import { generateOTP, sendSMS, generateLoginOTPMessage } from "../../../../lib/otp-utils";
import { getUserByField, updateUserDataMultipleFields } from "../../../../lib/utils";
import { loginUser } from "../../../../lib/utils";


// API route handler
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { cellPhone, countryCode, recaptchaToken } = body;
        
        // Check for missing required fields and provide detailed errors
        const missingFields = [];
        if (!cellPhone) missingFields.push("cellPhone");
        if (!countryCode) missingFields.push("countryCode");
        if (!recaptchaToken) missingFields.push("recaptchaToken");
        
        if (missingFields.length > 0) {
            return NextResponse.json({ 
                error: `Missing required fields: ${missingFields.join(", ")}` 
            }, { status: 400 });
        }
        
        const result = await loginUser(cellPhone, countryCode, recaptchaToken);
        
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
