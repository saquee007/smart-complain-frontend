package com.smartcomplaint.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartcomplaint.dto.LoginRequest;
import com.smartcomplaint.dto.RegisterRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for the Auth Controller.
 * Tests registration, login, and validation.
 */
@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void registerStudent_Success() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setFullName("Test Student");
        request.setEmail("test.student" + System.currentTimeMillis() + "@college.edu");
        request.setPassword("password123");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.role").value("STUDENT"))
                .andExpect(jsonPath("$.fullName").value("Test Student"));
    }

    @Test
    void registerStudent_InvalidEmail() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setFullName("Test Student");
        request.setEmail("invalid-email");
        request.setPassword("password123");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void registerStudent_ShortPassword() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setFullName("Test Student");
        request.setEmail("short.pass@college.edu");
        request.setPassword("123");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void loginAdmin_Success() throws Exception {
        // The DataSeeder creates admin@college.edu with password admin123
        LoginRequest request = new LoginRequest();
        request.setEmail("admin@college.edu");
        request.setPassword("admin123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.role").value("ADMIN"));
    }

    @Test
    void loginStudent_WrongPassword() throws Exception {
        // First register
        RegisterRequest regRequest = new RegisterRequest();
        regRequest.setFullName("Login Test");
        regRequest.setEmail("login.test" + System.currentTimeMillis() + "@college.edu");
        regRequest.setPassword("correctpassword");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(regRequest)))
                .andExpect(status().isCreated());

        // Try wrong password
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail(regRequest.getEmail());
        loginRequest.setPassword("wrongpassword");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized());
    }
}
