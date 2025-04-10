package fr.inra.urgi.datadiscovery.config;

import fr.inra.urgi.datadiscovery.dao.DocumentDao;
import org.apache.http.HttpHost;
import org.apache.http.impl.nio.reactor.IOReactorConfig;
import org.elasticsearch.client.NodeSelector;
import org.elasticsearch.client.RestClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.support.GenericConversionService;
import org.springframework.data.elasticsearch.core.convert.ElasticsearchConverter;
import org.springframework.data.elasticsearch.core.convert.ElasticsearchCustomConversions;
import org.springframework.data.elasticsearch.core.convert.MappingElasticsearchConverter;
import org.springframework.data.elasticsearch.core.mapping.ElasticsearchPersistentEntity;
import org.springframework.data.elasticsearch.core.mapping.ElasticsearchPersistentProperty;
import org.springframework.data.elasticsearch.core.mapping.SimpleElasticsearchMappingContext;
import org.springframework.data.elasticsearch.repository.config.EnableElasticsearchRepositories;
import org.springframework.data.mapping.context.MappingContext;

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

    /**
     * Custom bean registration which overrides the default one
     * (in org.springframework.boot.autoconfigure.data.elasticsearch.ElasticsearchDataConfiguration.BaseConfiguration#elasticsearchConverter(org.springframework.data.elasticsearch.core.mapping.SimpleElasticsearchMappingContext, org.springframework.data.elasticsearch.core.convert.ElasticsearchCustomConversions))
     * by a {@link DataDiscoveryMappingElasticsearchConverter} in order to fix a bug with sorting.
     */
    @Bean
    public ElasticsearchConverter elasticsearchConverter(
        SimpleElasticsearchMappingContext mappingContext,
        ElasticsearchCustomConversions elasticsearchCustomConversions
    ) {
        MappingElasticsearchConverter converter = new DataDiscoveryMappingElasticsearchConverter(mappingContext);
        converter.setConversions(elasticsearchCustomConversions);
        return converter;
    }

    /**
     * Custom implementation of MappingElasticsearchConverter which does NOT convert field names used (at least)
     * when sorting. With the base implementation, a field such as <code>countryOfOrigin.keyword</code> in a Sort
     * is silently replaced by <code>countryOfOrigin</code>, making the request invalid.
     * This custom implementation leaves the properties as they are.
     * @author JB Nizet
     */
    static class DataDiscoveryMappingElasticsearchConverter extends MappingElasticsearchConverter {
        public DataDiscoveryMappingElasticsearchConverter(MappingContext<? extends ElasticsearchPersistentEntity<?>, ElasticsearchPersistentProperty> mappingContext) {
            super(mappingContext);
        }

        public DataDiscoveryMappingElasticsearchConverter(MappingContext<? extends ElasticsearchPersistentEntity<?>, ElasticsearchPersistentProperty> mappingContext, GenericConversionService conversionService) {
            super(mappingContext, conversionService);
        }

        @Override
        public String updateFieldNames(String propertyPath, ElasticsearchPersistentEntity<?> persistentEntity) {
            return propertyPath;
        }
    }
}

