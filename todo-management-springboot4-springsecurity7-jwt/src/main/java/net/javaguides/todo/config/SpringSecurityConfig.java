package net.javaguides.todo.config;

import lombok.AllArgsConstructor;
import net.javaguides.todo.security.JwtAuthenticationEntryPoint;
import net.javaguides.todo.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableMethodSecurity
@AllArgsConstructor
public class SpringSecurityConfig {

    private UserDetailsService userDetailsService;

    private JwtAuthenticationEntryPoint authenticationEntryPoint;

    private JwtAuthenticationFilter authenticationFilter;

    @Bean
    public static PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session
                        .sessionCreationPolicy(org.springframework.security.config.http.SessionCreationPolicy.STATELESS))
                // exception handling
                .exceptionHandling(ex -> ex.authenticationEntryPoint(authenticationEntryPoint));

        http
                .authorizeHttpRequests(authorize -> {
                    // public endpoints (auth + preflight)
                    authorize.requestMatchers("/api/auth/**").permitAll();
                    authorize.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll();

                    // admin-only mutating endpoints
                    authorize.requestMatchers(HttpMethod.POST, "/api/todos").hasRole("ADMIN");
                    authorize.requestMatchers(HttpMethod.PUT, "/api/todos/**").hasRole("ADMIN");
                    authorize.requestMatchers(HttpMethod.DELETE, "/api/**").hasRole("ADMIN");

                    // read endpoints for users or admins (if desired)
                    authorize.requestMatchers(HttpMethod.GET, "/api/todos").hasAnyRole("ADMIN", "USER");
                    authorize.requestMatchers(HttpMethod.PATCH, "/api/**").hasAnyRole("ADMIN", "USER");

                    // fallback: authenticated for everything else
                    authorize.anyRequest().authenticated();
                });

        // Add JWT filter BEFORE UsernamePasswordAuthenticationFilter
        http.addFilterBefore(authenticationFilter, UsernamePasswordAuthenticationFilter.class);

        // Remove httpBasic for JWT-based API (optional: comment out if you need basic)
        // http.httpBasic(Customizer.withDefaults());

        return http.build();
    }


    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }


//    @Bean
//    public UserDetailsService userDetailsService(){
//
//        UserDetails ramesh = User.builder()
//                .username("ramesh")
//                .password(passwordEncoder().encode("password"))
//                .roles("USER")
//                .build();
//
//        UserDetails admin = User.builder()
//                .username("admin")
//                .password(passwordEncoder().encode("admin"))
//                .roles("ADMIN")
//                .build();
//
//        return new InMemoryUserDetailsManager(ramesh, admin);
//    }
}
