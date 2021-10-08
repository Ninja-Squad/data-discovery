package fr.inra.urgi.datadiscovery.config;

import org.springframework.boot.actuate.autoconfigure.security.servlet.EndpointRequest;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;

/**
 * Security configuration. It makes sure that harvest endpoints and the actuator endpoints are only accessible to
 * authenticated users
 *
 * @author JB Nizet
 */
@Configuration
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        // the configuration only applies to requests to actuator endpoints
        http.requestMatchers(
                requestMatchers ->
                    requestMatchers.requestMatchers(EndpointRequest.toAnyEndpoint())
                // EndpointRequest.toAnyEndpoint() only targets the **actuator** endpoints.
            )
            // it requires to be authenticated whatever the request is
            .authorizeRequests().anyRequest().authenticated()
            .and()
            // using http basic auth
            .httpBasic()
            .and()
            // without csrf or session management
            .csrf().disable()
            .sessionManagement()
            .sessionCreationPolicy(SessionCreationPolicy.STATELESS);
    }
}
