package com.tryitcafe.service;

import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final Optional<JavaMailSender> mailSender;

    @Value("${app.support-email:tryit.cafekichen@gmail.com}")
    private String supportEmail;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Autowired
    public EmailService(Optional<JavaMailSender> mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Sends a rich branded HTML password reset link to customer email.
     * Logs the URL in console for high-reliability development and debugging.
     */
    public boolean sendPasswordResetEmail(String recipientEmail, String recipientName, String resetUrl) {
        String safeName = (recipientName != null && !recipientName.isBlank()) ? recipientName.trim() : "Valued Customer";
        log.info("[PASSWORD RESET] Preparing reset email for: {} | Link: {}", recipientEmail, resetUrl);

        if (mailSender.isEmpty() || mailUsername == null || mailUsername.isBlank()) {
            log.warn("[EMAIL SERVICE] SMTP configuration not detected. Reset link generated for {}: {}", recipientEmail, resetUrl);
            return true;
        }

        try {
            JavaMailSender sender = mailSender.get();
            MimeMessage message = sender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            String fromAddress = (mailUsername != null && !mailUsername.isBlank()) ? mailUsername : supportEmail;
            helper.setFrom(fromAddress, "Tryit Cafe & Kitchen");
            helper.setTo(recipientEmail);
            helper.setSubject("Reset Your Password - Tryit Cafe & Kitchen");

            String htmlContent = buildPasswordResetHtml(safeName, resetUrl);
            helper.setText(htmlContent, true);

            sender.send(message);
            log.info("[EMAIL SERVICE] Password reset email successfully dispatched to: {}", recipientEmail);
            return true;
        } catch (Exception e) {
            log.error("[EMAIL SERVICE] Failed to dispatch password reset email to {}: {}. Reset link: {}",
                    recipientEmail, e.getMessage(), resetUrl, e);
            // Non-fatal: do not crash user experience if SMTP provider has temporary connection blip
            return false;
        }
    }

    private String buildPasswordResetHtml(String customerName, String resetUrl) {
        return """
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Reset Your Password</title>
              <style>
                body { margin: 0; padding: 0; background-color: #FAF6F0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #2B1408; }
                .wrapper { max-width: 560px; margin: 30px auto; background-color: #FFFDF9; border: 1px solid #EEDDCC; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(43,20,8,0.06); }
                .header { background: linear-gradient(135deg, #1A0B04 0%%, #2B1408 100%%); padding: 32px 24px; text-align: center; }
                .header h1 { margin: 0; color: #FFF; font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }
                .header p { margin: 6px 0 0; color: #FE8E2A; font-size: 13px; font-weight: 600; }
                .content { padding: 32px 28px; }
                .greeting { font-size: 16px; font-weight: 700; margin-bottom: 12px; color: #2B1408; }
                .text { font-size: 14px; line-height: 1.6; color: #6E5343; margin-bottom: 24px; }
                .button-container { text-align: center; margin: 32px 0; }
                .btn { display: inline-block; background-color: #FE8E2A; color: #FFFFFF !important; font-size: 14px; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 12px; box-shadow: 0 4px 12px rgba(254,142,42,0.3); }
                .btn:hover { background-color: #E67616; }
                .expiry { font-size: 12px; color: #8A6E5C; background: #FDF6EE; border: 1px dashed #EEDDCC; padding: 12px 16px; border-radius: 10px; margin-bottom: 24px; }
                .alt-link { font-size: 11px; color: #A89284; word-break: break-all; margin-top: 20px; }
                .footer { background-color: #F8F2EA; padding: 20px 24px; text-align: center; font-size: 12px; color: #8A6E5C; border-top: 1px solid #EEDDCC; }
              </style>
            </head>
            <body>
              <div class="wrapper">
                <div class="header">
                  <h1>Tryit Cafe &amp; Kitchen</h1>
                  <p>Password Reset Request</p>
                </div>
                <div class="content">
                  <div class="greeting">Hello %s,</div>
                  <div class="text">
                    We received a request to reset your password for your Tryit Cafe &amp; Kitchen account. Click the button below to securely set up a new password:
                  </div>
                  <div class="button-container">
                    <a href="%s" target="_blank" class="btn">Reset My Password &rarr;</a>
                  </div>
                  <div class="expiry">
                    &#9200; <strong>Note:</strong> This password reset link is strictly valid for <strong>15 minutes</strong> for your security.
                  </div>
                  <div class="text" style="margin-bottom: 0;">
                    If you did not request a password reset, you can safely disregard this email. Your current password remains active and secure.
                  </div>
                  <div class="alt-link">
                    If the button doesn't work, copy and paste this link into your browser:<br>
                    <a href="%s" style="color: #FE8E2A;">%s</a>
                  </div>
                </div>
                <div class="footer">
                  &copy; Tryit Cafe &amp; Kitchen &bull; Gandi Maisamma, Hyderabad<br>
                  Need assistance? Reach us at %s
                </div>
              </div>
            </body>
            </html>
            """.formatted(customerName, resetUrl, resetUrl, resetUrl, supportEmail);
    }
}
