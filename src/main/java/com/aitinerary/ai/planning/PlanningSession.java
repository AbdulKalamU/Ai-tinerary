package com.aitinerary.ai.planning;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlanningSession {
    private String sessionId;
    
    @Builder.Default
    private TravelerProfile profile = new TravelerProfile();
    
    @Builder.Default
    private List<ChatMessage> conversationHistory = new ArrayList<>();
    
    public static class ChatMessage {
        private String role; // "user" or "assistant"
        private String content;

        public ChatMessage() {}
        public ChatMessage(String role, String content) {
            this.role = role;
            this.content = content;
        }

        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
        
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
    }
    
    public void addMessage(String role, String content) {
        this.conversationHistory.add(new ChatMessage(role, content));
    }
}
