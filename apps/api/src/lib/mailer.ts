import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const isResendConfigured = Boolean(process.env.RESEND_API_KEY);

export async function sendPlatformCredentials(email: string, name: string, plainPassword: string) {
  const loginUrl = process.env.FRONTEND_URL || 'http://localhost:3000/login';
  
  const htmlContent = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
      <h2 style="color: #000;">Welcome to MakePlace Platform, ${name}!</h2>
      <p>An account has been created for you. You can log in using the following credentials:</p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Email:</strong> ${email}</p>
        <p style="margin: 5px 0 0;"><strong>Password:</strong> ${plainPassword}</p>
      </div>
      <p>Please log in and change your password as soon as possible.</p>
      <a href="${loginUrl}" style="display: inline-block; background-color: #000; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 5px; margin-top: 10px;">Login to Platform</a>
    </div>
  `;

  if (!isResendConfigured) {
    console.warn('Resend is not configured. Email to ' + email + ' was not sent.');
    return;
  }

  try {
    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'MakePlace <onboarding@resend.dev>',
      to: email,
      subject: 'Your MakePlace Platform Credentials',
      html: htmlContent,
    });
    
    if (error) {
      console.error('Failed to send email:', error);
    }
  } catch (error) {
    console.error('Failed to send email:', error);
  }
}

export async function sendFeeReceipt(email: string, name: string, amount: number, description: string) {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #10b981; padding: 24px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Payment Receipt</h1>
      </div>
      <div style="padding: 32px 24px; background-color: #ffffff;">
        <h2 style="color: #000; margin-top: 0;">Hello ${name},</h2>
        <p style="color: #475569; font-size: 16px; line-height: 1.5;">
          Thank you! We have successfully received your payment for <strong>${description}</strong>.
        </p>
        <div style="background-color: #f8fafc; border-radius: 6px; padding: 16px; margin: 24px 0;">
          <p style="margin: 0; color: #64748b; font-size: 14px; text-transform: uppercase;">Amount Paid</p>
          <p style="margin: 4px 0 0 0; color: #0f172a; font-size: 32px; font-weight: bold;">₹${amount}</p>
        </div>
        <p style="color: #475569; font-size: 14px; line-height: 1.5;">
          If you have any questions regarding this receipt, please contact your MakePlace mentor or administrator.
        </p>
      </div>
      <div style="background-color: #f8fafc; padding: 16px; text-align: center; border-top: 1px solid #e2e8f0;">
        <p style="color: #94a3b8; font-size: 12px; margin: 0;">MakePlace Academy Platform</p>
      </div>
    </div>
  `;

  if (!isResendConfigured) {
    console.warn('Resend is not configured. Receipt to ' + email + ' was not sent.');
    return;
  }

  try {
    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'MakePlace <onboarding@resend.dev>',
      to: email,
      subject: 'MakePlace Payment Receipt',
      html: htmlContent,
    });
    
    if (error) {
      console.error('Failed to send receipt email:', error);
    } else {
      console.log(`Successfully sent receipt to ${email}`);
    }
  } catch (err) {
    console.error('Failed to send receipt email:', err);
  }
}
