package fr.inra.urgi.datadiscovery.dao;

import fr.inra.urgi.datadiscovery.config.AppProfile;
import fr.inra.urgi.datadiscovery.domain.Document;
import fr.inra.urgi.datadiscovery.domain.rare.RareDocument;
import org.elasticsearch.ElasticsearchStatusException;
import org.elasticsearch.action.ingest.PutPipelineRequest;
import org.elasticsearch.action.support.master.AcknowledgedResponse;
import org.elasticsearch.client.RequestOptions;
import org.elasticsearch.client.indices.CreateIndexRequest;
import org.elasticsearch.common.bytes.BytesArray;
import org.elasticsearch.common.settings.Settings;
import org.elasticsearch.common.xcontent.XContentType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.elasticsearch.core.ElasticsearchRestTemplate;
import org.springframework.data.elasticsearch.core.index.AliasAction;
import org.springframework.data.elasticsearch.core.index.AliasActionParameters;
import org.springframework.data.elasticsearch.core.index.AliasActions;
import org.springframework.data.elasticsearch.core.mapping.IndexCoordinates;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

public abstract class DocumentDaoTest {

    @Autowired
    protected ElasticsearchRestTemplate elasticsearchTemplate;

    protected void deleteIndex(String physicalIndexName) {
        elasticsearchTemplate.indexOps(IndexCoordinates.of(physicalIndexName)).delete();
    }

    protected void createDocumentIndex(String physicalIndexName, String appProfile) {
        elasticsearchTemplate.execute(
            client -> {
                Settings settings = DocumentIndexSettings.createSettings(appProfile);
                CreateIndexRequest createIndexRequest = new CreateIndexRequest(physicalIndexName).settings(settings);
                client.indices().create(createIndexRequest, RequestOptions.DEFAULT);
                return null;
            }
        );
    }

    protected void createSuggestionIndex(String physicalIndexName) {
        elasticsearchTemplate.execute(
            client -> {
                Settings settings = DocumentIndexSettings.createSuggestionsSettings();
                CreateIndexRequest createIndexRequest = new CreateIndexRequest(physicalIndexName).settings(settings);
                client.indices().create(createIndexRequest, RequestOptions.DEFAULT);
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
