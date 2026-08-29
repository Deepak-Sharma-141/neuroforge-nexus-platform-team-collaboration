package com.neuroforge.neuroforge.nexus.controllers;

import com.neuroforge.neuroforge.nexus.dto.response.SignupResponse;
import com.neuroforge.neuroforge.nexus.service.UserService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserController {

    UserService userService;

    @GetMapping()
    public ResponseEntity<List<SignupResponse>> getAllUsers(){
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SignupResponse> getUserById(@PathVariable String id){
        return ResponseEntity.status(HttpStatus.OK).body(userService.getUserById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removeUser(@PathVariable String id){
        userService.removeUser(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("by role")
    public ResponseEntity<List<SignupResponse>> getUserByRole(@RequestParam(required = false) String role){
        return ResponseEntity.status(HttpStatus.OK).body(userService.getUserByRole(role));
    }
}
