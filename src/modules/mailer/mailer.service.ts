import { Injectable } from '@nestjs/common';
import { config } from 'dotenv';
config();

const nodemailer = require('nodemailer');

@Injectable()
export class MailerService {
  service = `${process.env.MAILER_SERVICE}`;
  host = `${process.env.MAILER_HOST}`;
  port = `${process.env.MAILER_PORT}`;
  secure = `${process.env.MAILER_SECURE}`;
  email = `${process.env.MAILER_EMAIL}`;
  password = `${process.env.MAILER_PASSWORD}`;

  resetPasswordTransporter = nodemailer.createTransport({
    service: this.service,
    host: this.host,
    port: this.port,
    secure: this.secure,
    auth: {
      user: this.email,
      pass: this.password,
    },
  });

  sendResetEmail(email: string, token: string, origin: string) {
    const link = `${origin}/reset-password?token=${token}&email=${email}`;
    const mailOptions = {
      from: this.email,
      to: email,
      subject: 'Reset password',
      text: 'Reset your password.',
      html: ` <p>You requested to reset your password </p>
      <p>Please, click the link below to reset your Password</p>
      <a href="${link}" target="_blank">Reset Password</p>`,
    };

    this.resetPasswordTransporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email: ', error);
      } else {
        console.log('Email sent: ', info.response);
      }
    });
  }
}
