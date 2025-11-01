# Contact Form Setup Guide

The contact form is currently set up with a basic API route that logs submissions. To make it actually send emails, you need to choose and configure an email service.

## Current Status
✅ API route created at `app/api/contact/route.ts`  
✅ Contact form updated to call the API  
❌ Email sending not yet configured (currently just logs submissions)

## Option 1: Resend (Recommended for Vercel)

**Pros:** Easy setup, great for Vercel, free tier available  
**Cons:** Requires API key setup

### Setup Steps:
1. **Install Resend:**
   ```bash
   npm install resend
   ```

2. **Get API Key:**
   - Sign up at https://resend.com
   - Go to API Keys section
   - Create a new API key
   - Copy the key

3. **Add to Environment Variables:**
   - Add to `.env.local` (for local development):
     ```
     RESEND_API_KEY=re_xxxxxxxxxxxxx
     ```
   - Add to Vercel environment variables (Settings → Environment Variables):
     - Key: `RESEND_API_KEY`
     - Value: your API key from Resend

4. **Update API Route:**
   - Replace `app/api/contact/route.ts` with the code from `app/api/contact/resend-route.ts.example`
   - Update the `from` email address with your verified domain (or use `onboarding@resend.dev` for testing)
   - Update the `to` email to your actual email address

5. **Verify Domain (Optional but recommended):**
   - In Resend dashboard, add and verify your domain
   - This allows you to send from your own domain (e.g., `contact@yourdomain.com`)

## Option 2: SendGrid

**Pros:** Reliable, good free tier  
**Cons:** Slightly more complex setup

### Setup Steps:
1. **Install SendGrid:**
   ```bash
   npm install @sendgrid/mail
   ```

2. **Get API Key:**
   - Sign up at https://sendgrid.com
   - Create API key in Settings → API Keys
   - Copy the key

3. **Add to Environment Variables:**
   ```
   SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
   ```

4. **Update API Route:**
   ```typescript
   import sgMail from '@sendgrid/mail'
   
   sgMail.setApiKey(process.env.SENDGRID_API_KEY!)
   
   const msg = {
     to: 'mengshan.zhao@wsu.edu',
     from: 'noreply@yourdomain.com', // Must be verified
     subject: `Contact Form: ${subject}`,
     text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
     html: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p>${message}</p>`,
   }
   
   await sgMail.send(msg)
   ```

## Option 3: Nodemailer with SMTP

**Pros:** Works with any SMTP server (Gmail, Outlook, etc.)  
**Cons:** Can be unreliable with free providers, may require app passwords

### Setup Steps:
1. **Install Nodemailer:**
   ```bash
   npm install nodemailer
   npm install --save-dev @types/nodemailer
   ```

2. **Configure SMTP:**
   Add to `.env.local`:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   ```

3. **Update API Route:**
   ```typescript
   import nodemailer from 'nodemailer'
   
   const transporter = nodemailer.createTransport({
     host: process.env.SMTP_HOST,
     port: parseInt(process.env.SMTP_PORT || '587'),
     secure: false,
     auth: {
       user: process.env.SMTP_USER,
       pass: process.env.SMTP_PASS,
     },
   })
   
   await transporter.sendMail({
     from: process.env.SMTP_USER,
     to: 'mengshan.zhao@wsu.edu',
     subject: `Contact Form: ${subject}`,
     text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
     html: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p>${message}</p>`,
   })
   ```

## Option 4: Mailto Fallback (Simplest but Least Reliable)

This just opens the user's email client. Not recommended for production but works as a temporary solution.

### Update Contact Form:
```typescript
const mailtoLink = `mailto:mengshan.zhao@wsu.edu?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`From: ${name} (${email})\n\n${message}`)}`
window.location.href = mailtoLink
```

## Testing

After setup, test the form:
1. Fill out the contact form
2. Submit it
3. Check your email inbox
4. Check server logs for any errors

## Security Notes

- The current implementation logs submissions to console (good for debugging)
- Consider adding rate limiting to prevent spam
- Add reCAPTCHA or similar bot protection for production
- Validate and sanitize all inputs (currently just basic validation)
- Consider using environment variables for sensitive data

## Next Steps

1. Choose an email service provider
2. Follow the setup steps above
3. Update the API route with the actual email sending code
4. Test thoroughly
5. Deploy and verify emails are being received

