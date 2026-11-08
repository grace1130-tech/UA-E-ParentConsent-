package com.yearners.ua_parent_consent_backend.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class AdminConsentMonitoringDto {

    private Long formId;
    private String title;
    private String className;
    private LocalDate activityDate;
    private LocalDate deadline;
    private String location;
    private String status;
    private String teacherName;

    private Long totalResponses;
    private Long agreed;
    private Long disagreed;
    private Long pending;
}
