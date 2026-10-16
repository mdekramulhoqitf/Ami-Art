import nodemailer from "nodemailer";

type OrderNotificationInput = {
  orderNumber: string;
  customerName: string;
  phone: string;
  serviceLabel: string;
  description: string;
  adminOrderUrl: string;
};

function isEmailConfigured() {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.SMTP_FROM
  );
}

/**
 * Fire-and-forget order notification email. If SMTP env vars aren't set, this
 * silently no-ops (logged) — the in-dashboard/Realtime notification is the
 * source of truth regardless of email delivery.
 */
export async function sendOrderNotificationEmail(input: OrderNotificationInput) {
  if (!isEmailConfigured()) {
    console.log(`[email] SMTP not configured — skipping notification for ${input.orderNumber}`);
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const shortDescription =
      input.description.length > 200 ? `${input.description.slice(0, 200)}…` : input.description;

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: "amiart54@gmail.com",
      subject: `নতুন অর্ডার — ${input.orderNumber}`,
      text: [
        `অর্ডার নম্বর: ${input.orderNumber}`,
        `গ্রাহক: ${input.customerName}`,
        `মোবাইল: ${input.phone}`,
        `সেবা: ${input.serviceLabel}`,
        `বিবরণ: ${shortDescription}`,
        ``,
        `বিস্তারিত দেখুন: ${input.adminOrderUrl}`,
      ].join("\n"),
    });
  } catch (error) {
    console.error("[email] Failed to send order notification:", error);
  }
}
