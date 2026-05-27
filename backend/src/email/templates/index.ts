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
  const itemsList = order.items.map((item: any) => {
    const hasDiscount = item.originalPrice && item.originalPrice > item.price;
    const priceDisplay = hasDiscount 
      ? `<span style="text-decoration: line-through; color: #a1a1aa; font-weight: normal; margin-right: 5px;">$${(item.originalPrice / 100).toFixed(2)}</span>$${(item.price / 100).toFixed(2)} <span style="color: #db2777; font-weight: bold; font-size: 11px;">(-${item.discountPercentage}%)</span>`
      : `$${(item.price / 100).toFixed(2)}`;

    return `
      <div style="display: flex; align-items: center; padding: 15px 0; border-bottom: 1px solid #eee;">
        <div style="flex-grow: 1;">
          <h4 style="margin: 0; color: #333;">${item.product?.title || item.product?.name || 'Stylized Asset Pack'}</h4>
          <p style="margin: 5px 0 0; font-size: 12px; color: #666;">${priceDisplay}</p>
        </div>
      </div>
    `;
  }).join('');

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
        ${order.couponCode ? `
        <div style="text-align: right; font-size: 13px; color: #db2777; font-weight: bold; margin-top: 10px;">
          Coupon Applied: ${order.couponCode} (-$${(order.couponDiscount / 100).toFixed(2)})
        </div>
        ` : ''}
        <div class="total">
          Total: $${(order.totalAmount / 100).toFixed(2)}
        </div>
      </div>

      <div style="text-align: center;">
        <a href="${frontendUrl}/profile?tab=purchases" class="button">Access My Downloads 📦</a>
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

export const getFeedbackReminderTemplate = (name: string, productName: string, frontendUrl: string) => `
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
      <h1>Thank you for downloading ${productName}! 🚀</h1>
      <p>Hey ${name},</p>
      <p>We saw that you've just downloaded the <strong>${productName}</strong> asset pack. We hope it fits perfectly into your creative project!</p>
      <p>If you have any questions, encounter any issues, or just want to chat about your projects, feel free to reply directly to this email or write to us at <a href="mailto:support@mnostva.art" style="color: #8a7db3; text-decoration: underline;">support@mnostva.art</a>. We're always happy to help!</p>
      <p>Your feedback is incredibly valuable to us and helps our community grow. If you have a minute, we'd love it if you could leave a review for this asset pack.</p>
      
      <div style="text-align: center;">
        <a href="${frontendUrl}/profile?tab=purchases" class="button">Leave a Review ⭐️</a>
      </div>

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

export const getPaymentReminderTemplate = (name: string, order: any, frontendUrl: string) => {
  const itemsList = order.items.map((item: any) => {
    const hasDiscount = item.originalPrice && item.originalPrice > item.price;
    const priceDisplay = hasDiscount 
      ? `<span style="text-decoration: line-through; color: #a1a1aa; font-weight: normal; margin-right: 5px;">$${(item.originalPrice / 100).toFixed(2)}</span>$${(item.price / 100).toFixed(2)} <span style="color: #db2777; font-weight: bold; font-size: 11px;">(-${item.discountPercentage}%)</span>`
      : `$${(item.price / 100).toFixed(2)}`;

    return `
      <div style="display: flex; align-items: center; padding: 15px 0; border-bottom: 1px solid #eee;">
        <div style="flex-grow: 1;">
          <h4 style="margin: 0; color: #333;">${item.product?.title || item.product?.name || 'Stylized Asset Pack'}</h4>
          <p style="margin: 5px 0 0; font-size: 12px; color: #666;">${priceDisplay}</p>
        </div>
      </div>
    `;
  }).join('');

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
    .button { display: inline-block; padding: 15px 30px; background-color: #db2777; color: white; text-decoration: none; border-radius: 50px; font-weight: bold; margin: 20px 0; }
    .footer { text-align: center; margin-top: 50px; font-size: 12px; color: #999; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Mnostva<span>.art</span></div>
    </div>
    <div class="content">
      <h1>Don't leave your assets behind! 🎨</h1>
      <p>Hey ${name},</p>
      <p>We noticed you started an order for some awesome stylized 3D assets on Mnostva Art, but didn't quite finish the payment.</p>
      <p>Don't worry, we've saved your items! Complete your payment now to download them instantly and bring your creative projects to life:</p>
      
      <div style="text-align: center;">
        <a href="${frontendUrl}/profile" class="button" style="background-color: #db2777; color: white;">Complete My Order 💳</a>
      </div>

      <div class="order-summary">
        <h3 style="margin-top: 0;">Your Saved Items</h3>
        ${itemsList}
        ${order.couponCode ? `
        <div style="text-align: right; font-size: 13px; color: #db2777; font-weight: bold; margin-top: 10px;">
          Coupon Applied: ${order.couponCode} (-$${(order.couponDiscount / 100).toFixed(2)})
        </div>
        ` : ''}
        <div class="total">
          Total: $${(order.totalAmount / 100).toFixed(2)}
        </div>
      </div>

      <p>If you have any questions or need help checking out, feel free to reply directly to this email or reach us at <a href="mailto:support@mnostva.art" style="color: #8a7db3; text-decoration: underline;">support@mnostva.art</a>.</p>
      <p>Keep Creating!</p>
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

export const getBroadcastTemplate = (options: {
  subject: string;
  body: string;
  imageUrl?: string;
  featuredProduct?: {
    name: string;
    category: string;
    price: number;
    originalPrice?: number;
    discountPercentage?: number;
    imageUrl: string;
    frontendUrl: string;
  };
  ctaText?: string;
  ctaLink?: string;
  templateType: 'promo' | 'announcement' | 'new_release';
}) => {
  const { subject, body, imageUrl, featuredProduct, ctaText, ctaLink, templateType } = options;

  let themeColor = '#8a7db3'; // Default purple
  let badgeText = 'ANNOUNCEMENT 📢';
  if (templateType === 'promo') {
    themeColor = '#db2777'; // Pink for promo
    badgeText = 'SALE / SPECIAL OFFERS 🏷️';
  } else if (templateType === 'new_release') {
    themeColor = '#7c3aed'; // Deep violet
    badgeText = 'NEW RELEASE 🚀';
  }

  // Convert newlines in body to <br />
  const formattedBody = body.replace(/\n/g, '<br />');

  // Hero banner HTML
  const heroImageHtml = imageUrl 
    ? `<div style="margin-bottom: 25px;"><img src="${imageUrl}" alt="Banner" style="width: 100%; max-height: 280px; object-fit: cover; border-radius: 15px; border: 1px solid #eee;" /></div>`
    : '';

  // Featured product HTML
  let featuredProductHtml = '';
  if (featuredProduct) {
    const hasDiscount = featuredProduct.originalPrice && featuredProduct.originalPrice > featuredProduct.price;
    const priceDisplay = hasDiscount
      ? `<span style="text-decoration: line-through; color: #a1a1aa; font-weight: normal; margin-right: 5px; font-size: 13px;">$${(featuredProduct.originalPrice! / 100).toFixed(2)}</span>$${(featuredProduct.price / 100).toFixed(2)} <span style="color: #db2777; font-weight: bold; font-size: 11px; background-color: #fce7f3; padding: 2px 6px; border-radius: 4px; margin-left: 5px;">-${featuredProduct.discountPercentage!}% OFF</span>`
      : `$${(featuredProduct.price / 100).toFixed(2)}`;

    featuredProductHtml = `
      <div style="background: #ffffff; border: 2px solid #f3f4f6; border-radius: 20px; padding: 20px; margin: 30px 0; text-align: left; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        <div style="font-size: 9px; font-weight: 900; letter-spacing: 1.5px; color: ${themeColor}; text-transform: uppercase; margin-bottom: 12px;">Featured Stylized Asset Pack</div>
        
        <!-- Stack image and details vertically using standard block layouts for 100% email client compatibility -->
        <div style="display: block; width: 100%; text-align: center; margin-bottom: 15px;">
          <img src="${featuredProduct.imageUrl}" alt="${featuredProduct.name}" style="width: 100%; max-width: 100%; height: auto; border-radius: 12px; display: block;" />
        </div>
        
        <div style="display: block; width: 100%;">
          <span style="background: #f3f4f6; color: #4b5563; font-size: 8px; font-weight: 800; text-transform: uppercase; padding: 3px 8px; border-radius: 50px; letter-spacing: 0.5px; display: inline-block;">${featuredProduct.category}</span>
          <h3 style="margin: 8px 0 6px 0; font-size: 18px; font-weight: 900; color: #111827; text-transform: uppercase; letter-spacing: -0.5px; display: block; line-height: 1.2;">${featuredProduct.name}</h3>
          <div style="font-weight: 900; font-size: 16px; color: #111827; margin: 8px 0; display: block;">${priceDisplay}</div>
          
          <div style="margin-top: 18px; display: block; text-align: center;">
            <a href="${featuredProduct.frontendUrl}" style="display: inline-block; text-align: center; padding: 12px 35px; background-color: ${themeColor}; color: white; text-decoration: none; border-radius: 50px; font-weight: 900; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 10px ${themeColor}33;">View on Marketplace 🎨</a>
          </div>
        </div>
      </div>
    `;
  }

  // CTA Button HTML
  const ctaButtonHtml = (ctaText && ctaLink)
    ? `
      <div style="text-align: center; margin: 30px 0;">
        <a href="${ctaLink}" style="display: inline-block; padding: 15px 35px; background-color: ${themeColor}; color: white; text-decoration: none; border-radius: 50px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; font-size: 13px; box-shadow: 0 6px 20px ${themeColor}44;">${ctaText}</a>
      </div>
    `
    : '';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Inter', system-ui, -apple-system, sans-serif; color: #1f2937; line-height: 1.6; background-color: #f9fafb; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 24px; border: 1px solid #f3f4f6; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05); }
    .header { text-align: center; padding: 30px 20px; background-color: #fafafa; border-bottom: 1px solid #f3f4f6; }
    .logo { font-weight: 900; font-size: 24px; color: #111827; text-transform: uppercase; letter-spacing: 2px; }
    .logo span { color: #8a7db3; }
    .badge { display: inline-block; padding: 4px 12px; font-size: 9px; font-weight: 900; text-transform: uppercase; letter-spacing: 1.5px; border-radius: 50px; background-color: ${themeColor}15; color: ${themeColor}; margin-bottom: 15px; }
    .content { padding: 35px 25px; }
    .headline { font-size: 24px; font-weight: 900; color: #111827; line-height: 1.2; text-transform: uppercase; letter-spacing: -0.5px; margin: 0 0 20px 0; }
    .body-text { font-size: 14px; color: #4b5563; font-weight: 500; line-height: 1.7; }
    .footer { text-align: center; padding: 30px; background-color: #fafafa; border-top: 1px solid #f3f4f6; font-size: 12px; color: #9ca3af; }
    a { transition: all 0.2s ease; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Mnostva<span>.art</span></div>
    </div>
    <div class="content">
      <div style="text-align: left;">
        <span class="badge">${badgeText}</span>
        <h1 class="headline">${subject}</h1>
      </div>
      
      ${heroImageHtml}
      
      <div class="body-text">
        ${formattedBody}
      </div>

      ${featuredProductHtml}
      ${ctaButtonHtml}

      <div style="margin-top: 35px; border-top: 1px solid #f3f4f6; padding-top: 25px; font-size: 13px; color: #4b5563; font-weight: bold;">
        <p style="margin: 0 0 5px 0;">Happy Creating!</p>
        <p style="margin: 0; color: ${themeColor};">- The Mnostva Team</p>
      </div>
    </div>
    <div class="footer">
      <p style="margin: 0 0 5px 0;">© 2021 Mnostva Art Marketplace. All rights reserved.</p>
      <p style="margin: 0; font-size: 10px;">You are receiving this because you registered at <a href="https://mnostva.art" style="color: ${themeColor}; text-decoration: underline;">mnostva.art</a>.</p>
    </div>
  </div>
</body>
</html>
`;
};
