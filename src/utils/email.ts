import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class Email {
  constructor() {}

  newTransport() {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(subject, email, message) {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject,
      text: message,
    };

    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome(email, message) {
    await this.send('Welcome', email, message);
  }

  async sendPasswordReset(email, message) {
    await this.send('Password reset', email, message);
  }
}
