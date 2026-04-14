import { Resend } from "resend";
import type { OrderReceiptSnapshot, GiftCardReceiptData } from "@/lib/receipt-types";

function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

function deliveryMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    pickup: "Store pickup",
    standard: "Standard delivery (3–5 days)",
    tomorrow: "Next-day delivery",
    today: "Same-day delivery",
  };
  return labels[method] ?? method;
}

function giftCardDeliveryLabel(method: string): string {
  if (method === "TEXT") return "SMS";
  if (method === "PHYSICAL") return "Physical delivery";
  return "Email";
}

export function buildOrderReceiptHtml(data: OrderReceiptSnapshot): string {
  const itemRows = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding:11px 0;border-bottom:1px solid #f5f0ee;font-size:13px;color:#292524;line-height:1.4;">
          <span style="font-weight:600;">${item.name}</span> × ${item.quantity}
          ${item.selectedLabels.length > 0 ? `<br><span style="font-size:11px;color:#78716c;">${item.selectedLabels.join(", ")}</span>` : ""}
        </td>
        <td style="padding:11px 0;border-bottom:1px solid #f5f0ee;font-size:13px;font-weight:600;color:#292524;text-align:right;white-space:nowrap;">${formatUsd(item.lineTotal)}</td>
      </tr>`,
    )
    .join("");

  const taxRow =
    data.taxes > 0
      ? `<tr><td style="padding:3px 0;font-size:11px;color:#78716c;">Taxes</td><td style="padding:3px 0;font-size:11px;color:#78716c;text-align:right;">${formatUsd(data.taxes)}</td></tr>`
      : "";

  const deliveryRow =
    data.deliveryFee > 0
      ? `<tr><td style="padding:3px 0;font-size:11px;color:#78716c;">Delivery</td><td style="padding:3px 0;font-size:11px;color:#78716c;text-align:right;">${formatUsd(data.deliveryFee)}</td></tr>`
      : `<tr><td style="padding:3px 0;font-size:11px;color:#78716c;">Delivery</td><td style="padding:3px 0;font-size:11px;color:#78716c;text-align:right;">Free</td></tr>`;

  const passportRow =
    data.passportApplied && data.passportPrice > 0
      ? `<tr><td style="padding:3px 0;font-size:11px;color:#78716c;">Passport subscription</td><td style="padding:3px 0;font-size:11px;color:#78716c;text-align:right;">${formatUsd(data.passportPrice)}</td></tr>`
      : "";

  const formattedDate = new Date(data.date).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Your receipt — Details by MIMA</title>
</head>
<body style="margin:0;padding:0;background:#faf9f7;font-family:Georgia,'Times New Roman',serif;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr><td align="center" style="padding:32px 16px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">

        <!-- Header -->
        <tr><td style="text-align:center;padding:30px 0 22px;border-bottom:1px solid #f0e6e0;">
          <div style="font-size:24px;font-weight:700;color:#1c1917;letter-spacing:0.03em;">Details by MIMA</div>
          <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.22em;color:#c4a39a;margin-top:7px;">Order Confirmation 🌸</div>
        </td></tr>

        <!-- Greeting -->
        <tr><td style="padding:22px 0 0;">
          <p style="margin:0;font-size:14px;color:#44403c;">Hi ${data.customerName || "there"},</p>
          <p style="margin:8px 0 0;font-size:14px;color:#44403c;">Thank you for your order! Your receipt is below.</p>
        </td></tr>

        <!-- Order meta -->
        <tr><td style="padding:16px 0 0;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;border-radius:14px;border:1px solid #f0e6e0;">
            <tr>
              <td style="padding:18px 20px;vertical-align:top;">
                <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.18em;color:#c4a39a;">Order</div>
                <div style="font-size:14px;color:#1c1917;margin-top:4px;font-weight:600;">${data.orderId}</div>
              </td>
              <td style="padding:18px 20px;vertical-align:top;text-align:right;">
                <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.18em;color:#c4a39a;">Date</div>
                <div style="font-size:13px;color:#1c1917;margin-top:4px;">${formattedDate}</div>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- Items -->
        <tr><td style="padding:12px 0 0;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;border-radius:14px;border:1px solid #f0e6e0;padding:20px;">
            <tr><td colspan="2" style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.18em;color:#c4a39a;padding-bottom:10px;">Items</td></tr>
            ${itemRows}
            <tr><td colspan="2" style="padding-top:12px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr><td style="padding:3px 0;font-size:11px;color:#78716c;">Subtotal</td><td style="padding:3px 0;font-size:11px;color:#78716c;text-align:right;">${formatUsd(data.subtotal)}</td></tr>
                ${taxRow}
                ${deliveryRow}
                ${passportRow}
                <tr>
                  <td style="padding-top:12px;font-size:15px;font-weight:700;color:#1c1917;border-top:1px solid #f0e6e0;">Total</td>
                  <td style="padding-top:12px;font-size:18px;font-weight:700;color:#be5a6d;text-align:right;border-top:1px solid #f0e6e0;">${formatUsd(data.total)}</td>
                </tr>
              </table>
            </td></tr>
          </table>
        </td></tr>

        <!-- Delivery -->
        <tr><td style="padding:12px 0 0;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;border-radius:14px;border:1px solid #f0e6e0;padding:18px 20px;">
            <tr><td style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.18em;color:#c4a39a;padding-bottom:6px;">Delivery</td></tr>
            <tr><td style="font-size:13px;color:#292524;">${deliveryMethodLabel(data.deliveryMethod)}</td></tr>
          </table>
        </td></tr>

        <!-- Footer -->
        <tr><td style="text-align:center;padding:28px 0 16px;font-size:11px;color:#a87c6a;line-height:1.8;">
          Questions? We're happy to help 💌<br>
          <a href="mailto:hello@detailsbymima.com" style="color:#be5a6d;text-decoration:none;">hello@detailsbymima.com</a>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function buildGiftCardReceiptHtml(data: GiftCardReceiptData): string {
  const cardRows = data.cards
    .map(
      (card, i) => `
      <tr>
        <td style="padding:14px 20px;${i > 0 ? "border-top:1px solid #f5f0ee;" : ""}">
          <div style="font-family:monospace;font-size:15px;font-weight:700;letter-spacing:0.12em;color:#1c1917;background:#faf9f7;border:1px solid #f0e6e0;border-radius:8px;padding:8px 12px;display:inline-block;">${card.code}</div>
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:8px;">
            <tr>
              <td style="font-size:12px;color:#78716c;">
                <strong style="color:#292524;">${formatUsd(card.amount)}</strong>
                ${card.recipientName ? ` · For <strong style="color:#292524;">${card.recipientName}</strong>` : ""}
                ${card.recipientEmail ? ` · ${card.recipientEmail}` : ""}
              </td>
              <td style="font-size:11px;color:#a87c6a;text-align:right;">${giftCardDeliveryLabel(card.deliveryMethod)}</td>
            </tr>
          </table>
        </td>
      </tr>`,
    )
    .join("");

  const formattedDate = new Date(data.date).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Your gift card receipt — Details by MIMA</title>
</head>
<body style="margin:0;padding:0;background:#faf9f7;font-family:Georgia,'Times New Roman',serif;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr><td align="center" style="padding:32px 16px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">

        <!-- Header -->
        <tr><td style="text-align:center;padding:30px 0 22px;border-bottom:1px solid #f0e6e0;">
          <div style="font-size:24px;font-weight:700;color:#1c1917;letter-spacing:0.03em;">Details by MIMA</div>
          <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.22em;color:#c4a39a;margin-top:7px;">Gift Card Receipt 🎁</div>
        </td></tr>

        <!-- Greeting -->
        <tr><td style="padding:22px 0 0;">
          <p style="margin:0;font-size:14px;color:#44403c;">Hi ${data.senderName || "there"},</p>
          <p style="margin:8px 0 0;font-size:14px;color:#44403c;">Your gift card${data.cards.length > 1 ? "s are" : " is"} active and ready to use. Here's your receipt.</p>
        </td></tr>

        <!-- Date & total -->
        <tr><td style="padding:16px 0 0;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;border-radius:14px;border:1px solid #f0e6e0;">
            <tr>
              <td style="padding:18px 20px;vertical-align:top;">
                <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.18em;color:#c4a39a;">Date</div>
                <div style="font-size:13px;color:#1c1917;margin-top:4px;">${formattedDate}</div>
              </td>
              <td style="padding:18px 20px;vertical-align:top;text-align:right;">
                <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.18em;color:#c4a39a;">Total</div>
                <div style="font-size:18px;font-weight:700;color:#be5a6d;margin-top:4px;">${formatUsd(data.totalAmountUsd)}</div>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- Cards -->
        <tr><td style="padding:12px 0 0;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;border-radius:14px;border:1px solid #f0e6e0;overflow:hidden;">
            <tr><td colspan="2" style="padding:16px 20px 0;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.18em;color:#c4a39a;">
              Gift Card${data.cards.length > 1 ? "s" : ""} (${data.cards.length})
            </td></tr>
            ${cardRows}
          </table>
        </td></tr>

        <!-- Footer -->
        <tr><td style="text-align:center;padding:28px 0 16px;font-size:11px;color:#a87c6a;line-height:1.8;">
          Questions? We're happy to help 💌<br>
          <a href="mailto:hello@detailsbymima.com" style="color:#be5a6d;text-decoration:none;">hello@detailsbymima.com</a>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

type SendOrderReceiptResult = { sent: true } | { sent: false; reason: string };

export async function sendOrderReceipt(data: OrderReceiptSnapshot): Promise<SendOrderReceiptResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.startsWith("re_xxx")) {
    return { sent: false, reason: "RESEND_API_KEY not configured" };
  }

  const resend = new Resend(apiKey);
  const from = process.env.RESEND_FROM_EMAIL ?? "Details by MIMA <onboarding@resend.dev>";

  try {
    await resend.emails.send({
      from,
      to: data.customerEmail,
      subject: `Your receipt — Details by MIMA (${data.orderId})`,
      html: buildOrderReceiptHtml(data),
    });
    return { sent: true };
  } catch (err) {
    return { sent: false, reason: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function sendGiftCardReceipt(data: GiftCardReceiptData): Promise<SendOrderReceiptResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.startsWith("re_xxx")) {
    return { sent: false, reason: "RESEND_API_KEY not configured" };
  }

  const resend = new Resend(apiKey);
  const from = process.env.RESEND_FROM_EMAIL ?? "Details by MIMA <onboarding@resend.dev>";

  try {
    await resend.emails.send({
      from,
      to: data.senderEmail,
      subject: `Your gift card receipt — Details by MIMA`,
      html: buildGiftCardReceiptHtml(data),
    });
    return { sent: true };
  } catch (err) {
    return { sent: false, reason: err instanceof Error ? err.message : "Unknown error" };
  }
}
