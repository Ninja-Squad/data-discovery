package fr.inra.urgi.datadiscovery.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import fr.inra.urgi.datadiscovery.dao.DocumentDao;
import org.apache.http.HttpHost;
import org.apache.http.impl.nio.reactor.IOReactorConfig;
import org.elasticsearch.client.NodeSelector;
import org.elasticsearch.client.RestClient;
import org.elasticsearch.client.RestHighLevelClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.elasticsearch.core.ElasticsearchRestTemplate;
import org.springframework.data.elasticsearch.core.EntityMapper;
import org.springframework.data.elasticsearch.repository.config.EnableElasticsearchRepositories;

import java.net.UnknownHostException;

@Configuration
@EnableElasticsearchRepositories(basePackageClasses = DocumentDao.class)
public class ElasticSearchConfig {

    @Value("${spring.data.elasticsearch.cluster.name}")
    private String esClusterName;

    @Value("${spring.data.elasticsearch.host}")
    private String esHost;

    @Value("${spring.data.elasticsearch.port}")
    private Integer esPort;

    @Bean
    public DataDiscoveryProperties dataDiscoveryProperties() {
        return new DataDiscoveryProperties();
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
     * It relies on {@link RestHighLevelClient}.
     */
    @Bean
    public RestHighLevelClient client() throws UnknownHostException {
        // if we are on CI, we use a hardcoded host, else we use the injected value
        String host = System.getenv("CI") != null ? "elasticsearch" : esHost;

        RestHighLevelClient client = new RestHighLevelClient(
                RestClient.builder(
                        new HttpHost(host, esPort, HttpHost.DEFAULT_SCHEME_NAME)
                ).setNodeSelector(NodeSelector.SKIP_DEDICATED_MASTERS)
                        .setHttpClientConfigCallback(httpClientBuilder -> httpClientBuilder.setDefaultIOReactorConfig(
                                IOReactorConfig.custom()
                                        .setIoThreadCount(2)
                                        .build()))
        );
        return client;
    }

    @Bean
    public ElasticsearchRestTemplate elasticsearchTemplate(RestHighLevelClient client, EntityMapper customElasticSearchEntityMapper) {
        return new ElasticsearchRestTemplate(client, customElasticSearchEntityMapper);
    }
}

