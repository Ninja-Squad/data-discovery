package fr.inra.urgi.datadiscovery.dao;

import org.elasticsearch.ElasticsearchStatusException;
import org.elasticsearch.action.ingest.PutPipelineRequest;
import org.elasticsearch.action.support.master.AcknowledgedResponse;
import org.elasticsearch.client.RequestOptions;
import org.elasticsearch.common.bytes.BytesArray;
import org.elasticsearch.common.xcontent.XContentType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.elasticsearch.core.ElasticsearchRestTemplate;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

public abstract class DocumentDaoTest {

    @Autowired
    protected ElasticsearchRestTemplate elasticsearchTemplate;

    protected void installDatadiscoveryDescriptionTokenizerPipeline() {
        String source =
                "{\"description\":\"[TEST] Convert a description field to make it usable by an auto-completion query\"," +
                        "\"processors\":[{\"datadiscovery_description_tokenizer\":{\"field\":\"description\",\"target_field\":\"suggestions\"}}]}";
        PutPipelineRequest request = new PutPipelineRequest(
                "datadiscovery-description-tokenizer-pipeline",
                new BytesArray(source.getBytes(StandardCharsets.UTF_8)),
                XContentType.JSON
        );
        try {
            AcknowledgedResponse response = elasticsearchTemplate.getClient().ingest().putPipeline(request, RequestOptions.DEFAULT);
            if (!response.isAcknowledged()) {
                throw new RuntimeException("Couldn't create 'datadiscovery-description-tokenizer-pipeline pipeline':\n\t " + request.getSource());
            }
        } catch (ElasticsearchStatusException | IOException e) {
            throw new RuntimeException("Couldn't create pipeline 'datadiscovery-description-tokenizer-pipeline'. \n\t\t" +
                    "Make sure you have correctly installed the 'ingest-datadiscovery-description-tokenizer' plugin" +
                    " in your Elasticsearch cluster. \n\t\tMore info: " +
                    "https://forgemia.inra.fr/urgi-is/es-plugins/blob/master/ingest-datadiscovery-description-tokenizer/README.md"
                    , e);
        }
    }
}
