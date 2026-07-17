function orderDeliveredTemplate(name, reviewLink) {
    return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:30px;border:1px solid #eee;border-radius:12px;">

        <h2 style="color:#2ecc71;">Enjoy your meal, ${name}!</h2>

        <p>Your order has been successfully delivered.</p>

        <p>
            We'd love to hear about your experience.
            Your feedback helps other customers and improves our service.
        </p>

        <a
            href="${reviewLink}"
            style="display:inline-block;padding:12px 24px;background:#ff6b35;color:white;text-decoration:none;border-radius:8px;">
            Leave a Review
        </a>

        <hr style="margin:30px 0;">

        <p style="color:#777;font-size:14px;">
            Thank you for ordering with Craveo ❤️
        </p>

    </div>
    `;
}

module.exports = { orderDeliveredTemplate };