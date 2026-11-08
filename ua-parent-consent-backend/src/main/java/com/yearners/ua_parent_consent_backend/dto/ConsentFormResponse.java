package com.yearners.ua_parent_consent_backend.dto;

import com.yearners.ua_parent_consent_backend.model.ConsentForm;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class ConsentFormResponse {

    private Long id;
    private String title;
    private String description;
    private String className;
    private LocalDate activityDate;
    private String location;
    private LocalDate deadline;
    private String instructions;
    private String status;
    private Long teacherId;
    private String teacherName;
    private LocalDateTime createdAt;

    public static ConsentFormResponse from(ConsentForm form) {

        ConsentFormResponse response = new ConsentFormResponse();

        response.setId(form.getId());
        response.setTitle(form.getTitle());
        response.setDescription(form.getDescription());
        response.setClassName(form.getClassName());
        response.setActivityDate(form.getActivityDate());
        response.setLocation(form.getLocation());
        response.setDeadline(form.getDeadline());
        response.setInstructions(form.getInstructions());
        response.setStatus(form.getStatus());
        response.setTeacherId(form.getTeacher().getId());
        response.setTeacherName(form.getTeacher().getFullName());
        response.setCreatedAt(form.getCreatedAt());

        return response;
    }
}
