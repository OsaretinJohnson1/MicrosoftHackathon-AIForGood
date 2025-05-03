import { NextRequest, NextResponse } from "next/server";
import { applications } from "../../../../database/ubuntu-lend/schema";
import { auth } from '../../../../auth'; 
import { updateUserDataMultipleFields, getUserByField } from "../../../../lib/utils";

export async function PUT(request: NextRequest) {
  try {
    // Get authenticated user from NextAuth
    const session = await auth();
    
    if (!session || !session.user?.id) {
      return NextResponse.json({
        success: false,
        message: "Unauthorized. Please login to continue."
      }, { status: 401 });
    }

    const userId = Number(session.user.id);
    
    // Get application ID from URL
    const searchParams = request.nextUrl.searchParams;
    const applicationId = searchParams.get('id');
    
    if (!applicationId) {
      return NextResponse.json({
        success: false,
        message: "Application ID is required"
      }, { status: 400 });
    }
    
    // Parse request body
    const body = await request.json();
    const { status, rejectionReason, disbursedAmount } = body;

    if (!status) {
      return NextResponse.json({
        success: false,
        message: "Status is required"
      }, { status: 400 });
    }

    // Validate status value
    const validStatuses = ["pending", "approved", "rejected", "disbursed", "completed"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({
        success: false,
        message: "Invalid status. Status must be one of: pending, approved, rejected, disbursed, completed"
      }, { status: 400 });
    }

    // Get current time
    const now = new Date();

    // Prepare update data based on the new status
    const updateData: Record<string, any> = {
      status
    };

    // Add additional fields based on status
    if (status === "approved") {
      updateData.approvedBy = userId;
      updateData.approvedDate = now;
    } else if (status === "rejected") {
      if (!rejectionReason) {
        return NextResponse.json({
          success: false,
          message: "Rejection reason is required when status is 'rejected'"
        }, { status: 400 });
      }
      updateData.rejectionReason = rejectionReason;
      updateData.rejectedDate = now;
    } else if (status === "disbursed") {
      if (!disbursedAmount || isNaN(Number(disbursedAmount))) {
        return NextResponse.json({
          success: false,
          message: "Valid disbursed amount is required when status is 'disbursed'"
        }, { status: 400 });
      }
      updateData.disbursedAmount = disbursedAmount;
      updateData.disbursedDate = now;
    } else if (status === "completed") {
      updateData.completedDate = now;
    }

    try {
      // Use utility function to update application
      const applicationIdNum = parseInt(applicationId);
      await updateUserDataMultipleFields(applicationIdNum, updateData, applications);
        
      // Fetch the updated application using utility function
      const updatedApplication = await getUserByField("id", applicationIdNum, applications, { limit: 1 });
      
      if (!updatedApplication) {
        return NextResponse.json({
          success: false,
          message: "Application not found or could not be updated"
        }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        message: `Application status updated to ${status} successfully`,
        data: updatedApplication
      });
      
    } catch (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json({
        success: false,
        message: `Error updating the application in the database: ${dbError instanceof Error ? dbError.message : String(dbError)}`
      }, { status: 500 });
    }
  } catch (error) {
    console.error("Error updating application:", error);
    return NextResponse.json({
      success: false,
      message: "An error occurred while updating the application"
    }, { status: 500 });
  }
} 