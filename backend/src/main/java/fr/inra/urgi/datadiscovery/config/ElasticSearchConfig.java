package fr.inra.urgi.datadiscovery.config;

import fr.inra.urgi.datadiscovery.dao.DocumentDao;
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

    @Bean
    public DataDiscoveryProperties dataDiscoveryProperties() {
        return new DataDiscoveryProperties();
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
     *
     * FIXME: remove this workaround as soon as the fix in spring-data-elasticsearch has been released
     * See https://github.com/spring-projects/spring-data-elasticsearch/issues/3087, https://github.com/spring-projects/spring-data-elasticsearch/issues/3081
     *
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

