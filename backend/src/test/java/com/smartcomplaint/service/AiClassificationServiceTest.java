package com.smartcomplaint.service;

import com.smartcomplaint.dto.AiClassificationResult;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests for the AI Classification Service.
 * These tests verify the fallback (rule-based) classifier works correctly.
 */
@SpringBootTest
class AiClassificationServiceTest {

    @Autowired
    private AiClassificationService aiClassificationService;

    @Test
    void testEquipmentClassification() {
        AiClassificationResult result = aiClassificationService.fallbackClassify(
                "The projector in Room 204 is not working");

        assertEquals("Equipment", result.getCategory());
        assertEquals("Maintenance", result.getDepartment());
        assertEquals("High", result.getPriority()); // "not working" triggers High
        assertTrue(result.isFallback());
        assertNotNull(result.getShortReason());
    }

    @Test
    void testITClassification() {
        AiClassificationResult result = aiClassificationService.fallbackClassify(
                "The wifi in the library is very slow and keeps disconnecting");

        assertEquals("IT", result.getCategory());
        assertEquals("IT Department", result.getDepartment());
        assertTrue(result.isFallback());
    }

    @Test
    void testInfrastructureClassification() {
        AiClassificationResult result = aiClassificationService.fallbackClassify(
                "There is a water leak from the ceiling in Room 101");

        assertEquals("Infrastructure", result.getCategory());
        assertEquals("Maintenance", result.getDepartment());
        assertTrue(result.isFallback());
    }

    @Test
    void testCleanlinessClassification() {
        AiClassificationResult result = aiClassificationService.fallbackClassify(
                "The washroom on the second floor is very dirty and needs cleaning");

        assertEquals("Cleanliness", result.getCategory());
        assertEquals("Housekeeping", result.getDepartment());
        assertTrue(result.isFallback());
    }

    @Test
    void testSafetyClassification() {
        AiClassificationResult result = aiClassificationService.fallbackClassify(
                "There is no fire extinguisher on the third floor, this is unsafe");

        assertEquals("Safety", result.getCategory());
        assertEquals("Security", result.getDepartment());
        assertTrue(result.isFallback());
    }

    @Test
    void testAcademicClassification() {
        AiClassificationResult result = aiClassificationService.fallbackClassify(
                "The professor has not shared the syllabus for the course");

        assertEquals("Academic", result.getCategory());
        assertEquals("Academic Affairs", result.getDepartment());
        assertTrue(result.isFallback());
    }

    @Test
    void testCriticalPriority() {
        AiClassificationResult result = aiClassificationService.fallbackClassify(
                "URGENT: Fire emergency in Block B, need help immediately");

        assertEquals("Critical", result.getPriority());
        assertTrue(result.isFallback());
    }

    @Test
    void testUnknownClassification() {
        AiClassificationResult result = aiClassificationService.fallbackClassify(
                "Something random that does not match any category");

        assertEquals("Other", result.getCategory());
        assertEquals("General", result.getDepartment());
        assertTrue(result.isFallback());
    }
}
