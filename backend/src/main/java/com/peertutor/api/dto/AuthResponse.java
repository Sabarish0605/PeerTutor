package com.peertutor.api.dto;

import com.peertutor.api.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {

    private String token; // The JWT string for future requests
    private Long userId;
    private String name;
    private String email;
    private Role role;
}