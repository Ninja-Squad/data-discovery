package fr.inra.urgi.datadiscovery.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ElasticSearchConfig {

    @Bean
    public DataDiscoveryProperties dataDiscoveryProperties() {
        return new DataDiscoveryProperties();
    }

}

