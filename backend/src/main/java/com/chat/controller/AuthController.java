package com.chat.controller;

import com.chat.model.User;
import com.chat.service.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authManager;
    private final UserService userService;

    public AuthController(AuthenticationManager authManager,
                          UserService userService) {
        this.authManager = authManager;
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody Map<String, String> body) {
        try {
            User user = userService.register(
                    body.get("username"), body.get("password"));
            return ResponseEntity.ok(Map.of(
                    "id",       user.getId(),
                    "username", user.getUsername()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody Map<String, String> body,
            HttpSession session) {
        try {
            Authentication auth = authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            body.get("username"), body.get("password"))
            );
            SecurityContextHolder.getContext().setAuthentication(auth);
            session.setAttribute(
                    "SPRING_SECURITY_CONTEXT",
                    SecurityContextHolder.getContext()
            );
            User user = userService
                    .findByUsername(auth.getName()).orElseThrow();
            return ResponseEntity.ok(Map.of(
                    "username", user.getUsername(),
                    "id",       user.getId()
            ));
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401)
                    .body(Map.of("error", "Invalid credentials"));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {
        session.invalidate();
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok(Map.of("message", "Logged out"));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication auth) {
        // If not logged in, return 401 (don't throw exception)
        if (auth == null
                || !auth.isAuthenticated()
                || auth.getPrincipal().equals("anonymousUser")) {
            return ResponseEntity.status(401)
                    .body(Map.of("error", "Not logged in"));
        }
        User user = userService
                .findByUsername(auth.getName()).orElseThrow();
        return ResponseEntity.ok(Map.of(
                "username", user.getUsername(),
                "id",       user.getId()
        ));
    }
}