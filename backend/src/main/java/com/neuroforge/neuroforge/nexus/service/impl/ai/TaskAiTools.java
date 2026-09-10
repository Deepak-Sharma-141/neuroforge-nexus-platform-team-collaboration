package com.neuroforge.neuroforge.nexus.service.impl.ai;

import com.neuroforge.neuroforge.nexus.entities.Task;
import com.neuroforge.neuroforge.nexus.entities.User;
import com.neuroforge.neuroforge.nexus.repository.TaskRepository;
import com.neuroforge.neuroforge.nexus.repository.UserRepository;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class TaskAiTools {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    public TaskAiTools(
            TaskRepository taskRepository,
            UserRepository userRepository
    ) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
    }

    @Tool(
            name = "getMyTasks",
            description = """
            Get the tasks assigned to the currently authenticated user.
            Use this when the user asks:
            - What are my tasks?
            - What tasks are assigned to me?
            - Show my tasks
            - What work do I have?
            - What tasks are pending?
            """
    )
    public List<TaskSummary> getMyTasks() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return List.of();
        }

        String email = auth.getName();

        User user = userRepository
                .findByEmail(email)
                .orElse(null);

        if (user == null) {
            return List.of();
        }
        return taskRepository
                .findByAssigneeId(user.getId())
                .stream()
                .map(this::toSummary)
                .toList();
    }

    private TaskSummary toSummary(Task task) {

        return new TaskSummary(
                task.getTaskId().toString(),
                task.getProjectId(),
                task.getTitle(),
                task.getDescription(),
                task.getStatus().name()
        );
    }

    public record TaskSummary(
            String taskId,
            String projectId,
            String title,
            String description,
            String status
    ) {}
}