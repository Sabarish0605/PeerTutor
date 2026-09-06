package com.peertutor.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {

    // Make sure there are no @NotNull annotations for role here anymore!
    private String name;
    private String email;
    private String password;

    // DELETE the 'private Role role;' line
}