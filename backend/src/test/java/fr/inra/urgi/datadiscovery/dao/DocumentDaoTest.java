package fr.inra.urgi.datadiscovery.dao;

import co.elastic.clients.elasticsearch.indices.IndexSettings;
import fr.inra.urgi.datadiscovery.domain.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.elasticsearch.client.elc.ElasticsearchTemplate;
import org.springframework.data.elasticsearch.core.index.AliasAction;
import org.springframework.data.elasticsearch.core.index.AliasActionParameters;
import org.springframework.data.elasticsearch.core.index.AliasActions;
import org.springframework.data.elasticsearch.core.mapping.IndexCoordinates;

public abstract class DocumentDaoTest {

    @Autowired
    protected ElasticsearchTemplate elasticsearchTemplate;

    protected void deleteIndex(String physicalIndexName) {
        elasticsearchTemplate.indexOps(IndexCoordinates.of(physicalIndexName)).delete();
    }

    protected void createDocumentIndex(String physicalIndexName, String appProfile) {
        elasticsearchTemplate.execute(
            client -> {
                IndexSettings settings = DocumentIndexSettings.createSettings(appProfile);
                client.indices().create(builder -> builder.index(physicalIndexName).settings(settings));
                return null;
            }
        );
    }

    protected void createSuggestionIndex(String physicalIndexName) {
        elasticsearchTemplate.execute(
            client -> {
                IndexSettings settings = DocumentIndexSettings.createSuggestionsSettings();
                client.indices().create(builder -> builder.index(physicalIndexName).settings(settings));
                return null;
            }
        );
    }

    protected void createAlias(String physicalIndexName, Class<? extends Document> documentClass) {
        elasticsearchTemplate.indexOps(IndexCoordinates.of(physicalIndexName)).alias(
            new AliasActions().add(new AliasAction.Add(AliasActionParameters.builder().withAliases(
                elasticsearchTemplate.getIndexCoordinatesFor(documentClass).getIndexName()
            ).withIndices(physicalIndexName).build()))
        );
    }

    protected void putMapping(Class<? extends Document> documentClass) {
        elasticsearchTemplate.indexOps(documentClass).putMapping();
    }
}
