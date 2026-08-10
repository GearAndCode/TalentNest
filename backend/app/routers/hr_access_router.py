import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr

load_dotenv()

router = APIRouter(prefix="/hr-access", tags=["HR Access"])

MAIL_SERVER = os.getenv("MAIL_SERVER")
MAIL_PORT = int(os.getenv("MAIL_PORT", "587"))
MAIL_USERNAME = os.getenv("MAIL_USERNAME")
MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")
MAIL_FROM = os.getenv("MAIL_FROM") or MAIL_USERNAME
HR_ACCESS_RECEIVER = os.getenv(
    "HR_ACCESS_RECEIVER",
    MAIL_USERNAME or "talentnest.ats@gmail.com",
)


class HRAccessRequest(BaseModel):
    company_name: str
    work_email: EmailStr
    full_name: str
    job_title: str
    company_size: str
    message: str = ""


def _send_hr_access_email(request: HRAccessRequest) -> None:
    if not MAIL_SERVER or not MAIL_USERNAME or not MAIL_PASSWORD or not MAIL_FROM:
        raise RuntimeError(
            "SMTP is not configured. Check MAIL_SERVER, MAIL_USERNAME, "
            "MAIL_PASSWORD and MAIL_FROM in .env."
        )

    safe_message = (
        request.message.strip()
        if request.message and request.message.strip()
        else "No additional message provided."
    )

    subject = f"TalentNest HR Access Request - {request.company_name.strip()}"

    html = f"""
<!DOCTYPE html>
<html>
<body style="margin:0;background:#f5f8fa;font-family:Arial,Helvetica,sans-serif;color:#152238;">
  <div style="max-width:680px;margin:32px auto;background:#ffffff;
              border:1px solid #dfe8eb;border-radius:18px;overflow:hidden;">
    <div style="padding:28px 32px;background:#eaf7f5;border-bottom:1px solid #d5ebe8;">
      <div style="font-size:13px;font-weight:700;letter-spacing:1px;
                  color:#1f817c;text-transform:uppercase;">
        TalentNest HR Access
      </div>
      <h1 style="margin:10px 0 4px;font-size:28px;color:#142038;">
        New HR Access Request
      </h1>
      <p style="margin:0;color:#53657d;font-size:15px;">
        Someone has requested access to the TalentNest HR portal.
      </p>
    </div>

    <div style="padding:32px;">
      <table role="presentation" cellpadding="0" cellspacing="0"
             style="width:100%;font-size:15px;color:#53657d;">
        <tr>
          <td style="padding:9px 0;">
            <strong style="color:#142038;">Company:</strong>
            {request.company_name}
          </td>
        </tr>
        <tr>
          <td style="padding:9px 0;">
            <strong style="color:#142038;">Contact name:</strong>
            {request.full_name}
          </td>
        </tr>
        <tr>
          <td style="padding:9px 0;">
            <strong style="color:#142038;">Work email:</strong>
            {request.work_email}
          </td>
        </tr>
        <tr>
          <td style="padding:9px 0;">
            <strong style="color:#142038;">Job title:</strong>
            {request.job_title}
          </td>
        </tr>
        <tr>
          <td style="padding:9px 0;">
            <strong style="color:#142038;">Company size:</strong>
            {request.company_size}
          </td>
        </tr>
      </table>

      <div style="margin-top:24px;padding-top:24px;border-top:1px solid #e4eaee;">
        <div style="font-weight:700;color:#142038;margin-bottom:8px;">Message</div>
        <div style="color:#53657d;line-height:1.65;white-space:pre-wrap;">
          {safe_message}
        </div>
      </div>

      <div style="margin-top:28px;padding:16px;background:#f8fafb;
                  border:1px solid #e4eaee;border-radius:10px;">
        <strong style="color:#142038;">Reply directly to the requester:</strong>
        <a href="mailto:{request.work_email}"
           style="color:#1f817c;text-decoration:none;">
          {request.work_email}
        </a>
      </div>
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

    message = MIMEMultipart("alternative")
    message["Subject"] = subject
    message["From"] = MAIL_FROM
    message["To"] = HR_ACCESS_RECEIVER
    message["Reply-To"] = str(request.work_email)
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
            [HR_ACCESS_RECEIVER],
            message.as_string(),
        )
    finally:
        if server is not None:
            try:
                server.quit()
            except Exception:
                pass


@router.post("/request")
def request_hr_access(request: HRAccessRequest):
    try:
        _send_hr_access_email(request)
    except Exception as exc:
        print(f"HR ACCESS EMAIL ERROR: {exc}")
        raise HTTPException(
            status_code=500,
            detail="The HR access request could not be sent. Please try again.",
        )

    print(
        f"HR ACCESS REQUEST SENT: {request.company_name} "
        f"({request.work_email}) -> {HR_ACCESS_RECEIVER}"
    )

    return {
        "message": "HR access request sent successfully.",
    }
