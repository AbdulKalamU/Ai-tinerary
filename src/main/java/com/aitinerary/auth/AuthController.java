package com.aitinerary.auth;

import com.aitinerary.auth.AuthResponse;
import com.aitinerary.auth.LoginRequest;
import com.aitinerary.auth.RegisterRequest;
import com.aitinerary.auth.UserPrincipal;
import com.aitinerary.auth.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser(@AuthenticationPrincipal UserPrincipal currentUser) {
        Map<String, Object> result = new HashMap<>();
        result.put("id", currentUser.getId());
        result.put("username", currentUser.getUsername());
        result.put("email", currentUser.getEmail());
        
        return ResponseEntity.ok(result);
    }
}
