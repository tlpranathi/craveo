function orderDeliveredTemplate(name, items, restaurantName, reviewLink) {
  const itemsHtml = items
    .map(
      (item) => `
        <tr>
          <td style="padding:8px 0;">${item.name}</td>
          <td style="padding:8px 0; text-align:center;">×${item.quantity}</td>
          <td style="padding:8px 0; text-align:right;">₹${item.price * item.quantity}</td>
        </tr>
      `
    )
    .join("");

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:30px;border:1px solid #eee;border-radius:12px;line-height:1.6;">

      <h2 style="color:#2ecc71;margin-top:0;">Your order has been delivered! 🎉</h2>

      <p>Hi <strong>${name}</strong>,</p>

      <p>
        We hope you enjoyed your meal from
        <strong>${restaurantName}</strong>.
      </p>

      <h3 style="margin-top:30px;">Order Summary</h3>

      <table style="width:100%;border-collapse:collapse;">
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <hr style="margin:16px 0;">

      <div style="display:flex;justify-content:space-between;font-weight:bold;font-size:16px;">
        <span>Total</span>
        <span> ₹${total}</span>
      </div>

      <p style="margin-top:30px;">
        We'd love to hear about your experience. Your feedback helps other
        customers discover great food.
      </p>

      <a
        href="${reviewLink}"
        style="
          display:inline-block;
          margin-top:10px;
          padding:12px 24px;
          background:#ff6b35;
          color:#fff;
          text-decoration:none;
          border-radius:8px;
          font-weight:bold;
        "
      >
        Leave a Review
      </a>

      <hr style="margin:30px 0;">

      <p style="color:#777;font-size:14px;">
        Thank you for ordering with <strong>Craveo</strong> ❤️
      </p>

    </div>
  `;
}

module.exports = { orderDeliveredTemplate };