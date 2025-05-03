

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
        totalBalnce: applications.totalPayable,
      })
      .from(applications)
      .where(eq(applications.userId, Number(userId)));
      console.log("Total balance:", result)

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching accountNumber:", error);
    return NextResponse.json({ error: "Failed to fetch account number" }, { status: 500 });
  }
}
