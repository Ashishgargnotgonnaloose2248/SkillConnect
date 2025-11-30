import nodemailer from "nodemailer";
import { ApiError } from "./api-error.js";

const INLINE_LOGO =
  process.env.EMAIL_LOGO_URL ||
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTYwIDQwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxNjAiIGhlaWdodD0iNDAiIHJ4PSIxMiIgZmlsbD0iIzFDMUY0QSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTUlIiBmb250LWZhbWlseT0iSW50ZXIsIEFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE4IiBmb250LXdlaWdodD0iNjAwIiBmaWxsPSIjRkZGRkZGIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Ta2lsbENvbm5lY3Q8L3RleHQ+PC9zdmc+DQo=";

const BRAND = {
  primary: "#4F46E5",
  primaryDark: "#312E81",
  accent: "#F97316",
  text: "#111827",
  muted: "#6B7280",
  border: "#E5E7EB",
  background: "#F9FAFB",
};

const formatDateTime = (value) => {
  if (!value) return "To be scheduled";
  try {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    }).format(new Date(value));
  } catch (error) {
    return new Date(value).toLocaleString();
  }
};

const buildDetailRows = (rows = []) =>
  rows
    .filter((row) => row && row.value)
    .map(
      (row) => `
        <tr>
          <td style="padding: 6px 0; color: ${BRAND.muted}; font-size: 12px;">
            ${row.label}
          </td>
          <td style="padding: 6px 0; text-align: right; font-weight: 600; color: ${BRAND.text}; font-size: 14px;">
            ${row.value}
          </td>
        </tr>
      `
    )
    .join("");

const renderBaseEmail = ({
  preheader,
  title,
  intro,
  details,
  highlight,
  ctaLabel,
  ctaUrl,
  footer,
}) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0; padding:0; background:${BRAND.background}; font-family: 'Inter', 'Segoe UI', Arial, sans-serif; color:${BRAND.text};">
  <div style="display:none; max-height:0; overflow:hidden; color:transparent; opacity:0;">${preheader || ""}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:24px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="background:#fff; border-radius:20px; border:1px solid ${BRAND.border}; padding:40px; box-shadow:0 15px 45px rgba(15,23,42,0.08);">
          <tr>
            <td style="text-align:center; padding-bottom:16px;">
              <img src="${INLINE_LOGO}" alt="SkillConnect" width="120" height="32" style="display:inline-block;" />
            </td>
          </tr>
          <tr>
            <td style="text-align:center; padding-bottom:32px;">
              <p style="margin:0; text-transform:uppercase; letter-spacing:4px; font-size:11px; color:${BRAND.muted};">Skill Exchange Platform</p>
              <h1 style="margin:12px 0 0; font-size:28px; color:${BRAND.text};">${title}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom:24px; font-size:15px; line-height:1.6; color:${BRAND.text};">${intro}</td>
          </tr>
          ${highlight ? `<tr><td style="padding-bottom:28px;">
            <div style="background:linear-gradient(135deg, ${BRAND.primary}, ${BRAND.primaryDark}); color:#fff; border-radius:16px; padding:24px; box-shadow:0 10px 25px rgba(79,70,229,0.35);">
              ${highlight}
            </div>
          </td></tr>` : ""}
          ${details?.length ? `<tr><td style="padding-bottom:28px;">
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border:1px solid ${BRAND.border}; border-radius:16px; padding:20px;">
              ${buildDetailRows(details)}
            </table>
          </td></tr>` : ""}
          ${ctaLabel && ctaUrl ? `<tr><td style="text-align:center; padding-bottom:24px;">
            <a href="${ctaUrl}" style="display:inline-block; background:${BRAND.primary}; color:#fff; padding:14px 32px; border-radius:999px; font-weight:600; text-decoration:none; letter-spacing:0.3px;">${ctaLabel}</a>
          </td></tr>` : ""}
          ${footer ? `<tr><td style="font-size:13px; line-height:1.6; color:${BRAND.muted};">${footer}</td></tr>` : ""}
        </table>
        <p style="font-size:12px; color:${BRAND.muted}; margin-top:16px;">© ${new Date().getFullYear()} SkillConnect. All rights reserved.</p>
      </td>
    </tr>
  </table>
</body>
</html>`;

const getTransportOptions = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return null;
  }

  if (process.env.EMAIL_SERVICE) {
    return {
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    };
  }

  if (!process.env.EMAIL_HOST) {
    return null;
  }

  return {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT ? Number(process.env.EMAIL_PORT) : 587,
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  };
};

let transporterCache = null;
const getTransporter = () => {
  if (transporterCache) return transporterCache;
  const options = getTransportOptions();
  if (!options) return null;
  transporterCache = nodemailer.createTransport(options);
  return transporterCache;
};

export const emailTemplates = {
  welcome: ({ userName }) => ({
    subject: "Welcome to SkillConnect!",
    html: renderBaseEmail({
      preheader: "Your campus skill exchange starts now.",
      title: "Welcome Aboard",
      intro: `Hi ${userName || "there"},<br/>We're thrilled to have you in the SkillConnect community. Start sharing knowledge, finding mentors, and unlocking new possibilities on campus!`,
      highlight: "Add your first skill to teach or learn and get matched within minutes.",
      ctaLabel: "Complete Profile",
      ctaUrl: process.env.APP_URL || "https://skillconnect.app",
    }),
  }),

  userVerified: ({ userName }) => ({
    subject: "Your SkillConnect account is verified",
    html: renderBaseEmail({
      preheader: "You're fully verified and ready to go.",
      title: "Verification Complete",
      intro: `Hi ${userName || "there"},<br/>Your account has been verified. You can now start hosting sessions, joining classes, and mentoring others across campus.`,
      ctaLabel: "Explore Sessions",
      ctaUrl: `${process.env.APP_URL || "https://skillconnect.app"}/sessions`,
    }),
  }),

  sessionCreated: ({ studentName, sessionTitle, teacherName, scheduledDate, meetingLink }) => ({
    subject: `You're invited: ${sessionTitle}`,
    html: renderBaseEmail({
      preheader: `${teacherName} scheduled a session for you`,
      title: "Your Session Is Ready",
      intro: `Hi ${studentName || "there"},<br/>${teacherName} just created a learning session for you. Review the details below and get ready to join.`,
      highlight: `<p style="margin:0; font-size:22px; font-weight:600;">${sessionTitle}</p><p style="margin:8px 0 0; font-size:14px;">${formatDateTime(scheduledDate)}</p>`,
      details: [
        { label: "Teacher", value: teacherName },
        { label: "Scheduled For", value: formatDateTime(scheduledDate) },
        {
          label: "Meeting Link",
          value: meetingLink
            ? `<a href="${meetingLink}" style="color:${BRAND.primary};">${meetingLink}</a>`
            : "Pending – you'll receive the link soon",
        },
      ],
      ctaLabel: meetingLink ? "Join Session" : undefined,
      ctaUrl: meetingLink || undefined,
      footer:
        "Need to reschedule or have a question? Reply to this email or contact your instructor directly.",
    }),
  }),

  sessionConfirmed: ({ sessionTitle, studentName, scheduledDate, meetingLink }) => ({
    subject: `Session confirmed: ${sessionTitle}`,
    html: renderBaseEmail({
      preheader: `${studentName} confirmed their attendance`,
      title: "Session Confirmed",
      intro: `${studentName} has confirmed the session. Prepare your materials and share any pre-work ahead of time if needed.`,
      details: [
        { label: "Session", value: sessionTitle },
        { label: "Student", value: studentName },
        { label: "Scheduled", value: formatDateTime(scheduledDate) },
        meetingLink && {
          label: "Meeting Link",
          value: `<a href="${meetingLink}" style="color:${BRAND.primary};">${meetingLink}</a>`,
        },
      ],
      ctaLabel: meetingLink ? "Open Meeting" : undefined,
      ctaUrl: meetingLink || undefined,
    }),
  }),

  sessionReminder: ({ participantName, sessionTitle, scheduledDate, meetingLink }) => ({
    subject: `Reminder: ${sessionTitle} starts soon`,
    html: renderBaseEmail({
      preheader: "Your session is coming up",
      title: "Session Reminder",
      intro: `Hi ${participantName},<br/>Don't forget your upcoming SkillConnect session. Bring your questions and be ready to learn!`,
      details: [
        { label: "Session", value: sessionTitle },
        { label: "When", value: formatDateTime(scheduledDate) },
        meetingLink && {
          label: "Meeting Link",
          value: `<a href="${meetingLink}" style="color:${BRAND.primary};">${meetingLink}</a>`,
        },
      ],
      ctaLabel: meetingLink ? "Join Now" : undefined,
      ctaUrl: meetingLink || undefined,
    }),
  }),

  skillApproved: ({ skillName }) => ({
    subject: `${skillName} is now live!`,
    html: renderBaseEmail({
      preheader: "Your skill is published",
      title: "Skill Approved",
      intro: `Great news! <strong>${skillName}</strong> is now available for students to request.`,
      ctaLabel: "View Skill",
      ctaUrl: `${process.env.APP_URL || "https://skillconnect.app"}/skills`,
    }),
  }),

  skillRejected: ({ skillName, reason }) => ({
    subject: `Update on ${skillName}`,
    html: renderBaseEmail({
      preheader: "We need a quick revision",
      title: "Skill Needs Attention",
      intro: `We reviewed your submission for <strong>${skillName}</strong>, but it needs a quick update before we can publish it.`,
      details: [
        {
          label: "Reason",
          value: reason || "This skill didn't meet our community guidelines.",
        },
      ],
      footer:
        "Reply to this email if you need help refining your submission. We're happy to collaborate!",
    }),
  }),

  collabRequestReceived: ({
    ownerName,
    projectTitle,
    requestorName,
    requestMessage,
    requestorSkills,
    requestorLinkedin,
    dashboardUrl,
  }) => ({
    subject: `${requestorName} wants to collaborate on ${projectTitle}`,
    html: renderBaseEmail({
      preheader: `${requestorName} is interested in your project`,
      title: "New Collaboration Request",
      intro: `Hi ${ownerName || "there"},<br/>${requestorName} just requested to collaborate on <strong>${projectTitle}</strong>. Review their details below and respond when ready.`,
      details: [
        { label: "Requester", value: requestorName },
        requestorLinkedin && {
          label: "LinkedIn",
          value: `<a href="${requestorLinkedin}" style="color:${BRAND.primary};">Profile</a>`,
        },
        requestorSkills?.length && {
          label: "Skills",
          value: requestorSkills.join(", "),
        },
        requestMessage && { label: "Message", value: requestMessage },
      ],
      ctaLabel: "Review in Dashboard",
      ctaUrl: dashboardUrl,
      footer: "Approve or decline collaboration requests directly from your SkillConnect dashboard.",
    }),
  }),

  collabRequestAccepted: ({ projectTitle, ownerName, ownerEmail, ownerLinkedin, projectUrl }) => ({
    subject: `You're in! ${projectTitle}`,
    html: renderBaseEmail({
      preheader: "Your collaboration request was accepted",
      title: "Collaboration Approved",
      intro: `Great news! ${ownerName || "The project owner"} approved your request to join <strong>${projectTitle}</strong>. Reach out to coordinate next steps.`,
      details: [
        ownerEmail && { label: "Contact Email", value: ownerEmail },
        ownerLinkedin && {
          label: "LinkedIn",
          value: `<a href="${ownerLinkedin}" style="color:${BRAND.primary};">Connect</a>`,
        },
      ],
      ctaLabel: "Open Project",
      ctaUrl: projectUrl,
      footer: "Share updates with your new teammate and keep the momentum going!",
    }),
  }),

  collabRequestRejected: ({ projectTitle, ownerName }) => ({
    subject: `Update on ${projectTitle}`,
    html: renderBaseEmail({
      preheader: "Collaboration request update",
      title: "Request Closed",
      intro: `Hi there,<br/>${ownerName || "The project owner"} isn't moving forward with collaboration on <strong>${projectTitle}</strong> right now. Keep exploring other great projects on SkillConnect!`,
      footer: "Browse other initiatives on the Projects page and keep building.",
    }),
  }),
};

export const sendEmail = async (to, templateName, data = {}) => {
  const transporter = getTransporter();
  if (!transporter) {
    console.log("Email credentials missing. Skipping email send.");
    return { success: true, message: "Email configuration unavailable" };
  }

  const template = emailTemplates[templateName];
  if (!template) {
    throw new ApiError(400, `Unknown email template: ${templateName}`);
  }

  const { subject, html } = template(data);
  try {
    const response = await transporter.sendMail({
      from: process.env.EMAIL_FROM || "SkillConnect <noreply@skillconnect.ai>",
      to,
      subject,
      html,
    });
    return { success: true, messageId: response.messageId };
  } catch (error) {
    console.error("Email send failed", error);
    throw new ApiError(500, "Failed to send email");
  }
};

export const sendBulkEmail = async (recipients, template, sharedData = {}) => {
  const results = await Promise.allSettled(
    recipients.map((recipient) => sendEmail(recipient, template, sharedData))
  );

  return results.map((result, index) => ({
    email: recipients[index],
    success: result.status === "fulfilled",
    ...(result.status === "fulfilled" ? result.value : { error: result.reason?.message }),
  }));
};

export const sendVerificationEmail = (userEmail, userName) =>
  sendEmail(userEmail, "welcome", { userName });

export const sendSessionCreatedEmail = (
  studentEmail,
  sessionTitle,
  teacherName,
  scheduledDate,
  meetingLink,
  studentName
) =>
  sendEmail(studentEmail, "sessionCreated", {
    sessionTitle,
    teacherName,
    scheduledDate,
    meetingLink,
    studentName,
  });

export const sendSessionConfirmedEmail = (
  teacherEmail,
  sessionTitle,
  studentName,
  scheduledDate,
  meetingLink
) =>
  sendEmail(teacherEmail, "sessionConfirmed", {
    sessionTitle,
    studentName,
    scheduledDate,
    meetingLink,
  });

export const sendSessionReminderEmail = (
  participantEmail,
  participantName,
  sessionTitle,
  scheduledDate,
  meetingLink
) =>
  sendEmail(participantEmail, "sessionReminder", {
    participantName,
    sessionTitle,
    scheduledDate,
    meetingLink,
  });

export const sendSkillApprovedEmail = (userEmail, skillName) =>
  sendEmail(userEmail, "skillApproved", { skillName });

export const sendSkillRejectedEmail = (userEmail, skillName, reason) =>
  sendEmail(userEmail, "skillRejected", { skillName, reason });

export const sendUserVerifiedEmail = (userEmail, userName) =>
  sendEmail(userEmail, "userVerified", { userName });

export const sendCollabRequestReceivedEmail = (
  ownerEmail,
  { ownerName, projectTitle, requestorName, requestMessage, requestorSkills, requestorLinkedin, dashboardUrl }
) =>
  sendEmail(ownerEmail, "collabRequestReceived", {
    ownerName,
    projectTitle,
    requestorName,
    requestMessage,
    requestorSkills,
    requestorLinkedin,
    dashboardUrl,
  });

export const sendCollabRequestAcceptedEmail = (
  requestorEmail,
  { projectTitle, ownerName, ownerEmail, ownerLinkedin, projectUrl }
) =>
  sendEmail(requestorEmail, "collabRequestAccepted", {
    projectTitle,
    ownerName,
    ownerEmail,
    ownerLinkedin,
    projectUrl,
  });

export const sendCollabRequestRejectedEmail = (requestorEmail, { projectTitle, ownerName }) =>
  sendEmail(requestorEmail, "collabRequestRejected", { projectTitle, ownerName });
