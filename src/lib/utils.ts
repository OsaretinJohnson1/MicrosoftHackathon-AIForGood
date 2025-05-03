import { applications, users } from "../database/ubuntu-lend/schema"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { db } from "../database/db"
import { eq, asc, desc, sql, and, or, SQL } from "drizzle-orm"
import { MySqlTable, TableConfig } from 'drizzle-orm/mysql-core';
import { Column } from "drizzle-orm";
import { generateLoginOTPMessage, generateOTP, sendEmail, sendSMS } from "./otp-utils"
import { loginSchema, recoverAccountSchema, verifyOtpSchema } from "./definitions"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
// Helper function to format dates
export const formatDate = (dateString: string) => {
  if (!dateString) return "N/A"
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit"
  })
}


// Define a type that ensures the table has an id column
type TableWithId = { id: Column<any> };

export async function createUserData<T extends MySqlTable<TableConfig>>(data: any, table: T) {
  const result = await db
    .insert(table)
    .values(data);
  
  return result;
}

export async function updateUserData<T extends MySqlTable<TableConfig> & TableWithId>(userId: number, field: string, value: any, table: T) {
  const result = await db
    .update(table)
    .set({
      [field]: value
    } as any)
    .where(eq(table.id, userId));

  return result;
}

export async function updateUserDataMultipleFields<T extends MySqlTable<TableConfig> & TableWithId>(userId: number, data: any, table: T) {
  try {
    console.log(`Updating user ${userId} with data:`, data);
    
    // Log specific fields we're concerned about
    console.log('State value:', data.state);
    console.log('Country value:', data.country);
    console.log('Employer value:', data.employer);
    
    const result = await db
      .update(table)
      .set(data as any)
      .where(eq(table.id, userId));
    
    console.log(`Update result:`, result);
    return result;
  } catch (error) {
    console.error('Error in updateUserDataMultipleFields:', error);
    throw error;
  }
}

export async function getUserById<T extends MySqlTable<TableConfig> & TableWithId>(
  userId: number, 
  table: T,
  options: { limit?: boolean | number } = { limit: false }
) {
  const query = db
    .select()
    .from(table)
    .where(eq(table.id, userId));
  
  if (options.limit !== false) {
    const limitValue = typeof options.limit === 'number' ? options.limit : 1;
    query.limit(limitValue);
  }
  
  const result = await query;
  return result[0] || null;
}

export async function pullUserData<T extends MySqlTable<TableConfig> & TableWithId>(
  userId: number, 
  table: T,
  options: { 
    limit?: boolean | number,
    offset?: number,
    orderBy?: string,
    orderDirection?: 'asc' | 'desc'
  } = { limit: false }
) {
  try {
    const query = db
      .select()
      .from(table)
      .where(eq(table.id, userId));
    
    if (options.limit !== false) {
      const limitValue = typeof options.limit === 'number' ? options.limit : 10;
      query.limit(limitValue);
    }
    
    if (options.offset !== undefined) {
      query.offset(options.offset);
    }
    
    if (options.orderBy) {
      query.orderBy(
        options.orderDirection === 'desc' 
          ? desc(table[options.orderBy as keyof typeof table] as any)
          : asc(table[options.orderBy as keyof typeof table] as any)
      );
    }
    
    const results = await query;
    return results;
  } catch (error) {
    console.error(`Error in pullUserData: userId=${userId}`, error);
    if (error instanceof Error) {
      throw new Error(`Failed to pull user data (id: ${userId}): ${error.message}`);
    }
    throw new Error(`Failed to pull user data (id: ${userId}): ${String(error)}`);
  }
}

export async function getAllUsers<T extends MySqlTable<TableConfig>>(
  table: T, 
  options: { 
    page?: number, 
    limit?: boolean | number, 
    orderBy?: string, 
    orderDirection?: 'asc' | 'desc' 
  } = {}
) {
  const { 
    page = 1, 
    limit = false, 
    orderBy = 'id', 
    orderDirection = 'asc' 
  } = options;
  
  const query = db.select().from(table);
  
  // Apply ordering
  query.orderBy(
    orderDirection === 'asc' 
      ? asc(table[orderBy as keyof typeof table] as any) 
      : desc(table[orderBy as keyof typeof table] as any)
  );
  
  // Apply pagination if limit is specified
  if (limit !== false) {
    const limitValue = typeof limit === 'number' ? limit : 10;
    const offset = (page - 1) * limitValue;
    
    query.limit(limitValue);
    query.offset(offset);
  }
  
  const results = await query;
  
  // Get total count for pagination
  const totalCount = await db
    .select({ count: sql`count(*)` })
    .from(table);
  
  const limitForPagination = limit !== false 
    ? (typeof limit === 'number' ? limit : 10)
    : results.length;
  
  return {
    data: results,
    pagination: {
      page,
      limit: limitForPagination,
      totalCount: Number(totalCount[0].count),
      totalPages: Math.ceil(Number(totalCount[0].count) / (limitForPagination || 1))
    }
  };
}

export async function deleteUser<T extends MySqlTable<TableConfig> & TableWithId>(userId: number, table: T) {
  const result = await db
    .delete(table)
    .where(eq(table.id, userId));
  
  return result;
}

/**
 * Get user data by any field and value
 */
export async function getUserByField<T extends MySqlTable<TableConfig>>(
  fieldName: string,
  value: any,
  table: T,
  options: { 
    limit?: boolean | number,
    offset?: number,
    orderBy?: string,
    orderDirection?: 'asc' | 'desc'
  } = { limit: false }
) {
  try {
    // Create a field reference for the query
    const fieldRef = table[fieldName as keyof typeof table] as any;
    
    if (!fieldRef) {
      throw new Error(`Field ${fieldName} does not exist on the table`);
    }
    
    const query = db
      .select()
      .from(table)
      .where(eq(fieldRef, value));
    
    if (options.limit !== false) {
      const limitValue = typeof options.limit === 'number' ? options.limit : 10;
      query.limit(limitValue);
    }
    
    if (options.offset !== undefined) {
      query.offset(options.offset);
    }
    
    if (options.orderBy) {
      query.orderBy(
        options.orderDirection === 'desc' 
          ? desc(table[options.orderBy as keyof typeof table] as any)
          : asc(table[options.orderBy as keyof typeof table] as any)
      );
    }
    
    const results = await query;
    
    // If limit is 1 or not specified, return the first result or null
    if (options.limit === 1) {
      return results[0] || null;
    }
    
    return results;
  } catch (error) {
    // Add more context to the error
    console.error(`Error in getUserByField: ${fieldName}=${value}`, error);
    if (error instanceof Error) {
      throw new Error(`Database query failed (field: ${fieldName}): ${error.message}`);
    }
    throw new Error(`Database query failed (field: ${fieldName}): ${String(error)}`);
  }
}

/**
 * Get user data with complex conditions
 * @example
 * // Find users with age > 18 AND (name = 'John' OR name = 'Jane')
 * const conditions = and(
 *   gt(users.age, 18),
 *   or(
 *     eq(users.name, 'John'),
 *     eq(users.name, 'Jane')
 *   )
 * );
 * const results = await queryWithConditions(users, conditions);
 */
export async function queryWithConditions<T extends MySqlTable<TableConfig>>(
  table: T,
  conditions: SQL,
  options: { 
    limit?: boolean | number,
    offset?: number,
    orderBy?: string,
    orderDirection?: 'asc' | 'desc'
  } = { limit: false }
) {
  try {
    const query = db
      .select()
      .from(table)
      .where(conditions);
    
    if (options.limit !== false) {
      const limitValue = typeof options.limit === 'number' ? options.limit : 10;
      query.limit(limitValue);
    }
    
    if (options.offset !== undefined) {
      query.offset(options.offset);
    }
    
    if (options.orderBy) {
      query.orderBy(
        options.orderDirection === 'desc' 
          ? desc(table[options.orderBy as keyof typeof table] as any)
          : asc(table[options.orderBy as keyof typeof table] as any)
      );
    }
    
    return await query;
  } catch (error) {
    console.error(`Error in queryWithConditions:`, error);
    if (error instanceof Error) {
      throw new Error(`Database query with conditions failed: ${error.message}`);
    }
    throw new Error(`Database query with conditions failed: ${String(error)}`);
  }
}

// Function to handle the login/OTP generation process
export async function loginUser(cellPhone: string, countryCode: string, recaptchaToken: string) {
  try {
      // Validate the request body
      const validationResult = loginSchema.safeParse({ 
          cellPhone, 
          countryCode,
          recaptchaToken
      });
      
      if (!validationResult.success) {
          // Format validation errors in a more detailed way
          const formattedErrors = validationResult.error.format();
          return { 
              success: false, 
              error: "Validation failed",
              errors: formattedErrors,
              status: 400 
          };
      }

      // Check if user exists - using the combined phone format (countryCode + cellPhone)
      const fullPhoneNumber = `${countryCode}${cellPhone}`;
      const userResult = await getUserByField("phone", fullPhoneNumber, users, { limit: 1 });

      if (!userResult) {
          return { 
              success: false, 
              error: "User not found", 
              status: 404 
          };
      }

      // Extract the user from the result
      const existingUser = Array.isArray(userResult) ? userResult[0] : userResult;
      
      // User exists, generate OTP
      const otp = await generateOTP();

      // Store OTP in database with expiry
      await updateUserDataMultipleFields(existingUser.id, {
          confirmationPin: otp,
          passRecString: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 1 day from now for expiry
      }, users);
      
      // Send SMS with OTP
      let smsResult;
      try {
          const message = await generateLoginOTPMessage(otp);
          // console.log("OTP: ", otp, "message: ", message);
          console.log("Sending SMS to: ", fullPhoneNumber);
          smsResult = await sendSMS(fullPhoneNumber, message);
      } catch (error) {
          console.error("Failed to send SMS:", error);
          return { 
              success: false, 
              error: "Failed to send verification code. Please try again.",
              status: 500 
          };
      }
      
      // Return success response
      return { 
          success: true, 
          message: "OTP sent successfully", 
          user: { id: existingUser.id },
          otp: process.env.NODE_ENV === 'development' ? otp : undefined,
          smsSid: smsResult
      };

  } catch (error) {
      console.error("Login error:", error);
      return { 
          success: false, 
          error: `Error during login: ${error instanceof Error ? error.message : String(error)}`,
          status: 500 
      };
  }
}

// Function to verify OTP
export async function verifyUserOtp(countryCode: string, cellPhone: string, otp: string, recaptchaToken: string) {
  try {
    console.log("verifyUserOtp called with:", { countryCode, cellPhone, hasOtp: !!otp, hasToken: !!recaptchaToken });
    
    // Validate input
    const result = await verifyOtpSchema.parseAsync({ countryCode, cellPhone, otp, recaptchaToken });
    console.log("----------------------", result)
    // if (!result.success) {
    //   const formattedErrors = result.error.format();
    //   console.log("verifyUserOtp validation failed:", formattedErrors);
    //   return { 
    //     success: false, 
    //     error: "Validation failed",
    //     errors: formattedErrors, 
    //     status: 400 
    //   };
    // }

    // Combine phone number format
    const fullPhoneNumber = `${countryCode}${cellPhone}`;
    console.log("verifyUserOtp looking up user with phone:", fullPhoneNumber);

    // Check if user exists
    const userResult = await getUserByField("phone", fullPhoneNumber, users, { limit: 1 });

    if (!userResult) {
      console.log("verifyUserOtp failed: User not found");
      return { success: false, error: "User not found", status: 404 };
    }

    // Extract the user from the result
    const user = Array.isArray(userResult) ? userResult[0] : userResult;
    console.log("verifyUserOtp found user:", { id: user.id, hasPin: !!user.confirmationPin });

    // Verify OTP from database
    if (!user.confirmationPin || user.confirmationPin !== otp) {
      console.log("verifyUserOtp failed: Invalid OTP");
      return { success: false, error: "Invalid OTP", status: 400 };
    }

    // Check if OTP is expired
    if (user.passRecString) {
      const expiryTime = new Date(user.passRecString).getTime();
      if (Date.now() > expiryTime) {
        console.log("verifyUserOtp failed: OTP expired");
        return { success: false, error: "OTP has expired", status: 400 };
      }
    }

    // Clear OTP after successful verification
    await updateUserDataMultipleFields(user.id, {
      confirmationPin: null,
      passRecString: null
    }, users);

    console.log("verifyUserOtp success for user:", user.id);

    // Return successful authentication data with all fields NextAuth might need
    return {
      success: true,
      user: {
        id: user.id,
        firstname: user.firstname || "",
        lastname: user.lastname || "",
        email: user.email || "",
        phone: user.phone,
        profilePic: user.profilePic || null,
        userStatus: user.userStatus || 0,
        isAdmin: user.isAdmin || 0
      },
      verified: true
    };

  } catch (error) {
    console.error("OTP verification error:", error);
    return {
      success: false,
      error: `Error during OTP verification: ${error instanceof Error ? error.message : String(error)}`,
      status: 500
    };
  }
}

// Function to handle the login/OTP generation process
export async function processAccountRecovery(identifier: string, recaptchaToken: string) {
  try {
      // Validate the request body
      const validationResult = recoverAccountSchema.safeParse({ 
          identifier, 
          recaptchaToken
      });
      
      if (!validationResult.success) {
          // Format validation errors in a more detailed way
          const formattedErrors = validationResult.error.format();
          return { 
              success: false, 
              error: "Validation failed",
              errors: formattedErrors,
              status: 400 
          };
      }

      let userResult;

      if (identifier.includes("@")) {
        // Check if user exists - using the combined phone format (countryCode + cellPhone)
        userResult = await getUserByField("email", identifier, users, { limit: 1 });
      } else {
        // Check if user exists - using the combined phone format (countryCode + cellPhone)
        userResult = await getUserByField("phone", identifier, users, { limit: 1 });
      }

      if (!userResult) {
          return { 
              success: false, 
              error: "User not found",
              status: 404 
          };
      }

      // Extract the user from the result
      const existingUser = Array.isArray(userResult) ? userResult[0] : userResult;
      
      // User exists, generate OTP
      const otp = await generateOTP();

      console.log("OTP: ", otp);

      // Store OTP in database with expiry
      await updateUserDataMultipleFields(existingUser.id, {
          confirmationPin: otp,
          passRecString: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 1 day from now for expiry
      }, users);

      console.log("existingUser: ", existingUser);
      
      // Send SMS with OTP
      let smsResult;
      try {
        if (identifier.includes("@")) {
          const message = await generateLoginOTPMessage(otp) + "\n\n" + "This OTP will expire in 24 hours.";
          console.log("Sending OTP to: ", identifier);
          smsResult = await sendEmail(identifier, "Ubuntu Loan Recovery OTP", message).then((result) => {
            console.log("Email sent successfully:", result);
          }).catch((error) => {
            console.error("Email sending error:", error);
            return {
              success: false,
              error: "Failed to send verification code. Please try again.",
              status: 500
            };
          });
        } else {
          const message = await generateLoginOTPMessage(otp) + "\n\n" + "This OTP will expire in 24 hours.";
          console.log("Sending OTP to: ", identifier);
          smsResult = await sendSMS(identifier, message).then((result) => {
            console.log("SMS sent successfully:", result);
          }).catch((error) => {
            console.error("SMS sending error:", error);
            return {
              success: false,
              error: "Failed to send verification code. Please try again.",
              status: 500
            };
          });
        }
      } catch (error) {
          console.error("Failed to send SMS:", error);
          return { 
              success: false, 
              error: "Failed to send verification code. Please try again.",
              status: 500 
          };
      }
      
      // Return success response
      return { 
          success: true, 
          message: "OTP sent successfully", 
          user: { id: existingUser.id },
          otp: process.env.NODE_ENV === 'development' ? otp : undefined,
          smsSid: smsResult
      };

  } catch (error) {
      console.error("Login error:", error);
      return { 
          success: false, 
          error: `Error during login: ${error instanceof Error ? error.message : String(error)}`,
          status: 500 
      };
  }
}

// Generate a random password
export async function generateRandomPassword(length = 12) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_-+='
  let password = ''
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

// Send password notification via email
export async function sendPasswordByEmail(email: string, password: string, userData: any) {
  try {
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
  } catch (error) {
    console.error("Failed to send email:", error);
    return {
      success: false,
      error: "Failed to send email. Please try again.",
      status: 500
    };
  }
}

// Send password notification via SMS
export async function sendPasswordBySMS(phone: string, password: string, userData: any) {
  try {
    const message = `Hello ${userData.firstname}, your UbuntuLend account password has been reset. Your new password is: ${password}. Please login and change it soon.`
    
    return sendSMS(phone, message)
  } catch (error) {
    console.error("Failed to send SMS:", error);
    return {
      success: false,
      error: "Failed to send SMS. Please try again.",
      status: 500
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
