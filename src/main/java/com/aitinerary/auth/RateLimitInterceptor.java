package com.aitinerary.auth;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Simple in-memory rate limiter for Production Hardening.
 * Limits users/IPs to 100 requests per minute.
 */
@Component
@Slf4j
public class RateLimitInterceptor implements HandlerInterceptor {

    private static final int MAX_REQUESTS_PER_MINUTE = 100;
    
    // Key: IP or UserID, Value: [Minute_Epoch, Request_Count]
    private final Map<String, TokenBucket> buckets = new ConcurrentHashMap<>();

    private static class TokenBucket {
        long minuteEpoch;
        AtomicInteger count;

        TokenBucket(long minuteEpoch) {
            this.minuteEpoch = minuteEpoch;
            this.count = new AtomicInteger(1);
        }
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String clientIp = request.getRemoteAddr();
        String userPrincipal = request.getUserPrincipal() != null ? request.getUserPrincipal().getName() : null;
        
        String key = userPrincipal != null ? "USER:" + userPrincipal : "IP:" + clientIp;
        long currentMinute = Instant.now().getEpochSecond() / 60;

        TokenBucket bucket = buckets.compute(key, (k, v) -> {
            if (v == null || v.minuteEpoch != currentMinute) {
                return new TokenBucket(currentMinute);
            }
            v.count.incrementAndGet();
            return v;
        });

        if (bucket.count.get() > MAX_REQUESTS_PER_MINUTE) {
            log.warn("Rate limit exceeded for key: {}", key);
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.getWriter().write("{\"error\": \"Too Many Requests\", \"message\": \"Rate limit exceeded. Try again later.\"}");
            response.setContentType("application/json");
            return false;
        }

        return true;
    }
}
