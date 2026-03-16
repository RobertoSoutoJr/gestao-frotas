const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
  }

  getTransporter() {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    }
    return this.transporter;
  }

  generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendVerificationCode(email, code, nome) {
    const transporter = this.getTransporter();

    const mailOptions = {
      from: `"FrotaPro" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Código de Verificação - FrotaPro',
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
          <div style="background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 32px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">🚛 FrotaPro</h1>
            <p style="color: #e0d4fc; margin: 8px 0 0; font-size: 14px;">Gestão Inteligente de Frotas</p>
          </div>
          <div style="padding: 32px;">
            <p style="color: #374151; font-size: 16px; margin: 0 0 8px;">Olá, <strong>${nome}</strong>!</p>
            <p style="color: #6b7280; font-size: 14px; margin: 0 0 24px;">Use o código abaixo para verificar seu email:</p>
            <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 24px;">
              <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #4f46e5;">${code}</span>
            </div>
            <p style="color: #9ca3af; font-size: 13px; margin: 0;">Este código expira em <strong>10 minutos</strong>.</p>
            <p style="color: #9ca3af; font-size: 13px; margin: 8px 0 0;">Se você não solicitou este código, ignore este email.</p>
          </div>
          <div style="background: #f9fafb; padding: 16px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">&copy; 2026 FrotaPro. Todos os direitos reservados.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
  }
}

module.exports = new EmailService();
