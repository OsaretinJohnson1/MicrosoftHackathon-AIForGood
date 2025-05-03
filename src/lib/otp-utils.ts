'use server'
import { randomInt } from "crypto";
import { createTransport } from "nodemailer";
// import twilio from 'twilio';

// // Import twilio only on server-side
// let twilioClient: any = null;

// Only load Twilio on the server
if (typeof window === 'undefined') {
    // // Dynamic import for server-side only
    // twilioClient = twilio(
    //     process.env.TWILIO_ACCOUNT_SID,
    //     process.env.TWILIO_AUTH_TOKEN,
    // );
}

// Generate a 6-digit OTP
export async function generateOTP(): Promise<string> {
    return randomInt(100000, 999999).toString();
}

// Send SMS using Twilio
export async function sendSMS(to: string, message: string) {
    // Make sure we're on the server
    if (typeof window !== 'undefined') {
        console.error("Twilio SMS can only be sent from server-side code");
        return {
            success: false,
            message: "SMS sending failed - client-side call not supported"
        };
    }

    try {
        // Format phone number for international format
        let formattedPhone = to;

        // Remove any non-digit characters except the plus sign
        formattedPhone = formattedPhone.replace(/[^\d+]/g, '');

        // Final check to ensure plus sign is present
        if (!formattedPhone.startsWith('+')) {
            formattedPhone = `+${formattedPhone}`;
        }

        // // Use client-side safe approach
        // if (typeof window === 'undefined') {
        //     const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        //     await client.messages
        //     .create({
        //         from: process.env.TWILIO_PHONE_NUMBER,
        //         to: formattedPhone,
        //         body: message
        //     }).then((message: any) => {
        //         // console.log("SMS sent successfully:", message.sid);
        //     }).catch((error: any) => {
        //         console.error("SMS sending error:", error.message);
        //     });
        // }

        return {
            success: true,
            message: "SMS sent successfully"
        };
    } catch (error: any) {
        console.error("SMS sending error:", error.message);
        return {
            success: false,
            message: "SMS sending failed"
        };
    }
}

// Generate an OTP message for login
export async function generateLoginOTPMessage(otp: string): Promise<string> {
    return `Your Ubuntu Loan verification code is: ${otp}`;
}

// Validate OTP format (6 digits)
export async function isValidOTPFormat(otp: string): Promise<boolean> {
    return /^\d{6}$/.test(otp);
}

// Generate a welcome message for new customers
export async function generateWelcomeMessage(name: string, isAdmin: boolean = false): Promise<string> {
    const role = isAdmin ? "administrator" : "customer";
    return `Welcome to Ubuntu Loan, ${name}! Your account has been created successfully. You are registered as a ${role}. For assistance, please contact support.`;
}

export async function sendEmail(to: string, subject: string, message: string) {

    try {
        // Create a transporter object
        const transporter = createTransport({
            host: 'sandbox.smtp.mailtrap.io',
            port: parseInt(process.env.SMTP_EMAIL_PORT || "2525"),
            secure: false, // use SSL
            auth: {
                user: process.env.SMTP_EMAIL_USER,
                pass: process.env.SMTP_EMAIL_PASSWORD,
            }
        });

        // Configure the mailoptions object
        const mailOptions = {
            from: process.env.SMTP_EMAIL_USER,
            to: to,
            subject: subject,
            text: message
        };

        // Send the email
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log('Error:', error);
            } else {
                console.log('Email sent:', info.response);
            }
        });
    } catch (error: any) {
        console.error("Email sending error:", error.message);
        return {
            success: false,
            message: "Email sending failed"
        };
    }
}

// Send confirmation notification via email
export async function sendConfirmationByEmail(email: string, userData: any, isNewEmail: boolean) {
    const subject = "Contact Information Updated"
    const message = `
    Hello ${userData.firstname},
    
    Your account contact information has been updated by an administrator.
    
    ${isNewEmail 
        ? `Your email address has been changed to: ${email}`
        : `Your email address (${email}) has been used to notify you that your phone number has been updated.`
    }
    
    If you did not request this change, please contact customer support immediately.
    
    This is an automated message, please do not reply.
    
    Regards,
    The Ubuntu Lend Team
        `
    
    return sendEmail(email, subject, message)
  }
  
  // Send confirmation notification via SMS
export async function sendConfirmationBySMS(phone: string, userData: any, isNewPhone: boolean) {
    const message = `Hello ${userData.firstname}, your UbuntuLend account contact information has been updated by an administrator. ${isNewPhone 
      ? `Your phone number has been changed to: ${phone}.` 
      : `Your phone number (${phone}) has been used to notify you that your email has been updated.`
    } If you did not request this change, please contact support.`
    
    return sendSMS(phone, message)
  }