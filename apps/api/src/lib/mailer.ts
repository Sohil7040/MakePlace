import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.example.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const isSmtpConfigured = Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);

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

  if (!isSmtpConfigured) {
    console.log('\n--- MOCK EMAIL DISPATCH ---');
    console.log(`To: ${email}`);
    console.log(`Subject: Your MakePlace Platform Credentials`);
    console.log(`Password: ${plainPassword}`);
    console.log('---------------------------\n');
    return;
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"MakePlace" <noreply@makeplace.com>',
      to: email,
      subject: 'Your MakePlace Platform Credentials',
      html: htmlContent,
    });
  } catch (error) {
    console.error('Failed to send email:', error);
  }
}
