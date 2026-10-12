const nodemailer = require('nodemailer');

class MailService {
  constructor() {
    this._transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || 'smtp.mailtrap.io',
      port: Number(process.env.MAIL_PORT) || 2525,
      auth: {
        user: process.env.MAIL_USER || '',
        pass: process.env.MAIL_PASSWORD || '',
      },
    });
  }

  async sendEmail(targetEmail, { subject, text, html }) {
    const message = {
      from: `OpenJob <${process.env.MAIL_FROM || 'no-reply@openjob.com'}>`,
      to: targetEmail,
      subject,
      text,
      html,
    };

    return this._transporter.sendMail(message);
  }
}

module.exports = MailService;
