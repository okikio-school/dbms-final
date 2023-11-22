import type Mail from 'nodemailer/lib/mailer';
import { EMAIL, EMAIL_PASS } from '@/env'; 
import { render } from '@react-email/render';
import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL,
    pass: EMAIL_PASS,
  },
});

export async function sendMail(_options: Mail.Options, html: React.ReactElement) {
  const emailHtml = render(html);

  const options = {
    ..._options,
    html: emailHtml,
  };

  return await transporter.sendMail(options);
}