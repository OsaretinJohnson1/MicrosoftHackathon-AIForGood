// app/api/crud-dashboard/account-number/route.ts

import { NextResponse } from "next/server";
import { db } from "../../../../database/db"; // Prefer alias if set in tsconfig
import { applications } from "../../../../database/ubuntu-lend/schema";
import { eq } from "drizzle-orm";
import { auth } from "../../../../auth"; // Alias assumed for cleaner imports

export async function GET(req: Request) {
  const session = await auth();

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const result = await db
      .select({
        accountNumber: applications.accountNumber,
      })
      .from(applications)
      .where(eq(applications.userId, Number(userId)));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching accountNumber:", error);
    return NextResponse.json(
      { error: "Failed to fetch account number" },
      { status: 500 }
    );
  }
}