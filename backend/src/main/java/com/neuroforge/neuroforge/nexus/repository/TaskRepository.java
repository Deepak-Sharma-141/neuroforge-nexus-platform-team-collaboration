package com.neuroforge.neuroforge.nexus.repository;

import com.neuroforge.neuroforge.nexus.entities.Task;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends MongoRepository<Task, String> {

    List<Task> findByProjectId(String projectId);

    List<Task> findByAssigneeId(String assigneeId);

    List<Task> findByProjectIdAndAssigneeId(String projectId, String assigneeId);
}