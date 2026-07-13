package com.aitinerary.ai;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Manages in-memory short-term conversation context for AI interactions.
 * Each session maintains an ordered list of messages (role + content) with
 * a configurable cap to prevent unbounded memory growth.
 */
@Service
@Slf4j
public class ConversationMemory {

    private static final int MAX_MESSAGES_PER_SESSION = 20;

    private final ConcurrentHashMap<String, List<Map<String, String>>> sessions = new ConcurrentHashMap<>();

    /**
     * Add a message to a session's conversation history.
     * If the session exceeds the maximum message count, the oldest messages are removed.
     *
     * @param sessionId the session identifier
     * @param role      the message role (e.g., "user", "assistant", "system")
     * @param content   the message content
     */
    public void addMessage(String sessionId, String role, String content) {
        sessions.computeIfAbsent(sessionId, k -> Collections.synchronizedList(new ArrayList<>()));

        List<Map<String, String>> history = sessions.get(sessionId);

        Map<String, String> message = new LinkedHashMap<>();
        message.put("role", role);
        message.put("content", content);

        synchronized (history) {
            history.add(message);

            // Enforce message cap by removing oldest messages
            while (history.size() > MAX_MESSAGES_PER_SESSION) {
                history.remove(0);
                log.debug("Session {}: removed oldest message to stay within {} message limit",
                        sessionId, MAX_MESSAGES_PER_SESSION);
            }
        }

        log.debug("Session {}: added {} message, total messages: {}", sessionId, role, history.size());
    }

    /**
     * Get the full conversation history for a session.
     *
     * @param sessionId the session identifier
     * @return unmodifiable list of messages, or empty list if session doesn't exist
     */
    public List<Map<String, String>> getHistory(String sessionId) {
        List<Map<String, String>> history = sessions.get(sessionId);
        if (history == null) {
            return Collections.emptyList();
        }
        synchronized (history) {
            return Collections.unmodifiableList(new ArrayList<>(history));
        }
    }

    /**
     * Clear all messages for a session.
     *
     * @param sessionId the session identifier
     */
    public void clearSession(String sessionId) {
        sessions.remove(sessionId);
        log.debug("Session {}: cleared", sessionId);
    }

    /**
     * Build a context window containing the last N messages from a session.
     *
     * @param sessionId   the session identifier
     * @param maxMessages the maximum number of recent messages to include
     * @return list of the most recent messages, up to maxMessages
     */
    public List<Map<String, String>> buildContextWindow(String sessionId, int maxMessages) {
        List<Map<String, String>> history = sessions.get(sessionId);
        if (history == null || history.isEmpty()) {
            return Collections.emptyList();
        }

        synchronized (history) {
            int fromIndex = Math.max(0, history.size() - maxMessages);
            return Collections.unmodifiableList(new ArrayList<>(history.subList(fromIndex, history.size())));
        }
    }

    /**
     * Get a brief text summary of the conversation so far.
     * Returns the content of the first message and the total message count.
     *
     * @param sessionId the session identifier
     * @return summary string describing the conversation
     */
    public String getSummary(String sessionId) {
        List<Map<String, String>> history = sessions.get(sessionId);
        if (history == null || history.isEmpty()) {
            return "No conversation history for session " + sessionId;
        }

        synchronized (history) {
            String firstContent = history.get(0).getOrDefault("content", "(empty)");
            String preview = firstContent.length() > 100
                    ? firstContent.substring(0, 100) + "..."
                    : firstContent;

            return String.format("Conversation with %d messages. Started with: \"%s\"",
                    history.size(), preview);
        }
    }
}
