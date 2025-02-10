package com.anpl.util;

import org.springframework.stereotype.Component;
import java.util.UUID;

@Component
public class RegistrationNumberGenerator {
    
    public String generate() {
        // Format: ANPL + Random 8 characters
        return "ANPL" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
} 