import os
import random
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from dotenv import load_dotenv

load_dotenv()

MAIL_SERVER = os.getenv("MAIL_SERVER")
MAIL_PORT = int(os.getenv("MAIL_PORT", "587"))
MAIL_USERNAME = os.getenv("MAIL_USERNAME")
MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")
MAIL_FROM = os.getenv("MAIL_FROM") or MAIL_USERNAME
FRONTEND_URL = (os.getenv("FRONTEND_URL") or "http://localhost:5173").rstrip("/")


def generate_otp():
    """Generate a random 6-digit OTP."""
    return str(random.randint(100000, 999999))


def _send_html_email(receiver_email: str, subject: str, html: str) -> bool:
    """Send one HTML email using the existing TalentNest SMTP configuration."""
    if not MAIL_SERVER or not MAIL_USERNAME or not MAIL_PASSWORD or not MAIL_FROM:
        print(
            "EMAIL ERROR: MAIL_SERVER/MAIL_USERNAME/"
            "MAIL_PASSWORD/MAIL_FROM is not configured."
        )
        return False

    message = MIMEMultipart("alternative")
    message["Subject"] = subject
    message["From"] = MAIL_FROM
    message["To"] = receiver_email
    message.attach(MIMEText(html, "html", "utf-8"))

    server = None

    try:
        server = smtplib.SMTP(MAIL_SERVER, MAIL_PORT, timeout=30)
        server.ehlo()
        server.starttls()
        server.ehlo()
        server.login(MAIL_USERNAME, MAIL_PASSWORD)
        server.sendmail(
            MAIL_FROM,
            [receiver_email],
            message.as_string(),
        )
        return True

    except Exception as exc:
        print(f"EMAIL ERROR for {receiver_email}: {exc}")
        return False

    finally:
        if server is not None:
            try:
                server.quit()
            except Exception:
                pass


def send_otp_email(receiver_email: str, otp: str):
    subject = "TalentNest - Email Verification"

    html = f"""
<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;background:#f4f7fb;padding:40px;">
    <div style="max-width:600px;margin:auto;background:white;border-radius:12px;
                padding:40px;box-shadow:0 5px 20px rgba(0,0,0,0.08);">
        <h1 style="color:#1f2937;text-align:center;">TalentNest</h1>

        <h2 style="text-align:center;color:#1f817c;">
            Verify Your Email
        </h2>

        <p style="font-size:16px;color:#4b5563;">
            Welcome to TalentNest!
        </p>

        <p style="font-size:16px;color:#4b5563;">
            Use the verification code below to verify your email.
        </p>

        <div style="margin:30px auto;width:220px;background:#eaf7f5;
                    border:2px dashed #1f817c;border-radius:10px;
                    text-align:center;padding:20px;font-size:34px;
                    letter-spacing:8px;font-weight:bold;color:#1f817c;">
            {otp}
        </div>

        <p style="color:#6b7280;">
            This OTP will expire in 5 minutes.
        </p>

        <hr>

        <p style="font-size:13px;color:#9ca3af;text-align:center;">
            TalentNest ATS
        </p>
    </div>
</body>
</html>
"""

    return _send_html_email(receiver_email, subject, html)


def send_password_reset_email(receiver_email: str, otp: str):
    """Send a password-reset OTP email to a candidate."""
    subject = "TalentNest - Password Reset Code"

    html = f"""
<!DOCTYPE html>
<html>
<body style="margin:0;background:#f4f7fb;
             font-family:Arial,Helvetica,sans-serif;color:#152238;">
  <div style="max-width:600px;margin:40px auto;background:#ffffff;
              border:1px solid #dfe8eb;border-radius:18px;overflow:hidden;">

    <div style="padding:30px 32px;background:#eaf7f5;
                border-bottom:1px solid #d5ebe8;">
      <div style="font-size:14px;font-weight:700;letter-spacing:1px;
                  color:#1f817c;text-transform:uppercase;">
        TalentNest Security
      </div>

      <h1 style="margin:10px 0 0;font-size:28px;color:#142038;">
        Reset your password
      </h1>
    </div>

    <div style="padding:32px;">

      <p style="font-size:16px;color:#53657d;line-height:1.6;">
        We received a request to reset your TalentNest candidate account
        password.
      </p>

      <p style="font-size:16px;color:#53657d;line-height:1.6;">
        Enter the verification code below to continue:
      </p>

      <div style="margin:30px auto;width:220px;background:#eaf7f5;
                  border:2px dashed #1f817c;border-radius:10px;
                  text-align:center;padding:20px;font-size:34px;
                  letter-spacing:8px;font-weight:bold;color:#1f817c;">
        {otp}
      </div>

      <p style="color:#6b7280;font-size:14px;">
        This reset code expires in 5 minutes.
      </p>

      <p style="color:#6b7280;font-size:14px;line-height:1.6;">
        If you did not request a password reset, you can safely ignore
        this email.
      </p>

      <hr style="border:none;border-top:1px solid #e4eaee;margin:28px 0;">

      <p style="font-size:13px;color:#9ca3af;text-align:center;">
        TalentNest ATS
      </p>
    </div>
  </div>
</body>
</html>
"""

    return _send_html_email(receiver_email, subject, html)


def send_new_job_alert(receiver_email: str, job, company) -> bool:
    """Send a new-job notification to one newsletter subscriber."""
    title = job.title or "New opportunity"
    company_name = company.company_name if company else "TalentNest employer"
    location = job.location or "Location not specified"
    employment_type = job.employment_type or "Not specified"
    experience = job.experience or "Not specified"

    description = (job.description or "").strip()
    if len(description) > 500:
        description = description[:497].rstrip() + "..."

    job_url = f"{FRONTEND_URL}/jobs/{job.id}"

    safe_title = (
        title.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
    )
    safe_company = (
        company_name.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
    )
    safe_location = (
        location.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
    )
    safe_employment = (
        employment_type.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
    )
    safe_experience = (
        experience.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
    )
    safe_description = (
        description.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace("\n", "<br>")
    )

    subject = f"New job on TalentNest: {title} at {company_name}"

    html = f"""
<!DOCTYPE html>
<html>
<body style="margin:0;background:#f5f8fa;
             font-family:Arial,Helvetica,sans-serif;color:#152238;">
  <div style="max-width:680px;margin:32px auto;background:#ffffff;
              border:1px solid #dfe8eb;border-radius:18px;overflow:hidden;">

    <div style="padding:28px 32px;background:#eaf7f5;
                border-bottom:1px solid #d5ebe8;">
      <div style="font-size:14px;font-weight:700;letter-spacing:1px;
                  color:#1f817c;text-transform:uppercase;">
        TalentNest Job Alert
      </div>

      <h1 style="margin:10px 0 4px;font-size:28px;line-height:1.2;
                 color:#142038;">
        A new opportunity is available
      </h1>

      <p style="margin:0;color:#53657d;font-size:15px;">
        A company has just posted a new role on TalentNest.
      </p>
    </div>

    <div style="padding:32px;">
      <div style="font-size:14px;font-weight:700;color:#1f817c;
                  margin-bottom:8px;">
        {safe_company}
      </div>

      <h2 style="margin:0 0 22px;font-size:25px;color:#142038;">
        {safe_title}
      </h2>

      <table role="presentation" cellpadding="0" cellspacing="0"
             style="width:100%;font-size:14px;color:#53657d;">
        <tr>
          <td style="padding:8px 0;">
            <strong style="color:#142038;">Location:</strong>
            {safe_location}
          </td>
        </tr>

        <tr>
          <td style="padding:8px 0;">
            <strong style="color:#142038;">Employment:</strong>
            {safe_employment}
          </td>
        </tr>

        <tr>
          <td style="padding:8px 0;">
            <strong style="color:#142038;">Experience:</strong>
            {safe_experience}
          </td>
        </tr>
      </table>

      {f'<div style="margin-top:22px;padding-top:22px;border-top:1px solid #e4eaee;color:#53657d;line-height:1.65;font-size:15px;">{safe_description}</div>' if safe_description else ''}

      <div style="text-align:center;margin:30px 0 8px;">
        <a href="{job_url}"
           style="display:inline-block;background:#1f817c;color:#ffffff;
                  text-decoration:none;padding:14px 28px;border-radius:9px;
                  font-weight:700;font-size:15px;">
          View Job &amp; Apply
        </a>
      </div>

      <p style="margin:20px 0 0;text-align:center;color:#8a98a8;font-size:12px;">
        You are receiving this because you subscribed to TalentNest job alerts.
      </p>
    </div>

    <div style="padding:18px 32px;background:#f8fafb;
                border-top:1px solid #e4eaee;text-align:center;
                color:#8a98a8;font-size:12px;">
      TalentNest — Where Great Talent Finds Home
    </div>
  </div>
</body>
</html>
"""

    return _send_html_email(receiver_email, subject, html)


def send_new_job_alerts(subscribers, job, company) -> int:
    """Send a new-job alert to every subscriber and return the number sent successfully."""
    sent = 0

    for subscriber in subscribers:
        email = getattr(subscriber, "email", None)

        if email and send_new_job_alert(email, job, company):
            sent += 1

    return sent
