import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SmtpService {
  constructor(private readonly mailerService: MailerService) {}

  async sendVerifyOtp(emailTo: string, otpCode: string) {
    await this.mailerService.sendMail({
      to: emailTo,
      subject: 'Verify Your Account',
      html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>Verify Your Account</h2>
        <p>Here is your verification code. Please enter this code in the application:</p>
        <h1 style="background: #f4f4f4; padding: 10px; display: inline-block; letter-spacing: 5px; color: #333;">
          ${otpCode}
        </h1>
        <p>This code is valid for 15 minutes.</p>
      </div>
    `,
    });
  }

  async sendChannelWelcome(mailTo: string) {
    await this.mailerService.sendMail({
      to: mailTo,
      subject: 'Your Channel Has Been Created',
      html: `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2>Congratulations! Your Channel Is Ready</h2>
        <p>
          Thank you for creating a channel on <strong>Strimo</strong>.
        </p>
        <p>
          Your channel <strong>Strimo</strong> has been successfully
          created and is now ready to use.
        </p>
        <p>
          We’re excited to have you as part of the Strimo community.
          Start sharing your content and building your audience today!
        </p>
        <br />
        <p>
          Best regards,<br />
          <strong>The Strimo Team</strong>
        </p>
      </div>
    `,
    });
  }
}
