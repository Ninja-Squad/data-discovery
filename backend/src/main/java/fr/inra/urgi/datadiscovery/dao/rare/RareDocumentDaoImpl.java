package fr.inra.urgi.datadiscovery.dao.rare;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import fr.inra.urgi.datadiscovery.dao.AbstractDocumentDaoImpl;
import fr.inra.urgi.datadiscovery.dao.AppAggregation;
import fr.inra.urgi.datadiscovery.dao.PillarAggregationDescriptor;
import fr.inra.urgi.datadiscovery.domain.rare.RareDocument;
import fr.inra.urgi.datadiscovery.domain.rare.RareIndexedDocument;
import org.springframework.data.elasticsearch.core.ElasticsearchRestTemplate;
import org.springframework.data.elasticsearch.core.EntityMapper;

/**
 * Implementation of {@link RareDocumentDaoCustom}
 * @author JB Nizet
 */
public class RareDocumentDaoImpl
    extends AbstractDocumentDaoImpl<RareDocument, RareIndexedDocument>
    implements RareDocumentDaoCustom {

    /**
     * Contains the fields searchable on a {@link RareDocument}.
     * This is basically all fields at the exception of a few ones like `identifier`,
     * and the ones containing a URL or a numeric value.
     */
    private static final Set<String> SEARCHABLE_FIELDS = Collections.unmodifiableSet(Stream.of(
        "name",
        "description",
        "description.synonyms",
        "pillarName",
        "databaseSource",
        "domain",
        "taxon",
        "family",
        "genus",
        "species",
        "materialType",
        "biotopeType",
        "countryOfOrigin",
        "countryOfCollect"
    ).collect(Collectors.toSet()));

    private static final PillarAggregationDescriptor PILLAR_AGGREGATION_DESCRIPTOR =
        new PillarAggregationDescriptor("pillarName.keyword",
                                        "databaseSource.keyword",
                                        "portalURL.keyword");

    public RareDocumentDaoImpl(ElasticsearchRestTemplate elasticsearchTemplate,
                               EntityMapper entityMapper) {
        super(elasticsearchTemplate, new RareDocumentHighlightMapper(entityMapper));
    }

    @Override
    protected Class<RareDocument> getDocumentClass() {
        return RareDocument.class;
    }

    @Override
    protected Class<RareIndexedDocument> getIndexedDocumentClass() {
        return RareIndexedDocument.class;
    }

    @Override
    protected Set<String> getSearchableFields() {
        return SEARCHABLE_FIELDS;
    }

    @Override
    protected List<AppAggregation> getAppAggregations() {
        return Arrays.asList(RareAggregation.values());
    }

    @Override
    protected PillarAggregationDescriptor getPillarAggregationDescriptor() {
        return PILLAR_AGGREGATION_DESCRIPTOR;
    }
}
