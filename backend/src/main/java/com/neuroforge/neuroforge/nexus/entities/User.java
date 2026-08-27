package com.neuroforge.neuroforge.nexus.entities;

import com.neuroforge.neuroforge.nexus.entities.enums.Role;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.UUID;

@Document(collection = "users")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class User {

    @Id
    String id;

    UUID userId;

    String name;

    String email;

    Role role;

    String team;

}
