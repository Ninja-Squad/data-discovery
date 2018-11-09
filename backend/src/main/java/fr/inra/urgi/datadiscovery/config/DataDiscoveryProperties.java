package fr.inra.urgi.datadiscovery.config;

import java.nio.file.Path;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Properties class holding the data-discovery-specific properties of the application (typically stored in application.yml)
 *
 * @author JB Nizet
 */
@ConfigurationProperties(prefix = "data-discovery")
public class DataDiscoveryProperties {

    /**
     * The directory where the JSON files that are harvested are located.
     */
    private Path resourceDir;

    /**
     * The ES prefix used to store the resources.
     * Allows for a different index and type name between dev and tests ('resource' and 'test-resource' for example).
     * Used in the {@link org.springframework.data.elasticsearch.annotations.Document} annotation
     * on our domain entities.
     */
    private String elasticsearchPrefix;

    public Path getResourceDir() {
        return resourceDir;
    }

    public void setResourceDir(Path resourceDir) {
        this.resourceDir = resourceDir;
    }

    public String getElasticsearchPrefix() {
        return elasticsearchPrefix;
    }

    public void setElasticsearchPrefix(String elasticsearchPrefix) {
        this.elasticsearchPrefix = elasticsearchPrefix;
    }

    @Override
    public String toString() {
        return "DataDiscoveryProperties{" +
                "resourceDir=" + resourceDir +
                ", elasticsearchPrefix='" + elasticsearchPrefix + '\'' +
                '}';
    }
}
