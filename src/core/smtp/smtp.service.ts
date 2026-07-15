import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SmtpService {
  constructor(private readonly mailerService: MailerService) {}

  async sendVerifyOtp(email: string, otpCode: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Kode Verifikasi Akun Anda',
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Verifikasi Akun Anda</h2>
          <p>Berikut adalah kode verifikasi Anda. Silakan masukkan kode ini di aplikasi:</p>
          <h1 style="background: #f4f4f4; padding: 10px; display: inline-block; letter-spacing: 5px; color: #333;">
            ${otpCode}
          </h1>
          <p>Kode ini berlaku selama 15 menit.</p>
        </div>
      `,
    });
  }
}
