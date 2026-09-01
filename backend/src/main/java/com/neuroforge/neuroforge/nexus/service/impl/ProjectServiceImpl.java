package com.neuroforge.neuroforge.nexus.service.impl;

import com.neuroforge.neuroforge.nexus.dto.request.CreateProjectRequest;
import com.neuroforge.neuroforge.nexus.dto.request.UpdateProjectRequest;
import com.neuroforge.neuroforge.nexus.dto.response.ProjectResponse;
import com.neuroforge.neuroforge.nexus.entities.Project;
import com.neuroforge.neuroforge.nexus.entities.enums.ProjectPriority;
import com.neuroforge.neuroforge.nexus.entities.enums.ProjectStatus;
import com.neuroforge.neuroforge.nexus.exception.ProjectAlreadyExistsException;
import com.neuroforge.neuroforge.nexus.exception.ProjectNotFoundException;
import com.neuroforge.neuroforge.nexus.exception.ResourceNotFoundException;
import com.neuroforge.neuroforge.nexus.mapper.ProjectMapper;
import com.neuroforge.neuroforge.nexus.repository.ProjectRepository;
import com.neuroforge.neuroforge.nexus.repository.UserRepository;
import com.neuroforge.neuroforge.nexus.service.ProjectService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final ProjectMapper projectMapper;

    @Override
    public ProjectResponse createProject(CreateProjectRequest request) {
        log.info("Creating new project with name: {}", request.getName());

        if (projectRepository.existsByName(request.getName())) {
            throw new ProjectAlreadyExistsException("Project with name '" + request.getName() + "' already exists");
        }

        if (request.getOwnerId() != null && !userRepository.existsById(request.getOwnerId())) {
            throw new ResourceNotFoundException("Owner user not found with id: " + request.getOwnerId());
        }

        if (request.getTeamLead() != null && !userRepository.existsById(request.getTeamLead())) {
            throw new ResourceNotFoundException("Team lead user not found with id: " + request.getTeamLead());
        }

        if (request.getMemberIds() != null) {
            for (String memberId : request.getMemberIds()) {
                if (!userRepository.existsById(memberId)) {
                    throw new ResourceNotFoundException("Member user not found with id: " + memberId);
                }
            }
        }

        Project project = projectMapper.toEntity(request);
        project.setProjectId(UUID.randomUUID());
        project.setCreatedAt(LocalDateTime.now());
        project.setUpdatedAt(LocalDateTime.now());

        if (project.getStatus() == null) {
            project.setStatus(ProjectStatus.PLANNED);
        }
        if (project.getPriority() == null) {
            project.setPriority(ProjectPriority.MEDIUM);
        }
        if (project.getMemberIds() == null) {
            project.setMemberIds(new ArrayList<>());
        }

        Project savedProject = projectRepository.save(project);
        log.info("Project created successfully with ID: {}", savedProject.getId());

        return projectMapper.toResponse(savedProject);
    }

    @Override
    public ProjectResponse getProjectById(String id) {
        log.info("Fetching project by ID: {}", id);
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ProjectNotFoundException("Project not found with id: " + id));
        return projectMapper.toResponse(project);
    }

    @Override
    public List<ProjectResponse> getAllProjects() {
        log.info("Fetching all projects");
        List<Project> projects = projectRepository.findAll();
        return projectMapper.toResponseList(projects);
    }

    @Override
    public List<ProjectResponse> getProjectsByOwner(String ownerId) {
        log.info("Fetching projects owned by user ID: {}", ownerId);
        List<Project> projects = projectRepository.findByOwnerId(ownerId);
        return projectMapper.toResponseList(projects);
    }

    @Override
    public List<ProjectResponse> getProjectsByStatus(ProjectStatus status) {
        log.info("Fetching projects with status: {}", status);
        List<Project> projects = projectRepository.findByStatus(status);
        return projectMapper.toResponseList(projects);
    }

    @Override
    public List<ProjectResponse> getProjectsByMember(String memberId) {
        log.info("Fetching projects containing member ID: {}", memberId);
        List<Project> projects = projectRepository.findByMemberIdsContaining(memberId);
        return projectMapper.toResponseList(projects);
    }

    @Override
    public List<ProjectResponse> getProjectsByTeamLead(String teamLead) {
        log.info("Fetching projects led by team lead ID: {}", teamLead);
        List<Project> projects = projectRepository.findByTeamLead(teamLead);
        return projectMapper.toResponseList(projects);
    }

    @Override
    public ProjectResponse updateProject(String id, UpdateProjectRequest request) {
        log.info("Updating project with ID: {}", id);
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ProjectNotFoundException("Project not found with id: " + id));

        if (request.getName() != null && !request.getName().equals(project.getName())
                && projectRepository.existsByName(request.getName())) {
            throw new ProjectAlreadyExistsException("Project with name '" + request.getName() + "' already exists");
        }

        if (request.getOwnerId() != null && !userRepository.existsById(request.getOwnerId())) {
            throw new ResourceNotFoundException("Owner user not found with id: " + request.getOwnerId());
        }

        if (request.getTeamLead() != null && !userRepository.existsById(request.getTeamLead())) {
            throw new ResourceNotFoundException("Team lead user not found with id: " + request.getTeamLead());
        }

        if (request.getMemberIds() != null) {
            for (String memberId : request.getMemberIds()) {
                if (!userRepository.existsById(memberId)) {
                    throw new ResourceNotFoundException("Member user not found with id: " + memberId);
                }
            }
        }

        projectMapper.updateEntityFromRequest(request, project);
        project.setUpdatedAt(LocalDateTime.now());

        Project updatedProject = projectRepository.save(project);
        log.info("Project updated successfully with ID: {}", updatedProject.getId());

        return projectMapper.toResponse(updatedProject);
    }

    @Override
    public void deleteProject(String id) {
        log.info("Deleting project with ID: {}", id);
        if (!projectRepository.existsById(id)) {
            throw new ProjectNotFoundException("Project not found with id: " + id);
        }
        projectRepository.deleteById(id);
        log.info("Project deleted successfully with ID: {}", id);
    }

    @Override
    public ProjectResponse addMemberToProject(String projectId, String memberId) {
        log.info("Adding member ID {} to project ID {}", memberId, projectId);
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ProjectNotFoundException("Project not found with id: " + projectId));

        if (!userRepository.existsById(memberId)) {
            throw new ResourceNotFoundException("User not found with id: " + memberId);
        }

        if (project.getMemberIds() == null) {
            project.setMemberIds(new ArrayList<>());
        }

        if (!project.getMemberIds().contains(memberId)) {
            project.getMemberIds().add(memberId);
            project.setUpdatedAt(LocalDateTime.now());
            project = projectRepository.save(project);
        }

        return projectMapper.toResponse(project);
    }

    @Override
    public ProjectResponse removeMemberFromProject(String projectId, String memberId) {
        log.info("Removing member ID {} from project ID {}", memberId, projectId);
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ProjectNotFoundException("Project not found with id: " + projectId));

        if (project.getMemberIds() != null && project.getMemberIds().contains(memberId)) {
            project.getMemberIds().remove(memberId);
            project.setUpdatedAt(LocalDateTime.now());
            project = projectRepository.save(project);
        }

        return projectMapper.toResponse(project);
    }
}