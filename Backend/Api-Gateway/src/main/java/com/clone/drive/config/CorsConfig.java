package com.clone.drive.config;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpServletResponseWrapper;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Gateway-level CORS filter — runs at HIGHEST_PRECEDENCE.
 *
 * Two key things this does:
 * 1. Short-circuits OPTIONS preflight requests immediately (returns 200).
 * 2. For non-OPTIONS requests, wraps the response so that downstream
 *    microservices CANNOT add duplicate Access-Control-* headers.
 *    Only the Gateway's CORS headers will be present in the final response.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class CorsConfig implements Filter {

    private static final String ALLOWED_ORIGINS = "http://localhost:5173";
    private static final String ALLOWED_METHODS = "GET, POST, PUT, PATCH, DELETE, OPTIONS";
    private static final String ALLOWED_HEADERS = "Authorization, Content-Type, Accept, X-Requested-With, Origin";

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest request = (HttpServletRequest) req;
        HttpServletResponse response = (HttpServletResponse) res;

        // For preflight (OPTIONS) — respond immediately, don't forward downstream
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            setCorsHeaders(response);
            response.setStatus(HttpServletResponse.SC_OK);
            return;
        }

        // Set CORS headers on the REAL response FIRST
        setCorsHeaders(response);

        // Wrap response to BLOCK downstream services from adding duplicate CORS headers
        HttpServletResponseWrapper corsBlockingResponse = new HttpServletResponseWrapper(response) {
            @Override
            public void setHeader(String name, String value) {
                if (!name.startsWith("Access-Control-")) {
                    super.setHeader(name, value);
                }
                // silently drop any Access-Control-* headers from downstream
            }

            @Override
            public void addHeader(String name, String value) {
                if (!name.startsWith("Access-Control-")) {
                    super.addHeader(name, value);
                }
                // silently drop any Access-Control-* headers from downstream
            }
        };

        // Continue filter chain with the wrapped response
        chain.doFilter(req, corsBlockingResponse);
    }

    private void setCorsHeaders(HttpServletResponse response) {
        response.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGINS);
        response.setHeader("Access-Control-Allow-Methods", ALLOWED_METHODS);
        response.setHeader("Access-Control-Allow-Headers", ALLOWED_HEADERS);
        response.setHeader("Access-Control-Allow-Credentials", "true");
        response.setHeader("Access-Control-Max-Age", "3600");
    }
}
