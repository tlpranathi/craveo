function passwordResetTemplate(name, resetLink) {
    return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:30px;border:1px solid #eee;border-radius:12px;">

        <h2>Password Reset Request</h2>

        <p>Hi ${name},</p>

        <p>
            We received a request to reset your Craveo password.
        </p>

        <p>
            Click the button below to create a new password.
        </p>

        <a
            href="${resetLink}"
            style="display:inline-block;padding:12px 24px;background:#ff6b35;color:white;text-decoration:none;border-radius:8px;">
            Reset Password
        </a>

        <p style="margin-top:25px;">
            If you didn't request this, you can safely ignore this email.
        </p>

        <p style="font-size:14px;color:#777;">
            This link will expire shortly for security reasons.
        </p>

    </div>
    `;
}

module.exports = { passwordResetTemplate };