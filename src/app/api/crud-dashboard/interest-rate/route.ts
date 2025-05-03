// app/api/user/next-payment-date/route.ts

import { NextResponse } from "next/server";
import { db } from "../../../../database/db";
import { applications } from "../../../../database/ubuntu-lend/schema";
import { eq } from "drizzle-orm";
import { auth } from "../../../../auth";

export async function GET(req: Request) {
  const session = await auth();

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = 1;

  try {
    const result = await db
      .select({
        totalInterest: applications.totalInterest,
      })
      .from(applications)
      .where(eq(applications.userId, Number(userId)));

    console.log("Interest Rate:", result);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching interestRate:", error);
    return NextResponse.json({ error: "Failed to fetch interest rate" }, { status: 500 });
  }
}
