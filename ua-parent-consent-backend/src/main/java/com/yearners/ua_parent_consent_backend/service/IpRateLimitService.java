package com.yearners.ua_parent_consent_backend.service;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class IpRateLimitService {

    private static final int MAX_REQUESTS = 10;
    private static final int WINDOW_MINUTES = 15;

    private final ConcurrentHashMap<String, RequestRecord> requests =
            new ConcurrentHashMap<>();

    public boolean isAllowed(String ipAddress) {

        LocalDateTime now = LocalDateTime.now();

        RequestRecord record = requests.computeIfAbsent(
                ipAddress,
                key -> new RequestRecord()
        );

        synchronized (record) {

            // Reset the request window after 15 minutes
            if (record.getWindowStart().plusMinutes(WINDOW_MINUTES)
                    .isBefore(now)) {

                record.setWindowStart(now);
                record.setRequestCount(0);
            }

            // Reject requests after reaching the limit
            if (record.getRequestCount() >= MAX_REQUESTS) {
                return false;
            }

            record.setRequestCount(
                    record.getRequestCount() + 1
            );

            return true;
        }
    }

    private static class RequestRecord {

        private LocalDateTime windowStart = LocalDateTime.now();
        private int requestCount = 0;

        public LocalDateTime getWindowStart() {
            return windowStart;
        }

        public void setWindowStart(LocalDateTime windowStart) {
            this.windowStart = windowStart;
        }

        public int getRequestCount() {
            return requestCount;
        }

        public void setRequestCount(int requestCount) {
            this.requestCount = requestCount;
        }
    }
}