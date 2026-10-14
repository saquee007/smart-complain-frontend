package com.smartcomplaint;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class HomeController {

    @GetMapping("/")
    public Map<String, String> home() {
        return Map.of(
            "message", "Welcome to Smart Complaint Management System Backend",
            "status", "Running",
            "frontend", "http://localhost:5173"
        );
    }
}