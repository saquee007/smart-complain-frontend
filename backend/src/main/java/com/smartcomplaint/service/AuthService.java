package com.smartcomplaint.service;

import com.smartcomplaint.dto.AuthResponse;
import com.smartcomplaint.dto.LoginRequest;
import com.smartcomplaint.dto.RegisterRequest;
import com.smartcomplaint.entity.Role;
import com.smartcomplaint.entity.User;
import com.smartcomplaint.exception.BadRequestException;
import com.smartcomplaint.repository.UserRepository;
import com.smartcomplaint.security.JwtUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Service for user authentication and registration.
 * Handles student registration, user login, and JWT token generation.
 */
@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
    }

    /**
     * Register a new student account.
     * Only students can self-register. Admin and staff accounts
     * must be created through the database or a seeder.
     */
    public AuthResponse register(RegisterRequest request) {
        if (request == null) {
            throw new BadRequestException("Registration request is required.");
        }

        String email = normalizeEmail(request.getEmail());
        String fullName = normalizeFullName(request.getFullName());
        String password = request.getPassword();

        if (email == null || email.isBlank()) {
            throw new BadRequestException("Email is required.");
        }
        if (fullName == null || fullName.isBlank()) {
            throw new BadRequestException("Full name is required.");
        }
        if (password == null || password.isBlank()) {
            throw new BadRequestException("Password is required.");
        }

        // Check if email is already taken
        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("Email is already registered. Please use a different email.");
        }

        // Create new student user
        User user = new User();
        user.setFullName(fullName);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(Role.STUDENT);

        userRepository.save(user);
        logger.info("New student registered: {}", email);

        // Auto-login after registration
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail(email);
        loginRequest.setPassword(password);
        return login(loginRequest);
    }

    /**
     * Authenticate a user and return a JWT token.
     */
    public AuthResponse login(LoginRequest request) {
        if (request == null) {
            throw new BadRequestException("Login request is required.");
        }

        String email = normalizeEmail(request.getEmail());
        String password = request.getPassword();

        if (email == null || email.isBlank()) {
            throw new BadRequestException("Email is required.");
        }
        if (password == null || password.isBlank()) {
            throw new BadRequestException("Password is required.");
        }

        // Authenticate with Spring Security
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, password));

        // Generate JWT token
        String token = jwtUtils.generateToken(authentication);

        // Get user details for the response
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found"));

        logger.info("User logged in: {} ({})", user.getEmail(), user.getRole());

        return new AuthResponse(
                token,
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole().name()
        );
    }

    private String normalizeEmail(String email) {
        if (email == null) {
            return null;
        }
        return email.trim().toLowerCase();
    }

    private String normalizeFullName(String fullName) {
        if (fullName == null) {
            return null;
        }
        return fullName.trim();
    }
}
