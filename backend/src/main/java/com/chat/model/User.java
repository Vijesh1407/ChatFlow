package com.chat.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 50)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public User() {}

    private User(Builder b) {
        this.username  = b.username;
        this.password  = b.password;
    }

    public Long getId()         { return id; }
    public String getUsername() { return username; }
    public String getPassword() { return password; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String username, password;
        public Builder username(String v) { username = v; return this; }
        public Builder password(String v) { password = v; return this; }
        public User build() { return new User(this); }
    }
}