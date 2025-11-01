import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, subject, message } = body

    // Validate input
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // TODO: Send email using your preferred email service
    // Option 1: Using Resend (recommended for Vercel)
    // Option 2: Using SendGrid
    // Option 3: Using Nodemailer with SMTP
    // Option 4: Using mailto link (simplest but less reliable)

    // For now, we'll log the message (replace this with actual email sending)
    console.log('Contact form submission:', {
      name,
      email,
      subject,
      message,
      timestamp: new Date().toISOString(),
    })

    // In production, you should:
    // 1. Send email to yourself using Resend/SendGrid/etc.
    // 2. Optionally send a confirmation email to the user
    // 3. Store submissions in a database (optional)

    return NextResponse.json(
      { message: 'Message sent successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Failed to send message. Please try again later.' },
      { status: 500 }
    )
  }
}

