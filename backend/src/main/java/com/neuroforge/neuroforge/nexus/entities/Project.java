package com.neuroforge.neuroforge.nexus.entities;

import com.neuroforge.neuroforge.nexus.entities.enums.ProjectPriority;
import com.neuroforge.neuroforge.nexus.entities.enums.ProjectStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Document(collection = "projects")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Project {

    @Id
    String id;

    @Indexed(unique = true)
    UUID projectId;

    @Indexed(unique = true)
    String name;

    String description;

    String teamLead;

    @Builder.Default
    ProjectStatus status = ProjectStatus.PLANNED;

    @Builder.Default
    ProjectPriority priority = ProjectPriority.MEDIUM;

    String ownerId;

    @Builder.Default
    List<String> memberIds = new ArrayList<>();

    LocalDateTime createdAt;

    LocalDateTime updatedAt;

    LocalDate startDate;

    LocalDate endDate;
}

