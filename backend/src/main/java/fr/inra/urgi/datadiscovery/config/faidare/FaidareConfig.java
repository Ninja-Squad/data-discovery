package fr.inra.urgi.datadiscovery.config.faidare;

import fr.inra.urgi.datadiscovery.config.AppProfile;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.web.reactive.function.client.WebClient;

/**
 * Spring configuration specific to the faidare app
 * @author JB Nizet
 */
@Configuration
@Profile(AppProfile.FAIDARE)
@EnableConfigurationProperties(FaidareProperties.class)
public class FaidareConfig {

    @Bean
    @FaidareQualifier
    public WebClient faidareWebClient(FaidareProperties faidareProperties, WebClient.Builder builder) {
        return builder.baseUrl(faidareProperties.getBaseUrl()).build();
    }
}
