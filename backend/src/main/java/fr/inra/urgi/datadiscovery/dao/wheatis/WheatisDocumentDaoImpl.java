package fr.inra.urgi.datadiscovery.dao.wheatis;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import fr.inra.urgi.datadiscovery.dao.AbstractDocumentDaoImpl;
import fr.inra.urgi.datadiscovery.dao.AppAggregation;
import fr.inra.urgi.datadiscovery.dao.PillarAggregationDescriptor;
import fr.inra.urgi.datadiscovery.domain.wheatis.WheatisDocument;
import org.springframework.data.elasticsearch.core.ElasticsearchRestTemplate;

/**
 * Implementation of {@link WheatisDocumentDaoCustom}
 * @author JB Nizet
 */
public class WheatisDocumentDaoImpl extends AbstractDocumentDaoImpl<WheatisDocument> implements WheatisDocumentDaoCustom {

    /**
     * Contains the fields searchable on a {@link WheatisDocument}.
     * This is basically all fields at the exception of the ones containing a URL.
     */
    private static final Set<String> SEARCHABLE_FIELDS = Collections.unmodifiableSet(Stream.of(
        "name",
        "description",
        "description.synonyms",
        "entryType",
        "databaseName",
        "node",
        "species"
    ).collect(Collectors.toSet()));

    private static final PillarAggregationDescriptor PILLAR_AGGREGATION_DESCRIPTOR =
        new PillarAggregationDescriptor("node.keyword",
                                        "databaseName.keyword",
                                        null);

    public WheatisDocumentDaoImpl(ElasticsearchRestTemplate elasticsearchTemplate) {
        super(elasticsearchTemplate, new WheatisDocumentHighlighter());
    }

    @Override
    protected Class<WheatisDocument> getDocumentClass() {
        return WheatisDocument.class;
    }

    @Override
    protected Set<String> getSearchableFields() {
        return SEARCHABLE_FIELDS;
    }

    @Override
    protected List<AppAggregation> getAppAggregations() {
        return Arrays.asList(WheatisAggregation.values());
    }

    @Override
    protected PillarAggregationDescriptor getPillarAggregationDescriptor() {
        return PILLAR_AGGREGATION_DESCRIPTOR;
    }
}
