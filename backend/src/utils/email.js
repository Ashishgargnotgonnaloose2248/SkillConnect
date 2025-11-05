import nodemailer from "nodemailer";
import { ApiError } from "./api-error.js";

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Email templates
export const emailTemplates = {
  welcome: (userName) => ({
    subject: "Welcome to SkillConnect! 🎉",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Welcome to SkillConnect!</h2>
        <p>Hello ${userName},</p>
        <p>Welcome to SkillConnect - your campus peer-to-peer skill exchange platform!</p>
        <p>You can now:</p>
        <ul>
          <li>Add skills you can teach</li>
          <li>Find skills you want to learn</li>
          <li>Connect with other students and faculty</li>
          <li>Schedule learning sessions</li>
        </ul>
        <p>Get started by completing your profile and adding your skills!</p>
        <p>Best regards,<br>The SkillConnect Team</p>
      </div>
    `,
  }),

  userVerified: (userName) => ({
    subject: "Account Verified - SkillConnect ✅",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10B981;">Account Verified!</h2>
        <p>Hello ${userName},</p>
        <p>Great news! Your SkillConnect account has been verified by our admin team.</p>
        <p>You now have full access to all platform features. Start connecting with other users and sharing your skills!</p>
        <p>Happy learning!<br>The SkillConnect Team</p>
      </div>
    `,
  }),

  sessionCreated: (sessionTitle, teacherName, scheduledDate) => ({
    subject: "New Learning Session Created 📚",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">New Learning Session</h2>
        <p>Hello,</p>
        <p>A new learning session has been created for you:</p>
        <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>${sessionTitle}</h3>
          <p><strong>Teacher:</strong> ${teacherName}</p>
          <p><strong>Scheduled:</strong> ${new Date(scheduledDate).toLocaleString()}</p>
        </div>
        <p>Please confirm the session to proceed with the learning experience.</p>
        <p>Best regards,<br>The SkillConnect Team</p>
      </div>
    `,
  }),

  sessionConfirmed: (sessionTitle, studentName, scheduledDate) => ({
    subject: "Session Confirmed - Ready to Learn! 🎯",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10B981;">Session Confirmed!</h2>
        <p>Hello,</p>
        <p>Great news! Your learning session has been confirmed:</p>
        <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>${sessionTitle}</h3>
          <p><strong>Student:</strong> ${studentName}</p>
          <p><strong>Scheduled:</strong> ${new Date(scheduledDate).toLocaleString()}</p>
        </div>
        <p>Get ready for an amazing learning experience!</p>
        <p>Best regards,<br>The SkillConnect Team</p>
      </div>
    `,
  }),

  sessionReminder: (sessionTitle, participantName, scheduledDate) => ({
    subject: "Session Reminder - Tomorrow! ⏰",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #F59E0B;">Session Reminder</h2>
        <p>Hello ${participantName},</p>
        <p>This is a friendly reminder about your upcoming session:</p>
        <div style="background: #FEF3C7; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>${sessionTitle}</h3>
          <p><strong>Scheduled:</strong> ${new Date(scheduledDate).toLocaleString()}</p>
        </div>
        <p>Don't forget to prepare for your session!</p>
        <p>Best regards,<br>The SkillConnect Team</p>
      </div>
    `,
  }),

  skillApproved: (skillName) => ({
    subject: "Skill Approved - Now Live! ✅",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10B981;">Skill Approved!</h2>
        <p>Hello,</p>
        <p>Great news! Your skill "<strong>${skillName}</strong>" has been approved by our admin team and is now live on the platform.</p>
        <p>Other users can now find and request to learn this skill from you!</p>
        <p>Happy teaching!<br>The SkillConnect Team</p>
      </div>
    `,
  }),

  skillRejected: (skillName, reason) => ({
    subject: "Skill Submission Update 📝",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #EF4444;">Skill Submission Update</h2>
        <p>Hello,</p>
        <p>We're writing to inform you about your skill submission "<strong>${skillName}</strong>".</p>
        <p>Unfortunately, this skill was not approved for the following reason:</p>
        <div style="background: #FEE2E2; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Reason:</strong> ${reason || "Does not meet our community guidelines"}</p>
        </div>
        <p>Please feel free to submit a revised version or contact our support team if you have questions.</p>
        <p>Best regards,<br>The SkillConnect Team</p>
      </div>
    `,
  }),
};

// Send email function
export const sendEmail = async (to, template, data = {}) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log("Email configuration not found. Skipping email send.");
      return { success: true, message: "Email configuration not available" };
    }

    const transporter = createTransporter();
    const emailTemplate = emailTemplates[template];
    
    if (!emailTemplate) {
      throw new ApiError(400, "Invalid email template");
    }

    const emailContent = typeof emailTemplate === "function" 
      ? emailTemplate(data) 
      : emailTemplate;

    const mailOptions = {
      from: process.env.EMAIL_FROM || "SkillConnect <noreply@skillconnect.com>",
      to,
      subject: emailContent.subject,
      html: emailContent.html,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent successfully to ${to}`);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    throw new ApiError(500, "Failed to send email");
  }
};

// Bulk email function
export const sendBulkEmail = async (recipients, template, data = {}) => {
  try {
    const results = [];
    
    for (const recipient of recipients) {
      try {
        const result = await sendEmail(recipient, template, data);
        results.push({ email: recipient, success: true, result });
      } catch (error) {
        results.push({ email: recipient, success: false, error: error.message });
      }
    }
    
    return results;
  } catch (error) {
    throw new ApiError(500, "Failed to send bulk emails");
  }
};

// Email verification function
export const sendVerificationEmail = async (userEmail, userName) => {
  return await sendEmail(userEmail, "welcome", { userName });
};

// Session notification functions
export const sendSessionCreatedEmail = async (studentEmail, sessionTitle, teacherName, scheduledDate) => {
  return await sendEmail(studentEmail, "sessionCreated", { sessionTitle, teacherName, scheduledDate });
};

export const sendSessionConfirmedEmail = async (teacherEmail, sessionTitle, studentName, scheduledDate) => {
  return await sendEmail(teacherEmail, "sessionConfirmed", { sessionTitle, studentName, scheduledDate });
};

export const sendSessionReminderEmail = async (participantEmail, participantName, sessionTitle, scheduledDate) => {
  return await sendEmail(participantEmail, "sessionReminder", { participantName, sessionTitle, scheduledDate });
};

// Skill notification functions
export const sendSkillApprovedEmail = async (userEmail, skillName) => {
  return await sendEmail(userEmail, "skillApproved", { skillName });
};

export const sendSkillRejectedEmail = async (userEmail, skillName, reason) => {
  return await sendEmail(userEmail, "skillRejected", { skillName, reason });
};

// User verification email
export const sendUserVerifiedEmail = async (userEmail, userName) => {
  return await sendEmail(userEmail, "userVerified", { userName });
};
