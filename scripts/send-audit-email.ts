import { Resend } from 'resend';

// Parse CLI arguments
const args = process.argv.slice(2);
function getArg(name: string, required = true): string {
  const idx = args.indexOf(`--${name}`);
  if (idx === -1 || idx + 1 >= args.length) {
    if (required) throw new Error(`Missing required argument: --${name}`);
    return '';
  }
  return args[idx + 1];
}

const to = getArg('to');
const subject = getArg('subject');
const summary = getArg('summary');
const diffUrl = getArg('diff-url');
const rating = getArg('rating', false) || 'N/A';

const apiKey = process.env.RESEND_API_KEY;
if (!apiKey) {
  console.error('Error: RESEND_API_KEY environment variable is not set.');
  console.error('Set it in .env.local or export it before running this script.');
  process.exit(1);
}

const resend = new Resend(apiKey);

const htmlBody = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #1a1a2e; border-bottom: 2px solid #e94560; padding-bottom: 10px;">
    Astrotattwa - Documentation Audit Report
  </h2>

  <div style="display: flex; align-items: center; gap: 12px; margin: 20px 0;">
    <div style="background: ${Number(rating) >= 8 ? '#d4edda' : Number(rating) >= 6 ? '#fff3cd' : '#f8d7da'}; border: 1px solid ${Number(rating) >= 8 ? '#28a745' : Number(rating) >= 6 ? '#ffc107' : '#dc3545'}; border-radius: 8px; padding: 12px 20px; text-align: center; min-width: 120px;">
      <div style="font-size: 28px; font-weight: 700; color: ${Number(rating) >= 8 ? '#155724' : Number(rating) >= 6 ? '#856404' : '#721c24'};">${rating}/10</div>
      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #666;">Confidence</div>
    </div>
    <div style="font-size: 13px; color: #666;">
      ${Number(rating) >= 9 ? 'Every finding independently verified. High confidence.' : Number(rating) >= 7 ? 'Most findings verified. A few relied on cached snapshot.' : Number(rating) >= 5 ? 'Mixed confidence. Review recommended before approving.' : 'Low confidence. Manual review strongly recommended.'}
    </div>
  </div>

  <div style="background: #f5f5f5; border-radius: 8px; padding: 16px; margin: 20px 0;">
    <h3 style="margin-top: 0; color: #333;">Audit Summary</h3>
    <pre style="white-space: pre-wrap; font-size: 14px; color: #444;">${summary}</pre>
  </div>

  <div style="margin: 24px 0;">
    <a href="${diffUrl}" style="display: inline-block; background: #238636; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 16px;">
      Review Changes on GitHub
    </a>
  </div>

  <div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 16px; margin: 20px 0;">
    <strong>How to respond:</strong>
    <p style="margin: 8px 0 0 0;">After reviewing the changes on GitHub, run one of these commands on the server:</p>
    <div style="background: #1e1e1e; border-radius: 6px; padding: 12px 16px; margin: 12px 0;">
      <p style="color: #4caf50; font-family: monospace; font-size: 13px; margin: 0 0 4px 0;">✅ To APPROVE (merge + deploy):</p>
      <code style="color: #e2e8f0; font-family: monospace; font-size: 13px;">echo "APPROVE" &gt; /var/www/astrotattwa-web/cron-scripts/logs/email-reply.txt</code>
    </div>
    <div style="background: #1e1e1e; border-radius: 6px; padding: 12px 16px; margin: 12px 0;">
      <p style="color: #f44336; font-family: monospace; font-size: 13px; margin: 0 0 4px 0;">❌ To REJECT (discard branch):</p>
      <code style="color: #e2e8f0; font-family: monospace; font-size: 13px;">echo "REJECT" &gt; /var/www/astrotattwa-web/cron-scripts/logs/email-reply.txt</code>
    </div>
    <p style="margin: 8px 0 0 0; font-size: 12px; color: #856404;">The audit task polls this file every 5 minutes for up to 2 hours. If no response, the branch is automatically discarded.</p>
  </div>

  <p style="color: #888; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px;">
    Automated by Astrotattwa Doc Audit Pipeline
  </p>
</div>
`;

async function sendEmail() {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Astrotattwa Audit <onboarding@resend.dev>',
      to: [to],
      subject: subject,
      html: htmlBody,
    });

    if (error) {
      console.error('Failed to send email:', error);
      process.exit(1);
    }

    console.log('Email sent successfully. ID:', data?.id);
  } catch (err) {
    console.error('Error sending email:', err);
    process.exit(1);
  }
}

sendEmail();
