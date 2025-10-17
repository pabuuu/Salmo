import nodemailer from "nodemailer";

export const sendEmail = async (tenant, subject, message) => {
  try {
    //mail transport
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,      
        pass: process.env.EMAIL_PASS,   
      },
    });

    // email 
    const mailOptions = {
      from: `"R Angeles Property Leasing" <${process.env.EMAIL_USER}>`,
      to: tenant.email,
      subject: subject,
      html: `
        <div style="font-family: system-ui, sans-serif; font-size: 14px; color: #2c3e50;">
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 10px;">
            <h2 style="color: #1e40af;">R Angeles Property Leasing</h2>
            <p>Dear <strong>${tenant.firstName} ${tenant.lastName}</strong>,</p>

            <p style="font-size: 15px; line-height: 1.5;">
              ${message}
            </p>

            <hr style="margin: 20px 0; border: none; border-top: 1px dashed lightgray;" />

            <p style="font-size: 13px; color: #6b7280;">
              This is an automated notice from <strong>R Angeles Property Leasing</strong>.<br/>
              Please contact us if you’ve already made your payment.
            </p>

            <div style="margin-top: 10px;">
              <a href="mailto:${process.env.EMAIL_USER}" style="color: #1e40af; text-decoration: none;">
                📧 Reply to this email
              </a>
            </div>
          </div>

          <p style="font-size: 11px; color: #9ca3af; margin-top: 15px;">
            Sent on ${new Date().toLocaleString()}
          </p>
        </div>
      `,
    };

    // send
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${tenant.email}: ${info.response}`);
  } catch (error) {
    console.error("Failed to send email:", error);
  }
};
