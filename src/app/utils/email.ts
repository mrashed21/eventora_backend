// import ejs from "ejs";
// import status from "http-status";
// import nodemailder from "nodemailer";
// import SMTPTransport from "nodemailer/lib/smtp-transport";
// import path from "path";
// import { config } from "../config/config";
// import api_error from "../error-helper/api-error";

// const transporter = nodemailder.createTransport({
//   host: config.EMAIL_SENDER_SMTP_HOST,
//   port: 587,
//   secure: false,
//   requireTLS: true,
//   auth: {
//     user: config.EMAIL_SENDER_SMTP_USER,
//     pass: config.EMAIL_SENDER_SMT_PASS,
//   },
//   family: 4,
// } as SMTPTransport.Options);

// // এটা যোগ করুন
// transporter.verify((error, success) => {
//   if (error) {
//     console.log("SMTP Connection Failed:", error);
//   } else {
//     console.log("SMTP Server Ready:", success);
//   }
// });
// // dn7q0rd8l1xlzdhi3nr4685cg

// interface SendEmailOptions {
//   to: string;
//   subject: string;
//   templateName: string;
//   templateData: Record<string, any>;
//   attachments?: {
//     filename: string;
//     content: Buffer | string;
//     contentType: string;
//   }[];
// }

// export const sendEmail = async ({
//   subject,
//   templateData,
//   templateName,
//   to,
//   attachments,
// }: SendEmailOptions) => {
//   try {
//     const templatePath = path.resolve(
//       process.cwd(),
//       `src/app/templates/${templateName}.ejs`,
//     );

//     const html = await ejs.renderFile(templatePath, templateData);

//     const info = await transporter.sendMail({
//       from: config.EMAIL_SENDER_SMTP_FROM,
//       to: to,
//       subject: subject,
//       html: html,
//       attachments: attachments?.map((attachment) => ({
//         filename: attachment.filename,
//         content: attachment.content,
//         contentType: attachment.contentType,
//       })),
//     });

//     console.log(`Email sent to ${to} : ${info.messageId}`);
//   } catch (error: any) {
//     console.log("Email Sending Error", error.message);
//     throw new api_error(status.INTERNAL_SERVER_ERROR, "Failed to send email");
//   }
// };


import { Resend } from "resend";
import ejs from "ejs";
import path from "path";
import status from "http-status";
import api_error from "../error-helper/api-error";
import { config } from "../config/config";

const resend = new Resend("re_fZVAWkg1_CMm6aHvnJTt7p42ticCFGvjV");

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

    const { data, error } = await resend.emails.send({
      from: "Eventora <onboarding@resend.dev>", // নিজের domain না থাকলে এটা ব্যবহার করুন
      to: to,
      subject: subject,
      html: html as string,
      attachments: attachments?.map((a) => ({
        filename: a.filename,
        content: a.content,
      })),
    });

    if (error) {
      console.log("Email Sending Error", error);
      throw new api_error(status.INTERNAL_SERVER_ERROR, "Failed to send email");
    }

    console.log(`Email sent to ${to} : ${data?.id}`);
  } catch (error: any) {
    console.log("Email Sending Error", error.message);
    throw new api_error(status.INTERNAL_SERVER_ERROR, "Failed to send email");
  }
};