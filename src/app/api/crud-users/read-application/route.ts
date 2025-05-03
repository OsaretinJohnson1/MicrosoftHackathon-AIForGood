import { NextRequest, NextResponse } from "next/server";
import { auth } from '../../../../auth'; 
import { applications } from "../../../../database/ubuntu-lend/schema";
import { getUserByField } from "../../../../lib/utils";

export async function GET(request: NextRequest) {
  try {
    // Get the session using the App Router `auth()` helper
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized',
      }, { status: 401 });
    }

    // Get application ID from query parameters
    const url = new URL(request.url);
    const idParam = url.searchParams.get("id");

    if (!idParam) {
      return NextResponse.json(
        { success: false, message: "Application ID is required" },
        { status: 400 }
      );
    }
    
    let applicationId: number;
    
    // Handle IDs in format "APP-0001" by extracting the numeric part
    if (idParam.startsWith("APP-")) {
      const numericPart = idParam.replace("APP-", "");
      // Remove leading zeros
      applicationId = parseInt(numericPart.replace(/^0+/, ""));
    } else {
      // Try to parse as a regular number
      applicationId = parseInt(idParam);
    }
    
    // Validate that we got a valid number
    if (isNaN(applicationId)) {
      return NextResponse.json(
        { success: false, message: "Invalid application ID format" },
        { status: 400 }
      );
    }

    console.log(`Searching for application with ID: ${applicationId}`);

    // Fetch the application using getUserByField utility
    const applicationData = await getUserByField(
      "id", 
      applicationId, 
      applications,
      { limit: 1 }
    );

    if (!applicationData) {
      return NextResponse.json(
        { success: false, message: "Application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Application fetched successfully",
      data: applicationData,
    });
  } catch (error) {
    console.error("Error fetching application:", error);
    
    // Extract error message
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to fetch application",
        error: errorMessage
      },
      { status: 500 }
    );
  }
} 