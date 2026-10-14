package com.smartcomplaint.service;

import com.smartcomplaint.dto.AiClassificationResult;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.*;

/**
 * AI Classification Service.
 *
 * This service analyzes complaint text and suggests:
 * - Category (e.g., Equipment, Infrastructure, Academic, Cleanliness, Safety, IT, Other)
 * - Priority (Low, Medium, High, Critical)
 * - Department (e.g., Maintenance, IT, Administration, Housekeeping, Security, Academic Affairs)
 * - Short reason for the classification
 *
 * Supports OpenAI and Gemini API providers.
 * Falls back to a deterministic rule-based classifier when no API key is available.
 */
@Service
public class AiClassificationService {

    private static final Logger logger = LoggerFactory.getLogger(AiClassificationService.class);

    @Value("${ai.provider:fallback}")
    private String aiProvider;

    @Value("${ai.api.key:}")
    private String apiKey;

    @Value("${ai.api.url:}")
    private String apiUrl;

    @Value("${ai.api.model:gpt-3.5-turbo}")
    private String model;

    @Value("${ai.api.timeout-seconds:10}")
    private int timeoutSeconds;

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Classify a complaint using AI or fallback.
     *
     * @param title       The complaint title
     * @param description The complaint description
     * @return AiClassificationResult with suggested category, priority, department, and reason
     */
    public AiClassificationResult classify(String title, String description) {
        String complaintText = title + ". " + description;

        // Check if an AI provider is configured and has an API key
        if (apiKey != null && !apiKey.isBlank() && !"fallback".equalsIgnoreCase(aiProvider)) {
            try {
                logger.info("Attempting AI classification using provider: {}", aiProvider);
                return callAiApi(complaintText);
            } catch (Exception e) {
                logger.warn("AI API call failed, using fallback classification: {}", e.getMessage());
            }
        } else {
            logger.info("No AI API key configured, using fallback classification");
        }

        // Fallback: rule-based classification
        return fallbackClassify(complaintText);
    }

    /**
     * Call the AI API (OpenAI or Gemini) for classification.
     */
    private AiClassificationResult callAiApi(String complaintText) {
        if ("gemini".equalsIgnoreCase(aiProvider)) {
            return callGeminiApi(complaintText);
        }
        return callOpenAiApi(complaintText);
    }

    /**
     * Call OpenAI-compatible API for classification.
     */
    private AiClassificationResult callOpenAiApi(String complaintText) {
        String systemPrompt = buildSystemPrompt();

        // Build the request body for OpenAI Chat Completions API
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", model);
        requestBody.put("temperature", 0.3);

        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", systemPrompt));
        messages.add(Map.of("role", "user", "content", "Classify this complaint: " + complaintText));
        requestBody.put("messages", messages);

        WebClient webClient = WebClient.builder()
                .baseUrl(apiUrl)
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .defaultHeader("Content-Type", "application/json")
                .build();

        String responseBody = webClient.post()
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .timeout(Duration.ofSeconds(timeoutSeconds))
                .block();

        return parseOpenAiResponse(responseBody);
    }

    /**
     * Call Google Gemini API for classification.
     */
    private AiClassificationResult callGeminiApi(String complaintText) {
        String systemPrompt = buildSystemPrompt();
        String fullPrompt = systemPrompt + "\n\nClassify this complaint: " + complaintText;

        String geminiUrl = "https://generativelanguage.googleapis.com/v1beta/models/"
                + model + ":generateContent?key=" + apiKey;

        Map<String, Object> requestBody = new HashMap<>();
        List<Map<String, Object>> contents = new ArrayList<>();
        Map<String, Object> content = new HashMap<>();
        List<Map<String, String>> parts = new ArrayList<>();
        parts.add(Map.of("text", fullPrompt));
        content.put("parts", parts);
        contents.add(content);
        requestBody.put("contents", contents);

        WebClient webClient = WebClient.builder().build();

        String responseBody = webClient.post()
                .uri(geminiUrl)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .timeout(Duration.ofSeconds(timeoutSeconds))
                .block();

        return parseGeminiResponse(responseBody);
    }

    /**
     * Build the system prompt that instructs the AI how to classify complaints.
     */
    private String buildSystemPrompt() {
        return """
            You are a complaint classification assistant for a college management system.
            Analyze the complaint and respond ONLY with a JSON object (no markdown, no extra text).

            Categories: Equipment, Infrastructure, Academic, Cleanliness, Safety, IT, Administrative, Other
            Priorities: Low, Medium, High, Critical
            Departments: Maintenance, IT Department, Administration, Housekeeping, Security, Academic Affairs, General

            Response format (strict JSON only):
            {
              "category": "Equipment",
              "priority": "Medium",
              "department": "Maintenance",
              "shortReason": "Brief explanation of why this classification was chosen"
            }
            """;
    }

    /**
     * Parse OpenAI API response and extract the classification.
     */
    private AiClassificationResult parseOpenAiResponse(String responseBody) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            String content = root.path("choices").get(0)
                    .path("message").path("content").asText();
            return parseJsonClassification(content, false);
        } catch (Exception e) {
            logger.error("Failed to parse OpenAI response: {}", e.getMessage());
            throw new RuntimeException("Failed to parse AI response", e);
        }
    }

    /**
     * Parse Gemini API response and extract the classification.
     */
    private AiClassificationResult parseGeminiResponse(String responseBody) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            String content = root.path("candidates").get(0)
                    .path("content").path("parts").get(0)
                    .path("text").asText();
            return parseJsonClassification(content, false);
        } catch (Exception e) {
            logger.error("Failed to parse Gemini response: {}", e.getMessage());
            throw new RuntimeException("Failed to parse AI response", e);
        }
    }

    /**
     * Parse a JSON string from AI response into AiClassificationResult.
     */
    private AiClassificationResult parseJsonClassification(String content, boolean isFallback) {
        try {
            // Try to extract JSON from the response (AI might wrap it in markdown)
            String jsonStr = content.trim();
            if (jsonStr.contains("{")) {
                jsonStr = jsonStr.substring(jsonStr.indexOf("{"), jsonStr.lastIndexOf("}") + 1);
            }

            JsonNode jsonNode = objectMapper.readTree(jsonStr);

            String category = jsonNode.path("category").asText("Other");
            String priority = jsonNode.path("priority").asText("Medium");
            String department = jsonNode.path("department").asText("General");
            String shortReason = jsonNode.path("shortReason").asText("Classified by AI");

            // Validate the values are within expected ranges
            category = validateCategory(category);
            priority = validatePriority(priority);
            department = validateDepartment(department);

            return new AiClassificationResult(category, priority, department, shortReason, isFallback);
        } catch (Exception e) {
            logger.error("Failed to parse JSON classification: {}", e.getMessage());
            throw new RuntimeException("Invalid AI response format", e);
        }
    }

    // ======================================================================
    // FALLBACK CLASSIFICATION (Rule-based, works without any API key)
    // ======================================================================

    /**
     * Deterministic rule-based fallback classifier.
     * Analyzes keywords in the complaint text to determine classification.
     * Results are labeled as "fallback" so they are clearly not AI-generated.
     */
    public AiClassificationResult fallbackClassify(String complaintText) {
        String text = complaintText.toLowerCase();

        String category;
        String priority;
        String department;
        String reason;

        // --- Category and Department Classification ---
        if (containsAny(text, "projector", "computer", "printer", "lab equipment",
                "machine", "device", "monitor", "keyboard", "mouse", "speaker",
                "mic", "microphone", "smartboard", "equipment")) {
            category = "Equipment";
            department = "Maintenance";
            reason = "Complaint mentions equipment-related keywords";

        } else if (containsAny(text, "internet", "wifi", "wi-fi", "network", "server",
                "website", "software", "login", "password", "system",
                "portal", "email", "erp", "lms")) {
            category = "IT";
            department = "IT Department";
            reason = "Complaint mentions IT infrastructure or software";

        } else if (containsAny(text, "dirty", "clean", "garbage", "trash", "waste",
                "dustbin", "toilet", "washroom", "bathroom", "restroom",
                "sweeping", "mopping", "hygiene", "smell", "pest",
                "cockroach", "rat", "insect")) {
            category = "Cleanliness";
            department = "Housekeeping";
            reason = "Complaint mentions cleanliness or hygiene issues";

        } else if (containsAny(text, "unsafe", "danger", "fire", "theft", "stolen",
                "security", "guard", "cctv", "camera", "harassment",
                "bully", "threat", "emergency", "accident")) {
            category = "Safety";
            department = "Security";
            reason = "Complaint mentions safety or security concerns";

        } else if (containsAny(text, "building", "wall", "ceiling", "floor", "door",
                "window", "roof", "leak", "crack", "broken", "plumbing",
                "pipe", "electrical", "wiring", "light", "fan", "ac",
                "air conditioner", "elevator", "lift", "staircase")) {
            category = "Infrastructure";
            department = "Maintenance";
            reason = "Complaint mentions building infrastructure issues";

        } else if (containsAny(text, "teacher", "professor", "faculty", "lecture",
                "class", "exam", "result", "grade", "marks", "syllabus",
                "attendance", "timetable", "schedule", "course",
                "assignment", "project", "semester")) {
            category = "Academic";
            department = "Academic Affairs";
            reason = "Complaint mentions academic-related matters";

        } else if (containsAny(text, "fee", "admission", "certificate", "document",
                "id card", "library", "hostel", "canteen", "transport",
                "bus", "parking", "scholarship", "registration")) {
            category = "Administrative";
            department = "Administration";
            reason = "Complaint mentions administrative matters";

        } else {
            category = "Other";
            department = "General";
            reason = "Could not determine specific category from complaint text";
        }

        // --- Priority Classification ---
        if (containsAny(text, "urgent", "emergency", "immediately", "critical",
                "dangerous", "fire", "accident", "not working at all",
                "completely broken")) {
            priority = "Critical";
        } else if (containsAny(text, "important", "serious", "major", "broken",
                "not working", "failed", "down", "stopped")) {
            priority = "High";
        } else if (containsAny(text, "issue", "problem", "concern", "sometimes",
                "intermittent", "slow", "delay")) {
            priority = "Medium";
        } else {
            priority = "Low";
        }

        return new AiClassificationResult(category, priority, department,
                reason + " (Fallback classification - no AI API configured)", true);
    }

    // === Helper Methods ===

    private boolean containsAny(String text, String... keywords) {
        for (String keyword : keywords) {
            if (text.contains(keyword)) {
                return true;
            }
        }
        return false;
    }

    private String validateCategory(String category) {
        List<String> valid = Arrays.asList("Equipment", "Infrastructure", "Academic",
                "Cleanliness", "Safety", "IT", "Administrative", "Other");
        return valid.contains(category) ? category : "Other";
    }

    private String validatePriority(String priority) {
        List<String> valid = Arrays.asList("Low", "Medium", "High", "Critical");
        return valid.contains(priority) ? priority : "Medium";
    }

    private String validateDepartment(String department) {
        List<String> valid = Arrays.asList("Maintenance", "IT Department", "Administration",
                "Housekeeping", "Security", "Academic Affairs", "General");
        return valid.contains(department) ? department : "General";
    }
}
