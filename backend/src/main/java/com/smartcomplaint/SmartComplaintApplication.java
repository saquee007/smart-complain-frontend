package com.smartcomplaint;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main entry point for the Smart Complaint Management System backend.
 * This Spring Boot application provides REST APIs for complaint management,
 * AI-based classification, and role-based access for Students, Admin, and Staff.
 */
@SpringBootApplication
public class SmartComplaintApplication {

    public static void main(String[] args) {
        SpringApplication.run(SmartComplaintApplication.class, args);
    }
}
