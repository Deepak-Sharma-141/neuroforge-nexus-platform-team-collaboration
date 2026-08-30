package com.neuroforge.neuroforge.nexus.controllers;

import com.neuroforge.neuroforge.nexus.dto.request.SignupRequest;
import com.neuroforge.neuroforge.nexus.dto.response.SignupResponse;
import com.neuroforge.neuroforge.nexus.entities.enums.Role;
import com.neuroforge.neuroforge.nexus.service.AuthService;
import com.neuroforge.neuroforge.nexus.service.UserService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserController {

    UserService userService;
    AuthService authService;

    @GetMapping()
    @PreAuthorize("hasAuthority('USER_MANAGE')")
    public ResponseEntity<List<SignupResponse>> getAllUsers(){
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('USER_MANAGE') or #id == authentication.principal.userId.toString()")
    public ResponseEntity<SignupResponse> getUserById(@PathVariable String id){
        return ResponseEntity.status(HttpStatus.OK).body(userService.getUserById(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('USER_MANAGE')")
    public ResponseEntity<Void> removeUser(@PathVariable String id){
        userService.removeUser(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("by-role")
    @PreAuthorize("hasAuthority('USER_MANAGE')")
    public ResponseEntity<List<SignupResponse>> getUserByRole(@RequestParam(required = false) String role){
        return ResponseEntity.status(HttpStatus.OK).body(userService.getUserByRole(role));
    }

    // UserController.java — new endpoint
    @PostMapping("/admin/create")
    @PreAuthorize("hasAuthority('USER_MANAGE')")
    public ResponseEntity<SignupResponse> createUser(
            @RequestBody SignupRequest request,
            @RequestParam Role role) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.createUserWithRole(request, role));
    }

    @PatchMapping("/{id}/role")
    @PreAuthorize("hasAuthority('RBAC_MANAGE')")
    public ResponseEntity<SignupResponse> changeRole(
            @PathVariable String id,
            @RequestParam Role role) {
        return ResponseEntity.ok(userService.updateRole(id, role));
    }
}
