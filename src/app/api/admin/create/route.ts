import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/database/db'
import { users } from '@/database/ubuntu-lend/schema'
import bcrypt from 'bcryptjs'
import { auth } from '@/auth'
import { z } from 'zod'

// Define validation schema
const adminCreateSchema = z.object({
  firstname: z.string().min(1, "First name is required"),
  lastname: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  idNumber: z.string().length(13, "ID number must be 13 digits"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  roleId: z.string().transform(val => parseInt(val, 10)),
  isAdmin: z.number().default(1)
});

export async function POST(req: NextRequest) {
  try {
    // Verify the current user is an admin
    const session = await auth()
    
    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'Unauthorized' }, 
        { status: 401 }
      )
    }
    
    // Verify the current user has admin privileges
    if (session.user.isAdmin !== 1 && session.user.isAdmin !== 2) {
      return NextResponse.json(
        { message: 'Access denied. You need administrator privileges.' }, 
        { status: 403 }
      )
    }
    
    // Parse request body
    const body = await req.json()
    
    // Validate input data
    const validationResult = adminCreateSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          message: 'Validation failed', 
          errors: validationResult.error.format() 
        }, 
        { status: 400 }
      )
    }
    
    // Extract validated data
    const { 
      firstname, 
      lastname, 
      email, 
      phone, 
      idNumber, 
      password, 
      roleId, 
      isAdmin 
    } = validationResult.data
    
    // Check if email already exists
    const existingEmail = await db.select()
      .from(users)
      .where(users.email).equals(email)
      .limit(1)
    
    if (existingEmail && existingEmail.length > 0) {
      return NextResponse.json(
        { message: 'A user with this email already exists' }, 
        { status: 409 }
      )
    }
    
    // Check if phone already exists
    const existingPhone = await db.select()
      .from(users)
      .where(users.phone).equals(phone)
      .limit(1)
    
    if (existingPhone && existingPhone.length > 0) {
      return NextResponse.json(
        { message: 'A user with this phone number already exists' }, 
        { status: 409 }
      )
    }
    
    // Check if ID number already exists
    const existingIdNumber = await db.select()
      .from(users)
      .where(users.idNumber).equals(idNumber)
      .limit(1)
    
    if (existingIdNumber && existingIdNumber.length > 0) {
      return NextResponse.json(
        { message: 'A user with this ID number already exists' }, 
        { status: 409 }
      )
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // Only super admins can create other super admins
    if (body.isAdmin === 2 && session.user.isAdmin !== 2) {
      return NextResponse.json(
        { message: 'Access denied. Only super admins can create super admin accounts.' }, 
        { status: 403 }
      )
    }
    
    // Create admin user
    const result = await db.insert(users).values({
      firstname,
      lastname,
      email,
      phone,
      idNumber,
      password: hashedPassword,
      roleId,
      isAdmin, // Use the validated isAdmin value (1 or 2)
      verified: 1, // Auto-verify admin accounts
      activated: 1, // Auto-activate admin accounts
      addedBy: session.user.id ? parseInt(session.user.id.toString(), 10) : 0,
      signupDate: new Date().toISOString(),
    })
    
    return NextResponse.json(
      { message: 'Admin user created successfully', userId: result.insertId },
      { status: 201 }
    )
    
  } catch (error) {
    console.error('Error creating admin:', error)
    return NextResponse.json(
      { message: 'Failed to create admin user', error: (error as Error).message }, 
      { status: 500 }
    )
  }
} 