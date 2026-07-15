package com.aitinerary.ai;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class OrchestratorTest {

    @Mock
    private Agent mockAgent;

    @Mock
    private CostTracker costTracker;

    @Mock
    private ConversationMemory memory;

    @Mock
    private ContextBuilder contextBuilder;

    @Mock
    private AiSafetyLayer safetyLayer;

    private Orchestrator orchestrator;

    @BeforeEach
    void setUp() {
        lenient().when(mockAgent.getType()).thenReturn(AgentType.GENERAL_ASSISTANT);
        lenient().when(mockAgent.canHandle(anyString())).thenReturn(true);

        orchestrator = new Orchestrator(
                List.of(mockAgent),
                costTracker,
                memory,
                contextBuilder,
                safetyLayer
        );
    }

    @Test
    void testProcessRequest_Success() throws Exception {
        // Arrange
        String input = "Plan a trip to Paris";
        String expectedResponse = "Here is your Paris itinerary!";

        when(safetyLayer.sanitizeInput(input)).thenReturn(input);
        when(safetyLayer.containsProhibitedContent(input)).thenReturn(false);
        when(mockAgent.safeExecute(eq(input), any(Map.class))).thenReturn(expectedResponse);
        when(safetyLayer.validateOutput(expectedResponse)).thenReturn(true);

        // Act
        String actualResponse = orchestrator.processRequest(input, 1L, "session-123");

        // Assert
        assertEquals(expectedResponse, actualResponse);
        verify(memory).addMessage("session-123", "user", input);
        verify(memory).addMessage("session-123", "assistant", expectedResponse);
        verify(costTracker).recordUsage(
                eq(1L), anyString(), anyString(), anyInt(), anyInt(),
                eq(AgentType.GENERAL_ASSISTANT.name()), anyLong(), eq(true), isNull()
        );
    }

    @Test
    void testProcessRequest_ProhibitedContent() {
        // Arrange
        String input = "Bad content";
        when(safetyLayer.sanitizeInput(input)).thenReturn(input);
        when(safetyLayer.containsProhibitedContent(input)).thenReturn(true);

        // Act
        String actualResponse = orchestrator.processRequest(input, 1L, "session-123");

        // Assert
        assertEquals("I'm sorry, but I can't process that request. Please rephrase your travel-related question.", actualResponse);
        verify(mockAgent, never()).safeExecute(anyString(), any(Map.class));
        verifyNoInteractions(memory);
    }
}
