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
        loanTermMonths: applications.loanTermMonths,
      })
      .from(applications)
      .where(eq(applications.userId, Number(userId)));

    console.log("Loan Term Months:", result);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching loanTermMonths:", error);
    return NextResponse.json({ error: "Failed to fetch loan term months" }, { status: 500 });
  }
}
