function welcomeTemplate(name) {
    return `
    <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto; padding:30px; border:1px solid #eee; border-radius:12px;">
        <h2 style="color:#ff6b35;">Welcome to Craveo, ${name}! 🎉</h2>

        <p>We're excited to have you join our food-loving community.</p>

        <p>
            Discover restaurants, explore menus, place orders,
            and enjoy delicious meals—all in one place.
        </p>

        <p>
            We hope Craveo becomes your go-to app whenever you're hungry.
        </p>

        <a
            href="${process.env.FRONTEND_URL}"
            style="
                display:inline-block;
                margin-top:20px;
                padding:12px 24px;
                background:#ff6b35;
                color:white;
                text-decoration:none;
                border-radius:8px;
            ">
            Explore Restaurants
        </a>

        <hr style="margin:30px 0;">

        <p style="color:#777;font-size:14px;">
            Thanks for choosing Craveo ❤️
        </p>
    </div>
    `;
}

module.exports = { welcomeTemplate };