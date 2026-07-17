function passwordChangedTemplate(name) {
    return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:30px;border:1px solid #eee;border-radius:12px;">

        <h2>Password Updated Successfully</h2>

        <p>Hi ${name},</p>

        <p>
            This email confirms that your Craveo password has been changed successfully.
        </p>

        <p>
            If you made this change, no further action is required.
        </p>

        <p>
            If you did NOT change your password, please reset it immediately.
        </p>

        <hr style="margin:30px 0;">

        <p style="font-size:14px;color:#777;">
            Thanks,<br>
            Team Craveo
        </p>

    </div>
    `;
}

module.exports = { passwordChangedTemplate };