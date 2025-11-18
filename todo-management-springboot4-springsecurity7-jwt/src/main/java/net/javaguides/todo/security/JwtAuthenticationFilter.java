package net.javaguides.todo.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final JwtTokenProvider jwtTokenProvider;
    private final UserDetailsService userDetailsService;

    public JwtAuthenticationFilter(JwtTokenProvider jwtTokenProvider,
                                   UserDetailsService userDetailsService) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        // DEBUG: log request info and Authorization header to help debug missing/malformed tokens
        String authorizationHeader = request.getHeader("Authorization");
        logger.debug("Request URI: {} Method: {} Authorization: '{}'",
                request.getRequestURI(), request.getMethod(), authorizationHeader);

        // 1) Allow preflight and auth endpoints through without authentication
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        String path = request.getRequestURI();
        if (path != null && path.startsWith("/api/auth/")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            // 2) Only attempt to parse when there is a Bearer token present
            String token = getTokenFromRequest(authorizationHeader);
            if (!StringUtils.hasText(token)) {
                logger.debug("No Bearer token found");
                filterChain.doFilter(request, response);
                return;
            }

            // 3) Validate token (jwtTokenProvider.validateToken should be defensive)
            if (!jwtTokenProvider.validateToken(token)) {
                logger.debug("JWT token failed validation");
                filterChain.doFilter(request, response);
                return;
            }

            // 4) If already authenticated, skip
            Authentication existingAuth = SecurityContextHolder.getContext().getAuthentication();
            if (existingAuth != null && existingAuth.isAuthenticated()) {
                filterChain.doFilter(request, response);
                return;
            }

            // 5) Extract username and set SecurityContext
            String username = jwtTokenProvider.getUsername(token);
            if (!StringUtils.hasText(username)) {
                logger.warn("JWT token did not contain a username/subject");
                filterChain.doFilter(request, response);
                return;
            }

            UserDetails userDetails = userDetailsService.loadUserByUsername(username);
            UsernamePasswordAuthenticationToken authenticationToken =
                    new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

            authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authenticationToken);

        } catch (io.jsonwebtoken.MalformedJwtException ex) {
            // token is malformed (e.g. empty string, "null", missing dots)
            logger.warn("Malformed JWT: {}", ex.getMessage());
        } catch (io.jsonwebtoken.ExpiredJwtException ex) {
            logger.info("Expired JWT: {}", ex.getMessage());
        } catch (Exception ex) {
            logger.error("Could not set user authentication in security context", ex);
        }

        // continue filter chain in all cases
        filterChain.doFilter(request, response);
    }

    private String getTokenFromRequest(String bearerToken) {
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            String t = bearerToken.substring(7).trim();
            return t.isEmpty() ? null : t;
        }
        return null;
    }
}
