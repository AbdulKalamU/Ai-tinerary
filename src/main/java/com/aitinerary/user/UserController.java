package com.aitinerary.user;

import com.aitinerary.auth.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me/preferences")
    public ResponseEntity<UserPreferences> getPreferences(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(userService.getPreferences(userPrincipal.getId()));
    }

    @PutMapping("/me/preferences")
    public ResponseEntity<UserPreferences> updatePreferences(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody UserPreferences preferences) {
        return ResponseEntity.ok(userService.updatePreferences(userPrincipal.getId(), preferences));
    }
}
