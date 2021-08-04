package fr.inra.urgi.datadiscovery.ontology;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.web.reactive.function.client.WebClient;

/**
 * Configuration class for ontology-related beans
 * @author JB Nizet
 */
@Configuration
@EnableConfigurationProperties(OntologyProperties.class)
@EnableScheduling
public class OntologyConfig {
    private final OntologyProperties ontologyProperties;

    public OntologyConfig(OntologyProperties ontologyProperties) {
        this.ontologyProperties = ontologyProperties;
    }

    @Bean
    @Ontology
    public WebClient ontologyWebClient(WebClient.Builder builder) {
        return builder
                .baseUrl(ontologyProperties.getBaseUrl())
                .build();
    }
}
