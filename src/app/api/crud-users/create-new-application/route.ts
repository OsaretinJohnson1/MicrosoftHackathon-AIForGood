// app/api/applications/route.ts

import { NextResponse } from 'next/server';
import { db } from '../../../../database/db';
import { applications } from '../../../../database/ubuntu-lend/schema';
import { auth } from '../../../../auth';

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.redirect(new URL('/login', process.env.NEXTAUTH_URL));
    }

    const userId = Number(session.user.id);
    if (isNaN(userId)) {
      throw new Error("Invalid user ID");
    }

    const body = await req.json(); 

    
    const newApplication: any = {
      userId: userId,
      workAdress: body.workAdress,
      employer: body.employer,
      accountNumber: body.accountNumber,
      accountName: body.accountName,
      accountType: body.accountType,
      payDate: body.payDate,
      paymentSchedule: body.paymentSchedule,
      status: body.status || 'pending', 
    };

    const inserted = await db.insert(applications).values(newApplication);

    console.log('Inserted Application:', inserted);

    return NextResponse.json({
      success: true,
      message: 'Application created successfully',
      data: inserted,
    });
  } catch (error) {
    console.error('Error creating application:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create application',
      },
      { status: 500 }
    );
  }
}
