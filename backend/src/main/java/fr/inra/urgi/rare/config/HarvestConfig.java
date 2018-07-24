package fr.inra.urgi.rare.config;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;

/**
 * Configuration of the harvesting process
 * @author JB Nizet
 */
@Configuration
public class HarvestConfig {

    @Harvest
    @Bean
    public ObjectMapper harvestObjectMapper(Jackson2ObjectMapperBuilder objectMapperBuilder) {
        // build an ObjectMapper using the same configuration as for Spring MVC
        ObjectMapper objectMapper = objectMapperBuilder.build();

        // and add the ACCEPT_SINGLE_VALUE_AS_ARRAY deserialization feature, because the JSON files often use a single
        // string for multi-valued properties
        objectMapper.enable(DeserializationFeature.ACCEPT_SINGLE_VALUE_AS_ARRAY);
        return objectMapper;
    }
}
