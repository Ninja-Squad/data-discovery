package fr.inra.urgi.datadiscovery.config;

import fr.inra.urgi.datadiscovery.dao.DocumentDao;
import org.apache.http.HttpHost;
import org.apache.http.impl.nio.reactor.IOReactorConfig;
import org.elasticsearch.client.NodeSelector;
import org.elasticsearch.client.RestClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.elasticsearch.repository.config.EnableElasticsearchRepositories;

@Configuration
@EnableElasticsearchRepositories(basePackageClasses = DocumentDao.class)
public class ElasticSearchConfig {

    @Value("${spring.data.elasticsearch.host}")
    private String esHost;

    @Value("${spring.data.elasticsearch.port}")
    private Integer esPort;

    @Bean
    public DataDiscoveryProperties dataDiscoveryProperties() {
        return new DataDiscoveryProperties();
    }

    /**
     * Creates an Elasticsearch Rest client using the configuration provided.
     */
    @Bean
    public RestClient restClient() {
        String host = System.getenv("CI") != null ? "elasticsearch" : esHost;
        return RestClient.builder(new HttpHost(host, esPort, HttpHost.DEFAULT_SCHEME_NAME))
                         .setRequestConfigCallback(requestConfigBuilder ->
                                                       requestConfigBuilder.setConnectTimeout(5000)
                                                                           .setSocketTimeout(60000))
                         .setNodeSelector(NodeSelector.SKIP_DEDICATED_MASTERS)
                         .setHttpClientConfigCallback(httpClientBuilder -> httpClientBuilder
                             .setDefaultIOReactorConfig(
                                 IOReactorConfig.custom()
                                                .setIoThreadCount(2)
                                                .setSoTimeout(60000)
                                                .setConnectTimeout(5000)
                                                .build()))
                         .build();
    }
}

