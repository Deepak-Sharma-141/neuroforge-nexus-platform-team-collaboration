package com.neuroforge.neuroforge.nexus.repository;

import com.neuroforge.neuroforge.nexus.entities.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends MongoRepository<User, String> {

    boolean existsByEmail(String email);

    List<User> findAllByRole(String role);

    Optional<User> findByEmail(String email);

    Optional<User> findUserByUserId(UUID userId);

    boolean existsByName(String memberId);
}
