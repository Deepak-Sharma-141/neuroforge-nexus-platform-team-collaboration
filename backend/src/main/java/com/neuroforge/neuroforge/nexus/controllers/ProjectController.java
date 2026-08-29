package com.neuroforge.neuroforge.nexus.controllers;

import com.neuroforge.neuroforge.nexus.dto.request.CreateProjectRequest;
import com.neuroforge.neuroforge.nexus.dto.request.UpdateProjectRequest;
import com.neuroforge.neuroforge.nexus.dto.response.ProjectResponse;
import com.neuroforge.neuroforge.nexus.entities.enums.ProjectStatus;
import com.neuroforge.neuroforge.nexus.service.ProjectService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/projects")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ProjectController {

    ProjectService projectService;

    @PostMapping
    public ResponseEntity<ProjectResponse> createProject(@Valid @RequestBody CreateProjectRequest request) {
        ProjectResponse response = projectService.createProject(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectResponse> getProjectById(@PathVariable String id) {
        return ResponseEntity.ok(projectService.getProjectById(id));
    }

    @GetMapping
    public ResponseEntity<List<ProjectResponse>> getAllProjects() {
        return ResponseEntity.ok(projectService.getAllProjects());
    }

    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<List<ProjectResponse>> getProjectsByOwner(@PathVariable String ownerId) {
        return ResponseEntity.ok(projectService.getProjectsByOwner(ownerId));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<ProjectResponse>> getProjectsByStatus(@PathVariable ProjectStatus status) {
        return ResponseEntity.ok(projectService.getProjectsByStatus(status));
    }

    @GetMapping("/member/{memberId}")
    public ResponseEntity<List<ProjectResponse>> getProjectsByMember(@PathVariable String memberId) {
        return ResponseEntity.ok(projectService.getProjectsByMember(memberId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProjectResponse> updateProject(
            @PathVariable String id,
            @RequestBody UpdateProjectRequest request) {
        return ResponseEntity.ok(projectService.updateProject(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable String id) {
        projectService.deleteProject(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/members/{memberId}")
    public ResponseEntity<ProjectResponse> addMemberToProject(
            @PathVariable String id,
            @PathVariable String memberId) {
        return ResponseEntity.ok(projectService.addMemberToProject(id, memberId));
    }

    @DeleteMapping("/{id}/members/{memberId}")
    public ResponseEntity<ProjectResponse> removeMemberFromProject(
            @PathVariable String id,
            @PathVariable String memberId) {
        return ResponseEntity.ok(projectService.removeMemberFromProject(id, memberId));
    }
}
