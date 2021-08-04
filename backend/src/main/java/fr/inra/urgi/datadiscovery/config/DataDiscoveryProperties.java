package fr.inra.urgi.datadiscovery.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Properties class holding the data-discovery-specific properties of the application (typically stored in application.yml)
 *
 * @author JB Nizet
 */
@ConfigurationProperties(prefix = "data-discovery")
public class DataDiscoveryProperties {

    /**
     * The ES prefix used to store the resources.
     * Allows for a different index and type name between dev and tests ('resource' and 'test-resource' for example).
     * Used in the {@link org.springframework.data.elasticsearch.annotations.Document} annotation
     * on our domain entities.
     */
    private String elasticsearchPrefix;

    public String getElasticsearchPrefix() {
        return elasticsearchPrefix;
    }

    public void setElasticsearchPrefix(String elasticsearchPrefix) {
        this.elasticsearchPrefix = elasticsearchPrefix;
    }

    @Override
    public String toString() {
        return "DataDiscoveryProperties{" +
                "elasticsearchPrefix='" + elasticsearchPrefix + '\'' +
                '}';
    }
}
