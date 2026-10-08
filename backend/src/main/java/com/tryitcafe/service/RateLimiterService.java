package com.tryitcafe.service;

import com.tryitcafe.exception.RateLimitExceededException;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimiterService {

    private static final Logger log = LoggerFactory.getLogger(RateLimiterService.class);

    private static final int MAX_TRACKED_ENTRIES = 5000;

    // Login Limits: 5 attempts per 60 seconds
    private static final int LOGIN_CAPACITY = 5;
    private static final long LOGIN_REFILL_WINDOW_MILLIS = 60_000L;

    // Review Limits: 3 submissions per 3600 seconds (1 hour)
    private static final int REVIEW_CAPACITY = 3;
    private static final long REVIEW_REFILL_WINDOW_MILLIS = 3_600_000L;

    private static class TokenBucket {
        private final int capacity;
        private final long windowMillis;
        private double tokens;
        private long lastRefillTimestamp;

        TokenBucket(int capacity, long windowMillis) {
            this.capacity = capacity;
            this.windowMillis = windowMillis;
            this.tokens = capacity;
            this.lastRefillTimestamp = System.currentTimeMillis();
        }

        synchronized boolean tryConsume() {
            refill();
            if (tokens >= 1.0) {
                tokens -= 1.0;
                return true;
            }
            return false;
        }

        private void refill() {
            long now = System.currentTimeMillis();
            long elapsed = now - lastRefillTimestamp;
            if (elapsed > 0) {
                double tokensToAdd = ((double) elapsed / windowMillis) * capacity;
                tokens = Math.min(capacity, tokens + tokensToAdd);
                lastRefillTimestamp = now;
            }
        }

        synchronized boolean isStale() {
            return (System.currentTimeMillis() - lastRefillTimestamp) > (windowMillis * 2);
        }
    }

    private final Map<String, TokenBucket> loginBuckets = new ConcurrentHashMap<>();
    private final Map<String, TokenBucket> reviewBuckets = new ConcurrentHashMap<>();

    public void checkLoginRateLimit(HttpServletRequest request, String identifier) {
        String clientIp = getClientIp(request);
        String key = "login:" + clientIp + ":" + (identifier != null ? identifier.trim() : "anon");

        evictIfMapTooLarge(loginBuckets);
        TokenBucket bucket = loginBuckets.computeIfAbsent(key, k -> new TokenBucket(LOGIN_CAPACITY, LOGIN_REFILL_WINDOW_MILLIS));

        if (!bucket.tryConsume()) {
            log.warn("Security Alert: Rate limit exceeded for login attempts from IP: {} identifier: {}", clientIp, identifier);
            throw new RateLimitExceededException("Too many login attempts. Please wait 60 seconds before trying again.", 60);
        }
    }

    public void checkReviewRateLimit(String customerId) {
        String key = "review:" + (customerId != null ? customerId.trim() : "anon");

        evictIfMapTooLarge(reviewBuckets);
        TokenBucket bucket = reviewBuckets.computeIfAbsent(key, k -> new TokenBucket(REVIEW_CAPACITY, REVIEW_REFILL_WINDOW_MILLIS));

        if (!bucket.tryConsume()) {
            log.warn("Security Alert: Rate limit exceeded for customer review submission: {}", customerId);
            throw new RateLimitExceededException("Review submission limit reached (maximum 3 reviews per hour). Please try again later.", 3600);
        }
    }

    public static String getClientIp(HttpServletRequest request) {
        if (request == null) return "unknown";
        String remote = request.getRemoteAddr();
        return (remote != null && !remote.isBlank()) ? remote.trim() : "unknown";
    }

    private void evictIfMapTooLarge(Map<String, TokenBucket> map) {
        if (map.size() > MAX_TRACKED_ENTRIES) {
            map.entrySet().removeIf(entry -> entry.getValue().isStale());
        }
    }

    public void resetForTesting() {
        loginBuckets.clear();
        reviewBuckets.clear();
    }
}
