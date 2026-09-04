package com.neuroforge.neuroforge.nexus.repository;

import com.neuroforge.neuroforge.nexus.entities.Project;
import com.neuroforge.neuroforge.nexus.entities.enums.ProjectStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProjectRepository extends MongoRepository<Project, String> {

    boolean existsByName(String name);

    Optional<Project> findByProjectId(UUID projectId);

    List<Project> findByOwnerId(String ownerId);

    List<Project> findByStatus(ProjectStatus status);

    List<Project> findByMemberIdsContaining(String memberId);

    List<Project> findByTeamLead(String teamLead);

    @Query("{ '$or': [ { 'ownerId': ?0 }, { 'teamLead': ?0 }, { 'memberIds': ?0 } ] }")
    List<Project> findAllInvolvingUser(String userId);
}
