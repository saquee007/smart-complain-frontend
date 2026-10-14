package com.smartcomplaint.config;

import com.smartcomplaint.entity.Role;
import com.smartcomplaint.entity.User;
import com.smartcomplaint.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Database seeder that creates default admin and staff accounts on startup.
 * Only creates accounts if they don't already exist.
 *
 * Default accounts (for demo/testing):
 * - Admin:  admin@college.edu / admin123
 * - Staff1: staff.maintenance@college.edu / staff123 (Maintenance department)
 * - Staff2: staff.it@college.edu / staff123 (IT Department)
 * - Staff3: staff.admin@college.edu / staff123 (Administration department)
 */
@Configuration
public class DataSeeder {

    private static final Logger logger = LoggerFactory.getLogger(DataSeeder.class);

    @Bean
    public CommandLineRunner seedDatabase(UserRepository userRepository,
                                           PasswordEncoder passwordEncoder) {
        return args -> {
            // Create default admin if not exists
            if (!userRepository.existsByEmail("admin@college.edu")) {
                User admin = new User();
                admin.setFullName("System Administrator");
                admin.setEmail("admin@college.edu");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setRole(Role.ADMIN);
                admin.setDepartment("Administration");
                userRepository.save(admin);
                logger.info("Default ADMIN account created: admin@college.edu");
            }

            // Create default staff members if not exist
            createStaffIfNotExists(userRepository, passwordEncoder,
                    "Rajesh Kumar", "staff.maintenance@college.edu",
                    "staff123", "Maintenance");

            createStaffIfNotExists(userRepository, passwordEncoder,
                    "Priya Sharma", "staff.it@college.edu",
                    "staff123", "IT Department");

            createStaffIfNotExists(userRepository, passwordEncoder,
                    "Amit Patel", "staff.admin@college.edu",
                    "staff123", "Administration");

            createStaffIfNotExists(userRepository, passwordEncoder,
                    "Sunita Verma", "staff.housekeeping@college.edu",
                    "staff123", "Housekeeping");

            createStaffIfNotExists(userRepository, passwordEncoder,
                    "Vikram Singh", "staff.security@college.edu",
                    "staff123", "Security");

            logger.info("Database seeding completed");
        };
    }

    private void createStaffIfNotExists(UserRepository userRepository,
                                         PasswordEncoder passwordEncoder,
                                         String name, String email,
                                         String password, String department) {
        if (!userRepository.existsByEmail(email)) {
            User staff = new User();
            staff.setFullName(name);
            staff.setEmail(email);
            staff.setPassword(passwordEncoder.encode(password));
            staff.setRole(Role.STAFF);
            staff.setDepartment(department);
            userRepository.save(staff);
            logger.info("Default STAFF account created: {} ({})", email, department);
        }
    }
}
