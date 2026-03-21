import ejs from "ejs";
import status from "http-status";
import nodemailder from "nodemailer";
import path from "path";
import { config } from "../config/config";
import AppError from "../error-helper/app-error";

const transporter = nodemailder.createTransport({
  host: config.EMAIL_SENDER_SMTP_HOST,
  secure: true,
  auth: {
    user: config.EMAIL_SENDER_SMTP_USER,
    pass: config.EMAIL_SENDER_SMT_PASS,
  },
  port: Number(config.EMAIL_SENDER_SMTP_PORT),
});

// dn7q0rd8l1xlzdhi3nr4685cg

interface SendEmailOptions {
  to: string;
  subject: string;
  templateName: string;
  templateData: Record<string, any>;
  attachments?: {
    filename: string;
    content: Buffer | string;
    contentType: string;
  }[];
}

export const sendEmail = async ({
  subject,
  templateData,
  templateName,
  to,
  attachments,
}: SendEmailOptions) => {
  try {
    const templatePath = path.resolve(
      process.cwd(),
      `src/app/templates/${templateName}.ejs`,
    );

    const html = await ejs.renderFile(templatePath, templateData);

    const info = await transporter.sendMail({
      from: config.EMAIL_SENDER_SMTP_FROM,
      to: to,
      subject: subject,
      html: html,
      attachments: attachments?.map((attachment) => ({
        filename: attachment.filename,
        content: attachment.content,
        contentType: attachment.contentType,
      })),
    });

    console.log(`Email sent to ${to} : ${info.messageId}`);
  } catch (error: any) {
    console.log("Email Sending Error", error.message);
    throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to send email");
  }
};
