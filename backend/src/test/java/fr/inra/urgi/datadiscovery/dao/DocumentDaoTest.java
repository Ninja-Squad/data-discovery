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

}
