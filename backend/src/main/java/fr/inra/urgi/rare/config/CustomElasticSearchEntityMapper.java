package fr.inra.urgi.rare.config;

import java.io.IOException;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.data.elasticsearch.core.EntityMapper;

/**
 * Re-implements the ElasticSearch entity mapper as the default one
 * doesn't allow to use the {@link ObjectMapper} we have in our Spring Boot application.
 * This avoids to annotate every parameter of the constructor of our documents with JsonProperty.
 * See https://github.com/spring-projects/spring-data-elasticsearch/wiki/Custom-ObjectMapper
 */
public class CustomElasticSearchEntityMapper implements EntityMapper {

    private ObjectMapper objectMapper;

    CustomElasticSearchEntityMapper(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public String mapToString(Object object) throws IOException {
        return objectMapper.writeValueAsString(object);
    }

    @Override
    public <T> T mapToObject(String source, Class<T> clazz) throws IOException {
        return objectMapper.readValue(source, clazz);
    }
}
