package fr.inra.urgi.rare.dao.rare;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import fr.inra.urgi.rare.dao.AbstractGeneticResourceDaoImpl;
import fr.inra.urgi.rare.dao.AppAggregation;
import fr.inra.urgi.rare.dao.PillarAggregationDescriptor;
import fr.inra.urgi.rare.domain.rare.RareGeneticResource;
import fr.inra.urgi.rare.domain.rare.RareIndexedGeneticResource;
import org.springframework.data.elasticsearch.core.ElasticsearchTemplate;
import org.springframework.data.elasticsearch.core.EntityMapper;

/**
 * Implementation of {@link RareGeneticResourceDaoCustom}
 * @author JB Nizet
 */
public class RareGeneticResourceDaoImpl
    extends AbstractGeneticResourceDaoImpl<RareGeneticResource, RareIndexedGeneticResource>
    implements RareGeneticResourceDaoCustom {

    /**
     * Contains the fields searchable on a {@link RareGeneticResource}.
     * This is basically all fields at the exception of a few ones like `identifier`,
     * and the ones containing a URL or a numeric value.
     */
    private static final Set<String> SEARCHABLE_FIELDS = Collections.unmodifiableSet(Stream.of(
        "name",
        "description",
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

    public RareGeneticResourceDaoImpl(ElasticsearchTemplate elasticsearchTemplate,
                                      EntityMapper entityMapper) {
        super(elasticsearchTemplate, new RareGeneticResourceHighlightMapper(entityMapper));
    }

    @Override
    protected Class<RareGeneticResource> getGeneticResourceClass() {
        return RareGeneticResource.class;
    }

    @Override
    protected Class<RareIndexedGeneticResource> getIndexedGeneticResourceClass() {
        return RareIndexedGeneticResource.class;
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
