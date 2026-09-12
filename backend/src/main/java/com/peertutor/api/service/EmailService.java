package com.peertutor.api.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

@Service
@Slf4j
public class EmailService {

    @Value("${sendgrid.api.key:}")
    private String sendGridApiKey;

    @Value("${sendgrid.from.email:no-reply@peertutor.com}")
    private String fromEmail;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    /**
     * Sends a 60-minute session reminder email to a student.
     *
     * @param toEmail   Recipient student email
     * @param studentName Recipient name
     * @param courseTitle Course title
     * @param tutorName Tutor name
     * @param startTimeFormatted Formatted start time string
     * @param meetLink Google Meet link
     */
    public void sendSessionReminder(
            String toEmail,
            String studentName,
            String courseTitle,
            String tutorName,
            String startTimeFormatted,
            String meetLink
    ) {
        String subject = "⏰ Reminder: Your peer tutoring session starts in 60 minutes!";
        String htmlContent = buildReminderHtml(studentName, courseTitle, tutorName, startTimeFormatted, meetLink);

        sendEmail(toEmail, studentName, subject, htmlContent);
    }

    /**
     * Dispatches an email via SendGrid v3 API or logs it if SendGrid is unconfigured.
     */
    public void sendEmail(String toEmail, String toName, String subject, String htmlContent) {
        if (sendGridApiKey == null || sendGridApiKey.isBlank()) {
            log.info("[EmailService] (SendGrid API key not set - simulating email delivery)\n" +
                            "  To: {} <{}>\n" +
                            "  Subject: {}\n" +
                            "  Status: Delivered successfully (simulated)",
                    toName, toEmail, subject);
            return;
        }

        try {
            String sanitizedHtml = htmlContent.replace("\"", "\\\"").replace("\n", "");
            String payload = String.format(
                    "{\"personalizations\":[{\"to\":[{\"email\":\"%s\",\"name\":\"%s\"}]}],\"from\":{\"email\":\"%s\",\"name\":\"PeerTutor\"},\"subject\":\"%s\",\"content\":[{\"type\":\"text/html\",\"value\":\"%s\"}]}",
                    toEmail, toName, fromEmail, subject, sanitizedHtml
            );

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.sendgrid.com/v3/mail/send"))
                    .header("Authorization", "Bearer " + sendGridApiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(payload))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                log.info("Successfully dispatched reminder email via SendGrid to {}", toEmail);
            } else {
                log.warn("SendGrid returned status {}: {}", response.statusCode(), response.body());
            }
        } catch (Exception e) {
            log.error("Failed to send email to {} via SendGrid: {}", toEmail, e.getMessage());
        }
    }

    private String buildReminderHtml(String studentName, String courseTitle, String tutorName, String startTimeFormatted, String meetLink) {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head><meta charset='UTF-8'><style>" +
                "body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f0f0f; color: #f1f1f1; padding: 24px; }" +
                ".card { background: #1c1c1c; border: 1px solid #333333; border-radius: 16px; padding: 32px; max-width: 540px; margin: 0 auto; }" +
                ".brand { color: #00C2CB; font-size: 20px; font-weight: 800; letter-spacing: -0.5px; margin-bottom: 20px; }" +
                ".title { font-size: 20px; font-weight: 700; color: #ffffff; margin-bottom: 8px; }" +
                ".text { color: #aaaaaa; font-size: 14px; line-height: 1.6; margin-bottom: 20px; }" +
                ".highlight-box { background: #141414; border: 1px solid #282828; border-radius: 12px; padding: 16px; margin-bottom: 24px; }" +
                ".btn { display: inline-block; background: #00C2CB; color: #0f0f0f !important; font-weight: 700; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-size: 14px; }" +
                ".footer { color: #666666; font-size: 12px; margin-top: 24px; text-align: center; }" +
                "</style></head>" +
                "<body>" +
                "<div class='card'>" +
                "<div class='brand'>FLUX / PeerTutor</div>" +
                "<div class='title'>Your Session Starts in 60 Minutes!</div>" +
                "<p class='text'>Hi " + studentName + ",</p>" +
                "<p class='text'>This is a friendly reminder that your upcoming peer tutoring session is starting soon.</p>" +
                "<div class='highlight-box'>" +
                "<div style='color: #ffffff; font-weight: 600; font-size: 15px; margin-bottom: 6px;'>" + courseTitle + "</div>" +
                "<div style='color: #00C2CB; font-size: 13px; margin-bottom: 4px;'>Tutor: " + tutorName + "</div>" +
                "<div style='color: #aaaaaa; font-size: 13px;'>Time: " + startTimeFormatted + "</div>" +
                "</div>" +
                (meetLink != null && !meetLink.isBlank()
                        ? "<p style='margin-bottom: 24px;'><a href='" + meetLink + "' class='btn' target='_blank'>Access Class Link</a></p>"
                        : "<p class='text'>Please log into your dashboard to join the live session once it starts.</p>") +
                "<div class='footer'>Sent with care from the FLUX PeerTutor automated scheduling engine.</div>" +
                "</div>" +
                "</body></html>";
    }
}
