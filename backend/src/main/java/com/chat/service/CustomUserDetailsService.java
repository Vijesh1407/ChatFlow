package com.chat.service;

import com.chat.repository.UserRepository;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username)
            throws UsernameNotFoundException {
        com.chat.model.User u = userRepository
                .findByUsername(username)
                .orElseThrow(() ->
                        new UsernameNotFoundException("Not found: " + username));

        return User.withUsername(u.getUsername())
                .password(u.getPassword())
                .roles("USER")
                .build();
    }
}