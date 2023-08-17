package fr.inra.urgi.datadiscovery.config;

import org.springframework.boot.actuate.autoconfigure.security.servlet.EndpointRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Security configuration. It makes sure that actuator endpoints are only accessible to
 * authenticated users
 *
 * @author JB Nizet
 */
@Configuration
public class SecurityConfig implements WebMvcConfigurer {

    @Bean
    public SecurityFilterChain httpSecurityFilterChain(HttpSecurity http) throws Exception {
        // the configuration only applies to requests to actuator endpoints
        return http.securityMatchers(
            customizer -> customizer.requestMatchers(EndpointRequest.toAnyEndpoint())
            // EndpointRequest.toAnyEndpoint() only targets the **actuator** endpoints.
           )
           // it requires to be authenticated whatever the request is
           .authorizeHttpRequests(customizer -> customizer.anyRequest().authenticated())
           // using http basic auth
           .httpBasic(Customizer.withDefaults())
           // without csrf or session management
           .csrf(configurer -> configurer.disable())
           .sessionManagement(configurer -> configurer.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
           .build();
    }
}
