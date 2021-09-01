package fr.inra.urgi.datadiscovery.dao.faidare;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import fr.inra.urgi.datadiscovery.dao.AbstractDocumentDaoImpl;
import fr.inra.urgi.datadiscovery.dao.PillarAggregationDescriptor;
import fr.inra.urgi.datadiscovery.domain.faidare.FaidareDocument;
import org.springframework.data.elasticsearch.core.ElasticsearchRestTemplate;

/**
 * Implementation of {@link FaidareDocumentDaoCustom}
 * @author JB Nizet
 */
public class FaidareDocumentDaoImpl extends AbstractDocumentDaoImpl<FaidareDocument> implements FaidareDocumentDaoCustom {

    /**
     * Contains the fields searchable on a {@link FaidareDocument}.
     * This is basically all fields at the exception of the ones containing a URL.
     */
    private static final Set<String> SEARCHABLE_FIELDS = Collections.unmodifiableSet(Stream.of(
        "name",
        "description",
        "description.synonyms",
        "entryType",
        "databaseName",
        "node",
        "species",
        "holdingInstitute",
        "biologicalStatus",
        "geneticNature",
        "countryOfOrigin",
        "taxonGroup",
        "observationVariableIds"
    ).collect(Collectors.toSet()));

    private static final PillarAggregationDescriptor PILLAR_AGGREGATION_DESCRIPTOR =
        new PillarAggregationDescriptor("node.keyword",
                                        "databaseName.keyword",
                                        null);

    public FaidareDocumentDaoImpl(ElasticsearchRestTemplate elasticsearchTemplate) {
        super(elasticsearchTemplate, new FaidareDocumentHighlighter());
    }

    @Override
    protected Class<FaidareDocument> getDocumentClass() {
        return FaidareDocument.class;
    }

    @Override
    protected Set<String> getSearchableFields() {
        return SEARCHABLE_FIELDS;
    }

    @Override
    protected List<FaidareAggregation> getAppAggregations() {
        return Arrays.asList(FaidareAggregation.values());
    }

    @Override
    protected List<FaidareAggregation> getMainAppAggregations() {
        return FaidareAggregation.MAIN_AGGREGATIONS;
    }

    @Override
    protected PillarAggregationDescriptor getPillarAggregationDescriptor() {
        return PILLAR_AGGREGATION_DESCRIPTOR;
    }
}
