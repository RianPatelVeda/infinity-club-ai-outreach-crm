export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html: string;
}

export const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: "partner",
    name: "Partner Outreach - Free Marketing",
    subject: "Get Free Marketing & More Customers with Infinity Club",
    html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Get Free Marketing & More Customers</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            background-color: #f5f5f5;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
        }
        .header {
            background-color: #81D8D0;
            padding: 40px 20px;
            text-align: center;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #ffffff;
            letter-spacing: 1px;
        }
        .content {
            padding: 40px 30px;
            color: #333333;
            line-height: 1.6;
        }
        h1 {
            color: #81D8D0;
            font-size: 26px;
            margin-bottom: 20px;
            line-height: 1.3;
        }
        h2 {
            color: #333333;
            font-size: 20px;
            margin-top: 30px;
            margin-bottom: 15px;
        }
        .hook {
            background: linear-gradient(135deg, #81D8D0 0%, #5fc7be 100%);
            color: #ffffff;
            padding: 25px;
            border-radius: 8px;
            margin: 25px 0;
            text-align: center;
            font-size: 20px;
            font-weight: 600;
            line-height: 1.4;
        }
        .benefits-grid {
            margin: 30px 0;
        }
        .benefit-item {
            padding: 15px;
            margin-bottom: 12px;
            background-color: #f0fffe;
            border-left: 4px solid #81D8D0;
            border-radius: 4px;
        }
        .benefit-icon {
            font-size: 24px;
            margin-right: 10px;
        }
        .emphasis {
            color: #81D8D0;
            font-weight: 600;
        }
        .cta-button {
            display: inline-block;
            background-color: #81D8D0;
            color: #ffffff;
            text-decoration: none;
            padding: 18px 45px;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
            font-size: 18px;
            box-shadow: 0 4px 12px rgba(129, 216, 208, 0.3);
        }
        .cta-section {
            text-align: center;
            padding: 30px 0;
            background-color: #f9f9f9;
            margin: 30px -30px 0 -30px;
            padding: 40px 30px;
        }
        .social-links {
            margin: 25px 0;
            padding: 20px;
            background-color: #f9f9f9;
            border-radius: 8px;
            text-align: center;
        }
        .social-link {
            color: #81D8D0;
            text-decoration: none;
            font-weight: 600;
            margin: 0 10px;
        }
        .footer {
            background-color: #f9f9f9;
            padding: 30px;
            text-align: center;
            color: #666666;
            font-size: 14px;
            border-top: 1px solid #eeeeee;
        }
        .signature {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #eeeeee;
        }
        .hashtag {
            color: #81D8D0;
            font-weight: 600;
        }
        .no-catch {
            background-color: #fff9e6;
            border: 2px solid #ffcd3c;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: center;
            font-weight: 600;
            color: #333333;
        }
        @media only screen and (max-width: 600px) {
            .content {
                padding: 30px 20px;
            }
            h1 {
                font-size: 22px;
            }
            .hook {
                font-size: 18px;
                padding: 20px;
            }
            .cta-section {
                margin: 30px -20px 0 -20px;
                padding: 30px 20px;
            }
        }
    </style>
</head>
<body>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        <tr>
            <td align="center" style="padding: 20px 0;">
                <table class="email-container" role="presentation" width="600" cellspacing="0" cellpadding="0" border="0">

                    <!-- Header -->
                    <tr>
                        <td class="header">
                            <div class="logo">INFINITY CLUB</div>
                            <div style="color: #ffffff; margin-top: 10px; font-size: 14px;">Powering Independent Businesses</div>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td class="content">
                            <h1>Get Free Marketing & More Customers with Infinity Club</h1>

                            <p>Hey {name},</p>

                            <div class="hook">
                                Want more customers. More loyalty. More visibility – all for free?
                            </div>

                            <p>Our Infinity Club members are searching for standout local businesses, and <strong>yours is exactly the kind they want to support.</strong></p>

                            <div class="no-catch">
                                🎁 We want to promote your business for FREE<br>
                                No fees. No contracts. No catch.
                            </div>

                            <h2>Here's what you'll get:</h2>

                            <div class="benefits-grid">
                                <div class="benefit-item">
                                    <span class="benefit-icon">📱</span>
                                    <strong>Free promotion</strong> on our app, website, socials & newsletter
                                </div>
                                <div class="benefit-item">
                                    <span class="benefit-icon">👥</span>
                                    Access to our <strong>rapidly growing member base</strong>
                                </div>
                                
                                <div class="benefit-item">
                                    <span class="benefit-icon">📈</span>
                                    More <strong>footfall, stronger loyalty</strong>, and higher visibility at zero cost
                                </div>
                                <div class="benefit-item">
                                    <span class="benefit-icon">🤝</span>
                                    A <strong>loyal community</strong> of locals ready to back independents
                                </div>
                            </div>

                            <p style="font-size: 18px; text-align: center; padding: 20px 0; background-color: #f9f9f9; margin: 30px -30px; padding: 30px;">
                                <strong>All we ask is a simple, exclusive offer or discount for our members.</strong><br>
                                <span style="font-size: 16px; color: #666666; margin-top: 10px; display: block;">You give the offer. We bring you new customers, footfall and real results.</span>
                            </p>

                            <h2>What is Infinity Club?</h2>

                            <p>Infinity Club is a digital discount card driving people to shop local – boosting independent businesses like yours.</p>

                            <p style="font-size: 18px; font-weight: 600; color: #81D8D0; margin: 25px 0;">
                                This is your moment to get seen. Don't let your competitors take the spotlight.
                            </p>

                            <div class="cta-section">
                                <a href="https://infinityclub.com/partners" class="cta-button">🚀 Register Your Business Today</a>
                                <p style="margin-top: 20px; color: #666666;">Claim your free spot now</p>
                            </div>

                            <div style="margin-top: 40px;">
                                <h2>Want to see it in action?</h2>

                                <div class="social-links">
                                    <div style="margin-bottom: 12px;">
                                        <strong>🌐 Website:</strong>
                                        <a href="https://www.infinityclub.com" class="social-link">www.infinityclub.com</a>
                                    </div>
                                    <div>
                                        <strong>📸 Instagram:</strong>
                                        <a href="https://instagram.com/infinityclub_com" class="social-link">@infinityclub_com</a>
                                    </div>
                                </div>

                                <p style="text-align: center; font-size: 16px; margin-top: 25px;">
                                    We're on a mission to <span class="hashtag">#KeepThePoundLocal</span> – powering the local economy.
                                </p>
                            </div>

                            <div class="signature">
                                <p style="margin: 0 0 5px 0;">Kind Regards,</p>
                                <p style="margin: 0; font-weight: 600; font-size: 16px;">Olivia</p>
                                <p style="margin: 5px 0 0 0; color: #81D8D0;">Client Relations Manager</p>
                            </div>

                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td class="footer">
                            <p style="margin: 0 0 10px 0; font-weight: 600; color: #333333;">INFINITY CLUB</p>
                            <p style="margin: 0 0 5px 0;">Beck View Rd, Beverley HU17 0JT</p>
                            <p style="margin: 0 0 5px 0;">01482 205983</p>
                            <p style="margin: 0 0 20px 0;"><a href="mailto:info@infinityclub.com" style="color: #81D8D0; text-decoration: none;">info@infinityclub.com</a></p>
                            <p style="margin: 0; color: #999999; font-size: 12px;">© 2025 Infinity Club. All rights reserved.</p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>`,
  },
  {
    id: "christmas",
    name: "Christmas Pass - Team Gift",
    subject: "A Christmas gift with real local power",
    html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>A Christmas Gift With Real Local Power</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            background-color: #f5f5f5;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
        }
        .header {
            background-color: #81D8D0;
            padding: 40px 20px;
            text-align: center;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #ffffff;
            letter-spacing: 1px;
        }
        .content {
            padding: 40px 30px;
            color: #333333;
            line-height: 1.6;
        }
        h1 {
            color: #81D8D0;
            font-size: 24px;
            margin-bottom: 20px;
            line-height: 1.3;
        }
        h2 {
            color: #333333;
            font-size: 20px;
            margin-top: 30px;
            margin-bottom: 15px;
        }
        .emphasis {
            color: #81D8D0;
            font-weight: 600;
        }
        .price-highlight {
            background-color: #f0fffe;
            border-left: 4px solid #81D8D0;
            padding: 20px;
            margin: 25px 0;
            font-size: 18px;
            font-weight: 600;
            color: #333333;
        }
        .benefits {
            margin: 25px 0;
        }
        .benefit-item {
            padding: 12px 0;
            border-bottom: 1px solid #eeeeee;
        }
        .benefit-item:last-child {
            border-bottom: none;
        }
        .benefit-title {
            font-weight: 600;
            color: #333333;
            margin-bottom: 5px;
        }
        .cta-button {
            display: inline-block;
            background-color: #81D8D0;
            color: #ffffff;
            text-decoration: none;
            padding: 16px 40px;
            border-radius: 8px;
            font-weight: 600;
            margin: 30px 0;
            font-size: 16px;
        }
        .cta-section {
            text-align: center;
            padding: 20px 0;
        }
        .footer {
            background-color: #f9f9f9;
            padding: 30px;
            text-align: center;
            color: #666666;
            font-size: 14px;
            border-top: 1px solid #eeeeee;
        }
        .hashtag {
            color: #81D8D0;
            font-weight: 600;
        }
        @media only screen and (max-width: 600px) {
            .content {
                padding: 30px 20px;
            }
            h1 {
                font-size: 22px;
            }
            h2 {
                font-size: 18px;
            }
        }
    </style>
</head>
<body>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        <tr>
            <td align="center" style="padding: 20px 0;">
                <table class="email-container" role="presentation" width="600" cellspacing="0" cellpadding="0" border="0">

                    <!-- Header -->
                    <tr>
                        <td class="header">
                            <div class="logo">INFINITY CLUB</div>
                            <div style="color: #ffffff; margin-top: 10px; font-size: 14px;">Keep The £ Local</div>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td class="content">
                            <h1>A Christmas gift with real local power</h1>

                            <p>Dear <strong>{name}</strong>,</p>

                            <p>I'm reaching out with a special Christmas offer built for businesses that truly care about their people, their city, and their community.</p>

                            <p><strong>This year, skip the online and supermarket vouchers.</strong></p>

                            <p>Ditch the one-off spends that send money out of town.</p>

                            <p><strong>Send a bigger message.</strong></p>

                            <div class="price-highlight">
                                Give your team an Infinity Club Annual Pass<br>
                                <span class="emphasis">Just £50 per employee</span><br>
                                Let that gift fuel local power for twelve whole months
                            </div>

                            <h2>What is Infinity Club?</h2>

                            <p>We're the local discount and rewards movement putting independents first.</p>

                            <p>Your employees save all year long across Hull & East Yorkshire's best local spots – coffee, hair, gyms, food, retail, and more – while backing our mission to <span class="hashtag">#KeepThePoundLocal</span>.</p>

                            <h2>Why it matters to your business:</h2>

                            <div class="benefits">
                                <div class="benefit-item">
                                    <div class="benefit-title">🏆 CSR & ESG gold</div>
                                    <div>Real, visible local impact your board, your staff, and your city can see.</div>
                                </div>
                                <div class="benefit-item">
                                    <div class="benefit-title">💚 Employee wellbeing</div>
                                    <div>Year-round savings that help with the cost of living.</div>
                                </div>
                                <div class="benefit-item">
                                    <div class="benefit-title">📍 Local economy boost</div>
                                    <div>Every pound spent stays here, growing your community.</div>
                                </div>
                                <div class="benefit-item">
                                    <div class="benefit-title">⚡ No setup. No admin. No hassle.</div>
                                    <div>We handle it all. You give the gift that shouts, "we back our locals."</div>
                                </div>
                            </div>

                            <p style="margin-top: 30px; font-size: 18px;"><strong>Let's make this Christmas one that does good for your team and your town.</strong></p>

                            <div class="cta-section">
                                <a href="mailto:info@infinityclub.com?subject=Christmas%20Team%20Gift%20Enquiry" class="cta-button">Let's Talk About Your Team Gift</a>
                                <p style="margin-top: 15px; color: #666666; font-size: 14px;">Or reply to this email to schedule a quick chat</p>
                            </div>

                            <div style="margin-top: 40px;">
                                <h2>Want to see it in action?</h2>

                                <div class="social-links">
                                    <div style="margin-bottom: 12px;">
                                        <strong>🌐 Website:</strong>
                                        <a href="https://www.infinityclub.com" class="social-link">www.infinityclub.com</a>
                                    </div>
                                    <div>
                                        <strong>📸 Instagram:</strong>
                                        <a href="https://instagram.com/infinityclub_com" class="social-link">@infinityclub_com</a>
                                    </div>
                                </div>

                                <p style="text-align: center; font-size: 16px; margin-top: 25px;">
                                    We're on a mission to <span class="hashtag">#KeepThePoundLocal</span> – powering the local economy.
                                </p>
                            </div>

                            <div class="signature">
                                <p style="margin: 0 0 5px 0;">Kind Regards,</p>
                                <p style="margin: 0; font-weight: 600; font-size: 16px;">Olivia</p>
                                <p style="margin: 5px 0 0 0; color: #81D8D0;">Client Relations Manager</p>
                            </div>


                        </td>
                    </tr>

                    

                    <!-- Footer -->
                    <tr>
                        <td class="footer">
                            <p style="margin: 0 0 10px 0; font-weight: 600; color: #333333;">INFINITY CLUB</p>
                            <p style="margin: 0 0 5px 0;">Beck View Rd, Beverley HU17 0JT</p>
                            <p style="margin: 0 0 5px 0;">01482 205983</p>
                            <p style="margin: 0 0 20px 0;"><a href="mailto:info@infinityclub.com" style="color: #81D8D0; text-decoration: none;">info@infinityclub.com</a></p>
                            <p style="margin: 0; color: #999999; font-size: 12px;">© 2025 Infinity Club. All rights reserved.</p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>`,
  },
];
