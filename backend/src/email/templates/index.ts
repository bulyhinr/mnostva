export const getWelcomeTemplate = (name: string, frontendUrl: string) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Inter', sans-serif; color: #333; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; padding: 40px 0; background-color: #fafafa; border-radius: 20px; margin-bottom: 30px; }
    .logo { font-weight: 900; font-size: 24px; color: #333; text-transform: uppercase; letter-spacing: 2px; }
    .logo span { color: #8a7db3; }
    .content { padding: 0 20px; }
    .button { display: inline-block; padding: 15px 30px; background-color: #8a7db3; color: white; text-decoration: none; border-radius: 50px; font-weight: bold; margin: 20px 0; }
    .footer { text-align: center; margin-top: 50px; font-size: 12px; color: #999; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Mnostva<span>.art</span></div>
    </div>
    <div class="content">
      <h1>Welcome to the family, ${name}! 👋</h1>
      <p>We're thrilled to have you join our community of creators and artists. Your journey into the world of stylized 3D art starts here.</p>
      <p>Whether you're building a game, creating a virtual world, or just exploring, we've got the assets you need to bring your vision to life.</p>
      
      <div style="text-align: center;">
        <a href="${frontendUrl}/marketplace" class="button">Explore the Marketplace 🎨</a>
      </div>

      <p>If you have any questions or need help with your projects, feel free to contact us at <a href="mailto:support@mnostva.art" style="color: #8a7db3; text-decoration: underline;">support@mnostva.art</a>.</p>
      <p>Happy Creating!</p>
      <p>- The Mnostva Team</p>
    </div>
    <div class="footer">
      <p>© 2021 Mnostva Art Marketplace. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

export const getOrderConfirmationTemplate = (order: any, frontendUrl: string) => {
  const itemsList = order.items.map((item: any) => `
    <div style="display: flex; align-items: center; padding: 15px 0; border-bottom: 1px solid #eee;">
      <div style="flex-grow: 1;">
        <h4 style="margin: 0; color: #333;">${item.product.title}</h4>
        <p style="margin: 5px 0 0; font-size: 12px; color: #666;">$${(item.price / 100).toFixed(2)}</p>
      </div>
    </div>
  `).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Inter', sans-serif; color: #333; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; padding: 40px 0; background-color: #fafafa; border-radius: 20px; margin-bottom: 30px; }
    .logo { font-weight: 900; font-size: 24px; color: #333; text-transform: uppercase; letter-spacing: 2px; }
    .logo span { color: #8a7db3; }
    .content { padding: 0 20px; }
    .order-summary { background: #f9f9f9; padding: 20px; border-radius: 10px; margin: 20px 0; }
    .total { text-align: right; font-size: 18px; font-weight: bold; margin-top: 15px; }
    .button { display: inline-block; padding: 15px 30px; background-color: #8a7db3; color: white; text-decoration: none; border-radius: 50px; font-weight: bold; margin: 20px 0; }
    .footer { text-align: center; margin-top: 50px; font-size: 12px; color: #999; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Mnostva<span>.art</span></div>
    </div>
    <div class="content">
      <h1>Order Confirmed! 🎉</h1>
      <p>Great news! Your order #${order.id.slice(0, 8)} has been successfully processed.</p>
      <p>You can now access your purchased assets directly from your dashboard.</p>
      
      <div class="order-summary">
        <h3 style="margin-top: 0;">Order Summary</h3>
        ${itemsList}
        <div class="total">
          Total: $${(order.totalAmount / 100).toFixed(2)}
        </div>
      </div>

      <div style="text-align: center;">
        <a href="${frontendUrl}/profile" class="button">Access My Downloads 📦</a>
      </div>

      ${order.receiptUrl ? `
      <div style="text-align: center; margin-top: 10px;">
        <a href="${order.receiptUrl}" target="_blank" style="color: #8a7db3; text-decoration: underline; font-size: 14px;">View / Download Invoice</a>
      </div>
      ` : ''}

      <p>If you have any questions regarding your order or assets, please contact us at <a href="mailto:support@mnostva.art" style="color: #8a7db3; text-decoration: underline;">support@mnostva.art</a>.</p>
      <p>Thank you for supporting independent creators!</p>
      <p>- The Mnostva Team</p>
    </div>
    <div class="footer">
      <p>© 2021 Mnostva Art Marketplace. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;
};

export const getPasswordResetTemplate = (token: string, frontendUrl: string) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Inter', sans-serif; color: #333; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; padding: 40px 0; background-color: #fafafa; border-radius: 20px; margin-bottom: 30px; }
    .logo { font-weight: 900; font-size: 24px; color: #333; text-transform: uppercase; letter-spacing: 2px; }
    .logo span { color: #8a7db3; }
    .content { padding: 0 20px; }
    .button { display: inline-block; padding: 15px 30px; background-color: #8a7db3; color: white; text-decoration: none; border-radius: 50px; font-weight: bold; margin: 20px 0; }
    .footer { text-align: center; margin-top: 50px; font-size: 12px; color: #999; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Mnostva<span>.art</span></div>
    </div>
    <div class="content">
      <h1>Password Reset Request 🔐</h1>
      <p>We received a request to reset the password for your account.</p>
      <p>Click the button below to choose a new password. This link is valid for 1 hour.</p>
      
      <div style="text-align: center;">
        <a href="${frontendUrl}/login?reset_token=${token}" class="button">Reset Password</a>
      </div>

      <p>If you didn't request this, you can safely ignore this email. Your password will remain unchanged.</p>
      <p>You can also change your email and other settings in your dashboard -> Settings tab.</p>
      <p>If you have any questions or issues, feel free to reach out to us at <a href="mailto:support@mnostva.art" style="color: #8a7db3; text-decoration: underline;">support@mnostva.art</a>.</p>
      <br>
      <p>Stay Colorful! 🌈</p>
      <p>- The Mnostva Team</p>
    </div>
    <div class="footer">
      <p>© 2021 Mnostva Art Marketplace. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;
