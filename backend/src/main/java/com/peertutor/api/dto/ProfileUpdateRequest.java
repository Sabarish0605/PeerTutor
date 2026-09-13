package com.peertutor.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProfileUpdateRequest {
    private String fullName;
    private String fieldOfStudy;
    private String bio;
    private String avatarUrl;
    private String portfolioUrl;
    private String repositoryUrl;
    private String timezone;
    private String timeFormat;
    private Boolean emailNotifs60m;
    private Boolean emailNotifsNewCourses;
    private Boolean emailNotifsSecurity;
    private String payoutUpi;
    private String payoutBank;
}
