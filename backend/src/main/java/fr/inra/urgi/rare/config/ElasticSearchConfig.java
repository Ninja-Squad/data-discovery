package fr.inra.urgi.rare.config;

import java.net.InetAddress;
import java.net.UnknownHostException;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.elasticsearch.client.Client;
import org.elasticsearch.client.transport.TransportClient;
import org.elasticsearch.common.settings.Settings;
import org.elasticsearch.common.transport.TransportAddress;
import org.elasticsearch.transport.client.PreBuiltTransportClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.elasticsearch.core.ElasticsearchTemplate;
import org.springframework.data.elasticsearch.core.EntityMapper;
import org.springframework.data.elasticsearch.repository.config.EnableElasticsearchRepositories;

@Configuration
@EnableElasticsearchRepositories(basePackages = "fr.inra.urgi.rare.dao")
public class ElasticSearchConfig {

    @Value("${spring.data.elasticsearch.cluster.name}")
    private String esClusterName;

    @Value("${spring.data.elasticsearch.host}")
    private String esHost;

    @Value("${spring.data.elasticsearch.port}")
    private Integer esPort;

    @Bean
    public RareProperties rareProperties() {
        return new RareProperties();
    }

    /**
     * Creates a custom entity mapper for ES with the Jackson {@link ObjectMapper}
     * This avoids to annotate every parameter of the constructor of our documents with JsonProperty
     *
     * @param objectMapper - the Jackson {@link ObjectMapper}
     */
    @Bean
    public EntityMapper customElasticSearchEntityMapper(ObjectMapper objectMapper) {
        return new CustomElasticSearchEntityMapper(objectMapper);
    }

    /**
     * Creates an Elasticsearch instance using the configuration provided.
     * It relies on {@link TransportClient }.
     * In the future it might be interesting to switch to HighLevelRestClient
     * when Spring Data Elasticsearch supports it (see https://github.com/spring-projects/spring-data-elasticsearch/pull/216)
     */
    @Bean
    public Client client() throws UnknownHostException {
        Settings settings = Settings.builder()
                .put("cluster.name", esClusterName)
                .build();
        // if we are on CI, we use a hardcoded host, else we use the injected value
        String host = System.getenv("CI") != null ? "elasticsearch" : esHost;
        return new PreBuiltTransportClient(settings)
                .addTransportAddress(new TransportAddress(InetAddress.getByName(host), esPort));
    }

    @Bean
    public ElasticsearchTemplate elasticsearchTemplate(Client client, EntityMapper customElasticSearchEntityMapper) {
        return new ElasticsearchTemplate(client, customElasticSearchEntityMapper);
    }
}

