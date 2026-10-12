const nodemailer = require('nodemailer');

class MailSender {
  constructor() {
    this._transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || 'sandbox.smtp.mailtrap.io',
      port: Number(process.env.MAIL_PORT) || 2525,
      auth: {
        user: process.env.MAIL_USER || '',
        pass: process.env.MAIL_PASSWORD || '',
      },
    });
  }

  sendEmail(targetEmail, { subject, text, html }) {
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

module.exports = MailSender;
