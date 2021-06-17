package fr.inra.urgi.datadiscovery.dao.rare;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import fr.inra.urgi.datadiscovery.config.RareImplicitRefinementsProperties;
import fr.inra.urgi.datadiscovery.dao.AbstractDocumentDaoImpl;
import fr.inra.urgi.datadiscovery.dao.AppAggregation;
import fr.inra.urgi.datadiscovery.dao.PillarAggregationDescriptor;
import fr.inra.urgi.datadiscovery.dao.SearchRefinements;
import fr.inra.urgi.datadiscovery.domain.rare.RareDocument;
import org.springframework.data.elasticsearch.core.ElasticsearchRestTemplate;

/**
 * Implementation of {@link RareDocumentDaoCustom}
 * @author JB Nizet
 */
public class RareDocumentDaoImpl extends AbstractDocumentDaoImpl<RareDocument> implements RareDocumentDaoCustom {

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
    private final SearchRefinements implicitSearchRefinements;

    public RareDocumentDaoImpl(ElasticsearchRestTemplate elasticsearchTemplate,
                               RareImplicitRefinementsProperties refinementsProperties) {
        super(elasticsearchTemplate, new RareDocumentHighlighter());
        SearchRefinements.Builder builder = SearchRefinements.builder();
        refinementsProperties.getImplicitTerms().forEach(builder::withTerm);
        this.implicitSearchRefinements = builder.build();
    }

    @Override
    protected Class<RareDocument> getDocumentClass() {
        return RareDocument.class;
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

    @Override
    protected SearchRefinements getImplicitSearchRefinements() {
        return implicitSearchRefinements;
    }
}
