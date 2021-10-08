package fr.inra.urgi.datadiscovery.filter.faidare;

import fr.inra.urgi.datadiscovery.config.AppProfile;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

/**
 * Configuration class registering the Faidare authentication filter
 * @author JB Nizet
 */
@Configuration
@Profile(AppProfile.FAIDARE)
@EnableConfigurationProperties(FaidareUserGroupsProperties.class)
public class FaidareFilterConfig {
    @Bean
    public FilterRegistrationBean<FaidareAuthenticationFilter> authenticationFilterRegistrationBean(
        FaidareUserManager userManager, FaidareCurrentUser currentUser) {
        return new FilterRegistrationBean<>(new FaidareAuthenticationFilter(userManager, currentUser));
    }
}
