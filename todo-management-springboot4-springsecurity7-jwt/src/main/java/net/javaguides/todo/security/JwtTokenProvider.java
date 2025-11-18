package net.javaguides.todo.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SecurityException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.Base64;

@Component
public class JwtTokenProvider {

    private final Logger logger = LoggerFactory.getLogger(JwtTokenProvider.class);

    @Value("${app.jwt-secret}")
    private String jwtSecret; // can be base64-encoded or plain text (see note below)

    @Value("${app.jwt-expiration-milliseconds}")
    private long jwtExpirationMilliseconds;

    // Generate token
    public String generateToken(Authentication authentication) {
        String username = authentication.getName();
        Date now = new Date();
        Date expiry = new Date(now.getTime() + jwtExpirationMilliseconds);

        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(key()) // Keys.hmacShaKeyFor(keyBytes)
                .compact();
    }

    // Build signing key. Expects jwtSecret to be a Base64 string.
    // If your secret is plain text, use jwtSecret.getBytes(StandardCharsets.UTF_8) instead.
    private Key key() {
        // If your secret is base64 encoded, decode; otherwise fallback to raw bytes
        byte[] keyBytes;
        try {
            keyBytes = Base64.getDecoder().decode(jwtSecret);
            // If decode produced something small or invalid, you may prefer raw bytes fallback:
            if (keyBytes.length == 0) {
                keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
            }
        } catch (IllegalArgumentException ex) {
            // Not a base64 string -> use raw bytes
            keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }

    // Get username (subject) from token
    public String getUsername(String token) {
        if (token == null || token.isBlank()) return null;
        try {
            Jws<Claims> claimsJws = Jwts.parser()
                    .setSigningKey(key())
                    .build()
                    .parseClaimsJws(token);

            return claimsJws.getBody().getSubject();
        } catch (ExpiredJwtException ex) {
            logger.info("Expired JWT token: {}", ex.getMessage());
        } catch (SecurityException | MalformedJwtException ex) {
            logger.warn("Invalid JWT signature/format: {}", ex.getMessage());
        } catch (Exception ex) {
            logger.error("Could not parse JWT token: {}", ex.getMessage(), ex);
        }
        return null;
    }

    // Validate token
    public boolean validateToken(String token) {
        if (token == null || token.isBlank()) return false;
        try {
            Jwts.parser()
                    .setSigningKey(key())
                    .build()
                    .parseClaimsJws(token); // will throw if invalid/expired
            return true;
        } catch (SecurityException | MalformedJwtException ex) {
            logger.warn("Invalid JWT signature/format: {}", ex.getMessage());
        } catch (ExpiredJwtException ex) {
            logger.info("Expired JWT token: {}", ex.getMessage());
        } catch (Exception ex) {
            logger.error("Unexpected exception during JWT validation: {}", ex.getMessage(), ex);
        }
        return false;
    }
}
