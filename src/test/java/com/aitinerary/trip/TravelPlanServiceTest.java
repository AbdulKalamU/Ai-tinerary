package com.aitinerary.trip;

import com.aitinerary.auth.UserPrincipal;
import com.aitinerary.user.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class TravelPlanServiceTest {

    @Mock
    private TravelPlanRepository travelPlanRepository;

    @InjectMocks
    private TravelPlanService travelPlanService;

    private UserPrincipal mockUserPrincipal;
    private TravelPlan mockTravelPlan;

    @BeforeEach
    void setUp() {
        mockUserPrincipal = new UserPrincipal(1L, "test@test.com", "password", "Test User", List.of());
        
        User user = new User();
        user.setId(1L);

        mockTravelPlan = TravelPlan.builder()
                .id(100L)
                .destination("Tokyo")
                .user(user)
                .itineraryDays(List.of())
                .build();
    }

    @Test
    void testGetTravelPlanById_Success() {
        // Arrange
        when(travelPlanRepository.findByIdAndUserId(100L, 1L))
                .thenReturn(Optional.of(mockTravelPlan));

        // Act
        TravelPlanResponse response = travelPlanService.getTravelPlanById(100L, mockUserPrincipal);

        // Assert
        assertNotNull(response);
        assertEquals("Tokyo", response.getDestination());
        assertEquals(100L, response.getId());
        verify(travelPlanRepository).findByIdAndUserId(100L, 1L);
    }

    @Test
    void testGetTravelPlanById_NotFound() {
        // Arrange
        when(travelPlanRepository.findByIdAndUserId(999L, 1L))
                .thenReturn(Optional.empty());

        // Act & Assert
        Exception exception = assertThrows(RuntimeException.class, () -> {
            travelPlanService.getTravelPlanById(999L, mockUserPrincipal);
        });
        
        assertEquals("Travel plan not found", exception.getMessage());
    }
}
